'use client';

import React, { useState } from 'react';
import { OptimizedTooltip } from '@/app/components/shared/OptimizedTooltip';

interface LeadDetails {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string;
  jobTitle: string | null;
  score: number;
  status: string;
  techStackTags: string[];
  researchSummary: string | null;
  researchData: any;
  latestReasoning: string | null;
  conversations: Array<{
    id: string;
    type: string;
    subject: string | null;
    body: string;
    aiReasoning: string | null;
    direction: string;
    createdAt: string;
    emailId?: string | null;
    threadId?: string | null;
  }>;
}

interface LeadDetailsDrawerProps {
  lead: LeadDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDetailsDrawer({ lead, isOpen, onClose }: LeadDetailsDrawerProps) {
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [rawViewEmails, setRawViewEmails] = useState<Set<string>>(new Set());

  if (!isOpen || !lead) return null;

  const toggleEmail = (emailId: string) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(emailId)) {
      newExpanded.delete(emailId);
    } else {
      newExpanded.add(emailId);
    }
    setExpandedEmails(newExpanded);
  };

  const toggleRawView = (emailId: string) => {
    const newRaw = new Set(rawViewEmails);
    if (newRaw.has(emailId)) {
      newRaw.delete(emailId);
    } else {
      newRaw.add(emailId);
    }
    setRawViewEmails(newRaw);
  };

  const getConversationUrl = (emailId: string | null | undefined, threadId: string | null | undefined) => {
    if (emailId) {
      return `https://resend.com/emails/${emailId}`;
    }
    return null;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="drawer-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        }}
      />
      
      {/* Drawer */}
      <div
        className="drawer brand-card brand-surface-elevated"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(800px, 90vw)',
          maxWidth: '800px',
          zIndex: 1001,
          overflowY: 'auto',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ margin: 0, color: 'var(--text)', fontSize: 'var(--font-size-xl)' }}>
            Lead Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-xl)',
              cursor: 'pointer',
              padding: 'var(--space-2)',
            }}
          >
            ×
          </button>
        </div>

        {/* Company Info */}
        <div className="brand-card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
          <h3 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--text)', fontSize: 'var(--font-size-lg)' }}>
            {lead.companyName}
          </h3>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            <div>{lead.email}</div>
            {lead.jobTitle && <div>{lead.jobTitle}</div>}
            {lead.firstName && <div>{lead.firstName} {lead.lastName}</div>}
          </div>
        </div>

        {/* Confidence Score */}
        <div className="brand-card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--text)', fontWeight: 'var(--font-semibold)' }}>Confidence Score</span>
              <OptimizedTooltip
                content={`Confidence Score Calculation (0-100 points):

• Tech Stack Match (40 pts)
  Matches against: React, Next.js, TypeScript, Node.js
  Formula: (matches / 4) × 40

• Company Size (20 pts)
  10-500 employees: 20 pts
  Outside range: 10 pts

• Recent Engineering Hires (20 pts)
  5 pts per hire, max 20 pts

• Funding Stage (20 pts)
  Series A: 20 | Series B: 18 | Series C: 15
  Seed: 10 | Other: 5

Score is calculated automatically during lead enrichment.`}
                placement="bottom"
                maxWidth={400}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--font-size-xs)',
                    cursor: 'help',
                    fontWeight: 'bold',
                  }}
                >
                  ?
                </span>
              </OptimizedTooltip>
            </div>
            <span style={{ color: 'var(--text)', fontWeight: 'var(--font-bold)' }}>{lead.score || 0}/100</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '12px',
              backgroundColor: 'var(--surface-elevated)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${lead.score || 0}%`,
                height: '100%',
                backgroundColor: (lead.score || 0) >= 80 ? 'var(--signal)' : (lead.score || 0) >= 50 ? 'var(--warning)' : 'var(--muted)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* AI Reasoning */}
        {lead.latestReasoning && (
          <div className="brand-card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
            <h3 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--text)', fontSize: 'var(--font-size-md)' }}>
              🤖 Pilot's Reasoning
            </h3>
            <p style={{ 
              margin: 0, 
              color: 'var(--text-secondary)', 
              fontSize: 'var(--font-size-sm)',
              lineHeight: 'var(--line-relaxed)',
              whiteSpace: 'pre-wrap',
            }}>
              {lead.latestReasoning}
            </p>
          </div>
        )}

        {/* Research Summary */}
        {lead.researchSummary && (
          <div className="brand-card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
            <h3 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--text)', fontSize: 'var(--font-size-md)' }}>
              Research Summary
            </h3>
            <p style={{ 
              margin: 0, 
              color: 'var(--text-secondary)', 
              fontSize: 'var(--font-size-sm)',
              lineHeight: 'var(--line-relaxed)',
            }}>
              {lead.researchSummary}
            </p>
          </div>
        )}

        {/* Tech Stack */}
        {lead.techStackTags && lead.techStackTags.length > 0 && (
          <div className="brand-card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
            <h3 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--text)', fontSize: 'var(--font-size-md)' }}>
              Tech Stack
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {lead.techStackTags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: 'var(--space-1) var(--space-2)',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Conversations */}
        {lead.conversations && lead.conversations.length > 0 && (
          <div className="brand-card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
            <h3 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--text)', fontSize: 'var(--font-size-md)' }}>
              Conversation History ({lead.conversations.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {lead.conversations.map((conv) => {
                const isExpanded = expandedEmails.has(conv.id);
                const isRawView = rawViewEmails.has(conv.id);
                const conversationUrl = getConversationUrl(conv.emailId, conv.threadId);
                const bodyPreview = conv.body.length > 200 ? conv.body.substring(0, 200) + '...' : conv.body;

                return (
                  <div
                    key={conv.id}
                    style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--surface-elevated)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                          <span style={{ 
                            fontSize: 'var(--font-size-xs)', 
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            {conv.direction === 'outbound' ? '📤 Sent' : '📥 Received'}
                          </span>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                            {new Date(conv.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {conv.subject && (
                          <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)', color: 'var(--text)' }}>
                            {conv.subject}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {conversationUrl && (
                          <a
                            href={conversationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: 'var(--space-1) var(--space-2)',
                              fontSize: 'var(--font-size-xs)',
                              color: 'var(--signal)',
                              textDecoration: 'none',
                              border: '1px solid var(--signal)',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            View in Resend
                          </a>
                        )}
                        <button
                          onClick={() => toggleRawView(conv.id)}
                          style={{
                            padding: 'var(--space-1) var(--space-2)',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--text-secondary)',
                            background: 'none',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                          }}
                        >
                          {isRawView ? 'View Formatted' : 'View Raw'}
                        </button>
                      </div>
                    </div>

                    {/* Email Body */}
                    {isRawView ? (
                      <pre style={{
                        margin: 0,
                        padding: 'var(--space-3)',
                        backgroundColor: 'var(--bg)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-secondary)',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        border: '1px solid var(--border)',
                      }}>
                        {JSON.stringify({
                          id: conv.id,
                          emailId: conv.emailId,
                          threadId: conv.threadId,
                          subject: conv.subject,
                          body: conv.body,
                          direction: conv.direction,
                          type: conv.type,
                        }, null, 2)}
                      </pre>
                    ) : (
                      <>
                        <div
                          style={{
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--font-size-sm)',
                            lineHeight: 'var(--line-relaxed)',
                            whiteSpace: 'pre-wrap',
                          }}
                          dangerouslySetInnerHTML={{ __html: isExpanded ? conv.body : bodyPreview }}
                        />
                        {conv.body.length > 200 && (
                          <button
                            onClick={() => toggleEmail(conv.id)}
                            style={{
                              marginTop: 'var(--space-2)',
                              padding: 'var(--space-1) var(--space-2)',
                              fontSize: 'var(--font-size-xs)',
                              color: 'var(--signal)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            {isExpanded ? 'Show Less' : 'Show Full Email'}
                          </button>
                        )}
                      </>
                    )}

                    {/* AI Reasoning */}
                    {conv.aiReasoning && (
                      <div style={{ 
                        marginTop: 'var(--space-3)',
                        padding: 'var(--space-2)',
                        backgroundColor: 'var(--bg)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--signal)',
                      }}>
                        <div style={{ 
                          fontSize: 'var(--font-size-xs)', 
                          color: 'var(--signal)', 
                          fontWeight: 'var(--font-semibold)',
                          marginBottom: 'var(--space-1)',
                        }}>
                          💭 AI Reasoning
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-xs)', 
                          color: 'var(--text-secondary)',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {conv.aiReasoning}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}





