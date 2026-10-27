import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

/**
 * Homeschool OS is a private, parent-led workspace.
 * Keep the public entry point free of family and learner records.
 */
export default async function Home() {
  const { data: session } = await auth.getSession();

  if (session?.user) {
    redirect('/dashboard');
  }

  redirect('/auth/sign-in');
}
