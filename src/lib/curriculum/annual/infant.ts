/**
 * Original infant development interactions for the youngest learner (around
 * 11 months). These are responsive parent–child moments, NOT formal lessons:
 * no worksheets, no screen time, no targets, no assessment of the baby.
 * The "check" is a parent observation of engagement, never a child score.
 */
import { focus, unit, type GradeDefinition } from './model';

const observeSteps = [
  'Sit close, at your baby’s eye level, and say their name softly before you begin.',
  'Show {topic} slowly. Pause for at least five seconds so your baby can look, reach or babble first.',
  'Narrate with one calm sentence: {example}',
  'Follow their lead. If they turn away, stop and cuddle; if they reach again, repeat once.',
  'Finish with a smile, a cuddle and the same short phrase so the moment feels predictable.',
];
const sensorySteps = [
  'Check everything is clean, large enough to be safe and within your reach throughout.',
  'Place one item in your baby’s hand and describe what they may notice: {example}',
  'Offer a second, clearly different item beside the first and wait for a choice.',
  'Let them mouth, tap or drop the safe item; resist directing their hands.',
  'Put the items away together and say a simple goodbye phrase.',
];
const movementSteps = [
  'Clear a soft floor space and stay within arm’s reach the whole time.',
  'Model the movement once without lifting or positioning your baby: {example}',
  'Place a favourite safe object just within reach to invite {topic}.',
  'Celebrate any attempt with warm words, never with praise for speed or distance.',
  'Rest together when your baby signals they have had enough.',
];
const musicSteps = [
  'Hold your baby comfortably or sit facing them on the floor.',
  'Sing or chant one short line slowly and repeat it three times: {example}',
  'Pause before the last word to give them a chance to vocalise or move.',
  'Add one gentle action (a clap, a sway, a peek) and repeat the same line.',
  'End with the same line quieter, then a cuddle and a calm pause.',
];
const careSteps = [
  'Begin when your baby is fed, rested and calm; choose a familiar everyday moment.',
  'Say what is about to happen before you do it: {example}',
  'Offer one simple choice and wait for a look, sound or gesture.',
  'Respond to that signal immediately so the exchange feels like a conversation.',
  'Close with the same affectionate phrase each time.',
];
const observeQuestions = [
  'What did your baby look at longest during {topic}?',
  'Which sound or gesture did they use to tell you they wanted more or had finished?',
];
const sensoryQuestions = [
  'Which of the two items did your baby reach for first in {topic}?',
  'How did they show you they preferred one sensation over the other?',
];
const movementQuestions = [
  'What small movement did your baby attempt during {topic}?',
  'When did they signal that they wanted a rest?',
];
const common = {
  easier: 'Shorten to one minute, use only one item and simply hold your baby and talk. Stop as soon as they lose interest.',
  harder: 'Repeat the same interaction on two more days this week with one new safe variation, keeping everything else identical.',
  criteria: 'You spent an unhurried moment together and noticed one response. Nothing is expected of the baby; tired or distracted days count too.',
  revision: 'Babies do not need revision. Revisit {topic} whenever your baby shows interest; repetition through play is enough.',
};

