import { gradeCoverage, ncertTextbooks } from '../ncert/textbooks';

// These catalogue states explicitly confirm the book identity. Contents, edition
// and PDF evidence are tracked separately on the corresponding records.
const reviewedBookStates = new Set([
  'source-verified-chapter-titles',
  'book-confirmed-chapter-titles-pending',
  'book-confirmed-contents-pending',
]);

const catalogueCoverage = gradeCoverage();
export const textbookGradeOptions = catalogueCoverage
  .filter(({ cataloguedBooks }) => cataloguedBooks > 0)
  .map(({ grade }) => {
    const reviewed = ncertTextbooks.filter(book => book.grade === grade && reviewedBookStates.has(book.status)).length;
    const reviewLabel = reviewed === 0
      ? 'Title review pending'
      : `${reviewed} book ${reviewed === 1 ? 'title' : 'titles'} reviewed`;
    return { grade, label: `Class ${grade} · ${reviewLabel}` };
  });

export const classesWithoutTextbooks = catalogueCoverage
  .filter(({ cataloguedBooks }) => cataloguedBooks === 0)
  .map(({ grade }) => grade);

export const libraryGradeOptions: { label: string; href: string }[] = [
  { label: 'Early Years', href: '/library/enrichment?topic=early-years' },
  { label: 'Nursery', href: '/library/enrichment?stage=nursery' },
  { label: 'UKG', href: '/library/enrichment?stage=ukg' },
  ...textbookGradeOptions.map(({ grade }) => ({ label: `Class ${grade}`, href: `/ncert-books?grade=${grade}` })),
];

/** Subject shortcuts always select a grade that actually has this subject. */
export const librarySubjectOptions = ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Vocational Education'].flatMap(label => {
  const books = ncertTextbooks.filter(book => book.subject === label);
  const book = books.find(book => book.grade === 4) ?? books[0];
  return book ? [{ label, href: `/ncert-books?grade=${book.grade}&subject=${encodeURIComponent(label)}` }] : [];
});

export const libraryLearningOptions = [
  { label: 'Read textbooks', href: '/ncert-books' },
  { label: 'Practise Olympiad papers', href: '/library/olympiad?grade=all' },
  { label: 'Early-years play', href: '/library/enrichment?topic=early-years' },
  { label: 'Create learning materials', href: '/library/prompts' },
];

export const textbookCoverageDescription = `${ncertTextbooks.length} books are catalogued across ${catalogueCoverage.filter(row => row.cataloguedBooks > 0).length} classes. ${catalogueCoverage.reduce((total, row) => total + row.contentsAudited, 0)} books have checked contents; ${ncertTextbooks.filter(book => book.chapterCount === 0).length} await contents verification.`;
