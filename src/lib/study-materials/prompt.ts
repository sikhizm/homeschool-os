import type { ChapterSlot, Textbook } from '@/lib/ncert/types';

export const MATERIALS = [
  ['complete-pack','Complete Chapter Mastery Pack'],['full-notes','Full Chapter Notes'],['concepts','Detailed Concept Explanations'],['revision-notes','Short Revision Notes'],['quick-sheet','One-Page Quick Revision Sheet'],['definitions','Important Definitions and Terminology'],['facts','Formula and Facts Sheet'],['solved-examples','Solved Examples'],['worksheets','Practice Worksheets'],['mcq','Multiple Choice Questions'],['fill-blanks','Fill in the Blanks'],['true-false','True or False'],['matching','Match the Following'],['short-answer','Short Answer Questions'],['long-answer','Long Answer Questions'],['competency','Competency-Based Questions'],['reasoning','Critical Thinking and Reasoning'],['real-life','Real-Life Application Questions'],['chapter-test','Chapter Test'],['exam-paper','Examination-Style Question Paper'],['answer-key','Separate Answer Key'],['solutions','Detailed Solutions and Marking Scheme'],['flashcards','Printable Flashcards'],['oral-cards','Oral Quiz Cards for Parent and Child'],['answer-sheet','Student Answer Sheet'],['mistakes','Common Mistakes and Misconceptions'],['mind-map','Chapter Mind Map'],['activities','Practical Activities and Experiments']
] as const;
export type MaterialId = typeof MATERIALS[number][0];
export type Difficulty = 'supportive'|'standard'|'stretch';
export type StudyOutputFormat = 'pdf'|'html'|'both';
export type StudyPromptInput = {student:string;stage:string;book:Textbook;chapter:ChapterSlot;resourceUrl:string;materials:MaterialId[];difficulty:Difficulty;language:string;largePrint?:boolean;outputFormat?:StudyOutputFormat};
const difficultyText:Record<Difficulty,string>={supportive:'Use smaller steps, simpler original explanations, vocabulary support, guided worked examples and scaffolded tasks.',standard:'Use expected grade-level curriculum, balance recall, understanding and application, and prepare appropriately for examinations.',stretch:'Use deeper reasoning, multi-step problems and higher-order applications without moving into unrelated higher-grade syllabus.'};
export function buildStudyPrompt(input:StudyPromptInput):string {
 const completeSections=['Chapter cover page','Learning objectives','Prerequisite knowledge','Full chapter notes','Detailed concept explanations','Important terminology','Solved examples','Key facts and formulas','Quick revision sheet','One-page chapter summary','Practice worksheet — Level 1 (guided)','Practice worksheet — Level 2 (grade-level)','Challenge worksheet — Level 3','Competency-based questions','Real-world application exercises','Chapter test','Examination-style paper','Separate answer key','Detailed solutions','Marking scheme','Student answer sheet','Parent feedback sheet','Short parent teaching guide'];
 const selected=input.materials.includes('complete-pack')?completeSections:MATERIALS.filter(x=>input.materials.includes(x[0])).map(x=>x[1]);
 const subject=input.book.subject.toLowerCase();
 const layout=subject.includes('math')?'Show clear equations, numbered working and generous calculation space; include number lines or geometry only when supported by the source.':subject.includes('science')||subject.includes('environment')?'Use scientific vocabulary, observation tables and safe practical activities; diagrams must be original, labelled and source-supported.':subject.includes('english')||subject.includes('hindi')||subject.includes('punjabi')?'Include suitable reading, vocabulary, grammar or writing practice, and respect the script and language requested.':subject.includes('social')?'Use timelines, comparisons or map activities only when relevant and supported by the chapter.':'Use a structure appropriate to this subject and avoid unsupported visuals.';
 const output=input.outputFormat??'pdf';
 const fileRules=output==='pdf'
 ? `Create and attach one actual downloadable PDF file. For a complete pack, provide one combined PDF with clearly separated, titled sections. Do NOT return HTML, Markdown source, or a long text substitute. Filename: ${input.stage.replace(/\\s+/g,'-')}-${input.book.subject.replace(/[^a-z0-9]+/gi,'-')}-${input.chapter.label.replace(/[^a-z0-9]+/gi,'-')}-study-material.pdf. If PDF attachment is unavailable, say so; do not silently switch formats.`
 : output==='html'
 ? `Create and attach one downloadable, self-contained .html file, not a long HTML code block in chat. Include all CSS inline, responsive browser styling and A4 print styles; no remote assets, scripts, trackers or external dependencies. Filename: ${input.stage.replace(/\\s+/g,'-')}-${input.book.subject.replace(/[^a-z0-9]+/gi,'-')}-${input.chapter.label.replace(/[^a-z0-9]+/gi,'-')}-study-material.html. If file attachment is unavailable, say so; do not paste the entire source into chat.`
 : `Create and attach BOTH a downloadable PDF and a downloadable self-contained .html file containing the same learning material. The PDF is the print-ready version; the HTML must have inline CSS, responsive browser styling and A4 print styles, with no remote assets, scripts, trackers or external dependencies. Do not paste either complete source/document into chat. If both files cannot be attached, say exactly which format is unavailable rather than silently substituting.`;
 return `You are preparing ORIGINAL learning material for a family-guided learner.

LEARNER AND VERIFIED CATALOGUE CONTEXT
Student: ${input.student}
Class: ${input.stage}
Subject: ${input.book.subject}
Textbook: ${input.book.title} (${input.book.publisher}; ${input.book.editionLabel})
Chapter: ${input.chapter.verifiedTitle} (${input.chapter.label})
Official source: ${input.resourceUrl}
Textbook catalogue source: ${input.book.sourceUrl}
Output language: ${input.language}
Difficulty: ${input.difficulty.toUpperCase()} — ${difficultyText[input.difficulty]}
Requested materials: ${selected.join('; ')}
Requested output format: ${output.toUpperCase()}

MANDATORY SOURCE GATE — DO THIS BEFORE WRITING
1. Open and inspect the actual official chapter at the source URL. The catalogue metadata above identifies a title only; it is not the chapter's contents.
2. If you cannot access or genuinely inspect the complete relevant chapter, STOP. Do not create chapter-specific notes, facts, examples, questions or answers. Instead reply only with a concise request for the parent to upload the chapter PDF/pages or paste the chapter text. State which source could not be accessed.
3. After inspection, base every chapter-specific claim, formula, example, answer and activity on the chapter. Do not fill gaps by guessing or rely on the title alone. Clearly mark any general teaching advice that is not in the chapter. No official learning-outcome mapping is approved for this catalogue; do not claim an official competency alignment. Check all arithmetic and ensure answer keys match their questions. For a translated output, preserve technical terms accurately and retain the English term in parentheses where a reliable translation is uncertain.
4. Write original explanations, examples, questions and diagrams. Do not reproduce substantial textbook passages, textbook illustrations, or proprietary exercise/question sets. Do not imply this output is official NCERT material.

FILE DELIVERABLE — REQUIRED
${fileRules}

DOCUMENT DESIGN
- Use A4 portrait with print-safe margins for printable content; responsive layout for HTML.
- Strictly monochrome black-and-white printing; readable typography, consistent heading hierarchy and comfortable line spacing.
- Embed or use fonts that correctly render the requested language and script. For Punjabi, use a font with proper Gurmukhi glyphs; for Hindi, use a font with proper Devanagari glyphs. Verify no glyphs are missing.
- Include student, class, subject, textbook, chapter, document type and a blank date field.
- Include a small Homeschool OS footer and printed page numbers in the PDF/HTML print layout.
- Keep test questions and answer keys in separate sections; never put answers immediately below student-facing questions.
- Provide generous answer-writing space, calculation space and tables appropriate to the subject.
- Check page breaks, overflow, blank pages, missing glyphs and answer-key alignment before attaching.
- Use accessible headings, lists and simple tables. ${layout}${input.largePrint?' Use large-print layout: at least 16pt body text, extra spacing and simplified page density.':''}

FINAL RESPONSE
${output==='pdf'?'Attach the completed PDF file.':output==='html'?'Attach the completed HTML file.':'Attach both completed files.'} Keep the accompanying message brief and identify each filename and its contents. Do not include the complete document source in chat.`;
}
