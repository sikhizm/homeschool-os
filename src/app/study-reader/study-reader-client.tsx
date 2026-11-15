'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import styles from './study-reader.module.css';

type Props = {sourceUrl: string | null; title: string; grade: string};
const MAX_PDF_BYTES = 100 * 1024 * 1024;

export default function StudyReaderClient({sourceUrl, title, grade}: Props) {
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  const [localFileName, setLocalFileName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (localPdfUrl) URL.revokeObjectURL(localPdfUrl);
    };
  }, [localPdfUrl]);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError('Choose a PDF file to read.');
      input.value = '';
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError('This PDF is larger than 100 MB. Choose a smaller file.');
      input.value = '';
      return;
    }

    setError('');
    setLocalPdfUrl(URL.createObjectURL(file));
    setLocalFileName(file.name);
  };

  const clearFile = () => {
    setLocalPdfUrl(null);
    setLocalFileName('');
    setError('');
  };

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
          <p>{grade ? `Class ${grade} · ` : ''}Read a downloaded textbook PDF inside Homeschool OS.</p>
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
        <section className={styles.readerCard} aria-label="Textbook reader">
          <div className={styles.readerToolbar}>
            <div className={styles.sourceIdentity}>
              <span className={styles.documentMark} aria-hidden="true">▤</span>
              <div>
                <strong>{localPdfUrl ? 'Textbook ready to read' : 'No textbook opened yet'}</strong>
                <span>{localPdfUrl ? localFileName : 'Download the official PDF, then open it here'}</span>
              </div>
            </div>
            <div className={styles.actions}>
              <a className={styles.secondaryAction} href={sourceUrl} target="_blank" rel="noopener noreferrer">
                Get official PDF ↗
              </a>
              <label className={styles.primaryAction}>
                <input className={styles.fileInput} type="file" accept="application/pdf,.pdf" onChange={handleFile} />
                {localPdfUrl ? 'Choose another PDF' : 'Open downloaded PDF'}
              </label>
              {localPdfUrl ? (
                <button type="button" className={styles.secondaryAction} onClick={clearFile}>Close book</button>
              ) : null}
            </div>
          </div>

          {error ? <p className={styles.errorMessage} role="alert">{error}</p> : null}

          {localPdfUrl ? (
            <div className={styles.viewerFrame}>
              <iframe
                key={localPdfUrl}
                title={`PDF reader: ${title}`}
                src={localPdfUrl}
                className={styles.viewer}
                allow="fullscreen"
              />
            </div>
          ) : (
            <div className={styles.emptyReader}>
              <span className={styles.emptyDocument} aria-hidden="true">▤</span>
              <h2>Your reading space is ready</h2>
              <p>NCERT controls how its PDFs can be embedded, so Homeschool OS does not proxy or embed the publisher's PDF. Open the official file, download it if permitted, then select it here. Your browser will display it in this reading space.</p>
              <label className={styles.emptyAction}>
                <input className={styles.fileInput} type="file" accept="application/pdf,.pdf" onChange={handleFile} />
                Select a PDF from your device
              </label>
            </div>
          )}

          <div className={styles.readerFooter}>
            <p>
              {localPdfUrl
                ? 'This PDF is displayed locally in your browser. It is not uploaded to Homeschool OS or stored in your account.'
                : 'Your textbook is not uploaded to Homeschool OS. Choose a downloaded PDF to start reading; the file remains on your device.'}
            </p>
            {localPdfUrl ? <button type="button" className={styles.textAction} onClick={clearFile}>Close reader</button> : null}
          </div>
        </section>
      )}
    </main>
  );
}
