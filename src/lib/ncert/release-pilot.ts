/**
 * One-file GitHub Release reading pilot.
 * Keep the official NCERT URL in the catalogue as the independent fallback.
 */
export const releasePdfPilot = {
  chapterId: 'ncert-4-maths-mela-ch-01',
  title: 'Shapes Around Us',
  releasePdfUrl: 'https://github.com/sikhizm/homeschool-os-assets/releases/download/class4/demm101.pdf',
  officialNcertUrl: 'https://ncert.nic.in/textbook/pdf/demm101.pdf',
} as const;

export function releasePdfForChapter(chapterId: string): string | null {
  return chapterId === releasePdfPilot.chapterId ? releasePdfPilot.releasePdfUrl : null;
}
