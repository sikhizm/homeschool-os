import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {subjectTint} from '@/lib/subject-tint';
import LearnerForm from '../dashboard/learner-form';
import {learnerTier,tierLabel} from '@/lib/learner-tier';
import LearnerArchiveAction from './learner-archive-action';

export const dynamic='force-dynamic';

export default async function LearnersPage(){
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 const sql=getSql();
 const families=await sql`
  SELECT f.id,f.name,fm.role FROM families f JOIN family_members fm ON fm.family_id=f.id
  WHERE fm.auth_user_id=${session.user.id}
  ORDER BY fm.created_at,fm.family_id LIMIT 1
 `;
 if(!families.length)redirect('/dashboard');
 const family=families[0];
 const learners=await sql`
  SELECT id::text AS id,display_name,stage FROM learners
  WHERE family_id=${family.id} AND archived_at IS NULL ORDER BY created_at,id
 `;
 const archived=await sql`SELECT id::text AS id,display_name,stage FROM learners WHERE family_id=${family.id} AND archived_at IS NOT NULL ORDER BY archived_at DESC,id`;
 return <main className="learners-page">
  <header className="learn-head">
   <div>
    <p className="eyebrow">Learners</p>
    <h1>Everyone learning here</h1>
    <p className="muted">Each learner keeps their own path, records and portfolio. Switch instantly between spaces.</p>
   </div>
   <Link className="mode-switch" href="/dashboard">Back to home</Link>
  </header>

  <div className="family-learner-grid">
   {learners.map(learner=>{
    const stage=String(learner.stage||'Early Years');
    const tier=learnerTier(stage);
    return <article className="family-learner-card card" key={String(learner.id)}>
     <header>
      <span className="learner-avatar" style={{background:subjectTint('')}} aria-hidden="true">{String(learner.display_name).slice(0,1).toUpperCase()}</span>
      <div>
       <h3>{String(learner.display_name)}</h3>
       <p>{stage}</p>
      </div>
     </header>
     <p className="revision-state state-practising">
      <span aria-hidden="true">◐</span><strong>{tierLabel(tier)}</strong>
     </p>
     <footer className="hero-actions">
      <Link className="learner-continue" href={`/learn?learner=${String(learner.id)}`}>Learner home <span aria-hidden="true">→</span></Link>
      <Link className="hero-action-secondary" href={`/learn/path?learner=${String(learner.id)}`}>Path</Link>
      <Link className="hero-action-secondary" href="/portfolio">Portfolio</Link>
      <Link className="hero-action-secondary" href={"/reports?learner="+String(learner.id)}>Reports</Link>
      {String(family.role)==='owner'&&<LearnerArchiveAction id={String(learner.id)} name={String(learner.display_name)}/>}
     </footer>
    </article>;
   })}
   {!learners.length&&<p className="muted">No learners yet — add the first one below.</p>}
  </div>

  {String(family.role)==='owner'&&archived.length>0&&<section className="workspace-panel"><h2>Archived learners</h2><p className="muted">Archived profiles are hidden from active learning spaces. Their history is retained and can be restored.</p><div className="family-learner-grid">{archived.map(learner=><article className="family-learner-card card" key={String(learner.id)}><h3>{String(learner.display_name)}</h3><p>{String(learner.stage||'Early Years')}</p><LearnerArchiveAction id={String(learner.id)} name={String(learner.display_name)} archived/></article>)}</div></section>}

  {String(family.role)==='owner'&&<details className="workspace-panel add-learner-panel" open>
   <summary>Add another learner</summary>
   <p className="muted">Only a display name and learning stage are needed. Records stay private to your family.</p>
   <LearnerForm/>
  </details>}
 </main>;
}