export const infantGrade: GradeDefinition = {
  key: 'infant', grade: 'Infant', label: 'Infant · responsive play (0–18 months)',
  description: 'Thirty-six gentle weekly interactions: language exposure, sensory play, movement, music and connection. No formal teaching, no targets, no screens.',
  provenance: 'Original HomeSchool OS parent–child guidance, written with a responsive-care and play-first approach. It is informed by the NCF Foundational Stage emphasis on responsive caregiving, but is not an NCERT syllabus, a clinical developmental checklist or medical advice.',
  milestones: [
    'Term 1 · Familiar voices: your baby reliably turns toward familiar voices and everyday sounds during shared play.',
    'Term 2 · Curious hands: your baby explores safe textures and reaches, rolls or moves with growing confidence.',
    'Term 3 · Shared rhythms: your baby anticipates a familiar song or turn-taking game and joins with a sound or gesture.',
  ],
  units: [
    unit({
      id: 'familiar-voices', subject: 'Language & connection', strand: 'Hearing familiar voices', minutes: 8, mode: 'play',
      objective: 'Help your baby link familiar voices, names and warm expressions with everyday moments',
      materials: 'Your voice, a family photo, a soft cloth',
      prep: 'Choose one short phrase you will use all week. Keep your phone away so the moment is fully shared.',
      steps: observeSteps, questions: observeQuestions, ...common,
      focuses: [
        focus('Answering to their own name', 'Say "Gurfateh?" in a warm rising voice, pause, then "there you are!" when they look.', 'What did your baby do when they heard their name?', 'They may turn, look up, babble or still briefly.', 'Call their name once from beside them, wait five seconds, then smile and cuddle.', 'Expected: any orienting response such as a look or a pause. No response is also normal at this age.'),
        focus('Family voices at home', 'Hold a family photo, point and say "Dada ji" slowly, then repeat the same name twice.', 'Which family voice or name held their attention?', 'Most babies attend longest to the most familiar voice.', 'Say two family names beside a photo and pause after each one.', 'Expected: a look toward the photo or toward you. Watchful quiet is a valid response.'),
        focus('Greeting with Sat Sri Akal', 'Fold your hands, say "Sat Sri Akal" softly, then touch your baby’s hands together gently.', 'How did your baby join the greeting?', 'They may watch your hands, wriggle or make a sound.', 'Greet your baby once with folded hands and wait for any sound or movement.', 'Expected: shared attention for a few seconds. This is a warm family ritual, not a language milestone.'),
        focus('One-word narration', 'As you lift a cup, say "cup" once, pause, then "warm cup" in the same calm tone.', 'Which everyday word made them look at the object?', 'Short concrete words are easiest to notice.', 'Name one object you are both holding and pause before repeating it.', 'Expected: your baby looks between you and the object or vocalises. Silence is fine.'),
      ],
    }),
    unit({
      id: 'everyday-sounds', subject: 'Language & connection', strand: 'Listening to everyday sounds', minutes: 8, mode: 'play',
      objective: 'Give your baby calm opportunities to notice, locate and respond to household sounds',
      materials: 'A soft bell or spoon and cup, a cloth, your voice',
      prep: 'Choose two gentle sounds. Avoid sudden loud noises and keep the room quiet for a minute.',
      steps: observeSteps, questions: observeQuestions, ...common,
      focuses: [
        focus('A spoon tapping a cup', 'Tap a wooden spoon once on a plastic cup, pause, then say "I heard that!" in a soft voice.', 'Did your baby turn toward the tapping sound?', 'A head turn, eye shift or stilling is a response.', 'Make one gentle tap behind their line of sight and wait quietly.', 'Expected: any brief orienting movement. Repeat only if they seem curious.'),
        focus('Two sounds, one at a time', 'Tap a cup, pause three seconds, then rustle a soft cloth so the two sounds stay clearly separate.', 'Which of the two sounds did they notice first?', 'Babies often prefer a soft, rhythmic sound.', 'Offer one sound, wait, then offer the other with a clear pause between them.', 'Expected: a look or a pause after at least one sound. No comparison is required.'),
        focus('Where did that sound come from', 'Call "hello?" gently from one side, wait for a look, then smile from that same spot.', 'How did your baby show they found where the sound came from?', 'They may turn their head, eyes or whole body.', 'Make a soft sound from one side and give them time to find you.', 'Expected: a brief turn toward you. Do not repeat if it startles them.'),
        focus('Quiet after sound', 'Make one soft tap, then count five silent seconds in your head before speaking again.', 'What did your baby do during the quiet pause?', 'A pause often prompts a babble or a look.', 'Offer one sound, then wait in silence with a warm, waiting expression.', 'Expected: any small sound, look or wriggle during the pause. Silence still counts.'),
      ],
    }),
    unit({
      id: 'punjabi-greetings', subject: 'Punjabi & Sikh heritage', strand: 'Punjabi language exposure', minutes: 8, mode: 'play',
      objective: 'Let Punjabi words, greetings and family warmth become familiar sounds in daily life',
      materials: 'Your voice, folded hands, a familiar family object',
      prep: 'Agree with your family on the exact pronunciation of each word. Use real family words, not invented quotations.',
      steps: careSteps, questions: observeQuestions, ...common,
      focuses: [
        focus('Sat Sri Akal at morning', 'Greet your baby with folded hands and say "Sat Sri Akal" once, slowly and warmly.', 'How did your baby respond to the familiar greeting?', 'A look, a wriggle or a babble are all responses.', 'Fold your hands, say the greeting once and wait with a smile.', 'Expected: shared attention for a moment. Repeat the ritual daily, not as a lesson.'),
        focus('Family words for water and milk', 'Offer a cup and say "paani" once before handing it over, then pause.', 'Which family word did they hear during a familiar routine?', 'Words tied to daily care are noticed most easily.', 'Use one Punjabi family word during a real care moment and pause.', 'Expected: your baby attends to the object or to your face. No imitation is expected.'),
        focus('A short shabad or lullaby line', 'Hum one short, accurately remembered line from a family devotional song in a gentle voice.', 'Did the familiar melody seem soothing?', 'A relaxed body or quiet attention often follows a familiar melody.', 'Sing one short line quietly while holding your baby, then pause.', 'Expected: calm shared attention. Use only words you know are accurate; do not invent quotations.'),
        focus('Names of people who love them', 'Say one family name in Punjabi, pause, then say it again while the person smiles nearby.', 'Whose name brought a look or a smile?', 'Familiar people usually draw the strongest response.', 'Say one loved person’s name and wait for the baby to look between you.', 'Expected: a look, a smile or a sound. Keep it warm and brief.'),
      ],
    }),
    unit({
      id: 'texture-basket', subject: 'Sensory play', strand: 'Safe touch exploration', minutes: 9, mode: 'play',
      objective: 'Offer safe, contrasting textures and follow your baby’s own exploration',
      materials: 'A large soft cloth, a smooth wooden spoon, a clean silicone cup (all large enough to be safe)',
      prep: 'Wash the items, check for loose parts and keep them within your reach for the whole activity.',
      steps: sensorySteps, questions: sensoryQuestions, ...common,
      focuses: [
        focus('Soft cloth and smooth spoon', 'Place the cloth in one hand and the wooden spoon in the other; say "soft" then "smooth" once each.', 'Which item did your baby hold onto longest?', 'Contrasting surfaces often lead to a clear preference.', 'Offer the cloth and the spoon side by side and let one hand choose.', 'Expected: your baby grasps, mouths or taps one item. Either choice is a valid response.'),
        focus('Warm and cool clean cloths', 'Offer one cloth at room temperature and one briefly warmed in your hands, saying "warm" once.', 'Did your baby notice the difference in the cloths?', 'They may pause, pat or change hands.', 'Place two clean cloths nearby and wait without guiding their hand.', 'Expected: a brief pause or a second pat. Never use anything hot.'),
        focus('Bumpy and flat surfaces', 'Let a finger travel over a ridged silicone cup, then over a flat board, with one word each.', 'Which surface did they return to?', 'Babies often repeat a novel sensation.', 'Offer a ridged cup and a flat board, then wait and watch.', 'Expected: a repeat touch or a longer look at one surface.'),
        focus('Fabric in and out of a basket', 'Slowly pull a large cloth from a basket, pause, then tuck it back while saying "in" and "out".', 'What did your baby do as the cloth disappeared?', 'A look back at the basket shows curiosity.', 'Hide half of a large cloth in a basket and give them time to pull it.', 'Expected: a reach, a look or a babble. Keep the cloth large and breathable.'),
      ],
    }),
    unit({
      id: 'water-play', subject: 'Sensory play', strand: 'Supervised water discovery', minutes: 9, mode: 'play',
      objective: 'Provide calm, fully supervised water play with simple cause-and-effect moments',
      materials: 'A shallow tray with 2 cm of lukewarm water, a large cup, a towel, a waterproof mat',
      prep: 'Never leave your baby near water unattended, even briefly. Keep the tray on the floor and dry the area afterwards.',
      steps: sensorySteps, questions: sensoryQuestions, ...common,
      focuses: [
        focus('A gentle splash', 'Pat the water once with your flat hand, pause, then say "splash" in a soft voice.', 'How did your baby react to the small splash?', 'A blink, a stillness or a pat are all responses.', 'Make one tiny splash and wait five seconds before repeating.', 'Expected: a look or a hand movement toward the water. Stop if they seem surprised.'),
        focus('Pour and pause', 'Tip a cup so a little water falls back into the tray, then hold the cup still.', 'Did your baby watch the water fall?', 'Falling water often holds attention briefly.', 'Pour a small amount once, then pause with the cup in view.', 'Expected: a brief look toward the tray or the cup.'),
        focus('Float a large lid', 'Place a large light plastic lid on the surface and let it move without pushing it.', 'What did your baby do when the lid moved?', 'They may track it with their eyes or reach.', 'Set one large floating lid in the tray and wait.', 'Expected: eye tracking or a reach. Use only one large safe item.'),
        focus('Wet and dry hands', 'Offer one damp hand to pat and one dry hand, saying "wet" then "dry" once each.', 'Which hand did they pat again?', 'A repeat pat often shows a preference.', 'Place both hands nearby and let your baby choose without guidance.', 'Expected: a pat or a brief pause on one hand. Dry and cuddle afterwards.'),
      ],
    }),
    unit({
      id: 'light-and-shadow', subject: 'Sensory play', strand: 'Watching light and shadow', minutes: 8, mode: 'play',
      objective: 'Let your baby notice gentle changes in light, shadow and movement',
      materials: 'A bright window, a plain light-coloured cloth, your hands (no screens or flashing lights)',
      prep: 'Use natural daylight only. Never shine a bright light into your baby’s eyes.',
      steps: sensorySteps, questions: sensoryQuestions, ...common,
      focuses: [
        focus('A cloth drifting in daylight', 'Hold a light cloth near a window and let it move slowly in the air, without shaking it.', 'How long did your baby watch the moving cloth?', 'Even a few seconds of tracking is meaningful.', 'Let the cloth move once and pause with it held still.', 'Expected: a brief look toward the cloth or a change in movement.'),
        focus('Hand shadows on a wall', 'Make one slow hand shape on a sunlit wall and hold it still for five seconds.', 'Did your baby notice the shape on the wall?', 'They may look between your hand and the wall.', 'Make one still hand shadow and wait quietly.', 'Expected: a look toward the wall or toward your hand.'),
        focus('Bright and shaded spots', 'Sit in a shaded patch, then move together into a soft bright patch, pausing in each.', 'What changed when you moved into the light?', 'A blink, a squint or a look upward are common.', 'Move slowly once between the two patches and pause.', 'Expected: any small reaction to the change. Avoid direct sun in their eyes.'),
        focus('A slowly disappearing object', 'Cover a large soft ball with a cloth, wait, then lift the cloth again with a smile.', 'Did your baby look for the ball?', 'A look back to the same spot shows anticipation.', 'Hide the ball once under the cloth and give them time to respond.', 'Expected: a look, a reach or a babble. One hiding is enough.'),
      ],
    }),
    unit({
      id: 'reach-and-roll', subject: 'Movement & wellbeing', strand: 'Reaching and rolling', minutes: 9, mode: 'play',
      objective: 'Invite self-led reaching, rolling and turning during safe floor play',
      materials: 'A soft mat, one favourite large toy, a rolled towel for your own support',
      prep: 'Use a clear floor space. Never place your baby in a position they cannot get into or out of by themselves.',
      steps: movementSteps, questions: movementQuestions, ...common,
      focuses: [
        focus('Reaching for a nearby toy', 'Place a favourite toy a small distance to one side of their hand and wait without moving it closer.', 'What did your baby do to reach the toy?', 'A stretch, a lean or a roll all count.', 'Set the toy just within an easy reach and stay close.', 'Expected: one self-initiated stretch or shift toward the toy.'),
        focus('Turning toward a voice', 'Sit slightly to one side and call their name softly, waiting for them to turn toward you.', 'How did your baby turn toward your voice?', 'They may turn only their eyes at first.', 'Call once from one side and give them plenty of time.', 'Expected: any head or eye turn in your direction.'),
        focus('Rolling with a favourite sound', 'Place a soft rattle just beside their shoulder and let the sound invite a turn.', 'Which side did they choose to turn toward?', 'Babies often favour one side for a while.', 'Offer one gentle sound from one side and wait.', 'Expected: a small weight shift or a turn. Do not assist the roll.'),
        focus('Tummy time with a face', 'Lie facing them at floor level and talk softly so your face is the interesting thing to look at.', 'How long did they comfortably lift or turn their head?', 'Short comfortable moments matter more than duration.', 'Lie opposite your baby for one unhurried minute.', 'Expected: a brief comfortable head lift or turn. Stop at the first sign of tiredness.'),
      ],
    }),
    unit({
      id: 'cruise-and-carry', subject: 'Movement & wellbeing', strand: 'Carrying, cruising and balance', minutes: 9, mode: 'play',
      objective: 'Support safe, self-led movement and carrying during everyday play',
      materials: 'A stable low sofa edge, two large soft blocks, a clear floor space',
      prep: 'Check furniture cannot tip and remove hard edges. Stay within arm’s reach throughout.',
      steps: movementSteps, questions: movementQuestions, ...common,
      focuses: [
        focus('Carrying one soft block', 'Offer one large soft block, then wait while they decide what to do with it.', 'Did your baby hold or move the block?', 'Holding, dropping or tapping are all exploration.', 'Hand over one large soft block and pause.', 'Expected: a grasp, a pat or a deliberate drop.'),
        focus('Two blocks, one in each hand', 'Offer a second large soft block only after they have explored the first.', 'What happened when both hands were full?', 'They may look between them or bring them together.', 'Offer a second soft block and watch without suggesting an action.', 'Expected: a look between the blocks or a simple bang together.'),
        focus('Side steps along a sofa', 'Place a favourite toy on a stable low sofa cushion and stay beside them as they shift weight.', 'Did they shift weight toward the toy?', 'A small lean or side step is enough.', 'Put the toy on the cushion and remain close without holding them up.', 'Expected: a brief weight shift or a single supported side step.'),
        focus('Squat and return with help nearby', 'Place a soft toy on the floor and let them lower themselves while you stay close.', 'How did your baby return to sitting?', 'They may plop, pivot or simply sit back.', 'Set one toy on the floor and give them time to explore lowering and rising.', 'Expected: one self-led change of position. Never pull them upright.'),
      ],
    }),
    unit({
      id: 'rhythm-and-cuddle', subject: 'Music & connection', strand: 'Songs, turn-taking and calm', minutes: 8, mode: 'play',
      objective: 'Use short songs and turn-taking games to build anticipation, connection and calm',
      materials: 'Your voice, your hands, a soft blanket',
      prep: 'Choose one short, accurately remembered family song. Keep the room calm and screens off.',
      steps: musicSteps, questions: [
        'Which part of the song or game made your baby vocalise or move?',
        'How did they show you they wanted the familiar moment to continue?',
      ], ...common,
      focuses: [
        focus('A pause before the last word', 'Sing one short line and stop just before its final word, waiting with an expectant smile.', 'What did your baby do in the pause?', 'A wriggle, a look or a babble can fill the gap.', 'Sing a familiar line and leave the last word out once.', 'Expected: any small response in the pause; quietly finish the line afterwards.'),
        focus('Peekaboo with a soft cloth', 'Cover your face briefly with a large soft cloth, then lower it and say "hello" warmly.', 'Did your baby anticipate your face returning?', 'A look toward the cloth or a smile often appears.', 'Hide your face once for two seconds and wait before reappearing.', 'Expected: a look, a smile or a sound. Keep it slow and gentle.'),
        focus('Clap one gentle rhythm', 'Clap twice slowly, pause, then clap the same two again while smiling.', 'How did your baby join the rhythm?', 'They may move their arms, bounce or vocalise.', 'Clap a slow two-beat pattern once and wait.', 'Expected: any small movement or sound in response.'),
        focus('A calm wind-down song', 'Sing one quiet line while rocking gently, then sit in silence for a few seconds.', 'What helped your baby settle at the end?', 'A slower tempo and a predictable ending are usually soothing.', 'Sing one short line softly, then hold a calm pause.', 'Expected: a quieter body or a relaxed gaze. End with a cuddle.'),
      ],
    }),
  ],
};
