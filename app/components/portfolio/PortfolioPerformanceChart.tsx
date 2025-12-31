'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Show empty state if no snapshots
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
        <p
          style={{
            color: 'var(--muted)',
            marginBottom: 'var(--space-2)',
            fontSize: isMobile ? 'var(--font-size-sm)' : 'var(--font-size-base)',
            padding: isMobile ? '0 var(--space-2)' : '0',
          }}
        >
          Historical data will appear here once daily snapshots are saved.
        </p>
        <p
          style={{
            fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            padding: isMobile ? '0 var(--space-2)' : '0',
          }}
        >
          Your portfolio is automatically saved daily. Check back tomorrow to see your portfolio performance over time.
        </p>
      </div>
    );
  }

  // Filter snapshots by time range
  const filteredData = useMemo(() => {
    if (snapshots.length === 0) return [];

    const { startDate, endDate } = getDateRange(timeRange);
    
    return snapshots.filter((snapshot) => {
      const snapshotDate = new Date(snapshot.date);
      return snapshotDate >= startDate && snapshotDate <= endDate;
    });
  }, [snapshots, timeRange]);

  // Calculate returns
  const chartData = useMemo(() => {
    if (filteredData.length === 0) return [];

    const returns = calculateHistoricalReturns(filteredData);
    const firstValue = filteredData[0]?.totalValue || 0;

    // Normalize benchmark data to match portfolio dates
    const normalizedBenchmark = showBenchmark && benchmarkData.length > 0
      ? filteredData.map((snapshot) => {
          // Find closest benchmark point
          const benchmarkPoint = benchmarkData.find(
            (b) => b.date === snapshot.date
          ) || benchmarkData[0];
          
          // Normalize to start at same value as portfolio
          const benchmarkStart = benchmarkData[0]?.value || 1;
          const normalizedValue = benchmarkPoint.value
            ? (benchmarkPoint.value / benchmarkStart) * firstValue
            : firstValue;
          
          return normalizedValue;
        })
      : [];

    return filteredData.map((snapshot, index) => ({
      date: snapshot.date,
      dateFormatted: formatDate(snapshot.date, timeRange),
      value: snapshot.totalValue,
      invested: snapshot.totalInvested,
      return: returns[index]?.return || 0,
      returnPercent: returns[index]?.returnPercent || 0,
      benchmark: normalizedBenchmark[index] || null,
    }));
  }, [filteredData, timeRange, showBenchmark, benchmarkData]);

  // Time range options
  const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', 'YTD', 'ALL'];

  // Custom tooltip
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

  if (chartData.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: isMobile ? '300px' : '400px',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          color: 'var(--muted)',
          fontSize: isMobile ? 'var(--font-size-sm)' : 'var(--font-size-base)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        No historical data available
      </div>
    );
  }

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
                      ? 'var(--signal)'
                      : 'var(--surface-elevated)',
                  color: timeRange === range ? 'var(--bg)' : 'var(--text)',
                  border: `1px solid ${
                    timeRange === range ? 'var(--signal)' : 'var(--border)'
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

      {/* Chart */}
      <div 
        role="img" 
        aria-label="Portfolio performance chart"
        style={{
          width: '100%',
          maxWidth: '100%',
          height: isMobile ? '300px' : '400px',
        }}
      >
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--signal)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--signal)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="dateFormatted"
            stroke="var(--text-secondary)"
            style={{ fontSize: 'var(--font-size-sm)' }}
          />
          <YAxis
            stroke="var(--text-secondary)"
            style={{ fontSize: 'var(--font-size-sm)' }}
            tickFormatter={formatCurrencyAxis}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--signal)"
            fillOpacity={1}
            fill="url(#colorValue)"
            name="Portfolio Value"
          />
          {showBenchmark && (
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="var(--text-secondary)"
              strokeDasharray="5 5"
              name="Benchmark"
              dot={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

