import Link from 'next/link';

const punjabiBooks = [
  {grade:1,title:'Basant Punjabi',url:'https://drive.google.com/file/d/1rr0oV0fjafmdpoGO-dSnrpe-jkaW57Hx/view'},
  {grade:2,title:'Basant Punjabi',url:'https://drive.google.com/file/d/1Y4ejb0zXl5s20DurX5dxp33wjuTAGlno/view'},
  {grade:3,title:'Basant',url:'https://drive.google.com/file/d/17X3aM78S3m96UcHbNnK7x58TjR8YhX4G/view'},
  {grade:4,title:'Punjabi Pustak',url:'https://drive.google.com/file/d/1sA_rH3M2epKxKV8ysZE6ae1Pr4AdMRoh/view'},
  {grade:5,title:'Punjabi Pustak',url:'https://drive.google.com/file/d/1Fa1peha6-dbRVYhFzofzlX7_y8h8nIeR/view'},
  {grade:6,title:'Punjabi Pustak',url:'https://drive.google.com/file/d/1joEVf0nlReZtj71Ei0swXr7-YVuTx8M3/view'},
  {grade:7,title:'Punjabi Pustak',url:'https://drive.google.com/file/d/1NnFZ_LqEcuZjC6CwXvxFIv3ZFrfLCoKA/view'},
  {grade:8,title:'Punjabi Pustak',url:'https://drive.google.com/file/d/17Mc3Kg66snTFvxjgnyjgr-dvU0D7ylfM/view'},
  {grade:9,title:'Sahit Mala (Punjabi)',url:'https://drive.google.com/file/d/1n3tIOUCeGgyuRwI5zDoK3KEfKkWcVAwT/view'},
  {grade:9,title:'Vangi (Punjabi)',url:'https://drive.google.com/file/d/16tNlfkv60bCnjShUU9woJE5tIJZGEd2A/view'},
] as const;

const bookGroups = [
  { id:'foundations', title:'Classes 1–3', subtitle:'Early Punjabi reading', books:punjabiBooks.filter(book=>book.grade<=3) },
  { id:'middle', title:'Classes 4–6', subtitle:'Building language confidence', books:punjabiBooks.filter(book=>book.grade>=4&&book.grade<=6) },
  { id:'higher', title:'Classes 7–9', subtitle:'Literature and language', books:punjabiBooks.filter(book=>book.grade>=7) },
];

