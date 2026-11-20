import ChapterPlanMenu from '@/components/chapter-plan-menu';
import Link from 'next/link';
import Image from 'next/image';
import ChapterProgress from './chapter-progress';
import ChapterTests from './chapter-tests';
import StudyMaterialStudio from './study-material-studio';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import {
  contentUnitLabelFor,
  isDefaultChapterSessionEligible,
  ncertChapterSlots,
  textbookById,
  chaptersFor,
} from '@/lib/ncert/textbooks';
import { mappingEvidence, mappingLabels, pdfLabels } from '@/lib/ncert/catalogue-evidence';
import { familyMappingEvidence } from '@/lib/ncert/family-catalogue-evidence';
import { class5ChapterAccountById } from '@/lib/curriculum/class5-mapping';
import { chapterPdfSources, prefersOfficialNcert } from '@/lib/ncert/pdf-source';

function ChapterLinkIcon({kind}:{kind:'read'|'official'|'release'|'all'}) {
 return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
  {kind==='read'?<><path d="M12 6c-3-2-6-2.5-10-2v15c4-.5 7 0 10 2M12 6c3-2 6-2.5 10-2v15c-4-.5-7 0-10 2M12 6v15"/></>:null}
  {kind==='official'?<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M8 13h8M8 17h8"/></>:null}
  {kind==='release'?<><path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/></>:null}
  {kind==='all'?<><path d="M4 6h3M4 12h3M4 18h3M11 6h9M11 12h9M11 18h9"/></>:null}
 </svg>;
}
export const dynamic = 'force-dynamic';

export default async function ChapterLearningPage({ params, searchParams }: { params: Promise<{ chapterId: string }>; searchParams: Promise<{ testLearner?: string; learner?: string; revision?: string }> }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const { chapterId } = await params;
  const query = await searchParams;
  const learnerId = query.learner ?? query.testLearner;
  const chapter = ncertChapterSlots.find((c) => c.id === chapterId);
  if (!chapter) notFound();
  const book = textbookById(chapter.bookId);
  if (!book) notFound();
  const { official: pdf, releaseUrl, readerHref, hasOfficialPdf } = chapterPdfSources(
    book, chapter, prefersOfficialNcert(await headers()),
  );
  const officialPdf = hasOfficialPdf ? pdf.href : null;
  const mappingReview = book.grade === 5 ? await familyMappingEvidence(session.user.id) : null;
  const mappingStatus = mappingEvidence(mappingReview?.revisions)(chapter);
  const siblings = chaptersFor(book.id);
  const index = siblings.findIndex((c) => c.id === chapter.id);
  const previous = siblings[index - 1];
  const next = siblings[index + 1];
  const bookHref = `/ncert-books?grade=${book.grade}&subject=${encodeURIComponent(book.subject)}&book=${encodeURIComponent(book.id)}`;
  const contentLabel = contentUnitLabelFor(book);
  const title = chapter.verifiedTitle ?? chapter.label;
  const selectionNote = chapter.selectionNote;
  const sessionEligible = isDefaultChapterSessionEligible(chapter) && book.grade >= 1 && book.grade <= 10;
  const mappingAccount = book.grade === 5 ? class5ChapterAccountById(chapter.id) : undefined;

  return (
    <main className="family-dashboard studio-stack">
      <nav className="global-crumbs" style={{ margin: 0 }}>
        {learnerId ? <Link href={`/learn/path?learner=${encodeURIComponent(learnerId)}`}>Learning Path</Link> : <Link href="/dashboard">Home</Link>}
        <span>/</span>
        <Link href="/ncert-books">NCERT books</Link>
        <span>/</span>
        <Link href={bookHref}>{book.title}</Link>
        <span>/</span>
        <strong>{chapter.label}</strong>
      </nav>

      <ChapterProgress key={chapter.id + (learnerId ?? '')} chapterId={chapter.id} initialLearnerId={learnerId}>
      <section id="chapter-reading" className="workspace-panel family-hero chapter-reading-card" style={{ alignItems: 'flex-start' }}>
        <div className="family-hero-copy chapter-reading-copy" style={{ maxWidth: '100%' }}>
          <div className="chapter-reading-overview">
            <div className="chapter-reading-titlegroup">
              <span className="eyebrow">
                CLASS {book.grade} · {book.subject} · {chapter.label.toUpperCase()} OF {siblings.length}
              </span>
              <h1 style={{ margin: '8px 0 6px' }}>{title}</h1>
              <p className="muted chapter-reading-bookline" style={{ margin: 0, fontWeight: 700 }}>
                {book.title} · {book.publisher} · {book.language}
              </p>
            </div>
            <Image className="chapter-reading-illustration" src="/illustrations/chapter-open-book.svg" width={190} height={157} alt="" aria-hidden="true"/>
          </div>
          <div className="chapter-reading-evidence" role="note">
            <span className="chapter-reading-evidence-icon" aria-hidden="true">ⓘ</span>
            <div>
              <strong>{chapter.verifiedTitle?'Chapter title checked against NCERT contents':'Chapter title awaiting verification'}</strong>
              <p>{mappingLabels[mappingStatus]}. {pdfLabels[pdf.status]}.</p>
              {chapter.selection==='choose-one'&&<details className="chapter-reading-evidence-details"><summary>Official selection notes</summary><p>{selectionNote} This alternative remains browseable but is excluded from the default learning path until a parent or school makes a selection.</p></details>}
            </div>
          </div>
          <div className="hero-actions chapter-reading-actions">
            {readerHref && releaseUrl ? (
              <>
                <Link className="hero-action-primary" href={learnerId ? readerHref + '?learner=' + encodeURIComponent(learnerId) : readerHref}><ChapterLinkIcon kind="read"/><span>Read in HomeSchool OS</span><span aria-hidden="true">→</span></Link>
                <a className="hero-action-secondary" href={pdf.href} target="_blank" rel="noopener noreferrer" aria-label={hasOfficialPdf?'Open official NCERT PDF':'Open official textbook portal'}><ChapterLinkIcon kind="official"/><span>{hasOfficialPdf?'NCERT PDF':'NCERT portal'}</span></a>
                <a className="hero-action-secondary" href={releaseUrl} target="_blank" rel="noopener noreferrer" aria-label="Open or download GitHub release PDF"><ChapterLinkIcon kind="release"/><span>Release PDF</span></a>
              </>
            ) : officialPdf ? (
              <a className="hero-action-primary" href={officialPdf} target="_blank" rel="noopener noreferrer">
                Open official NCERT {contentLabel.toLowerCase()} PDF ↗
              </a>
            ) : (
              <a className="hero-action-primary" href={book.sourceUrl} target="_blank" rel="noopener noreferrer">
                Open official textbook portal ↗
              </a>
            )}
            {officialPdf && !readerHref && <a className="hero-action-secondary" href={book.sourceUrl} target="_blank" rel="noopener noreferrer">Open textbook portal ↗</a>}
            {mappingAccount && mappingReview?.familyReviewsVisible ? (
              <Link className="hero-action-secondary" href={`/curriculum-mapping?chapter=${encodeURIComponent(chapter.id)}`}>
                Inspect mapping evidence
              </Link>
            ) : null}
            <Link className="hero-action-secondary" href={bookHref}><ChapterLinkIcon kind="all"/><span>All {contentLabel.toLowerCase()}s</span></Link>
          </div>
          <p className="muted chapter-reading-source-note" style={{ margin: '14px 0 0', fontSize: 12.5 }}>
            {readerHref ? 'The in-app reader uses the matching release PDF; NCERT remains the official source.' : 'Official publisher material opens in a new tab; no textbook PDF is stored in the app.'}
          </p>
        </div>
      </section>
      <div className="resource-plan-actions chapter-plan-secondary" aria-label="Plan this chapter">
        <ChapterPlanMenu chapterId={chapter.id} title={title} learnerId={learnerId} canRevise={sessionEligible && Boolean(chapter.verifiedTitle)} />
        <Link className="btn-secondary" href={'/planning?resource=' + encodeURIComponent('ncert:' + chapter.id) + '&intent=save#family-workflow'}>Save for later</Link>
      </div>

      {sessionEligible && chapter.verifiedTitle ? (
        <div id="study-material-studio">
          <StudyMaterialStudio chapter={chapter} book={book} grade={book.grade} resourceUrl={officialPdf ?? book.sourceUrl} initialLearnerId={learnerId} revisionPreset={query.revision === '1'} />
        </div>
      ) : null}

      </ChapterProgress>

      <div id="chapter-tests"><ChapterTests key={chapter.id} chapterId={chapter.id} initialLearnerId={learnerId} /></div>

      <nav className="workspace-panel chapter-pager" aria-label={`Adjacent ${contentLabel.toLowerCase()}s`}>
        {previous ? (
          <Link className="btn-secondary" href={`/ncert-books/chapter/${previous.id}`}>
            ← Previous: {previous.verifiedTitle ?? `${contentLabel} ${previous.chapterNumber}`}
          </Link>
        ) : (
          <span className="muted">First {contentLabel.toLowerCase()}</span>
        )}
        {next ? (
          <Link className="btn-secondary" href={`/ncert-books/chapter/${next.id}`}>
            Next: {next.verifiedTitle ?? `${contentLabel} ${next.chapterNumber}`} →
          </Link>
        ) : (
          <span className="muted">Last {contentLabel.toLowerCase()}</span>
        )}
      </nav>
    </main>
  );
}
