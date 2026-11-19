export const searchCategories = {
  features: { label: 'Features', icon: '↗' },
  books: { label: 'Books & Chapters', icon: '▤' },
  activities: { label: 'Activities', icon: '✦' },
  curriculum: { label: 'Curriculum', icon: '◎' },
  resources: { label: 'Resources', icon: '◇' },
} as const;
export type SearchCategory = keyof typeof searchCategories;
export type SearchFilter = SearchCategory | 'all';
export type SearchResult = {
  id: string;
  category: SearchCategory;
  title: string;
  description: string;
  metadata?: string;
  href: string;
};
export type SearchResponse = { results: SearchResult[]; total: number };
export const searchPageSize = 8;
export const maxSearchLength = 100;
