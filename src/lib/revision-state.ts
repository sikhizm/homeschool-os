/** Three adaptive revision states, derived from recorded evidence only. */

export type RevisionState='confident'|'practising'|'needs-support';

export type Evidence={
 completed:number;
 understood:number;
 mastered:number;
 independentRecall:number;
 hasRevisionQueue:boolean;
};

export type StateView={
 state:RevisionState;
 label:string;
 recommendation:string;
};

/**
 * Confident: lasting mastery or independent recall recorded.
 * Practising: understanding recorded, recall still to come.
 * Needs support: anything sitting in the revision queue.
 */
export function revisionState(evidence:Evidence):StateView{
 if(evidence.hasRevisionQueue)return{
  state:'needs-support',
  label:'Needs support',
  recommendation:'Let’s revisit the tricky bit together for five minutes — short and gentle beats long and forced.',
 };
 if(evidence.mastered>0||evidence.independentRecall>0)return{
  state:'confident',
  label:'Confident',
  recommendation:'Lasting recall is showing. We’ll space the next check a little further out.',
 };
 if(evidence.understood>0||evidence.completed>0)return{
  state:'practising',
  label:'Practising',
  recommendation:'Understanding is in — a short recall check will tell us if it is sticking.',
 };
 return{
  state:'practising',
  label:'Getting started',
  recommendation:'Complete the first activity and we’ll set the right pace from there.',
 };
}
