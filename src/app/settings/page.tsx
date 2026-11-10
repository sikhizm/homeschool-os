import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {PwaInstallButton} from '@/components/pwa-tools';
import SettingsActions from './settings-actions';

export const dynamic='force-dynamic';

export default async function SettingsPage(){
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 const sql=getSql();
 const families=await sql`
  SELECT f.id,f.name,fm.role FROM families f JOIN family_members fm ON fm.family_id=f.id
  WHERE fm.auth_user_id=${session.user.id}
  ORDER BY fm.created_at,fm.family_id LIMIT 1
 `;
 const family=families[0]??null;
 const learnerCount=family?await sql`
  SELECT count(*)::int AS n FROM learners WHERE family_id=${family.id}
 `:[];
 return <main className="settings-page">
  <header className="learn-head">
   <div>
    <p className="eyebrow">Settings</p>
    <h1>Family &amp; app</h1>
    <p className="muted">Account, family details and app preferences. Records stay private to your family.</p>
   </div>
   <Link className="mode-switch" href="/dashboard">Back to home</Link>
  </header>

  <section className="card settings-card" aria-labelledby="account-title">
   <p className="tag" id="account-title">Account</p>
   <h2>{String(session.user.email??'Signed in')}</h2>
   <p className="muted">Signed in on this device. Signing out removes the session from this browser only.</p>
   <SettingsActions/>
  </section>

  <section className="card settings-card" aria-labelledby="family-title">
   <p className="tag" id="family-title">Family</p>
   <h2>{family?String(family.name):'No family yet'}</h2>
   <ul className="settings-list">
    <li><strong>Role</strong><span>{family?String(family.role):'—'}</span></li>
    <li><strong>Learners</strong><span>{learnerCount[0]?Number(learnerCount[0].n):0}</span></li>
    <li><strong>Email</strong><span>{String(session.user.email??'—')}</span></li>
   </ul>
    <div className="hero-actions">
     <Link className="hero-action-secondary" href="/learners">Manage learners</Link>
     {family&&String(family.role)==='owner'&&<Link className="hero-action-secondary" href="/dashboard">Add a learner</Link>}
    </div>
  </section>

  <section className="card settings-card" aria-labelledby="app-title">
   <p className="tag" id="app-title">App</p>
   <h2>Install &amp; offline</h2>
   <p className="muted">Homeschool OS installs like a native app and keeps working offline for saved pages.</p>
   <div className="hero-actions">
    <PwaInstallButton/>
    <Link className="hero-action-secondary" href="/november-pilot">Pilot guide</Link>
    <Link className="hero-action-secondary" href="/roadmap">Roadmap</Link>
   </div>
  </section>

  <section className="card settings-card" aria-labelledby="learning-title">
   <p className="tag" id="learning-title">Learning</p>
   <h2>Preferences</h2>
   <ul className="settings-list">
    <li><strong>Daily guided budget</strong><span>20 / 40 / 60 / 90 minutes, shared across the family</span></li>
    <li><strong>Planner</strong><span>Automatic — one tap prepares the next day</span></li>
    <li><strong>Revision</strong><span>Spaced recall at 1, 4 and 10 days</span></li>
   </ul>
   <div className="hero-actions">
    <Link className="hero-action-secondary" href="/planning">Open planner</Link>
    <Link className="hero-action-secondary" href="/reports">Progress reports</Link>
   </div>
  </section>
 </main>;
}
