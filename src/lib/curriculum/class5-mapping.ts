import {chaptersFor,ncertTextbooks,type ChapterSlot,type Textbook} from '@/lib/ncert/textbooks';
import {outcomeById,outcomesForGrade,type CurriculumOutcome} from './outcome-registry';

export const mappingRelationshipTypes=['introduces','develops','reinforces','assesses'] as const;
export type MappingRelationshipType=(typeof mappingRelationshipTypes)[number];

export const mappingReviewStatuses=['draft','in_review','approved','rejected','superseded','unmapped'] as const;
export type MappingReviewStatus=(typeof mappingReviewStatuses)[number];

export type Class5MappingProposal={
 id:string;
 grade:5;
 bookId:string;
 chapterId:string;
 outcomeId:string;
 relationshipType:MappingRelationshipType;
 sourceUrl:string;
 sourceEdition:string;
 evidenceReference:string;
 chapterEvidence:string;
 rationale:string;
 reviewStatus:'draft';
 version:1;
 supersededMappingId:null;
};

export type MappingRevision={
 id:string;
 mappingId:string;
 revision:number;
 grade:number;
 bookId:string;
 chapterId:string;
 outcomeId:string|null;
 relationshipType:MappingRelationshipType|null;
 reviewStatus:MappingReviewStatus;
 sourceUrl:string;
 sourceEdition:string;
 evidenceReference:string;
 chapterEvidence:string;
 rationale:string;
 reviewReason:string;
 actorUserId:string;
 reviewerUserId:string|null;
 reviewedAt:string|null;
 supersedesId:string|null;
 createdAt:string;
};

export type ChapterMappingAccount={
 id:string;
 chapterId:string;
 grade:5;
 bookId:string;
 bookTitle:string;
 subject:string;
 chapterNumber:number;
 chapterTitle:string;
 candidateMappingIds:string[];
 initialStatus:'draft'|'unmapped';
 unmappedReason:string|null;
};

export type MappingReviewItem={
 kind:'mapping';
 id:string;
 status:MappingReviewStatus;
 proposal:Class5MappingProposal;
 chapter:ChapterMappingAccount;
 outcome:CurriculumOutcome|null;
 proposedOutcome:CurriculumOutcome;
 effective:{
  outcomeId:string|null;
  relationshipType:MappingRelationshipType|null;
  sourceUrl:string;
  sourceEdition:string;
  evidenceReference:string;
  chapterEvidence:string;
  rationale:string;
  reviewReason:string;
  reviewerUserId:string|null;
  reviewedAt:string|null;
  revision:number;
 };
 history:MappingRevision[];
};

export type UnmappedChapterItem={
 kind:'unmapped';
 id:string;
 status:'unmapped';
 chapter:ChapterMappingAccount;
};

export type Class5ReviewQueueItem=MappingReviewItem|UnmappedChapterItem;

export const class5Books=ncertTextbooks.filter((book):book is Textbook=>book.grade===5);
const class5BookIds=new Set(class5Books.map(book=>book.id));
const class5Chapters=class5Books.flatMap(book=>chaptersFor(book.id));

function chapterFor(bookId:string,chapterNumber:number):{book:Textbook;chapter:ChapterSlot}{
 const book=class5Books.find(candidate=>candidate.id===bookId);
 const chapter=chaptersFor(bookId).find(candidate=>candidate.chapterNumber===chapterNumber);
 if(!book||!chapter)throw new Error(`Invalid Class 5 mapping seed: ${bookId} chapter ${chapterNumber}`);
 return {book,chapter};
}

function draft(bookId:string,chapterNumber:number,outcomeId:string,relationshipType:MappingRelationshipType):Class5MappingProposal{
 const {book,chapter}=chapterFor(bookId,chapterNumber);
 const outcome=outcomeById(outcomeId);
 if(!outcome)throw new Error(`Unknown outcome in Class 5 mapping seed: ${outcomeId}`);
 const id=`c5-${bookId.replace(/^ncert-5-/,'')}-${String(chapterNumber).padStart(2,'0')}-${outcomeId.replace(/^c5-original-/,'')}`;
 const title=chapter.verifiedTitle??chapter.label;
 return {
  id,grade:5,bookId,chapterId:chapter.id,outcomeId,relationshipType,
  sourceUrl:chapter.sourceUrl,
  sourceEdition:book.editionLabel,
  evidenceReference:`Official NCERT publisher contents: ${book.title}, numbered chapter ${chapterNumber}.`,
  chapterEvidence:`The verified publisher contents names this chapter “${title}”. That title is a preliminary topic signal only; it does not establish textbook coverage or learner attainment.`,
  rationale:`Editorial draft: the chapter title plausibly opens a parent-guided conversation about the original outcome “${outcome.title}”. An authorised parent must inspect the current official chapter and source context before approval.`,
  reviewStatus:'draft',version:1,supersededMappingId:null,
 };
}

