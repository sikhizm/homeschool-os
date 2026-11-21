import type {SVGProps} from 'react';

export type LearnerIconName =
  'users'|'book'|'path'|'folder'|'chart'|'layers'|'home'|'calendar'|
  'target'|'cap'|'sprout'|'settings'|'edit'|'archive'|'check'|'chevron';

export default function LearnerIcon({name,...props}:{name:LearnerIconName}&SVGProps<SVGSVGElement>){
 return <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
  stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
  aria-hidden="true" focusable="false" {...props}>
  {name==='users'&&<><circle cx="9" cy="8" r="3.3"/><path d="M2.8 20v-2a6 6 0 0 1 12 0v2M17 5a3.3 3.3 0 0 1 0 6M17 14a5.5 5.5 0 0 1 4.2 5.3V20"/></>}
  {name==='book'&&<><path d="M12 6C9 4 6 3.5 2 4v15c4-.5 7 0 10 2M12 6c3-2 6-2.5 10-2v15c-4-.5-7 0-10 2M12 6v15"/></>}
  {name==='path'&&<><path d="M3 17c5-11 9 0 14-8M15 5h5v5M8 18h12"/><circle cx="4" cy="18" r="1"/></>}
  {name==='folder'&&<><path d="M3 7a2 2 0 0 1 2-2h5l2.5 2.5H19a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></>}
  {name==='chart'&&<><path d="M4 20V12M10 20V7M16 20V4M22 20v-9" strokeWidth="3"/><path d="M2 21h21" strokeWidth="1.5"/></>}
  {name==='layers'&&<><path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5"/></>}
  {name==='home'&&<><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></>}
  {name==='calendar'&&<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M8 14h3M8 17h3"/></>}
  {name==='target'&&<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>}
  {name==='cap'&&<><path d="m2 9 10-5 10 5-10 5-10-5ZM6 12v5c4 3 8 3 12 0v-5M22 9v8"/></>}
  {name==='sprout'&&<><path d="M12 21V11M12 15c-5 0-8-3-8-8 5 0 8 3 8 8ZM12 12c0-5 3-8 8-8 0 5-3 8-8 8Z"/></>}
  {name==='settings'&&<><circle cx="12" cy="12" r="3.2"/><path d="M19 12a7 7 0 0 0-.2-1.7l2-1.5-2-3.5-2.3 1a7 7 0 0 0-2.7-1.6L13.5 2h-4L9 4.7a7 7 0 0 0-2.7 1.6l-2.3-1-2 3.5 2 1.5a7 7 0 0 0 0 3.4l-2 1.5 2 3.5 2.3-1A7 7 0 0 0 9 19.3l.5 2.7h4l.3-2.7a7 7 0 0 0 2.7-1.6l2.3 1 2-3.5-2-1.5A7 7 0 0 0 19 12Z"/></>}
  {name==='edit'&&<><path d="m4 16 11-11a2 2 0 0 1 3 3L7 19l-4 1Z M13 7l4 4"/></>}
  {name==='archive'&&<><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 14h4"/></>}
  {name==='check'&&<><path d="m4 12 5 5L20 6"/></>}
  {name==='chevron'&&<><path d="m8 10 4 4 4-4"/></>}
 </svg>;
}
