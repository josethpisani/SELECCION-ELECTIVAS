import { NextRequest } from 'next/server';

export function isAdminRequest(request: NextRequest) {
  return request.cookies.get('admin_session')?.value === '1';
}
