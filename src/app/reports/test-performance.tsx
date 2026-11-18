import { ncertChapterSlots, textbookById } from '@/lib/ncert/textbooks';
import { percentLabel, percentage, summarizeTests } from '@/lib/chapter-tests/model';
import { readChapterTests } from '@/lib/chapter-tests/store';
import styles from './test-performance.module.css';

type Props = {
  userId: string; learnerId: string; learnerName: string; start: string; end: string;
  period: number; subject?: string; chapter?: string;
};

const catalogue = new Map(ncertChapterSlots.map((chapter) => [chapter.id, chapter]));

export default async function TestPerformance(props: Props) {
  let history;
  try {
    history = await readChapterTests(props.userId, props.learnerId, '', props.start, props.end);
  } catch {
    return <section className="workspace-panel"><h2>Test Performance</h2>
      <p className="muted">Test history is unavailable. Check the Chapter Tests migration.</p></section>;
  }
  const rows = history.map((attempt) => {
    const chapter = catalogue.get(attempt.chapterId);
    const book = chapter && textbookById(chapter.bookId);
    return { ...attempt, chapterTitle: chapter?.verifiedTitle ?? chapter?.label ?? attempt.chapterId,
      subject: book?.subject ?? 'Unknown subject', grade: book?.grade ?? '—' };
  });
  const subjects = [...new Set(rows.map(({ subject }) => subject))].sort();
  const chapters = new Map(rows.map(({ chapterId, chapterTitle, grade }) => [chapterId, `Class ${grade} · ${chapterTitle}`]));
  const selectedSubject = subjects.find((subject) => subject === props.subject) ?? '';
  const selectedChapter = props.chapter && chapters.has(props.chapter) ? props.chapter : '';
  const filtered = rows.filter((row) => (!selectedSubject || row.subject === selectedSubject)
    && (!selectedChapter || row.chapterId === selectedChapter));
  const summary = summarizeTests(filtered);
  const bySubject = new Map<string, typeof filtered>();
  for (const row of filtered) {
    const records = bySubject.get(row.subject) ?? [];
    records.push(row);
    bySubject.set(row.subject, records);
  }

  return <section className="workspace-panel">
    <h2>Test Performance</h2>
    <p className="muted">The primary average uses the latest attempt in this window for each assessment. The comparison includes every attempt in the window.</p>
    {rows.length > 0 && <form method="get" action="/reports" className="report-filters report-no-print">
      <input type="hidden" name="learner" value={props.learnerId} />
      <input type="hidden" name="days" value={props.period} />
      <input type="hidden" name="end" value={props.end} />
      <label className="workspace-field"><span>Subject</span>
        <select name="testSubject" defaultValue={selectedSubject}><option value="">All subjects</option>
          {subjects.map((subject) => <option key={subject}>{subject}</option>)}
        </select>
      </label>
      <label className="workspace-field"><span>Chapter</span>
        <select name="testChapter" defaultValue={selectedChapter}><option value="">All chapters</option>
          {[...chapters].map(([id, title]) => <option key={id} value={id}>{title}</option>)}
        </select>
      </label>
      <button className="btn-secondary" type="submit">Filter tests</button>
    </form>}
    {(selectedSubject || selectedChapter) && <p className="muted">{[selectedSubject, chapters.get(selectedChapter)].filter(Boolean).join(' · ')}</p>}
    <div className="metric-grid report-metrics">
      {[
        [summary.assessments.length, 'Assessments'], [summary.history.length, 'Attempts'], [summary.chapters, 'Chapters assessed'],
        [percentLabel(summary.primaryAverage), 'Primary average'], [percentLabel(summary.allAttemptsAverage), 'All-attempt average'],
        [percentLabel(summary.best), 'Best performance'],
      ].map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
    </div>
    {!filtered.length ? <p className="muted">No tests match these filters in this reporting window.</p> : <>
      <h3>Subject averages</h3>
      <ul>{[...bySubject].map(([subject, entries]) =>
        <li key={subject}>{subject} · {percentLabel(summarizeTests(entries).primaryAverage)}</li>)}</ul>
      <h3>Test history</h3>
      <table className={styles.history} aria-label="Test history" role="table">
        <thead role="rowgroup"><tr role="row">{labels.map((label) => <th key={label} scope="col" role="columnheader">{label}</th>)}</tr></thead>
        <tbody role="rowgroup">{filtered.map((row) => <tr key={row.id} role="row">
          {[row.date, props.learnerName, row.grade, row.subject, row.chapterTitle, row.title,
            row.attemptNumber, row.obtained, row.total, percentLabel(percentage(row)), row.remarks || '—'].map((value, index) =>
            <td key={labels[index]} role="cell"><span aria-hidden="true">{labels[index]}</span>{value}</td>)}
        </tr>)}</tbody>
      </table>
    </>}
  </section>;
}

const labels = ['Date', 'Learner', 'Class', 'Subject', 'Chapter', 'Test title', 'Attempt',
  'Marks obtained', 'Total marks', 'Percentage', 'Parent remarks'];
