import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import PromptBuilder from './prompt-builder';
import './prompts.css';

export const dynamic = 'force-dynamic';

export default async function LearningPromptsPage({searchParams}: {
  searchParams: Promise<{learner?: string; grade?: string; topic?: string}>;
}) {
  const {learner, grade, topic} = await searchParams;
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
  let levelRows: {learner_id:string;level:number}[] = [];
  try { levelRows = await sql`SELECT s.learner_id::text,s.level FROM learner_subject_levels s JOIN learners l ON l.id=s.learner_id WHERE l.family_id::text=${familyId} AND l.archived_at IS NULL AND s.subject='Mathematics'` as {learner_id:string;level:number}[]; } catch { /* Existing prompts remain available before migration 011. */ }
  const learners = rows.map(row => ({ id: String(row.id), name: String(row.display_name), stage: String(row.stage), mathsLevel: levelRows.find(level=>level.learner_id===String(row.id))?.level }));
  return <PromptBuilder storageKey={`learning-prompts-v1:${session.user.id}:${familyId}`} learners={learners}
    entry={{learner, grade, topic}} />;
}
