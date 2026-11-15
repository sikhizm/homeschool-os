import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import type { EnrichmentQuery } from '@/lib/curriculum/enrichment';
import EnrichmentView from './enrichment-view';

export const dynamic = 'force-dynamic';

export default async function EnrichmentPage({ searchParams }: { searchParams: Promise<EnrichmentQuery> }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  return <EnrichmentView query={await searchParams} />;
}
