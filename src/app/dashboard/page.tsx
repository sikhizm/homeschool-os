import Link from 'next/link';
import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { getSql } from '@/lib/db';
import LearnerForm from './learner-form';
import LearningWorkspace from './learning-workspace';
import { competencies } from '@/lib/curriculum/library';
import { globalSkillById } from '@/lib/global-curriculum/catalogue';
import { validPlanningDate } from '@/lib/planning/periods';
import LearningIllustration from '@/components/learning-illustration';

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
        <section className="learning-hero" aria-labelledby="hero-title">
          <div className="learning-hero-content">
            <span className="hero-kicker"><span aria-hidden="true">✦</span> YOUR FAMILY LEARNING HUB</span>
            <h2 id="hero-title">A little wonder, <em>every day.</em></h2>
            <p>A calm, joyful home for curious minds. Find today&apos;s rhythm, explore activities, and notice how each learner is growing.</p>
            <div className="hero-actions">
              <Link className="hero-action-primary" href="/lessons">Explore activities <span aria-hidden="true">↗</span></Link>
              <Link className="hero-action-secondary" href="/planning">Plan this week <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <LearningIllustration/>
        </section>
        <section className="quick-start" aria-labelledby="quick-start-title">
          <div className="quick-start-heading"><div><span className="eyebrow">YOUR LEARNING TOOLS</span><h2 id="quick-start-title">Where shall we begin?</h2></div><p>Everything you need, one simple tap away.</p></div>
          <div className="quick-start-grid">
            <Link href="/planning" className="quick-start-card tint-peach"><span className="quick-start-icon" aria-hidden="true">▦</span><strong>Make a plan</strong><span>Shape the week ahead</span><span className="quick-start-arrow" aria-hidden="true">↗</span></Link>
            <Link href="/curriculum-studio" className="quick-start-card tint-sage"><span className="quick-start-icon" aria-hidden="true">✳</span><strong>Learning studio</strong><span>Skills, lessons & NCERT</span><span className="quick-start-arrow" aria-hidden="true">↗</span></Link>
            <Link href="/portfolio" className="quick-start-card tint-lilac"><span className="quick-start-icon" aria-hidden="true">❋</span><strong>Capture growth</strong><span>Celebrate little steps</span><span className="quick-start-arrow" aria-hidden="true">↗</span></Link>
            <Link href="/reports" className="quick-start-card tint-butter"><span className="quick-start-icon" aria-hidden="true">◫</span><strong>See the journey</strong><span>Reflect on what matters</span><span className="quick-start-arrow" aria-hidden="true">↗</span></Link>
          </div>
        </section>
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
