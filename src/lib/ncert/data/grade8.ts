/**
 * NCERT Class 8 catalogue — legacy core-series chapter records plus Phase 7
 * official resource records. Structured resources retain their real project/unit
 * semantics rather than being forced into a fabricated linear chapter sequence.
 *
 * Provenance (reviewed 13 Nov 2026):
 * - Book identity + edition: official NCERT textbook prelims PDFs
 *   (hecu1ps, hepr1ps, hegp1ps, hegp2ps, hhml1ps, hsde1ps) — each names the
 *   book, publication number, ISBN, first-edition date and (except Ganita
 *   Prakash Part-II) reprint January 2026 with cover line "Reprint 2026-27".
 * - Chapter titles: official Contents pages inside those prelims PDFs.
 * - Historical direct-PDF coverage remains scoped to the six earlier records.
 *   Phase 7 resource records expose only official book-portal fallbacks until
 *   a direct chapter PDF is individually verified.
 * - Earlier audit (13 Nov 2026, scripts/curriculum-audit.ts): every chapter
 *   PDF confirmed 200 except Poorvi hepr106–hepr115 (404 — NCERT hosts only
 *   chapters 01–05 so far). Poorvi is therefore capped via verifiedPdfChapters.
 *
 * Notes:
 * - Curiosity has 13 numbered chapters (earlier portal range said 12).
 * - Poorvi lists 15 untitled-numbered lessons across 5 units.
 * - Deepakam has 13 numbered chapters plus 3 unnumbered grammar appendices
 *   (appendices are not chapter slots).
 * - Ganita Prakash Grade 8 is two volumes: Part-1 (hegp1, first edition
 *   July 2025, reprinted January 2026) and Part-II (hegp2, first edition
 *   December 2025, no reprint yet), seven chapters each.
 *
 * Titles and metadata only — no textbook text is reproduced.
 */
import type {ChapterSelection,Textbook} from '../types';

