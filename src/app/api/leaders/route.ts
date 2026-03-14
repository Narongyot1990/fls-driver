import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { Leader, ILeader } from '@/models/Leader';
import { requireSuperuser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// GET /api/leaders - List all leaders (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = requireSuperuser(request);
    if ('error' in authResult) return authResult.error;

    await dbConnect();

    const leaders = await Leader.find()
      .select('email name branch role createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      leaders,
    });
  } catch (error) {
    console.error('Get Leaders Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leaders - Create new leader (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = requireSuperuser(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { email, password, name, branch, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if email already exists
    const existing = await Leader.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const leader = await Leader.create({
      email,
      password: hashedPassword,
      name,
      branch: branch || null,
      role: role || 'leader',
    });

    return NextResponse.json({
      success: true,
      leader: {
        id: leader._id,
        email: leader.email,
        name: leader.name,
        branch: leader.branch,
        role: leader.role,
      },
    });
  } catch (error) {
    console.error('Create Leader Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/leaders - Update leader (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const authResult = requireSuperuser(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { leaderId, email, name, branch, role, newPassword } = body;

    if (!leaderId) {
      return NextResponse.json({ error: 'Leader ID is required' }, { status: 400 });
    }

    await dbConnect();

    const leader = await Leader.findById(leaderId);
    if (!leader) {
      return NextResponse.json({ error: 'Leader not found' }, { status: 404 });
    }

    if (name !== undefined) leader.name = name;
    if (email !== undefined) leader.email = email;
    if (branch !== undefined) leader.branch = branch;
    if (role !== undefined) leader.role = role;
    
    if (newPassword) {
      leader.password = await bcrypt.hash(newPassword, 10);
    }

    await leader.save();

    return NextResponse.json({
      success: true,
      leader: {
        id: leader._id,
        email: leader.email,
        name: leader.name,
        branch: leader.branch,
        role: leader.role,
      },
    });
  } catch (error) {
    console.error('Update Leader Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
