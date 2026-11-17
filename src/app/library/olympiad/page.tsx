import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import type { OlympiadQuery } from '@/lib/olympiad/catalogue';
import OlympiadView from './olympiad-view';
import './olympiad.css';

export const dynamic = 'force-dynamic';

export default async function OlympiadPage({ searchParams }: { searchParams: Promise<OlympiadQuery> }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  return <OlympiadView query={await searchParams} />;
}