/** Only direct, individually identified publisher book links belong here. */
export default function EnrichmentView() {
 return <main className="enrichment-page studio-stack">
  <nav className="global-crumbs" aria-label="Breadcrumb">
   <Link href="/library">Curriculum Library</Link><span>/</span><strong>Supplementary resources</strong>
  </nav>
  <header className="enrichment-hero">
   <div className="enrichment-hero-copy">
    <span className="eyebrow">CURATED STUDY MATERIAL · DIRECT BOOK LINKS</span>
    <h1>Supplementary books &amp; study materials</h1>
    <p>Explore individual Punjabi textbooks for extra reading and learning. Every entry links directly to a named book, not a general publisher homepage.</p>
    <span className="enrichment-hero-count">{punjabiBooks.length} individual book links · Classes 1–9</span>
   </div>
   <div className="enrichment-hero-art" aria-hidden="true">
    <svg viewBox="0 0 220 185" width="220" height="185" fill="none" xmlns="http://www.w3.org/2000/svg">
     <circle cx="106" cy="93" r="79" fill="#DCEFFF"/>
     <ellipse cx="111" cy="168" rx="88" ry="9" fill="#B8D5E9" opacity=".5"/>
     <rect x="51" y="110" width="116" height="28" rx="9" fill="#F8B94F"/>
     <rect x="51" y="110" width="116" height="28" rx="9" stroke="#DCA02E" strokeWidth="2"/>
     <rect x="60" y="116" width="95" height="16" rx="5" fill="white"/>
     <rect x="43" y="85" width="122" height="28" rx="9" fill="#1176B9"/>
     <rect x="43" y="85" width="122" height="28" rx="9" stroke="#095C95" strokeWidth="2"/>
     <rect x="52" y="91" width="105" height="16" rx="5" fill="#EDF8FF"/>
     <path d="M70 64h86a7 7 0 0 1 7 7v16H67V71a3 3 0 0 1 3-7Z" fill="#F6D389"/>
     <path d="M75 70h84" stroke="#D69636" strokeWidth="3" strokeLinecap="round"/>
     <rect x="83" y="29" width="77" height="38" rx="8" fill="#F7FCFF" stroke="#4B9ACB" strokeWidth="3"/>
     <path d="M94 43h54M94 51h42" stroke="#8AC5E8" strokeWidth="4" strokeLinecap="round"/>
     <path d="M53 149c-10-25-10-62-20-91M52 117C37 107 32 91 31 81M50 105c14-12 22-25 21-36" stroke="#3B996E" strokeWidth="3.5" strokeLinecap="round"/>
     <path d="M33 78C16 75 9 64 15 50c17 2 25 13 18 28ZM52 101c19-8 29-22 25-35-17 3-27 16-25 35ZM48 126c-20-2-30-13-27-28 20 0 30 13 27 28Z" fill="#69C98B" stroke="#3B996E" strokeWidth="1.6"/>
     <path d="m184 35 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z" fill="#EFB652"/>
    </svg>
   </div>
  </header>
  <section className="enrichment-directory" aria-labelledby="enrichment-directory-title">
   <div className="enrichment-directory-head">
    <div><span className="eyebrow">PUNJAB EDUCARE COLLECTION</span><h2 id="enrichment-directory-title">Punjabi textbooks</h2><p>Browse by class and open the publisher’s individual Google Drive book file.</p></div>
    <span className="enrichment-directory-count">{punjabiBooks.length} books</span>
   </div>
   <nav className="enrichment-jump" aria-label="Browse Punjabi textbook class groups">
    {bookGroups.map(group=><a key={group.id} href={'#enrichment-'+group.id}>{group.title} <span aria-hidden="true">↓</span></a>)}
   </nav>
   <p className="enrichment-source-note"><span aria-hidden="true">ⓘ</span> These are Punjab Educare links hosted on Google Drive. Access depends on the publisher’s current sharing permissions; each book opens in a new tab.</p>
   {bookGroups.map(group=><section className="enrichment-book-group" key={group.id} id={'enrichment-'+group.id} aria-labelledby={'enrichment-group-'+group.id}>
    <div className="enrichment-group-heading">
     <div><h3 id={'enrichment-group-'+group.id}>{group.title}</h3><p>{group.subtitle}</p></div>
     <span>{group.books.length} {group.books.length===1?'book':'books'}</span>
    </div>
    <div className="enrichment-books">
     {group.books.map(book=><article className="enrichment-book-card" key={book.grade+'-'+book.title} id={'punjabi-book-'+book.grade+'-'+book.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}>
      <div className="enrichment-book-card-top">
       <span className="enrichment-book-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6c-3-2-6-2.5-10-2v15c4-.5 7 0 10 2M12 6c3-2 6-2.5 10-2v15c-4-.5-7 0-10 2M12 6v15"/></svg></span>
       <span className="enrichment-class">Class {book.grade} · Punjabi</span>
      </div>
      <h4>{book.title}</h4>
      <p className="enrichment-book-meta">Punjab Educare <span aria-hidden="true">·</span> Google Drive</p>
      <a className="enrichment-open-book" href={book.url} target="_blank" rel="noopener noreferrer">
       Open book <span aria-hidden="true">↗</span>
      </a>
     </article>)}
    </div>
   </section>)}
  </section>
  <p className="enrichment-footer-note">Only identified books and direct study-material links are listed. We do not treat general catalogues, unverified references or unrelated activities as supplementary textbooks.</p>
 </main>;
}
