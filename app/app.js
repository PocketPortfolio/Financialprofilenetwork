/* global firebase, Papa, Chart */
/* ================= Pocket Portfolio (MVP) ================= */

/* -------------------- Secure config -------------------- */
/**
 * We never hard-code Firebase credentials.
 * Strategy:
 * 1) Try GET /api/config (Serverless returns env-backed config)
 * 2) Else try window.__ppFirebase (optional build-time injector)
 * 3) Else go local-only (no cloud features; app still works)
 */
async function loadFirebaseConfig() {
  try {
    const r = await fetch('/api/config', { cache: 'no-store' });
    if (r.ok) {
      const j = await r.json().catch(() => ({}));
      if (j && j.firebase && j.firebase.apiKey) return j.firebase;
    }
  } catch (_) {}
  if (globalThis.__ppFirebase?.apiKey) return globalThis.__ppFirebase;
  return null;
}

let auth = null;
let db = null;
let cloudEnabled = false;

/* ------------------------ Globals ------------------------ */
const trades = [];                 // [{ id?, date, ticker, quantity, price, kind, ccy, mock, key, brokerRef }]
const tradeKeys = new Set();
let unsubscribeTrades = null;

let chart = null;
let chartType = "pie";
const searchCache = Object.create(null);
const liveQuotes = new Map();      // Map<symbol, { price, changePct, currency }>

/* ------------------------ DOM helpers -------------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const els = {
  tabs: $$('.pp-tab'),
  dashboard: $('#dashboard'),
  live: $('#live'),
  invested: $('#invested'),
  tradeCount: $('#trade-count'),
  positionsCount: $('#positions-count'),
  plAmount: $('#pl-amount'),
  plPercent: $('#pl-percent'),
  tradeForm: $('#trade-form'),
  date: $('#date'),
  tickerInput: $('#ticker'),
  tickerList: $('#ticker-suggestions'),
  kind: $('#kind'),
  ccy: $('#ccy'),
  qty: $('#quantity'),
  price: $('#price'),
  mock: $('#mock'),
  csvFile: $('#csv-file'),
  tradesTbody: $('#trades-table tbody'),
  positionsBox: $('#positions'),
  liveTbody: $('#live-table tbody'),
  mostTradedTbody: $('#most-traded-table tbody'),
  newsCards: $('#news-cards'),
  chartType: $('#chart-type'),
  signIn: $('#sign-in'),
  signOut: $('#sign-out'),
  deleteAccount: $('#delete-account'),
  profile: $('#profile'),
  authContainer: $('#auth'),
  userEmail: $('#user-email'),
  // Health card (NEW)
  healthCard: $('#health-card'),
  healthBody: $('#health-body'),
};
const money = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

/* -------------------------- Utilities -------------------- */
const API = (path, params) => {
  const u = new URL(path, location.origin);
  if (params) for (const [k,v] of Object.entries(params)) {
    if (v !== undefined && v !== null) u.searchParams.set(k, v);
  }
  return u.toString();
};
const asArray = (x) => Array.isArray(x) ? x : (Array.isArray(x?.data) ? x.data : []);
async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store', headers: { 'x-pp-live': '1' } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

