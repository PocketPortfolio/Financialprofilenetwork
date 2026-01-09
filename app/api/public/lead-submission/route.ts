/**
 * Public Lead Submission API
 * 
 * No authentication required (rate-limited)
 * For partners, affiliates, and automated systems
 * 
 * POST /api/public/lead-submission
 * 
 * Body: {
 *   email: string (required)
 *   companyName: string (required)
 *   jobTitle?: string
 *   source?: string (e.g., 'partner', 'affiliate', 'referral')
 * }
 * 
 * Rate Limit: 100 submissions/hour per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads, auditLogs } from '@/db/sales/schema';
import { eq, and, gte } from 'drizzle-orm';
import { validateEmail } from '@/lib/sales/email-validation';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';
import { sql } from 'drizzle-orm';

// Next.js route configuration
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_PER_HOUR = 100;

/**
 * Check rate limit for IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 }); // 1 hour
    return true;
  }

  if (record.count >= RATE_LIMIT_PER_HOUR) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * POST /api/public/lead-submission
 * Public endpoint for lead submission (rate-limited)
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 100 submissions per hour per IP.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, companyName' },
        { status: 400 }
      );
    }

    // Validate email format
    if (isPlaceholderEmail(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email: placeholder emails not allowed' },
        { status: 400 }
      );
    }

    // Validate email with MX check
    const validation = await validateEmail(body.email);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `Invalid email: ${validation.reason}` },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existing = await db
      .select()
      .from(leads)
      .where(eq(leads.email, body.email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Lead already exists',
        leadId: existing[0].id,
      });
    }

    // Insert new lead
    const [newLead] = await db.insert(leads).values({
      email: body.email,
      firstName: body.firstName || null,
      lastName: body.lastName || null,
      companyName: body.companyName,
      jobTitle: body.jobTitle || 'CTO',
      location: body.location || null,
      dataSource: `public_${body.source || 'unknown'}`,
      status: 'NEW',
      score: 0,
      researchData: {
        submittedVia: 'public_api',
        submittedAt: new Date().toISOString(),
        ip,
      },
    }).returning({ id: leads.id });

    // Log submission
    await db.insert(auditLogs).values({
      leadId: newLead.id,
      action: 'LEAD_SUBMITTED',
      aiReasoning: `Lead submitted via Public API from source: ${body.source || 'unknown'}`,
      metadata: {
        source: body.source || 'unknown',
        submittedAt: new Date().toISOString(),
        ip,
      },
    });

    console.log(`✅ Public API lead submitted: ${body.email} at ${body.companyName}`);

    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully',
      leadId: newLead.id,
    });
  } catch (error: any) {
    console.error('❌ Public lead submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit lead' },
      { status: 500 }
    );
  }
}


