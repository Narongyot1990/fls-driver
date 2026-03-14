import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Leader } from '@/models/Leader';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '@/lib/jwt-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    await dbConnect();

    // Special case for Administrator
    if (email === 'administrator@fls.com' && password === 'itl@1234') {
      const payload: TokenPayload = {
        userId: 'admin_root',
        email: 'administrator@fls.com',
        role: 'admin',
      };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      const response = NextResponse.json({
        success: true,
        user: { id: 'admin_root', email: 'administrator@fls.com', name: 'ITL Administrator', role: 'admin' },
      });

      response.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/',
      });
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    const leader = await Leader.findOne({ email });

    if (!leader) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, leader.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const payload: TokenPayload = {
      userId: leader._id.toString(),
      email: leader.email,
      role: 'leader',
      branch: leader.branch,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const response = NextResponse.json({
      success: true,
      leader: {
        id: leader._id,
        email: leader.email,
        name: leader.name,
        branch: leader.branch,
      },
    });

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Leader Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
