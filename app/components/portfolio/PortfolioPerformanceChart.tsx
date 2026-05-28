'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { PortfolioSnapshot } from '@/app/lib/portfolio/types';
import type { TimeRange } from '@/app/lib/portfolio/types';
import { calculateHistoricalReturns } from '@/app/lib/portfolio/snapshot';
import { formatCurrencyAxis } from '@/app/lib/utils/currencyFormatter';

/** Recharts SVG attrs do not reliably resolve CSS variables — use hex. */
const CHART_PORTFOLIO_STROKE = '#f59e0b';
const CHART_BENCHMARK_STROKE = '#94a3b8';
const CHART_GRID_STROKE = 'rgba(148, 163, 184, 0.25)';
const CHART_AXIS_STROKE = '#94a3b8';

interface PortfolioPerformanceChartProps {
  snapshots: PortfolioSnapshot[];
  timeRange: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showBenchmark?: boolean;
  benchmarkData?: Array<{ date: string; value: number }>;
}

/**
 * Calculate date range based on time range selection
 */
function getDateRange(timeRange: TimeRange): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  switch (timeRange) {
    case '1D':
      startDate.setDate(endDate.getDate() - 1);
      break;
    case '1W':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '1M':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case '3M':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '1Y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case 'YTD':
      startDate.setMonth(0, 1); // January 1st
      break;
    case 'ALL':
      startDate.setFullYear(2000); // Far back date
      break;
  }

  return { startDate, endDate };
}

/**
 * Format date for display
 */
function formatDate(dateString: string, timeRange: TimeRange): string {
  const date = new Date(dateString);
  
  switch (timeRange) {
    case '1D':
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case '1W':
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    case '1M':
    case '3M':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case '1Y':
    case 'YTD':
    case 'ALL':
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    default:
      return date.toLocaleDateString('en-US');
  }
}

/**
 * Portfolio performance chart with time range selector
 */
