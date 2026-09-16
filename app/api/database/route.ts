import { NextResponse } from 'next/server';
import { ensureDatabase } from '../../../db/ensure';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDatabase();
    return NextResponse.json({ ok: true, configured: Boolean(process.env.DATABASE_URL), provider: 'libsql/turso' });
  } catch (error) {
    console.error('Database health check failed', error);
    return NextResponse.json({ ok: false, configured: Boolean(process.env.DATABASE_URL) }, { status: 503 });
  }
}
