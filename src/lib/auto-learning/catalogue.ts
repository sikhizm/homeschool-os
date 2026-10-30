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
 const chapters=ncertChapterSlots.filter(c=>c.verifiedTitle).map(c=>{
  const book=textbookById(c.bookId)!;
  const pdf=officialChapterPdf(c);
  return {
   id:'ncert:'+c.id,title:c.verifiedTitle!,subject:book.subject,minutes:20,
   source:'NCERT chapter reading · verify edition',href:'/ncert-books/chapter/'+c.id,
   instructions:['Open the official publisher chapter and read a manageable section together.','Discuss the main idea and practise the questions in the book.','Only mark the chapter complete when its learning has actually been covered.'],
   grade
  };
 });
 // Interleave by textbook/subject to prevent long single-subject streaks.
 const bySubject=new Map<string,QueueTask[]>();
 for(const c of chapters)bySubject.set(c.subject,[...(bySubject.get(c.subject)??[]),c]);
 const interleaved:QueueTask[]=[];
 while([...bySubject.values()].some(x=>x.length))for(const tasks of bySubject.values()){const next=tasks.shift();if(next)interleaved.push(next);}
 return [...interleaved,...original];
}
export function nextQueueTasks(tasks:QueueTask[],completed:ReadonlySet<string>,limit=3){
 return tasks.filter(t=>!completed.has(t.id)).slice(0,limit);
}
