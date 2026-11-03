/**
 * Original 36-week UKG pathway. Short, playful, activity-led sessions with
 * a parent nearby: early phonics, reading talk, number sense, reasoning,
 * our world, Hindi/Punjabi and Sikh values, creativity and practical life.
 * No worksheets as a gate, no formal exam preparation, no invented NCERT codes.
 */
import { focus, unit, type GradeDefinition } from './model';

const phonicsSteps = [
  'Lay out only the sound cards or objects for today; keep the rest of the pack away.',
  'Model the sound slowly and show the worked example: {example}',
  'Say each sound together once more, then hand over the cards: {exercise}',
  'Ask {question} and wait quietly; a whisper or a point is a full answer.',
  'Compare with {expected} and finish with one word your child chooses.',
];
const readingSteps = [
  'Look at the cover or first picture together and wonder aloud about one detail.',
  'Share the short passage or example: {example}',
  'Invite a response with: {exercise}',
  'Ask {question} and let the child answer in their own words first.',
  'Retell one moment together so the session ends with success.',
];
const numberSteps = [
  'Put a small set of counters on the table and agree what each one stands for.',
  'Model slowly, moving one counter for each spoken number: {example}',
  'Hand over the counters and say: {exercise}',
  'Ask {question} without supplying the answer too quickly.',
  'Check together against {expected} and ask the child to explain one move.',
];
const inquirySteps = [
  'Set one simple safety boundary and look at the materials together first.',
  'Notice one thing out loud and demonstrate: {example}',
  'Let your child investigate with: {exercise}',
  'Ask {question} and write down or remember their exact words.',
  'Recall one thing you both actually observed, without adding a conclusion you did not check.',
];
const makingSteps = [
  'Offer two or three safe materials and a clear space to work.',
  'Show one small possibility, not a model to copy: {example}',
  'Say: {exercise} then let their idea lead.',
  'Ask {question} about their choice rather than about neatness.',
  'Tidy together and let them describe one decision they made.',
];
const questions = ['{question}', 'How would you explain {topic} to someone younger than you?'];
const common = {
  easier: 'Use half the examples, keep everything concrete and let your child answer by pointing or moving objects instead of speaking.',
  harder: 'Add one new example of {topic} and ask your child to explain why their answer works, using a full sentence.',
  criteria: 'Your child took part and showed one observable response: a correct attempt, a reasoned choice or an explanation in their own words. Mark "Needs more practice" when it was effortful.',
  revision: 'In two days, repeat {topic} with the same materials but a different example. Keep a note of what needed a hint and revisit that part first.',
};

