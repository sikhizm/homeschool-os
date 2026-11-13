/**
 * NCERT Grade 9 catalogue added in Phase 7 (audited 13 Nov 2026).
 *
 * Sources are official NCERT textbook portal pages and prelims PDFs. The portal
 * confirms that a numbered chapter entry exists; titles and counts below come
 * from the official Contents pages, never from a generic portal range.
 *
 * Direct PDFs are deliberately absent. Although NCERT uses patterned filenames
 * in several series, Phase 7 did not treat a pattern or search snippet as a
 * per-chapter availability check. Learners therefore use the official book
 * portal until a direct PDF is individually verified and recorded.
 *
 * Titles and metadata only — no textbook text, exercises, illustrations or
 * answer keys are reproduced here.
 */
import type {ChapterSelection,Textbook} from '../types';

export const grade9Textbooks:Textbook[]=[
 {
  id:'ncert-9-kaveri',grade:9,subject:'English',title:'Kaveri',language:'English',publisher:'NCERT',textbookCode:'iebe1',chapterCount:8,
  sourceUrl:'https://ncert.nic.in/textbook.php?iebe1=0-8',referenceUrl:'https://ncert.nic.in/textbook/pdf/iebe1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/iebe1ps.pdf',
  editionLabel:'NCERT first edition January 2026 (0903, ISBN 978-93-5729-419-5); eight numbered Contents chapters, with associated literary items not promoted to standalone chapter slots.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'language'
 },
 {
  id:'ncert-9-ganita-manjari-1',grade:9,subject:'Mathematics',title:'Ganita Manjari',language:'English',publisher:'NCERT',textbookCode:'iemh1',chapterCount:8,
  sourceUrl:'https://ncert.nic.in/textbook.php?iemh1=0-8',referenceUrl:'https://ncert.nic.in/textbook/pdf/iemh1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/iemh1ps.pdf',
  editionLabel:'NCERT first edition April 2026 (0904; ISBN was not captured in the audited source); Part I, Chapters 1–8.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'core',volumeLabel:'Part I'
 },
 {
  id:'ncert-9-ganita-manjari-2',grade:9,subject:'Mathematics',title:'Ganita Manjari',language:'English',publisher:'NCERT',textbookCode:'iemh2',chapterCount:6,
  sourceUrl:'https://ncert.nic.in/textbook.php?iemh2=0-6',referenceUrl:'https://ncert.nic.in/textbook/pdf/iemh2ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/iemh2ps.pdf',
  editionLabel:'NCERT first edition August 2026 (0905, ISBN 978-93-5729-236-8); Part II, Chapters 9–14.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'core',volumeLabel:'Part II'
 },
 {
  id:'ncert-9-exploration',grade:9,subject:'Science',title:'Exploration',language:'English',publisher:'NCERT',textbookCode:'iesc1',chapterCount:13,
  sourceUrl:'https://ncert.nic.in/textbook.php?iesc1=0-13',referenceUrl:'https://ncert.nic.in/textbook/pdf/iesc1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/iesc1ps.pdf',
  editionLabel:'NCERT first edition April 2026 (0906, ISBN 978-93-5729-567-3); 13 numbered Contents chapters.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'core'
 },
 {
  id:'ncert-9-understanding-society-1',grade:9,subject:'Social Science',title:'Understanding Society: India and Beyond',language:'English',publisher:'NCERT',textbookCode:'iest1',chapterCount:9,
  sourceUrl:'https://ncert.nic.in/textbook.php?iest1=0-9',referenceUrl:'https://ncert.nic.in/textbook/pdf/iest1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/iest1ps.pdf',
  editionLabel:'NCERT Grade 9 Part I; the official Contents lists nine numbered chapters across Geography, History, Political Science and Economics. Edition metadata was not independently recaptured in Phase 7.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'core',volumeLabel:'Part I'
 },
 {
  id:'ncert-9-understanding-society-2',grade:9,subject:'Social Science',title:'Understanding Society: India and Beyond',language:'English',publisher:'NCERT',textbookCode:'iest2',chapterCount:6,
  sourceUrl:'https://ncert.nic.in/textbook.php?iest2=0-6',referenceUrl:'https://ncert.nic.in/textbook/pdf/iest2ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/iest2ps.pdf',
  editionLabel:'NCERT first edition September 2026 (0909, ISBN 978-93-5729-279-5); Part II, six numbered Contents chapters.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'core',volumeLabel:'Part II'
 },
 {
  id:'ncert-9-ganga',grade:9,subject:'Hindi',title:'Ganga',language:'Hindi',publisher:'NCERT',textbookCode:'ihga1',chapterCount:12,
  sourceUrl:'https://ncert.nic.in/textbook.php?ihga1=0-12',referenceUrl:'https://ncert.nic.in/textbook/pdf/ihga1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/ihga1ps.pdf',
  editionLabel:'NCERT Grade 9 Hindi text; official Contents records seven prose and five poetry numbered works. The captured page did not reliably expose current edition bibliographic metadata.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'language'
 },
 {
  id:'ncert-9-kaushal-vikas',grade:9,subject:'Vocational Education',title:'Kaushal Vikas',language:'English',publisher:'NCERT',textbookCode:'iekv1',chapterCount:12,
  sourceUrl:'https://ncert.nic.in/textbook.php?iekv1=0-12',referenceUrl:'https://ncert.nic.in/textbook/pdf/iekv1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/iekv1ps.pdf',
  editionLabel:'NCERT first edition April 2026 (0916); 12 labelled chapters in three work-form units. Per official Contents, each unit has a mandatory chapter and a school-selected vocation path; it is not a required linear 12-chapter sequence.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'vocational'
 },
 {
  id:'ncert-9-khel-praveen',grade:9,subject:'Physical Education and Well-being',title:'Khel Praveen',language:'English',publisher:'NCERT',textbookCode:'iehp1',chapterCount:23,
  sourceUrl:'https://ncert.nic.in/textbook.php?iehp1=0-23',referenceUrl:'https://ncert.nic.in/textbook/pdf/iehp1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/iehp1ps.pdf',
  editionLabel:'NCERT first edition April 2026 (0918, ISBN 978-93-5729-372-3); 23 numbered chapters across six units. The portal exposes 30 generic chapter entries, but the official Contents governs the 23-slot catalogue.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'physical-education'
 }
];

