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
      <span className="app-nav-icon" aria-hidden="true">{destination.glyph}</span>
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
     <span className="mode-chip" title="You are browsing parent tools">Parent mode</span>
     <Link className="mode-switch" href="/learn">Learner mode <span aria-hidden="true">→</span></Link>
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
     <span className="app-bottom-icon" aria-hidden="true">{destination.glyph}</span>
     <span>{destination.label}</span>
    </Link>;
   })}
  </nav>
  <span className="sr-only" aria-live="polite">{activeSidebar?activeSidebar.label:''}</span>
 </div>;
}
