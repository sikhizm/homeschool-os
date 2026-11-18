import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { AccessError } from '@/lib/learning/service';
import { WorkflowInputError } from '@/lib/family-workflow/model';
import { loadWorkflow, changeWorkflow } from '@/lib/family-workflow/service';
export const dynamic = 'force-dynamic';
const send = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
function failure(error: unknown) {
  if (error instanceof AccessError) return send({ error: error.message }, 403);
  if (error instanceof WorkflowInputError)
    return send({ error: error.message }, 400);
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === '23505'
  )
    return send(
      {
        error:
          'This resource is already assigned to that learner on that date. Edit the existing session or choose another date.',
      },
      409,
    );
  return send(
    {
      error:
        'Unable to load or save the family workflow. Ask the app administrator to check migration 011.',
    },
    503,
  );
}
export async function GET(request: Request) {
  const { data } = await auth.getSession();
  if (!data?.user) return send({ error: 'Sign in required.' }, 401);
  try {
    const url = new URL(request.url);
    return send(
      await loadWorkflow(
        getSql(),
        data.user.id,
        url.searchParams.get('date') ?? '',
        url.searchParams.get('resource') ?? '',
      ),
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return send({ error: 'Same-origin request required.' }, 403);
  const { data } = await auth.getSession();
  if (!data?.user) return send({ error: 'Sign in required.' }, 401);
  try {
    const raw = await request.text();
    if (raw.length > 12000) return send({ error: 'Request too large.' }, 413);
    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      return send({ error: 'Invalid JSON.' }, 400);
    }
    if (!input || typeof input !== 'object' || Array.isArray(input))
      return send({ error: 'Invalid input.' }, 400);
    await changeWorkflow(getSql(), data.user.id, input);
    return send({ saved: true });
  } catch (e) {
    return failure(e);
  }
}
