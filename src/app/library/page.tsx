import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import SectionArtwork from '@/components/section-artwork';
import {ContinueReading} from './continue-reading';

export const dynamic='force-dynamic';

const FILTERS=[
 {label:'Grade',options:['Early Years','Nursery','UKG','Class 1','Class 4','Class 5','Class 8'],href:'/ncert-books'},
 {label:'Subject',options:['English','Mathematics','Science','Punjabi','Hindi','Reasoning'],href:'/lessons'},
 {label:'Learning type',options:['Read','Practice','Play','Create'],href:'/lessons'},
] as const;

const SECTIONS=[
 {title:'NCERT textbooks',description:'Official book identities, chapter indexes and source-checked titles — with verification state on every entry.',href:'/ncert-books',glyph:'📚',tint:'var(--math)'},
 {title:'Global curriculum',description:'International learning objectives used as pedagogical inspiration, clearly separated from accreditation.',href:'/global-curriculum',glyph:'🌍',tint:'var(--science)'},
 {title:'Reasoning & enrichment',description:'Logic, patterns and problem-solving studios beyond the core pathway.',href:'/curriculum-studio',glyph:'🧩',tint:'var(--language)'},
 {title:'Sikh heritage & Punjabi',description:'Language, heritage and values activities woven into the weekly plan.',href:'/lessons',glyph:'🪁',tint:'var(--creativity)'},
 {title:'Creative activities',description:'Drawing, craft, music and storytelling — open any activity for the full script.',href:'/lessons',glyph:'🎨',tint:'var(--mint)'},
 {title:'Annual pathways',description:'Thirty-six prepared teaching weeks per stage, sequenced with prerequisites.',href:'/learning-pathways',glyph:'🧭',tint:'var(--saffron)'},
] as const;

/**
 * Curriculum Library: discovery home with filters, sections and trust legend.
 */
export default async function LibraryPage(){
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 return <main className="library-page">
  <div className="dashboard-welcome library-welcome">
   <div>
    <span className="tag">CURRICULUM LIBRARY</span>
    <h1>Everything you teach from, in one place</h1>
    <p className="muted">Browse by grade, subject or learning type. Every source states what is verified and what is still pending — no guessed alignments.</p>
   </div>
   <SectionArtwork theme="explore"/>
  </div>

  <section className="library-filters" aria-label="Filter the library">
   {FILTERS.map(filter=><div className="library-filter" key={filter.label}>
    <span className="library-filter-label">{filter.label}</span>
    <div className="library-filter-chips">
     {filter.options.map(option=><Link key={option} href={filter.href} className="library-chip">{option}</Link>)}
    </div>
   </div>)}
  </section>

  <ContinueReading/>

  <section className="library-sections" aria-labelledby="library-sections-title">
   <header className="section-heading">
    <div>
     <p className="tag">Discover</p>
     <h2 id="library-sections-title">Collections</h2>
    </div>
   </header>
   <div className="library-grid">
    {SECTIONS.map(section=><Link key={section.title} href={section.href} className="library-card card" style={{borderTop:`4px solid ${section.tint}`}}>
     <span className="library-card-glyph" aria-hidden="true" style={{background:section.tint}}>{section.glyph}</span>
     <strong>{section.title}</strong>
     <p>{section.description}</p>
     <span className="library-card-arrow" aria-hidden="true">Open →</span>
    </Link>)}
   </div>
  </section>

  <section className="card library-legend" aria-labelledby="legend-title">
   <p className="tag">How to read the badges</p>
   <h2 id="legend-title">Verification states</h2>
   <ul>
    <li><span className="verify-badge verified">Verified</span> Chapter title or book identity checked against the official publisher source.</li>
    <li><span className="verify-badge pending">Contents pending</span> The book is listed officially, but its chapter index has not been verified yet.</li>
    <li><span className="verify-badge approved">Mapping approved</span> A human editor approved the link between a chapter and a skill.</li>
    <li><span className="verify-badge mapping-pending">Mapping pending</span> A skill link is proposed but not yet approved — it is never applied automatically.</li>
   </ul>
   <p className="muted">Nothing in the library claims accreditation or grade equivalence. Original HomeSchool OS content is labelled as such.</p>
  </section>
 </main>;
}
