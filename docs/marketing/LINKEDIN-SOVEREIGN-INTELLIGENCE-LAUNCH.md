# [Marketing] Operation "Sovereign Intelligence": LinkedIn Launch

**Status:** Ready for Execution  
**Owner:** Marketing / Design Team  
**Deliverable:** LinkedIn Post + Visual Asset

---

## 1. Strategy

Position Pocket Portfolio as the leader in **Privacy-First Financial AI**. Hook: sending raw financial data to cloud LLMs is a security flaw. Solution: **Hybrid RAG** — data stays in the browser (IndexedDB), only sanitized context goes to the LLM.

---

## 2. Visual Assets (Ready in Repo)

| Asset | Path | Use |
|------|------|-----|
| **Hybrid RAG 1200×628** | `docs/marketing/Sovereign_Intelligence_Hybrid_RAG_1200x628.png` | LinkedIn single-image post (landscape). |
| **Hybrid RAG 1080×1080** | `docs/marketing/Sovereign_Intelligence_Hybrid_RAG_1080x1080.png` | Alternative square format. |
| **5-slide PDF carousel** | Run `npm run book:carousel:si` → `docs/marketing/Sovereign_Intelligence_Architecture.pdf` | Optional; same pattern as Universal LLM Import. |

Regenerate PNGs: `node scripts/export-si-hybrid-rag-for-linkedin.mjs`

---

## 3. LinkedIn Post Copy (Copy-Paste Ready)

**Headline:**  
Sending your financial ledger to an LLM is a privacy nightmare.

**Body:**

The industry standard for building AI apps is to ship raw user data to the cloud. In fintech, this breaks the fundamental rule of data sovereignty.

We built a different architecture. We call it **Local-First RAG**.

Instead of moving your data to the AI, we move the AI's reasoning to your data.

Today, we are publishing the complete production blueprint of how we built Pocket Analyst—an in-browser quantitative assistant powered by Gemini 1.5.

**Sovereign Intelligence: Building Local-First RAG for Finance** is a free, 25,000-word technical reference covering:

🔹 **The Context Engine:** Compressing 10,000 local trades into a token-efficient summary, entirely in the browser.
🔹 **Transient File I/O:** Parsing massive CSVs client-side without ever touching a server disk.
🔹 **AI Grounding:** Merging local portfolio context with live market search data.

This isn't a theoretical whitepaper. It is the exact architecture running in production at Pocket Portfolio today.

📖 **Read the complete blueprint for free:**
https://www.pocketportfolio.app/book/sovereign-intelligence

#Fintech #LocalFirst #AI #RAG #Nextjs #SovereignData #Engineering

---

## 4. Execution Checklist

1. **Design:** Use the Hybrid RAG PNG (1200×628 or 1080×1080) from `docs/marketing/`. Optionally run `npm run book:carousel:si` to generate the 5-slide PDF (run from repo root; requires Chrome/Puppeteer).
2. **Post:** Upload the chosen visual to the Pocket Portfolio LinkedIn page.
3. **Paste:** Insert the exact copy above. Keep line breaks for mobile readability.
4. **Engage:** Core engineering team Like/Comment within the first 15 minutes to boost reach.

---

## 5. Suggested Engineer Comment (First 15 Minutes)

*"Figuring out how to sanitize the context payload in the browser without losing the financial signal was the hardest part of this build. Chapter 3 breaks down the exact code we used."*

---

## 6. Canonical Link

**Book:** https://www.pocketportfolio.app/book/sovereign-intelligence
