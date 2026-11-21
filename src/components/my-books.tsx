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
  const [query, setQuery] = useState('');
  const [addFormOpen, setAddFormOpen] = useState<boolean | null>(null);
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


  return <div className="my-books-workspace">
    {notice && <p className="my-books-status" role="status">{notice}</p>}
    {!data && !notice && <p className="my-books-loading" role="status">Loading books…</p>}
    {data && <>
      <div className="my-books-summary" aria-label="Personal library overview">
        <div className="my-books-count"><strong>{data.books.length}</strong><span>{data.books.length === 1 ? 'Book' : 'Books'} in your library</span></div>
        <div className="my-books-count">
          <strong>{new Set(data.assignments.map(item => item.learner_id)).size}</strong>
          <span>Learners with books</span>
        </div>
      </div>

      {data.canEdit && <details className="my-books-add" open={addFormOpen ?? data.books.length === 0} onToggle={event => setAddFormOpen(event.currentTarget.open)}>
        <summary>
          <span className="my-books-add-title">
            <strong>Add a book</strong>
            <small>Record a physical book from your own collection</small>
          </span>
          <span className="my-books-add-symbol" aria-hidden="true">+</span>
        </summary>
        <form className="my-books-add-form" onSubmit={event => {
          event.preventDefault();
          const form = event.currentTarget;
          const values = new FormData(form);
          void save({action: 'create', title: values.get('title'), kind: values.get('kind'),
            pageCount: Number(values.get('pages'))}).then(saved => { if (saved) form.reset(); });
        }}>
          <div className="my-books-add-fields">
            <label className="my-books-field">Book title
              <input name="title" required maxLength={150} placeholder="Enter the book title" />
            </label>
            <label className="my-books-field">Type
              <select name="kind">{Object.entries(bookKinds).map(([kind, label]) =>
                <option value={kind} key={kind}>{label}</option>)}</select>
            </label>
            <label className="my-books-field">Total pages
              <input name="pages" type="number" inputMode="numeric" required min={1} max={2000} placeholder="e.g. 128" />
            </label>
          </div>
          <button type="submit" className="my-books-button my-books-button-primary" disabled={busy}>Save book</button>
        </form>
      </details>}

      <section className="my-books-collection" aria-labelledby="my-books-collection-title">
        <div className="my-books-collection-heading">
          <h2 id="my-books-collection-title">Your collection</h2>
          {data.books.length > 3 && <label className="my-books-search">
            <span className="sr-only">Search your books</span>
            <input type="search" value={query} onChange={event => setQuery(event.target.value)}
              placeholder="Search books…" />
          </label>}
        </div>
        <div className="my-books-list">
          {data.books.filter(book => book.title.toLowerCase().includes(query.trim().toLowerCase())).map(book => {
            const assigned = data.learners.filter(learner => data.assignments.some(item =>
              item.book_id === book.id && item.learner_id === learner.id));
            const unassigned = data.learners.filter(learner => !assigned.some(item => item.id === learner.id));
            return <article className="my-books-card" key={book.id}>
              <div className="my-books-card-head">
                <div>
                  <h3 className="my-books-card-title">{book.title}</h3>
                  <p className="my-books-card-meta">{bookKinds[book.kind]} · {book.page_count} pages</p>
                </div>
                <span className="my-books-card-badge">{assigned.length} assigned</span>
              </div>
              {assigned.length === 0 && <p className="my-books-unassigned">Assign this book to a learner to start tracking pages.</p>}

              {assigned.length > 0 && <div className="my-books-learner-list">
                {assigned.map(learner => {
                  const entries = data.entries.filter(entry =>
                    entry.book_id === book.id && entry.learner_id === learner.id);
                  const progress = bookPageProgress(book.page_count, entries);
                  const percentage = Math.round((progress.done / book.page_count) * 100);
                  const completedEntries = entries.filter(entry => entry.completed);
                  return <details key={learner.id} className="my-books-learner">
                    <summary>
                      <span className="my-books-avatar" aria-hidden="true">{learner.display_name.split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('')}</span>
                      <span className="my-books-learner-name">
                        <strong>{learner.display_name}</strong>
                        <small>{progress.done} of {book.page_count} pages read</small>
                      </span>
                      <span className="my-books-percent">{percentage}%</span>
                      <span className="my-books-chevron" aria-hidden="true">›</span>
                    </summary>
                    <div className="my-books-learner-panel">
                      <progress className="my-books-progress" max={book.page_count} value={progress.done}
                        aria-label={learner.display_name + ' reading progress'} />
                      <p className="my-books-next">{progress.nextPage ? 'Next unfinished page: ' + progress.nextPage : 'All pages completed'}</p>
                      {data.canEdit && <form className="my-books-pages-form" onSubmit={event => {
                        event.preventDefault();
                        const values = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
                        const firstPage = Number(values.get('firstPage'));
                        const lastPage = Number(values.get('lastPage')) || firstPage;
                        if (lastPage < firstPage) {
                          setNotice('End page must be the same as or later than the start page.');
                          return;
                        }
                        void save({action: values.get('action') ?? 'plan', bookId: book.id, learnerId: learner.id,
                          firstPage, lastPage});
                      }}>
                        <div className="my-books-page-fields">
                          <label className="my-books-field">Start page
                            <input key={progress.nextPage ?? 0} name="firstPage" type="number" inputMode="numeric"
                              required min={1} max={book.page_count} defaultValue={progress.nextPage ?? 1} />
                          </label>
                          <label className="my-books-field">End page (optional)
                            <input name="lastPage" type="number" inputMode="numeric" min={1} max={book.page_count} />
                          </label>
                        </div>
                        <div className="my-books-actions">
                          <button type="submit" className="my-books-button my-books-button-primary"
                            name="action" value="plan" disabled={busy}>Add to Today</button>
                          <button type="submit" className="my-books-button my-books-button-secondary"
                            name="action" value="log" disabled={busy}>Log as done</button>
                        </div>
                      </form>}
                      {completedEntries.length > 0 && <details className="my-books-history">
                        <summary>Reading history ({completedEntries.length})</summary>
                        <ul>{completedEntries.map(entry => <li key={entry.id}>
                          {entry.learning_date} · {entry.first_page === entry.last_page
                            ? 'Page ' + entry.first_page
                            : 'Pages ' + entry.first_page + '–' + entry.last_page}
                        </li>)}</ul>
                      </details>}
                    </div>
                  </details>;
                })}
              </div>}

              {data.canEdit && unassigned.length > 0 && <form className="my-books-assign" onSubmit={event => {
                event.preventDefault();
                void save({action: 'assign', bookId: book.id, learnerId: new FormData(event.currentTarget).get('learner')});
              }}>
                <label className="my-books-field">Assign to learner
                  <select name="learner">{unassigned.map(learner =>
                    <option key={learner.id} value={learner.id}>{learner.display_name}</option>)}</select>
                </label>
                <button type="submit" className="my-books-button my-books-button-secondary" disabled={busy}>Assign</button>
              </form>}
            </article>;
          })}
        </div>
        {data.books.length === 0 && <p className="my-books-empty">No books yet. Add your first book above to get started.</p>}
        {data.books.length > 0 && !data.books.some(book => book.title.toLowerCase().includes(query.trim().toLowerCase())) &&
          <p className="my-books-empty">No books match your search.</p>}
      </section>
    </>}
  </div>;
}
