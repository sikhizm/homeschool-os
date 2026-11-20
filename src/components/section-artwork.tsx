/** Original decorative illustrations, one consistent visual language across tools. */
export default function SectionArtwork({theme='explore'}:{theme?:'explore'|'plan'|'create'|'journey'|'insights'|'pilot'}){
 const palette={
  explore:['#E4F1FB','#DFA46B','#0866A8'],plan:['#F7E3C8','#87B8DD','#07538F'],
  create:['#F4D9C9','#A4CBE7','#0866A8'],journey:['#E9E1F4','#A5C9EA','#665D91'],
  insights:['#EAF5FC','#ECA971','#237EBC'],pilot:['#F7E7CF','#A7C9E0','#0866A8']
 }[theme];
 return <svg className="section-art" viewBox="0 0 210 164" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <circle cx="104" cy="81" r="73" fill={palette[0]}/>
  <circle cx="36" cy="37" r="11" fill={palette[1]} opacity=".75"/>
  <path d="M157 17l4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z" fill={palette[1]}/>
  <g transform="rotate(-8 105 90)">
   <rect x="53" y="41" width="108" height="100" rx="14" fill={palette[2]}/>
   <rect x="62" y="32" width="108" height="100" rx="14" fill="#FFFDF6"/>
   {theme==='insights'?<><path d="M82 103V85M104 103V66M126 103V74M148 103V50" stroke={palette[2]} strokeWidth="13" strokeLinecap="round"/><path d="M78 113h78" stroke="#B9D4E8" strokeWidth="3"/></>:
    theme==='journey'?<><path d="M88 83l15 15 36-42" stroke={palette[2]} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/><circle cx="117" cy="83" r="39" stroke={palette[1]} strokeWidth="3" strokeDasharray="4 9"/></>:
    theme==='plan'?<><path d="M75 58h82M75 76h82M75 94h82" stroke="#BBD6E9" strokeWidth="4" strokeLinecap="round"/><rect x="84" y="106" width="19" height="12" rx="5" fill={palette[1]}/><rect x="111" y="106" width="36" height="12" rx="5" fill={palette[2]}/></>:
    theme==='create'?<><path d="M88 108l6-23 39-39 19 19-39 39-25 4Z" fill={palette[1]}/><path d="M94 85l19 19" stroke="#fff" strokeWidth="5"/><circle cx="136" cy="104" r="12" fill="#B9DDF3"/></>:
    <><path d="M78 55h74M78 74h62M78 93h75M78 112h43" stroke="#A9CBE2" strokeWidth="6" strokeLinecap="round"/><circle cx="148" cy="111" r="8" fill={palette[1]}/></>}
  </g>
  <circle cx="165" cy="134" r="9" fill={palette[1]}/>
 </svg>;
}
