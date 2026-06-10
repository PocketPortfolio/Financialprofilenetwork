'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';

export type SponsorPersonaTab = 'investors' | 'developers' | 'institutions';

const PERSONA_TABS: { id: SponsorPersonaTab; label: string }[] = [
  { id: 'investors', label: 'For investors' },
  { id: 'developers', label: 'For developers' },
  { id: 'institutions', label: 'For institutions' },
];

/** Map legacy `?tier=` deep links to persona panes (Stripe objects unchanged). */
export function resolveSponsorPersonaTab(tier: string | null): SponsorPersonaTab | null {
  if (!tier) return null;
  switch (tier) {
    case 'founder':
      return 'investors';
    case 'code-supporter':
    case 'developer-utility':
      return 'developers';
    case 'corporate':
      return 'institutions';
    default:
      return null;
  }
}

export type FoundersClubScarcity = {
  count: number;
  batch: number;
  label: string;
  progress: number;
  remaining: number;
  max: number;
} | null;

interface SponsorDeckProps {
  onCheckout: (
    priceId: string | { monthly: string; annual: string },
    tierName: string,
    chosenInterval?: 'monthly' | 'annual',
  ) => void;
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
  /** Initial persona pane — defaults to investors per CMD-UI-SPONSOR-2026-06-10 */
  initialTab?: SponsorPersonaTab;
}

function isPriceLoading(
  loading: string | null,
  priceId: string | { monthly: string; annual: string },
): boolean {
  if (!loading) return false;
  if (typeof priceId === 'string') return loading === priceId;
  return loading === priceId.monthly || loading === priceId.annual;
}

function FeatureBlock({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      style={{
        marginBottom: '12px',
        padding: '12px',
        background: 'var(--surface-elevated)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle, var(--border))',
      }}
    >
      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function FeatureBulletList({ items }: { items: string[] }) {
  return (
    <ul
      style={{
        fontSize: '13px',
        color: 'var(--text-secondary)',
        marginLeft: '20px',
        marginTop: '8px',
        lineHeight: 1.8,
        padding: 0,
        listStyle: 'none',
      }}
    >
      {items.map((item) => (
        <li key={item} style={{ marginBottom: '4px' }}>
          • {item}
        </li>
      ))}
    </ul>
  );
}

function SavingsBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginBottom: '12px',
        fontSize: '13px',
        color: 'var(--accent-warm)',
        fontWeight: '600',
        background: 'rgba(245, 158, 11, 0.1)',
        padding: '8px',
        borderRadius: '6px',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}

function UkFounderBadge() {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      style={{ marginLeft: '6px', opacity: 0.7, verticalAlign: 'middle' }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="16" height="12" fill="#012169" />
      <path d="M0 0 L16 12 M16 0 L0 12" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M8 0 L8 12 M0 6 L16 6" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M0 0 L16 12 M16 0 L0 12" stroke="#C8102E" strokeWidth="1.2" />
      <path d="M8 0 L8 12 M0 6 L16 6" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M0 0 L5.33 0 L0 3.56 Z" fill="#FFFFFF" />
      <path d="M16 0 L10.67 0 L16 3.56 Z" fill="#FFFFFF" />
      <path d="M0 12 L5.33 12 L0 8.44 Z" fill="#FFFFFF" />
      <path d="M16 12 L10.67 12 L16 8.44 Z" fill="#FFFFFF" />
    </svg>
  );
}

function SubscribeButton({
  onClick,
  loading,
  disabled,
  label = 'Subscribe (Annual)',
  variant = 'primary',
}: {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  label?: string;
  variant?: 'primary' | 'outline';
}) {
  const isPrimary = variant === 'primary';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '12px 24px',
        background: loading ? 'var(--muted)' : isPrimary ? 'var(--accent-warm)' : 'transparent',
        color: loading ? 'var(--text-secondary)' : isPrimary ? 'white' : 'var(--accent-warm)',
        border: isPrimary ? 'none' : '2px solid var(--accent-warm)',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        opacity: disabled && !loading ? 0.6 : 1,
        width: '100%',
      }}
    >
      {loading ? 'Processing...' : label}
    </button>
  );
}

