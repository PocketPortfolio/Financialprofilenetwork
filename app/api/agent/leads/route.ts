import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq, desc, inArray, sql, and, not, or, like } from 'drizzle-orm';
import { withRetry } from '@/lib/sales/db-retry';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';

// Next.js route configuration for dynamic routes in production
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/agent/leads
 * List all leads with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const statusParam = searchParams.get('status'); // Can be comma-separated

    const offset = (page - 1) * limit;

    // Use retry logic for database operations
    const results = await withRetry(async () => {
      // CRITICAL: Always exclude placeholder emails and test domains from dashboard
      const excludePlaceholders = and(
        not(like(leads.email, '%.placeholder')),
        not(like(leads.email, '%@similar.%')),
        not(like(leads.email, '%@github-hiring.%')),
        // Exclude test/invalid domains (RFC 2606)
        not(like(leads.email, '%@example.com')),
        not(like(leads.email, '%@example.org')),
        not(like(leads.email, '%@example.net')),
        not(like(leads.email, '%@test.com')),
        not(like(leads.email, '%@test.local')),
        not(like(leads.email, '%@invalid.com')),
        not(like(leads.email, '%@fake.com')),
        not(like(leads.email, '%@dummy.com')),
        not(like(leads.email, '%@sample.com')),
        // Exclude test company names
        not(like(leads.companyName, '%Test%')),
        not(like(leads.companyName, '%test%')),
      );
      
      // Handle multiple statuses (comma-separated)
      if (statusParam) {
        const statuses = statusParam.split(',').map(s => s.trim()).filter(Boolean);
        if (statuses.length === 1) {
          return await db.select().from(leads)
            .where(and(eq(leads.status, statuses[0] as any), excludePlaceholders))
            .orderBy(desc(leads.createdAt))
            .limit(limit)
            .offset(offset);
        } else if (statuses.length > 1) {
          // Multiple statuses: use inArray
          return await db.select().from(leads)
            .where(and(inArray(leads.status, statuses as any[]), excludePlaceholders))
            .orderBy(desc(leads.createdAt))
            .limit(limit)
            .offset(offset);
        }
      }

      // No status filter - still exclude placeholders
      return await db.select().from(leads)
        .where(excludePlaceholders)
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset);
    });

    // Get total count for pagination (excluding placeholders and test domains)
    const totalCount = await withRetry(async () => {
      const excludePlaceholders = and(
        not(like(leads.email, '%.placeholder')),
        not(like(leads.email, '%@similar.%')),
        not(like(leads.email, '%@github-hiring.%')),
        // Exclude test/invalid domains (RFC 2606)
        not(like(leads.email, '%@example.com')),
        not(like(leads.email, '%@example.org')),
        not(like(leads.email, '%@example.net')),
        not(like(leads.email, '%@test.com')),
        not(like(leads.email, '%@test.local')),
        not(like(leads.email, '%@invalid.com')),
        not(like(leads.email, '%@fake.com')),
        not(like(leads.email, '%@dummy.com')),
        not(like(leads.email, '%@sample.com')),
        // Exclude test company names
        not(like(leads.companyName, '%Test%')),
        not(like(leads.companyName, '%test%')),
      );
      
      if (statusParam) {
        const statuses = statusParam.split(',').map(s => s.trim()).filter(Boolean);
        if (statuses.length === 1) {
          const result = await db.select({ count: sql<number>`count(*)` }).from(leads)
            .where(and(eq(leads.status, statuses[0] as any), excludePlaceholders));
          const count = result[0]?.count;
          return typeof count === 'number' ? count : parseInt(String(count || '0'), 10);
        } else if (statuses.length > 1) {
          const result = await db.select({ count: sql<number>`count(*)` }).from(leads)
            .where(and(inArray(leads.status, statuses as any[]), excludePlaceholders));
          const count = result[0]?.count;
          return typeof count === 'number' ? count : parseInt(String(count || '0'), 10);
        }
      }
      
      // No status filter - still exclude placeholders
      const result = await db.select({ count: sql<number>`count(*)` }).from(leads)
        .where(excludePlaceholders);
      const count = result[0]?.count;
      return typeof count === 'number' ? count : parseInt(String(count || '0'), 10);
    });

    return NextResponse.json({
      leads: results,
      page,
      limit,
      total: totalCount,
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


