import data from './resources.json';

export type OlympiadResource = {
  id: string;
  provider: string;
  subject: string;
  title: string;
  grades: number[];
  sourceUrl: string;
  pdfUrl?: string;
  pages?: number;
  hasAnswers?: boolean;
  edition?: string;
  checkedOn: string;
  evidence: string;
};
export const olympiadResources: readonly OlympiadResource[] = data;
export const olympiadClasses = Array.from({ length: 10 }, (_, index) => index + 1);
export const olympiadProviders = ['CREST', 'SOF', 'SilverZone'] as const;
export const olympiadSubjects = ['Maths', 'Science', 'English', 'Reasoning'] as const;
export type OlympiadQuery = { grade?: string | string[]; subject?: string | string[]; provider?: string | string[]; q?: string | string[] };
export function olympiadFilters(input: OlympiadQuery) {
  const query = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  return {
    grade: query.grade === 'all' ? 'all' : olympiadClasses.includes(Number(query.grade)) ? String(Number(query.grade)) : '4',
    subject: olympiadSubjects.find(item => item === query.subject) ?? '',
    provider: olympiadProviders.find(item => item === query.provider) ?? '',
    q: (query.q ?? '').trim().slice(0, 100),
  };
}
export function selectOlympiadResources(query: OlympiadQuery) {
  const filters = olympiadFilters(query);
  const terms = filters.q.toLowerCase().split(/\s+/).filter(Boolean);
  return olympiadResources.filter(item =>
    (filters.grade === 'all' || item.grades.includes(Number(filters.grade))) &&
    (!filters.subject || item.subject === filters.subject) &&
    (!filters.provider || item.provider === filters.provider) &&
    terms.every(term => [item.title, item.provider, item.subject, item.edition ?? ''].join(' ').toLowerCase().includes(term)),
  );
}

export function olympiadPdfHref(resource: OlympiadResource) {
  if (!resource.pdfUrl) return resource.sourceUrl;
  return resource.provider === 'SOF'
    ? '/api/olympiad-pdf/' + encodeURIComponent(resource.id)
    : resource.pdfUrl;
}
