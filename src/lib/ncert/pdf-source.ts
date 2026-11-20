import { userAgent } from 'next/server';
import { chapterPdfEvidence } from './catalogue-evidence';
import { releasePdfForChapter } from './release-pilot';
import type { ChapterSlot, Textbook } from './types';

export function prefersOfficialNcert(headers: Headers): boolean {
  const { device } = userAgent({ headers });
  return headers.get('sec-ch-ua-mobile') === '?1' || device.type === 'mobile' || device.type === 'tablet';
}

export function chapterPdfSources(book: Textbook, chapter: ChapterSlot, preferOfficial: boolean) {
  const official = chapterPdfEvidence(book, chapter);
  const releaseUrl = releasePdfForChapter(chapter.id);

  return {
    official,
    releaseUrl,
    readerHref: releaseUrl ? `/ncert-books/read/${chapter.id}` : null,
    hasOfficialPdf: official.status === 'verified' || official.status === 'publisher',
  };
}
