export const chapterStatuses = [
  { id: 'pending', label: 'Pending', detail: 'Reading is still to do.' },
  { id: 'read', label: 'Read', detail: 'Finished reading the chapter.' },
  { id: 'revised', label: 'Revised', detail: 'Finished revising the chapter.' },
  { id: 'needs_practice', label: 'Needs practice', detail: 'Needs more work to understand the chapter.' },
] as const;

export type ChapterStatus = typeof chapterStatuses[number]['id'];

export function normalizeChapterStatus(value: unknown): ChapterStatus {
  if (value === 'completed' || value === 'revision_due') return 'read';
  return chapterStatuses.find(status => status.id === value)?.id ?? 'pending';
}

export const finishedChapterStatus = {
  id: 'finished', label: 'Finished', detail: 'Automatically awarded for a chapter test score of 60% or higher.',
} as const;

export const chapterDisplayStatuses = [...chapterStatuses, finishedChapterStatus] as const;
export type ChapterDisplayStatus = typeof chapterDisplayStatuses[number]['id'];
