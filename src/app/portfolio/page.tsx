import SectionArtwork from '@/components/section-artwork';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import PortfolioWorkspace from './portfolio-workspace';
export const dynamic='force-dynamic';
export default async function PortfolioPage(){
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 const sql=getSql();
 const families=await sql`SELECT f.id,f.name,fm.role FROM families f JOIN family_members fm ON fm.family_id=f.id
 WHERE fm.auth_user_id=${session.user.id} ORDER BY fm.created_at,fm.family_id LIMIT 1`;
 if(!families.length)return <main className="family-dashboard"><h1>Portfolio</h1><p>Family membership approval is required.</p><Link href="/dashboard">Return to Dashboard</Link></main>;
 const learners=await sql`SELECT id::text,display_name,stage FROM learners WHERE family_id=${families[0].id} ORDER BY created_at,id`;
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date());
 return <><header className="workspace-header"><Link href="/dashboard">✦ Homeschool OS</Link><span>OBSERVATIONS & PORTFOLIOS</span></header>
 <main className="family-dashboard">
  <div className="dashboard-welcome"><div><span className="tag">PHASE 06 · LEARNING EVIDENCE</span><h1>Notice what learning looks like</h1><p className="muted">Record a baseline, a meaningful observation, a work sample description or a family reflection—without grades or automatic mastery.</p></div><SectionArtwork theme="journey"/></div>


  <PortfolioWorkspace learners={learners.map(l=>({id:String(l.id),name:String(l.display_name),stage:String(l.stage||'Early Years')}))} canEdit={families[0].role==='owner'} today={today}/>
 </main></>;
}