export const grade8Textbooks:Textbook[]=[
 {
  "id":"ncert-8-poorvi","grade":8,"subject":"English","title":"Poorvi","language":"English","publisher":"NCERT","textbookCode":"hepr1","chapterCount":15,
  "sourceUrl":"https://ncert.nic.in/textbook.php?hepr1=0-15","referenceUrl":"https://ciet.ncert.gov.in/audio-book/129",
  "editionLabel":"NCERT 2026–27 reprint (0873, ISBN 978-93-5729-940-4; first edition May 2025, reprinted January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles",
  // Phase 5 audit (13 Nov 2026): NCERT hosts hepr101–hepr105.pdf only;
  // hepr106–hepr115.pdf returned 404, so chapter PDFs stop at 5 until NCERT uploads the rest.
  "verifiedPdfChapters":5
 },
 {
  "id":"ncert-8-ganita-prakash","grade":8,"subject":"Mathematics","title":"Ganita Prakash","language":"English","publisher":"NCERT","textbookCode":"hegp1","chapterCount":7,
  "sourceUrl":"https://ncert.nic.in/textbook.php?hegp1=0-7","referenceUrl":"https://ciet.ncert.gov.in/audio-book/130",
  "editionLabel":"NCERT 2026–27 reprint (0874, ISBN 978-93-5729-642-7; first edition July 2025, reprinted January 2026), Part-1; edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-8-ganita-prakash-2","grade":8,"subject":"Mathematics","title":"Ganita Prakash (Part-II)","language":"English","publisher":"NCERT","textbookCode":"hegp2","chapterCount":7,
  "sourceUrl":"https://ncert.nic.in/textbook.php?hegp2=0-7","referenceUrl":"https://ncert.nic.in/textbook.php?hegp2=",
  "editionLabel":"NCERT first edition December 2025 (0889, ISBN 978-93-5729-106-4), Part-II, no reprint yet; edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-8-malhar","grade":8,"subject":"Hindi","title":"Malhar","language":"Hindi","publisher":"NCERT","textbookCode":"hhml1","chapterCount":10,
  "sourceUrl":"https://ncert.nic.in/textbook.php?hhml1=0-10","referenceUrl":"https://ciet.ncert.gov.in/audio-book/131",
  "editionLabel":"NCERT 2026–27 reprint (0871, ISBN 978-93-5729-360-0; first edition June 2025, reprinted January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-8-deepakam","grade":8,"subject":"Sanskrit","title":"Deepakam","language":"Sanskrit","publisher":"NCERT","textbookCode":"hsde1","chapterCount":13,
  "sourceUrl":"https://ncert.nic.in/textbook.php?hsde1=0-13","referenceUrl":"https://ciet.ncert.gov.in/audio-book/143",
  "editionLabel":"NCERT 2026–27 reprint (0872, ISBN 978-93-5729-294-8; first edition July 2025, reprinted January 2026); 13 numbered chapters plus unnumbered grammar appendices; edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  "id":"ncert-8-curiosity","grade":8,"subject":"Science","title":"Curiosity","language":"English","publisher":"NCERT","textbookCode":"hecu1","chapterCount":13,
  "sourceUrl":"https://ncert.nic.in/textbook.php?hecu1=0-13","referenceUrl":"https://ciet.ncert.gov.in/audio-book/128",
  "editionLabel":"NCERT 2026–27 reprint (0877, ISBN 978-93-5729-772-1; first edition June 2025, reprinted January 2026); edition and chapter titles checked against official textbook prelims PDF",
  "status":"source-verified-chapter-titles"
 },
 {
  id:'ncert-8-exploring-society-1',grade:8,subject:'Social Science',title:'Exploring Society: India and Beyond',language:'English',publisher:'NCERT',textbookCode:'hees1',chapterCount:7,
  sourceUrl:'https://ncert.nic.in/textbook.php?hees1=0-7',referenceUrl:'https://ncert.nic.in/textbook/pdf/hees1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/hees1ps.pdf',
  editionLabel:'NCERT Grade 8 Part 1, reprint 2026–27 (0881, ISBN 978-93-5729-293-1); seven numbered Contents chapters. A historical note says Part II was to follow, but the official Part II is now separately audited.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'core',volumeLabel:'Part I'
 },
 {
  id:'ncert-8-exploring-society-2',grade:8,subject:'Social Science',title:'Exploring Society: India and Beyond',language:'English',publisher:'NCERT',textbookCode:'hees2',chapterCount:8,
  sourceUrl:'https://ncert.nic.in/textbook.php?hees2=0-8',referenceUrl:'https://ncert.nic.in/textbook/pdf/hees2ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/hees2ps.pdf',
  editionLabel:'NCERT Grade 8 Part 2; official Contents has eight numbered chapters. This retrieved source records a revised Social Science textbook and notes a March 2026 rewrite of the judiciary chapter; verify the current printing before assignment.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'core',volumeLabel:'Part II'
 },
 {
  id:'ncert-8-kaushal-bodh',grade:8,subject:'Vocational Education',title:'Kaushal Bodh',language:'English',publisher:'NCERT',textbookCode:'hekb1',chapterCount:6,
  sourceUrl:'https://ncert.nic.in/textbook.php?hekb1=0-6',referenceUrl:'https://ncert.nic.in/textbook/pdf/hekb1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/hekb1ps.pdf',
  editionLabel:'NCERT Grade 8 vocational activity book, reprint 2026–27. Six illustrative projects across three forms of work; the official guidance says projects are not mandatory and schools may choose one per form or design another appropriate project.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'vocational',contentUnitLabel:'Project'
 },
 {
  id:'ncert-8-khel-yatra',grade:8,subject:'Physical Education and Well-being',title:'Khel Yatra',language:'English',publisher:'NCERT',textbookCode:'heky1',chapterCount:6,
  sourceUrl:'https://ncert.nic.in/textbook.php?heky1=0-6',referenceUrl:'https://ncert.nic.in/textbook/pdf/heky1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/heky1ps.pdf',
  editionLabel:'NCERT first edition July 2025; reprint January 2026 / 2026–27 (0887, ISBN 978-93-5729-520-8). Official About the Book text names these six units and says principals/physical-education teachers may plan classes with equal emphasis and distribution; portal navigation contains additional component entries and is not used as a count.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'physical-education',contentUnitLabel:'Unit'
 },
 {
  id:'ncert-8-kriti',grade:8,subject:'Arts Education',title:'Kriti',language:'English',publisher:'NCERT',textbookCode:'hekr1',chapterCount:19,
  sourceUrl:'https://ncert.nic.in/textbook.php?hekr1=0-19',referenceUrl:'https://ncert.nic.in/textbook/pdf/hekr1ps.pdf',provenanceUrl:'https://ncert.nic.in/textbook/pdf/hekr1ps.pdf',
  editionLabel:'NCERT Grade 8 Arts Education, reprint 2026–27; nineteen numbered Contents chapters across Theatre, Music, Dance and Movement, and Visual Arts.',
  status:'source-verified-chapter-titles',directPdfAuditComplete:true,category:'arts'
 }
];

