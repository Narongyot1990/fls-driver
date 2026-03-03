import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Leader } from '@/models/Leader';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { leaderId, name, currentPassword, newPassword } = body;

    if (!leaderId) {
      return NextResponse.json({ error: 'Leader ID is required' }, { status: 400 });
    }

    await dbConnect();

    const leader = await Leader.findById(leaderId);

    if (!leader) {
      return NextResponse.json({ error: 'Leader not found' }, { status: 404 });
    }

    if (name) {
      leader.name = name;
    }

    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, leader.password);
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' },
          { status: 400 }
        );
      }

      leader.password = await bcrypt.hash(newPassword, 12);
    } else if (newPassword && !currentPassword) {
      return NextResponse.json(
        { error: 'กรุณากรอกรหัสผ่านปัจจุบัน' },
        { status: 400 }
      );
    }

    await leader.save();

    return NextResponse.json({
      success: true,
      leader: {
        id: leader._id,
        email: leader.email,
        name: leader.name,
      },
    });
  } catch (error) {
    console.error('Update Leader Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
