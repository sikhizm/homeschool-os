import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import MyBooks from '@/components/my-books';
import './my-books.css';

export const dynamic = 'force-dynamic';

/** Family-owned physical books, separate from publisher and curriculum catalogues. */
export default async function PersonalBooksPage() {
  const {data: session} = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  return <main className="family-dashboard studio-stack my-books-page">
    <header className="my-books-hero">
      <Link className="my-books-back" href="/library">← Curriculum Library</Link>
      <div className="my-books-hero-content">
        <div>
          <span className="my-books-eyebrow">YOUR FAMILY LIBRARY</span>
          <h1>My Books</h1>
          <p>Keep your own books organised, assign them to learners and track pages read — all in one place.</p>
        </div>
        <span className="my-books-hero-tag">Personal collection</span>
      </div>
    </header>
    <MyBooks />
  </main>;
}
