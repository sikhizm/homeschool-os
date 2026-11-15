import { class5ReviewQueue, type MappingRevision } from '../curriculum/class5-mapping';
import { contentUnitLabelFor, ncertChapterSlots, ncertTextbooks, validateNcertCatalogue } from './textbooks';
import type { ChapterSlot, Textbook } from './types';

export const pdfLabels = {
  verified: 'Direct PDF verified',
  'not-confirmed': 'Official book portal',
  pending: 'PDF verification pending',
} as const;
export const mappingLabels = {
  approved: 'Approved mapping',
  proposed: 'Proposed · awaiting review',
  unmapped: 'Unmapped',
  pending: 'Evidence pending',
} as const;
type PdfStatus = keyof typeof pdfLabels;
type MappingStatus = keyof typeof mappingLabels;

export function chapterPdfEvidence(book: Textbook, chapter: ChapterSlot): {
  status: PdfStatus; href: string; evidence: string;
} {
  if (chapter.officialPdf) return {
    status: 'verified', href: chapter.officialPdf.url, evidence: chapter.officialPdf.verificationNote,
  };
  const attempt = book.pdfAuditAttempts?.[chapter.chapterNumber];
  return {
    status: attempt && !attempt.inconclusive ? 'not-confirmed' : 'pending',
    href: book.sourceUrl,
    evidence: attempt?.evidence ?? 'An individually verified direct PDF is not recorded. Use the official NCERT book portal.',
  };
}

export function mappingEvidence(revisions: readonly MappingRevision[] = []) {
  const states = new Map<string, MappingStatus>();
  const priority: Record<MappingStatus, number> = { pending: 0, unmapped: 1, proposed: 2, approved: 3 };
  for (const item of class5ReviewQueue(revisions)) {
    if (item.kind === 'unmapped') continue; // Existing catalogue gaps lack specialist evidence.
    const status: MappingStatus = item.status === 'approved' && item.effective.reviewerUserId && item.effective.reviewedAt
      ? 'approved' : item.status === 'draft' || item.status === 'in_review'
        ? 'proposed' : item.status === 'unmapped' ? 'unmapped' : 'pending';
    const id = item.chapter.chapterId;
    if (priority[status] > priority[states.get(id) ?? 'pending']) states.set(id, status);
  }
  return (chapter: ChapterSlot): MappingStatus => {
    if (chapter.mappingStatus === 'human-reviewed') return 'approved';
    if (chapter.mappingStatus === 'proposed') return 'proposed';
    return states.get(chapter.id) ?? 'pending';
  };
}

export function catalogueEvidenceAudit(revisions: readonly MappingRevision[] = []) {
  const mapping = mappingEvidence(revisions);
  const empty = () => ({
    books: 0, slots: 0, verified: 0, pending: 0, notConfirmed: 0, fallback: 0,
    incompleteBooks: 0, approved: 0, proposed: 0, unmapped: 0, evidencePending: 0,
  });
  const total = empty();
  const classes = new Map<number, ReturnType<typeof empty>>();
  const subjects = new Map<string, ReturnType<typeof empty>>();
  const byBook = Map.groupBy(ncertChapterSlots, chapter => chapter.bookId);
  for (const book of ncertTextbooks) {
    const byClass = classes.get(book.grade) ?? empty();
    const bySubject = subjects.get(book.subject) ?? empty();
    classes.set(book.grade, byClass);
    subjects.set(book.subject, bySubject);
    const chapters = byBook.get(book.id) ?? [];
    const pdfs = chapters.map(chapter => chapterPdfEvidence(book, chapter).status);
    for (const row of [total, byClass, bySubject]) {
      row.books++;
      if (pdfs.length === 0 || pdfs.includes('pending')) row.incompleteBooks++;
      chapters.forEach((chapter, index) => {
        row.slots++;
        const pdf = pdfs[index];
        if (pdf === 'verified') row.verified++;
        else {
          row.fallback++;
          if (pdf === 'pending') row.pending++;
          else row.notConfirmed++;
        }
        const status = mapping(chapter);
        row[status === 'pending' ? 'evidencePending' : status]++;
      });
    }
  }
  return { total, classes, subjects };
}

export function validateCatalogueEvidence() {
  const errors = validateNcertCatalogue();
  const editorial = catalogueEvidenceAudit().total;
  const books = new Map(ncertTextbooks.map(book => [book.id, book]));
  for (const chapter of ncertChapterSlots) {
    const book = books.get(chapter.bookId);
    if (!book) continue;
    if (chapter.label !== `${contentUnitLabelFor(book)} ${chapter.chapterNumber}`) errors.push('Incorrect Contents label: ' + chapter.id);
    if (chapter.skillIds.length !== new Set(chapter.skillIds).size) errors.push('Duplicate competency: ' + chapter.id);
    const reference = chapter.officialPdf;
    if (reference && (!/^https:\/\/(?:www\.)?ncert\.nic\.in\/textbook\/pdf\/[\w-]+\.pdf$/i.test(reference.url) ||
      !reference.verificationNote.trim())) errors.push('Invalid direct PDF evidence: ' + chapter.id);
  }
  for (const book of ncertTextbooks) {
    for (const ordinal of Object.keys(book.verifiedPdfReferences ?? {})) {
      if (!/^[1-9]\d*$/.test(ordinal) || Number(ordinal) > book.chapterCount) errors.push('PDF reference outside book: ' + book.id + '/' + ordinal);
    }
    for (const [ordinal, attempt] of Object.entries(book.pdfAuditAttempts ?? {})) {
      if (!/^[1-9]\d*$/.test(ordinal) || Number(ordinal) > book.chapterCount ||
        !attempt.evidence.trim() || book.verifiedPdfReferences?.[Number(ordinal)]) errors.push('Invalid PDF attempt: ' + book.id + '/' + ordinal);
    }
  }
  return {
    errors,
    warnings: [`${editorial.pending} direct PDF checks pending`, `${editorial.evidencePending} chapters need mapping evidence`],
  };
}
