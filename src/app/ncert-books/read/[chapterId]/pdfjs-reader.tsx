'use client';

import Script from 'next/script';
import {useCallback,useEffect,useRef,useState} from 'react';

type Viewport={width:number;height:number};
type PdfPage={getViewport:(options:{scale:number})=>Viewport;render:(options:{canvasContext:CanvasRenderingContext2D;viewport:Viewport})=>{promise:Promise<void>;cancel:()=>void}};
type PdfDocument={numPages:number;getPage:(page:number)=>Promise<PdfPage>;destroy:()=>Promise<void>};
type PdfLoadingTask={promise:Promise<PdfDocument>};
type PdfJsApi={GlobalWorkerOptions:{workerSrc:string};getDocument:(options:{url:string;withCredentials?:boolean;rangeChunkSize?:number})=>PdfLoadingTask};
declare global {interface Window{pdfjsLib?:PdfJsApi}}

const VERSION='3.11.174';
const CDN=`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${VERSION}`;

export default function PdfJsReader({src,title}:{src:string;title:string}) {
  const doc=useRef<PdfDocument|null>(null);
  const canvases=useRef<Map<number,HTMLCanvasElement>>(new Map());
  const rendered=useRef<Set<number>>(new Set());
  const tasks=useRef<Map<number,{cancel:()=>void}>>(new Map());
  const [ready,setReady]=useState(false);
  const [count,setCount]=useState(0);
  const [page,setPage]=useState(1);
  const [zoom,setZoom]=useState(1);
  const [fit,setFit]=useState(true);
  const [mode,setMode]=useState<'continuous'|'single'>('continuous');
  const [status,setStatus]=useState('Loading PDF reader…');
  const [error,setError]=useState('');
  const [visible,setVisible]=useState<number[]>([]);

  const load=useCallback(async()=>{
    if(!window.pdfjsLib)return;
    setError('');setStatus('Loading textbook…');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc=`${CDN}/pdf.worker.min.js`;
    try{
      const pdf=await window.pdfjsLib.getDocument({url:src,withCredentials:true,rangeChunkSize:65536}).promise;
      doc.current?.destroy();doc.current=pdf;rendered.current.clear();setCount(pdf.numPages);setPage(1);setStatus('');
    }catch(e){setError(e instanceof Error?e.message:'The PDF could not be loaded.');setStatus('');}
  },[src]);

  useEffect(()=>()=>{tasks.current.forEach(t=>t.cancel());doc.current?.destroy();},[]);

  const canvasRef=useCallback((number:number)=>(node:HTMLCanvasElement|null)=>{
    if(node)canvases.current.set(number,node);else canvases.current.delete(number);
  },[]);

  useEffect(()=>{
    if(!count||mode!=='continuous')return;
    const nodes=[...canvases.current.entries()];
    const observer=new IntersectionObserver(entries=>{
      const seen=entries.filter(e=>e.isIntersecting).map(e=>Number((e.target as HTMLElement).dataset.page));
      if(seen.length){setVisible(current=>[...new Set([...current,...seen])]);}
      const mostVisible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(mostVisible)setPage(Number((mostVisible.target as HTMLElement).dataset.page));
    },{root:document.querySelector('.pdfjs-stage'),rootMargin:'500px 0px',threshold:[0.1,0.5,0.85]});
    nodes.forEach(([,node])=>observer.observe(node));
    return()=>observer.disconnect();
  },[count,mode]);

  useEffect(()=>{
    if(!count||mode!=='single')return;
    setVisible([page]);
  },[count,mode,page]);

  useEffect(()=>{
    let cancelled=false;
    async function render(number:number){
      const pdf=doc.current,canvas=canvases.current.get(number);
      if(!pdf||!canvas||rendered.current.has(number))return;
      try{
        const pdfPage=await pdf.getPage(number);if(cancelled)return;
        const base=pdfPage.getViewport({scale:1});
        const available=Math.max(280,(canvas.parentElement?.clientWidth??800)-32);
        const scale=fit?Math.min(2.5,available/base.width):zoom;
        const viewport=pdfPage.getViewport({scale});
        const ratio=window.devicePixelRatio||1;
        canvas.width=Math.floor(viewport.width*ratio);canvas.height=Math.floor(viewport.height*ratio);
        canvas.style.width=`${viewport.width}px`;canvas.style.height=`${viewport.height}px`;
        const context=canvas.getContext('2d');if(!context)throw new Error('Canvas rendering is unavailable.');
        context.setTransform(ratio,0,0,ratio,0,0);
        const task=pdfPage.render({canvasContext:context,viewport});tasks.current.set(number,task);
        await task.promise;if(!cancelled)rendered.current.add(number);
      }catch(e){if(!(e instanceof Error&&e.name==='RenderingCancelledException')&&!cancelled)setError(e instanceof Error?e.message:'A page could not be rendered.');}
    }
    visible.forEach(n=>void render(n));
    return()=>{cancelled=true;};
  },[visible,fit,zoom,count]);

  const changeZoom=(delta:number)=>{tasks.current.forEach(t=>t.cancel());tasks.current.clear();rendered.current.clear();setFit(false);setZoom(v=>Math.max(.5,Math.min(2.5,Math.round((v+delta)*10)/10)));setVisible(mode==='single'?[page]:Array.from({length:count},(_,i)=>i+1));};
  const go=(next:number)=>{const target=Math.max(1,Math.min(count,next));setPage(target);if(mode==='continuous')document.getElementById(`pdf-page-${target}`)?.scrollIntoView({behavior:'smooth',block:'start'});};
  const setView=(next:'continuous'|'single')=>{setMode(next);setVisible(next==='single'?[page]:Array.from({length:count},(_,i)=>i+1));};

  return <section className="pdfjs-reader" aria-label="PDF reader">
    <Script src={`${CDN}/pdf.min.js`} strategy="afterInteractive" onLoad={()=>{setReady(true);void load();}} onError={()=>setError('The PDF reader library could not be loaded. Check your connection and retry.')}/>
    <header className="pdfjs-toolbar">
      <div className="pdfjs-toolbar-title"><strong>{title}</strong><span>{count?`Page ${page} of ${count}`:status||'PDF reader'}</span></div>
      <div className="pdfjs-controls">
        <div className="pdfjs-mode-switch" role="group" aria-label="Reading mode">
          <button type="button" className={mode==='continuous'?'is-active':''} onClick={()=>setView('continuous')}>Continuous</button>
          <button type="button" className={mode==='single'?'is-active':''} onClick={()=>setView('single')}>Page by page</button>
        </div>
        <button type="button" onClick={()=>go(page-1)} disabled={page<=1}>Previous</button>
        <label className="pdfjs-page-input">Page <input aria-label="Page number" type="number" min={1} max={count||1} value={page} onChange={e=>go(Number(e.target.value)||1)}/> / {count||'—'}</label>
        <button type="button" onClick={()=>go(page+1)} disabled={!count||page>=count}>Next</button>
        <span className="pdfjs-control-divider"/>
        <button type="button" onClick={()=>changeZoom(-.1)} disabled={!fit&&zoom<=.5}>−</button>
        <button type="button" onClick={()=>changeZoom(.1)} disabled={!fit&&zoom>=2.5}>+</button>
        <button type="button" className={fit?'is-active':''} onClick={()=>{tasks.current.forEach(t=>t.cancel());rendered.current.clear();setFit(true);setVisible(mode==='single'?[page]:Array.from({length:count},(_,i)=>i+1));}}>Fit width</button>
      </div>
    </header>
    <div className="pdfjs-stage">
      {status&&<p className="pdfjs-status">{status}</p>}
      {error&&<div className="pdfjs-error" role="alert"><strong>Could not display this PDF.</strong><span>{error}</span><button type="button" onClick={()=>{if(ready)void load();}}>Retry</button></div>}
      {mode==='continuous'?Array.from({length:count},(_,i)=>i+1).map(n=><div className="pdfjs-page" id={`pdf-page-${n}`} key={n}><span className="pdfjs-page-label">Page {n}</span><canvas ref={canvasRef(n)} data-page={n} aria-label={`Page ${n} of ${title}`}/></div>):<div className="pdfjs-page"><canvas ref={canvasRef(page)} data-page={page} aria-label={`Page ${page} of ${title}`}/></div>}
    </div>
    <footer className="pdfjs-footer"><span>Pages render progressively as you scroll. No copy is stored by Homeschool OS.</span><span>{count?`${count} pages`:''}</span></footer>
  </section>;
}
