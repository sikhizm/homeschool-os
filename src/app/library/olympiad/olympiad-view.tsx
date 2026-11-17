import Link from 'next/link';
import {
  olympiadClasses, olympiadFilters, olympiadPdfHref, olympiadProviders, olympiadSubjects,
  selectOlympiadResources, type OlympiadQuery,
} from '@/lib/olympiad/catalogue';

export default function OlympiadView({ query, preferExternal = false }: { query: OlympiadQuery; preferExternal?: boolean }) {
  const filters = olympiadFilters(query);
  const resources = selectOlympiadResources(filters);
  return <main className="olympiad-page studio-stack">
    <nav className="global-crumbs" aria-label="Breadcrumb">
      <Link href="/library">Curriculum Library</Link><span>/</span><strong>Olympiad Resources</strong>
    </nav>
    <div className="olympiad-heading">
      <div><h1>Olympiad Resources</h1><p className="muted">Official sample papers and practice collections for Classes 1–10.</p></div>
      <Link className="btn-secondary" href="/library/prompts">Learning Prompts</Link>
    </div>
    <section className="workspace-panel" aria-label="Filter Olympiad resources">
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
        <button type="submit">Show resources</button>
      </form>
    </section>
    <p className="muted olympiad-summary" role="status">
      {resources.length} {resources.length === 1 ? 'resource' : 'resources'} · {filters.grade === 'all' ? 'Classes 1–10' : 'Class ' + filters.grade}
    </p>
    {resources.length === 0
      ? <section className="workspace-panel"><h2>No matching resources</h2><p>Try another subject or organiser.</p><Link href="/library/olympiad?grade=all">Show all resources</Link></section>
      : <section className="olympiad-grid" aria-label="Olympiad papers">
        {resources.map(resource => <article className="workspace-panel olympiad-card" key={resource.id} id={resource.id}>
          <p className="olympiad-provider">{resource.provider} · {resource.subject}</p>
          <h2>{resource.title}</h2>
          <p className="muted">{resource.grades.length === 1 ? 'Class ' + resource.grades[0] : 'Grades ' + resource.grades.join('–')}</p>
          <div className="olympiad-details">
            {resource.pdfUrl
              ? <p>{resource.pages} pages{resource.hasAnswers ? ' · Answers included' : ''}</p>
              : <p>Practice collection · Selected free papers. Some resources require an account or purchase.</p>}
            <p className="muted">{resource.edition ?? 'Paper year unspecified'}</p>
          </div>
          <div className="olympiad-actions">
            {resource.pdfUrl && (preferExternal
              ? <a className="btn-primary" href={olympiadPdfHref(resource)} target="_blank" rel="noopener noreferrer">Open PDF ↗</a>
              : <Link className="btn-primary" href={olympiadPdfHref(resource, false)}>Read in app</Link>)}
            <a className="btn-secondary" href={resource.sourceUrl} target="_blank" rel="noopener noreferrer">{resource.pdfUrl ? 'Official source ↗' : 'Browse official collection ↗'}</a>
          </div>
          <details className="olympiad-verification"><summary>Link checked {resource.checkedOn}</summary><p>{resource.evidence}</p></details>
        </article>)}
      </section>}
    <p className="muted">{preferExternal ? 'Papers open from the organiser’s website.' : 'Papers open in the HomeSchool OS reader.'} Use “Official source” if a PDF link changes. Check the current syllabus and exam pattern before timed practice.</p>
  </main>;
}
