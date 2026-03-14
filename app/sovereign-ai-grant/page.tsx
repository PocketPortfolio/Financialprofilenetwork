'use client';

import React from 'react';
import {
  Database,
  ShieldCheck,
  HardDrive,
  FolderOpen,
  Eye,
  MapPin,
  Cpu,
  Zap,
  Layers,
  Cloud,
  Code,
  Wallet,
  Users,
  Globe,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Smartphone,
} from 'lucide-react';

const PILLARS = [
  {
    title: 'Pillar 1: Local-First Data Sovereignty',
    subhead:
      'Data stays on device and in user-chosen storage; we never hold or process raw financial ledgers.',
    foundations: [
      {
        id: '1.1',
        icon: HardDrive,
        title: 'Data boundary at the edge',
        body: "Portfolio data lives in the user's browser (IndexedDB) and optional Google Drive. We do not operate a database of user financial data.",
      },
      {
        id: '1.2',
        icon: FolderOpen,
        title: 'User-owned storage & open formats',
        body: 'Sync uses a single user-owned file. Schema is open (JSON/CSV); users can export, move, or audit their data with no vendor lock-in.',
      },
      {
        id: '1.3',
        icon: Eye,
        title: 'Minimal, auditable data egress',
        body: 'Only a sanitized context string (totals, top-N holdings) leaves the device for AI inference. No PII or row-level history.',
      },
      {
        id: '1.4',
        icon: MapPin,
        title: 'Compliance-friendly residency',
        body: "UK users' data remains under their control. We do not ship raw ledgers to foreign jurisdictions for processing.",
      },
    ],
  },
  {
    title: 'Pillar 2: Edge-Compute AI',
    subhead:
      'Context is built on-device; the cloud only sees a minimal, non-retained snapshot—demonstrating frontier AI without moving data.',
    foundations: [
      {
        id: '2.1',
        icon: Cpu,
        title: 'Client-side context engine',
        body: 'The full portfolio is reduced to a token-bounded summary in the browser. Raw data never leaves the device.',
      },
      {
        id: '2.2',
        icon: Zap,
        title: 'Stateless inference API',
        body: 'Our endpoints are pure functions. No server-side storage of portfolio or chat history. The data boundary is preserved at scale.',
      },
      {
        id: '2.3',
        icon: Layers,
        title: 'Hybrid RAG with sovereign control',
        body: "The model reasons over the user's local summary plus public market data. Sensitive data is never used to build a remote RAG index.",
      },
      {
        id: '2.4',
        icon: Cloud,
        title: 'Scale-to-cloud with clear boundaries',
        body: 'Only minimal context is in flight. Future deployments can use sovereign or on-prem LLMs without changing the client-side boundary.',
      },
    ],
  },
  {
    title: 'Pillar 3: Open-Ecosystem Business Model',
    subhead:
      'Open core, auditable boundary, revenue from membership and services—not from data harvesting or vendor lock-in.',
    foundations: [
      {
        id: '3.1',
        icon: Code,
        title: 'Open-source, auditable core',
        body: 'Reviewers and institutions can audit how data is reduced, what is sent to APIs, and how the boundary is strictly enforced.',
      },
      {
        id: '3.2',
        icon: Wallet,
        title: 'Revenue aligned with sovereignty',
        body: 'Revenue comes from membership and sponsors, proving that sovereign, local-first infrastructure can be financially self-sustaining.',
      },
      {
        id: '3.3',
        icon: Users,
        title: 'Community governance',
        body: 'Roadmap priorities are influenced by the community, showing a path to scalable adoption without central control of user data.',
      },
      {
        id: '3.4',
        icon: Globe,
        title: 'Reducing reliance on foreign tech',
        body: 'By keeping context construction on the client, core value does not depend on foreign hyperscalers. LLMs can be swapped dynamically.',
      },
    ],
  },
];

const GRANT_ALIGNMENT = [
  {
    outcome: 'Proof of concept for architecture',
    evidence:
      'Working local-first stack: IndexedDB, client-side context engine, and stateless APIs with zero server portfolio DB.',
  },
  {
    outcome: 'Technical validation of capabilities',
    evidence: 'Fully auditable codebase demonstrating exactly what sanitized strings cross the boundary.',
  },
  {
    outcome: 'Demonstrate frontier AI performance',
    evidence:
      'Hybrid RAG over sanitized context only, proving useful AI is possible without centralizing user data.',
  },
  {
    outcome: 'Show ability to scale business model',
    evidence:
      'Subscription (Founders Club) and enterprise tiers—revenue is entirely decoupled from data exploitation.',
  },
  {
    outcome: 'Clear path to data & compute access',
    evidence:
      'Data is 100% user-owned. Compute is stateless and can be routed to UK sovereign endpoints.',
  },
];

