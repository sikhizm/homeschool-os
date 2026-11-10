/** Subject identity colours — the one place colour encodes subject meaning. */

const TINTS: Record<string,string>={
 Mathematics:'var(--math)',Math:'var(--math)',Arithmetic:'var(--math)',
 English:'var(--language)',Hindi:'var(--language)','Punjabi & Sikh heritage':'var(--language)',Punjabi:'var(--language)',
 Science:'var(--science)','Our world':'var(--science)',
 Art:'var(--creativity)',Music:'var(--creativity)',Craft:'var(--creativity)',
};

/** Returns a CSS tint variable for a subject name (falls back to mint). */
export function subjectTint(subject:string):string{
 return TINTS[subject]??'var(--mint)';
}

/** Foreground colour that stays readable on a subject tint. */
export function subjectInk():string{
 return '#20322A';
}
