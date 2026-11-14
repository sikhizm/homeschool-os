import sanitizeHtml from 'sanitize-html';

const OPTIONS:sanitizeHtml.IOptions={
 allowedTags:['h1','h2','h3','h4','p','br','hr','strong','b','em','i','u','s','blockquote','ul','ol','li','table','thead','tbody','tfoot','tr','th','td','caption','sup','sub','pre','code','div','span','section','svg','g','path','line','circle','rect','text','polyline','polygon','ellipse'],
 allowedAttributes:{table:['border'],th:['colspan','rowspan','scope'],td:['colspan','rowspan'],svg:['viewbox','width','height','xmlns','fill','stroke','stroke-width'],g:['fill','stroke','stroke-width','transform'],path:['d','fill','stroke','stroke-width','transform'],line:['x1','y1','x2','y2','stroke','stroke-width'],circle:['cx','cy','r','fill','stroke','stroke-width'],rect:['x','y','width','height','rx','ry','fill','stroke','stroke-width'],text:['x','y','fill','font-size','text-anchor'],polyline:['points','fill','stroke','stroke-width'],polygon:['points','fill','stroke','stroke-width'],ellipse:['cx','cy','rx','ry','fill','stroke','stroke-width']},

 allowedSchemes:[],allowProtocolRelative:false,disallowedTagsMode:'discard',
 transformTags:{'h1':'h2'},
};
export function sanitizeStudyHtml(raw:string):string {
 if(typeof raw!=='string'||raw.trim().length===0)throw new Error('Paste document content before importing.');
 if(raw.length>500_000)throw new Error('Document is too large (maximum 500 KB).');
 const cleaned=sanitizeHtml(raw,OPTIONS).trim();
 if(!cleaned)throw new Error('No supported document content was found.');
 return cleaned;
}
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function markdownToSafeHtml(markdown:string):string {
 const lines=markdown.replace(/\r/g,'').split('\n');let html='';let list:'ul'|'ol'|null=null;let para:string[]=[];
 const closePara=()=>{if(para.length){html+=`<p>${para.map(escape).join('<br>')}</p>`;para=[];}};
 const closeList=()=>{if(list){html+=`</${list}>`;list=null;}};
 for(const line of lines){const s=line.trim();if(!s){closePara();closeList();continue;}
  const heading=s.match(/^(#{1,4})\s+(.+)$/);if(heading){closePara();closeList();const n=Math.min(4,heading[1].length)+1;html+=`<h${n}>${escape(heading[2])}</h${n}>`;continue;}
  const item=s.match(/^([-*]|\d+\.)\s+(.+)$/);if(item){closePara();const next=item[1].endsWith('.')?'ol':'ul';if(list!==next){closeList();list=next;html+=`<${list}>`;}html+=`<li>${escape(item[2])}</li>`;continue;}
  closeList();para.push(s);
 }
 closePara();closeList();return sanitizeStudyHtml(html);
}
export function documentHtml(metadata:{student:string;grade:string;subject:string;book:string;chapter:string;title:string;type:string;content:string;largePrint?:boolean}):string {
 const body=sanitizeStudyHtml(metadata.content);
 const css=`@page{size:A4 portrait;margin:18mm 16mm 20mm;@bottom-center{content:counter(page);font:9pt Arial;color:#000}}*{box-sizing:border-box}body{margin:0;background:#fff;color:#000;font:12pt/1.55 Arial,'Noto Sans Gurmukhi','Noto Sans Devanagari',sans-serif}header{border-bottom:1px solid #222;padding-bottom:8mm;margin-bottom:8mm}header h1{font-size:21pt;margin:0 0 4mm}header p{margin:1mm 0;font-size:10pt}.content h2,.content h3,.content h4{break-after:avoid;page-break-after:avoid;line-height:1.3}.content h2{font-size:17pt}.content h3{font-size:14pt}p,li{orphans:3;widows:3}table{width:100%;border-collapse:collapse;break-inside:auto}tr{break-inside:avoid}th,td{border:1px solid #333;padding:5px;text-align:left;vertical-align:top}img,iframe,video,canvas{display:none!important}pre,blockquote{white-space:pre-wrap;border-left:2px solid #000;padding-left:10px}footer{margin-top:12mm;border-top:1px solid #777;padding-top:3mm;font-size:9pt;text-align:center}.writing-space{height:32mm;border-bottom:1px solid #777;margin:4mm 0}@media screen{body{padding:18mm 16mm;max-width:210mm;margin:0 auto}}${metadata.largePrint?'body{font-size:16pt;line-height:1.8}header p{font-size:13pt}':''}`;
 const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(metadata.type)} · ${esc(metadata.chapter)}</title><style>${css}</style></head><body><header><h1>${esc(metadata.title??metadata.chapter)}</h1><p><strong>STUDENT NAME:</strong> ${esc(metadata.student)} &nbsp; <strong>CLASS:</strong> ${esc(metadata.grade)}</p><p><strong>SUBJECT:</strong> ${esc(metadata.subject)} &nbsp; <strong>TEXTBOOK:</strong> ${esc(metadata.book)}</p><p><strong>CHAPTER:</strong> ${esc(metadata.chapter)} &nbsp; <strong>DOCUMENT TYPE:</strong> ${esc(metadata.type)} &nbsp; <strong>DATE:</strong> __________</p></header><main class="content">${body}</main><footer>Homeschool OS · Family learning resource</footer></body></html>`;
}
