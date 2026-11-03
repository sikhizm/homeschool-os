/**
 * Original 36-week Nursery pathway (about 3.5 years). Play-led, concrete,
 * short and oral. No worksheets, no formal testing, no pressured targets.
 * Subjects spiral across three terms so no single area disappears for months.
 */
import { focus, unit, type GradeDefinition } from './model';

const playSteps = [
  'Set out the materials on the floor and let your child see and touch them before you explain anything.',
  'Show the worked example slowly: {example}',
  'Invite your child to try: {exercise}',
  'Ask {question} and give at least five seconds of quiet waiting time.',
  'Finish by letting your child show you one thing they enjoyed, with no correction at the end.',
];
const storySteps = [
  'Sit together with the book or objects where your child can reach them.',
  'Tell or show the short example first: {example}',
  'Invite a response with: {exercise}',
  'Ask {question} and accept pointing, gesture or a single word as a full answer.',
  'Retell the same tiny moment once more so the child hears a predictable ending.',
];
const numberSteps = [
  'Put out only the small set of objects you need; keep extras out of sight.',
  'Model slowly, touching one object for each word: {example}',
  'Hand the objects over and say: {exercise}',
  'Ask {question} without hurrying to supply the answer.',
  'Compare together with {expected} and celebrate the attempt, not speed.',
];
const discoverySteps = [
  'Choose a safe spot and agree one simple boundary together before starting.',
  'Notice one thing out loud and demonstrate: {example}',
  'Let your child explore freely with: {exercise}',
  'Ask {question} and listen to their own explanation first.',
  'Put everything back together and recall one thing you both noticed.',
];
const makingSteps = [
  'Cover the surface and offer only two or three safe choices of colour or material.',
  'Show one small possibility without making a model to copy: {example}',
  'Say: {exercise} then step back and let their idea lead.',
  'Ask {question} about what they made rather than whether it looks right.',
  'Display or tidy the result together and name one thing they decided.',
];
const questions = ['{question}', 'What would you like to try again next time, and why?'];
const common = {
  easier: 'Use only two objects or one short sentence, let your child point instead of answering, and stop after a few minutes.',
  harder: 'Add one extra example of {topic} and invite your child to explain their choice in a full sentence.',
  criteria: 'Your child joined in and showed one observable response such as a point, a word, a choice or an attempt. A short or distracted session is still valid.',
  revision: 'Revisit {topic} during ordinary play two days later with the same materials but one new example; do not repeat it as a test.',
};

