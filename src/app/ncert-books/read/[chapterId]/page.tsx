import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {ncertChapterSlots,textbookById} from '@/lib/ncert/textbooks';
import {chapterPdfSources} from '@/lib/ncert/pdf-source';
import PdfJsReader from './pdfjs-reader';

type ReaderActionIconName='official'|'release'|'details'|'status';
function ReaderActionIcon({name}:{name:ReaderActionIconName}){
 return <svg className="ncert-reader-action-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
  {name==='official'?<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>:null}
  {name==='release'?<><path d="M12 3v12m-4-4 4 4 4-4M5 17v4h14v-4"/></>:null}
  {name==='details'?<><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>:null}
  {name==='status'?<><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m7 12 3 3 7-7"/></>:null}
 </svg>;
}

export const dynamic='force-dynamic';

export default async function NcertReaderPage({params,searchParams}:{params:Promise<{chapterId:string}>;searchParams:Promise<{learner?:string}>}){
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 const {chapterId}=await params;
 const {learner}=await searchParams;
 const chapterHref = `/ncert-books/chapter/${chapterId}` + (learner ? `?learner=${encodeURIComponent(learner)}` : '');
 const chapter=ncertChapterSlots.find(item=>item.id===chapterId);
 if(!chapter)notFound();
 const book=textbookById(chapter.bookId);
 if(!book)notFound();
 const {official,releaseUrl,hasOfficialPdf}=chapterPdfSources(book,chapter,false);
 if(!releaseUrl)redirect(official.href);
 const title=chapter.verifiedTitle??`${chapter.label} · ${book.title}`;
 return <main className="family-dashboard ncert-reader-page" style={{maxWidth:1440,margin:'0 auto'}}>
  <nav className="global-crumbs" style={{marginBottom:16}}><Link href="/ncert-books">NCERT books</Link><span>/</span><Link href={chapterHref}>Class {book.grade} · {book.title}</Link><span>/</span><strong>Reader</strong></nav>
  <section className="workspace-panel ncert-reader-panel">
   <div className="ncert-reader-intro">
    <div><span className="eyebrow">NCERT PDF READER · CLASS {book.grade}</span><h1 style={{margin:'5px 0 0',fontSize:'clamp(20px,3vw,28px)'}}>{title}</h1><p className="muted" style={{margin:'4px 0 0',fontSize:13}}>Continuous scrolling is the default. Pages load progressively as you read.</p></div>
    <nav className="hero-actions ncert-reader-actions" aria-label="Chapter resources and actions">
     <a className="hero-action-secondary" href={official.href} target="_blank" rel="noopener noreferrer" aria-label={hasOfficialPdf?'Open official NCERT PDF in a new tab':'Open official textbook portal in a new tab'}>
      <ReaderActionIcon name="official"/><span className="ncert-reader-action-full">{hasOfficialPdf?'Official NCERT PDF':'Official textbook portal'}</span><span className="ncert-reader-action-short">{hasOfficialPdf?'NCERT':'Portal'}</span><span className="ncert-reader-action-external" aria-hidden="true">↗</span>
     </a>
     <a className="hero-action-secondary" href={releaseUrl} target="_blank" rel="noopener noreferrer" aria-label="Download GitHub release PDF">
      <ReaderActionIcon name="release"/><span className="ncert-reader-action-full">Download release PDF</span><span className="ncert-reader-action-short">Release</span><span className="ncert-reader-action-external" aria-hidden="true">↗</span>
     </a>
     <Link className="hero-action-secondary" href={chapterHref} aria-label="Back to chapter details">
      <ReaderActionIcon name="details"/><span className="ncert-reader-action-full">Chapter details</span><span className="ncert-reader-action-short">Details</span>
     </Link>
     <Link className="hero-action-secondary" href={chapterHref + '#chapter-status'} aria-label="Record chapter status">
      <ReaderActionIcon name="status"/><span className="ncert-reader-action-full">Record chapter status</span><span className="ncert-reader-action-short">Status</span>
     </Link>
    </nav>
   </div>
   <PdfJsReader src={`/api/ncert-pdf/${chapterId}`} title={title}/>
  </section>
 </main>;
}
