import {frameworkEvidenceSummary,validateFrameworkEvidence} from '../src/lib/global-curriculum/framework-evidence';

const errors=validateFrameworkEvidence();
const summary=frameworkEvidenceSummary();
console.log(JSON.stringify({summary,errors},null,2));
if(errors.length)process.exitCode=1;
