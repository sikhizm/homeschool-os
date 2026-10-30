/**
 * Original, grade-specific pilot pathways. These are HOME learning activities,
 * not NCERT chapter titles, official outcomes, or a complete national syllabus.
 * Weeks describe relative sequence, not compulsory calendar deadlines.
 */
export type PathwayModule={
 id:string;grade:string;week:number;subject:string;title:string;minutes:number;
 objective:string;materials:string;steps:[string,string,string];check:string;source:'original-enrichment';
};
type Seed=[string,string,string,string,string,string,string];
type GradeSpec={grade:string;sections:Record<string,Seed[]>};
const plans:GradeSpec[]=[
 {grade:'Nursery',sections:{
  'Language & stories':[
   ['Name and respond','Respond to your name and familiar greetings','Family photos','Say each family member’s name slowly','Invite the child to point or respond','Play a short greeting game','Recognises a familiar name'],
   ['Picture naming','Name familiar objects in a picture','Picture book','Point to three familiar objects','Model each name without pressure','Invite the child to choose one and name it','Names or points to two objects'],
   ['Action rhymes','Follow a two-step rhyme using gestures','Familiar short rhyme','Demonstrate two easy actions','Repeat the rhyme while moving','Invite the child to lead the actions','Follows one or two gestures'],
   ['Story listening','Attend to a short story and notice a character','Picture book','Look at the cover together','Read a very short section aloud','Ask the child to point to a favourite picture','Identifies a picture or character']
  ],
  'Early mathematics':[
   ['Big and small','Compare the size of two safe objects','Two soft toys','Place the toys side by side','Describe big and small together','Ask the child to choose the bigger toy','Shows the bigger of two'],
   ['Sorting colours','Sort familiar objects by one colour','Large coloured blocks','Name two colours','Sort blocks into two groups','Let the child choose a group','Sorts a few objects by colour'],
   ['Counting to three','Count three movements with one-to-one matching','Open floor area','Clap slowly three times','Count steps together','Invite the child to repeat a count','Matches count to three actions'],
   ['Circle and square','Find circles and squares in household objects','Paper shapes','Show a large circle and square','Find safe matching household shapes','Trace an outline with a finger','Distinguishes two shapes with support']
  ],
  'Discovery & motor play':[
   ['Texture explorers','Describe smooth and rough items safely','Large safe fabric pieces','Touch two different textures','Offer descriptive words','Invite a matching texture choice','Notices a texture difference'],
   ['Nature looking','Notice one plant or outdoor feature','Safe window or garden view','Look outside together','Name what is visible','Draw or gesture what was seen','Points out a natural feature'],
   ['Movement pathway','Follow a short gross-motor route','Clear safe floor','Walk along an imaginary line','Add a gentle stop-and-go signal','Repeat at comfortable pace','Follows a movement direction'],
   ['Build a tower','Build and compare a simple block tower','Large age-safe blocks','Stack two blocks together','Let the child add another','Compare the tower to the blocks','Stacks several safe blocks']
  ],
  'Kindness & Punjabi':[
   ['Sharing a toy','Practise offering and receiving a toy','Favourite large toy','Model asking politely','Offer the toy to another family member','Thank the helper together','Practises a sharing exchange'],
   ['Punjabi greetings','Hear and use a simple Punjabi greeting','Family conversation','Say Sat Sri Akal together','Practise with a family member','Repeat naturally through play','Recognises a greeting'],
   ['Helping at home','Join an age-safe small family task','Soft cloth or large toys','Show how to put one toy away','Invite the child to tidy one item','Celebrate helping rather than speed','Participates in a safe tidy-up'],
   ['Feelings faces','Recognise happy and sad facial expressions','Mirror or drawn faces','Draw two expressive faces','Talk about how each may feel','Invite the child to point or imitate','Recognises one emotion']
  ]}},
 {grade:'UKG',sections:{
  'English literacy':[
   ['Initial sounds','Identify the first sound in common words','Object pictures','Say three familiar words clearly','Emphasise the first sound','Find two words sharing the sound','Identifies one starting sound'],
   ['Blend three sounds','Blend a simple consonant-vowel-consonant word','Letter cards','Model c-a-t slowly','Slide the letters together','Try another familiar short word','Blends one supported short word'],
   ['Sentence talk','Speak one complete sentence about a picture','Picture book','Observe one picture together','Model I can see a…','Invite a new full sentence','Speaks a simple sentence'],
   ['Retell a story','Retell beginning and ending of a short story','Short picture story','Read and show key pictures','Ask what happened first','Ask how it finished','Retells two key events']
  ],
  'Number sense':[
   ['Count to twenty','Count objects using one-to-one correspondence','20 safe counters','Count a small group first','Add counters to reach twenty','Check by moving each counter once','Counts a group with support'],
   ['More and fewer','Compare quantities to ten','Two groups of blocks','Arrange two small sets','Count each set together','Identify which has more','Compares two small quantities'],
   ['Make ten','Find number pairs adding to ten','Ten large counters','Make a group of ten','Separate into two groups','Try another split and describe it','Shows one pair totaling ten'],
   ['Simple addition','Represent addition within ten','Large counters','Tell a short combining story','Move counters to join groups','Count the combined amount','Models one addition story']
  ],
  'Our world & creativity':[
   ['Plant observation','Observe plant parts without damaging them','Leafy plant or picture','Look at roots, stem and leaves','Describe each visible part','Draw a plant and label orally','Names two plant parts'],
   ['Healthy routines','Explain a daily hygiene habit','Paper and crayons','Discuss handwashing','Role-play a safe hygiene sequence','Draw a routine reminder','Describes one hygiene action'],
   ['Pattern making','Make a repeating visual pattern','Large coloured blocks','Make an AB pattern','Invite the child to continue','Create a different pattern','Extends a short pattern'],
   ['Tell with art','Describe a drawing using details','Paper and colours','Choose a familiar topic','Draw for several minutes','Describe who or what appears','Explains their own drawing']
  ],
  'Hindi Punjabi & character':[
   ['Hindi listening','Follow a simple Hindi instruction','Everyday household objects','Give one clear Hindi instruction','Model its meaning together','Repeat with a different object','Follows a familiar instruction'],
   ['Gurmukhi introduction','Recognise a few Gurmukhi letter shapes','Large handwritten cards','Show two distinct letters','Say the sounds accurately','Match a named letter card','Recognises one taught shape'],
   ['Seva through action','Help with a small voluntary household task','Safe household objects','Talk about helping without reward','Choose one simple task','Reflect on how it helped','Explains a kind action'],
   ['Describe feelings','Use words for feelings and seek help','Emotion cards','Name common feelings','Discuss what may cause them','Practise asking for help','Names a feeling and help choice']
  ]}},
 {grade:'Class 4',sections:{
  'English enrichment':[
   ['Main idea detective','Identify the main point of a short paragraph','Age-suitable paragraph','Read a short passage together','Underline two important clues','Write one sentence explaining the main idea','States a supported main idea'],
   ['Vocabulary in context','Infer a word meaning using nearby sentences','Short passage and pencil','Choose an unfamiliar nontechnical word','Find context clues','Write a possible meaning and check it','Explains a word with evidence'],
   ['Compare characters','Compare motives and choices in a story','Age-appropriate story','Identify two characters','Create a similarities/differences chart','Explain a choice made by each character','Makes one text-supported comparison'],
   ['Write a letter','Organize a short purposeful friendly letter','Paper and sample layout','Identify a recipient and purpose','Draft greeting body and closing','Revise for clarity and spelling','Produces a coherent short letter']
  ],
  'Mathematical reasoning':[
   ['Estimate then measure','Estimate lengths and validate with measuring','Ruler and household objects','Estimate the length of three objects','Measure carefully in centimetres','Compare estimate with measurement','Explains one measurement difference'],
   ['Multiplication models','Explain multiplication through equal groups','Counters or drawn circles','Arrange equal groups of objects','Write matching repeated addition','Describe the multiplication meaning','Shows equal-group reasoning'],
   ['Fraction sharing','Model equal halves quarters and comparison','Paper circles','Fold paper into equal parts','Label the fractions','Explain why unequal parts are not halves','Identifies equal fractional parts'],
   ['Data investigation','Collect and interpret a small household dataset','Paper and pencil','Ask a simple countable question','Record responses in a tally table','Draw bars and explain a finding','Explains one result from data']
  ],
  'Science & inquiry':[
   ['Ask a testable question','Separate observation from a prediction','Paper and safe objects','Observe a familiar situation','Make a prediction and record it','Discuss how to check fairly','Distinguishes question from result'],
   ['Materials sorting','Classify materials by observable property','Safe paper metal and fabric samples','Describe texture and flexibility','Sort based on one property','Justify why items belong together','Gives an observable classification reason'],
   ['Plant needs','Explain how plants depend on suitable conditions','Plant and observation sheet','Observe a healthy plant safely','List light water and air needs','Record changes over a few days','Names conditions supporting plants'],
   ['Sky journal','Record changes in the visible sky','Notebook and safe window','Sketch the visible sky','Add date and descriptive words','Compare observations on later days','Describes an observed difference']
  ],
  'Punjabi & life skills':[
   ['Read Gurmukhi words','Practise reading familiar age-suitable words','Handwritten familiar word cards','Read each word slowly','Identify sounds and letters','Use the word in a short sentence','Reads familiar words with support'],
   ['Sikh heritage timeline','Place sourced historical events in order','Verified child-appropriate source','Choose three source-checked events','Write their order on cards','Explain why source checking matters','Orders the selected events'],
   ['Budget choices','Make sensible decisions within a small imagined budget','Paper and price examples','List three needs and wants','Add prices within a fixed budget','Discuss one trade-off','Explains a choice using simple arithmetic'],
   ['Community kindness','Plan and reflect on a safe seva activity','Notebook','Choose an age-appropriate family-approved task','Perform it with supervision','Write a reflection without claiming a reward','Describes service and its impact']
  ]}}
];
export const pathwayModules:PathwayModule[]=plans.flatMap(plan=>Object.entries(plan.sections).flatMap(([subject,seeds])=>seeds.map((s,i)=>({
 id:'pathway:'+plan.grade.toLowerCase().replace(/\s+/g,'-')+':'+subject.toLowerCase().replace(/[^a-z0-9]+/g,'-')+':'+String(i+1),
 grade:plan.grade,week:i+1,subject,title:s[0],minutes:plan.grade==='Nursery'?10:plan.grade==='UKG'?15:20,
 objective:s[1],materials:s[2],steps:[s[3],s[4],s[5]] as [string,string,string],check:s[6],source:'original-enrichment' as const
}))));
export function modulesForGrade(grade:string){return pathwayModules.filter(x=>x.grade===grade)}
export function pathwayAudit(){
 return ['Nursery','UKG','Class 4'].map(grade=>{
  const modules=modulesForGrade(grade);const subjects=[...new Set(modules.map(m=>m.subject))];
  return {grade,modules:modules.length,subjects:subjects.length,plannedWeeks:Math.max(0,...modules.map(m=>m.week)),status:'original-enrichment-pilot' as const};
 });
}
