<!-- CoderLegion: title=Why We Bet on CSV over APIs | date=2026-02-13 | tags=csv, apis, plaid, data-sovereignty, local-first -->

# Why We Bet on CSV over APIs

Integrating Plaid—or any broker API—is a nightmare. OAuth changes, rate limits, schema updates, deprecations, or the provider shutting the integration down. Every integration is a long-term liability. A small team cannot realistically maintain dozens of broker APIs. **We bet on CSV instead.**

## Fragility of financial APIs

Broker and bank APIs are **permissioned, versioned, and revocable.** They break for many reasons: OAuth changes, rate limits, schema updates, deprecations, or the provider shutting the integration down. With CSV, the only dependency is that the user can export a file from their broker; the product does not depend on any third-party API being up or compliant.

## CSV as sovereign, user-owned format

CSV is **user-owned.** The user exports from their broker or bank and holds the file. No ongoing API key, no re-auth, no vendor in the loop. The product only needs to **interpret** the file. That aligns with local-first and data sovereignty: the canonical copy is the user's file; the app assists locally.

**Trade-off.** We give up live sync and automatic refresh. In return we get ownership, longevity, and no dependency on a third party keeping an API alive. For evidence-first investing and long-lived portfolios, that trade-off is intentional.

## Why "sovereign" matters for compliance

When the user holds the file, data minimization is straightforward: the app never receives the full history unless the user explicitly uploads it (and in our design, even then the full CSV stays in the browser). There is no ongoing data pipeline from a third party. Regulators and privacy-conscious users see a clear boundary: the user's device and their chosen storage (e.g. Drive), not the vendor's servers holding a copy of their trades.

APIs give real-time data and automatic sync but at the cost of fragility and vendor control. CSV gives user-owned, portable data and a stable integration surface (the file format) but requires the user to export and upload. **Universal Import optimizes for the CSV side:** we make CSV ingestion so robust (schema inference, mapping UI, locale-aware parse) that the lack of live sync is an acceptable trade for sovereignty and maintainability.

---

*Part 2 of the **Sovereign Serial**. Adapted from [Universal LLM Import](https://www.pocketportfolio.app/book/universal-llm-import).*

**Read the full [Bestseller Edition](https://www.pocketportfolio.app/book/universal-llm-import) or [Try the app](https://www.pocketportfolio.app).**
