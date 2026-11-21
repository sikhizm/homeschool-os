import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { ncertChapterSlots } from '@/lib/ncert/textbooks';
import { parseTestMutation } from '@/lib/chapter-tests/model';
import { readChapterTests, readScheduledTests, chapterTestDate } from '@/lib/chapter-tests/store';

type Context = { params: Promise<{ chapterId: string }> };
const respond = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

async function scope(context: Context) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return respond({ error: 'Sign in required.' }, 401);
  const { chapterId } = await context.params;
  if (!ncertChapterSlots.some((chapter) => chapter.id === chapterId))
    return respond({ error: 'Unknown chapter.' }, 404);
  return { userId: session.user.id, chapterId };
}

export async function GET(_request: Request, context: Context) {
  const access = await scope(context);
  if (access instanceof Response) return access;
  try {
    const sql = getSql();
    const [learners, attempts, scheduled] = await Promise.all([
      sql`SELECT l.id::text AS id, l.display_name AS name, m.role
          FROM learners l JOIN family_members m ON m.family_id = l.family_id
          WHERE m.auth_user_id = ${access.userId} AND l.archived_at IS NULL
          ORDER BY l.created_at, l.id`,
      readChapterTests(access.userId, '', access.chapterId),
      readScheduledTests(access.userId, access.chapterId),
    ]);
    return respond({ learners, attempts, scheduled, today: chapterTestDate() });
  } catch {
    return respond({ error: 'Chapter Tests are unavailable. Check the database migration.' }, 503);
  }
}

export async function POST(request: Request, context: Context) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return respond({ error: 'Same-origin request required.' }, 403);
  const access = await scope(context);
  if (access instanceof Response) return access;
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 16_000) return respond({ error: 'Request too large.' }, 413);
    input = parseTestMutation(JSON.parse(raw));
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : 'Invalid request.' }, 400);
  }
  try {
    const sql = getSql();
    const [result] = await sql`SELECT public.mutate_ncert_test(
      ${access.userId}, ${input.learnerId}, ${access.chapterId}, ${input.operation},
      ${input.targetId}::uuid, ${input.title}, ${input.date}::date,
      ${input.total}::numeric, ${input.obtained}::numeric, ${input.remarks}
    ) AS status`;
    switch (result.status) {
      case 'saved': return respond({ saved: true });
      case 'forbidden': return respond({ error: 'Only a family owner may update this learner’s tests.' }, 403);
      case 'missing': return respond({ error: 'This assessment or attempt is no longer available.' }, 404);
      case 'assessment_type':
      case 'history_changed': return respond({ error: 'Assessment history changed. Refresh before trying again.' }, 409);
      default: return respond({ error: 'Unable to save the test.' }, 503);
    }
  } catch {
    return respond({ error: 'Unable to save the test. Check the database migration.' }, 503);
  }
}
