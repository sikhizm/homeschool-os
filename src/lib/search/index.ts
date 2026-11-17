import { sidebarDestinations } from '../navigation';
import { chaptersFor, contentUnitLabelFor, isDefaultChapterSessionEligible, ncertChapterSlots, ncertTextbooks } from '../ncert/textbooks';
import { enrichmentActivities, enrichmentStages, enrichmentTopics, resourceVerificationLabels, supplementaryResources } from '../curriculum/enrichment';
import { competencies, curriculumStages } from '../curriculum/library';
import { annualGrades, annualSteps } from '../curriculum/annual';
import { globalFrameworks, globalSkills, globalStages } from '../global-curriculum/catalogue';
import { frameworkEvidenceFor } from '../global-curriculum/framework-evidence';
import { lessons, lessonStages } from '../lessons/library';
import { searchPageSize, type SearchFilter, type SearchResponse, type SearchResult } from './types';

type Document = SearchResult & { terms?: string; ownerOnly?: boolean };
const link = (path: string, params: Record<string, string> = {}, anchor?: string) => {
  const query = new URLSearchParams(params).toString();
  return path + (query ? '?' + query : '') + (anchor ? '#' + encodeURIComponent(anchor) : '');
};
const chapterPath = (id: string) => '/ncert-books/chapter/' + encodeURIComponent(id);
const booksById = new Map(ncertTextbooks.map(book => [book.id, book]));
const featuredChapter = ncertTextbooks
  .filter(book => book.grade === 4)
  .flatMap(book => chaptersFor(book.id))
  .find(isDefaultChapterSessionEligible);

const features: Document[] = [
  ...sidebarDestinations.map(({ id, label, href, hint }): Document => ({
    id: 'feature:' + id, category: 'features', title: label, description: hint, href,
    terms: {
      home: 'dashboard today daily coach assignments',
      plan: 'planner schedule calendar weekly',
      learners: 'student pupils profiles roster',
      library: 'browse textbooks curriculum books',
      progress: 'reports tracking mastery retention revision outcomes',
      portfolio: 'evidence work samples achievements',
      settings: 'account preferences offline install app pwa',
    }[id],
  })),
  ...([
    ['/learn', 'Learner Home', 'Open learner mode and continue assigned learning.', 'student child dashboard'],
    ['/learn/path', 'Learner Learning Path', 'See subjects, upcoming lessons and revision in learner mode.', 'timeline learner path'],
    ['/curriculum-studio', 'Curriculum Studio', 'Browse integrated plans and curriculum coverage.', 'coverage inventory'],
    ['/global-curriculum', 'Global Curriculum', 'Explore teaching approaches and source evidence.', 'international frameworks'],
    ['/ncert-books', 'NCERT Books', 'Browse official textbook records and verified Contents entries.', 'textbook chapter publisher directory'],
    ['/learning-pathways', 'Annual Learning Pathways', 'Open stage-specific plans and ready-to-teach weekly themes.', 'annual year yearly plan 36 weeks'],
    ['/curriculum', 'Competency Pathways', 'Find learning outcomes, prerequisites and goal ideas.', 'skills objectives milestones'],
    ['/lessons', 'Activities and Printables', 'Teach an activity or print an A4 worksheet.', 'lesson library printable worksheet'],
    ['/library/prompts', 'Learning Prompts', 'Copy personalised prompts for Olympiad practice, world curricula and teaching approaches.', 'gemini chatgpt olympiad england california singapore worksheet prompts'],
    ['/library/enrichment', 'Supplementary Resources', 'Browse optional enrichment and publisher references.', 'resource catalogue reasoning olympiad'],
    ['/curriculum-mapping', 'Curriculum Mapping Review', 'Family owners can review proposed links for Class 5 chapters.', 'editorial quality administration'],
    ['/november-pilot', 'Pilot Guide', 'Open the family pilot guide, activities and baseline guidance.', 'november diagnostic starter'],
    ['/roadmap', 'Roadmap', 'See the features and phases of Homeschool OS.', 'project progress releases'],
  ] as const).map(([href, title, description, terms]): Document => ({
    id: 'feature:' + href, category: 'features', href, title, description, terms,
    ownerOnly: href === '/curriculum-mapping',
  })),
  ...(featuredChapter ? [{
    id: 'feature:study-material-studio', category: 'features' as const, title: 'Study Material Studio',
    description: 'Open the studio in a Class 4 chapter. Each eligible chapter has its own studio.',
    href: chapterPath(featuredChapter.id) + '#study-material-studio',
    terms: 'study notes worksheets exam questions prompt revision answer key pdf document',
  }] : []),
];

