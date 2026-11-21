import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { readClass5ReviewOverview, type MappingSql } from '@/lib/curriculum/mapping-review-service';
import SectionArtwork from '@/components/section-artwork';
import { ContinueReading } from './continue-reading';
import LibraryQuickBrowse from './quick-browse';
import styles from './personal-books.module.css';

export const dynamic = 'force-dynamic';

const SECTIONS = [
  {
    title: 'Olympiad Resources',
    description: 'Official sample papers and practice collections for Classes 1–10, organised by subject and exam provider.',
    href: '/library/olympiad',
    glyph: '✧',
    tint: 'var(--math)',
  },
  {
    title: 'Learning Prompts',
    description: 'Create Olympiad practice, world curriculum materials and parent teaching guides with ChatGPT or Gemini.',
    href: '/library/prompts',
    glyph: '✧',
    tint: 'var(--mint)',
  },
  {
    title: 'NCERT textbooks',
    description: 'Official book identities, chapter indexes and source-checked titles — with verification state on every entry.',
    href: '/ncert-books',
    glyph: '📚',
    tint: 'var(--math)',
  },
  {
    title: 'Global curriculum',
    description: 'International learning objectives used as pedagogical inspiration, clearly separated from accreditation.',
    href: '/global-curriculum',
    glyph: '🌍',
    tint: 'var(--science)',
  },
  {
    title: 'Supplementary resources and enrichment',
    description: 'Original activities for Preschool / Nursery, UKG and Class 4, plus parent references with link status.',
    href: '/library/enrichment',
    glyph: '✧',
    tint: 'var(--science)',
  },
] as const;

/**
 * Curriculum Library: discovery home with filters, sections and trust legend.
 */
export default async function LibraryPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  let mappingOverview = null;
  try {
    mappingOverview = await readClass5ReviewOverview(getSql() as unknown as MappingSql, session.user.id);
  } catch {
    // The library stays available when owner access cannot be determined.
  }
  return (
    <main className="library-page studio-stack">
      <div className="dashboard-welcome library-welcome library-hero">
        <span className="tag library-hero-kicker">CURRICULUM LIBRARY</span>
        <div className="library-hero-copy">
          <h1>Everything you teach from, in one place</h1>
          <p className="muted">
            Browse by grade, subject or learning type. Every source states what is verified and what is still pending — no guessed alignments.
          </p>
        </div>
        <SectionArtwork theme="explore" />
      </div>

      <section className={styles.card} aria-labelledby="library-personal-books-title">
        <span className={styles.icon} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6c-3-2-6-2.5-10-2v15c4-.5 7 0 10 2M12 6c3-2 6-2.5 10-2v15c-4-.5-7 0-10 2M12 6v15"/>
          </svg>
        </span>
        <div className={styles.copy}>
          <span className={styles.kicker}>YOUR FAMILY LIBRARY</span>
          <h2 id="library-personal-books-title" className={styles.title}>My Books</h2>
          <p className={styles.description}>Manage your own physical books, assign them to learners and track pages read — separate from NCERT and Global Curriculum.</p>
        </div>
        <Link className={styles.action} href="/library/my-books">Open My Books <span aria-hidden="true">→</span></Link>
      </section>

      <LibraryQuickBrowse />

      <ContinueReading />

      <section className="library-sections" aria-labelledby="library-sections-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>DISCOVER</p>
            <h2 id="library-sections-title" style={{ margin: '4px 0 0' }}>Collections &amp; studios</h2>
          </div>
          <p className="muted">{SECTIONS.length} curated spaces</p>
        </div>
        <div className="library-grid">
          {SECTIONS.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="library-card card"
              style={{ borderTop: `4px solid ${section.tint}` }}
            >
              <span className="library-card-glyph" aria-hidden="true" style={{ background: section.tint }}>
                {section.glyph}
              </span>
              <strong>{section.title}</strong>
              <p>{section.description}</p>
              <span className="library-card-arrow" aria-hidden="true">
                Open collection →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {mappingOverview && (
        <section className="workspace-panel" aria-labelledby="curriculum-admin-title">
          <h2 id="curriculum-admin-title">Curriculum Administration &amp; Quality</h2>
          <Link className="library-card card" href="/curriculum-mapping">
            <strong>Curriculum Mapping Review</strong>
            <p>Help check which skills a Class 5 chapter can teach. Family owners can review the evidence before approving a suggested link.</p>
            <p>
              {mappingOverview.pending === null
                ? 'Review count unavailable'
                : `${mappingOverview.pending} ${mappingOverview.pending === 1 ? 'proposal' : 'proposals'} awaiting review`}
            </p>
            <span className="library-card-arrow" aria-hidden="true">Open review queue →</span>
          </Link>
        </section>
      )}

      <section className="card library-legend" aria-labelledby="legend-title">
        <p className="eyebrow" style={{ margin: 0 }}>EDITORIAL TRUST</p>
        <h2 id="legend-title" style={{ margin: '4px 0 6px' }}>How to read verification badges</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Nothing in the library claims accreditation or grade equivalence. Original Homeschool OS content is always labelled clearly.
        </p>
        <ul className="verify-legend-grid">
          <li>
            <span className="verify-badge verified">Verified</span>
            <span>Chapter title or book identity checked against the official publisher source.</span>
          </li>
          <li>
            <span className="verify-badge pending">Contents pending</span>
            <span>The book is listed officially, but its chapter index has not been verified yet.</span>
          </li>
          <li>
            <span className="verify-badge approved">Mapping approved</span>
            <span>A human editor approved the link between a chapter and a skill.</span>
          </li>
          <li>
            <span className="verify-badge mapping-pending">Mapping pending</span>
            <span>A skill link is proposed but not yet approved — never applied automatically.</span>
          </li>
        </ul>
      </section>
    </main>
  );
}
