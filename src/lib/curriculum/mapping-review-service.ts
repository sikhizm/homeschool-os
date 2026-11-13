import {randomUUID} from 'node:crypto';
import {
 class5MappingProposalById,class5ReviewQueue,mappingRelationshipTypes,mappingReviewStatuses,
 type MappingRelationshipType,type MappingRevision,type MappingReviewStatus,
} from './class5-mapping';
import {outcomeById} from './outcome-registry';

/** Minimal tagged-SQL contract shared by Neon in production and PGlite tests. */
export type MappingSql=<T extends Record<string,unknown>=Record<string,unknown>>(
 strings:TemplateStringsArray,...values:unknown[]
)=>Promise<T[]>;

type OwnerFamily={id:string};
export const mappingReviewActions=['save_draft','submit_for_review','approve','reject','mark_unmapped','supersede'] as const;
export type MappingReviewAction=(typeof mappingReviewActions)[number];

export type MappingReviewMutation={
 mappingId:unknown;
 action:unknown;
 outcomeId?:unknown;
 relationshipType?:unknown;
 sourceUrl?:unknown;
 sourceEdition?:unknown;
 evidenceReference?:unknown;
 chapterEvidence?:unknown;
 rationale?:unknown;
 reviewReason?:unknown;
 confirmedHumanReview?:unknown;
};

type DraftFields={
 outcomeId:string|null;
 relationshipType:MappingRelationshipType|null;
 sourceUrl:string;
 sourceEdition:string;
 evidenceReference:string;
 chapterEvidence:string;
 rationale:string;
 reviewReason:string;
};

export type MappingReviewMutationResult=
 |{ok:true;revision:MappingRevision}
 |{ok:false;code:'forbidden'|'invalid';message:string};

function text(value:unknown,limit:number):string|null{
 if(typeof value!=='string')return null;
 const normalized=value.trim();
 return normalized.length<=limit?normalized:null;
}
function optionalText(value:unknown,limit:number):{provided:boolean;valid:boolean;value:string|null}{
 if(value===undefined)return {provided:false,valid:true,value:null};
 const normalized=text(value,limit);
 if(normalized===null)return {provided:true,valid:false,value:null};
 return {provided:true,valid:true,value:normalized===''?null:normalized};
}
function timestamp(value:unknown):string|null{
 if(value===null||value===undefined||value==='')return null;
 return value instanceof Date?value.toISOString():String(value);
}
function status(value:unknown):MappingReviewStatus|null{
 return typeof value==='string'&&(mappingReviewStatuses as readonly string[]).includes(value)?value as MappingReviewStatus:null;
}
function relationship(value:unknown):MappingRelationshipType|null{
 return typeof value==='string'&&(mappingRelationshipTypes as readonly string[]).includes(value)?value as MappingRelationshipType:null;
}
function isOfficialNcertChapterUrl(value:string){
 try{
  const url=new URL(value);
  return url.protocol==='https:'&&url.hostname==='ncert.nic.in'&&!url.port;
 }catch{return false;}
}

function revisionFromRow(row:Record<string,unknown>):MappingRevision{
 const relation=relationship(row.relationship_type);
 const reviewStatus=status(row.review_status);
 if(!reviewStatus)throw new Error('Invalid curriculum mapping review status in database.');
 return {
  id:String(row.id),mappingId:String(row.mapping_id),revision:Number(row.revision),grade:Number(row.grade),
  bookId:String(row.book_id),chapterId:String(row.chapter_id),outcomeId:row.outcome_id===null?null:String(row.outcome_id),
  relationshipType:relation,reviewStatus,sourceUrl:String(row.source_url),sourceEdition:String(row.source_edition),
  evidenceReference:String(row.evidence_reference??''),chapterEvidence:String(row.chapter_evidence??''),
  rationale:String(row.rationale??''),reviewReason:String(row.review_reason??''),actorUserId:String(row.actor_user_id),
  reviewerUserId:row.reviewer_user_id===null?null:String(row.reviewer_user_id),reviewedAt:timestamp(row.reviewed_at),
  supersedesId:row.supersedes_id===null?null:String(row.supersedes_id),createdAt:timestamp(row.created_at)??'',
 };
}

async function ownerFamily(sql:MappingSql,userId:string):Promise<OwnerFamily|null>{
 const rows=await sql`
  SELECT f.id::text AS id
  FROM families f JOIN family_members fm ON fm.family_id=f.id
  WHERE fm.auth_user_id=${userId} AND fm.role='owner'
  ORDER BY fm.created_at,fm.family_id
  LIMIT 1
 `;
 return rows[0]?{id:String(rows[0].id)}:null;
}

