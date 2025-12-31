import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import crypto from 'crypto';

// Lazy Firebase initialization function
function getDb() {
  // Initialize Firebase Admin if not already initialized
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      throw error;
    }
  }
  return getFirestore();
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set. Stripe webhooks will not work.');
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    })
  : null;

// Webhook secret from Stripe Dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Generate a secure API key
 */
function generateApiKey(): string {
  const prefix = 'pp_';
  const randomBytes = crypto.randomBytes(32);
  const base64 = randomBytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `${prefix}${base64}`;
}

/**
 * Determine tier from price ID
 */
function getTierFromPriceId(priceId: string): {
  tier: 'codeSupporter' | 'featureVoter' | 'corporateSponsor' | 'oneTimeDonation' | 'foundersClub';
  hasApiKey: boolean;
  hasCorporateLicense: boolean;
  isLifetime: boolean;
} {
  const PRICE_IDS = {
    // Monthly subscriptions
    codeSupporterMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CODE_SUPPORTER || 'price_1SeZh7D4sftWa1WtWsDwvQu5',
    featureVoterMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FEATURE_VOTER || 'price_1SeZhnD4sftWa1WtP5GdZ5cT',
    corporateSponsorMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE || 'price_1SeZigD4sftWa1WtTODsYpwE',
    // Annual subscriptions
    codeSupporterAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_CODE_SUPPORTER_ANNUAL || 'price_1SgPGYD4sftWa1WtLgEjFV93',
    featureVoterAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_FEATURE_VOTER_ANNUAL || 'price_1SgPHJD4sftWa1WtW03Tzald',
    corporateSponsorAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE_ANNUAL || 'price_1SgPLzD4sftWa1WtzrgPU5tj',
    // One-time payments
    oneTimeDonation: process.env.NEXT_PUBLIC_STRIPE_PRICE_DONATION || 'price_1SeZj0D4sftWa1WtXkkVps9a',
    foundersClub: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB || 'price_1Sg3ykD4sftWa1Wtheztc1hR',
  };

  // Check monthly subscriptions
  if (priceId === PRICE_IDS.codeSupporterMonthly || priceId === PRICE_IDS.codeSupporterAnnual) {
    return { tier: 'codeSupporter', hasApiKey: true, hasCorporateLicense: false, isLifetime: false };
  }
  if (priceId === PRICE_IDS.featureVoterMonthly || priceId === PRICE_IDS.featureVoterAnnual) {
    return { tier: 'featureVoter', hasApiKey: true, hasCorporateLicense: false, isLifetime: false };
  }
  if (priceId === PRICE_IDS.corporateSponsorMonthly || priceId === PRICE_IDS.corporateSponsorAnnual) {
    return { tier: 'corporateSponsor', hasApiKey: true, hasCorporateLicense: true, isLifetime: false };
  }
  if (priceId === PRICE_IDS.foundersClub) {
    return { tier: 'foundersClub', hasApiKey: true, hasCorporateLicense: false, isLifetime: true };
  }
  return { tier: 'oneTimeDonation', hasApiKey: false, hasCorporateLicense: false, isLifetime: false };
}

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.error('❌ Stripe webhook not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ No Stripe signature found');
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log('✅ Webhook event received:', event.type);

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook handler error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('🔄 Processing checkout.session.completed:', session.id);

  const customerEmail = session.customer_email || session.customer_details?.email;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

  if (!customerEmail) {
    console.error('❌ No customer email in session');
    return;
  }

  // Get price ID from line items
  const lineItems = await stripe!.checkout.sessions.listLineItems(session.id);
  const priceId = lineItems.data[0]?.price?.id;

  if (!priceId) {
    console.error('❌ No price ID found in session');
    return;
  }

  const tierInfo = getTierFromPriceId(priceId);

  // Determine theme access based on tier
  let themeAccess: 'founder' | 'corporate' | null = null;
  if (tierInfo.tier === 'foundersClub') {
    themeAccess = 'founder';
  } else if (tierInfo.tier === 'corporateSponsor') {
    themeAccess = 'corporate';
  }

  // Store API key and subscription info in Firestore
  const apiKeyData = {
    email: customerEmail,
    customerId: customerId || null,
    subscriptionId: subscriptionId || null,
    sessionId: session.id,
    tier: tierInfo.tier,
    apiKey: tierInfo.hasApiKey ? generateApiKey() : null,
    corporateLicense: tierInfo.hasCorporateLicense ? generateApiKey() : null, // Corporate key for localStorage
    isLifetime: tierInfo.isLifetime || false,
    themeAccess: themeAccess, // Store theme access for premium themes
    createdAt: new Date(),
    expiresAt: tierInfo.isLifetime ? null : (subscriptionId ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Lifetime = null, subscription = null, one-time = 30 days
  };

  // Store in Firestore
  try {
    const db = getDb();
    const docRef = await db.collection('apiKeys').add(apiKeyData);
    console.log('✅ API key stored:', docRef.id);

    // Also store by email for easy lookup
    // IMPORTANT: Always store in apiKeysByEmail, even if no API key
    // This ensures tier checking works for all tiers (including Founder's Club)
    
    // CRITICAL: Check if tier was manually granted (e.g., Founder's Club)
    // Don't overwrite manually granted tiers with Stripe subscription tiers
    const existingEmailDoc = await db.collection('apiKeysByEmail').doc(customerEmail).get();
    const existingEmailData = existingEmailDoc.exists ? existingEmailDoc.data() : null;
    const shouldPreserveTier = existingEmailData?.manuallyGranted === true && 
                               existingEmailData?.tier === 'foundersClub';
    
    await db.collection('apiKeysByEmail').doc(customerEmail).set({
      apiKey: shouldPreserveTier ? existingEmailData?.apiKey : (apiKeyData.apiKey || null), // Preserve manually granted API key
      tier: shouldPreserveTier ? existingEmailData.tier : tierInfo.tier, // Preserve manually granted tier
      isLifetime: shouldPreserveTier ? existingEmailData.isLifetime : (tierInfo.isLifetime || false),
      themeAccess: shouldPreserveTier ? existingEmailData.themeAccess : themeAccess, // Preserve manually granted theme access
      createdAt: shouldPreserveTier ? existingEmailData.createdAt : apiKeyData.createdAt,
      expiresAt: shouldPreserveTier ? existingEmailData.expiresAt : apiKeyData.expiresAt,
      manuallyGranted: shouldPreserveTier ? existingEmailData.manuallyGranted : false, // Preserve flag
    }, { merge: true }); // Use merge to avoid overwriting existing data

    // Store corporate license separately
    if (tierInfo.hasCorporateLicense && apiKeyData.corporateLicense) {
      await db.collection('corporateLicenses').doc(customerEmail).set({
        licenseKey: apiKeyData.corporateLicense,
        email: customerEmail,
        createdAt: apiKeyData.createdAt,
      });
    }
  } catch (error) {
    console.error('❌ Error storing API key:', error);
    throw error;
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('🔄 Processing subscription update:', subscription.id);

  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  if (!customerId) return;

  // Get customer email
  const customer = await stripe!.customers.retrieve(customerId);
  const email = typeof customer === 'object' && !customer.deleted ? customer.email : null;
  if (!email) return;

  // Update subscription status in Firestore
  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) return;

  const tierInfo = getTierFromPriceId(priceId);

  // Update or create API key record
  const db = getDb();
  const apiKeySnapshot = await db.collection('apiKeys')
    .where('customerId', '==', customerId)
    .limit(1)
    .get();

  // Determine theme access based on tier
  let themeAccess: 'founder' | 'corporate' | null = null;
  if (tierInfo.tier === 'foundersClub') {
    themeAccess = 'founder';
  } else if (tierInfo.tier === 'corporateSponsor') {
    themeAccess = 'corporate';
  }

  if (!apiKeySnapshot.empty) {
    // Update existing record
    const doc = apiKeySnapshot.docs[0];
    const existingData = doc.data();
    await doc.ref.update({
      subscriptionId: subscription.id,
      tier: tierInfo.tier,
      themeAccess: themeAccess, // Update theme access
      status: subscription.status,
      updatedAt: new Date(),
    });
    
    // Also update apiKeysByEmail
    // CRITICAL: Don't overwrite manually granted tiers (e.g., Founder's Club)
    const existingEmailDoc = await db.collection('apiKeysByEmail').doc(email).get();
    const existingEmailData = existingEmailDoc.exists ? existingEmailDoc.data() : null;
    const shouldPreserveTier = existingEmailData?.manuallyGranted === true && 
                               existingEmailData?.tier === 'foundersClub';
    
    await db.collection('apiKeysByEmail').doc(email).set({
      apiKey: shouldPreserveTier ? existingEmailData?.apiKey : (existingData.apiKey || null),
      tier: shouldPreserveTier ? existingEmailData.tier : tierInfo.tier, // Preserve manually granted tier
      isLifetime: shouldPreserveTier ? existingEmailData.isLifetime : (tierInfo.isLifetime || false),
      themeAccess: shouldPreserveTier ? existingEmailData.themeAccess : themeAccess,
      updatedAt: new Date(),
      manuallyGranted: shouldPreserveTier ? existingEmailData.manuallyGranted : false, // Preserve flag
    }, { merge: true });
  } else {
    // Create new record if subscription exists but no API key
    const newApiKey = tierInfo.hasApiKey ? generateApiKey() : null;
    if (tierInfo.hasApiKey) {
      await db.collection('apiKeys').add({
        email,
        customerId,
        subscriptionId: subscription.id,
        tier: tierInfo.tier,
        themeAccess: themeAccess, // Store theme access
        apiKey: newApiKey,
        corporateLicense: tierInfo.hasCorporateLicense ? generateApiKey() : null,
        createdAt: new Date(),
        status: subscription.status,
      });
    }
    
    // Always store in apiKeysByEmail for tier checking
    // CRITICAL: Don't overwrite manually granted tiers (e.g., Founder's Club)
    const existingEmailDoc = await db.collection('apiKeysByEmail').doc(email).get();
    const existingEmailData = existingEmailDoc.exists ? existingEmailDoc.data() : null;
    const shouldPreserveTier = existingEmailData?.manuallyGranted === true && 
                               existingEmailData?.tier === 'foundersClub';
    
    await db.collection('apiKeysByEmail').doc(email).set({
      apiKey: shouldPreserveTier ? existingEmailData?.apiKey : newApiKey,
      tier: shouldPreserveTier ? existingEmailData.tier : tierInfo.tier, // Preserve manually granted tier
      isLifetime: shouldPreserveTier ? existingEmailData.isLifetime : (tierInfo.isLifetime || false),
      themeAccess: shouldPreserveTier ? existingEmailData.themeAccess : themeAccess,
      createdAt: shouldPreserveTier ? existingEmailData.createdAt : new Date(),
      manuallyGranted: shouldPreserveTier ? existingEmailData.manuallyGranted : false, // Preserve flag
    }, { merge: true });
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  console.log('🔄 Processing subscription cancellation:', subscription.id);

  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  if (!customerId) return;

  // Mark API key as cancelled (don't delete, for audit trail)
  const db = getDb();
  const apiKeySnapshot = await db.collection('apiKeys')
    .where('customerId', '==', customerId)
    .limit(1)
    .get();

  if (!apiKeySnapshot.empty) {
    const doc = apiKeySnapshot.docs[0];
    await doc.ref.update({
      status: 'cancelled',
      cancelledAt: new Date(),
    });
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('🔄 Processing invoice payment succeeded:', invoice.id);

  // This ensures API keys are maintained for active subscriptions
  // Invoice.subscription can be a string ID, expanded Subscription object, or null
  // Use type assertion since Stripe types may vary by API version
  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId) {
    const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id;
    if (subId) {
      const subscription = await stripe!.subscriptions.retrieve(subId);
      await handleSubscriptionUpdate(subscription);
    }
  }
}

