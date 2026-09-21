/**
 * Persist Open Portfolio (B2B) contact-form submissions for admin analytics.
 * Mirrors the architectureChallengeLeads pattern at
 * lib/challenge/challenge-leads-firestore.ts. Server-written only via the
 * Firebase Admin SDK; no client read path.
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const OPEN_PORTFOLIO_LEADS_COLLECTION = 'open_portfolio_contact_leads';

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export interface OpenPortfolioLeadPayload {
  email: string;
  company?: string;
  role?: string;
  message: string;
  context?:
    | 'design-partner'
    | 'architecture-review'
    | 'sdk-embed'
    | 'general'
    | 'tier1'
    | 'design-challenge'
    | 'investor'
    | 'grant';
  source?: string;
  /** CRM pipeline stage — default inquiry; CCO promotes to qualified_opportunity. */
  pipelineStage?: 'inquiry' | 'qualified_opportunity' | 'won' | 'lost';
  /** Attribution: organic | ai | authority | outbound | unknown */
  attributionChannel?: 'organic' | 'ai' | 'authority' | 'outbound' | 'unknown';
}

/** Persist a single Open Portfolio contact-form submission. Best-effort. */
export async function recordOpenPortfolioContactLead(
  payload: OpenPortfolioLeadPayload,
): Promise<void> {
  const db = getDb();
  await db.collection(OPEN_PORTFOLIO_LEADS_COLLECTION).add({
    email: payload.email.toLowerCase().trim(),
    company: payload.company?.trim() || null,
    role: payload.role?.trim() || null,
    message: payload.message.trim(),
    context: payload.context ?? 'general',
    source: payload.source ?? 'open_portfolio_landing',
    pipelineStage: payload.pipelineStage ?? 'inquiry',
    attributionChannel: payload.attributionChannel ?? 'unknown',
    createdAt: Timestamp.now(),
    path: '/',
  });
}

/**
 * CCO-owned promotion: mark a lead document as qualified_opportunity.
 * Criteria: company identified; technical/risk owner engaged; perimeter/AI use case
 * stated; architecture review or diligence call completed or booked with next step ≤14 days.
 */
export async function promoteLeadToQualifiedOpportunity(
  leadId: string,
  opts?: { attributionChannel?: OpenPortfolioLeadPayload['attributionChannel']; note?: string },
): Promise<void> {
  const db = getDb();
  await db.collection(OPEN_PORTFOLIO_LEADS_COLLECTION).doc(leadId).set(
    {
      pipelineStage: 'qualified_opportunity',
      qualifiedAt: Timestamp.now(),
      ...(opts?.attributionChannel ? { attributionChannel: opts.attributionChannel } : {}),
      ...(opts?.note ? { qualificationNote: opts.note } : {}),
    },
    { merge: true },
  );
}

export type OpenPortfolioLeadRow = {
  id: string;
  email: string;
  company?: string;
  role?: string;
  message: string;
  context?: string;
  createdAt: string;
};

/**
 * Aggregates for /admin/analytics. Same shape as challenge-leads so the dashboard
 * card layout is consistent across funnels.
 */
export async function getOpenPortfolioLeadsAnalytics(startDate: Date): Promise<{
  total: number;
  last7Days: number;
  byContext: Record<string, number>;
  signups: OpenPortfolioLeadRow[];
  error?: string;
}> {
  try {
    const db = getDb();
    const startTs = Timestamp.fromDate(startDate);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last7Start = new Date(Math.max(startDate.getTime(), sevenDaysAgo.getTime()));
    const last7Ts = Timestamp.fromDate(last7Start);

    const col = db.collection(OPEN_PORTFOLIO_LEADS_COLLECTION);

    const [totalAgg, last7Agg, listSnap] = await Promise.all([
      col.where('createdAt', '>=', startTs).count().get(),
      col.where('createdAt', '>=', last7Ts).count().get(),
      col.where('createdAt', '>=', startTs).orderBy('createdAt', 'desc').limit(100).get(),
    ]);

    const byContext: Record<string, number> = {};
    const signups: OpenPortfolioLeadRow[] = listSnap.docs.map((d) => {
      const data = d.data();
      const created = data.createdAt as Timestamp | undefined;
      const context = typeof data.context === 'string' ? data.context : 'general';
      byContext[context] = (byContext[context] ?? 0) + 1;
      return {
        id: d.id,
        email: typeof data.email === 'string' ? data.email : '',
        company: typeof data.company === 'string' ? data.company : undefined,
        role: typeof data.role === 'string' ? data.role : undefined,
        message: typeof data.message === 'string' ? data.message : '',
        context,
        createdAt: created?.toDate?.()?.toISOString() ?? '',
      };
    });

    return {
      total: totalAgg.data().count,
      last7Days: last7Agg.data().count,
      byContext,
      signups,
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[open-portfolio-leads-firestore] getOpenPortfolioLeadsAnalytics:', message);
    return {
      total: 0,
      last7Days: 0,
      byContext: {},
      signups: [],
      error: message,
    };
  }
}
