/**
 * Original 36-week Class 4 enrichment pathway (Ishwin). These are complete
 * parent-taught lessons with worked examples, expected answers, adaptations
 * and assessment guidance. They are ORIGINAL HomeSchool OS content.
 *
 * They sit alongside — never inside — the separately indexed official NCERT
 * Class 4 books (Maths Mela, Santoor, Veena, Our Wondrous World). Chapter
 * titles in src/lib/ncert/textbooks.ts are publisher-verified metadata only;
 * no chapter-to-lesson alignment is claimed here and no textbook text is copied.
 */
import { focus, unit, type GradeDefinition } from './model';

const readingSteps = [
  'Read the short passage aloud once while your child follows; do not explain it yet.',
  'Work the example together, saying your reasoning out loud: {example}',
  'Ask your child to try independently: {exercise}',
  'Discuss {question} and ask for evidence from the passage, not from memory alone.',
  'Compare with {expected} and let your child correct their own answer in a different colour.',
];
const writingSteps = [
  'Agree the purpose and the reader before anyone writes a word.',
  'Show the worked example and name the two choices that make it work: {example}',
  'Give your child the short task: {exercise}',
  'Ask {question} while they reread their own draft aloud.',
  'Check against {expected} and revise exactly one sentence together.',
];
const mathsSteps = [
  'Put out the concrete materials first and agree what one unit represents.',
  'Model the worked example slowly, writing each step: {example}',
  'Hand over the task: {exercise}',
  'Ask {question} before giving any hint, and request an explanation of the method.',
  'Compare with {expected}; if there is a mismatch, find the first step where the reasoning changed.',
];
const inquirySteps = [
  'State the question and the one thing you will change; agree a safety boundary.',
  'Demonstrate the observation or worked example: {example}',
  'Let your child carry out the task: {exercise}',
  'Ask {question} and record their prediction separately from what was observed.',
  'Compare with {expected} and name one thing the evidence does not yet prove.',
];
const reasoningSteps = [
  'Lay out the information in a table or diagram before solving anything.',
  'Work one example aloud and underline the decisive clue: {example}',
  'Set the independent task: {exercise}',
  'Ask {question} and require a reason, not just an answer.',
  'Check against {expected} and discuss one alternative approach.',
];
const languageSteps = [
  'Confirm the exact pronunciation and meaning with a fluent family member first.',
  'Model the worked example in context: {example}',
  'Invite your child to try: {exercise}',
  'Ask {question} and accept a spoken attempt before any correction.',
  'Compare with {expected} and end with one real sentence they can use at home.',
];
const creativeSteps = [
  'Offer a small set of materials and agree one clear purpose for the work.',
  'Show one possibility without making a model to copy: {example}',
  'Set the task: {exercise}',
  'Ask {question} about a choice they made, not about neatness.',
  'Compare with {expected} and let them present the result in two sentences.',
];
const questions = ['{question}', 'Can you explain why {topic} works, using evidence from today’s example?'];
const common = {
  easier: 'Reduce the numbers or the length of the passage, keep concrete materials visible, and solve the first part together before handing over.',
  harder: 'Add one unfamiliar example of {topic}, remove the worked example from view, and ask for a written explanation of the method.',
  criteria: 'The learner attempts the task independently, gives a reason or evidence for the answer, and can correct one error with support. A correct guess without an explanation is not yet mastery.',
  revision: 'Two days later, repeat {topic} with new numbers or a new passage and no worked example. If the explanation is still shaky, mark the original session for revision in the dashboard instead of moving ahead.',
};

