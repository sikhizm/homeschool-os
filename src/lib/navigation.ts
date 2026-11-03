export type NavigationLink={href:string;label:string};
export type NavigationContext={label:string;links:NavigationLink[]};
const within=(pathname:string,route:string)=>pathname===route||pathname.startsWith(route+'/');
export function navigationForPath(pathname:string){
 const activePrimary=within(pathname,'/dashboard')?'home'
  :within(pathname,'/planning')?'planner'
  :['/curriculum-studio','/curriculum','/global-curriculum','/ncert-books','/learning-pathways','/roadmap'].some(route=>within(pathname,route))?'explore'
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
 else if(['/curriculum-studio','/curriculum','/global-curriculum','/ncert-books','/learning-pathways','/roadmap'].some(route=>within(pathname,route)))context={label:'Explore learning',links:[
  {href:'/curriculum-studio',label:'Curriculum studio'},
  {href:'/curriculum',label:'Learning pathways'},
  {href:'/global-curriculum',label:'Global pathways'},
  {href:'/ncert-books',label:'NCERT books'},
 ]};
 else if(['/portfolio','/reports'].some(route=>within(pathname,route)))context={label:'Your progress',links:[
  {href:'/portfolio',label:'Portfolio'},
  {href:'/reports',label:'Insights'},
 ]};
 return {activePrimary,context};
}
export function navigationLinkIsActive(pathname:string,href:string){
 if(href==='/dashboard')return within(pathname,'/dashboard');
 return within(pathname,href);
}
