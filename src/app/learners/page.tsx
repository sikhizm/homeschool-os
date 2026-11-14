import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import LearnerForm from '../dashboard/learner-form';
import { learnerTier, tierLabel, type LearnerTier } from '@/lib/learner-tier';
import LearnerArchiveAction from './learner-archive-action';

export const dynamic = 'force-dynamic';

const AVATAR_TINTS = ['#DDEBFF', '#D9F1EA', '#EAE5FF', '#FCE9DD'] as const;
const TIER_GUIDANCE: Record<LearnerTier, string> = {
  toddler: 'Responsive care, conversation and screen-free play with a parent.',
  preschool: 'Playful hands-on discovery, stories and gentle practical-life activities.',
  'early-primary': 'Short parent-guided steps in reading, counting and curious exploration.',
  independent: 'Chapter-first study sessions, recall checks and personal learning paths.',
};

export default async function LearnersPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const sql = getSql();
  const families = await sql`
    SELECT f.id, f.name, fm.role FROM families f JOIN family_members fm ON fm.family_id = f.id
    WHERE fm.auth_user_id = ${session.user.id}
    ORDER BY fm.created_at, fm.family_id LIMIT 1
  `;
  if (!families.length) redirect('/dashboard');
  const family = families[0];
  const isOwner = String(family.role) === 'owner';
  const learners = await sql`
    SELECT id::text AS id, display_name, stage FROM learners
    WHERE family_id = ${family.id} AND archived_at IS NULL ORDER BY created_at, id
  `;
  const archived = await sql`
    SELECT id::text AS id, display_name, stage FROM learners
    WHERE family_id = ${family.id} AND archived_at IS NOT NULL ORDER BY archived_at DESC, id
  `;

  return (
    <main className="learners-page studio-stack">
      <header className="studio-page-head">
        <div>
          <p className="eyebrow">FAMILY LEARNERS · {String(family.name || 'Family').toUpperCase()}</p>
          <h1>Everyone learning here</h1>
          <p className="muted" style={{ margin: '6px 0 0' }}>
            Each learner keeps their own age-adapted space, learning path, portfolio and private records.
          </p>
        </div>
        <div className="family-home-head-right">
          <span className="mode-chip">
            {learners.length} active {learners.length === 1 ? 'learner' : 'learners'}
          </span>
          {isOwner && (
            <a className="mode-switch" href="#add-learner">
              + Add learner
            </a>
          )}
        </div>
      </header>

      {learners.length > 0 ? (
        <div className="family-learner-grid">
          {learners.map((learner, index) => {
            const id = String(learner.id);
            const name = String(learner.display_name);
            const stage = String(learner.stage || 'Early Years');
            const tier = learnerTier(stage);
            return (
              <article className="family-learner-card card learner-studio-card" key={id}>
                <header>
                  <span
                    className="learner-avatar"
                    style={{ background: AVATAR_TINTS[index % AVATAR_TINTS.length] }}
                    aria-hidden="true"
                  >
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <h3>{name}</h3>
                    <p>{stage}</p>
                  </div>
                  <span className="pill">{stage}</span>
                </header>

                <p className="revision-state state-practising">
                  <span aria-hidden="true">◐</span>
                  <strong>{tierLabel(tier)}</strong>
                  <span className="revision-hint">{TIER_GUIDANCE[tier]}</span>
                </p>

                <div className="learner-quick-links" aria-label={`${name} spaces`}>
                  <Link href={`/learn/path?learner=${encodeURIComponent(id)}`}>Learning path →</Link>
                  <Link href="/portfolio">Portfolio →</Link>
                  <Link href={`/reports?learner=${encodeURIComponent(id)}`}>Progress review →</Link>
                </div>

                <footer className="learner-card-footer">
                  <Link className="learner-continue" href={`/learn?learner=${encodeURIComponent(id)}`}>
                    Learner home <span aria-hidden="true">→</span>
                  </Link>
                  {isOwner && <LearnerArchiveAction id={id} name={name} />}
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="workspace-panel workspace-empty">
          <h3>No active learners yet</h3>
          <p>Add your first learner below to prepare age-appropriate lessons, paths and observations.</p>
        </section>
      )}

      {isOwner && (
        <section id="add-learner" className="workspace-panel learner-add-studio" aria-labelledby="add-learner-title">
          <div className="learner-add-copy">
            <span className="eyebrow">NEW LEARNER PROFILE</span>
            <h2 id="add-learner-title">Add another learner</h2>
            <p className="muted">
              Only a display name and learning stage are needed. Homeschool OS automatically adapts their space, books and daily rhythm while keeping all records private to your family.
            </p>
          </div>
          <div className="learner-add-form-wrap">
            <LearnerForm />
          </div>
        </section>
      )}

      {isOwner && archived.length > 0 && (
        <details className="workspace-panel studio-disclosure">
          <summary>
            <div>
              <strong>Archived learners ({archived.length})</strong>
              <small>Hidden from active learning spaces; history is preserved and can be restored anytime</small>
            </div>
            <span className="disclosure-pill" aria-hidden="true">Expand ⌄</span>
          </summary>
          <div className="studio-disclosure-body">
            <div className="family-learner-grid">
              {archived.map((learner) => (
                <article className="family-learner-card card" key={String(learner.id)}>
                  <header>
                    <span className="learner-avatar" style={{ background: '#ECEFE9' }} aria-hidden="true">
                      {String(learner.display_name).slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <h3>{String(learner.display_name)}</h3>
                      <p>{String(learner.stage || 'Early Years')} · Archived</p>
                    </div>
                  </header>
                  <footer className="learner-card-footer">
                    <LearnerArchiveAction
                      id={String(learner.id)}
                      name={String(learner.display_name)}
                      archived
                    />
                  </footer>
                </article>
              ))}
            </div>
          </div>
        </details>
      )}
    </main>
  );
}