const documents: Document[] = [
  ...features,
  ...ncertTextbooks.map((book): Document => ({
    id: 'book:' + book.id, category: 'books', title: book.title,
    description: book.editionLabel,
    metadata: `Class ${book.grade} · ${book.subject} · ${book.language} · ${book.publisher} textbook`,
    href: link('/ncert-books', { grade: String(book.grade), subject: book.subject, book: book.id }),
    terms: book.textbookCode,
  })),
  ...ncertChapterSlots.flatMap((chapter): Document[] => {
    const book = booksById.get(chapter.bookId);
    if (!book || !chapter.verifiedTitle || !['source-verified', 'human-reviewed'].includes(chapter.status)) return [];
    return [{
      id: 'chapter:' + chapter.id, category: 'books', title: chapter.verifiedTitle,
      description: `${book.title} · ${chapter.label}`,
      metadata: `Class ${book.grade} · ${book.subject} · ${book.language} · ${book.publisher}`,
      href: chapterPath(chapter.id),
      terms: `${contentUnitLabelFor(book)} ${String(chapter.chapterNumber).padStart(2, '0')}`,
    }];
  }),
  ...lessons.map((lesson): Document => ({
    id: 'lesson:' + lesson.id, category: 'activities', title: lesson.title,
    description: lesson.objective,
    metadata: lessonStages.find(stage => stage.id === lesson.stage)?.label + ' · ' + lesson.subject,
    terms: lesson.overview + ' ' + lesson.worksheet + ' printable worksheet ' + lesson.materials,
    href: link('/lessons', { activity: lesson.id }, 'activity-detail'),
  })),
  ...enrichmentActivities.map((activity): Document => ({
    id: 'enrichment:' + activity.id, category: 'activities', title: activity.title,
    description: activity.prompt,
    metadata: enrichmentStages[activity.stage] + ' · ' + (activity.topic === 'reasoning' && activity.stage !== 'class4'
      ? 'Reasoning through play' : enrichmentTopics[activity.topic]),
    terms: activity.id + ' ' + activity.materials + ' ' + activity.discussion,
    href: link('/library/enrichment', { stage: activity.stage, topic: activity.topic }, activity.id),
  })),
  ...supplementaryResources.map((resource): Document => ({
    id: 'resource:' + resource.id, category: 'resources', title: resource.title, description: resource.parentUse,
    metadata: [resource.publisher, resourceVerificationLabels[resource.verification.status], ...resource.stages.map(stage => enrichmentStages[stage])].join(' · '),
    terms: resource.id + ' ' + resource.sourceLocation + ' ' + enrichmentTopics[resource.topic],
    href: link('/library/enrichment', { stage: 'all', topic: resource.topic }, 'source-' + resource.id),
  })),
  ...globalFrameworks.map((framework): Document => {
    const evidence = frameworkEvidenceFor(framework.id);
    return {
      id: 'framework:' + framework.id, category: 'curriculum', title: framework.label, description: framework.description,
      metadata: evidence?.statusLabel,
      terms: [framework.title, evidence?.sourceName, evidence?.scope, ...(evidence?.subjectAreas ?? [])].join(' '),
      href: link('/global-curriculum', {}, 'framework-' + framework.id),
    };
  }),
  ...globalSkills.map((skill): Document => ({
    id: 'global-skill:' + skill.id, category: 'curriculum', title: skill.title, description: skill.outcome,
    metadata: [globalStages.find(stage => stage.id === skill.stage)?.name, skill.subject, 'Original learning objective'].join(' · '),
    terms: [skill.domain, skill.activity, ...skill.prerequisites.map(id => globalSkills.find(item => item.id === id)?.title)].join(' '),
    href: link('/global-curriculum', { stage: skill.stage, subject: skill.subject }, 'skill-' + skill.id),
  })),
  ...competencies.map((skill): Document => ({
    id: 'competency:' + skill.id, category: 'curriculum', title: skill.title, description: skill.outcome,
    metadata: [curriculumStages.find(stage => stage.id === skill.stage)?.label, skill.subject, 'Competency'].join(' · '),
    terms: [skill.activity, ...skill.prerequisites.map(id => competencies.find(item => item.id === id)?.title)].join(' '),
    href: link('/curriculum', { stage: skill.stage, subject: skill.subject }, skill.id),
  })),
  ...annualGrades.flatMap((grade): Document[] => [
    { id: 'pathway:' + grade.key, category: 'pathways', title: grade.label, description: grade.description, metadata: grade.grade,
      terms: 'annual year 36 weeks learning pathway', href: link('/learning-pathways', { grade: grade.key }) },
    ...annualSteps(grade.key).filter(step => step.kind === 'core').map((step): Document => ({
      id: 'week:' + step.id, category: 'pathways', title: step.title,
      description: step.lesson.objective, metadata: `${step.grade} · Week ${step.week} · ${step.subject}`,
      terms: step.strand + ' ' + step.lesson.exercise,
      href: step.href + '#week-' + step.week,
    })),
  ]),
];

