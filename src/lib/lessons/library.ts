/** Original parent-reviewed lesson exemplars. No copyrighted worksheets or fabricated NCERT outcome codes. */
export type LessonStage = 'early' | 'class1-2' | 'class3-5' | 'class6-8' | 'class9-10' | 'class11-12';
export type LessonSubject = 'English' | 'Mathematics' | 'Our world' | 'Punjabi & Sikh heritage';
export type Lesson = {
 id:string;title:string;stage:LessonStage;subject:LessonSubject;minutes:number;
 objective:string;materials:string;overview:string;steps:string[];questions:string[];
 worksheet:string;adaptation:string;
};
export const lessonStages = [
  {
    "id": "early",
    "label": "Nursery–UKG"
  },
  {
    "id": "class1-2",
    "label": "Classes 1–2"
  },
  {
    "id": "class3-5",
    "label": "Classes 3–5"
  },
  {
    "id": "class6-8",
    "label": "Classes 6–8"
  },
  {
    "id": "class9-10",
    "label": "Classes 9–10"
  },
  {
    "id": "class11-12",
    "label": "Classes 11–12"
  }
] as const;
export const lessons:Lesson[] = [
  {
    "id": "story-sequence",
    "title": "Picture Story Sequencing",
    "stage": "early",
    "subject": "English",
    "minutes": 15,
    "objective": "Arrange story events in order",
    "materials": "Picture book, three small blank cards",
    "overview": "Read a short book aloud and invite the learner to name or draw the beginning, middle and end.",
    "steps": [
      "Read aloud and pause for predictions",
      "Offer three event cards to arrange",
      "Retell the story using gestures or words"
    ],
    "questions": [
      "What happened first? What surprised you?"
    ],
    "worksheet": "Draw three scenes: beginning, middle, and end.",
    "adaptation": "For younger learners, choose two pictures and retell together."
  },
  {
    "id": "sound-hunt",
    "title": "Home Sound Hunt",
    "stage": "early",
    "subject": "English",
    "minutes": 10,
    "objective": "Notice and play with beginning sounds",
    "materials": "Safe household objects",
    "overview": "Compare the first sounds of familiar everyday words without formal testing.",
    "steps": [
      "Say a familiar word slowly",
      "Find another word that starts similarly",
      "Make a silly rhyme together"
    ],
    "questions": [
      "Which words sound alike at the beginning?"
    ],
    "worksheet": "Write or draw three things with a sound you like.",
    "adaptation": "Speech and rhymes can replace letter writing."
  },
  {
    "id": "sorting-basket",
    "title": "Sorting Basket",
    "stage": "early",
    "subject": "Mathematics",
    "minutes": 15,
    "objective": "Sort objects and explain one visible property",
    "materials": "Safe blocks, leaves, bowls",
    "overview": "Sort everyday objects by shape, colour or size, then explain the choices.",
    "steps": [
      "Offer a small safe selection of objects",
      "Sort together by one property",
      "Mix and resort using another property"
    ],
    "questions": [
      "How did you decide what belongs together?"
    ],
    "worksheet": "Draw two groups of sorted objects.",
    "adaptation": "For toddlers, supervise closely and avoid small choking hazards."
  },
  {
    "id": "count-and-move",
    "title": "Count and Move",
    "stage": "early",
    "subject": "Mathematics",
    "minutes": 10,
    "objective": "Match counting words to movements and small groups",
    "materials": "Open floor space",
    "overview": "Count claps, steps and objects while moving at a comfortable pace.",
    "steps": [
      "Count three slow claps",
      "Match the number to three steps",
      "Try a new group of safe objects"
    ],
    "questions": [
      "How many did we count? How do you know?"
    ],
    "worksheet": "Draw the objects you counted.",
    "adaptation": "Keep groups small and invite the learner to stop when tired."
  },
  {
    "id": "weather-diary",
    "title": "Weather Watch",
    "stage": "early",
    "subject": "Our world",
    "minutes": 15,
    "objective": "Notice and describe local weather changes",
    "materials": "Paper, coloured pencils, window view",
    "overview": "Look outside, describe the sky and compare it with an earlier day.",
    "steps": [
      "Observe the sky safely",
      "Choose two descriptive words",
      "Draw the sky or clouds"
    ],
    "questions": [
      "What changed since yesterday?"
    ],
    "worksheet": "Draw the sky and circle a weather word.",
    "adaptation": "Use conversation instead of writing for younger learners."
  },
  {
    "id": "kindness-circle",
    "title": "Kindness and Seva",
    "stage": "early",
    "subject": "Punjabi & Sikh heritage",
    "minutes": 10,
    "objective": "Recognise kindness through a small voluntary action",
    "materials": "A short family story, household tidying task",
    "overview": "Discuss helping others and choose a small age-appropriate act of seva.",
    "steps": [
      "Share a sourced age-appropriate story about helping",
      "Ask what the people felt",
      "Offer a small choice of helping action"
    ],
    "questions": [
      "How did you feel when you helped?"
    ],
    "worksheet": "Draw an example of helping someone.",
    "adaptation": "Avoid invented Gurbani quotations; choose a verified source if quoting."
  },
  {
    "id": "tens-bundles",
    "title": "Bundles of Ten",
    "stage": "class1-2",
    "subject": "Mathematics",
    "minutes": 20,
    "objective": "Model two-digit numbers as tens and ones",
    "materials": "40 sticks, rubber bands, paper",
    "overview": "Build numbers with groups of ten and leftovers, then compare them.",
    "steps": [
      "Bundle ten sticks together",
      "Represent two two-digit numbers",
      "Explain which has more tens and ones"
    ],
    "questions": [
      "Why is 34 more than 29?"
    ],
    "worksheet": "Draw tens and ones for 24, 31 and 46.",
    "adaptation": "Use smaller numbers or base-ten blocks when needed."
  },
  {
    "id": "plant-observer",
    "title": "Plant Observer",
    "stage": "class1-2",
    "subject": "Our world",
    "minutes": 15,
    "objective": "Describe plant needs through careful observation",
    "materials": "Potted plant, notebook",
    "overview": "Observe a plant without making claims from a single observation.",
    "steps": [
      "Look at the plant without disturbing it",
      "Sketch the leaves and soil",
      "Plan when to observe again"
    ],
    "questions": [
      "What do plants need? What did we actually notice?"
    ],
    "worksheet": "Draw a plant and label what you can see.",
    "adaptation": "Observe a real plant; do not assume a growth result."
  },
  {
    "id": "story-map",
    "title": "Story Map",
    "stage": "class1-2",
    "subject": "English",
    "minutes": 20,
    "objective": "Retell a story with characters, setting and events",
    "materials": "Age-appropriate short story",
    "overview": "Find characters, setting and key events in a short story.",
    "steps": [
      "Read or listen together",
      "Identify where it takes place",
      "Make three notes about the events"
    ],
    "questions": [
      "Why did the character make that choice?"
    ],
    "worksheet": "Make a story map: who, where, first, next, last.",
    "adaptation": "Allow oral answers before written sentences."
  },
  {
    "id": "fraction-fold",
    "title": "Paper Fraction Lab",
    "stage": "class3-5",
    "subject": "Mathematics",
    "minutes": 20,
    "objective": "Represent and compare simple unit fractions",
    "materials": "Paper strips, pencil, ruler",
    "overview": "Use equal folds to compare the size of fractional parts.",
    "steps": [
      "Fold strips into equal halves",
      "Fold a strip into quarters",
      "Compare equal whole strips and explain"
    ],
    "questions": [
      "Why is one quarter smaller than one half?"
    ],
    "worksheet": "Draw and label halves, quarters and eighths.",
    "adaptation": "Focus on equal-sized wholes, not rote rules."
  },
  {
    "id": "paragraph-draft",
    "title": "Write and Improve a Paragraph",
    "stage": "class3-5",
    "subject": "English",
    "minutes": 20,
    "objective": "Write a paragraph with topic and supporting details",
    "materials": "Notebook, pencil",
    "overview": "Draft a short explanation about a familiar activity and revise it.",
    "steps": [
      "Say the topic aloud",
      "Write a first draft with examples",
      "Read it back and improve one sentence"
    ],
    "questions": [
      "Does each sentence help explain the topic?"
    ],
    "worksheet": "Write five sentences on one topic; underline the main idea.",
    "adaptation": "Use speech-to-text with an adult if handwriting is a barrier."
  },
  {
    "id": "measurement-walk",
    "title": "Measurement Walk",
    "stage": "class3-5",
    "subject": "Mathematics",
    "minutes": 20,
    "objective": "Estimate and measure lengths using suitable units",
    "materials": "Ruler or tape measure",
    "overview": "Predict and measure household object lengths.",
    "steps": [
      "Estimate the length of two objects",
      "Measure in cm",
      "Compare predictions and results"
    ],
    "questions": [
      "Why are measurements different from estimates?"
    ],
    "worksheet": "Record an estimate, measured value, and difference.",
    "adaptation": "Do not use sharp or hazardous objects."
  },
  {
    "id": "question-and-evidence",
    "title": "Question and Evidence",
    "stage": "class3-5",
    "subject": "Our world",
    "minutes": 25,
    "objective": "Ask an observable question and record evidence",
    "materials": "Two safe household items, chart paper",
    "overview": "Plan a small fair observation using a specific question.",
    "steps": [
      "Ask a question that can be observed",
      "Decide what will be recorded",
      "Make a table and note results"
    ],
    "questions": [
      "What did we observe? What do we still not know?"
    ],
    "worksheet": "Write your question, evidence and one uncertainty.",
    "adaptation": "Never claim a scientific conclusion without observation."
  },
  {
    "id": "ratio-recipe",
    "title": "Ratio Recipe",
    "stage": "class6-8",
    "subject": "Mathematics",
    "minutes": 25,
    "objective": "Use equivalent ratios to scale quantities",
    "materials": "A safe uncooked snack recipe",
    "overview": "Scale a familiar recipe and explain why proportions are preserved.",
    "steps": [
      "Write ingredients for two portions",
      "Double each quantity",
      "Check a different portion size"
    ],
    "questions": [
      "Which changes keep the taste similar?"
    ],
    "worksheet": "Show a ratio table for 2, 4 and 6 portions.",
    "adaptation": "Use imaginary ingredients when food allergies are unknown."
  },
  {
    "id": "claim-evidence",
    "title": "Claim and Evidence",
    "stage": "class6-8",
    "subject": "English",
    "minutes": 25,
    "objective": "Separate claims from evidence and reasons",
    "materials": "Two short age-appropriate articles",
    "overview": "Compare how two sources support a claim.",
    "steps": [
      "Identify a claim in each text",
      "Underline factual evidence",
      "Explain whether the evidence supports the claim"
    ],
    "questions": [
      "What would change your mind?"
    ],
    "worksheet": "Write a claim with two supporting reasons and one unanswered question.",
    "adaptation": "Avoid presenting disputed claims as established facts."
  },
  {
    "id": "fair-test",
    "title": "Design a Fair Test",
    "stage": "class6-8",
    "subject": "Our world",
    "minutes": 25,
    "objective": "Identify variables and design a fair observation",
    "materials": "Paper, pencil, safe objects",
    "overview": "Design a test before collecting evidence.",
    "steps": [
      "Write an observable question",
      "Choose one variable to change",
      "List what stays the same and what is measured"
    ],
    "questions": [
      "What could make the test unfair?"
    ],
    "worksheet": "Complete a hypothesis and variable table.",
    "adaptation": "Do not conduct dangerous experiments."
  },
  {
    "id": "linear-costs",
    "title": "Compare Two Cost Plans",
    "stage": "class9-10",
    "subject": "Mathematics",
    "minutes": 30,
    "objective": "Model and interpret two linear cost relationships",
    "materials": "Paper, pencil, calculator if useful",
    "overview": "Compare fictional pricing plans using equations and a graph.",
    "steps": [
      "Write costs as expressions",
      "Make a table for several quantities",
      "Find the crossover point and interpret it"
    ],
    "questions": [
      "When is each plan cheaper and why?"
    ],
    "worksheet": "Show a graph and explain the intersection.",
    "adaptation": "Use fictional numbers only; no personal financial data."
  },
  {
    "id": "source-critique",
    "title": "Evaluate a Source",
    "stage": "class9-10",
    "subject": "English",
    "minutes": 25,
    "objective": "Evaluate reliability and distinguish fact from interpretation",
    "materials": "Two short cited texts",
    "overview": "Evaluate evidence, attribution and gaps in a published claim.",
    "steps": [
      "Identify the main claim",
      "Trace cited evidence",
      "Write a short limitation or alternative view"
    ],
    "questions": [
      "Which evidence is missing?"
    ],
    "worksheet": "Write a paragraph evaluating the evidence.",
    "adaptation": "Avoid copying copyrighted passages."
  },
  {
    "id": "research-brief",
    "title": "Mini Research Brief",
    "stage": "class11-12",
    "subject": "English",
    "minutes": 35,
    "objective": "Form a focused question and synthesise attributed evidence",
    "materials": "Access to suitable library sources",
    "overview": "Plan a short research brief with distinct claims, evidence and uncertainty.",
    "steps": [
      "Define a narrow question",
      "Find two credible sources",
      "Draft a sourced synthesis with limitations"
    ],
    "questions": [
      "What evidence is strongest and what remains uncertain?"
    ],
    "worksheet": "Complete a research outline with citations.",
    "adaptation": "Use citation practice; never invent source details."
  },
  {
    "id": "model-assumptions",
    "title": "Model and Assumptions",
    "stage": "class11-12",
    "subject": "Mathematics",
    "minutes": 35,
    "objective": "Choose a model and evaluate assumptions",
    "materials": "Notebook, self-selected fictional dataset",
    "overview": "Build a model for a small fictional dataset and test its limitations.",
    "steps": [
      "Identify a relationship",
      "Choose a suitable model",
      "Test a sample prediction against the data"
    ],
    "questions": [
      "Which assumptions may fail?"
    ],
    "worksheet": "Describe your model, assumptions and a limitation.",
    "adaptation": "Avoid extrapolating beyond the data without qualification."
  }
];
export function lessonById(id:string):Lesson|undefined{return lessons.find(lesson=>lesson.id===id);}
export function filterLessons(stage?:string,subject?:string,query=''):Lesson[]{
 const q=query.trim().toLocaleLowerCase('en');
 return lessons.filter(l=>(!stage||l.stage===stage)&&(!subject||l.subject===subject)&&(!q||[l.title,l.objective,l.overview,l.materials].some(v=>v.toLocaleLowerCase('en').includes(q))));
}
export function validateLessons():string[]{
 const errors:string[]=[];const ids=new Set<string>();
 for(const lesson of lessons){
  if(ids.has(lesson.id))errors.push('Duplicate ID '+lesson.id);ids.add(lesson.id);
  if(!/^[a-z0-9-]+$/.test(lesson.id))errors.push('Invalid ID '+lesson.id);
  if(!lessonStages.some(stage=>stage.id===lesson.stage))errors.push('Unknown stage '+lesson.id);
  if(lesson.minutes<1||lesson.minutes>60)errors.push('Invalid duration '+lesson.id);
  if(!lesson.objective||!lesson.materials||!lesson.steps.length||!lesson.worksheet||!lesson.questions.length)errors.push('Incomplete lesson '+lesson.id);
 }
 return errors;
}
