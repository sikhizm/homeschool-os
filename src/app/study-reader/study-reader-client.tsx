'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import styles from './study-reader.module.css';

type Props = {sourceUrl: string | null; title: string; grade: string};

export default function StudyReaderClient({sourceUrl, title, grade}: Props) {
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  const [localFileName, setLocalFileName] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    return () => {
      if (localPdfUrl) URL.revokeObjectURL(localPdfUrl);
    };
  }, [localPdfUrl]);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      event.target.value = '';
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setLocalPdfUrl(nextUrl);
    setLocalFileName(file.name);
    setReloadKey((value) => value + 1);
  };

  const remoteViewerUrl = sourceUrl
    ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(sourceUrl)}`
    : null;
  const viewerUrl = localPdfUrl ?? remoteViewerUrl;

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/ncert-books">NCERT books</Link>
        <span aria-hidden="true">/</span>
        <span>Textbook reader</span>
      </nav>

      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>HOMESCHOOL OS · STUDY READER</span>
          <h1>{title || 'Read textbook'}</h1>
          <p>{grade ? `Class ${grade} · ` : ''}Read an authorised textbook preview inside your learning space.</p>
        </div>
        <Link className={styles.backLink} href="/ncert-books">Back to book index</Link>
      </header>

      {!sourceUrl ? (
        <section className={styles.unavailable} role="status">
          <span className={styles.statusIcon} aria-hidden="true">ⓘ</span>
          <div>
            <h2>Official PDF link unavailable</h2>
            <p>This chapter does not have an individually verified direct PDF link. Return to the book index and use the official NCERT catalogue.</p>
            <a href="https://ncert.nic.in/textbook.php" target="_blank" rel="noopener noreferrer">Open NCERT textbook catalogue ↗</a>
          </div>
        </section>
      ) : (
        <>
          <section className={styles.readerCard} aria-label="Textbook preview">
            <div className={styles.readerToolbar}>
              <div className={styles.sourceIdentity}>
                <span className={styles.documentMark} aria-hidden="true">▤</span>
                <div>
                  <strong>{localPdfUrl ? 'Your downloaded PDF' : 'NCERT official document'}</strong>
                  <span>{localPdfUrl ? localFileName : 'Preview provided by Google Docs Viewer'}</span>
                </div>
              </div>
              <div className={styles.actions}>
                {sourceUrl && (
                  <a className={styles.secondaryAction} href={sourceUrl} target="_blank" rel="noopener noreferrer">
                    Open official PDF ↗
                  </a>
                )}
                <label className={styles.primaryAction}>
                  <input className={styles.fileInput} type="file" accept="application/pdf,.pdf" onChange={handleFile} />
                  {localPdfUrl ? 'Choose another PDF' : 'Open downloaded PDF'}
                </label>
              </div>
            </div>

            {viewerUrl ? (
              <div className={styles.viewerFrame}>
                <iframe
                  key={`${reloadKey}-${localPdfUrl ? 'local' : 'remote'}`}
                  title={`PDF preview: ${title}`}
                  src={viewerUrl}
                  className={styles.viewer}
                  allow="fullscreen"
                />
              </div>
            ) : null}

            <div className={styles.readerFooter}>
              <p>
                {localPdfUrl
                  ? 'Showing the PDF selected from your device. The file stays in this browser session and is not uploaded to HomeSchool OS.'
                  : 'The official PDF is not embedded directly. Google Docs Viewer attempts to display the public document; availability depends on the publisher and viewer service.'}
              </p>
              {localPdfUrl ? (
                <button type="button" className={styles.textAction} onClick={() => {setLocalPdfUrl(null);setLocalFileName('');setReloadKey((value) => value + 1);}}>
                  Return to online preview
                </button>
              ) : (
                <button type="button" className={styles.textAction} onClick={() => setReloadKey((value) => value + 1)}>
                  Retry preview
                </button>
              )}
            </div>
          </section>

          <aside className={styles.helpCard}>
            <span className={styles.helpIcon} aria-hidden="true">↗</span>
            <div>
              <strong>Preview not appearing?</strong>
              <p>Some publisher documents cannot be displayed by third-party viewers. Open the official PDF in a new tab, download it if permitted, then choose the downloaded file above to read it here.</p>
            </div>
          </aside>
        </>
      )}
    </main>
  );
}