/**
 * Editorial, title-led candidates. They are deliberately sparse where a
 * publisher contents title does not give enough language or content evidence.
 * Every row stays draft until an authorised family owner explicitly approves it.
 */
export const class5MappingProposals:Class5MappingProposal[]=[
 // Maths Mela — all candidates point to original, not official, outcomes.
 draft('ncert-5-maths-mela',1,'c5-original-math-route','introduces'),
 draft('ncert-5-maths-mela',2,'c5-original-math-fractions','introduces'),
 draft('ncert-5-maths-mela',3,'c5-original-math-turns','introduces'),
 draft('ncert-5-maths-mela',4,'c5-original-math-route','develops'),
 draft('ncert-5-maths-mela',5,'c5-original-math-measure','introduces'),
 draft('ncert-5-maths-mela',6,'c5-original-math-operations','develops'),
 draft('ncert-5-maths-mela',7,'c5-original-math-pattern','introduces'),
 draft('ncert-5-maths-mela',8,'c5-original-math-measure','develops'),
 draft('ncert-5-maths-mela',9,'c5-original-math-operations','reinforces'),
 draft('ncert-5-maths-mela',10,'c5-original-math-pattern','reinforces'),
 draft('ncert-5-maths-mela',11,'c5-original-math-pattern','develops'),
 draft('ncert-5-maths-mela',12,'c5-original-math-measure','reinforces'),
 draft('ncert-5-maths-mela',13,'c5-original-math-data','develops'),
 draft('ncert-5-maths-mela',14,'c5-original-math-route','reinforces'),
 draft('ncert-5-maths-mela',15,'c5-original-math-data','introduces'),
 // Santoor — one title is intentionally left unmapped below.
 draft('ncert-5-santoor',1,'c5-original-english-story-meaning','introduces'),
 draft('ncert-5-santoor',2,'c5-original-english-story-meaning','develops'),
 draft('ncert-5-santoor',3,'c5-original-english-story-meaning','reinforces'),
 draft('ncert-5-santoor',4,'c5-original-english-story-meaning','develops'),
 draft('ncert-5-santoor',5,'c5-original-english-story-meaning','develops'),
 draft('ncert-5-santoor',7,'c5-original-english-discussion','introduces'),
 draft('ncert-5-santoor',8,'c5-original-english-discussion','develops'),
 draft('ncert-5-santoor',9,'c5-original-english-response','introduces'),
 draft('ncert-5-santoor',10,'c5-original-english-story-meaning','reinforces'),
 // Our Wondrous World.
 draft('ncert-5-our-wondrous-world',1,'c5-original-evs-water','introduces'),
 draft('ncert-5-our-wondrous-world',2,'c5-original-evs-water','develops'),
 draft('ncert-5-our-wondrous-world',3,'c5-original-evs-food','introduces'),
 draft('ncert-5-our-wondrous-world',4,'c5-original-evs-community','introduces'),
 draft('ncert-5-our-wondrous-world',5,'c5-original-evs-place','introduces'),
 draft('ncert-5-our-wondrous-world',6,'c5-original-evs-place','develops'),
 draft('ncert-5-our-wondrous-world',7,'c5-original-evs-energy-materials','introduces'),
 draft('ncert-5-our-wondrous-world',8,'c5-original-evs-energy-materials','develops'),
 draft('ncert-5-our-wondrous-world',9,'c5-original-evs-environment','introduces'),
 draft('ncert-5-our-wondrous-world',10,'c5-original-evs-environment','develops'),
 // Bansuri — art-making candidates are original, not asserted textbook outcomes.
 draft('ncert-5-bansuri',1,'c5-original-arts-observation','introduces'),
 draft('ncert-5-bansuri',2,'c5-original-arts-observation','develops'),
 draft('ncert-5-bansuri',3,'c5-original-arts-visual-story','introduces'),
 draft('ncert-5-bansuri',4,'c5-original-arts-visual-story','develops'),
 draft('ncert-5-bansuri',5,'c5-original-arts-visual-story','reinforces'),
 draft('ncert-5-bansuri',6,'c5-original-arts-making','introduces'),
 draft('ncert-5-bansuri',7,'c5-original-arts-making','develops'),
 draft('ncert-5-bansuri',8,'c5-original-arts-collaboration','introduces'),
 draft('ncert-5-bansuri',9,'c5-original-arts-observation','reinforces'),
 draft('ncert-5-bansuri',10,'c5-original-arts-listening','introduces'),
 draft('ncert-5-bansuri',11,'c5-original-arts-listening','develops'),
 draft('ncert-5-bansuri',12,'c5-original-arts-listening','reinforces'),
 draft('ncert-5-bansuri',13,'c5-original-arts-making','reinforces'),
 draft('ncert-5-bansuri',14,'c5-original-arts-making','develops'),
 draft('ncert-5-bansuri',15,'c5-original-arts-movement','introduces'),
 draft('ncert-5-bansuri',16,'c5-original-arts-movement','develops'),
 draft('ncert-5-bansuri',17,'c5-original-arts-movement','reinforces'),
 draft('ncert-5-bansuri',18,'c5-original-arts-movement','reinforces'),
 draft('ncert-5-bansuri',19,'c5-original-arts-movement','develops'),
 // Khel Yoga.
 draft('ncert-5-khel-yoga',1,'c5-original-pe-movement','introduces'),
 draft('ncert-5-khel-yoga',2,'c5-original-pe-movement','develops'),
 draft('ncert-5-khel-yoga',3,'c5-original-pe-movement','reinforces'),
 draft('ncert-5-khel-yoga',4,'c5-original-pe-movement','develops'),
 draft('ncert-5-khel-yoga',5,'c5-original-pe-games','introduces'),
 draft('ncert-5-khel-yoga',6,'c5-original-pe-yoga','introduces'),
 draft('ncert-5-khel-yoga',7,'c5-original-pe-yoga','develops'),
];

