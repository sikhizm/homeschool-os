import { getSql } from '@/lib/db';
import { readClass5ReviewQueue, type MappingSql } from '../curriculum/mapping-review-service';

export async function familyMappingEvidence(userId: string) {
  try {
    const queue = await readClass5ReviewQueue(getSql() as unknown as MappingSql, userId);
    return { revisions: queue.revisions, familyReviewsVisible: queue.authorized };
  } catch {
    return { revisions: [], familyReviewsVisible: false };
  }
}
