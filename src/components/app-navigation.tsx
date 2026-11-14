'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useSyncExternalStore,type ReactNode} from 'react';
import {
 activeShellDestination,bottomDestinations,isPrivateRoute,navigationForPath,
 navigationLinkIsActive,shellDestinationIsActive,sidebarDestinations,
} from '@/lib/navigation';
import {PwaInstallButton} from '@/components/pwa-tools';

const COLLAPSE_KEY='homeschool-os-sidebar-collapsed';
const COLLAPSE_EVENT='homeschool-os-sidebar-toggle';

function subscribeToCollapse(callback:()=>void){
 window.addEventListener(COLLAPSE_EVENT,callback);
 window.addEventListener('storage',callback);
 return()=>{
  window.removeEventListener(COLLAPSE_EVENT,callback);
  window.removeEventListener('storage',callback);
 };
}
function readCollapsed(){
 try{return localStorage.getItem(COLLAPSE_KEY)==='1';}catch{return false;}
}
function serverCollapsed(){return false;}

function NavGlyph({id,fallback}:{id:string;fallback:string}){
 switch(id){
  case 'home':
   return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V9.5"/><path d="M9.5 20.5v-6h5v6"/></svg>;
  case 'plan':
   return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M8 3v3M16 3v3M3.5 9.5h17"/><path d="M8 14h3M13 14h3M8 17.5h5"/></svg>;
  case 'learners':
   return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8.5" r="3.5"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9.5" r="2.5"/><path d="M15.5 19.5a4.5 4.5 0 0 1 5-4.4"/></svg>;
  case 'library':
   return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22.5V5.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5a2.5 2.5 0 0 1 2.5 2.5V5.5Z"/></svg>;
  case 'progress':
   return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5h16"/><path d="M6.5 15.5l4-4 3 3 4.5-5.5"/><path d="M15 9h3v3"/></svg>;
  case 'portfolio':
   return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.2 4.8L19 10l-4.8 2.2L12 17l-2.2-4.8L5 10l4.8-2.2L12 3Z"/><path d="M18.5 16.5l.9 1.9 1.9.9-1.9.9-.9 1.9-.9-1.9-1.9-.9 1.9-.9.9-1.9Z"/></svg>;
  case 'settings':
   return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.08a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>;
  case 'learn':
   return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 4 20 12 6 20 6 4"/></svg>;
  default:
   return <>{fallback}</>;
 }
}

/**
 * Authenticated application shell: a compact collapsible sidebar on desktop
 * and a fixed bottom navigation bar on mobile. Public routes render bare.
 */
export default function AppNavigation({children}:{children:ReactNode}){
 const pathname=usePathname()||'';
 const collapsed=useSyncExternalStore(subscribeToCollapse,readCollapsed,serverCollapsed);
 function toggle(){
  try{localStorage.setItem(COLLAPSE_KEY,readCollapsed()?'0':'1');}catch{}
  window.dispatchEvent(new Event(COLLAPSE_EVENT));
 }
 if(!isPrivateRoute(pathname))return <>{children}</>;
 const {context}=navigationForPath(pathname);
 const activeSidebar=activeShellDestination(pathname,sidebarDestinations);
 const activeBottom=activeShellDestination(pathname,bottomDestinations);
 const inLearnerMode=pathname==='/learn'||pathname.startsWith('/learn/');
 return <div className={collapsed?'app-shell is-collapsed':'app-shell'}>
  <aside className="app-sidebar">
   <div className="app-sidebar-head">
    <Link className="app-brand" href="/dashboard" aria-label="Homeschool OS dashboard">
     <span className="brand-mark" aria-hidden="true">✦</span>
     <span className="brand-copy"><strong>Homeschool<span>OS</span></strong><small>Grow together, every day</small></span>
    </Link>
    <button type="button" className="app-sidebar-toggle" onClick={toggle}
     aria-expanded={!collapsed} aria-label={collapsed?'Expand navigation':'Collapse navigation'}>
     <span aria-hidden="true">{collapsed?'»':'«'}</span>
    </button>
   </div>
   <nav className="app-primary-nav" aria-label="Primary navigation">
    {sidebarDestinations.map(destination=>{
     const active=shellDestinationIsActive(pathname,destination);
     return <Link key={destination.id} href={destination.href}
      className={active?'app-nav-link is-active':'app-nav-link'}
      aria-current={active?'page':undefined} title={destination.hint}>
      <span className="app-nav-icon" aria-hidden="true"><NavGlyph id={destination.id} fallback={destination.glyph}/></span>
      <span className="app-nav-label">{destination.label}</span>
     </Link>;
    })}
   </nav>
   <div className="app-sidebar-foot">
    <div className="app-nav-actions">
     <PwaInstallButton/>
    </div>
    {!collapsed&&<Link className="app-nav-cta" href="/november-pilot">Pilot guide <span aria-hidden="true">↗</span></Link>}
   </div>
  </aside>
  <div className="app-shell-body">
   <header className="app-topbar">
    <Link className="app-brand app-brand-mobile" href="/dashboard" aria-label="Homeschool OS dashboard">
     <span className="brand-mark" aria-hidden="true">✦</span>
     <span className="brand-copy"><strong>Homeschool<span>OS</span></strong></span>
    </Link>
    <div className="app-topbar-actions">
     <span className="mode-chip" title={inLearnerMode?'You are browsing learner mode':'You are browsing parent tools'}>
      {inLearnerMode?'Learner mode':'Parent mode'}
     </span>
     {inLearnerMode
      ?<Link className="mode-switch" href="/dashboard">Parent home <span aria-hidden="true">→</span></Link>
      :<Link className="mode-switch" href="/learn">Learner mode <span aria-hidden="true">→</span></Link>}
     <div className="app-nav-actions app-nav-actions-topbar"><PwaInstallButton/></div>
    </div>
   </header>
   {context&&<div className="app-context-wrap"><nav className="app-context-nav" aria-label={context.label}>
    <span className="app-context-label">{context.label}</span>
    {context.links.map(item=>{
     const active=navigationLinkIsActive(pathname,item.href);
     return <Link key={item.href} href={item.href} className={active?'app-context-link is-active':'app-context-link'} aria-current={active?'page':undefined}>{item.label}</Link>;
    })}
   </nav></div>}
   <div className="app-shell-content">{children}</div>
  </div>
  <nav className="app-bottom-nav" aria-label="Primary navigation">
   {bottomDestinations.map(destination=>{
    const active=activeBottom?.id===destination.id;
    return <Link key={destination.id} href={destination.href}
     className={active?'app-bottom-link is-active':'app-bottom-link'}
     aria-current={active?'page':undefined}>
     <span className="app-bottom-icon" aria-hidden="true"><NavGlyph id={destination.id} fallback={destination.glyph}/></span>
     <span>{destination.label}</span>
    </Link>;
   })}
  </nav>
  <span className="sr-only" aria-live="polite">{activeSidebar?activeSidebar.label:''}</span>
 </div>;
}