const RIBBON_STATS = [
  { value: '0 Bytes', subtext: 'Raw portfolio data stored on our servers' },
  { value: '100%', subtext: 'User-owned data residency and control' },
  { value: '< 4KB', subtext: 'Sanitized context string sent for stateless inference' },
] as const;

export default function SovereignAIGrantPage() {
  const scrollToBlueprint = () => {
    document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Hero */}
        <header className="pb-24" style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 'var(--space-4)',
              lineHeight: 1.2,
            }}
          >
            Pocket Portfolio: A Proof-of-Concept for UK Sovereign AI Infrastructure
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '720px',
              margin: '0 auto var(--space-8)',
            }}
          >
            Demonstrating how the UK can build secure, user-owned financial data systems that
            deliver frontier AI capabilities without depending on foreign hyperscalers for data
            retention.
          </p>
          <button
            type="button"
            onClick={scrollToBlueprint}
            style={{
              padding: 'var(--space-3) var(--space-5)',
              background: 'var(--accent-warm)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
            }}
          >
            View the Technical Blueprint
          </button>
        </header>

        {/* Data Storytelling Ribbon */}
        <section className="py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {RIBBON_STATS.map((stat) => (
              <div
                key={stat.value}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-8)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--font-size-3xl)',
                    fontWeight: 700,
                    color: 'var(--accent-warm)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  {stat.value}
                </div>
                <p
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {stat.subtext}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Paradigm Shift */}
        <section className="py-24">
          <h2
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 'var(--space-8)',
              textAlign: 'center',
            }}
          >
            The Paradigm Shift
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-8)',
                opacity: 0.9,
              }}
            >
              <Database
                size={48}
                style={{ color: 'var(--muted)', marginBottom: 'var(--space-4)' }}
                aria-hidden
              />
              <h3
                style={{
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                The Old Way (Foreign Dependency)
              </h3>
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Legacy platforms siphon your entire financial ledger to centralized, foreign cloud
                servers for processing, stripping you of data sovereignty and creating massive
                security honeypots.
              </p>
            </div>
            <div
              style={{
                background: 'var(--surface-elevated)',
                border: '2px solid var(--accent-warm)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-8)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 128,
                  height: 128,
                  background: 'var(--accent-warm)',
                  opacity: 0.05,
                  borderRadius: '0 0 0 9999px',
                  pointerEvents: 'none',
                }}
                aria-hidden
              />
              <ShieldCheck
                size={48}
                style={{ color: 'var(--accent-warm)', marginBottom: 'var(--space-4)' }}
                aria-hidden
              />
              <h3
                style={{
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                The Sovereign Way (Pocket Portfolio)
              </h3>
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Pocket Portfolio processes the entire ledger strictly on-device, sending only a
                highly sanitized, stateless context string to the AI. Total intelligence, zero data
                surrender.
              </p>
            </div>
          </div>
        </section>

        {/* Three Pillars — 2x2 foundation grids */}
        <section className="py-24">
          <h2
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 'var(--space-3)',
              textAlign: 'center',
            }}
          >
            Three Pillars of Sovereignty
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-10)',
              lineHeight: 1.5,
              textAlign: 'center',
            }}
          >
            Pocket Portfolio&apos;s proof-of-concept is structured around three pillars, each with
            defined technical and governance foundations that align with the Sovereign AI
            Proof-of-Concept Grant criteria.
          </p>
          <div className="space-y-24">
            {PILLARS.map((pillar, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={pillar.title}
                  className={`flex flex-col gap-12 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center`}
                >
                  <div className="flex-1 space-y-4">
                    <h3
                      style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 700,
                        color: 'var(--accent-warm)',
                      }}
                    >
                      {pillar.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 'var(--font-size-base)',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {pillar.subhead}
                    </p>
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                    {pillar.foundations.map((f) => {
                      const Icon = f.icon;
                      return (
                        <div
                          key={f.id}
                          style={{
                            padding: 'var(--space-5)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--surface)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <Icon
                            size={24}
                            style={{ color: 'var(--accent-warm)', marginBottom: 'var(--space-3)' }}
                            aria-hidden
                          />
                          <h4
                            style={{
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 600,
                              color: 'var(--text)',
                              marginBottom: 'var(--space-2)',
                            }}
                          >
                            {f.title}
                          </h4>
                          <p
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.5,
                              margin: 0,
                            }}
                          >
                            {f.body}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Visual Architecture Flowchart — icons + Data Boundary pill */}
        <section
          id="architecture"
          className="py-24"
          style={{ scrollMarginTop: 'var(--space-8)' }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 'var(--space-8)',
              textAlign: 'center',
            }}
          >
            The Sovereign Architecture Blueprint
          </h2>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8)',
            }}
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 flex-wrap md:flex-nowrap">
              {/* User Device */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: 'var(--space-6)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  minWidth: 160,
                  width: '100%',
                  maxWidth: 264,
                }}
              >
                <Smartphone
                  size={32}
                  style={{ color: 'var(--text)', marginBottom: 'var(--space-3)' }}
                  aria-hidden
                />
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  User Device
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  IndexedDB & Zustand
                </div>
              </div>

              <ArrowDown
                className="md:hidden flex-shrink-0"
                size={24}
                style={{ color: 'var(--border-subtle)' }}
                aria-hidden
              />
              <ArrowRight
                className="hidden md:block flex-shrink-0"
                size={24}
                style={{ color: 'var(--border-subtle)' }}
                aria-hidden
              />

              {/* Context Engine */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: 'var(--space-6)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  minWidth: 160,
                  width: '100%',
                  maxWidth: 264,
                }}
              >
                <Cpu
                  size={32}
                  style={{ color: 'var(--text)', marginBottom: 'var(--space-3)' }}
                  aria-hidden
                />
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  Context Engine
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Browser execution
                </div>
              </div>

              {/* Data Boundary + Sanitized Context — width/position constrain dashed line; visibility by breakpoint via scoped CSS */}
              <style>{`
                @media (max-width: 767px) {
                  .sovereign-dashed-h { display: none !important; }
                  .sovereign-dashed-v { display: block !important; }
                }
                @media (min-width: 768px) {
                  .sovereign-dashed-h { display: block !important; }
                  .sovereign-dashed-v { display: none !important; }
                }
              `}</style>
              <div
                className="relative flex flex-col items-center justify-center flex-shrink-0"
                style={{
                  position: 'relative',
                  minHeight: 96,
                  width: 192,
                  maxWidth: '100%',
                  padding: 'var(--space-6)',
                }}
                aria-hidden
              >
                <div
                  className="sovereign-dashed-h hidden md:block"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    borderTop: '2px dashed var(--accent-warm)',
                    transform: 'translateY(-50%)',
                  }}
                />
                <div
                  className="sovereign-dashed-v md:hidden"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    borderLeft: '2px dashed var(--accent-warm)',
                    transform: 'translateX(-50%)',
                  }}
                />
                <div
                  style={{
                    background: 'var(--surface)',
                    padding: 'var(--space-1) var(--space-3)',
                    borderRadius: 9999,
                    border: '1px solid var(--accent-warm)',
                    color: 'var(--accent-warm)',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Data Boundary
                </div>
                <div
                  style={{
                    background: 'var(--bg)',
                    padding: 'var(--space-1) var(--space-2)',
                    marginTop: 'var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Sanitized Context Only
                </div>
                <ArrowRight
                  className="hidden md:block"
                  size={20}
                  style={{
                    color: 'var(--accent-warm)',
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    background: 'var(--surface)',
                  }}
                  aria-hidden
                />
                <ArrowDown
                  className="md:hidden"
                  size={20}
                  style={{
                    color: 'var(--accent-warm)',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1,
                    background: 'var(--surface)',
                  }}
                  aria-hidden
                />
              </div>

              {/* Stateless Cloud API */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: 'var(--space-6)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  minWidth: 160,
                  width: '100%',
                  maxWidth: 264,
                }}
              >
                <Cloud
                  size={32}
                  style={{ color: 'var(--text)', marginBottom: 'var(--space-3)' }}
                  aria-hidden
                />
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  Stateless Cloud API
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Zero Portfolio Storage
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grant Alignment — outcome cards + ARIA */}
        <section className="py-24 pb-12">
          <h2
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 'var(--space-8)',
            }}
          >
            Grant Alignment
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-label="Sovereign AI Grant outcomes and technical evidence"
          >
            {GRANT_ALIGNMENT.map((row) => (
              <div
                key={row.outcome}
                role="listitem"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-6)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CheckCircle
                  size={24}
                  style={{ color: 'var(--accent-warm)', marginBottom: 'var(--space-4)' }}
                  aria-hidden
                />
                <h3
                  style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: 'var(--space-2)',
                    lineHeight: 1.3,
                  }}
                >
                  {row.outcome}
                </h3>
                <p
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    margin: 0,
                    flexGrow: 1,
                  }}
                >
                  {row.evidence}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
