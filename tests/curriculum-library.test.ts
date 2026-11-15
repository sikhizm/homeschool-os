import assert from 'node:assert/strict';
import { test } from 'node:test';
import { classesWithoutTextbooks, textbookGradeOptions } from '../src/lib/library/grade-options';
import { chaptersFor, selectTextbooks } from '../src/lib/ncert/textbooks';

test('textbook options count reviewed book identities and only offer indexed classes', () => {
  assert.deepEqual(classesWithoutTextbooks, [11, 12]);
  assert.deepEqual(textbookGradeOptions.map(option => option.grade), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(textbookGradeOptions[0].label, 'Class 1 · 6 book titles reviewed');
  assert.equal(textbookGradeOptions[1].label, 'Class 2 · 4 book titles reviewed');
  assert.equal(textbookGradeOptions[2].label, 'Class 3 · 7 book titles reviewed');
  const classOne = selectTextbooks(1);
  assert.equal(classOne.flatMap(book => chaptersFor(book.id)).filter(chapter => chapter.verifiedTitle).length, 72);
  const contentsPending = classOne.find(book => book.id === 'ncert-1-dilchasp-riyazi');
  assert.ok(contentsPending);
  assert.equal(chaptersFor(contentsPending.id).length, 0);
});
