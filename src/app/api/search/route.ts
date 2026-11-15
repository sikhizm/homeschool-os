import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import { searchCatalogue } from '@/lib/search';
import { maxSearchLength, searchCategories, type SearchFilter } from '@/lib/search/types';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, {
  status, headers: { 'Cache-Control': 'private, no-store' },
});

export async function GET(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return json({ error: 'Sign in to search HomeSchool OS.' }, 401);

  const params = new URL(request.url).searchParams;
  const query = (params.get('q') ?? '').slice(0, maxSearchLength);
  const filter = params.get('category') ?? 'all';
  const offset = Number(params.get('offset') ?? '0');
  if ((filter !== 'all' && !Object.hasOwn(searchCategories, filter)) ||
      !Number.isSafeInteger(offset) || offset < 0) return json({ error: 'Invalid search filters.' }, 400);

  const category = filter as SearchFilter;
  const standard = searchCatalogue(query, category, { offset });
  const withOwner = searchCatalogue(query, category, { offset, includeOwner: true });
  if (standard.total === withOwner.total) return json(standard);

  try {
    const sql = getSql();
    const memberships = await sql`
      SELECT 1 FROM family_members WHERE auth_user_id=${session.user.id} AND role='owner' LIMIT 1
    `;
    return json(memberships.length ? withOwner : standard);
  } catch {
    return json(standard);
  }
}
