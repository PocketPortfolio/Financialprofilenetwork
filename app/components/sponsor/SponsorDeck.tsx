'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface TierCardProps {
  id: string;
  title: string;
  price: string;
  priceSubtext?: string;
  description: string;
  icon: string;
  iconAlt: string;
  color: string;
  isPopular?: boolean;
  isExpanded: boolean;
  onExpand: () => void;
  onCheckout: (interval?: 'monthly' | 'annual') => void;
  loading?: boolean;
  previewTheme?: 'founder' | 'corporate' | null;
  onPreviewTheme?: (theme: 'founder' | 'corporate' | null) => void;
  children?: React.ReactNode;
  isFoundersClub?: boolean;
  foundersClubScarcity?: { count: number; batch: number; label: string; progress: number; remaining: number; max: number } | null;
  founderCheckoutIntervals?: { label: string; interval: 'monthly' | 'annual' }[];
  priceId?: string | { monthly: string; annual: string };
}

function TierCard({
  id,
  title,
  price,
  priceSubtext,
  description,
  icon,
  iconAlt,
  color,
  isPopular = false,
  isExpanded,
  onExpand,
  onCheckout,
  loading = false,
  previewTheme,
  onPreviewTheme,
  children,
  isFoundersClub = false,
  foundersClubScarcity,
  founderCheckoutIntervals,
  priceId: tierPriceId
}: TierCardProps) {
  return (
    <motion.div
      layout
      onHoverStart={onExpand}
      onClick={onExpand}
      style={{
        flex: isExpanded ? 3 : 1,
        minWidth: isExpanded ? '400px' : '120px',
        height: '600px',
        background: isExpanded 
          ? (isFoundersClub 
              ? 'linear-gradient(135deg, var(--surface) 0%, rgba(245, 158, 11, 0.05) 100%)'
              : 'var(--surface)')
          : 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)',
        border: isExpanded 
          ? (isFoundersClub ? '3px solid #f59e0b' : `2px solid ${color}`)
          : '2px solid var(--border)',
        borderRadius: '12px',
        padding: isExpanded ? 'clamp(20px, 4vw, 32px)' : '16px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isExpanded 
          ? (isFoundersClub 
              ? '0 8px 24px rgba(245, 158, 11, 0.4)'
              : '0 8px 24px rgba(0, 0, 0, 0.15)')
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        opacity: isExpanded ? 1 : 0.7,
        filter: isExpanded ? 'grayscale(0)' : 'grayscale(0.3)',
        overflow: 'hidden',
        position: 'relative'
      }}
      whileHover={!isExpanded ? {
        flex: 1.2,
        opacity: 0.9,
        filter: 'grayscale(0.1)'
      } : {}}
    >
      {/* Background overlay for compressed state */}
      {!isExpanded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${color}15 0%, transparent 100%)`,
            pointerEvents: 'none'
          }}
        />
      )}

      {isExpanded ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Popular Badge - Fixed position */}
          {isPopular && (
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'var(--accent-warm)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              zIndex: 10
            }}>
              Popular
            </div>
          )}

          {/* Scrollable content area */}
          <div 
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: '8px',
              minHeight: 0
            }}
            className="sponsor-deck-scrollbar"
          >
            {/* Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={icon} 
                alt={iconAlt}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: 'clamp(20px, 3vw, 24px)',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: 'var(--text)',
              textAlign: 'center'
            }}>
              {title}
            </h3>

            {/* Price */}
            <div style={{
              fontSize: 'clamp(28px, 5vw, 36px)',
              fontWeight: 'bold',
              color: color,
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              {price}
              {priceSubtext && (
                <span style={{
                  fontSize: 'clamp(14px, 2.5vw, 18px)',
                  color: 'var(--text-secondary)',
                  fontWeight: 'normal'
                }}>
                  {priceSubtext}
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              lineHeight: '1.6',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              {description}
            </p>

            {/* Tier-specific content - ALL FEATURES HERE */}
            {children}
          </div>

          {/* CTA Button - Fixed at bottom */}
          <div style={{ 
            flexShrink: 0,
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
            background: isFoundersClub 
              ? 'linear-gradient(135deg, var(--surface) 0%, rgba(245, 158, 11, 0.05) 100%)'
              : 'var(--surface)'
          }}>
            {founderCheckoutIntervals && founderCheckoutIntervals.length > 0 ? (
              founderCheckoutIntervals.map(({ label, interval }) => (
                <button
                  key={interval}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCheckout(interval);
                  }}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading ? 'var(--muted)' : interval === 'annual' ? color : 'transparent',
                    color: loading ? 'var(--text-secondary)' : interval === 'annual' ? 'white' : color,
                    border: `2px solid ${color}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.6 : 1,
                    width: '100%'
                  }}
                >
                  {loading ? 'Processing...' : label}
                </button>
              ))
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckout();
                }}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: loading ? 'var(--muted)' : color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.6 : 1,
                  width: '100%'
                }}
              >
                {loading ? 'Processing...' : (isFoundersClub ? 'Join UK Founder\'s Club' : 'Subscribe (Annual)')}
              </button>
            )}
            
            {/* Preview Theme Button for Corporate/Founder */}
            {(id === 'corporate' || id === 'founder') && onPreviewTheme && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const theme = id === 'founder' ? 'founder' : 'corporate';
                  onPreviewTheme(previewTheme === theme ? null : theme);
                }}
                style={{
                  padding: '12px 20px',
                  background: previewTheme === (id === 'founder' ? 'founder' : 'corporate') 
                    ? 'var(--muted)' 
                    : 'transparent',
                  color: color,
                  border: `2px solid ${color}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textTransform: id === 'founder' ? 'uppercase' : 'none',
                  letterSpacing: id === 'founder' ? '0.5px' : 'normal',
                  width: '100%'
                }}
              >
                {previewTheme === (id === 'founder' ? 'founder' : 'corporate') 
                  ? '✕ Close Preview' 
                  : (id === 'founder' ? '✨ Preview Gold Theme' : '👁️ Preview Terminal Theme')}
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '16px'
        }}>
          {/* Compressed: Vertical rotated title */}
          <motion.div
            style={{
              transform: 'rotate(-90deg)',
              whiteSpace: 'nowrap',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--text-secondary)',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}
          >
            {title}
          </motion.div>
          
          {/* Compressed: Price hint */}
          <div style={{
            fontSize: '12px',
            color: 'var(--muted)',
            opacity: 0.6
          }}>
            View Plan
          </div>
        </div>
      )}
    </motion.div>
  );
}

export type FoundersClubScarcity = { count: number; batch: number; label: string; progress: number; remaining: number; max: number } | null;

interface SponsorDeckProps {
  onCheckout: (priceId: string | { monthly: string; annual: string }, tierName: string, chosenInterval?: 'monthly' | 'annual') => void;
  loading: string | null;
  previewTheme: 'founder' | 'corporate' | null;
  onPreviewTheme: (theme: 'founder' | 'corporate' | null) => void;
  PRICE_IDS: {
    codeSupporter: { monthly: string; annual: string };
    featureVoter: { monthly: string; annual: string };
    corporateSponsor: { monthly: string; annual: string };
    foundersClub: { monthly: string; annual: string };
  };
  foundersClubScarcity?: FoundersClubScarcity;
  /** Sponsor A/B: A = Join Founders + monthly default; B = AI/Risk headline + annual default */
  abVariant?: 'A' | 'B';
}

export default function SponsorDeck({
  onCheckout,
  loading,
  previewTheme,
  onPreviewTheme,
  PRICE_IDS,
  foundersClubScarcity = null,
  abVariant = 'A',
}: SponsorDeckProps) {
  const [activeId, setActiveId] = useState('developer'); // Default to Developer Utility

  const v = abVariant === 'B' ? 'B' : 'A';
  const founderTitle = v === 'B' ? 'Unlock the AI + Risk Terminal' : 'Join the Founders Club';
  const founderIntervals =
    v === 'B'
      ? [
          { label: 'Join Annual (£100/yr)', interval: 'annual' as const },
          { label: 'Join Monthly (£12/mo)', interval: 'monthly' as const },
        ]
      : [
          { label: 'Join Monthly (£12/mo)', interval: 'monthly' as const },
          { label: 'Join Annual (£100/yr)', interval: 'annual' as const },
        ];

  const tiers = [
    {
      id: 'supporter',
      title: 'Code Supporter',
      price: '$50',
      priceSubtext: '/year',
      description: 'I use the NPM packages and I support open source technologies.',
      icon: '/brand/archetype-code-supporter.svg',
      iconAlt: 'The Contributor',
      color: 'var(--accent-warm)',
      priceId: PRICE_IDS.codeSupporter,
      tierName: 'Code Supporter',
      expandedContent: (
        <>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', textDecoration: 'line-through', textAlign: 'center' }}>
            $60/year if paid monthly
          </div>
          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#f59e0b', fontWeight: '600', background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
            💰 Save $10/year (2 months free!)
          </div>
        </>
      )
    },
    {
      id: 'developer',
      title: 'Universal Data Engine',
      price: '$200',
      priceSubtext: '/year',
      description: "Don't write parsers. Push any raw broker data to our endpoint, and let our engine normalize it for you.",
      icon: '/brand/archetype-developer-utility.svg',
      iconAlt: 'The Builder',
      color: 'var(--accent-warm)',
      isPopular: true,
      priceId: PRICE_IDS.featureVoter,
      tierName: 'Developer Utility',
      expandedContent: (
        <>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', textDecoration: 'line-through', textAlign: 'center' }}>
            $240/year if paid monthly
          </div>
          
          <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--surface-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
              ⚡ <strong>Universal Data Engine:</strong>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.8' }}>
              Don&apos;t write parsers. Push any raw broker data to our endpoint, and let our engine normalize it for you.
            </p>
          </div>

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

          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#f59e0b', fontWeight: '600', background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
            💰 Save $40/year (2 months free!)
          </div>
        </>
      )
    },
    {
      id: 'corporate',
      title: 'Corporate Ecosystem',
      price: '$1,000',
      priceSubtext: '/year',
      description: 'White Label Portal for Financial Advisors & Wealth Managers. Enterprise-grade portfolio analytics and client reporting.',
      icon: '/brand/archetype-corporate-ecosystem.svg',
      iconAlt: 'The Institution',
      color: 'var(--accent-warm)',
      priceId: PRICE_IDS.corporateSponsor,
      tierName: 'Corporate Ecosystem',
      expandedContent: (
        <>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', textDecoration: 'line-through', textAlign: 'center' }}>
            $1,200/year if paid monthly
          </div>
          
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
          
          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#f59e0b', fontWeight: '600', background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
            💰 Save $200/year (2 months free!)
          </div>
        </>
      )
    },
    {
      id: 'founder',
      title: founderTitle,
      price: '£12/mo or £100/yr',
      priceSubtext: '',
      description: "You are not tied to a specific broker. Switch brokerages freely; your data history stays here. Cancel anytime.",
      icon: '/brand/archetype-founders-club.svg',
      iconAlt: 'The Sovereign',
      color: '#f59e0b',
      priceId: PRICE_IDS.foundersClub,
      tierName: 'UK Founder\'s Club',
      isFoundersClub: true,
      founderCheckoutIntervals: founderIntervals,
      expandedContent: (
        <>
          <div style={{ 
            fontSize: 'clamp(12px, 2.5vw, 14px)', 
            color: '#f59e0b', 
            fontWeight: '600',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textAlign: 'center'
          }}>
            Per month or per year — cancel anytime
          </div>
          
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: '0 0 24px 0',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#f59e0b', marginRight: '8px', fontSize: '18px' }}>✓</span>
              You are not tied to a specific broker. Switch brokerages freely; your data history stays here.
            </li>
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
          </ul>
          
          <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b', marginBottom: '8px' }}>
              ✅ <strong>Sovereign Sync:</strong> Google Drive as Database (1 Seat)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '20px' }}>
              Need more? Add seats for <strong>£50/mo</strong>.
            </div>
          </div>
        </>
      )
    }
  ];

  return (
    <>
      <style jsx global>{`
        .sponsor-deck-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .sponsor-deck-scrollbar::-webkit-scrollbar-track {
          background: var(--surface);
        }
        .sponsor-deck-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 3px;
        }
        .sponsor-deck-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--muted);
        }
        
        /* Desktop Focus Deck */
        @media (min-width: 1024px) {
          .desktop-focus-deck {
            display: block !important;
          }
          .mobile-sponsor-grid {
            display: none !important;
          }
        }

        /* Mobile Grid */
        @media (max-width: 1023px) {
          .desktop-focus-deck {
            display: none !important;
          }
          .mobile-sponsor-grid {
            display: grid !important;
          }
        }
      `}</style>
      
      {/* Desktop: Horizontal Focus Deck */}
      <div className="desktop-focus-deck" style={{ display: 'none' }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          height: '600px',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {tiers.map((tier) => (
            <TierCard
              key={tier.id}
              id={tier.id}
              title={tier.title}
              price={tier.price}
              priceSubtext={tier.priceSubtext}
              description={tier.description}
              icon={tier.icon}
              iconAlt={tier.iconAlt}
              color={tier.color}
              isPopular={tier.isPopular}
              isExpanded={activeId === tier.id}
              onExpand={() => setActiveId(tier.id)}
              onCheckout={(interval) => onCheckout(tier.priceId, tier.tierName, interval)}
              loading={loading === (typeof tier.priceId === 'object' ? tier.priceId.annual : tier.priceId) || (typeof tier.priceId === 'object' && 'monthly' in tier.priceId && loading === tier.priceId.monthly)}
              previewTheme={previewTheme}
              onPreviewTheme={onPreviewTheme}
              isFoundersClub={tier.isFoundersClub}
              foundersClubScarcity={tier.isFoundersClub ? foundersClubScarcity ?? null : undefined}
              founderCheckoutIntervals={'founderCheckoutIntervals' in tier ? tier.founderCheckoutIntervals : undefined}
              priceId={tier.priceId}
            >
              {tier.expandedContent}
            </TierCard>
          ))}
        </div>
      </div>

      {/* Mobile: Vertical Stack - placeholder for existing grid */}
      <div className="mobile-sponsor-grid" style={{ display: 'none' }}>
        {/* Mobile cards will be rendered by the parent component */}
      </div>
    </>
  );
}
