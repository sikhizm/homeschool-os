import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import StudyLibrary from './study-library';
export const dynamic='force-dynamic';
export default async function LearnerStudyLibraryPage({params}:{params:Promise<{learnerId:string}>}){
 const {data:session}=await auth.getSession();if(!session?.user?.id)redirect('/auth/sign-in');const {learnerId}=await params;
 const sql=getSql();const rows=await sql`SELECT l.id::text,l.display_name,l.stage FROM learners l JOIN family_members fm ON fm.family_id=l.family_id WHERE l.id::text=${learnerId} AND l.archived_at IS NULL AND fm.auth_user_id=${session.user.id} LIMIT 1`;
 if(!rows.length)notFound();const learner=rows[0];
 return <main className="family-dashboard studio-stack"><nav className="global-crumbs"><Link href="/learners">Learners</Link><span>/</span><strong>{String(learner.display_name)} · Study Library</strong></nav><StudyLibrary learnerId={String(learner.id)} name={String(learner.display_name)} stage={String(learner.stage)}/></main>;
}
