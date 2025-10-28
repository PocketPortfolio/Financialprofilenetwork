export const trackImport = {
  detect: (broker: any, file: File) => send('csv_detect_broker', { broker, size_kb: Math.round(file.size/1024), ext: (file.name.split('.').pop()||'').toLowerCase() }),
  parseResult: (r: any) => send('csv_parse_result', { broker: r.broker, rows: r.meta.rows, invalid: r.meta.invalid, ms: r.meta.durationMs }),
  success: (r: any) => send('csv_import_success', { broker: r.broker, rows: r.trades.length }),
};
function send(eventType: string, properties: Record<string,any>) {
  if (typeof fetch === 'function') {
    fetch('/api/telemetry', { method: 'POST', body: JSON.stringify({ eventType, properties, timestamp: new Date().toISOString() }) });
  }
}






