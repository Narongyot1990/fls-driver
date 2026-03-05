import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { getCurrentUser } from '@/lib/jwt-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const tokenPayload = await getCurrentUser();
    
    if (!tokenPayload || tokenPayload.role !== 'driver') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    
    if (tokenPayload && tokenPayload.role === 'driver') {
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
