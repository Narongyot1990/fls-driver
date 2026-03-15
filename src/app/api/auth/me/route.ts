import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { Leader } from '@/models/Leader';
import { getCurrentUser } from '@/lib/jwt-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    const tokenPayload = await getCurrentUser();
    
    if (!tokenPayload) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Unified User Fetching
    const userRole = tokenPayload.role;
    const userId = tokenPayload.userId;

    // Special case for root administrator
    if (userId === 'admin_root') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin_root',
          email: 'administrator@fls.com',
          name: 'ITL Administrator',
          role: 'admin',
          status: 'active',
        },
      });
    }
    const user = await User.findById(userId);
    
    if (user) {
      // Update online status for everyone in User model
      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date(),
        isOnline: true,
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user._id,
          lineUserId: user.lineUserId,
          lineDisplayName: user.lineDisplayName,
          lineProfileImage: user.lineProfileImage,
          name: user.name,
          surname: user.surname,
          phone: user.phone,
          employeeId: user.employeeId,
          branch: user.branch,
          status: user.status,
          role: user.role, // Use role from DB
          // Driver specific fields (safe to include for all)
          vacationDays: user.vacationDays,
          sickDays: user.sickDays,
          performanceTier: user.performanceTier,
        },
      });
    }

    // Fallback for legacy Leader model (Admin accounts or existing Leaders)
    if (userRole === 'leader' || userRole === 'admin') {
      const leader = await Leader.findById(userId);
      if (leader) {
        return NextResponse.json({
          success: true,
          user: {
            id: leader._id,
            email: leader.email,
            name: leader.name,
            branch: leader.branch,
            role: leader.role || userRole,
          },
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: 'User not found in system' 
    }, { status: 404 });
  } catch (error) {
    console.error('Get Current User Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
