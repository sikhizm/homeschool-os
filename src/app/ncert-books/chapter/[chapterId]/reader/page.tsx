import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { ncertChapterSlots } from '@/lib/ncert/textbooks';
import { pilotChapterId, pilotPdfUrl } from '@/lib/ncert/reader-pilot';

export const dynamic = 'force-dynamic';

export default async function NcertReaderPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  const { chapterId } = await params;
  if (chapterId !== pilotChapterId) notFound();
  const chapter = ncertChapterSlots.find(item => item.id === pilotChapterId);
  if (!chapter) notFound();
  const chapterHref = `/ncert-books/chapter/${chapter.id}`;
  const title = chapter.verifiedTitle ?? chapter.label;

  return (
    <main className="family-dashboard studio-stack">
      <section className="workspace-panel">
        <span className="eyebrow">Class 10 · Mathematics · Chapter 1</span>
        <h1>{title}</h1>
        <div className="hero-actions">
          <Link className="hero-action-secondary" href={chapterHref}>← Back to chapter</Link>
          <a className="hero-action-secondary" href={pilotPdfUrl} target="_blank" rel="noopener noreferrer">
            Open on NCERT ↗
          </a>
        </div>
        <p className="muted">If the PDF does not load in your browser, choose Open on NCERT.</p>
        <iframe
          src={`${chapterHref}/reader/file`}
          title={`NCERT PDF: ${title}`}
          style={{ display: 'block', width: '100%', height: '75vh', border: 0 }}
        />
      </section>
    </main>
  );
}
