import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classNumber, pdfTarget, csvCell } from '../scripts/ncert-pdf-links.mjs';

const base = 'https://ncert.nic.in/textbook.php?jesc1=0-13';

test('accepts publisher class selectors without using book-code initials', () => {
  assert.equal(classNumber('Class X'), 10);
  assert.equal(classNumber('XII'), 12);
  assert.equal(classNumber('Class 1'), 1);
  assert.equal(classNumber('Select class'), 0);
  assert.equal(classNumber('13'), 0);
});

test('extracts literal publisher PDF targets without inferring filenames', () => {
  assert.equal(pdfTarget("window.open('textbook/pdf/jesc101.pdf')", base),
    'https://ncert.nic.in/textbook/pdf/jesc101.pdf');
  assert.equal(pdfTarget('/textbook/pdf/jemh1ps.pdf', base),
    'https://ncert.nic.in/textbook/pdf/jemh1ps.pdf');
  assert.equal(pdfTarget('/textbook.php?jesc1=1-13', base), null);
  assert.equal(pdfTarget('https://mirror.example/textbook/pdf/jesc101.pdf', base), null);
});

test('escapes commas, quotes and spreadsheet formula prefixes', () => {
  assert.equal(csvCell('गणित, "पाठ"'), '"गणित, ""पाठ"""');
  assert.equal(csvCell('=1+1'), "'=1+1");
});
