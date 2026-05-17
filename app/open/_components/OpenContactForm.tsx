'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OPEN_LANDING_COPY } from '../../../lib/canonical-claims';

/**
 * OpenContactForm — top-of-funnel B2B capture for the Open Portfolio landing.
 *
 * Posts to POST /api/open-portfolio/contact which persists to Firestore and
 * surfaces in /admin/analytics via the openPortfolioContactLeads aggregator.
 * Local-first principle preserved: no third-party form provider, no client
 * tracking script, no embedded marketing pixel.
 */

const CONTEXT_OPTIONS = [
  { value: 'tier1', label: 'Tier 1 / clean-room partnership' },
  { value: 'design-challenge', label: 'Design Challenge submission' },
  { value: 'investor', label: 'Investor / BIP' },
  { value: 'grant', label: 'Sovereign AI Grant' },
  { value: 'general', label: 'General inquiry' },
] as const;

type ContextValue = (typeof CONTEXT_OPTIONS)[number]['value'];
type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function OpenContactForm() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [context, setContext] = useState<ContextValue>('tier1');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/open-portfolio/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, role, context, message }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Submission failed.');
      }
      setStatus('success');
      setEmail('');
      setCompany('');
      setRole('');
      setMessage('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--bg)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '6px',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: 'clamp(24px, 4vw, 36px)',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: 'center', padding: '24px 0' }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid var(--accent-warm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-warm)',
                fontSize: '28px',
                fontWeight: 700,
              }}
            >
              ✓
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>
              Briefing request received.
            </h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px' }}>
              We reply within one working day. Routed to the Tier 1 funnel and visible to the
              substrate team via <code style={{ fontFamily: 'ui-monospace', fontSize: '13px' }}>/admin/analytics</code>.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={false}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <label htmlFor="op-email" style={labelStyle}>
                  Work email *
                </label>
                <input
                  id="op-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cto@example.com"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-warm)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.18)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label htmlFor="op-context" style={labelStyle}>
                  I am here about
                </label>
                <select
                  id="op-context"
                  value={context}
                  onChange={(e) => setContext(e.target.value as ContextValue)}
                  style={{ ...inputStyle, appearance: 'auto' }}
                >
                  {CONTEXT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <label htmlFor="op-company" style={labelStyle}>
                  Company / org
                </label>
                <input
                  id="op-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Optional"
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="op-role" style={labelStyle}>
                  Role
                </label>
                <input
                  id="op-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="CTO, Head of Platform, etc."
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label htmlFor="op-message" style={labelStyle}>
                The audit-perimeter problem you are solving *
              </label>
              <textarea
                id="op-message"
                required
                rows={5}
                minLength={8}
                maxLength={4000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Auditor, jurisdiction, data residency mandate, stack constraints — anything that helps us reply with substance."
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(248, 113, 113, 0.08)',
                  border: '1px solid rgba(248, 113, 113, 0.35)',
                  borderRadius: '6px',
                  color: '#fca5a5',
                  fontSize: '13px',
                }}
              >
                {errorMsg}
              </motion.div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  maxWidth: '380px',
                }}
              >
                Submissions persist to a private Firestore collection and surface in
                <code style={{ fontFamily: 'ui-monospace', fontSize: '12px', margin: '0 4px' }}>
                  /admin/analytics
                </code>
                only. No third-party form provider.
              </p>
              <motion.button
                type="submit"
                disabled={status === 'submitting'}
                whileHover={{ scale: status === 'submitting' ? 1 : 1.03 }}
                whileTap={{ scale: status === 'submitting' ? 1 : 0.97 }}
                style={{
                  padding: '12px 22px',
                  background: 'var(--accent-warm)',
                  color: '#0b0d10',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                  opacity: status === 'submitting' ? 0.7 : 1,
                  letterSpacing: '0.02em',
                }}
              >
                {status === 'submitting' ? 'Sending…' : OPEN_LANDING_COPY.contact.submitLabel}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
