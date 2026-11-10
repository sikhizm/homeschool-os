/**
 * Regenerates the curriculum inventory matrix quoted in
 * docs/CURRICULUM_COMPLETION_MASTER.md. Run after any catalogue change:
 *
 *   npm run curriculum:inventory
 *
 * Prints real counts only — nothing here computes a "completion percentage";
 * gaps are listed explicitly so the master doc can be kept honest.
 */
import{ncertTextbooks,textbookAudit,gradeCoverage,validateNcertCatalogue} from '../src/lib/ncert/textbooks';
import{annualSteps,annualGrades} from '../src/lib/curriculum/annual';
import{competencies,validateCurriculum} from '../src/lib/curriculum/library';
import{globalSkills,validateGlobalSkills} from '../src/lib/global-curriculum/catalogue';
import{lessons,validateLessons} from '../src/lib/lessons/library';
import{queueCatalogue} from '../src/lib/auto-learning/catalogue';

const audit=textbookAudit();
const rows:string[]=[];
rows.push('NCERT catalogue');
rows.push(`  books=${audit.books}  chapterSlots=${audit.chapterSlots}  titlesVerified=${audit.verifiedChapterTitles}  contentsPending=${audit.booksPendingContents}  grades=${audit.gradesCovered.join(',')}`);
rows.push(`  validate=${JSON.stringify(validateNcertCatalogue())}`);
rows.push('  per-grade:');
for(const g of gradeCoverage()) rows.push(`    grade ${g.grade}: ${g.cataloguedBooks} books, ${g.contentsAudited} contents-audited, ${g.status}`);
rows.push(`  pending books: ${ncertTextbooks.filter(b=>b.chapterCount===0).map(b=>b.id).join(', ')||'none'}`);
rows.push('Annual pathways (weekly activity steps)');
for(const g of annualGrades) rows.push(`  ${g.key} (${g.label}): ${annualSteps(g.key).length} steps`);
rows.push('Content corpora');
rows.push(`  competencies=${competencies.length} (validate=${validateCurriculum().length})`);
rows.push(`  globalSkills=${globalSkills.length} (validate=${validateGlobalSkills().length})`);
rows.push(`  lessons=${lessons.length} (validate=${validateLessons().length})`);
rows.push('Auto-learning queue catalogue (current known gaps)');
for(const stage of ['Infant','Toddler','Early Years','Nursery','LKG','UKG','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12']) rows.push(`  ${stage}: ${queueCatalogue(stage).length} tasks`);
rows.push('Uncatalogued grades (books expected per 2026–27 NCERT syllabus)');
const gaps=gradeCoverage().filter(g=>g.cataloguedBooks===0).map(g=>g.grade);
rows.push(`  grades without any book record: ${gaps.join(', ')||'none'}`);
console.log(rows.join('\n'));
