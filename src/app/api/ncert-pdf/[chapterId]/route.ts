import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {releasePdfForChapter} from '@/lib/ncert/release-pilot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, {params}: {params: Promise<{chapterId: string}>}) {
  const {data: session} = await auth.getSession();
  if (!session?.user) return NextResponse.json({error:'Sign in required.'},{status:401});
  const {chapterId} = await params;
  const source = releasePdfForChapter(chapterId);
  if (!source) return NextResponse.json({error:'No release PDF is mapped for this chapter.'},{status:404});

  const headers = new Headers({Accept:'application/pdf','User-Agent':'HomeschoolOS-PDF-Reader'});
  const range = request.headers.get('range');
  if (range && /^bytes=\d*-\d*(,\d*-\d*)*$/.test(range)) headers.set('Range',range);

  let upstream: Response;
  try {
    upstream = await fetch(source,{headers,redirect:'follow',cache:'no-store',signal:request.signal});
  } catch {
    return NextResponse.json({error:'The textbook file host could not be reached. Please retry.'},{status:502});
  }
  if (upstream.status!==200 && upstream.status!==206) {
    await upstream.body?.cancel();
    return NextResponse.json({error:`The release asset returned HTTP ${upstream.status}.`},{status:upstream.status>=400&&upstream.status<600?upstream.status:502});
  }
  const type=upstream.headers.get('content-type')??'';
  if (!type.toLowerCase().includes('pdf')&&!type.toLowerCase().includes('octet-stream')) {
    await upstream.body?.cancel();
    return NextResponse.json({error:'The release did not return a PDF file.'},{status:502});
  }
  const out=new Headers({
    'Content-Type':'application/pdf',
    'Content-Disposition':'inline',
    'Accept-Ranges':upstream.headers.get('accept-ranges')??'bytes',
    'Cache-Control':'private, max-age=300',
    'X-Content-Type-Options':'nosniff',
  });
  for(const key of ['content-length','content-range','last-modified','etag']) {
    const value=upstream.headers.get(key); if(value) out.set(key,value);
  }
  return new Response(upstream.body,{status:upstream.status,headers:out});
}
