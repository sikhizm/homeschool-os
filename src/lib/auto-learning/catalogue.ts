import {modulesForGrade} from './pathways';
import {lessons} from '@/lib/lessons/library';
import {contentUnitLabelFor,isDefaultChapterSessionEligible,ncertChapterSlots,textbookById,officialChapterPdf} from '@/lib/ncert/textbooks';
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


/** Age-appropriate Class 2 scaffolding; prompts are original and never claim to reproduce textbook content. */
function class2ChapterLesson(kind:'read'|'practice'|'review',title:string,subject:string,minutes:number,officialUrl:string|null):TeachingLesson{
 const isMath=subject==='Mathematics';
 const link=officialUrl?' Open the official NCERT chapter PDF from this chapter page.':' Open the official NCERT chapter from this chapter page.';
 const common={
  materials:isMath?'Official NCERT chapter, counters or household objects, paper and pencil':'Official NCERT chapter, a quiet reading space, paper and pencil',
  minutes,
  easier:isMath?'Use a smaller number of objects, model one example together, and accept an oral explanation.':'Read a shorter passage aloud together; accept a spoken retell, gesture or drawing.',
  harder:isMath?'Ask the learner to represent the same idea in a second way and explain why both methods work.':'Invite the learner to retell independently, explain a new word and connect the chapter to an everyday example.',
  revisionGuidance:'If the learner needs repeated hints, mark Needs another look and revisit this short section after a day or two.'
 };
 if(kind==='read')return{
  ...common,
  objective:isMath?`Explore the mathematical idea in "${title}" using objects, pictures and the chapter's own examples.`:`Read or listen to a short part of "${title}" and explain one idea in the learner's own words.`,
  prep:isMath?'Preview the official chapter. Identify the first concept or worked example and gather a few safe objects that can help model it. Use only methods introduced by the chapter.':'Preview the official chapter and choose one short section. For Hindi reading, read together at the learner’s pace; explain unfamiliar words from the actual passage rather than guessing from the title.',
  example:isMath?'“I can show this with objects first, then make a drawing, and finally explain what the numbers mean.”':'“I noticed ___. I think this part is about ___ because I saw ___.”',
  steps:isMath?[
   'Open the official chapter together.'+link,
   'Look at one example or activity and say what it asks you to notice.',
   'Model that example with a few safe counters, objects or a drawing, following the chapter’s approach.',
   'Invite the learner to show the same idea and explain what each object or mark represents.',
   'Ask the learner to say one thing that is clear and one question they still have.'
  ]:[
   'Open the official chapter together.'+link,
   'Read one short passage or section aloud. Let the learner follow the words or take a comfortable turn reading.',
   'Pause at one unfamiliar word that actually appears in the passage; use nearby words, pictures or a dictionary to work out its meaning.',
   'Ask what happened, what was described or what the passage taught. Accept an answer in the learner’s own words.',
   'Invite the learner to draw one scene or idea and label it with a word or short sentence.'
  ],
  questions:isMath?['Can you show the same idea with objects or a drawing?','What does each number, group or mark represent in this example?']:['What happened or what did you learn in this part?','Which word or sentence helped you understand it?'],
  exercise:isMath?`Draw or build one example of the idea from "${title}" and explain it aloud.`:`Draw one scene or idea from "${title}" and tell a grown-up about it in one or two sentences.`,
  expectedAnswer:isMath?'Expected: a representation that matches the worked example or activity in the official chapter, with a simple explanation. Check the chapter itself for the intended answer; do not invent an official answer.':'Expected: an age-appropriate retell or description grounded in the section actually read. Accept the learner’s own words; do not require memorised textbook wording.',
  completionCriteria:isMath?'The learner can model one example and explain what the objects or drawing show. Otherwise choose Needs another look.':'The learner can describe one idea from the section in their own words, orally or through a drawing with explanation. Otherwise choose Needs another look.'
 };
 if(kind==='practice')return{
  ...common,
  objective:isMath?`Practise the mathematical ideas introduced in "${title}" and explain the steps using objects, drawings or numbers.`:`Complete two suitable activities from "${title}" and explain the answers in the learner's own words.`,
  prep:'Preview the chapter’s own examples and questions. Choose two short activities that match the section already explored. Do not add invented textbook questions or answers.',
  example:isMath?'“I will try it with objects, draw what I did, and then check whether the numbers tell the same story.”':'“I will listen to the whole question, say what it is asking, and then explain how I found my answer.”',
  steps:isMath?[
   'Revisit the example explored in the previous session.'+link,
   'Choose two suitable practice items from the official chapter.',
   'Let the learner solve the first with objects or a drawing before writing number work.',
   'Ask the learner to explain the method; offer one hint only if needed.',
   'Check the work against the chapter’s own guidance where available and note one skill to revisit.'
  ]:[
   'Reopen the section explored in the previous session.'+link,
   'Choose two short questions or activities printed in the official chapter.',
   'Read each instruction together and ask the learner to explain what it is asking.',
   'Let the learner answer orally, draw or write a short response as appropriate to the activity.',
   'Check the response against the chapter and discuss one word or idea that needs more practice.'
  ],
  questions:isMath?['Can you solve this in another way?','How can you check that your answer makes sense?']:['What helped you decide on your answer?','Can you explain the answer without repeating the question?'],
  exercise:`Attempt two selected activities from "${title}" and explain how you approached one of them.`,
  expectedAnswer:'Expected: two genuine attempts and a simple explanation. Answers depend on the current official edition; use the chapter’s own guidance where provided.',
  completionCriteria:'The learner attempts both selected activities and can explain at least one response or method. Otherwise choose Needs another look.'
 };
 return{
  ...common,
  objective:isMath?`Recall a mathematical idea from "${title}" and demonstrate it independently with a fresh example.`:`Recall the main idea from "${title}" and retell it without looking at the page.`,
  prep:'Choose one short section already studied. Prepare a simple prompt based on the actual chapter, not on an assumed topic or an invented answer.',
  example:isMath?'“I can show the idea again, explain what I did first, and check the result.”':'“The main idea was ___. One detail I remember is ___.”',
  steps:isMath?[
   'Close the book and ask the learner to show one idea they remember using objects or a drawing.',
   'Ask them to explain what they did first and why.',
   'Invite one new example using familiar objects, without introducing a new method.',
   'Open the chapter again.'+link,
   'Check the explanation together and choose one small point to revisit if needed.'
  ]:[
   'Close the book and invite the learner to retell the section in their own words.',
   'Ask for one detail, character, event or fact that supports the retell.',
   'Invite the learner to explain one new word from the passage and use it in a spoken sentence.',
   'Open the chapter again.'+link,
   'Check the retell together and name one part to revisit if needed.'
  ],
  questions:isMath?['Can you show the idea without looking at the example?','What would you do first if you tried a similar problem tomorrow?']:['What is the main idea you remember?','Which detail or word helps you remember it?'],
  exercise:isMath?'Demonstrate one similar example and explain the steps aloud.':'Give a short oral retell and use one new word from the chapter in a sentence.',
  expectedAnswer:isMath?'Expected: a sensible demonstration of the same skill using a familiar example. Accept a correct strategy, not only one written format.':'Expected: a short retell grounded in the section and one relevant supporting detail. Accept the learner’s own wording.',
  completionCriteria:'The learner recalls one important idea independently and gives a relevant example or detail. Otherwise choose Needs another look.'
 };
}

