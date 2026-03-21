'use client';

import React from 'react';
import Image from 'next/image';
import {
  ShieldAlert,
  Database,
  Cpu,
  CheckCircle,
  ArrowRightCircle,
  AlertTriangle,
} from 'lucide-react';

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1350;

/** Explicit brand hex values so PDF export is always dark + amber (no CSS-var dependency in print). */
const CAROUSEL_BRAND = {
  background: '#111827',
  text: '#F3F4F6',
  accent: '#F59E0B',
  surface: '#1F2937',
  borderWarm: '#F59E0B',
  muted: '#9CA3AF',
} as const;

const CTA_URL = 'https://pocketportfolio.app/sovereign-ai-grant';

const slideBase =
  'carousel-slide flex flex-col shrink-0 box-border p-12';
const footer = 'mt-auto text-sm tracking-wide';
const headline =
  'text-5xl md:text-6xl font-black tracking-tight leading-tight';
const subhead = 'text-xl md:text-2xl font-semibold mt-4 opacity-90';
const body = 'text-lg md:text-xl mt-6 leading-relaxed opacity-90 max-w-4xl';
const highlight = 'font-semibold';

/** Brand bar: logo + tagline on every slide for cohesive branding. */
function CarouselBrandBar() {
  return (
    <header
      className="flex items-center justify-between w-full shrink-0 pb-6 border-b"
      style={{
        borderColor: CAROUSEL_BRAND.surface,
        marginBottom: 8,
      }}
    >
      <Image
        src="/brand/pp-wordmark.svg"
        alt="Pocket Portfolio"
        width={200}
        height={50}
        className="object-contain object-left"
        style={{ filter: 'brightness(0) invert(1)', opacity: 0.95 }}
        unoptimized
      />
      <span
        className="text-sm font-semibold tracking-wide uppercase"
        style={{ color: CAROUSEL_BRAND.muted }}
      >
        Sovereign Architecture
      </span>
    </header>
  );
}

