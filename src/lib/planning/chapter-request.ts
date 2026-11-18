import { classTopics, promptClassForStage } from "../olympiad/prompt-classes";
import type { Sql } from "../learning/service";
import { ncertChapterSlots, textbookById } from "../ncert/textbooks";
import {
  academicYear,
  daysInWeek,
  validPlanningDate,
  yearDates,
} from "./periods";

const send = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
export async function chapterRequest(
  sql: Sql,
  user: string,
  request: Request,
  write: boolean,
) {
  const p = write
    ? await request.json().catch(() => null)
    : Object.fromEntries(new URL(request.url).searchParams);
  if (
    !p ||
    typeof p.learnerId !== "string" ||
    !validPlanningDate(p.date) ||
    academicYear(p.date) < 2020 ||
    academicYear(p.date) > 2099
  )
    return send({ error: "Choose a learner and date." }, 400);
  const [learner] =
    await sql`SELECT l.id, l.stage, fm.role FROM learners l JOIN family_members fm ON fm.family_id=l.family_id WHERE fm.auth_user_id=${user} AND l.id::text=${p.learnerId} AND l.archived_at IS NULL AND l.family_id=(SELECT family_id FROM family_members WHERE auth_user_id=${user} ORDER BY created_at,family_id LIMIT 1)`;
  if (!learner || (write && learner.role !== "owner"))
    return send({ error: "Permission denied." }, 403);
  const year = yearDates(academicYear(p.date));
  const week = daysInWeek(p.date);
  if (!write) {
    const daily = p.view === "day";
    const tasks =
      await sql`SELECT id::text,substring(resource_key from 7) AS chapter,learning_date::text AS date,title,completed FROM learning_activities WHERE learner_id=${learner.id} AND resource_key LIKE 'ncert:%' AND NOT skipped AND learning_date BETWEEN ${daily ? p.date : [year.startDate, week[0]].sort()[0]}::date AND ${daily ? p.date : [year.endDate, week[6]].sort()[1]}::date ORDER BY learning_date,position,created_at`;
    return send({ tasks });
  }
  if (p.action === "check" && typeof p.completed === "boolean") {
    const changed =
      await sql`UPDATE learning_activities SET completed=${p.completed} WHERE id::text=${p.id} AND learner_id=${learner.id} AND learning_date=${p.date}::date AND NOT skipped AND resource_key LIKE 'ncert:%' RETURNING id`;
    return changed.length
      ? send({ saved: true })
      : send({ error: "Activity unavailable." }, 404);
  }
  const grade = Number(String(learner.stage).replace(/^class\s+/i, ""));
  if (p.action === "olympiad") {
    const cls = promptClassForStage(String(learner.stage));
    if (
      !cls ||
      typeof p.topic !== "string" ||
      !classTopics[cls].includes(p.topic) ||
      !["unplanned", "planned", "done"].includes(p.status)
    )
      return send({ error: "Choose a valid Olympiad topic and status." }, 400);
    const key = cls + ":" + p.topic;
    const patch = JSON.stringify(
      p.status === "unplanned" ? {} : { [key]: p.status },
    );
    await sql`INSERT INTO learning_planning_periods(learner_id,kind,start_date,end_date,title,olympiad_topics)
      VALUES(${learner.id},'year',${year.startDate},${year.endDate},'Year plan',${patch}::jsonb)
      ON CONFLICT(learner_id,kind,start_date) DO UPDATE SET olympiad_topics=(learning_planning_periods.olympiad_topics - ${key}::text) || EXCLUDED.olympiad_topics, updated_at=now()`;
    return send({ saved: true });
  }
  if (p.action === "year") {
    const available = new Set(
      ncertChapterSlots
        .filter((c) => textbookById(c.bookId)?.grade === grade)
        .map((c) => c.id),
    );
    if (
      !Array.isArray(p.ids) ||
      p.ids.some((id: unknown) => typeof id !== "string" || !available.has(id))
    )
      return send({ error: "Choose chapters for this class." }, 400);
    const ids = [...new Set<string>(p.ids)];
    await sql`INSERT INTO learning_planning_periods(learner_id,kind,start_date,end_date,title,chapter_ids) VALUES(${learner.id},'year',${year.startDate},${year.endDate},'NCERT year plan',${ids}::text[]) ON CONFLICT(learner_id,kind,start_date) DO UPDATE SET chapter_ids=EXCLUDED.chapter_ids,updated_at=now()`;
    return send({ saved: true });
  }
  if (
    p.action === "finishChapter" &&
    typeof p.chapter === "string" &&
    typeof p.finished === "boolean"
  ) {
    const rows =
      await sql`UPDATE learning_planning_periods SET finished_chapters=array_remove(finished_chapters,${p.chapter}::text) || CASE WHEN ${p.finished} THEN ARRAY[${p.chapter}::text] ELSE '{}'::text[] END, updated_at=now()
      WHERE learner_id=${learner.id} AND kind='year' AND start_date=${year.startDate} AND ${p.chapter}=ANY(chapter_ids) RETURNING id`;
    return rows.length
      ? send({ saved: true })
      : send({ error: "Save this chapter in the year plan first." }, 409);
  }
  if (p.action === "schedule") {
    const chapter = ncertChapterSlots.find((c) => c.id === p.chapter);
    const book = chapter && textbookById(chapter.bookId);
    if (
      !chapter ||
      !book ||
      typeof p.task !== "string" ||
      !p.task.trim() ||
      p.task.trim().length > 80
    )
      return send(
        { error: "Choose a chapter and enter a task of up to 80 characters." },
        400,
      );
    const title = [
      book.title,
      chapter.verifiedTitle ?? chapter.label,
      p.task.trim(),
    ].join(" · ");
    const rows =
      await sql`INSERT INTO learning_activities(learner_id,learning_date,title,minutes,resource_key,resource_href,subject_label,support_mode) SELECT learner_id,${p.date}::date,${title.slice(0, 200)},15,${"ncert:" + chapter.id},${"/ncert-books/chapter/" + chapter.id},${book.subject},'independent' FROM learning_planning_periods WHERE learner_id=${learner.id} AND kind='year' AND start_date=${year.startDate} AND ${chapter.id}=ANY(chapter_ids) ON CONFLICT DO NOTHING RETURNING id`;
    return rows.length
      ? send({ saved: true })
      : send(
          {
            error:
              "Save the chapter in the year plan and choose a day without an existing task for this chapter.",
          },
          409,
        );
  }
  if (
    p.action === "move" &&
    validPlanningDate(p.to) &&
    academicYear(p.date) === academicYear(p.to)
  ) {
    const rows =
      await sql`UPDATE learning_activities SET learning_date=${p.to}::date WHERE learner_id=${learner.id} AND id::text=${p.id} AND learning_date=${p.date}::date AND NOT completed AND NOT skipped AND resource_key LIKE 'ncert:%' RETURNING id`;
    return rows.length
      ? send({ saved: true })
      : send({ error: "Task has changed. Refresh the plan." }, 409);
  }
  return send({ error: "Choose a valid chapter planning action." }, 400);
}
