'use client';

import Link from 'next/link';
import { useRef, useState, useSyncExternalStore } from 'react';
import {
  approaches, buildLearningPrompt, curricula, defaultSettings, formats, materials,
  olympiadSources, topics, tracks, validSettings, type PromptSettings,
} from '@/lib/learning-prompts';

type Learner = { id: string; name: string; stage: string };
type BuilderProps = { learners: Learner[]; storageKey: string };
const subscribe = () => () => {};
export default function PromptBuilder(props: BuilderProps) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? <LoadedBuilder key={props.storageKey} {...props} /> : <p role="status">Loading learning prompts…</p>;
}
function LoadedBuilder({ learners, storageKey }: BuilderProps) {
  const [saved] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
      return {
        settings: validSettings(value?.settings) ? value.settings : defaultSettings,
        favourites: Array.isArray(value?.favourites) ? value.favourites.filter(validSettings).slice(0, 20) as PromptSettings[] : [],
      };
    } catch { return { settings: defaultSettings, favourites: [] as PromptSettings[] }; }
  });
  const [settings, setSettings] = useState<PromptSettings>(saved.settings);
  const [learnerId, setLearnerId] = useState(learners[0]?.id ?? '');
  const [favourites, setFavourites] = useState<PromptSettings[]>(saved.favourites);
  const [message, setMessage] = useState('');
  const preview = useRef<HTMLTextAreaElement>(null);
  const learner = learners.find(item => item.id === learnerId) ?? { name: 'Learner', stage: 'Class 4' };
  const prompt = buildLearningPrompt(settings, learner);
  function save(next: PromptSettings, savedFavourites = favourites) {
    setSettings(next);
    setMessage('');
    try { localStorage.setItem(storageKey, JSON.stringify({ settings: next, favourites: savedFavourites })); }
    catch { setMessage('Device storage is unavailable. Copy your prompt before leaving.'); }
  }
  function change<Key extends keyof PromptSettings>(key: Key, value: PromptSettings[Key]) {
    save({ ...settings, [key]: value });
  }
  function toggleFavourite() {
    const exists = favourites.some(item => JSON.stringify(item) === JSON.stringify(settings));
    if (!exists && favourites.length >= 20) { setMessage('You have 20 favourites. Remove one before adding another.'); return; }
    const next = exists ? favourites.filter(item => JSON.stringify(item) !== JSON.stringify(settings)) : [...favourites, settings];
    setFavourites(next);
    save(settings, next);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(prompt); setMessage('Prompt copied. Paste it into ChatGPT or Gemini.'); }
    catch { preview.current?.focus(); preview.current?.select(); setMessage('Select and copy the highlighted prompt manually.'); }
  }
  const isFavourite = favourites.some(item => JSON.stringify(item) === JSON.stringify(settings));
  const sourceLinks = settings.track === 'Olympiad Prep' ? olympiadSources : [curricula[settings.curriculum].url];
  return <main className="learning-prompts studio-stack">
    <nav aria-label="Breadcrumb"><Link href="/library">Curriculum Library</Link> / Learning Prompts</nav>
    <header><h1>Learning Prompts</h1><p className="muted">Choose a learning goal, copy your prompt, and create material in ChatGPT or Gemini.</p></header>
    <div className="prompt-tracks" role="group" aria-label="Learning track">
      {tracks.map(track => <button key={track} aria-pressed={settings.track === track} onClick={() => change('track', track)}>{track}</button>)}
    </div>
    <div className="prompt-layout">
      <section className="workspace-panel prompt-controls" aria-label="Prompt settings">
        <label>Learner<select value={learnerId} onChange={event => setLearnerId(event.target.value)}>
          {!learners.length && <option value="">Class 4 learner</option>}
          {learners.map(item => <option key={item.id} value={item.id}>{item.name} · {item.stage}</option>)}
        </select></label>
        {!learners.length && <Link href="/learners">Add a learner for personalised prompts</Link>}
        {settings.track === 'Olympiad Prep'
          ? <p>SOF Mathematics Olympiad · Class 4 · Level 1</p>
          : <label>Target curriculum and level<select value={settings.curriculum} onChange={event => change('curriculum', event.target.value as PromptSettings['curriculum'])}>
            {Object.entries(curricula).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
          </select></label>}
        <p className="muted">First collection · Maths and Reasoning. Check the target level against your learner’s readiness.</p>
        <label>Topic<select value={settings.topic} onChange={event => change('topic', event.target.value as PromptSettings['topic'])}>{topics.map(item => <option key={item}>{item}</option>)}</select></label>
        <label>Material<select value={settings.material} onChange={event => change('material', event.target.value as PromptSettings['material'])}>{materials.map(item => <option key={item}>{item}</option>)}</select></label>
        {settings.track === 'Teaching Approaches' && <label>Teaching approach<select value={settings.approach} onChange={event => change('approach', event.target.value as PromptSettings['approach'])}>{approaches.map(item => <option key={item}>{item}</option>)}</select></label>}
        <div className="prompt-pair">
          <label>Difficulty<select value={settings.difficulty} onChange={event => change('difficulty', event.target.value as PromptSettings['difficulty'])}>{['Guided', 'Standard', 'Challenge'].map(item => <option key={item}>{item}</option>)}</select></label>
          <label>Minutes<select value={settings.minutes} onChange={event => change('minutes', event.target.value as PromptSettings['minutes'])}>{['15', '30', '45'].map(item => <option key={item}>{item}</option>)}</select></label>
        </div>
        <label>Output<select value={settings.format} onChange={event => change('format', event.target.value as PromptSettings['format'])}>{formats.map(item => <option key={item}>{item}</option>)}</select></label>
        <button className="btn-secondary" aria-pressed={isFavourite} onClick={toggleFavourite}>{isFavourite ? 'Remove favourite' : 'Save favourite'}</button>
        <p className="muted">Settings and favourites are saved on this device.</p>
      </section>
      <section className="workspace-panel prompt-preview" aria-label="Generated prompt">
        <h2>Your prompt</h2>
        <div className="prompt-actions">
          <button onClick={copy}>Copy prompt</button>
          <a className="btn-secondary" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">Open ChatGPT ↗</a>
          <a className="btn-secondary" href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer">Open Gemini ↗</a>
        </div>
        <p role="status" aria-live="polite">{message}</p>
        <textarea ref={preview} aria-label="Prompt to copy" readOnly value={prompt} />
        <details><summary>Curriculum sources</summary>
          <p>{settings.track === 'Olympiad Prep' ? 'The prompt asks for the current SOF syllabus and sample-paper format.' : curricula[settings.curriculum].edition}</p>
          <p>The AI must inspect the source and identify relevant objectives before creating material.</p>
          {sourceLinks.map((url, index) => <p key={url}><a href={url} target="_blank" rel="noopener noreferrer">{index === 1 ? 'Official sample papers' : 'Official curriculum or syllabus'} ↗</a></p>)}
        </details>
      </section>
    </div>
    {favourites.length > 0 && <section className="workspace-panel"><h2>Favourite prompts</h2><div className="prompt-favourites">
      {favourites.map((item, index) => <button className="btn-secondary" key={index} onClick={() => save(item)}>{item.track} · {item.topic} · {item.material} · {item.track === 'Olympiad Prep' ? 'SOF Class 4' : curricula[item.curriculum].label}</button>)}
    </div></section>}
  </main>;
}