async function revisionsForFamily(sql:MappingSql,familyId:string):Promise<MappingRevision[]>{
 const rows=await sql`
  SELECT id::text AS id,mapping_id,revision,grade,book_id,chapter_id,outcome_id,relationship_type,
    review_status,source_url,source_edition,evidence_reference,chapter_evidence,rationale,review_reason,
    actor_user_id,reviewer_user_id,reviewed_at::text,supersedes_id::text,created_at::text
  FROM curriculum_mapping_reviews
  WHERE family_id::text=${familyId}
  ORDER BY mapping_id,revision DESC,created_at DESC
 `;
 return rows.map(revisionFromRow);
}

export async function readClass5ReviewQueue(sql:MappingSql,userId:string){
 const family=await ownerFamily(sql,userId);
 if(!family)return {authorized:false as const,items:[],revisions:[]};
 const revisions=await revisionsForFamily(sql,family.id);
 return {authorized:true as const,items:class5ReviewQueue(revisions),revisions};
}

function actionStatus(action:MappingReviewAction):MappingReviewStatus{
 switch(action){
  case 'save_draft':return 'draft';
  case 'submit_for_review':return 'in_review';
  case 'approve':return 'approved';
  case 'reject':return 'rejected';
  case 'mark_unmapped':return 'unmapped';
  case 'supersede':return 'superseded';
 }
}

function editableFields(input:MappingReviewMutation,base:DraftFields,statusValue:MappingReviewStatus):{fields:DraftFields}|{error:string}{
 const sourceUrl=optionalText(input.sourceUrl,1000);
 const sourceEdition=optionalText(input.sourceEdition,800);
 const evidenceReference=optionalText(input.evidenceReference,1500);
 const chapterEvidence=optionalText(input.chapterEvidence,2000);
 const rationale=optionalText(input.rationale,2500);
 const reviewReason=optionalText(input.reviewReason,1500);
 const selectedOutcome=optionalText(input.outcomeId,180);
 if(!sourceUrl.valid||!sourceEdition.valid||!evidenceReference.valid||!chapterEvidence.valid||!rationale.valid||!reviewReason.valid||!selectedOutcome.valid)return {error:'Invalid mapping field.'};
 const selectedRelationship=input.relationshipType===undefined?base.relationshipType:relationship(input.relationshipType);
 if(input.relationshipType!==undefined&&!selectedRelationship)return {error:'Choose a valid relationship type.'};
 const fields:DraftFields={
  outcomeId:statusValue==='unmapped'?null:(selectedOutcome.provided?selectedOutcome.value:base.outcomeId),
  relationshipType:statusValue==='unmapped'?null:selectedRelationship,
  sourceUrl:(sourceUrl.provided?sourceUrl.value:base.sourceUrl)??'',
  sourceEdition:(sourceEdition.provided?sourceEdition.value:base.sourceEdition)??'',
  evidenceReference:(evidenceReference.provided?evidenceReference.value:base.evidenceReference)??'',
  chapterEvidence:(chapterEvidence.provided?chapterEvidence.value:base.chapterEvidence)??'',
  rationale:(rationale.provided?rationale.value:base.rationale)??'',
  reviewReason:(reviewReason.provided?reviewReason.value:base.reviewReason)??'',
 };
 if(!isOfficialNcertChapterUrl(fields.sourceUrl))return {error:'Use an official NCERT chapter source URL.'};
 if(!fields.sourceEdition||!fields.evidenceReference||!fields.chapterEvidence||!fields.rationale)return {error:'Source edition, evidence reference, chapter evidence and rationale are required.'};
 if(statusValue!=='unmapped'){
  if(!fields.outcomeId||!outcomeById(fields.outcomeId))return {error:'Choose a valid registry outcome.'};
  if(!fields.relationshipType)return {error:'Choose a valid relationship type.'};
 }
 const hasDecisionNote=reviewReason.provided&&Boolean(reviewReason.value);
 if(statusValue==='approved'&&input.confirmedHumanReview!==true)return {error:'Approval requires an explicit human-review confirmation.'};
 if(statusValue==='approved'&&!hasDecisionNote)return {error:'Record the source-review note that supports this approval.'};
 if(statusValue==='rejected'&&!hasDecisionNote)return {error:'A rejection reason is required.'};
 if(statusValue==='unmapped'&&!hasDecisionNote)return {error:'Record why this chapter remains unmapped.'};
 return {fields};
}

