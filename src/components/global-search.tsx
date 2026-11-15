'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import {
  maxSearchLength, searchCategories, searchPageSize,
  type SearchCategory, type SearchFilter, type SearchResponse, type SearchResult,
} from '@/lib/search/types';

const filters = ['all', ...Object.keys(searchCategories)] as SearchFilter[];

function SearchIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4 4" strokeLinecap="round"/></svg>;
}

type RequestState = { key: string; data?: SearchResponse; error?: string };

export default function GlobalSearch({ placement }: { placement: 'sidebar' | 'topbar' }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<SearchFilter>('all');
  const [pages, setPages] = useState(1);
  const [response, setResponse] = useState<RequestState>();
  const query = value.trim();
  const key = JSON.stringify([query, category]);
  const responseRef = useRef<RequestState | undefined>(undefined);
  const request = response?.key === key ? response : undefined;
  const total = request?.data?.total ?? 0;
  const results = request?.data?.results ?? [];

  const openDialog = useCallback(() => {
    if (!dialog.current || document.querySelector('.global-search-dialog[open]')) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current.showModal();
    setOpen(true);
    input.current?.focus();
  }, []);

  useEffect(() => {
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey || event.key.toLowerCase() !== 'k') return;
      if (!trigger.current?.getClientRects().length) return;
      event.preventDefault();
      openDialog();
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [openDialog]);

  useEffect(() => {
    if (!open) return;
    const cached = responseRef.current?.key === key ? responseRef.current.data : undefined;
    if (cached && (cached.results.length >= pages * searchPageSize || cached.results.length === cached.total)) return;
    const controller = new AbortController();
    const offset = cached?.results.length ?? 0;
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query, category, offset: String(offset) });
        const result = await fetch('/api/search?' + params, { signal: controller.signal, cache: 'no-store' });
        if (!result.ok) throw new Error(result.status === 401 ? 'Sign in to search HomeSchool OS.' : 'Search is temporarily unavailable.');
        const data: SearchResponse = await result.json();
        if (controller.signal.aborted) return;
        const next = { key, data: { total: data.total, results: [...(cached?.results ?? []), ...data.results] } };
        responseRef.current = next;
        setResponse(next);
      } catch (error) {
        if (!controller.signal.aborted) {
          const next = { key, data: cached, error: error instanceof Error ? error.message : 'Search is temporarily unavailable.' };
          responseRef.current = next;
          setResponse(next);
        }
      }
    }, offset ? 0 : 160);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [category, key, open, pages, query]);

  function reset() {
    setValue('');
    setCategory('all');
    setPages(1);
    responseRef.current = undefined;
    setResponse(undefined);
    setOpen(false);
    opener.current?.focus();
  }

  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    const links = Array.from(dialog.current?.querySelectorAll<HTMLAnchorElement>('[data-search-result]') ?? []);
    const active = document.activeElement;
    const index = active instanceof HTMLAnchorElement ? links.indexOf(active) : -1;
    if (event.key === 'Enter' && active === input.current && links.length) {
      event.preventDefault();
      links[0].click();
    }
    if ((active !== input.current && index < 0) || !['ArrowDown', 'ArrowUp'].includes(event.key) || !links.length) return;
    event.preventDefault();
    if (event.key === 'ArrowUp' && index === 0) input.current?.focus();
    else links[event.key === 'ArrowDown' ? (index + 1) % links.length : (index + links.length) % links.length]?.focus();
  }

  const grouped = new Map<SearchCategory, SearchResult[]>();
  for (const result of results) {
    const group = grouped.get(result.category);
    if (group) group.push(result);
    else grouped.set(result.category, [result]);
  }
  const loading = !request || (results.length < Math.min(total, pages * searchPageSize) && !request.error);

  return <>
    <button ref={trigger} type="button" className={'global-search-trigger global-search-trigger--' + placement} onClick={openDialog}
      aria-label="Search HomeSchool OS" aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K" title="Search HomeSchool OS (Ctrl or ⌘ + K)">
      <SearchIcon/><span>Search</span><kbd>Ctrl / ⌘ K</kbd>
    </button>
    <dialog ref={dialog} className="global-search-dialog" aria-labelledby={titleId}
      onClose={reset} onKeyDown={keyDown}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="global-search-panel">
        <div className="global-search-heading">
          <h2 id={titleId}>Search HomeSchool OS</h2>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close search">×</button>
        </div>
        <div className="global-search-field">
          <SearchIcon/>
          <input ref={input} type="search" aria-label="Search anything in HomeSchool OS" maxLength={maxSearchLength}
            placeholder="Search anything in HomeSchool OS..." value={value}
            onChange={event => { setValue(event.target.value); setPages(1); }}/>
          {value && <button type="button" onClick={() => { setValue(''); setPages(1); input.current?.focus(); }}>Clear</button>}
        </div>
        <div className="global-search-filters" role="group" aria-label="Search categories">
          {filters.map(filter => <button key={filter} type="button" aria-pressed={category === filter}
            onClick={() => { setCategory(filter); setPages(1); }}>
            {filter === 'all' ? 'All' : searchCategories[filter].label}
          </button>)}
        </div>
        <p className="global-search-message" role="status">
          {loading ? 'Searching…' : request?.error ?? (!total ? 'No matches. Try fewer words or choose All.'
            : query ? `${total} ${total === 1 ? 'result' : 'results'}` : category === 'all' ? 'Quick links' : `${total} available`)}
        </p>
        <div className="global-search-results" aria-busy={loading}>
          {[...grouped].map(([group, records]) => <section key={group} aria-labelledby={titleId + '-' + group}>
            <h3 id={titleId + '-' + group}>{searchCategories[group].label}</h3>
            <ul>{records.map(result => <li key={result.id}>
              <Link href={result.href} data-search-result prefetch={false} onClick={() => dialog.current?.close()}>
                <span className="global-search-result-icon" aria-hidden="true">{searchCategories[result.category].icon}</span>
                <span className="global-search-result-copy">
                  <strong>{result.title}</strong>
                  {result.metadata && <small>{result.metadata}</small>}
                  <span>{result.description}</span>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>)}</ul>
          </section>)}
          {results.length < total && <button type="button" className="global-search-more" disabled={loading}
            onClick={() => setPages(count => count + 1)}>Show more results</button>}
        </div>
        <p className="global-search-help">↑ ↓ Navigate <span>Enter Open</span><span>Esc Close</span></p>
      </div>
    </dialog>
  </>;
}