function parseNumber(val) {
  if (val == null) return NaN;
  if (typeof val === "number") return val;
  let s = String(val).trim();
  s = s.replace(/[^\d,.\-Ee]/g, "");
  if (s.includes(",") && s.includes(".")) s = s.replace(/,/g, "");
  else s = s.replace(/,/g, ".");
  return Number(s);
}
function abbr(n){
  if (n == null || isNaN(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (a >= 1e9 ) return (n / 1e9 ).toFixed(2) + "B";
  if (a >= 1e6 ) return (n / 1e6 ).toFixed(2) + "M";
  if (a >= 1e3 ) return (n / 1e3 ).toFixed(1) + "K";
  return n.toString();
}
async function sha256FromBuffer(buf){
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function sha256FromString(s){ return sha256FromBuffer(new TextEncoder().encode(s)); }
async function fileHash(file){ return sha256FromBuffer(await file.arrayBuffer()); }

async function alreadyImported(file){
  const hash = await fileHash(file);
  const local = JSON.parse(localStorage.getItem("importHashes") || "[]");
  if (local.includes(hash)) return true;

  if (cloudEnabled && auth?.currentUser) {
    const ref = db.collection("pp").doc(auth.currentUser.uid).collection("meta").doc("importHashes");
    const snap = await ref.get().catch(() => null);
    const arr  = snap?.exists ? (snap.data().hashes || []) : [];
    if (arr.includes(hash)) return true;
    try { await ref.set({ hashes: firebase.firestore.FieldValue.arrayUnion(hash) }, { merge:true }); } catch {}
  }
  local.push(hash);
  localStorage.setItem("importHashes", JSON.stringify(local));
  return false;
}
async function tradeKey(t){
  const s = [
    (t.date||"").trim(),
    (t.ticker||"").trim().toUpperCase(),
    (t.kind||"").trim().toLowerCase(),
    (t.ccy||"").trim().toUpperCase(),
    String(t.quantity ?? ""),
    String(t.price ?? ""),
    String(t.brokerRef || "")
  ].join("|");
  return sha256FromString(s);
}
function pick(row, arr){
  for (const k of arr){ const v = row[k]; if (v != null && String(v).trim() !== "") return v; }
  return undefined;
}

/* -------- CSV synonyms & broker detection/normalisation -------- */
const CSV_FIELDS = {
  date: ["date","Date","Open Date","OpenDate","Open Time","OpenTime","Trade Date","TradeDate","Execution Time","ExecutionTime","Time","Timestamp","Timestamp (UTC)","Fill Date","FillDate","Order Date","Transaction Date","Created at","Created At","created_at","Settlement Date"],
  ticker: ["ticker","Ticker","Symbol","Instrument","Security","Description","Product","Asset","Asset Name","Product Name","RIC","ISIN","SEDOL"],
  quantity: ["quantity","qty","Qty","Units","Quantity","Shares","Filled Qty","Filled Quantity","Units Filled","Amount (Qty)","Size","No. of shares","No of shares","Amount","Filled","Quantity Transacted","Quantity Transacted (asset)","Crypto Amount","Asset Amount","Quantity (Asset)"],
  price: ["price","Price","Price per share","Price per s","Rate","OpenRate","Open Rate","Execution Price","Average Price","Avg price","Fill Price","Trade Price","Price (Average)","Spot Price at Transaction","Spot Price","Unit Price"],
  total: ["total","Total","Total Amount","Amount","Cash Amount","Gross Amount","Proceeds","Net Amount","Consideration","Value","Value of trade","Subtotal","Total (inclusive of fees)","Total (incl. fees)","Fees"],
  type: ["type","Type","Action","Side","Buy/Sell","Transaction Type","Direction","Activity","Operation","Order Type","Order Action","Record Type","Details"],
  asset: ["asset","Asset","Kind","Type","Asset Type","Market","Asset Class","Product Type","Base Asset"],
  currency: ["currency","Currency","Ccy","CCY","Currency Code","Settlement Currency","Cash Currency","Spot Price Currency","Quote Currency","Counter Asset"],
  id: ["id","ID","Order ID","Trade ID","Reference","Position ID","OrderNumber","Transaction ID","External ID"],
};
function detectBroker(headers){
  const H = headers.map(h => (h||"").toLowerCase());
  const has = (...names) => names.some(n => H.includes(n.toLowerCase()));
  if (has("product","side") && has("created at","created_at")) return "Coinbase-Advanced";
  if (has("transaction type") && has("spot price currency","spot price at transaction","quantity transacted")) return "Coinbase-Retail";
  if (has("open rate","position id")) return "eToro";
  if (has("instrument","average price")) return "Revolut";
  if (has("symbol","proceeds")) return "IBKR";
  if (has("symbol","activity")) return "Robinhood";
  if (has("buy/sell") || has("direction")) return "Trading212/DEGIRO";
  return "Generic";
}
function toISO(s){
  const t = String(s||"").trim();
  if (!t) return "";
  if (/^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2}Z?)?$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (m){
    const [,d,mo,y,hh='00',mm='00',ss='00'] = m;
    const yyyy = y.length===2 ? Number("20"+y) : Number(y);
    const dt = new Date(Date.UTC(yyyy, Number(mo)-1, Number(d), Number(hh), Number(mm), Number(ss)));
    return isNaN(dt) ? t : dt.toISOString();
  }
  const dt = new Date(t);
  return isNaN(dt) ? t : dt.toISOString();
}
const isSellLike = s => /(sell|close|short|sell to close|sale|reduce)/i.test(String(s||""));
const isBuyLike  = s => /(buy|open|purchase|buy to open|advanced trade fill|trade|fill)/i.test(String(s||""));
const isNonTrade = s => /(dividend|interest|fee|commission|transfer|cash (in|out)|deposit|withdraw|reward|staking|promo|airdrop|receive|send|gift|convert)/i.test(String(s||""));

function buildTicker(tickRaw, asset, currency, brokerHint, kind){
  let s = (tickRaw || "").toString().trim();
  if (!s && asset){
    const base = String(asset).toUpperCase().replace(/\s+/g,"");
    const quote = String(currency||"USD").toUpperCase().replace(/\s+/g,"");
    if (base && quote) s = `${base}-${quote}`;
  }
  s = s.replace(/\s+/g,"").replace(/\.US$|\.L$|\.DE$|\.MI$|\.AS$|\.PA$|\.SW$|\.TO$|\.HK$|\.JP$/i, "");
  if (/^[A-Z]{2,6}[-/][A-Z]{2,6}$/i.test(s)){ const [b,q] = s.split(/[-/]/); return `${b.toUpperCase()}-${q.toUpperCase()}`; }
  if (/^[A-Z]{2,6}[A-Z]{2,6}$/i.test(s) && (brokerHint?.startsWith("Coinbase") || kind==="crypto")){
    const mid = Math.floor(s.length/2); return `${s.slice(0,mid).toUpperCase()}-${s.slice(mid).toUpperCase()}`;
  }
  return s.toUpperCase();
}
function normaliseRow(row, brokerHint){
  let typeRaw = (pick(row, CSV_FIELDS.type) || "").toString();
  let tickRaw = (pick(row, CSV_FIELDS.ticker) || "").toString();
  let qtyRaw  = pick(row, CSV_FIELDS.quantity);
  let priceRaw= pick(row, CSV_FIELDS.price);
  let totalRaw= pick(row, CSV_FIELDS.total);
  let dateRaw = pick(row, CSV_FIELDS.date);
  let asset   = (pick(row, CSV_FIELDS.asset) || "").toString();
  let ccyRaw  = (pick(row, CSV_FIELDS.currency) || "USD").toString();
  const idRaw = (pick(row, CSV_FIELDS.id) || "").toString();

  if (brokerHint === "Coinbase-Advanced"){
    typeRaw = String(row.Side ?? typeRaw);
    tickRaw = String(row.Product ?? tickRaw);
    qtyRaw  = row.Size ?? qtyRaw;
    priceRaw= row.Price ?? priceRaw;
    dateRaw = row["Created at"] ?? row["Created At"] ?? row["created_at"] ?? dateRaw;
  }
  if (brokerHint === "Coinbase-Retail"){
    typeRaw  = String(row["Transaction Type"] ?? typeRaw);
    asset    = String(row.Asset ?? asset);
    qtyRaw   = row["Quantity Transacted"] ?? row["Quantity Transacted (asset)"] ?? row["Crypto Amount"] ?? row["Asset Amount"] ?? qtyRaw;
    priceRaw = row["Spot Price at Transaction"] ?? row["Spot Price"] ?? priceRaw;
    dateRaw  = row.Timestamp ?? row["Timestamp (UTC)"] ?? row.Time ?? dateRaw;
    ccyRaw   = row["Spot Price Currency"] ?? row["Quote Currency"] ?? ccyRaw;
  }

  if (isNonTrade(typeRaw)) return { skipReason: "non-trade activity" };
  const maybe = String(typeRaw||"").toLowerCase();
  if (!(isBuyLike(typeRaw) || isSellLike(typeRaw)) && !/trade|order|fill|execution/i.test(maybe)) {
    return { skipReason: "unrecognised activity" };
  }

  let qty   = parseNumber(qtyRaw);
  let price = parseNumber(priceRaw);
  const total = parseNumber(totalRaw);
  if (isNaN(price) && !isNaN(total) && !isNaN(qty) && qty) price = total / Math.abs(qty);
  if (isNaN(qty))  return { skipReason: "missing quantity" };
  if (isNaN(price)) return { skipReason: "missing price/total" };

  qty = isSellLike(typeRaw) ? -Math.abs(qty) : Math.abs(qty);
  const kindGuess = /crypto|coin|btc|eth|usd-|eur-|gbp-|usdt|usdc/i.test((asset+" "+tickRaw+" "+brokerHint)) ? "crypto" : "stock";
  const ccy = ccyRaw ? ccyRaw.toUpperCase() : "USD";
  const ticker = buildTicker(tickRaw, asset, ccy, brokerHint, kindGuess);
  if (!ticker) return { skipReason: "missing ticker/asset" };

  return { date: toISO((dateRaw||"").toString()), ticker, quantity: qty, price,
           mock: String(row.mock || row.Mock || "").toLowerCase()==="true",
           kind: kindGuess, ccy, brokerRef: idRaw };
}

/* ---------------------------- Tabs ---------------------------- */
function showView(name){
  els.tabs.forEach(b => {
    const active = b.dataset.tab === name;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });
  if (els.dashboard) els.dashboard.style.display = name==='dashboard' ? 'block' : 'none';
  if (els.live)      els.live.style.display      = name==='live'      ? 'block' : 'none';
}
els.tabs.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.tab)));
showView('dashboard');

