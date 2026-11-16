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
  assert.equal(lookup('ncert-2-mridang-ch-02').status,'publisher');
  assert.equal(lookup('ncert-8-poorvi-ch-06').status,'not-confirmed');
  assert.equal(lookup('ncert-4-maths-mela-ch-02').status,'publisher');
  const total=catalogueEvidenceAudit().total;
  assert.equal(total.verified+total.publisher+total.pending+total.notConfirmed,total.slots);
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

test('Class 10 mathematics opens its verified and publisher-listed PDFs', () => {
  const book = textbookById('ncert-10-mathematics')!;
  for (const number of [6, 8, 9, 12]) {
    const chapter = ncertChapterSlots.find(slot => slot.bookId === book.id && slot.chapterNumber === number)!;
    const resource = chapterPdfEvidence(book, chapter);
    assert.equal(resource.status, 'verified');
    assert.equal(resource.href, 'https://ncert.nic.in/textbook/pdf/jemh1' + String(number).padStart(2, '0') + '.pdf');
  }
  const publisher = ncertChapterSlots.find(slot => slot.bookId === book.id && slot.chapterNumber === 1)!;
  assert.equal(chapterPdfEvidence(book, publisher).status, 'publisher');
  assert.equal(chapterPdfEvidence(book, publisher).href, 'https://ncert.nic.in/textbook/pdf/jemh101.pdf');
  const class10 = catalogueEvidenceAudit().classes.get(10)!;
  assert.equal(class10.verified + class10.publisher, 60);
  assert.equal(class10.fallback, 0);
});

test('Class 9 opens publisher-listed chapters without assigning unit PDFs to Khel Praveen chapters', () => {
  const audit = catalogueEvidenceAudit().classes.get(9)!;
  assert.equal(audit.publisher, 74);
  assert.equal(audit.fallback, 23);
  const science = textbookById('ncert-9-exploration')!;
  const first = ncertChapterSlots.find(slot => slot.bookId === science.id && slot.chapterNumber === 1)!;
  assert.equal(chapterPdfEvidence(science, first).href, 'https://ncert.nic.in/textbook/pdf/iesc101.pdf');
  const pe = textbookById('ncert-9-khel-praveen')!;
  assert.ok(ncertChapterSlots.filter(slot => slot.bookId === pe.id)
    .every(slot => chapterPdfEvidence(pe, slot).href === pe.sourceUrl));
});

test('Classes 1–5 use NCERT chapter targets for matched books and keep unmatched chapters on the portal', () => {
  for (const [bookId, code] of [
    ['ncert-1-mridang', 'aemr1'],
    ['ncert-1-sarangi', 'ahsr1'],
    ['ncert-2-mridang', 'bemr1'],
    ['ncert-3-maths-mela', 'cemm1'],
    ['ncert-4-maths-mela', 'demm1'],
    ['ncert-5-maths-mela', 'eemm1'],
  ]) {
    const book = textbookById(bookId)!;
    const chapter = ncertChapterSlots.find(slot => slot.bookId === bookId && slot.chapterNumber === 2)!;
    const resource = chapterPdfEvidence(book, chapter);
    assert.equal(resource.status, 'publisher');
    assert.equal(resource.href, 'https://ncert.nic.in/textbook/pdf/' + code + '02.pdf');
  }
  for (const bookId of ['ncert-5-khel-yoga', 'ncert-1-shehnai']) {
    const book = textbookById(bookId)!;
    assert.equal(book.publisherPdfLinks, undefined);
    const chapters = ncertChapterSlots.filter(slot => slot.bookId === bookId);
    assert.ok(chapters.length);
    assert.ok(chapters.every(chapter => chapterPdfEvidence(book, chapter).href === book.sourceUrl));
  }
});

test('Classes 6–8 use publisher-listed PDFs where export numbering matches the catalogue', () => {
  for (const [id, code] of [
    ['ncert-6-curiosity', 'fecu1'],
    ['ncert-7-ganita-prakash-2', 'gegp2'],
    ['ncert-8-exploring-society-2', 'hees2'],
  ]) {
    const book = textbookById(id)!;
    const chapter = ncertChapterSlots.find(slot => slot.bookId === id && slot.chapterNumber === 1)!;
    const resource = chapterPdfEvidence(book, chapter);
    assert.equal(resource.status, 'publisher');
    assert.equal(resource.href, 'https://ncert.nic.in/textbook/pdf/' + code + '01.pdf');
  }
  for (const id of [
    'ncert-6-poorvi', 'ncert-7-poorvi', 'ncert-8-poorvi',
    'ncert-7-kaushal-bodh', 'ncert-8-kaushal-bodh', 'ncert-8-khel-yatra', 'ncert-6-khayal',
  ]) {
    assert.equal(textbookById(id)!.publisherPdfLinks, undefined);
  }
  assert.deepEqual(validateCatalogueEvidence().errors, []);
});