export async function appendMappingReview(sql:MappingSql,userId:string,input:MappingReviewMutation):Promise<MappingReviewMutationResult>{
 const mappingId=text(input.mappingId,180);
 const action=typeof input.action==='string'&&(mappingReviewActions as readonly string[]).includes(input.action)
  ?input.action as MappingReviewAction:null;
 if(!mappingId||!action)return {ok:false,code:'invalid',message:'Choose a valid mapping and review action.'};
 const proposal=class5MappingProposalById(mappingId);
 if(!proposal)return {ok:false,code:'invalid',message:'This mapping is not part of the reviewed Class 5 catalogue.'};
 const family=await ownerFamily(sql,userId);
 if(!family)return {ok:false,code:'forbidden',message:'Only a family owner can review curriculum mappings.'};
 const priorRows=await sql`
  SELECT id::text AS id,mapping_id,revision,grade,book_id,chapter_id,outcome_id,relationship_type,
    review_status,source_url,source_edition,evidence_reference,chapter_evidence,rationale,review_reason,
    actor_user_id,reviewer_user_id,reviewed_at::text,supersedes_id::text,created_at::text
  FROM curriculum_mapping_reviews
  WHERE family_id::text=${family.id} AND mapping_id=${mappingId}
  ORDER BY revision DESC,created_at DESC
  LIMIT 1
 `;
 const previous=priorRows[0]?revisionFromRow(priorRows[0]):null;
 const requestedStatus=actionStatus(action);
 const base:DraftFields={
  outcomeId:previous?.outcomeId??proposal.outcomeId,
  relationshipType:previous?.relationshipType??proposal.relationshipType,
  sourceUrl:previous?.sourceUrl??proposal.sourceUrl,
  sourceEdition:previous?.sourceEdition??proposal.sourceEdition,
  evidenceReference:previous?.evidenceReference??proposal.evidenceReference,
  chapterEvidence:previous?.chapterEvidence??proposal.chapterEvidence,
  rationale:previous?.rationale??proposal.rationale,
  reviewReason:previous?.reviewReason??'',
 };
 const parsed=editableFields(input,base,requestedStatus);
 if('error' in parsed)return {ok:false,code:'invalid',message:parsed.error};
 const fields=parsed.fields;
 const selectedOutcome=fields.outcomeId?outcomeById(fields.outcomeId):undefined;
 if(fields.outcomeId&&selectedOutcome?.grade!==proposal.grade)return {ok:false,code:'invalid',message:'Choose an outcome registered for this grade.'};
 if(selectedOutcome?.kind==='framework-reference')return {ok:false,code:'invalid',message:'Framework-context references cannot be selected as Class 5 chapter outcomes.'};
 // An explicit unmapped decision is still a human review decision: it retains
 // reviewer identity and date while carrying no outcome or relationship claim.
 const reviewDecision=['approved','rejected','superseded','unmapped'].includes(requestedStatus);
 const id=randomUUID();
 const nextRevision=(previous?.revision??0)+1;
 const reviewerUserId=reviewDecision?userId:null;
 const reviewedAt=reviewDecision?new Date().toISOString():null;
 const rows=await sql`
  INSERT INTO curriculum_mapping_reviews(
   id,family_id,mapping_id,revision,grade,book_id,chapter_id,outcome_id,relationship_type,review_status,
   source_url,source_edition,evidence_reference,chapter_evidence,rationale,review_reason,
   actor_user_id,reviewer_user_id,reviewed_at,supersedes_id
  ) VALUES (
   ${id}::uuid,(SELECT id FROM families WHERE id::text=${family.id} LIMIT 1),${mappingId},${nextRevision},
   ${proposal.grade},${proposal.bookId},${proposal.chapterId},${fields.outcomeId},${fields.relationshipType},${requestedStatus},
   ${fields.sourceUrl},${fields.sourceEdition},${fields.evidenceReference},${fields.chapterEvidence},${fields.rationale},${fields.reviewReason},
   ${userId},${reviewerUserId},${reviewedAt},${previous?.id??null}
  )
  RETURNING id::text AS id,mapping_id,revision,grade,book_id,chapter_id,outcome_id,relationship_type,
   review_status,source_url,source_edition,evidence_reference,chapter_evidence,rationale,review_reason,
   actor_user_id,reviewer_user_id,reviewed_at::text,supersedes_id::text,created_at::text
 `;
 return {ok:true,revision:revisionFromRow(rows[0])};
}
