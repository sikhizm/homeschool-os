/**
 * Public entry point for the annual curriculum. Pure functions only: no DB,
 * no auth, no network, no writes. Safe to use in unit tests and server routes.
 */
import { buildAnnualPathway, annualCoverage, validateAnnualDefinition, TEACHING_WEEKS, type AnnualGradeKey, type AnnualStep, type AnnualCoverage, type GradeDefinition } from './model';
import { infantGrade } from './infant';
import { nurseryGrade } from './nursery';
import { ukgGrade } from './ukg';
import { class4Grade } from './class4';

export type { AnnualGradeKey, AnnualStep, AnnualCoverage, GradeDefinition };
export type { TeachingLesson, LessonMode, Focus, Unit } from './model';
export { TEACHING_WEEKS, TERM_WEEKS, termForWeek } from './model';

export const annualGrades: GradeDefinition[] = [infantGrade, nurseryGrade, ukgGrade, class4Grade];

/** The stages stored on real learner records are broader than our four authored pathways. */
export function annualGradeFor(stage: string): AnnualGradeKey | null {
  const value = (stage || '').trim();
  if (/infant|baby|0\s*[-–]\s*(12|18|24)\s*month|under\s*(1|2)\s*year/i.test(value)) return 'infant';
  if (/^nursery$/i.test(value) || /^early years$/i.test(value) || /toddler|preschool|18\s*[-–]\s*36/i.test(value)) return 'nursery';
  if (/^(ukg|lkg)$/i.test(value)) return 'ukg';
  if (/^class\s*4$/i.test(value)) return 'class4';
  return null;
}

export function gradeDefinition(key: AnnualGradeKey): GradeDefinition {
  const found = annualGrades.find(item => item.key === key);
  if (!found) throw new Error('Unknown annual grade ' + key);
  return found;
}

const cache = new Map<AnnualGradeKey, AnnualStep[]>();
export function annualSteps(key: AnnualGradeKey): AnnualStep[] {
  const existing = cache.get(key);
  if (existing) return existing;
  const definition = gradeDefinition(key);
  const steps = buildAnnualPathway(definition);
  cache.set(key, steps);
  return steps;
}

/** Stable, ordered steps for a stored learner stage, or an empty array. */
export function annualStepsForStage(stage: string): AnnualStep[] {
  const key = annualGradeFor(stage);
  return key ? annualSteps(key) : [];
}

export function annualCoverageForStage(stage: string, completed: ReadonlySet<string>): AnnualCoverage | null {
  const key = annualGradeFor(stage);
  if (!key) return null;
  return annualCoverage(gradeDefinition(key), annualSteps(key), completed);
}

/** Term label used by the parent-facing explorer. */
export function termLabel(term: 1 | 2 | 3): string {
  return term === 1 ? 'Term 1 · Weeks 1–12' : term === 2 ? 'Term 2 · Weeks 13–24' : 'Term 3 · Weeks 25–36';
}

/** Full corpus audit. Used by tests and by the coverage page, never to fake progress. */
export function validateAnnualCurriculum(): string[] {
  return annualGrades.flatMap(definition => {
    const steps = annualSteps(definition.key);
    const errors = validateAnnualDefinition(definition, steps);
    if (definition.units.length !== 9) errors.push('Expected nine authored units for ' + definition.key);
    const core = steps.filter(step => step.kind === 'core');
    if (core.length !== TEACHING_WEEKS) errors.push('Expected 36 core lessons for ' + definition.key);
    if (core.filter(step => step.milestone).length !== 3) errors.push('Expected three milestones for ' + definition.key);
    const subjects = new Set(steps.map(step => step.subject));
    if (definition.key === 'infant') {
      if (subjects.size < 3) errors.push('Infant pathway needs varied development domains');
      if (steps.some(step => step.kind !== 'core')) errors.push('Infants must not receive consolidation tasks');
    } else if (subjects.size < 6) {
      errors.push('Annual pathway needs broad subject distribution for ' + definition.key);
    }
    const topics = core.map(step => step.title);
    if (new Set(topics).size !== topics.length) errors.push('Duplicate weekly topic for ' + definition.key);
    return errors;
  });
}

export function annualSummary() {
  return annualGrades.map(definition => {
    const steps = annualSteps(definition.key);
    return {
      key: definition.key, grade: definition.grade, label: definition.label,
      description: definition.description, provenance: definition.provenance,
      weeks: TEACHING_WEEKS, units: definition.units.length, steps: steps.length,
      subjects: [...new Set(steps.map(step => step.subject))],
      milestones: definition.milestones,
      guidedMinutes: steps.filter(s => s.mode === 'guided').reduce((n, s) => n + s.minutes, 0),
    };
  });
}
