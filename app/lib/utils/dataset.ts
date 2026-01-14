/**
 * Calculate dataset statistics for unique content generation
 * This prevents "Doorway Page" SEO penalty by generating unique descriptions per ticker
 */

export interface DatasetStats {
  count: string;
  startYear: number;
  lastUpdate: string;
  years: number;
  sizeKB: string;
}

export interface HistoricalDataPoint {
  date: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export function getDatasetStats(historyData: HistoricalDataPoint[] | null | undefined): DatasetStats | null {
  if (!historyData || historyData.length === 0) return null;

  const count = historyData.length;
  
  // Sort by date (oldest first)
  const sortedData = [...historyData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const startDate = new Date(sortedData[0].date);
  const endDate = new Date(sortedData[sortedData.length - 1].date);
  
  // Calculate years difference
  const years = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
  
  // Estimate JSON size (rough calc: 150 bytes per row)
  const sizeInBytes = count * 150;
  const sizeKB = (sizeInBytes / 1024).toFixed(1);

  return {
    count: new Intl.NumberFormat('en-US').format(count),
    startYear: startDate.getFullYear(),
    lastUpdate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    years,
    sizeKB
  };
}

