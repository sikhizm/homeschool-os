export const STAGES = [
  'Early Years',
  'Nursery',
  'LKG',
  'UKG',
  ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`),
];
export type Subject = {
  id: string;
  name: string;
  approach: string;
  archived: boolean;
};
export type Goal = {
  id: string;
  subject_id: string;
  title: string;
  progress: number;
  evidence: string;
  target_date: string | null;
};
export type Activity = {
  id: string;
  subject_id: string | null;
  goal_id: string | null;
  title: string;
  minutes: number;
  completed: boolean;
  reflection: string;
  position: number;
  learning_date: string;
};
export type Workspace = {
  subjects: Subject[];
  goals: Goal[];
  activities: Activity[];
};
export const FOUNDATIONS = [
  {
    name: 'English',
    approach:
      'NCERT language foundations: read aloud, talk, retell, then write at the learner’s level.',
  },
  {
    name: 'Mathematics',
    approach:
      'NCERT concepts through objects, drawings and reasoning before written practice.',
  },
  {
    name: 'Our world',
    approach:
      'NCERT environmental studies / The World Around Us: observe, ask questions and explore outdoors.',
  },
  {
    name: 'Punjabi & Sikh heritage',
    approach:
      'Oral Punjabi, age-appropriate stories of kindness, seva and equality; reflect through art and conversation.',
  },
];
export function planSuggestions(stage: string) {
  const playful = ['Early Years', 'Nursery', 'LKG', 'UKG'].includes(stage);
  return [
    {
      title: playful
        ? 'Story, rhyme & conversation'
        : 'Read together & retell in your own words',
      minutes: 15,
      subject: 'English',
    },
    {
      title: playful
        ? 'Count, sort & build with everyday objects'
        : 'Explore one maths idea with objects, then practise',
      minutes: 15,
      subject: 'Mathematics',
    },
    {
      title: playful
        ? 'Movement, nature walk & noticing'
        : 'Observe, investigate & sketch a question about our world',
      minutes: 15,
      subject: 'Our world',
    },
    {
      title:
        'Punjabi conversation, a Sikh heritage story or a small act of seva',
      minutes: 10,
      subject: 'Punjabi & Sikh heritage',
    },
    {
      title: 'Reflect together: what did you notice or enjoy?',
      minutes: 5,
      subject: null,
    },
  ];
}
export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const d = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(d.getTime()) &&
    d.toISOString().slice(0, 10) === value &&
    value >= '2000-01-01' &&
    value <= '2100-12-31'
  );
}
export class InputError extends Error {}
const text = (v: unknown, max: number, optional = false) => {
  if (
    typeof v !== 'string' ||
    (!optional && !v.trim()) ||
    v.trim().length > max
  )
    throw new InputError('Please check the text fields and their length.');
  return v.trim();
};
const id = (v: unknown) => {
  if (
    typeof v !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  )
    throw new InputError('Choose a valid record.');
  return v;
};
const nullableId = (v: unknown) =>
  v === null || v === '' || v === undefined ? null : id(v);
const integer = (v: unknown, min: number, max: number) => {
  if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max)
    throw new InputError(`Enter a whole number between ${min} and ${max}.`);
  return v;
};
const bool = (v: unknown) => {
  if (typeof v !== 'boolean') throw new InputError('Choose a valid status.');
  return v;
};
const date = (v: unknown) => {
  if (!validDate(v))
    throw new InputError('Choose a valid date between 2000 and 2100.');
  return v;
};
export function parseCommand(input: unknown) {
  if (!input || typeof input !== 'object')
    throw new InputError('Invalid request.');
  const b = input as Record<string, unknown>;
  switch (b.action) {
    case 'learner.update': {
      const stage = text(b.stage, 30);
      if (!STAGES.includes(stage))
        throw new InputError('Choose a valid learning stage.');
      return {
        action: b.action,
        displayName: text(b.displayName, 70),
        stage,
      } as const;
    }
    case 'subject.create':
      return {
        action: b.action,
        name: text(b.name, 80),
        approach: text(b.approach, 600, true),
      } as const;
    case 'subject.update':
      return {
        action: b.action,
        id: id(b.id),
        name: text(b.name, 80),
        approach: text(b.approach, 600, true),
        archived: bool(b.archived),
      } as const;
    case 'goal.create':
      return {
        action: b.action,
        subjectId: id(b.subjectId),
        title: text(b.title, 200),
        targetDate: b.targetDate ? date(b.targetDate) : null,
      } as const;
    case 'goal.update':
      return {
        action: b.action,
        id: id(b.id),
        title: text(b.title, 200),
        progress: integer(b.progress, 0, 100),
        evidence: text(b.evidence, 1000, true),
        targetDate: b.targetDate ? date(b.targetDate) : null,
      } as const;
    case 'activity.create':
      return {
        action: b.action,
        date: date(b.date),
        title: text(b.title, 200),
        minutes: integer(b.minutes, 1, 120),
        subjectId: nullableId(b.subjectId),
        goalId: nullableId(b.goalId),
      } as const;
    case 'activity.update':
      return {
        action: b.action,
        id: id(b.id),
        title: text(b.title, 200),
        minutes: integer(b.minutes, 1, 120),
        completed: bool(b.completed),
        reflection: text(b.reflection, 1000, true),
        scheduledDate: b.scheduledDate ? date(b.scheduledDate) : null,
        position:
          b.position === undefined ? null : integer(b.position, 0, 1000),
      } as const;
    case 'plan.starter':
      return { action: b.action, date: date(b.date) } as const;
    default:
      throw new InputError('Unknown action.');
  }
}
export type Command = ReturnType<typeof parseCommand>;
