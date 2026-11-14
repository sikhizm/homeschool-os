import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { PwaInstallButton } from '@/components/pwa-tools';
import SettingsActions from './settings-actions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const sql = getSql();
  const families = await sql`
    SELECT f.id, f.name, fm.role FROM families f JOIN family_members fm ON fm.family_id = f.id
    WHERE fm.auth_user_id = ${session.user.id}
    ORDER BY fm.created_at, fm.family_id LIMIT 1
  `;
  const family = families[0] ?? null;
  const learnerCount = family
    ? await sql`
        SELECT count(*) FILTER (WHERE archived_at IS NULL)::int AS active,
               count(*)::int AS total
        FROM learners WHERE family_id = ${family.id}
      `
    : [];
  const activeLearners = learnerCount[0] ? Number(learnerCount[0].active) : 0;
  const familyName = family ? String(family.name) : 'No family yet';
  const roleLabel = family ? String(family.role) : '—';

  return (
    <main className="settings-page studio-stack">
      <header className="studio-page-head">
        <div>
          <p className="eyebrow">SETTINGS &amp; PREFERENCES</p>
          <h1>Family &amp; app studio</h1>
          <p className="muted" style={{ margin: '6px 0 0' }}>
            Manage your family workspace, browser session, guided-time defaults and offline installation.
          </p>
        </div>
        <div className="family-home-head-right">
          <span className="family-avatar" aria-hidden="true">
            {familyName.trim().slice(0, 1).toUpperCase() || 'F'}
          </span>
          <span className="mode-chip" style={{ textTransform: 'capitalize' }}>
            {roleLabel === '—' ? 'Signed in' : `${roleLabel} access`}
          </span>
        </div>
      </header>

      <div className="settings-bento-grid">
        <section className="card settings-card" aria-labelledby="family-title">
          <div className="settings-card-head">
            <span className="settings-icon" style={{ background: 'var(--mint)' }} aria-hidden="true">⌂</span>
            <div>
              <p className="eyebrow" id="family-title" style={{ margin: 0 }}>FAMILY WORKSPACE</p>
              <h2>{familyName}</h2>
            </div>
          </div>
          <ul className="settings-list">
            <li>
              <strong>Your role</strong>
              <span style={{ textTransform: 'capitalize' }}>{roleLabel}</span>
            </li>
            <li>
              <strong>Active learners</strong>
              <span>{activeLearners}</span>
            </li>
            <li>
              <strong>Privacy</strong>
              <span>Scoped strictly to your family</span>
            </li>
          </ul>
          <div className="hero-actions">
            <Link className="hero-action-primary" href="/learners">
              Manage learners →
            </Link>
            {family && roleLabel === 'owner' && (
              <Link className="hero-action-secondary" href="/learners#add-learner">
                + Add learner
              </Link>
            )}
          </div>
        </section>

        <section className="card settings-card" aria-labelledby="account-title">
          <div className="settings-card-head">
            <span className="settings-icon" style={{ background: 'var(--math)' }} aria-hidden="true">✦</span>
            <div>
              <p className="eyebrow" id="account-title" style={{ margin: 0 }}>ACCOUNT &amp; SESSION</p>
              <h2 style={{ overflowWrap: 'anywhere' }}>{String(session.user.email ?? 'Signed in')}</h2>
            </div>
          </div>
          <p className="muted" style={{ margin: 0 }}>
            Signed in securely on this device. Signing out clears this browser session without altering any saved family records.
          </p>
          <ul className="settings-list">
            <li>
              <strong>Email</strong>
              <span style={{ overflowWrap: 'anywhere' }}>{String(session.user.email ?? '—')}</span>
            </li>
            <li>
              <strong>Session status</strong>
              <span>Authenticated</span>
            </li>
          </ul>
          <SettingsActions />
        </section>

        <section className="card settings-card" aria-labelledby="learning-title">
          <div className="settings-card-head">
            <span className="settings-icon" style={{ background: '#FBF0D9' }} aria-hidden="true">◷</span>
            <div>
              <p className="eyebrow" id="learning-title" style={{ margin: 0 }}>LEARNING RHYTHM</p>
              <h2>Daily pace &amp; recall</h2>
            </div>
          </div>
          <ul className="settings-list">
            <li>
              <strong>Daily guided budget</strong>
              <span>20 / 40 / 60 / 90 min shared across family</span>
            </li>
            <li>
              <strong>Daily planner</strong>
              <span>Automatic — one tap prepares tomorrow</span>
            </li>
            <li>
              <strong>Adaptive revision</strong>
              <span>Spaced recall adapted to check results</span>
            </li>
          </ul>
          <div className="hero-actions">
            <Link className="hero-action-secondary" href="/planning">
              Open Learning Plan
            </Link>
            <Link className="hero-action-secondary" href="/reports">
              Progress review
            </Link>
          </div>
        </section>

        <section className="card settings-card" aria-labelledby="app-title">
          <div className="settings-card-head">
            <span className="settings-icon" style={{ background: 'var(--language)' }} aria-hidden="true">❖</span>
            <div>
              <p className="eyebrow" id="app-title" style={{ margin: 0 }}>APP &amp; OFFLINE</p>
              <h2>Install Homeschool OS</h2>
            </div>
          </div>
          <p className="muted" style={{ margin: 0 }}>
            Install Homeschool OS on your desktop, tablet or phone for a distraction-free window and offline fallback support.
          </p>
          <div className="hero-actions" style={{ marginTop: 'auto' }}>
            <PwaInstallButton />
            <Link className="hero-action-secondary" href="/november-pilot">
              Pilot guide
            </Link>
            <Link className="hero-action-secondary" href="/roadmap">
              Platform roadmap
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
