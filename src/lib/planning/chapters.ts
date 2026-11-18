export type ChapterTask = {
  id: string;
  chapter: string;
  date: string;
  title: string;
  completed: boolean;
};

export function chapterProgress(ids: string[], tasks: ChapterTask[]) {
  const chapters = ids.map((id) => {
    const scheduled = tasks.filter((task) => task.chapter === id);
    const done = scheduled.filter((task) => task.completed).length;
    const status = !done
      ? "Not started"
      : done === scheduled.length
        ? "Completed"
        : "In progress";
    return { id, status, done, total: scheduled.length };
  });
  const done = chapters.filter(
    (chapter) => chapter.status === "Completed",
  ).length;
  return {
    chapters,
    done,
    remaining: ids.length - done,
    percent: ids.length ? Math.round((100 * done) / ids.length) : 0,
  };
}
