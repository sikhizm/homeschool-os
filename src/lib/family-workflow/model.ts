import { validDate } from '../learning/model';
export const subjects = [
  'Mathematics',
  'English',
  'Science',
  'Social Science',
  'Hindi',
  'Reasoning',
] as const;
export const dayModes = { minimum: 30, normal: 60, flexible: 90 } as const;
export const outcomes = {
  independent: 'Understood independently',
  help: 'Understood with help',
  change: 'Needs another approach',
  unfinished: 'Did not finish',
} as const;
export type Activity = {
  id: string;
  learner_id: string;
  display_name: string;
  learning_date: string;
  title: string;
  minutes: number;
  completed: boolean;
  skipped: boolean;
  resource_key: string | null;
  resource_href: string | null;
  subject_label: string;
  support_mode: string;
  start_minute: number | null;
  shared_group: string | null;
  understanding: keyof typeof outcomes | null;
  actual_minutes: number | null;
  timer_started_at?: string | null;
  reflection: string;
  evidence_url: string;
  next_action: string;
  next_notes: string;
  goal_id: string | null;
};
export class WorkflowInputError extends Error {}
export function text(value: unknown, max = 1000) {
  if (typeof value !== 'string' || value.length > max)
    throw new WorkflowInputError('Invalid text field.');
  return value.trim();
}
export function integer(value: unknown, min: number, max: number) {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  )
    throw new WorkflowInputError(
      `Choose a whole number from ${min} to ${max}.`,
    );
  return value;
}
export function date(value: unknown) {
  if (!validDate(value)) throw new WorkflowInputError('Choose a valid date.');
  return value;
}
export function choice<T extends string>(
  value: unknown,
  values: readonly T[],
): T {
  if (!values.includes(value as T))
    throw new WorkflowInputError('Choose a valid option.');
  return value as T;
}
export function evidence(value: unknown) {
  const url = text(value ?? '');
  if (url && !/^https?:\/\//i.test(url))
    throw new WorkflowInputError(
      'Evidence links must start with https:// or http://.',
    );
  if (url)
    try {
      new URL(url);
    } catch {
      throw new WorkflowInputError('Invalid evidence link.');
    }
  return url;
}
export function familyMinutes(items: Activity[]) {
  const shared = new Set<string>();
  return items
    .filter((a) => !a.skipped)
    .reduce((sum, a) => {
      const key = a.shared_group
        ? `${a.shared_group}:${a.learning_date}:${a.start_minute}:${a.minutes}`
        : null;
      if (key && shared.has(key)) return sum;
      if (key) shared.add(key);
      return sum + a.minutes;
    }, 0);
}
export function scheduleConflicts(items: Activity[]) {
  const guided = items.filter(
    (a) =>
      !a.skipped && a.support_mode !== 'independent' && a.start_minute !== null,
  );
  const pairs: string[] = [];
  for (let i = 0; i < guided.length; i++)
    for (let j = i + 1; j < guided.length; j++) {
      const a = guided[i],
        b = guided[j];
      if (a.learning_date !== b.learning_date) continue;
      if (
        a.shared_group &&
        a.shared_group === b.shared_group &&
        a.start_minute === b.start_minute &&
        a.minutes === b.minutes
      )
        continue;
      if (
        a.start_minute! < b.start_minute! + b.minutes &&
        b.start_minute! < a.start_minute! + a.minutes
      )
        pairs.push(
          `${a.display_name}: ${a.title} overlaps ${b.display_name}: ${b.title}`,
        );
    }
  return pairs;
}
export function weeklySummary(items: Activity[]) {
  const needs = new Map<string, number>();
  for (const a of items)
    if (a.understanding === 'help' || a.understanding === 'change') {
      const key = `${a.display_name} · ${a.subject_label || 'General'}`;
      needs.set(key, (needs.get(key) ?? 0) + 1);
    }
  const recorded = items.filter((a) => a.actual_minutes !== null);
  return {
    completed: items.filter((a) => a.completed).length,
    unfinished: items.filter((a) => !a.completed && !a.skipped).length,
    planned: items.filter((a) => !a.skipped).reduce((n, a) => n + a.minutes, 0),
    actual: recorded.reduce((n, a) => n + a.actual_minutes!, 0),
    recorded: recorded.length,
    repeatedHelp: [...needs].filter(([, count]) => count >= 2),
  };
}