/* ------------------------ Typeahead ------------------------ */
let searchTimer = null;
if (els.tickerInput){
  els.tickerInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    const q = els.tickerInput.value.trim();
    if (!q) return (els.tickerList && (els.tickerList.innerHTML = ""));
    searchTimer = setTimeout(async () => {
      try {
        const items = asArray(await fetchJson(API('/api/search', { q })));
        if (!els.tickerList) return;
        els.tickerList.innerHTML = "";
        for (const it of items) {
          searchCache[it.symbol] = it;
          const opt = document.createElement("option");
          opt.value = it.symbol; opt.label = it.name;
          els.tickerList.appendChild(opt);
        }
      } catch { if (els.tickerList) els.tickerList.innerHTML = ""; }
    }, 250);
  });
  els.tickerInput.addEventListener("change", () => {
    const sym = els.tickerInput.value.trim().toUpperCase();
    const info = searchCache[sym];
    if (info){
      if (els.kind && info.type) els.kind.value = info.type || "stock";
      if (els.ccy  && info.currency) els.ccy.value = info.currency;
    }
  });
}

/* ------------------------ Renderers ------------------------ */
function renderTrades(){
  const tbody = els.tradesTbody;
  if (tbody){
    tbody.innerHTML = "";
    for (const t of trades){
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.date || ""}</td>
        <td>${t.ticker}</td>
        <td>${t.quantity}</td>
        <td>${Number(t.price).toFixed(2)}</td>
        <td>${t.mock ? "✓" : ""}</td>
        <td><button class="btn danger" data-id="${t.id || ""}" data-key="${t.key}">Delete</button></td>`;
      tbody.appendChild(tr);
    }
    tbody.querySelectorAll("button[data-id], button[data-key]").forEach(btn => {
      btn.addEventListener("click", () => deleteTrade(btn.dataset.id, btn.dataset.key));
    });
  }
  const legit = trades.filter(t => !t.mock);
  const totalInvested = legit.reduce((s,t) => s + (t.quantity * t.price), 0);
  if (els.invested) els.invested.textContent = money.format(totalInvested);
  if (els.tradeCount) els.tradeCount.textContent = String(trades.length);
  if (els.positionsCount) els.positionsCount.textContent = String(new Set(trades.map(t => t.ticker)).size);

  renderChart();
  renderPositions();
  renderNews();
  refreshLivePrices();
}

function renderChart(){
  const canvas = $('#asset-chart'); const ctx = canvas?.getContext("2d");
  if (!ctx) return; if (chart) chart.destroy();
  const rows = trades.filter(t => !t.mock);

  if (chartType === "pie"){
    const totals = {};
    for (const t of rows) totals[t.ticker] = (totals[t.ticker] || 0) + t.quantity * t.price;
    const labels = Object.keys(totals);
    const data = labels.map(k => Math.abs(totals[k]));
    const colors = labels.map((_,i) => `hsl(${(i*360)/Math.max(1,labels.length)},70%,60%)`);
    chart = new Chart(ctx, { type:"pie",
      data:{ labels, datasets:[{ data, backgroundColor: colors }]},
      options:{ plugins:{ legend:{ position:"bottom" } } }
    });
  } else {
    const dates   = [...new Set(rows.map(t => t.date))].sort();
    const tickers = [...new Set(rows.map(t => t.ticker))];
    const seriesByTicker = {};
    for (const tk of tickers){
      let running = 0; const s = [];
      for (const d of dates){
        for (const r of rows) if (r.ticker===tk && r.date===d) running += r.quantity * r.price;
        s.push(running);
      }
      seriesByTicker[tk] = s;
    }
    const totalSeries = dates.map((_,i) => tickers.reduce((sum,tk) => sum + (seriesByTicker[tk][i]||0), 0));
    const colors = tickers.map((_,i)=>`hsl(${(i*360)/Math.max(1,tickers.length)},70%,50%)`);
    const datasets = tickers.map((tk,i)=>({ label:tk, data:seriesByTicker[tk], borderColor:colors[i], backgroundColor:"transparent", fill:false, tension:.2, pointRadius:2 }));
    datasets.push({ label:"Total", data: totalSeries, borderColor:"#9aa4b3", borderWidth:3, borderDash:[6,4], backgroundColor:"transparent", fill:false, tension:.2, pointRadius:0 });
    chart = new Chart(ctx, { type:"line",
      data:{ labels:dates, datasets },
      options:{ plugins:{ legend:{ position:"bottom" }},
        scales:{ y:{ ticks:{ callback:v=>{ try{return money.format(v);}catch{return v;} } } },
                 x:{ ticks:{ callback:(v,i)=>{ const raw=dates[i]; const d=/\d{4}-\d{2}-\d{2}T/.test(raw)? new Date(raw):null; return d && !isNaN(d) ? d.toLocaleDateString() : raw; }, maxRotation:45 } } }
      }
    });
  }
  const note = $('#chart-note');
  if (note) note.textContent = "Line shows cash invested over time (mock trades excluded).";
}

function renderPositions(){
  const box = els.positionsBox; if (!box) return; box.innerHTML = "";
  const by = {};
  for (const t of trades){ const sym = (t.ticker||'').toUpperCase(); (by[sym] = by[sym] || []).push(t); }

  for (const [ticker, rows] of Object.entries(by)){
    const qty = rows.reduce((s,r)=>s+r.quantity,0);
    const invested = rows.reduce((s,r)=>s+r.quantity*r.price,0);
    const avg = qty ? invested/qty : 0;

    const legit = rows.filter(r=>!r.mock);
    const liveQty = legit.reduce((s,r)=>s+r.quantity,0);
    const liveInvested = legit.reduce((s,r)=>s+r.quantity*r.price,0);
    const q = liveQuotes.get(ticker);
    let plStr = '';
    if (q && q.price!=null && liveQty){
      const mv = liveQty * Number(q.price);
      const pl = mv - liveInvested;
      const pct = liveInvested ? (pl/liveInvested)*100 : null;
      plStr = ` • P/L: ${money.format(pl)}${pct!=null?` (${pl>=0?'+':''}${pct.toFixed(2)}%)`:''}`;
    }

    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = `${ticker} — Qty: ${qty.toFixed(4)} • Avg: ${avg.toFixed(2)}${plStr}`;
    details.appendChild(summary);

    const t = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr><th>Date</th><th>Qty</th><th>Price</th><th>Mock</th><th>Delete</th></tr>`;
    const tbody = document.createElement("tbody");

    for (const r of rows){
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.date || ""}</td>
        <td>${r.quantity}</td>
        <td>${r.price.toFixed(2)}</td>
        <td>${r.mock ? "✓" : ""}</td>
        <td><button class="btn danger" data-id="${r.id || ""}" data-key="${r.key}">Delete</button></td>`;
      tbody.appendChild(tr);
    }
    t.appendChild(thead); t.appendChild(tbody); details.appendChild(t); box.appendChild(details);
    tbody.querySelectorAll("button[data-id], button[data-key]").forEach(btn => btn.addEventListener("click", () => deleteTrade(btn.dataset.id, btn.dataset.key)));
  }
}

/* ---------------------- Live prices / P&L ---------------------- */
const getSymbolsFromTrades = () => [...new Set(trades.map(t => (t.ticker||'').trim().toUpperCase()).filter(Boolean))];

function renderPortfolioPL(){
  if (!els.plAmount || !els.plPercent) return;
  const rows = trades.filter(t=>!t.mock);
  if (!rows.length){ els.plAmount.textContent='—'; els.plPercent.textContent=''; els.plAmount.style.color=''; els.plPercent.style.color=''; return; }

  const by = {};
  for (const t of rows){ const s=(t.ticker||'').toUpperCase(); (by[s] ||= {qty:0,invested:0}); by[s].qty += t.quantity; by[s].invested += t.quantity*t.price; }

  let investedUsed = 0, marketValue = 0;
  for (const [sym, acc] of Object.entries(by)){
    if (!acc.qty) continue;
    const q = liveQuotes.get(sym);
    if (!q || q.price==null) continue;
    investedUsed += acc.invested;
    marketValue  += acc.qty * Number(q.price);
  }
  if (!investedUsed){ els.plAmount.textContent='—'; els.plPercent.textContent=''; els.plAmount.style.color=''; els.plPercent.style.color=''; return; }

  const pl = marketValue - investedUsed;
  const pct = (pl / investedUsed) * 100;
  els.plAmount.textContent = money.format(pl);
  els.plPercent.textContent = `${pl>=0?'+':''}${pct.toFixed(2)}%`;
  const col = pl>0 ? '#12a150' : pl<0 ? '#d11' : '';
  els.plAmount.style.color = col; els.plPercent.style.color = col;
}

function renderLiveUnavailable(msg='Live unavailable'){
  if (!els.liveTbody) return;
  els.liveTbody.innerHTML = `<tr><td colspan="3" style="opacity:.7">${msg}</td></tr>`;
}
function renderMostTradedUnavailable(msg='Feed error'){
  if (!els.mostTradedTbody) return;
  els.mostTradedTbody.innerHTML = `<tr><td colspan="6" style="opacity:.7">${msg}</td></tr>`;
}

async function refreshLivePrices(){
  if (!els.liveTbody) return;
  const symbols = getSymbolsFromTrades();
  if (!symbols.length){ renderLiveUnavailable('No symbols'); renderPortfolioPL(); return; }
  if (!navigator.onLine){ renderLiveUnavailable('Offline'); return; }

  try {
    const data = asArray(await fetchJson(API('/api/quote',{ symbols: symbols.join(',') })));
    liveQuotes.clear(); for (const q of data) if (q?.symbol) liveQuotes.set(String(q.symbol).toUpperCase(), q);

    els.liveTbody.innerHTML = '';
    if (!data.length) renderLiveUnavailable('No data');
    else for (const q of data){
      const price = q.price==null ? '—' : Number(q.price).toFixed(2);
      const chgPct = q.changePct==null ? null : Number(q.changePct);
      const change = chgPct==null ? '—' : `${chgPct>=0?'+':''}${chgPct.toFixed(2)}%`;
      const chgCls = chgPct==null ? '' : (chgPct>0 ? 'chg-pos' : 'chg-neg');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><a href="https://finance.yahoo.com/quote/${encodeURIComponent(q.symbol)}" target="_blank" rel="noopener">${q.symbol}</a>${q.currency?` <span class="badge">${q.currency}</span>`:''}</td>
        <td class="num">${price}</td>
        <td class="num ${chgCls}">${change}</td>`;
      els.liveTbody.appendChild(tr);
    }
    renderPortfolioPL(); renderPositions();
  } catch (err){
    console.error('quote error:', err);
    renderLiveUnavailable('Network/Feed error');
    renderPortfolioPL();
  }
}

