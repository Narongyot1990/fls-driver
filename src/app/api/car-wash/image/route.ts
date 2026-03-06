import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// This route proxies the image
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    const token = process.env.itl_READ_WRITE_TOKEN;

    // Fetch with token (works for both public and private blobs)
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      console.error('Blob fetch failed:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to fetch image', details: response.statusText }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