function BillingIntervalButtons({
  priceIds,
  tierName,
  onCheckout,
  loading,
  checkoutBusy,
  monthlyLabel,
  annualLabel,
}: {
  priceIds: { monthly: string; annual: string };
  tierName: string;
  onCheckout: SponsorDeckProps['onCheckout'];
  loading: string | null;
  checkoutBusy: boolean;
  monthlyLabel: string;
  annualLabel: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
      <SubscribeButton
        onClick={() => onCheckout(priceIds, tierName, 'monthly')}
        loading={loading === priceIds.monthly}
        disabled={checkoutBusy}
        label={monthlyLabel}
        variant="outline"
      />
      <SubscribeButton
        onClick={() => onCheckout(priceIds, tierName, 'annual')}
        loading={loading === priceIds.annual}
        disabled={checkoutBusy}
        label={annualLabel}
        variant="primary"
      />
    </div>
  );
}

function DualPriceHeadline({
  monthly,
  annual,
}: {
  monthly: React.ReactNode;
  annual: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          fontSize: 'clamp(22px, 4vw, 28px)',
          fontWeight: 'bold',
          color: 'var(--accent-warm)',
          display: 'flex',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span>{monthly}</span>
        <span style={{ fontSize: '0.45em', color: 'var(--text-secondary)', fontWeight: '600' }}>or</span>
        <span>{annual}</span>
      </div>
    </div>
  );
}

