'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {subjectTint} from '@/lib/subject-tint';

type PathState='completed'|'ready'|'revision'|'needs-practice'|'upcoming';
type PathNode={id:string;title:string;subject:string;minutes:number;href:string|null;week:number|null;term:number|null;mode:string|null;source:string;state:PathState};
type Learner={id:string;name:string;grade:string;path?:PathNode[];tasks:{id:string}[]};

const STATE_LABEL:Record<PathState,string>={
 completed:'Completed',
 ready:'Ready now',
 revision:'Revision due',
 'needs-practice':'Needs practice',
 upcoming:'Upcoming',
};
const STATE_GLYPH:Record<PathState,string>={
 completed:'✓',
 ready:'▶',
 revision:'↻',
 'needs-practice':'!',
 upcoming:'·',
};

function nodeHref(node:PathNode,learnerId:string):string{
 return `/learn/lesson?learner=${learnerId}&task=${encodeURIComponent(node.id)}`;
}

/**
 * Duolingo-style learning path: subject-grouped nodes with real states,
 * revision inline, and no arbitrary locks on upcoming lessons.
 */
export function LearningPath({initialLearnerId}:{initialLearnerId?:string}){
 const [data,setData]=useState<null|{learners:Learner[]}>(null);
 const [selected,setSelected]=useState(initialLearnerId??'');
 const [error,setError]=useState('');
 useEffect(()=>{
  let alive=true;
  fetch(initialLearnerId?'/api/auto-learning?path=1&learner='+encodeURIComponent(initialLearnerId):'/api/auto-learning?path=1',{cache:'no-store'})
   .then(r=>r.json())
   .then((json:{learners?:Learner[]})=>{
    if(!alive)return;
    setData({learners:json.learners??[]});
    setSelected(current=>current||(json.learners?.[0]?.id??''));
   })
   .catch(()=>{if(alive)setError('We could not load the learning path. Try refreshing.');});
  return()=>{alive=false;};
 },[]);

 const learner=useMemo(()=>data?.learners.find(l=>l.id===selected)??data?.learners[0]??null,[data,selected]);
 const groups=useMemo(()=>{
  if(!learner?.path)return [];
  const bySubject=new Map<string,PathNode[]>();
  for(const node of learner.path){
   const list=bySubject.get(node.subject)??[];
   list.push(node);
   bySubject.set(node.subject,list);
  }
  return [...bySubject.entries()].map(([subject,nodes])=>({subject,nodes}));
 },[learner]);

 if(error)return <main className="family-dashboard"><p className="muted" role="alert">{error}</p></main>;
 if(!data)return <main className="family-dashboard"><p className="muted">Drawing the path…</p></main>;
 if(!learner)return <main className="family-dashboard"><p className="muted">No learners yet.</p></main>;

 const completed=learner.path?.filter(n=>n.state==='completed').length??0;
 const total=learner.path?.length??0;
 const ready=learner.path?.filter(n=>n.state==='ready').length??0;

 return <main className="learn-path">
  <header className="learn-head studio-page-head">
   <div>
    <p className="eyebrow">Learning path · {learner.grade}</p>
    <h1>{learner.name}&rsquo;s journey</h1>
    <p className="muted">{completed} of {total} lessons finished · {ready} ready right now. Nothing is locked — open any lesson you like.</p>
    <div className="path-legend" aria-label="Path states">
     {(Object.keys(STATE_LABEL) as PathState[]).map(state=><span key={state} className={`legend-chip state-${state}`}>
      <span aria-hidden="true">{STATE_GLYPH[state]}</span> {STATE_LABEL[state]}
     </span>)}
    </div>
   </div>
   <div className="learn-head-actions">
    <Link className="mode-switch" href={`/learn?learner=${learner.id}`}>Learner home</Link>
    <Link className="mode-switch" href="/dashboard">Parent mode</Link>
   </div>
  </header>

  {!initialLearnerId&&<nav className="learner-switcher" aria-label="Choose learner">
   {data.learners.map(l=><button key={l.id} type="button"
    className={l.id===learner.id?'learner-pill is-active':'learner-pill'}
    aria-pressed={l.id===learner.id} onClick={()=>setSelected(l.id)}>
    <span className="learner-avatar" aria-hidden="true">{l.name.slice(0,1).toUpperCase()}</span>
    <span>{l.name}</span>
   </button>)}
  </nav>}

  <div className="path-subjects">
   {groups.map((group,groupIndex)=>{
    const doneCount=group.nodes.filter(n=>n.state==='completed').length;
    return <section className="path-subject card" key={group.subject} aria-labelledby={`subject-${groupIndex}`}>
     <header className="path-subject-head" style={{background:subjectTint(group.subject)}}>
      <div>
       <p className="tag" id={`subject-${groupIndex}`}>{group.subject}</p>
       <h2>{doneCount} of {group.nodes.length}</h2>
      </div>
      <div className="progress-track" role="img" aria-label={`${group.subject}: ${doneCount} of ${group.nodes.length} completed`}>
       <div className="progress-fill" style={{width:`${group.nodes.length?Math.round(doneCount/group.nodes.length*100):0}%`}}/>
      </div>
     </header>
     <ol className="path-nodes">
      {group.nodes.map((node,index)=>{
       const active=node.state==='ready';
       return <li key={node.id} className={`path-row offset-${index%4}`}>
        <Link href={nodeHref(node,learner.id)}
         className={`path-node state-${node.state}${active?' is-current':''}`}
         aria-label={`${node.title} — ${STATE_LABEL[node.state]}, ${node.minutes} minutes`}>
         <span className="path-node-circle" aria-hidden="true">{STATE_GLYPH[node.state]}</span>
         <span className="path-node-copy">
          <strong>{node.title}</strong>
          <small>{STATE_LABEL[node.state]} · {node.minutes} min{node.week?` · Week ${node.week}`:''}</small>
         </span>
        </Link>
        {index<group.nodes.length-1&&<span className="path-connector" aria-hidden="true"/>}
       </li>;
      })}
     </ol>
    </section>;
   })}
   {!groups.length&&<p className="muted">The path appears once curriculum content is available for this stage.</p>}
  </div>
 </main>;
}
