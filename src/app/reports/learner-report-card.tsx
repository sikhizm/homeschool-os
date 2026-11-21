import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './reading-activity.module.css';
import {getSql} from '@/lib/db';
import {passingChapters} from '@/lib/ncert/passing-chapters';
import {chapterDisplayStatuses, normalizeChapterStatus, type ChapterDisplayStatus} from '@/lib/ncert/chapter-status';
import {ncertChapterSlots, textbookById} from '@/lib/ncert/textbooks';

export default async function LearnerReportCard({learnerId, familyId, today, readingActivity}: {learnerId: string; familyId: string; today: string; readingActivity?: ReactNode}) {
  const sql = getSql();
  const [schema] = await sql`SELECT to_regclass('public.ncert_chapter_progress') IS NOT NULL AS chapters,
    to_regclass('public.learning_challenges') IS NOT NULL AS challenges`;
  const [progress, challenges, passes] = await Promise.all([
    schema.chapters ? sql`SELECT p.chapter_id, p.status, p.completed_at::text AS completed_at
      FROM ncert_chapter_progress p JOIN learners l ON l.id = p.learner_id
      WHERE l.id::text = ${learnerId} AND l.family_id::text = ${familyId} AND l.archived_at IS NULL
      ORDER BY p.updated_at DESC, p.chapter_id` : [],
    schema.challenges ? sql`SELECT c.id, c.title, c.deadline::text AS deadline, c.completed_on::text AS completed_on,
      c.points_earned, c.reward_earned, c.reward_given_at
      FROM learning_challenges c JOIN learners l ON l.id = c.learner_id
      WHERE l.id::text = ${learnerId} AND l.family_id::text = ${familyId} AND l.archived_at IS NULL
      ORDER BY c.completed_on DESC NULLS LAST, c.deadline, c.id` : [],
    passingChapters(sql, [learnerId]),
  ]);
  const chapters = new Map<string, {status: ChapterDisplayStatus; read: boolean}>();
  for (const item of progress) {
    const status = normalizeChapterStatus(item.status);
    chapters.set(String(item.chapter_id), {
      status, read: Boolean(item.completed_at) || ['read', 'revised', 'revision_due'].includes(status),
    });
  }
  for (const item of passes) {
    const id = String(item.chapter_id);
    chapters.set(id, {status: 'finished', read: chapters.get(id)?.read ?? false});
  }
  const catalogue = new Map(ncertChapterSlots.map(chapter => [chapter.id, chapter]));
  const read = [...chapters.values()].filter(item => item.read).length;
  const points = challenges.reduce((sum, item) => sum + Number(item.points_earned ?? 0), 0);
  const rewardsDue = challenges.filter(item => item.reward_earned && !item.reward_given_at).length;

  return <>
    <div className={styles.panels}>
      <section className={`workspace-panel report-card-section ${styles.panel}`} aria-labelledby="report-chapters">
        <h2 id="report-chapters">NCERT chapter progress</h2>
        <p className="muted">{read} chapters read · {passes.length} finished</p>
        {chapters.size ? <ul className={styles.chapters}>
          {Array.from(chapters, ([id, {status}]) => {
            const chapter = catalogue.get(id);
            const subject = chapter ? textbookById(chapter.bookId)?.subject : null;
            return <li key={id}>
              <div>
                {chapter ? <Link href={`/ncert-books/chapter/${encodeURIComponent(id)}?learner=${encodeURIComponent(learnerId)}#chapter-status`}>
                  {chapter.verifiedTitle ?? chapter.label}
                </Link> : <strong>{id}</strong>}
                {subject && <span className={styles.subject}>{subject}</span>}
              </div>
              <span className="chapter-status-badge" data-status={status}>
                {chapterDisplayStatuses.find(option => option.id === status)?.label}
              </span>
            </li>;
          })}
        </ul> : <p className="muted">No chapter status recorded yet.</p>}
      </section>
      {readingActivity}
    </div>
    <section className="workspace-panel report-card-section" aria-labelledby="report-rewards">
      <h2 id="report-rewards">Challenges &amp; Rewards</h2>
      <p className="muted">{points} lifetime points · {challenges.filter(item => item.completed_on).length} completed · {rewardsDue} rewards to give</p>
      {challenges.length ? <div className="report-card-table"><table>
        <thead><tr><th scope="col">Challenge</th><th scope="col">Result</th><th scope="col">Points</th><th scope="col">Reward</th></tr></thead>
        <tbody>{challenges.map(item => <tr key={String(item.id)}>
          <td>{String(item.title)}</td><td>{item.completed_on ? 'Completed ' + item.completed_on : item.deadline < today ? 'Overdue' : 'Active'}</td>
          <td>{item.points_earned ?? '—'}</td><td>{item.reward_earned ? String(item.reward_earned) + (item.reward_given_at ? ' · Given' : ' · To give') : '—'}</td>
        </tr>)}</tbody>
      </table></div> : <p className="muted">{schema.challenges ? 'No challenges assigned yet.' : 'Challenge records become available after the migration.'}</p>}
      <Link href={'/challenges?' + new URLSearchParams({learner: learnerId})}>Open Challenges &amp; Rewards</Link>
    </section>
  </>;
}
