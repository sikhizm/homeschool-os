import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {LearnHome} from './learn-home';

export const dynamic='force-dynamic';

export default async function LearnPage({searchParams}:{searchParams:Promise<{learner?:string}>}){
 const params=await searchParams;
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 const sql=getSql();
 const families=await sql`
  SELECT f.id FROM families f JOIN family_members fm ON fm.family_id=f.id
  WHERE fm.auth_user_id=${session.user.id}
  ORDER BY fm.created_at,fm.family_id LIMIT 1
 `;
 if(!families.length)redirect('/dashboard');
 return <LearnHome initialLearnerId={params.learner}/>;
}
