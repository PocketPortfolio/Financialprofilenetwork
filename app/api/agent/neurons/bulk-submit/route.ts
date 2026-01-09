/**
 * NEURON: Bulk Lead Submission Endpoint
 * 
 * Allows external sources to submit multiple leads at once
 * 
 * POST /api/agent/neurons/bulk-submit
 * 
 * Body: {
 *   leads: Array<{
 *     email: string
 *     companyName: string
 *     jobTitle?: string
 *     firstName?: string
 *     lastName?: string
 *     location?: string
 *     metadata?: object
 *   }>
 *   source: string (e.g., 'partner_api', 'affiliate', 'webhook')
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads, auditLogs } from '@/db/sales/schema';
import { eq, inArray } from 'drizzle-orm';
import { validateEmail } from '@/lib/sales/email-validation';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';

// Next.js route configuration
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface BulkLeadSubmission {
  leads: Array<{
    email: string;
    companyName: string;
    jobTitle?: string;
    firstName?: string;
    lastName?: string;
    location?: string;
    metadata?: Record<string, any>;
  }>;
  source: string;
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
    return true; // Development mode
  }

  return token === validKey;
}

/**
 * POST /api/agent/neurons/bulk-submit
 * Submit multiple leads from external source
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

    const body: BulkLeadSubmission = await request.json();

    // Validate
    if (!body.leads || !Array.isArray(body.leads) || body.leads.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty leads array' },
        { status: 400 }
      );
    }

    if (!body.source) {
      return NextResponse.json(
        { error: 'Missing required field: source' },
        { status: 400 }
      );
    }

    // Limit batch size (prevent abuse)
    const MAX_BATCH_SIZE = 1000;
    const leadsToProcess = body.leads.slice(0, MAX_BATCH_SIZE);

    const results = {
      submitted: 0,
      duplicates: 0,
      invalid: 0,
      errors: [] as string[],
    };

    // Check for existing emails (batch query)
    const emails = leadsToProcess.map(l => l.email);
    const existingLeads = await db
      .select({ email: leads.email })
      .from(leads)
      .where(inArray(leads.email, emails));

    const existingEmails = new Set(existingLeads.map(l => l.email));

    // Process each lead
    for (const lead of leadsToProcess) {
      try {
        // Skip if missing required fields
        if (!lead.email || !lead.companyName) {
          results.invalid++;
          results.errors.push(`Missing required fields: ${lead.email || 'unknown'}`);
          continue;
        }

        // Skip duplicates
        if (existingEmails.has(lead.email)) {
          results.duplicates++;
          continue;
        }

        // Validate email
        if (isPlaceholderEmail(lead.email)) {
          results.invalid++;
          results.errors.push(`Placeholder email: ${lead.email}`);
          continue;
        }

        // Validate with MX check (async, but we'll do it)
        const validation = await validateEmail(lead.email);
        if (!validation.isValid) {
          results.invalid++;
          results.errors.push(`Invalid email ${lead.email}: ${validation.reason}`);
          continue;
        }

        // Insert lead
        const [newLead] = await db.insert(leads).values({
          email: lead.email,
          firstName: lead.firstName || null,
          lastName: lead.lastName || null,
          companyName: lead.companyName,
          jobTitle: lead.jobTitle || 'CTO',
          location: lead.location || null,
          dataSource: `neuron_${body.source}`,
          status: 'NEW',
          score: 0,
          researchData: lead.metadata || {},
        }).returning({ id: leads.id });

        // Log submission
        await db.insert(auditLogs).values({
          leadId: newLead.id,
          action: 'LEAD_SUBMITTED',
          aiReasoning: `Lead submitted via Neuron Bulk API from source: ${body.source}`,
          metadata: {
            source: body.source,
            submittedAt: new Date().toISOString(),
            metadata: lead.metadata,
          },
        });

        results.submitted++;
        existingEmails.add(lead.email); // Track to avoid duplicates in same batch

        // Small delay to avoid overwhelming database
        if (results.submitted % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error: any) {
        results.invalid++;
        results.errors.push(`Error processing ${lead.email}: ${error.message}`);
      }
    }

    console.log(`✅ Neuron bulk submission: ${results.submitted} submitted, ${results.duplicates} duplicates, ${results.invalid} invalid`);

    return NextResponse.json({
      success: true,
      message: 'Bulk submission processed',
      results: {
        total: leadsToProcess.length,
        submitted: results.submitted,
        duplicates: results.duplicates,
        invalid: results.invalid,
        errors: results.errors.slice(0, 10), // Return first 10 errors
      },
    });
  } catch (error: any) {
    console.error('❌ Neuron bulk submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process bulk submission' },
      { status: 500 }
    );
  }
}


