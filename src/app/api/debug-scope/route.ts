import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return apiHandler(async ({ payload }) => {
    const searchParams = new URL(request.url).searchParams;
    
    return NextResponse.json({
      success: true,
      debug: {
        actor: payload,
        query: {
          branch: searchParams.get('branch'),
          status: searchParams.get('status'),
          userId: searchParams.get('userId'),
        },
        message: 'This shows what the API receives from the frontend'
      }
    });
  })(request);
}
