export const activityLabels = {reading: 'Reading', revision: 'Revision', test: 'Test'} as const;
export type ChapterActivity = keyof typeof activityLabels;
export type ChapterPlanItem = {
  chapterId: string; learnerId: string; learnerName: string; title: string;
  activity: ChapterActivity; period: 'day' | 'week'; done: boolean; inToday: boolean;
  startsOn: string; completedOn: string | null; onTime: boolean; carriedOver: boolean; optionalTest?: boolean;
};

export function chapterActivityHref(chapterId: string, learnerId: string, activity: ChapterActivity) {
  const href = `/ncert-books/chapter/${encodeURIComponent(chapterId)}?learner=${encodeURIComponent(learnerId)}`;
  return href + {reading: '#chapter-reading', revision: '&revision=1#study-material-studio', test: '#chapter-tests'}[activity];
}
