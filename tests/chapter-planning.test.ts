import { changeWorkflow } from "../src/lib/family-workflow/service";
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fixture } from "./fixture";
import { chapterRequest } from "../src/lib/planning/chapter-request";
import { chapterProgress } from "../src/lib/planning/chapters";
import { ncertChapterSlots, textbookById } from "../src/lib/ncert/textbooks";

test("planned chapters follow daily checkmarks through rescheduling and reopening", async () => {
  const f = await fixture();
  try {
    await f.db.exec(
      "ALTER TABLE learners ADD COLUMN archived_at timestamptz; UPDATE learners SET stage='Class 4'",
    );
    for (const file of [
      "002_learning_planning.sql",
      "011_family_learning_workflow.sql",
      "012_chapter_planning.sql",
      "013_year_plan_tracking.sql",
    ]) {
      await f.db.exec(
        await readFile(
          new URL("../migrations/" + file, import.meta.url),
          "utf8",
        ),
      );
    }
    const learnerId = f.ids[0],
      date = "2026-11-18";
    const ids = ncertChapterSlots
      .filter((c) => textbookById(c.bookId)?.grade === 4)
      .slice(0, 2)
      .map((c) => c.id);
    const write = (input: Record<string, unknown>, user = "owner-a") =>
      chapterRequest(
        f.sql,
        user,
        new Request("https://example.test", {
          method: "POST",
          body: JSON.stringify({ learnerId, date, ...input }),
        }),
        true,
      );
    const read = async (view = "") =>
      (
        await chapterRequest(
          f.sql,
          "owner-a",
          new Request(
            "https://example.test/?" +
              new URLSearchParams({ learnerId, date, view }),
          ),
          false,
        )
      ).json();
    assert.equal((await write({ action: "year", ids }, "owner-b")).status, 403);
    assert.equal(
      (await write({ action: "year", ids }, "viewer-a")).status,
      403,
    );
    assert.equal((await write({ action: "year", ids })).status, 200);
    for (const day of [date, "2026-11-19"])
      assert.equal(
        (
          await write({
            action: "schedule",
            chapter: ids[0],
            task: "Practise",
            date: day,
          })
        ).status,
        200,
      );
    const [first] = (await read("day")).tasks;
    assert.equal(
      (await write({ action: "check", id: first.id, completed: true })).status,
      200,
    );
    assert.equal(
      chapterProgress(ids, (await read()).tasks).chapters[0].status,
      "In progress",
    );
    const second = (await read()).tasks[1];
    assert.equal(
      (
        await write({
          action: "move",
          id: second.id,
          date: second.date,
          to: "2026-11-23",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await write({
          action: "check",
          id: second.id,
          date: "2026-11-23",
          completed: true,
        })
      ).status,
      200,
    );
    assert.equal(chapterProgress(ids, (await read()).tasks).percent, 50);
    await write({ action: "check", id: first.id, completed: false });
    assert.equal(chapterProgress(ids, (await read()).tasks).remaining, 2);
    assert.equal(
      (
        await write({
          action: "finishChapter",
          finished: true,
          chapter: ids[1],
        })
      ).status,
      200,
    );
    assert.equal(
      (await write({ action: "olympiad", topic: "Fractions", status: "done" }))
        .status,
      200,
    );
    const [plan] =
      await f.sql`SELECT olympiad_topics FROM learning_planning_periods`;
    assert.deepEqual(plan.olympiad_topics, { "4:Fractions": "done" });
    await changeWorkflow(f.sql, "owner-a", {
      action: "startTimer",
      id: first.id,
    });
    await f.sql`UPDATE learning_activities SET timer_started_at=now()-interval '10 minutes' WHERE id=${first.id}`;
    await changeWorkflow(f.sql, "owner-a", {
      action: "stopTimer",
      id: first.id,
    });
    await changeWorkflow(f.sql, "owner-a", {
      action: "stopTimer",
      id: first.id,
    });
    const [activity] =
      await f.sql`SELECT actual_minutes,completed FROM learning_activities WHERE id=${first.id}`;
    assert.equal(activity.actual_minutes, 10);
    assert.equal(activity.completed, false);
  } finally {
    await f.db.close();
  }
});
