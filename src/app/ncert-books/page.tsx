import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {ncertTextbooks,selectTextbooks,chaptersFor,textbookById,textbookAudit,textbookGrades} from '@/lib/ncert/textbooks';
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
 return <><header className="workspace-header"><Link href="/dashboard">✦ Homeschool OS</Link><span>NCERT BOOK & CHAPTER CATALOGUE</span></header>
 <main className="family-dashboard">
 <div className="dashboard-welcome"><div><span className="tag">GLOBAL CURRICULUM ENGINE · TEXTBOOK INDEX</span><h1>One chapter at a time</h1><p className="muted">Find the right NCERT book, view its chapter index and separate verified textbook facts from learning suggestions awaiting editorial review.</p></div><SectionArtwork theme="explore"/></div>
 <nav className="global-crumbs"><Link href="/dashboard">Home</Link><span>/</span><Link href="/global-curriculum">Global curriculum</Link><span>/</span><strong>NCERT books</strong></nav>
 <div className="ncert-stats" aria-label="Catalogue audit summary">
  <div><strong>{stats.books}</strong><span>Books catalogued</span></div><div><strong>{stats.chapterSlots}</strong><span>Chapter positions indexed</span></div><div><strong>{stats.verifiedChapterTitles}</strong><span>Titles fully verified</span></div><div><strong>{stats.approvedSkillMappings}</strong><span>Approved skill mappings</span></div>
 </div>
 <section className="workspace-panel">
  <div className="ncert-heading"><div><span className="eyebrow">TEXTBOOK DIRECTORY</span><h2>Choose a class and book</h2><p className="muted">Grade 4 is our first catalogued cohort. Other grades are intentionally shown as pending rather than populated with assumptions.</p></div><span className="ncert-audit-note">Editorial audit active</span></div>
  <form action="/ncert-books" method="get" className="ncert-filter-grid">
   <label className="workspace-field"><span>Class</span><select name="grade" defaultValue={selectedGrade}>{textbookGrades.map(grade=><option key={grade} value={grade}>Class {grade}{grade===4?' · indexed':''}</option>)}</select></label>
   <label className="workspace-field"><span>Subject</span><select name="subject" defaultValue={subject}><option value="">All subjects</option>{Array.from(new Set(selectTextbooks(selectedGrade).map(x=>x.subject))).map(name=><option key={name} value={name}>{name}</option>)}</select></label>
   <button type="submit">Show books</button>
  </form>
  {selectedGrade!==4&&<p className="ncert-pending">Class {selectedGrade} is not catalogued yet. The official NCERT textbook portal is available below; this does not mean textbooks do not exist.</p>}
 </section>
 {books.length>0&&<div className="ncert-books-layout">
 <aside className="workspace-panel ncert-book-selector">
  <span className="eyebrow">CLASS {selectedGrade} · TEXTBOOKS</span><h2>Choose a book</h2>
  <div className="ncert-book-list">{books.map((book,i)=><Link key={book.id} href={`/ncert-books?grade=${selectedGrade}&subject=${encodeURIComponent(subject)}&book=${book.id}`} className={selectedBook?.id===book.id?'ncert-book-choice is-active':'ncert-book-choice'}>
    <span className="ncert-book-letter" aria-hidden="true">{['∑','Aa','हि','✿'][i%4]}</span><span><strong>{book.title}</strong><small>{book.subject} · {book.chapterCount} chapter slots</small></span><span aria-hidden="true">›</span>
   </Link>)}</div>
 </aside>
 <section className="workspace-panel ncert-chapter-panel">
  {selectedBook&&<><div className="ncert-chapter-intro"><div><span className="eyebrow">OFFICIAL BOOK IDENTIFIED</span><h2>{selectedBook.title}</h2><p>Class {selectedBook.grade} · {selectedBook.subject} · {selectedBook.language} · NCERT</p></div><span className="ncert-mini-book" aria-hidden="true">▤</span></div>
  <div className="ncert-source-strip"><span>Book identification confirmed · Chapter titles awaiting edition-by-edition review</span><a href={selectedBook.sourceUrl} target="_blank" rel="noopener noreferrer">Visit NCERT book portal ↗</a></div>
  <p className="muted">Edition note: {selectedBook.editionLabel}. Never treat the placeholders below as chapter names. Confirm titles and sequence using the correct book edition before assigning skills.</p>
  <div className="ncert-chapter-list">{chapters.map(c=><div className="ncert-chapter-row" key={c.id}><span className="ncert-chapter-number">{String(c.chapterNumber).padStart(2,'0')}</span><div><strong>{c.verifiedTitle??c.label}</strong><small>{c.verifiedTitle?'Title checked':'Official chapter title not verified'} · {c.mappingStatus==='unmapped'?'No approved competency link':'Competency link available'}</small></div><span className="ncert-chapter-review">Review pending</span></div>)}</div></>}
 </section>
 </div>}
 <section className="workspace-panel ncert-skill-suggestions"><span className="eyebrow">SEPARATE FROM TEXTBOOK ALIGNMENT</span><h2>Original skills to explore</h2>
 <p className="muted">These stage-related examples are not mapped to any chapter. Their relationship to a particular textbook must be reviewed manually, using real chapter content and edition evidence.</p>
 <div className="ncert-original-grid">{suggestedSkills.slice(0,6).map(skill=><article key={skill.id}><strong>{skill.title}</strong><p>{skill.outcome}</p><Link href={`/dashboard?globalSkill=${encodeURIComponent(skill.id)}`}>Review learning goal →</Link></article>)}</div>
 {suggestedSkills.length===0&&<p>No original suggestions are catalogued for this filter yet.</p>}
 </section>
 <section className="ncert-info-grid">
  <article className="workspace-panel"><span className="eyebrow">OFFICIAL MATERIALS</span><h2>Use original NCERT resources</h2><p>Our index does not embed copyrighted chapters or textbooks. Verify the latest available editions directly with the publisher.</p><a href="https://ncert.nic.in/textbook.php" target="_blank" rel="noopener noreferrer">Open NCERT textbook catalogue ↗</a></article>
  <article className="workspace-panel"><span className="eyebrow">TRUST & TRANSPARENCY</span><h2>What remains unverified?</h2><p>Chapter headings, edition-year applicability, syllabus differences, and alignment of specific competencies need an explicit source-by-source editorial review. No automated chapter mapping is asserted.</p><Link href="/global-curriculum">Explore global learning objectives →</Link></article>
 </section>
 </main></>;
}