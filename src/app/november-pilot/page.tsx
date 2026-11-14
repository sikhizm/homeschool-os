import SectionArtwork from '@/components/section-artwork';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import {
  class4Diagnostics,
  ukgDiagnostics,
  preschoolBank,
  infantGuidance,
  pilotWeek,
  sharedMinutes,
  totalGuidedMinutes,
} from '@/lib/pilot/november';
import PrintPilotButton from './print-button';

export const dynamic = 'force-dynamic';

export default async function NovemberPilotPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const sql = getSql();
  const family = await sql`
    SELECT f.id FROM families f JOIN family_members fm ON fm.family_id = f.id
    WHERE fm.auth_user_id = ${session.user.id} ORDER BY fm.created_at, fm.family_id LIMIT 1
  `;
  if (!family.length)
    return (
      <main className="family-dashboard studio-stack">
        <section className="workspace-panel">
          <span className="eyebrow">PILOT GUIDE</span>
          <h1>November Pilot</h1>
          <p className="muted">Family membership is required to see the private pilot workspace.</p>
          <div className="hero-actions">
            <Link className="hero-action-primary" href="/dashboard">Return to Home →</Link>
          </div>
        </section>
      </main>
    );

  return (
    <main className="family-dashboard pilot-page studio-stack">
      <div className="dashboard-welcome">
        <div>
          <span className="tag">PILOT READINESS · 2–8 NOVEMBER 2026</span>
          <h1>One week of learning together</h1>
          <p className="muted">
            A calm, parent-led baseline and gentle family trial — not a standardised exam or automated measure of mastery.
          </p>
          <div className="hero-actions pilot-no-print">
            <PrintPilotButton />
            <Link className="hero-action-secondary" href="/portfolio">
              Open Family Portfolio →
            </Link>
          </div>
        </div>
        <SectionArtwork theme="pilot" />
      </div>

      <section className="workspace-panel pilot-section" style={{ margin: 0 }}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">FAMILY PACING</span>
            <h2 style={{ margin: '4px 0 0' }}>One shared {totalGuidedMinutes()}-minute guided rhythm</h2>
          </div>
          <span className="pill">{totalGuidedMinutes()} min / day shared</span>
        </div>
        <div className="ncert-stats" style={{ margin: '14px 0' }}>
          <div>
            <strong>{sharedMinutes.shared}m</strong>
            <span>Shared story &amp; conversation across ages</span>
          </div>
          <div>
            <strong>{sharedMinutes.class4}m</strong>
            <span>Class 4 diagnostic &amp; strategy checks</span>
          </div>
          <div>
            <strong>{sharedMinutes.ukg}m</strong>
            <span>UKG oral literacy &amp; concrete counters</span>
          </div>
          <div>
            <strong>{sharedMinutes.preschool}m</strong>
            <span>Preschool hands-on practical-life play</span>
          </div>
        </div>
        <p className="muted" style={{ marginBottom: 0, fontSize: 13 }}>
          Infant care happens responsively throughout the day and is never allocated a fixed lesson block. Printing generates a blank A4-friendly schedule and observation prompts without storing learner answers automatically.
        </p>
      </section>

      <section className="workspace-panel pilot-section" style={{ margin: 0 }}>
        <span className="eyebrow">SEVEN-DAY SCHEDULE</span>
        <h2 style={{ margin: '4px 0 14px' }}>Daily pilot — 2 to 8 November</h2>
        <div className="pilot-days">
          {pilotWeek.map((day, index) => (
            <article className="card pilot-day" key={day.date}>
              <span className="eyebrow">
                DAY {index + 1} · {day.date}
              </span>
              <h3 style={{ margin: '6px 0 10px' }}>{day.theme}</h3>
              <p>
                <strong>15 min shared:</strong> {day.shared}
              </p>
              <p>
                <strong>20 min Class 4:</strong> {day.class4}
              </p>
              <p>
                <strong>15 min UKG:</strong> {day.ukg}
              </p>
              <p>
                <strong>10 min preschool:</strong> {day.preschool}
              </p>
              <p>
                <strong>Infant (responsive):</strong> {day.infant}
              </p>
              <p>
                <strong>Reflect:</strong> {day.reflection}
              </p>
              <p className="pilot-no-print" style={{ marginBottom: 0 }}>
                <Link className="week-day-link" href={`/dashboard?date=${day.date}`}>
                  Open this day in planner →
                </Link>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-panel pilot-section" style={{ margin: 0 }}>
        <span className="eyebrow">OBSERVATION PROMPTS</span>
        <h2 style={{ margin: '4px 0 6px' }}>Class 4 baseline — parent observation prompts</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Use only a few prompts each day. A baseline is a starting snapshot, not a diagnosis or grade.
        </p>
        <div className="pilot-items">
          {class4Diagnostics.map((d) => (
            <article key={d.id} className="pilot-check">
              <h3>{d.area}</h3>
              <p>
                <strong>Try:</strong> {d.prompt}
              </p>
              <p>
                <strong>Look for:</strong> {d.lookFor}
              </p>
              <p>
                <strong>If support is needed:</strong> {d.adjustment}
              </p>
              <p className="pilot-observe">Observed: ☐ Independently · ☐ With help · ☐ Not yet tried</p>
              <div className="pilot-write">
                <span>Parent note</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-panel pilot-section" style={{ margin: 0 }}>
        <span className="eyebrow">EARLY PRIMARY</span>
        <h2 style={{ margin: '4px 0 6px' }}>UKG — playful literacy and numeracy baseline</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Listen, notice and adapt. Never pressure children to perform or finish a worksheet.
        </p>
        <div className="pilot-items">
          {ukgDiagnostics.map((d) => (
            <article key={d.id} className="pilot-check">
              <h3>{d.area}</h3>
              <p>
                <strong>Try:</strong> {d.prompt}
              </p>
              <p>
                <strong>Look for:</strong> {d.lookFor}
              </p>
              <p>
                <strong>Adapt:</strong> {d.adjustment}
              </p>
              <p className="pilot-observe">Observed: ☐ Comfortable · ☐ With help · ☐ Try another time</p>
              <div className="pilot-write">
                <span>Parent note</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-panel pilot-section" style={{ margin: 0 }}>
        <span className="eyebrow">HANDS-ON DISCOVERY</span>
        <h2 style={{ margin: '4px 0 6px' }}>Preschool — Montessori-inspired practical-life bank</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Original household experiences — not certified Montessori materials or a formal curriculum.
        </p>
        <div className="pilot-items">
          {preschoolBank.map((a) => (
            <article key={a.id} className="pilot-check">
              <h3>
                {a.title} · {a.minutes} min
              </h3>
              <p>
                <strong>Materials:</strong> {a.materials}
              </p>
              <p>{a.activity}</p>
              <p>
                <strong>Purpose:</strong> {a.benefit}
              </p>
              <p>
                <strong>Safety:</strong> {a.safety}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-panel pilot-section" style={{ margin: 0 }}>
        <span className="eyebrow">SCREEN-FREE CARE</span>
        <h2 style={{ margin: '4px 0 6px' }}>Infancy — responsive care and sensory play</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Infants need safe, supervised sensory experiences, predictable care and warm conversation — never screens or lessons.
        </p>
        <div className="pilot-items">
          {infantGuidance.map((a) => (
            <article key={a.title} className="pilot-check">
              <h3>{a.title}</h3>
              <p style={{ marginBottom: 0 }}>{a.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-panel pilot-section" style={{ margin: 0 }}>
        <span className="eyebrow">WEEKLY RETROSPECTIVE</span>
        <h2 style={{ margin: '4px 0 6px' }}>End-of-week review — 8 November</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Use these prompts to shape the following week after observing real sessions together.
        </p>
        <ol className="lesson-steps">
          <li>Which activities attracted each learner’s interest, and which caused fatigue?</li>
          <li>Which foundational skills need concrete models, read-aloud support or repetition?</li>
          <li>Was 60 minutes of shared adult-guided time manageable alongside daily routines?</li>
          <li>What practical safety or accessibility adjustments are needed?</li>
          <li>Which one or two goals should enter the individual learning planner next week?</li>
        </ol>
        <div className="reflection-prompt-grid" style={{ marginTop: 18 }}>
          <div className="reflection-prompt-box">
            <strong>Keep</strong>
            <span>Routines and moments that felt natural</span>
            <div className="reflection-line" aria-hidden="true" />
          </div>
          <div className="reflection-prompt-box">
            <strong>Adjust</strong>
            <span>Pacing, materials or transitions to simplify</span>
            <div className="reflection-line" aria-hidden="true" />
          </div>
          <div className="reflection-prompt-box">
            <strong>Next week</strong>
            <span>One or two gentle priorities</span>
            <div className="reflection-line" aria-hidden="true" />
          </div>
        </div>
      </section>
    </main>
  );
}
