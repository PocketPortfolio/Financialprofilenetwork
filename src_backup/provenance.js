export function readProvenanceHeaders(res) {
  return {
    source: res.headers.get("X-Data-Source") || "unknown",
    asOfISO: res.headers.get("X-Data-Timestamp") || new Date().toISOString()
  };
}