export const class4Grade: GradeDefinition = {
  key: 'class4', grade: 'Class 4', label: 'Class 4 · reasoning, explanation and independent work',
  description: 'Thirty-six weeks of fully worked lessons across English reading and writing, mathematics, science inquiry, social studies and general knowledge, reasoning, Hindi, Punjabi and Sikh heritage, and creative communication.',
  provenance: 'Original HomeSchool OS parent-taught lessons. NCERT/CBSE Class 4 books are indexed separately as external, publisher-verified metadata (Maths Mela, Santoor, Veena, Our Wondrous World) and are NOT reproduced or mapped here. Inquiry prompts and explanation-before-answer practice are used as general pedagogical lenses inspired by international primary frameworks; no Cambridge, IB, Singapore or Common Core alignment or accreditation is claimed.',
  milestones: [
    'Term 1 · Explains the method: the learner supports a reading answer with evidence, explains a written calculation and revises one sentence.',
    'Term 2 · Works independently: the learner models fractions and measurement, separates prediction from observation and solves a reasoning puzzle with a stated rule.',
    'Term 3 · Transfers learning: the learner applies a method to a new example, presents a short piece of work and reflects honestly on one error.',
  ],
  units: [
    unit({
      id: 'reading-comprehension', subject: 'English', strand: 'Main idea, inference and evidence', minutes: 20, mode: 'guided',
      objective: 'Find a main idea, infer a word meaning and support an answer with evidence from a short passage',
      materials: 'A4 paper or notebook, pencil, two short self-written paragraphs, two coloured pencils',
      prep: 'Write two five-sentence paragraphs yourself on familiar topics. Keep them short enough to reread twice.',
      steps: readingSteps, questions, ...common,
      focuses: [
        focus('Find the main idea with two clues', 'Read: "Bees move between flowers. They carry pollen as they feed. Later the flowers form seeds." Underline "carry pollen" and "form seeds"; the main idea is "bees help flowers make seeds".', 'Which sentence best states the main idea, and which two words support it?', 'Bees help flowers make seeds; "pollen" and "seeds" are the supporting clues.', 'Give your child a five-sentence paragraph and ask for a one-sentence main idea plus two underlined clues.', 'Expected: one accurate main idea and two underlined pieces of evidence. A retelling of one detail is not yet a main idea.'),
        focus('Infer a word from nearby sentences', 'Read: "The path was arid; no rain had fallen for weeks and the soil cracked." Ask what arid means: the clues "no rain" and "cracked soil" give "very dry".', 'What does arid most likely mean here, and which clues tell you?', 'Arid means very dry; "no rain" and "cracked soil" are the clues.', 'Offer one unfamiliar word in a self-written sentence with two context clues and ask for a meaning plus evidence.', 'Expected: a sensible meaning with at least one cited clue. Accept a near synonym.'),
        focus('Compare two characters’ choices', 'Read a short self-written story: "Asha waited for her turn; Ravi pushed ahead." Ask who considered others and quote the words that show it.', 'Which character considered others, and what words prove it?', 'Asha, because "waited for her turn" shows consideration.', 'Write two contrasting actions in a short story and ask for a comparison with one quoted phrase.', 'Expected: a comparison supported by a quoted phrase, not just a liking.'),
        focus('Distinguish fact from opinion', 'Show "The bus arrived at 8:10" (checkable fact) and "The bus ride was boring" (opinion). Ask which could be verified and how.', 'Which sentence can be checked, and what would you check?', 'The arrival time is checkable against a timetable or clock; "boring" is a personal opinion.', 'Give four mixed sentences and ask your child to sort them into fact and opinion.', 'Expected: correct sorting with one explanation of how a fact could be verified.'),
      ],
    }),
    unit({
      id: 'writing-workshop', subject: 'English', strand: 'Paragraphs, letters and revision', minutes: 20, mode: 'guided',
      objective: 'Plan, draft and revise a short purposeful piece of writing with a clear reader in mind',
      materials: 'Notebook, pencil, two coloured pens, a sample envelope or letter layout',
      prep: 'Agree a real reader (a grandparent, a friend). Real purpose improves writing more than a pretend task.',
      steps: writingSteps, questions, ...common,
      focuses: [
        focus('Topic sentence and three details', 'Model: "Our balcony garden needs four things." Then add "sunlight, water, soil and patience" as three or four supporting details.', 'Which sentence tells the reader what the whole paragraph is about?', 'The topic sentence about the four things the garden needs.', 'Ask for a five-sentence paragraph with one topic sentence and three supporting details.', 'Expected: a clear opening sentence plus three on-topic details; underline the topic sentence.'),
        focus('Revise one weak sentence', 'Draft: "It was good." Improve it to "The warm roti tasted better than the shop bread" by adding a specific noun and detail.', 'What did the revision add that the first sentence lacked?', 'Specific detail: what was warm, and what it tasted better than.', 'Give one vague sentence and ask your child to rewrite it with two concrete details.', 'Expected: a revised sentence with specific nouns or sensory detail, and an explanation of the change.'),
        focus('Write a friendly letter', 'Lay out: "Dear Nani ji, / I wanted to tell you about… / Last week we… / With love, …" and explain why each part is there.', 'Why do we include a greeting and a closing in a letter?', 'They tell the reader who the letter is for and who it is from.', 'Write a six-line friendly letter to a real family member with greeting, body and closing.', 'Expected: all three parts present and a clear purpose in the body.'),
        focus('Write a short explanation', 'Model: "First soak the seeds, then place them on damp cloth, so they have water without being covered."', 'Which words show the order, and which words give the reason?', '"First" and "then" show order; "so they have water" gives the reason.', 'Ask for a four-sentence explanation of a familiar process with order and reason words.', 'Expected: at least two order words and one reason clause, in a sensible sequence.'),
      ],
    }),
    unit({
      id: 'number-operations', subject: 'Mathematics', strand: 'Place value, multiplication and division', minutes: 20, mode: 'guided',
      objective: 'Explain multi-digit arithmetic using place value, equal groups and an estimate before calculating',
      materials: 'Counters or dried beans, paper, pencil, a ruler for drawing arrays',
      prep: 'Use fictional household numbers only. Keep a scrap sheet for estimates so they can be compared afterwards.',
      steps: mathsSteps, questions, ...common,
      focuses: [
        focus('Regroup 248 plus 176', 'Estimate 250 + 180 = 430. Then add: 8 + 6 = 14, write 4 carry 1 ten; 4 + 7 + 1 = 12 tens, write 2 carry 1 hundred; 2 + 1 + 1 = 4 hundreds. Answer 424, close to the estimate.', 'Why is the answer 424 and not 414?', 'The 14 ones regroup to 1 ten and 4 ones, so the tens column gains one.', 'Ask your child to solve 248 + 176 with counters and write each regrouping step.', 'Expected: 424 with the carried ten explained; an estimate near 430 checked at the end.'),
        focus('Multiplication as equal groups', 'Draw 4 rows of 6 dots: 6 + 6 + 6 + 6 = 24, so 4 × 6 = 24. Turn the array sideways to show 6 × 4 = 24.', 'Why does 4 × 6 give the same total as 6 × 4?', 'Both count the same 24 dots; only the grouping direction changes.', 'Ask for an array for 3 × 7 and a matching repeated addition sentence.', 'Expected: 21 dots with 7 + 7 + 7 and an explanation of the equal groups.'),
        focus('Divide 28 into 4 equal shares', 'Deal 28 counters one at a time into 4 plates: each plate gets 7, so 28 ÷ 4 = 7. Check: 4 × 7 = 28.', 'How can multiplication check a division answer?', 'Multiply the quotient by the divisor; 7 × 4 must return 28.', 'Share 28 counters into 4 groups and verify with a multiplication sentence.', 'Expected: 7 in each group and the inverse multiplication 4 × 7 = 28.'),
        focus('Estimate before subtracting', 'For 512 − 289, estimate 510 − 290 = 220. Exact: 512 − 289 = 223, so 220 was sensible.', 'Was the estimate close enough to trust the exact answer?', 'Yes, 220 is within 3 of 223; a far-off answer would signal an error.', 'Estimate and then solve 512 − 289, comparing both answers.', 'Expected: an estimate near 220, exact 223, and a sentence saying whether they agree.'),
      ],
    }),
    unit({
      id: 'fractions-measurement', subject: 'Mathematics', strand: 'Fractions, length and data', minutes: 20, mode: 'guided',
      objective: 'Model equal fractions, measure in standard units and read a small data display',
      materials: 'Paper circles and strips, a 30 cm ruler, three household objects, graph paper',
      prep: 'Cut equal-size paper circles in advance; unequal wholes make fraction comparisons misleading.',
      steps: mathsSteps, questions, ...common,
      focuses: [
        focus('Compare one half and one quarter', 'Fold two same-size circles: one into 2 equal parts, one into 4. One half covers two quarters, so 1/2 is larger than 1/4.', 'Why is one quarter smaller than one half when the circles are the same size?', 'The same whole is split into more equal pieces, so each piece is smaller.', 'Fold equal circles and ask which is larger, 1/2 or 1/4, with a reason.', 'Expected: 1/2 > 1/4 with the same-whole explanation, not "because 4 is bigger than 2".'),
        focus('Find three quarters of 20', 'One quarter of 20 is 5 because 20 ÷ 4 = 5; three quarters is 3 × 5 = 15.', 'What is three quarters of 20, and how did you get it?', '15, by dividing by 4 then multiplying by 3.', 'Use 20 counters to find 3/4 of the set and write the two steps.', 'Expected: 15 counters with the division-then-multiplication method explained.'),
        focus('Estimate then measure in centimetres', 'Estimate a pencil at 15 cm; measure from 0 to 14 cm, so the difference is 1 cm. Note that starting at the ruler’s edge, not 1, matters.', 'Why must the object start at zero on the ruler?', 'Otherwise every reading is shifted by that starting mark.', 'Estimate and measure three household objects, recording estimate, actual and difference.', 'Expected: three rows of data and one sentence about the largest difference.'),
        focus('Read a small bar chart', 'Survey four family members: 2 prefer mango, 3 banana, 1 apple, 2 grapes. Draw bars and ask which has the most.', 'Which fruit was chosen most, and how many more than the least?', 'Banana with 3; two more than apple with 1.', 'Collect four fictional or family responses and draw a bar chart with one comparison sentence.', 'Expected: correctly scaled bars and a difference statement such as "2 more".'),
      ],
    }),
    unit({
      id: 'science-inquiry', subject: 'Science & EVS', strand: 'Fair observation, materials and living things', minutes: 20, mode: 'guided',
      objective: 'Separate prediction from observation, change one variable and describe evidence honestly',
      materials: 'Two identical cups, water, a spoon, paper, a leafy plant, a notebook',
      prep: 'Choose safe, quick observations. No heat, chemicals, glass or unsupervised water experiments.',
      steps: inquirySteps, questions, ...common,
      focuses: [
        focus('Prediction is not a result', 'Ask "which cup will cool first?" and write the prediction. After ten minutes, record what actually happened in a separate column.', 'Which sentence was a prediction and which was an observation?', 'The "will cool first" sentence is a prediction; the measured or felt result is an observation.', 'Set up two cups of warm water, one with a lid, and keep prediction and observation columns.', 'Expected: two clearly separated statements and no claim beyond what was noticed.'),
        focus('Change only one thing', 'Two plants: give both the same pot and light, but water only one. Ask what is kept the same and what is changed.', 'Why must the pots and light stay the same?', 'So any difference can reasonably be linked to the water, the one changed factor.', 'Plan a plant observation with one changed factor and list three things kept the same.', 'Expected: one changed factor, three controlled factors, and a reason for the control.'),
        focus('Sort materials by an observable property', 'Test paper, a metal spoon and cloth for "bends easily" and "soaks water" using a drop of water on each.', 'Which property would you use to sort these three, and what is your evidence?', 'Any observable property with a recorded result, e.g. cloth soaks water, metal does not.', 'Sort three safe materials by one chosen property and record a result for each.', 'Expected: a consistent rule plus one observed result per material, not a guess.'),
        focus('Record change over three days', 'Sketch one leaf on day 1 with date and two describing words; repeat on day 3 and compare the drawings.', 'What actually changed between the two drawings?', 'Only the differences visible in your two dated drawings.', 'Observe one plant on two days and write one sentence about a real change.', 'Expected: two dated records and one evidence-based comparison; "no visible change" is valid.'),
      ],
    }),
    unit({
      id: 'social-world', subject: 'Social studies & general knowledge', strand: 'Maps, communities and everyday economics', minutes: 20, mode: 'guided',
      objective: 'Read a simple map, understand local services and make a reasoned choice within a budget',
      materials: 'A hand-drawn neighbourhood map, paper, pencil, fictional price list',
      prep: 'Draw a simple map with home, park, shop, clinic and school. Use fictional prices only.',
      steps: inquirySteps, questions, ...common,
      focuses: [
        focus('Use a map key and direction', 'Draw four symbols with a key. Say "the clinic is two blocks north of home" and trace the route with a finger.', 'Which direction do you travel from home to the clinic?', 'North, two blocks, following the map key.', 'Ask your child to describe one route using a direction and a landmark.', 'Expected: one correct direction and one landmark, with the key used.'),
        focus('Who helps in a community', 'List a nurse, a bus driver and a shopkeeper; ask what need each one helps with.', 'What need does the clinic meet for the neighbourhood?', 'It helps people get care when they are unwell.', 'Choose three local services and match each to the need it meets.', 'Expected: three sensible matches with a reason for each.'),
        focus('Needs and wants within a budget', 'Give a fictional 100 rupees: rice 40, pencils 20, a toy 60, fruit 30. Ask for a basket that meets a need and stays in budget.', 'Which three items fit in 100 rupees, and why is your choice sensible?', 'Any correct total ≤ 100 with a need met, e.g. rice 40 + pencils 20 + fruit 30 = 90.', 'Ask for a basket of three items within 100 and one trade-off they made.', 'Expected: correct addition, total ≤ 100 and one explained trade-off.'),
        focus('Then and now in one family routine', 'Compare "letters took days" with "a message arrives now", using only what family members actually remember.', 'What changed, and what stayed the same about keeping in touch?', 'Speed and tool changed; the wish to keep in touch stayed.', 'Interview one family member about a past routine and write one change and one constant.', 'Expected: one sourced change and one constant, attributed to a real person.'),
      ],
    }),
    unit({
      id: 'reasoning-and-data', subject: 'Reasoning & problem solving', strand: 'Patterns, logic and systematic working', minutes: 20, mode: 'guided',
      objective: 'Solve puzzles by finding a rule, working systematically and checking with a second method',
      materials: 'Counters, paper, pencil, a small hand-drawn grid',
      prep: 'Prepare one puzzle with exactly one rule. Avoid trick questions whose answer depends on outside knowledge.',
      steps: reasoningSteps, questions, ...common,
      focuses: [
        focus('Find the rule in a number pattern', 'Show 3, 6, 9, 12, __. Each step adds 3, so the next is 15; check by continuing to 18.', 'What is the rule and what are the next two numbers?', 'Add 3 each time; next are 15 and 18.', 'Give a new pattern such as 4, 8, 12, 16 and ask for the rule plus two terms.', 'Expected: the rule stated as an operation and two correct continuations.'),
        focus('Work systematically with a table', 'Question: how many ways can 2 coins make 10 using 2, 5 and 10? Table: 5+5 only (2+2+2+2+2 uses five coins).', 'Why does a table help here?', 'It lists every combination once so none is missed or repeated.', 'Ask for all pairs of small numbers summing to 12 and record them in a table.', 'Expected: an ordered list of pairs with no duplicates and a stated stopping rule.'),
        focus('Eliminate with three clues', 'Clues: the number is odd, between 20 and 30, and divisible by 3. Candidates 21, 23, 25, 27, 29 → only 21 and 27 are divisible by 3; both are odd, so two answers remain.', 'Do the clues give one answer? If not, what extra clue would fix it?', 'They leave 21 and 27; a clue like "less than 25" would leave 21 only.', 'Give three clues that leave two candidates and ask for one more clue to isolate one.', 'Expected: correct elimination and a valid extra clue, with reasoning stated.'),
        focus('Check with a second method', 'For 18 × 5, compute (10 × 5) + (8 × 5) = 50 + 40 = 90, and check with 18 × 10 ÷ 2 = 90.', 'Why do both methods reaching 90 make the answer more trustworthy?', 'Two independent routes to the same total make a calculation slip less likely.', 'Solve 16 × 5 two different ways and explain both.', 'Expected: 80 by two distinct methods with a short explanation.'),
      ],
    }),
    unit({
      id: 'hindi-punjabi-heritage', subject: 'Hindi, Punjabi & Sikh heritage', strand: 'Home languages, Gurmukhi and values', minutes: 20, mode: 'guided',
      objective: 'Use accurate everyday Hindi and Punjabi, recognise Gurmukhi letters and discuss Sikh values from verified family sources',
      materials: 'Handwritten word cards, a family photo, a verified child-appropriate Sikh history source chosen by the parent',
      prep: 'Confirm every word, script form and historical detail with a fluent reader or a reliable source. Never invent a Gurbani quotation or a historical date.',
      steps: languageSteps, questions, ...common,
      focuses: [
        focus('Read a short Hindi paragraph', 'Write "मेरा घर छोटा है। यहाँ एक पेड़ है।" Read it together, then ask what the two sentences say.', 'What does "यहाँ एक पेड़ है" mean?', 'It means "there is a tree here".', 'Read two short self-written Hindi sentences and ask for the meaning in English.', 'Expected: an accurate meaning for each sentence, with the parent confirming pronunciation.'),
        focus(' Hindi question and answer', 'Model "तुम्हारा नाम क्या है?" and the reply "मेरा नाम ___ है", with the parent confirming the wording.', 'Which word in the question asks "what"?', 'क्या asks "what" in this question.', 'Practise one Hindi question and its reply aloud with a family member.', 'Expected: a comprehensible spoken exchange using the modelled words.'),
        focus('Read familiar Gurmukhi words', 'Show two accurately handwritten familiar words and read each slowly, then match one to its meaning.', 'Which card says the word we just read aloud?', 'The card matching the sound you read, confirmed by the parent.', 'Match two handwritten Gurmukhi word cards to their spoken forms.', 'Expected: at least one correct match and an accurate pronunciation with support.'),
        focus('Seva and a checked source', 'Using one parent-verified child-friendly source, name one act of service and say where the story came from.', 'What did the person do, and how do we know about it?', 'A specific action plus the source the parent checked.', 'Read one short verified story together and retell one action and its source.', 'Expected: one accurate retold action and an honest statement of the source. No unverified dates or quotations.'),
      ],
    }),
    unit({
      id: 'creative-expression', subject: 'Creativity & communication', strand: 'Drawing, design and presenting', minutes: 20, mode: 'guided',
      objective: 'Make a considered visual response and present two clear decisions to an audience',
      materials: 'A4 paper, two pencils, three colours, a ruler, a timer',
      prep: 'Set a small, real purpose (a poster for a family rule, a diagram for a science observation).',
      steps: creativeSteps, questions, ...common,
      focuses: [
        focus('Plan a poster with three parts', 'Sketch a title band, one large picture and one short line of text; say why the eye goes to the picture first.', 'Why did you make the picture the largest part?', 'Because the largest element attracts attention first; any reasoned choice is acceptable.', 'Plan a three-part poster layout before adding any detail.', 'Expected: three labelled parts and one reason for the visual hierarchy.'),
        focus('Draw to explain a real observation', 'Draw the two cups from a science observation, label "with lid" and "without lid" and date both.', 'What does your diagram show that words alone would not?', 'The side-by-side comparison and the labelled difference.', 'Make one labelled diagram of something observed this week.', 'Expected: two accurate labels and one detail drawn from observation, not imagination.'),
        focus('Use two colours with a purpose', 'Choose one colour for the important part and a quieter colour for the background; explain the choice.', 'Which colour did you give the important part, and why?', 'Any choice with a stated reason about emphasis or contrast.', 'Make a two-colour version of one drawing and explain the choice.', 'Expected: a deliberate two-colour decision explained in a sentence.'),
        focus('Present in two sentences', 'Model: "I made a poster about saving water. I put the tap in the middle so people see it first."', 'What did you make, and what was one decision you took?', 'A description of the work plus one specific design decision.', 'Give a two-sentence presentation of the finished work to a family member.', 'Expected: two connected sentences naming the work and one deliberate choice.'),
      ],
    }),
  ],
};