export default function SovereignCarouselSlides() {
  return (
    <div
      className="flex flex-col items-center min-h-screen overflow-y-auto"
      style={{
        width: SLIDE_WIDTH,
        background: CAROUSEL_BRAND.background,
        color: CAROUSEL_BRAND.text,
      }}
    >
      {/* --- SLIDE 1: The Hook --- */}
      <div
        className={slideBase}
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          background: CAROUSEL_BRAND.background,
          color: CAROUSEL_BRAND.text,
        }}
      >
        <CarouselBrandBar />
        <div className="flex flex-col flex-1 justify-center">
          <ShieldAlert
            className="shrink-0"
            size={100}
            strokeWidth={1.5}
            style={{ color: CAROUSEL_BRAND.accent }}
          />
          <h1 className={`${headline} mt-6`} style={{ color: CAROUSEL_BRAND.text }}>
            The Sovereign AI Imperative.
          </h1>
          <p className={`${subhead} max-w-3xl`} style={{ color: CAROUSEL_BRAND.text, opacity: 0.95 }}>
            Why Finance, Energy, and Defense must rethink the cloud.
          </p>
        </div>
        <div className={footer} style={{ color: CAROUSEL_BRAND.muted }}>Pocket Portfolio | Sovereign Architecture</div>
      </div>

      {/* --- SLIDE 2: The Villain --- */}
      <div
        className={slideBase}
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          background: CAROUSEL_BRAND.background,
          color: CAROUSEL_BRAND.text,
        }}
      >
        <CarouselBrandBar />
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center justify-center gap-5 my-6">
            <AlertTriangle size={44} style={{ color: CAROUSEL_BRAND.accent, opacity: 0.9 }} />
            <Database
              size={88}
              strokeWidth={1.5}
              style={{ color: CAROUSEL_BRAND.text, opacity: 0.7 }}
            />
            <AlertTriangle size={44} style={{ color: CAROUSEL_BRAND.accent, opacity: 0.9 }} />
          </div>
          <h1 className={`${headline} text-center mt-4`} style={{ color: CAROUSEL_BRAND.text }}>
            The Centralization Trap.
          </h1>
          <p className={`${body} text-center mt-4`} style={{ color: CAROUSEL_BRAND.text, opacity: 0.95 }}>
            Legacy AI architecture requires siphoning critical national
            data—grid telemetry, financial ledgers, and defense
            logistics—into centralized cloud databases.{' '}
            <span className={highlight} style={{ color: CAROUSEL_BRAND.accent }}>
              This creates massive security honeypots and total dependency on
              foreign tech monopolies.
            </span>
          </p>
        </div>
        <div className={footer} style={{ color: CAROUSEL_BRAND.muted }}>Pocket Portfolio | Sovereign Architecture</div>
      </div>

      {/* --- SLIDE 3: The Paradigm Shift --- */}
      <div
        className={slideBase}
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          background: CAROUSEL_BRAND.background,
          color: CAROUSEL_BRAND.text,
        }}
      >
        <CarouselBrandBar />
        <div className="flex flex-col flex-1 justify-center max-w-3xl">
          <Cpu
            className="shrink-0"
            size={96}
            strokeWidth={1.5}
            style={{ color: CAROUSEL_BRAND.accent }}
          />
          <h1 className={`${headline} mt-6`} style={{ color: CAROUSEL_BRAND.text }}>
            Sovereign Architecture.
          </h1>
          <p className={body} style={{ color: CAROUSEL_BRAND.text, opacity: 0.95 }}>
            Move the AI to the data, not the data to the AI. Total
            intelligence.{' '}
            <span className={highlight} style={{ color: CAROUSEL_BRAND.accent }}>
              Zero data surrender.
            </span>
          </p>
        </div>
        <div className={footer} style={{ color: CAROUSEL_BRAND.muted }}>Pocket Portfolio | Sovereign Architecture</div>
      </div>

      {/* --- SLIDE 4: The Blueprint --- */}
      <div
        className={slideBase}
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          background: CAROUSEL_BRAND.background,
          color: CAROUSEL_BRAND.text,
        }}
      >
        <CarouselBrandBar />
        <h1 className={`${headline} mb-6`} style={{ color: CAROUSEL_BRAND.text }}>
          The Blueprint.
        </h1>
        <div className="flex flex-col gap-6 flex-1">
          <div
            className="rounded-xl p-6 border"
            style={{
              background: CAROUSEL_BRAND.surface,
              borderColor: CAROUSEL_BRAND.borderWarm,
            }}
          >
            <span className="font-bold text-lg" style={{ color: CAROUSEL_BRAND.accent }}>1</span>
            <h2 className="text-2xl font-bold mt-2" style={{ color: CAROUSEL_BRAND.text }}>
              Local-First Boundaries
            </h2>
            <p className="mt-1 opacity-90" style={{ color: CAROUSEL_BRAND.text }}>Process at the Edge</p>
          </div>
          <div className="text-center opacity-60" style={{ color: CAROUSEL_BRAND.text }}>↓</div>
          <div
            className="rounded-xl p-6 border"
            style={{
              background: CAROUSEL_BRAND.surface,
              borderColor: CAROUSEL_BRAND.borderWarm,
            }}
          >
            <span className="font-bold text-lg" style={{ color: CAROUSEL_BRAND.accent }}>2</span>
            <h2 className="text-2xl font-bold mt-2" style={{ color: CAROUSEL_BRAND.text }}>
              Sanitized Context
            </h2>
            <p className="mt-1 opacity-90" style={{ color: CAROUSEL_BRAND.text }}>
              Compress to anomaly flags & aggregates
            </p>
          </div>
          <div className="text-center opacity-60" style={{ color: CAROUSEL_BRAND.text }}>↓</div>
          <div
            className="rounded-xl p-6 border"
            style={{
              background: CAROUSEL_BRAND.surface,
              borderColor: CAROUSEL_BRAND.borderWarm,
            }}
          >
            <span className="font-bold text-lg" style={{ color: CAROUSEL_BRAND.accent }}>3</span>
            <h2 className="text-2xl font-bold mt-2" style={{ color: CAROUSEL_BRAND.text }}>
              Stateless Cloud API
            </h2>
            <p className="mt-1 opacity-90" style={{ color: CAROUSEL_BRAND.text }}>
              Execute inference with zero retention
            </p>
          </div>
        </div>
        <div className={footer} style={{ color: CAROUSEL_BRAND.muted }}>Pocket Portfolio | Sovereign Architecture</div>
      </div>

      {/* --- SLIDE 5: The Golden Rules --- */}
      <div
        className={slideBase}
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          background: CAROUSEL_BRAND.background,
          color: CAROUSEL_BRAND.text,
        }}
      >
        <CarouselBrandBar />
        <h1 className={headline} style={{ color: CAROUSEL_BRAND.text }}>
          The Rules of Sovereign Build.
        </h1>
        <ul className="mt-8 space-y-5 max-w-3xl">
          <li className="flex items-start gap-4">
            <CheckCircle className="shrink-0 mt-1" size={32} style={{ color: CAROUSEL_BRAND.accent }} />
            <span className="text-xl opacity-90" style={{ color: CAROUSEL_BRAND.text }}>
              Audit every byte of data egress.
            </span>
          </li>
          <li className="flex items-start gap-4">
            <CheckCircle className="shrink-0 mt-1" size={32} style={{ color: CAROUSEL_BRAND.accent }} />
            <span className="text-xl opacity-90" style={{ color: CAROUSEL_BRAND.text }}>
              Ensure all endpoints are pure functions (Zero Storage).
            </span>
          </li>
          <li className="flex items-start gap-4">
            <CheckCircle className="shrink-0 mt-1" size={32} style={{ color: CAROUSEL_BRAND.accent }} />
            <span className="text-xl opacity-90" style={{ color: CAROUSEL_BRAND.text }}>
              Decouple your revenue model from data exploitation.
            </span>
          </li>
        </ul>
        <div className={footer} style={{ color: CAROUSEL_BRAND.muted }}>Pocket Portfolio | Sovereign Architecture</div>
      </div>

      {/* --- SLIDE 6: The Call to Action --- */}
      <div
        className={slideBase}
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          background: CAROUSEL_BRAND.background,
          color: CAROUSEL_BRAND.text,
        }}
      >
        <CarouselBrandBar />
        <div className="flex flex-col flex-1 justify-center items-center text-center">
          <ArrowRightCircle
            className="shrink-0"
            size={96}
            strokeWidth={1.5}
            style={{ color: CAROUSEL_BRAND.accent }}
          />
          <h1 className={`${headline} mt-6`} style={{ color: CAROUSEL_BRAND.text }}>
            See the Blueprint in Action.
          </h1>
          <p className={`${body} mt-4`} style={{ color: CAROUSEL_BRAND.text, opacity: 0.95 }}>
            We aren&apos;t just theorizing. We built the working model.
          </p>
          <a
            href={CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 p-6 rounded-xl border-2 block w-full max-w-md transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111827] focus:ring-[#F59E0B]"
            style={{
              background: CAROUSEL_BRAND.surface,
              borderColor: CAROUSEL_BRAND.accent,
              color: CAROUSEL_BRAND.accent,
            }}
          >
            <span className="text-xl font-bold">
              pocketportfolio.app/sovereign-ai-grant
            </span>
          </a>
        </div>
        <div className={footer} style={{ color: CAROUSEL_BRAND.muted }}>Pocket Portfolio | Sovereign Architecture</div>
      </div>
    </div>
  );
}
