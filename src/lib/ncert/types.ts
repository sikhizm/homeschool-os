/**
 * Shared NCERT catalogue types.
 * Kept separate so per-grade data modules can import them without cycles;
 * `textbooks` re-exports them for existing consumers.
 */
export type ReviewStatus='catalogued'|'chapter-title-pending'|'source-verified'|'human-reviewed';
export type TextbookCategory='core'|'supplementary'|'vocational'|'language'|'arts'|'physical-education'|'well-being';
/** How a labelled slot participates in a book's intended learning path. */
export type ChapterSelection='required'|'choose-one';
/** Official Contents label used for a numbered indexed item. */
export type TextbookContentUnitLabel='Chapter'|'Project'|'Unit';
export type OfficialPdfReference={
 /** A direct NCERT PDF URL which was individually checked for this slot. */
 url:string;
 /** Brief factual audit note; never an inferred code-pattern claim. */
 verificationNote:string;
};
export type Textbook={
 id:string;grade:number;subject:string;title:string;language:string;publisher:'NCERT';
 textbookCode:string;chapterCount:number;sourceUrl:string;referenceUrl:string;
 editionLabel:string;status:string;
 /** A transparent curriculum role, not a claim that the book is compulsory everywhere. */
 category?:TextbookCategory;
  /** Only set where NCERT identifies this record as a distinct volume/part. */
  volumeLabel?:string;
  /** Keeps official Projects/Units distinct from ordinary chapters in the UI. */
  contentUnitLabel?:TextbookContentUnitLabel;
  /** Official prelims/contents URL supporting the bibliographic record when available. */
 provenanceUrl?:string;
 /**
  * Historical contiguous cap retained only for pre-Phase-7 records. New records
  * must use `verifiedPdfReferences` instead: PDFs are never inferred from a code.
  */
 verifiedPdfChapters?:number;
 /** Individually verified direct PDFs keyed by numbered chapter. May be non-contiguous. */
 verifiedPdfReferences?:Readonly<Record<number,OfficialPdfReference>>;
 /** Opts out of the legacy code-pattern fallback when no direct PDFs were individually checked. */
 directPdfAuditComplete?:boolean;
};
export type ChapterSlot={
 id:string;bookId:string;chapterNumber:number;label:string;verifiedTitle:string|null;
 status:ReviewStatus;sourceUrl:string;skillIds:string[];
 mappingStatus:'unmapped'|'proposed'|'human-reviewed';
  /** Present only if the individual direct PDF was checked for this chapter. */
  officialPdf?:OfficialPdfReference;
  /**
   * `choose-one` means this title is an official alternative in a labelled
   * selection group, not a compulsory item in the default auto-learning path.
   */
  selection?:ChapterSelection;
  /** Shared ID for alternatives; meaningful only when `selection` is `choose-one`. */
  selectionGroupId?:string;
  /** Factual source note explaining the Contents selection boundary. */
  selectionNote?:string;
};