async function refreshMostTraded(){
  if (!els.mostTradedTbody) return;
  if (!navigator.onLine) return renderMostTradedUnavailable("Offline");
  try {
    const data = asArray(await fetchJson(API('/api/most-traded', { count: 15, region: 'US' })));
    if (!data.length) return renderMostTradedUnavailable("No data");
    els.mostTradedTbody.innerHTML = "";
    for (const row of data){
      const price = row.price==null ? "—" : Number(row.price).toFixed(2);
      const chgPct = row.changePct==null ? null : Number(row.changePct);
      const chgTxt = chgPct==null ? "—" : `${chgPct>=0?"+":""}${chgPct.toFixed(2)}%`;
      const chgCls = chgPct==null ? "" : (chgPct>0 ? "chg-pos" : "chg-neg");
      const volFull = (row.volume ?? '').toLocaleString?.() || String(row.volume ?? '');
      const mktFull = (row.marketCap ?? '').toLocaleString?.() || String(row.marketCap ?? '');
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="num">${row.rank ?? ''}</td>
        <td><a href="https://finance.yahoo.com/quote/${encodeURIComponent(row.symbol)}" target="_blank" rel="noopener">${row.symbol}</a>${row.currency?` <span class="badge">${row.currency}</span>`:""}</td>
        <td class="num">${price}</td>
        <td class="num ${chgCls}">${chgTxt}</td>
        <td class="num" title="${volFull}">${abbr(row.volume)}</td>
        <td class="num" title="${mktFull}">${abbr(row.marketCap)}</td>`;
      els.mostTradedTbody.appendChild(tr);
    }
  } catch (err){
    console.error('most-traded error:', err);
    renderMostTradedUnavailable("Network/Feed error");
  }
}
setInterval(refreshLivePrices, 30_000);
setInterval(refreshMostTraded, 60_000);

/* ---------------------------- News ---------------------------- */
async function renderNews(){
  if (!els.newsCards) return;
  els.newsCards.innerHTML = '';
  const tickers = getSymbolsFromTrades();
  if (!tickers.length){ els.newsCards.textContent = "No news yet."; return; }

  try {
    const items = asArray(await fetchJson(API('/api/news',{ tickers: tickers.join(','), limit:20 })));
    if (!items.length){ els.newsCards.textContent = "No news yet."; return; }

    for (const n of items){
      const card = document.createElement('article'); card.className = 'news-card';
      if (n.image){
        const img = document.createElement('img');
        img.className = 'news-card__img'; img.loading = 'lazy'; img.alt = '';
        img.referrerPolicy = 'no-referrer'; img.src = n.image; card.appendChild(img);
      }
      const body = document.createElement('div');
      const h3 = document.createElement('h3'); h3.className = 'news-card__title'; h3.textContent = n.title || '(untitled)';
      const meta = document.createElement('div'); meta.className = 'news-card__meta';
      const span = document.createElement('span'); span.textContent = n.source || '';
      meta.appendChild(span);
      if (n.publishedAt){
        const time = document.createElement('time'); time.setAttribute('datetime', n.publishedAt);
        time.textContent = ` • ${new Date(n.publishedAt).toLocaleDateString()}`; meta.appendChild(time);
      }
      const a = document.createElement('a'); a.className = 'news-card__link'; a.target = '_blank'; a.rel='noopener'; a.href = n.url; a.textContent='Read';
      body.appendChild(h3); body.appendChild(meta); body.appendChild(a); card.appendChild(body);
      els.newsCards.appendChild(card);
    }
  } catch (err){
    console.error('news error:', err);
    els.newsCards.textContent = "News unavailable.";
  }
}

// ===== Price Pipeline Health =====
(function mountPriceHealth(){
  const wrap = document.getElementById('health-card');
  const body = document.getElementById('health-body');
  if (!wrap || !body) return;

  // --- UI bits we add once and reuse ---
  const titleEl = wrap.querySelector('.card-title') || wrap.querySelector('h2');
  const spinner = document.createElement('span');
  spinner.className = 'health-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  // don’t add twice if HMR/soft-reloads
  if (titleEl && !titleEl.querySelector('.health-spinner')) titleEl.appendChild(spinner);

  const updated = document.createElement('div');
  updated.id = 'health-updated';
  updated.className = 'health-updated muted';
  updated.setAttribute('aria-live', 'polite');
  if (!wrap.querySelector('#health-updated')) wrap.appendChild(updated);

  // --- Options / helpers ---
  const FRESH_MS = 5 * 60 * 1000; // 5 minutes

  const fmtTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(Number(ts));
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString([], { hour12:false });
  };
  const nowFresh = (ts) => !!ts && (Date.now() - Number(ts)) < FRESH_MS;

  function badge(kind, label, meta){
    const span = document.createElement('span');
    span.className = `badge ${kind}`;       // success | warn | danger
    span.textContent = label;               // Fresh | Fallback | Unhealthy
    // Accessibility + hover details
    const aria = `${meta.provider.toUpperCase()} status: ${label}`;
    span.setAttribute('aria-label', aria);
    const tt = [
      `Provider: ${meta.provider.toUpperCase()}`,
      `Last success: ${fmtTime(meta.lastSuccess)}`,
      `Last failure: ${fmtTime(meta.lastFailure)}`,
      `Active fallback: ${meta.activeFallback ? 'Yes' : 'No'}`,
      `Failures (window): ${meta.failureCount ?? 0}`
    ].join('\n');
    span.title = tt;
    return span;
  }

  function row(providerLabel, stateMeta){
    const row = document.createElement('div');
    row.className = 'health-row';
    const name = document.createElement('strong');
    name.textContent = providerLabel;
    name.style.minWidth = '6rem';
    name.style.display = 'inline-block';
    row.appendChild(name);

    // decide chip style/label
    let kind = 'danger', label = 'Unhealthy';
    if (stateMeta.fresh)     { kind = 'success'; label = 'Fresh'; }
    if (stateMeta.fallback)  { kind = 'warn';    label = 'Fallback'; }

    row.appendChild(badge(kind, label, stateMeta));
    return row;
  }

  async function refresh(){
    try{
      spinner.classList.add('on');

      const res = await fetch('/api/health-price', { cache: 'no-store' });
      if (!res.ok) throw new Error('health_http_'+res.status);
      const j = await res.json();

      // shape map: { yahoo: {...}, chart: {...}, stooq: {...} }
      const map = Object.fromEntries((j.providers || []).map(p => [p.provider, p]));

      // Provider freshness (within window)
      const yahooFresh = nowFresh(map.yahoo?.lastSuccess) || nowFresh(map.chart?.lastSuccess);
      const chartFresh = nowFresh(map.chart?.lastSuccess);
      const stooqFresh = nowFresh(map.stooq?.lastSuccess);

      // Degraded state: show AMBER when fallback is actively used
      const chartFallback = !!map.chart?.activeFallback && chartFresh;
      const stooqFallback = !!map.stooq?.activeFallback && stooqFresh;

      // Build rows
      body.innerHTML = '';
      body.appendChild(row('YAHOO', {
        provider: 'yahoo',
        fresh: yahooFresh,
        // we do not mark Yahoo as fallback unless you want to—spec requested CHART/STOOQ
        fallback: false,
        ...map.yahoo
      }));
      body.appendChild(row('CHART', {
        provider: 'chart',
        fresh: chartFresh,
        fallback: chartFallback,
        ...map.chart
      }));
      body.appendChild(row('STOOQ', {
        provider: 'stooq',
        fresh: stooqFresh,
        fallback: stooqFallback,
        ...map.stooq
      }));

      updated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour12: false })}`;
    } catch (e){
      body.innerHTML = '';
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = 'Health unavailable';
      body.appendChild(p);
      updated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour12: false })}`;
      console.warn('health refresh failed', e);
    } finally {
      spinner.classList.remove('on');
    }
  }

  // initial + polling
  refresh();
  setInterval(refresh, 15_000);
})();



/* --------------------------- Mutations --------------------------- */
async function addTrade(trade){
  trade.kind = trade.kind || els.kind?.value || "stock";
  trade.ccy  = trade.ccy  || els.ccy?.value || "USD";
  trade.key  = await tradeKey(trade);
  if (tradeKeys.has(trade.key)) return;
  tradeKeys.add(trade.key);

  if (cloudEnabled && auth?.currentUser && db){
    const doc = await db.collection("trades").add({ ...trade, uid: auth.currentUser.uid });
    trade.id = doc.id;
  } else {
    // local id (non-guessable)
    const buf = new Uint8Array(8); crypto.getRandomValues(buf);
    trade.id = `${Date.now()}-${Array.from(buf).map(b=>b.toString(16).padStart(2,'0')).join('')}`;
  }
  trades.push(trade); renderTrades();
}
function deleteTrade(id, key){
  const idx = trades.findIndex(t => (id && t.id===id) || (key && t.key===key));
  if (idx < 0) return;
  const removed = trades.splice(idx,1)[0];
  if (removed?.key) tradeKeys.delete(removed.key);
  renderTrades();
  if (cloudEnabled && auth?.currentUser && db && removed?.id){
    db.collection("trades").doc(removed.id).delete().catch(()=>{});
  }
}

/* ---------------------------- Events ---------------------------- */
els.chartType?.addEventListener("change", () => { chartType = els.chartType.value; renderChart(); });

els.tradeForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const trade = {
    date: els.date?.value || new Date().toISOString().slice(0,10),
    ticker: els.tickerInput?.value.trim().toUpperCase(),
    quantity: parseNumber(els.qty?.value),
    price: parseNumber(els.price?.value),
    mock: !!els.mock?.checked,
  };
  if (!trade.ticker || isNaN(trade.quantity) || isNaN(trade.price)) return;
  await addTrade(trade);
  e.target.reset();
});

/* ------------------------ CSV Import (Papa) ------------------------ */
els.csvFile?.addEventListener("change", async () => {
  const file = els.csvFile.files?.[0]; if (!file) return;
  if (!/\.csv$/i.test(file.name)) { alert("Please select a .csv file"); els.csvFile.value=""; return; }
  if (file.size > 8 * 1024 * 1024) { alert("CSV too large (8MB limit)"); els.csvFile.value=""; return; }
  if (await alreadyImported(file)){ alert("Already imported"); els.csvFile.value=""; return; }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (res) => {
      const headers = res.meta?.fields || [];
      const brokerHint = detectBroker(headers);
      const report = { brokerDetected: brokerHint, rows: res.data.length, added: 0, skipped: 0 };
      const reasons = Object.create(null);

      for (const row of res.data){
        const norm = normaliseRow(row, brokerHint);
        if (!norm || norm.skipReason){
          const r = (norm && norm.skipReason) || "unknown";
          report.skipped++; reasons[r] = (reasons[r] || 0) + 1; continue;
        }
        await addTrade(norm); report.added++;
      }
      els.csvFile.value = "";
      console.table([report]);
      console.table(Object.entries(reasons).map(([reason,count]) => ({ reason, count })));
      alert(`Import complete\nBroker: ${brokerHint}\nRows: ${report.rows}\nAdded: ${report.added}\nSkipped: ${report.skipped}`);
    }
  });
});

/* ------------------------------ Auth ------------------------------ */
function wireAuthHandlers(){
  if (!cloudEnabled || !auth || !db) return;

  els.signIn?.addEventListener("click", async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try { await auth.signInWithPopup(provider); }
    catch (err) {
      const msg = String(err?.message || "").toLowerCase();
      if (msg.includes("popup")) await auth.signInWithRedirect(provider);
      else alert("Sign-in failed");
    }
  });
  els.signOut?.addEventListener("click", () => auth.signOut());
  els.deleteAccount?.addEventListener("click", async () => {
    const user = auth?.currentUser; if (!user) return;
    if (!confirm("Delete your account (and trades)? This cannot be undone.")) return;
    try { await user.delete(); }
    catch (err){
      if (err?.code === "auth/requires-recent-login"){
        try { const provider = new firebase.auth.GoogleAuthProvider(); await user.reauthenticateWithPopup(provider); await user.delete(); }
        catch { alert("Deletion cancelled or failed during re-auth."); }
      } else alert("Account deletion failed.");
    }
  });

  auth.onAuthStateChanged((user) => {
    if (user){
      els.profile?.classList.remove('hidden'); if (els.profile) els.profile.style.display='flex';
      els.authContainer?.classList.add('hidden'); if (els.authContainer) els.authContainer.style.display='none';
      if (els.userEmail) els.userEmail.textContent = user.email || "";

      if (unsubscribeTrades) unsubscribeTrades();
      unsubscribeTrades = db.collection("trades").where("uid","==",user.uid)
        .onSnapshot(async snap => {
          trades.length = 0; tradeKeys.clear();
          for (const doc of snap.docs){
            const data = doc.data();
            const key = data.key || await tradeKey(data);
            if (tradeKeys.has(key)) continue;
            tradeKeys.add(key);
            trades.push({ id: doc.id, ...data, key });
          }
          renderTrades();
        });
    } else {
      els.profile?.classList.add('hidden'); if (els.profile) els.profile.style.display='none';
      els.authContainer?.classList.remove('hidden'); if (els.authContainer) els.authContainer.style.display='flex';
      trades.length = 0; tradeKeys.clear(); renderTrades(); if (unsubscribeTrades) unsubscribeTrades();
    }
  });
}

/* ------------------------------ PWA ------------------------------ */
if ("serviceWorker" in navigator){
  navigator.serviceWorker.register("./service-worker.js?sw=13").catch(()=>{});
}

/* ------------------------------ Bootstrap ------------------------------ */
/* ------------------------------ Bootstrap ------------------------------ */
(async function bootstrap(){
  try {
    const cfg = await loadFirebaseConfig();
    if (cfg){
      firebase.initializeApp(cfg);
      auth = firebase.auth(); db = firebase.firestore();
      cloudEnabled = true;
    } else {
      cloudEnabled = false;
      console.info("Local mode (no Firebase).");
    }
  } catch (e){
    cloudEnabled = false; console.info("Local mode (Firebase init failed).", e);
  }

  // Initial renders
  renderTrades();
  refreshMostTraded();
  refreshLivePrices();
  renderPortfolioPL();

  // Auth (only when available)
  wireAuthHandlers();
})();

