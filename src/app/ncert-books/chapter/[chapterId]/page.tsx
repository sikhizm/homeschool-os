import ResourcePlanActions from '@/components/resource-plan-actions';
import Link from 'next/link';
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
      <ResourcePlanActions resourceKey={'ncert:'+chapter.id}/>
      <section id="chapter-reading" className="workspace-panel family-hero" style={{ alignItems: 'flex-start' }}>
        <div className="family-hero-copy" style={{ maxWidth: '100%' }}>
          <span className="eyebrow">
            CLASS {book.grade} · {book.subject} · {chapter.label.toUpperCase()} OF {siblings.length}
          </span>
          <h1 style={{ margin: '8px 0 6px' }}>{title}</h1>
          <p className="muted" style={{ margin: '0 0 12px', fontWeight: 700 }}>
            {book.title} · {book.publisher} · {book.language}
          </p>
          <p style={{ margin: 0 }}>
            {chapter.verifiedTitle
              ? `${contentLabel} title checked against the publisher table of contents.`
              : `${contentLabel} title has not been verified yet.`}{' '}
            {chapter.selection === 'choose-one'
              ? `Official selection note: ${selectionNote} This option remains browseable, but is intentionally excluded from the default auto-learning path. HomeSchool OS does not yet persist a parent or school selection of an alternative, so it will not claim that one has been chosen.`
              : ''}{' '}
            {mappingLabels[mappingStatus]}. {pdfLabels[pdf.status]}.
          </p>
          <div className="hero-actions">
            {readerHref && releaseUrl ? (
              <>
                <Link className="hero-action-primary" href={learnerId ? readerHref + '?learner=' + encodeURIComponent(learnerId) : readerHref}>Read in Homeschool OS</Link>
                <a className="hero-action-secondary" href={pdf.href} target="_blank" rel="noopener noreferrer">{hasOfficialPdf ? 'Official NCERT PDF ↗' : 'Official textbook portal ↗'}</a>
                <a className="hero-action-secondary" href={releaseUrl} target="_blank" rel="noopener noreferrer">Open / download release PDF ↗</a>
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
            <Link className="hero-action-secondary" href={bookHref}>
              ← All {contentLabel.toLowerCase()}s
            </Link>
          </div>
          <p className="muted" style={{ margin: '14px 0 0', fontSize: 12.5 }}>
            {readerHref ? 'This chapter opens in the Homeschool OS PDF reader using its matching class release asset; the official NCERT source remains available as a separate fallback.' : 'Official publisher material opens in a new tab. HomeSchool OS does not copy or host the textbook.'}
          </p>
        </div>
      </section>

      {sessionEligible && chapter.verifiedTitle ? (
        <div id="study-material-studio">
          <StudyMaterialStudio chapter={chapter} book={book} grade={book.grade} resourceUrl={officialPdf ?? book.sourceUrl} initialLearnerId={learnerId} revisionPreset={query.revision === '1'} />
        </div>
      ) : null}

      <div id="chapter-tests"><ChapterTests key={chapter.id} chapterId={chapter.id} initialLearnerId={learnerId} /></div>

      </ChapterProgress>

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
