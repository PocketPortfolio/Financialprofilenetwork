import { NextRequest, NextResponse } from 'next/server';

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