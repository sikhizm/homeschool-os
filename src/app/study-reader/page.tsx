import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import StudyReaderClient from './study-reader-client';

export const dynamic = 'force-dynamic';

type SearchParams = {url?: string; title?: string; grade?: string};

function approvedNcertPdf(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'ncert.nic.in' ||
      !url.pathname.startsWith('/textbook/pdf/') ||
      !url.pathname.toLowerCase().endsWith('.pdf')
    ) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export default async function StudyReader({searchParams}: {searchParams: Promise<SearchParams>}) {
  const {data: session} = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  const params = await searchParams;
  const sourceUrl = approvedNcertPdf(params.url);
  const title = (params.title || 'Read textbook').slice(0, 140);
  const grade = (params.grade || '').replace(/[^0-9]/g, '').slice(0, 2);

  return (
    <StudyReaderClient sourceUrl={sourceUrl} title={title} grade={grade} />
  );
}
