'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE_MB = 10;
const MAX_TOTAL_SIZE_MB = 20;

export interface SupportFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Prefill from logged-in user */
  user?: { email?: string | null; displayName?: string | null } | null;
}

export function SupportFormModal({ open, onClose, user }: SupportFormModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.displayName) setName(user.displayName);
  }, [user]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid: File[] = [];
    let totalSize = files.reduce((a, f) => a + f.size, 0);
    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    const maxTotal = MAX_TOTAL_SIZE_MB * 1024 * 1024;
    for (const f of selected) {
      if (valid.length + files.length >= MAX_ATTACHMENTS) break;
      if (f.size > maxBytes) continue;
      if (totalSize + f.size > maxTotal) continue;
      valid.push(f);
      totalSize += f.size;
    }
    setFiles((prev) => [...prev, ...valid].slice(0, MAX_ATTACHMENTS));
    setError(null);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !name.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set('email', email.trim());
      formData.set('name', name.trim());
      formData.set('subject', subject.trim());
      formData.set('message', message.trim());
      files.forEach((f) => formData.append('attachments', f));

      const res = await fetch('/api/support', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setSuccess(true);
      setEmail('');
      setName('');
      setSubject('');
      setMessage('');
      setFiles([]);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
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
      aria-labelledby="support-modal-title"
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
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          borderRadius: '12px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: '1px solid hsl(var(--border))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 id="support-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Contact Support</h2>
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

        {success ? (
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'hsl(var(--primary))', fontWeight: 500 }}>Message sent. We’ll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="support-email" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Email *</label>
              <input
                id="support-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="support-name" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Name *</label>
              <input
                id="support-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="support-subject" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Subject *</label>
              <select
                id="support-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  fontSize: '14px',
                }}
              >
                <option value="">Select...</option>
                <option value="Bug">Bug or error</option>
                <option value="Feature request">Feature request</option>
                <option value="Billing">Billing</option>
                <option value="Import / CSV">Import / CSV</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="support-message" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Message *</label>
              <textarea
                id="support-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                placeholder="Describe your issue or question..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Attachments (optional)</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.gif,.csv,.txt,.json"
                style={{ fontSize: '14px' }}
              />
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                Up to {MAX_ATTACHMENTS} files, {MAX_FILE_SIZE_MB}MB each, {MAX_TOTAL_SIZE_MB}MB total.
              </p>
              {files.length > 0 && (
                <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                  {files.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px' }}>{f.name}</span>
                      <button type="button" onClick={() => removeFile(i)} style={{ fontSize: '12px', color: 'hsl(var(--destructive))', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && (
              <p style={{ marginBottom: '16px', fontSize: '14px', color: 'hsl(var(--destructive))' }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  background: 'transparent',
                  color: 'hsl(var(--foreground))',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
