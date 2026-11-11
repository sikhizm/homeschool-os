import assert from 'node:assert/strict';
import {test} from 'node:test';
import {queueCatalogue} from '../src/lib/auto-learning/catalogue';
import {ncertChapterSlots,textbookById} from '../src/lib/ncert/textbooks';

const sessionKinds=['read','practice','review'] as const;

test('every verified NCERT chapter in Classes 1–8 generates the three stable sessions',()=>{
 for(let grade=1;grade<=8;grade++){
  const slots=ncertChapterSlots.filter(slot=>
   Boolean(slot.verifiedTitle)&&textbookById(slot.bookId)?.grade===grade
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
 for(let grade=1;grade<=8;grade++){
  const tasks=queueCatalogue(`Class ${grade}`);
  const firstNonChapter=tasks.findIndex(task=>!task.id.startsWith('ncert:'));
  const lastChapter=tasks.reduce((last,task,index)=>task.id.startsWith('ncert:')?index:last,-1);
  if(lastChapter>=0&&firstNonChapter>=0)assert.ok(firstNonChapter>lastChapter);
 }
});

test('unverified chapter titles never generate learning sessions',()=>{
 const unverified=ncertChapterSlots.filter(slot=>!slot.verifiedTitle);
 for(let grade=1;grade<=8;grade++){
  const ids=new Set(queueCatalogue(`Class ${grade}`).map(task=>task.id));
  for(const slot of unverified){
   if(textbookById(slot.bookId)?.grade===grade){
    for(const kind of sessionKinds)assert.ok(!ids.has(`ncert:${slot.id}:${kind}`));
   }
  }
 }
});
