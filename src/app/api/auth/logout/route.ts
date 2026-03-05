import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { clearAuthCookies, getCurrentUser } from '@/lib/jwt-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const tokenPayload = await getCurrentUser();
    
    if (tokenPayload && tokenPayload.role === 'driver') {
      await dbConnect();
      await User.findByIdAndUpdate(tokenPayload.userId, {
        isOnline: false,
      });
    }
    
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
