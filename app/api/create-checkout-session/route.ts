import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set. Stripe checkout will not work.');
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      console.error('❌ Stripe not initialized - STRIPE_SECRET_KEY missing');
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { priceId, tierName, email, utm_campaign, utm_source, utm_medium, utm_content, trigger_source, billing_interval } = body as {
      priceId?: string;
      tierName?: string;
      email?: string;
      utm_campaign?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_content?: string;
      trigger_source?: string;
      billing_interval?: 'monthly' | 'annual' | null;
    };
    const utmCampaignMeta =
      typeof utm_campaign === 'string' && utm_campaign.trim().length > 0
        ? utm_campaign.trim().slice(0, 500)
        : 'organic';
    const utmSourceMeta = typeof utm_source === 'string' && utm_source.trim() ? utm_source.trim().slice(0, 200) : 'direct';
    const utmMediumMeta = typeof utm_medium === 'string' && utm_medium.trim() ? utm_medium.trim().slice(0, 200) : 'checkout';
    const utmContentMeta = typeof utm_content === 'string' && utm_content.trim() ? utm_content.trim().slice(0, 200) : 'none';
    const triggerSourceMeta = typeof trigger_source === 'string' && trigger_source.trim() ? trigger_source.trim().slice(0, 200) : 'sponsor_page_direct';
    const billingIntervalMeta = billing_interval === 'monthly' || billing_interval === 'annual' ? billing_interval : 'unknown';
    console.log('🔄 Creating Stripe checkout session:', {
      priceId,
      tierName,
      email,
      utm_campaign: utmCampaignMeta,
      utm_source: utmSourceMeta,
      utm_medium: utmMediumMeta,
      utm_content: utmContentMeta,
      trigger_source: triggerSourceMeta,
      billing_interval: billingIntervalMeta,
    });

    if (!priceId || priceId.includes('XXXXX')) {
      return NextResponse.json(
        { error: 'Invalid price ID. Please configure Stripe Price IDs.' },
        { status: 400 }
      );
    }

    // Fetch the price from Stripe to determine if it's recurring or one-time
    let isOneTime = false;
    try {
      const price = await stripe.prices.retrieve(priceId);
      // Check if price is recurring (subscription) or one-time (payment)
      isOneTime = !price.recurring; // If recurring is null/undefined, it's one-time
      console.log('📊 Price details:', { 
        priceId, 
        type: price.type, 
        recurring: price.recurring ? `${price.recurring.interval} (${price.recurring.interval_count})` : 'one-time',
        isOneTime 
      });
    } catch (priceError: any) {
      const isNoSuchPrice = priceError?.message?.includes('No such price');
      if (isNoSuchPrice) {
        const mode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'Live' : 'Test';
        const monthlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_MONTHLY;
        let monthlyExistsInStripe = false;
        if (monthlyId && monthlyId !== priceId) {
          try {
            await stripe.prices.retrieve(monthlyId);
            monthlyExistsInStripe = true;
          } catch (_) {
            monthlyExistsInStripe = false;
          }
        }
        console.error(`Stripe price not found (${priceId}). Mode=${mode}. Monthly FC price exists in same account: ${monthlyExistsInStripe}. If monthly works, the annual price ID may be from Test or wrong — copy the Live annual price ID from Dashboard.`);
        const hint = monthlyExistsInStripe
          ? ' The monthly Founders Club price exists in this Stripe account; the annual price ID is missing or from another mode. In Stripe Dashboard (Live), open Founders Club (Annual) → copy the correct Live price ID into NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_ANNUAL.'
          : ` Create both Founders Club products in Dashboard under ${mode} mode and set the price IDs in your environment.`;
        return NextResponse.json(
          { error: `Price not found in Stripe (${priceId}). Your app is using Stripe ${mode} mode.${hint}` },
          { status: 400 }
        );
      }
      console.warn('⚠️ Could not fetch price from Stripe, falling back to tier name check:', priceError.message);
      const tn = tierName?.toLowerCase() ?? '';
      isOneTime =
        tn.includes('donation') ||
        tn.includes('one-time') ||
        tn.includes('founder') ||
        tn.includes('lifetime');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pocketportfolio.app';

    const session = await stripe.checkout.sessions.create({
      mode: isOneTime ? 'payment' : 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/sponsor/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/sponsor`,
      customer_email: email || undefined,
      metadata: {
        tierName: tierName || 'Unknown',
        email: email || '',
        utm_campaign: utmCampaignMeta,
        utm_source: utmSourceMeta,
        utm_medium: utmMediumMeta,
        utm_content: utmContentMeta,
        trigger_source: triggerSourceMeta,
        billing_interval: billingIntervalMeta,
      },
    });

    console.log('✅ Stripe checkout session created:', session.id);
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url  // Return the checkout URL for direct redirect
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

