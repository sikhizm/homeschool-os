'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import type {Class5ReviewQueueItem,MappingRelationshipType,MappingReviewStatus,MappingReviewItem} from '@/lib/curriculum/class5-mapping';
import type {CurriculumOutcome} from '@/lib/curriculum/outcome-registry';

type Book={id:string;title:string;subject:string;editionLabel:string;sourceUrl:string};
type Summary={books:number;chapters:number;draftMappings:number;draftMappedChapters:number;approvedMappings:number;unmappedChapters:number;inReviewMappings?:number;rejectedMappings?:number};
type QueueResponse={items:Class5ReviewQueueItem[];summary:Summary;outcomes:CurriculumOutcome[];books:Book[];error?:string};
type FilterState={subject:string;book:string;status:string;chapter:string};
type Editor={outcomeId:string;relationshipType:MappingRelationshipType;sourceUrl:string;sourceEdition:string;evidenceReference:string;chapterEvidence:string;rationale:string;reviewReason:string;confirmedHumanReview:boolean};

const statusChoices:['',...MappingReviewStatus[]]=['','draft','in_review','approved','rejected','superseded','unmapped'];
const relationshipChoices:MappingRelationshipType[]=['introduces','develops','reinforces','assesses'];
const statusLabel:Record<MappingReviewStatus,string>={draft:'Draft',in_review:'In review',approved:'Approved',rejected:'Rejected',superseded:'Superseded',unmapped:'Unmapped'};

function formatDate(value:string|null){
 if(!value)return 'Not yet reviewed';
 const date=new Date(value);
 return Number.isNaN(date.getTime())?'Recorded review':date.toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
}
function auditActorLabel(reviewerUserId:string|null){
 if(!reviewerUserId)return 'edited by family owner';
 return `reviewed by family owner · audit ${reviewerUserId.slice(0,12)}`;
}
function initialEditor(item:MappingReviewItem):Editor{
 return {
  outcomeId:item.effective.outcomeId??item.proposal.outcomeId,
  relationshipType:item.effective.relationshipType??item.proposal.relationshipType,
  sourceUrl:item.effective.sourceUrl,sourceEdition:item.effective.sourceEdition,
  evidenceReference:item.effective.evidenceReference,chapterEvidence:item.effective.chapterEvidence,
  rationale:item.effective.rationale,reviewReason:item.effective.reviewReason,confirmedHumanReview:false,
 };
}
function sourceKind(outcome:CurriculumOutcome|null){
 if(!outcome)return 'No outcome selected';
 return outcome.kind==='official'?'Official source-verified outcome':outcome.kind==='original'?'Original Homeschool OS outcome':'Framework context only';
}

