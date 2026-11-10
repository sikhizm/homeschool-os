import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {LessonPlayer} from './lesson-player';

export const dynamic='force-dynamic';

export default async function LessonPage({searchParams}:{searchParams:Promise<{learner?:string;task?:string}>}){
 const params=await searchParams;
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 if(!params.learner||!params.task)redirect('/learn');
 const sql=getSql();
 const rows=await sql`
  SELECT l.id::text AS id,l.display_name FROM learners l JOIN family_members fm ON fm.family_id=l.family_id
  WHERE l.id::text=${params.learner} AND l.archived_at IS NULL AND fm.auth_user_id=${session.user.id} LIMIT 1
 `;
 if(!rows.length)redirect('/learn');
 return <LessonPlayer learnerId={params.learner} taskId={params.task} learnerName={String(rows[0].display_name)}/>;
}
