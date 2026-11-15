export const enrichmentStages = {
  nursery: 'Preschool / Nursery',
  ukg: 'UKG',
  class4: 'Class 4',
} as const;

export const enrichmentTopics = {
  reasoning: 'Reasoning & Olympiad practice',
  'home-languages': 'Punjabi & Hindi',
  'sikh-heritage': 'Sikh heritage',
  'early-years': 'Early-years play',
} as const;

export type EnrichmentStage = keyof typeof enrichmentStages;
export type EnrichmentTopic = keyof typeof enrichmentTopics;

type Resource = {
  id: string;
  title: string;
  publisher: string;
  sourceLocation: string;
  url: string;
  stages: readonly EnrichmentStage[];
  topic: EnrichmentTopic;
  parentUse: string;
};

export const sourceVerifiedOn = '2026-11-15';

export const supplementaryResources: readonly Resource[] = [
  {
    "id": "ncf-foundational",
    "title": "NCF for the Foundational Stage",
    "publisher": "NCERT",
    "sourceLocation": "2022 framework, sections 1.4.2 and 4.1",
    "url": "https://www.ncert.nic.in/pdf/NCF_for_Foundational_Stage_20_October_2022.pdf",
    "stages": [
      "nursery",
      "ukg"
    ],
    "topic": "early-years",
    "parentUse": "Parent reference for choosing play, conversation, movement and concrete materials."
  },
  {
    "id": "jaadui-pitara",
    "title": "e-Jaadui Pitara",
    "publisher": "NCERT",
    "sourceLocation": "Official resource portal",
    "url": "https://ejaaduipitara.ncert.gov.in/",
    "stages": [
      "nursery",
      "ukg"
    ],
    "topic": "early-years",
    "parentUse": "Choose a story, song or play idea in advance and share it offline. The portal also advertises app and messaging-bot access."
  },
  {
    "id": "sof-class4",
    "title": "Class 4 IMO sample paper",
    "publisher": "Science Olympiad Foundation",
    "sourceLocation": "Organiser’s Class 4 sample-paper landing page",
    "url": "https://sofworld.org/imo/class-4/sample-model-test-papers/imo-sample-papers-class-4",
    "stages": [
      "class4"
    ],
    "topic": "reasoning",
    "parentUse": "Use one sample question to discuss strategies after core maths. The page also links to commercial preparation material."
  },
  {
    "id": "punjab-educare",
    "title": "Primary Punjabi reference",
    "publisher": "Punjab Educare",
    "sourceLocation": "Class 1 Punjabi resource index",
    "url": "https://www.punjabeducare.org/1st-punjabi",
    "stages": [
      "class4"
    ],
    "topic": "home-languages",
    "parentUse": "Use the beginner-level index for Gurmukhi review when needed. A parent should preview linked media and select material at the learner’s reading level."
  },
  {
    "id": "ncert-hindi",
    "title": "Hindi teaching references",
    "publisher": "NCERT",
    "sourceLocation": "Learning Outcomes at the Foundational Stage, teaching-learning references",
    "url": "https://www.ncert.nic.in/pdf/publication/otherpublications/Learning_Outcome_for_the_Foundational_Stage.pdf",
    "stages": [
      "ukg",
      "class4"
    ],
    "topic": "home-languages",
    "parentUse": "The reference lists Sarangi for Classes 1 and 2. Use it to locate beginner reading material for an older learner or read aloud to a younger child."
  },
  {
    "id": "sgpc-langar",
    "title": "Sikh Rehat Maryada",
    "publisher": "Shiromani Gurdwara Parbandhak Committee",
    "sourceLocation": "English edition, article XXI, Voluntary Service and Guru ka Langar",
    "url": "https://publication.sgpc.net/assets/publication_pdf/other_publication_pdf/Sikh_Rehat_Maryada_English.pdf",
    "stages": [
      "nursery",
      "ukg",
      "class4"
    ],
    "topic": "sikh-heritage",
    "parentUse": "Parent reference for explaining langar, service and sharing a meal together."
  }
];

type Activity = {
  id: string;
  title: string;
  stage: EnrichmentStage;
  topic: EnrichmentTopic;
  minutes: number;
  materials: string;
  prompt: string;
  discussion: string;
  referenceId: string;
};

