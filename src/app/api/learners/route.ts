import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STAGES = new Set(['Early Years', 'Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`)]);
export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const fields = body as Record<string, unknown>;
  const displayName = typeof fields.displayName === 'string' ? fields.displayName.trim().replace(/\s+/g, ' ') : '';
  const stage = typeof fields.stage === 'string' ? fields.stage : '';
  if (displayName.length < 1 || displayName.length > 70 || !STAGES.has(stage))
    return NextResponse.json({ error: 'Provide a name (1–70 characters) and a valid learning stage.' }, { status: 400 });
  try {
    const sql = getSql();
    // Authorization is part of the INSERT, so the family cannot be supplied by the browser.
    const inserted = await sql`
      INSERT INTO learners (family_id, display_name, stage)
      SELECT fm.family_id, ${displayName}, ${stage}
      FROM family_members fm
      WHERE fm.auth_user_id = ${session.user.id} AND fm.role = 'owner'
      ORDER BY fm.created_at ASC LIMIT 1
      RETURNING id
    `;
    if (!inserted.length) return NextResponse.json({ error: 'Only a family owner can create learner profiles.' }, { status: 403 });
    return NextResponse.json({ id: inserted[0].id }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to save this profile. Please try again.' }, { status: 500 });
  }
}
