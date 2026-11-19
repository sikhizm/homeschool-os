'use client';

import Link from 'next/link';
import ChapterPlanMenu from '@/components/chapter-plan-menu';
import {useState} from 'react';
import {chapterDisplayStatuses, type ChapterDisplayStatus} from '@/lib/ncert/chapter-status';

type Chapter = {id: string; title: string; subject: string; status: ChapterDisplayStatus};
type Learner = {id: string; name: string; grade: string; chapters: Chapter[]};

export function LearningPath({initialLearnerId, learners}: {initialLearnerId?: string; learners: Learner[]}) {
  const [selected, setSelected] = useState(initialLearnerId);
  const [subject, setSubject] = useState('');
  const learner = learners.find(item => item.id === selected) ?? learners[0];
  const subjects = [...new Set(learner?.chapters.map(chapter => chapter.subject))];
  const activeSubject = subjects.includes(subject) ? subject : subjects[0];

  return <main className="learn-path chapter-path">
    <header className="chapter-path-heading">
      <div>
        <p className="eyebrow">Learning Path{learner ? ` · ${learner.grade}` : ''}</p>
        <h1>{learner ? `${learner.name}’s journey` : 'Learning Path'}</h1>
      </div>
      {learners.length > 0 && <div className="learner-switcher" role="group" aria-label="Choose learner">
        {learners.map(item => <button key={item.id} type="button" aria-pressed={item.id === learner?.id}
          className={item.id === learner?.id ? 'learner-pill is-active' : 'learner-pill'}
          onClick={() => {setSelected(item.id); setSubject('');}}>
          {item.name} · {item.grade}
        </button>)}
      </div>}
    </header>
    {subjects.length > 0 && <div className="chapter-path-subjects" role="group" aria-label="Choose subject">
      {subjects.map(item => <button key={item} type="button" className="btn-secondary"
        aria-pressed={activeSubject === item} onClick={() => setSubject(item)}>{item}</button>)}
    </div>}
    {learner && activeSubject ? <ul className="chapter-path-list" aria-label={activeSubject}>
      {learner.chapters.filter(chapter => chapter.subject === activeSubject).map(chapter => {
        const href = `/ncert-books/chapter/${encodeURIComponent(chapter.id)}?learner=${encodeURIComponent(learner.id)}`;
        return <li key={chapter.id} className="chapter-path-row">
          <div className="chapter-path-title">
            <strong>{chapter.title}</strong>
            <Link className="chapter-status-badge" data-status={chapter.status} href={href + '#chapter-status'}>
              {chapterDisplayStatuses.find(status => status.id === chapter.status)?.label}
            </Link>
          </div>
          <ChapterPlanMenu inline chapterId={chapter.id} title={chapter.title} learnerId={learner.id} />
          <Link className="btn-primary" href={href + '#chapter-reading'}>Read chapter</Link>
          <Link className="btn-secondary" href={href + '&revision=1#study-material-studio'}>Revision materials</Link>
          <Link className="btn-secondary" href={href + '#chapter-tests'}>Test records</Link>
        </li>;
      })}
    </ul> : <p className="muted">{learner ? 'No NCERT chapters are available for this learning stage.' : 'Add a learner to see their chapters.'}</p>}
  </main>;
}