/** Chapter titles read from the official prelims Contents pages (verified 10 Nov 2026). */
export const grade8ChapterTitles:Record<string,readonly string[]>={
 "ncert-8-poorvi":[
  "The Wit that Won Hearts",
  "A Concrete Example",
  "Wisdom Paves the Way",
  "A Tale of Valour: Major Somnath Sharma and the Battle of Badgam",
  "Somebody's Mother",
  "Verghese Kurien—I Too Had A Dream",
  "The Case of the Fifth Word",
  "The Magic Brush of Dreams",
  "Spectacular Wonders",
  "The Cherry Tree",
  "Harvest Hymn",
  "Waiting for the Rain",
  "Feathered Friend",
  "Magnifying Glass",
  "Bibha Chowdhuri: The Beam of Light that Lit the Path for Women in Indian Science"
 ],
 "ncert-8-ganita-prakash":[
  "A Square and A Cube",
  "Power Play",
  "A Story of Numbers",
  "Quadrilaterals",
  "Number Play",
  "We Distribute, Yet Things Multiply",
  "Proportional Reasoning-1"
 ],
 "ncert-8-ganita-prakash-2":[
  "Fractions in Disguise",
  "The Baudhayana-Pythagoras Theorem",
  "Proportional Reasoning-2",
  "Exploring Some Geometric Themes",
  "Tales by Dots and Lines",
  "Algebra Play",
  "Area"
 ],
 "ncert-8-malhar":[
  "स्वदेश",
  "दो गौरैया",
  "एक आशीर्वाद",
  "हरिद्वार",
  "कबीर के दोहे",
  "एक टोकरी भर मिट्टी",
  "मत बाँधो",
  "नए महमान",
  "आदमी का अनपत",
  "तरुण के स्वप्न"
 ],
 "ncert-8-deepakam":[
  "संगच्छध्वं संवदध्वम्",
  "अल्पानामपि वस्तूनां संहतिः कार्यसाधिका",
  "सुभाषितरसंपीत्वा जीवनं सफलं कुरु",
  "प्रणम्यो देशभक्तोऽयं गोपबन्धुर्महामनाः",
  "गीता सुगीता कर्तव्या",
  "डिजिभारतम् - युगपरिवर्तनम्",
  "मञ्जुलमञ्जूषासुन्दरसुरभाषा",
  "पश्यत कोणमैशान्यं भारतस्य मनोहरम्",
  "कोऽरुक् ? कोऽरुक् ? कोऽरुक् ?",
  "सन्निमित्ते वरं त्यागः (क-भागः)",
  "सन्निमित्ते वरं त्यागः (ख-भागः)",
  "सम्यग्वर्णप्रयोगेण ब्रह्मलोके महीयते",
  "वर्णोच्चारण-शिक्षा १"
 ],
 "ncert-8-curiosity":[
  "Exploring the Investigative World of Science",
  "The Invisible Living World: Beyond Our Naked Eye",
  "Health: The Ultimate Treasure",
  "Electricity: Magnetic and Heating Effects",
  "Exploring Forces",
  "Pressure, Winds, Storms, and Cyclones",
  "Particulate Nature of Matter",
  "Nature of Matter: Elements, Compounds, and Mixtures",
  "The Amazing World of Solutes, Solvents, and Solutions",
  "Light: Mirrors and Lenses",
  "Keeping Time with the Skies",
  "How Nature Works in Harmony",
  "Our Home: Earth, a Unique Life Sustaining Planet"
 ],
 'ncert-8-exploring-society-1':[
  'Natural Resources and Their Use','Reshaping India’s Political Map','The Rise of the Marathas','The Colonial Era in India','Universal Franchise and India’s Electoral System','The Parliamentary System: Legislature and Executive','Factors of Production'
 ],
 'ncert-8-exploring-society-2':[
  'World Geography: Some Glimpses','India’s Long Road to Independence','A Journey Through Indian Architecture','The Role of the Judiciary in Our Society','Citizenship: Rights and Duties','Dynamics of Population','India’s Urban Landscape','Cultural Currents: 13th to 17th Centuries'
 ],
 'ncert-8-kaushal-bodh':[
  'Hydroponics: Growing Plants without Soil','Feeding and Caring for Farm Animals','Working with Wood and Bamboo','Home Automation','Water Audit for Water Management','Creating Advertisements'
 ],
 'ncert-8-khel-yatra':[
  'Foundations of Physical Education and Well-being','Physical and Motor Fitness','Fundamental Skills of Athletics','Fundamental Skills of Table Tennis','Fundamental Skills of Volleyball','Yoga'
 ],
 'ncert-8-kriti':[
  'Bringing Words Alive—Play Reading','One Stage, Many Scripts','From Page to Stage','Applause and Advice','Discovering the Elements of Music','Musical Instruments','Indian Classical Music','Inspiration and Imagination','My World of Music','Inner Dynamics of Dance','Pan Indian Dance Forms','Dance for Well-being','Innovation, Inclusivity and Inspiring Change','A Presentation of Dance and Choreography','Elements and Principles of Visual Art and Design','Still Life in Colour','People in Places','Arts of the People, With the People, For the People','Campaign for Art Awareness'
 ]
};