export const grade9ChapterTitles:Record<string,readonly string[]>={
 'ncert-9-kaveri':[
  'How I Taught My Grandmother to Read','The Pot Maker','Winds of Change','Vitamin-M',
  'The World of Limitless Possibilities','Twin Melodies','Carrier of Words','Follow That Dream'
 ],
 'ncert-9-ganita-manjari-1':[
  'Orienting Yourself: The Use of Coordinates','Introduction to Linear Polynomials','The World of Numbers','Exploring Algebraic Identities',
  'I’m Up and Down, and Round and Round','Measuring Space: Perimeter and Area','The Mathematics of Maybe: Introduction to Probability','Predicting What Comes Next: Exploring Sequences and Progressions'
 ],
 'ncert-9-ganita-manjari-2':[
  'Propositions and their Converses','How Quantities Combine: Understanding Data','The World of Algorithms','Quadrilaterals','Two Variables, One Line','Math of Space: Surface Area and Volume'
 ],
 'ncert-9-exploration':[
  'Exploration: Entering the World of Secondary Science','Cell: The Building Block of Life','Tissues in Action','Describing Motion Around Us',
  'Exploring Mixtures and their Separation','How Forces Affect Motion','Work, Energy, and Simple Machines','Journey Inside the Atom',
  'Atomic Foundations of Matter','Sound Waves: Characteristics and Applications','Reproduction: How Life Continues','Patterns in Life: Diversity and Classification','Earth as a System: Energy, Matter, and Life'
 ],
 'ncert-9-understanding-society-1':[
  'Understanding Social Science','Shaping of the Earth’s Surface','Atmosphere and Climate','Early Humans and Beginning of Civilisation','State and Society up to 1000 CE','Democracy','Elections','Building Blocks in Economics: The Problem of Choice','The Price Puzzle: What Drives the Market'
 ],
 'ncert-9-understanding-society-2':[
  'Oceans and Life','Life on Earth','Resistance and Resilience (1000–1700 CE)','Governance and Public Policy','Managing Your Personal Finances','From Ideas to Startups'
 ],
 'ncert-9-ganga':[
  'दो बैलों की कथा','क्या लिखूँ?','संवादहीन','ऐसी भी बातें होती हैं (लता मंगेशकर से साक्षात्कार)','आखिरी चट्टान तक','रीढ़ की हड्डी','मैं और मेरा देश','पद','राम-लक्ष्मण-परशुराम संवाद','भारति, जय, विजय करे!','झाँसी की रानी','घर की याद'
 ],
 'ncert-9-kaushal-vikas':[
  'Introduction to Agricultural Practices','Rooftop Gardening','Precision Farming','Additional Vocations','Shaping Materials','Construction','Apparel','Additional Vocations','Personal and Lifestyle Services','Healthcare','Tourism','Additional Vocations'
 ],
 'ncert-9-khel-praveen':[
  'Physical Education and Well-being','History and Culture of Physical Education in India','Careers in Physical Education','Fitness and its Components','Understanding Our Body','Cardiorespiratory System','Growth, Development, and Maturation','First Aid','Olympic Values','The Ancient Olympic Games','The Modern Olympic Games','Sports and Inclusivity','Sports and Disability','Disability Etiquettes: Respecting Everyone with Dignity','Young Athlete','Women in Sports','Age is Just a Number','Indigenous Martial Arts and Sport','Combat Sports','Outdoor Sports','Samagra Svāsthya (Yoga for Holistic Health)','Yogamaya Jīvana (Lifestyle for Holistic Health)','Yoga for Personal Excellence'
 ]
};

