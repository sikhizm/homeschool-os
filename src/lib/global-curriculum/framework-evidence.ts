import {globalFrameworks,globalSkills,type GlobalFrameworkId} from './catalogue';

export type FrameworkEvidenceStatus='overview-verified'|'resource-only'|'original-content';
export type FrameworkEvidenceRecord={
 id:GlobalFrameworkId;
 sourceName:string;
 sourceType:'national-framework'|'subject-curriculum'|'pedagogy-framework'|'standards-set'|'external-resource'|'original-content';
 sourceUrls:string[];
 scope:string;
 subjectAreas:string[];
 stageScope:string;
 status:FrameworkEvidenceStatus;
 statusLabel:string;
 verifiedOn:string;
 outcomeEvidenceStatus:'not-transcribed'|'not-applicable';
 mappingGate:'blocked-until-exact-outcome-evidence-and-human-review'|'not-applicable';
 limits:string[];
};

/** Source overviews only: no standards text, outcome IDs, grade equivalencies or chapter mappings. */
export const frameworkEvidence:FrameworkEvidenceRecord[]=[
 {id:'ncert',sourceName:'National Curriculum Framework for School Education 2023',sourceType:'national-framework',sourceUrls:['https://ncf.ncert.gov.in/'],scope:'Indian school education across the Foundational, Preparatory, Middle and Secondary stages, organised through the 5+3+3+4 structure.',subjectAreas:['Languages','Mathematics','Science','Social Science','Art Education','Physical Education and Well-being','Vocational Education'],stageScope:'Indian curricular stages; no automatic equivalence to this app’s age bands or class groups.',status:'overview-verified',statusLabel:'Official overview checked · outcomes not transcribed',verifiedOn:'2026-11-13',outcomeEvidenceStatus:'not-transcribed',mappingGate:'blocked-until-exact-outcome-evidence-and-human-review',limits:['The framework overview is not a section-level outcome record; exact edition, section and wording must be captured before any crosswalk.']},
 {id:'epathshala',sourceName:'NCERT ePathshala',sourceType:'external-resource',sourceUrls:['https://epathshala.nic.in/'],scope:'Official access to NCERT learning and textbook resources.',subjectAreas:['Textbook and learning-resource access'],stageScope:'Resource access only; no independent age or grade framework is asserted.',status:'resource-only',statusLabel:'Official resource portal · not a framework',verifiedOn:'2026-11-13',outcomeEvidenceStatus:'not-applicable',mappingGate:'not-applicable',limits:['A resource portal is not a curriculum standard and must never be used as a source of outcome equivalence.']},
 {id:'cambridge',sourceName:'Cambridge Primary subject curriculum frameworks',sourceType:'subject-curriculum',sourceUrls:['https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-primary/curriculum/','https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-primary/'],scope:'Flexible primary programme, typically ages 5–11, organised into six stages with separate subject frameworks.',subjectAreas:['English','English as a Second Language','Mathematics','Science','Global Perspectives','Humanities','Computing','Digital Literacy','Art and Design','Music','Physical Education','Wellbeing','Modern Foreign Languages'],stageScope:'Cambridge Primary Stages 1–6; these are not assumed to equal NCERT classes.',status:'overview-verified',statusLabel:'Official overview checked · stage outcomes not transcribed',verifiedOn:'2026-11-13',outcomeEvidenceStatus:'not-transcribed',mappingGate:'blocked-until-exact-outcome-evidence-and-human-review',limits:['Subject frameworks provide stage-specific learning objectives; each relevant subject and stage document must be checked individually before a mapping is proposed.']},
 {id:'ib',sourceName:'IB Primary Years Programme',sourceType:'pedagogy-framework',sourceUrls:['https://www.ibo.org/programmes/primary-years-programme/','https://www.ibo.org/programmes/primary-years-programme/how-the-pyp-works/'],scope:'Inquiry-based, transdisciplinary framework for learners aged 3–12, organised through six broad transdisciplinary themes.',subjectAreas:['Transdisciplinary inquiry','Conceptual understanding','Approaches to learning','Learner agency','Reflection and action'],stageScope:'IB PYP age range 3–12; school-developed programmes of inquiry are not a fixed NCERT grade syllabus.',status:'overview-verified',statusLabel:'Official overview checked · school inquiry varies',verifiedOn:'2026-11-13',outcomeEvidenceStatus:'not-transcribed',mappingGate:'blocked-until-exact-outcome-evidence-and-human-review',limits:['The PYP is a school-developed programme of inquiry; its transdisciplinary model cannot be flattened into a one-to-one subject chapter crosswalk.']},
 {id:'singapore',sourceName:'Singapore MOE Primary Mathematics Syllabus (2021; updated October 2025)',sourceType:'subject-curriculum',sourceUrls:['https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-october-2025.pdf'],scope:'Primary Mathematics for Primary 1–6 only; the 2021 syllabus update notes the Primary 6 transition from 2026.',subjectAreas:['Mathematics: Number and Algebra','Measurement and Geometry','Statistics'],stageScope:'Singapore Primary 1–6 mathematics; not a general curriculum or an assumed NCERT class equivalence.',status:'overview-verified',statusLabel:'Official syllabus checked · outcomes not transcribed',verifiedOn:'2026-11-13',outcomeEvidenceStatus:'not-transcribed',mappingGate:'blocked-until-exact-outcome-evidence-and-human-review',limits:['This is a mathematics syllabus only. Exact level-specific outcomes and page/section references must be transcribed before comparison.']},
 {id:'commoncore',sourceName:'Common Core State Standards — English Language Arts/Literacy and Mathematics',sourceType:'standards-set',sourceUrls:['https://corestandards.org/','https://corestandards.org/english-language-arts-standards/','https://corestandards.org/mathematics-standards/'],scope:'US K–12 English Language Arts/literacy and Mathematics standards; these two subject areas are not a complete school curriculum.',subjectAreas:['English Language Arts and Literacy','Mathematics'],stageScope:'US grade-banded standards; no state adoption or NCERT equivalence is inferred.',status:'overview-verified',statusLabel:'Official standards pages checked · outcomes not transcribed',verifiedOn:'2026-11-13',outcomeEvidenceStatus:'not-transcribed',mappingGate:'blocked-until-exact-outcome-evidence-and-human-review',limits:['Only ELA/literacy and mathematics are represented here; state-level adoption, implementation and the exact standard version must be checked for any future use.']},
 {id:'original',sourceName:'Original HomeSchool OS enrichment',sourceType:'original-content',sourceUrls:[],scope:'Locally authored parent-guided activities and learning suggestions maintained by this project.',subjectAreas:['Original enrichment'],stageScope:'Project-defined learning stages; not an external standards framework.',status:'original-content',statusLabel:'Original content · no external framework',verifiedOn:'2026-11-13',outcomeEvidenceStatus:'not-applicable',mappingGate:'not-applicable',limits:['These are original learning suggestions and must not be attributed to NCERT, Cambridge, IB, Singapore MOE or Common Core.']}
];

