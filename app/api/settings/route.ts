import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db/client';
import { ensureDatabase } from '../../../db/ensure';
import { isAdminRequest } from '../../../lib/auth';

export const dynamic = 'force-dynamic';
const defaults = { requiredElectives: 2, allowedTracks: ['Ciencias', 'Humanidades'] };

export async function GET() {
  try {
    await ensureDatabase();
    const result = await db.execute('SELECT key,value FROM app_settings');
    const values = Object.fromEntries(result.rows.map(row => [String(row.key), String(row.value)]));
    const required = Math.min(3, Math.max(1, Number(values.requiredElectives || defaults.requiredElectives)));
    let tracks = defaults.allowedTracks;
    try { tracks = JSON.parse(values.allowedTracks || JSON.stringify(defaults.allowedTracks)); } catch {}
    if (!Array.isArray(tracks) || !tracks.length) tracks = defaults.allowedTracks;
    return NextResponse.json({ requiredElectives: required, allowedTracks: tracks });
  } catch { return NextResponse.json({ error: 'No se pudo consultar la configuración.' }, { status: 503 }); }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    await ensureDatabase();
    const body = await request.json();
    const requiredElectives = Math.min(3, Math.max(1, Number(body.requiredElectives || 2)));
    const allowedTracks = (Array.isArray(body.allowedTracks) ? body.allowedTracks : defaults.allowedTracks).filter((x: unknown) => x === 'Ciencias' || x === 'Humanidades');
    if (!allowedTracks.length) return NextResponse.json({ error: 'Selecciona al menos un bachillerato.' }, { status: 400 });
    const now = new Date().toISOString();
    await db.execute({ sql: 'INSERT INTO app_settings (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at', args: ['requiredElectives', String(requiredElectives), now] });
    await db.execute({ sql: 'INSERT INTO app_settings (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at', args: ['allowedTracks', JSON.stringify(allowedTracks), now] });
    return NextResponse.json({ requiredElectives, allowedTracks });
  } catch { return NextResponse.json({ error: 'No se pudo guardar la configuración.' }, { status: 400 }); }
}
