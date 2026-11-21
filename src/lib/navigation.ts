export type NavigationLink={href:string;label:string};
export type NavigationContext={label:string;links:NavigationLink[]};
export type ShellDestination={id:string;href:string;label:string;glyph:string;hint:string;match:string[]};
const within=(pathname:string,route:string)=>pathname===route||pathname.startsWith(route+'/');
export function navigationForPath(pathname:string){
 const activePrimary=within(pathname,'/dashboard')?'home'
  :within(pathname,'/planning')?'planner'
  :['/curriculum-mapping','/global-curriculum','/ncert-books','/roadmap'].some(route=>within(pathname,route))?'explore'
  :within(pathname,'/reports')?'progress':null;
 let context:NavigationContext|null=null;
 if(within(pathname,'/planning'))context={label:'Plan your week',links:[
  {href:'/dashboard',label:'Daily coach'},
  {href:'/planning',label:'Weekly planner'},
 ]};
 else if(within(pathname,'/library'))context={label:'Learning library',links:[
  {href:'/library',label:'Library'},
  {href:'/library/my-books',label:'My Books'},
  {href:'/library/prompts',label:'Learning Prompts'},
  {href:'/library/olympiad',label:'Olympiad Resources'},
  {href:'/library/enrichment',label:'Supplementary resources'},
 ]};
 else if(['/curriculum-mapping','/global-curriculum','/ncert-books','/roadmap'].some(route=>within(pathname,route)))context={label:'Explore learning',links:[
  {href:'/global-curriculum',label:'Global pathways'},
  {href:'/ncert-books',label:'NCERT books'},
 ]};
 else if(within(pathname,'/learn'))context={label:'Learning Path',links:[
  {href:'/learn/path',label:'Learning path'},
 ]};
 return {activePrimary,context};
}
/** Compact desktop sidebar — seven parent destinations, no administrative wall. */
export const sidebarDestinations:ShellDestination[]=[
 {id:'home',href:'/dashboard',label:'Home',glyph:'⌂',hint:'Today’s family learning plan',match:['/dashboard']},
 {id:'plan',href:'/planning',label:'Learning Plan',glyph:'▦',hint:'Daily coach and weekly planner',match:['/planning']},
 {id:'learners',href:'/learners',label:'Learners',glyph:'☺',hint:'Profiles and learning spaces',match:['/learners']},
 {id:'library',href:'/library',label:'Curriculum Library',glyph:'❖',hint:'Books, pathways and activities',match:['/library','/ncert-books','/curriculum-mapping','/global-curriculum','/roadmap']},
 {id:'progress',href:'/reports',label:'Progress',glyph:'↗',hint:'Learning insights and reviews',match:['/reports']},
 {id:'portfolio',href:'/challenges',label:'Challenges & Rewards',glyph:'❋',hint:'Assign challenges and track rewards',match:['/challenges']},
 {id:'settings',href:'/settings',label:'Settings',glyph:'⚙',hint:'Family account and app settings',match:['/settings']},
];
/** Fixed mobile bottom navigation — five destinations, never a shrunken sidebar. */
export const bottomDestinations:ShellDestination[]=[
 {id:'home',href:'/dashboard',label:'Home',glyph:'⌂',hint:'Today’s family learning plan',match:['/dashboard']},
 {id:'plan',href:'/planning',label:'Planner',glyph:'▦',hint:'Weekly and yearly learning plans',match:['/planning']},
 {id:'library',href:'/library',label:'Library',glyph:'❖',hint:'Curriculum library',match:['/library','/ncert-books','/curriculum-mapping','/global-curriculum','/roadmap']},
 {id:'progress',href:'/reports',label:'Progress',glyph:'↗',hint:'Learning insights',match:['/reports']},
 {id:'settings',href:'/settings',label:'Profile',glyph:'☺',hint:'Profile, family tools and settings',match:['/settings','/learners']},
];
export function shellDestinationIsActive(pathname:string,destination:ShellDestination){
 return destination.match.some(route=>within(pathname,route));
}
export function activeShellDestination(pathname:string,destinations:ShellDestination[]){
 return destinations.find(destination=>shellDestinationIsActive(pathname,destination))??null;
}
/** Routes that render inside the authenticated app shell. */
export const privateRoutes=['/roadmap','/dashboard','/planning','/learners','/library','/settings','/learn','/curriculum-mapping','/global-curriculum','/ncert-books','/challenges','/reports','/november-pilot','/study-reader'];
export function isPrivateRoute(pathname:string){
 return privateRoutes.some(route=>within(pathname,route));
}
export function navigationLinkIsActive(pathname:string,href:string){
 if(href==='/dashboard')return within(pathname,'/dashboard');
 if(href==='/library')return pathname==='/library';
 return within(pathname,href);
}
