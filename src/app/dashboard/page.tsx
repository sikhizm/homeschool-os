import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { getSql } from '@/lib/db';
export const dynamic = 'force-dynamic';
export default async function Dashboard(){
 const {data:session}=await auth.getSession();
 if(!session?.user) redirect('/auth/sign-in');
 const sql=getSql();
 const families=await sql`SELECT f.id, f.name FROM families f JOIN family_members fm ON fm.family_id=f.id WHERE fm.auth_user_id=${session.user.id} LIMIT 1`;
 if(!families.length) return <main><span className="tag">PRIVATE DASHBOARD</span><h1>Welcome</h1><p>Your account is authenticated but not yet assigned to a family. No learner records are accessible until an owner approves your account.</p></main>;
 const family=families[0];
 const learners=await sql`SELECT display_name,stage FROM learners WHERE family_id=${family.id} ORDER BY created_at`;
 return <main><span className="tag">PRIVATE DASHBOARD</span><h1>{String(family.name)}</h1><h2>Learners</h2><div className="grid">{learners.map((l,i)=><article className="card" key={i}><h3>{String(l.display_name)}</h3><p>{String(l.stage??'Learning stage not set')}</p></article>)}</div>{!learners.length&&<p>No learner profiles have been created yet.</p>}</main>;
}
