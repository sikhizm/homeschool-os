import SectionArtwork from '@/components/section-artwork';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { class4Diagnostics, ukgDiagnostics, preschoolBank, infantGuidance, pilotWeek, sharedMinutes, totalGuidedMinutes } from '@/lib/pilot/november';
import PrintPilotButton from './print-button';
export const dynamic='force-dynamic';
export default async function NovemberPilotPage(){
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 const sql=getSql();
 const family=await sql`SELECT f.id FROM families f JOIN family_members fm ON fm.family_id=f.id WHERE fm.auth_user_id=${session.user.id} ORDER BY fm.created_at,fm.family_id LIMIT 1`;
 if(!family.length)return <main className="family-dashboard"><h1>November Pilot</h1><p>Family membership is required to see the private pilot workspace.</p><Link href="/dashboard">Dashboard</Link></main>;
 return <><header className="workspace-header pilot-no-print"><Link href="/dashboard">✦ Homeschool OS</Link><span>NOVEMBER 2026 PILOT</span></header>
 <main className="family-dashboard pilot-page">
 <div className="pilot-no-print"><Link href="/dashboard">Dashboard</Link> · <Link href="/planning">Planning</Link> · <Link href="/curriculum">Curriculum</Link> · <Link href="/lessons">Lesson library</Link></div>
 <div className="dashboard-welcome"><div><span className="tag">PILOT READINESS · 2–8 NOVEMBER 2026</span><h1>One week of learning together</h1><p className="muted">A parent-led baseline and gentle trial, not a standardised exam or automatic measure of mastery.</p></div><SectionArtwork theme="pilot"/></div>
 <div className="pilot-no-print"><PrintPilotButton/><p className="muted">Printing generates a blank A4-friendly schedule and diagnostic prompts. No learner names, answers or results are saved by this page.</p></div>
 <section className="workspace-panel pilot-section">
 <h2>One shared 60-minute guided rhythm</h2>
 <div className="subject-grid">
 <div className="card"><strong>Shared story and conversation</strong><p>{sharedMinutes.shared} min</p><p>All ages can listen or join briefly, supported by adults.</p></div>
 <div className="card"><strong>Class 4 diagnostic / practice</strong><p>{sharedMinutes.class4} min</p><p>Short, calm skill checks; note the strategy rather than just a right answer.</p></div>
 <div className="card"><strong>UKG literacy and numeracy</strong><p>{sharedMinutes.ukg} min</p><p>Oral language, concrete counters and playful observation.</p></div>
 <div className="card"><strong>Preschool practical-life play</strong><p>{sharedMinutes.preschool} min</p><p>Hands-on, developmentally flexible, supervised activities.</p></div>
 </div><p><strong>Total parent-guided schedule: {totalGuidedMinutes()} minutes per day.</strong> Infant care happens responsively throughout the day and is not allocated a fixed lesson block. This shared family schedule assumes children can safely play or rest while another child receives individual attention; adjust for actual supervision needs. It is not 60 minutes per child.</p>
 </section>
 <section className="workspace-panel pilot-section">
 <h2>Daily pilot — 2 to 8 November</h2>
 <div className="pilot-days">{pilotWeek.map((day,index)=><article className="card pilot-day" key={day.date}>
 <span className="eyebrow">DAY {index+1} · {day.date}</span><h3>{day.theme}</h3>
 <p><strong>15 min shared:</strong> {day.shared}</p>
 <p><strong>20 min Class 4:</strong> {day.class4}</p>
 <p><strong>15 min UKG:</strong> {day.ukg}</p>
 <p><strong>10 min preschool:</strong> {day.preschool}</p>
 <p><strong>Infant (responsive):</strong> {day.infant}</p>
 <p><strong>Reflect:</strong> {day.reflection}</p>
 <p className="pilot-no-print"><Link href={`/dashboard?date=${day.date}`}>Open this day in the private planner →</Link></p>
 </article>)}</div>
 </section>
 <section className="workspace-panel pilot-section">
 <h2>Class 4 baseline — teacher observation prompts</h2>
 <p>Use only a few prompts each day. A baseline is a starting snapshot, not a diagnosis or grade. Write observations on paper; no scores are stored automatically.</p>
 <div className="pilot-items">{class4Diagnostics.map(d=><article key={d.id} className="pilot-check"><h3>{d.area}</h3><p><strong>Try:</strong> {d.prompt}</p><p><strong>Look for:</strong> {d.lookFor}</p><p><strong>If support is needed:</strong> {d.adjustment}</p><p className="pilot-observe">Observed: ☐ Independently &nbsp; ☐ With help &nbsp; ☐ Not yet tried</p><div className="pilot-write">Parent note: ________________________________________________</div></article>)}</div>
 </section>
 <section className="workspace-panel pilot-section">
 <h2>UKG — playful literacy and numeracy baseline</h2>
 <p>Listen, notice and adapt. Never pressure children to perform or finish a worksheet.</p>
 <div className="pilot-items">{ukgDiagnostics.map(d=><article key={d.id} className="pilot-check"><h3>{d.area}</h3><p><strong>Try:</strong> {d.prompt}</p><p><strong>Look for:</strong> {d.lookFor}</p><p><strong>Adapt:</strong> {d.adjustment}</p><p className="pilot-observe">Observed: ☐ Comfortable &nbsp; ☐ With help &nbsp; ☐ Try another time</p><div className="pilot-write">Parent note: ________________________________________________</div></article>)}</div>
 </section>
 <section className="workspace-panel pilot-section">
 <h2>Preschool — Montessori-inspired practical-life bank</h2>
 <p>These are original, Montessori-inspired household experiences, not certified Montessori materials or a formal curriculum.</p>
 <div className="pilot-items">{preschoolBank.map(a=><article key={a.id} className="pilot-check"><h3>{a.title} · {a.minutes} min</h3><p><strong>Materials:</strong> {a.materials}</p><p>{a.activity}</p><p><strong>Purpose:</strong> {a.benefit}</p><p><strong>Safety:</strong> {a.safety}</p></article>)}</div>
 </section>
 <section className="workspace-panel pilot-section">
 <h2>Infancy — responsive care and screen-free play</h2>
 <p>Infants need safe, supervised sensory experiences, predictable care and interaction, not a syllabus or screen-based activities.</p>
 <ul>{infantGuidance.map(a=><li key={a.title}><strong>{a.title}:</strong> {a.note}</li>)}</ul>
 </section>
 <section className="workspace-panel pilot-section">
 <h2>End-of-week review — 8 November</h2>
 <p>Use these prompts to decide on the following week. Complete them only after observing real sessions.</p>
 <ol><li>Which activities attracted each learner’s interest, and which caused fatigue?</li><li>Which foundational skills need concrete models, read-aloud support or repetition?</li><li>Was 60 minutes of shared adult-guided time manageable with childcare and daily routines?</li><li>What practical safety or accessibility adjustments are needed?</li><li>Which one or two goals should enter the individual learning planner next week?</li></ol>
 <div className="pilot-write">Keep: ________________________________________________________</div>
 <div className="pilot-write">Adjust: ______________________________________________________</div>
 <div className="pilot-write">Next week: __________________________________________________</div>
 <p><strong>Status:</strong> Planning materials prepared. Actual learning observations and pilot outcomes are not yet collected.</p>
 </section></main></>;
}