import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Sponsors API Route
 * Returns current sponsorship data for Sustainability Widget
 * 
 * Fetches real-time data from Stripe subscriptions
 */
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { 
      apiVersion: '2025-11-17.clover' 
    })
  : null;

const MONTHLY_GOAL = 200; // Realistic goal: covers server costs + buffer for growth

export async function GET() {
  try {
    if (!stripe) {
      // Return mock data if Stripe not configured (for development)
      console.warn('Stripe not configured, returning mock data');
      return NextResponse.json({
        totalMonthly: 15,
        patronCount: 3,
        goal: MONTHLY_GOAL
      });
    }

    // Fetch active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.customer', 'data.items.data.price']
    });

    let totalMonthly = 0;
    const uniquePatrons = new Set<string>();

    // Calculate monthly recurring revenue from subscriptions
    for (const sub of subscriptions.data) {
      // Get subscription items
      for (const item of sub.items.data) {
        const price = item.price;
        
        // Only count recurring monthly subscriptions
        if (price.recurring?.interval === 'month' && price.unit_amount) {
          totalMonthly += price.unit_amount / 100; // Convert cents to dollars
        }
      }
      
      // Track unique patrons (customers)
      if (sub.customer) {
        const customerId = typeof sub.customer === 'string' 
          ? sub.customer 
          : sub.customer.id;
        uniquePatrons.add(customerId);
      }
    }

    // Also count one-time donations from the last 30 days
    // Convert to monthly equivalent for display purposes
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    
    try {
      // Use PaymentIntents API (newer, recommended) to get one-time payments
      const paymentIntents = await stripe.paymentIntents.list({
        created: { gte: thirtyDaysAgo },
        limit: 100
      });

      // Sum one-time donations (approximate monthly equivalent)
      let oneTimeTotal = 0;
      for (const pi of paymentIntents.data) {
        // Only count successful one-time payments
        // Check metadata to identify one-time donations vs subscriptions
        const tierName = pi.metadata?.tierName?.toLowerCase() || '';
        const isOneTimeDonation = tierName.includes('donation') || tierName.includes('one-time');
        
        // Only count if it's marked as a one-time donation in metadata
        if (pi.status === 'succeeded' && pi.amount && isOneTimeDonation) {
          oneTimeTotal += pi.amount / 100;
        }
      }
      
      // Convert to monthly equivalent (divide by 30 days, multiply by 30)
      // This gives us an approximate monthly rate from one-time donations
      const monthlyEquivalent = oneTimeTotal / 30;
      totalMonthly += monthlyEquivalent;
    } catch (paymentError) {
      // If payment intents API fails, continue with subscription data only
      console.warn('Could not fetch one-time donations:', paymentError);
    }

    return NextResponse.json({
      totalMonthly: Math.round(totalMonthly * 100) / 100, // Round to 2 decimal places
      patronCount: uniquePatrons.size,
      goal: MONTHLY_GOAL
    });
  } catch (error) {
    console.error('Error fetching sponsor data from Stripe:', error);
    // Return fallback data on error
    return NextResponse.json({
      totalMonthly: 0,
      patronCount: 0,
      goal: MONTHLY_GOAL
    });
  }
}
