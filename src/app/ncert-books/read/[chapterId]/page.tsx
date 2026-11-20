import Link from 'next/link';
import {headers} from 'next/headers';
import {notFound,redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {ncertChapterSlots,textbookById} from '@/lib/ncert/textbooks';
import {chapterPdfSources,prefersOfficialNcert} from '@/lib/ncert/pdf-source';
import PdfJsReader from './pdfjs-reader';

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
 const preferOfficial=prefersOfficialNcert(await headers());
 const {official,releaseUrl,hasOfficialPdf}=chapterPdfSources(book,chapter,preferOfficial);
 if(!releaseUrl)redirect(official.href);
 const title=chapter.verifiedTitle??`${chapter.label} · ${book.title}`;
 return <main className="family-dashboard" style={{maxWidth:1440,margin:'0 auto'}}>
  <nav className="global-crumbs" style={{marginBottom:16}}><Link href="/ncert-books">NCERT books</Link><span>/</span><Link href={chapterHref}>Class {book.grade} · {book.title}</Link><span>/</span><strong>Reader</strong></nav>
  <section className="workspace-panel" style={{padding:16}}>
   <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:12}}>
    <div><span className="eyebrow">NCERT PDF READER · CLASS {book.grade}</span><h1 style={{margin:'5px 0 0',fontSize:'clamp(20px,3vw,28px)'}}>{title}</h1><p className="muted" style={{margin:'4px 0 0',fontSize:13}}>Continuous scrolling is the default. Pages load progressively as you read.</p></div>
    <div className="hero-actions" style={{margin:0}}><a className="hero-action-secondary" href={official.href} target="_blank" rel="noopener noreferrer">{hasOfficialPdf?'Official NCERT PDF ↗':'Official textbook portal ↗'}</a><a className="hero-action-secondary" href={releaseUrl} target="_blank" rel="noopener noreferrer">Download release PDF ↗</a><Link className="hero-action-secondary" href={chapterHref}>← Chapter details</Link><Link className="hero-action-secondary" href={chapterHref + '#chapter-status'}>Record chapter status</Link></div>
   </div>
   <PdfJsReader src={`/api/ncert-pdf/${chapterId}`} title={title}/>
  </section>
 </main>;
}
