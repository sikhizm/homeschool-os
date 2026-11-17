import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ncertTextbooks} from '../src/lib/ncert/textbooks';
import {libraryGradeOptions} from '../src/lib/library/grade-options';

test('Curriculum Library exposes every grade with an actual NCERT book record',()=>{
 const expected=[...new Set(ncertTextbooks.map(book=>book.grade))].sort((a,b)=>a-b);
 const actual=libraryGradeOptions.filter(option=>option.label.startsWith('Class ')).map(option=>Number(option.label.replace('Class ','')));
 assert.deepEqual(actual,expected);
});

test('Class 2 and Class 3 quick filters open their own textbook catalogue',()=>{
 assert.equal(libraryGradeOptions.find(option=>option.label==='Class 2')?.href,'/ncert-books?grade=2');
 assert.equal(libraryGradeOptions.find(option=>option.label==='Class 3')?.href,'/ncert-books?grade=3');
});

test('each class quick filter has a distinct grade-specific destination',()=>{
 const options=libraryGradeOptions.filter(option=>option.label.startsWith('Class '));
 assert.equal(new Set(options.map(option=>option.href)).size,options.length);
 assert.ok(options.every(option=>/^\/ncert-books\?grade=\d+$/.test(option.href)));
});

test('subject shortcuts select an existing book subject and grade', async()=>{
 const {librarySubjectOptions}=await import('../src/lib/library/grade-options');
 assert.equal(librarySubjectOptions.length,6);
 for(const option of librarySubjectOptions){
  const url=new URL(option.href,'https://app.test');
  assert.equal(url.pathname,'/ncert-books');
  assert.equal(url.searchParams.get('subject'),option.label);
  assert.ok(ncertTextbooks.some(book=>book.grade===Number(url.searchParams.get('grade'))&&book.subject===option.label));
 }
});

test('early years shortcuts select matching enrichment and learning types have distinct destinations',async()=>{
 const {libraryLearningOptions}=await import('../src/lib/library/grade-options');
 const {resolveEnrichmentFilters,filterEnrichment}=await import('../src/lib/curriculum/enrichment');
 for(const label of ['Early Years','Nursery','UKG']){
  const url=new URL(libraryGradeOptions.find(option=>option.label===label)!.href,'https://app.test');
  assert.equal(url.pathname,'/library/enrichment');
  const filters=resolveEnrichmentFilters(Object.fromEntries(url.searchParams));
  const {activities}=filterEnrichment(filters.stage,filters.topic);
  assert.ok(activities.length);
  if(label==='Nursery'||label==='UKG')assert.ok(activities.every(activity=>activity.stage===label.toLowerCase()));
  else assert.ok(activities.every(activity=>activity.topic==='early-years'));
 }
 assert.equal(new Set(libraryLearningOptions.map(option=>option.href)).size,4);
 assert.ok(libraryLearningOptions.every(option=>option.href!=='/lessons'));
});

test('shared coverage description reflects actual catalogue counts',async()=>{
 const {textbookCoverageDescription}=await import('../src/lib/library/grade-options');
 const grades=new Set(ncertTextbooks.map(book=>book.grade));
 assert.ok(textbookCoverageDescription.includes(`${ncertTextbooks.length} books`));
 assert.ok(textbookCoverageDescription.includes(`${grades.size} classes`));
 assert.ok(textbookCoverageDescription.includes(`${ncertTextbooks.filter(book=>book.chapterCount>0).length} books have checked contents`));
});
