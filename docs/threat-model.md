# Threat Model v0.1

## Assets
- User-imported CSVs and derived positions
- Auth sessions (Firebase)
- Quote pipeline (Yahoo, CoinGecko, OXR)
- Admin routes/secrets

## Trust boundaries
- Browser ↔ Serverless API
- API ↔ Providers (Yahoo/CoinGecko/OXR)
- API ↔ Firebase/Firestore

## Key threats & mitigations
1. Account/session theft → strict CSP, `SameSite=Lax`, no third-party iframes
2. Supply chain → dependency review, secret scanning
3. API abuse → token bucket rate limit, IP backoff
4. Stale/poisoned data → provider scoring + quarantine; LKG cache; UI staleness badge
5. Sensitive data exposure → contributor privacy rules; redaction templates

## SLA
- Quotes “fresh” ≤ 30s; otherwise marked **stale** in UI.

## Testing
- Weekly ZAP baseline; Playwright smoke; CSV validator for imports
