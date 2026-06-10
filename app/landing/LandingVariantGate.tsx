'use client';

import { Suspense } from 'react';
import { useLandingVariant } from '../hooks/useLandingVariant';
import { useLandingAbTelemetry } from '../hooks/useLandingAbTelemetry';
import LandingPage from './ControlLandingPage';
import RetailLandingPage from './RetailLandingPage';

function ControlLandingWithTelemetry() {
  useLandingAbTelemetry('control');
  return <LandingPage />;
}

function LandingVariantGateInner() {
  const variant = useLandingVariant();
  if (variant === 'retail') {
    return <RetailLandingPage />;
  }
  return <ControlLandingWithTelemetry />;
}

function LandingVariantFallback() {
  return (
    <div
      className="brand-surface"
      style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      aria-busy
      aria-label="Loading"
    />
  );
}

export default function LandingVariantGate() {
  return (
    <Suspense fallback={<LandingVariantFallback />}>
      <LandingVariantGateInner />
    </Suspense>
  );
}
