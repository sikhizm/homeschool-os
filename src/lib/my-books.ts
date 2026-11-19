export const bookKinds = {story: 'Storybook', activity: 'Activity book', drawing: 'Drawing book', learning: 'Learning book'};

export function bookPageProgress(total: number, entries: {first_page: number; last_page: number; completed: boolean}[]) {
  const pages = new Set<number>();
  for (const entry of entries) {
    if (!entry.completed) continue;
    for (let page = entry.first_page; page <= entry.last_page && page <= total; page++) pages.add(page);
  }
  let nextPage = 1;
  while (pages.has(nextPage)) nextPage++;
  return {done: pages.size, nextPage: nextPage <= total ? nextPage : null};
}