/** Official prelims PDFs whose Contents pages supplied the titles above. */
export const grade8ContentSources:Record<string,string>={
 "ncert-8-poorvi":"https://ncert.nic.in/textbook/pdf/hepr1ps.pdf",
 "ncert-8-ganita-prakash":"https://ncert.nic.in/textbook/pdf/hegp1ps.pdf",
 "ncert-8-ganita-prakash-2":"https://ncert.nic.in/textbook/pdf/hegp2ps.pdf",
 "ncert-8-malhar":"https://ncert.nic.in/textbook/pdf/hhml1ps.pdf",
 "ncert-8-deepakam":"https://ncert.nic.in/textbook/pdf/hsde1ps.pdf",
 "ncert-8-curiosity":"https://ncert.nic.in/textbook/pdf/hecu1ps.pdf",
 'ncert-8-exploring-society-1':'https://ncert.nic.in/textbook/pdf/hees1ps.pdf',
 'ncert-8-exploring-society-2':'https://ncert.nic.in/textbook/pdf/hees2ps.pdf',
 'ncert-8-kaushal-bodh':'https://ncert.nic.in/textbook/pdf/hekb1ps.pdf',
 'ncert-8-khel-yatra':'https://ncert.nic.in/textbook/pdf/heky1ps.pdf',
 'ncert-8-kriti':'https://ncert.nic.in/textbook/pdf/hekr1ps.pdf'
};

/**
 * Explicit non-linear structures captured from official Contents/introduction pages.
 * `choose-one` slots remain visible in the library but do not enter the default
 * auto-learning sequence. Parents/teachers can use the official book portal to
 * select the locally appropriate project.
 */
export const grade8ChapterSelections:Record<string,Readonly<Record<number,{selection:ChapterSelection;selectionGroupId?:string;selectionNote?:string}>>>={
 'ncert-8-kaushal-bodh':{
  1:{selection:'choose-one',selectionGroupId:'kaushal-bodh-work-with-life-forms',selectionNote:'Official Grade 8 guidance: projects are not mandatory; schools may choose one project from each form of work or design another appropriate project.'},
  2:{selection:'choose-one',selectionGroupId:'kaushal-bodh-work-with-life-forms',selectionNote:'Official Grade 8 guidance: projects are not mandatory; schools may choose one project from each form of work or design another appropriate project.'},
  3:{selection:'choose-one',selectionGroupId:'kaushal-bodh-work-with-machines-materials',selectionNote:'Official Grade 8 guidance: projects are not mandatory; schools may choose one project from each form of work or design another appropriate project.'},
  4:{selection:'choose-one',selectionGroupId:'kaushal-bodh-work-with-machines-materials',selectionNote:'Official Grade 8 guidance: projects are not mandatory; schools may choose one project from each form of work or design another appropriate project.'},
  5:{selection:'choose-one',selectionGroupId:'kaushal-bodh-work-in-human-services',selectionNote:'Official Grade 8 guidance: projects are not mandatory; schools may choose one project from each form of work or design another appropriate project.'},
  6:{selection:'choose-one',selectionGroupId:'kaushal-bodh-work-in-human-services',selectionNote:'Official Grade 8 guidance: projects are not mandatory; schools may choose one project from each form of work or design another appropriate project.'}
 }
};
