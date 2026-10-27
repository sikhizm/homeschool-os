import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { InputError, parseCommand, validDate } from '@/lib/learning/model';
import {
  AccessError,
  ConflictError,
  executeCommand,
  loadWorkspace,
} from '@/lib/learning/service';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
function failure(error: unknown) {
  if (error instanceof InputError) return json({ error: error.message }, 400);
  if (error instanceof AccessError) return json({ error: error.message }, 403);
  if (error instanceof ConflictError)
    return json({ error: error.message }, 409);
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === '23505'
  )
    return json(
      {
        error:
          'A subject with that name already exists. You can restore it if archived.',
      },
      409,
    );
  // Never log database errors or request bodies containing private learner data.
  return json(
    { error: 'Unable to save or load this workspace. Please try again.' },
    500,
  );
}
type Context = { params: Promise<{ learnerId: string }> };
export async function GET(request: Request, context: Context) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return json({ error: 'Sign in required.' }, 401);
  const date = new URL(request.url).searchParams.get('date');
  if (!validDate(date)) return json({ error: 'Choose a valid date.' }, 400);
  try {
    return json(
      await loadWorkspace(
        getSql(),
        session.user.id,
        (await context.params).learnerId,
        date,
      ),
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request, context: Context) {
  // Same-origin writes also protect auth setups that permit cross-site cookies.
  if (
    request.headers.get('origin') !==
    `${new URL(request.url).protocol}//${request.headers.get('host')}`
  )
    return json({ error: 'Same-origin request required.' }, 403);
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return json({ error: 'Sign in required.' }, 401);
  if (Number(request.headers.get('content-length')) > 12000)
    return json({ error: 'Request too large.' }, 413);
  try {
    let body: unknown;
    const raw = await request.text();
    if (raw.length > 12000) return json({ error: 'Request too large.' }, 413);
    try {
      body = JSON.parse(raw);
    } catch {
      throw new InputError('Invalid JSON.');
    }
    return json(
      await executeCommand(
        getSql(),
        session.user.id,
        (await context.params).learnerId,
        parseCommand(body),
      ),
    );
  } catch (error) {
    return failure(error);
  }
}
