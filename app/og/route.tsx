import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basic OG image generation
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Pocket Portfolio';
    
    return new NextResponse(
      `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#0b1220"/>
        <text x="600" y="315" text-anchor="middle" fill="#ff6b35" font-family="system-ui" font-size="48" font-weight="bold">${title}</text>
      </svg>`,
      {
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      }
    );
  } catch (error) {
    console.error('OG route error:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}






