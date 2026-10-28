/** Original family-pilot exemplars; not standardised assessments or official NCERT items. */
export type Diagnostic = { id:string; area:string; prompt:string; lookFor:string; adjustment:string };
export const class4Diagnostics:Diagnostic[] = [
 {id:'c4-place',area:'Place value',prompt:'Represent 4,307 using thousands, hundreds, tens and ones. Explain the value of 3.',lookFor:'Explains that 3 represents 300, not 3.',adjustment:'Use place-value cards and bundles before written work.'},
 {id:'c4-operations',area:'Addition and subtraction',prompt:'Calculate 2,485 + 176 and 3,002 − 468. Explain how you checked one answer.',lookFor:'Correct regrouping and a sensible estimate or inverse check.',adjustment:'Use expanded form and base-ten representations.'},
 {id:'c4-tables',area:'Multiplication',prompt:'Show 6 × 8 using an array or groups, then solve 48 ÷ 6.',lookFor:'Recognises inverse operations, not just memorised facts.',adjustment:'Build arrays using counters.'},
 {id:'c4-fractions',area:'Fractions',prompt:'Draw 3/4 of a rectangle and compare 1/2 with 2/4 using equal-sized wholes.',lookFor:'Partitions equally and recognises equivalent quantities.',adjustment:'Fold matching paper strips into equal parts.'},
 {id:'c4-decimals',area:'Decimal understanding',prompt:'Place 0.4 and 0.35 on a 0–1 number line. Which is greater? Why?',lookFor:'Understands tenths and hundredths conceptually.',adjustment:'Use a hundred-square and money models.'},
 {id:'c4-units',area:'Measurement',prompt:'Estimate and then measure a book in centimetres. Explain the difference.',lookFor:'Reads a ruler from zero and chooses suitable units.',adjustment:'Practise aligning objects with ruler zero.'},
 {id:'c4-geometry',area:'Shapes and angles',prompt:'Sketch a rectangle and triangle, identify corners and sides, and recognise a right angle.',lookFor:'Names basic attributes rather than guessing from orientation.',adjustment:'Use paper folding and physical shape matching.'},
 {id:'c4-reading',area:'Reading comprehension',prompt:'Read an age-appropriate short passage aloud or independently. Retell the main idea and two details.',lookFor:'Meaning, sequence and comprehension; note decoding separately.',adjustment:'Adult read-aloud can isolate comprehension from decoding.'},
 {id:'c4-writing',area:'Written expression',prompt:'Write five connected sentences describing a recent observation.',lookFor:'Logical order, complete thoughts and understandable punctuation.',adjustment:'Say sentences aloud before writing.'},
 {id:'c4-inquiry',area:'Observation',prompt:'Look at a plant or local weather and state one observation, one question and one way to investigate.',lookFor:'Separates what was observed from what is assumed.',adjustment:'Model observation using one visible feature.'},
 {id:'c4-language',area:'Punjabi/Hindi oral language',prompt:'Choose one familiar story and retell it conversationally in Punjabi or Hindi.',lookFor:'Comfortable expression and sequence without penalising code-switching.',adjustment:'Invite gestures and short sentences.'},
 {id:'c4-reflection',area:'Learning habits',prompt:'Explain which activity was easy, tricky or enjoyable, and what help would be useful.',lookFor:'Can describe learning without shame or fixed labels.',adjustment:'Offer picture or emoji choices instead of a formal interview.'}
];
export const ukgDiagnostics:Diagnostic[] = [
 {id:'ukg-listen',area:'Listening',prompt:'After a short picture-book read-aloud, ask who, where and what happened first.',lookFor:'Responds with words, gestures or pictures.',adjustment:'Offer two picture choices and repeat the story.'},
 {id:'ukg-sound',area:'Sound awareness',prompt:'Play a rhyme or beginning-sound game with three familiar words.',lookFor:'Notices matching sounds without requiring spelling.',adjustment:'Use clapping and oral play.'},
 {id:'ukg-story',area:'Oral expression',prompt:'Invite a short story about a favourite toy or recent event.',lookFor:'Communicates an idea and some sequence.',adjustment:'Use prompts and accept home languages.'},
 {id:'ukg-count',area:'Counting',prompt:'Count up to ten safe objects, moving each once.',lookFor:'One-to-one correspondence, not only reciting numbers.',adjustment:'Start with three to five larger objects.'},
 {id:'ukg-match',area:'Number recognition',prompt:'Match written numerals 1–5 to matching groups of objects.',lookFor:'Connects quantities to numeral symbols.',adjustment:'Repeat with counters and no written demand.'},
 {id:'ukg-shape',area:'Shapes',prompt:'Find two circles, squares or triangles among safe household objects.',lookFor:'Identifies familiar shapes across size and orientation.',adjustment:'Compare one shape at a time.'},
 {id:'ukg-sort',area:'Sorting and patterns',prompt:'Sort objects by colour, then continue a clap-tap repeating pattern.',lookFor:'Recognises shared property and a simple repeated sequence.',adjustment:'Model one pattern together.'},
 {id:'ukg-motor',area:'Play and movement',prompt:'Draw freely, build with blocks, or follow a short movement sequence.',lookFor:'Enjoyment, comfortable fine/gross movement and attention at own pace.',adjustment:'Offer chunky crayons or large safe pieces.'}
];
export const preschoolBank = [
 {id:'pour',title:'Water pouring',minutes:8,materials:'Small jug, shallow tray and cups',activity:'Pour water between cups on a washable surface with supervision.',benefit:'Coordination, independence and practical life',safety:'Prevent spills and never leave children unattended near water.'},
 {id:'texture',title:'Texture matching',minutes:8,materials:'Large pieces of cloth with different textures',activity:'Touch and match fabrics with similar textures; describe with home-language words.',benefit:'Sensory language and observation',safety:'Avoid small parts or materials that shed fibres.'},
 {id:'nature',title:'Nature basket',minutes:10,materials:'Large safe leaves and supervised garden observations',activity:'Sort by shape and talk about colours and patterns.',benefit:'Classification, language and curiosity',safety:'Avoid unknown plants, fungi and items that could be swallowed.'},
 {id:'thread',title:'Large-piece threading',minutes:8,materials:'Large rings and thick cord',activity:'Thread rings with patient support.',benefit:'Fine motor coordination and concentration',safety:'Adult-supervised; no small beads, long loose loops or choking hazards.'},
 {id:'story',title:'Story objects',minutes:10,materials:'Large toys and a picture book',activity:'Choose objects to represent a beginning, middle and end.',benefit:'Narration, sequencing and imagination',safety:'Use age-safe toys and no fragile objects.'},
 {id:'rhythm',title:'Rhythm and movement',minutes:8,materials:'Hands, feet and safe open space',activity:'Repeat simple clap and stomp patterns.',benefit:'Listening and pattern memory',safety:'Adjust movement for comfort and space.'},
 {id:'care',title:'Help at home',minutes:8,materials:'Cloth and an unbreakable item',activity:'Offer a voluntary small tidy-up or dusting task.',benefit:'Care, autonomy and shared responsibility',safety:'No chemicals or sharp objects.'},
 {id:'colour',title:'Colour exploration',minutes:10,materials:'Paper and washable crayons',activity:'Make colours and shapes freely while naming discoveries.',benefit:'Creativity and hand control',safety:'Use non-toxic supplies with supervision.'}
];
export const infantGuidance = [
 {title:'Responsive conversation',note:'Narrate everyday care, respond to sounds and facial expressions, and share short songs.'},
 {title:'Supervised floor play',note:'Offer age-appropriate movement on a safe floor surface, with constant adult observation.'},
 {title:'Sensory exploration',note:'Let the child explore a few large, safe, clean textures while an adult supervises.'},
 {title:'Picture-book moments',note:'Point to large pictures, name objects, and stop when the child disengages.'},
 {title:'Outdoor noticing',note:'Carry or accompany the child safely for fresh-air observation when conditions allow.'},
 {title:'Safety first',note:'No independent screens, small objects, loose cords, choking hazards or unsupervised water play. Follow the child’s sleep and feeding needs.'}
];
export type PilotDay={date:string;theme:string;shared:string;class4:string;ukg:string;preschool:string;infant:string;reflection:string};
export const pilotWeek:PilotDay[]=[
 {date:'2026-11-02',theme:'Meet the learner',shared:'Read aloud and chat about the week',class4:'Baseline: place value and operations',ukg:'Listening and picture retell',preschool:'Story objects',infant:'Short responsive songs',reflection:'What did each learner enjoy?'},
 {date:'2026-11-03',theme:'Numbers around us',shared:'Count objects during a household routine',class4:'Baseline: multiplication and fractions',ukg:'Counting and number matching',preschool:'Water pouring',infant:'Floor play during supervised family time',reflection:'Where did reasoning need support?'},
 {date:'2026-11-04',theme:'Observe and describe',shared:'Look outside and describe the weather',class4:'Baseline: measurement and geometry',ukg:'Sort and match shapes',preschool:'Nature basket',infant:'Observe outdoor light and sounds safely',reflection:'Which materials worked well?'},
 {date:'2026-11-05',theme:'Words and stories',shared:'Tell a family story in a home language',class4:'Baseline: reading and written expression',ukg:'Oral story and rhyme play',preschool:'Texture matching',infant:'Short picture-book moment',reflection:'Separate comprehension from writing mechanics.'},
 {date:'2026-11-06',theme:'Investigate',shared:'Ask one question about a familiar plant or object',class4:'Baseline: inquiry and decimal model',ukg:'Pattern play and movement',preschool:'Rhythm and movement',infant:'Supervised texture exploration',reflection:'What observations were genuine?'},
 {date:'2026-11-07',theme:'Care and community',shared:'Talk about kindness and share a small act of seva',class4:'Punjabi/Hindi conversation and learning reflection',ukg:'Play-based fine motor observation',preschool:'Help at home',infant:'Responsive conversation with caregiver',reflection:'Which language and activities felt natural?'},
 {date:'2026-11-08',theme:'Family reflection',shared:'Family reading, art or a seasonal story with sources checked',class4:'Choose one area for gentle practice',ukg:'Favourite story or counting game',preschool:'Colour exploration',infant:'Play at the child’s pace',reflection:'What should change in the next week?'}
];
export const sharedMinutes={shared:15,class4:20,ukg:15,preschool:10} as const;
export function totalGuidedMinutes(){return Object.values(sharedMinutes).reduce((sum,n)=>sum+n,0);}
export function validatePilot():string[]{
 const issues:string[]=[];const ids=new Set<string>();const days=new Set<string>();
 for(const record of [...class4Diagnostics,...ukgDiagnostics]){if(ids.has(record.id))issues.push('duplicate '+record.id);ids.add(record.id);if(!record.lookFor||!record.adjustment)issues.push('incomplete '+record.id);}
 for(const day of pilotWeek){if(days.has(day.date))issues.push('duplicate date '+day.date);days.add(day.date);if(!day.reflection||!day.theme)issues.push('incomplete day '+day.date);}
 if(totalGuidedMinutes()!==60)issues.push('parent time must total 60 minutes');
 if(pilotWeek.length!==7)issues.push('pilot should contain seven days');
 return issues;
}
