import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { getSql } from '@/lib/db';
import LearnerForm from './learner-form';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const sql = getSql();
  const families = await sql`
    SELECT f.id, f.name, fm.role
    FROM families f JOIN family_members fm ON fm.family_id = f.id
    WHERE fm.auth_user_id = ${session.user.id}
    ORDER BY fm.created_at LIMIT 1
  `;
  if (!families.length) return <main className="family-dashboard"><span className="tag">PRIVATE DASHBOARD</span><h1>Welcome</h1><p>Your account is authenticated but not assigned to a family. A family owner must approve access.</p></main>;
  const family = families[0];
  const learners = await sql`
    SELECT id, display_name, stage FROM learners
    WHERE family_id = ${family.id}
    ORDER BY created_at, id
  `;
  return <main className="family-dashboard">
    <span className="tag">PRIVATE FAMILY WORKSPACE</span>
    <h1>{String(family.name)}</h1>
    <p className="muted">Set up your learners to start planning their individual learning journeys.</p>
    <section className="dashboard-section" aria-labelledby="learners-title">
      <h2 id="learners-title">Learners <span className="learner-count">{learners.length}</span></h2>
      {learners.length ? <div className="learner-grid">{learners.map(learner => <article className="learner-card" key={String(learner.id)}><div className="learner-avatar" aria-hidden="true">{String(learner.display_name).slice(0,1).toUpperCase()}</div><h3>{String(learner.display_name)}</h3><p>{String(learner.stage || 'Stage not set')}</p></article>)}</div> : <div className="learner-empty"><strong>No learner profiles yet</strong><p>Create the first profile below. Learner information stays in your family's private database records.</p></div>}
    </section>
    {family.role === 'owner' && <section className="dashboard-section create-learner" aria-labelledby="create-learner-title"><h2 id="create-learner-title">Add a learner</h2><p className="muted">Only a display name and learning stage are needed to get started.</p><LearnerForm /></section>}
  </main>;
}
