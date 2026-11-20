import FamilyWorkflow from '@/components/family-workflow';
import SectionArtwork from '@/components/section-artwork';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import PlanningWorkspace from './planning-workspace';

export const dynamic = 'force-dynamic';

export default async function PlanningPage({searchParams}:{searchParams:Promise<{resource?:string;intent?:string;learner?:string}>}) {
  const params=await searchParams;
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
      <main className="family-dashboard studio-stack">
        <section className="workspace-panel">
          <span className="eyebrow">LEARNING PLAN</span>
          <h1>Planning</h1>
          <p className="muted">Your account needs an approved family membership.</p>
          <div className="hero-actions">
            <Link className="hero-action-primary" href="/dashboard">Return to Home →</Link>
          </div>
        </section>
      </main>
    );
  const family = families[0];
  const learners = await sql`
    SELECT id::text, display_name, stage
    FROM learners
    WHERE family_id = ${family.id} AND archived_at IS NULL
    ORDER BY created_at, id
  `;
  const initialDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  return (
    <main className="family-dashboard studio-stack">
      <div className="dashboard-welcome">
        <div>
          <span className="tag">YOUR LEARNING PLANNER</span>
          <h1>Plan chapters and daily learning</h1>
          <p className="muted">
            Choose NCERT chapters for the year, schedule daily tasks and follow each learner’s progress.
          </p>
        </div>
        <SectionArtwork theme="plan" />
      </div>
      {params.resource && <FamilyWorkflow key={params.resource??'default'} resourceKey={typeof params.resource==='string'?params.resource:''} intent={params.intent}/>}
      <PlanningWorkspace
        learners={learners.map((l) => ({
          id: String(l.id),
          name: String(l.display_name),
          stage: String(l.stage || 'Early Years'),
        }))}
        canEdit={family.role === 'owner'}
        initialDate={initialDate}
        initialLearner={params.learner}
      />
    </main>
  );
}
