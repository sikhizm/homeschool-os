import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {subjects} from '../src/lib/family-workflow/model';

const read=(path:string)=>readFileSync(resolve(process.cwd(),path),'utf8');

test('Learners landing shows real profiles first and Subject Levels afterwards',()=>{
 const page=read('src/app/learners/page.tsx');
 const style=read('src/app/learners/learners.css');
 const illustration=read('public/illustrations/family-learners.svg');
 assert.ok(page.includes('className="studio-page-head learners-hero"'));
 assert.ok(page.includes('src="/illustrations/family-learners.svg"'));
 assert.ok(illustration.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
 assert.ok(illustration.trimEnd().endsWith('</svg>'));
 assert.ok(!illustration.includes('<image'),'Hero illustration must be native vector art');
 assert.ok(page.includes('className="learners-profile-grid"')||
  page.includes('className="family-learner-grid learners-profile-grid"'));
 assert.ok(page.indexOf('learners-profile-grid')<page.indexOf('<FamilyWorkflow initialView="levels" />'));
 assert.ok(page.includes('className="learners-tools-links"'));
 assert.ok(page.includes('id="add-learner"'));
 assert.ok(page.includes('LearnerEditAction'));
 assert.ok(page.includes('LearnerArchiveAction'));
 assert.ok(page.includes('learner-tier-band'));
 assert.ok(page.includes('tierLabel(tier)'));
 assert.ok(style.includes('.learners-redesign .learners-profile-grid'));
 assert.ok(style.includes('@media(max-width:640px)'));
 assert.ok(!style.includes('.learner-quick-links a:nth-child(4)'), 'Exactly three shortcut colors');
 assert.match(style,/\.learners-redesign \.learner-quick-links\s*\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/s);
});

test('All learner actions keep their existing per-learner URLs and owner safeguards',()=>{
 const page=read('src/app/learners/page.tsx');
 for(const path of [
  '/learn/path?learner=',
  '/reports?learner=',
  '/learners/',
  '/learn?learner=',
 ]) assert.ok(page.includes(path),path);
 assert.ok(!page.includes('href="/portfolio"'), 'Legacy Portfolio shortcut should not return');
 assert.ok(!page.includes('learning path, portfolio'), 'Intro should not advertise the legacy page');
 assert.ok(page.includes('{isOwner &&'));
 assert.ok(page.includes("String(family.role) === 'owner'"));
 assert.ok(page.includes('subjects.length'),'Subject count comes from real configured subject options');
 assert.equal(subjects.length,6);
 assert.ok(!page.includes('73%'),'Do not invent learner completion percentages');
 assert.ok(!page.includes('82%'),'Do not invent learner completion percentages');
 assert.ok(!page.includes('Age 9'),'Do not guess learner age');
});

test('Subject Level editor renders aligned and accessible forms without changing persistence',()=>{
 const workflow=read('src/components/family-workflow.tsx');
 const css=read('src/app/learners/learners.css');
 assert.ok(workflow.includes('className="subject-level-row"'));
 assert.ok(workflow.includes('className="subject-level-picker"'));
 assert.ok(workflow.includes('className="subject-level-destination"'));
 assert.ok(workflow.includes('subject-level-workspace'));
 assert.ok(workflow.includes('version={version}'));
 assert.ok(workflow.includes('defaultOpen={index === 0}'));
 assert.ok(workflow.includes('const [isOpen, setIsOpen] = useState(defaultOpen)'));
 assert.ok(workflow.includes('onToggle={(event) => setIsOpen(event.currentTarget.open)}'));
 assert.ok(workflow.includes("action: 'level'"));
 assert.ok(workflow.includes('learnerId: l.id'));
 assert.ok(workflow.includes('level: f.get(\'level\') ? Number(f.get(\'level\')) : null'));
 assert.ok(workflow.includes('disabled={!data.canEdit}'));
 assert.ok(workflow.includes('name="level" defaultValue={level ?? \'\'}'));
 assert.ok(workflow.includes('Save level'));
 assert.ok(workflow.includes('recommendation.href'));
 assert.ok(workflow.includes('No matching textbook at this level.'));
 assert.ok(workflow.includes('Custom level saved'));
 assert.ok(css.includes('grid-template-columns: minmax(144px,1.1fr)'));
 assert.ok(css.includes('.subject-level-destination'));
});

test('Legacy browser workflow checks the redesigned level-picker label',()=>{
 const browser=read('tests/family-workflow.browser.ts');
 assert.ok(browser.includes('Mathematics level for Fixture 1'));
 assert.ok(browser.includes('learnerLevels.locator(\'form.subject-level-row\')'));
});
