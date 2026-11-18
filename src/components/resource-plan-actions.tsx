import Link from 'next/link';
export default function ResourcePlanActions({
  resourceKey,
}: {
  resourceKey: string;
}) {
  const href = '/planning?resource=' + encodeURIComponent(resourceKey);
  return (
    <div className="resource-plan-actions" aria-label="Plan this resource">
      <Link
        className="btn-secondary"
        href={href + '&intent=today#family-workflow'}
      >
        Use today
      </Link>
      <Link
        className="btn-secondary"
        href={href + '&intent=plan#family-workflow'}
      >
        Add to plan
      </Link>
      <Link
        className="btn-secondary"
        href={href + '&intent=save#family-workflow'}
      >
        Save for later
      </Link>
    </div>
  );
}
