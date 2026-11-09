'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {navigationForPath,navigationLinkIsActive} from '@/lib/navigation';
import {PwaInstallButton} from '@/components/pwa-tools';

const sections=[
 {id:'home',href:'/dashboard',label:'Home',glyph:'⌂',hint:'Family overview'},
 {id:'planner',href:'/planning',label:'Planner',glyph:'▦',hint:'Your learning rhythm'},
 {id:'explore',href:'/curriculum-studio',label:'Explore',glyph:'✳',hint:'Curriculum and learning pathways'},
 {id:'activities',href:'/lessons',label:'Activities',glyph:'✎',hint:'Lessons and printables'},
 {id:'progress',href:'/reports',label:'Progress',glyph:'◫',hint:'Portfolio and learning insights'},
] as const;
const privateRoutes=['/learning-pathways','/roadmap','/dashboard','/planning','/curriculum','/global-curriculum','/curriculum-studio','/ncert-books','/lessons','/portfolio','/reports','/november-pilot'];

export default function AppNavigation(){
 const pathname=usePathname()||'';
 if(!privateRoutes.some(route=>navigationLinkIsActive(pathname,route)))return null;
 const {activePrimary,context}=navigationForPath(pathname);
 return <div className="app-nav-wrap">
  <div className="app-nav-inner">
   <Link className="app-brand" href="/dashboard" aria-label="Homeschool OS dashboard">
    <span className="brand-mark" aria-hidden="true">✦</span>
    <span className="brand-copy"><strong>Homeschool<span>OS</span></strong><small>Grow together, every day</small></span>
   </Link>
   <nav className="app-primary-nav" aria-label="Primary navigation">
    {sections.map(section=>{
     const active=activePrimary===section.id;
     return <Link key={section.id} href={section.href} className={active?'app-nav-link is-active':'app-nav-link'} aria-current={active?'page':undefined} title={section.hint}>
       <span className="app-nav-icon" aria-hidden="true">{section.glyph}</span><span>{section.label}</span>
     </Link>;
    })}
   </nav>
   <div className="app-nav-actions">
    <PwaInstallButton />
    <Link className="app-nav-cta" href="/november-pilot">Pilot guide <span aria-hidden="true">↗</span></Link>
   </div>
  </div>
  {context&&<div className="app-context-wrap"><nav className="app-context-nav" aria-label={context.label}>
   <span className="app-context-label">{context.label}</span>
   {context.links.map(item=>{
    const active=navigationLinkIsActive(pathname,item.href);
    return <Link key={item.href} href={item.href} className={active?'app-context-link is-active':'app-context-link'} aria-current={active?'page':undefined}>{item.label}</Link>;
   })}
  </nav></div>}
 </div>;
}
