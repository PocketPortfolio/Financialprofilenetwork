'use client';

import React from 'react';
import type { Benchmark } from '@/app/lib/portfolio/types';

interface BenchmarkOverlayProps {
  benchmarks: Benchmark[];
  selectedBenchmarks: string[];
  onToggleBenchmark: (symbol: string) => void;
}

/**
 * Benchmark overlay component for toggling benchmark comparisons
 */
export default function BenchmarkOverlay({
  benchmarks,
  selectedBenchmarks,
  onToggleBenchmark,
}: BenchmarkOverlayProps) {
  if (benchmarks.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-3)',
        background: 'var(--surface-elevated)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text)',
          marginBottom: 'var(--space-2)',
        }}
      >
        Benchmarks
      </div>

      {benchmarks.map((benchmark) => {
        const isSelected = selectedBenchmarks.includes(benchmark.symbol);
        const color = isSelected ? 'var(--signal)' : 'var(--text-secondary)';

        return (
          <label
            key={benchmark.symbol}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              transition: 'var(--transition-base)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleBenchmark(benchmark.symbol)}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer',
                accentColor: 'var(--signal)',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 'var(--font-size-sm)',
                color: isSelected ? 'var(--text)' : 'var(--text-secondary)',
                fontWeight: isSelected ? 'var(--font-medium)' : 'var(--font-normal)',
              }}
            >
              {benchmark.name}
            </span>
          </label>
        );
      })}
    </div>
  );
}











