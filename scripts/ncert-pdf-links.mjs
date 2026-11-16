import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const portal = 'https://ncert.nic.in/textbook.php';
const pause = () => new Promise(resolve => setTimeout(resolve, 300));
const classNames = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

export function classNumber(label) {
  const value = label.trim().replace(/^(?:class|grade)\s+/i, '').toUpperCase();
  if (/^(?:[1-9]|1[0-2])$/.test(value)) return Number(value);
  return classNames.indexOf(value) + 1;
}

function ncertUrl(value, base) {
  try {
    const url = new URL(value, base);
    if (url.protocol === 'https:' && /^(www\.)?ncert\.nic\.in$/i.test(url.hostname) &&
        !url.port && !url.username && !url.password) return url;
  } catch {
    // Ignore malformed and third-party references.
  }
  return null;
}

export function pdfTarget(value, base) {
  const cleaned = value.replace(/&amp;/gi, '&');
  const direct = ncertUrl(cleaned, base);
  if (direct && /^\/textbook\/pdf\/[a-z0-9_-]+\.pdf$/i.test(direct.pathname)) return direct.href;
  // The publisher sometimes places the literal PDF path inside an inline
  // click action. Extract the quoted URL without executing that action.
  for (const [, path] of cleaned.matchAll(/['"]([^'"]+\.pdf(?:\?[^'"]*)?)['"]/gi)) {
    const url = ncertUrl(path, base);
    if (url && /^\/textbook\/pdf\/[a-z0-9_-]+\.pdf$/i.test(url.pathname)) return url.href;
  }
  return null;
}

function bookPortal(value, base) {
  const url = ncertUrl(/^[a-z0-9]+=\d+-\d+$/i.test(value) ? '?' + value : value, base);
  return url?.pathname === '/textbook.php' && /^[a-z0-9]+=\d+-\d+$/i.test(url.search.slice(1)) ? url : null;
}

export function csvCell(value) {
  const raw = String(value ?? '');
  const text = /^[\s]*[=+\-@]/.test(raw) ? "'" + raw : raw;
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}

async function checkPdf(url, request) {
  try {
    const response = await request.get(url, {
      headers: { Range: 'bytes=0-7' }, maxRedirects: 0, timeout: 10000,
    });
    try {
      if (!response.ok()) return 'HTTP ' + response.status();
      const bytes = await response.body();
      return bytes.subarray(0, 5).toString() === '%PDF-' ? 'pdf_response' : 'not_pdf';
    } finally {
      await response.dispose();
    }
  } catch (error) {
    return 'check_error: ' + error.message.split('\n')[0];
  }
}

function controls(page) {
  const select = word => page.locator('select').filter({
    has: page.locator('option').filter({ hasText: new RegExp('select.*' + word, 'i') }),
  }).first();
  return { grade: select('class'), subject: select('subject'), title: select('book|title') };
}

async function choices(select) {
  return select.locator('option').evaluateAll(options => options
    .filter(option => !option.disabled && option.value && !/^(?:select|choose|--)/i.test(option.textContent.trim().replace(/^\W+/, '')))
    .map(option => ({ value: option.value, label: option.textContent.trim().replace(/\s+/g, ' ') })));
}

async function waitForOptions(select, previous = []) {
  const before = JSON.stringify(previous);
  const expires = Date.now() + 12000;
  do {
    const list = await choices(select);
    if (list.length && JSON.stringify(list) !== before) return list;
    await pause();
  } while (Date.now() < expires);
  throw new Error('The publisher dropdown did not load a fresh list of options.');
}

async function loadCatalogue(page) {
  const response = await page.goto(portal, { waitUntil: 'domcontentloaded' });
  if (!response?.ok()) throw new Error('NCERT catalogue did not load (HTTP ' + (response?.status() ?? 'unknown') + ').');
  const fields = controls(page);
  await fields.grade.waitFor();
  return fields;
}

async function linksOnPage(page) {
  return page.locator('a, iframe, embed, object, [onclick]').evaluateAll(elements =>
    elements.map(element => ({
      tag: element.tagName.toLowerCase(),
      attributes: ['href', 'src', 'data', 'onclick'].map(name => element.getAttribute(name)).filter(Boolean),
      label: (element.textContent ?? '').trim(),
      context: (element.closest('tr,li')?.textContent ?? element.parentElement?.textContent ?? '').trim().slice(0, 250),
    })));
}

