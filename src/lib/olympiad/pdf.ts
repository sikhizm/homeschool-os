import type { OlympiadResource } from './catalogue';

/** Stream catalogue PDFs from official hosts for the app and native PDF viewers. */
export async function inlineOlympiadPdf(
  request: Request,
  resource: OlympiadResource,
  fetchPdf: typeof fetch = fetch,
): Promise<Response> {
  const fallback = () => new Response(null, {
    status: 307,
    headers: { Location: resource.sourceUrl, 'Cache-Control': 'no-store' },
  });
  const allowedSources: Record<string, RegExp> = {
    SOF: /^https:\/\/sofworld\.org\/download\/file\/fid\/\d+$/,
    CREST: /^https:\/\/www\.crestolympiads\.com\/assets\/samplepapers\/[A-Za-z0-9-]+\.pdf$/,
    SilverZone: /^https:\/\/www\.silverzone\.org\/assets\/File\/Syl_Sam_Papers\/iom\/\d+\.pdf$/,
  };
  if (!resource.pdfUrl || !allowedSources[resource.provider]?.test(resource.pdfUrl)) {
    return new Response('PDF unavailable.', { status: 404 });
  }
  const headers = new Headers({ Accept: 'application/pdf', 'User-Agent': 'HomeschoolOS-PDF-Reader' });
  const range = request.headers.get('range');
  if (range && /^bytes=(?:\d+-\d*|-\d+)$/.test(range)) headers.set('Range', range);

  let upstream: Response;
  try {
    upstream = await fetchPdf(resource.pdfUrl, {
      headers,
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(25000)]),
    });
  } catch { return fallback(); }
  if (upstream.status === 416) {
    await upstream.body?.cancel();
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': upstream.headers.get('content-range') ?? 'bytes */*', 'Cache-Control': 'no-store' },
    });
  }
  if (![200, 206].includes(upstream.status) ||
      !upstream.headers.get('content-type')?.toLowerCase().includes('application/pdf')) {
    await upstream.body?.cancel();
    return fallback();
  }
  const output = new Headers({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="' + resource.id + '.pdf"',
    'Cache-Control': 'private, max-age=300',
    'X-Content-Type-Options': 'nosniff',
  });
  for (const name of ['accept-ranges', 'content-range', 'etag', 'last-modified']) {
    const value = upstream.headers.get(name);
    if (value) output.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers: output });
}