function normalize(value: string) {
  return value.normalize('NFKC').toLowerCase()
    .replace(/\b(?:grade|standard|std)\s*(?=\d)/g, 'class ')
    .replace(/\b(?:maths|math)\b/g, 'mathematics')
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim();
}

// One adjacent transposition, insertion, deletion or substitution for longer Latin tokens.
function near(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1 || !/^[a-z]{4,}$/.test(b)) return false;
  const first = [...a].findIndex((letter, i) => letter !== b[i]);
  const i = first < 0 ? a.length : first;
  if (a.length > b.length) return a.slice(i + 1) === b.slice(i);
  if (b.length > a.length) return a.slice(i) === b.slice(i + 1);
  return a.slice(i + 1) === b.slice(i + 1) ||
    (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
}

const indexed = [...new Map(documents.map(doc => [doc.id, doc])).values()].map(doc => ({
  doc,
  title: normalize(doc.title),
  words: normalize(doc.title).split(' '),
  metadata: normalize(doc.metadata ?? '').split(' '),
  text: normalize(doc.description + ' ' + (doc.terms ?? '')).split(' '),
}));

const publicResult = ({ id, category, title, description, metadata, href }: Document): SearchResult =>
  ({ id, category, title, description: description.length > 180 ? description.slice(0, 177).trimEnd() + '…' : description, metadata, href });

export function indexCounts() {
  return {
    features: features.length,
    books: indexed.filter(({doc}) => doc.id.startsWith('book:')).length,
    chapters: indexed.filter(({doc}) => doc.id.startsWith('chapter:')).length,
    activities: indexed.filter(({doc}) => doc.category === 'activities').length,
    resources: supplementaryResources.length,
    curriculum: indexed.filter(({doc}) => doc.category === 'curriculum').length,
    pathways: indexed.filter(({doc}) => doc.category === 'pathways').length,
  };
}

export function searchCatalogue(query: string, category: SearchFilter = 'all', options: {
  includeOwner?: boolean; offset?: number; limit?: number;
} = {}): SearchResponse {
  const phrase = normalize(query);
  const tokens = [...new Set(phrase.split(' ').filter(Boolean).map(token => /^\d+$/.test(token) ? String(Number(token)) : token))].slice(0, 12);
  const grade = /\bclass (\d+)\b/.exec(phrase)?.[1];
  const numberedChapter = /\bchapter 0*(\d+)\b/.exec(phrase)?.[1];
  const hits = indexed.flatMap(({ doc, title, words, metadata, text }) => {
    if (doc.ownerOnly && !options.includeOwner || category !== 'all' && doc.category !== category) return [];
    if (doc.category === 'books' && grade && !doc.metadata?.startsWith('Class ' + grade + ' ·')) return [];
    if (doc.category === 'books' && numberedChapter && (!doc.id.startsWith('chapter:') ||
      !doc.description.endsWith(' · Chapter ' + numberedChapter))) return [];
    if (!phrase) return category === 'all' && !doc.id.startsWith('feature:') ? [] : [{ doc, score: 0 }];
    const weights = tokens.map(token => {
      const match = (values: string[]) => values.some(word => /^\d+$/.test(token) ? word === token : word.startsWith(token));
      if (words.includes(token)) return 40;
      if (match(words)) return 30;
      if (match(metadata)) return 16;
      if (match(text)) return 8;
      if (/^[a-z]{5,}$/.test(token) && words.some(word => near(token, word))) return 3;
      return 0;
    });
    if (weights.includes(0)) return [];
    const bonus = title === phrase ? 10000 : title.startsWith(phrase) ? 1000 : title.includes(phrase) ? 200 : 0;
    return [{ doc, score: bonus + weights.reduce<number>((sum, weight) => sum + weight, 0) + (doc.id.startsWith('book:') ? 1 : 0) }];
  });
  hits.sort((a, b) => b.score - a.score);
  const offset = options.offset ?? 0;
  return { results: hits.slice(offset, offset + (options.limit ?? searchPageSize)).map(({ doc }) => publicResult(doc)), total: hits.length };
}
