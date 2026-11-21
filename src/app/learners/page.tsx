import FamilyWorkflow from '@/components/family-workflow';
import Link from 'next/link';
import Image from 'next/image';
import LearnerIcon from '@/components/learner-ui-icon';
import { subjects } from '@/lib/family-workflow/model';
import './learners.css';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import LearnerForm from '../dashboard/learner-form';
import { learnerTier, tierLabel, type LearnerTier } from '@/lib/learner-tier';
import LearnerArchiveAction from './learner-archive-action';
import LearnerEditAction from './learner-edit-action';

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
    <main className="learners-page studio-stack learners-redesign">
      <header className="studio-page-head learners-hero">
        <div className="learners-hero-copy">
          <p className="eyebrow">FAMILY LEARNERS · {String(family.name || 'Family').toUpperCase()}</p>
          <h1>Everyone learning here</h1>
          <p className="muted">
            Every learner has their own learning path, portfolio, progress and private records.
          </p>
        </div>
        <Image
          src="/illustrations/family-learners.svg"
          alt=""
          aria-hidden="true"
          width={440}
          height={220}
          className="learners-hero-art"
          priority
        />
        <div className="learners-hero-actions">
          <span className="mode-chip"><LearnerIcon name="users"/> {learners.length} active {learners.length === 1 ? 'learner' : 'learners'}</span>
          {isOwner && <a className="mode-switch" href="#add-learner"><span aria-hidden="true">＋</span> Add learner</a>}
        </div>
      </header>
      <div className="learners-summary-strip" aria-label="Family learning overview">
        <div className="learners-summary-item">
          <span className="learners-summary-icon is-blue"><LearnerIcon name="users"/></span>
          <div><strong>{learners.length}</strong><small>Active {learners.length === 1 ? 'learner' : 'learners'}</small></div>
        </div>
        <div className="learners-summary-item">
          <span className="learners-summary-icon is-violet"><LearnerIcon name="book"/></span>
          <div><strong>{subjects.length}</strong><small>Subjects available for level selection</small></div>
        </div>
        <div className="learners-summary-item">
          <span className="learners-summary-icon is-mint"><LearnerIcon name="path"/></span>
          <div><strong>Personal learning paths</strong><small>Separate for every learner</small></div>
        </div>
      </div>

      {learners.length > 0 ? (
        <div className="family-learner-grid learners-profile-grid">
          {learners.map((learner, index) => {
            const id = String(learner.id);
            const name = String(learner.display_name);
            const stage = String(learner.stage || 'Early Years');
            const tier = learnerTier(stage);
            return (
              <article className="family-learner-card card learner-studio-card learner-profile-card" key={id}>
                <header className="learner-profile-header">
                  <span
                    className="learner-avatar"
                    style={{ background: AVATAR_TINTS[index % AVATAR_TINTS.length] }}
                    aria-hidden="true"
                  >
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="learner-profile-title">
                    <h3>{name}</h3>
                    <span className="learner-stage-pill">{stage}</span>
                  </div>
                  <span className="learner-profile-decor" aria-hidden="true">
                    <LearnerIcon name={tier === 'independent' ? 'cap' : 'sprout'}/>
                  </span>
                </header>

                <div className="learner-tier-band">
                  <span className="learner-tier-icon"><LearnerIcon name={tier === 'independent' ? 'cap' : 'sprout'}/></span>
                  <div>
                    <strong>{tierLabel(tier)}</strong>
                    <p>{TIER_GUIDANCE[tier]}</p>
                  </div>
                </div>

                <div className="learner-quick-links" aria-label={`${name} spaces`}>
                  <Link href={`/learn/path?learner=${encodeURIComponent(id)}`}><LearnerIcon name="book"/><span>Learning path</span></Link>
                  <Link href="/portfolio"><LearnerIcon name="folder"/><span>Portfolio</span></Link>
                  <Link href={`/reports?learner=${encodeURIComponent(id)}`}><LearnerIcon name="chart"/><span>Progress review</span></Link>
                  <Link href={`/learners/${encodeURIComponent(id)}/study-library`}><LearnerIcon name="layers"/><span>Study library</span></Link>
                </div>

                <footer className="learner-card-footer">
                  <Link className="learner-continue" href={`/learn?learner=${encodeURIComponent(id)}`}>
                    <LearnerIcon name="home"/> Learner home <span aria-hidden="true">→</span>
                  </Link>
                  {isOwner && (
                    <div className="learner-card-actions">
                      <LearnerEditAction id={id} name={name} stage={stage} />
                      <LearnerArchiveAction id={id} name={name} />
                    </div>
                  )}
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

      <nav className="learners-tools" aria-label="Family learning tools">
        <div className="learners-tools-heading">
          <span className="learners-tools-icon"><LearnerIcon name="layers"/></span>
          <div><h2>Family learning tools</h2><p className="muted">Plan and review learning across your family.</p></div>
        </div>
        <div className="learners-tools-links">
          <Link href="/planning"><LearnerIcon name="calendar"/> Weekly planner</Link>
          <a href="#family-workflow"><LearnerIcon name="target"/> Subject levels</a>
          <Link href="/ncert-books/my-books"><LearnerIcon name="book"/> My Books</Link>
          <Link href="/reports"><LearnerIcon name="chart"/> Family progress</Link>
        </div>
      </nav>
      <div className="learners-subject-section">
        <FamilyWorkflow initialView="levels" />
      </div>

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
