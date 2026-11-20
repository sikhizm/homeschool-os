import Image from 'next/image';
import Link from 'next/link';
import {libraryGradeOptions, librarySubjectOptions, libraryLearningOptions} from '@/lib/library/grade-options';

type IconName = 'grade'|'subject'|'learning'|'grid'|'book'|
 'calculator'|'flask'|'globe'|'hindi'|'briefcase'|'trophy'|'puzzle'|'layers';

function BrowseIcon({kind}:{kind:IconName}){
 return <svg className="library-browse-icon" viewBox="0 0 24 24" width="23" height="23"
  fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
  aria-hidden="true" focusable="false">
  {kind==='grade'&&<><path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11.5V17c3.7 2.7 8.3 2.7 12 0v-5.5M22 9v7"/></>}
  {kind==='subject'&&<><path d="M12 6c-3-2-6-2.5-10-2v15c4-.5 7 0 10 2M12 6c3-2 6-2.5 10-2v15c-4-.5-7 0-10 2M12 6v15"/></>}
  {kind==='learning'&&<><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/></>}
  {kind==='grid'&&<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>}
  {kind==='book'&&<><path d="M12 6c-3-2-6-2.5-10-2v15c4-.5 7 0 10 2M12 6c3-2 6-2.5 10-2v15c-4-.5-7 0-10 2M12 6v15"/></>}
  {kind==='calculator'&&<><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/></>}
  {kind==='flask'&&<><path d="M9 3h6M10 3v7L4 20h16l-6-10V3M7 16h10"/></>}
  {kind==='globe'&&<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18"/></>}
  {kind==='hindi'&&<text x="12" y="18" textAnchor="middle" fontSize="21" fontWeight="750" stroke="none" fill="currentColor">अ</text>}
  {kind==='briefcase'&&<><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13c5 3 13 3 18 0M12 12v4"/></>}
  {kind==='trophy'&&<><path d="M7 3h10v6a5 5 0 0 1-10 0V3ZM7 5H4v3a4 4 0 0 0 4 4M17 5h3v3a4 4 0 0 1-4 4M12 14v4M8 21h8M9 18h6"/></>}
  {kind==='puzzle'&&<><path d="M8 3h3a2 2 0 1 1 4 0h3v5a2 2 0 1 1 0 4v6h-5a2 2 0 1 1-4 0H4v-5a2 2 0 1 1 0-4V3h4Z"/></>}
  {kind==='layers'&&<><path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5"/></>}
 </svg>;
}

const subjects: Record<string,{icon:IconName;tone:string}>={
 'English':{icon:'book',tone:'sky'},
 'Mathematics':{icon:'calculator',tone:'sand'},
 'Science':{icon:'flask',tone:'mint'},
 'Social Science':{icon:'globe',tone:'lilac'},
 'Hindi':{icon:'hindi',tone:'violet'},
 'Vocational Education':{icon:'briefcase',tone:'sky'},
};
const learningTypes: Record<string,{icon:IconName;tone:string}>={
 'Read textbooks':{icon:'book',tone:'sky'},
 'Practise Olympiad papers':{icon:'trophy',tone:'sand'},
 'Early-years play':{icon:'layers',tone:'lilac'},
 'Create learning materials':{icon:'puzzle',tone:'mint'},
};

const classOptions=libraryGradeOptions.filter(option=>option.label.startsWith('Class '));

export default function LibraryQuickBrowse(){
 return <section className="library-quick-browse card" aria-labelledby="library-browse-title">
  <header className="library-browse-banner">
   <div className="library-browse-banner-copy">
    <span className="eyebrow">QUICK BROWSE</span>
    <h2 id="library-browse-title">Jump straight to a class or activity</h2>
    <p>Find books, study materials, practice papers and more — by class, subject or learning type.</p>
   </div>
   <Image src="/illustrations/library-quick-browse.svg" width={270} height={198}
    alt="" className="library-browse-illustration" aria-hidden="true"/>
  </header>

  <section className="library-browse-group" aria-labelledby="library-browse-grade">
   <div className="library-browse-group-heading">
    <span className="library-browse-heading-icon"><BrowseIcon kind="grade"/></span>
    <h3 id="library-browse-grade">Select Grade</h3>
    <Link className="library-browse-all" href="/ncert-books"><BrowseIcon kind="grid"/>All Grades</Link>
   </div>
   <div className="library-browse-classes">
    {classOptions.map(option=><Link key={option.label} href={option.href}
     className="library-browse-tile library-browse-class">{option.label}</Link>)}
   </div>
  </section>

  <section className="library-browse-group" aria-labelledby="library-browse-subject">
   <div className="library-browse-group-heading">
    <span className="library-browse-heading-icon"><BrowseIcon kind="subject"/></span>
    <h3 id="library-browse-subject">Select Subject</h3>
   </div>
   <div className="library-browse-subjects">
    {librarySubjectOptions.map(option=>{
     const visual=subjects[option.label]??{icon:'book' as const,tone:'sky'};
     return <Link key={option.label} href={option.href}
      className={`library-browse-tile library-browse-choice tone-${visual.tone}`}>
      <BrowseIcon kind={visual.icon}/><span>{option.label}</span>
     </Link>;
    })}
   </div>
  </section>

  <section className="library-browse-group" aria-labelledby="library-browse-type">
   <div className="library-browse-group-heading">
    <span className="library-browse-heading-icon"><BrowseIcon kind="learning"/></span>
    <h3 id="library-browse-type">Select Learning Type</h3>
   </div>
   <div className="library-browse-types">
    {libraryLearningOptions.map(option=>{
     const visual=learningTypes[option.label]??{icon:'book' as const,tone:'sky'};
     return <Link key={option.label} href={option.href}
      className={`library-browse-tile library-browse-choice tone-${visual.tone}`}>
      <BrowseIcon kind={visual.icon}/><span>{option.label}</span>
     </Link>;
    })}
   </div>
  </section>
 </section>;
}
