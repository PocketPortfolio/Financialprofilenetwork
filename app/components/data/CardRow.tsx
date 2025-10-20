'use client';

import React, { useState } from 'react';

export interface CardField {
  key: string;
  label: string;
  value: any;
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'badge';
  priority?: 'primary' | 'secondary' | 'tertiary';
  format?: (value: any) => string;
  className?: string;
}

export interface CardRowProps {
  data: Record<string, any>;
  fields: CardField[];
  className?: string;
  onRowClick?: (data: Record<string, any>) => void;
  showDetails?: boolean;
  detailsLabel?: string;
  children?: React.ReactNode;
}

// Format value based on type
function formatValue(value: any, type: CardField['type'], format?: CardField['format']): string {
  if (format) {
    return format(value);
  }

  if (value === null || value === undefined) {
    return '—';
  }

  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(Number(value));
    
    case 'percentage':
      return `${Number(value).toFixed(2)}%`;
    
    case 'number':
      return new Intl.NumberFormat('en-US').format(Number(value));
    
    case 'date':
      return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    
    case 'badge':
      return String(value);
    
    default:
      return String(value);
  }
}

// Get badge color based on value
function getBadgeColor(value: any): string {
  if (typeof value === 'number') {
    if (value > 0) return '#10b981'; // green
    if (value < 0) return '#ef4444'; // red
    return '#6b7280'; // gray
  }
  return '#6b7280';
}

export default function CardRow({
  data,
  fields,
  className = '',
  onRowClick,
  showDetails = false,
  detailsLabel = 'Details',
  children,
}: CardRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Separate fields by priority
  const primaryFields = fields.filter(f => f.priority === 'primary' || !f.priority);
  const secondaryFields = fields.filter(f => f.priority === 'secondary');
  const tertiaryFields = fields.filter(f => f.priority === 'tertiary');

  const handleCardClick = () => {
    if (showDetails) {
      setIsExpanded(!isExpanded);
    }
    onRowClick?.(data);
  };

  return (
    <div
      className={`mobile-card-row ${className}`}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        marginBottom: 'var(--space-md)',
        cursor: onRowClick || showDetails ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-sm)',
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        if (onRowClick || showDetails) {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Primary Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {primaryFields.map((field) => (
          <div
            key={field.key}
            className={field.className}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-mobile-sm)',
                color: 'var(--muted)',
                fontWeight: '500',
              }}
            >
              {field.label}
            </span>
            <span
              style={{
                fontSize: 'var(--text-mobile-base)',
                color: 'var(--text)',
                fontWeight: '600',
                textAlign: 'right',
                ...(field.type === 'badge' && {
                  background: getBadgeColor(field.value),
                  color: 'white',
                  padding: 'var(--space-xs) var(--space-sm)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-mobile-xs)',
                }),
              }}
            >
              {formatValue(field.value, field.type, field.format)}
            </span>
          </div>
        ))}
      </div>

      {/* Secondary Fields (always visible) */}
      {secondaryFields.length > 0 && (
        <div
          style={{
            marginTop: 'var(--space-md)',
            paddingTop: 'var(--space-md)',
            borderTop: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}
        >
          {secondaryFields.map((field) => (
            <div
              key={field.key}
              className={field.className}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--text-mobile-xs)',
                  color: 'var(--muted)',
                  fontWeight: '400',
                }}
              >
                {field.label}
              </span>
              <span
                style={{
                  fontSize: 'var(--text-mobile-sm)',
                  color: 'var(--text)',
                  fontWeight: '500',
                  textAlign: 'right',
                }}
              >
                {formatValue(field.value, field.type, field.format)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tertiary Fields (collapsible) */}
      {showDetails && tertiaryFields.length > 0 && (
        <div
          style={{
            marginTop: 'var(--space-md)',
            paddingTop: 'var(--space-md)',
            borderTop: '1px solid var(--card-border)',
          }}
        >
          <button
            type="button"
            className="mobile-details-toggle touch-target"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--brand)',
              fontSize: 'var(--text-mobile-sm)',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-sm) 0',
            }}
          >
            <span>{detailsLabel}</span>
            <span
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              ▼
            </span>
          </button>

          {isExpanded && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-sm)',
                marginTop: 'var(--space-sm)',
              }}
            >
              {tertiaryFields.map((field) => (
                <div
                  key={field.key}
                  className={field.className}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--text-mobile-xs)',
                      color: 'var(--muted)',
                      fontWeight: '400',
                    }}
                  >
                    {field.label}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--text-mobile-sm)',
                      color: 'var(--text)',
                      fontWeight: '500',
                      textAlign: 'right',
                    }}
                  >
                    {formatValue(field.value, field.type, field.format)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom children */}
      {children && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          {children}
        </div>
      )}
    </div>
  );
}






