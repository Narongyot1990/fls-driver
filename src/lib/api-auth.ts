import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken, TokenPayload } from '@/lib/jwt-auth';
import { forbidden, unauthorized } from '@/lib/api-errors';

export type AuthResult = { payload: TokenPayload } | { error: NextResponse };

export function getTokenPayload(request: NextRequest): TokenPayload | null {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) return payload;
  }

  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload) return payload;
  }

  return null;
}

export function requireAuth(request: NextRequest): AuthResult {
  const payload = getTokenPayload(request);
  if (!payload) {
    const error = unauthorized();
    return { error: NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.status }) };
  }
  return { payload };
}

export function requireLeader(request: NextRequest): AuthResult {
  const result = requireAuth(request);
  if ('error' in result) return result;
  if (result.payload.role !== 'leader' && result.payload.role !== 'admin') {
    const error = forbidden('Forbidden: Management access required');
    return { error: NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.status }) };
  }
  return result;
}

export function requireDriver(request: NextRequest): AuthResult {
  const result = requireAuth(request);
  if ('error' in result) return result;
  if (result.payload.role !== 'driver') {
    const error = forbidden('Forbidden: Driver access required');
    return { error: NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.status }) };
  }
  return result;
}

export function requireAdmin(request: NextRequest): AuthResult {
  const result = requireAuth(request);
  if ('error' in result) return result;
  if (result.payload.role !== 'admin') {
    const error = forbidden('Forbidden: Admin access required');
    return { error: NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.status }) };
  }
  return result;
}

export function requireSuperuser(request: NextRequest): AuthResult {
  // Superuser = admin only (not leader)
  const result = requireAuth(request);
  if ('error' in result) return result;
  if (result.payload.role !== 'admin') {
    const error = forbidden('Forbidden: Superuser access required');
    return { error: NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.status }) };
  }
  return result;
}
