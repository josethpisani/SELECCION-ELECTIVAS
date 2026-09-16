import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db/client';
import { ensureDatabase } from '../../../db/ensure';
import { isAdminRequest } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDatabase();
    const result = await db.execute('SELECT student_id AS studentId, first_name AS firstName, middle_name AS middleName, last_name AS lastName, email, grade FROM roster_students WHERE active = 1 ORDER BY grade, last_name, first_name');
    return NextResponse.json(result.rows);
  } catch {
    return NextResponse.json({ error: 'No se pudo consultar la base de datos.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    await ensureDatabase();
    const s = await request.json();
    const now = new Date().toISOString();
    await db.execute({ sql: 'INSERT INTO roster_students (student_id,first_name,middle_name,last_name,email,grade,active,created_at,updated_at) VALUES (?,?,?,?,?,?,1,?,?)', args: [s.studentId, s.firstName, s.middleName ?? '', s.lastName, s.email ?? '', s.grade, now, now] });
    return NextResponse.json(s, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar el estudiante.' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    await ensureDatabase();
    const s = await request.json();
    await db.execute({ sql: 'UPDATE roster_students SET first_name=?, middle_name=?, last_name=?, email=?, grade=?, active=1, updated_at=? WHERE student_id=?', args: [s.firstName, s.middleName ?? '', s.lastName, s.email ?? '', s.grade, new Date().toISOString(), s.studentId] });
    return NextResponse.json(s);
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar el estudiante.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    await ensureDatabase();
    const studentId = new URL(request.url).searchParams.get('studentId');
    if (!studentId) return NextResponse.json({ error: 'Falta el ID.' }, { status: 400 });
    await db.execute({ sql: 'UPDATE roster_students SET active=0, updated_at=? WHERE student_id=?', args: [new Date().toISOString(), studentId] });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar el estudiante.' }, { status: 400 });
  }
}
