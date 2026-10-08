import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db/client';
import { ensureDatabase } from '../../../db/ensure';
import { isAdminRequest } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

const mapSubject = (row: Record<string, unknown>) => ({
  name: String(row.name), description: String(row.description ?? ''), grade: String(row.grade),
  track: String(row.track), type: String(row.type), capacity: Number(row.capacity ?? 25),
  active: Number(row.active ?? 1) === 1,
});

export async function GET() {
  try {
    await ensureDatabase();
    const result = await db.execute('SELECT name,description,grade,track,type,capacity,active FROM subjects WHERE active=1 ORDER BY grade,sort_order,name');
    return NextResponse.json(result.rows.map(row => mapSubject(row as Record<string, unknown>)));
  } catch {
    return NextResponse.json({ error: 'No se pudieron consultar las materias.' }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    await ensureDatabase();
    const subjects = await request.json() as Array<Record<string, unknown>>;
    const now = new Date().toISOString();
    await db.execute('DELETE FROM subjects');
    for (let index = 0; index < subjects.length; index++) {
      const s = subjects[index];
      await db.execute({ sql: 'INSERT INTO subjects (name,description,grade,track,type,capacity,active,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)', args: [String(s.name ?? '').trim(), String(s.description ?? ''), String(s.grade ?? '11'), String(s.track ?? 'Ambos'), String(s.type ?? 'Electiva'), Math.max(0, Number(s.capacity ?? 25)), s.active === false ? 0 : 1, index, now, now] });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudieron guardar las materias.' }, { status: 400 });
  }
}
