/**
 * GitHub Release PDF mapping for Classes 1–5.
 * A link is produced only when the catalogue book has a textbook code and the
 * matching class release uses the known NCERT filename convention.
 */
import { textbookById } from './textbooks';

const RELEASE_TAG: Record<number, string> = {
  1: 'class1',
  2: 'class2',
  3: 'class3',
  4: 'class4',
  5: 'class-5',
};

export function releasePdfForChapter(chapterId: string): string | null {
  const match = chapterId.match(/^(.*)-ch-(\d{2})$/);
  if (!match) return null;
  const book = textbookById(match[1]);
  if (!book || book.grade < 1 || book.grade > 5 || !book.textbookCode || !RELEASE_TAG[book.grade]) return null;
  // Urdu catalogue entries whose codes are numeric do not have matching assets.
  if (!/^[a-z]{4}\d$/i.test(book.textbookCode)) return null;
  const filename = `${book.textbookCode}${match[2]}.pdf`;
  return `https://github.com/sikhizm/homeschool-os-assets/releases/download/${RELEASE_TAG[book.grade]}/${filename}`;
}

export const releasePdfPilot = {
  chapterId: 'ncert-4-maths-mela-ch-01',
  title: 'Shapes Around Us',
  releasePdfUrl: 'https://github.com/sikhizm/homeschool-os-assets/releases/download/class4/demm101.pdf',
  officialNcertUrl: 'https://ncert.nic.in/textbook/pdf/demm101.pdf',
} as const;
