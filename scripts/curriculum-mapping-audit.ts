import {class5ChapterAccounts,class5MappingProposals,class5MappingSummary,validateClass5MappingPilot} from '../src/lib/curriculum/class5-mapping';
import {outcomeRegistrySummary,validateOutcomeRegistry} from '../src/lib/curriculum/outcome-registry';

const outcomeIssues=validateOutcomeRegistry();
const mappingIssues=validateClass5MappingPilot();
const summary=class5MappingSummary();
const registry=outcomeRegistrySummary();
const unmappedByReason=new Map<string,number>();
for(const account of class5ChapterAccounts.filter(account=>account.initialStatus==='unmapped')){
 const reason=account.unmappedReason??'No reason recorded';
 unmappedByReason.set(reason,(unmappedByReason.get(reason)??0)+1);
}

console.log(`outcomes=${registry.total} official=${registry.official} original=${registry.original} frameworkReferences=${registry.frameworkReferences} sources=${registry.sources}`);
console.log(`class5 books=${summary.books} chapters=${summary.chapters} draftMappings=${summary.draftMappings} draftMappedChapters=${summary.draftMappedChapters} approvedMappings=${summary.approvedMappings} unmappedChapters=${summary.unmappedChapters}`);
console.log(`seed review states: drafts=${class5MappingProposals.length} approved=0`);
for(const [reason,count] of unmappedByReason)console.log(`unmapped reason (${count}): ${reason}`);
const issues=[...outcomeIssues,...mappingIssues];
if(issues.length){
 console.error(`curriculum mapping validation failed (${issues.length})`);
 for(const issue of issues)console.error(`- ${issue}`);
 process.exitCode=1;
}else console.log('curriculum mapping validation: pass');
