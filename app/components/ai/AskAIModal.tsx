'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Sparkles, Paperclip } from 'lucide-react';
import Papa from 'papaparse';
import type { User } from 'firebase/auth';
import { startFoundersClubCheckout } from '@/app/lib/checkout/startFoundersClubCheckout';
import { trackEvent, trackPaywallImpression } from '@/app/lib/analytics/events';
import { LocalProcessingTerminal } from '@/app/components/LocalProcessingTerminal';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

const ATTACHMENT_MAX_CHARS = 50000;

type PendingAttachment = { content: string; fileName: string; dataRowCount: number };

function buildAiAttachmentFromCsv(text: string, fileName: string): PendingAttachment {
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
  const rows = parsed.data.filter(
    (r) => Array.isArray(r) && r.some((c) => String(c).trim() !== '')
  );
  if (rows.length === 0) {
    throw new Error('CSV has no usable rows');
  }
  const headerCells = (rows[0] as string[]).map((c) => String(c).trim().toLowerCase());
  const bodyRows = rows.slice(1).map((row) =>
    Array.isArray(row) ? row.map((c) => String(c).trim()) : [String(row)]
  );
  const normalizedRows = [headerCells, ...bodyRows];
  const asText = normalizedRows
    .map((row) => (Array.isArray(row) ? row.join(', ') : String(row)))
    .join('\n');
  /** Data rows after treating row 0 as header; 0 if only a header line exists. */
  const dataRowCount = Math.max(0, rows.length - 1);
  return {
    content: asText.slice(0, ATTACHMENT_MAX_CHARS),
    fileName,
    dataRowCount,
  };
}

