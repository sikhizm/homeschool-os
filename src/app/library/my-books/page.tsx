import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import MyBooks from '@/components/my-books';

export const dynamic = 'force-dynamic';

/** Family-owned physical books, separate from publisher and curriculum catalogues. */
export default async function PersonalBooksPage() {
  const {data: session} = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  return <main className="family-dashboard studio-stack">
    <section className="workspace-panel">
      <Link href="/library">← Curriculum Library</Link>
      <span className="eyebrow" style={{display:'block',marginTop:14}}>PERSONAL LIBRARY</span>
      <h1>My Books</h1>
      <p>Add your family&apos;s physical books, assign them to learners, and track finished pages. These are your own books, separate from the NCERT and Global Curriculum catalogues.</p>
    </section>
    <MyBooks />
  </main>;
}
