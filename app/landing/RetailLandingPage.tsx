'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import FunnelTracker from '../components/analytics/FunnelTracker';
import LandingProductionNavbar from '../components/marketing/RetailProductionNavbar';
import RetailLandingHero from '../components/landing/RetailLandingHero';
import { AnalystVideo } from '../components/landing/AnalystVideo';
import RetailTrustSection from '../components/landing/RetailTrustSection';
import ProductPortalSection from '../components/pocket-landing/ProductPortalSection';
import RetailLandingFaq from '../components/landing/RetailLandingFaq';
import { useAuth } from '../hooks/useAuth';
import { useLandingCsvDemo } from '../hooks/useLandingCsvDemo';
import { useLandingAbTelemetry } from '../hooks/useLandingAbTelemetry';
import { useStickyHeader } from '../hooks/useStickyHeader';
import {
  getDashboardDemoVideoSrc,
} from '../../lib/landing-product-video';
import { trackABConversion } from '@/app/lib/analytics/ab-testing';
import { LANDING_VARIANT_TEST_ID } from '@/lib/landing-retail-variant';

export default function RetailLandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const csvDemo = useLandingCsvDemo({ landingVariant: 'retail' });
  useLandingAbTelemetry('retail');
  const [isMobile, setIsMobile] = useState(false);
  const [heroVideoSrc, setHeroVideoSrc] = useState(() => getDashboardDemoVideoSrc());

  const POST_AUTH_REDIRECT_KEY = 'pp-post-auth-redirect-done';
  useEffect(() => {
    if (!user || pathname !== '/') return;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(POST_AUTH_REDIRECT_KEY)) return;
    sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, '1');
    router.replace('/dashboard');
  }, [user, pathname, router]);

  useEffect(() => {
    setHeroVideoSrc(getDashboardDemoVideoSrc(window.location.hostname));
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (csvDemo.showFoundersSnare) {
      trackABConversion(LANDING_VARIANT_TEST_ID, 'landing_hero_sanitization_complete');
    }
  }, [csvDemo.showFoundersSnare]);

  useStickyHeader('header.brand-header');

  return (
    <>
      <FunnelTracker funnelName="user_onboarding" stage="landing" autoTrackScroll autoTrackTime />
      <LandingProductionNavbar variant="retail" />

      <RetailLandingHero isMobile={isMobile} heroVideoSrc={heroVideoSrc} csvDemo={csvDemo} />

      <div className="terminal-content-scope">
        <AnalystVideo variant="retail" />
      </div>

      <RetailTrustSection />

      <main className="brand-surface brand-grid mobile-container">
        <ProductPortalSection variant="retail" />
        <RetailLandingFaq />
      </main>

      <section
        style={{
          marginBottom: 'clamp(48px, 8vw, 80px)',
          textAlign: 'center',
          padding: '0 clamp(12px, 3vw, 24px)',
        }}
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '15px' }}>
          Wealth professionals and advisors:{' '}
          <Link href="/for/advisors" style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
            see the advisor workspace →
          </Link>
        </p>
      </section>
    </>
  );
}
