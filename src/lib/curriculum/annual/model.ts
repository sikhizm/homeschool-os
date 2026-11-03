/**
 * HomeSchool OS — annual learning pathway model.
 *
 * This module is pure data + deterministic expansion. It contains ORIGINAL
 * parent-guided teaching content written for this family. It is not a copy of
 * NCERT textbook pages, not a claim of CBSE/board alignment, and not an
 * accredited international curriculum. Where official NCERT books are named,
 * they are named only as separately indexed, externally accessed resources.
 *
 * A teaching year is 36 guided weeks (3 terms of 12 weeks). The remaining
 * weeks of a calendar year are left free for illness, travel, festivals,
 * revision and family life — the app never pretends to schedule 365 days.
 */

export type LessonMode = 'guided' | 'play' | 'independent';
export type AnnualGradeKey = 'infant' | 'nursery' | 'ukg' | 'class4';

/** A concrete weekly focus. Every string must be real, teachable content. */
export type Focus = {
  topic: string;
  example: string;
  question: string;
  answer: string;
  exercise: string;
  expected: string;
};

/** An authored teaching unit with four concrete weekly focuses. */
export type Unit = {
  id: string;
  subject: string;
  strand: string;
  minutes: number;
  mode: LessonMode;
  objective: string;
  materials: string;
  prep: string;
  steps: string[];
  questions: string[];
  easier: string;
  harder: string;
  criteria: string;
  revision: string;
  focuses: [Focus, Focus, Focus, Focus];
};

/** The complete, ready-to-teach lesson a parent actually opens. */
export type TeachingLesson = {
  objective: string;
  materials: string;
  minutes: number;
  prep: string;
  example: string;
  steps: string[];
  questions: string[];
  exercise: string;
  expectedAnswer: string;
  easier: string;
  harder: string;
  completionCriteria: string;
  revisionGuidance: string;
};

export type AnnualStep = {
  id: string;
  gradeKey: AnnualGradeKey;
  grade: string;
  week: number;
  term: 1 | 2 | 3;
  unitId: string;
  subject: string;
  strand: string;
  title: string;
  minutes: number;
  mode: LessonMode;
  kind: 'core' | 'consolidation';
  prerequisites: string[];
  milestone: string | null;
  focusIndex: number;
  source: 'original';
  href: string;
  lesson: TeachingLesson;
};

export type GradeDefinition = {
  key: AnnualGradeKey;
  grade: string;
  label: string;
  description: string;
  /** Honest provenance statement shown to parents, never a board-alignment claim. */
  provenance: string;
  milestones: [string, string, string];
  units: Unit[];
};

export const TEACHING_WEEKS = 36;
export const TERM_WEEKS = 12;

/** Compact authoring helpers keep the content bank readable and complete. */
export function focus(topic: string, example: string, question: string, answer: string, exercise: string, expected: string): Focus {
  return { topic, example, question, answer, exercise, expected };
}

export function unit(seed: Omit<Unit, 'focuses'> & { focuses: Focus[] }): Unit {
  if (seed.focuses.length !== 4) throw new Error('Each annual unit needs exactly four weekly focuses: ' + seed.id);
  return { ...seed, focuses: seed.focuses as Unit['focuses'] };
}

const placeholders: Record<string, keyof Focus> = {
  topic: 'topic', example: 'example', question: 'question',
  answer: 'answer', exercise: 'exercise', expected: 'expected',
};

/** Substitute authored concrete focus content into the unit's pedagogy text. */
export function fill(template: string, item: Focus): string {
  return template.replace(/\{(topic|example|question|answer|exercise|expected)\}/g, (_match, key: string) => {
    const field = placeholders[key];
    return field ? item[field] : '';
  });
}

export function termForWeek(week: number): 1 | 2 | 3 {
  return Math.min(3, Math.max(1, Math.ceil(week / TERM_WEEKS))) as 1 | 2 | 3;
}

function coreLesson(seed: Unit, item: Focus, minutes: number): TeachingLesson {
  return {
    objective: `${seed.objective} This week: ${item.topic}.`,
    materials: seed.materials,
    minutes,
    prep: fill(seed.prep, item),
    example: item.example,
    steps: seed.steps.map(step => fill(step, item)),
    questions: seed.questions.map(q => fill(q, item)),
    exercise: item.exercise,
    expectedAnswer: `${item.answer} ${item.expected}`,
    easier: fill(seed.easier, item),
    harder: fill(seed.harder, item),
    completionCriteria: fill(seed.criteria, item),
    revisionGuidance: fill(seed.revision, item),
  };
}

