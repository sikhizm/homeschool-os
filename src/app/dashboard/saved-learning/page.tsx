import Link from 'next/link';
import {redirect} from 'next/navigation';
import LearningWorkspace from '../learning-workspace';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {competencies} from '@/lib/curriculum/library';
import {globalSkillById} from '@/lib/global-curriculum/catalogue';
import {validPlanningDate} from '@/lib/planning/periods';

export const dynamic = 'force-dynamic';

export default async function SavedLearning({searchParams}: {
  searchParams: Promise<{competency?: string; globalSkill?: string; date?: string}>;
}) {
  const {data: session} = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const sql = getSql();
  const [family] = await sql`
    SELECT family_id, role FROM family_members
    WHERE auth_user_id = ${session.user.id}
    ORDER BY created_at, family_id LIMIT 1
  `;
  if (!family) redirect('/dashboard');
  const learners = await sql`
    SELECT id, display_name, stage FROM learners
    WHERE family_id = ${family.family_id} AND archived_at IS NULL
    ORDER BY created_at, id
  `;
  const params = await searchParams;
  const skill = competencies.find(item => item.id === params.competency) ??
    (params.globalSkill ? globalSkillById(params.globalSkill) : undefined);
  const initialDate = validPlanningDate(params.date) ? params.date
    : new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Kolkata'}).format(new Date());

  return (
    <main className="family-dashboard studio-stack">
      <section className="workspace-panel">
        <Link href="/dashboard">← Home</Link>
        <h1>Saved day &amp; goal details</h1>
        <LearningWorkspace
          learners={learners.map(row => ({
            id: String(row.id),
            display_name: String(row.display_name),
            stage: String(row.stage || 'Early Years'),
          }))}
          canEdit={family.role === 'owner'}
          initialDate={initialDate}
          suggestedGoal={skill?.outcome ?? ''}
          suggestedSubject={skill?.subject ?? ''}
        />
      </section>
    </main>
  );
}