async function collectBook(page, bookUrl, includeSupplements) {
  const result = new Map();
  const chapterPages = new Map();
  const add = (links, base, forcedChapter) => {
    for (const item of links) {
      const match = /\b(chapter|unit|project|lesson)\s*(?:no\.?\s*)?[-–]?\s*(\d+)\b/i.exec(item.label) ??
        /\b(chapter|unit|project|lesson)\s*(?:no\.?\s*)?[-–]?\s*(\d+)\b/i.exec(item.context);
      const chapter = forcedChapter ?? (match ? match[1].toLowerCase() + ' ' + Number(match[2]) : '');
      for (const attribute of item.attributes) {
        const pdf = pdfTarget(attribute, base);
        if (pdf && (chapter || includeSupplements)) {
          if (!result.has(pdf) || chapter) result.set(pdf, {
            chapter, url: pdf, label: item.label, source: base,
          });
        }
        const itemUrl = bookPortal(attribute, base);
        const code = bookUrl.search.split('=')[0];
        if (!forcedChapter && match && itemUrl && itemUrl.search.split('=')[0] === code &&
            itemUrl.href !== bookUrl.href && Number(itemUrl.search.split('=')[1].split('-')[0]) === Number(match[2])) {
          chapterPages.set(itemUrl.href, chapter);
        }
      }
    }
  };
  add(await linksOnPage(page), page.url());
  for (const [url, chapter] of chapterPages) {
    if ([...result.values()].some(row => row.chapter === chapter)) continue;
    await pause();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    if (response?.ok()) {
      // On a chapter-specific view, only a direct viewer target or the PDF
      // link next to the same chapter may be attributed to that chapter.
      const links = await linksOnPage(page);
      add(links.filter(item => ['iframe', 'embed', 'object'].includes(item.tag) ||
        new RegExp('\\b' + chapter.replace(' ', '\\s*') + '\\b', 'i').test(item.label || item.context)), page.url(), chapter);
    }
  }
  return {
    links: [...result.values()],
    missing: [...new Set(chapterPages.values())].filter(chapter =>
      ![...result.values()].some(row => row.chapter === chapter)),
  };
}

async function main() {
  const { values } = parseArgs({ options: {
    grade: { type: 'string' }, out: { type: 'string', default: 'ncert_pdf_links.csv' },
    check: { type: 'boolean' }, 'include-supplements': { type: 'boolean' },
  } });
  if (values.grade && (!classNumber(values.grade) || !/^\d+$/.test(values.grade))) {
    throw new Error('--grade must be a number from 1 to 12.');
  }
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const rows = [];
  const issues = [];
  const covered = new Set();
  try {
    const index = await browser.newPage();
    const bookPage = await browser.newPage();
    index.setDefaultTimeout(12000);
    bookPage.setDefaultTimeout(12000);
    const fields = await loadCatalogue(index);
    const grades = (await choices(fields.grade)).map(option => ({ ...option, grade: classNumber(option.label) }));
    const wanted = values.grade ? [Number(values.grade)] : Array.from({ length: 12 }, (_, i) => i + 1);
    for (const grade of wanted) {
      const gradeOption = grades.find(item => item.grade === grade);
      if (!gradeOption) { issues.push({ grade, detail: 'Class option unavailable' }); continue; }
      try {
        await loadCatalogue(index);
        await fields.grade.selectOption(gradeOption.value);
        const subjects = await waitForOptions(fields.subject);
        for (const subject of subjects) {
          try {
            const previous = await choices(fields.title);
            await fields.subject.selectOption(subject.value);
            const books = await waitForOptions(fields.title, previous);
            for (const book of books) {
              try {
                await pause();
                let url = bookPortal(book.value, portal);
                let page = bookPage;
                if (url) {
                  const response = await page.goto(url.href, { waitUntil: 'domcontentloaded' });
                  if (!response?.ok()) throw new Error('Book page returned HTTP ' + (response?.status() ?? 'unknown'));
                } else {
                  page = index;
                  await fields.title.selectOption(book.value);
                  const go = index.getByRole('button', { name: 'Go', exact: true });
                  await Promise.all([index.waitForURL(value => bookPortal(value.href, portal) !== null), go.click()]);
                  url = bookPortal(index.url(), portal);
                }
                if (!url) throw new Error('Book selection did not expose an official book URL.');
                const { links, missing } = await collectBook(page, url, values['include-supplements']);
                if (missing.length) issues.push({ grade, subject: subject.label, book: book.label, detail: 'Missing PDF targets: ' + missing.join(', ') });
                if (!links.length) issues.push({ grade, subject: subject.label, book: book.label, detail: 'No publisher PDF targets extracted' });
                for (const row of links) {
                  const status = values.check ? await checkPdf(row.url, page.request) : 'publisher_link';
                  if (values.check) await pause();
                  rows.push([grade, subject.label, book.label, url.search.slice(1).split('=')[0], row.chapter, row.label, row.url, row.source, status]);
                  covered.add(grade);
                }
              } catch (error) {
                issues.push({ grade, subject: subject.label, book: book.label, detail: error.message.split('\n')[0] });
              } finally {
                if (index.url() !== portal) {
                  await loadCatalogue(index);
                  await fields.grade.selectOption(gradeOption.value);
                  await waitForOptions(fields.subject);
                  await fields.subject.selectOption(subject.value);
                  await waitForOptions(fields.title);
                }
              }
            }
          } catch (error) {
            issues.push({ grade, subject: subject.label, detail: error.message.split('\n')[0] });
          }
        }
      } catch (error) {
        issues.push({ grade, detail: error.message.split('\n')[0] });
      }
    }
    for (const grade of wanted) if (!covered.has(grade)) issues.push({ grade, detail: 'No PDF links exported for this class' });
  } catch (error) {
    issues.push({ detail: error.message.split('\n')[0] });
  } finally {
    await browser.close();
  }
  const columns = ['class', 'subject', 'book_title', 'book_code', 'chapter', 'publisher_label', 'pdf_url', 'source_page', 'status'];
  await writeFile(values.out, '\uFEFF' + [columns, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n', 'utf8');
  await writeFile(values.out + '.issues.json', JSON.stringify({ exported: rows.length, classesWithLinks: [...covered], issues }, null, 2) + '\n');
  console.log('Exported ' + rows.length + ' links from ' + covered.size + ' classes to ' + values.out);
  if (issues.length || !rows.length) {
    console.error('Coverage incomplete. See ' + values.out + '.issues.json');
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
