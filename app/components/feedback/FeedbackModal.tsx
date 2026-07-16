'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { User } from 'firebase/auth';
import { FEEDBACK_TEMPLATES } from '@/app/lib/feedback/templates';
import type {
  FeedbackCategory,
  FeedbackFriction,
  FeedbackSurface,
  FeedbackSubmissionDraft,
} from '@/app/lib/feedback/types';
import { scrubFeedbackText } from '@/app/lib/feedback/scrub';
import { SentimentScale } from './SentimentScale';

const MONO: React.CSSProperties = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
};

function kindLabel(kind: 'signal' | 'friction' | 'break'): string {
  if (kind === 'signal') return 'Signal';
  if (kind === 'friction') return 'Friction';
  return 'Break';
}

export function FeedbackModal(props: {
  open: boolean;
  onClose: () => void;
  user: User;
  surface?: FeedbackSurface;
  dashboardVisitCount?: number;
}) {
  const { open, onClose, user } = props;
  const surface: FeedbackSurface = props.surface ?? 'pocket';
  const overlayRef = useRef<HTMLDivElement>(null);

  const [rating, setRating] = useState<number>(5);
  const [friction, setFriction] = useState<FeedbackFriction>('frictionless');
  const [category, setCategory] = useState<FeedbackCategory>('signal_local_first_speed');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templateGroups = useMemo(() => {
    const groups: Record<'signal' | 'friction' | 'break', typeof FEEDBACK_TEMPLATES> = {
      signal: [],
      friction: [],
      break: [],
    };
    for (const t of FEEDBACK_TEMPLATES) groups[t.kind].push(t);
    return groups;
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const reset = () => {
    setRating(5);
    setFriction('frictionless');
    setCategory('signal_local_first_speed');
    setComment('');
    setError(null);
    setSubmitting(false);
    setSuccess(false);
  };

  useEffect(() => {
    if (!open) return;
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const applyTemplate = (id: FeedbackCategory, draft: string) => {
    setCategory(id);
    setComment((prev) => (prev?.trim().length ? prev : draft));
    if (id.startsWith('break_')) {
      setFriction('broken');
      setRating((r) => Math.min(r, 2));
    } else if (id.startsWith('friction_')) {
      setFriction('frictionless');
      setRating((r) => Math.min(r, 4));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5.');
      return;
    }
    if (!comment.trim()) {
      setError('Please add a short comment (scrubbed before submit).');
      return;
    }
    setSubmitting(true);
    try {
      const token = await user.getIdToken(true);
      const scrubbed = scrubFeedbackText(comment, { maxChars: 4000 });
      const payload: FeedbackSubmissionDraft & {
        commentScrubMeta: unknown;
        dashboardVisitCount?: number;
      } = {
        surface,
        rating,
        friction,
        category,
        comment: scrubbed.text,
        commentScrubMeta: scrubbed.meta,
        dashboardVisitCount: props.dashboardVisitCount,
      };

      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : `Request failed (${res.status})`);
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1100);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  if (typeof document === 'undefined' || !document.body) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0,0,0,0.62)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '18px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(860px, 100%)',
          maxHeight: '90vh',
          overflow: 'auto',
          borderRadius: '14px',
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 22px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div
          style={{
            padding: '18px 18px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'grid', gap: '6px' }}>
            <div id="feedback-modal-title" style={{ fontSize: '16px', fontWeight: 800, ...MONO }}>
              Feedback — adversarial harness signal
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              This is routed into the admin curation queue. Your comment is scrubbed for PII before leaving the browser.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              borderRadius: '10px',
              padding: '8px',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '16px 18px 18px', display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px', background: 'color-mix(in srgb, var(--surface) 85%, black)' }}>
              <SentimentScale
                rating={rating}
                onRatingChange={setRating}
                friction={friction}
                onFrictionChange={setFriction}
              />
            </div>

            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px', background: 'color-mix(in srgb, var(--surface) 85%, black)' }}>
              <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', ...MONO }}>
                Suggested templates (balanced)
              </div>

              {(['signal', 'friction', 'break'] as const).map((k) => (
                <div key={k} style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 750, marginBottom: '6px', color: k === 'break' ? 'var(--danger)' : 'var(--text)', ...MONO }}>
                    {kindLabel(k)}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {templateGroups[k].map((t) => {
                      const active = category === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => applyTemplate(t.id, t.draft)}
                          aria-pressed={active}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '999px',
                            border: `1px solid ${active ? 'var(--accent-warm)' : 'var(--border-subtle)'}`,
                            background: active
                              ? 'color-mix(in srgb, var(--accent-warm) 16%, var(--surface))'
                              : 'var(--surface)',
                            color: 'var(--text)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 650,
                            ...MONO,
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
              <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', ...MONO }}>
                Comment (PII-scrubbed)
              </div>
              {typeof props.dashboardVisitCount === 'number' && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', ...MONO }}>
                  dashboard visits (7d): {props.dashboardVisitCount}
                </div>
              )}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder="What broke? What did you expect? What dataset/export triggered it?"
              style={{
                marginTop: '10px',
                width: '100%',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--background)',
                color: 'var(--text)',
                padding: '12px',
                fontSize: '13px',
                lineHeight: 1.5,
                resize: 'vertical',
                ...MONO,
              }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Tip: avoid pasting raw exports. If you do, we redact ledger-like rows and identifier shapes.
            </div>
          </div>

          {error && (
            <div style={{ fontSize: '13px', color: 'var(--danger)', ...MONO }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ fontSize: '13px', color: 'var(--signal)', ...MONO }}>
              Submitted. Thank you — routed to engineering + CMS queue.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'transparent',
                color: 'var(--text)',
                cursor: 'pointer',
                fontWeight: 650,
                ...MONO,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--accent-warm)',
                background: 'var(--accent-warm)',
                color: '#0f1216',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 800,
                opacity: submitting ? 0.75 : 1,
                ...MONO,
              }}
            >
              {submitting ? 'Submitting…' : 'Submit feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

