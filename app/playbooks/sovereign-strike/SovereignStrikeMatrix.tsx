'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Crosshair,
  BrainCircuit,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Zap,
} from 'lucide-react';
import styles from './SovereignStrikeMatrix.module.css';

function AppNavLink() {
  return (
    <div className={styles.appNavRow}>
      <Link href="/dashboard" className={styles.appNavLink}>
        <ChevronLeft className={styles.iconXs} aria-hidden />
        Main app (Dashboard)
      </Link>
      <p className={styles.appNavHint}>Full navigation: fixed bar at bottom of screen</p>
    </div>
  );
}

const STORAGE_KEY = 'pp-sovereign-strike-v1';

type LevelDef = {
  id: number;
  title: string;
  bossName: string;
  target: string;
  objection: string;
  reframe: string;
  scenario: string;
  optionA: string;
  optionB: string;
  correct: 'A' | 'B';
  xp: number;
  badge: string;
  coachNote: string;
};

const LEVELS: LevelDef[] = [
  {
    id: 1,
    title: "Level 1: The CISO's Honeypot",
    bossName: "The CISO's Honeypot",
    target: 'Chief Information Security Officer (CISO)',
    objection:
      'We just spent $10M on our centralized AWS perimeter and IAM infrastructure. Distributing data to edge devices degrades our security posture. We’ve already bought the fortress.',
    reframe:
      'The enterprise has built a billion-dollar fortress around a single vault. If a credential is stolen, 100% of the data is compromised. Local-first decentralizes the blast radius. We don’t replace their perimeter; we ensure their most sensitive AI workloads never enter the centralized honeypot in the first place.',
    scenario: 'How do you respond to the CISO?',
    optionA:
      'AWS isn’t actually secure. You should move all your data off the cloud and onto our edge-compute network.',
    optionB:
      'Your AWS perimeter is excellent for cold storage. But for GenAI, we shrink your blast radius. By processing context at the edge, a hacker would need to compromise 10,000 individual devices simultaneously to achieve what one Snowflake breach did last year.',
    correct: 'B',
    xp: 100,
    badge: 'Blast Radius Reducer',
    coachNote:
      'Never attack their existing CapEx. Position our tech as the ultimate complement to their perimeter.',
  },
  {
    id: 2,
    title: 'Level 2: The Legal Liability Trap',
    bossName: 'The Legal Liability Trap',
    target: 'Chief Risk Officer (CRO)',
    objection:
      'We use Microsoft Azure and OpenAI because they have thousands of compliance lawyers. It’s safer to let them handle the risk.',
    reframe:
      'You can outsource infrastructure, but you cannot outsource liability. The EU AI Act and SEC hold the enterprise accountable for data leaks, not the hyperscaler. We shift your architecture from “Implicit Trust” (hoping Microsoft doesn’t leak your data) to Structural Guarantees.',
    scenario: 'The CRO asks how Pocket Portfolio protects them from regulatory fines.',
    optionA: 'We have better lawyers than Microsoft.',
    optionB:
      'We shift your architecture to a Structural Guarantee. Because our APIs are strictly stateless and process only a minimal, fixed-schema aggregate rather than raw ledgers, it is structurally impossible for a hyperscaler to harvest or leak your underlying data.',
    correct: 'B',
    xp: 150,
    badge: 'The Liability Shield',
    coachNote:
      'Shift the conversation from legal promises to architectural guarantees.',
  },
  {
    id: 3,
    title: "Level 3: The CTO's Migration Nightmare",
    bossName: "The CTO's Migration Nightmare",
    target: 'Chief Technology Officer (CTO)',
    objection:
      'Sovereign data sounds great, but a database migration will take two years, cost $5M, and cause massive downtime. We can’t rip-and-replace.',
    reframe:
      'We are an API abstraction layer and an edge-compute integration pattern. There is zero database migration. We integrate at the edge to reduce payload size.',
    scenario: 'The CTO wants to know the integration timeline.',
    optionA:
      'We will need to port your PostgreSQL databases into our decentralized CRDT format over the next 18 months.',
    optionB:
      'Zero migration required. Keep your existing databases. Our edge-compute patterns integrate into your client-side application to handle the parsing locally, routing only a truncated payload to our stateless API. Depending on the workload, you’ll see immediate ROI in network latency and up to a 90% reduction in API token costs.',
    correct: 'B',
    xp: 200,
    badge: 'The Seamless Integrator',
    coachNote: 'Sell the overlay, never the migration. Sell the immediate ROI.',
  },
  {
    id: 4,
    title: "Level 4: The VP of Engineering's Complexity Block",
    bossName: "The VP of Engineering's Complexity Block",
    target: 'VP of Engineering',
    objection:
      'My team builds standard microservices. They don’t know how to build decentralized identities or manage local-first state synchronization. This is too complex for my developers.',
    reframe:
      'We have explicitly defined the stateless boundary. The enterprise backend remains untouched.',
    scenario: 'How much retraining does their engineering team need?',
    optionA:
      'Your team will need to learn Rust, WebAssembly, and local-first syncing protocols to integrate our tool.',
    optionB:
      'None. Your team’s business logic stays intact. They simply change the endpoint for their AI requests from direct, stateful LLM connections to our zero-retention Sovereign API gateway. We handle the edge-compute payload reduction under the hood.',
    correct: 'B',
    xp: 250,
    badge: 'The Stateless Architect',
    coachNote: 'Abstract the complexity. Developers just want an API that works.',
  },
];

