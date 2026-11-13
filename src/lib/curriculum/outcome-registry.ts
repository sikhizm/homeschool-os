import {globalFrameworks} from '@/lib/global-curriculum/catalogue';

/**
 * A provenance-first registry for curriculum outcomes.
 *
 * Entries are deliberately classified before they are displayed or mapped:
 * - `official` is reserved for a source-verified, identifiable official outcome;
 * - `original` is authored by Homeschool OS and can never become official by
 *   attaching an NCERT source URL;
 * - `framework-reference` is editorial context only, never an equivalence.
 */
export const outcomeKinds=['official','original','framework-reference'] as const;
export type OutcomeKind=(typeof outcomeKinds)[number];

export const outcomeVerificationStatuses=[
 'official-source-verified',
 'original-project-authored',
 'framework-context-only',
 'source-listed-awaiting-transcription',
] as const;
export type OutcomeVerificationStatus=(typeof outcomeVerificationStatuses)[number];

export type CurriculumOutcomeSource={
 id:string;
 authority:string;
 title:string;
 url:string;
 edition:string;
 verificationStatus:OutcomeVerificationStatus;
 /** Null means the source is deliberately listed for future verification, not verified by assertion. */
 lastVerifiedDate:string|null;
 /** Date the registry record itself was checked against the repository evidence. */
 registryReviewedDate:string;
 notes:string;
};

export type CurriculumOutcome={
 /** Stable, non-semantic identifier. It is never an NCERT outcome code unless the source publishes one. */
 id:string;
 grade:number|null;
 stage:string;
 subject:string;
 domain:string;
 title:string;
 measurableOutcome:string;
 prerequisites:string[];
 suggestedActivity:string;
 suggestedAssessment:string;
 kind:OutcomeKind;
 sourceId:string;
 sourceAuthority:string;
 sourceUrl:string;
 sourceEdition:string;
 verificationStatus:OutcomeVerificationStatus;
 lastVerifiedDate:string;
};

/**
 * Reserved evidence-link vocabulary for a later learner-assessment layer.
 * A curriculum mapping may identify relevant outcomes today, but none of these
 * link kinds can itself establish competence or mastery.
 */
export const outcomeEvidenceKinds=[
 'ncert_chapter','read_explore_session','practice_session','understanding_check',
 'parent_observation','independent_recall','revision_recommendation',
] as const;
export type OutcomeEvidenceKind=(typeof outcomeEvidenceKinds)[number];
export type FutureOutcomeEvidenceConnection={
 outcomeId:string;
 chapterId:string;
 learnerId:string;
 kind:OutcomeEvidenceKind;
 /** Stable existing session/progress/portfolio record identifier, when one exists. */
 evidenceRecordId:string|null;
 recordedAt:string|null;
 /** Evidence is recorded or reviewed; it is intentionally never a mastery label. */
 evidenceState:'recorded'|'reviewed';
};

const phase6Date='2026-11-13';

const frameworkSources:CurriculumOutcomeSource[]=globalFrameworks.map(framework=>({
 id:`framework-${framework.id}`,
 authority:framework.label,
 title:framework.title,
 url:framework.url,
 edition:'Framework context reference; no chapter-level equivalence asserted',
 verificationStatus:'framework-context-only',
 lastVerifiedDate:null,
 registryReviewedDate:phase6Date,
 notes:'Retained as pedagogical or external-resource context. Its URL was not independently rechecked in this sandbox; it is not an official Homeschool OS alignment, accreditation, or grade equivalence.',
}));

/**
 * Source records are kept even when no official outcome has been transcribed.
 * The Class 5 pilot intentionally has no official outcome rows yet: the
 * available repository evidence identifies the source but not an exact,
 * section-level official statement that can safely be stored as one.
 */
export const curriculumOutcomeSources:CurriculumOutcomeSource[]=[
 {
  id:'ncert-elementary-learning-outcomes',
  authority:'National Council of Educational Research and Training (NCERT)',
  title:'Learning Outcomes at the Elementary Stage',
  url:'https://ncert.ncert.org.in/learning-outcome.php',
  edition:'Official source record listed for future section-level transcription; exact Class 5 outcome wording and section location still require source review.',
  verificationStatus:'source-listed-awaiting-transcription',
  lastVerifiedDate:null,
  registryReviewedDate:phase6Date,
  notes:'The URL is recorded for future source review; it was not independently accessed in this sandbox. This source record is not used to label any original Homeschool OS outcome as official.',
 },
 {
  id:'homeschool-os-phase6-original',
  authority:'Homeschool OS editorial',
  title:'Class 5 outcome registry — original parent-guided objectives',
  url:'https://github.com/sikhizm/homeschool-os',
  edition:'Phase 6 Class 5 pilot, 2026-11-13',
  verificationStatus:'original-project-authored',
  lastVerifiedDate:phase6Date,
  registryReviewedDate:phase6Date,
  notes:'Original age-appropriate objectives. They are not NCERT learning-outcome identifiers or official grade equivalencies.',
 },
 ...frameworkSources,
];

