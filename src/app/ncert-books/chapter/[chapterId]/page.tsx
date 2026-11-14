import Link from 'next/link';
import ChapterProgress from './chapter-progress';
import ChapterSessions from './chapter-sessions';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import {
  contentUnitLabelFor,
  isDefaultChapterSessionEligible,
  ncertChapterSlots,
  textbookById,
  chaptersFor,
  officialChapterPdf,
} from '@/lib/ncert/textbooks';
import { class5ChapterAccountById } from '@/lib/curriculum/class5-mapping';

export const dynamic = 'force-dynamic';

export default async function ChapterLearningPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const { chapterId } = await params;
  const chapter = ncertChapterSlots.find((c) => c.id === chapterId);
  if (!chapter) notFound();
  const book = textbookById(chapter.bookId);
  if (!book) notFound();
  const officialPdf = officialChapterPdf(chapter);
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
        <Link href="/dashboard">Home</Link>
        <span>/</span>
        <Link href="/ncert-books">NCERT books</Link>
        <span>/</span>
        <Link href={bookHref}>{book.title}</Link>
        <span>/</span>
        <strong>{chapter.label}</strong>
      </nav>

      <section className="workspace-panel family-hero" style={{ alignItems: 'flex-start' }}>
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
            {mappingAccount?.candidateMappingIds.length
              ? `This Class 5 chapter has ${mappingAccount.candidateMappingIds.length} original-outcome draft proposal${mappingAccount.candidateMappingIds.length === 1 ? '' : 's'} awaiting a family owner’s source review.`
              : mappingAccount?.unmappedReason
                ? 'This Class 5 chapter is deliberately unmapped until stronger specialist and source evidence is available.'
                : 'No chapter-to-skill alignment has been approved.'}
          </p>
          <div className="hero-actions">
            {officialPdf ? (
              <a className="hero-action-primary" href={officialPdf} target="_blank" rel="noopener noreferrer">
                Open official NCERT {contentLabel.toLowerCase()} PDF ↗
              </a>
            ) : (
              <a className="hero-action-primary" href={book.sourceUrl} target="_blank" rel="noopener noreferrer">
                Open official textbook portal ↗
              </a>
            )}
            {mappingAccount ? (
              <Link className="hero-action-secondary" href={`/curriculum-mapping?chapter=${encodeURIComponent(chapter.id)}`}>
                Inspect mapping evidence
              </Link>
            ) : null}
            <Link className="hero-action-secondary" href={bookHref}>
              ← All {contentLabel.toLowerCase()}s
            </Link>
          </div>
          <p className="muted" style={{ margin: '14px 0 0', fontSize: 12.5 }}>
            Official publisher material opens in a new tab. HomeSchool OS does not copy or host the textbook.
          </p>
        </div>
      </section>

      <ChapterSessions
        chapterId={chapter.id}
        grade={book.grade}
        contentLabel={contentLabel}
        selectionNote={selectionNote}
        eligible={sessionEligible}
      />

      <div className="ncert-info-grid" style={{ margin: 0 }}>
        <section className="workspace-panel">
          <span className="eyebrow">PARENT-GUIDED STUDY</span>
          <h2 style={{ margin: '4px 0 8px' }}>Read · Discuss · Practise</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Use these general activities with the official {contentLabel.toLowerCase()}; they are not a claimed NCERT exercise or verified competency mapping.
          </p>
          <ol className="lesson-steps">
            <li>
              <strong>Read:</strong> Open the official {contentLabel.toLowerCase()} and work through it together, pausing at unfamiliar words or ideas.
            </li>
            <li>
              <strong>Explain:</strong> Ask the learner to describe a main idea in their own words.
            </li>
            <li>
              <strong>Practise:</strong> Use suitable activities or exercises found in the official {contentLabel.toLowerCase()}.
            </li>
            <li>
              <strong>Reflect:</strong> Ask what felt easy, what was difficult, and what to revisit tomorrow.
            </li>
          </ol>
        </section>

        <section className="workspace-panel">
          <span className="eyebrow">LEARNING NOTES</span>
          <h2 style={{ margin: '4px 0 8px' }}>Discuss with your learner</h2>
          <p className="muted" style={{ marginTop: 0 }}>Useful conversation prompts for any subject:</p>
          <ul className="lesson-questions">
            <li>What are three things you remember without looking back?</li>
            <li>What question would you ask the author or a teacher?</li>
            <li>Where might you notice or use this idea in everyday life?</li>
          </ul>
          <p className="muted" style={{ marginBottom: 0, marginTop: 14, fontSize: 13 }}>
            Parent-recorded progress and learner assignments are available below. Opening an official resource never counts as completion.
          </p>
        </section>
      </div>

      <ChapterProgress
        chapterId={chapter.id}
        contentLabel={contentLabel}
        selectionRequired={chapter.selection === 'choose-one'}
      />

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
