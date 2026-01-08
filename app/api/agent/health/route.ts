import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';

/**
 * GET /api/agent/health
 * Health check endpoint for sales system
 */
export async function GET(request: NextRequest) {
  const checks = {
    database: { status: 'unknown', message: '' },
    environment: { status: 'unknown', message: '' },
    timestamp: new Date().toISOString(),
  };

  // Check environment variable
  if (!process.env.SUPABASE_SALES_DATABASE_URL) {
    checks.environment = {
      status: 'error',
      message: 'SUPABASE_SALES_DATABASE_URL not set',
    };
    return NextResponse.json(checks, { status: 503 });
  }

  checks.environment = {
    status: 'ok',
    message: 'Environment variables configured',
  };

  // Test database connection
  try {
    await db.select().from(leads).limit(1);
    checks.database = {
      status: 'ok',
      message: 'Database connection successful',
    };
  } catch (error: any) {
    let errorMessage = error.message || 'Database connection failed';
    
    // Provide specific guidance for common errors
    if (error.message?.includes('MaxClientsInSessionMode') || error.message?.includes('max clients reached')) {
      errorMessage = 'Connection pool exhausted. Using Session Pooler? Check connection string uses port 6543. If issue persists, wait a few seconds and retry.';
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      errorMessage = 'DNS resolution failed. Check SUPABASE_SALES_DATABASE_URL connection string.';
    } else if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      errorMessage = 'Database tables not found. Run: npm run db:push';
    }
    
    checks.database = {
      status: 'error',
      message: errorMessage,
    };
    return NextResponse.json(checks, { status: 503 });
  }

  return NextResponse.json(checks, { status: 200 });
}

