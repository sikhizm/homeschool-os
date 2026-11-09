import {modulesForGrade} from './pathways';
import {lessons} from '@/lib/lessons/library';
import {ncertChapterSlots,textbookById,officialChapterPdf} from '@/lib/ncert/textbooks';
import {annualStepsForStage,type AnnualStep,type TeachingLesson,type LessonMode} from '@/lib/curriculum/annual';

export type QueueTask={
 id:string;title:string;subject:string;minutes:number;source:string;href:string;instructions:string[];
 grade:string;check?:string;
 lesson?:TeachingLesson;week?:number;term?:1|2|3;unit?:string;mode?:LessonMode;
 kind?:'core'|'consolidation';milestone?:string|null;prerequisites?:string[];officialUrl?:string|null;
};

export function stageFor(grade:string){
 if(['Early Years','Nursery','LKG','UKG'].includes(grade))return 'early';
 const n=Number(grade.replace('Class ',''));
 if(!Number.isInteger(n)||n<1||n>12)return null;
 return n<=2?'class1-2':n<=5?'class3-5':n<=8?'class6-8':n<=10?'class9-10':'class11-12';
}

/** Annual pathway steps become queue tasks without changing their stable IDs. */
function annualTasks(grade:string):QueueTask[]{
 return annualStepsForStage(grade).map((step:AnnualStep)=>({
  id:step.id,title:step.title,subject:step.subject,minutes:step.minutes,
  source:`Original HomeSchool OS 36-week pathway · Term ${step.term}, Week ${step.week}${step.kind==='core'?'':' · independent practice'}`,
  href:step.href,instructions:step.lesson.steps,check:step.lesson.completionCriteria,grade,
  lesson:step.lesson,week:step.week,term:step.term,unit:step.unitId,mode:step.mode,
  kind:step.kind,milestone:step.milestone,prerequisites:step.prerequisites
 }));
}

/** An original teaching script for an externally accessed official NCERT chapter. */
function chapterLesson(kind:'read'|'practice'|'review',title:string,subject:string,minutes:number,officialUrl:string|null):TeachingLesson{
 const link=officialUrl?' Open the chapter through the official NCERT PDF link on the chapter page.':' Open the chapter through the chapter page link.';
 const common={
  materials:'The official NCERT chapter (opened through the chapter page), notebook, pencil',
  minutes,
  easier:'Read a shorter part together, allow oral answers, and stop before the learner tires. Revisit the same section next time.',
  harder:'Ask for a second example from the chapter and a written two-sentence explanation without looking back.',
  revisionGuidance:'If the learner cannot explain the idea without looking, mark this session Needs revision and repeat the read-and-explore script after two days.',
 };
 if(kind==='read')return{
  ...common,
  objective:`Read a manageable part of "${title}" together and retell its main idea in the learner's own words.`,
  prep:'Preview the official chapter yourself first. Choose one short section and one idea worth stopping at. This script is original HomeSchool OS guidance; the textbook text stays on the official NCERT site.',
  example:'Model a think-aloud after one paragraph: "I think this part is about ___ because the words ___ and ___ keep appearing." Then let the learner try the next paragraph.',
  steps:[
   'Open the official chapter together.'+link,
   'Read one short section aloud, pausing once to name an unfamiliar word and what it might mean from context.',
   'Model the think-aloud example above on the first paragraph, speaking your reasoning out loud.',
   'Ask the learner to read or listen to the next short part and retell what it was about in one sentence.',
   'Note one question to carry into the practice session. Do not require verbatim textbook wording.',
  ],
  questions:['What is the main idea of the part we read, and which words give you that idea?','Which word or sentence was confusing, and what could we do about it?'],
  exercise:`In your notebook, write or draw one sentence explaining the main idea of the first part of "${title}".`,
  expectedAnswer:'Expected: a short retell in the learner\'s own words that names the central idea and points to at least one word or sentence from the chapter. The official chapter content is not reproduced here, so accept any accurate retell rather than a memorised line.',
  completionCriteria:'The learner can retell the main idea of the section without reading it aloud word for word. Otherwise choose Needs revision.',
 };
 if(kind==='practice')return{
  ...common,
  objective:`Work through suitable questions or activities from "${title}" with the learner explaining their method.`,
  prep:'Look at the chapter\'s own questions or activities and choose two or three that match the section already read. Do not invent official answers or copy textbook exercises into this app.',
  example:'Before starting, model one: "I will read the question twice, underline what it asks, then say how I will check my answer."',
  steps:[
   'Reopen the section read in the previous session and recall its main idea together.'+link,
   'Choose two suitable questions or activities from the official chapter and read each twice.',
   'Ask the learner to explain how they will start before they write or draw anything.',
   'Let them work; give one hint only when they ask, and note which part needed a hint.',
   'Compare the attempt with the chapter\'s own guidance where available and record one thing to revisit.',
  ],
  questions:['How did you decide what to do first?','How can you check whether your answer makes sense?'],
  exercise:`Attempt two selected questions or activities from "${title}" and write one sentence about your method.`,
  expectedAnswer:'Expected: a genuine attempt plus an explanation of the method. Answers depend on the current official edition, so use the chapter\'s own answer guidance where provided; never fabricate an "official" answer here.',
  completionCriteria:'The learner attempts both chosen tasks and can explain at least one method. Effortful work should be marked Needs revision rather than Completed.',
 };
 return{
  ...common,
  objective:`Check understanding of "${title}" by asking the learner to explain two important ideas without looking back.`,
  prep:'Close the chapter before starting. Prepare two prompts based on the sections actually read. This is a parent-observed understanding check, not a graded test.',
  example:'Prompt: "Explain the two most important ideas from this chapter and give one example of each." Accept their own words; do not supply the first word.',
  steps:[
   'Ask the learner what they remember from the chapter before reopening anything.',
   'Ask for two important ideas and one example of each, in their own words.',
   'Reopen the official chapter only to check the one idea they were least sure about.'+link,
   'Together, name one part that is now clear and one part that still needs practice.',
   'If understanding is incomplete, choose Needs revision instead of Completed so the spaced-revision pathway can help.',
  ],
  questions:['What are the two most important ideas, and can you give an example of each?','Which part would you explain differently next time?'],
  exercise:`Without looking, write or say two important ideas from "${title}" and one example.`,
  expectedAnswer:'Expected: two accurate ideas in the learner\'s own words with at least one example. A correct phrase copied from the page without an explanation is not yet understanding.',
  completionCriteria:'The learner explains two ideas independently. Otherwise mark Needs revision and repeat the read-and-explore script.',
 };
}

