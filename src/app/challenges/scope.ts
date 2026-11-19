import 'server-only';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';

export function challengeToday() {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Kolkata'}).format(new Date());
}

export async function challengeScope() {
  const {data: session} = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  const sql = getSql();
  const [family] = await sql`SELECT family_id, role FROM family_members
    WHERE auth_user_id = ${session.user.id} ORDER BY created_at, family_id LIMIT 1`;
  if (!family) redirect('/dashboard');
  return {sql, familyId: String(family.family_id), canEdit: family.role === 'owner'};
}
