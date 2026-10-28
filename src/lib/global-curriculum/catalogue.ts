/** Editorially curated ORIGINAL learning objectives, not licensed textbook text or official equivalence claims. */
export const globalFrameworks=[
  {
    "id": "ncert",
    "label": "NCERT / Indian foundation",
    "title": "National Curriculum Framework and ePathshala",
    "url": "https://ncf.ncert.gov.in/",
    "description": "Indian educational backbone",
    "classification": "framework-context"
  },
  {
    "id": "epathshala",
    "label": "NCERT textbook access",
    "title": "Official ePathshala portal",
    "url": "https://epathshala.nic.in/",
    "description": "Open official textbooks externally; do not reproduce books",
    "classification": "external-resource"
  },
  {
    "id": "cambridge",
    "label": "Cambridge Primary",
    "title": "Cambridge Primary curriculum",
    "url": "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-primary/curriculum/",
    "description": "International primary progression and breadth",
    "classification": "framework-context"
  },
  {
    "id": "ib",
    "label": "IB Primary Years Programme",
    "title": "PYP curriculum framework",
    "url": "https://www.ibo.org/programmes/primary-years-programme/",
    "description": "Inquiry, reflection, learner agency",
    "classification": "pedagogy"
  },
  {
    "id": "singapore",
    "label": "Singapore MOE Mathematics",
    "title": "Primary Mathematics 2021 syllabus",
    "url": "https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-dec-2024.pdf",
    "description": "Concrete–pictorial–abstract mathematical reasoning",
    "classification": "framework-context"
  },
  {
    "id": "commoncore",
    "label": "US Common Core",
    "title": "English and mathematics standards",
    "url": "https://corestandards.org/",
    "description": "Literacy and mathematics reference only; not a national US curriculum",
    "classification": "framework-context"
  },
  {
    "id": "original",
    "label": "Original Homeschool OS enrichment",
    "title": "Parent-led original activities",
    "url": "https://ncf.ncert.gov.in/",
    "description": "Locally authored educational suggestions",
    "classification": "original"
  }
] as const;
export type GlobalFrameworkId=typeof globalFrameworks[number]['id'];
export type GlobalSkill={id:string;stage:string;subject:string;title:string;outcome:string;prerequisites:string[];frameworks:string[];activity:string;check:string;domain:string;editorialStatus:'illustrative';sourceMapping:'framework-context-only'};
export const globalSkills:GlobalSkill[]=[
  {
    "id": "early-language",
    "stage": "early",
    "subject": "English",
    "title": "Listen and retell",
    "outcome": "Listen to a short story and retell two events through words, pictures or gestures.",
    "prerequisites": [],
    "frameworks": [
      "ncert",
      "ib"
    ],
    "activity": "Tell a picture story together, then ask what happened first and next.",
    "check": "Offer two event picture cards and invite retelling.",
    "domain": "Storytelling & comprehension",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "early-phonics",
    "stage": "early",
    "subject": "English",
    "title": "Sound and rhyme play",
    "outcome": "Notice rhyming words and initial sounds in familiar spoken words.",
    "prerequisites": [
      "early-language"
    ],
    "frameworks": [
      "ncert",
      "cambridge"
    ],
    "activity": "Clap along to a familiar rhyme and find a word with the same first sound.",
    "check": "Invite three rhyme examples without requiring written spelling.",
    "domain": "Phonological awareness",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "early-numeracy",
    "stage": "early",
    "subject": "Mathematics",
    "title": "Count real groups",
    "outcome": "Match counting words to quantities using supervised everyday objects.",
    "prerequisites": [],
    "frameworks": [
      "ncert",
      "singapore"
    ],
    "activity": "Count safe blocks together while touching each once.",
    "check": "Ask for a group of three and then a group of five.",
    "domain": "Number sense",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "early-pattern",
    "stage": "early",
    "subject": "Mathematics",
    "title": "Notice and extend patterns",
    "outcome": "Extend a repeating pattern of movements, colors or sounds.",
    "prerequisites": [
      "early-numeracy"
    ],
    "frameworks": [
      "ncert",
      "singapore"
    ],
    "activity": "Create a clap-stomp sequence and invite the next action.",
    "check": "Try an ABAB movement pattern.",
    "domain": "Patterns",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "early-nature",
    "stage": "early",
    "subject": "Our world",
    "title": "Nature noticing",
    "outcome": "Observe one change in the local environment and describe it accurately.",
    "prerequisites": [],
    "frameworks": [
      "ncert",
      "ib"
    ],
    "activity": "Look at the sky together and describe something noticed.",
    "check": "Draw a weather observation without forcing a conclusion.",
    "domain": "Observation",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "early-language-pa",
    "stage": "early",
    "subject": "Punjabi & Sikh heritage",
    "title": "Family language",
    "outcome": "Use everyday Punjabi or Hindi words in conversation and storytelling.",
    "prerequisites": [],
    "frameworks": [
      "original"
    ],
    "activity": "Talk about a favorite meal, toy, or family routine in Punjabi.",
    "check": "Tell a short family story and invite a response.",
    "domain": "Home language",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "early-seva",
    "stage": "early",
    "subject": "Punjabi & Sikh heritage",
    "title": "Kindness and seva",
    "outcome": "Participate voluntarily in a simple, safe caring action.",
    "prerequisites": [],
    "frameworks": [
      "original",
      "ib"
    ],
    "activity": "Offer a small age-appropriate helping task.",
    "check": "Reflect gently on how helping felt.",
    "domain": "Ethics",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "primary-reading",
    "stage": "class1-2",
    "subject": "English",
    "title": "Story meaning",
    "outcome": "Retell characters, setting and the order of important events.",
    "prerequisites": [
      "early-language"
    ],
    "frameworks": [
      "ncert",
      "cambridge"
    ],
    "activity": "Read a short illustrated story and draw three key events.",
    "check": "Ask the child to explain the beginning and ending.",
    "domain": "Reading comprehension",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "primary-sentences",
    "stage": "class1-2",
    "subject": "English",
    "title": "Connected sentences",
    "outcome": "Write or dictate two related sentences about a familiar experience.",
    "prerequisites": [
      "primary-reading"
    ],
    "frameworks": [
      "ncert",
      "commoncore"
    ],
    "activity": "Describe a household observation aloud, then write it.",
    "check": "Revise one sentence for meaning and punctuation.",
    "domain": "Writing",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "primary-tens",
    "stage": "class1-2",
    "subject": "Mathematics",
    "title": "Tens and ones",
    "outcome": "Represent two-digit numbers using tens and ones.",
    "prerequisites": [
      "early-numeracy"
    ],
    "frameworks": [
      "ncert",
      "singapore"
    ],
    "activity": "Bundle sticks into groups of ten and compare numbers.",
    "check": "Build and label 34 using tens and ones.",
    "domain": "Place value",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "primary-add",
    "stage": "class1-2",
    "subject": "Mathematics",
    "title": "Add and subtract with models",
    "outcome": "Use objects or diagrams to explain addition and subtraction.",
    "prerequisites": [
      "primary-tens"
    ],
    "frameworks": [
      "ncert",
      "singapore"
    ],
    "activity": "Act out a sharing problem with safe objects.",
    "check": "Explain the operation before calculating.",
    "domain": "Operations",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "primary-plant",
    "stage": "class1-2",
    "subject": "Our world",
    "title": "Plant observation",
    "outcome": "Describe observed plant features and identify possible needs.",
    "prerequisites": [
      "early-nature"
    ],
    "frameworks": [
      "ncert",
      "ib"
    ],
    "activity": "Visit a potted plant, sketch it and plan a follow-up observation.",
    "check": "Distinguish what was seen from what was guessed.",
    "domain": "Science observation",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "prep-reading",
    "stage": "class3-5",
    "subject": "English",
    "title": "Evidence in reading",
    "outcome": "Identify the main idea and supporting details of a short text.",
    "prerequisites": [
      "primary-reading"
    ],
    "frameworks": [
      "ncert",
      "cambridge",
      "commoncore"
    ],
    "activity": "Read an age-appropriate text and highlight two supporting details.",
    "check": "Explain a claim using a detail from the passage.",
    "domain": "Reading for meaning",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "prep-writing",
    "stage": "class3-5",
    "subject": "English",
    "title": "Organized paragraphs",
    "outcome": "Write a focused paragraph with a clear topic and supporting examples.",
    "prerequisites": [
      "primary-sentences"
    ],
    "frameworks": [
      "ncert",
      "cambridge"
    ],
    "activity": "Explain a familiar activity in five connected sentences.",
    "check": "Revise for clarity and sequence.",
    "domain": "Composition",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "prep-multiply",
    "stage": "class3-5",
    "subject": "Mathematics",
    "title": "Multiplication as groups",
    "outcome": "Model multiplication using equal groups or arrays.",
    "prerequisites": [
      "primary-add"
    ],
    "frameworks": [
      "ncert",
      "singapore"
    ],
    "activity": "Build a 6-by-4 array and explain total count.",
    "check": "Show two strategies for 6 × 4.",
    "domain": "Multiplication",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "prep-fractions",
    "stage": "class3-5",
    "subject": "Mathematics",
    "title": "Fractions and equivalence",
    "outcome": "Represent and compare fractions using equal wholes and collections.",
    "prerequisites": [
      "prep-multiply"
    ],
    "frameworks": [
      "ncert",
      "singapore",
      "commoncore"
    ],
    "activity": "Fold two matching strips into halves and quarters.",
    "check": "Explain why 1/2 and 2/4 cover the same amount.",
    "domain": "Fractions",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "prep-data",
    "stage": "class3-5",
    "subject": "Mathematics",
    "title": "Read simple data",
    "outcome": "Create and explain a small table or chart from observed information.",
    "prerequisites": [
      "primary-tens"
    ],
    "frameworks": [
      "ncert",
      "cambridge"
    ],
    "activity": "Make a bar chart of household plant counts or weather observations.",
    "check": "Ask what the chart does and does not show.",
    "domain": "Data literacy",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "prep-inquiry",
    "stage": "class3-5",
    "subject": "Our world",
    "title": "Ask and investigate",
    "outcome": "Ask a testable question and record observations with uncertainty.",
    "prerequisites": [
      "primary-plant"
    ],
    "frameworks": [
      "ncert",
      "ib",
      "cambridge"
    ],
    "activity": "Observe two safe materials and propose a fair comparison.",
    "check": "Write one question, measurement and limitation.",
    "domain": "Scientific inquiry",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "prep-world",
    "stage": "class3-5",
    "subject": "Our world",
    "title": "People and communities",
    "outcome": "Describe a local issue with empathy and evidence.",
    "prerequisites": [
      "early-seva"
    ],
    "frameworks": [
      "ncert",
      "ib"
    ],
    "activity": "Discuss household waste and plan a practical caring response.",
    "check": "Separate observation, opinion and action.",
    "domain": "Global citizenship",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "middle-argument",
    "stage": "class6-8",
    "subject": "English",
    "title": "Claim, evidence and reasoning",
    "outcome": "Support an argument using credible evidence and a counterpoint.",
    "prerequisites": [
      "prep-reading",
      "prep-writing"
    ],
    "frameworks": [
      "cambridge",
      "commoncore",
      "ib"
    ],
    "activity": "Read two brief sources and contrast their claims.",
    "check": "Draft a paragraph with evidence and a limitation.",
    "domain": "Critical literacy",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "middle-ratio",
    "stage": "class6-8",
    "subject": "Mathematics",
    "title": "Ratio and proportion",
    "outcome": "Use equivalent ratios to solve meaningful scaling problems.",
    "prerequisites": [
      "prep-multiply",
      "prep-fractions"
    ],
    "frameworks": [
      "ncert",
      "singapore"
    ],
    "activity": "Scale a fictional recipe and check your calculations.",
    "check": "Show the reasoning with a ratio table.",
    "domain": "Proportional reasoning",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "middle-algebra",
    "stage": "class6-8",
    "subject": "Mathematics",
    "title": "Growing patterns",
    "outcome": "Represent a growing numerical pattern with a variable.",
    "prerequisites": [
      "prep-multiply"
    ],
    "frameworks": [
      "ncert",
      "commoncore"
    ],
    "activity": "Build a tile pattern and describe its rule.",
    "check": "Predict the tenth arrangement and explain why.",
    "domain": "Algebra",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "middle-investigation",
    "stage": "class6-8",
    "subject": "Our world",
    "title": "Fair testing",
    "outcome": "Identify variables and design a controlled observation.",
    "prerequisites": [
      "prep-inquiry"
    ],
    "frameworks": [
      "ncert",
      "cambridge",
      "ib"
    ],
    "activity": "Design a safe seed-growth comparison without inventing results.",
    "check": "List controlled and measured variables.",
    "domain": "Scientific method",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "secondary-analysis",
    "stage": "class9-10",
    "subject": "English",
    "title": "Analytical writing",
    "outcome": "Develop a considered interpretation supported by attributed text evidence.",
    "prerequisites": [
      "middle-argument"
    ],
    "frameworks": [
      "ncert",
      "commoncore"
    ],
    "activity": "Compare two short texts and justify an interpretation.",
    "check": "Give a reasoned critique and cite evidence.",
    "domain": "Analysis",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "secondary-linear",
    "stage": "class9-10",
    "subject": "Mathematics",
    "title": "Linear models",
    "outcome": "Represent and interpret linear relationships through symbols, tables and graphs.",
    "prerequisites": [
      "middle-algebra"
    ],
    "frameworks": [
      "ncert",
      "commoncore"
    ],
    "activity": "Graph two fictional pricing models and interpret the intersection.",
    "check": "Explain the model's assumptions.",
    "domain": "Functions",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "secondary-evidence",
    "stage": "class9-10",
    "subject": "Our world",
    "title": "Scientific claims",
    "outcome": "Evaluate scientific claims with evidence, limitations and alternatives.",
    "prerequisites": [
      "middle-investigation"
    ],
    "frameworks": [
      "ncert",
      "ib"
    ],
    "activity": "Review a small safe experiment for confounding factors.",
    "check": "Write a conclusion and describe uncertainty.",
    "domain": "Evidence evaluation",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "advanced-research",
    "stage": "class11-12",
    "subject": "English",
    "title": "Independent research",
    "outcome": "Develop a focused inquiry supported by attributed, credible sources.",
    "prerequisites": [
      "secondary-analysis"
    ],
    "frameworks": [
      "ncert",
      "ib"
    ],
    "activity": "Plan a short research brief with a source log.",
    "check": "Compare the strengths of two sources.",
    "domain": "Research literacy",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "advanced-model",
    "stage": "class11-12",
    "subject": "Mathematics",
    "title": "Model assumptions",
    "outcome": "Select a mathematical model and evaluate its assumptions.",
    "prerequisites": [
      "secondary-linear"
    ],
    "frameworks": [
      "ncert",
      "commoncore"
    ],
    "activity": "Explore a fictional dataset and test a prediction.",
    "check": "Explain one likely model limitation.",
    "domain": "Applied mathematics",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  },
  {
    "id": "advanced-inquiry",
    "stage": "class11-12",
    "subject": "Our world",
    "title": "Synthesis and uncertainty",
    "outcome": "Synthesize competing explanations while stating uncertainty and ethical considerations.",
    "prerequisites": [
      "secondary-evidence"
    ],
    "frameworks": [
      "ncert",
      "ib"
    ],
    "activity": "Compare two carefully chosen perspectives about an environmental issue.",
    "check": "Identify missing evidence and another viewpoint.",
    "domain": "Independent inquiry",
    "editorialStatus": "illustrative",
    "sourceMapping": "framework-context-only"
  }
];
export const globalStages=[{id:'early',name:'Early years'},{id:'class1-2',name:'Classes 1–2'},{id:'class3-5',name:'Classes 3–5'},{id:'class6-8',name:'Classes 6–8'},{id:'class9-10',name:'Classes 9–10'},{id:'class11-12',name:'Classes 11–12'}] as const;
export const globalSubjects=['English','Mathematics','Our world','Punjabi & Sikh heritage'] as const;
export function globalSkillById(id:string){return globalSkills.find(x=>x.id===id);}
export function selectGlobalSkills(filters:{stage?:string;subject?:string;framework?:string;query?:string}){
 const q=(filters.query||'').trim().toLowerCase();
 return globalSkills.filter(x=>(!filters.stage||x.stage===filters.stage)&&(!filters.subject||x.subject===filters.subject)&&(!filters.framework||x.frameworks.includes(filters.framework))&&(!q||[x.title,x.outcome,x.domain,x.subject].some(y=>y.toLowerCase().includes(q))));
}
export function validateGlobalSkills(){
 const errors:string[]=[];const ids=new Set(globalSkills.map(x=>x.id)),frameworkIds=new Set<string>(globalFrameworks.map(x=>x.id)),stages=new Set<string>(globalStages.map(x=>x.id));
 if(ids.size!==globalSkills.length)errors.push('Duplicate skills');
 for(const x of globalSkills){
  if(!stages.has(x.stage))errors.push('Unknown stage '+x.id);
  if(!x.title||!x.outcome||!x.activity||!x.check)errors.push('Missing content '+x.id);
  for(const p of x.prerequisites)if(!ids.has(p)||p===x.id)errors.push('Broken prerequisite '+x.id+':'+p);
  for(const f of x.frameworks)if(!frameworkIds.has(f))errors.push('Broken framework '+x.id+':'+f);
 }
 const graph=new Map(globalSkills.map(x=>[x.id,x.prerequisites]));const visiting=new Set<string>(),done=new Set<string>();
 function visit(id:string){if(visiting.has(id)){errors.push('Circular prerequisite '+id);return;}if(done.has(id))return;visiting.add(id);for(const p of graph.get(id)||[])if(graph.has(p))visit(p);visiting.delete(id);done.add(id);}
 for(const x of globalSkills)visit(x.id);
 return errors;
}
