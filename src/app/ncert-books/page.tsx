import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {selectTextbooks,chaptersFor,officialChapterPdf,textbookAudit,textbookGrades} from '@/lib/ncert/textbooks';
import {globalSkills} from '@/lib/global-curriculum/catalogue';
import SectionArtwork from '@/components/section-artwork';

export const dynamic='force-dynamic';
type Search={grade?:string;subject?:string;book?:string};
const currentSubject=(grade:number,subject?:string)=>selectTextbooks(grade).find(x=>x.subject===subject)?.subject??'';
export default async function NcertBooks({searchParams}:{searchParams:Promise<Search>}){
 const {data:session}=await auth.getSession();if(!session?.user)redirect('/auth/sign-in');
 const p=await searchParams;
 const selectedGrade=textbookGrades.includes(Number(p.grade))?Number(p.grade):4;
 const subject=currentSubject(selectedGrade,p.subject);
 const books=selectTextbooks(selectedGrade,subject);
 const selectedBook=books.find(x=>x.id===p.book)??books[0]??null;
 const chapters=selectedBook?chaptersFor(selectedBook.id):[];
 const stats=textbookAudit();
 const matchedStage=selectedGrade<=2?'class1-2':selectedGrade<=5?'class3-5':selectedGrade<=8?'class6-8':selectedGrade<=10?'class9-10':'class11-12';
 const suggestedSkills=globalSkills.filter(x=>x.stage===matchedStage&&(!selectedBook||(selectedBook.subject==='Environmental Studies'?x.subject==='Our world':x.subject===selectedBook.subject)));
 return <>
 <main className="family-dashboard">
 <div className="dashboard-welcome"><div><span className="tag">GLOBAL CURRICULUM ENGINE · TEXTBOOK INDEX</span><h1>One chapter at a time</h1><p className="muted">Find the right NCERT book, view its chapter index and separate verified textbook facts from learning suggestions awaiting editorial review.</p></div><SectionArtwork theme="explore"/></div>
 <nav className="global-crumbs" aria-label="Breadcrumb"><Link href="/dashboard">Home</Link><span>/</span><Link href="/global-curriculum">Global curriculum</Link><span>/</span><strong>NCERT books</strong></nav>
 <div className="ncert-stats" aria-label="Catalogue audit summary">
  <div><strong>{stats.books}</strong><span>Books in catalogue</span></div><div><strong>{stats.chapterSlots}</strong><span>Numbered chapter slots</span></div><div><strong>{stats.verifiedChapterTitles}</strong><span>Titles fully verified</span></div><div><strong>{stats.approvedSkillMappings}</strong><span>Approved skill mappings</span></div>
 </div>
 <section className="workspace-panel">
  <div className="ncert-heading"><div><span className="eyebrow">TEXTBOOK DIRECTORY</span><h2>Choose a class and book</h2><p className="muted">The catalogue currently includes books for Classes 1–8. Chapter-title verification varies by book: each entry below shows its own checked-title count and edition status. Books with pending contents remain identified separately.</p></div><span className="ncert-audit-note">Editorial audit active</span></div>
  <form action="/ncert-books" method="get" className="ncert-filter-grid">
   <label className="workspace-field"><span>Class</span><select name="grade" defaultValue={selectedGrade}>{textbookGrades.map(grade=><option key={grade} value={grade}>Class {grade}{grade===1?' · 72 titles checked':[4,5].includes(grade)?' · chapters checked':grade===8?' · books indexed':''}</option>)}</select></label>
   <label className="workspace-field"><span>Subject</span><select name="subject" defaultValue={subject}><option value="">All subjects</option>{Array.from(new Set(selectTextbooks(selectedGrade).map(x=>x.subject))).map(name=><option key={name} value={name}>{name}</option>)}</select></label>
   <button type="submit">Show books</button>
  </form>
  {books.length===0&&<p className="ncert-pending">No books are currently indexed for Class {selectedGrade} in this directory. The official NCERT textbook portal is available below; this does not mean textbooks do not exist.</p>}
  {selectedGrade===1&&<p className="ncert-pending">Five Class 1 books listed in the NCERT/CIET audio-book catalogue have all 72 numbered chapter titles checked. The separate NCERT Urdu publication catalogue also lists Dilchasp Riyazi (code 4109); its digital chapter contents remain pending. Chapter-to-skill mappings remain unapproved.</p>}
  {selectedGrade===5&&<p className="ncert-pending">All seven catalogued Class 5 NCERT books have chapter titles checked against official publisher contents; printed edition details are recorded per book. Chapter-to-skill mappings remain unapproved.</p>}
  {selectedGrade===8&&<p className="ncert-pending">Class 8 book identities are indexed, but individual chapter names and counts remain pending official NCERT contents review.</p>}
 </section>
 {books.length>0&&<div className="ncert-books-layout">
 <aside className="workspace-panel ncert-book-selector">
  <span className="eyebrow">CLASS {selectedGrade} · TEXTBOOKS</span><h2>Choose a book</h2>
  <div className="ncert-book-list">{books.map((book,i)=><Link key={book.id} href={`/ncert-books?grade=${selectedGrade}&subject=${encodeURIComponent(subject)}&book=${book.id}`} className={selectedBook?.id===book.id?'ncert-book-choice is-active':'ncert-book-choice'}>
    <span className="ncert-book-letter" aria-hidden="true">{['∑','Aa','हि','✿'][i%4]}</span><span><strong>{book.title}</strong><small>{book.subject} · {book.chapterCount>0?`${book.chapterCount} chapter titles checked`:'Chapter index pending'}</small></span><span aria-hidden="true">›</span>
   </Link>)}</div>
 </aside>
 <section className="workspace-panel ncert-chapter-panel">
  {selectedBook&&<><div className="ncert-chapter-intro"><div><span className="eyebrow">OFFICIAL BOOK IDENTIFIED</span><h2>{selectedBook.title}</h2><p>Class {selectedBook.grade} · {selectedBook.subject} · {selectedBook.language} · NCERT</p></div><span className="ncert-mini-book" aria-hidden="true">▤</span></div>
  <div className="ncert-source-strip"><span>{chapters.length>0?`Book identified · ${chapters.filter(c=>Boolean(c.verifiedTitle)).length} of ${chapters.length} chapter titles checked`:'Book identified · Chapter contents awaiting verification'}</span><a href={selectedBook.sourceUrl} target="_blank" rel="noopener noreferrer">Visit NCERT book portal ↗</a></div>
  <p className="muted">Edition note: {selectedBook.editionLabel}. Click any indexed chapter title to open its learning page. Checked chapters also link to official NCERT PDFs; unverified chapters do not receive guessed PDF links. Confirm the current edition before assigning skills.</p>
  {chapters.length===0&&<p className="ncert-pending">The chapter index for this edition is awaiting verification. Use the official NCERT book link instead of assuming a chapter sequence.</p>}
  <div className="ncert-chapter-list">{chapters.map(c=>{const chapterUrl=officialChapterPdf(c);return <div className="ncert-chapter-row" key={c.id}>
    <span className="ncert-chapter-number">{String(c.chapterNumber).padStart(2,'0')}</span>
    <div className="ncert-chapter-description">
      <Link className="ncert-chapter-title-link" href={`/ncert-books/chapter/${c.id}`} aria-label={`Open learning page for chapter ${c.chapterNumber}: ${c.verifiedTitle??c.label}`}>{c.verifiedTitle??c.label}<span aria-hidden="true"> →</span></Link>
      <small>{chapterUrl?'Learning page and official PDF available':'Learning page available · official PDF not yet verified'} · {c.mappingStatus==='unmapped'?'No approved competency link':'Competency link available'}</small>
    </div>
    {chapterUrl?<a className="ncert-chapter-open" href={chapterUrl} target="_blank" rel="noopener noreferrer">Read PDF <span aria-hidden="true">↗</span></a>:<span className="ncert-chapter-review">Review pending</span>}
  </div>})}</div></>}
 </section>
 </div>}
 <section className="workspace-panel ncert-skill-suggestions"><span className="eyebrow">SEPARATE FROM TEXTBOOK ALIGNMENT</span><h2>Original skills to explore</h2>
 <p className="muted">These stage-related examples are not mapped to any chapter. Their relationship to a particular textbook must be reviewed manually, using real chapter content and edition evidence.</p>
 <div className="ncert-original-grid">{suggestedSkills.slice(0,6).map(skill=><article key={skill.id}><strong>{skill.title}</strong><p>{skill.outcome}</p><Link href={`/dashboard?globalSkill=${encodeURIComponent(skill.id)}`}>Review learning goal →</Link></article>)}</div>
 {suggestedSkills.length===0&&<p>No original suggestions are catalogued for this filter yet.</p>}
 </section>
 <section className="ncert-info-grid">
  <article className="workspace-panel"><span className="eyebrow">OFFICIAL MATERIALS</span><h2>Use original NCERT resources</h2><p>Our index does not embed copyrighted chapters or textbooks. Verify the latest available editions directly with the publisher.</p><a href="https://ncert.nic.in/textbook.php" target="_blank" rel="noopener noreferrer">Open NCERT textbook catalogue ↗</a></article>
  <article className="workspace-panel"><span className="eyebrow">TRUST & TRANSPARENCY</span><h2>What remains unverified?</h2><p>Class 1 has 72 source-checked titles across five CIET-listed books; Dilchasp Riyazi remains catalogue-only pending contents verification. Class 4 and 5 titles are publisher-checked. Class 8 books are identity-indexed only, with chapter contents pending. No chapter-to-skill mapping is approved automatically.</p><Link href="/global-curriculum">Explore global learning objectives →</Link></article>
 </section>
 </main></>;
}