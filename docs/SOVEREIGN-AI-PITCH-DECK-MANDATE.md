# Sovereign AI Pitch Deck — Design Mandate

**To:** Design & Marketing Team  
**From:** Command Team  
**Subject:** EMERGENCY DECK REWRITE — UKRI Sovereign AI Pitch (Friday Deadline)  
**Reference:** Narrative and structure from `/sovereign-ai-grant` landing page.

---

We are killing the previous consumer B2C deck and the print-to-PDF workflow for this asset. Build a **native, high-fidelity pitch deck** in Figma, Canva, or PowerPoint using the narrative below. Export as a high-res PDF for the GrantTree call.

---

## Branding Mandate (Strict)

Do **not** use default PowerPoint templates. Apply these tokens to the slide master:

| Token | Value | Usage |
|-------|--------|--------|
| **Background** | `#111827` (deep dark gray / gray-900) | Deck must be dark mode. |
| **Primary text** | `#F3F4F6` (off-white / gray-100) | Body and headings. |
| **Accent** | `#F59E0B` (warm amber / amber-500) | Key metrics, icons, critical phrases only (e.g. "Zero Data Surrender"). |
| **Typography** | Massive, heavy, sans-serif for headers | No dense paragraphs; keep slides scannable. |
| **Icons** | Clean, minimalist line-art | Match Lucide-style (as used in-app). |

---

## Slide-by-Slide Copy

### Slide 1: Title / Hero

- **Headline:** Pocket Portfolio: A Proof-of-Concept for UK Sovereign AI Infrastructure
- **Subhead:** Demonstrating how the UK can build secure, user-owned financial data systems that deliver frontier AI capabilities—without depending on foreign hyperscalers for data retention.
- **Footer:** Confidential Pitch Deck | [Current Date]

---

### Slide 2: The Data Impact

*(Make the numbers massive and Amber.)*

- **0 Bytes:** Raw portfolio data stored on our servers.
- **100%:** User-owned data residency & control.
- **< 4KB:** Sanitized context string sent for stateless inference.

---

### Slide 3: The Paradigm Shift (Side-by-Side)

- **Left (The Old Way — muted colors):** Legacy platforms siphon your entire financial ledger to centralized, foreign cloud servers, stripping you of data sovereignty and creating massive security honeypots.
- **Right (The Sovereign Way — highlighted/Amber):** Pocket Portfolio processes the ledger strictly on-device, sending only a highly sanitized, stateless context string to the AI. Total intelligence, zero data surrender.

---

### Slide 4: Pillar 1 — Local-First Data Sovereignty

**Subhead:** Data stays on device; we never hold or process raw financial ledgers.

- **1.1 Data boundary at the edge:** Portfolio data lives in the user's browser (IndexedDB). We operate no central database.
- **1.2 User-owned storage:** Sync uses a single open-schema file (JSON/CSV). Zero vendor lock-in.
- **1.3 Minimal, auditable egress:** Only a sanitized context string leaves the device for AI inference.
- **1.4 Compliance-friendly residency:** UK users' data remains under their control, not shipped to foreign jurisdictions.

---

### Slide 5: Pillar 2 — Edge-Compute AI

**Subhead:** Context is built on-device; the cloud only sees a minimal, non-retained snapshot.

- **2.1 Client-side context engine:** The full portfolio is reduced to a token-bounded summary in the browser.
- **2.2 Stateless inference API:** Our endpoints are pure functions. Zero server-side storage of chat history.
- **2.3 Hybrid RAG with sovereign control:** The model reasons over local summaries plus public market data. No remote indexing of user data.
- **2.4 Scale-to-cloud boundaries:** Future deployments can use sovereign or on-prem LLMs without changing the client-side boundary.

---

### Slide 6: Pillar 3 — Open-Ecosystem Business Model

**Subhead:** Revenue from membership and services—not from data harvesting.

- **3.1 Open-source, auditable core:** Reviewers can verify how data is reduced and how the boundary is enforced.
- **3.2 Sovereignty-aligned revenue:** Subscriptions and enterprise tiers prove sovereign infrastructure can be financially self-sustaining.
- **3.3 Community governance:** Roadmap priorities are influenced by the community, ensuring scalable adoption without central control.
- **3.4 Reducing foreign tech reliance:** By keeping context construction on the client, core value does not depend on US/China hyperscalers.

---

### Slide 7: The Sovereign Architecture Flow (Visual)

**Design instruction:** Recreate the horizontal flowchart with icons.

**Flow:**  
[📱 User Device] → [⚙️ Context Engine] → **[ 🚧 THE DATA BOUNDARY ]** → [☁️ Stateless Cloud API]

**Label the arrow crossing the boundary:** "Sanitized Context Only"

---

### Slide 8: Grant Alignment & Next Steps

- **Proof of Concept:** Working local-first stack with stateless APIs.
- **Technical Validation:** Fully auditable codebase demonstrating egress limits.
- **Frontier AI Performance:** Hybrid RAG over sanitized context only.
- **Clear Path to Compute Access:** Data is 100% user-owned; compute can route to UK sovereign endpoints.

---

## Final Check

Export as a **native, high-res PDF**. This is the document the CEO must have open when he speaks to GrantTree on Friday.

---

*Source: Command Team Directive — Pitch Deck Overhaul & Design Mandate. Aligned with `app/sovereign-ai-grant/page.tsx`.*
