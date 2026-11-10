/** Age-adapted learner tiers: which home layout suits a learning stage. */

export type LearnerTier='toddler'|'preschool'|'early-primary'|'independent';

const TODDLER=['infant','toddler'];
const PRESCHOOL=['early years','nursery','lkg'];
const EARLY_PRIMARY=['ukg','class 1','class 2'];

/** Maps a learner's stage string to its presentation tier. */
export function learnerTier(stage:string):LearnerTier{
 const s=stage.trim().toLowerCase();
 if(TODDLER.some(x=>s.startsWith(x)))return 'toddler';
 if(PRESCHOOL.some(x=>s===x||s.startsWith(x)))return 'preschool';
 if(EARLY_PRIMARY.some(x=>s===x||s.startsWith(x)))return 'early-primary';
 return 'independent';
}

/** Short human label for a tier. */
export function tierLabel(tier:LearnerTier):string{
 return{
  toddler:'Parent-led · screen-free',
  preschool:'Play-based discovery',
  'early-primary':'Guided first steps',
  independent:'Independent learner',
 }[tier];
}