const noLanguageSpecialistEvidence='No mapping proposed. A publisher contents title alone is not enough to select a defensible Hindi or Urdu language outcome; a language-specialist and section-level official source review are required.';
const noDistinctTitleEvidence='No mapping proposed. The publisher contents title is verified, but it does not by itself provide enough topic or source evidence to choose a distinct original outcome.';

function unmappedReason(chapter:ChapterSlot):string|null{
 if(chapter.bookId==='ncert-5-veena'||chapter.bookId==='ncert-5-sitaan')return noLanguageSpecialistEvidence;
 if(chapter.bookId==='ncert-5-santoor'&&chapter.chapterNumber===6)return noDistinctTitleEvidence;
 return null;
}

export const class5ChapterAccounts:ChapterMappingAccount[]=class5Chapters.map(chapter=>{
 const book=class5Books.find(candidate=>candidate.id===chapter.bookId)!;
 const candidateMappingIds=class5MappingProposals.filter(proposal=>proposal.chapterId===chapter.id).map(proposal=>proposal.id);
 const reason=unmappedReason(chapter);
 if(!candidateMappingIds.length&&!reason)throw new Error(`Class 5 chapter has no mapping account: ${chapter.id}`);
 return {
  id:`c5-account-${chapter.id}`,chapterId:chapter.id,grade:5,bookId:book.id,bookTitle:book.title,
  subject:book.subject,chapterNumber:chapter.chapterNumber,chapterTitle:chapter.verifiedTitle??chapter.label,
  candidateMappingIds,initialStatus:candidateMappingIds.length?'draft':'unmapped',unmappedReason:reason,
 };
});

export function class5MappingProposalById(id:string){return class5MappingProposals.find(proposal=>proposal.id===id);}
export function class5ChapterAccountById(chapterId:string){return class5ChapterAccounts.find(account=>account.chapterId===chapterId);}
export function class5MappingSummary(){
 return {
  books:class5Books.length,
  chapters:class5Chapters.length,
  draftMappings:class5MappingProposals.length,
  draftMappedChapters:class5ChapterAccounts.filter(account=>account.candidateMappingIds.length>0).length,
  approvedMappings:0,
  unmappedChapters:class5ChapterAccounts.filter(account=>account.initialStatus==='unmapped').length,
 };
}

function latestRevision(revisions:readonly MappingRevision[]):MappingRevision|undefined{
 return [...revisions].sort((a,b)=>b.revision-a.revision||b.createdAt.localeCompare(a.createdAt))[0];
}

