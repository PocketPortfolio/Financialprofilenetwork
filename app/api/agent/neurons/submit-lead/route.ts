/**
 * NEURON: External Lead Submission Endpoint
 * 
 * Allows external sources (partners, affiliates, automated systems) to submit leads
 * directly to the Sales Pilot system.
 * 
 * POST /api/agent/neurons/submit-lead
 * 
 * Body: {
 *   email: string (required)
 *   companyName: string (required)
 *   jobTitle?: string (default: 'CTO')
 *   firstName?: string
 *   lastName?: string
 *   location?: string
 *   source: string (e.g., 'partner_api', 'affiliate', 'webhook')
 *   metadata?: object (additional data)
 * }
 * 
 * Headers:
 *   Authorization: Bearer <NEURON_API_KEY>
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads, auditLogs } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';
import { validateEmail } from '@/lib/sales/email-validation';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';

// Next.js route configuration
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface NeuronLeadSubmission {
  email: string;
  companyName: string;
  jobTitle?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  source: string;
  metadata?: Record<string, any>;
}

/**
 * Verify neuron API key
 */
function verifyNeuronKey(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  const validKey = process.env.NEURON_API_KEY;

  if (!validKey) {
    // If no key set, allow all (development mode)
    // In production, should require key
    return true;
  }

  return token === validKey;
}

/**
 * POST /api/agent/neurons/submit-lead
 * Submit a single lead from external source
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!verifyNeuronKey(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized. Valid NEURON_API_KEY required.' },
        { status: 401 }
      );
    }

    const body: NeuronLeadSubmission = await request.json();

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
      return NextResponse.json(
        { 
          success: false,
          message: 'Lead already exists',
          leadId: existing[0].id,
        },
        { status: 200 } // 200 because it's not an error, just a duplicate
      );
    }

    // Insert new lead
    const [newLead] = await db.insert(leads).values({
      email: body.email,
      firstName: body.firstName || null,
      lastName: body.lastName || null,
      companyName: body.companyName,
      jobTitle: body.jobTitle || 'CTO',
      location: body.location || null,
      dataSource: `neuron_${body.source}`,
      status: 'NEW',
      score: 0,
      researchData: body.metadata || {},
    }).returning({ id: leads.id });

    // Log submission
    await db.insert(auditLogs).values({
      leadId: newLead.id,
      action: 'LEAD_SUBMITTED',
      aiReasoning: `Lead submitted via Neuron API from source: ${body.source}`,
      metadata: {
        source: body.source,
        submittedAt: new Date().toISOString(),
        metadata: body.metadata,
      },
    });

    console.log(`✅ Neuron lead submitted: ${body.email} at ${body.companyName} (source: ${body.source})`);

    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully',
      leadId: newLead.id,
    });
  } catch (error: any) {
    console.error('❌ Neuron submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit lead' },
      { status: 500 }
    );
  }
}


