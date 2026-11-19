export const chapterStatuses = [
  { id: 'pending', label: 'Pending', detail: 'Reading is still to do.' },
  { id: 'read', label: 'Read', detail: 'Finished reading the chapter.' },
  { id: 'revision_due', label: 'Revision due', detail: 'Read and flagged for revision.' },
  { id: 'revised', label: 'Revised', detail: 'Finished revising the chapter.' },
  { id: 'needs_practice', label: 'Needs practice', detail: 'Needs more work to understand the chapter.' },
] as const;

export type ChapterStatus = typeof chapterStatuses[number]['id'];

export function normalizeChapterStatus(value: unknown): ChapterStatus {
  if (value === 'completed') return 'read';
  return chapterStatuses.find(status => status.id === value)?.id ?? 'pending';
}
