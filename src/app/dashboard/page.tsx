import Link from 'next/link';
import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { getSql } from '@/lib/db';
import LearnerForm from './learner-form';
import { FamilyHome } from './family-home';
import AutomaticLearning from './automatic-learning';

export const dynamic = 'force-dynamic';

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ competency?: string; globalSkill?: string; date?: string }> }) {
  const params = await searchParams;
  const savedRecordQuery = new URLSearchParams();
  for (const key of ['date', 'competency', 'globalSkill'] as const) {
    if (typeof params[key] === 'string' && params[key]) savedRecordQuery.set(key, params[key]);
  }
  if (savedRecordQuery.size) redirect(`/dashboard/saved-learning?${savedRecordQuery}`);
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const sql = getSql();
  const families = await sql`
    SELECT f.name, fm.role
    FROM families f JOIN family_members fm ON fm.family_id = f.id
    WHERE fm.auth_user_id = ${session.user.id}
    ORDER BY fm.created_at, fm.family_id LIMIT 1
  `;
  if (!families.length)
    return (
      <main className="family-dashboard studio-stack">
        <section className="workspace-panel">
          <span className="eyebrow">PRIVATE DASHBOARD</span>
          <h1>Welcome to Homeschool OS</h1>
          <p className="muted">
            Your account is authenticated, and a family owner can approve your membership to unlock shared records.
          </p>
        </section>
      </main>
    );
  const family = families[0];
  return (
    <main className="family-dashboard studio-stack">
      <FamilyHome familyName={String(family.name)} canEdit={family.role === 'owner'} cacheScope={session.user.id} />

      <section id="today-plan" aria-label="Detailed learning coach">
        <AutomaticLearning cacheScope={session.user.id} />
      </section>

      <section className="quick-start" aria-labelledby="quick-start-title">
        <div className="quick-start-heading">
          <div>
            <span className="eyebrow">YOUR LEARNING TOOLS</span>
            <h2 id="quick-start-title">Where shall we begin?</h2>
          </div>
          <p>Everything you need, one simple tap away.</p>
        </div>
        <div className="quick-start-grid">
          <Link href="/planning" className="quick-start-card tint-peach">
            <span className="quick-start-icon" aria-hidden="true">▦</span>
            <strong>Make a plan</strong>
            <span>Shape the week ahead</span>
            <span className="quick-start-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link href="/challenges" className="quick-start-card tint-lilac">
            <span className="quick-start-icon" aria-hidden="true">❋</span>
            <strong>Challenges &amp; Rewards</strong>
            <span>Assign challenges and track rewards</span>
            <span className="quick-start-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link href="/reports" className="quick-start-card tint-butter">
            <span className="quick-start-icon" aria-hidden="true">◫</span>
            <strong>See the journey</strong>
            <span>Reflect on what matters</span>
            <span className="quick-start-arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      {family.role === 'owner' && (
        <details className="workspace-panel studio-disclosure add-learner-panel">
          <summary>
            <div>
              <strong>Add another learner</strong>
              <small>Create a private learning space with a display name and stage</small>
            </div>
            <span className="disclosure-pill" aria-hidden="true">Expand ⌄</span>
          </summary>
          <div className="studio-disclosure-body">
            <p className="muted" style={{ marginTop: 0 }}>
              Only a display name and learning stage are needed. Records stay private to your family.
            </p>
            <LearnerForm />
          </div>
        </details>
      )}
    </main>
  );
}
