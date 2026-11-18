import Link from 'next/link';
import {
  earlyYearsScope, enrichmentStages, enrichmentTopics, filterEnrichment, resolveEnrichmentFilters,
  resourceVerificationLabels, type EnrichmentQuery, type EnrichmentStage,
} from '@/lib/curriculum/enrichment';

export default function EnrichmentView({ query }: { query: EnrichmentQuery }) {
  const { selectedStage, stage, topic } = resolveEnrichmentFilters(query);
  const { activities, resources } = filterEnrichment(stage, topic);
  const publishedMaterials = resources.filter(resource => /\.pdf(?:\?|$)/i.test(resource.url));
  const referenceOnly = resources.filter(resource => !/\.pdf(?:\?|$)/i.test(resource.url));
  const activityStages = (Object.keys(enrichmentStages) as EnrichmentStage[])
    .filter(key => activities.some(activity => activity.stage === key));
  const scopes = (['nursery', 'ukg'] as const).filter(key => !stage || stage === key);

  return (
    <main className="library-page studio-stack">
      <header className="dashboard-welcome">
        <div>
          <Link href="/library">Curriculum Library</Link>
          <h1>Supplementary resources and enrichment</h1>
          <p className="muted">
            Begin with <Link href="/ncert-books">NCERT textbooks</Link> for school-age learning.
            Pick an optional activity for a short parent-guided session when it suits your family.
          </p>
        </div>
      </header>

      <section className="workspace-panel" aria-labelledby="published-materials">
        <h2 id="published-materials">Books, PDFs and learning materials</h2>
        <p className="muted">Start with material you can use. Direct publisher PDFs are listed first; availability may vary. Use the publisher link when a document cannot be opened.</p>
        <div className="library-grid">
          {publishedMaterials.map(resource => (
            <article className="library-card card" key={resource.id} id={'source-' + resource.id}>
              <h3>{resource.title}</h3>
              <p><strong>For {resource.stages.map(key => enrichmentStages[key]).join(', ')}</strong></p>
              <p>{resource.publisher} · {resource.sourceLocation}</p>
              <p>{resource.parentUse}</p>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">Open material ↗</a>
              <details>
                <summary>Source and verification details</summary>
                <p>{resourceVerificationLabels[resource.verification.status]}</p>
                {resource.verification.lastVerifiedOn && <p>Last checked: {resource.verification.lastVerifiedOn}</p>}
                <p>{resource.verification.evidence}</p>
              </details>
            </article>
          ))}
        </div>
        {publishedMaterials.length === 0 && <p>No direct PDF materials match these filters.</p>}
      </section>

      <section className="workspace-panel" aria-labelledby="publisher-collections">
        <h2 id="publisher-collections">Browse textbook and activity collections</h2>
        <p className="muted">Publisher catalogues are useful when a stable, individually verified book PDF is not yet indexed.</p>
        <div className="library-grid">
          <article className="library-card card">
            <h3>Punjab Educare — E-Books</h3>
            <p>Punjab Educare · Class-wise textbook and learning-material catalogue</p>
            <p>Browse the publisher's e-books directory and select a class and subject. Individual book PDFs have not yet been checked for in-app reading.</p>
            <a href="https://www.punjabeducare.org/e-books/" target="_blank" rel="noopener noreferrer">Browse e-books collection ↗</a>
          </article>
          <article className="library-card card">
            <h3>Punjab Educare — Teacher activity handbooks</h3>
            <p>Punjab Educare · Teaching and activity resources</p>
            <p>Browse activity handbooks at the publisher. Direct document links are not yet individually verified.</p>
            <a href="https://www.punjabeducare.org/e-books/teacher-resource-materialactivity-handbook" target="_blank" rel="noopener noreferrer">Browse handbooks ↗</a>
          </article>
        </div>
      </section>

      <section className="workspace-panel" aria-labelledby="enrichment-filter">
        <h2 id="enrichment-filter">Find an activity</h2>
        <form action="/library/enrichment" method="get" className="library-filter-chips">
          <label>
            Stage{' '}
            <select name="stage" defaultValue={selectedStage || 'all'}>
              <option value="all">All stages</option>
              {Object.entries(enrichmentStages).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            Topic{' '}
            <select name="topic" defaultValue={topic ?? ''}>
              <option value="">All topics</option>
              {Object.entries(enrichmentTopics).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="library-chip">Apply filters</button>
          <Link href="/library/enrichment" className="library-chip">Clear filters</Link>
        </form>
      </section>

      {scopes.length > 0 && (!topic || topic === 'early-years') && (
        <section className="workspace-panel" aria-labelledby="early-years-title">
          <h2 id="early-years-title">Preschool and UKG learning scope</h2>
          <div className="library-grid">
            {scopes.map(key => (
              <article className="library-card card" key={key}>
                <h3>{enrichmentStages[key]}</h3>
                <p>{earlyYearsScope[key].focus}</p>
                <p>{earlyYearsScope[key].support}</p>
                <Link href={'/learning-pathways?grade=' + key}>Open the 36-week pathway</Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="workspace-panel" aria-labelledby="enrichment-activities">
        <h2 id="enrichment-activities">Original Homeschool OS activities</h2>
        <p className="muted">This activity collection currently covers Preschool / Nursery, UKG and Class 4.</p>
        {(!stage || stage === 'class4') && (!topic || topic === 'reasoning') && (
          <p>These original reasoning activities are optional and untimed. Ask the learner to show how they worked it out.</p>
        )}
        {activities.length === 0 && <p>No activities match these filters.</p>}
        {activityStages.map(key => (
          <section key={key} aria-labelledby={'activities-' + key}>
            <h3 id={'activities-' + key}>
              {enrichmentStages[key]}
              {topic === 'reasoning' && (key === 'class4' ? ' · Reasoning activities' : ' · Reasoning through play')}
            </h3>
            <div className="library-grid">
              {activities.filter(activity => activity.stage === key).map(activity => (
                <article className="library-card card" key={activity.id} id={activity.id}>
                  <p><strong>{enrichmentStages[activity.stage]}</strong> · {activity.minutes} min</p>
                  <h4>{activity.title}</h4>
                  <p><strong>Materials</strong> {activity.materials}</p>
                  <p>{activity.prompt}</p>
                  <details>
                    <summary>Parent discussion and suggested response</summary>
                    <p>{activity.discussion}</p>
                  </details>
                  {activity.referenceId && <a href={'#source-' + activity.referenceId}>Related source</a>}
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>

      <section className="workspace-panel" aria-labelledby="enrichment-sources">
        <h2 id="enrichment-sources">Additional publisher portals and references</h2>
        <p className="muted">Useful background sources without a direct indexed document are kept here. Verification notes are available on demand.</p>
        <div className="library-grid">
          {referenceOnly.map(resource => (
            <article className="library-card card" key={resource.id} id={'source-' + resource.id}>
              <h3>{resource.title}</h3>
              <p><strong>For {resource.stages.map(key => enrichmentStages[key]).join(', ')}</strong></p>
              <p>{resource.publisher} · {resource.sourceLocation}</p>
              <p>{resource.parentUse}</p>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">Browse publisher resource ↗</a>
              <details>
                <summary>Source and verification details</summary>
                <p>{resourceVerificationLabels[resource.verification.status]}</p>
                {resource.verification.lastVerifiedOn && <p>Last checked: {resource.verification.lastVerifiedOn}</p>}
                <p>{resource.verification.evidence}</p>
              </details>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
