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
import styles from '../playbooks/sovereign-strike/SovereignStrikeMatrix.module.css';
import extra from './ArchitectureChallengeExtras.module.css';

function AppNavLink() {
  return (
    <div className={styles.appNavRow}>
      <Link href="/book" className={styles.appNavLink}>
        <ChevronLeft className={styles.iconXs} aria-hidden />
        Books &amp; resources
      </Link>
      <p className={styles.appNavHint}>Tab navigation lives at the bottom of the app</p>
    </div>
  );
}

const STORAGE_KEY = 'pp-architecture-challenge-v1';

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
    title: 'Level 1: The Ingestion Trap',
    bossName: 'The Ingestion Trap',
    target: '10 MB proprietary CSV',
    objection:
      'You need reliable schema mapping before any downstream AI step. The fastest path looks like letting the model read the whole file end-to-end.',
    reframe:
      'Frontier inference should not ingest bulk exports. Truncate at the trust boundary: headers plus a few rows are enough for structural hints; the rest never crosses the wire.',
    scenario: 'How do you parse and prepare the file?',
    optionA:
      'Upload the entire CSV to the LLM API so it can infer types and column roles from full row diversity.',
    optionB:
      'Slice the first ~2 KB locally (browser or edge) and send only headers and a handful of rows; keep the 10 MB file out of cloud inference.',
    correct: 'B',
    xp: 100,
    badge: 'Truncated Payload',
    coachNote: 'Same idea as Pocket’s import path: constructive reduction before any network call.',
  },
  {
    id: 2,
    title: 'Level 2: The RAG Dilemma',
    bossName: 'The RAG Dilemma',
    target: 'Context for the model',
    objection:
      'Classic RAG says: sync documents into a centralized vector database so the retriever can feed the LLM.',
    reframe:
      'For sovereign workloads, the aggregate can be built as a pure client-side transform into a fixed schema—no raw ledger in a shared vector store.',
    scenario: 'The model needs grounded context. What do you sync?',
    optionA: 'Replicate the raw ledger into a cloud vector database attached to the LLM stack.',
    optionB:
      'Use a client-side pure function to derive a minimal, fixed-schema aggregate from local data; send only that summary upstream.',
    correct: 'B',
    xp: 150,
    badge: 'Sanitization by Construction',
    coachNote: 'Structural shape is enforced before egress—smaller blast radius than “trust the vector DB ACLs.”',
  },
  {
    id: 3,
    title: 'Level 3: The Execution Layer',
    bossName: 'The Execution Layer',
    target: 'Inference-time data handling',
    objection:
      'We have an enterprise agreement with the model vendor—legal says we are covered if something leaks.',
    reframe:
      'Contracts manage liability; architecture manages possibility. A stateless gateway with no persistence path for payloads is a different class of guarantee than policy text.',
    scenario: 'How do you minimize leakage during inference?',
    optionA: 'Rely on the vendor’s enterprise terms and shared responsibility model.',
    optionB:
      'Route requests through a custom stateless API: inject context, run inference, drop the payload—no database writes, no retention path in your control plane.',
    correct: 'B',
    xp: 200,
    badge: 'Structural Guarantees',
    coachNote: 'Pair legal coverage with a system that cannot become a honeypot by design.',
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

export function ArchitectureChallengeMatrix() {
  const totalXp = useMemo(() => LEVELS.reduce((s, l) => s + l.xp, 0), []);

  const [levelIndex, setLevelIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [leadMessage, setLeadMessage] = useState('');

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
    setLeadEmail('');
    setLeadStatus('idle');
    setLeadMessage('');
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

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!leadEmail.trim() || leadStatus === 'loading') return;
    setLeadStatus('loading');
    setLeadMessage('');
    try {
      const res = await fetch('/api/challenge/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: leadEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLeadStatus('error');
        setLeadMessage(typeof data.error === 'string' ? data.error : 'Request failed');
        return;
      }
      setLeadStatus('success');
      setLeadMessage(typeof data.message === 'string' ? data.message : 'You are in.');
    } catch {
      setLeadStatus('error');
      setLeadMessage('Network error. Try again.');
    }
  }

  if (!hydrated) {
    return (
      <div className={styles.shellLoading}>
        <AppNavLink />
        <div className={styles.loadingContent}>
          <p className={styles.loadingText}>Loading challenge…</p>
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
            <h1 className={styles.victoryTitle}>Sovereign architecture verified</h1>
            <p className={styles.victorySub}>
              You kept bulk data local, used constructive aggregates, and chose a stateless execution boundary—without
              treating legal terms as the whole security model.
            </p>
            <p className={styles.victoryXpLine}>
              Zero-Trust Design Challenge · {totalXp} / {totalXp} XP
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

            {leadStatus === 'success' ? (
              <p className={extra.emailSuccess}>{leadMessage}</p>
            ) : (
              <form className={extra.emailForm} onSubmit={submitLead}>
                <label className={extra.emailLabel} htmlFor="challenge-email">
                  Enter your work email
                </label>
                <input
                  id="challenge-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={extra.emailInput}
                  placeholder="you@company.com"
                  value={leadEmail}
                  onChange={(ev) => setLeadEmail(ev.target.value)}
                  disabled={leadStatus === 'loading'}
                />
                <button type="submit" className={extra.emailSubmit} disabled={leadStatus === 'loading'}>
                  {leadStatus === 'loading' ? 'Sending…' : 'Send me the technical blueprint & join link'}
                </button>
                <p className={extra.emailFinePrint}>
                  We’ll email you links to our Technical Press title on sovereign intelligence and the product join flow.
                  No spam; one-time follow-up is OK for enterprise pilots.
                </p>
                {leadStatus === 'error' ? <p className={extra.emailError}>{leadMessage}</p> : null}
              </form>
            )}

            <button type="button" onClick={reset} className={styles.victoryBtn} style={{ marginTop: '1.5rem' }}>
              Run the challenge again
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
            <p className={styles.kicker}>Public · Zero-trust</p>
            <h1 className={styles.title}>Architecture Challenge</h1>
            <p className={styles.subtitle}>Move the AI to the data—not the data to the AI</p>
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
                <h2 className={styles.threatTitle}>Constraint: {level.target}</h2>
              </div>
              <div className={styles.threatQuoteBox}>
                <p className={styles.threatQuote}>&ldquo;{level.objection}&rdquo;</p>
              </div>
            </div>

            <div className={styles.intelBlock}>
              <div className={styles.intelHeader}>
                <BrainCircuit className={styles.iconSm} aria-hidden />
                <h2 className={styles.intelTitle}>Architecture lens</h2>
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
                        Correct — pipeline choice
                      </h4>
                      <p className={styles.feedbackLead}>+{level.xp} XP · {level.badge}</p>
                      <p className={styles.feedbackCoach}>{level.coachNote}</p>
                      <div className={styles.feedbackBadge}>
                        <Trophy className={styles.iconXs} aria-hidden />
                        Badge: {level.badge}
                      </div>
                    </div>
                    <button type="button" onClick={advanceLevel} className={styles.btnNext}>
                      {levelIndex >= LEVELS.length - 1 ? 'Verify architecture' : 'Next level'}
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
                        Higher blast radius
                      </h4>
                      <p className={styles.feedbackErrorText}>
                        That path expands what crosses the trust boundary or leans on policy instead of structure.
                        Re-read the architecture lens and try again.
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
