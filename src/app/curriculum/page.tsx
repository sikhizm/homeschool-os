import SectionArtwork from '@/components/section-artwork';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import {
  competencies,
  curriculumStages,
  curriculumSources,
  curriculumForStage,
  type SubjectKey,
} from '@/lib/curriculum/library';

export const dynamic = 'force-dynamic';
type Params = { stage?: string; subject?: string };
const subjects: SubjectKey[] = ['English', 'Mathematics', 'Our world', 'Punjabi & Sikh heritage'];

export default async function CurriculumPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const query = await searchParams;
  const stage = curriculumStages.find((s) => s.id === query.stage)?.id ?? 'early';
  const subject = subjects.find((s) => s === query.subject) ?? '';
  const available = curriculumForStage(stage);
  const visible = subject ? available.filter((c) => c.subject === subject) : available;
  const byId = new Map(competencies.map((c) => [c.id, c]));
  const references = new Map<string, { title: string; url: string }>(
    curriculumSources.map((source) => [source.id, source]),
  );

  return (
    <main className="family-dashboard studio-stack">
      <div className="dashboard-welcome">
        <div>
          <span className="tag">LEARNING PATHWAYS</span>
          <h1>Competency pathways</h1>
          <p className="muted">
            Browse developmental suggestions, see prerequisite foundations and turn any skill into a parent-reviewed learning goal.
          </p>
        </div>
        <SectionArtwork theme="explore" />
      </div>

      <section className="global-crosslink" style={{ margin: 0 }}>
        <div>
          <span className="eyebrow">GO BEYOND ONE SYLLABUS</span>
          <h2>Explore a global learning pathway</h2>
          <p>
            Discover original activities informed by NCERT, Cambridge, IB and Singapore mathematics — without teaching every board separately.
          </p>
        </div>
        <Link href="/global-curriculum">Open Global Curriculum →</Link>
      </section>

      <section className="workspace-panel studio-control-bar">
        <div className="panel-heading" style={{ marginBottom: 14 }}>
          <div>
            <span className="eyebrow">FILTER OUTCOMES</span>
            <h2 style={{ margin: '4px 0 0' }}>Choose a stage and subject</h2>
          </div>
          <span className="pill">
            {visible.length} of {available.length} shown
          </span>
        </div>
        <form action="/curriculum" method="get" className="ncert-filter-grid" style={{ marginTop: 0 }}>
          <label className="workspace-field" style={{ marginBottom: 0 }}>
            <span>Learning stage</span>
            <select name="stage" defaultValue={stage}>
              {curriculumStages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="workspace-field" style={{ marginBottom: 0 }}>
            <span>Subject</span>
            <select name="subject" defaultValue={subject}>
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-primary">
            Show competencies
          </button>
        </form>
        <p className="muted" style={{ margin: '14px 0 0', fontSize: 13 }}>
          These {competencies.length} outcomes are original teaching suggestions informed by NCERT frameworks — not verbatim official learning outcomes or grade equivalences.
        </p>
      </section>

      {visible.length > 0 ? (
        <div className="subject-grid">
          {visible.map((c) => {
            const reference = references.get(c.sourceId);
            return (
              <article className="workspace-panel competency-card" key={c.id} id={c.id}>
                <div className="competency-card-top">
                  <span className="competency-symbol" aria-hidden="true">
                    {c.subject === 'Mathematics'
                      ? '∑'
                      : c.subject === 'English'
                        ? 'Aa'
                        : c.subject === 'Our world'
                          ? '✿'
                          : 'ੴ'}
                  </span>
                  <span className="eyebrow">{c.subject}</span>
                </div>
                <h2>{c.title}</h2>
                <p className="competency-outcome">{c.outcome}</p>
                <details className="competency-detail">
                  <summary>
                    Explore this skill <span aria-hidden="true">⌄</span>
                  </summary>
                  <p>
                    <strong>Try together:</strong> {c.activity}
                  </p>
                  {c.prerequisites.length ? (
                    <div>
                      <strong>Useful foundations:</strong>
                      <ul>
                        {c.prerequisites.map((pr) => {
                          const prior = byId.get(pr);
                          return (
                            <li key={pr}>
                              {prior ? (
                                <Link
                                  href={`/curriculum?stage=${encodeURIComponent(prior.stage)}&subject=${encodeURIComponent(prior.subject)}#${prior.id}`}
                                >
                                  {prior.title}
                                </Link>
                              ) : (
                                pr
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : (
                    <p className="muted">An entry-level skill in this curated set.</p>
                  )}
                  <p className="muted">
                    Background:{' '}
                    {reference?.url ? (
                      <a href={reference.url} target="_blank" rel="noopener noreferrer">
                        {reference.title} ↗
                      </a>
                    ) : (
                      'Parent-developed enrichment'
                    )}
                    . Not an exact official outcome mapping.
                  </p>
                </details>
                <Link className="competency-goal-link" href={`/dashboard?competency=${encodeURIComponent(c.id)}`}>
                  Add as a learning goal <span aria-hidden="true">↗</span>
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="workspace-panel workspace-empty">
          <h3>No examples in this filter yet</h3>
          <p>Try selecting “All subjects” or another learning stage.</p>
        </section>
      )}

      <section className="workspace-panel">
        <span className="eyebrow">EDITORIAL TRANSPARENCY</span>
        <h2 style={{ margin: '4px 0 10px' }}>Reference frameworks &amp; family pace</h2>
        <p className="muted">
          With multiple learners, share the family&apos;s approximate 60 minutes of adult-guided time. For infants and toddlers, use responsive care, movement, conversation and supervised sensory play — not formal lessons or screens.
        </p>
        <div className="reference-link-chips">
          {curriculumSources
            .filter((s) => s.id !== 'original')
            .map((s) => (
              <a key={s.id} className="library-chip" href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title} ↗
              </a>
            ))}
        </div>
      </section>
    </main>
  );
}
