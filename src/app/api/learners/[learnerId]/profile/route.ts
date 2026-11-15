import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const send = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

const STAGES = new Set([
  'Infant (0–18 months)',
  'Toddler (18–36 months)',
  'Early Years',
  'Nursery',
  'LKG',
  'UKG',
  ...Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`),
]);

type Context = { params: Promise<{ learnerId: string }> };

export async function PATCH(request: Request, context: Context) {
  const url = new URL(request.url);
  if (request.headers.get('origin') !== url.origin)
    return send({ error: 'Same-origin request required.' }, 403);

  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return send({ error: 'Sign in required.' }, 401);

  const { learnerId } = await context.params;
  if (!learnerId || learnerId.length > 100)
    return send({ error: 'Invalid learner.' }, 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return send({ error: 'Invalid request body.' }, 400);
  }
  if (!body || typeof body !== 'object')
    return send({ error: 'Invalid request body.' }, 400);

  const fields = body as Record<string, unknown>;
  const displayName =
    typeof fields.displayName === 'string'
      ? fields.displayName.trim().replace(/\\s+/g, ' ')
      : '';
  const stage = typeof fields.stage === 'string' ? fields.stage : '';

  if (displayName.length < 1 || displayName.length > 70 || !STAGES.has(stage))
    return send({ error: 'Provide a name (1–70 characters) and a valid class or learning stage.' }, 400);

  try {
    const sql = getSql();
    const updated = await sql`
      UPDATE learners
      SET display_name = ${displayName}, stage = ${stage}
      WHERE id::text = ${learnerId}
        AND archived_at IS NULL
        AND family_id IN (
          SELECT family_id FROM family_members
          WHERE auth_user_id = ${session.user.id} AND role = 'owner'
        )
      RETURNING id::text AS id, display_name, stage
    `;
    if (!updated.length)
      return send({ error: 'Active learner not found or you do not have permission to edit this profile.' }, 404);

    return send({ saved: true, learner: updated[0] });
  } catch {
    return send({ error: 'Unable to update this learner profile. Please try again.' }, 500);
  }
}