function consolidationLesson(seed: Unit, item: Focus, minutes: number, mode: LessonMode): TeachingLesson {
  const independent = mode === 'independent';
  return {
    objective: `Recall and use ${item.topic} with less adult help than the teaching session.`,
    materials: seed.materials,
    minutes,
    prep: 'Read the worked example once before starting. Keep the teaching session closed so this is a genuine recall attempt.',
    example: item.example,
    steps: [
      independent
        ? 'Ask the learner to try the exercise on their own. Stay nearby but do not demonstrate first.'
        : 'Invite your child to try the activity through play. Join in only when they invite you.',
      `Set out the materials and say: ${item.exercise}`,
      'Wait quietly. Offer one hint only if they ask, and note what needed a hint.',
      `Compare the result together with: ${item.expected}`,
      'Finish by asking them to explain one choice in their own words.',
    ],
    questions: [item.question, 'What would you try differently next time, and why?'],
    exercise: item.exercise,
    expectedAnswer: `Expected: ${item.expected} Accept a correct idea expressed in the child's own words; do not require a verbatim answer.`,
    easier: fill(seed.easier, item),
    harder: fill(seed.harder, item),
    completionCriteria: 'The learner attempts the recall activity and can explain at least one idea without copying the worked example. Choosing "Needs more practice" is a valid, honest outcome.',
    revisionGuidance: 'If recall was effortful, repeat the original teaching session after two days at a slower pace before moving to the next week.',
  };
}

/** Expand 9 authored units x 4 concrete focuses into 36 sequenced teaching weeks. */
export function buildAnnualPathway(definition: GradeDefinition): AnnualStep[] {
  const steps: AnnualStep[] = [];
  const infant = definition.key === 'infant';
  const pad = (week: number) => String(week).padStart(2, '0');
  for (const [unitIndex, seed] of definition.units.entries()) {
    for (const [focusIndex, item] of seed.focuses.entries()) {
      // Spiral: each nine-week round visits every subject once, four times a year.
      // A subject therefore never disappears for a whole term.
      const week = focusIndex * definition.units.length + unitIndex + 1;
      const term = termForWeek(week);
      const gradeSlug = definition.key;
      const coreId = `annual:${gradeSlug}:w${pad(week)}:core`;
      const previousCore = focusIndex > 0
        ? `annual:${gradeSlug}:w${pad((focusIndex - 1) * definition.units.length + unitIndex + 1)}:core`
        : week > 1 ? `annual:${gradeSlug}:w${pad(week - 1)}:core` : null;
      const milestone = week % TERM_WEEKS === 0 ? definition.milestones[term - 1] : null;
      const href = `/learning-pathways?grade=${gradeSlug}&week=${week}`;
      steps.push({
        id: coreId, gradeKey: definition.key, grade: definition.grade, week, term,
        unitId: seed.id, subject: seed.subject, strand: seed.strand,
        title: item.topic, minutes: seed.minutes, mode: seed.mode, kind: 'core',
        prerequisites: previousCore ? [previousCore] : [],
        milestone, focusIndex, source: 'original', href,
        lesson: coreLesson(seed, item, seed.minutes),
      });
      if (infant) continue;
      const practiceId = `annual:${gradeSlug}:w${String(week).padStart(2, '0')}:practice`;
      const mode: LessonMode = definition.key === 'class4' ? 'independent' : 'play';
      const minutes = Math.max(8, Math.round(seed.minutes * 0.6));
      steps.push({
        id: practiceId, gradeKey: definition.key, grade: definition.grade, week, term,
        unitId: seed.id, subject: seed.subject, strand: seed.strand,
        title: `Practise together · ${item.topic}`, minutes, mode, kind: 'consolidation',
        prerequisites: [coreId], milestone: null, focusIndex, source: 'original', href,
        lesson: consolidationLesson(seed, item, minutes, mode),
      });
    }
  }
  return steps.sort((a, b) => a.week - b.week || (a.kind === 'core' ? -1 : 1));
}

export type TermCoverage = { term: 1 | 2 | 3; milestone: string; steps: number; completed: number; percent: number; earned: boolean };
export type SubjectCoverage = { subject: string; steps: number; completed: number; percent: number };
export type AnnualCoverage = {
  gradeKey: AnnualGradeKey;
  grade: string;
  weeks: number;
  totalSteps: number;
  completedSteps: number;
  percent: number;
  guidedMinutes: number;
  independentMinutes: number;
  terms: TermCoverage[];
  subjects: SubjectCoverage[];
  milestonesEarned: number;
  currentWeek: number | null;
};

