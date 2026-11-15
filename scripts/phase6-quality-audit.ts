/**
 * Phase 6 quality gate.
 *
 * Deterministic, offline checks for catalogue/content integrity and responsive
 * UI guardrails. Real-device usability and family pilot acceptance remain
 * manual sign-off items; this script deliberately does not claim to perform
 * those activities.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validateNcertCatalogue,
} from '../src/lib/ncert/textbooks';
import { validateCurriculum } from '../src/lib/curriculum/library';
import { validateGlobalSkills } from '../src/lib/global-curriculum/catalogue';
import { validateLessons, lessons } from '../src/lib/lessons/library';
import { queueCatalogue } from '../src/lib/auto-learning/catalogue';

const failures: string[] = [];
const check = (condition: unknown, message: string) => {
  if (!condition) failures.push(message);
};

const validators = [
  ['NCERT catalogue', validateNcertCatalogue],
  ['curriculum library', validateCurriculum],
  ['global skills catalogue', validateGlobalSkills],
  ['lesson library', validateLessons],
] as const;

for (const [name, validate] of validators) {
  for (const issue of validate()) failures.push(`${name}: ${issue}`);
}

check(lessons.length >= 20, 'lesson library fell below the maintained content floor');

for (let grade = 1; grade <= 10; grade += 1) {
  const tasks = queueCatalogue(`Class ${grade}`);
  const ids = new Set<string>();
  for (const task of tasks) {
    check(!ids.has(task.id), `Class ${grade}: duplicate learning task id ${task.id}`);
    ids.add(task.id);
    check(Boolean(task.title?.trim()), `Class ${grade}: task ${task.id} has no title`);
    check(Boolean(task.subject?.trim()), `Class ${grade}: task ${task.id} has no subject`);
    check(
      Boolean(task.href) && (task.href.startsWith('/') || /^https:\/\//.test(task.href)),
      `Class ${grade}: task ${task.id} has an invalid destination`,
    );
    if (task.lesson) {
      check(task.lesson.steps.length > 0, `Class ${grade}: task ${task.id} has an empty lesson`);
    }
  }
}

const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
for (const breakpoint of ['1023px', '620px', '380px']) {
  check(css.includes(`max-width: ${breakpoint}`), `responsive CSS is missing the ${breakpoint} breakpoint`);
}
check(css.includes('env(safe-area-inset-bottom)'), 'mobile layout must respect the bottom safe area');
check(css.includes(':focus-visible'), 'global styles must retain visible keyboard focus treatment');
check(css.includes('minmax(0, 1fr)'), 'responsive layouts must include shrink-safe grid columns');

const summary = [
  'Phase 6 automated quality gate',
  `Catalogue validators: ${validators.length}`,
  `Lesson records: ${lessons.length}`,
  'Learning task catalogues: Classes 1–10',
  'Responsive guardrails: 1023px, 620px, 380px',
  `Result: ${failures.length ? `FAIL (${failures.length})` : 'PASS'}`,
];
console.log(summary.join('\n'));
if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  assert.equal(failures.length, 0);
}
