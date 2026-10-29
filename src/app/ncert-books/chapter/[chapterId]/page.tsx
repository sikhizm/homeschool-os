import Link from 'next/link';
import {notFound, redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {ncertChapterSlots, textbookById, chaptersFor, officialChapterPdf} from '@/lib/ncert/textbooks';

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
 const title=chapter.verifiedTitle??`Chapter ${chapter.chapterNumber}`;
 return <>
  <header className="workspace-header"><Link href="/dashboard">✦ Homeschool OS</Link><span>CHAPTER LEARNING SPACE</span></header>
  <main className="family-dashboard">
   <nav className="global-crumbs"><Link href="/dashboard">Home</Link><span>/</span><Link href="/ncert-books">NCERT books</Link><span>/</span><Link href={bookHref}>{book.title}</Link><span>/</span><strong>Chapter {chapter.chapterNumber}</strong></nav>
   <section className="workspace-panel">
    <span className="eyebrow">CLASS {book.grade} · {book.subject} · CHAPTER {chapter.chapterNumber} OF {siblings.length}</span>
    <h1>{title}</h1>
    <p className="muted">{book.title} · {book.publisher} · {book.language}</p>
    <p>{chapter.verifiedTitle?'Chapter title checked against the publisher table of contents.':'Chapter title has not been verified yet.'} Chapter-to-skill alignment has not yet been approved.</p>
    <div style={{display:'flex',flexWrap:'wrap',gap:'12px',marginTop:'20px'}}>
     {officialPdf?<a className="ncert-chapter-open" href={officialPdf} target="_blank" rel="noopener noreferrer">Open official NCERT chapter PDF ↗</a>:<a className="ncert-chapter-open" href={book.sourceUrl} target="_blank" rel="noopener noreferrer">Open official textbook portal ↗</a>}
     <Link className="ncert-chapter-open" href={bookHref}>← All chapters</Link>
    </div>
    <p className="muted" style={{marginTop:'16px'}}>Official publisher material opens in a new tab. HomeSchool OS does not copy or host the textbook.</p>
   </section>
   <div className="ncert-info-grid">
    <section className="workspace-panel">
     <span className="eyebrow">PARENT-GUIDED STUDY</span><h2>Read · Discuss · Practise</h2>
     <p>Use these general activities with the actual chapter; they are not a claimed NCERT exercise or verified chapter-to-competency mapping.</p>
     <ol style={{paddingLeft:'22px',lineHeight:'1.9'}}>
      <li><strong>Read:</strong> Open the official chapter and read together, pausing at unfamiliar words or ideas.</li>
      <li><strong>Explain:</strong> Ask the learner to describe the main idea in their own words.</li>
      <li><strong>Practise:</strong> Complete questions or exercises found in the official chapter.</li>
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
     <p className="muted">Progress recording, chapter-specific quizzes and individual learner assignments are not enabled on this page yet. Do not treat opening a PDF as completion.</p>
    </section>
   </div>
   <section className="workspace-panel">
    <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:'12px'}}>
     {previous?<Link href={`/ncert-books/chapter/${previous.id}`}>← Previous: {previous.verifiedTitle??`Chapter ${previous.chapterNumber}`}</Link>:<span>First chapter</span>}
     {next?<Link href={`/ncert-books/chapter/${next.id}`}>Next: {next.verifiedTitle??`Chapter ${next.chapterNumber}`} →</Link>:<span>Last chapter</span>}
    </div>
   </section>
  </main>
 </>;
}
