export const tracks = ['Olympiad Prep', 'World Curricula', 'Teaching Approaches'] as const;
export const curricula = {
  england: { label: 'England · Year 4', edition: 'National Curriculum mathematics programmes of study (2014)', url: 'https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study' },
  california: { label: 'USA · California Grade 4', edition: 'California Common Core State Standards · Mathematics (2013)', url: 'https://www.cde.ca.gov/be/st/ss/mathstandard.asp' },
  singapore: { label: 'Singapore · Primary 4', edition: '2021 Primary Mathematics syllabus, updated October 2025', url: 'https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-october-2025.pdf' },
} as const;
export const topics = ['Shapes and geometry', 'Numbers and place value', 'Fractions', 'Measurement', 'Patterns and logical reasoning', 'Mixed practice'] as const;
export const materials = ['Guided lesson', 'Practice worksheet', 'Worked examples', 'Quiz', 'Parent teaching guide', 'Mock test'] as const;
export const approaches = ['Hands-on exploration', 'Visual models', 'Guided questioning', 'Home investigation'] as const;
export const formats = ['Printable worksheet', 'PDF', 'HTML', 'Interactive tutoring'] as const;
export type PromptSettings = {
  track: typeof tracks[number];
  curriculum: keyof typeof curricula;
  topic: typeof topics[number];
  material: typeof materials[number];
  approach: typeof approaches[number];
  difficulty: 'Guided' | 'Standard' | 'Challenge';
  minutes: '15' | '30' | '45';
  format: typeof formats[number];
};
export const defaultSettings: PromptSettings = {
  track: 'Olympiad Prep', curriculum: 'england', topic: 'Shapes and geometry',
  material: 'Practice worksheet', approach: 'Hands-on exploration',
  difficulty: 'Standard', minutes: '30', format: 'Printable worksheet',
};
export const olympiadSources = [
  'https://sofworld.org/imo/class-4/imo-syllabus/imo-syllabus-class-4',
  'https://sofworld.org/imo/class-4/sample-model-test-papers/imo-sample-papers-class-4',
];
export function validSettings(value: unknown): value is PromptSettings {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  const options: Record<keyof PromptSettings, readonly string[]> = {
    track: tracks, curriculum: Object.keys(curricula), topic: topics, material: materials,
    approach: approaches, difficulty: ['Guided', 'Standard', 'Challenge'],
    minutes: ['15', '30', '45'], format: formats,
  };
  return Object.entries(options).every(([key, values]) => typeof item[key] === 'string' && values.includes(item[key] as string));
}
export function buildLearningPrompt(settings: PromptSettings, learner: { name: string; stage: string }) {
  const curriculum = curricula[settings.curriculum];
  const source = settings.track === 'Olympiad Prep'
    ? 'SOF International Mathematics Olympiad, Class 4, Level 1. Verify the current syllabus and sample-paper format.\n' + olympiadSources.join('\n')
    : curriculum.label + '\nEdition to inspect: ' + curriculum.edition + '\n' + curriculum.url;
  const approach = settings.track === 'Teaching Approaches'
    ? 'Teaching method: ' + settings.approach + '. Provide materials, a step-by-step parent script, questions to ask, expected responses, and ways to adapt. Describe this as a teaching approach, without claiming all schools in a country use it.'
    : 'Use clear explanations, original examples and progressively challenging practice.';
  const output = settings.format === 'Interactive tutoring'
    ? 'Start with one diagnostic question and wait for the learner. Ask one question at a time, give hints before solutions, and adapt to the answers. Provide a parent summary at the end. For a mock test, withhold correctness feedback and solutions until the test ends.'
    : 'Create ' + settings.format + ' material with space for working. Put the answer key and worked solutions in a separate final section. For PDF or HTML, attach an actual downloadable file; if attachments are unavailable, explain the limitation and ask which alternative is wanted. HTML must be self-contained and printable.';
  return `Prepare original Mathematics and Reasoning learning material for a family-guided learner.
Learner: ${learner.name || 'Learner'}
Current learning stage: ${learner.stage || 'Not supplied'}
Track: ${settings.track}
Target source and level:
${source}
Topic: ${settings.topic}
Material: ${settings.material}
Difficulty: ${settings.difficulty}
Available time: ${settings.minutes} minutes
Output: ${settings.format}
Language: English

SOURCE CHECK
Open and inspect the official sources before writing. Identify the edition or session and quote the relevant objective identifiers where available. Explain which objectives support the selected topic. If you cannot inspect the source, ask the parent to upload the relevant pages or paste their text, and wait. If the topic is outside this level's scope, explain the mismatch and ask the parent to choose a suitable topic. Do not invent standards, exam patterns or curriculum alignment.
Treat the target level as a deliberate selection. Do not assume the learner's Indian class is equivalent to this year or grade. Identify prerequisites and offer a short readiness check.
For Olympiad mock tests, check the current official question distribution, marking and duration. If the requested time differs, label it an abbreviated practice test and state the adaptation.

TEACHING AND QUALITY
${approach}
Guided means small steps and scaffolding. Standard means the selected level's expected demand. Challenge means deeper reasoning within the verified scope.
Create original questions and diagrams. Check every calculation, answer and solution. Label the material as original practice based on the cited source. Include common mistakes and a short parent check for understanding.
${output}`;
}