export const enrichmentActivities: readonly Activity[] = [
  {
    "id": "nursery-sort",
    "title": "Sort the laundry",
    "stage": "nursery",
    "topic": "reasoning",
    "minutes": 5,
    "materials": "Pairs of socks and two baskets",
    "prompt": "Sort socks by colour. Which sock could go in this basket? Then sort the same socks by size.",
    "discussion": "A child can point or place a sock to show the rule. Model one match if they need help.",
    "referenceId": "ncf-foundational"
  },
  {
    "id": "ukg-pattern",
    "title": "Hear a repeating pattern",
    "stage": "ukg",
    "topic": "reasoning",
    "minutes": 5,
    "materials": "Hands and a table",
    "prompt": "Clap, tap, tap, clap, tap, tap. What comes next? Take turns inventing and repeating a sound pattern.",
    "discussion": "A clap starts the next group. Repeating the whole group shows more than guessing one sound.",
    "referenceId": "ncf-foundational"
  },
  {
    "id": "class4-constraints",
    "title": "Which number fits every clue?",
    "stage": "class4",
    "topic": "reasoning",
    "minutes": 10,
    "materials": "Paper and pencil",
    "prompt": "Pick from 14, 16, 18 and 20. My number is even, greater than 15 and a multiple of 3. Which is it? Explain how each clue changes the list.",
    "discussion": "18. All four are even. The second clue removes 14. Only 18 among those left is divisible by 3.",
    "referenceId": "sof-class4"
  },
  {
    "id": "class4-arrangements",
    "title": "Find every route",
    "stage": "class4",
    "topic": "reasoning",
    "minutes": 12,
    "materials": "Paper and pencil",
    "prompt": "A walk goes past the library or the park first, then the bridge or the market. How many two-stop walks are possible? Show how you found every walk.",
    "discussion": "Four. List two second stops for each first stop or draw a branching diagram.",
    "referenceId": "sof-class4"
  },
  {
    "id": "class4-remainder",
    "title": "Pack the fruit",
    "stage": "class4",
    "topic": "reasoning",
    "minutes": 10,
    "materials": "Paper and pencil",
    "prompt": "You have 26 guavas. Each box holds six. After filling as many boxes as possible, how many boxes do you need to carry all the guavas? Why?",
    "discussion": "Five boxes. Four full boxes hold 24 guavas. The remaining two need a fifth box.",
    "referenceId": "sof-class4"
  },
  {
    "id": "nursery-punjabi",
    "title": "Water at snack time",
    "stage": "nursery",
    "topic": "home-languages",
    "minutes": 5,
    "materials": "A cup of water",
    "prompt": "Say ਪਾਣੀ (water) during snack time. Offer the cup and invite your child to point, gesture or repeat.",
    "discussion": "Recognising the word or pointing to the cup is enough. Use your family’s natural pronunciation.",
    "referenceId": "ncf-foundational"
  },
  {
    "id": "nursery-hindi",
    "title": "Find the ball",
    "stage": "nursery",
    "topic": "home-languages",
    "minutes": 5,
    "materials": "A large ball",
    "prompt": "Say गेंद (ball) as you roll it. Ask गेंद कहाँ है? and look for it together.",
    "discussion": "Pointing to the ball is a meaningful response. Repeat the word in context.",
    "referenceId": "ncf-foundational"
  },
  {
    "id": "ukg-punjabi",
    "title": "Water and bread",
    "stage": "ukg",
    "topic": "home-languages",
    "minutes": 7,
    "materials": "Paper and crayons",
    "prompt": "Draw water and roti together. Say ਪਾਣੀ and ਰੋਟੀ, then invite your child to match the spoken words to the pictures.",
    "discussion": "Your child may point or say either word. Swap the order of pictures and try again during a real meal.",
    "referenceId": "ncf-foundational"
  },
  {
    "id": "ukg-hindi",
    "title": "Follow a familiar instruction",
    "stage": "ukg",
    "topic": "home-languages",
    "minutes": 7,
    "materials": "A book",
    "prompt": "Say किताब खोलो। (Open the book.) Model it once and then invite your child to act it out.",
    "discussion": "Opening the book shows understanding. Invite your child to give the instruction while you listen.",
    "referenceId": "ncert-hindi"
  },
  {
    "id": "class4-punjabi",
    "title": "Read a familiar Gurmukhi label",
    "stage": "class4",
    "topic": "home-languages",
    "minutes": 10,
    "materials": "Paper and pencil",
    "prompt": "Read ਘਰ (home) and ਪਾਣੀ (water) together. Label two quick sketches and read them back in a different order.",
    "discussion": "The learner matches both labels to meaning and reads them with a fluent family member’s help as needed.",
    "referenceId": "punjab-educare"
  },
  {
    "id": "class4-hindi",
    "title": "Read and retell in Hindi",
    "stage": "class4",
    "topic": "home-languages",
    "minutes": 10,
    "materials": "Paper and pencil",
    "prompt": "Read आज बारिश हुई। हमने घर पर कहानी पढ़ी। Ask आज क्या हुआ? and हमने क्या पढ़ा?",
    "discussion": "बारिश हुई। हमने कहानी पढ़ी। Accept an accurate retell in the learner’s own words.",
    "referenceId": "ncert-hindi"
  },
  {
    "id": "nursery-seva",
    "title": "Help set the table",
    "stage": "nursery",
    "topic": "sikh-heritage",
    "minutes": 5,
    "materials": "Unbreakable cups",
    "prompt": "Put one cup by each seat together. Explain seva as helping and thank your child for helping.",
    "discussion": "Notice one voluntary action, such as offering a cup. Invite participation with no expectation of a spoken answer.",
    "referenceId": "sgpc-langar"
  },
  {
    "id": "ukg-langar",
    "title": "A place for everyone",
    "stage": "ukg",
    "topic": "sikh-heritage",
    "minutes": 8,
    "materials": "Paper place mats and toy figures",
    "prompt": "Set out paper places for three figures. A fourth arrives. How can we welcome them? Explain that people share a meal together in langar.",
    "discussion": "The child makes room, offers a place or explains how to welcome the visitor.",
    "referenceId": "sgpc-langar"
  },
  {
    "id": "class4-langar",
    "title": "Explain a role in langar",
    "stage": "class4",
    "topic": "sikh-heritage",
    "minutes": 12,
    "materials": "Paper and pencil",
    "prompt": "Choose one role in a shared meal, such as welcoming, serving or tidying. Describe how that role helps everyone take part.",
    "discussion": "A specific action and reason are enough, such as making sure each person has a place. A family member can add details from their experience.",
    "referenceId": "sgpc-langar"
  },
  {
    "id": "nursery-story",
    "title": "Retell through movement",
    "stage": "nursery",
    "topic": "early-years",
    "minutes": 7,
    "materials": "A familiar picture book",
    "prompt": "Read a short scene. Invite your child to act out one movement from it and describe what they did.",
    "discussion": "A gesture, word or movement that connects with the story is enough.",
    "referenceId": "jaadui-pitara"
  },
  {
    "id": "ukg-sequence",
    "title": "Tell it in three pictures",
    "stage": "ukg",
    "topic": "early-years",
    "minutes": 10,
    "materials": "Paper and crayons",
    "prompt": "Draw three parts of a familiar routine. Mix up the drawings and invite your child to arrange and explain them.",
    "discussion": "The sequence makes sense and the child can explain one step orally, through drawing or by acting it out.",
    "referenceId": "ncf-foundational"
  }
];

export const earlyYearsScope = {
  nursery: {
    focus: 'Conversation, story and movement, sorting real objects, pretend play and small family routines.',
    support: 'Offer one step at a time. Accept pointing, gesture and home-language speech. End while the child is still comfortable.',
  },
  ukg: {
    focus: 'Oral retelling, everyday vocabulary, playful sound and letter awareness, concrete number sense and explaining one choice.',
    support: 'Begin with objects, pictures and movement. Invite drawing or writing when the child is ready. Observe during play and avoid timed drills.',
  },
};

export function filterEnrichment(stage?: EnrichmentStage, topic?: EnrichmentTopic) {
  const activities = enrichmentActivities.filter(activity =>
    (!stage || activity.stage === stage) && (!topic || activity.topic === topic),
  );
  const references = new Set(activities.map(activity => activity.referenceId));
  const resources = supplementaryResources.filter(resource =>
    ((!stage || resource.stages.includes(stage)) && (!topic || resource.topic === topic)) ||
    references.has(resource.id),
  );
  return { activities, resources };
}
