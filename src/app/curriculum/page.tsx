import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

type Strand = { title: string; examples: string[] };
type Pathway = { id: string; name: string; ages: string; purpose: string; strands: Strand[] };
const pathways: Pathway[] = [
  {
    id: 'infant', name: 'Infancy and toddlerhood', ages: 'Birth–3 years',
    purpose: 'Connection, movement, oral language, sensory discovery and play. No formal lessons or independent screens.',
    strands: [
      { title: 'Communication', examples: ['Respond to familiar voices, gestures and expressions', 'Enjoy short songs, rhymes and picture-book conversations'] },
      { title: 'Movement and exploration', examples: ['Explore safe textures and everyday objects with supervision', 'Develop movement through age-appropriate floor play and outdoor observation'] },
      { title: 'Relationships and culture', examples: ['Build predictable, caring routines', 'Listen to familiar Punjabi words and family stories'] },
    ],
  },
  {
    id: 'foundational', name: 'Early years / Nursery / LKG / UKG', ages: 'Play-based foundation',
    purpose: 'Learning through language, manipulatives, stories, art, movement and relationships.',
    strands: [
      { title: 'Early literacy', examples: ['Listen, describe pictures and retell a simple story', 'Recognize sounds and experiment with marks, letters or names when ready'] },
      { title: 'Early numeracy', examples: ['Sort, compare, match and count real objects', 'Notice shapes, patterns, quantities and everyday measurement'] },
      { title: 'Our world and wellbeing', examples: ['Observe plants, animals, weather and neighborhood life', 'Practise cooperation, self-care and expressive play'] },
      { title: 'Language and heritage', examples: ['Use familiar Punjabi or Hindi words in conversation', 'Explore kindness, equality and seva through family stories and action'] },
    ],
  },
  {
    id: 'primary', name: 'Classes 1–5', ages: 'Primary foundations',
    purpose: 'Build comprehension, confident reasoning and practical inquiry before speed or rote coverage.',
    strands: [
      { title: 'English', examples: ['Read age-appropriate texts and discuss meaning', 'Retell, write and revise short explanations or stories'] },
      { title: 'Mathematics', examples: ['Understand place value and operations with models', 'Apply fractions, shapes and measurements in daily situations', 'Explain a strategy and check an answer'] },
      { title: 'The world around us', examples: ['Ask observable questions and collect simple evidence', 'Connect environment, community, health and local history'] },
      { title: 'Languages and heritage', examples: ['Develop spoken and written Punjabi/Hindi at the learner’s pace', 'Discuss Sikh history and values accurately with age-appropriate resources'] },
    ],
  },
  {
    id: 'secondary', name: 'Classes 6–12', ages: 'Subject depth and independence',
    purpose: 'Study subject-specific ideas, build evidence-based thinking and develop gradually increasing learner independence.',
    strands: [
      { title: 'Languages and communication', examples: ['Analyse texts and support interpretations with evidence', 'Plan, draft and edit explanations, essays and presentations'] },
      { title: 'Mathematics', examples: ['Connect arithmetic, algebra, geometry and data reasoning', 'Solve unfamiliar problems and justify working'] },
      { title: 'Science and society', examples: ['Investigate questions using suitable methods and evidence', 'Compare sources and communicate uncertainty'] },
      { title: 'Personal development', examples: ['Set realistic goals and review learning independently', 'Balance study, physical activity, community participation and wellbeing'] },
    ],
  },
];

export default async function CurriculumPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  return (
    <>
      <header className="workspace-header">
        <Link href="/dashboard">✦ Homeschool OS</Link>
        <span>CURRICULUM PATHWAYS</span>
      </header>
      <main className="family-dashboard">
        <div className="dashboard-welcome">
          <div>
            <span className="tag">PHASE 03 · CURRICULUM FOUNDATIONS</span>
            <h1>A map of what to explore next</h1>
            <p className="muted">Select a learning stage and use these example competencies to inform your own goals and daily activities.</p>
          </div>
        </div>
        <section className="workspace-panel">
          <h2>Use this map thoughtfully</h2>
          <p>This is an original, provisional learning guide inspired by CBSE/NCERT foundations and play-based education. It is <strong>not</strong> an official NCERT syllabus, a board-certified outcome list or an assessment of any learner.</p>
          <p>Choose the learner’s actual stage and current understanding. Adapt activities; do not automatically mark a skill mastered. The family’s suggested 60 minutes is shared parent-guided time, not 60 minutes per child. Infants need play and responsive care, not screen-based lessons.</p>
          <p><Link href="/dashboard">Open the parent workspace to record a specific goal →</Link></p>
        </section>
        <nav className="workspace-panel" aria-label="Jump to learning stage">
          <h2>Learning stages</h2>
          <ul>
            {pathways.map((p) => <li key={p.id}><a href={`#${p.id}`}>{p.name}</a></li>)}
          </ul>
        </nav>
        {pathways.map((pathway) => (
          <section key={pathway.id} id={pathway.id} className="workspace-panel" aria-labelledby={`${pathway.id}-title`}>
            <span className="tag">{pathway.ages}</span>
            <h2 id={`${pathway.id}-title`}>{pathway.name}</h2>
            <p>{pathway.purpose}</p>
            <div className="grid">
              {pathway.strands.map((strand) => (
                <article className="card" key={strand.title}>
                  <h3>{strand.title}</h3>
                  <ul>{strand.examples.map((example) => <li key={example}>{example} <Link href={`/dashboard?goal=${encodeURIComponent(example)}&subject=${encodeURIComponent(strand.title)}`}>Use as a goal →</Link></li>)}</ul>
                </article>
              ))}
            </div>
          </section>
        ))}
        <section className="workspace-panel">
          <h2>What comes next</h2>
          <p>The next curriculum increment will turn reviewed, source-mapped competencies into selectable goals, add prerequisite relationships, and let a parent personalize each learner’s pathway. No progress will be inferred from age, class or daily-plan completion.</p>
        </section>
      </main>
    </>
  );
}
