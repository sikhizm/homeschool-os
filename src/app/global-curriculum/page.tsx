import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {globalFrameworks,globalSkills,globalStages,globalSubjects,selectGlobalSkills,globalSkillById} from '@/lib/global-curriculum/catalogue';
import {frameworkEvidenceFor,frameworkEvidenceSummary} from '@/lib/global-curriculum/framework-evidence';
import SectionArtwork from '@/components/section-artwork';

export const dynamic='force-dynamic';
type Search={stage?:string;subject?:string;framework?:string;query?:string};
export default async function GlobalCurriculum({searchParams}:{searchParams:Promise<Search>}){
 const {data:session}=await auth.getSession();if(!session?.user)redirect('/auth/sign-in');
 const params=await searchParams;
 const stage=globalStages.find(s=>s.id===params.stage)?.id??'class3-5';
 const subject=globalSubjects.find(s=>s===params.subject)??'';
 const framework=globalFrameworks.find(f=>f.id===params.framework)?.id??'';
 const query=(params.query||'').slice(0,80);
 const skills=selectGlobalSkills({stage,subject,framework,query});
 const total=globalSkills.filter(s=>s.stage===stage).length;
 const evidenceSummary=frameworkEvidenceSummary();
 return <>
 <main className="family-dashboard">
 <div className="dashboard-welcome"><div><span className="tag">CURRICULUM ENGINE · FOUNDATION</span><h1>Rooted here. Ready for the world.</h1><p className="muted">One thoughtful learning journey, informed by international education approaches and grounded in your family&apos;s needs.</p></div><SectionArtwork theme="explore"/></div>
 <div className="global-crosslink"><div><span className="eyebrow">INTEGRATED CURRICULUM</span><h2>Your learning plan, resources and verified coverage</h2><p>See original lessons, stage-sensitive parent-reviewable guidance and a transparent NCERT inventory together.</p></div><Link href="/curriculum-studio">Open Curriculum Studio →</Link></div><section className="global-intro">
  <div><span className="eyebrow">ONE FOUNDATION, MANY PERSPECTIVES</span><h2>Learn deeply, not endlessly.</h2><p>NCERT/Indian frameworks guide the core. International frameworks help us choose teaching approaches, inquiry questions and stretch opportunities. No child needs to complete six boards at once.</p></div>
  <div className="global-intro-art" aria-hidden="true"><span>✳</span><strong>Explore</strong><small>Understand · Practice · Apply</small></div>
 </section>
 <div className="ncert-global-link"><div><span className="eyebrow">OFFICIAL NCERT BOOK DIRECTORY</span><h2>Explore chapters by class and subject</h2><p>Browse source-identified textbook records with transparent verification and mapping status.</p></div><Link href="/ncert-books">Open NCERT book index →</Link></div><section className="workspace-panel" aria-labelledby="framework-evidence-title">
  <span className="eyebrow">PHASE 8 · SOURCE EVIDENCE REGISTER</span>
  <h2 id="framework-evidence-title">Framework references are context, not equivalencies</h2>
  <p className="muted">Each source has a stated scope and limitation. Current learning themes use these sources as teaching context only; no international outcome has been transcribed, mapped to an NCERT chapter or approved as equivalent.</p>
  <div className="ncert-stats" aria-label="Framework review status">
   <div><strong>{evidenceSummary.sourceRecords}</strong><span>Evidence records</span></div>
   <div><strong>{evidenceSummary.frameworkLenses}</strong><span>Framework lenses</span></div>
   <div><strong>{evidenceSummary.outcomeLevelCrosswalks}</strong><span>Outcome crosswalks</span></div>
   <div><strong>{evidenceSummary.approvedEquivalencies}</strong><span>Approved equivalencies</span></div>
  </div>
 </section>
 <div className="global-framework-grid" aria-label="Curriculum source evidence">
  {globalFrameworks.map((framework,index)=>{
   const evidence=frameworkEvidenceFor(framework.id)!;
   const contextCount=globalSkills.filter(skill=>skill.frameworks.includes(framework.id)).length;
   return <article className="global-framework" key={framework.id}>
    <span className="global-framework-icon" aria-hidden="true">{['✦','✳','◎','∑','◈','▤','✎'][index%7]}</span>
    <div>
     <h3>{framework.label}</h3>
     <p>{framework.description}</p>
     <span className="verify-badge pending">{evidence.statusLabel}</span>
     <p><strong>Scope:</strong> {evidence.scope}</p>
     <p><strong>Review boundary:</strong> {evidence.limits[0]}</p>
     <p className="muted">{contextCount} learning theme(s) carry this context tag; this is not a standards mapping.</p>
     {evidence.sourceUrls.length>0?<p>{evidence.sourceUrls.map((url,sourceIndex)=><span key={url}><a href={url} target="_blank" rel="noopener noreferrer">{evidence.sourceUrls.length>1?('Official source '+(sourceIndex+1)+' ↗'):'Open official source ↗'}</a>{sourceIndex<evidence.sourceUrls.length-1?' · ':''}</span>)}</p>:<p className="muted">Internally authored content; no external standard or source mapping.</p>}
    </div>
   </article>;
  })}
 </div>
 <section className="workspace-panel global-filter-panel">
  <div><span className="eyebrow">CURATED STARTER LIBRARY</span><h2>Explore learning pathways</h2><p className="muted">{globalSkills.length} original objectives across six stages. This is a starter catalogue, <strong>not complete coverage</strong> of NCERT textbooks or international board syllabi.</p></div>
  <form action="/global-curriculum" method="get" className="global-filter-grid">
   <label className="workspace-field"><span>Stage</span><select name="stage" defaultValue={stage}>{globalStages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
   <label className="workspace-field"><span>Learning area</span><select name="subject" defaultValue={subject}><option value="">All areas</option>{globalSubjects.map(s=><option value={s} key={s}>{s}</option>)}</select></label>
   <label className="workspace-field"><span>Framework lens</span><select name="framework" defaultValue={framework}><option value="">All references</option>{globalFrameworks.filter(f=>f.id!=='epathshala').map(f=><option key={f.id} value={f.id}>{f.label}</option>)}</select></label>
   <label className="workspace-field"><span>Search topics</span><input name="query" maxLength={80} defaultValue={query} placeholder="Fractions, inquiry, reading…"/></label>
   <button type="submit">Explore pathways →</button>
  </form>
  <p className="muted">{skills.length} matching suggestions · {total} in this stage. Framework filters select editorially relevant themes, not official standards mapped line-by-line.</p>
 </section>
 <div className="global-skill-grid">{skills.map(s=><article className="global-skill-card" key={s.id}>
   <div className="global-skill-top"><span className="global-skill-symbol" aria-hidden="true">{s.subject==='Mathematics'?'∑':s.subject==='English'?'Aa':s.subject==='Our world'?'✿':'ੴ'}</span><span className="eyebrow">{s.subject}</span></div>
   <h3>{s.title}</h3><p className="global-skill-outcome">{s.outcome}</p>
   <div className="global-framework-tags">{s.frameworks.map(f=><span key={f}>{globalFrameworks.find(fr=>fr.id===f)?.label}</span>)}</div>
   <details><summary>How to teach & observe <span aria-hidden="true">⌄</span></summary>
    <p><strong>Try together:</strong> {s.activity}</p><p><strong>What to notice:</strong> {s.check}</p>
    {s.prerequisites.length>0?<p><strong>Earlier foundations:</strong> {s.prerequisites.map(id=>globalSkillById(id)?.title||id).join(', ')}</p>:<p>Entry-level skill within this starter collection.</p>}
    <p className="muted">Editorial inspiration only. Not a certified textbook or official grade equivalence.</p>
   </details>
   <Link className="global-skill-action" href={`/dashboard?globalSkill=${encodeURIComponent(s.id)}`}>Review as a learning goal <span aria-hidden="true">↗</span></Link>
  </article>)}</div>
 {skills.length===0&&<section className="workspace-panel"><h2>No skills matched</h2><p>Try a different stage or clear the filters. It does not mean a learner has no available learning options.</p></section>}
 <section className="global-bottom-row">
  <article className="workspace-panel"><span className="eyebrow">TEXTBOOK ACCESS</span><h2>Learn from official books</h2><p>Open NCERT material using ePathshala. We do not copy, download, rehost, or reproduce textbook chapters inside this catalogue.</p><a href="https://epathshala.nic.in/" target="_blank" rel="noopener noreferrer">Open ePathshala ↗</a></article>
  <article className="workspace-panel"><span className="eyebrow">EDITORIAL TRUST</span><h2>Know what is verified</h2><p>Sources link to real curriculum organisations; our learning suggestions are independently written. Chapter-level links, syllabus edition, alignment and equivalence must be individually reviewed before they can be labelled official.</p><Link href="/curriculum">View existing curriculum pathways →</Link></article>
 </section>
 </main></>;
}