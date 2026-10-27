/**
 * Persist Open Portfolio (B2B) contact-form submissions for admin analytics.
 * Mirrors the architectureChallengeLeads pattern at
 * lib/challenge/challenge-leads-firestore.ts. Server-written only via the
 * Firebase Admin SDK; no client read path.
 */

import { getFirestore, Timestamp, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
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
  pipelineStage?: OpenPortfolioLeadPayload['pipelineStage'];
  attributionChannel?: OpenPortfolioLeadPayload['attributionChannel'];
  source?: string;
  qualifiedAt?: string;
};

export type OpenPortfolioConversionFunnel = {
  inquiries: number;
  qualifiedOpportunities: number;
  won: number;
  lost: number;
  byChannel: Record<string, number>;
  last7DaysQualified: number;
};

/**
 * Aggregates for /admin/analytics. Same shape as challenge-leads so the dashboard
 * card layout is consistent across funnels.
 */
function mapLeadDoc(
  d: QueryDocumentSnapshot,
  byContext: Record<string, number>,
): OpenPortfolioLeadRow {
  const data = d.data();
  const created = data.createdAt as Timestamp | undefined;
  const qualified = data.qualifiedAt as Timestamp | undefined;
  const context = typeof data.context === 'string' ? data.context : 'general';
  byContext[context] = (byContext[context] ?? 0) + 1;
  const stage =
    data.pipelineStage === 'qualified_opportunity' ||
    data.pipelineStage === 'won' ||
    data.pipelineStage === 'lost' ||
    data.pipelineStage === 'inquiry'
      ? data.pipelineStage
      : 'inquiry';
  const channel =
    data.attributionChannel === 'organic' ||
    data.attributionChannel === 'ai' ||
    data.attributionChannel === 'authority' ||
    data.attributionChannel === 'outbound' ||
    data.attributionChannel === 'unknown'
      ? data.attributionChannel
      : 'unknown';
  return {
    id: d.id,
    email: typeof data.email === 'string' ? data.email : '',
    company: typeof data.company === 'string' ? data.company : undefined,
    role: typeof data.role === 'string' ? data.role : undefined,
    message: typeof data.message === 'string' ? data.message : '',
    context,
    createdAt: created?.toDate?.()?.toISOString() ?? '',
    pipelineStage: stage,
    attributionChannel: channel,
    source: typeof data.source === 'string' ? data.source : undefined,
    qualifiedAt: qualified?.toDate?.()?.toISOString(),
  };
}

export async function getOpenPortfolioLeadsAnalytics(startDate: Date): Promise<{
  total: number;
  last7Days: number;
  byContext: Record<string, number>;
  byPipelineStage: Record<string, number>;
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
    const byPipelineStage: Record<string, number> = {};
    const signups: OpenPortfolioLeadRow[] = listSnap.docs.map((d) => {
      const row = mapLeadDoc(d, byContext);
      const stage = row.pipelineStage ?? 'inquiry';
      byPipelineStage[stage] = (byPipelineStage[stage] ?? 0) + 1;
      return row;
    });

    return {
      total: totalAgg.data().count,
      last7Days: last7Agg.data().count,
      byContext,
      byPipelineStage,
      signups,
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[open-portfolio-leads-firestore] getOpenPortfolioLeadsAnalytics:', message);
    return {
      total: 0,
      last7Days: 0,
      byContext: {},
      byPipelineStage: {},
      signups: [],
      error: message,
    };
  }
}

/** Conversion funnel counts for Growth HUD — discovery → inquiry → qualified. */
export async function getOpenPortfolioConversionFunnel(
  startDate: Date,
): Promise<OpenPortfolioConversionFunnel & { error?: string }> {
  try {
    const analytics = await getOpenPortfolioLeadsAnalytics(startDate);
    if (analytics.error) {
      return {
        inquiries: 0,
        qualifiedOpportunities: 0,
        won: 0,
        lost: 0,
        byChannel: {},
        last7DaysQualified: 0,
        error: analytics.error,
      };
    }
    const byChannel: Record<string, number> = {};
    let last7DaysQualified = 0;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const row of analytics.signups) {
      const ch = row.attributionChannel ?? 'unknown';
      byChannel[ch] = (byChannel[ch] ?? 0) + 1;
      if (
        row.pipelineStage === 'qualified_opportunity' &&
        row.qualifiedAt &&
        new Date(row.qualifiedAt).getTime() >= weekAgo
      ) {
        last7DaysQualified += 1;
      }
    }
    return {
      inquiries: analytics.byPipelineStage.inquiry ?? 0,
      qualifiedOpportunities: analytics.byPipelineStage.qualified_opportunity ?? 0,
      won: analytics.byPipelineStage.won ?? 0,
      lost: analytics.byPipelineStage.lost ?? 0,
      byChannel,
      last7DaysQualified,
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      inquiries: 0,
      qualifiedOpportunities: 0,
      won: 0,
      lost: 0,
      byChannel: {},
      last7DaysQualified: 0,
      error: message,
    };
  }
}

export async function getOpenPortfolioLeadById(leadId: string): Promise<OpenPortfolioLeadRow | null> {
  const db = getDb();
  const snap = await db.collection(OPEN_PORTFOLIO_LEADS_COLLECTION).doc(leadId).get();
  if (!snap.exists) return null;
  const byContext: Record<string, number> = {};
  // Reuse mapper via a query-shaped wrapper (id + data).
  return mapLeadDoc(
    { id: snap.id, data: () => snap.data()! } as QueryDocumentSnapshot,
    byContext,
  );
}