function MappingCard({item,outcomes,saving,onSave}:{item:MappingReviewItem;outcomes:CurriculumOutcome[];saving:boolean;onSave:(mappingId:string,action:string,editor:Editor)=>Promise<void>}){
 const [editing,setEditing]=useState(false);
 const [editor,setEditor]=useState<Editor>(()=>initialEditor(item));
 const [localError,setLocalError]=useState('');
 const cardId=`mapping-${item.id}`;
 const update=(field:Exclude<keyof Editor,'confirmedHumanReview'>,value:string)=>setEditor(current=>({...current,[field]:value}));
 const submit=async(action:string)=>{
  setLocalError('');
  if((action==='reject'||action==='mark_unmapped')&&!editor.reviewReason.trim()){
   setLocalError(action==='reject'?'Add a reason for rejecting this proposal.':'Record why this chapter should stay unmapped.');
   return;
  }
  if(action==='approve'&&!editor.confirmedHumanReview){
   setLocalError('Confirm that you inspected the source and rationale before approving.');
   return;
  }
  if(action==='approve'&&!editor.reviewReason.trim()){
   setLocalError('Record the source-review note that supports this approval.');
   return;
  }
  await onSave(item.id,action,editor);
  if(action==='save_draft'||action==='submit_for_review'||action==='approve'||action==='reject'||action==='mark_unmapped')setEditing(false);
 };
 const currentOutcome=item.outcome;
 return <article className="mapping-review-card" aria-labelledby={`${cardId}-title`}>
  <header className="mapping-card-heading">
   <div>
    <span className="eyebrow">{item.chapter.subject} · {item.chapter.bookTitle} · {String(item.chapter.chapterNumber).padStart(2,'0')}</span>
    <h2 id={`${cardId}-title`}>{item.chapter.chapterTitle}</h2>
    <p className="mapping-card-id">Mapping ID: {item.id}</p>
   </div>
   <span className={`mapping-status status-${item.status}`}>{statusLabel[item.status]}</span>
  </header>
  <div className="mapping-outcome-summary">
   <span className="mapping-arrow" aria-hidden="true">→</span>
   <div>
    <span className="eyebrow">{sourceKind(currentOutcome)}</span>
    <strong>{currentOutcome?.title??'No current outcome selected'}</strong>
    <p>{currentOutcome?.measurableOutcome??'This candidate was explicitly marked unmapped by a family owner. Its earlier proposal remains in the revision history.'}</p>
    <small>{item.effective.relationshipType?`${item.effective.relationshipType[0].toUpperCase()}${item.effective.relationshipType.slice(1)} relationship`:'No relationship asserted'}</small>
   </div>
  </div>
  <div className="mapping-trust-row">
   <span>Version {item.effective.revision}</span>
   <span>{item.effective.reviewedAt?`Decision recorded ${formatDate(item.effective.reviewedAt)}`:'No human approval has been recorded'}</span>
  </div>
  <details className="mapping-evidence" open={editing}>
   <summary>Evidence, provenance &amp; rationale <span aria-hidden="true">⌄</span></summary>
   <dl>
    <div><dt>Official chapter source</dt><dd><a href={item.effective.sourceUrl} target="_blank" rel="noopener noreferrer">Open source ↗</a></dd></div>
    <div><dt>Edition</dt><dd>{item.effective.sourceEdition}</dd></div>
    <div><dt>Evidence reference</dt><dd>{item.effective.evidenceReference}</dd></div>
    <div><dt>Chapter evidence</dt><dd>{item.effective.chapterEvidence}</dd></div>
    <div><dt>Mapping rationale</dt><dd>{item.effective.rationale}</dd></div>
    {item.effective.reviewReason&&<div><dt>Review note</dt><dd>{item.effective.reviewReason}</dd></div>}
   </dl>
  </details>
  {!editing?<div className="mapping-actions">
   <button type="button" className="mapping-secondary-action" onClick={()=>{setEditor(initialEditor(item));setEditing(true);}}>Inspect / edit draft</button>
   <Link href={`/ncert-books/chapter/${item.chapter.chapterId}`}>Open chapter →</Link>
  </div>:<form className="mapping-editor" onSubmit={event=>{event.preventDefault();void submit('save_draft');}}>
   <div className="mapping-editor-heading"><div><span className="eyebrow">OWNER REVIEW WORKSPACE</span><h3>Edit before deciding</h3><p>Editing creates a new append-only revision. It does not alter learner progress or mark any outcome as mastered.</p></div><button type="button" className="mapping-text-action" onClick={()=>setEditing(false)}>Close</button></div>
   <div className="mapping-editor-grid">
    <label className="workspace-field"><span>Outcome</span><select value={editor.outcomeId} onChange={event=>update('outcomeId',event.target.value)}>{outcomes.map(outcome=><option key={outcome.id} value={outcome.id}>{outcome.title} · {outcome.kind==='original'?'Original':'Official'}</option>)}</select></label>
    <label className="workspace-field"><span>Relationship</span><select value={editor.relationshipType} onChange={event=>update('relationshipType',event.target.value)}>{relationshipChoices.map(choice=><option key={choice} value={choice}>{choice[0].toUpperCase()+choice.slice(1)}</option>)}</select></label>
    <label className="workspace-field mapping-editor-wide"><span>Official source URL</span><input type="url" value={editor.sourceUrl} onChange={event=>update('sourceUrl',event.target.value)} required/></label>
    <label className="workspace-field mapping-editor-wide"><span>Source edition / year</span><input value={editor.sourceEdition} onChange={event=>update('sourceEdition',event.target.value)} maxLength={800} required/></label>
    <label className="workspace-field mapping-editor-wide"><span>Evidence reference or source section</span><textarea value={editor.evidenceReference} onChange={event=>update('evidenceReference',event.target.value)} maxLength={1500} required/></label>
    <label className="workspace-field mapping-editor-wide"><span>Short chapter evidence</span><textarea value={editor.chapterEvidence} onChange={event=>update('chapterEvidence',event.target.value)} maxLength={2000} required/></label>
    <label className="workspace-field mapping-editor-wide"><span>Why this relationship is defensible</span><textarea value={editor.rationale} onChange={event=>update('rationale',event.target.value)} maxLength={2500} required/></label>
    <label className="workspace-field mapping-editor-wide"><span>Review decision note (required to approve, reject or mark unmapped)</span><textarea value={editor.reviewReason} onChange={event=>update('reviewReason',event.target.value)} maxLength={1500} placeholder="Explain the decision for the audit trail."/></label>
   </div>
   <label className="mapping-confirm"><input type="checkbox" checked={editor.confirmedHumanReview} onChange={event=>setEditor(current=>({...current,confirmedHumanReview:event.target.checked}))}/><span>I inspected the source, edition, evidence and rationale myself. Approving this maps curriculum context only; it does not award learner progress, competence or mastery.</span></label>
   {localError&&<p className="mapping-form-error" role="alert">{localError}</p>}
   <div className="mapping-decision-actions">
    <button type="submit" disabled={saving}>{saving?'Saving…':'Save draft'}</button>
    <button type="button" className="mapping-secondary-action" disabled={saving} onClick={()=>void submit('submit_for_review')}>Mark in review</button>
    <button type="button" className="mapping-approve-action" disabled={saving} onClick={()=>void submit('approve')}>Approve after review</button>
    <button type="button" className="mapping-reject-action" disabled={saving} onClick={()=>void submit('reject')}>Reject</button>
    <button type="button" className="mapping-text-action" disabled={saving} onClick={()=>void submit('mark_unmapped')}>Leave unmapped</button>
   </div>
  </form>}
  {item.history.length>0&&<details className="mapping-history"><summary>Revision history · {item.history.length} {item.history.length===1?'entry':'entries'} <span aria-hidden="true">⌄</span></summary><ol>{item.history.map(revision=><li key={revision.id}><strong>v{revision.revision} · {statusLabel[revision.reviewStatus]}</strong><span>{formatDate(revision.reviewedAt??revision.createdAt)} · {auditActorLabel(revision.reviewerUserId)}</span>{revision.supersedesId&&<p>Supersedes audit revision {revision.supersedesId}</p>}{revision.reviewReason&&<p>{revision.reviewReason}</p>}</li>)}</ol></details>}
 </article>;
}

