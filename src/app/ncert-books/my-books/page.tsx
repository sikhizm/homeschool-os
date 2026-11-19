import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import MyBooks from '@/components/my-books';

export const dynamic = 'force-dynamic';

export default async function MyBooksPage() {
  const {data: session} = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  return <main className="family-dashboard studio-stack">
    <section className="workspace-panel">
      <Link href="/ncert-books">← Curriculum Library</Link>
      <h1>My Books</h1>
      <p>Add your physical books, assign them to learners, and track finished pages.</p>
    </section>
    <MyBooks />
  </main>;
}
