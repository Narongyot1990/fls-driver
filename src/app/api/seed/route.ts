import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Leader } from '@/models/Leader';
import { User } from '@/models/User';
import { LeaveRequest } from '@/models/LeaveRequest';
import { SubstituteRecord } from '@/models/SubstituteRecord';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name, secretKey } = body;

    const expectedSecret = 'itl-leave-system-secret-2024';
    if (secretKey !== expectedSecret) {
      return NextResponse.json({ error: 'Invalid secret key' }, { status: 403 });
    }

    await dbConnect();

    // Reset database - delete all data
    if (action === 'reset') {
      await Promise.all([
        User.deleteMany({}),
        LeaveRequest.deleteMany({}),
        SubstituteRecord.deleteMany({}),
        Leader.deleteMany({}),
      ]);
      
      return NextResponse.json({
        success: true,
        message: 'Database reset successfully',
      });
    }

    // Seed leader
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const existingLeader = await Leader.findOne({ email });
    if (existingLeader) {
      return NextResponse.json(
        { error: 'Leader already exists', leader: existingLeader },
        { status: 200 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const leader = await Leader.create({
      email,
      password: hashedPassword,
      name,
      role: body.role || 'leader',
      branch: body.branch || undefined,
    });

    return NextResponse.json({
      success: true,
      leader: {
        id: leader._id,
        email: leader.email,
        name: leader.name,
      },
    });
  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
