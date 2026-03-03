import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LeaveRequest } from '@/models/LeaveRequest';
import { User } from '@/models/User';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    await dbConnect();

    if (type === 'pending_leaves') {
      const count = await LeaveRequest.countDocuments({ status: 'pending' });
      return NextResponse.json({ success: true, count });
    }

    if (type === 'pending_drivers') {
      const count = await User.countDocuments({ status: { $ne: 'active' } });
      return NextResponse.json({ success: true, count });
    }

    if (type === 'all') {
      const [pendingLeaves, pendingDrivers] = await Promise.all([
        LeaveRequest.countDocuments({ status: 'pending' }),
        User.countDocuments({ status: { $ne: 'active' } }),
      ]);
      return NextResponse.json({
        success: true,
        counts: {
          pendingLeaves,
          pendingDrivers,
        }
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Get Counts Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
