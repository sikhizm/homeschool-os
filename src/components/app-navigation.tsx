'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
 { href:'/dashboard',label:'Home',glyph:'⌂',hint:'Family overview' },
 { href:'/planning',label:'Planner',glyph:'▦',hint:'Your learning rhythm' },
 { href:'/curriculum-studio',label:'Explore',glyph:'✳',hint:'Integrated curriculum studio' },
 { href:'/lessons',label:'Activities',glyph:'✎',hint:'Lessons & printables' },
 { href:'/portfolio',label:'Journey',glyph:'❋',hint:'Learning portfolios' },
 { href:'/reports',label:'Insights',glyph:'◫',hint:'Progress reviews' },
] as const;
const privateRoutes=['/dashboard','/planning','/curriculum','/global-curriculum','/curriculum-studio','/ncert-books','/lessons','/portfolio','/reports','/november-pilot'];

export default function AppNavigation(){
 const pathname=usePathname()||'';
 if(!privateRoutes.some(route=>pathname===route||pathname.startsWith(route+'/')))return null;
 return <div className="app-nav-wrap">
  <div className="app-nav-inner">
   <Link className="app-brand" href="/dashboard" aria-label="Homeschool OS dashboard">
    <span className="brand-mark" aria-hidden="true">✦</span>
    <span className="brand-copy"><strong>Homeschool<span>OS</span></strong><small>Grow together, every day</small></span>
   </Link>
   <nav className="app-primary-nav" aria-label="Primary navigation">
    {sections.map(section=>{
     const active=pathname===section.href;
     return <Link key={section.href} href={section.href} className={active?'app-nav-link is-active':'app-nav-link'} aria-current={active?'page':undefined} title={section.hint}>
       <span className="app-nav-icon" aria-hidden="true">{section.glyph}</span><span>{section.label}</span>
     </Link>;
    })}
   </nav>
   <Link className="app-nav-cta" href="/november-pilot">Pilot guide <span aria-hidden="true">↗</span></Link>
  </div>
 </div>;
}
