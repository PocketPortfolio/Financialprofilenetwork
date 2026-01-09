import { NextRequest, NextResponse } from 'next/server';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Simple mock API for backward compatibility
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      message: 'This API endpoint is deprecated. Please use the client-side form.' 
    },
    { status: 410 }
  );
}