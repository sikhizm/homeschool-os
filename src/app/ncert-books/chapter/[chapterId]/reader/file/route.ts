import { auth } from '@/lib/auth/server';
import { pilotChapterId, relayNcertPilotPdf } from '@/lib/ncert/reader-pilot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ chapterId: string }> }) {
  const headers = { 'Cache-Control': 'private, no-store' };
  const { data: session } = await auth.getSession();
  if (!session?.user) return new Response('Sign in required.', { status: 401, headers });
  const { chapterId } = await params;
  if (chapterId !== pilotChapterId) return new Response('Chapter not found.', { status: 404, headers });
  return relayNcertPilotPdf(request.signal);
}
