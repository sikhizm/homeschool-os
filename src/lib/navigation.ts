export type NavigationLink={href:string;label:string};
export type NavigationContext={label:string;links:NavigationLink[]};
export type ShellDestination={id:string;href:string;label:string;glyph:string;hint:string;match:string[]};
const within=(pathname:string,route:string)=>pathname===route||pathname.startsWith(route+'/');
export function navigationForPath(pathname:string){
 const activePrimary=within(pathname,'/dashboard')?'home'
  :within(pathname,'/planning')?'planner'
  :['/curriculum-studio','/curriculum','/curriculum-mapping','/global-curriculum','/ncert-books','/learning-pathways','/roadmap'].some(route=>within(pathname,route))?'explore'
  :within(pathname,'/lessons')?'activities'
  :['/portfolio','/reports'].some(route=>within(pathname,route))?'progress':null;
 let context:NavigationContext|null=null;
 if(within(pathname,'/planning'))context={label:'Plan your week',links:[
  {href:'/dashboard',label:'Daily coach'},
  {href:'/planning',label:'Weekly planner'},
  {href:'/curriculum',label:'Curriculum'},
 ]};
 else if(within(pathname,'/lessons'))context={label:'Learning workspace',links:[
  {href:'/lessons',label:'Activity library'},
  {href:'/planning',label:'Weekly planner'},
  {href:'/curriculum-studio',label:'Curriculum studio'},
 ]};
 else if(['/curriculum-studio','/curriculum','/curriculum-mapping','/global-curriculum','/ncert-books','/learning-pathways','/roadmap'].some(route=>within(pathname,route)))context={label:'Explore learning',links:[
  {href:'/curriculum-studio',label:'Curriculum studio'},
  {href:'/curriculum-mapping',label:'Mapping review'},
  {href:'/learning-pathways',label:'Annual pathways'},
  {href:'/curriculum',label:'Competencies'},
  {href:'/global-curriculum',label:'Global pathways'},
  {href:'/ncert-books',label:'NCERT books'},
 ]};
 else if(['/portfolio','/reports'].some(route=>within(pathname,route)))context={label:'Your progress',links:[
  {href:'/portfolio',label:'Portfolio'},
  {href:'/reports',label:'Insights'},
 ]};
 else if(within(pathname,'/learn'))context={label:'Learner mode',links:[
  {href:'/learn',label:'My space'},
  {href:'/learn/path',label:'Learning path'},
  {href:'/lessons',label:'Activity library'},
 ]};
 return {activePrimary,context};
}
/** Compact desktop sidebar — seven parent destinations, no administrative wall. */
export const sidebarDestinations:ShellDestination[]=[
 {id:'home',href:'/dashboard',label:'Home',glyph:'⌂',hint:'Today’s family learning plan',match:['/dashboard']},
 {id:'plan',href:'/planning',label:'Learning Plan',glyph:'▦',hint:'Daily coach and weekly planner',match:['/planning']},
 {id:'learners',href:'/learners',label:'Learners',glyph:'☺',hint:'Profiles and learning spaces',match:['/learners']},
 {id:'library',href:'/library',label:'Curriculum Library',glyph:'❖',hint:'Books, pathways and activities',match:['/library','/ncert-books','/curriculum','/curriculum-mapping','/curriculum-studio','/global-curriculum','/learning-pathways','/roadmap','/lessons']},
 {id:'progress',href:'/reports',label:'Progress',glyph:'↗',hint:'Learning insights and reviews',match:['/reports']},
 {id:'portfolio',href:'/portfolio',label:'Family Portfolio',glyph:'❋',hint:'Work, milestones and discoveries',match:['/portfolio']},
 {id:'settings',href:'/settings',label:'Settings',glyph:'⚙',hint:'Family account and app settings',match:['/settings']},
];
/** Fixed mobile bottom navigation — five destinations, never a shrunken sidebar. */
export const bottomDestinations:ShellDestination[]=[
 {id:'home',href:'/dashboard',label:'Home',glyph:'⌂',hint:'Today’s family learning plan',match:['/dashboard']},
 {id:'learn',href:'/learn',label:'Learn',glyph:'▶',hint:'Learner mode and personal paths',match:['/learn']},
 {id:'library',href:'/library',label:'Library',glyph:'❖',hint:'Curriculum library',match:['/library','/ncert-books','/curriculum','/curriculum-mapping','/curriculum-studio','/global-curriculum','/learning-pathways','/roadmap','/lessons']},
 {id:'progress',href:'/reports',label:'Progress',glyph:'↗',hint:'Learning insights',match:['/reports']},
 {id:'settings',href:'/settings',label:'Profile',glyph:'☺',hint:'Profile, family tools and settings',match:['/settings','/learners','/portfolio']},
];
export function shellDestinationIsActive(pathname:string,destination:ShellDestination){
 return destination.match.some(route=>within(pathname,route));
}
export function activeShellDestination(pathname:string,destinations:ShellDestination[]){
 return destinations.find(destination=>shellDestinationIsActive(pathname,destination))??null;
}
/** Routes that render inside the authenticated app shell. */
export const privateRoutes=['/learning-pathways','/roadmap','/dashboard','/planning','/learners','/library','/settings','/learn','/curriculum','/curriculum-mapping','/global-curriculum','/curriculum-studio','/ncert-books','/lessons','/portfolio','/reports','/november-pilot'];
export function isPrivateRoute(pathname:string){
 return privateRoutes.some(route=>within(pathname,route));
}
export function navigationLinkIsActive(pathname:string,href:string){
 if(href==='/dashboard')return within(pathname,'/dashboard');
 return within(pathname,href);
}
