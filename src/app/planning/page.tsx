import SectionArtwork from '@/components/section-artwork';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import PlanningWorkspace from './planning-workspace';
export const dynamic='force-dynamic';
export default async function PlanningPage(){
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 const sql=getSql();
 const families=await sql`SELECT f.id,f.name,fm.role FROM families f JOIN family_members fm ON fm.family_id=f.id
  WHERE fm.auth_user_id=${session.user.id} ORDER BY fm.created_at,fm.family_id LIMIT 1`;
 if(!families.length)return <main className="family-dashboard"><h1>Planning</h1><p>Your account needs an approved family membership.</p><Link href="/dashboard">Return to Dashboard</Link></main>;
 const family=families[0];
 const learners=await sql`SELECT id::text,display_name,stage FROM learners WHERE family_id=${family.id} ORDER BY created_at,id`;
 const initialDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date());
 return <><header className="workspace-header"><Link href="/dashboard">✦ Homeschool OS</Link><span>ANNUAL · WEEKLY · DAILY</span></header>
 <main className="family-dashboard"><div className="dashboard-welcome"><div><span className="tag">PHASE 04 · LEARNING PLANNER</span><h1>Plan your learning rhythm</h1><p className="muted">Sketch the year, focus each week, then plan and reflect on individual days.</p></div><SectionArtwork theme="plan"/><span className="daily-badge">✧ One shared hour of guided time</span></div>
 <PlanningWorkspace learners={learners.map(l=>({id:String(l.id),name:String(l.display_name),stage:String(l.stage||'Early Years')}))} canEdit={family.role==='owner'} initialDate={initialDate}/>
 </main></>;
}
