import assert from 'node:assert/strict';
import test from 'node:test';
import { olympiadPdfHref, olympiadResources } from '../src/lib/olympiad/catalogue';
import { inlineOlympiadPdf } from '../src/lib/olympiad/pdf';

const resource = olympiadResources.find(item => item.id === 'sof-maths-4')!;
test('SOF opens through inline endpoint and Kangaroo is removed from the catalogue', () => {
  assert.equal(olympiadPdfHref(resource), '/api/olympiad-pdf/sof-maths-4');
  assert.equal(olympiadResources.length, 80);
  assert.ok(olympiadResources.every(item => item.provider !== 'Math Kangaroo'));
  const crest = olympiadResources.find(item => item.id === 'crest-maths-4')!;
  assert.equal(olympiadPdfHref(crest), crest.pdfUrl);
});
test('inline delivery replaces attachment headers and streams PDF bytes', async () => {
  const response = await inlineOlympiadPdf(new Request('https://app.test/pdf'), resource, async () =>
    new Response('%PDF-1.6 test', { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="paper.pdf"' } }));
  assert.equal(response.headers.get('content-type'), 'application/pdf');
  assert.equal(response.headers.get('content-disposition'), 'inline; filename="sof-maths-4.pdf"');
  assert.equal(await response.text(), '%PDF-1.6 test');
});
test('native viewer range requests retain partial response metadata', async () => {
  const response = await inlineOlympiadPdf(new Request('https://app.test/pdf', { headers: { Range: 'bytes=0-4' } }), resource, async (url, options) => {
    assert.equal(url, resource.pdfUrl);
    assert.equal(new Headers(options?.headers).get('range'), 'bytes=0-4');
    assert.equal(options?.redirect, 'error');
    return new Response('%PDF-', { status: 206, headers: { 'Content-Type': 'application/pdf', 'Content-Range': 'bytes 0-4/100', 'Accept-Ranges': 'bytes' } });
  });
  assert.equal(response.status, 206);
  assert.equal(response.headers.get('content-range'), 'bytes 0-4/100');
});
test('unreachable or invalid PDF responses fall back to the official source page', async () => {
  for (const fetchPdf of [
    async () => { throw new Error('Network failure'); },
    async () => new Response('<html>error</html>', { headers: { 'Content-Type': 'text/html' } }),
    async () => new Response('Not found', { status: 404 }),
  ]) {
    const response = await inlineOlympiadPdf(new Request('https://app.test/pdf'), resource, fetchPdf);
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('location'), resource.sourceUrl);
  }
});
test('unsupported hosts and mismatched providers never cause upstream requests', async () => {
  for (const invalid of [{ ...resource, pdfUrl: 'https://example.org/test.pdf' }, { ...resource, provider: 'CREST' }]) {
    const response = await inlineOlympiadPdf(new Request('https://app.test/pdf'), invalid, async () => { assert.fail('Unexpected request'); });
    assert.equal(response.status, 404);
  }
});

test('every desktop PDF uses the in-app reader while mobile keeps its direct action', () => {
  for (const item of olympiadResources) {
    assert.equal(olympiadPdfHref(item, false), '/library/olympiad/read/' + item.id);
    assert.equal(olympiadPdfHref(item, true), item.provider === 'SOF' ? '/api/olympiad-pdf/' + item.id : item.pdfUrl);
  }
});
test('all catalogue PDFs are supported by the streaming endpoint', async () => {
  for (const item of olympiadResources) {
    const response = await inlineOlympiadPdf(new Request('https://app.test/pdf'), item, async url => {
      assert.equal(url, item.pdfUrl);
      return new Response('%PDF-1.6', { headers: { 'Content-Type': 'application/pdf' } });
    });
    assert.equal(response.status, 200, item.id);
    assert.equal(await response.text(), '%PDF-1.6');
  }
});
