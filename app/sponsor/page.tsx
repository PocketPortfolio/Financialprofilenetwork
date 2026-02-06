'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductionNavbar from '../components/marketing/ProductionNavbar';
import SponsorModal from '../components/SponsorModal';
import AlertModal from '../components/modals/AlertModal';
import SponsorDeck from '../components/sponsor/SponsorDeck';
import { getFoundersClubScarcityMessage } from '../lib/utils/foundersClub';

// Get publishable key - REQUIRED (no fallback for security)
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!publishableKey) {
  console.error('❌ SECURITY: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is required');
}

// Debug: Log key info only in development (browser)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 Stripe Configuration:', {
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
  foundersClub: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB || 'price_1Sg3ykD4sftWa1Wtheztc1hR', // £100 lifetime
};

export default function SponsorPage() {
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

  const handleCheckout = async (priceId: string | { monthly: string; annual: string }, tierName: string) => {
    // For Code Supporter and Developer Utility, default to annual
    let finalPriceId: string;
    let billingInterval: 'monthly' | 'annual' = 'annual';
    
    if (typeof priceId === 'object') {
      // Default to annual for Code Supporter and Developer Utility
      finalPriceId = priceId.annual;
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

    try {
      if (!stripePromise) {
        throw new Error('Stripe publishable key not configured');
      }
      
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Store email if provided
      if (email) {
        localStorage.setItem('sponsor_email', email);
      }

      // Create checkout session via API route
      console.log('🔄 Creating checkout session for:', { priceId: finalPriceId, tierName: selectedTier.tierName });
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: finalPriceId, tierName: selectedTier.tierName, email }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ API Error:', error);
        throw new Error(error.error || `Failed to create checkout session (${response.status})`);
      }

      const { sessionId, url } = await response.json();
      
      if (!sessionId) {
        throw new Error('No session ID returned from API');
      }

      console.log('✅ Checkout session created:', sessionId);
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        window.location.href = `https://checkout.stripe.com/c/pay/${sessionId}`;
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
        .sponsor-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: clamp(16px, 3vw, 24px);
        }
        @media (max-width: 768px) {
          .sponsor-cards-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
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
          Enterprise Portfolio Analytics & White Label Solutions
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Professional-grade portfolio tracking, risk analysis, and client reporting tools for wealth managers and financial advisors. Sovereign data architecture meets enterprise needs.
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

      {/* WebOne Discovery Partner - Diamond Slot */}
      <div style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, rgba(59, 130, 246, 0.05) 100%)',
        border: '2px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '16px',
        padding: 'clamp(20px, 4vw, 32px)',
        marginBottom: '48px',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '12px',
          color: 'var(--text)'
        }}>
          Discovery Partner
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: '16px',
          maxWidth: '600px',
          margin: '0 auto 16px'
        }}>
          Special thanks to <strong>WebOne</strong> for curating Pocket Portfolio as a featured Local-First utility in their <strong>1EO Trust Library</strong>.
        </p>
        <a
          href="https://www.webone.one"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          }}
        >
          Review on WebOne →
        </a>
      </div>

      {/* Desktop: Focus Deck (Horizontal Accordion) */}
      <div style={{ marginBottom: '48px', width: '100%' }}>
        <SponsorDeck
          onCheckout={handleCheckout}
          loading={loading}
          previewTheme={previewTheme}
          onPreviewTheme={setPreviewTheme}
          PRICE_IDS={PRICE_IDS}
        />
      </div>

      {/* Mobile: Vertical Grid (Fallback) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
        marginBottom: '48px',
        width: '100%'
      }}
      className="sponsor-cards-grid mobile-sponsor-grid">
        {/* Code Supporter - $5/month */}
        <div style={{
          background: 'var(--surface)',
          border: '2px solid var(--border)',
          borderRadius: '12px',
          padding: 'clamp(20px, 4vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          minWidth: 0,
          width: '100%'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }}
        >
          {/* Archetype Icon - "The Contributor" */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/brand/archetype-code-supporter.svg" 
              alt="The Contributor"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          
          <h3 style={{ fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>
            Code Supporter
          </h3>
          <div style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 'bold', color: 'var(--accent-warm)', marginBottom: '8px' }}>
            $50<span style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', color: 'var(--text-secondary)' }}>/year</span>
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', textDecoration: 'line-through' }}>
            $60/year if paid monthly
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', flexGrow: 1, lineHeight: '1.6' }}>
            I use the NPM packages and I support open source technologies.
          </p>
          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#f59e0b', fontWeight: '600', background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '6px' }}>
            💰 Save $10/year (2 months free!)
          </div>
          <button
            onClick={() => handleCheckout(PRICE_IDS.codeSupporter, 'Code Supporter')}
            disabled={loading === PRICE_IDS.codeSupporter.annual || loading !== null}
            style={{
              padding: '12px 24px',
              background: loading === PRICE_IDS.codeSupporter.annual ? 'var(--muted)' : 'var(--accent-warm)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading && loading !== PRICE_IDS.codeSupporter.annual ? 0.6 : 1
            }}
          >
            {loading === PRICE_IDS.codeSupporter.annual ? 'Processing...' : 'Subscribe (Annual)'}
          </button>
        </div>

        {/* Developer Utility - $20/month */}
        <div style={{
          background: 'var(--surface)',
          border: '2px solid var(--accent-warm)',
          borderRadius: '12px',
          padding: 'clamp(20px, 4vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'transform 0.2s ease',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
          minWidth: 0,
          width: '100%'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.2)';
        }}
        >
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--accent-warm)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            Popular
          </div>
          
          {/* Archetype Icon - "The Builder" */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/brand/archetype-developer-utility.svg" 
              alt="The Builder"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          
          <h3 style={{ fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>
            Developer Utility
          </h3>
          <div style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 'bold', color: 'var(--accent-warm)', marginBottom: '8px' }}>
            $200<span style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', color: 'var(--text-secondary)' }}>/year</span>
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', textDecoration: 'line-through' }}>
            $240/year if paid monthly
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', flexGrow: 1, lineHeight: '1.6' }}>
            Perfect for developers and power users. Shape the product roadmap and get unlimited API access for your projects.
          </p>
          
          {/* Developer Benefits */}
          <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--surface-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
              🚀 <strong>Developer Benefits:</strong>
            </div>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '20px', marginTop: '8px', lineHeight: '1.8', padding: 0, listStyle: 'none' }}>
              <li style={{ marginBottom: '4px' }}>• Priority access to the Roadmap & Insider Discord</li>
              <li style={{ marginBottom: '4px' }}>• Influence product development decisions</li>
              <li style={{ marginBottom: '4px' }}>• Early access to new features</li>
              <li style={{ marginBottom: '4px' }}>• Direct line to the development team</li>
            </ul>
          </div>

          {/* API Access */}
          <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--surface-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
              ⚡ <strong>Unlimited API Access:</strong>
            </div>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '20px', marginTop: '8px', lineHeight: '1.8', padding: 0, listStyle: 'none' }}>
              <li style={{ marginBottom: '4px' }}>• Unlimited API calls (stock prices, market data)</li>
              <li style={{ marginBottom: '4px' }}>• Real-time quote data</li>
              <li style={{ marginBottom: '4px' }}>• Historical ticker data (JSON format)</li>
              <li style={{ marginBottom: '4px' }}>• No rate limits or throttling</li>
            </ul>
          </div>

          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#f59e0b', fontWeight: '600', background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '6px' }}>
            💰 Save $40/year (2 months free!)
          </div>
          <button
            onClick={() => handleCheckout(PRICE_IDS.featureVoter, 'Developer Utility')}
            disabled={loading === PRICE_IDS.featureVoter.annual || loading !== null}
            style={{
              padding: '12px 24px',
              background: loading === PRICE_IDS.featureVoter.annual ? 'var(--muted)' : 'var(--accent-warm)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading && loading !== PRICE_IDS.featureVoter.annual ? 0.6 : 1
            }}
          >
            {loading === PRICE_IDS.featureVoter.annual ? 'Processing...' : 'Subscribe (Annual)'}
          </button>
        </div>

        {/* Corporate Ecosystem - $1,000/year */}
        <div style={{
          background: 'var(--surface)',
          border: '2px solid var(--border)',
          borderRadius: '12px',
          padding: 'clamp(20px, 4vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          minWidth: 0,
          width: '100%'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }}
        >
          {/* Archetype Icon - "The Institution" */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/brand/archetype-corporate-ecosystem.svg" 
              alt="The Institution"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          
          <h3 style={{ fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>
            Corporate Ecosystem
          </h3>
          <div style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 'bold', color: 'var(--accent-warm)', marginBottom: '8px' }}>
            $1,000<span style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', color: 'var(--text-secondary)' }}>/year</span>
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', textDecoration: 'line-through' }}>
            $1,200/year if paid monthly
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', flexGrow: 1, lineHeight: '1.6' }}>
            White Label Portal for Financial Advisors & Wealth Managers. Enterprise-grade portfolio analytics and client reporting.
          </p>
          
          {/* White Label Features */}
          <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--surface-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
              🏢 <strong>White Label Features:</strong>
            </div>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '20px', marginTop: '8px', lineHeight: '1.8', padding: 0, listStyle: 'none' }}>
              <li style={{ marginBottom: '4px' }}>• Custom branded client dashboard</li>
              <li style={{ marginBottom: '4px' }}>• White label PDF portfolio reports</li>
              <li style={{ marginBottom: '4px' }}>• Firm logo integration</li>
              <li style={{ marginBottom: '4px' }}>• Client-facing portal with your branding</li>
            </ul>
          </div>

          {/* Corporate Perks */}
          <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--surface-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
              ⚡ <strong>Corporate Perks:</strong>
            </div>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '20px', marginTop: '8px', lineHeight: '1.8', padding: 0, listStyle: 'none' }}>
              <li style={{ marginBottom: '4px' }}>• Unlimited API calls (stock prices, market data)</li>
              <li style={{ marginBottom: '4px' }}>• Advanced analytics (sector breakdown, portfolio risk, rebalancing)</li>
              <li style={{ marginBottom: '4px' }}>• Priority support & onboarding</li>
              <li style={{ marginBottom: '4px' }}>• Your logo on our README</li>
              <li style={{ marginBottom: '4px' }}>• Early access to new features</li>
            </ul>
          </div>

          {/* Sovereign Sync */}
          <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--surface-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
              ✅ <strong>Sovereign Sync:</strong> Google Drive as Database (2 Seats)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '20px' }}>
              Need more? Add seats for <strong>$50/mo</strong>.
            </div>
          </div>
          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#f59e0b', fontWeight: '600', background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '6px' }}>
            💰 Save $200/year (2 months free!)
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleCheckout(PRICE_IDS.corporateSponsor, 'Corporate Ecosystem')}
              disabled={loading === PRICE_IDS.corporateSponsor.annual || loading !== null}
              style={{
                flex: '1',
                minWidth: '140px',
                padding: '12px 24px',
                background: loading === PRICE_IDS.corporateSponsor.annual ? 'var(--muted)' : 'var(--accent-warm)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading && loading !== PRICE_IDS.corporateSponsor.annual ? 0.6 : 1
              }}
            >
              {loading === PRICE_IDS.corporateSponsor.annual ? 'Processing...' : 'Subscribe (Annual)'}
            </button>
            <button
              onClick={() => setPreviewTheme(previewTheme === 'corporate' ? null : 'corporate')}
              style={{
                padding: '12px 20px',
                background: previewTheme === 'corporate' ? 'var(--muted)' : 'transparent',
                color: previewTheme === 'corporate' ? 'var(--text)' : 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {previewTheme === 'corporate' ? '✕ Close Preview' : '👁️ Preview Terminal Theme'}
            </button>
          </div>
        </div>

        {/* UK Founder's Club - £100 Lifetime */}
        <div style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, rgba(245, 158, 11, 0.05) 100%)',
          border: '3px solid #f59e0b', // Gold/Amber border
          borderRadius: '12px',
          padding: 'clamp(20px, 4vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'transform 0.2s ease',
          boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
          minWidth: 0,
          width: '100%'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.3)';
        }}
        >
          {/* Badge Container - Top Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            {/* Scarcity Counter - Red (Batch 1) / Orange (Batch 2), progress bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '140px' }}>
              <div
                className="founders-club-counter"
                style={{
                  background: scarcity?.batch === 2 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                  border: `2px solid ${scarcity?.batch === 2 ? '#f97316' : '#dc2626'}`,
                  color: scarcity?.batch === 2 ? '#ea580c' : '#dc2626',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.4',
                  animation: 'pulse-red 2s ease-in-out infinite',
                  boxShadow: scarcity?.batch === 2 ? '0 0 0 0 rgba(249, 115, 22, 0.5)' : '0 0 0 0 rgba(220, 38, 38, 0.7)'
                }}
              >
                {scarcity ? `${scarcity.label} — ${scarcity.remaining}/${scarcity.max} left` : `Batch 1: ${getFoundersClubScarcityMessage()}`}
              </div>
              {scarcity != null && (
                <div style={{ width: '100%', height: '4px', background: 'var(--surface)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, scarcity.progress * 100)}%`,
                      height: '100%',
                      background: scarcity.batch === 2 ? '#f97316' : '#dc2626',
                      borderRadius: '2px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Limited Edition Badge */}
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
              whiteSpace: 'nowrap',
              lineHeight: '1.4'
            }}>
              Limited Edition
            </div>
          </div>

          {/* Archetype Icon - "The Sovereign" */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/brand/archetype-founders-club.svg" 
              alt="The Sovereign"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <h3 style={{ 
            fontSize: 'clamp(22px, 4vw, 28px)', 
            fontWeight: 'bold', 
            marginBottom: '8px', 
            color: 'var(--text)',
            marginTop: '0'
          }}>
            UK FOUNDER'S CLUB
          </h3>
          <div style={{ 
            fontSize: 'clamp(12px, 2.5vw, 14px)', 
            color: '#f59e0b', 
            fontWeight: '600',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Lifetime Access
          </div>
          <div style={{ fontSize: 'clamp(32px, 6vw, 42px)', fontWeight: 'bold', color: '#f59e0b', marginBottom: '16px' }}>
            £100<span style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', color: 'var(--text-secondary)', fontWeight: 'normal' }}> one-time</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', flexGrow: 1, lineHeight: '1.6', fontSize: '15px' }}>
            <strong style={{ color: 'var(--text)' }}>Never pay monthly.</strong> Get unlimited API access, white-label portfolio reports, Discord priority, and a permanent "Founder" badge. Own a piece of the roadmap.
          </p>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: '0 0 24px 0',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#f59e0b', marginRight: '8px', fontSize: '18px' }}>✓</span>
              Unlimited API calls forever
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#f59e0b', marginRight: '8px', fontSize: '18px' }}>✓</span>
              Priority Discord access
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#f59e0b', marginRight: '8px', fontSize: '18px' }}>✓</span>
              Permanent "Founder" badge
              {/* Subtle British Flag Icon */}
              <svg 
                width="16" 
                height="12" 
                viewBox="0 0 16 12" 
                style={{ 
                  marginLeft: '6px', 
                  opacity: 0.7,
                  verticalAlign: 'middle'
                }}
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Union Jack simplified - red cross on white, blue background */}
                <rect width="16" height="12" fill="#012169"/>
                <path d="M0 0 L16 12 M16 0 L0 12" stroke="#FFFFFF" strokeWidth="2"/>
                <path d="M8 0 L8 12 M0 6 L16 6" stroke="#FFFFFF" strokeWidth="2.5"/>
                <path d="M0 0 L16 12 M16 0 L0 12" stroke="#C8102E" strokeWidth="1.2"/>
                <path d="M8 0 L8 12 M0 6 L16 6" stroke="#C8102E" strokeWidth="1.5"/>
                <path d="M0 0 L5.33 0 L0 3.56 Z" fill="#FFFFFF"/>
                <path d="M16 0 L10.67 0 L16 3.56 Z" fill="#FFFFFF"/>
                <path d="M0 12 L5.33 12 L0 8.44 Z" fill="#FFFFFF"/>
                <path d="M16 12 L10.67 12 L16 8.44 Z" fill="#FFFFFF"/>
              </svg>
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#f59e0b', marginRight: '8px', fontSize: '18px' }}>✓</span>
              Early access to new features
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#f59e0b', marginRight: '8px', fontSize: '18px' }}>✓</span>
              <span>
                <strong>Advanced Analytics:</strong> Sector breakdown, portfolio risk (Beta), and rebalancing alerts
              </span>
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#f59e0b', marginRight: '8px', fontSize: '18px' }}>✓</span>
              <span>
                <strong>🏢 White Label Portfolio Reports:</strong> Generate professional branded PDF reports with your firm logo - same value as Corporate License
              </span>
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#f59e0b', marginRight: '8px', fontSize: '18px' }}>✓</span>
              <span>
                <strong>🇬🇧 UK Concierge Onboarding:</strong> For the first 50 UK Founders, the CTO will personally format and import your messy CSV history from Trading212/Freetrade/Hargreaves Lansdown.
              </span>
            </li>
          </ul>
          <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b', marginBottom: '8px' }}>
              ✅ <strong>Sovereign Sync:</strong> Google Drive as Database (1 Seat)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '20px' }}>
              Need more? Add seats for <strong>£50/mo</strong>.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleCheckout(PRICE_IDS.foundersClub, "UK Founder's Club")}
              disabled={loading === PRICE_IDS.foundersClub || loading !== null}
              style={{
                flex: '1',
                minWidth: 'clamp(140px, 30vw, 180px)',
                padding: 'clamp(12px, 3vw, 16px) clamp(20px, 5vw, 32px)',
                background: loading === PRICE_IDS.foundersClub ? 'var(--muted)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(14px, 3vw, 18px)',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading && loading !== PRICE_IDS.foundersClub ? 0.6 : 1,
                boxShadow: loading ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {loading === PRICE_IDS.foundersClub ? 'Processing...' : 'Join UK Founder\'s Club'}
            </button>
            <button
              onClick={() => setPreviewTheme(previewTheme === 'founder' ? null : 'founder')}
              style={{
                padding: '16px 24px',
                background: previewTheme === 'founder' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: previewTheme === 'founder' ? '#f59e0b' : '#f59e0b',
                border: '2px solid #f59e0b',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {previewTheme === 'founder' ? '✕ Close Preview' : '✨ Preview Gold Theme'}
            </button>
          </div>
        </div>
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
            handleCheckout(priceId, tierName);
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

