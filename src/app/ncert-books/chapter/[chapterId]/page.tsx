import Link from 'next/link';
import ChapterProgress from './chapter-progress';
import ChapterSessions from './chapter-sessions';
import {notFound, redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {contentUnitLabelFor,isDefaultChapterSessionEligible,ncertChapterSlots, textbookById, chaptersFor, officialChapterPdf} from '@/lib/ncert/textbooks';
import {class5ChapterAccountById} from '@/lib/curriculum/class5-mapping';

export const dynamic = 'force-dynamic';

export default async function ChapterLearningPage({params}:{params:Promise<{chapterId:string}>}) {
 const {data:session}=await auth.getSession();
 if(!session?.user) redirect('/auth/sign-in');
 const {chapterId}=await params;
 const chapter=ncertChapterSlots.find(c=>c.id===chapterId);
 if(!chapter) notFound();
 const book=textbookById(chapter.bookId);
 if(!book) notFound();
 const officialPdf=officialChapterPdf(chapter);
 const siblings=chaptersFor(book.id);
 const index=siblings.findIndex(c=>c.id===chapter.id);
 const previous=siblings[index-1];
 const next=siblings[index+1];
 const bookHref=`/ncert-books?grade=${book.grade}&subject=${encodeURIComponent(book.subject)}&book=${encodeURIComponent(book.id)}`;
 const contentLabel=contentUnitLabelFor(book);
 const title=chapter.verifiedTitle??chapter.label;
 const selectionNote=chapter.selectionNote;
 const sessionEligible=isDefaultChapterSessionEligible(chapter)&&book.grade>=1&&book.grade<=10;
 const mappingAccount=book.grade===5?class5ChapterAccountById(chapter.id):undefined;
 return <>
  <header className="workspace-header"><Link href="/dashboard">✦ Homeschool OS</Link><span>NCERT LEARNING SPACE</span></header>
  <main className="family-dashboard">
   <nav className="global-crumbs"><Link href="/dashboard">Home</Link><span>/</span><Link href="/ncert-books">NCERT books</Link><span>/</span><Link href={bookHref}>{book.title}</Link><span>/</span><strong>{chapter.label}</strong></nav>
   <section className="workspace-panel">
    <span className="eyebrow">CLASS {book.grade} · {book.subject} · {chapter.label.toUpperCase()} OF {siblings.length}</span>
    <h1>{title}</h1>
    <p className="muted">{book.title} · {book.publisher} · {book.language}</p>
    <p>{chapter.verifiedTitle?`${contentLabel} title checked against the publisher table of contents.`:`${contentLabel} title has not been verified yet.`} {chapter.selection==='choose-one'?`Official selection note: ${selectionNote} This option remains browseable, but is intentionally excluded from the default auto-learning path. HomeSchool OS does not yet persist a parent or school selection of an alternative, so it will not claim that one has been chosen.`:''} {mappingAccount?.candidateMappingIds.length?`This Class 5 chapter has ${mappingAccount.candidateMappingIds.length} original-outcome draft proposal${mappingAccount.candidateMappingIds.length===1?'':'s'} awaiting a family owner’s source review.`:mappingAccount?.unmappedReason?'This Class 5 chapter is deliberately unmapped until stronger specialist and source evidence is available.':'No chapter-to-skill alignment has been approved.'}</p>
    <div style={{display:'flex',flexWrap:'wrap',gap:'12px',marginTop:'20px'}}>
     {officialPdf?<a className="ncert-chapter-open" href={officialPdf} target="_blank" rel="noopener noreferrer">Open official NCERT {contentLabel.toLowerCase()} PDF ↗</a>:<a className="ncert-chapter-open" href={book.sourceUrl} target="_blank" rel="noopener noreferrer">Open official textbook portal ↗</a>}
     {mappingAccount?<Link className="ncert-chapter-open" href={`/curriculum-mapping?chapter=${encodeURIComponent(chapter.id)}`}>Inspect mapping evidence</Link>:null}
     <Link className="ncert-chapter-open" href={bookHref}>← All {contentLabel.toLowerCase()}s</Link>
    </div>
    <p className="muted" style={{marginTop:'16px'}}>Official publisher material opens in a new tab. HomeSchool OS does not copy or host the textbook.</p>
   </section>
   <ChapterSessions chapterId={chapter.id} grade={book.grade} contentLabel={contentLabel} selectionNote={selectionNote} eligible={sessionEligible}/>
   <div className="ncert-info-grid">
    <section className="workspace-panel">
     <span className="eyebrow">PARENT-GUIDED STUDY</span><h2>Read · Discuss · Practise</h2>
     <p>Use these general activities with the actual official {contentLabel.toLowerCase()}; they are not a claimed NCERT exercise or verified {contentLabel.toLowerCase()}-to-competency mapping.</p>
     <ol style={{paddingLeft:'22px',lineHeight:'1.9'}}>
      <li><strong>Read:</strong> Open the official {contentLabel.toLowerCase()} and work through it together, pausing at unfamiliar words or ideas.</li>
      <li><strong>Explain:</strong> Ask the learner to describe a main idea in their own words.</li>
      <li><strong>Practise:</strong> Use suitable activities or exercises found in the official {contentLabel.toLowerCase()}.</li>
      <li><strong>Reflect:</strong> Ask what felt easy, what was difficult, and what to revisit tomorrow.</li>
     </ol>
    </section>
    <section className="workspace-panel">
     <span className="eyebrow">LEARNING NOTES</span><h2>Discuss with your learner</h2>
     <p>Useful prompts for any subject:</p>
     <ul style={{paddingLeft:'22px',lineHeight:'1.9'}}>
      <li>What are three things you remember?</li>
      <li>What question would you ask your teacher?</li>
      <li>Where might you use this idea in real life?</li>
     </ul>
     <p className="muted">Parent-recorded progress and learner assignments are available below. {contentLabel}-specific quizzes are not available yet. Opening an official resource never counts as completion.</p>
    </section>
   </div>
   <ChapterProgress chapterId={chapter.id} contentLabel={contentLabel} selectionRequired={chapter.selection==='choose-one'}/>
   <section className="workspace-panel">
    <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:'12px'}}>
     {previous?<Link href={`/ncert-books/chapter/${previous.id}`}>← Previous: {previous.verifiedTitle??`${contentLabel} ${previous.chapterNumber}`}</Link>:<span>First {contentLabel.toLowerCase()}</span>}
     {next?<Link href={`/ncert-books/chapter/${next.id}`}>Next: {next.verifiedTitle??`${contentLabel} ${next.chapterNumber}`} →</Link>:<span>Last {contentLabel.toLowerCase()}</span>}
    </div>
   </section>
  </main>
 </>;
}
