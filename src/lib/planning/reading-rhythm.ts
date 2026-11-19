import {addDays, mondayOf} from './periods';

export function isTeachingDay(date: string) {
  return date <= addDays(mondayOf(date), 4);
}

export function readingTiming(startsOn: string, dueOn: string, asOf: string, dates: unknown[]) {
  const completedOn = dates.filter((value): value is string =>
    typeof value === 'string' && value >= startsOn && value <= asOf).sort()[0] ?? null;
  return {
    completedOn,
    onTime: completedOn !== null && completedOn <= dueOn,
    carriedOver: completedOn === null && asOf > dueOn,
  };
}
