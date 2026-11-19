'use client';

import Link from 'next/link';
import { useRef, useState, useSyncExternalStore } from 'react';
import {
  approaches, buildLearningPrompt, curricula, defaultSettings, formats, materials,
  topicsForSettings, tracks, readPromptSettings, updatePromptSettings, type PromptSettings,
} from '@/lib/learning-prompts';

import { olympiadSourcesFor, promptClasses, promptClassForStage } from '@/lib/olympiad/prompt-classes';

type Learner = { id: string; name: string; stage: string; mathsLevel?: number };
type BuilderProps = { learners: Learner[]; storageKey: string; entry?: {learner?: string; grade?: string; topic?: string} };
const subscribe = () => () => {};
export default function PromptBuilder(props: BuilderProps) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? <LoadedBuilder key={JSON.stringify([props.storageKey, props.entry?.learner, props.entry?.grade, props.entry?.topic])} {...props} /> : <p role="status">Loading learning prompts…</p>;
}
function LoadedBuilder({ learners, storageKey, entry }: BuilderProps) {
  const [saved] = useState(() => {
    const initialSettings = updatePromptSettings(defaultSettings, { targetClass: promptClassForStage(learners[0]?.mathsLevel ? 'Class '+learners[0].mathsLevel : learners[0]?.stage ?? '') ?? '4' });
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
      const restored = readPromptSettings(value?.settings);
      const restoredSettings = restored && !('targetClass' in value.settings)
        ? updatePromptSettings(restored, { targetClass: initialSettings.targetClass })
        : restored;
      return {
        settings: restoredSettings ?? initialSettings,
        favourites: Array.isArray(value?.favourites) ? value.favourites.map(readPromptSettings).filter((item: PromptSettings | null): item is PromptSettings => item !== null).slice(0, 20) : [],
      };
    } catch { return { settings: initialSettings, favourites: [] as PromptSettings[] }; }
  });
  const [settings, setSettings] = useState<PromptSettings>(() => {
    const targetClass=promptClassForStage("Class "+entry?.grade);
    const topic=entry?.topic;
    return targetClass && topic ? updatePromptSettings(saved.settings,{track:"Olympiad Prep",targetClass,topic}) : saved.settings;
  });
  const [learnerId, setLearnerId] = useState(learners.find(l=>l.id===entry?.learner)?.id ?? learners[0]?.id ?? '');
  const [favourites, setFavourites] = useState<PromptSettings[]>(saved.favourites);
  const [message, setMessage] = useState('');
  const preview = useRef<HTMLTextAreaElement>(null);
  const learner = learners.find(item => item.id === learnerId) ?? { name: 'Learner', stage: '' };
  const mathsLevel = learners.find(item=>item.id===learnerId)?.mathsLevel;
  const prompt = buildLearningPrompt(settings, learner);
  function save(next: PromptSettings, savedFavourites = favourites) {
    setSettings(next);
    setMessage('');
    try { localStorage.setItem(storageKey, JSON.stringify({ settings: next, favourites: savedFavourites })); }
    catch { setMessage('Device storage is unavailable. Copy your prompt before leaving.'); }
  }
  function change<Key extends keyof PromptSettings>(key: Key, value: PromptSettings[Key]) {
    save(updatePromptSettings(settings, { [key]: value }));
  }
  function selectLearner(id: string) {
    setLearnerId(id);
    const selected = learners.find(item => item.id === id);
    const targetClass = promptClassForStage(selected?.mathsLevel ? 'Class '+selected.mathsLevel : selected?.stage ?? '');
    if (targetClass) save(updatePromptSettings(settings, { targetClass }));
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
  const sourceLinks = settings.track === 'Olympiad Prep' ? olympiadSourcesFor(settings.targetClass) : [curricula[settings.curriculum].url];
  return <main className="learning-prompts studio-stack">
    <nav aria-label="Breadcrumb"><Link href="/library">Curriculum Library</Link> / Learning Prompts</nav>
    <header><h1>Learning Prompts</h1><p className="muted">Choose a learning goal, copy your prompt, and create material in ChatGPT or Gemini.</p></header>
    <div className="prompt-tracks" role="group" aria-label="Learning track">
      {tracks.map(track => <button key={track} aria-pressed={settings.track === track} onClick={() => change('track', track)}>{track}</button>)}
    </div>
    <div className="prompt-layout">
      <section className="workspace-panel prompt-controls" aria-label="Prompt settings">
        <label>Learner<select value={learnerId} onChange={event => selectLearner(event.target.value)}>
          {!learners.length && <option value="">No learner selected</option>}
          {learners.map(item => <option key={item.id} value={item.id}>{item.name} · {item.stage}</option>)}
        </select></label>
        {!learners.length && <Link href="/learners">Add a learner for personalised prompts</Link>}
        {settings.track === 'Olympiad Prep'
          ? <label>Target class<select value={settings.targetClass} onChange={event => change('targetClass', event.target.value as PromptSettings['targetClass'])}>
            {promptClasses.map(grade => <option key={grade} value={grade}>Class {grade}</option>)}
          </select><span className="muted">SOF Mathematics Olympiad · Level 1</span></label>
          : <label>Target curriculum and level<select value={settings.curriculum} onChange={event => change('curriculum', event.target.value as PromptSettings['curriculum'])}>
            {Object.entries(curricula).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
          </select></label>}
        <p className="muted">{settings.track === 'Olympiad Prep' ? 'Classes 1–10 · Maths and Reasoning. The target class can be adjusted for revision or challenge work.' : 'Year / Grade 4 collection · Maths and Reasoning. Check the target level against your learner’s readiness.'}</p>
        {mathsLevel&&settings.track==='Olympiad Prep'&&<button className="btn-secondary" onClick={()=>save(updatePromptSettings(settings,{targetClass:String(mathsLevel) as PromptSettings['targetClass']}))}>Use saved Maths level · Class {mathsLevel}</button>}
        <p className="muted">Selecting a learner uses their parent-set Mathematics level when available. Saved settings and the target selector let you override it.</p>
        <label>Topic<select value={settings.topic} onChange={event => change('topic', event.target.value as PromptSettings['topic'])}>{topicsForSettings(settings).map(item => <option key={item}>{item}</option>)}</select></label>
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
      {favourites.map((item, index) => <button className="btn-secondary" key={index} onClick={() => save(item)}>{item.track} · {item.topic} · {item.material} · {item.track === 'Olympiad Prep' ? 'SOF Class ' + item.targetClass : curricula[item.curriculum].label}</button>)}
    </div></section>}
  </main>;
}
