// NextAuth is not used in this project - using custom JWT auth instead
// This file is kept as a placeholder to prevent 404 on /api/auth/* routes
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 404 });
}