export const ukgGrade: GradeDefinition = {
  key: 'ukg', grade: 'UKG', label: 'UKG · playful early literacy and number',
  description: 'Thirty-six weeks of short parent-led play across phonics, stories, speaking, number sense, reasoning, discovery, Hindi, Punjabi and Sikh values, art and independence.',
  provenance: 'Original HomeSchool OS parent-guided activities. The play-led, oral-first approach is informed by the NCERT NCF Foundational Stage (2022) and by internationally used concrete–pictorial–abstract early maths practice as general pedagogical inspiration only. No official textbook chapter is reproduced and no board alignment is claimed.',
  milestones: [
    'Term 1 · Sounds and stories: your child blends a few short words, joins a rhyme and retells two events from a story.',
    'Term 2 · Numbers and reasons: your child counts to twenty, models addition within ten and extends a repeating pattern.',
    'Term 3 · Explains choices: your child describes an observation, uses familiar Hindi and Punjabi words and explains one decision in a full sentence.',
  ],
  units: [
    unit({
      id: 'phonics-blend', subject: 'English literacy', strand: 'Listening to sounds and blending', minutes: 15, mode: 'guided',
      objective: 'Hear, compare and blend short sounds into simple words through play',
      materials: 'Large handwritten letter cards (m, a, t, s, p, i, n), three familiar objects',
      prep: 'Use lower-case sounds, not letter names, when blending. Choose words your child already knows.',
      steps: phonicsSteps, questions, ...common,
      focuses: [
        focus('Blend m-a-t into mat', 'Place m, a, t apart and say /m/ … /a/ … /t/, then slide the cards together: "mat".', 'What word do we make when we slide these three sounds together?', 'The word is mat.', 'Slide three cards together slowly and ask your child to say the whole word.', 'Expected: "mat" or a close attempt. If they say the sounds separately, slide the cards again more slowly.'),
        focus('Blend s-i-t into sit', 'Say /s/ /i/ /t/ with a finger under each card, then sweep one finger under all three: "sit".', 'Which word begins with the /s/ sound here?', 'Sit begins with /s/.', 'Build sit with three cards and invite one slow sweep and one whole word.', 'Expected: the blended word "sit", with the /s/ sound heard first.'),
        focus('Blend p-a-n into pan', 'Hold a real pan while stretching /p/ /a/ /n/, then say "pan" and tap the object.', 'What word did these three sounds make?', 'The word is pan.', 'Build pan with cards and match the word to the real object.', 'Expected: the word "pan" and a correct match to the object.'),
        focus('Swap the first sound in mat', 'Build mat, swap m for s and say "sat" slowly, keeping a and t in place.', 'What changed when we swapped the first card?', 'Only the first sound changed, so the word changed from mat to sat.', 'Change one first card in a familiar word and ask what stayed the same.', 'Expected: noticing that one sound changed while the rest stayed the same.'),
      ],
    }),
    unit({
      id: 'reading-and-retell', subject: 'English literacy', strand: 'Shared reading and retelling', minutes: 15, mode: 'guided',
      objective: 'Listen to a short story, notice key events and retell them in order',
      materials: 'One short picture story, three blank cards, a pencil',
      prep: 'Read the story yourself first and choose three clear moments to come back to.',
      steps: readingSteps, questions, ...common,
      focuses: [
        focus('Beginning, middle, end', 'After reading, place three cards in a row and say "first, next, last" while touching each one.', 'What happened first in our story?', 'The first event you agreed on is the answer.', 'Ask your child to put three picture cards in the order the story happened.', 'Expected: a sensible order with one reason. Any order with an explanation is worth discussing.'),
        focus('Who wanted what', 'Point to one character and say "I think she wanted the lost kite back".', 'What did this character want?', 'A want that matches the story events is correct.', 'Choose one character and ask what they wanted and how you can tell.', 'Expected: one story-supported answer, even a very short one.'),
        focus('A favourite moment', 'Say "my favourite part was when they shared the mango" and explain why in one sentence.', 'Which part was your favourite and why?', 'Any part with a personal reason is a correct answer.', 'Take turns choosing a favourite moment and giving one reason each.', 'Expected: one chosen moment plus a reason, expressed orally or by pointing.'),
        focus('Retell with three words', 'Offer three words from the story, such as "kite, tree, home", and retell using each one.', 'Can you tell the story again using our three words?', 'A retell that includes the three chosen words in a sensible order.', 'Retell the story together using only three prompt words.', 'Expected: a short connected retell with support. Accept gesture and single words.'),
      ],
    }),
    unit({
      id: 'writing-and-speaking', subject: 'English literacy', strand: 'Speaking in sentences and early writing', minutes: 15, mode: 'guided',
      objective: 'Speak a complete sentence and begin to record one idea with support',
      materials: 'Paper, a chunky pencil, one familiar object or picture',
      prep: 'Have your child say the sentence aloud before anyone picks up a pencil. Handwriting is not the goal.',
      steps: readingSteps, questions, ...common,
      focuses: [
        focus('One full sentence about a picture', 'Look at a picture and model "I can see a red bus" as one complete sentence.', 'Can you say one whole sentence about this picture?', 'A sentence with a subject and an idea, such as "I can see a bus".', 'Take turns saying one full sentence each about the same picture.', 'Expected: one complete spoken sentence, with a model repeated if needed.'),
        focus('Describe with two details', 'Say "the small dog is sleeping" and point out the two describing words.', 'Can you add two details to your sentence?', 'Two describing words or ideas added to a sentence.', 'Start with "the dog" and invite your child to add two details aloud.', 'Expected: a longer spoken sentence with two details.'),
        focus('Write or dictate one idea', 'Say your sentence aloud, then write it slowly while your child watches, or let them dictate it to you.', 'What one idea shall we put on the paper today?', 'Any single idea from their spoken sentence.', 'Invite one attempt at a mark, letter or dictated sentence about a familiar thing.', 'Expected: one recorded idea, however it is formed. Do not correct spelling here.'),
        focus('Ask a question about a story', 'Model "why did the bird fly away?" with a curious voice, then pause.', 'What would you like to ask about this story?', 'Any genuine question about the story is correct.', 'Take turns asking one question each about the same picture.', 'Expected: one spoken question, even if it is very simple.'),
      ],
    }),
    unit({
      id: 'numbers-to-twenty', subject: 'Number sense', strand: 'Counting, comparing and place value beginnings', minutes: 15, mode: 'guided',
      objective: 'Count, compare and build small numbers with one-to-one matching',
      materials: 'Twenty large counters or buttons, two bowls, a ten-frame drawn on paper',
      prep: 'Count out exactly twenty counters. Keep them in one bowl so the set is easy to check.',
      steps: numberSteps, questions, ...common,
      focuses: [
        focus('Count ten with one touch each', 'Move ten counters into a ten-frame, saying one number for each counter without skipping.', 'How many counters are in the frame now?', 'There are ten counters.', 'Fill a ten-frame together and recount by touching each counter once.', 'Expected: one number per counter and a final answer of ten.'),
        focus('Make fourteen as ten and four', 'Fill one ten-frame completely, then place four counters beside it: "ten and four makes fourteen".', 'How many counters do we have altogether?', 'Fourteen: one full ten and four more.', 'Build fourteen with a full ten-frame and four extra counters.', 'Expected: fourteen, with the child noticing the full group of ten.'),
        focus('Which group has more', 'Make a group of eight and a group of twelve, then line them up in two rows to compare.', 'Which group has more, and how can you tell?', 'Twelve has more; lining up the rows makes the difference visible.', 'Build two different groups and ask which has more before counting.', 'Expected: a correct comparison and one explanation, ideally by lining up.'),
        focus('Count backwards from ten', 'Start with ten counters and remove one at a time: "ten, nine, eight…".', 'What number comes just before eight?', 'Seven comes just before eight.', 'Remove counters one by one from ten and say each number together.', 'Expected: a correct backwards count to at least five with support.'),
      ],
    }),
    unit({
      id: 'addition-stories', subject: 'Number sense', strand: 'Combining and separating small groups', minutes: 15, mode: 'guided',
      objective: 'Model addition and subtraction within ten using real objects and short stories',
      materials: 'Ten counters, two small plates, a piece of paper for a story mat',
      prep: 'Keep all stories within ten so the arithmetic stays visible and concrete.',
      steps: numberSteps, questions, ...common,
      focuses: [
        focus('Three and two make five', 'Put three counters on one plate and two on another, then slide them together: "three and two make five".', 'How many counters are there when we join the two plates?', 'Five counters altogether.', 'Tell a short joining story with three and two counters and count the total.', 'Expected: five, with the child physically joining the two groups.'),
        focus('Make ten with two groups', 'Place six counters on one plate, then ask how many more are needed to fill a ten-frame.', 'How many more do we need to make ten?', 'Four more are needed, because six and four make ten.', 'Build six counters and invite your child to add enough to reach ten.', 'Expected: four more counters and a total of ten.'),
        focus('Take away two from seven', 'Start with seven counters, remove two slowly and say "seven take away two leaves five".', 'How many are left after we take two away?', 'Five counters remain.', 'Act out a short story where two of seven objects go away.', 'Expected: five, found by counting the remaining objects.'),
        focus('Show six in two ways', 'Make six as four plus two, then as five plus one, using two plates each time.', 'Can you show six a different way?', 'Any two groups that total six, such as five and one.', 'Invite two different splits of six counters and describe each one.', 'Expected: two correct splits, explained with "and" or "plus".'),
      ],
    }),
    unit({
      id: 'patterns-and-shapes', subject: 'Reasoning & shapes', strand: 'Patterns, sorting and spatial reasoning', minutes: 15, mode: 'guided',
      objective: 'Extend repeating patterns, sort by a rule and describe simple shapes',
      materials: 'Two colours of large blocks, paper shapes, a tray',
      prep: 'Prepare two clearly different colours and three or four large shapes.',
      steps: inquirySteps, questions, ...common,
      focuses: [
        focus('Extend an AB pattern', 'Lay red, blue, red, blue and ask what comes next while pointing along the row.', 'What comes next in our pattern, and how do you know?', 'Red comes next because the pattern repeats red then blue.', 'Start an AB pattern and invite your child to add the next two blocks.', 'Expected: two correct continuations and a simple explanation of the repeat.'),
        focus('Make an AAB pattern', 'Build red, red, blue, red, red, blue and pause before the next block.', 'What is the repeating part of this pattern?', 'The repeat is red, red, blue.', 'Build an AAB pattern together and ask your child to say the repeating part.', 'Expected: naming or pointing out the three-block repeating unit.'),
        focus('Sort by a hidden rule', 'Sort shapes into two trays by "has a corner" without naming the rule first.', 'What is my sorting rule?', 'One tray has shapes with corners; the other has round shapes.', 'Sort a few shapes silently and invite your child to guess the rule.', 'Expected: one reasonable rule stated aloud, even if phrased differently.'),
        focus('Find shapes inside shapes', 'Put two triangles together to make a square and trace the outside edge.', 'What bigger shape did our two triangles make?', 'Together they made a square.', 'Join two large paper triangles and ask what shape appeared.', 'Expected: recognising the new square, with tracing as a hint.'),
      ],
    }),
    unit({
      id: 'our-world', subject: 'Science & our world', strand: 'Observation, plants and healthy routines', minutes: 15, mode: 'guided',
      objective: 'Observe carefully, describe what was actually seen and care for living things',
      materials: 'A potted plant, a leaf, paper, crayons, a cup of water',
      prep: 'Choose one plant you can observe again on a later day without damaging it.',
      steps: inquirySteps, questions, ...common,
      focuses: [
        focus('Name three parts of a plant', 'Point to the stem, one leaf and the soil, naming each slowly without pulling the plant.', 'Which part of the plant carries the leaves?', 'The stem carries the leaves.', 'Look at one plant together and name or point to three visible parts.', 'Expected: two or three correctly identified parts, using your own plant.'),
        focus('What a seed needs', 'Place one seed on damp cotton in a clear jar and say "we will check, not guess".', 'What do you think the seed needs, and how could we check?', 'Water, warmth and light are reasonable ideas; checking over days is the method.', 'Set up one seed to observe and agree when you will look again.', 'Expected: one sensible prediction plus the idea of looking again later.'),
        focus('A weather chart for three days', 'Draw three small boxes and put one sky symbol in today’s box together.', 'What did we actually notice about today’s sky?', 'An observed feature such as clouds, rain or bright sun.', 'Record one sky observation together and plan to add two more.', 'Expected: one accurate observation, not a forecast.'),
        focus('A handwashing sequence', 'Act out wet, soap, rub, rinse and dry in order with dry hands first.', 'What comes after rubbing with soap?', 'Rinsing comes after rubbing.', 'Role-play the whole handwashing sequence and recall one step.', 'Expected: a correct order with one step explained. Practise at the sink separately.'),
      ],
    }),
    unit({
      id: 'hindi-punjabi-values', subject: 'Hindi, Punjabi & Sikh heritage', strand: 'Home languages and values', minutes: 15, mode: 'guided',
      objective: 'Use familiar Hindi and Punjabi words and talk about kindness through real family actions',
      materials: 'Everyday household objects, a family photo, two handwritten Gurmukhi letter cards',
      prep: 'Check every Hindi, Punjabi and Gurmukhi example with a fluent family member. Use only accurate Sikh stories and quotations; never invent a quotation.',
      steps: readingSteps, questions, ...common,
      focuses: [
        focus('Follow one Hindi instruction', 'Say "kitaab uthao" while picking up a book yourself to show the meaning.', 'What did our Hindi instruction ask you to do?', 'It asked to pick up the book.', 'Give one familiar Hindi instruction with an object and model its meaning.', 'Expected: one correct action with support. Understanding before speaking is the goal.'),
        focus('Recognise two Gurmukhi shapes', 'Show two clearly different large handwritten letters and say each sound accurately.', 'Which card has the sound I just said?', 'The card you named correctly.', 'Place two letter cards down and say one sound for your child to match.', 'Expected: one correct match after hearing the sound.'),
        focus('Punjabi words at the table', 'Offer water and say "paani", then offer roti and say "roti" in a natural family voice.', 'What is our family word for water?', 'Paani is the word for water used in this family.', 'Use two familiar Punjabi food words during a real snack.', 'Expected: your child understands or repeats one word naturally.'),
        focus('Seva as a real small action', 'Put one plate away together and say "we helped without waiting for a reward".', 'What did we do that helped our family?', 'The specific helping action you did together.', 'Choose one small family-approved task, do it, then describe it.', 'Expected: participation plus one sentence about how it helped.'),
      ],
    }),
    unit({
      id: 'creativity-and-life', subject: 'Creativity & practical life', strand: 'Art, communication and independence', minutes: 15, mode: 'guided',
      objective: 'Make, describe and take responsibility for one small real task',
      materials: 'Large paper, two crayons, a cloth, a low shelf, a small basket',
      prep: 'Offer a small choice of materials so your child can make a real decision.',
      steps: makingSteps, questions, ...common,
      focuses: [
        focus('Draw and describe a family moment', 'Draw one simple memory together, then say "this is us walking to the park".', 'Who is in your picture and what are they doing?', 'Any description of their own drawing is correct.', 'Invite one drawing about a real family moment and ask for a description.', 'Expected: two connected spoken details about their own work.'),
        focus('Make a repeating border', 'Draw a short dot-line pattern along one edge of a page and pause for them to continue.', 'What comes next in your border?', 'The next mark in their own repeating pattern.', 'Start a two-mark border and let your child continue it.', 'Expected: at least two correct continuations of their own pattern.'),
        focus('Tidy by category', 'Put blocks in one basket and books on one shelf, saying "blocks here, books there".', 'Where do the books belong and why?', 'On the shelf, because that is the category you agreed.', 'Tidy five mixed items into two agreed homes.', 'Expected: most items sorted by the agreed rule, with one explanation.'),
        focus('Pack a small bag together', 'Put one book and one water bottle in a bag, naming each item as it goes in.', 'What do we need to take, and what can stay home?', 'The items you agreed are needed for the outing.', 'Pack two needed items together and discuss one item to leave behind.', 'Expected: one reasoned choice about what to take.'),
      ],
    }),
  ],
};
