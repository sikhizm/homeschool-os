import SectionArtwork from '@/components/section-artwork';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import LessonStudio from './lesson-studio';

export const dynamic = 'force-dynamic';

export default async function LessonsPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const sql = getSql();
  const families = await sql`
    SELECT f.id, fm.role FROM families f JOIN family_members fm ON fm.family_id = f.id
    WHERE fm.auth_user_id = ${session.user.id} ORDER BY fm.created_at, fm.family_id LIMIT 1
  `;
  if (!families.length)
    return (
      <main className="family-dashboard studio-stack">
        <section className="workspace-panel">
          <span className="eyebrow">ACTIVITY LIBRARY</span>
          <h1>Lesson library</h1>
          <p className="muted">Access requires an approved family membership.</p>
          <div className="hero-actions">
            <Link className="hero-action-primary" href="/dashboard">Return to Home →</Link>
          </div>
        </section>
      </main>
    );
  const learners = await sql`
    SELECT l.id::text, l.display_name, l.stage
    FROM learners l
    WHERE l.family_id = ${families[0].id} AND l.archived_at IS NULL
    ORDER BY l.created_at, l.id
  `;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  return (
    <main className="family-dashboard studio-stack">
      <div className="dashboard-welcome no-print">
        <div>
          <span className="tag">ACTIVITIES &amp; PRINTABLES</span>
          <h1>Make learning tangible</h1>
          <p className="muted">
            Choose a short activity, adapt it to your learner, print a clean A4 sheet, or add it straight to a real learning day.
          </p>
        </div>
        <SectionArtwork theme="create" />
      </div>
      <LessonStudio
        learners={learners.map((l) => ({
          id: String(l.id),
          name: String(l.display_name),
          stage: String(l.stage),
        }))}
        canEdit={families[0].role === 'owner'}
        initialDate={today}
      />
    </main>
  );
}
