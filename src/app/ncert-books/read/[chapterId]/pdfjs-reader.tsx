'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';

type PdfPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void>; cancel: () => void };
};
type PdfDocument = {
  numPages: number;
  getPage: (page: number) => Promise<PdfPage>;
  destroy: () => Promise<void>;
};
type PdfLoadingTask = { promise: Promise<PdfDocument> };
type PdfJsApi = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { url: string; withCredentials?: boolean }) => PdfLoadingTask;
};
declare global {
  interface Window { pdfjsLib?: PdfJsApi; }
}

const PDFJS_VERSION = '3.11.174';
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

export default function PdfJsReader({ src, title }: { src: string; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const documentRef = useRef<PdfDocument | null>(null);
  const renderRef = useRef<{ cancel: () => void } | null>(null);
  const [ready, setReady] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [fitWidth, setFitWidth] = useState(true);
  const [status, setStatus] = useState('Loading PDF reader…');
  const [error, setError] = useState('');

  const loadPdf = useCallback(async () => {
    if (!window.pdfjsLib) return;
    setError('');
    setStatus('Loading textbook…');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
    try {
      const task = window.pdfjsLib.getDocument({ url: src, withCredentials: true, rangeChunkSize: 65536 });
      const pdf = await task.promise;
      documentRef.current?.destroy();
      documentRef.current = pdf;
      setPageCount(pdf.numPages);
      setPageNumber(1);
      setStatus('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The PDF could not be loaded.');
      setStatus('');
    }
  }, [src]);

  useEffect(() => () => {
    renderRef.current?.cancel();
    documentRef.current?.destroy();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function renderPage() {
      const pdf = documentRef.current;
      const canvas = canvasRef.current;
      if (!pdf || !canvas || !pageCount) return;
      renderRef.current?.cancel();
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(280, (canvas.parentElement?.clientWidth ?? 800) - 32);
        const scale = fitWidth ? Math.min(2.5, availableWidth / base.width) : zoom;
        const viewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas rendering is unavailable in this browser.');
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const task = page.render({ canvasContext: context, viewport });
        renderRef.current = task;
        await task.promise;
      } catch (cause) {
        if (!(cause instanceof Error && cause.name === 'RenderingCancelledException') && !cancelled) {
          setError(cause instanceof Error ? cause.message : 'This page could not be rendered.');
        }
      }
    }
    void renderPage();
    return () => { cancelled = true; renderRef.current?.cancel(); };
  }, [pageNumber, pageCount, zoom, fitWidth]);

  const changeZoom = (delta: number) => {
    setFitWidth(false);
    setZoom(value => Math.max(0.5, Math.min(2.5, Math.round((value + delta) * 10) / 10)));
  };

  return (
    <section className="pdfjs-reader" aria-label="PDF reader">
      <Script src={`${PDFJS_CDN}/pdf.min.js`} strategy="afterInteractive" onLoad={() => { setReady(true); void loadPdf(); }} onError={() => setError('The PDF reader library could not be loaded. Check your connection and try again.')} />
      <header className="pdfjs-toolbar">
        <div className="pdfjs-toolbar-title"><strong>{title}</strong><span>{pageCount ? `Page ${pageNumber} of ${pageCount}` : status || 'PDF reader'}</span></div>
        <div className="pdfjs-controls">
          <button type="button" onClick={() => setPageNumber(value => Math.max(1, value - 1))} disabled={pageNumber <= 1}>Previous</button>
          <label className="pdfjs-page-input">Page <input aria-label="Page number" type="number" min={1} max={pageCount || 1} value={pageNumber} onChange={event => setPageNumber(Math.max(1, Math.min(pageCount || 1, Number(event.target.value) || 1)))} /> / {pageCount || '—'}</label>
          <button type="button" onClick={() => setPageNumber(value => Math.min(pageCount, value + 1))} disabled={!pageCount || pageNumber >= pageCount}>Next</button>
          <span className="pdfjs-control-divider" />
          <button type="button" onClick={() => { setFitWidth(false); setZoom(value => Math.max(0.5, Math.round((value - 0.1) * 10) / 10)); }} disabled={!fitWidth && zoom <= 0.5}>−</button>
          <button type="button" onClick={() => changeZoom(0.1)} disabled={!fitWidth && zoom >= 2.5}>+</button>
          <button type="button" className={fitWidth ? 'is-active' : ''} onClick={() => setFitWidth(true)}>Fit width</button>
        </div>
      </header>
      <div className="pdfjs-stage">
        {status && <p className="pdfjs-status">{status}</p>}
        {error && <div className="pdfjs-error" role="alert"><strong>Could not display this PDF.</strong><span>{error}</span><button type="button" onClick={() => { if (ready) void loadPdf(); }}>Retry</button></div>}
        <canvas ref={canvasRef} aria-label={`Page ${pageNumber} of ${title}`} />
      </div>
      <footer className="pdfjs-footer"><span>Textbook pages are rendered locally in your browser. No copy is stored by Homeschool OS.</span><span>{pageCount ? `${pageCount} pages` : ''}</span></footer>
    </section>
  );
}
