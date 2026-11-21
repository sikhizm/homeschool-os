import ResourcePlanActions from '@/components/resource-plan-actions';
import Link from 'next/link';
import {
  olympiadClasses, olympiadFilters, olympiadPdfHref, olympiadProviders, olympiadSubjects,
  selectOlympiadResources, type OlympiadQuery,
} from '@/lib/olympiad/catalogue';

function OlympiadIcon({kind}:{kind:'medal'|'papers'|'filter'|'book'|'clock'|'check'|'external'}) {
 return <svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
  {kind==='medal'&&<><circle cx="12" cy="15" r="6"/><path d="m8 2 4 7 4-7M5 2l5 8M19 2l-5 8M12 12v6M9 15h6"/></>}
  {kind==='papers'&&<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>}
  {kind==='filter'&&<><path d="M3 5h18M7 12h10M10 19h4"/><circle cx="8" cy="5" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/></>}
  {kind==='book'&&<><path d="M12 6c-3-2-6-2.5-10-2v15c4-.5 7 0 10 2M12 6c3-2 6-2.5 10-2v15c-4-.5-7 0-10 2M12 6v15"/></>}
  {kind==='clock'&&<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></>}
  {kind==='check'&&<path d="m4 12 5 5L20 6"/>}
  {kind==='external'&&<><path d="M13 5h6v6M19 5l-9 9M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></>}
 </svg>;
}

export default function OlympiadView({ query, preferExternal = false }: { query: OlympiadQuery; preferExternal?: boolean }) {
 const filters = olympiadFilters(query);
 const resources = selectOlympiadResources(filters);
 const selected = filters.grade === 'all' ? 'Classes 1–10' : 'Class ' + filters.grade;
 return <main className="olympiad-page studio-stack">
  <nav className="global-crumbs" aria-label="Breadcrumb">
   <Link href="/library">Curriculum Library</Link><span>/</span><strong>Olympiad Resources</strong>
  </nav>
  <header className="olympiad-hero">
   <div className="olympiad-hero-copy">
    <span className="eyebrow">PRACTICE LIBRARY · OFFICIAL SOURCES</span>
    <h1>Olympiad resources</h1>
    <p>Find sample papers, practise at your learner’s level and keep the next step in your weekly learning plan.</p>
    <div className="olympiad-hero-links">
     <Link href="/library/prompts" className="olympiad-hero-action">Create a practice prompt <span aria-hidden="true">→</span></Link>
     <span className="olympiad-hero-note">Classes 1–10 · Maths, Science, English &amp; Reasoning</span>
    </div>
   </div>
   <div className="olympiad-hero-art" aria-hidden="true">
    <span className="olympiad-art-sun" />
    <span className="olympiad-art-paper"><OlympiadIcon kind="papers"/><span/><span/><span/></span>
    <span className="olympiad-art-medal"><OlympiadIcon kind="medal"/></span>
    <span className="olympiad-art-star">✦</span>
   </div>
  </header>
  <section className="olympiad-filter-card" aria-label="Filter Olympiad resources">
   <div className="olympiad-filter-heading">
    <span className="olympiad-filter-icon"><OlympiadIcon kind="filter"/></span>
    <div><h2>Find practice papers</h2><p>Choose your class, subject and organiser.</p></div>
   </div>
   <form action="/library/olympiad" method="get" className="olympiad-filters">
    <label>Class<select name="grade" defaultValue={filters.grade}>
     <option value="all">All classes</option>
     {olympiadClasses.map(grade => <option key={grade} value={grade}>Class {grade}</option>)}
    </select></label>
    <label>Subject<select name="subject" defaultValue={filters.subject}>
     <option value="">All subjects</option>
     {olympiadSubjects.map(subject => <option key={subject}>{subject}</option>)}
    </select></label>
    <label>Organiser<select name="provider" defaultValue={filters.provider}>
     <option value="">All organisers</option>
     {olympiadProviders.map(provider => <option key={provider}>{provider}</option>)}
    </select></label>
    <label>Search<input type="search" name="q" defaultValue={filters.q} maxLength={100} placeholder="Paper or organiser" /></label>
    <button type="submit">Show resources <span aria-hidden="true">→</span></button>
   </form>
  </section>
  <div className="olympiad-results-heading">
   <div>
    <span className="eyebrow">AVAILABLE MATERIALS</span>
    <h2>Practice papers <span className="olympiad-count">{resources.length}</span></h2>
    <p className="muted olympiad-summary" role="status">{resources.length} {resources.length === 1 ? 'resource' : 'resources'} · {selected}</p>
   </div>
   <Link href="/library/olympiad?grade=all" className="olympiad-clear">View all resources</Link>
  </div>
  {resources.length === 0
   ? <section className="workspace-panel olympiad-empty"><h2>No matching resources</h2><p>Try another subject, class or organiser.</p><Link href="/library/olympiad?grade=all">Show all resources</Link></section>
   : <section className="olympiad-grid" aria-label="Olympiad papers">
    {resources.map(resource => <article className="olympiad-card" key={resource.id} id={resource.id}>
     <div className="olympiad-card-top">
      <span className="olympiad-card-icon"><OlympiadIcon kind="papers"/></span>
      <div className="olympiad-card-tags"><span className="olympiad-provider">{resource.provider}</span><span className="olympiad-subject">{resource.subject}</span></div>
     </div>
     <h3>{resource.title}</h3>
     <p className="olympiad-grade">{resource.grades.length === 1 ? 'Class ' + resource.grades[0] : 'Grades ' + resource.grades.join('–')}</p>
     <div className="olympiad-details">
      {resource.pdfUrl
       ? <><span><OlympiadIcon kind="book"/>{resource.pages} pages</span>{resource.hasAnswers && <span><OlympiadIcon kind="check"/>Answers included</span>}</>
       : <span className="olympiad-collection-note">Practice collection · Free papers may require an account or purchase</span>}
     </div>
     <p className="olympiad-edition"><OlympiadIcon kind="clock"/>{resource.edition ?? 'Paper year unspecified'}</p>
     <div className="olympiad-actions">
      {resource.pdfUrl && (preferExternal
       ? <a className="btn-primary" href={olympiadPdfHref(resource)} target="_blank" rel="noopener noreferrer">Open PDF ↗</a>
       : <Link className="btn-primary" href={olympiadPdfHref(resource, false)}>Read in app</Link>)}
      <a className="btn-secondary" href={resource.sourceUrl} target="_blank" rel="noopener noreferrer">{resource.pdfUrl ? 'Official source ↗' : 'Browse official collection ↗'}</a>
     </div>
     <ResourcePlanActions resourceKey={'olympiad:'+resource.id}/>
     <details className="olympiad-verification"><summary>Link checked {resource.checkedOn}</summary><p>{resource.evidence}</p></details>
    </article>)}
   </section>}
  <p className="olympiad-source-note">{preferExternal ? 'Papers open from the organiser’s website.' : 'Papers open in the HomeSchool OS reader.'} Use the official source if a PDF link changes. Confirm the current exam syllabus and pattern before timed practice.</p>
 </main>;
}
