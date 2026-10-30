import {lessons} from '@/lib/lessons/library';
import {ncertChapterSlots,textbookById,officialChapterPdf} from '@/lib/ncert/textbooks';

export type QueueTask={id:string;title:string;subject:string;minutes:number;source:string;href:string;instructions:string[];grade:string};
export function stageFor(grade:string){
 if(['Early Years','Nursery','LKG','UKG'].includes(grade))return 'early';
 const n=Number(grade.replace('Class ',''));
 if(!Number.isInteger(n)||n<1||n>12)return null;
 return n<=2?'class1-2':n<=5?'class3-5':n<=8?'class6-8':n<=10?'class9-10':'class11-12';
}
export function queueCatalogue(grade:string):QueueTask[]{
 const stage=stageFor(grade);
 if(!stage)return [];
 const original=lessons.filter(x=>x.stage===stage).map(x=>({
  id:'original:'+x.id,title:x.title,subject:x.subject,minutes:x.minutes,
  source:'Original activity · educator review recommended',href:'/lessons',
  instructions:x.steps,grade
 }));
 if(grade!=='Class 4')return original;
 const chapters=ncertChapterSlots.filter(c=>c.verifiedTitle).flatMap(c=>{
  const book=textbookById(c.bookId)!;
  const resource='/ncert-books/chapter/'+c.id;
  const base='ncert:'+c.id;
  // Three short parent-led stages, not copied textbook exercises or an asserted chapter length.
  return [
   {id:base+':read',title:c.verifiedTitle+' · Read & explore',subject:book.subject,minutes:15,
    source:'NCERT · guided reading (original activity)',href:resource,
    instructions:['Open the official chapter through the learning page.','Read a manageable portion together; stop when the child needs a break.','Ask the learner to retell or explain the main idea.'],grade},
   {id:base+':practice',title:c.verifiedTitle+' · Practice',subject:book.subject,minutes:20,
    source:'NCERT · parent-led practice (original activity)',href:resource,
    instructions:['Review the chapter sections already read.','Choose suitable questions or activities from the official NCERT chapter.','Note any idea that needs another explanation.'],grade},
   {id:base+':review',title:c.verifiedTitle+' · Understanding check',subject:book.subject,minutes:10,
    source:'NCERT · parent-checked understanding (original activity)',href:resource,
    instructions:['Ask the learner to explain two important ideas from the chapter.','Review one example independently or together as appropriate.','If understanding is incomplete, choose Needs revision instead of Completed.'],grade}
  ];
 });
 // Interleave by textbook/subject to prevent long single-subject streaks.
 const bySubject=new Map<string,QueueTask[]>();
 for(const c of chapters)bySubject.set(c.subject,[...(bySubject.get(c.subject)??[]),c]);
 const interleaved:QueueTask[]=[];
 while([...bySubject.values()].some(x=>x.length))for(const tasks of bySubject.values()){const next=tasks.shift();if(next)interleaved.push(next);}
 return [...interleaved,...original];
}
export function nextQueueTasks(tasks:QueueTask[],completed:ReadonlySet<string>,limit=3){
 // Continue through the sequence without replaying completed tasks.
 return tasks.filter(t=>!completed.has(t.id)).slice(0,limit);
}