export const nurseryGrade: GradeDefinition = {
  key: 'nursery', grade: 'Nursery', label: 'Nursery · play-led foundations (around 3–4 years)',
  description: 'Thirty-six weeks of short, playful, oral activities across language, early number, discovery, Punjabi and Sikh values, creativity and practical life.',
  provenance: 'Original HomeSchool OS parent-guided activities. Written with the play-based, concrete-materials approach of the NCERT NCF Foundational Stage (2022) as a pedagogical inspiration only. These are not NCERT textbook lessons, official learning-outcome codes, or a claim of CBSE alignment.',
  milestones: [
    'Term 1 · Joins in: your child listens to a short story, names familiar objects and joins a simple rhyme or exchange.',
    'Term 2 · Notices more: your child compares size and quantity, sorts by one property and describes what they observe.',
    'Term 3 · Shows initiative: your child retells a familiar moment, helps with a small task and explains a choice in their own words.',
  ],
  units: [
    unit({
      id: 'story-listening', subject: 'Language & stories', strand: 'Listening and retelling', minutes: 10, mode: 'play',
      objective: 'Build joyful listening, attention and early retelling through very short shared stories',
      materials: 'One familiar picture book or three household objects, a soft cushion',
      prep: 'Choose a story with three clear moments. Decide the one short sentence you will repeat at the end.',
      steps: storySteps, questions, ...common,
      focuses: [
        focus('Who is in the story', 'Point to the cover and say "Here is a little rabbit. I wonder who else we will meet."', 'Which character did your child point to first?', 'Any named or pointed character is correct.', 'Show two characters in a picture and ask "who is this?" while pointing.', 'Expected: a point, a name or a sound for one character. Guessing is welcome; accept their word warmly.'),
        focus('What happened first', 'Use three objects to act out "first the ball rolled, then it stopped, then we found it."', 'What happened first in our little story?', 'The first event you acted out is the answer.', 'Act out three tiny events with objects and ask which came first.', 'Expected: your child names or points to the first event. A wrong order is useful information, not a failure.'),
        focus('A favourite picture', 'Open one page, look silently for five seconds, then say "I can see a big red bus."', 'What can you see on this page?', 'Any visible object is a correct answer.', 'Look at one busy picture together and take turns naming one thing each.', 'Expected: one or two named or pointed objects. Accept gestures as full answers.'),
        focus('The story ending', 'Close the book and say "and then they went home to sleep" in the same voice each time.', 'How did our story finish?', 'The repeated ending phrase is the expected answer.', 'Retell the three moments and pause before the ending for your child to join in.', 'Expected: a word, a gesture or an anticipatory look before the ending.'),
      ],
    }),
    unit({
      id: 'new-words', subject: 'Language & stories', strand: 'Vocabulary through play', minutes: 10, mode: 'play',
      objective: 'Grow everyday vocabulary through naming, describing and choosing real objects',
      materials: 'Four safe household objects, a small basket, a cloth',
      prep: 'Pick objects with clearly different names and one shared property, such as two round things.',
      steps: playSteps, questions, ...common,
      focuses: [
        focus('Naming things we use', 'Hold up a cup and say "this is a cup; we drink from it", then place it in the basket.', 'What is this and what do we do with it?', 'A cup is for drinking; any sensible use is acceptable.', 'Offer three familiar objects one at a time and ask for a name and a use.', 'Expected: one or two correct names, or a demonstrated use instead of a word.'),
        focus('Big, small and tiny', 'Put a large bowl beside a small spoon and say "big bowl, small spoon" while stretching and pinching your hands.', 'Which one is the big one?', 'The bowl is the big object.', 'Offer two clearly different-sized safe objects and ask which is bigger.', 'Expected: a correct point or word. If unsure, compare them side by side again.'),
        focus('Words for feelings', 'Make a happy face and a sleepy face in a mirror, naming each one slowly.', 'How is this face feeling?', 'Happy or sleepy, depending on the face shown.', 'Make two simple faces and let your child name or copy one.', 'Expected: one feeling word or an accurate imitation. Do not insist on a label.'),
        focus('Under, on and beside', 'Place a toy under a cloth, then on the cloth, saying each position word clearly: "under", "on", "beside".', 'Where is the toy now?', 'The position word matching where you placed it.', 'Hide a toy in three simple positions and ask where it is each time.', 'Expected: one correct position word or a correct point. Repeat the word naturally.'),
      ],
    }),
    unit({
      id: 'rhyme-and-sound', subject: 'Language & stories', strand: 'Rhyme, rhythm and first sounds', minutes: 10, mode: 'play',
      objective: 'Play with rhythm, rhyme and beginning sounds without any letter drills',
      materials: 'Your voice, two safe objects with different starting sounds, a small drum or pot',
      prep: 'Choose one short rhyme you know well. Keep the pace slow enough for your child to join.',
      steps: storySteps, questions, ...common,
      focuses: [
        focus('Clap the beats of a name', 'Clap "Ga-gan" as two slow claps, then clap your own name the same way.', 'How many claps did we make for that name?', 'Two claps for a two-beat name.', 'Clap the beats of two family names and invite your child to join.', 'Expected: your child joins one clap or copies the rhythm approximately.'),
        focus('Words that sound alike', 'Say "cat, hat" slowly, then "cat, cup" and ask which pair sounded alike at the end.', 'Which two words sounded the same at the end?', 'Cat and hat share the ending sound.', 'Offer two rhyming words and one unrelated word; ask which two belong together.', 'Expected: a point or repeat of the rhyming pair; accept any attempt.'),
        focus('First sound of a toy', 'Hold a ball and stretch the first sound: "b-b-ball", then contrast with "s-s-spoon".', 'Which toy starts with a b-b-b sound?', 'The ball starts with the /b/ sound.', 'Offer two toys with clearly different first sounds and ask which starts with /b/.', 'Expected: a correct point. If not, say both words slowly again without correcting sharply.'),
        focus('A quiet and loud verse', 'Say one rhyme line in a whisper, then the same line in a cheerful outdoor voice.', 'Which voice did you like for this rhyme?', 'Either voice is a valid preference.', 'Say the same short line twice with different volume and let your child choose one.', 'Expected: a choice, a gesture or joining in with one word.'),
      ],
    }),
    unit({
      id: 'counting-play', subject: 'Early mathematics', strand: 'Counting with real objects', minutes: 10, mode: 'play',
      objective: 'Match counting words to small groups of real objects through movement and play',
      materials: 'Six large safe counters (blocks or lids), a small basket',
      prep: 'Use no more than five objects at first. Keep them big enough to handle safely.',
      steps: numberSteps, questions, ...common,
      focuses: [
        focus('One, two, three with claps', 'Clap slowly three times, touching one finger for each clap: "one, two, three".', 'How many claps did we just make?', 'Three claps.', 'Clap a small number together and ask how many claps were heard.', 'Expected: a correct count up to three, or matching claps with their own hands.'),
        focus('One block for each word', 'Move three blocks one at a time into a basket while saying one number for each block.', 'How many blocks are in the basket now?', 'Three blocks are in the basket.', 'Move three blocks into a basket together and count them back out.', 'Expected: one number per block with your support; recount together if they skip one.'),
        focus('Give me two', 'Ask "give me two blocks", then hold out an open hand and wait without repeating the request.', 'Can you give me exactly two blocks?', 'Two blocks in your hand is the expected answer.', 'Ask for two, then three, blocks from a small pile.', 'Expected: a small correct group at least once. Model again if needed.'),
        focus('More or fewer at snack time', 'Put two pieces on one plate and four on another; say "this plate has more".', 'Which plate has more pieces?', 'The plate with four pieces has more.', 'Make two clearly different small groups and ask which has more.', 'Expected: a correct point to the larger group; compare by lining them up if unsure.'),
      ],
    }),
    unit({
      id: 'shape-and-size', subject: 'Early mathematics', strand: 'Shapes, size and sorting', minutes: 10, mode: 'play',
      objective: 'Notice, name and compare simple shapes, sizes and one visible property',
      materials: 'Large paper circle and square, four safe blocks, two bowls',
      prep: 'Cut two large shapes in advance. Avoid small pieces that could fit in a mouth.',
      steps: numberSteps, questions, ...common,
      focuses: [
        focus('Find a circle at home', 'Trace a large paper circle with one finger and say "round and round, no corners".', 'Which object in the room is round like this?', 'A plate, a lid or a clock face are all correct.', 'Carry the paper circle around and find one matching round object.', 'Expected: one reasonable match, even if it is not a perfect circle.'),
        focus('Corners on a square', 'Walk two fingers along a square and pause at each of its four corners.', 'How many corners can you feel?', 'A square has four corners.', 'Trace a large square together and count the corners slowly.', 'Expected: noticing that corners feel different from the round edge.'),
        focus('Sort by one colour', 'Put two red blocks in one bowl and two blue blocks in another without explaining the rule.', 'Why do these two blocks belong together?', 'Because they share the same colour.', 'Mix four blocks and invite your child to make two groups their own way.', 'Expected: two groups sorted by one visible property, or a clear explanation of their own rule.'),
        focus('Longer and shorter', 'Lay two safe spoons side by side with their ends lined up.', 'Which spoon is longer?', 'The spoon that reaches further when the ends are lined up.', 'Line up two objects and ask which is longer; then swap their order.', 'Expected: a correct comparison. Lining up the ends is the important idea.'),
      ],
    }),
    unit({
      id: 'nature-detectives', subject: 'Discovery & motor play', strand: 'Observation and movement', minutes: 12, mode: 'play',
      objective: 'Notice the local world through safe observation, gentle movement and simple description',
      materials: 'A window view or garden step, a leaf, a paper bag for collecting (no picking living plants without permission)',
      prep: 'Check the area for hazards first. Decide one boundary such as "we stay where I can see you".',
      steps: discoverySteps, questions, ...common,
      focuses: [
        focus('What is the sky doing', 'Look out together and say "I can see grey clouds and no bright sun today".', 'What can you see in the sky today?', 'Any visible feature such as clouds, sun or rain is correct.', 'Look out for one quiet minute and take turns naming one sky detail.', 'Expected: one observed detail in words or by pointing. Guess only after looking.'),
        focus('Leaves are not all the same', 'Hold two fallen leaves side by side and describe one difference you can actually see.', 'What is different about these two leaves?', 'Size, colour, shape or edge are all valid observations.', 'Offer two fallen leaves and ask for one difference.', 'Expected: one observable difference. Avoid saying one is "better".'),
        focus('A slow and fast walk', 'Walk three steps slowly, then three steps quickly along a clear safe line.', 'Which walk felt easier to stop?', 'The slow walk is easier to stop.', 'Try a slow walk and a quick walk on a clear floor and pause on a signal.', 'Expected: your child stops on at least one signal and notices the difference.'),
        focus('Sounds near and far', 'Sit quietly, then name one sound close by and one sound further away.', 'Which sound was close to us?', 'The nearby sound you both identified.', 'Listen together for ten seconds and point toward one sound you hear.', 'Expected: one identified sound or a correct point. Silence is a valid observation too.'),
      ],
    }),
    unit({
      id: 'punjabi-and-values', subject: 'Punjabi & Sikh heritage', strand: 'Language, values and family stories', minutes: 10, mode: 'play',
      objective: 'Make Punjabi words, Sikh values and family warmth part of ordinary play and conversation',
      materials: 'Your voice, a family photo, a small household helping task',
      prep: 'Confirm the exact pronunciation of any Punjabi words with your family. Use only Sikh stories and quotations you know are accurate; never invent a quotation.',
      steps: storySteps, questions, ...common,
      focuses: [
        focus('Sat Sri Akal with folded hands', 'Fold your hands, say "Sat Sri Akal" and invite your child to copy the gesture.', 'What do we say when we greet someone warmly?', 'Sat Sri Akal is the greeting used here.', 'Greet two family members or a photo with folded hands.', 'Expected: a joined gesture or the greeting with support. Keep it warm, not a drill.'),
        focus('Family words for everyday things', 'Offer a cup of water and say "paani" once before handing it over.', 'What is our family word for water?', 'Paani is the word used in this family.', 'Use one familiar Punjabi word during a real routine and invite a repeat.', 'Expected: your child hears and may repeat the word; understanding comes before speaking.'),
        focus('Sharing one toy', 'Offer a favourite toy to another person, say "thank you" together, then take a turn yourself.', 'How did it feel to share and to be thanked?', 'Any honest feeling is a correct answer.', 'Practise one short offer-and-thank-you exchange with a toy.', 'Expected: one voluntary exchange with support; do not force sharing of a treasured toy.'),
        focus('A small act of seva', 'Put one napkin on the table together and say "we helped our family".', 'What did we do that helped someone?', 'Putting out the napkin helped the family.', 'Choose one tiny safe helping task and do it side by side.', 'Expected: participation in the task and one sentence about helping. No reward needed.'),
      ],
    }),
    unit({
      id: 'art-and-making', subject: 'Creativity & drawing', strand: 'Mark-making, colour and description', minutes: 12, mode: 'play',
      objective: 'Enjoy open-ended making and describe their own work without a model to copy',
      materials: 'Large paper, two or three chunky crayons, a smock or old shirt',
      prep: 'Cover the table. Offer a limited choice of colours so decisions stay simple.',
      steps: makingSteps, questions, ...common,
      focuses: [
        focus('Lines that go for a walk', 'Draw one slow wavy line while saying "this line is taking a walk".', 'Where did your line travel?', 'Any description of their own line is correct.', 'Invite your child to draw one line that goes somewhere and describe it.', 'Expected: one mark and one descriptive word or gesture. Do not ask what it "is".'),
        focus('Two colours, one choice', 'Place a blue and a yellow crayon down and say "I choose blue today" without asking them to copy.', 'Which colour did you choose and why?', 'Either colour with any reason is correct.', 'Offer two colours and let your child choose before drawing.', 'Expected: a clear choice and one reason, even a very simple one.'),
        focus('Dots, strokes and pauses', 'Make one dot, one long stroke and one pause, naming each as you make it.', 'Can you show me a dot and a long line?', 'A small mark is a dot; a longer mark is a line.', 'Invite one dot and one long stroke on the same page.', 'Expected: two visibly different marks. Accept any size or direction.'),
        focus('Tell me about your picture', 'Point to one part of your own drawing and say "I made this part slowly".', 'Which part of your picture do you want to tell me about?', 'Any part they choose is the right answer.', 'Sit beside their finished picture and wait for them to choose one part.', 'Expected: one chosen detail and a short description. Praise the telling, not the likeness.'),
      ],
    }),
    unit({
      id: 'helping-hands', subject: 'Practical life & independence', strand: 'Small family tasks', minutes: 10, mode: 'play',
      objective: 'Practise one small, safe, real family task and the words that go with it',
      materials: 'A soft cloth, a laundry basket, a low shelf, a small plant and a cup of water',
      prep: 'Choose a task with a real purpose but no sharp tools, heat, glass or heavy lifting.',
      steps: discoverySteps, questions, ...common,
      focuses: [
        focus('Put one toy in its home', 'Place one toy on a low shelf and say "this is where it rests".', 'Where does this toy go when we finish?', 'Back on its low shelf.', 'Tidy one toy together and let your child choose the next one.', 'Expected: one toy returned with a verbal or gestured reminder.'),
        focus('Wipe a small spill', 'Pour a teaspoon of water on a tray, then wipe it slowly with a cloth.', 'What can we use to make the tray dry?', 'A cloth or towel dries the tray.', 'Offer a cloth for one tiny supervised spill and wipe together.', 'Expected: one wiping motion and naming the cloth. Dry the floor afterwards.'),
        focus('Water one plant', 'Give a plant two small sips of water and say "just enough, not too much".', 'How much water did our plant need today?', 'A small amount, just enough to dampen the soil.', 'Offer a small cup and let your child give one careful sip.', 'Expected: one careful pour with your hand nearby. Avoid overwatering.'),
        focus('Set one place together', 'Put one plate and one spoon on a mat and say "one for you".', 'What does each person need at the table?', 'A plate and a spoon for each person.', 'Set one place setting side by side and count the items.', 'Expected: one plate and one spoon placed together with a short explanation.'),
      ],
    }),
  ],
};
