'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ProductionNavbar from '../components/marketing/ProductionNavbar';
import SponsorModal from '../components/SponsorModal';
import AlertModal from '../components/modals/AlertModal';
import SponsorDeck, { resolveSponsorPersonaTab } from '../components/sponsor/SponsorDeck';
import { getFoundersClubScarcityMessage } from '../lib/utils/foundersClub';
import {
  trackCheckoutError,
  trackCheckoutRedirected,
  trackCheckoutSessionCreated,
  trackCheckoutStart,
  trackPaywallCtaClick,
  trackPaywallImpression,
} from '../lib/analytics/events';

// Get publishable key - REQUIRED (no fallback for security)
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!publishableKey) {
  console.error('❌ SECURITY: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is required');
}

// Debug: Log key info only in development (browser)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('ðŸ” Stripe Configuration:', {
    envVarSet: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    keyPrefix: publishableKey?.substring(0, 12) + '...',
    keyType: publishableKey?.startsWith('pk_') ? 'PUBLISHABLE ✅' : publishableKey?.startsWith('sk_') ? 'SECRET ❌ (WRONG!)' : 'UNKNOWN',
  });
}

// Only initialize Stripe if key is present (prevents runtime errors)
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

// Price IDs from Stripe Dashboard
const PRICE_IDS = {
  codeSupporter: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CODE_SUPPORTER || 'price_1SeZh7D4sftWa1WtWsDwvQu5', // $5/month
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_CODE_SUPPORTER_ANNUAL || 'price_1SgPGYD4sftWa1WtLgEjFV93', // $50/year (save $10)
  },
  featureVoter: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FEATURE_VOTER || 'price_1SeZhnD4sftWa1WtP5GdZ5cT',  // $20/month
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_FEATURE_VOTER_ANNUAL || 'price_1SgPHJD4sftWa1WtW03Tzald', // $200/year (save $40)
  },
  corporateSponsor: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE || 'price_1SeZigD4sftWa1WtTODsYpwE', // $100/month
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE_ANNUAL || 'price_1SgPLzD4sftWa1WtzrgPU5tj', // $1,000/year (save $200)
  },
  foundersClub: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_MONTHLY || 'price_1TAWC9D4sftWa1WtO7Nwk7Vd', // £12/mo
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_ANNUAL || 'price_1TAWCxD4sftWa1WtEZtg2Oli', // £100/yr
  },
};

function getInitialSponsorAbVariant(): 'A' | 'B' {
  if (typeof window === 'undefined') return 'A';
  const key = 'pp_sponsor_ab_variant_v1';
  const existing = sessionStorage.getItem(key);
  if (existing === 'A' || existing === 'B') return existing;
  const v = Math.random() < 0.5 ? 'A' : 'B';
  sessionStorage.setItem(key, v);
  return v;
}

