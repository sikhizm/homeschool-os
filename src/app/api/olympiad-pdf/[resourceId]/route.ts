import { auth } from '@/lib/auth/server';
import { olympiadResources } from '@/lib/olympiad/catalogue';
import { inlineOlympiadPdf } from '@/lib/olympiad/pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ resourceId: string }> }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return Response.json({ error: 'Sign in required.' }, { status: 401 });
  const { resourceId } = await params;
  const resource = olympiadResources.find(item => item.id === resourceId);
  if (!resource) return Response.json({ error: 'PDF not found.' }, { status: 404 });
  return inlineOlympiadPdf(request, resource);
}