function UnmappedCard({item}:{item:Extract<Class5ReviewQueueItem,{kind:'unmapped'}>}){
 return <article className="mapping-review-card mapping-unmapped-card">
  <header className="mapping-card-heading"><div><span className="eyebrow">{item.chapter.subject} · {item.chapter.bookTitle} · {String(item.chapter.chapterNumber).padStart(2,'0')}</span><h2>{item.chapter.chapterTitle}</h2></div><span className="mapping-status status-unmapped">Unmapped</span></header>
  <p className="mapping-unmapped-copy">{item.chapter.unmappedReason}</p>
  <p className="muted">This is an honest evidence gap, not a claim that the chapter has no educational value. It remains visible for future specialist review.</p>
  <Link className="mapping-chapter-link" href={`/ncert-books/chapter/${item.chapter.chapterId}`}>Open verified chapter record →</Link>
 </article>;
}

export default function CurriculumMappingReview({initialChapter=''}:{initialChapter?:string}){
 const [filters,setFilters]=useState<FilterState>({subject:'',book:'',status:'',chapter:initialChapter});
 const [data,setData]=useState<QueueResponse|null>(null);
 const [loading,setLoading]=useState(true);
 const [savingId,setSavingId]=useState('');
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [reloadKey,setReloadKey]=useState(0);
 useEffect(()=>{
  let active=true;
  const query=new URLSearchParams();
  if(filters.subject)query.set('subject',filters.subject);
  if(filters.book)query.set('book',filters.book);
  if(filters.status)query.set('status',filters.status);
  if(filters.chapter)query.set('chapter',filters.chapter);
  void fetch(`/api/curriculum-mappings${query.size?`?${query}`:''}`,{cache:'no-store'})
   .then(async response=>{
    const json=await response.json() as QueueResponse;
    if(!response.ok)throw new Error(json.error||'Unable to load the review queue.');
    return json;
   })
   .then(json=>{if(active){setError('');setData(json);}})
   .catch(cause=>{if(active)setError(cause instanceof Error?cause.message:'Unable to load the review queue.');})
   .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[filters,reloadKey]);
 const subjects=useMemo(()=>Array.from(new Set((data?.books??[]).map(book=>book.subject))).sort(),[data]);
 const books=(data?.books??[]).filter(book=>!filters.subject||book.subject===filters.subject);
 const changeFilters=(change:(current:FilterState)=>FilterState)=>{setLoading(true);setFilters(change);};
 const save=async(mappingId:string,action:string,editor:Editor)=>{
  setSavingId(mappingId);setError('');setNotice('');
  try{
   const response=await fetch('/api/curriculum-mappings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mappingId,action,...editor})});
   const json=await response.json() as {error?:string};
   if(!response.ok)throw new Error(json.error||'Unable to save the review.');
   setNotice(action==='approve'?'Approval recorded in this family’s audit history. No learner progress was changed.':'A new mapping revision was recorded.');
   setLoading(true);
   setReloadKey(current=>current+1);
  }catch(cause){setError(cause instanceof Error?cause.message:'Unable to save the review.');}
  finally{setSavingId('');}
 };
 return <main className="family-dashboard mapping-review-page">
  <div className="dashboard-welcome"><div><span className="tag">CURRICULUM LIBRARY · PARENT REVIEW</span><h1>Class 5 outcome mapping</h1><p className="muted">Review evidence before accepting a relationship. Draft mappings are editorial proposals, not official NCERT outcomes, curriculum equivalencies or evidence of what a learner knows.</p></div><span className="mapping-hero-mark" aria-hidden="true">⌁</span></div>
  <section className="mapping-honesty-panel">
   <div><span className="eyebrow">HUMAN DECISION REQUIRED</span><h2>Mapping curriculum is not assessing a learner</h2><p>Approving a mapping records a parent’s curriculum decision for this family. It never marks a chapter complete, awards mastery, changes revision rules, or creates learner evidence.</p></div>
   <Link href="/ncert-books?grade=5">Open Class 5 book index →</Link>
  </section>
  <section className="mapping-summary-grid" aria-label="Class 5 mapping audit summary">
   <div><strong>{data?.summary.chapters??86}</strong><span>Verified Class 5 chapters accounted for</span></div>
   <div><strong>{data?.summary.draftMappings??0}</strong><span>Draft mapping proposals</span></div>
   <div><strong>{data?.summary.approvedMappings??0}</strong><span>Family-approved mappings</span></div>
   <div><strong>{data?.summary.unmappedChapters??0}</strong><span>Chapters honestly left unmapped</span></div>
  </section>
  <section className="workspace-panel mapping-filter-panel">
   <div><span className="eyebrow">REVIEW QUEUE</span><h2>Filter the evidence</h2><p className="muted">Use grade, subject, book and review state to work through one source-backed decision at a time.</p></div>
   <div className="mapping-filter-grid">
    <label className="workspace-field"><span>Grade</span><select value="5" disabled><option value="5">Class 5 pilot</option></select></label>
    <label className="workspace-field"><span>Subject</span><select value={filters.subject} onChange={event=>changeFilters(current=>({...current,subject:event.target.value,book:''}))}><option value="">All subjects</option>{subjects.map(subject=><option key={subject} value={subject}>{subject}</option>)}</select></label>
    <label className="workspace-field"><span>Book</span><select value={filters.book} onChange={event=>changeFilters(current=>({...current,book:event.target.value}))}><option value="">All Class 5 books</option>{books.map(book=><option key={book.id} value={book.id}>{book.title}</option>)}</select></label>
    <label className="workspace-field"><span>Review status</span><select value={filters.status} onChange={event=>changeFilters(current=>({...current,status:event.target.value}))}><option value="">All states</option>{statusChoices.filter((choice):choice is MappingReviewStatus=>choice!=='').map(choice=><option key={choice} value={choice}>{statusLabel[choice]}</option>)}</select></label>
   </div>
   {filters.chapter&&<p className="mapping-filter-note">Showing the chapter selected from the NCERT catalogue. <button type="button" onClick={()=>changeFilters(current=>({...current,chapter:''}))}>Clear chapter filter</button></p>}
  </section>
  {notice&&<p className="mapping-notice" role="status">{notice}</p>}
  {error&&<section className="workspace-panel mapping-error" role="alert"><h2>Review queue unavailable</h2><p>{error}</p><p className="muted">No mapping was approved or changed. Confirm that migration 008 has been applied before using this parent-only workspace.</p></section>}
  {loading?<section className="workspace-panel"><p className="muted">Loading Class 5 review records…</p></section>:data&&!error?<div className="mapping-review-list">{data.items.map(item=>item.kind==='mapping'
   ?<MappingCard key={`${item.id}-${item.effective.revision}-${item.status}`} item={item} outcomes={data.outcomes} saving={savingId===item.id} onSave={save}/>
   :<UnmappedCard key={item.id} item={item}/>)}</div>:null}
  {!loading&&data&&!error&&data.items.length===0&&<section className="workspace-panel"><h2>No mappings match those filters</h2><p>Clear a filter to see the full Class 5 review queue. This does not change any source records.</p></section>}
  <section className="workspace-panel mapping-safeguards"><span className="eyebrow">PROVENANCE SAFEGUARDS</span><h2>What this pilot does not claim</h2><ul><li>The original Class 5 outcomes are authored by Homeschool OS; they are not NCERT outcome identifiers.</li><li>The seven international framework lenses remain context only. This pilot creates no Cambridge, IB, Singapore or Common Core equivalency.</li><li>An approved family mapping is a review decision, not proof of curriculum coverage, child competence or mastery.</li><li>Unmapped chapters remain visible with a reason instead of being forced into a broad competency.</li></ul></section>
 </main>;
}
