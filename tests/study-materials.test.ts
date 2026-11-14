import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MATERIALS,buildStudyPrompt} from '../src/lib/study-materials/prompt';
import {markdownToSafeHtml,sanitizeStudyHtml} from '../src/lib/study-materials/sanitize';
import {textbookById,chaptersFor,officialChapterPdf} from '../src/lib/ncert/textbooks';

test('chapter prompt includes verified catalogue metadata and explicit source gate',()=>{
 const book=textbookById('ncert-5-maths-mela')!;const chapter=chaptersFor(book.id)[0];
 const prompt=buildStudyPrompt({student:'Learner Example',stage:'Class 5',book,chapter,resourceUrl:officialChapterPdf(chapter)??book.sourceUrl,materials:['full-notes','chapter-test','answer-key'],difficulty:'supportive',language:'English'});
 for(const item of ['Learner Example','Class 5','Mathematics','Maths Mela',chapter.verifiedTitle!,book.sourceUrl,'STOP','upload the chapter PDF/pages','never','A4 portrait','black-and-white','actual downloadable PDF file','Do NOT return HTML','Attach the completed PDF file'])assert.ok(prompt.toLowerCase().includes(item.toLowerCase()),item);
 assert.ok(!prompt.includes('Create one self-contained HTML document'));
 assert.ok(prompt.includes('Full Chapter Notes; Chapter Test; Separate Answer Key'));
 assert.ok(!prompt.includes('Complete Chapter Mastery Pack'));
});
test('complete pack expands the full selected catalogue and difficulty presets stay distinct',()=>{
 const book=textbookById('ncert-3-santoor')!;const chapter=chaptersFor(book.id)[0];
 const make=(difficulty:'supportive'|'standard'|'stretch')=>buildStudyPrompt({student:'Child',stage:'Class 3',book,chapter,resourceUrl:book.sourceUrl,materials:['complete-pack'],difficulty,language:'Punjabi'});
 const p=make('supportive');assert.ok(p.includes('Parent feedback sheet'));assert.ok(p.includes('Practice worksheet — Level 1'));assert.ok(p.includes('Practice worksheet — Level 2'));assert.ok(p.includes('Challenge worksheet — Level 3'));assert.ok(p.includes('Punjabi'));assert.ok(p.includes('one combined PDF'));assert.ok(p.includes('proper Gurmukhi glyphs'));assert.ok(!p.includes('Oral Quiz Cards'));
 assert.notEqual(p,make('standard'));assert.notEqual(make('standard'),make('stretch'));
 assert.equal(MATERIALS.length,28);
});
test('import sanitizer strips script, event handlers, unsafe URLs and embedded resources while retaining tables and math',()=>{
 const safe=sanitizeStudyHtml('<h1 onclick="alert(1)">Notes</h1><script>steal()</script><img src="https://evil.test/x"><p><a href="javascript:alert(1)" onmouseover="x()">unsafe link</a> H<sub>2</sub>O and x<sup>2</sup></p><table><tr><th scope="col">A</th><td colspan="2">B</td></tr></table>');
 assert.ok(safe.includes('<h2>Notes</h2>'));assert.ok(!safe.includes('onclick'));assert.ok(!safe.includes('script'));assert.ok(!safe.includes('evil.test'));assert.ok(!safe.includes('javascript:'));assert.ok(safe.includes('<sub>2</sub>'));assert.ok(safe.includes('<sup>2</sup>'));assert.ok(safe.includes('<table>'));assert.ok(safe.includes('colspan="2"'));
});
test('simple original SVG diagrams keep safe vector geometry but drop scripts, events and foreign objects',()=>{
 const safe=sanitizeStudyHtml('<svg viewBox="0 0 100 100" width="100" height="100" onload="x()"><circle cx="50" cy="50" r="20" fill="none" stroke="black"/><path d="M0 0L10 10" onmouseover="x()"/><foreignObject><script>x()</script></foreignObject></svg>');
 assert.ok(safe.includes('<svg'));assert.ok(safe.includes('<circle'));assert.ok(safe.includes('<path'));assert.ok(!safe.includes('onload'));assert.ok(!safe.includes('onmouseover'));assert.ok(!safe.includes('foreignObject'));assert.ok(!safe.includes('<script>'));
});
test('markdown import escapes raw HTML and retains headings, lists and paragraphs',()=>{
 const html=markdownToSafeHtml('# Revision\n\n- Recall facts\n- Check ideas\n\n<script>alert(1)</script>');
 assert.ok(html.includes('<h2>Revision</h2>'));assert.ok(html.includes('<ul>'));assert.ok(html.includes('<li>Recall facts</li>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
});
test('sanitizer bounds content and rejects empty documents',()=>{
 assert.throws(()=>sanitizeStudyHtml('  '),/Paste document/);assert.throws(()=>sanitizeStudyHtml('x'.repeat(500001)),/500 KB/);
});
