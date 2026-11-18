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

/** Only individually identified study materials belong in this library. */
export default function EnrichmentView() {
  return (
    <main className="library-page studio-stack">
      <header className="dashboard-welcome">
        <div>
          <Link href="/library">Curriculum Library</Link>
          <h1>Supplementary books and study materials</h1>
          <p className="muted">Open a specific book directly. Publisher homepages, general catalogues, unverified references and unrelated activities are not listed here.</p>
        </div>
      </header>
      <section className="workspace-panel" aria-labelledby="punjabi-textbooks">
        <h2 id="punjabi-textbooks">Punjabi textbooks</h2>
        <p className="muted">Individual Punjab Educare book links hosted on Google Drive. Availability depends on the publisher's sharing permissions; books open in a new tab.</p>
        <div className="library-grid">
          {punjabiBooks.map(book => (
            <article className="library-card card" key={book.grade + '-' + book.title}>
              <p><strong>Class {book.grade} · Punjabi</strong></p>
              <h3>{book.title}</h3>
              <p>Punjab Educare · Google Drive</p>
              <a href={book.url} target="_blank" rel="noopener noreferrer">Open book ↗</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