/** Progress is counted only from explicitly recorded completed steps. */
export function annualCoverage(definition: GradeDefinition, steps: AnnualStep[], completed: ReadonlySet<string>): AnnualCoverage {
  const done = (step: AnnualStep) => completed.has(step.id);
  const percent = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  const terms = ([1, 2, 3] as const).map(term => {
    const inTerm = steps.filter(step => step.term === term);
    const finished = inTerm.filter(done).length;
    return { term, milestone: definition.milestones[term - 1], steps: inTerm.length, completed: finished, percent: percent(finished, inTerm.length), earned: inTerm.length > 0 && finished === inTerm.length };
  });
  const subjects = [...new Set(steps.map(step => step.subject))].map(subject => {
    const inSubject = steps.filter(step => step.subject === subject);
    const finished = inSubject.filter(done).length;
    return { subject, steps: inSubject.length, completed: finished, percent: percent(finished, inSubject.length) };
  });
  const finished = steps.filter(done).length;
  const unfinishedCore = steps.find(step => step.kind === 'core' && !done(step));
  return {
    gradeKey: definition.key, grade: definition.grade, weeks: TEACHING_WEEKS,
    totalSteps: steps.length, completedSteps: finished, percent: percent(finished, steps.length),
    guidedMinutes: steps.filter(s => s.mode === 'guided').reduce((n, s) => n + s.minutes, 0),
    independentMinutes: steps.filter(s => s.mode !== 'guided').reduce((n, s) => n + s.minutes, 0),
    terms, subjects, milestonesEarned: terms.filter(t => t.earned).length,
    currentWeek: unfinishedCore?.week ?? null,
  };
}

const bannedInfantWords = /\b(worksheet|write|writing|worksheet|quiz|test|score|homework|read|reading|count to|alphabet|exam|grade|marks)\b/i;

/** Rejects placeholder or incomplete teaching content before it can ship. */
export function validateAnnualDefinition(definition: GradeDefinition, steps: AnnualStep[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const seed of definition.units) {
    if (!/^[a-z0-9-]+$/.test(seed.id)) errors.push('Invalid unit id ' + seed.id);
    if (seed.focuses.length !== 4) errors.push('Unit needs four focuses ' + seed.id);
    if (seed.minutes < 5 || seed.minutes > 30) errors.push('Invalid duration ' + seed.id);
    if (seed.steps.length < 4) errors.push('Teaching steps too short ' + seed.id);
    if (seed.questions.length < 2) errors.push('Need at least two questions ' + seed.id);
    for (const field of [seed.objective, seed.materials, seed.prep, seed.easier, seed.harder, seed.criteria, seed.revision]) {
      if (field.trim().length < 12) errors.push('Incomplete unit field ' + seed.id);
    }
    for (const item of seed.focuses) {
      if (item.topic.trim().length < 10 || item.example.trim().length < 25 || item.answer.trim().length < 8 ||
        item.exercise.trim().length < 15 || item.expected.trim().length < 15 || item.question.trim().length < 10) {
        errors.push('Incomplete focus content ' + seed.id + ' / ' + item.topic);
      }
    }
  }
  if (steps.length === 0) errors.push('No annual steps ' + definition.key);
  const weekSet = new Set<number>();
  for (const step of steps) {
    if (ids.has(step.id)) errors.push('Duplicate step id ' + step.id);
    ids.add(step.id);
    if (step.id.length > 100) errors.push('Step id too long for progress storage ' + step.id);
    weekSet.add(step.week);
    if (step.week < 1 || step.week > TEACHING_WEEKS) errors.push('Week out of range ' + step.id);
    if (step.minutes < 1 || step.minutes > 30) errors.push('Invalid step duration ' + step.id);
    for (const prereq of step.prerequisites) if (!ids.has(prereq) && !steps.some(s => s.id === prereq)) errors.push('Unknown prerequisite ' + step.id);
    const lesson = step.lesson;
    if (lesson.steps.length < 4 || lesson.questions.length < 2) errors.push('Incomplete lesson ' + step.id);
    const fields: (keyof TeachingLesson)[] = ['objective', 'materials', 'prep', 'example', 'exercise', 'expectedAnswer', 'easier', 'harder', 'completionCriteria', 'revisionGuidance'];
    for (const key of fields) {
      const value = lesson[key];
      if (typeof value !== 'string' || value.trim().length < 12) errors.push('Empty lesson field ' + key + ' ' + step.id);
      if (typeof value === 'string' && (/\{[a-z]+\}/.test(value) || /TODO|PLACEHOLDER|Lorem/i.test(value))) errors.push('Unresolved placeholder ' + key + ' ' + step.id);
    }
    for (const text of lesson.steps.concat(lesson.questions)) {
      if (/\{[a-z]+\}/.test(text) || text.trim().length < 12) errors.push('Unresolved or empty step ' + step.id);
    }
    if (step.gradeKey === 'infant') {
      if (step.mode !== 'play') errors.push('Infant step must be play ' + step.id);
      if (step.minutes > 10) errors.push('Infant step too long ' + step.id);
      const all = JSON.stringify(step.lesson);
      if (bannedInfantWords.test(all)) errors.push('Formal academic wording in infant step ' + step.id);
    }
  }
  for (let week = 1; week <= TEACHING_WEEKS; week++) if (!weekSet.has(week)) errors.push('Missing teaching week ' + week + ' ' + definition.key);
  const coreWeeks = steps.filter(s => s.kind === 'core').map(s => s.week);
  if (new Set(coreWeeks).size !== TEACHING_WEEKS) errors.push('Core lesson missing or duplicated for a week ' + definition.key);
  return errors;
}
