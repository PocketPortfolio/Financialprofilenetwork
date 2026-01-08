import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq, desc } from 'drizzle-orm';
import { withRetry } from '@/lib/sales/db-retry';

/**
 * GET /api/agent/leads
 * List all leads with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const status = searchParams.get('status');

    const offset = (page - 1) * limit;

    // Use retry logic for database operations
    const results = await withRetry(async () => {
      const baseQuery = db.select().from(leads);
      const filteredQuery = status 
        ? baseQuery.where(eq(leads.status, status as any))
        : baseQuery;

      return await filteredQuery
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset);
    });

    return NextResponse.json({
      leads: results,
      page,
      limit,
      total: results.length,
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to fetch leads';
    let statusCode = 500;
    
    if (error.message?.includes('MaxClientsInSessionMode') || error.message?.includes('max clients reached')) {
      errorMessage = 'Connection pool exhausted. Using Session Pooler? Check connection string uses port 6543. If issue persists, wait a few seconds and retry.';
      statusCode = 503;
    } else if (error.message?.includes('SUPABASE_SALES_DATABASE_URL')) {
      errorMessage = 'Database configuration error: SUPABASE_SALES_DATABASE_URL not set';
      statusCode = 500;
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      errorMessage = 'Database connection failed: DNS resolution error. Check SUPABASE_SALES_DATABASE_URL';
      statusCode = 503;
    } else if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      errorMessage = 'Database tables not found. Run: npm run db:push';
      statusCode = 500;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}

/**
 * POST /api/agent/leads
 * Create a new lead
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companyName, firstName, lastName, jobTitle, linkedinUrl, dataSource } = body;

    if (!email || !companyName) {
      return NextResponse.json(
        { error: 'email and companyName are required' },
        { status: 400 }
      );
    }

    const [newLead] = await db.insert(leads).values({
      email,
      companyName,
      firstName: firstName || null,
      lastName: lastName || null,
      jobTitle: jobTitle || null,
      linkedinUrl: linkedinUrl || null,
      dataSource: dataSource || 'manual',
      dataSourceDate: new Date(),
      status: 'NEW',
    }).returning();

    return NextResponse.json({
      success: true,
      lead: newLead,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create lead' },
      { status: 500 }
    );
  }
}


