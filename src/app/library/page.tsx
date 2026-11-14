import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import SectionArtwork from '@/components/section-artwork';
import { ContinueReading } from './continue-reading';
import { libraryGradeOptions } from '@/lib/library/grade-options';

export const dynamic = 'force-dynamic';

const FILTERS = [
  { label: 'Grade', options: libraryGradeOptions },
  {
    label: 'Subject',
    options: ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Vocational Education'].map(
      (label) => ({ label, href: '/lessons' }),
    ),
  },
  {
    label: 'Learning type',
    options: ['Read', 'Practice', 'Play', 'Create'].map((label) => ({ label, href: '/lessons' })),
  },
];

const SECTIONS = [
  {
    title: 'NCERT textbooks',
    description: 'Official book identities, chapter indexes and source-checked titles — with verification state on every entry.',
    href: '/ncert-books',
    glyph: '📚',
    tint: 'var(--math)',
  },
  {
    title: 'Annual pathways',
    description: 'Thirty-six prepared teaching weeks per stage, sequenced with prerequisites and full teaching scripts.',
    href: '/learning-pathways',
    glyph: '🧭',
    tint: '#FBF0D9',
  },
  {
    title: 'Global curriculum',
    description: 'International learning objectives used as pedagogical inspiration, clearly separated from accreditation.',
    href: '/global-curriculum',
    glyph: '🌍',
    tint: 'var(--science)',
  },
  {
    title: 'Competency pathways',
    description: 'Developmental outcomes across stages with prerequisite foundations ready to turn into family goals.',
    href: '/curriculum',
    glyph: '✦',
    tint: 'var(--mint)',
  },
  {
    title: 'Curriculum studio',
    description: 'Integrated stage previews, balanced guided-time plans and transparent catalogue coverage metrics.',
    href: '/curriculum-studio',
    glyph: '🧩',
    tint: 'var(--language)',
  },
  {
    title: 'Activities & printables',
    description: 'Hands-on stories, craft, numeracy and A4 printable sheets — open any activity for the full script.',
    href: '/lessons',
    glyph: '🎨',
    tint: 'var(--creativity)',
  },
  {
    title: 'Sikh heritage & Punjabi',
    description: 'Gurmukhi literacy, heritage stories and family values activities woven gently into your weekly plan.',
    href: '/curriculum?subject=Punjabi+%26+Sikh+heritage',
    glyph: 'ੴ',
    tint: '#F9EDE3',
  },
  {
    title: 'Class 5 mapping review',
    description: 'Parent-owner editorial queue for inspecting chapter evidence and append-only outcome mapping drafts.',
    href: '/curriculum-mapping',
    glyph: '✓',
    tint: '#EFF6FF',
  },
] as const;

/**
 * Curriculum Library: discovery home with filters, sections and trust legend.
 */
export default async function LibraryPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  return (
    <main className="library-page studio-stack">
      <div className="dashboard-welcome library-welcome">
        <div>
          <span className="tag">CURRICULUM LIBRARY</span>
          <h1>Everything you teach from, in one place</h1>
          <p className="muted">
            Browse by grade, subject or learning type. Every source states what is verified and what is still pending — no guessed alignments.
          </p>
        </div>
        <SectionArtwork theme="explore" />
      </div>

      <section className="library-filters card" aria-label="Filter the library">
        <div className="panel-heading" style={{ marginBottom: 4 }}>
          <div>
            <span className="eyebrow">QUICK BROWSE</span>
            <h2 style={{ margin: '3px 0 0', fontSize: 20 }}>Jump straight to a class or activity</h2>
          </div>
        </div>
        {FILTERS.map((filter) => (
          <div className="library-filter" key={filter.label}>
            <span className="library-filter-label">{filter.label}</span>
            <div className="library-filter-chips">
              {filter.options.map((option) => (
                <Link key={option.label} href={option.href} className="library-chip">
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

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
