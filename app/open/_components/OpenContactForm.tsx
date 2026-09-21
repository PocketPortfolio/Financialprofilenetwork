'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/app/lib/analytics/events';
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
  { value: 'design-partner', label: 'Design-partner diligence' },
  { value: 'architecture-review', label: 'Architecture / security review' },
  { value: 'sdk-embed', label: 'SDK / ingestion embed' },
  { value: 'general', label: 'General inquiry' },
] as const;

type ContextValue = (typeof CONTEXT_OPTIONS)[number]['value'];
type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function OpenContactForm() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [context, setContext] = useState<ContextValue>('design-partner');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formStarted, setFormStarted] = useState(false);

  const markStarted = () => {
    if (formStarted) return;
    setFormStarted(true);
    trackEvent('homepage_form_started');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/open-portfolio/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          company,
          role,
          context,
          message,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Submission failed.');
      }
      trackEvent('homepage_form_submitted', { context });
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
    border: '1px solid rgba(245, 158, 11, 0.22)',
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
    color: 'rgba(232, 236, 243, 0.72)',
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
        border: '1px solid rgba(245, 158, 11, 0.45)',
        borderLeft: '3px solid var(--accent-warm)',
        borderRadius: '12px',
        padding: 'clamp(24px, 4vw, 36px)',
        maxWidth: '720px',
        margin: '0 auto',
        boxShadow:
          '0 24px 64px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(245, 158, 11, 0.12) inset',
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
              {OPEN_LANDING_COPY.contact.successTitle}
            </h3>
            <p style={{ color: 'rgba(232, 236, 243, 0.82)', margin: 0, fontSize: '15px' }}>
              {OPEN_LANDING_COPY.contact.successBody}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={false}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
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
                onFocus={markStarted}
                placeholder="cto@example.com"
                style={inputStyle}
              />
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
                  Company / organization *
                </label>
                <input
                  id="op-company"
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  onFocus={markStarted}
                  placeholder="Wealth platform / aggregator"
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="op-role" style={labelStyle}>
                  Role *
                </label>
                <input
                  id="op-role"
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onFocus={markStarted}
                  placeholder="CTO, CISO, Head of Platform…"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label htmlFor="op-context" style={labelStyle}>
                I am here about
              </label>
              <select
                id="op-context"
                value={context}
                onChange={(e) => setContext(e.target.value as ContextValue)}
                onFocus={markStarted}
                style={{ ...inputStyle, appearance: 'auto' }}
              >
                {CONTEXT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="op-message" style={labelStyle}>
                {OPEN_LANDING_COPY.contact.perimeterLabel} *
              </label>
              <textarea
                id="op-message"
                required
                rows={4}
                minLength={8}
                maxLength={4000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={markStarted}
                placeholder={OPEN_LANDING_COPY.contact.perimeterPlaceholder}
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
                  color: 'rgba(232, 236, 243, 0.72)',
                  margin: 0,
                  maxWidth: '380px',
                }}
              >
                Submissions are stored privately on Open Portfolio infrastructure. No third-party
                form provider or marketing pixel.
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
