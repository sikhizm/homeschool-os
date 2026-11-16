export const pilotChapterId = 'ncert-10-mathematics-ch-01';
export const pilotPdfUrl = 'https://ncert.nic.in/textbook/pdf/jemh101.pdf';
const maxPdfBytes = 3_000_000;

export function ncertReaderPilotHref(chapterId: string, pdfUrl: string): string | null {
  return chapterId === pilotChapterId && pdfUrl === pilotPdfUrl
    ? `/ncert-books/chapter/${pilotChapterId}/reader`
    : null;
}

export async function relayNcertPilotPdf(requestSignal: AbortSignal): Promise<Response> {
  const headers = { 'Cache-Control': 'private, no-store' };
  const unavailable = () => new Response('The NCERT PDF is unavailable. Use Open on NCERT in the reader.', {
    status: 502,
    headers,
  });

  try {
    const upstream = await fetch(pilotPdfUrl, {
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.any([requestSignal, AbortSignal.timeout(15_000)]),
    });
    const mime = upstream.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase();
    const declaredSize = upstream.headers.get('Content-Length');
    if (upstream.status !== 200 || mime !== 'application/pdf' || !upstream.body ||
        (declaredSize !== null && (!/^\d+$/.test(declaredSize) || Number(declaredSize) > maxPdfBytes))) {
      await upstream.body?.cancel();
      return unavailable();
    }

    let received = 0;
    const body = upstream.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        received += chunk.byteLength;
        if (received > maxPdfBytes) throw new Error('NCERT PDF exceeded the reader size limit.');
        controller.enqueue(chunk);
      },
    }));
    return new Response(body, {
      headers: {
        ...headers,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="ncert-class-10-mathematics-chapter-1.pdf"',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
  } catch {
    return unavailable();
  }
}
