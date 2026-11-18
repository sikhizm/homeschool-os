import { validDate } from '../learning/model';

export const NEEDS_PRACTICE_PERCENT = 70;

export type Attempt = {
  id: string;
  assessmentId: string;
  chapterId: string;
  title: string;
  date: string;
  createdAt: string;
  total: number;
  obtained: number;
  remarks: string;
};

export function percentage(attempt: Pick<Attempt, 'total' | 'obtained'>) {
  return 100 * attempt.obtained / attempt.total;
}

export function percentLabel(value: number | null) {
  return value === null ? '—' : `${Number(value.toFixed(2))}%`;
}

export function summarizeTests(attempts: Attempt[]) {
  const ordered = [...attempts].sort((a, b) =>
    a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  const groups = new Map<string, Array<Attempt & { number: number }>>();
  const history = ordered.map((attempt) => {
    const group = groups.get(attempt.assessmentId) ?? [];
    const entry = { ...attempt, number: group.length + 1 };
    group.push(entry);
    groups.set(attempt.assessmentId, group);
    return entry;
  });
  const assessments = Array.from(groups.values(), (group) => {
    const first = group[0];
    const latest = group[group.length - 1];
    return {
      first, latest, attempts: group,
      improvement: group.length > 1 ? percentage(latest) - percentage(first) : null,
    };
  });
  const mean = (rows: Attempt[]) => rows.length
    ? rows.reduce((sum, row) => sum + percentage(row), 0) / rows.length : null;
  return {
    assessments, history,
    latest: history.length ? percentage(history[history.length - 1]) : null,
    best: history.reduce<number | null>((best, row) => Math.max(best ?? 0, percentage(row)), null),
    primaryAverage: mean(assessments.map(({ latest }) => latest)),
    allAttemptsAverage: mean(history),
    chapters: new Set(history.map(({ chapterId }) => chapterId)).size,
  };
}

export function parseTestMutation(payload: unknown) {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid request.');
  const { learnerId, operation, target, title, date, total, obtained, remarks = '' } =
    payload as Record<string, unknown>;
  if (typeof learnerId !== 'string' || !learnerId || learnerId.length > 100)
    throw new Error('Choose a learner.');
  if (typeof operation !== 'string' || !['first', 'new', 'retest', 'edit', 'delete', 'delete_group'].includes(operation))
    throw new Error('Choose an assessment type.');
  const needsTarget = operation !== 'first' && operation !== 'new';
  if (needsTarget && (typeof target !== 'string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(target)))
    throw new Error('Choose an existing assessment or attempt.');
  const targetId = needsTarget ? target as string : null;
  if (operation === 'delete' || operation === 'delete_group')
    return { learnerId, operation, targetId, title: null, date: null, total: null, obtained: null, remarks: null };
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 160)
    throw new Error('Enter a test title of up to 160 characters.');
  if (!validDate(date)) throw new Error('Enter a valid test date.');
  const validMarks = (value: unknown): value is number => typeof value === 'number'
    && value >= 0 && value <= 99_999_999.99 && Number(value.toFixed(2)) === value;
  if (!validMarks(total) || total === 0) throw new Error('Enter positive total marks with up to two decimal places.');
  if (!validMarks(obtained) || obtained > total) throw new Error('Enter marks from zero up to the total, with up to two decimal places.');
  if (typeof remarks !== 'string' || remarks.length > 2000) throw new Error('Keep remarks within 2,000 characters.');
  return { learnerId, operation, targetId, title: title.trim(), date, total, obtained, remarks: remarks.trim() };
}
