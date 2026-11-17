import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { olympiadPdfHref, olympiadResources } from '@/lib/olympiad/catalogue';
import { prefersOfficialNcert as prefersExternalPdf } from '@/lib/ncert/pdf-source';
import PdfJsReader from '@/app/ncert-books/read/[chapterId]/pdfjs-reader';

export const dynamic = 'force-dynamic';

export default async function OlympiadReaderPage({ params }: { params: Promise<{ resourceId: string }> }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const { resourceId } = await params;
  const resource = olympiadResources.find(item => item.id === resourceId);
  if (!resource?.pdfUrl) notFound();
  if (prefersExternalPdf(await headers())) redirect(olympiadPdfHref(resource));
  const title = resource.provider + ' · Class ' + resource.grades.join('–') + ' · ' + resource.title;
  const backHref = '/library/olympiad?grade=' + resource.grades[0];
  return <main className="family-dashboard studio-stack" style={{ maxWidth: 1440, margin: '0 auto' }}>
    <nav className="global-crumbs" aria-label="Breadcrumb">
      <Link href="/library">Curriculum Library</Link><span>/</span>
      <Link href={backHref}>Olympiad Resources</Link><span>/</span><strong>Reader</strong>
    </nav>
    <section className="workspace-panel" style={{ padding: 16 }}>
      <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(20px,3vw,28px)' }}>{title}</h1>
      <div className="hero-actions" style={{ margin: '0 0 16px' }}>
        <Link className="btn-secondary" href={backHref}>Back to resources</Link>
        <a className="btn-secondary" href={olympiadPdfHref(resource)} target="_blank" rel="noopener noreferrer">Open PDF externally ↗</a>
        <a className="btn-secondary" href={resource.sourceUrl} target="_blank" rel="noopener noreferrer">Official source ↗</a>
      </div>
      <PdfJsReader key={resource.id} src={'/api/olympiad-pdf/' + resource.id} title={title} />
    </section>
  </main>;
}
