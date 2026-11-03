import Link from 'next/link';
import type {TeachingLesson} from '@/lib/curriculum/annual';

/**
 * Pure presentational component: renders the full teaching script a parent
 * needs, with no extra research. Usable from both server and client trees.
 */
export default function LessonCard({
  lesson, href, officialUrl, label = 'Open the ready-to-teach lesson', defaultOpen = false,
}: {
  lesson: TeachingLesson;
  href?: string;
  officialUrl?: string | null;
  label?: string;
  defaultOpen?: boolean;
}) {
  return <details className="lesson-card" open={defaultOpen}>
    <summary className="lesson-card-summary"><span aria-hidden="true">✎</span> {label} <small>· {lesson.minutes} min</small></summary>
    <div className="lesson-card-body">
      <div className="lesson-field"><span className="lesson-label">Learning objective</span><p>{lesson.objective}</p></div>
      <div className="lesson-pair">
        <div className="lesson-field"><span className="lesson-label">Materials</span><p>{lesson.materials}</p></div>
        <div className="lesson-field"><span className="lesson-label">Before you start</span><p>{lesson.prep}</p></div>
      </div>
      <div className="lesson-example"><span className="lesson-label">Show them how · worked example</span><p>{lesson.example}</p></div>
      <div className="lesson-field"><span className="lesson-label">Teach it step by step</span>
        <ol className="lesson-steps">{lesson.steps.map((step, index) => <li key={index}>{step}</li>)}</ol>
      </div>
      <div className="lesson-pair">
        <div className="lesson-field"><span className="lesson-label">Questions to ask</span>
          <ul className="lesson-questions">{lesson.questions.map((question, index) => <li key={index}>{question}</li>)}</ul>
        </div>
        <div className="lesson-field"><span className="lesson-label">Your child&apos;s activity</span><p>{lesson.exercise}</p></div>
      </div>
      <div className="lesson-answer"><span className="lesson-label">Expected answers & assessment guidance</span><p>{lesson.expectedAnswer}</p></div>
      <div className="lesson-pair">
        <div className="lesson-field lesson-variant"><span className="lesson-label">Make it easier</span><p>{lesson.easier}</p></div>
        <div className="lesson-field lesson-variant"><span className="lesson-label">Make it harder</span><p>{lesson.harder}</p></div>
      </div>
      <div className="lesson-pair">
        <div className="lesson-field lesson-variant"><span className="lesson-label">How to know it&apos;s done</span><p>{lesson.completionCriteria}</p></div>
        <div className="lesson-field lesson-variant"><span className="lesson-label">If it needs another look</span><p>{lesson.revisionGuidance}</p></div>
      </div>
      {(href || officialUrl) && <div className="lesson-links">
        {href && <Link href={href}>See this week in the learning pathway →</Link>}
        {officialUrl && <a href={officialUrl} target="_blank" rel="noopener noreferrer">Official NCERT chapter PDF (external) ↗</a>}
      </div>}
    </div>
  </details>;
}
