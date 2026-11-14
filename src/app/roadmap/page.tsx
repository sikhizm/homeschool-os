import Link from 'next/link';
import SectionArtwork from '@/components/section-artwork';

const phases = [
  {
    phase: 'PHASE 01',
    title: 'Foundation & responsive app shell',
    detail: 'Collapsible studio sidebar, mobile bottom navigation, installable PWA manifest and offline fallback.',
    state: 'Live in studio',
    tone: 'verified',
  },
  {
    phase: 'PHASE 02',
    title: 'Private family profiles & authentication',
    detail: 'Neon Auth session boundary, family-scoped ownership checks and archivable learner spaces.',
    state: 'Live in studio',
    tone: 'verified',
  },
  {
    phase: 'PHASE 03',
    title: 'Curriculum library & NCERT directory',
    detail: 'Source-checked NCERT textbook records (Classes 1–10), global context lenses and stage competencies.',
    state: 'Live in studio',
    tone: 'verified',
  },
  {
    phase: 'PHASE 04',
    title: 'Annual, weekly & automated daily plans',
    detail: 'One-tap daily family rhythm across children, academic-year themes and 36-week teaching pathways.',
    state: 'Live in studio',
    tone: 'verified',
  },
  {
    phase: 'PHASE 05',
    title: 'Activity library, lesson player & printables',
    detail: 'Six-phase guided lesson player with read-aloud support plus clean A4 printable activity sheets.',
    state: 'Live in studio',
    tone: 'verified',
  },
  {
    phase: 'PHASE 06',
    title: 'Portfolios & spaced-recall evidence',
    detail: 'Private baseline, observation and reflection records alongside honest understanding and recall checks.',
    state: 'Live in studio',
    tone: 'verified',
  },
  {
    phase: 'PHASE 07',
    title: 'Parent-led learning reviews',
    detail: 'Printable 7-, 30- and 90-day family summaries derived strictly from saved records without inferred grades.',
    state: 'Live in studio',
    tone: 'verified',
  },
  {
    phase: 'PHASE 08',
    title: 'Editorial mapping & source governance',
    detail: 'Human-reviewed Class 5 chapter-to-outcome queue and transparent framework boundary registers.',
    state: 'Ongoing review',
    tone: 'approved',
  },
] as const;

export default function Roadmap() {
  return (
    <main className="family-dashboard studio-stack">
      <div className="dashboard-welcome">
        <div>
          <span className="tag">PLATFORM ARCHITECTURE</span>
          <h1>Homeschool OS roadmap</h1>
          <p className="muted">
            How each layer of your family learning studio fits together — built calmly around parent agency, privacy and source honesty.
          </p>
        </div>
        <SectionArtwork theme="explore" />
      </div>

      <div className="subject-grid">
        {phases.map((item) => (
          <article className="card settings-card" key={item.phase}>
            <div className="portfolio-record-header">
              <span className="eyebrow">{item.phase}</span>
              <span className={`verify-badge ${item.tone}`}>{item.state}</span>
            </div>
            <h2 style={{ fontSize: 20, margin: '2px 0' }}>{item.title}</h2>
            <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              {item.detail}
            </p>
          </article>
        ))}
      </div>

      <section className="workspace-panel studio-connect-strip">
        <div>
          <span className="eyebrow">EXPLORE NOW</span>
          <h2 style={{ margin: '4px 0 6px' }}>Return to your family workspace</h2>
          <p className="muted" style={{ margin: 0 }}>
            Every active feature above is ready inside your sidebar navigation.
          </p>
        </div>
        <div className="hero-actions" style={{ marginTop: 0 }}>
          <Link className="hero-action-primary" href="/dashboard">
            Open Home →
          </Link>
          <Link className="hero-action-secondary" href="/library">
            Curriculum Library →
          </Link>
        </div>
      </section>
    </main>
  );
}
