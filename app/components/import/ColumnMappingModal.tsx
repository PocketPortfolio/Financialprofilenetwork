'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { RequiresMappingResult, UniversalMapping, StandardField } from '@pocket-portfolio/importer';

const STANDARD_FIELD_LABELS: Record<StandardField, string> = {
  date: 'Date',
  ticker: 'Symbol / Ticker',
  action: 'Action (Buy/Sell)',
  quantity: 'Quantity',
  price: 'Price',
  currency: 'Currency (optional)',
  fees: 'Fees (optional)',
};

const REQUIRED_FIELDS: StandardField[] = ['date', 'ticker', 'action', 'quantity', 'price'];

interface ColumnMappingModalProps {
  data: RequiresMappingResult;
  onConfirm: (mapping: UniversalMapping) => void;
  onCancel: () => void;
}

export default function ColumnMappingModal({ data, onConfirm, onCancel }: ColumnMappingModalProps) {
  const [mapping, setMapping] = useState<UniversalMapping>({ ...data.proposedMapping });
  const [mappingError, setMappingError] = useState<string | null>(null);

  const headers = useMemo(() => data.headers, [data.headers]);
  const optionValues = useMemo(() => ['', ...headers], [headers]);
  const sampleRows = useMemo(() => data.sampleRows ?? [], [data.sampleRows]);

  const handleChange = (field: StandardField, value: string) => {
    setMappingError(null);
    setMapping((prev: UniversalMapping) => {
      const next = { ...prev };
      if (value === '') {
        delete next[field];
      } else {
        const alreadyUsedBy = Object.entries(next).find(
          ([k, v]) => k !== field && v === value && REQUIRED_FIELDS.includes(k as StandardField)
        )?.[0] as StandardField | undefined;
        if (alreadyUsedBy) {
          setMappingError(
            `"${value}" is already mapped to "${STANDARD_FIELD_LABELS[alreadyUsedBy]}". Each required field must use a unique column.`
          );
          return prev;
        }
        next[field] = value;
      }
      return next;
    });
  };

  const dateLooksValid = useMemo(() => {
    const col = mapping.date;
    if (!col) return false;
    let seen = 0;
    let ok = 0;
    for (const r of sampleRows.slice(0, 6)) {
      const v = (r as any)?.[col];
      if (v == null || String(v).trim() === '') continue;
      seen += 1;
      const s = String(v).trim();
      const t = Date.parse(s);
      if (!Number.isNaN(t)) ok += 1;
      else if (/^\d{4}-\d{2}-\d{2}/.test(s)) ok += 1;
    }
    if (seen === 0) return false;
    return ok / seen >= 0.6;
  }, [mapping.date, sampleRows]);

  const requiredFilled = REQUIRED_FIELDS.every((f) => mapping[f]);
  const canConfirm = requiredFilled && dateLooksValid;

  const overlayStyle = useMemo(
    () => ({
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }),
    []
  );

  const modalStyle = useMemo(
    () => ({
      background: 'var(--card)',
      border: '2px solid var(--card-border)',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '480px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto' as const,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    }),
    []
  );

  return createPortal(
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2
          style={{
            margin: '0 0 8px 0',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--card-foreground)',
          }}
        >
          Confirm column mapping
        </h2>
        <p
          style={{
            margin: '0 0 20px 0',
            fontSize: '0.875rem',
            color: 'var(--muted-foreground)',
          }}
        >
          Map your CSV columns to the required fields. Required fields must be set to continue.
        </p>
        {!dateLooksValid && mapping.date && (
          <div
            style={{
              margin: '0 0 14px 0',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            The selected <strong>Date</strong> column doesn’t look like a date/time value in the preview rows. Pick a
            different column (e.g. Date, Time, Timestamp).
          </div>
        )}
        {mappingError && (
          <div
            style={{
              margin: '0 0 14px 0',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            {mappingError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(Object.keys(STANDARD_FIELD_LABELS) as StandardField[]).map((field) => {
            const isRequired = REQUIRED_FIELDS.includes(field);
            return (
              <label
                key={field}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--foreground)',
                  }}
                >
                  {STANDARD_FIELD_LABELS[field]}
                  {isRequired && (
                    <span style={{ color: 'var(--destructive)', marginLeft: '2px' }}>*</span>
                  )}
                </span>
                <select
                  value={mapping[field] ?? ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">{field === 'currency' || field === 'fees' ? '— None —' : 'Select column...'}</option>
                  {headers.map((h: string) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>

        <div
          style={{
            marginTop: '24px',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--foreground)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canConfirm) {
                return;
              }
              onConfirm(mapping);
            }}
            disabled={!canConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: canConfirm ? 'var(--brand)' : 'var(--muted)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              opacity: canConfirm ? 1 : 0.6,
            }}
          >
            Import
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
