import Link from 'next/link';
import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { getSql } from '@/lib/db';
import LearnerForm from './learner-form';
import LearningWorkspace from './learning-workspace';
import { FamilyHome } from './family-home';
import { competencies } from '@/lib/curriculum/library';
import { globalSkillById } from '@/lib/global-curriculum/catalogue';
import { validPlanningDate } from '@/lib/planning/periods';
import AutomaticLearning from './automatic-learning';

export const dynamic = 'force-dynamic';

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ competency?: string; globalSkill?: string; date?: string }> }) {
  const params = await searchParams;
  const competency = competencies.find(item => item.id === params.competency);
  const globalSuggestion = params.globalSkill ? globalSkillById(params.globalSkill) : undefined;
  const suggestion = competency?.outcome ?? globalSuggestion?.outcome ?? '';
  const suggestedSubject = competency?.subject ?? globalSuggestion?.subject ?? '';
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
          <span className="eyebrow">PRIVATE DASHBOARD</span>
          <h1>Welcome to Homeschool OS</h1>
          <p className="muted">
            Your account is authenticated, and a family owner can approve your membership to unlock shared records.
          </p>
        </section>
      </main>
    );
  const family = families[0];
  const learners = await sql`
    SELECT id, display_name, stage FROM learners
    WHERE family_id = ${family.id} AND archived_at IS NULL
    ORDER BY created_at, id
  `;
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
  const initialDate = validPlanningDate(params.date) ? params.date : today;
  const hasPrefill = Boolean(suggestion || params.date);
  return (
    <main className="family-dashboard studio-stack">
      <FamilyHome familyName={String(family.name)} canEdit={family.role === 'owner'} />

      <section id="today-plan" aria-label="Detailed learning coach">
        <AutomaticLearning />
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
          <Link href="/learning-pathways" className="quick-start-card tint-sage">
            <span className="quick-start-icon" aria-hidden="true">✳</span>
            <strong>Learning pathways</strong>
            <span>Prepared grade-wise teaching activities</span>
            <span className="quick-start-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link href="/portfolio" className="quick-start-card tint-lilac">
            <span className="quick-start-icon" aria-hidden="true">❋</span>
            <strong>Capture growth</strong>
            <span>Celebrate little steps</span>
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

      <details className="workspace-panel studio-disclosure" open={hasPrefill || undefined}>
        <summary>
          <div>
            <strong>Manual planning &amp; goals workspace</strong>
            <small>Optional custom subjects, observable goals and day-by-day activity logs</small>
          </div>
          <span className="disclosure-pill" aria-hidden="true">Expand ⌄</span>
        </summary>
        <div className="studio-disclosure-body">
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
        </div>
      </details>

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
