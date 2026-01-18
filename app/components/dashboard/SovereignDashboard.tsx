'use client';

import { useMemo, useState } from 'react';
import { SovereignHeader } from './SovereignHeader';
import { MorningBrief } from './MorningBrief';
import { AssetTerminal } from './AssetTerminal';
import { X } from 'lucide-react';

interface Position {
  ticker: string;
  shares: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPLPercent: number;
}

interface SovereignDashboardProps {
  positions: Position[];
  quotesData: Record<string, any>;
  totalUnrealizedPLPercent: number;
  totalCurrentValue: number;
  totalUnrealizedPL: number;
  onImportCSV?: () => void;
  onAddAsset?: () => void;
}

export default function SovereignDashboard({ 
  positions, 
  quotesData,
  totalUnrealizedPLPercent,
  totalCurrentValue,
  totalUnrealizedPL,
  onImportCSV,
  onAddAsset
}: SovereignDashboardProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  // Transform positions to assets format
  const assets = useMemo(() => {
    const result = positions.map((pos) => {
      const quote = quotesData?.[pos.ticker];
      const change = quote?.changePct || pos.unrealizedPLPercent || 0;
      
      return {
        symbol: pos.ticker,
        name: quote?.name || pos.ticker,
        price: pos.currentPrice,
        change: change,
        holdings: pos.shares,
        value: pos.currentValue,
      };
    }).sort((a, b) => b.value - a.value); // Sort by value descending
    return result;
  }, [positions, quotesData]);

  // Extract top mover for the brief
  const topMover = useMemo(() => {
    if (assets.length === 0) {
      return { symbol: 'N/A', change: 0 };
    }
    return assets.reduce((prev, current) => 
      Math.abs(current.change) > Math.abs(prev.change) ? current : prev
    );
  }, [assets]);

  const netWorthParts = totalCurrentValue.toFixed(2).split('.');
  const wholePart = netWorthParts[0];
  const decimalPart = netWorthParts[1] || '00';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30" style={{backgroundColor: '#020617'}}>
      <SovereignHeader />
      
      <main className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
        
        {/* Intelligence */}
        <MorningBrief 
          netWorthChange={totalUnrealizedPLPercent} 
          topMover={topMover} 
        />

        {/* The Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Terminal (Assets) */}
          <div className="lg:col-span-8 space-y-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-mono text-slate-500 uppercase" style={{color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'}}>/ Portfolio_Assets</h3>
                
                {/* 🟢 RESTORED: Core Actions */}
                <div className="flex gap-2">
                  {onImportCSV && (
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="px-4 py-2 text-sm font-medium border border-slate-700 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                      style={{
                        borderColor: '#334155',
                        color: '#cbd5e1',
                        backgroundColor: 'transparent',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1e293b';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Import CSV
                    </button>
                  )}
                  {onAddAsset && (
                    <button
                      onClick={() => setShowAddAssetModal(true)}
                      className="px-4 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                      style={{
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#10b981';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                      }}
                    >
                      + Add Asset
                    </button>
                  )}
                </div>
             </div>
             <AssetTerminal assets={assets} />
          </div>

          {/* Sidebar (Stats/Heatmap) */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-sm" style={{backgroundColor: 'rgba(15, 23, 42, 0.3)', borderColor: '#1e293b'}}>
                <div className="text-slate-500 text-xs font-mono mb-2" style={{color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'}}>NET LIQUIDITY</div>
                <div className="text-4xl font-mono font-bold text-white tracking-tight" style={{fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'}}>
                   ${parseInt(wholePart).toLocaleString('en-US')}
                   <span className="text-slate-600 text-2xl" style={{color: '#475569'}}>.{decimalPart}</span>
                </div>
                <div className="mt-4 flex gap-2 font-mono text-sm" style={{fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'}}>
                   <span style={{
                     color: totalUnrealizedPL >= 0 ? '#34d399' : '#f43f5e',
                     backgroundColor: totalUnrealizedPL >= 0 ? 'rgba(6, 78, 59, 0.3)' : 'rgba(76, 29, 29, 0.3)',
                     borderColor: totalUnrealizedPL >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                     padding: '4px 8px',
                     borderRadius: '4px',
                     border: '1px solid',
                     display: 'inline-block'
                   }}>
                     {totalUnrealizedPL >= 0 ? '+' : ''}${Math.abs(totalUnrealizedPL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totalUnrealizedPLPercent >= 0 ? '+' : ''}{totalUnrealizedPLPercent.toFixed(2)}%)
                   </span>
                </div>
             </div>
             
             {/* Heatmap Placeholder - Hidden until implementation */}
             {/* <div className="aspect-square bg-slate-900/30 border border-slate-800 rounded-sm flex items-center justify-center">
                <span className="text-xs font-mono text-slate-600">[ HEATMAP VISUALIZATION ]</span>
             </div> */}
          </div>

        </div>
      </main>
      
      {/* 🟢 RESTORED: Action Modals */}
      {onImportCSV && showImportModal && (
        <ActionModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Import CSV"
          content={
            <div style={{ padding: '16px', color: '#e2e8f0' }}>
              <p style={{ marginBottom: '16px', fontSize: '14px', color: '#94a3b8' }}>
                To import your portfolio data, please use the Import page.
              </p>
              <a
                href="/import"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: '#059669',
                  color: '#ffffff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Go to Import Page
              </a>
            </div>
          }
        />
      )}
      
      {onAddAsset && showAddAssetModal && (
        <ActionModal
          isOpen={showAddAssetModal}
          onClose={() => setShowAddAssetModal(false)}
          title="Add Asset"
          content={
            <div style={{ padding: '16px', color: '#e2e8f0' }}>
              <p style={{ marginBottom: '16px', fontSize: '14px', color: '#94a3b8' }}>
                To add a new trade, please scroll down to the "Add Trade" form below or use the menu to navigate.
              </p>
              <button
                onClick={() => {
                  setShowAddAssetModal(false);
                  onAddAsset();
                }}
                style={{
                  padding: '12px 24px',
                  background: '#059669',
                  color: '#ffffff',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Scroll to Add Trade Form
              </button>
            </div>
          }
        />
      )}
    </div>
  );
}

// Simple Modal Component
function ActionModal({ isOpen, onClose, title, content }: { isOpen: boolean; onClose: () => void; title: string; content: React.ReactNode }) {
  if (!isOpen) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #1e293b'
        }}>
          <h3 style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: '600', margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {content}
      </div>
    </div>
  );
}

