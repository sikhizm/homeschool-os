"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ChapterTask } from "@/lib/planning/chapters";

export function PlannedChapters({
  learnerId,
  canEdit,
}: {
  learnerId: string;
  canEdit: boolean;
}) {
  const [tasks, setTasks] = useState<ChapterTask[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
  useEffect(() => {
    const controller = new AbortController();
    fetch(
      "/api/planning/chapters?" +
        new URLSearchParams({ learnerId, date, view: "day" }),
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw Error(data.error);
        if (!controller.signal.aborted) setTasks(data.tasks);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [learnerId, date]);
  async function check(task: ChapterTask) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/planning/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId,
          date,
          action: "check",
          id: task.id,
          completed: !task.completed,
        }),
      });
      if (!res.ok) throw Error((await res.json()).error);
      setTasks((current) =>
        current.map((t) =>
          t.id === task.id ? { ...t, completed: !task.completed } : t,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  if (!tasks.length && !error) return null;
  return (
    <section className="card">
      <h2>My scheduled chapters</h2>
      {tasks.map((t) => (
        <div key={t.id} className="idea-row">
          <label>
            <input
              type="checkbox"
              checked={t.completed}
              disabled={busy || !canEdit}
              onChange={() => void check(t)}
            />{" "}
            {t.title}
          </label>
          <Link href={"/ncert-books/chapter/" + t.chapter}>Open chapter</Link>
        </div>
      ))}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
