import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db/client';
import { ensureDatabase } from '../../../db/ensure';
import { isAdminRequest } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

const mapStudent = (row: Record<string, unknown>) => ({
  id: String(row.id), firstName: String(row.first_name), middleName: String(row.middle_name ?? ''), lastName: String(row.last_name), studentId: String(row.student_id), email: String(row.email), phone: String(row.phone ?? ''), grade: String(row.grade), track: String(row.track),
  electives: JSON.parse(String(row.electives_json || '[]')), advanced: JSON.parse(String(row.advanced_json || '[]')), observation: String(row.observation || ''), status: String(row.status), createdAt: String(row.created_at),
});

export async function GET(request: NextRequest) {
  try {
    await ensureDatabase();
    if (new URL(request.url).searchParams.get('ids') === '1') {
      const ids = await db.execute('SELECT student_id AS studentId FROM students');
      return NextResponse.json(ids.rows);
    }
    if (!isAdminRequest(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const result = await db.execute('SELECT * FROM students ORDER BY created_at DESC');
    return NextResponse.json(result.rows.map(row => mapStudent(row as Record<string, unknown>)));
  } catch {
    return NextResponse.json({ error: 'No se pudo consultar los registros.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDatabase();
    const s = await request.json();
    const duplicate = await db.execute({ sql: 'SELECT id FROM students WHERE lower(student_id)=lower(?) LIMIT 1', args: [s.studentId] });
    if (duplicate.rows.length) return NextResponse.json({ error: 'Ya existe una selección registrada para este estudiante.' }, { status: 409 });
    const now = new Date().toISOString();
    await db.execute({ sql: 'INSERT INTO students (id,first_name,middle_name,last_name,student_id,email,phone,grade,track,electives_json,advanced_json,observation,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', args: [s.id, s.firstName, s.middleName ?? '', s.lastName, s.studentId, s.email ?? '', s.phone ?? '', s.grade, s.track, JSON.stringify(s.electives ?? []), JSON.stringify(s.advanced ?? []), s.observation ?? '', s.status ?? 'Pendiente', s.createdAt ?? now, now] });
    return NextResponse.json(s, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar el registro.' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    await ensureDatabase();
    const s = await request.json();
    await db.execute({ sql: 'UPDATE students SET first_name=?, middle_name=?, last_name=?, student_id=?, email=?, phone=?, grade=?, track=?, electives_json=?, advanced_json=?, observation=?, status=?, updated_at=? WHERE id=?', args: [s.firstName, s.middleName ?? '', s.lastName, s.studentId, s.email ?? '', s.phone ?? '', s.grade, s.track, JSON.stringify(s.electives ?? []), JSON.stringify(s.advanced ?? []), s.observation ?? '', s.status ?? 'Pendiente', new Date().toISOString(), s.id] });
    return NextResponse.json(s);
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar el registro.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    await ensureDatabase();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el registro.' }, { status: 400 });
    await db.execute({ sql: 'DELETE FROM students WHERE id=?', args: [id] });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar el registro.' }, { status: 400 });
  }
}
