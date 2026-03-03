import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/jwt-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await clearAuthCookies();
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