function SponsorPageContent() {
  const searchParams = useSearchParams();
  const utmCampaign = searchParams?.get('utm_campaign') ?? null;
  const tierParam = searchParams?.get('tier') ?? null;
  const initialPersonaTab = resolveSponsorPersonaTab(tierParam) ?? 'investors';
  const [abVariant] = useState<'A' | 'B'>(getInitialSponsorAbVariant);
  const triggerSourceParam = ((searchParams?.get('trigger_source') ?? null) || 'sponsor_page_direct') as
    | 'csv_import_success'
    | 'risk_metric_unlock_attempt'
    | 'ai_file_attachment_attempt'
    | 'sponsor_page_direct';
  const [loading, setLoading] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<{ priceId: string; tierName: string; billingInterval?: 'monthly' | 'annual' } | null>(null);
  const [previewTheme, setPreviewTheme] = useState<'founder' | 'corporate' | null>(null);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [scarcity, setScarcity] = useState<{ count: number; batch: number; label: string; progress: number; remaining: number; max: number } | null>(null);

  useEffect(() => {
    fetch('/api/scarcity')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data && setScarcity(data))
      .catch(() => {});
  }, []);

  // Verify Stripe loads correctly
  useEffect(() => {
    if (!stripePromise) {
      console.error('❌ SECURITY: Stripe publishable key not configured');
      setStripeStatus('error');
      return;
    }
    
    stripePromise
      .then((stripe) => {
        if (stripe) {
          console.log('✅ Stripe.js loaded successfully');
          setStripeStatus('ready');
        } else {
          console.error('❌ Stripe.js failed to load');
          setStripeStatus('error');
        }
      })
      .catch((error) => {
        console.error('❌ Stripe.js error:', error);
        setStripeStatus('error');
      });
  }, []);

  // Apply/remove preview theme on body element
  useEffect(() => {
    const body = document.body;
    if (previewTheme) {
      body.classList.add(`theme-${previewTheme}`);
    } else {
      body.classList.remove('theme-founder', 'theme-corporate');
    }
    // Cleanup on unmount
    return () => {
      body.classList.remove('theme-founder', 'theme-corporate');
    };
  }, [previewTheme]);

  const handleCheckout = async (priceId: string | { monthly: string; annual: string }, tierName: string, chosenInterval?: 'monthly' | 'annual') => {
    // For tiers with monthly/annual (Code Supporter, Feature Voter, Founders Club), use chosen interval or default annual
    let finalPriceId: string;
    let billingInterval: 'monthly' | 'annual' = 'annual';
    
    if (typeof priceId === 'object') {
      billingInterval = chosenInterval ?? (abVariant === 'A' ? 'monthly' : 'annual');
      finalPriceId = priceId[billingInterval];
    } else {
      finalPriceId = priceId;
      billingInterval = undefined as any; // Not applicable for one-time or corporate
    }

    if (!finalPriceId || finalPriceId.includes('XXXXX')) {
      setAlertModal({
        isOpen: true,
        title: 'Configuration Error',
        message: 'Stripe Price IDs not configured. Please set environment variables or update PRICE_IDS in the code.',
        type: 'error'
      });
      return;
    }

    // Open the modal instead of using prompt
    setSelectedTier({ priceId: finalPriceId, tierName, billingInterval });
    setModalOpen(true);
  };

  // New function to handle email submission from modal
  const handleEmailSubmit = async (email: string, priceId?: string) => {
    if (!selectedTier) return;

    // Use the priceId from modal if provided (for billing interval selection), otherwise use the tier's priceId
    const finalPriceId = priceId || selectedTier.priceId;

    setModalOpen(false);
    setLoading(finalPriceId);
    trackPaywallImpression(triggerSourceParam, '/sponsor');
    trackPaywallCtaClick(triggerSourceParam, '/api/create-checkout-session', '/sponsor');
    trackCheckoutStart(
      triggerSourceParam,
      finalPriceId,
      selectedTier.tierName,
      selectedTier.billingInterval || null
    );

    try {
      if (!stripePromise) {
        trackCheckoutError('stripe_init', 'stripe_not_configured', 'Stripe publishable key not configured', triggerSourceParam, finalPriceId);
        throw new Error('Stripe publishable key not configured');
      }
      
      const stripe = await stripePromise;
      
      if (!stripe) {
        trackCheckoutError('stripe_init', 'stripe_load_failed', 'Stripe failed to load', triggerSourceParam, finalPriceId);
        throw new Error('Stripe failed to load');
      }

      // Store email if provided
      if (email) {
        localStorage.setItem('sponsor_email', email);
      }

      // Create checkout session via API route
      console.log('ðŸ”„ Creating checkout session for:', { priceId: finalPriceId, tierName: selectedTier.tierName });
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          priceId: finalPriceId,
          tierName: selectedTier.tierName,
          email,
          billing_interval: selectedTier.billingInterval || null,
          trigger_source: triggerSourceParam,
          ab_test_variant: abVariant,
          utm_source: searchParams?.get('utm_source') || 'sponsor',
          utm_medium: searchParams?.get('utm_medium') || 'checkout',
          ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
          ...(searchParams?.get('utm_content') ? { utm_content: searchParams?.get('utm_content') } : {}),
        }),
      });

      const rawBody = await response.text();
      let payload: { error?: string; sessionId?: string; url?: string } = {};
      try {
        if (rawBody) payload = JSON.parse(rawBody) as typeof payload;
      } catch {
        throw new Error(
          !response.ok
            ? rawBody.slice(0, 200) || `Checkout failed (${response.status})`
            : 'Invalid response from checkout'
        );
      }

      if (!response.ok) {
        console.error('❌ API Error:', payload);
        trackCheckoutError(
          'session_create',
          'session_create_failed',
          payload.error || `Failed to create checkout session (${response.status})`,
          triggerSourceParam,
          finalPriceId
        );
        throw new Error(payload.error || `Failed to create checkout session (${response.status})`);
      }

      const sessionId = payload.sessionId;
      const url = payload.url;
      
      if (!sessionId) {
        trackCheckoutError('session_create', 'missing_session_id', 'No session ID returned from API', triggerSourceParam, finalPriceId);
        throw new Error('No session ID returned from API');
      }

      console.log('✅ Checkout session created:', sessionId);
      trackCheckoutSessionCreated(sessionId, finalPriceId, selectedTier.tierName, triggerSourceParam);

      // Redirect to Stripe Checkout
      const hostedUrl =
        typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://')) ? url : null;
      if (hostedUrl) {
        trackCheckoutRedirected(sessionId);
        window.location.assign(hostedUrl);
      } else {
        trackCheckoutRedirected(sessionId);
        window.location.assign(`https://checkout.stripe.com/c/pay/${sessionId}`);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setAlertModal({
        isOpen: true,
        title: 'Checkout Error',
        message: error.message || 'Something went wrong. Please try again.',
        type: 'error'
      });
      setLoading(null);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes pulse-red {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(220, 38, 38, 0);
            transform: scale(1.02);
          }
        }
        .founders-club-counter {
          animation: pulse-red 2s ease-in-out infinite;
        }
      `}</style>
      <ProductionNavbar />
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        padding: 'clamp(40px, 8vw, 60px) clamp(12px, 3vw, 24px)',
        maxWidth: 'min(1400px, 95vw)',
        margin: '0 auto',
        color: 'var(--text)',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: 'var(--text)'
        }}>
          {abVariant === 'B' ? 'Unlock the AI + Risk Terminal' : 'Join the Founders Club'}
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--text-secondary)',
          maxWidth: '640px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          {abVariant === 'B'
            ? 'Advanced portfolio risk, sector analytics, and Pocket Analyst — local-first, cancel anytime.'
            : 'Professional-grade portfolio tracking, risk analysis, and client reporting. Pick the tier that matches how you use Pocket Portfolio.'}
        </p>
        {/* Stripe Status Indicator */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '16px',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            display: 'inline-block',
            background: stripeStatus === 'ready' ? 'rgba(34, 197, 94, 0.1)' : stripeStatus === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(156, 163, 175, 0.1)',
            color: stripeStatus === 'ready' ? '#22c55e' : stripeStatus === 'error' ? '#ef4444' : '#9ca3af',
            border: `1px solid ${stripeStatus === 'ready' ? '#22c55e' : stripeStatus === 'error' ? '#ef4444' : '#9ca3af'}`
          }}>
            {stripeStatus === 'ready' && '✅ Stripe Ready'}
            {stripeStatus === 'error' && '❌ Stripe Error - Check Console'}
            {stripeStatus === 'checking' && '⏳ Checking Stripe...'}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '48px', width: '100%' }}>
        <SponsorDeck
          onCheckout={handleCheckout}
          loading={loading}
          previewTheme={previewTheme}
          onPreviewTheme={setPreviewTheme}
          PRICE_IDS={PRICE_IDS}
          foundersClubScarcity={scarcity}
          abVariant={abVariant}
          initialTab={initialPersonaTab}
        />
      </div>

    </div>
    
    {/* Floating Preview Banner */}
    {previewTheme && (
      <div 
        className="theme-preview-banner"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--surface)',
          padding: '20px',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.3)',
          borderTop: '4px solid var(--accent-warm)',
          textAlign: 'center',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <p style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'var(--text)',
          margin: 0
        }}>
          Loving this look? <span style={{ color: 'var(--accent-warm)' }}>This theme is exclusive to members.</span>
        </p>
        <button 
          onClick={() => {
            const tierName = previewTheme === 'founder' ? "UK Founder's Club" : 'Corporate Ecosystem';
            const priceId = previewTheme === 'founder' 
              ? PRICE_IDS.foundersClub 
              : PRICE_IDS.corporateSponsor.annual;
            setPreviewTheme(null);
            handleCheckout(priceId, tierName, previewTheme === 'founder' ? 'annual' : undefined);
          }}
          style={{
            background: 'var(--accent-warm)',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '24px',
            fontSize: '16px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Unlock it Permanently
        </button>
      </div>
    )}
    
    {/* Branded Modal for Email Collection */}
    <SponsorModal 
      isOpen={isModalOpen}
      tierName={selectedTier?.tierName || ''}
      billingInterval={selectedTier?.billingInterval}
      priceIds={selectedTier?.tierName === 'Code Supporter' ? PRICE_IDS.codeSupporter : 
                selectedTier?.tierName === 'Developer Utility' ? PRICE_IDS.featureVoter : 
                selectedTier?.tierName === 'Corporate Ecosystem' ? PRICE_IDS.corporateSponsor : undefined}
      onClose={() => {
        setModalOpen(false);
        setSelectedTier(null);
      }}
      onSubmit={handleEmailSubmit}
    />

    {/* Alert Modal */}
    <AlertModal
      isOpen={alertModal.isOpen}
      title={alertModal.title}
      message={alertModal.message}
      type={alertModal.type}
      onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
    />
    </>
  );
}

export default function SponsorPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            color: 'var(--text)',
          }}
        >
          Loading…
        </div>
      }
    >
      <SponsorPageContent />
    </Suspense>
  );
}
