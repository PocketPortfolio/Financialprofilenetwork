import React from 'react';
import { usePriceHealth } from '../hooks/usePriceHealth';

const badge = (txt: string, color: 'green'|'orange'|'red') => (
  <span style={{
    padding: '2px 6px', borderRadius: 4, fontSize: 12, color: '#fff',
    background: color === 'green' ? '#16a34a' : color === 'orange' ? '#f59e0b' : '#dc2626'
  }}>{txt}</span>
);

function statusLabel(p: { lastSuccess: number|null; activeFallback: boolean }) {
  const fresh = p.lastSuccess && (Date.now() - p.lastSuccess) < 30_000;
  if (fresh) return badge('Fresh', 'green');
  if (p.activeFallback) return badge('Fallback', 'orange');
  return badge('Unhealthy', 'red');
}

export default function PricePipelineHealthCard() {
  const { health, loading, error } = usePriceHealth(30000);

  return (
    <div style={{ border:'1px solid #e5e7eb', borderRadius:8, padding:16 }}>
      <h3 style={{ margin:0, marginBottom:12 }}>Price Pipeline Health</h3>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color:'#dc2626' }}>Error: {error}</div>}
      {!loading && !error && (
        <div>
          {['yahoo','chart','stooq'].map(p => {
            const rec = health.find(h => h.provider === p) || { provider:p, lastSuccess:null, lastFailure:null, failureCount:0, activeFallback:false };
            return (
              <div key={p} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <strong style={{ width:80, textTransform:'uppercase' }}>{p}</strong>
                {statusLabel(rec)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