export function queueCatalogue(grade:string):QueueTask[]{
 const annual=annualTasks(grade);
 const stage=stageFor(grade);
 // Infants and unrecognised stages receive only their authored annual pathway (possibly empty).
 if(!stage)return annual;
 const original=lessons.filter(x=>x.stage===stage).map(x=>({
  id:'original:'+x.id,title:x.title,subject:x.subject,minutes:x.minutes,
  source:'Original activity · educator review recommended',href:'/lessons',
  instructions:x.steps,check:x.questions[0]??x.objective,grade
 }));
 const structured=modulesForGrade(grade).sort((a,b)=>a.week-b.week||a.subject.localeCompare(b.subject)).map(m=>({
  id:m.id,title:m.title,subject:m.subject,minutes:m.minutes,
  source:'Original grade-specific learning pathway · editor review recommended',href:'/curriculum-studio',
  instructions:[...m.steps],check:m.check,grade
 }));
 if(grade!=='Class 4')return [...annual,...structured,...original];
 const chapters=ncertChapterSlots.filter(c=>c.verifiedTitle&&textbookById(c.bookId)?.grade===4).flatMap(c=>{
  const book=textbookById(c.bookId)!;
  const resource='/ncert-books/chapter/'+c.id;
  const base='ncert:'+c.id;
  const officialUrl=officialChapterPdf(c);
  const title=c.verifiedTitle as string;
  // Three short parent-led stages, not copied textbook exercises or an asserted chapter length.
  return ([['read',15],['practice',20],['review',10]] as const).map(([kind,minutes])=>{
   const lesson=chapterLesson(kind,title,book.subject,minutes,officialUrl);
   return {id:base+':'+kind,
    title:title+' · '+(kind==='read'?'Read & explore':kind==='practice'?'Practice':'Understanding check'),
    subject:book.subject,minutes,
    source:'NCERT chapter (official text accessed externally) · original parent-led '+kind+' script',
    href:resource,instructions:lesson.steps,check:lesson.completionCriteria,
    grade,lesson,officialUrl};
  });
 });
 // Interleave by textbook/subject to prevent long single-subject streaks.
 const bySubject=new Map<string,QueueTask[]>();
 for(const c of chapters)bySubject.set(c.subject,[...(bySubject.get(c.subject)??[]),c]);
 const interleaved:QueueTask[]=[];
 while([...bySubject.values()].some(x=>x.length))for(const tasks of bySubject.values()){const next=tasks.shift();if(next)interleaved.push(next);}
 // Mix enrichment into the NCERT sequence while keeping existing NCERT order stable.
 const blended:QueueTask[]=[];
 let enrichIndex=0;
 for(let index=0;index<interleaved.length;index++){
  if(index%6===0&&enrichIndex<structured.length)blended.push(structured[enrichIndex++]);
  blended.push(interleaved[index]);
 }
 return [...annual,...blended,...structured.slice(enrichIndex),...original];
}
export function nextQueueTasks(tasks:QueueTask[],completed:ReadonlySet<string>,limit=3){
 // Continue through the sequence without replaying completed tasks.
 return tasks.filter(t=>!completed.has(t.id)).slice(0,limit);
}
