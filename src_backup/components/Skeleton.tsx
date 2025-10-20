/**
 * Skeleton loading components for better perceived performance
 */

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, className }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className || ''}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s ease-in-out infinite',
      }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={16} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 3 }: { rows?: number; columns?: number }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} style={{ padding: 10 }}>
              <Skeleton height={16} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <td key={colIdx} style={{ padding: 10 }}>
                <Skeleton height={14} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        padding: 20,
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 15,
      }}
    >
      <Skeleton height={24} width="40%" />
      <SkeletonText lines={2} />
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <Skeleton height={36} width={100} borderRadius={4} />
        <Skeleton height={36} width={100} borderRadius={4} />
      </div>
    </div>
  );
}

// Add global styles
const style = document.createElement('style');
style.textContent = `
  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
document.head.appendChild(style);

