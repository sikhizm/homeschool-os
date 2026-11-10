'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {learnerTier,tierLabel,type LearnerTier} from '@/lib/learner-tier';
import {subjectTint} from '@/lib/subject-tint';

type Task={id:string;title:string;subject:string;minutes:number;mode?:string;href:string|null;status?:string};
type ApiLearner={
 id:string;name:string;grade:string;canEdit:boolean;tasks:Task[];upcoming:Task[];
 history:{id:string;updatedAt:string}[];
 subjects:{subject:string;completed:number;total:number}[];
 completed:number;total:number;
 assessment:{completed:number;understood:number;mastered:number;independentRecall:number;recallWithHint:number};
 earnedBadges:{id:string;kind:string;symbol:string;name:string;description:string}[];
};

const TIER_INTRO:Record<LearnerTier,string>={
 toddler:'Grown-up time, not screen time. Pick a short activity to do together away from the device.',
 preschool:'Big buttons, bright pictures, one thing at a time. Tap when you are ready.',
 'early-primary':'One clear next step, then a little practice. You can always ask a grown-up.',
 independent:'Your paths, your pace. Check the plan, work through a lesson, and notice your progress.',
};

function nextTask(learner:ApiLearner):Task|null{
 return learner.tasks?.[0]??null;
}

/**
 * Learner mode home: instant learner switching and an age-adapted layout
 * (toddler / preschool / early primary / independent).
 */
export function LearnHome({initialLearnerId}:{initialLearnerId?:string}){
 const [data,setData]=useState<null|{learners:ApiLearner[]}>(null);
 const [selected,setSelected]=useState<string>(initialLearnerId??'');
 const [error,setError]=useState('');
 useEffect(()=>{
  let alive=true;
  fetch(initialLearnerId?'/api/auto-learning?learner='+encodeURIComponent(initialLearnerId):'/api/auto-learning',{cache:'no-store'})
   .then(r=>r.json())
   .then((json:{learners?:ApiLearner[]})=>{
    if(!alive)return;
    setData({learners:json.learners??[]});
    setSelected(current=>current||(json.learners?.[0]?.id??''));
   })
   .catch(()=>{if(alive)setError('We could not load the learner space. Try refreshing.');});
  return()=>{alive=false;};
 },[]);

 const learner=useMemo(()=>data?.learners.find(l=>l.id===selected)??data?.learners[0]??null,[data,selected]);
 const tier=learner?learnerTier(learner.grade):'independent';
 const next=learner?nextTask(learner):null;

 if(error)return <main className="family-dashboard"><p className="muted" role="alert">{error}</p></main>;
 if(!data)return <main className="family-dashboard"><p className="muted">Loading learner space…</p></main>;
 if(!data.learners.length||!learner)return <main className="family-dashboard">
  <div className="dashboard-welcome"><span className="tag">LEARNER MODE</span><h1>No learners yet</h1><p className="muted">A parent can add the first learner from the dashboard.</p></div>
  <Link className="learner-continue" href="/dashboard">Go to parent home</Link>
 </main>;

 return <main className="learn-home" data-tier={tier}>
  <header className="learn-head">
   <div>
    <p className="eyebrow">Learner mode · {tierLabel(tier)}</p>
    <h1>{learner.name}&rsquo;s space</h1>
    <p className="muted">{TIER_INTRO[tier]}</p>
   </div>
   <Link className="mode-switch" href="/dashboard">Parent mode <span aria-hidden="true">→</span></Link>
  </header>

  {!initialLearnerId&&<nav className="learner-switcher" aria-label="Choose learner">
   {data.learners.map(l=><button key={l.id} type="button"
    className={l.id===learner.id?'learner-pill is-active':'learner-pill'}
    aria-pressed={l.id===learner.id} onClick={()=>setSelected(l.id)}>
    <span className="learner-avatar" style={{background:subjectTint(l.tasks?.[0]?.subject??'')}} aria-hidden="true">{l.name.slice(0,1).toUpperCase()}</span>
    <span>{l.name}</span>
   </button>)}
  </nav>}

  {tier==='toddler'&&<ToddlerHome learner={learner} canEdit={learner.canEdit}/>}
  {tier==='preschool'&&<PreschoolHome learner={learner} next={next}/>}
  {tier==='early-primary'&&<EarlyPrimaryHome learner={learner} next={next}/>}
  {tier==='independent'&&<IndependentHome learner={learner} next={next}/>}
 </main>;
}

function NextActionCard({learner,next,big}:{learner:ApiLearner;next:Task|null;big?:boolean}){
 return <section className={big?'next-action card is-big':'next-action card'} aria-labelledby="next-action-title">
  <p className="tag" id="next-action-title">{big?'Do this next':'Up next'}</p>
  {next?<>
   <h2>{next.title}</h2>
   <p className="muted">{next.subject} · about {next.minutes} minutes · {next.mode==='independent'?'on your own':'with a grown-up'}</p>
   <div className="hero-actions">
    {next.href&&<a className={big?'hero-action-primary start-today':'learner-continue'} href={next.href}>Start lesson <span aria-hidden="true">→</span></a>}
    <Link className="hero-action-secondary" href={`/learn/path?learner=${learner.id}`}>See my path</Link>
   </div>
  </>:<p className="muted">Everything ready for today is finished. Lovely work — take a break!</p>}
 </section>;
}

