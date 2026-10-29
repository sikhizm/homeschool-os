import {globalSkills,globalStages,globalFrameworks,type GlobalSkill} from '@/lib/global-curriculum/catalogue';
import {lessons,type Lesson} from '@/lib/lessons/library';
import {ncertTextbooks,ncertChapterSlots,gradeCoverage} from '@/lib/ncert/textbooks';

/** Original curriculum planning suggestions. No school board certificates, exam grades or inferred mastery. */
export type SkillPlan = {skill:GlobalSkill;lesson:Lesson|null;minutes:number;mode:'guided'|'independent';observationPrompt:string};
export const coreAreas=['English','Mathematics','Our world','Punjabi & Sikh heritage'] as const;
export type CurriculumStage=typeof globalStages[number]['id'];

export function validStage(value:string):CurriculumStage {
 return globalStages.find(s=>s.id===value)?.id??'class3-5';
}
export function skillsForStage(stage:CurriculumStage){return globalSkills.filter(skill=>skill.stage===stage);}
export function suggestedLesson(skill:GlobalSkill):Lesson|null {
 const sameArea=lessons.filter(lesson=>lesson.stage===skill.stage&&lesson.subject===skill.subject);
 const words=skill.title.toLowerCase().split(/\W+/).filter(word=>word.length>3);
 const scored=sameArea.map(lesson=>({lesson,score:words.filter(word=>(lesson.title+' '+lesson.objective).toLowerCase().includes(word)).length}));
 scored.sort((a,b)=>b.score-a.score||a.lesson.id.localeCompare(b.lesson.id));
 return scored[0]?.lesson??null;
}
export function createParentReviewPlan(stage:CurriculumStage,focus:string=''):SkillPlan[]{
 const skills=skillsForStage(stage);
 const sorted=focus?skills.filter(skill=>skill.subject===focus).concat(skills.filter(skill=>skill.subject!==focus)):skills;
 const selected:GlobalSkill[]=[];
 for(const area of coreAreas){
   const candidate=sorted.find(skill=>skill.subject===area);
   if(candidate&&!selected.some(s=>s.id===candidate.id))selected.push(candidate);
 }
 if(!selected.length)return [];
 const allocations=selected.length===4?[20,15,15,10]:selected.length===3?[25,20,15]:selected.length===2?[30,30]:[60];
 return selected.map((skill,i)=>({skill,lesson:suggestedLesson(skill),minutes:allocations[i]??10,mode:'guided',observationPrompt:skill.check}));
}
export function curriculumCoverage(){
 const gradeRows=gradeCoverage();
 const referenced=new Set(globalSkills.flatMap(skill=>skill.frameworks));
 return {
  stages:globalStages.length,originalSkills:globalSkills.length,originalLessons:lessons.length,
  textbookRecords:ncertTextbooks.length,chaptersIndexed:ncertChapterSlots.length,
  sourceCheckedTitles:ncertChapterSlots.filter(ch=>Boolean(ch.verifiedTitle)).length,
  approvedChapterMappings:ncertChapterSlots.filter(ch=>ch.mappingStatus==='human-reviewed').length,
  gradesWithPartialCatalogue:gradeRows.filter(row=>row.cataloguedBooks>0).length,
  gradesWithoutBooks:gradeRows.filter(row=>row.cataloguedBooks===0).length,
  frameworkLenses:globalFrameworks.filter(f=>referenced.has(f.id)&&f.id!=='original'&&f.id!=='epathshala').length,
  completeBoards:0,
  gradeRows,
 };
}
export function validatePlan(){
 const errors:string[]=[];
 for(const stage of globalStages){
  const plan=createParentReviewPlan(stage.id);
  if(!plan.length)errors.push('No plan for '+stage.id);
  const sum=plan.reduce((total,p)=>total+p.minutes,0);
  if(sum!==60)errors.push('Guided time not 60 for '+stage.id+' '+sum);
  if(plan.some(p=>!p.skill.check||p.minutes<1))errors.push('Invalid observation prompt '+stage.id);
 }
 for(const book of ncertTextbooks){
   if(book.chapterCount===0&&ncertChapterSlots.some(ch=>ch.bookId===book.id))errors.push('Unverified chapter objects '+book.id);
 }
 return errors;
}
