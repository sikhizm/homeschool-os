"use client";
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
  tasks,
  canEdit,
  refresh,
}: {
  learnerId: string;
  stage: string;
  date: string;
  ids: string[];
  tasks: ChapterTask[];
  canEdit: boolean;
  refresh: () => void;
}) {
  const books = selectTextbooks(Number(stage.replace(/^class\s+/i, ""))).filter(
    (b) => b.chapterCount,
  );
  const [book, setBook] = useState(books[0]?.id ?? "");
  const [draft, setDraft] = useState(ids);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const week = daysInWeek(date);
  const year = yearDates(academicYear(date));
  const progress = chapterProgress(
    ids,
    tasks.filter((t) => t.date >= year.startDate && t.date <= year.endDate),
  );
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
  return (
    <>
      <div className="subject-grid">
        <section className="workspace-panel">
          <h2>
            NCERT year plan · {academicYear(date)}–{academicYear(date) + 1}
          </h2>
          {canEdit && books.length > 0 && (
            <fieldset disabled={busy}>
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
              <div className="plan-picker-scroll">
                {chaptersFor(book).map((c) => (
                  <label className="plan-competency-option" key={c.id}>
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
                    {c.label}
                    {c.verifiedTitle && " · " + c.verifiedTitle}
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
                        {chapterName(c.id)} — {c.status} · {c.done}/{c.total}{" "}
                        tasks
                      </li>
                    ))}
                  </ul>
                </details>
              )
            );
          })}
        </section>
        <section className="workspace-panel">
          <h2>This week’s chapter tasks</h2>
          <p>
            {weekly.length
              ? Math.round((100 * finished) / weekly.length) +
                "% complete · " +
                (100 - Math.round((100 * finished) / weekly.length)) +
                "% remaining · " +
                finished +
                " of " +
                weekly.length +
                " tasks done · " +
                (weekly.length - finished) +
                " remaining"
              : "No chapter tasks scheduled this week."}
          </p>
          {canEdit && ids.length > 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void save({
                  action: "schedule",
                  date: f.get("day"),
                  chapter: f.get("chapter"),
                  task: f.get("task"),
                });
              }}
            >
              <fieldset disabled={busy}>
                <label className="workspace-field">
                  Chapter from year plan
                  <select name="chapter">
                    {ids.map((id) => {
                      const c = ncertChapterSlots.find((c) => c.id === id);
                      return (
                        <option key={id} value={id}>
                          {c && textbookById(c.bookId)?.title} ·{" "}
                          {chapterName(id)}
                        </option>
                      );
                    })}
                  </select>
                </label>
                <label className="workspace-field">
                  Day
                  <select key={date} name="day" defaultValue={date}>
                    {week
                      .filter((d) => academicYear(d) === academicYear(date))
                      .map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                  </select>
                </label>
                <label className="workspace-field">
                  Daily task
                  <input
                    name="task"
                    placeholder="e.g. Read pages 1–4"
                    required
                    maxLength={80}
                  />
                </label>
                <button className="btn-primary">Add to daily schedule</button>
              </fieldset>
            </form>
          )}
          {canEdit && !ids.length && (
            <p>Save chapters in the year plan to schedule them here.</p>
          )}
          {weekly.map((t) => (
            <article key={t.id}>
              <strong>{t.title}</strong>
              <p>
                {t.date} · {t.completed ? "Done" : "Scheduled"}
              </p>
              {!t.completed && canEdit && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void save({
                      action: "move",
                      id: t.id,
                      date: t.date,
                      to: new FormData(e.currentTarget).get("to"),
                    });
                  }}
                >
                  <label>
                    Move to{" "}
                    <input
                      aria-label={"New date for " + t.title}
                      type="date"
                      name="to"
                      required
                      min={yearDates(academicYear(t.date)).startDate}
                      max={yearDates(academicYear(t.date)).endDate}
                    />
                  </label>{" "}
                  <button disabled={busy} className="btn-secondary">
                    Move task
                  </button>
                </form>
              )}
            </article>
          ))}
        </section>
      </div>
      <p role="status">{message}</p>
    </>
  );
}
