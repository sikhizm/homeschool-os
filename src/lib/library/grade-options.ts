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
  { label: 'Early Years', href: '/lessons' },
  { label: 'Nursery', href: '/lessons' },
  { label: 'UKG', href: '/lessons' },
  ...textbookGradeOptions.map(({ grade }) => ({ label: `Class ${grade}`, href: `/ncert-books?grade=${grade}` })),
];
