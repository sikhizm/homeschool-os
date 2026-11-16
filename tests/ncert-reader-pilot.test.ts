import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ncertReaderPilotHref, pilotChapterId, pilotPdfUrl, relayNcertPilotPdf } from '../src/lib/ncert/reader-pilot';

const signal = () => new AbortController().signal;

test('the NCERT reader is available only for the pilot chapter and its exact publisher URL', () => {
  assert.equal(ncertReaderPilotHref(pilotChapterId, pilotPdfUrl), `/ncert-books/chapter/${pilotChapterId}/reader`);
  assert.equal(ncertReaderPilotHref('ncert-10-mathematics-ch-02', pilotPdfUrl), null);
  assert.equal(ncertReaderPilotHref(pilotChapterId, 'https://ncert.nic.in/textbook/pdf/jemh102.pdf'), null);
});

test('the NCERT relay requests only the official pilot PDF and delivers it inline without caching', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async (...args: Parameters<typeof fetch>) => {
    assert.equal(args[0], pilotPdfUrl);
    assert.equal(args[1]?.redirect, 'error');
    return new Response('%PDF-1.4', { headers: { 'Content-Type': 'application/pdf' } });
  });
  const response = await relayNcertPilotPdf(signal());
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'application/pdf');
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.match(response.headers.get('Content-Disposition') ?? '', /^inline;/);
  assert.equal(await response.text(), '%PDF-1.4');
});

test('the NCERT relay rejects a portal page, failed request and oversized PDF', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response('<h1>Portal</h1>', {
    headers: { 'Content-Type': 'text/html' },
  }));
  assert.equal((await relayNcertPilotPdf(signal())).status, 502);

  fetchMock.mock.mockImplementation(async () => { throw new Error('Network unavailable'); });
  assert.equal((await relayNcertPilotPdf(signal())).status, 502);

  fetchMock.mock.mockImplementation(async () => new Response(new Uint8Array(3_000_001), {
    headers: { 'Content-Type': 'application/pdf' },
  }));
  await assert.rejects((await relayNcertPilotPdf(signal())).arrayBuffer(), /size limit/);
});
