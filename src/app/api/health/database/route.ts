import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getSql();
    const result = await sql`SELECT 1 AS ok`;
    if (result[0]?.ok !== 1) throw new Error('Database health check failed');
    return NextResponse.json({ status: 'ok', database: 'connected' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
