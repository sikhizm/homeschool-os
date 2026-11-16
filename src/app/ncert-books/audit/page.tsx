import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { catalogueEvidenceAudit } from '@/lib/ncert/catalogue-evidence';
import { familyMappingEvidence } from '@/lib/ncert/family-catalogue-evidence';
import '../evidence.css';

export const dynamic = 'force-dynamic';

export default async function CatalogueAuditPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const review = await familyMappingEvidence(session.user.id);
  const { total, classes, subjects } = catalogueEvidenceAudit(review.revisions);
  const columns = [
    ['books','Books'],['slots','Contents slots'],['verified','Verified PDFs'],
    ['publisher','Publisher-listed PDFs'],['pending','PDF pending'],['notConfirmed','PDF not confirmed'],['fallback','Portal fallback'],
    ['incompleteBooks','Books with incomplete PDF audit'],['approved','Approved'],['proposed','Proposed'],
    ['unmapped','Unmapped'],['evidencePending','Mapping evidence pending'],
  ] as const;
  const table = (title: string, rows: [string, typeof total][]) => (
    <section className="workspace-panel">
      <h2>{title}</h2>
      <div className="ncert-evidence-table" tabIndex={0} aria-label={title}>
        <table>
          <thead><tr><th scope="col">Group</th>{columns.map(([key,label])=><th key={key} scope="col">{label}</th>)}</tr></thead>
          <tbody>{rows.map(([label,row])=><tr key={label}><th scope="row">{label}</th>
            {columns.map(([key])=><td key={key}>{row[key]}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
  return (
    <main className="family-dashboard studio-stack ncert-evidence-audit">
      <Link href="/ncert-books">Back to NCERT books</Link>
      <h1>NCERT catalogue evidence audit</h1>
      <p>PDF pending means an individual PDF has not been verified or the check was inconclusive. PDF not confirmed means a recorded check failed to confirm a direct PDF. Publisher-listed PDFs open directly and are counted separately from download-verified PDFs.</p>
      <p>Mapping totals count chapters. Approved takes precedence when a chapter has more than one review outcome. {review.familyReviewsVisible ? 'Counts include decisions for your family.' : 'Counts show editorial seed proposals only. Family review decisions are unavailable in this view.'}</p>
      <p>{total.proposed+total.evidencePending} chapters await review or supporting mapping evidence.</p>
      {table('Catalogue totals', [['All indexed classes',total]])}
      {table('By class', [...classes].sort(([a],[b])=>a-b).map(([grade,row])=>['Class '+grade,row]))}
      {table('By subject', [...subjects].sort(([a],[b])=>a.localeCompare(b)))}
    </main>
  );
}
