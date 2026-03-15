import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { getCurrentUser } from '@/lib/jwt-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const tokenPayload = await getCurrentUser();
    
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Skip for admin_root (no User record)
    if (tokenPayload.userId === 'admin_root') {
      return NextResponse.json({ success: true });
    }
    
    await dbConnect();
    
    await User.findByIdAndUpdate(tokenPayload.userId, {
      lastSeen: new Date(),
      isOnline: true,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heartbeat Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const tokenPayload = await getCurrentUser();
    
    if (tokenPayload && tokenPayload.userId !== 'admin_root') {
      await dbConnect();
      await User.findByIdAndUpdate(tokenPayload.userId, {
        isOnline: false,
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
