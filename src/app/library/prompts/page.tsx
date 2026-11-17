import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import PromptBuilder from './prompt-builder';
import './prompts.css';

export const dynamic = 'force-dynamic';

export default async function LearningPromptsPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const sql = getSql();
  const families = await sql`
    SELECT family_id::text AS id FROM family_members
    WHERE auth_user_id = ${session.user.id}
    ORDER BY created_at, family_id LIMIT 1
  `;
  if (!families.length) redirect('/dashboard');
  const familyId = String(families[0].id);
  const rows = await sql`
    SELECT id::text AS id, display_name, stage FROM learners
    WHERE family_id = ${familyId} AND archived_at IS NULL ORDER BY created_at, id
  `;
  const learners = rows.map(row => ({ id: String(row.id), name: String(row.display_name), stage: String(row.stage) }));
  return <PromptBuilder storageKey={`learning-prompts-v1:${session.user.id}:${familyId}`} learners={learners} />;
}
