/** Curated parent-facing exemplars, not verbatim NCERT outcomes or a board syllabus. */
export type SubjectKey = 'English' | 'Mathematics' | 'Our world' | 'Punjabi & Sikh heritage';
export type Competency = {id:string;stage:string;title:string;subject:SubjectKey;outcome:string;prerequisites:string[];activity:string;sourceId:string};
export const curriculumStages = [
  {
    "id": "early",
    "label": "Early years",
    "level": "Nursery–UKG",
    "description": "Play, conversation, concrete objects and movement. No formal assessment pressure."
  },
  {
    "id": "class1-2",
    "label": "Classes 1–2",
    "level": "Primary foundation",
    "description": "Read, discuss, manipulate and explain before routine practice."
  },
  {
    "id": "class3-5",
    "label": "Classes 3–5",
    "level": "Preparatory learning",
    "description": "Build understanding through inquiry, evidence and gradual independence."
  },
  {
    "id": "class6-8",
    "label": "Classes 6–8",
    "level": "Middle school",
    "description": "Connect ideas, ask testable questions and reason with models."
  },
  {
    "id": "class9-10",
    "label": "Classes 9–10",
    "level": "Secondary foundation",
    "description": "Develop analytical writing, mathematical reasoning and scientific judgement."
  },
  {
    "id": "class11-12",
    "label": "Classes 11–12",
    "level": "Advanced study",
    "description": "Choose specific subjects and validate applicable board syllabi separately."
  }
] as const;
export const curriculumSources = [
  {
    "id": "ncf-fs",
    "title": "NCF Foundational Stage 2022",
    "url": "https://www.ncert.nic.in/pdf/NCF_for_Foundational_Stage_20_October_2022.pdf"
  },
  {
    "id": "elementary",
    "title": "NCERT Learning Outcomes at Elementary Stage",
    "url": "https://ncert.ncert.org.in/learning-outcome.php"
  },
  {
    "id": "secondary",
    "title": "NCERT Learning Outcomes at Secondary Stage",
    "url": "https://ncert.ncert.org.in/learning-outcome.php"
  },
  {
    "id": "ncf-se",
    "title": "NCF School Education 2023",
    "url": "https://ncf.ncert.gov.in/"
  },
  {
    "id": "original",
    "title": "Parent-developed enrichment activities",
    "url": "https://ncf.ncert.gov.in/"
  }
] as const;
export const competencies: Competency[] = [
  {
    "id": "early-story",
    "stage": "early",
    "title": "Story conversations",
    "subject": "English",
    "outcome": "Listen to a short story and retell two events using words, gestures or pictures.",
    "prerequisites": [],
    "activity": "Retell together after a picture-book read-aloud.",
    "sourceId": "ncf-fs"
  },
  {
    "id": "early-sounds",
    "stage": "early",
    "title": "Sound play",
    "subject": "English",
    "outcome": "Notice rhyming words and beginning sounds in familiar speech.",
    "prerequisites": [
      "early-story"
    ],
    "activity": "Clap a rhyme and find words that sound alike.",
    "sourceId": "ncf-fs"
  },
  {
    "id": "early-sort",
    "stage": "early",
    "title": "Sorting objects",
    "subject": "Mathematics",
    "outcome": "Sort everyday objects by one visible property and explain the choice.",
    "prerequisites": [],
    "activity": "Sort leaves, buttons or safe blocks by colour or shape.",
    "sourceId": "ncf-fs"
  },
  {
    "id": "early-count",
    "stage": "early",
    "title": "Counting collections",
    "subject": "Mathematics",
    "outcome": "Match number words with small groups of real objects.",
    "prerequisites": [
      "early-sort"
    ],
    "activity": "Count a few safe objects, touching each once.",
    "sourceId": "ncf-fs"
  },
  {
    "id": "early-pattern",
    "stage": "early",
    "title": "Pattern noticing",
    "subject": "Mathematics",
    "outcome": "Continue a repeating pattern made with shapes, sounds or actions.",
    "prerequisites": [
      "early-sort"
    ],
    "activity": "Make a clap-stomp pattern and ask what comes next.",
    "sourceId": "ncf-fs"
  },
  {
    "id": "early-nature",
    "stage": "early",
    "title": "Nature noticing",
    "subject": "Our world",
    "outcome": "Observe and describe one change in the weather or local environment.",
    "prerequisites": [],
    "activity": "Talk about today's sky and notice what has changed.",
    "sourceId": "ncf-fs"
  },
  {
    "id": "early-punjabi",
    "stage": "early",
    "title": "Punjabi conversation",
    "subject": "Punjabi & Sikh heritage",
    "outcome": "Use familiar Punjabi words to name family, food or everyday actions.",
    "prerequisites": [],
    "activity": "Share everyday conversation with an adult.",
    "sourceId": "ncf-fs"
  },
  {
    "id": "early-seva",
    "stage": "early",
    "title": "Kindness in action",
    "subject": "Punjabi & Sikh heritage",
    "outcome": "Take part in a simple, age-appropriate act of sharing or seva.",
    "prerequisites": [],
    "activity": "Help put away toys or share materials.",
    "sourceId": "ncf-fs"
  },
  {
    "id": "class1-2-read",
    "stage": "class1-2",
    "title": "Read and retell",
    "subject": "English",
    "outcome": "Read or listen to an age-appropriate passage and retell its main events.",
    "prerequisites": [
      "early-story"
    ],
    "activity": "Describe what happened first, next and last.",
    "sourceId": "elementary"
  },
  {
    "id": "class1-2-write",
    "stage": "class1-2",
    "title": "Sentence writing",
    "subject": "English",
    "outcome": "Write two linked sentences to explain a familiar event.",
    "prerequisites": [
      "class1-2-read"
    ],
    "activity": "Write about something observed today.",
    "sourceId": "elementary"
  },
  {
    "id": "class1-2-place",
    "stage": "class1-2",
    "title": "Place value",
    "subject": "Mathematics",
    "outcome": "Represent two-digit numbers using tens and ones with objects or drawings.",
    "prerequisites": [
      "early-count"
    ],
    "activity": "Bundle sticks into groups of ten.",
    "sourceId": "elementary"
  },
  {
    "id": "class1-2-add",
    "stage": "class1-2",
    "title": "Addition with models",
    "subject": "Mathematics",
    "outcome": "Explain addition and subtraction within a familiar range using objects or sketches.",
    "prerequisites": [
      "class1-2-place"
    ],
    "activity": "Model a shopping or sharing problem.",
    "sourceId": "elementary"
  },
  {
    "id": "class1-2-shapes",
    "stage": "class1-2",
    "title": "Shapes and space",
    "subject": "Mathematics",
    "outcome": "Identify and compare common 2D shapes in the environment.",
    "prerequisites": [
      "early-sort"
    ],
    "activity": "Make a shape hunt around the home.",
    "sourceId": "elementary"
  },
  {
    "id": "class1-2-plants",
    "stage": "class1-2",
    "title": "Local plants",
    "subject": "Our world",
    "outcome": "Describe the basic needs of plants based on observations.",
    "prerequisites": [
      "early-nature"
    ],
    "activity": "Observe a potted plant across several days.",
    "sourceId": "elementary"
  },
  {
    "id": "class1-2-punjabi",
    "stage": "class1-2",
    "title": "Punjabi listening",
    "subject": "Punjabi & Sikh heritage",
    "outcome": "Listen to a short Punjabi story and explain its central idea.",
    "prerequisites": [
      "early-punjabi"
    ],
    "activity": "Discuss an age-appropriate family story.",
    "sourceId": "elementary"
  },
  {
    "id": "class3-5-read",
    "stage": "class3-5",
    "title": "Reading for meaning",
    "subject": "English",
    "outcome": "Find the main idea and relevant supporting details in a short text.",
    "prerequisites": [
      "class1-2-read"
    ],
    "activity": "Explain the paragraph in your own words.",
    "sourceId": "elementary"
  },
  {
    "id": "class3-5-write",
    "stage": "class3-5",
    "title": "Paragraph composition",
    "subject": "English",
    "outcome": "Write a coherent paragraph with a topic and supporting examples.",
    "prerequisites": [
      "class1-2-write"
    ],
    "activity": "Describe an investigation and revise for clarity.",
    "sourceId": "elementary"
  },
  {
    "id": "class3-5-multiply",
    "stage": "class3-5",
    "title": "Multiplication concepts",
    "subject": "Mathematics",
    "outcome": "Model multiplication using equal groups, arrays and repeated addition.",
    "prerequisites": [
      "class1-2-add"
    ],
    "activity": "Make equal groups with counters.",
    "sourceId": "elementary"
  },
  {
    "id": "class3-5-fractions",
    "stage": "class3-5",
    "title": "Fractions as quantities",
    "subject": "Mathematics",
    "outcome": "Compare simple fractions using equal parts of a whole or collection.",
    "prerequisites": [
      "class1-2-place"
    ],
    "activity": "Fold paper strips into equal parts.",
    "sourceId": "elementary"
  },
  {
    "id": "class3-5-measure",
    "stage": "class3-5",
    "title": "Measurement reasoning",
    "subject": "Mathematics",
    "outcome": "Estimate, measure and compare lengths or masses using suitable units.",
    "prerequisites": [
      "class1-2-shapes"
    ],
    "activity": "Measure two household objects and compare.",
    "sourceId": "elementary"
  },
  {
    "id": "class3-5-investigate",
    "stage": "class3-5",
    "title": "Simple investigations",
    "subject": "Our world",
    "outcome": "Form an observable question, collect evidence and describe a result.",
    "prerequisites": [
      "class1-2-plants"
    ],
    "activity": "Observe how light affects a plant over time.",
    "sourceId": "elementary"
  },
  {
    "id": "class3-5-community",
    "stage": "class3-5",
    "title": "Community and care",
    "subject": "Our world",
    "outcome": "Explain how a local community activity affects people and the environment.",
    "prerequisites": [
      "class1-2-plants"
    ],
    "activity": "Discuss waste segregation with examples.",
    "sourceId": "elementary"
  },
  {
    "id": "class3-5-sikh",
    "stage": "class3-5",
    "title": "Sikh heritage reflection",
    "subject": "Punjabi & Sikh heritage",
    "outcome": "Describe a verified Sikh historical episode and discuss one value without inventing quotations.",
    "prerequisites": [
      "class1-2-punjabi"
    ],
    "activity": "Read a sourced short account together and discuss.",
    "sourceId": "original"
  },
  {
    "id": "class6-8-read",
    "stage": "class6-8",
    "title": "Evidence-based reading",
    "subject": "English",
    "outcome": "Compare claims in two age-appropriate texts and identify supporting evidence.",
    "prerequisites": [
      "class3-5-read"
    ],
    "activity": "Underline evidence for two interpretations.",
    "sourceId": "elementary"
  },
  {
    "id": "class6-8-argument",
    "stage": "class6-8",
    "title": "Structured argument",
    "subject": "English",
    "outcome": "Write an argument with a claim, reasons and a considered counterpoint.",
    "prerequisites": [
      "class3-5-write"
    ],
    "activity": "Draft and revise a short opinion piece.",
    "sourceId": "elementary"
  },
  {
    "id": "class6-8-ratio",
    "stage": "class6-8",
    "title": "Ratio and proportion",
    "subject": "Mathematics",
    "outcome": "Use equivalent ratios to solve familiar scaling problems and explain the method.",
    "prerequisites": [
      "class3-5-multiply"
    ],
    "activity": "Scale a simple food recipe.",
    "sourceId": "elementary"
  },
  {
    "id": "class6-8-algebra",
    "stage": "class6-8",
    "title": "Algebraic expressions",
    "subject": "Mathematics",
    "outcome": "Represent numerical patterns with variables and explain relationships.",
    "prerequisites": [
      "class3-5-multiply"
    ],
    "activity": "Describe a growing tile pattern.",
    "sourceId": "elementary"
  },
  {
    "id": "class6-8-data",
    "stage": "class6-8",
    "title": "Data interpretation",
    "subject": "Mathematics",
    "outcome": "Interpret charts, choose meaningful comparisons and notice misleading scales.",
    "prerequisites": [
      "class3-5-measure"
    ],
    "activity": "Make and read a chart from observations.",
    "sourceId": "elementary"
  },
  {
    "id": "class6-8-fair",
    "stage": "class6-8",
    "title": "Fair investigations",
    "subject": "Our world",
    "outcome": "Design a simple investigation while controlling relevant variables.",
    "prerequisites": [
      "class3-5-investigate"
    ],
    "activity": "Compare seed growth under planned conditions.",
    "sourceId": "elementary"
  },
  {
    "id": "class6-8-history",
    "stage": "class6-8",
    "title": "Historical sources",
    "subject": "Our world",
    "outcome": "Distinguish primary accounts, later interpretation and unsupported claims.",
    "prerequisites": [
      "class3-5-community"
    ],
    "activity": "Compare two documented explanations of an event.",
    "sourceId": "elementary"
  },
  {
    "id": "class9-10-writing",
    "stage": "class9-10",
    "title": "Analytical writing",
    "subject": "English",
    "outcome": "Develop an interpretation using cited textual evidence and clear reasoning.",
    "prerequisites": [
      "class6-8-argument"
    ],
    "activity": "Write a brief critical response.",
    "sourceId": "secondary"
  },
  {
    "id": "class9-10-linear",
    "stage": "class9-10",
    "title": "Linear relationships",
    "subject": "Mathematics",
    "outcome": "Model and solve linear equations and interpret the result in context.",
    "prerequisites": [
      "class6-8-algebra"
    ],
    "activity": "Compare two simple cost plans.",
    "sourceId": "secondary"
  },
  {
    "id": "class9-10-geometry",
    "stage": "class9-10",
    "title": "Geometry reasoning",
    "subject": "Mathematics",
    "outcome": "Explain geometric relationships using diagrams and logically ordered arguments.",
    "prerequisites": [
      "class3-5-measure"
    ],
    "activity": "Justify a relationship between angles.",
    "sourceId": "secondary"
  },
  {
    "id": "class9-10-science",
    "stage": "class9-10",
    "title": "Scientific evidence",
    "subject": "Our world",
    "outcome": "Evaluate a claim using measurements, limitations and alternative explanations.",
    "prerequisites": [
      "class6-8-fair"
    ],
    "activity": "Review the quality of evidence in an experiment.",
    "sourceId": "secondary"
  },
  {
    "id": "class11-12-research",
    "stage": "class11-12",
    "title": "Independent research",
    "subject": "English",
    "outcome": "Frame a focused inquiry and synthesize reliable sources with attribution.",
    "prerequisites": [
      "class9-10-writing"
    ],
    "activity": "Develop a short, documented research brief.",
    "sourceId": "ncf-se"
  },
  {
    "id": "class11-12-model",
    "stage": "class11-12",
    "title": "Advanced modelling",
    "subject": "Mathematics",
    "outcome": "Choose and justify a mathematical model appropriate to a studied topic.",
    "prerequisites": [
      "class9-10-linear"
    ],
    "activity": "Build and assess a model using assumptions.",
    "sourceId": "ncf-se"
  },
  {
    "id": "class11-12-inquiry",
    "stage": "class11-12",
    "title": "Disciplined inquiry",
    "subject": "Our world",
    "outcome": "Assess competing explanations using evidence, ethics and uncertainty.",
    "prerequisites": [
      "class9-10-science"
    ],
    "activity": "Evaluate conclusions from multiple sources.",
    "sourceId": "ncf-se"
  }
];
export function validateCurriculum(items: readonly Competency[] = competencies): string[] {
 const issues:string[]=[];
 const ids=new Set<string>();
 const stageIds=new Set<string>(curriculumStages.map(s=>s.id));
 const sourceIds=new Set<string>(curriculumSources.map(s=>s.id));
 for(const item of items){if(ids.has(item.id))issues.push('Duplicate competency: '+item.id); ids.add(item.id);}
 for(const item of items){
  if(!stageIds.has(item.stage)) issues.push('Unknown stage: '+item.id);
  if(!sourceIds.has(item.sourceId)) issues.push('Unknown source: '+item.id);
  if(!item.title.trim()||!item.outcome.trim()||!item.activity.trim())issues.push('Missing content: '+item.id);
  for(const prerequisite of item.prerequisites){if(!ids.has(prerequisite))issues.push('Unknown prerequisite: '+item.id+' -> '+prerequisite);if(prerequisite===item.id)issues.push('Self-dependency: '+item.id);}
 }
 const byId=new Map(items.map(x=>[x.id,x]));
 const visited=new Set<string>();const visiting=new Set<string>();
 function visit(id:string){if(visiting.has(id)){issues.push('Cycle at '+id);return;}if(visited.has(id))return;const item=byId.get(id);if(!item)return;visiting.add(id);for(const prerequisite of item.prerequisites)visit(prerequisite);visiting.delete(id);visited.add(id);}
 for(const item of items)visit(item.id);
 return issues;
}
export function curriculumForStage(stage:string){return competencies.filter(c=>c.stage===stage);}
