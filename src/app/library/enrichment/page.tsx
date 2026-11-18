import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import EnrichmentView from './enrichment-view';

export const dynamic = 'force-dynamic';

export default async function EnrichmentPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  return <EnrichmentView />;
}
