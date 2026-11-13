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