function ToddlerHome({learner,canEdit}:{learner:ApiLearner;canEdit:boolean}){
 const ideas=(learner.tasks??[]).slice(0,3);
 return <div className="tier-grid">
  <section className="card toddler-lead">
   <p className="tag">Together, away from screens</p>
   <h2>Three short ideas for today</h2>
   <p className="muted">No quizzes, no timers — just a few minutes of play with you.</p>
   <ul className="idea-list">
    {(ideas.length?ideas:[{id:'1',title:'Name five things you can see in this room',subject:'Language',minutes:5,mode:'play',difficulty:'',stage:'',lessonId:null,status:'',href:null}]).map(idea=><li key={idea.id}>
     <strong>{idea.title}</strong><span>{idea.subject} · ~{idea.minutes} min</span>
    </li>)}
   </ul>
   {canEdit&&<Link className="hero-action-secondary" href="/portfolio">Record a family moment <span aria-hidden="true">→</span></Link>}
  </section>
  <section className="card">
   <p className="tag">Grown-up note</p>
   <h2>Screen-free by design</h2>
   <p className="muted">This space only suggests ideas. Nothing is timed, scored or ranked — progress is what you notice together.</p>
  </section>
 </div>;
}

function PreschoolHome({learner,next}:{learner:ApiLearner;next:Task|null}){
 const tiles=(learner.tasks??[]).slice(0,4);
 return <div className="tier-grid">
  <NextActionCard learner={learner} next={next} big/>
  <section className="card" aria-labelledby="play-tiles-title">
   <p className="tag" id="play-tiles-title">Pick a picture</p>
   <div className="play-tiles">
    {tiles.length?tiles.map(task=><a key={task.id} className="play-tile" href={task.href??'#next-action-title'} style={{background:subjectTint(task.subject)}}>
     <span className="play-tile-glyph" aria-hidden="true">{task.subject==='Mathematics'?'🔢':task.subject==='English'?'🔤':task.subject.includes('heritage')||task.subject==='Punjabi'?'🪁':task.subject==='Science'?'🔬':'🎨'}</span>
     <strong>{task.title}</strong>
     <small>{task.minutes} min</small>
    </a>):<p className="muted">New pictures arrive when the plan is prepared.</p>}
   </div>
  </section>
  <section className="card">
   <p className="tag">Stories &amp; sounds</p>
   <h2>Listen, repeat, giggle</h2>
   <p className="muted">Short phonics, counting games and picture quizzes live inside each lesson — one tap from &ldquo;Start lesson&rdquo;.</p>
  </section>
 </div>;
}

function EarlyPrimaryHome({learner,next}:{learner:ApiLearner;next:Task|null}){
 const subjects=(learner.subjects??[]).slice(0,4);
 return <div className="tier-grid">
  <NextActionCard learner={learner} next={next} big/>
  <section className="card" aria-labelledby="subject-cards-title">
   <p className="tag" id="subject-cards-title">Your subjects</p>
   <div className="subject-cards">
    {subjects.map(s=><div className="subject-card" key={s.subject} style={{background:subjectTint(s.subject)}}>
     <strong>{s.subject}</strong>
     <span>{s.completed} of {s.total} done</span>
     <div className="progress-track" role="img" aria-label={`${s.subject}: ${s.completed} of ${s.total} activities done`}><div className="progress-fill" style={{width:`${s.total?Math.round(s.completed/s.total*100):0}%`}}/></div>
    </div>)}
    {!subjects.length&&<p className="muted">Subjects appear after the first activities are recorded.</p>}
   </div>
  </section>
  <section className="card">
   <p className="tag">Stuck? Ask a grown-up</p>
   <p className="muted">Every lesson has a &ldquo;Ask a parent&rdquo; button — that is what it is for.</p>
   <Link className="hero-action-secondary" href={`/learn/path?learner=${learner.id}`}>See my learning path</Link>
  </section>
 </div>;
}

function IndependentHome({learner,next}:{learner:ApiLearner;next:Task|null}){
 const assessment=learner.assessment;
 return <div className="tier-grid">
  <NextActionCard learner={learner} next={next} big/>
  <section className="card" aria-labelledby="path-summary-title">
   <p className="tag" id="path-summary-title">Your paths</p>
   <div className="path-summary">
    {(learner.subjects??[]).map(s=><div key={s.subject}>
     <div className="path-summary-row"><strong>{s.subject}</strong><span>{s.completed}/{s.total}</span></div>
     <div className="progress-track" role="img" aria-label={`${s.subject}: ${s.completed} of ${s.total}`}><div className="progress-fill" style={{width:`${s.total?Math.round(s.completed/s.total*100):0}%`}}/></div>
    </div>)}
   </div>
   <Link className="learner-continue" href={`/learn/path?learner=${learner.id}`}>Open learning path <span aria-hidden="true">→</span></Link>
  </section>
  <section className="card" aria-labelledby="achievements-title">
   <p className="tag" id="achievements-title">Achievements</p>
   <ul className="badge-row">
    {(learner.earnedBadges??[]).map(b=><li key={b.id}>{b.symbol} {b.name}</li>)}
    {!learner.earnedBadges?.length&&<li className="muted">Badges appear as you finish activities and recalls.</li>}
   </ul>
   <p className="muted">{assessment.understood} understanding checks · {assessment.mastered} lasting masteries · {assessment.completed} sessions finished.</p>
  </section>
  <section className="card">
   <p className="tag">Reading &amp; reasoning</p>
   <div className="hero-actions">
    <Link className="hero-action-secondary" href="/lessons">Lesson library</Link>
    <Link className="hero-action-secondary" href="/curriculum-studio">Reasoning studio</Link>
   </div>
  </section>
 </div>;
}
