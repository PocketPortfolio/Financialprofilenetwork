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

    const { priceId, tierName, email } = await request.json();
    console.log('🔄 Creating Stripe checkout session:', { priceId, tierName, email });

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
      console.warn('⚠️ Could not fetch price from Stripe, falling back to tier name check:', priceError.message);
      // Fallback to tier name check if price fetch fails
      isOneTime = tierName?.toLowerCase().includes('donation') || 
                  tierName?.toLowerCase().includes('one-time') ||
                  tierName?.toLowerCase().includes('founder') ||
                  tierName?.toLowerCase().includes('lifetime');
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

