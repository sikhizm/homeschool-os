import assert from 'node:assert/strict';
import test from 'node:test';
import { chapterPdfSources, prefersOfficialNcert } from '../src/lib/ncert/pdf-source';
import { ncertChapterSlots, textbookById } from '../src/lib/ncert/textbooks';

test('phones and tablets prefer NCERT while desktop uses the reader', () => {
  for (const userAgent of [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36',
  ]) {
    assert.equal(prefersOfficialNcert(new Headers({ 'user-agent': userAgent })), true);
  }
  assert.equal(prefersOfficialNcert(new Headers({ 'sec-ch-ua-mobile': '?1' })), true);
  assert.equal(prefersOfficialNcert(new Headers({
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
    'sec-ch-ua-mobile': '?0',
  })), false);
});

test('mapped chapters use GitHub release PDFs on both mobile and desktop', () => {
  const chapter = ncertChapterSlots.find(item => item.id === 'ncert-4-maths-mela-ch-01')!;
  const book = textbookById(chapter.bookId)!;
  const desktop = chapterPdfSources(book, chapter, false);
  const mobile = chapterPdfSources(book, chapter, true);

  assert.match(desktop.releaseUrl!, /homeschool-os-assets\/releases\/download\/class4\/demm101\.pdf$/);
  assert.equal(desktop.readerHref, '/ncert-books/read/ncert-4-maths-mela-ch-01');
  assert.equal(desktop.official.href, 'https://ncert.nic.in/textbook/pdf/demm101.pdf');
  assert.equal(mobile.readerHref, desktop.readerHref);
  assert.equal(mobile.official.href, desktop.official.href);
});

test('a chapter without a recorded official PDF uses the official book portal', () => {
  const chapter = ncertChapterSlots.find(item => item.id === 'ncert-4-maths-mela-ch-01')!;
  const book = textbookById(chapter.bookId)!;
  const sources = chapterPdfSources(
    { ...book, publisherPdfLinks: undefined },
    { ...chapter, officialPdf: undefined },
    true,
  );

  assert.equal(sources.hasOfficialPdf, false);
  assert.equal(sources.official.href, book.sourceUrl);
});

test('upper-class mirrors match the published PDF for the same titled chapter and grade', () => {
  for (const [grade, expected] of [[6, 82], [7, 83], [8, 71], [9, 74]]) {
    const urls = new Set<string>();
    for (const chapter of ncertChapterSlots) {
      const book = textbookById(chapter.bookId)!;
      if (book.grade !== grade) continue;
      const desktop = chapterPdfSources(book, chapter, false);
      if (!desktop.releaseUrl) continue;
      assert.ok(chapter.verifiedTitle);
      const filename = new URL(desktop.official.href).pathname.split('/').pop();
      assert.equal(desktop.releaseUrl, `https://github.com/sikhizm/homeschool-os-assets/releases/download/class${grade}/${filename}`);
      assert.equal(desktop.readerHref, '/ncert-books/read/' + chapter.id);
      assert.equal(chapterPdfSources(book, chapter, true).readerHref, desktop.readerHref);
      assert.ok(!urls.has(desktop.releaseUrl));
      urls.add(desktop.releaseUrl);
    }
    assert.equal(urls.size, expected);
  }
});
