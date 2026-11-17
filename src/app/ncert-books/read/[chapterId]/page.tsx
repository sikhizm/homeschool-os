import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { releasePdfPilot } from '@/lib/ncert/release-pilot';
import PdfJsReader from './pdfjs-reader';

export const dynamic = 'force-dynamic';

export default async function NcertPilotReaderPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const { chapterId } = await params;
  if (chapterId !== releasePdfPilot.chapterId) notFound();

  return (
    <main className="family-dashboard" style={{ maxWidth: 1440, margin: '0 auto' }}>
      <nav className="global-crumbs" style={{ marginBottom: 16 }}>
        <Link href="/ncert-books">NCERT books</Link><span>/</span>
        <Link href={`/ncert-books/chapter/${chapterId}`}>Class 4 · Maths Mela</Link><span>/</span><strong>Reader</strong>
      </nav>
      <section className="workspace-panel" style={{ padding: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div>
            <span className="eyebrow">NATIVE PDF READER · ONE-FILE PILOT</span>
            <h1 style={{ margin: '5px 0 0', fontSize: 'clamp(20px, 3vw, 28px)' }}>{releasePdfPilot.title}</h1>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>PDF.js renders this release PDF inside Homeschool OS through a same-origin streaming endpoint. The original file is not stored or copied.</p>
          </div>
          <div className="hero-actions" style={{ margin: 0 }}>
            <a className="hero-action-secondary" href={releasePdfPilot.officialNcertUrl} target="_blank" rel="noopener noreferrer">Official NCERT fallback ↗</a>
            <a className="hero-action-secondary" href={releasePdfPilot.releasePdfUrl} target="_blank" rel="noopener noreferrer">Download release PDF ↗</a>
            <Link className="hero-action-secondary" href={`/ncert-books/chapter/${chapterId}`}>← Chapter details</Link>
          </div>
        </div>
        <PdfJsReader src="/api/ncert-pilot/pdf" title={releasePdfPilot.title} />
      </section>
    </main>
  );
}