export function class5ReviewQueue(revisions:readonly MappingRevision[]=[]):Class5ReviewQueueItem[]{
 const historyByMapping=new Map<string,MappingRevision[]>();
 for(const revision of revisions){
  if(!class5MappingProposalById(revision.mappingId))continue;
  const list=historyByMapping.get(revision.mappingId)??[];
  list.push(revision);
  historyByMapping.set(revision.mappingId,list);
 }
 const accountsByChapter=new Map(class5ChapterAccounts.map(account=>[account.chapterId,account]));
 const mappings:MappingReviewItem[]=class5MappingProposals.map(proposal=>{
  const history=(historyByMapping.get(proposal.id)??[]).sort((a,b)=>b.revision-a.revision||b.createdAt.localeCompare(a.createdAt));
  const latest=latestRevision(history);
  const chapter=accountsByChapter.get(proposal.chapterId)!;
  const effective={
   // A reviewed `unmapped` decision intentionally stores null outcome and
   // relationship fields; do not fall back to the original draft proposal.
   outcomeId:latest?latest.outcomeId:proposal.outcomeId,
   relationshipType:latest?latest.relationshipType:proposal.relationshipType,
   sourceUrl:latest?latest.sourceUrl:proposal.sourceUrl,
   sourceEdition:latest?latest.sourceEdition:proposal.sourceEdition,
   evidenceReference:latest?latest.evidenceReference:proposal.evidenceReference,
   chapterEvidence:latest?latest.chapterEvidence:proposal.chapterEvidence,
   rationale:latest?latest.rationale:proposal.rationale,
   reviewReason:latest?latest.reviewReason:'',
   reviewerUserId:latest?latest.reviewerUserId:null,
   reviewedAt:latest?latest.reviewedAt:null,
   revision:latest?latest.revision:proposal.version,
  };
  return {
   kind:'mapping',id:proposal.id,status:latest?.reviewStatus??proposal.reviewStatus,proposal,chapter,
   outcome:effective.outcomeId?outcomeById(effective.outcomeId)??null:null,
   proposedOutcome:outcomeById(proposal.outcomeId)!,effective,history,
  };
 });
 const unmapped:UnmappedChapterItem[]=class5ChapterAccounts
  .filter(account=>account.initialStatus==='unmapped')
  .map(chapter=>({kind:'unmapped',id:chapter.id,status:'unmapped',chapter}));
 return [...mappings,...unmapped].sort((a,b)=>a.chapter.bookTitle.localeCompare(b.chapter.bookTitle)||a.chapter.chapterNumber-b.chapter.chapterNumber||a.id.localeCompare(b.id));
}

export type MappingQueueFilter={
 grade?:number;
 subject?:string;
 bookId?:string;
 chapterId?:string;
 status?:MappingReviewStatus;
};

export function filterClass5ReviewQueue(items:readonly Class5ReviewQueueItem[],filters:MappingQueueFilter):Class5ReviewQueueItem[]{
 return items.filter(item=>
  (!filters.grade||item.chapter.grade===filters.grade)
  &&(!filters.subject||item.chapter.subject===filters.subject)
  &&(!filters.bookId||item.chapter.bookId===filters.bookId)
  &&(!filters.chapterId||item.chapter.chapterId===filters.chapterId)
  &&(!filters.status||item.status===filters.status),
 );
}

/** Current family-specific view; unlike the seed summary it reflects reviews already recorded. */
export function class5ReviewQueueMetrics(items:readonly Class5ReviewQueueItem[]){
 const mappings=items.filter((item):item is MappingReviewItem=>item.kind==='mapping');
 const mappingsByChapter=new Map<string,MappingReviewItem[]>();
 for(const mapping of mappings){
  const group=mappingsByChapter.get(mapping.chapter.chapterId)??[];
  group.push(mapping);
  mappingsByChapter.set(mapping.chapter.chapterId,group);
 }
 // A chapter becomes family-unmapped only when every candidate for it was
 // explicitly left unmapped. This preserves correct accounting as the
 // many-to-many model gains additional candidate relationships in the future.
 const unmappedChapterIds=new Set(items.filter(item=>item.kind==='unmapped').map(item=>item.chapter.chapterId));
 for(const [chapterId,candidates] of mappingsByChapter){
  if(candidates.length>0&&candidates.every(candidate=>candidate.status==='unmapped'))unmappedChapterIds.add(chapterId);
 }
 return {
  books:class5Books.length,
  chapters:class5Chapters.length,
  draftMappings:mappings.filter(item=>item.status==='draft').length,
  draftMappedChapters:new Set(mappings.filter(item=>item.status==='draft'||item.status==='in_review').map(item=>item.chapter.chapterId)).size,
  inReviewMappings:mappings.filter(item=>item.status==='in_review').length,
  approvedMappings:mappings.filter(item=>item.status==='approved').length,
  rejectedMappings:mappings.filter(item=>item.status==='rejected').length,
  unmappedChapters:unmappedChapterIds.size,
 };
}

