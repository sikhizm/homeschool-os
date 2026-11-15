import assert from 'node:assert/strict';
import { test } from 'node:test';
import { catalogueEvidenceAudit, chapterPdfEvidence, mappingEvidence, validateCatalogueEvidence } from '../src/lib/ncert/catalogue-evidence';
import { ncertChapterSlots, textbookById } from '../src/lib/ncert/textbooks';
import { class5MappingProposals, type MappingRevision } from '../src/lib/curriculum/class5-mapping';

test('catalogue distinguishes documented PDFs, failed checks and inconclusive checks', () => {
  const lookup = (id:string) => {
    const chapter=ncertChapterSlots.find(slot=>slot.id===id)!;
    return chapterPdfEvidence(textbookById(chapter.bookId)!,chapter);
  };
  assert.equal(lookup('ncert-2-mridang-ch-01').status,'verified');
  assert.equal(lookup('ncert-2-mridang-ch-02').status,'pending');
  assert.equal(lookup('ncert-8-poorvi-ch-06').status,'not-confirmed');
  assert.match(lookup('ncert-4-maths-mela-ch-02').evidence,/timed out/);
  assert.match(lookup('ncert-4-maths-mela-ch-02').href,/textbook\.php/);
  const total=catalogueEvidenceAudit().total;
  assert.equal(total.verified+total.pending+total.notConfirmed,total.slots);
  assert.equal(total.fallback,total.pending+total.notConfirmed);
  assert.equal(total.approved+total.proposed+total.unmapped+total.evidencePending,total.slots);
  assert.deepEqual(validateCatalogueEvidence().errors,[]);
});

test('approval and unmapped decisions stay family-specific', () => {
  const proposal=class5MappingProposals[0];
  const chapter=ncertChapterSlots.find(slot=>slot.id===proposal.chapterId)!;
  const revision:MappingRevision={
    ...proposal,id:'test',mappingId:proposal.id,revision:1,
    reviewStatus:'approved', reviewReason:'Reviewed source',actorUserId:'owner',
    reviewerUserId:'owner',reviewedAt:'2026-11-15',supersedesId:null,createdAt:'2026-11-15',
  };
  assert.equal(mappingEvidence()(chapter),'proposed');
  assert.equal(mappingEvidence([revision])(chapter),'approved');
  assert.equal(mappingEvidence([{...revision,reviewStatus:'unmapped'}])(chapter),'unmapped');
  assert.equal(mappingEvidence()(ncertChapterSlots[0]),'pending');
});

test('Class 10 mathematics opens its individually recorded PDFs and keeps the portal for other chapters', () => {
  const book = textbookById('ncert-10-mathematics')!;
  for (const number of [6, 8, 9, 12]) {
    const chapter = ncertChapterSlots.find(slot => slot.bookId === book.id && slot.chapterNumber === number)!;
    const resource = chapterPdfEvidence(book, chapter);
    assert.equal(resource.status, 'verified');
    assert.equal(resource.href, 'https://ncert.nic.in/textbook/pdf/jemh1' + String(number).padStart(2, '0') + '.pdf');
  }
  const unverified = ncertChapterSlots.find(slot => slot.bookId === book.id && slot.chapterNumber === 7)!;
  assert.equal(chapterPdfEvidence(book, unverified).href, book.sourceUrl);
});
