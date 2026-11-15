import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import {
  earlyYearsScope, enrichmentStages, enrichmentTopics, filterEnrichment, sourceVerifiedOn,
} from '@/lib/curriculum/enrichment';

export const dynamic = 'force-dynamic';

type Query = { stage?: string | string[]; topic?: string | string[] };

export default async function EnrichmentPage({ searchParams }: { searchParams: Promise<Query> }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  const query = await searchParams;
  const stage = (Object.keys(enrichmentStages) as (keyof typeof enrichmentStages)[])
    .find(key => key === query.stage);
  const topic = (Object.keys(enrichmentTopics) as (keyof typeof enrichmentTopics)[])
    .find(key => key === query.topic);
  const { activities, resources } = filterEnrichment(stage, topic);
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

      <section className="workspace-panel" aria-labelledby="enrichment-filter">
        <h2 id="enrichment-filter">Find an activity</h2>
        <form action="/library/enrichment" method="get" className="library-filter-chips">
          <label>
            Stage{' '}
            <select name="stage" defaultValue={stage ?? ''}>
              <option value="">All stages</option>
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
        {(!stage || stage === 'class4') && (!topic || topic === 'reasoning') && (
          <p>Olympiad-style questions are optional and untimed. Ask the learner to show how they worked it out.</p>
        )}
        {activities.length === 0 && <p>No activities match these filters.</p>}
        <div className="library-grid">
          {activities.map(activity => (
            <article className="library-card card" key={activity.id} id={activity.id}>
              <p className="eyebrow">{enrichmentStages[activity.stage]} · {activity.minutes} min</p>
              <h3>{activity.title}</h3>
              <p><strong>Materials</strong> {activity.materials}</p>
              <p>{activity.prompt}</p>
              <details>
                <summary>Parent discussion and suggested response</summary>
                <p>{activity.discussion}</p>
              </details>
              <a href={'#source-' + activity.referenceId}>Related source</a>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-panel" aria-labelledby="enrichment-sources">
        <h2 id="enrichment-sources">Verified source catalogue</h2>
        <p className="muted">
          Source identity and stated scope checked on <time dateTime={sourceVerifiedOn}>15 November 2026</time>.
          Parents can preview external resources before sharing them.
        </p>
        {resources.length === 0 && <p>No sources match these filters.</p>}
        <div className="library-grid">
          {resources.map(resource => (
            <article className="library-card card" key={resource.id} id={'source-' + resource.id}>
              <span className="verify-badge verified">Source checked</span>
              <h3>{resource.title}</h3>
              <p>{resource.publisher} · {resource.sourceLocation}</p>
              <p>{resource.parentUse}</p>
              <a href={resource.url} rel="noreferrer">Open publisher source</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
