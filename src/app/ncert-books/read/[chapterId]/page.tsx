import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { releasePdfPilot } from '@/lib/ncert/release-pilot';

export const dynamic = 'force-dynamic';

export default async function NcertPilotReaderPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  const { chapterId } = await params;
  if (chapterId !== releasePdfPilot.chapterId) notFound();

  const viewerUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(releasePdfPilot.releasePdfUrl)}`;

  return (
    <main className="family-dashboard" style={{ maxWidth: 1440, margin: '0 auto' }}>
      <nav className="global-crumbs" style={{ marginBottom: 16 }}>
        <Link href="/ncert-books">NCERT books</Link>
        <span>/</span>
        <Link href={`/ncert-books/chapter/${chapterId}`}>Class 4 · Maths Mela</Link>
        <span>/</span>
        <strong>Reader</strong>
      </nav>

      <section className="workspace-panel" style={{ padding: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div>
            <span className="eyebrow">GITHUB RELEASE PDF PILOT · CLASS 4 MATHEMATICS</span>
            <h1 style={{ margin: '5px 0 0', fontSize: 'clamp(20px, 3vw, 28px)' }}>{releasePdfPilot.title}</h1>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>Testing the existing browser PDF rendering path. No PDF.js reader or PDF proxy is used.</p>
          </div>
          <div className="hero-actions" style={{ margin: 0 }}>
            <a className="hero-action-secondary" href={releasePdfPilot.officialNcertUrl} target="_blank" rel="noopener noreferrer">Official NCERT fallback ↗</a>
            <a className="hero-action-secondary" href={releasePdfPilot.releasePdfUrl} target="_blank" rel="noopener noreferrer">Open / download release PDF ↗</a>
            <Link className="hero-action-secondary" href={`/ncert-books/chapter/${chapterId}`}>← Chapter details</Link>
          </div>
        </div>
        <div style={{ width: '100%', height: 'min(78dvh, 980px)', minHeight: 560, overflow: 'hidden', border: '1px solid #d8e2dc', borderRadius: 12, background: '#eef2ef' }}>
          <iframe
            title="Shapes Around Us — PDF reader"
            src={viewerUrl}
            style={{ display: 'block', width: '100%', height: '100%', border: 0, background: '#fff' }}
            allowFullScreen
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="muted" style={{ margin: '10px 2px 0', fontSize: 12 }}>
          The document is served from the public GitHub Release and rendered by Google’s document viewer inside this Homeschool OS page. If the viewer cannot fetch or display it, use the direct release download or the official NCERT fallback above.
        </p>
      </section>
    </main>
  );
}
