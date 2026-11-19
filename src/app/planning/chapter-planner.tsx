"use client";
import {
  classTopics,
  promptClassForStage,
  olympiadSourcesFor,
} from "@/lib/olympiad/prompt-classes";
import Link from "next/link";
import { olympiadResources } from "@/lib/olympiad/catalogue";
import styles from "./chapter-planner.module.css";
import { useState } from "react";
import {
  chaptersFor,
  ncertChapterSlots,
  selectTextbooks,
  textbookById,
} from "@/lib/ncert/textbooks";
import { chapterProgress, type ChapterTask } from "@/lib/planning/chapters";
import { academicYear, daysInWeek, yearDates } from "@/lib/planning/periods";

async function changeChapter(input: Record<string, unknown>) {
  const res = await fetch("/api/planning/chapters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Unable to save.");
}
function chapterName(id: string) {
  const c = ncertChapterSlots.find((c) => c.id === id);
  return c?.verifiedTitle ?? c?.label ?? id;
}
export function ChapterPlanner({
  learnerId,
  stage,
  date,
  ids,
  weekIds,
  finishedChapters,
  passedChapterIds,
  olympiad,
  tasks,
  canEdit,
  refresh,
}: {
  learnerId: string;
  stage: string;
  date: string;
  ids: string[];
  weekIds: string[];
  finishedChapters: string[];
  passedChapterIds: string[];
  olympiad: Record<string, string>;
  tasks: ChapterTask[];
  canEdit: boolean;
  refresh: () => void;
}) {
  const books = selectTextbooks(Number(stage.replace(/^class\s+/i, ""))).filter(
    (b) => b.chapterCount,
  );
  const [book, setBook] = useState(books[0]?.id ?? "");
  const [draft, setDraft] = useState(ids);
  const [weekDraft, setWeekDraft] = useState(weekIds);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const week = daysInWeek(date);
  const year = yearDates(academicYear(date));
  const passed = new Set(passedChapterIds);
  const progress = chapterProgress(
    ids,
    tasks.filter((t) => t.date >= year.startDate && t.date <= year.endDate),
    finishedChapters,
    passed,
  );
  const bookIds = chaptersFor(book).map((c) => c.id);
  const allSelected = bookIds.every((id) => draft.includes(id));
  const grade = promptClassForStage(stage);
  const topics = grade ? classTopics[grade] : [];
  const papers = olympiadResources.filter((r) =>
    r.grades.includes(Number(grade)),
  );
  const planned = [...topics, ...papers.map((r) => "paper:" + r.id)].filter(
    (t) => olympiad[grade + ":" + t],
  );
  const done = planned.filter(
    (t) => olympiad[grade + ":" + t] === "done",
  ).length;
  const subjects = new Map<string, { total: number; done: number }>();
  for (const chapter of progress.chapters) {
    const item = ncertChapterSlots.find((c) => c.id === chapter.id);
    const subject = item && textbookById(item.bookId)?.subject;
    if (!subject) continue;
    const count = subjects.get(subject) ?? { total: 0, done: 0 };
    count.total++;
    if (chapter.status === "Completed") count.done++;
    subjects.set(subject, count);
  }
  const weekly = tasks.filter((t) => week.includes(t.date));
  const finished = weekly.filter((t) => t.completed).length;
  async function save(input: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    try {
      await changeChapter({ learnerId, date, ...input });
      refresh();
      setMessage("Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  function goalOption(key: string, title: string) {
    return (
      <label key={key} className={styles.chapterOption}>
        <input
          type="checkbox"
          disabled={busy}
          checked={Boolean(olympiad[grade + ":" + key])}
          onChange={(e) =>
            void save({
              action: "olympiad",
              topic: key,
              status: e.target.checked ? "planned" : "unplanned",
            })
          }
        />
        <span>{title}</span>
      </label>
    );
  }
  return (
    <>
      <div className="subject-grid">
        <section className="workspace-panel">
          <h2>
            NCERT year plan · {academicYear(date)}–{academicYear(date) + 1}
          </h2>
          {canEdit && books.length > 0 && (
            <fieldset disabled={busy} className={styles.yearPicker}>
              <label className="workspace-field">
                Textbook · {stage}
                <select value={book} onChange={(e) => setBook(e.target.value)}>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.subject} · {b.title} ({b.language})
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setDraft(
                    allSelected
                      ? draft.filter((id) => !bookIds.includes(id))
                      : [...new Set([...draft, ...bookIds])],
                  )
                }
              >
                {allSelected
                  ? "Clear this book"
                  : "Select all chapters in this book"}
              </button>
              <div className="plan-picker-scroll">
                {chaptersFor(book).map((c) => (
                  <label className={styles.chapterOption} key={c.id}>
                    <input
                      type="checkbox"
                      checked={draft.includes(c.id)}
                      onChange={(e) =>
                        setDraft(
                          e.target.checked
                            ? [...draft, c.id]
                            : draft.filter((id) => id !== c.id),
                        )
                      }
                    />
                    <span>
                      {c.label}
                      {c.verifiedTitle && " · " + c.verifiedTitle}
                    </span>
                  </label>
                ))}
              </div>
              <button
                className="btn-primary"
                onClick={() => void save({ action: "year", ids: draft })}
              >
                Save year plan ({draft.length} chapters)
              </button>
            </fieldset>
          )}
          {!books.length && (
            <p>No NCERT chapters are catalogued for {stage}.</p>
          )}
          <section className={styles.progressSection}>
            <h3>Year progress</h3>
            <p>
              {ids.length
                ? progress.percent +
                  "% complete · " +
                  (100 - progress.percent) +
                  "% remaining · " +
                  progress.done +
                  " of " +
                  ids.length +
                  " chapters finished · " +
                  progress.remaining +
                  " remaining"
                : "No chapters selected yet."}
            </p>
          </section>
          {subjects.size > 0 && (
            <section className={styles.progressSection}>
              <h3>Progress by subject</h3>
              {Array.from(subjects, ([subject, count]) => (
                <div key={subject} className={styles.subjectRow}>
                  <strong>{subject}</strong>
                  <span>
                    {Math.round((100 * count.done) / count.total)}% complete
                  </span>
                  <small>
                    {count.done} of {count.total} chapters finished ·{" "}
                    {count.total - count.done} remaining
                  </small>
                </div>
              ))}
            </section>
          )}
          {books.map((b) => {
            const entries = progress.chapters.filter((c) =>
              chaptersFor(b.id).some((s) => s.id === c.id),
            );
            return (
              entries.length > 0 && (
                <details key={b.id}>
                  <summary>
                    {b.subject} · {b.title} ·{" "}
                    {entries.filter((c) => c.status === "Completed").length}/
                    {entries.length} chapters
                  </summary>
                  <ul>
                    {entries.map((c) => (
                      <li key={c.id}>
                        {chapterName(c.id)} — {passed.has(c.id) ? "Finished · test passed" : c.status} · {c.done}/{c.total}{" "}
                        tasks
                        {canEdit && !c.total && !passed.has(c.id) && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void save({
                                action: "finishChapter",
                                finished: c.status !== "Completed",
                                chapter: c.id,
                              })
                            }
                          >
                            {c.status === "Completed"
                              ? "Reopen chapter"
                              : "Mark chapter done"}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )
            );
          })}
        </section>
        <section className="workspace-panel">
          <h2>This week’s chapters</h2>
          <p>
            {week[0]} – {week[6]} ·{" "}
            {weekIds.filter((id) => ids.includes(id)).length} chapters selected
          </p>
          {!ids.length && <p>Choose chapters in the year plan first.</p>}
          {[...subjects.keys()].map((subject) => {
            const options = progress.chapters.filter((c) => {
              const slot = ncertChapterSlots.find((s) => s.id === c.id);
              return slot && textbookById(slot.bookId)?.subject === subject;
            });
            return (
              <details key={subject}>
                <summary>
                  {subject} ·{" "}
                  {options.filter((c) => weekDraft.includes(c.id)).length}{" "}
                  selected
                </summary>
                {options.map((c) => {
                  const slot = ncertChapterSlots.find((s) => s.id === c.id)!;
                  return (
                    <label key={c.id} className={styles.chapterOption}>
                      <input
                        type="checkbox"
                        disabled={!canEdit || busy}
                        checked={weekDraft.includes(c.id)}
                        onChange={(e) =>
                          setWeekDraft(
                            e.target.checked
                              ? [...weekDraft, c.id]
                              : weekDraft.filter((id) => id !== c.id),
                          )
                        }
                      />
                      <span>
                        {chapterName(c.id)}{" "}
                        <small>· {textbookById(slot.bookId)?.title}</small>
                      </span>
                    </label>
                  );
                })}
              </details>
            );
          })}
          <div className={styles.actions}>
            {canEdit && ids.length > 0 && (
              <button
                type="button"
                className="btn-primary"
                disabled={busy}
                onClick={() =>
                  void save({
                    action: "week",
                    ids: weekDraft.filter((id) => ids.includes(id)),
                  })
                }
              >
                Save weekly chapters
              </button>
            )}
            <Link className="btn-secondary" href="/dashboard">
              Open daily schedule →
            </Link>
          </div>
          {weekIds.some((id) => ids.includes(id)) && (
            <section>
              <h3>Weekly focus</h3>
              {[...subjects.keys()].map((subject) => {
                const selected = ncertChapterSlots.filter(
                  (c) =>
                    weekIds.includes(c.id) &&
                    ids.includes(c.id) &&
                    textbookById(c.bookId)?.subject === subject,
                );
                return (
                  selected.length > 0 && (
                    <div key={subject}>
                      <strong>{subject}</strong>
                      <ul>
                        {selected.map((c) => (
                          <li key={c.id}>
                            <Link href={"/ncert-books/chapter/" + c.id}>
                              {chapterName(c.id)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                );
              })}
            </section>
          )}
          {weekly.length > 0 && (
            <p>
              Daily chapter tasks · {finished}/{weekly.length} done
            </p>
          )}
        </section>
      </div>
      {grade && (
        <section className="workspace-panel">
          <h2>
            Olympiad year plan · {academicYear(date)}–{academicYear(date) + 1}
          </h2>
          <p>Class {grade} · Topic practice and sample papers</p>
          <p>
            {planned.length
              ? Math.round((100 * done) / planned.length) +
                "% complete · " +
                done +
                " of " +
                planned.length +
                " practice goals done · " +
                (planned.length - done) +
                " remaining"
              : "Choose a maths topic or a sample paper to practise."}
          </p>
          {planned.length > 0 && (
            <section className={styles.progressSection}>
              <h3>My practice checklist</h3>
              {planned.map((item) => {
                const paper = papers.find((r) => "paper:" + r.id === item);
                const title = paper
                  ? paper.provider + " " + paper.subject + " · " + paper.title
                  : item;
                const href = paper
                  ? paper.pdfUrl
                    ? "/library/olympiad/read/" + paper.id
                    : paper.sourceUrl
                  : "/library/prompts?" +
                    new URLSearchParams({
                      learner: learnerId,
                      grade: grade,
                      topic: item,
                    });
                return (
                  <div key={item} className={styles.practiceRow}>
                    <label className={styles.chapterOption}>
                      <input
                        type="checkbox"
                        disabled={busy || !canEdit}
                        checked={olympiad[grade + ":" + item] === "done"}
                        onChange={(e) =>
                          void save({
                            action: "olympiad",
                            topic: item,
                            status: e.target.checked ? "done" : "planned",
                          })
                        }
                      />
                      <span>{title}</span>
                    </label>
                    <a className="btn-secondary" href={href}>
                      {paper ? "Open paper" : "Build practice prompt"}
                    </a>
                  </div>
                );
              })}
            </section>
          )}
          {canEdit && (
            <details>
              <summary>Choose practice goals</summary>
              <h3>SOF Mathematics · topic practice</h3>
              {topics.map((t) => goalOption(t, t))}
              <h3>Sample papers by subject</h3>
              {[...new Set(papers.map((r) => r.subject))].map((subject) => (
                <details key={subject}>
                  <summary>{subject}</summary>
                  {papers
                    .filter((r) => r.subject === subject)
                    .map((r) =>
                      goalOption("paper:" + r.id, r.provider + " · " + r.title),
                    )}
                </details>
              ))}
            </details>
          )}
          <a href={olympiadSourcesFor(grade)[0]}>Official SOF maths syllabus</a>
        </section>
      )}
      <p role="status">{message}</p>
    </>
  );
}