export default function PortfolioPerformanceChart({
  snapshots,
  timeRange,
  onTimeRangeChange,
  showBenchmark = false,
  benchmarkData = [],
}: PortfolioPerformanceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const gradientId = useId().replace(/:/g, '');
  const chartHeight = isMobile ? 300 : 400;

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter snapshots by time range; fall back to full series if window is too narrow
  const filteredData = useMemo(() => {
    if (snapshots.length === 0) return [];

    const { startDate, endDate } = getDateRange(timeRange);

    const filtered = snapshots.filter((snapshot) => {
      const snapshotDate = new Date(`${snapshot.date}T12:00:00`);
      return snapshotDate >= startDate && snapshotDate <= endDate;
    });

    if (filtered.length >= 2) return filtered;
    if (snapshots.length >= 2) return snapshots;
    return filtered.length > 0 ? filtered : snapshots;
  }, [snapshots, timeRange]);

  // Calculate returns
  const chartData = useMemo(() => {
    if (filteredData.length === 0) return [];

    const returns = calculateHistoricalReturns(filteredData);
    const firstValue = filteredData[0]?.totalValue || 0;

    // Normalize benchmark data to match portfolio dates
    const benchByDate = new Map(benchmarkData.map((b) => [b.date, b.value]));
    const benchStart =
      benchmarkData.find((b) => Number.isFinite(b.value) && b.value > 0)?.value ?? 0;

    const normalizedBenchmark =
      showBenchmark && benchmarkData.length > 0 && benchStart > 0
        ? filteredData.map((snapshot) => {
            let close = benchByDate.get(snapshot.date);
            if (close == null || !Number.isFinite(close)) {
              for (let i = benchmarkData.length - 1; i >= 0; i--) {
                if (benchmarkData[i].date <= snapshot.date) {
                  close = benchmarkData[i].value;
                  break;
                }
              }
            }
            if (close == null || !Number.isFinite(close) || close <= 0) return undefined;
            return (close / benchStart) * firstValue;
          })
        : [];

    return filteredData.map((snapshot, index) => ({
      date: snapshot.date,
      dateFormatted: formatDate(snapshot.date, timeRange),
      value: snapshot.totalValue,
      invested: snapshot.totalInvested,
      return: returns[index]?.return || 0,
      returnPercent: returns[index]?.returnPercent || 0,
      benchmark: normalizedBenchmark[index],
    }));
  }, [filteredData, timeRange, showBenchmark, benchmarkData]);

  const showSparseHint = chartData.length > 0 && chartData.length < 2;
  const valuesValid = chartData.some(
    (d) => typeof d.value === 'number' && Number.isFinite(d.value) && d.value > 0
  );

  useEffect(() => {
    if (!mounted || chartData.length === 0) return;
    const el = chartContainerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.offsetWidth;
      if (w > 0) setChartWidth(w);
    };

    measure();
    const raf = requestAnimationFrame(measure);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(el);
    } else {
      window.addEventListener('resize', measure);
    }

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [mounted, chartData.length, isMobile, timeRange]);

  // Time range options
  const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', 'YTD', 'ALL'];

  if (snapshots.length === 0) {
    return (
      <div
        style={{
          padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          textAlign: 'center',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <h3
          style={{
            fontSize: isMobile ? 'var(--font-size-base)' : 'var(--font-size-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text)',
            marginBottom: isMobile ? 'var(--space-2)' : 'var(--space-3)',
          }}
        >
          Historical Performance
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: isMobile ? 'var(--font-size-sm)' : 'var(--font-size-base)' }}>
          Historical data will appear here once daily snapshots are saved.
        </p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: chartHeight,
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          color: 'var(--muted)',
          fontSize: isMobile ? 'var(--font-size-sm)' : 'var(--font-size-base)',
          width: '100%',
          padding: 'var(--space-4)',
        }}
      >
        No data in this range — try ALL or 3M.
      </div>
    );
  }

  // Custom tooltip (defined after guards; only used when chart renders)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div
        style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-1)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: entry.color,
              }}
            />
            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {entry.name}:
            </span>
            <span
              style={{
                color: 'var(--text)',
                fontWeight: 'var(--font-semibold)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              ${entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
        {data.returnPercent !== undefined && (
          <div
            style={{
              marginTop: 'var(--space-2)',
              paddingTop: 'var(--space-2)',
              borderTop: '1px solid var(--border)',
              fontSize: 'var(--font-size-sm)',
              color: data.returnPercent >= 0 ? 'var(--signal)' : 'var(--danger)',
            }}
          >
            Return: {data.returnPercent >= 0 ? '+' : ''}
            {data.returnPercent.toFixed(2)}%
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        padding: isMobile ? 'var(--space-3)' : 'var(--space-4)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header with time range selector */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isMobile ? 'flex-start' : 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: isMobile ? 'var(--space-3)' : 'var(--space-4)',
          flexWrap: 'wrap',
          gap: isMobile ? 'var(--space-3)' : 'var(--space-2)',
          width: '100%',
        }}
      >
        <h3
          style={{
            fontSize: isMobile ? 'var(--font-size-base)' : 'var(--font-size-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text)',
            margin: 0,
            width: '100%',
          }}
        >
          Historical Performance
        </h3>

        {/* Time range selector */}
        {onTimeRangeChange && (
          <div
            style={{
              display: 'flex',
              gap: isMobile ? '4px' : 'var(--space-2)',
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                aria-label={`Select ${range} time range`}
                aria-pressed={timeRange === range}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTimeRangeChange(range);
                  }
                }}
                style={{
                  padding: isMobile ? 'var(--space-2)' : 'var(--space-2) var(--space-3)',
                  flex: isMobile ? '1 1 auto' : '0 0 auto', // Allow buttons to grow on mobile
                  minWidth: isMobile ? '40px' : 'auto',
                  background:
                    timeRange === range
                      ? CHART_PORTFOLIO_STROKE
                      : 'var(--surface-elevated)',
                  color: timeRange === range ? '#0a0a0a' : 'var(--text)',
                  border: `1px solid ${
                    timeRange === range ? CHART_PORTFOLIO_STROKE : 'var(--border)'
                  }`,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: isMobile ? '11px' : 'var(--font-size-sm)',
                  fontWeight: 'var(--font-medium)',
                  cursor: 'pointer',
                  transition: 'var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  if (timeRange !== range) {
                    e.currentTarget.style.background = 'var(--surface-elevated)';
                    e.currentTarget.style.borderColor = 'var(--signal)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (timeRange !== range) {
                    e.currentTarget.style.background =
                      timeRange === range
                        ? 'var(--signal)'
                        : 'var(--surface-elevated)';
                    e.currentTarget.style.borderColor =
                      timeRange === range ? 'var(--signal)' : 'var(--border)';
                  }
                }}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      {showSparseHint && (
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          Limited history in this range — showing available points. Select ALL for the full synthetic curve.
        </p>
      )}

      {!valuesValid ? (
        <div
          style={{
            minHeight: chartHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
            padding: 'var(--space-4)',
          }}
        >
          Portfolio values are still loading — refresh in a moment or try ALL.
        </div>
      ) : (
        <div
          ref={chartContainerRef}
          role="img"
          aria-label="Portfolio performance chart"
          style={{
            width: '100%',
            minWidth: 0,
            height: chartHeight,
            minHeight: chartHeight,
            position: 'relative',
          }}
        >
          {!mounted || chartWidth <= 0 ? (
            <div
              style={{
                height: chartHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              Loading chart…
            </div>
          ) : (
            <ResponsiveContainer width={chartWidth} height={chartHeight}>
              <ComposedChart
                data={chartData}
                margin={{ top: 12, right: 20, left: 4, bottom: 4 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_PORTFOLIO_STROKE} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHART_PORTFOLIO_STROKE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                <XAxis
                  dataKey="dateFormatted"
                  stroke={CHART_AXIS_STROKE}
                  tick={{ fill: CHART_AXIS_STROKE, fontSize: 11 }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  stroke={CHART_AXIS_STROKE}
                  tick={{ fill: CHART_AXIS_STROKE, fontSize: 11 }}
                  tickFormatter={formatCurrencyAxis}
                  domain={[(dataMin: number) => Math.max(0, dataMin * 0.95), 'auto']}
                  width={56}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: CHART_AXIS_STROKE, paddingTop: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_PORTFOLIO_STROKE}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${gradientId})`}
                  name="Portfolio Value"
                  dot={chartData.length <= 4}
                  activeDot={{ r: 4, fill: CHART_PORTFOLIO_STROKE }}
                  connectNulls
                  isAnimationActive={false}
                />
                {showBenchmark && (
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    stroke={CHART_BENCHMARK_STROKE}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    name="Benchmark"
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}

