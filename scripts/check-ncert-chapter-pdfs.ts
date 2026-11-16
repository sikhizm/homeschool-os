import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { ncertChapterSlots, ncertTextbooks } from '../src/lib/ncert/textbooks';

const { values } = parseArgs({
  options: { grade: { type: 'string' }, book: { type: 'string' } },
});
if (values.grade && !/^(?:[1-9]|1[0-2])$/.test(values.grade)) throw new Error('Invalid grade.');
execFileSync('pdftotext', ['-v'], { stdio: 'ignore' });

const books = new Map(ncertTextbooks
  .filter(book => (!values.grade || book.grade === Number(values.grade)) && (!values.book || book.id === values.book))
  .map(book => [book.id, book]));
if (books.size === 0) throw new Error('No catalogue books matched the filters.');
const candidates = ncertChapterSlots.flatMap(chapter => {
  const book = books.get(chapter.bookId);
  // Match ordinary chapter codes only. Existing explicit references, alternative
  // paths and unnumbered material are outside this filename probe.
  if (!book || chapter.officialPdf || !chapter.verifiedTitle ||
      !/^[a-z]{4}[1-9]$/.test(book.textbookCode) || !/^Chapter \d+$/.test(chapter.label)) return [];
  const number = String(chapter.chapterNumber).padStart(2, '0');
  return [{
    id: chapter.id, book: book.id, title: chapter.verifiedTitle, number: chapter.chapterNumber,
    url: `https://ncert.nic.in/textbook/pdf/${book.textbookCode}${number}.pdf`,
  }];
});

const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim();
const maxBytes = 12 * 1024 * 1024;

async function check(candidate: (typeof candidates)[number]) {
  try {
    const response = await fetch(candidate.url, { redirect: 'error', signal: AbortSignal.timeout(9000) });
    if (!response.ok || !response.body) {
      await response.body?.cancel();
      return { ...candidate, result: 'http-error', detail: String(response.status) };
    }
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > maxBytes) return { ...candidate, result: 'review', detail: 'File too large to check' };
        chunks.push(value);
      }
    } finally {
      await reader.cancel().catch(() => {});
    }
    const bytes = Buffer.concat(chunks);
    if (bytes.subarray(0, 5).toString() !== '%PDF-') return { ...candidate, result: 'not-pdf' };
    const page = execFileSync('pdftotext', ['-f', '1', '-l', '1', '-layout', '-enc', 'UTF-8', '-', '-'], {
      input: bytes, encoding: 'utf8', timeout: 3500, maxBuffer: 256 * 1024,
    });
    const lines = page.split(/\r?\n/).filter(line => line.trim());
    const title = normalize(candidate.title);
    const header = lines.slice(0, 12).map(normalize).filter(Boolean);
    const hasTitle = header.some((_, index) => [1, 2, 3].some(length =>
      header.slice(index, index + length).join(' ') === title));
    const hasNumber = lines.slice(0, 30).some(line =>
      new RegExp(`^\\s*(?:chapter\\s+)?${candidate.number}(?:\\s*$|\\.1(?:\\D|$))`, 'i').test(line));
    return { ...candidate, result: hasTitle && hasNumber ? 'matched' : 'review', detail: 'First PDF page checked for catalogue title and chapter number' };
  } catch (error) {
    const detail = error instanceof Error ? error.message.split('\n')[0] : 'Unknown error';
    return { ...candidate, result: 'inconclusive', detail };
  }
}

let next = 0;
const results: Awaited<ReturnType<typeof check>>[] = [];
async function worker() {
  while (next < candidates.length) {
    const index = next++;
    results[index] = await check(candidates[index]);
  }
}
async function run() {
  await Promise.all(Array.from({ length: 6 }, worker));
  console.log(JSON.stringify(results, null, 2));
  const matched = results.filter(row => row.result === 'matched');
  console.error(`NCERT direct PDF probe: ${matched.length}/${results.length} candidates matched. ${matched.map(row => row.id).join(', ')}`);
}
void run();
