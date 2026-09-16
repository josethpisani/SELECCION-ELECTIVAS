import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const validUser = process.env.ADMIN_USER || 'aipadmin';
  const validPassword = process.env.ADMIN_PASSWORD || 'adminaip54321';
  if (username === validUser && password === validPassword) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set('admin_session', '1', { httpOnly: true, sameSite: 'lax', secure: new URL(request.url).protocol === 'https:', maxAge: 60 * 60 * 8, path: '/' });
    return response;
  }
  return NextResponse.json({ ok: false, error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
}
