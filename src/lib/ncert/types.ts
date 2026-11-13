/**
 * Shared NCERT catalogue types.
 * Kept separate so per-grade data modules can import them without cycles;
 * `textbooks` re-exports them for existing consumers.
 */
export type ReviewStatus='catalogued'|'chapter-title-pending'|'source-verified'|'human-reviewed';
export type Textbook={
 id:string;grade:number;subject:string;title:string;language:string;publisher:'NCERT';
 textbookCode:string;chapterCount:number;sourceUrl:string;referenceUrl:string;
 editionLabel:string;status:string;
 /**
  * Highest chapter number whose `textbookCode+NN` PDF was actually confirmed
  * on the NCERT server. When set, chapters beyond it never receive a guessed
  * PDF link. Omit when every chapter PDF of the book has been confirmed.
  */
 verifiedPdfChapters?:number;
};
export type ChapterSlot={
 id:string;bookId:string;chapterNumber:number;label:string;verifiedTitle:string|null;
 status:ReviewStatus;sourceUrl:string;skillIds:string[];
 mappingStatus:'unmapped'|'proposed'|'human-reviewed';
};