export const grade9ContentSources:Record<string,string>={
 'ncert-9-kaveri':'https://ncert.nic.in/textbook/pdf/iebe1ps.pdf',
 'ncert-9-ganita-manjari-1':'https://ncert.nic.in/textbook/pdf/iemh1ps.pdf',
 'ncert-9-ganita-manjari-2':'https://ncert.nic.in/textbook/pdf/iemh2ps.pdf',
 'ncert-9-exploration':'https://ncert.nic.in/textbook/pdf/iesc1ps.pdf',
 'ncert-9-understanding-society-1':'https://ncert.nic.in/textbook/pdf/iest1ps.pdf',
 'ncert-9-understanding-society-2':'https://ncert.nic.in/textbook/pdf/iest2ps.pdf',
 'ncert-9-ganga':'https://ncert.nic.in/textbook/pdf/ihga1ps.pdf',
 'ncert-9-kaushal-vikas':'https://ncert.nic.in/textbook/pdf/iekv1ps.pdf',
 'ncert-9-khel-praveen':'https://ncert.nic.in/textbook/pdf/iehp1ps.pdf'
};


/**
 * Official Kaushal Vikas route structure. Required foundations are surfaced in
 * the default path. A family/school may choose a vocation in its own setting,
 * but this catalogue has no persisted selection workflow and records none.
 */
export const grade9ChapterSelections:Record<string,Readonly<Record<number,{selection:ChapterSelection;selectionGroupId?:string;selectionNote?:string}>>>={
 'ncert-9-kaushal-vikas':{
  1:{selection:'required',selectionNote:'Official Contents marks this introductory agricultural-practices chapter as the unit foundation.'},
  2:{selection:'choose-one',selectionGroupId:'kaushal-vikas-agriculture',selectionNote:'Official Contents presents a school/family-selected vocation path after the unit foundation; select one, rather than scheduling every alternative.'},
  3:{selection:'choose-one',selectionGroupId:'kaushal-vikas-agriculture',selectionNote:'Official Contents presents a school/family-selected vocation path after the unit foundation; select one, rather than scheduling every alternative.'},
  4:{selection:'choose-one',selectionGroupId:'kaushal-vikas-agriculture',selectionNote:'Official Contents presents a school/family-selected vocation path after the unit foundation; select one, rather than scheduling every alternative.'},
  5:{selection:'required',selectionNote:'Official Contents marks this work-with-materials chapter as the unit foundation.'},
  6:{selection:'choose-one',selectionGroupId:'kaushal-vikas-materials',selectionNote:'Official Contents presents a school/family-selected vocation path after the unit foundation; select one, rather than scheduling every alternative.'},
  7:{selection:'choose-one',selectionGroupId:'kaushal-vikas-materials',selectionNote:'Official Contents presents a school/family-selected vocation path after the unit foundation; select one, rather than scheduling every alternative.'},
  8:{selection:'choose-one',selectionGroupId:'kaushal-vikas-materials',selectionNote:'Official Contents presents a school/family-selected vocation path after the unit foundation; select one, rather than scheduling every alternative.'},
  9:{selection:'required',selectionNote:'Official Contents marks this personal-and-lifestyle-services chapter as the unit foundation.'},
  10:{selection:'choose-one',selectionGroupId:'kaushal-vikas-services',selectionNote:'Official Contents presents a school/family-selected vocation path after the unit foundation; select one, rather than scheduling every alternative.'},
  11:{selection:'choose-one',selectionGroupId:'kaushal-vikas-services',selectionNote:'Official Contents presents a school/family-selected vocation path after the unit foundation; select one, rather than scheduling every alternative.'},
  12:{selection:'choose-one',selectionGroupId:'kaushal-vikas-services',selectionNote:'Official Contents presents a school/family-selected vocation path after the unit foundation; select one, rather than scheduling every alternative.'}
 }
};
