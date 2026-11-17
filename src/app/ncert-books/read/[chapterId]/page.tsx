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

  // Let the browser's built-in PDF viewer render the public release asset directly.
  // This avoids the third-party Google Docs iframe that refused to connect.

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
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>Testing the browser’s built-in PDF viewer directly. No Google Docs iframe, PDF.js reader or PDF proxy is used.</p>
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
            src={releasePdfPilot.releasePdfUrl}
            style={{ display: 'block', width: '100%', height: '100%', border: 0, background: '#fff' }}
            allowFullScreen
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="muted" style={{ margin: '10px 2px 0', fontSize: 12 }}>
          The public GitHub Release PDF is embedded directly so the browser can use its built-in PDF viewer. If the browser downloads it instead of displaying it, or blocks embedding, use the direct release download or official NCERT fallback above.
        </p>
      </section>
    </main>
  );
}
