#!/usr/bin/env node
const fs = require("node:fs");
const Papa = require("papaparse");

const required = ["broker","trade_id","timestamp","symbol","side","quantity","price","trade_currency"];

function isISO8601(s){ return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(s); }

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/validate-csv.js <file.csv>");
  process.exit(1);
}
const text = fs.readFileSync(file, "utf8");
const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

const errors = [];
(parsed.data || []).forEach((row, idx) => {
  const line = idx + 2;
  for (const k of required) if (!row[k] && row[k] !== 0) errors.push({ line, error: `missing ${k}` });
  if (row.timestamp && !isISO8601(row.timestamp)) errors.push({ line, error: "timestamp not ISO8601" });
  if (row.quantity && isNaN(Number(row.quantity))) errors.push({ line, error: "quantity not number" });
  if (row.price && isNaN(Number(row.price))) errors.push({ line, error: "price not number" });
});

if (errors.length) {
  const out = "errors.csv";
  const rows = errors.map(e => ({ line: e.line, error: e.error }));
  fs.writeFileSync(out, Papa.unparse(rows));
  console.error(`❌ ${errors.length} invalid rows. See ${out}`);
  process.exit(2);
}

console.log("✅ CSV valid.");