const original=(entry:Omit<CurriculumOutcome,'kind'|'sourceId'|'sourceAuthority'|'sourceUrl'|'sourceEdition'|'verificationStatus'|'lastVerifiedDate'>):CurriculumOutcome=>({
 ...entry,
 kind:'original',
 sourceId:'homeschool-os-phase6-original',
 sourceAuthority:'Homeschool OS editorial',
 sourceUrl:'https://github.com/sikhizm/homeschool-os',
 sourceEdition:'Phase 6 Class 5 pilot, 2026-11-13',
 verificationStatus:'original-project-authored',
 lastVerifiedDate:phase6Date,
});

/**
 * These are original outcomes, intentionally separate from the existing 37
 * broad competencies and 29 global-framework examples. The existing sets stay
 * useful as broad teaching suggestions, but are not silently recast as
 * official, grade-specific outcomes by this registry.
 */
export const curriculumOutcomes:CurriculumOutcome[]=[
 original({
  id:'c5-original-math-route',grade:5,stage:'class3-5',subject:'Mathematics',domain:'Spatial reasoning and location',title:'Describe routes and locations',
  measurableOutcome:'Use a sketch, map or agreed reference points to describe a route and explain a location choice.',prerequisites:[],
  suggestedActivity:'Plan a safe route across a familiar room or neighbourhood map using landmarks.',
  suggestedAssessment:'Ask the learner to explain how another person could follow the route and revise one ambiguous step.',
 }),
 original({
  id:'c5-original-math-fractions',grade:5,stage:'class3-5',subject:'Mathematics',domain:'Fractions',title:'Reason about equal parts',
  measurableOutcome:'Represent and compare simple fractions of the same whole, explaining what makes the parts equal.',prerequisites:[],
  suggestedActivity:'Fold matching paper strips into equal parts and label the fractions shown.',
  suggestedAssessment:'Invite the learner to justify which of two fraction models represents more and why.',
 }),
 original({
  id:'c5-original-math-turns',grade:5,stage:'class3-5',subject:'Mathematics',domain:'Geometry and movement',title:'Describe turns and angles',
  measurableOutcome:'Describe and compare turns using direction, quarter-turn, half-turn or a drawn angle model.',prerequisites:[],
  suggestedActivity:'Trace turns while following a simple floor-grid or paper path.',
  suggestedAssessment:'Ask the learner to demonstrate two different turns and explain how they differ.',
 }),
 original({
  id:'c5-original-math-measure',grade:5,stage:'class3-5',subject:'Mathematics',domain:'Measurement',title:'Choose and use measurements',
  measurableOutcome:'Choose a suitable unit or tool to estimate, measure and compare a quantity in an everyday context.',prerequisites:[],
  suggestedActivity:'Estimate and then measure the capacity, mass, distance or elapsed time in a safe household task.',
  suggestedAssessment:'Ask the learner to explain why the chosen unit and tool fit the quantity.',
 }),
 original({
  id:'c5-original-math-pattern',grade:5,stage:'class3-5',subject:'Mathematics',domain:'Patterns and structure',title:'Find a pattern rule',
  measurableOutcome:'Describe a repeating or growing pattern and use its rule to predict a later case.',prerequisites:[],
  suggestedActivity:'Build a visual pattern with tiles, shapes or paper pieces and record what changes each step.',
  suggestedAssessment:'Ask the learner to predict a later arrangement and explain the rule rather than only naming the answer.',
 }),
 original({
  id:'c5-original-math-data',grade:5,stage:'class3-5',subject:'Mathematics',domain:'Data representation',title:'Read and communicate data',
  measurableOutcome:'Read or create a simple table, picture graph or chart and state a supported comparison.',prerequisites:[],
  suggestedActivity:'Collect a small family-safe dataset and choose a clear representation.',
  suggestedAssessment:'Ask what the display shows, what it does not show and which comparison is supported.',
 }),
 original({
  id:'c5-original-math-operations',grade:5,stage:'class3-5',subject:'Mathematics',domain:'Operations in context',title:'Model a calculation in context',
  measurableOutcome:'Choose and explain a calculation strategy for an everyday equal-groups, sharing or comparison situation.',prerequisites:[],
  suggestedActivity:'Represent a fictional farm, market or journey question using objects, drawings or a number sentence.',
  suggestedAssessment:'Ask the learner to explain why the operation matches the situation and check the result for reasonableness.',
 }),
 original({
  id:'c5-original-english-story-meaning',grade:5,stage:'class3-5',subject:'English',domain:'Reading comprehension',title:'Discuss story meaning',
  measurableOutcome:'Describe a main event, character decision or message in a text and support the idea with an observed detail.',prerequisites:[],
  suggestedActivity:'Pause after a short official text section and invite a retell in the learner’s own words.',
  suggestedAssessment:'Ask for one detail that supports the learner’s interpretation; accept more than one defensible reading.',
 }),
 original({
  id:'c5-original-english-discussion',grade:5,stage:'class3-5',subject:'English',domain:'Listening and discussion',title:'Contribute to a reasoned discussion',
  measurableOutcome:'Share an opinion about a text or community situation, listen to another view and give one reason.',prerequisites:[],
  suggestedActivity:'Discuss a fictional decision from a text using respectful turn-taking.',
  suggestedAssessment:'Notice whether the learner distinguishes a personal opinion from a reason based on the text or discussion.',
 }),
 original({
  id:'c5-original-english-response',grade:5,stage:'class3-5',subject:'English',domain:'Written and oral response',title:'Respond clearly to an informational text',
  measurableOutcome:'Give a short spoken or written response that states a topic and one relevant supporting detail.',prerequisites:[],
  suggestedActivity:'After reading a short factual section, make a two-column note: topic and one detail.',
  suggestedAssessment:'Ask the learner to explain how the supporting detail relates to the topic.',
 }),
 original({
  id:'c5-original-evs-water',grade:5,stage:'class3-5',subject:'Environmental Studies',domain:'Water systems',title:'Observe water in connected systems',
  measurableOutcome:'Describe an observed connection between water, living things and a local or wider environment without claiming unobserved facts as evidence.',prerequisites:[],
  suggestedActivity:'Trace a safe household water use or a local water journey with observations and questions.',
  suggestedAssessment:'Ask the learner to separate what was observed, what was learned from a source and what remains a question.',
 }),
 original({
  id:'c5-original-evs-food',grade:5,stage:'class3-5',subject:'Environmental Studies',domain:'Food and wellbeing',title:'Investigate food choices',
  measurableOutcome:'Ask a respectful question about food, identify a source of information and describe one evidence-based finding.',prerequisites:[],
  suggestedActivity:'Explore a family-safe food label, meal ingredient or food journey without judging personal diets.',
  suggestedAssessment:'Ask the learner to name the question, evidence source and one limitation of the observation.',
 }),
 original({
  id:'c5-original-evs-community',grade:5,stage:'class3-5',subject:'Environmental Studies',domain:'Community and civic life',title:'Explain a community setting',
  measurableOutcome:'Describe how people, rules and shared spaces can affect participation or wellbeing in a community setting.',prerequisites:[],
  suggestedActivity:'Map roles and routines in a school or public space using a fictional or familiar example.',
  suggestedAssessment:'Ask for one connection between an action, a shared space and another person’s experience.',
 }),
 original({
  id:'c5-original-evs-place',grade:5,stage:'class3-5',subject:'Environmental Studies',domain:'Places and diversity',title:'Compare places with care',
  measurableOutcome:'Compare two places using a stated feature while avoiding unsupported generalisations about people who live there.',prerequisites:[],
  suggestedActivity:'Use official maps, photographs or a trusted source to compare a physical or cultural feature.',
  suggestedAssessment:'Ask the learner to state the feature compared and a question they would still need to investigate.',
 }),
 original({
  id:'c5-original-evs-energy-materials',grade:5,stage:'class3-5',subject:'Environmental Studies',domain:'Materials, work and energy',title:'Explain a simple system',
  measurableOutcome:'Describe inputs, changes and useful outputs in a familiar material, making or energy-related system.',prerequisites:[],
  suggestedActivity:'Observe a safe household object or making process and sketch its inputs, steps and output.',
  suggestedAssessment:'Ask the learner to explain one change in the system and identify a question for further investigation.',
 }),
 original({
  id:'c5-original-evs-environment',grade:5,stage:'class3-5',subject:'Environmental Studies',domain:'Environmental patterns and care',title:'Notice environmental patterns',
  measurableOutcome:'Record a repeated environmental pattern and suggest one careful action connected to the observation.',prerequisites:[],
  suggestedActivity:'Keep a short weather, shade, waste or local-nature observation record.',
  suggestedAssessment:'Ask what pattern is actually recorded and what evidence would be needed before making a broader claim.',
 }),
 original({
  id:'c5-original-arts-observation',grade:5,stage:'class3-5',subject:'Arts',domain:'Visual observation',title:'Observe visual details',
  measurableOutcome:'Identify visual details in an object, scene or artwork and use them deliberately in a response.',prerequisites:[],
  suggestedActivity:'Look closely from a window or at a safe object, then make a sketch with labelled details.',
  suggestedAssessment:'Ask the learner to point out one observed detail carried into their own work.',
 }),
 original({
  id:'c5-original-arts-visual-story',grade:5,stage:'class3-5',subject:'Arts',domain:'Visual storytelling',title:'Tell a story through images',
  measurableOutcome:'Arrange images, marks or objects to communicate a beginning, change and ending in an original visual story.',prerequisites:[],
  suggestedActivity:'Create a three-frame picture sequence from an original idea rather than copying textbook artwork.',
  suggestedAssessment:'Invite the learner to explain how a viewer can follow the visual sequence.',
 }),
 original({
  id:'c5-original-arts-making',grade:5,stage:'class3-5',subject:'Arts',domain:'Making and design',title:'Develop a making process',
  measurableOutcome:'Plan, make and revise a simple original artefact while explaining a material or technique choice.',prerequisites:[],
  suggestedActivity:'Use safe reusable materials to make a scene, structure or stitched-paper sample with adult support where needed.',
  suggestedAssessment:'Ask what changed during making and why the revised choice helped.',
 }),
 original({
  id:'c5-original-arts-listening',grade:5,stage:'class3-5',subject:'Arts',domain:'Music and listening',title:'Respond to sound and music',
  measurableOutcome:'Describe a sound, rhythm or instrument feature and create or select a response with a stated reason.',prerequisites:[],
  suggestedActivity:'Listen to a short, lawful source or make household-safe sounds, then compare tempo, timbre or pattern.',
  suggestedAssessment:'Ask the learner to identify one feature they heard and show it in a clap, drawing or explanation.',
 }),
 original({
  id:'c5-original-arts-movement',grade:5,stage:'class3-5',subject:'Arts',domain:'Dance and movement',title:'Express ideas through movement',
  measurableOutcome:'Use space, rhythm or gesture to create a short movement phrase and explain one expressive choice.',prerequisites:[],
  suggestedActivity:'Create a short original movement sequence with safe personal space and no performance pressure.',
  suggestedAssessment:'Ask the learner to name one movement choice and the idea or feeling it was meant to communicate.',
 }),
 original({
  id:'c5-original-arts-collaboration',grade:5,stage:'class3-5',subject:'Arts',domain:'Collaborative practice',title:'Work constructively in an arts task',
  measurableOutcome:'Take a role in a shared creative task, listen to feedback and describe one contribution or revision.',prerequisites:[],
  suggestedActivity:'Plan a small group or family scene, rhythm or display with agreed roles.',
  suggestedAssessment:'Ask the learner to identify their contribution and one respectful response to feedback.',
 }),
 original({
  id:'c5-original-pe-movement',grade:5,stage:'class3-5',subject:'Physical Education',domain:'Movement control',title:'Practise controlled movement',
  measurableOutcome:'Demonstrate a safe movement skill with attention to control, space and a personally chosen next step.',prerequisites:[],
  suggestedActivity:'Practise a throw, catch, kick, strike or footwork pattern in a clear, supervised space.',
  suggestedAssessment:'Observe control and safety, then invite the learner to name one adjustment for another attempt.',
 }),
 original({
  id:'c5-original-pe-games',grade:5,stage:'class3-5',subject:'Physical Education',domain:'Games and cooperation',title:'Participate fairly in games',
  measurableOutcome:'Follow agreed rules, communicate respectfully and reflect on a cooperative or strategic choice in a game.',prerequisites:[],
  suggestedActivity:'Play or adapt a local game with explicit safety and inclusion agreements.',
  suggestedAssessment:'Ask the learner to explain one rule, one fair-play choice and one adjustment for inclusion.',
 }),
 original({
  id:'c5-original-pe-yoga',grade:5,stage:'class3-5',subject:'Physical Education',domain:'Yoga and wellbeing',title:'Practise mindful movement safely',
  measurableOutcome:'Follow age-appropriate guided breathing or movement with attention to comfort, safety and self-awareness.',prerequisites:[],
  suggestedActivity:'Use a brief, non-competitive yoga or breathing practice with a qualified source and adult supervision as appropriate.',
  suggestedAssessment:'Invite the learner to describe comfort, balance or breathing without judging flexibility or making health claims.',
 }),
];