function buildAiAttachmentFromPlainText(text: string, fileName: string): PendingAttachment {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  return {
    content: text.slice(0, ATTACHMENT_MAX_CHARS),
    fileName,
    dataRowCount: lines.length,
  };
}

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
  const { signInWithGoogle, loading: authLoading } = useAuth();
  const [signInBusy, setSignInBusy] = useState(false);
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
  const [attachmentProcessing, setAttachmentProcessing] = useState(false);
  const [attachmentTerminalActive, setAttachmentTerminalActive] = useState(false);
  const [attachmentUpsellRowCount, setAttachmentUpsellRowCount] = useState<number | null>(null);
  const pendingAttachRef = useRef<PendingAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const launchCheckoutFromTrigger = async (
    triggerSource: 'ai_file_attachment_attempt' | 'sponsor_page_direct'
  ) => {
    setCheckoutLoading(true);
    setError(null);
    try {
      await startFoundersClubCheckout({
        email: user?.email ?? undefined,
        triggerSource,
        utm_source: triggerSource === 'ai_file_attachment_attempt' ? 'pocket_analyst' : 'direct',
        utm_medium: triggerSource === 'ai_file_attachment_attempt' ? 'attachment_upsell' : 'checkout',
        utm_campaign: 'intent_trigger',
        utm_content: triggerSource,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleQuotaUpgradeToStripe = async () => {
    trackEvent('quota_upgrade_initiated');
    trackPaywallImpression('ai_file_attachment_attempt');
    await launchCheckoutFromTrigger('ai_file_attachment_attempt');
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const finishAttachmentTheater = useCallback(() => {
    const pending = pendingAttachRef.current;
    if (!pending) return;
    pendingAttachRef.current = null;
    setAttachmentTerminalActive(false);
    setAttachmentProcessing(false);
    if (isPaid) {
      setAttachedContent(pending.content);
      setAttachedFileName(pending.fileName);
    } else {
      setAttachmentUpsellRowCount(pending.dataRowCount);
      trackPaywallImpression('ai_file_attachment_attempt');
      setShowAttachmentUpsellModal(true);
    }
  }, [isPaid]);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
    setError(null);
    setAttachmentProcessing(true);
    setAttachmentTerminalActive(false);
    pendingAttachRef.current = null;

    const reader = new FileReader();
    reader.onerror = () => {
      setError('Could not read file.');
      setAttachmentProcessing(false);
      setAttachmentTerminalActive(false);
    };
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const pending: PendingAttachment = isCsv
          ? buildAiAttachmentFromCsv(text, file.name)
          : buildAiAttachmentFromPlainText(text, file.name);
        pendingAttachRef.current = pending;
        setAttachmentTerminalActive(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not parse file.');
        setAttachmentProcessing(false);
        setAttachmentTerminalActive(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setError(null);
      setSignInBusy(false);
      setShowQuotaExceededModal(false);
      setShowAttachmentUpsellModal(false);
      setAttachmentProcessing(false);
      setAttachmentTerminalActive(false);
      setAttachmentUpsellRowCount(null);
      pendingAttachRef.current = null;
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
        // Prevent infinite "thinking..." when network hangs; surfaces a concrete error instead.
        signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? (AbortSignal as any).timeout(20000) : undefined,
        body: JSON.stringify({
          message: text,
          context: portfolioContext,
          ...(isPaid && attachedContent ? { attachedContent } : {}),
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

        {user ? (
          <>
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
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {error && (
                <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'hsl(var(--destructive))' }}>
                  {error}
                </p>
              )}
              <LocalProcessingTerminal
                active={attachmentTerminalActive}
                onSequenceComplete={finishAttachmentTheater}
                style={{ marginBottom: '10px' }}
              />
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,text/csv,text/plain"
                  onChange={handleFileAttach}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    trackEvent('ai_attachment_button_click', { is_paid: Boolean(isPaid) });
                    fileInputRef.current?.click();
                  }}
                  disabled={attachmentProcessing || isLoading}
                  aria-label="Add file"
                  style={{
                    padding: '6px 10px',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    background: 'hsl(var(--muted))',
                    color: 'hsl(var(--foreground))',
                    cursor: attachmentProcessing || isLoading ? 'not-allowed' : 'pointer',
                    opacity: attachmentProcessing || isLoading ? 0.7 : 1,
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
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'stretch',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your portfolio or markets..."
                  rows={1}
                  disabled={isLoading || attachmentProcessing}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    fontSize: '14px',
                    resize: 'none',
                    minHeight: '44px',
                    maxHeight: '120px',
                    alignSelf: 'stretch',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || attachmentProcessing || !input.trim()}
                  style={{
                    flexShrink: 0,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--warning)',
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isLoading || attachmentProcessing || !input.trim() ? 'not-allowed' : 'pointer',
                    opacity: isLoading || attachmentProcessing || !input.trim() ? 0.7 : 1,
                    minHeight: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'stretch',
                    boxSizing: 'border-box',
                  }}
                >
                  {isLoading ? '...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px 16px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', margin: 0, lineHeight: 1.5 }}>
              Sign in with Google to use Pocket Analyst on your portfolio. Your holdings stay on your device; we only send a short summary to the model. New accounts get free monthly questions.
            </p>
            {error && (
              <p style={{ margin: 0, fontSize: '13px', color: 'hsl(var(--destructive))' }}>{error}</p>
            )}
            <button
              type="button"
              onClick={async () => {
                setSignInBusy(true);
                setError(null);
                try {
                  await signInWithGoogle();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Sign-in failed');
                } finally {
                  setSignInBusy(false);
                }
              }}
              disabled={signInBusy || authLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px 18px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--warning)',
                color: '#000',
                fontSize: '14px',
                fontWeight: 600,
                cursor: signInBusy || authLoading ? 'not-allowed' : 'pointer',
                opacity: signInBusy || authLoading ? 0.75 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {signInBusy || authLoading ? 'Signing in…' : 'Sign in with Google'}
            </button>
          </div>
        )}

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
                <Link
                  href="/invite?utm_source=pocket_analyst&utm_medium=quota_modal&utm_campaign=viral_moment_v1"
                  onClick={() => { setShowQuotaExceededModal(false); setError(null); }}
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--accent-warm)',
                    textDecoration: 'underline',
                    textAlign: 'center',
                  }}
                >
                  Don&apos;t pay yet — invite 1 friend, unlock 7 days Founders Club
                </Link>
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
            <div style={{ textAlign: 'center', maxWidth: '340px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600 }}>
                Deep document reasoning (Pro)
              </p>
              <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>
                {attachmentUpsellRowCount !== null
                  ? `${attachmentUpsellRowCount.toLocaleString()} row${attachmentUpsellRowCount === 1 ? '' : 's'} normalized locally. Your data stays at the edge; Founders Club unlocks Pocket Analyst on this payload.`
                  : 'Your data stays at the edge; Founders Club or Corporate unlocks Pocket Analyst on file attachments.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={() => {
                    void launchCheckoutFromTrigger('ai_file_attachment_attempt');
                  }}
                  style={{
                    display: 'block',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    background: 'var(--accent-warm)',
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    textAlign: 'center',
                    border: 'none',
                    width: '100%',
                    cursor: checkoutLoading ? 'wait' : 'pointer',
                    opacity: checkoutLoading ? 0.85 : 1,
                  }}
                >
                  {checkoutLoading ? 'Taking you to checkout…' : "Unlock Founder's Club or Corporate"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachmentUpsellModal(false);
                    setAttachmentUpsellRowCount(null);
                    setError(null);
                  }}
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
                <Link
                  href="/invite?utm_source=pocket_analyst&utm_medium=attachment_upsell&utm_campaign=viral_moment_v1"
                  onClick={() => {
                    setShowAttachmentUpsellModal(false);
                    setAttachmentUpsellRowCount(null);
                    setError(null);
                  }}
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--accent-warm)',
                    textDecoration: 'underline',
                    textAlign: 'center',
                  }}
                >
                  Invite 1 friend — 7 days Sovereign AI + attachments
                </Link>
              </div>
              {error && (
                <p style={{ margin: '14px 0 0', fontSize: '12px', color: 'hsl(var(--destructive))', lineHeight: 1.45 }}>
                  {error}
                </p>
              )}
              <p style={{ margin: error ? '8px 0 0' : '14px 0 0', fontSize: '11px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.4 }}>
                Trouble opening checkout?{' '}
                <a
                  href="/sponsor?utm_source=pocket_analyst&utm_medium=attachment_upsell&utm_campaign=checkout_fallback"
                  style={{ color: 'var(--warning)', textDecoration: 'underline' }}
                >
                  Open the sponsor page
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
