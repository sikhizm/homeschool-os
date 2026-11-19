import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {queueCatalogue} from '@/lib/auto-learning/catalogue';
import {ncertChapterSlots} from '@/lib/ncert/textbooks';
import {normalizeChapterStatus} from '@/lib/ncert/chapter-status';
import {LearningPath} from './learning-path';

export const dynamic = 'force-dynamic';

export default async function LearningPathPage({searchParams}: {searchParams: Promise<{learner?: string}>}) {
  const {learner: initialLearnerId} = await searchParams;
  const {data: session} = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const sql = getSql();
  const [family] = await sql`
    SELECT family_id FROM family_members WHERE auth_user_id = ${session.user.id}
    ORDER BY created_at, family_id LIMIT 1
  `;
  if (!family) redirect('/dashboard');
  const [learners, progress] = await Promise.all([
    sql`SELECT id::text AS id, display_name, stage FROM learners
      WHERE family_id = ${family.family_id} AND archived_at IS NULL ORDER BY created_at, id`,
    sql`SELECT p.learner_id::text AS learner_id, p.chapter_id, p.status
      FROM ncert_chapter_progress p JOIN learners l ON l.id = p.learner_id
      WHERE l.family_id = ${family.family_id} AND l.archived_at IS NULL`,
  ]);
  const chapterById = new Map(ncertChapterSlots.map(chapter => [chapter.id, chapter]));
  const statusByChapter = new Map(progress.map(row => [`${row.learner_id}:${row.chapter_id}`, normalizeChapterStatus(row.status)]));
  return <LearningPath initialLearnerId={initialLearnerId} learners={learners.map(learner => {
    const id = String(learner.id);
    const grade = String(learner.stage);
    const chapters = queueCatalogue(grade).flatMap(task => {
      const match = /^ncert:(.+):read$/.exec(task.id);
      const chapter = match && chapterById.get(match[1]);
      if (!chapter) return [];
      return [{
        id: chapter.id, title: chapter.verifiedTitle ?? chapter.label, subject: task.subject,
        status: statusByChapter.get(`${id}:${chapter.id}`) ?? 'pending' as const,
      }];
    });
    return {id, name: String(learner.display_name), grade, chapters};
  })} />;
}
