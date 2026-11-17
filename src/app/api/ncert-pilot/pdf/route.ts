import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {releasePdfPilot} from '@/lib/ncert/release-pilot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Same-origin, allow-listed streaming bridge for the single NCERT PDF pilot.
 * It never buffers or stores the PDF; Range requests pass through to GitHub.
 */
export async function GET(request: Request) {
  const {data: session} = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({error: 'Sign in required.'}, {status: 401});
  }

  const headers = new Headers({
    Accept: 'application/pdf',
    'User-Agent': 'HomeschoolOS-PDF-Reader',
  });
  const range = request.headers.get('range');
  if (range && /^bytes=\d*-\d*(,\d*-\d*)*$/.test(range)) {
    headers.set('Range', range);
  }

  let upstream: Response;
  try {
    upstream = await fetch(releasePdfPilot.releasePdfUrl, {
      method: 'GET',
      headers,
      redirect: 'follow',
      cache: 'no-store',
      signal: request.signal,
    });
  } catch {
    return NextResponse.json({error: 'The textbook file host could not be reached. Please retry.'}, {status: 502});
  }

  if (upstream.status !== 200 && upstream.status !== 206) {
    await upstream.body?.cancel();
    return NextResponse.json(
      {error: `The textbook host returned HTTP ${upstream.status}.`},
      {status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502},
    );
  }

  const contentType = upstream.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('pdf') && !contentType.toLowerCase().includes('octet-stream')) {
    await upstream.body?.cancel();
    return NextResponse.json({error: 'The release did not return a PDF file.'}, {status: 502});
  }

  const responseHeaders = new Headers({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="demm101.pdf"',
    'Accept-Ranges': upstream.headers.get('accept-ranges') ?? 'bytes',
    'Cache-Control': 'private, max-age=300',
    'X-Content-Type-Options': 'nosniff',
  });
  for (const name of ['content-length', 'content-range', 'last-modified', 'etag']) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
