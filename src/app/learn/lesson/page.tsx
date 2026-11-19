import {redirect} from 'next/navigation';

export default async function LegacyLearnerPage({searchParams}: {searchParams: Promise<{learner?: string}>}) {
  const {learner} = await searchParams;
  redirect(learner ? `/learn/path?learner=${encodeURIComponent(learner)}` : '/learn/path');
}
