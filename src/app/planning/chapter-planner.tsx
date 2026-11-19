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
import {chapterDisplayStatuses, normalizeChapterStatus} from "@/lib/ncert/chapter-status";
import WeeklyChapterActivities from "./weekly-chapter-activities";
export type ChapterRecord = {chapter_id: string; status: string; has_read: boolean};
import { academicYear, daysInWeek } from "@/lib/planning/periods";

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
  chapterRecords,
  today,
  tab,
  onTabChange,
  passedChapterIds,
  olympiad,
  canEdit,
  refresh,
}: {
  learnerId: string;
  stage: string;
  date: string;
  ids: string[];
  weekIds: string[];
  chapterRecords: ChapterRecord[];
  today: string;
  tab: 'week' | 'year';
  onTabChange: (tab: 'week' | 'year') => void;
  passedChapterIds: string[];
  olympiad: Record<string, string>;
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
  const passed = new Set(passedChapterIds);
  const records = new Map(chapterRecords.map(record => [record.chapter_id, record]));
  const chapters = ids.map(id => {
    const record = records.get(id);
    const status = normalizeChapterStatus(record?.status);
    return {id, status, read: record?.has_read === true || status === 'read'};
  });
  const read = chapters.filter(chapter => chapter.read).length;
  const revised = chapters.filter(chapter => chapter.status === 'revised').length;
  const tested = chapters.filter(chapter => passed.has(chapter.id)).length;
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
  const subjects = new Map<string, typeof chapters>();
  for (const chapter of chapters) {
    const slot = ncertChapterSlots.find(item => item.id === chapter.id);
    const subject = slot && textbookById(slot.bookId)?.subject;
    if (!subject) continue;
    const entries = subjects.get(subject) ?? [];
    entries.push(chapter);
    subjects.set(subject, entries);
  }
  const weekLabel = new Intl.DateTimeFormat('en-IN', {day: 'numeric', month: 'short', timeZone: 'UTC'})
    .formatRange(new Date(week[0] + 'T12:00:00Z'), new Date(week[6] + 'T12:00:00Z'));
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
      <section className="workspace-panel">
        <div className={styles.actions} aria-label="Planner view">
          <button type="button" className={tab === 'week' ? 'btn-primary' : 'btn-secondary'}
            aria-pressed={tab === 'week'} onClick={() => onTabChange('week')}>Weekly plan</button>
          <button type="button" className={tab === 'year' ? 'btn-primary' : 'btn-secondary'}
            aria-pressed={tab === 'year'} onClick={() => onTabChange('year')}>Yearly plan</button>
        </div>
        {tab === 'year' ? <>
          <h2>NCERT year plan · {academicYear(date)}–{academicYear(date) + 1}</h2>
          {ids.length > 0 ? <div className={styles.coverage}>
            <strong>{read} of {ids.length} chapters read</strong>
            <progress value={read} max={ids.length} aria-label="Chapters read" />
            <span>{revised} revised · {tested} finished by test</span>
          </div> : <p>No chapters selected yet.</p>}
          {canEdit && books.length > 0 && <details className={styles.picker}>
            <summary>Edit chapter selection</summary>
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
          </details>}
          {[...subjects].map(([subject, entries]) => <details key={subject} className={styles.subjectDetails}>
            <summary><strong>{subject}</strong><span>{entries.filter(chapter => chapter.read).length} / {entries.length} read</span></summary>
            <ul className={styles.chapterRows}>{entries.map(chapter => {
              const status = passed.has(chapter.id) ? 'finished' : chapter.status;
              return <li key={chapter.id}>
                <Link href={`/ncert-books/chapter/${encodeURIComponent(chapter.id)}?learner=${encodeURIComponent(learnerId)}#chapter-status`}>
                  {chapterName(chapter.id)}
                </Link>
                <span className="pill">{chapterDisplayStatuses.find(item => item.id === status)?.label}</span>
              </li>;
            })}</ul>
          </details>)}
        </> : <>
          <div className={styles.actions}>
            <h2>This week · {weekLabel}</h2>
            <Link className="btn-secondary" href="/dashboard">Today’s rhythm →</Link>
          </div>
          {!ids.length && <p>Choose chapters in the yearly plan first.</p>}
          {canEdit && ids.length > 0 && <details className={styles.picker}>
            <summary>＋ Add chapters</summary>
          {[...subjects.keys()].map((subject) => {
            const options = subjects.get(subject) ?? [];
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
          </div>
          </details>}
          <WeeklyChapterActivities learnerId={learnerId} date={date} weekIds={weekIds} today={today} />
        </>}
      </section>
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
