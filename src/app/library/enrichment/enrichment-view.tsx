import Link from 'next/link';
import {
  earlyYearsScope, enrichmentStages, enrichmentTopics, filterEnrichment, resolveEnrichmentFilters,
  resourceVerificationLabels, type EnrichmentQuery, type EnrichmentStage,
} from '@/lib/curriculum/enrichment';

export default function EnrichmentView({ query }: { query: EnrichmentQuery }) {
  const { selectedStage, stage, topic } = resolveEnrichmentFilters(query);
  const { activities, resources } = filterEnrichment(stage, topic);
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

      <section className="workspace-panel" aria-labelledby="olympiad-destination">
        <h2 id="olympiad-destination">Olympiad preparation · Classes 1–10</h2>
        <p>Find official sample papers by class, subject and organiser in Olympiad Resources, or create Maths and Reasoning practice with Learning Prompts.</p>
        <div className="library-filter-chips">
          <Link href="/library/olympiad?grade=all" className="library-chip">Browse Olympiad resources</Link>
          <Link href="/library/prompts" className="library-chip">Open Learning Prompts</Link>
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
        <h2 id="enrichment-sources">Supplementary source catalogue</h2>
        <p className="muted">Check the intended stage and link status before sharing a source.</p>
        {resources.length === 0 && <p>No sources match these filters.</p>}
        <div className="library-grid">
          {resources.map(resource => (
            <article className="library-card card" key={resource.id} id={'source-' + resource.id}>
              <h3>{resource.title}</h3>
              <p><strong>For {resource.stages.map(key => enrichmentStages[key]).join(', ')}</strong></p>
              <p>{resource.publisher} · {resource.sourceLocation}</p>
              <span className={'verify-badge ' + (resource.verification.status === 'verified' ? 'verified' : 'pending')}>
                {resourceVerificationLabels[resource.verification.status]}
              </span>
              {resource.verification.lastVerifiedOn && (
                <p>Last verified <time dateTime={resource.verification.lastVerifiedOn}>
                  {resource.verification.lastVerifiedOn}
                </time></p>
              )}
              <p>{resource.verification.evidence}</p>
              <p>{resource.parentUse}</p>
              {resource.verification.status === 'broken' ? (
                <p>Publisher link unavailable. The activity above remains available.</p>
              ) : (
                <a href={resource.url} rel="noreferrer">
                  {resource.verification.status === 'verified' ? 'Open publisher source' : 'Try publisher source'}
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