export function validateClass5MappingPilot():string[]{
 const issues:string[]=[];
 const proposalIds=new Set<string>();
 const accountChapterIds=new Set<string>();
 const outcomeIds=new Set(outcomesForGrade(5).map(outcome=>outcome.id));
 if(class5Books.length!==7)issues.push(`Expected 7 Class 5 books, found ${class5Books.length}`);
 if(class5Chapters.length!==86)issues.push(`Expected 86 Class 5 chapters, found ${class5Chapters.length}`);
 if(class5MappingProposals.length!==60)issues.push(`Expected 60 Class 5 draft mappings, found ${class5MappingProposals.length}`);
 if(class5ChapterAccounts.filter(account=>account.initialStatus==='unmapped').length!==26)issues.push(`Expected 26 explicitly unmapped Class 5 chapters, found ${class5ChapterAccounts.filter(account=>account.initialStatus==='unmapped').length}`);
 for(const chapter of class5Chapters){
  if(chapter.status!=='source-verified'||!chapter.verifiedTitle)issues.push(`Class 5 chapter is not source-verified: ${chapter.id}`);
  if(!chapter.sourceUrl.startsWith('https://ncert.nic.in/'))issues.push(`Class 5 chapter source is not an official NCERT URL: ${chapter.id}`);
 }
 for(const proposal of class5MappingProposals){
  if(proposalIds.has(proposal.id))issues.push(`Duplicate mapping ID: ${proposal.id}`);
  proposalIds.add(proposal.id);
  const account=class5ChapterAccountById(proposal.chapterId);
  if(!account)issues.push(`Mapping has unknown chapter: ${proposal.id}`);
  if(!class5BookIds.has(proposal.bookId)||account?.bookId!==proposal.bookId)issues.push(`Mapping has mismatched book: ${proposal.id}`);
  if(!outcomeIds.has(proposal.outcomeId))issues.push(`Mapping has invalid Class 5 outcome: ${proposal.id}`);
  const outcome=outcomeById(proposal.outcomeId);
  if(outcome?.kind!=='original')issues.push(`Pilot mapping is not an original outcome: ${proposal.id}`);
  if(proposal.reviewStatus!=='draft')issues.push(`Seed mapping is not draft: ${proposal.id}`);
  if(!proposal.sourceUrl.startsWith('https://ncert.nic.in/')||!proposal.sourceEdition||!proposal.evidenceReference||!proposal.chapterEvidence||!proposal.rationale)issues.push(`Mapping lacks provenance: ${proposal.id}`);
 }
 for(const account of class5ChapterAccounts){
  if(accountChapterIds.has(account.chapterId))issues.push(`Duplicate Class 5 chapter account: ${account.chapterId}`);
  accountChapterIds.add(account.chapterId);
  const exists=class5Chapters.some(chapter=>chapter.id===account.chapterId);
  if(!exists)issues.push(`Unknown chapter account: ${account.chapterId}`);
  if(account.initialStatus==='unmapped'&&(!account.unmappedReason||account.candidateMappingIds.length))issues.push(`Invalid unmapped account: ${account.chapterId}`);
  if(account.initialStatus==='draft'&&(!account.candidateMappingIds.length||account.unmappedReason))issues.push(`Invalid draft account: ${account.chapterId}`);
  for(const mappingId of account.candidateMappingIds){
   const proposal=class5MappingProposalById(mappingId);
   if(!proposal||proposal.chapterId!==account.chapterId)issues.push(`Broken account mapping reference: ${account.chapterId} -> ${mappingId}`);
  }
 }
 if(accountChapterIds.size!==class5Chapters.length)issues.push(`Not every Class 5 chapter is accounted for: ${accountChapterIds.size}/${class5Chapters.length}`);
 return issues;
}
