import assert from 'node:assert/strict';
import {test} from 'node:test';
import {queueCatalogue} from '../src/lib/auto-learning/catalogue';
import {isDefaultChapterSessionEligible,ncertChapterSlots,textbookById} from '../src/lib/ncert/textbooks';

const sessionKinds=['read','practice','review'] as const;

test('every default-path verified NCERT item in Classes 1–10 generates the three stable sessions',()=>{
 for(let grade=1;grade<=10;grade++){
  const slots=ncertChapterSlots.filter(slot=>
   isDefaultChapterSessionEligible(slot)&&textbookById(slot.bookId)?.grade===grade
  );
  const tasks=queueCatalogue(`Class ${grade}`);
  const chapterTasks=tasks.filter(task=>task.id.startsWith('ncert:'));
  const expected=slots.flatMap(slot=>sessionKinds.map(kind=>`ncert:${slot.id}:${kind}`));
  assert.deepEqual(
   chapterTasks.map(task=>task.id).sort(),
   expected.sort(),
   `Class ${grade} chapter sessions should match verified chapter slots`
  );
  assert.equal(new Set(chapterTasks.map(task=>task.id)).size,chapterTasks.length,
   `Class ${grade} must not contain duplicate chapter session IDs`);
 }
});

test('Class 2 and Class 4 chapter session identifiers remain unchanged',()=>{
 for(const grade of [2,4]){
  const slot=ncertChapterSlots.find(item=>
   Boolean(item.verifiedTitle)&&textbookById(item.bookId)?.grade===grade
  );
  assert.ok(slot, `Class ${grade} needs at least one verified chapter fixture`);
  const ids=new Set(queueCatalogue(`Class ${grade}`).map(task=>task.id));
  for(const kind of sessionKinds)assert.ok(ids.has(`ncert:${slot.id}:${kind}`));
 }
});

test('verified chapter sessions are the primary sequence and enrichment remains secondary',()=>{
 for(let grade=1;grade<=10;grade++){
  const tasks=queueCatalogue(`Class ${grade}`);
  const firstNonChapter=tasks.findIndex(task=>!task.id.startsWith('ncert:'));
  const lastChapter=tasks.reduce((last,task,index)=>task.id.startsWith('ncert:')?index:last,-1);
  if(lastChapter>=0&&firstNonChapter>=0)assert.ok(firstNonChapter>lastChapter);
 }
});

test('publisher-selected alternatives and unverified titles never generate compulsory learning sessions',()=>{
 const nonDefault=ncertChapterSlots.filter(slot=>!isDefaultChapterSessionEligible(slot));
 for(let grade=1;grade<=10;grade++){
  const ids=new Set(queueCatalogue(`Class ${grade}`).map(task=>task.id));
  for(const slot of nonDefault){
   if(textbookById(slot.bookId)?.grade===grade){
    for(const kind of sessionKinds)assert.ok(!ids.has(`ncert:${slot.id}:${kind}`));
   }
  }
 }
});


test('official choose-one routes are explicit and omitted from the default queue',()=>{
 const alternatives=ncertChapterSlots.filter(slot=>slot.selection==='choose-one');
 assert.equal(alternatives.length,15); // 6 Class 8 projects + 9 Class 9 vocation alternatives
 const groups=new Map<string,typeof alternatives>();
 for(const slot of alternatives){
  assert.ok(slot.selectionGroupId,slot.id);
  assert.ok(slot.selectionNote,slot.id);
  const grade=textbookById(slot.bookId)?.grade;
  assert.ok(grade);
  const ids=new Set(queueCatalogue(`Class ${grade}`).map(task=>task.id));
  for(const kind of sessionKinds)assert.ok(!ids.has(`ncert:${slot.id}:${kind}`),slot.id);
  groups.set(slot.selectionGroupId!, [...(groups.get(slot.selectionGroupId!)??[]),slot]);
 }
 assert.equal(groups.size,6,'three Class 8 and three Class 9 official alternative groups');
 assert.deepEqual([...groups.values()].map(group=>group.length).sort((a,b)=>a-b),[2,2,2,3,3,3]);
 const required=ncertChapterSlots.filter(slot=>slot.bookId==='ncert-9-kaushal-vikas'&&slot.selection==='required');
 assert.deepEqual(required.map(slot=>slot.chapterNumber),[1,5,9]);
});
