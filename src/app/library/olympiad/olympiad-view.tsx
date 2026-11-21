import ResourcePlanActions from '@/components/resource-plan-actions';
import Link from 'next/link';
import {
  olympiadClasses, olympiadFilters, olympiadPdfHref, olympiadProviders, olympiadSubjects,
  selectOlympiadResources, type OlympiadQuery,
} from '@/lib/olympiad/catalogue';

function OlympiadIcon({kind}:{kind:'medal'|'papers'}) {
 return <svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
  {kind==='medal'&&<><circle cx="12" cy="15" r="6"/><path d="m8 2 4 7 4-7M5 2l5 8M19 2l-5 8M12 12v6M9 15h6"/></>}
  {kind==='papers'&&<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>}
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
   <div className="olympiad-results-summary">
    <h2>Practice papers</h2>
    <span className="olympiad-class-label">{selected}</span>
    <p className="muted olympiad-summary" role="status">{resources.length} {resources.length === 1 ? 'resource' : 'resources'}</p>
   </div>
   <Link href="/library/olympiad?grade=all" className="olympiad-clear">View all resources</Link>
  </div>
  {resources.length === 0
   ? <section className="workspace-panel olympiad-empty"><h2>No matching resources</h2><p>Try another subject, class or organiser.</p><Link href="/library/olympiad?grade=all">Show all resources</Link></section>
   : <section className="olympiad-grid" aria-label="Olympiad papers">
    {resources.map(resource => {
     const gradeLabel = resource.grades.length === 1
      ? 'Class ' + resource.grades[0]
      : 'Classes ' + resource.grades.join(', ');
     const metadata = [
      resource.provider,
      filters.grade === 'all' ? gradeLabel : null,
      resource.pdfUrl ? resource.pages + (resource.pages === 1 ? ' page' : ' pages') : 'Practice collection',
      resource.pdfUrl && resource.hasAnswers ? 'Answers included' : null,
      resource.edition,
     ].filter(Boolean).join(' · ');

     return <article className="olympiad-card" key={resource.id} id={resource.id}>
      <div className="olympiad-paper">
       <span className="olympiad-card-icon"><OlympiadIcon kind="papers"/></span>
       <div>
        <h3>{resource.title}</h3>
        <p className="olympiad-paper-meta">{metadata}</p>
        {!resource.pdfUrl && <p className="olympiad-paper-meta">Free papers may require an account or purchase.</p>}
       </div>
      </div>
      <div className="olympiad-actions">
       {resource.pdfUrl && (preferExternal
        ? <a className="btn-primary" href={olympiadPdfHref(resource)} target="_blank" rel="noopener noreferrer">Open PDF ↗</a>
        : <Link className="btn-primary" href={olympiadPdfHref(resource, false)}>Read in app</Link>)}
       <a className={resource.pdfUrl ? 'olympiad-official-source' : 'btn-primary'} href={resource.sourceUrl} target="_blank" rel="noopener noreferrer">{resource.pdfUrl ? 'Official source ↗' : 'Browse official collection ↗'}</a>
       <details className="olympiad-more" name="olympiad-paper-actions">
        <summary aria-label={'More actions for ' + resource.title}>⋯</summary>
        <div className="olympiad-more-panel">
         <ResourcePlanActions resourceKey={'olympiad:'+resource.id}/>
         <details className="olympiad-verification"><summary>Link checked {resource.checkedOn}</summary><p>{resource.evidence}</p></details>
        </div>
       </details>
      </div>
     </article>;
    })}
   </section>}
  <p className="olympiad-source-note">{preferExternal ? 'Papers open from the organiser’s website.' : 'Papers open in the HomeSchool OS reader.'} Use the official source if a PDF link changes. Confirm the current exam syllabus and pattern before timed practice.</p>
 </main>;
}