export function frameworkEvidenceFor(id:GlobalFrameworkId){return frameworkEvidence.find(record=>record.id===id);}

export function frameworkEvidenceSummary(){
 const frameworkLenses=frameworkEvidence.filter(record=>!['external-resource','original-content'].includes(record.sourceType)).length;
 return {sourceRecords:frameworkEvidence.length,frameworkLenses,overviewVerified:frameworkEvidence.filter(record=>record.status==='overview-verified').length,resourceOnlyRecords:frameworkEvidence.filter(record=>record.status==='resource-only').length,originalContentRecords:frameworkEvidence.filter(record=>record.status==='original-content').length,contextTaggedSkills:globalSkills.filter(skill=>skill.frameworks.length>0).length,contextReferences:globalSkills.reduce((total,skill)=>total+skill.frameworks.length,0),outcomeLevelCrosswalks:0,approvedEquivalencies:0};
}

export function validateFrameworkEvidence(){
 const errors:string[]=[];
 const evidenceIds=new Set(frameworkEvidence.map(record=>record.id));
 if(evidenceIds.size!==frameworkEvidence.length)errors.push('Duplicate framework evidence IDs');
 if(frameworkEvidence.length!==globalFrameworks.length)errors.push('Framework evidence record count does not match the visible source register');
 for(const framework of globalFrameworks){
  const record=frameworkEvidenceFor(framework.id);
  if(!record){errors.push('Missing framework evidence '+framework.id);continue;}
  if(framework.url&&!record.sourceUrls.includes(framework.url))errors.push('Primary source URL missing from evidence record '+framework.id);
  if(!framework.url&&record.sourceType!=='original-content')errors.push('Missing primary URL for non-original source '+framework.id);
  if(record.sourceUrls.some(url=>!url.startsWith('https://')))errors.push('Non-HTTPS source URL '+framework.id);
  if(record.scope.trim().length<20||record.limits.length===0)errors.push('Incomplete scope or review boundary '+framework.id);
  if(record.mappingGate==='blocked-until-exact-outcome-evidence-and-human-review'&&record.outcomeEvidenceStatus!=='not-transcribed')errors.push('Mapping gate mismatch '+framework.id);
  if(record.sourceType==='original-content'&&record.sourceUrls.length>0)errors.push('Original content must not claim an external source '+framework.id);
 }
 for(const skill of globalSkills){
  if(skill.editorialStatus!=='illustrative'||skill.sourceMapping!=='framework-context-only')errors.push('Skill is not safely labelled context-only '+skill.id);
  for(const id of skill.frameworks)if(!evidenceIds.has(id as GlobalFrameworkId))errors.push('Skill references unknown evidence record '+skill.id+':'+id);
 }
 return [...new Set(errors)];
}
