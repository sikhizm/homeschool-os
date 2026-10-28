import Link from 'next/link';
import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { getSql } from '@/lib/db';
import LearnerForm from './learner-form';
import LearningWorkspace from './learning-workspace';
import { competencies } from '@/lib/curriculum/library';
import { validPlanningDate } from '@/lib/planning/periods';

export const dynamic = 'force-dynamic';

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ competency?: string; date?: string }> }) {
  const params = await searchParams;
  const competency = competencies.find(item => item.id === params.competency);
  const suggestion = competency?.outcome ?? '';
  const suggestedSubject = competency?.subject ?? '';
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const sql = getSql();
  const families = await sql`
    SELECT f.id, f.name, fm.role
    FROM families f JOIN family_members fm ON fm.family_id = f.id
    WHERE fm.auth_user_id = ${session.user.id}
    ORDER BY fm.created_at, fm.family_id LIMIT 1
  `;
  if (!families.length)
    return (
      <main className="family-dashboard">
        <span className="tag">PRIVATE DASHBOARD</span>
        <h1>Welcome</h1>
        <p>
          Your account is authenticated but not assigned to a family. A family
          owner must approve access.
        </p>
      </main>
    );
  const family = families[0];
  const learners = await sql`
    SELECT id, display_name, stage FROM learners
    WHERE family_id = ${family.id}
    ORDER BY created_at, id
  `;
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
  const initialDate = validPlanningDate(params.date) ? params.date : today;
  return (
    <>
      <header className="workspace-header">
        <Link href="/">✦ Homeschool OS</Link>
        <span>YOUR FAMILY’S LEARNING SPACE</span>
      </header>
      <main className="family-dashboard">
        <div className="dashboard-welcome">
          <div>
            <span className="tag">PRIVATE FAMILY WORKSPACE</span>
            <h1>{String(family.name)}</h1>
            <p className="muted">
              Small steps. Shared discoveries. A learning journey of your own.
            </p>
          </div>
          <span className="daily-badge">✧ Around 60 minutes, together</span>
        </div>
        <p><Link href="/planning">Annual & weekly planning →</Link> · <Link href="/curriculum">Curriculum pathways →</Link> · <Link href="/lessons">Lessons & printables →</Link> · <Link href="/november-pilot">November pilot pack →</Link> · <Link href="/portfolio">Learning portfolios →</Link></p>
        <LearningWorkspace
          learners={learners.map((l) => ({
            id: String(l.id),
            display_name: String(l.display_name),
            stage: String(l.stage || 'Early Years'),
          }))}
          canEdit={family.role === 'owner'}
          initialDate={initialDate}
          suggestedGoal={suggestion}
          suggestedSubject={suggestedSubject}
        />
        {family.role === 'owner' && (
          <details className="workspace-panel add-learner-panel">
            <summary>Add another learner</summary>
            <p className="muted">
              Only a display name and learning stage are needed. Records stay
              private to your family.
            </p>
            <LearnerForm />
          </details>
        )}
      </main>
    </>
  );
}
