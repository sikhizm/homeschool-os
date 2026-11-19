'use client';

import Link from 'next/link';
import {useCallback, useEffect, useState} from 'react';
import {bookKinds, bookPageProgress} from '@/lib/my-books';

type Book = {id: string; title: string; kind: keyof typeof bookKinds; page_count: number};
type Pages = {id: string; book_id: string; learner_id: string; learner_name: string; title: string;
  first_page: number; last_page: number; completed: boolean; learning_date: string};
type Library = {books: Book[]; learners: {id: string; display_name: string}[];
  assignments: {book_id: string; learner_id: string}[]; entries: Pages[]; olympiad?: {id: string; topic: string; learner_name: string; completed: boolean; period?: 'day' | 'week'}[]; canEdit: boolean};

const endpoint = '/api/my-books';

export default function MyBooks({daily = false}: {daily?: boolean}) {
  const [data, setData] = useState<Library | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch(endpoint + (daily ? '?today=1' : ''), {cache: 'no-store', signal});
    const body = await res.json();
    if (!res.ok) throw new Error(body.error);
    if (!signal?.aborted) setData(body);
  }, [daily]);

  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => {
      void load(controller.signal).catch(error => {
        if (!controller.signal.aborted) setNotice(error.message);
      });
    };
    refresh();
    window.addEventListener('pageshow', refresh);
    return () => {
      controller.abort();
      window.removeEventListener('pageshow', refresh);
    };
  }, [load]);

  async function save(payload: Record<string, unknown>) {
    setBusy(true);
    setNotice('');
    try {
      const result = await fetch(endpoint, {method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)});
      if (!result.ok) throw new Error((await result.json()).error);
      await load();
      setNotice(payload.action === 'plan' ? 'Added to Today’s rhythm.' : 'Saved.');
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (daily) {
    if (!data || (!data.entries.length && !data.olympiad?.length)) return null;
    return <section className="family-agenda-message" aria-labelledby="extra-activities">
      <h3 id="extra-activities">Extra activities</h3>
      <ul className="family-agenda-list">{[
        ...data.entries.map(entry => ({
          ...entry,
          label: entry.title,
          phase: entry.first_page === entry.last_page ? `Book · Page ${entry.first_page}` : `Book · Pages ${entry.first_page}–${entry.last_page}`,
          href: '/ncert-books/my-books', tone: 'math', action: 'complete',
        })),
        ...(data.olympiad ?? []).map(entry => ({
          ...entry, label: entry.topic, phase: entry.period === 'week' ? 'Olympiad · This week' : 'Olympiad · Today',
          href: '/planning#olympiad-plan', tone: 'saffron', action: 'complete-olympiad',
        })),
      ].map(entry => <li className="family-agenda-row" key={`${entry.action}:${entry.id}`}>
        <p className="timeline-title">
          <span className={`timeline-dot tone-${entry.tone}`} aria-hidden="true" />
          <Link href={entry.href}>{entry.label}</Link>
        </p>
        <span className="family-agenda-learner">{entry.learner_name}</span>
        <span className="family-agenda-phase">{entry.phase}</span>
        <div className="family-agenda-extra-state">
          <span className={`family-agenda-status${entry.completed ? ' is-done' : ''}`}>{entry.completed ? '✓ Done' : 'Pending'}</span>
          {!entry.completed && data.canEdit && <button type="button" className="family-agenda-extra-done" disabled={busy}
            aria-label={`Mark ${entry.label} done for ${entry.learner_name}`}
            onClick={() => void save({action: entry.action, entryId: entry.id})}>Mark done</button>}
        </div>
      </li>)}</ul>
      {notice && <p role="status">{notice}</p>}
    </section>;
  }

  return <>
    {notice && <p role="status">{notice}</p>}
    {!data && !notice && <p>Loading books…</p>}
    {data?.canEdit && <form className="workspace-panel" onSubmit={event => {
      event.preventDefault();
      const form = event.currentTarget;
      const values = new FormData(form);
      void save({action: 'create', title: values.get('title'), kind: values.get('kind'),
        pageCount: Number(values.get('pages'))}).then(saved => {if (saved) form.reset();});
    }}>
      <h2>Add a book</h2>
      <div className="subject-grid">
        <label className="workspace-field">Title<input name="title" required maxLength={150} /></label>
        <label className="workspace-field">Type<select name="kind">{Object.entries(bookKinds).map(([kind, label]) =>
          <option value={kind} key={kind}>{label}</option>)}</select></label>
        <label className="workspace-field">Total pages<input name="pages" type="number" required min={1} max={2000} /></label>
      </div>
      <button className="btn-primary" disabled={busy}>Add book</button>
    </form>}
    {data?.books.map(book => {
      const assigned = data.learners.filter(learner => data.assignments.some(item =>
        item.book_id === book.id && item.learner_id === learner.id));
      const unassigned = data.learners.filter(learner => !assigned.includes(learner));
      return <section key={book.id} className="workspace-panel">
        <h2>{book.title}</h2>
        <p>{bookKinds[book.kind]} · {book.page_count} pages</p>
        {data.canEdit && unassigned.length > 0 && <form className="chapter-plan-buttons" onSubmit={event => {
          event.preventDefault();
          void save({action: 'assign', bookId: book.id, learnerId: new FormData(event.currentTarget).get('learner')});
        }}>
          <label className="workspace-field">Learner<select name="learner">{unassigned.map(learner =>
            <option key={learner.id} value={learner.id}>{learner.display_name}</option>)}</select></label>
          <button className="btn-secondary" disabled={busy}>Assign book</button>
        </form>}
        {assigned.map(learner => {
          const entries = data.entries.filter(entry => entry.book_id === book.id && entry.learner_id === learner.id);
          const progress = bookPageProgress(book.page_count, entries);
          return <details key={learner.id}>
            <summary>{learner.display_name} · {progress.done} of {book.page_count} pages done</summary>
            {progress.nextPage && <p>Next unfinished page · {progress.nextPage}</p>}
            {data.canEdit && <form className="chapter-plan-buttons" onSubmit={event => {
              event.preventDefault();
              const values = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
              const firstPage = Number(values.get('firstPage'));
              void save({action: values.get('action') ?? 'plan', bookId: book.id, learnerId: learner.id,
                firstPage, lastPage: Number(values.get('lastPage')) || firstPage});
            }}>
              <label className="workspace-field">Start page<input key={progress.nextPage ?? 0} name="firstPage" type="number" required min={1}
                max={book.page_count} defaultValue={progress.nextPage ?? 1} /></label>
              <label className="workspace-field">End page (optional)<input name="lastPage" type="number" min={1} max={book.page_count} /></label>
              <button className="btn-primary" name="action" value="plan" disabled={busy}>Add to Today</button>
              <button className="btn-secondary" name="action" value="log" disabled={busy}>Log as done</button>
            </form>}
            <ul>{entries.filter(entry => entry.completed).map(entry => <li key={entry.id}>
              {entry.learning_date} · {entry.first_page === entry.last_page ? `Page ${entry.first_page}`
                : `Pages ${entry.first_page}–${entry.last_page}`}
            </li>)}</ul>
          </details>;
        })}
      </section>;
    })}
    {data && !data.books.length && <p className="muted">No books added yet.</p>}
  </>;
}
