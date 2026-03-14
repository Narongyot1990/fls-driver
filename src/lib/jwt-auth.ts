import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

function getJwtSecret(): string {
  if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');
  return JWT_SECRET;
}

function getRefreshSecret(): string {
  if (!REFRESH_SECRET) throw new Error('REFRESH_SECRET environment variable is not set');
  return REFRESH_SECRET;
}
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email?: string;
  role: 'driver' | 'leader' | 'admin';
  branch?: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getRefreshSecret()) as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  });

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function getAuthCookies() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;
  return { accessToken, refreshToken };
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}

export async function getCurrentUser() {
  const { accessToken, refreshToken } = await getAuthCookies();
  
  if (!accessToken && !refreshToken) {
    return null;
  }

  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) {
      return payload;
    }
  }

  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload) {
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);
      await setAuthCookies(newAccessToken, newRefreshToken);
      return payload;
    }
  }

  return null;
}