type Progress = {
  levelIndex: number;
  xp: number;
  badges: string[];
  completed: boolean;
  awaitingAdvance?: boolean;
};

function loadProgress(): Progress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Progress;
  } catch {
    return null;
  }
}

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function SovereignStrikeMatrix() {
  const totalXp = useMemo(() => LEVELS.reduce((s, l) => s + l.xp, 0), []);

  const [levelIndex, setLevelIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      setLevelIndex(Math.min(saved.levelIndex, LEVELS.length - 1));
      setXp(saved.xp);
      setBadges(saved.badges);
      setGameComplete(saved.completed);
      if (saved.awaitingAdvance && !saved.completed) {
        setFeedback('success');
      }
    }
    setHydrated(true);
  }, []);

  const level = LEVELS[levelIndex];

  const reset = () => {
    setLevelIndex(0);
    setXp(0);
    setBadges([]);
    setGameComplete(false);
    setFeedback(null);
    saveProgress({
      levelIndex: 0,
      xp: 0,
      badges: [],
      completed: false,
      awaitingAdvance: false,
    });
  };

  const handleOptionClick = (choice: 'A' | 'B') => {
    if (!level || gameComplete || feedback === 'success') return;
    if (choice === level.correct) {
      const newXp = xp + level.xp;
      const newBadges = badges.includes(level.badge) ? badges : [...badges, level.badge];
      setXp(newXp);
      setBadges(newBadges);
      setFeedback('success');
      saveProgress({
        levelIndex,
        xp: newXp,
        badges: newBadges,
        completed: false,
        awaitingAdvance: true,
      });
    } else {
      setFeedback('error');
    }
  };

  const advanceLevel = () => {
    if (!level) return;
    setFeedback(null);
    if (levelIndex >= LEVELS.length - 1) {
      setGameComplete(true);
      saveProgress({
        levelIndex: LEVELS.length,
        xp,
        badges,
        completed: true,
        awaitingAdvance: false,
      });
      return;
    }
    const next = levelIndex + 1;
    setLevelIndex(next);
    saveProgress({
      levelIndex: next,
      xp,
      badges,
      completed: false,
      awaitingAdvance: false,
    });
  };

  if (!hydrated) {
    return (
      <div className={styles.shellLoading}>
        <AppNavLink />
        <div className={styles.loadingContent}>
          <p className={styles.loadingText}>Initializing simulation…</p>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className={styles.shellVictory}>
        <AppNavLink />
        <div className={styles.loadingContent}>
        <div className={styles.victoryCard}>
          <Trophy className={styles.iconTrophy} aria-hidden />
          <h1 className={styles.victoryTitle}>Enterprise contract secured</h1>
          <p className={styles.victorySub}>
            You navigated the procurement gauntlet without surrendering architectural integrity.
          </p>
          <p className={styles.victoryXpLine}>
            Certified Sovereign Integration Specialist · {totalXp} / {totalXp} XP
          </p>
          <div className={styles.victoryBadgeSection}>
            <h3 className={styles.victoryBadgeTitle}>Badges earned</h3>
            <div className={styles.victoryBadges}>
              {badges.map((b) => (
                <span key={b} className={styles.victoryBadgePill}>
                  <ShieldCheck className={styles.iconXs} aria-hidden />
                  {b}
                </span>
              ))}
            </div>
          </div>
          <button type="button" onClick={reset} className={styles.victoryBtn}>
            Run the matrix again
          </button>
        </div>
        </div>
      </div>
    );
  }

  if (!level) {
    return null;
  }

  return (
    <div className={styles.shell}>
      <div className={styles.inner}>
        <AppNavLink />
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Sales enablement</p>
            <h1 className={styles.title}>The Sovereign Strike</h1>
            <p className={styles.subtitle}>Enterprise Objection Matrix</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.xpBlock}>
              <div className={styles.xpLabel}>Total XP</div>
              <div className={styles.xpValue}>
                {xp} <span className={styles.xpTotal}>/ {totalXp}</span>
              </div>
            </div>
            <div className={styles.dividerV} aria-hidden />
            <div className={styles.progressDots}>
              {LEVELS.map((l, idx) => (
                <div
                  key={l.id}
                  className={`${styles.progressDot} ${idx <= levelIndex ? styles.progressDotActive : ''}`}
                  title={`Level ${l.id}`}
                />
              ))}
            </div>
            <button type="button" onClick={reset} className={styles.resetBtn}>
              Reset progress
            </button>
          </div>
        </header>

        <div className={styles.mainCard}>
          <div className={styles.cardBar}>
            <span className={styles.cardBarLevel}>Level {String(level.id).padStart(2, '0')}</span>
            <span className={styles.cardBarBoss}>{level.bossName}</span>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.threatBlock}>
              <div className={styles.threatHeader}>
                <Crosshair className={styles.iconSm} aria-hidden />
                <h2 className={styles.threatTitle}>Target: {level.target}</h2>
              </div>
              <div className={styles.threatQuoteBox}>
                <p className={styles.threatQuote}>&ldquo;{level.objection}&rdquo;</p>
              </div>
            </div>

            <div className={styles.intelBlock}>
              <div className={styles.intelHeader}>
                <BrainCircuit className={styles.iconSm} aria-hidden />
                <h2 className={styles.intelTitle}>Strategic reframe (intel)</h2>
              </div>
              <div className={styles.intelBox}>
                <p className={styles.intelText}>{level.reframe}</p>
              </div>
            </div>

            <div className={styles.execZone}>
              <h3 className={styles.execTitle}>
                <Zap className={styles.iconZap} aria-hidden />
                <span>{level.scenario}</span>
              </h3>

              {!feedback ? (
                <div className={styles.optionList}>
                  <button type="button" onClick={() => handleOptionClick('A')} className={styles.optionBtn}>
                    <span className={styles.optionLetter}>A</span>
                    <span className={styles.optionText}>{level.optionA}</span>
                  </button>
                  <button type="button" onClick={() => handleOptionClick('B')} className={styles.optionBtn}>
                    <span className={styles.optionLetter}>B</span>
                    <span className={styles.optionText}>{level.optionB}</span>
                  </button>
                </div>
              ) : feedback === 'success' ? (
                <div className={styles.feedbackSuccess}>
                  <div className={styles.feedbackSuccessInner}>
                    <div className={styles.feedbackSuccessBody}>
                      <h4 className={styles.feedbackSuccessTitle}>
                        <ShieldCheck className={styles.iconMd} aria-hidden />
                        Target neutralized
                      </h4>
                      <p className={styles.feedbackLead}>Excellent strategic pivot. +{level.xp} XP earned.</p>
                      <p className={styles.feedbackCoach}>{level.coachNote}</p>
                      <div className={styles.feedbackBadge}>
                        <Trophy className={styles.iconXs} aria-hidden />
                        Badge unlocked: {level.badge}
                      </div>
                    </div>
                    <button type="button" onClick={advanceLevel} className={styles.btnNext}>
                      {levelIndex >= LEVELS.length - 1 ? 'Close the deal' : 'Next target'}
                      <ChevronRight className={styles.iconSm} aria-hidden />
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.feedbackError}>
                  <div className={styles.feedbackErrorInner}>
                    <div>
                      <h4 className={styles.feedbackErrorTitle}>
                        <ShieldAlert className={styles.iconMd} aria-hidden />
                        Tactical error
                      </h4>
                      <p className={styles.feedbackErrorText}>
                        That response triggers their CapEx defense or misstates our position. Re-read the intel and try
                        again.
                      </p>
                    </div>
                    <button type="button" onClick={() => setFeedback(null)} className={styles.btnRetry}>
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
