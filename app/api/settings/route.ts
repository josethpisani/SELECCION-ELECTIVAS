import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db/client';
import { ensureDatabase } from '../../../db/ensure';
import { isAdminRequest } from '../../../lib/auth';

export const dynamic = 'force-dynamic';
const defaults = { '11': { Ciencias: { requiredElectives: 2, enabled: true }, Humanidades: { requiredElectives: 2, enabled: true } }, '12': { Ciencias: { requiredElectives: 2, enabled: true }, Humanidades: { requiredElectives: 2, enabled: true } } };

export async function GET() {
  try {
    await ensureDatabase();
    const result = await db.execute('SELECT key,value FROM app_settings');
    const values = Object.fromEntries(result.rows.map(row => [String(row.key), String(row.value)]));
    let rules = defaults;
    try { rules = JSON.parse(values.electiveRules || JSON.stringify(defaults)); } catch {}
    for (const grade of ['11', '12'] as const) for (const track of ['Ciencias', 'Humanidades'] as const) { const item = rules[grade]?.[track]; if (!item) rules[grade][track] = defaults[grade][track]; rules[grade][track].requiredElectives = Math.min(3, Math.max(1, Number(rules[grade][track].requiredElectives || 2))); rules[grade][track].enabled = rules[grade][track].enabled !== false; }
    return NextResponse.json({ rules });
  } catch { return NextResponse.json({ error: 'No se pudo consultar la configuración.' }, { status: 503 }); }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    await ensureDatabase();
    const body = await request.json();
    const rules = body.rules || defaults;
    for (const grade of ['11', '12'] as const) for (const track of ['Ciencias', 'Humanidades'] as const) { if (!rules[grade]?.[track]) return NextResponse.json({ error: 'Completa las reglas para todos los grados y bachilleratos.' }, { status: 400 }); rules[grade][track] = { requiredElectives: Math.min(3, Math.max(1, Number(rules[grade][track].requiredElectives || 2))), enabled: rules[grade][track].enabled !== false }; }
    const now = new Date().toISOString();
    await db.execute({ sql: 'INSERT INTO app_settings (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at', args: ['electiveRules', JSON.stringify(rules), now] });
    return NextResponse.json({ rules });
  } catch { return NextResponse.json({ error: 'No se pudo guardar la configuración.' }, { status: 400 }); }
}