export function outcomeById(id:string){return curriculumOutcomes.find(outcome=>outcome.id===id);}
export function outcomesForGrade(grade:number){return curriculumOutcomes.filter(outcome=>outcome.grade===grade);}
export function sourceById(id:string){return curriculumOutcomeSources.find(source=>source.id===id);}

export function validateOutcomeRegistry(outcomes:readonly CurriculumOutcome[]=curriculumOutcomes):string[]{
 const issues:string[]=[];
 const ids=new Set<string>();
 const sourcesById=new Map<string,CurriculumOutcomeSource>();
 for(const source of curriculumOutcomeSources){
  if(sourcesById.has(source.id))issues.push(`Duplicate outcome source ID: ${source.id}`);
  sourcesById.set(source.id,source);
  if(!source.authority.trim()||!source.title.trim()||!source.url.startsWith('https://')||!source.edition.trim()||!source.registryReviewedDate)issues.push(`Missing source provenance: ${source.id}`);
  if(['official-source-verified','original-project-authored'].includes(source.verificationStatus)&&!source.lastVerifiedDate)issues.push(`Verified source is missing a verification date: ${source.id}`);
 }
 for(const outcome of outcomes){
  if(ids.has(outcome.id))issues.push(`Duplicate outcome ID: ${outcome.id}`);
  ids.add(outcome.id);
  const source=sourcesById.get(outcome.sourceId);
  if(!source)issues.push(`Unknown source for outcome: ${outcome.id}`);
  if(!outcome.title.trim()||!outcome.measurableOutcome.trim()||!outcome.suggestedActivity.trim()||!outcome.suggestedAssessment.trim())issues.push(`Missing educational content: ${outcome.id}`);
  if(outcome.grade!==null&&(!Number.isInteger(outcome.grade)||outcome.grade<1||outcome.grade>12))issues.push(`Invalid outcome grade: ${outcome.id}`);
  if(!outcome.sourceAuthority.trim()||!outcome.sourceUrl.startsWith('https://')||!outcome.sourceEdition.trim()||!outcome.lastVerifiedDate)issues.push(`Missing provenance: ${outcome.id}`);
  if(outcome.kind==='official'&&outcome.verificationStatus!=='official-source-verified')issues.push(`Official outcome lacks source verification: ${outcome.id}`);
  if(outcome.kind==='original'&&outcome.verificationStatus!=='original-project-authored')issues.push(`Original outcome has invalid status: ${outcome.id}`);
  if(outcome.kind==='framework-reference'&&outcome.verificationStatus!=='framework-context-only')issues.push(`Framework reference has invalid status: ${outcome.id}`);
  // Classification is tied to the source record as well as the outcome field.
  // An NCERT source ID can never turn a project-authored outcome into official.
  if(source&&source.verificationStatus!==outcome.verificationStatus)issues.push(`Source verification status conflicts with outcome: ${outcome.id}`);
  if(source&&source.authority!==outcome.sourceAuthority)issues.push(`Source authority conflicts with outcome: ${outcome.id}`);
  if(source&&outcome.kind==='official'&&source.verificationStatus!=='official-source-verified')issues.push(`Official outcome has a non-official source record: ${outcome.id}`);
  if(source&&outcome.kind==='original'&&source.verificationStatus!=='original-project-authored')issues.push(`Original outcome has a non-project source record: ${outcome.id}`);
  if(source&&outcome.kind==='framework-reference'&&source.verificationStatus!=='framework-context-only')issues.push(`Framework outcome has a non-framework source record: ${outcome.id}`);
  for(const prerequisite of outcome.prerequisites){
   if(prerequisite===outcome.id||!outcomes.some(candidate=>candidate.id===prerequisite))issues.push(`Invalid prerequisite: ${outcome.id} -> ${prerequisite}`);
  }
 }
 return issues;
}

export function outcomeRegistrySummary(){
 return {
  total:curriculumOutcomes.length,
  official:curriculumOutcomes.filter(outcome=>outcome.kind==='official').length,
  original:curriculumOutcomes.filter(outcome=>outcome.kind==='original').length,
  frameworkReferences:curriculumOutcomes.filter(outcome=>outcome.kind==='framework-reference').length,
  sources:curriculumOutcomeSources.length,
 };
}
