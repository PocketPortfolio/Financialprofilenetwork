'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Sparkles, Paperclip } from 'lucide-react';
import Papa from 'papaparse';
import type { User } from 'firebase/auth';
import { trackEvent } from '@/app/lib/analytics/events';

/** Renders assistant message content as Markdown (bold, lists, links). */
function AssistantMessageContent({ content }: { content: string }) {
  if (!content.trim()) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--warning)', textDecoration: 'underline' }}>
            {children}
          </a>
        ),
        strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
        ul: ({ children }) => <ul style={{ margin: '6px 0', paddingLeft: '20px' }}>{children}</ul>,
        ol: ({ children }) => <ol style={{ margin: '6px 0', paddingLeft: '20px' }}>{children}</ol>,
        li: ({ children }) => <li style={{ marginBottom: '2px' }}>{children}</li>,
        p: ({ children }) => <span style={{ display: 'block', marginBottom: '6px' }}>{children}</span>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export interface AskAIModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  /** Portfolio context string from buildPortfolioContext() */
  portfolioContext: string;
  /** Whether user is on paid tier (Founder's / Corporate) for attachments */
  isPaid?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AskAIModal({
  open,
  onClose,
  user,
  portfolioContext,
  isPaid = false,
}: AskAIModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number | null } | null>(null);
  const [attachedContent, setAttachedContent] = useState('');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [showQuotaExceededModal, setShowQuotaExceededModal] = useState(false);
  const [showAttachmentUpsellModal, setShowAttachmentUpsellModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const FOUNDERS_CLUB_PRICE_ID =
    process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB || 'price_1TAWCxD4sftWa1WtEZtg2Oli';

  const handleQuotaUpgradeToStripe = async () => {
    if (!FOUNDERS_CLUB_PRICE_ID || FOUNDERS_CLUB_PRICE_ID.includes('XXXXX')) {
      setError('Checkout not configured. Please visit /sponsor to upgrade.');
      return;
    }
    setCheckoutLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: FOUNDERS_CLUB_PRICE_ID,
          tierName: "UK Founder's Club",
          email: user?.email ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Checkout failed (${res.status})`);
      if (data.url) {
        trackEvent('quota_upgrade_initiated');
        window.location.href = data.url;
        return;
      }
      if (data.sessionId) {
        trackEvent('quota_upgrade_initiated');
        window.location.href = `https://checkout.stripe.com/c/pay/${data.sessionId}`;
        return;
      }
      throw new Error('No checkout URL returned');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      if (isCsv) {
        const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
        const asText = parsed.data
          .map((row) => (Array.isArray(row) ? row.join(', ') : String(row)))
          .join('\n');
        setAttachedContent(asText.slice(0, 50000));
      } else {
        setAttachedContent(text.slice(0, 50000));
      }
      setAttachedFileName(file.name);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setShowQuotaExceededModal(false);
      setShowAttachmentUpsellModal(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Fetch usage for quota badge when modal opens and user is present
  useEffect(() => {
    if (!open || !user || isPaid) {
      setUsage(null);
      return;
    }
    let cancelled = false;
    user.getIdToken().then((token) => {
      if (cancelled) return;
      fetch('/api/ai/usage', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          if (data.unlimited) setUsage({ used: 0, limit: null });
          else setUsage({ used: data.used ?? 0, limit: data.limit ?? 20 });
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [open, user, isPaid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !user || isLoading) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          context: portfolioContext,
          ...(attachedContent ? { attachedContent } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setShowQuotaExceededModal(true);
          setError(data.error || "You've used your monthly questions. Upgrade for unlimited.");
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setIsLoading(false);
          return;
        }
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');

      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: full } : m
          )
        );
      }

      // Refresh usage after successful request (free tier)
      if (!isPaid && user) {
        user.getIdToken().then((t) => {
          fetch('/api/ai/usage', { headers: { Authorization: `Bearer ${t}` } })
            .then((r) => r.json())
            .then((d) => {
              if (!d.unlimited) setUsage({ used: d.used ?? 0, limit: d.limit ?? 20 });
            })
            .catch(() => {});
        });
      }
      // Keep attachment for follow-up messages until user removes it
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;
  if (typeof document === 'undefined' || !document.body) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-ai-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          position: 'relative',
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          borderRadius: '12px',
          maxWidth: '520px',
          width: '100%',
          height: '85vh',
          maxHeight: '640px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: '1px solid hsl(var(--border))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid hsl(var(--border))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: 'var(--warning)' }} />
            <h2 id="ask-ai-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              Pocket Analyst
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {usage !== null && usage.limit !== null && (
              <span
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  background: 'hsl(var(--muted))',
                  color: 'hsl(var(--muted-foreground))',
                }}
              >
                {usage.used}/{usage.limit} this month
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.length === 0 && (
            <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
              Ask about your portfolio, markets, or investing. Your data stays local; only a summary is sent to the AI.
            </p>
          )}
          {messages.map((m) => {
            if (m.role === 'assistant' && !m.content && isLoading) return null;
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: m.role === 'user' ? 'var(--warning)' : 'hsl(var(--muted))',
                  color: m.role === 'user' ? '#000' : 'hsl(var(--foreground))',
                  fontSize: '14px',
                  wordBreak: 'break-word',
                  ...(m.role === 'assistant' ? {} : { whiteSpace: 'pre-wrap' }),
                }}
              >
                {m.role === 'user'
                  ? m.content
                  : m.content
                    ? <AssistantMessageContent content={m.content} />
                    : null}
              </div>
            );
          })}
          {isLoading && (
            <>
              <style>{`@keyframes pocket-analyst-pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }`}</style>
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'hsl(var(--muted))',
                  border: '1px dashed hsl(var(--border))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'hsl(var(--muted-foreground))',
                }}
                aria-live="polite"
                aria-busy="true"
              >
                <Sparkles size={16} style={{ color: 'var(--warning)', flexShrink: 0, animation: 'pocket-analyst-pulse 1.2s ease-in-out infinite' }} />
                <span>Pocket Analyst is thinking…</span>
              </div>
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: '16px',
            borderTop: '1px solid hsl(var(--border))',
            flexShrink: 0,
          }}
        >
          {error && (
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'hsl(var(--destructive))' }}>
              {error}
            </p>
          )}
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {isPaid && (
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                onChange={handleFileAttach}
                style={{ display: 'none' }}
              />
            )}
            <button
              type="button"
              onClick={() => {
                if (isPaid) fileInputRef.current?.click();
                else setShowAttachmentUpsellModal(true);
              }}
              aria-label="Add file"
              style={{
                padding: '6px 10px',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                background: 'hsl(var(--muted))',
                color: 'hsl(var(--foreground))',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
              }}
            >
              <Paperclip size={14} />
              Add file (CSV or text)
            </button>
            {isPaid && attachedFileName && (
              <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {attachedFileName}
                <button
                  type="button"
                  onClick={() => { setAttachedContent(''); setAttachedFileName(null); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'hsl(var(--destructive))', fontSize: '12px' }}
                >
                  Remove
                </button>
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your portfolio or markets..."
              rows={1}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                fontSize: '14px',
                resize: 'none',
                minHeight: '44px',
                maxHeight: '120px',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--warning)',
                color: '#000',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !input.trim() ? 0.7 : 1,
              }}
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </form>

        {showQuotaExceededModal && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '12px',
              background: 'var(--surface)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '340px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                Monthly limit reached
              </p>
              <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                You've used your 20 questions this month. Unlock unlimited Pocket Analyst with Founder's Club.
              </p>
              <ul
                style={{
                  margin: '0 0 20px',
                  padding: '0 0 0 20px',
                  textAlign: 'left',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                <li style={{ marginBottom: '6px' }}>
                  <strong style={{ color: 'var(--accent-warm)' }}>Unlimited AI Context</strong> — no monthly cap
                </li>
                <li style={{ marginBottom: '6px' }}>
                  <strong style={{ color: 'var(--accent-warm)' }}>CSV File Attachments</strong> — ask about your statements
                </li>
              </ul>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleQuotaUpgradeToStripe}
                  disabled={checkoutLoading}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    background: 'var(--accent-warm)',
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: checkoutLoading ? 'wait' : 'pointer',
                    opacity: checkoutLoading ? 0.85 : 1,
                  }}
                >
                  {checkoutLoading ? 'Taking you to checkout…' : "Upgrade Now — Founder's Club £100/yr or £12/mo"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowQuotaExceededModal(false); setError(null); }}
                  style={{
                    padding: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Maybe later
                </button>
              </div>
              {error && (
                <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'var(--danger)' }}>{error}</p>
              )}
            </div>
          </div>
        )}

        {showAttachmentUpsellModal && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '12px',
              background: 'hsl(var(--card))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '320px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600 }}>
                Attach files
              </p>
              <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
                Upgrade to Founder's Club or Corporate to attach CSV or text files to your questions.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href="/sponsor?utm_source=pocket_analyst&utm_medium=attachment_upsell&utm_campaign=founders_club"
                  style={{
                    display: 'block',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    background: 'var(--warning)',
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    textAlign: 'center',
                  }}
                >
                  Upgrade to Founder's Club or Corporate
                </a>
                <button
                  type="button"
                  onClick={() => setShowAttachmentUpsellModal(false)}
                  style={{
                    padding: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'hsl(var(--muted-foreground))',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