export default function SponsorDeck({
  onCheckout,
  loading,
  previewTheme,
  onPreviewTheme,
  PRICE_IDS,
  foundersClubScarcity: _foundersClubScarcity = null,
  abVariant = 'A',
  initialTab = 'investors',
}: SponsorDeckProps) {
  const [activeTab, setActiveTab] = useState<SponsorPersonaTab>(initialTab);
  /** Investors always mount on load; honour `?tier=` deep links by mounting that pane immediately. */
  const [mountedTabs, setMountedTabs] = useState<Set<SponsorPersonaTab>>(
    () => new Set<SponsorPersonaTab>(['investors', initialTab]),
  );

  const selectTab = useCallback((tab: SponsorPersonaTab) => {
    setActiveTab(tab);
    setMountedTabs((prev) => new Set(prev).add(tab));
  }, []);

  const v = abVariant === 'B' ? 'B' : 'A';
  const founderTitle = v === 'B' ? 'Unlock the AI + Risk Terminal' : 'UK Founders Club';
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

  const checkoutBusy = loading !== null;

  const tabBar = (
    <div
      role="tablist"
      aria-label="Sponsorship persona"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-subtle, var(--border))',
        paddingBottom: '4px',
      }}
    >
      {PERSONA_TABS.map(({ id, label }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            id={`sponsor-tab-${id}`}
            aria-controls={`sponsor-panel-${id}`}
            onClick={() => selectTab(id)}
            style={{
              flex: '1 1 auto',
              minWidth: 'min(100%, 160px)',
              padding: '12px 20px',
              background: isActive ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
              color: isActive ? 'var(--accent-warm)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: isActive ? '3px solid var(--accent-warm)' : '3px solid transparent',
              borderRadius: '8px 8px 0 0',
              fontSize: '14px',
              fontWeight: isActive ? '700' : '500',
              letterSpacing: '0.02em',
              cursor: 'pointer',
              transition: 'color 0.15s ease, border-color 0.15s ease, background 0.15s ease',
              textTransform: 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  const investorsPane = (
    <div
      role="tabpanel"
      id="sponsor-panel-investors"
      aria-labelledby="sponsor-tab-investors"
      hidden={activeTab !== 'investors'}
      style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, rgba(245, 158, 11, 0.05) 100%)',
        border: '2px solid var(--accent-warm)',
        borderRadius: '12px',
        padding: 'clamp(20px, 4vw, 32px)',
        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <img
          src="/brand/archetype-founders-club.svg"
          alt="The Sovereign"
          style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto 16px' }}
        />
        <h3
          style={{
            fontSize: 'clamp(22px, 4vw, 28px)',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: 'var(--text)',
          }}
        >
          {founderTitle}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto' }}>
          You are not tied to a specific broker. Switch brokerages freely; your data history stays here. Cancel anytime.
        </p>
        <div
          style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: 'var(--accent-warm)',
            fontWeight: '600',
            marginTop: '16px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Per month or per year — cancel anytime
        </div>
        <div
          style={{
            fontSize: 'clamp(24px, 4.5vw, 32px)',
            fontWeight: 'bold',
            color: 'var(--accent-warm)',
            marginTop: '8px',
          }}
        >
          £12<span style={{ fontSize: '0.55em', fontWeight: '600' }}>/mo</span>
          <span style={{ fontSize: '0.45em', margin: '0 8px', color: 'var(--text-secondary)' }}>or</span>
          £100<span style={{ fontSize: '0.55em', fontWeight: '600' }}>/yr</span>
        </div>
      </div>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 24px 0',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          maxWidth: '640px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
          <span style={{ color: 'var(--accent-warm)', marginRight: '8px', fontSize: '18px' }}>✓</span>
          You are not tied to a specific broker. Switch brokerages freely; your data history stays here.
        </li>
        <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
          <span style={{ color: 'var(--accent-warm)', marginRight: '8px', fontSize: '18px' }}>✓</span>
          Unlimited API calls forever
        </li>
        <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
          <span style={{ color: 'var(--accent-warm)', marginRight: '8px', fontSize: '18px' }}>✓</span>
          Priority Discord access
        </li>
        <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
          <span style={{ color: 'var(--accent-warm)', marginRight: '8px', fontSize: '18px' }}>✓</span>
          Permanent &quot;Founder&quot; badge
          <UkFounderBadge />
        </li>
        <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
          <span style={{ color: 'var(--accent-warm)', marginRight: '8px', fontSize: '18px' }}>✓</span>
          Early access to new features
        </li>
        <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--accent-warm)', marginRight: '8px', fontSize: '18px', lineHeight: 1.4 }}>✓</span>
          <span>
            <strong>Advanced Analytics:</strong> Sector breakdown, Risk Matrix &amp; Beta analytics, and stateless
            allocation insights
          </span>
        </li>
        <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--accent-warm)', marginRight: '8px', fontSize: '18px', lineHeight: 1.4 }}>✓</span>
          <span>
            <strong>🏢 White Label Portfolio Reports:</strong> Generate professional branded PDF reports with your firm
            logo — same value as Corporate License
          </span>
        </li>
      </ul>

      <div
        style={{
          marginBottom: '16px',
          padding: '12px',
          background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          maxWidth: '640px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent-warm)', marginBottom: '8px' }}>
          ✅ <strong>Sovereign Sync:</strong> Google Drive as Database (1 Seat)
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '20px' }}>
          Need more? Add seats for <strong>£50/mo</strong>.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
        {founderIntervals.map(({ label, interval }) => (
          <button
            key={interval}
            type="button"
            onClick={() => onCheckout(PRICE_IDS.foundersClub, "UK Founder's Club", interval)}
            disabled={checkoutBusy}
            style={{
              padding: '12px 24px',
              background:
                isPriceLoading(loading, PRICE_IDS.foundersClub) || checkoutBusy
                  ? 'var(--muted)'
                  : interval === 'annual'
                    ? 'var(--accent-warm)'
                    : 'transparent',
              color:
                isPriceLoading(loading, PRICE_IDS.foundersClub) || checkoutBusy
                  ? 'var(--text-secondary)'
                  : interval === 'annual'
                    ? 'white'
                    : 'var(--accent-warm)',
              border: '2px solid var(--accent-warm)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: checkoutBusy ? 'not-allowed' : 'pointer',
              width: '100%',
            }}
          >
            {isPriceLoading(loading, PRICE_IDS.foundersClub) ? 'Processing...' : label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPreviewTheme(previewTheme === 'founder' ? null : 'founder')}
          style={{
            padding: '12px 20px',
            background: previewTheme === 'founder' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            color: 'var(--accent-warm)',
            border: '2px solid var(--accent-warm)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          {previewTheme === 'founder' ? '✕ Close Preview' : '✨ Preview Gold Theme'}
        </button>
      </div>
    </div>
  );

  const developersPane = mountedTabs.has('developers') ? (
    <div
      role="tabpanel"
      id="sponsor-panel-developers"
      aria-labelledby="sponsor-tab-developers"
      hidden={activeTab !== 'developers'}
      style={{
        display: activeTab === 'developers' ? 'grid' : 'none',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
      }}
    >
      {/* Code Supporter */}
      <div
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--border-subtle, var(--border))',
          borderRadius: '12px',
          padding: 'clamp(20px, 4vw, 28px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <img
          src="/brand/archetype-code-supporter.svg"
          alt="The Contributor"
          style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '16px' }}
        />
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>
          Code Supporter
        </h3>
        <DualPriceHeadline
          monthly={<>$5<span style={{ fontSize: '0.55em' }}>/mo</span></>}
          annual={<>$50<span style={{ fontSize: '0.55em' }}>/yr</span></>}
        />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, flexGrow: 1 }}>
          I use the NPM packages and I support open source technologies.
        </p>
        <div
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '16px',
            textDecoration: 'line-through',
            textAlign: 'center',
          }}
        >
          $60/year if paid monthly
        </div>
        <SavingsBanner>💰 Save $10/year (2 months free!)</SavingsBanner>
        <BillingIntervalButtons
          priceIds={PRICE_IDS.codeSupporter}
          tierName="Code Supporter"
          onCheckout={onCheckout}
          loading={loading}
          checkoutBusy={checkoutBusy}
          monthlyLabel="Subscribe Monthly ($5/mo)"
          annualLabel="Subscribe Annual ($50/yr)"
        />
      </div>

      {/* Universal Data Engine */}
      <div
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--accent-warm)',
          borderRadius: '12px',
          padding: 'clamp(20px, 4vw, 28px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--accent-warm)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          Popular
        </span>
        <img
          src="/brand/archetype-developer-utility.svg"
          alt="The Builder"
          style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '16px' }}
        />
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>
          Universal Data Engine
        </h3>
        <DualPriceHeadline
          monthly={<>$20<span style={{ fontSize: '0.55em' }}>/mo</span></>}
          annual={<>$200<span style={{ fontSize: '0.55em' }}>/yr</span></>}
        />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
          Don&apos;t write parsers. Push any raw broker data to our endpoint, and let our engine normalize it for you.
        </p>
        <div
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            margin: '12px 0 16px',
            textDecoration: 'line-through',
            textAlign: 'center',
          }}
        >
          $240/year if paid monthly
        </div>

        <FeatureBlock title={<>⚡ <strong>Universal Data Engine:</strong></>}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.8 }}>
            Don&apos;t write parsers. Push any raw broker data to our endpoint, and let our engine normalize it for you.
          </p>
        </FeatureBlock>

        <FeatureBlock title={<>🚀 <strong>Developer Benefits:</strong></>}>
          <FeatureBulletList
            items={[
              'Priority access to the Roadmap & Insider Discord',
              'Influence product development decisions',
              'Early access to new features',
              'Direct line to the development team',
            ]}
          />
        </FeatureBlock>

        <FeatureBlock title={<>⚡ <strong>Unlimited API Access:</strong></>}>
          <FeatureBulletList
            items={[
              'Unlimited API calls (stock prices, market data)',
              'Real-time quote data',
              'Historical ticker data (JSON format)',
              'No rate limits or throttling',
            ]}
          />
        </FeatureBlock>

        <SavingsBanner>💰 Save $40/year (2 months free!)</SavingsBanner>
        <BillingIntervalButtons
          priceIds={PRICE_IDS.featureVoter}
          tierName="Developer Utility"
          onCheckout={onCheckout}
          loading={loading}
          checkoutBusy={checkoutBusy}
          monthlyLabel="Subscribe Monthly ($20/mo)"
          annualLabel="Subscribe Annual ($200/yr)"
        />
      </div>
    </div>
  ) : null;

  const institutionsPane = mountedTabs.has('institutions') ? (
    <div
      role="tabpanel"
      id="sponsor-panel-institutions"
      aria-labelledby="sponsor-tab-institutions"
      hidden={activeTab !== 'institutions'}
      style={{
        background: 'var(--surface)',
        border: '2px solid var(--border-subtle, var(--border))',
        borderRadius: '12px',
        padding: 'clamp(24px, 4vw, 40px)',
        display: activeTab === 'institutions' ? 'block' : 'none',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <img
          src="/brand/archetype-corporate-ecosystem.svg"
          alt="The Institution"
          style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '20px' }}
        />
        <h3 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text)' }}>
          Corporate Ecosystem
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.7, marginBottom: '16px' }}>
          White Label Portal for Financial Advisors &amp; Wealth Managers. Enterprise-grade portfolio analytics and
          client reporting.
        </p>
        <div
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '16px',
            textDecoration: 'line-through',
            textAlign: 'center',
          }}
        >
          $1,200/year if paid monthly
        </div>

        <FeatureBlock title={<>🏢 <strong>White Label Features:</strong></>}>
          <FeatureBulletList
            items={[
              'Custom branded client dashboard',
              'White label PDF portfolio reports',
              'Firm logo integration',
              'Client-facing portal with your branding',
            ]}
          />
        </FeatureBlock>

        <FeatureBlock title={<>⚡ <strong>Corporate Perks:</strong></>}>
          <FeatureBulletList
            items={[
              'Unlimited API calls (stock prices, market data)',
              'Advanced analytics (sector breakdown, Risk Matrix & Beta, stateless allocation insights)',
              'Priority support & onboarding',
              'Your logo on our README',
              'Early access to new features',
            ]}
          />
        </FeatureBlock>

        <FeatureBlock title={<>✅ <strong>Sovereign Sync:</strong> Google Drive as Database (2 Seats)</>}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '20px' }}>
            Need more? Add seats for <strong>$50/mo</strong>.
          </div>
        </FeatureBlock>

        <SavingsBanner>💰 Save $200/year (2 months free!)</SavingsBanner>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px' }}>
          <Link
            href="/tier1designpartner"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '14px 28px',
              background: 'var(--accent-warm)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              textDecoration: 'none',
              border: 'none',
            }}
          >
            Book a Discovery Call
          </Link>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
            Procurement, compliance review, and custom SLA — handled on the Tier 1 design-partner track.
          </p>

          <div
            style={{
              marginTop: '16px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle, var(--border))',
            }}
          >
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', textAlign: 'center' }}>
              Self-serve license — subscribe below, or book a discovery call for procurement &amp; custom SLA
            </p>
            <DualPriceHeadline
              monthly={<>$100<span style={{ fontSize: '0.55em' }}>/mo</span></>}
              annual={<>$1,000<span style={{ fontSize: '0.55em' }}>/yr</span></>}
            />
            <BillingIntervalButtons
              priceIds={PRICE_IDS.corporateSponsor}
              tierName="Corporate Ecosystem"
              onCheckout={onCheckout}
              loading={loading}
              checkoutBusy={checkoutBusy}
              monthlyLabel="Subscribe Monthly ($100/mo)"
              annualLabel="Subscribe Annual ($1,000/yr)"
            />
            <button
              type="button"
              onClick={() => onPreviewTheme(previewTheme === 'corporate' ? null : 'corporate')}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '12px 20px',
                background: previewTheme === 'corporate' ? 'var(--muted)' : 'transparent',
                color: 'var(--text)',
                border: '2px solid var(--border-subtle, var(--border))',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {previewTheme === 'corporate' ? '✕ Close Preview' : '👁️ Preview Terminal Theme'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
      {tabBar}
      {investorsPane}
      {developersPane}
      {institutionsPane}
    </div>
  );
}