/** An original teaching script for an externally accessed official NCERT Contents item. */
function chapterLesson(kind:'read'|'practice'|'review',title:string,subject:string,minutes:number,officialUrl:string|null,grade=4,contentLabel='Chapter'):TeachingLesson{
 if(grade===2)return class2ChapterLesson(kind,title,subject,minutes,officialUrl);

 const resource=contentLabel.toLowerCase();
 const link=officialUrl?` Open the ${resource} through the official NCERT PDF link on the ${resource} page.`:` Open the ${resource} through its Homeschool OS page.`;
 const common={
  materials:`The official NCERT ${resource} (opened through its page), notebook, pencil`,
  minutes,
  easier:'Read a shorter part together, allow oral answers, and stop before the learner tires. Revisit the same section next time.',
  harder:`Ask for a second example from the ${resource} and a written two-sentence explanation without looking back.`,
  revisionGuidance:'If the learner cannot explain the idea without looking, mark this session Needs revision and repeat the read-and-explore script after two days.',
 };
 if(kind==='read')return{
  ...common,
  objective:`Read a manageable part of "${title}" together and retell its main idea in the learner's own words.`,
  prep:`Preview the official ${resource} yourself first. Choose one short section and one idea worth stopping at. This script is original HomeSchool OS guidance; the textbook text stays on the official NCERT site.`,
  example:'Model a think-aloud after one paragraph: "I think this part is about ___ because the words ___ and ___ keep appearing." Then let the learner try the next paragraph.',
  steps:[
   `Open the official ${resource} together.`+link,
   'Read one short section aloud, pausing once to name an unfamiliar word and what it might mean from context.',
   'Model the think-aloud example above on the first paragraph, speaking your reasoning out loud.',
   'Ask the learner to read or listen to the next short part and retell what it was about in one sentence.',
   'Note one question to carry into the practice session. Do not require verbatim textbook wording.',
  ],
  questions:['What is the main idea of the part we read, and which words give you that idea?','Which word or sentence was confusing, and what could we do about it?'],
  exercise:`In your notebook, write or draw one sentence explaining the main idea of the first part of "${title}".`,
  expectedAnswer:`Expected: a short retell in the learner's own words that names the central idea and points to at least one word or sentence from the ${resource}. The official NCERT content is not reproduced here, so accept any accurate retell rather than a memorised line.`,
  completionCriteria:'The learner can retell the main idea of the section without reading it aloud word for word. Otherwise choose Needs revision.',
 };
 if(kind==='practice')return{
  ...common,
  objective:`Work through suitable questions or activities from "${title}" with the learner explaining their method.`,
  prep:`Look at the ${resource}'s own questions or activities and choose two or three that match the section already read. Do not invent official answers or copy textbook exercises into this app.`,
  example:'Before starting, model one: "I will read the question twice, underline what it asks, then say how I will check my answer."',
  steps:[
   'Reopen the section read in the previous session and recall its main idea together.'+link,
   `Choose two suitable questions or activities from the official ${resource} and read each twice.`,
   'Ask the learner to explain how they will start before they write or draw anything.',
   'Let them work; give one hint only when they ask, and note which part needed a hint.',
   `Compare the attempt with the ${resource}'s own guidance where available and record one thing to revisit.`,
  ],
  questions:['How did you decide what to do first?','How can you check whether your answer makes sense?'],
  exercise:`Attempt two selected questions or activities from "${title}" and write one sentence about your method.`,
  expectedAnswer:`Expected: a genuine attempt plus an explanation of the method. Answers depend on the current official edition, so use the ${resource}'s own answer guidance where provided; never fabricate an official answer here.`,
  completionCriteria:'The learner attempts both chosen tasks and can explain at least one method. Effortful work should be marked Needs revision rather than Completed.',
 };
 return{
  ...common,
  objective:`Check understanding of "${title}" by asking the learner to explain two important ideas without looking back.`,
  prep:`Close the ${resource} before starting. Prepare two prompts based on the sections actually read. This is a parent-observed understanding check, not a graded test.`,
  example:`Prompt: "Explain the two most important ideas from this ${resource} and give one example of each." Accept their own words; do not supply the first word.`,
  steps:[
   `Ask the learner what they remember from the ${resource} before reopening anything.`,
   'Ask for two important ideas and one example of each, in their own words.',
   `Reopen the official ${resource} only to check the one idea they were least sure about.`+link,
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
 const chapterGrade=Number(grade.replace('Class ',''));
 // Chapter sessions are generated from verified metadata for every catalogued NCERT grade.
 // Other authored pathways remain available after the chapter-first sequence.
 if(!Number.isInteger(chapterGrade)||chapterGrade<1||chapterGrade>10)return [...annual,...structured,...original];
 // `choose-one` Contents entries stay discoverable in the book index but are not
 // silently turned into compulsory auto-learning tasks. A parent/school must
 // select an official option before it is treated as a learning path item.
 const chapters=ncertChapterSlots.filter(c=>isDefaultChapterSessionEligible(c)&&textbookById(c.bookId)?.grade===chapterGrade).flatMap(c=>{
  const book=textbookById(c.bookId)!;
  const resource='/ncert-books/chapter/'+c.id;
  const base='ncert:'+c.id;
  const officialUrl=officialChapterPdf(c);
  const title=c.verifiedTitle as string;
  // Three short parent-led stages, not copied textbook exercises or an asserted chapter length.
  return ([['read',15],['practice',20],['review',10]] as const).map(([kind,minutes])=>{
   const contentLabel=contentUnitLabelFor(book);
   const lesson=chapterLesson(kind,title,book.subject,minutes,officialUrl,chapterGrade,contentLabel);
   return {id:base+':'+kind,
    title:title+' · '+(kind==='read'?'Read & explore':kind==='practice'?'Practice':'Understanding check'),
    subject:book.subject,minutes,
    source:`NCERT ${contentLabel.toLowerCase()} (official text accessed externally) · original parent-led ${kind} script`,
    href:resource,instructions:lesson.steps,check:lesson.completionCriteria,
    grade,lesson,officialUrl};
  });
 });
 // Interleave by textbook/subject to prevent long single-subject streaks.
 const bySubject=new Map<string,QueueTask[]>();
 for(const c of chapters)bySubject.set(c.subject,[...(bySubject.get(c.subject)??[]),c]);
 const interleaved:QueueTask[]=[];
 while([...bySubject.values()].some(x=>x.length))for(const tasks of bySubject.values()){const next=tasks.shift();if(next)interleaved.push(next);}
 // Keep the verified chapter sequence contiguous and primary. Annual pathways,
 // structured modules and original lessons remain available as secondary enrichment.
 return [...interleaved,...annual,...structured,...original];
}
export function nextQueueTasks(tasks:QueueTask[],completed:ReadonlySet<string>,limit=3){
 // Continue through the sequence without replaying completed tasks.
 return tasks.filter(t=>!completed.has(t.id)).slice(0,limit);
}
