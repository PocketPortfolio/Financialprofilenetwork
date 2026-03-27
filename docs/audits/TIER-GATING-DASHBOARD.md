# Paid-tier gating audit (dashboard & related)

**Paid access** is defined in `app/lib/tier.ts` as `isPaidTier`: `foundersClub` or `corporateSponsor` only.  
`codeSupporter`, `featureVoter`, and `null` are treated as free for these surfaces.

## Client UI

| Surface | Gate | Notes |
|--------|------|--------|
| `AnalyticsPanel` | `isPremium` from `isPaidTier(tier)` | Premium metrics show `—` (no values in DOM). |
| `AnalyticsDashboard` (Insights) | `isPaidTier(tier)` | Paywall + no sector/beta charts for free. |
| `AllocationRecommendations` | Wrapped in `isPaidTier(tier)` on dashboard | Was previously always visible on Insights. |
| `usePremiumTheme` | See below | **Critical:** API returning free must call `setTier(null)` (see root-cause note). |
| `PocketAnalystProvider` / Ask AI | `isPaidTier(tier)` for `isPaid` | Modal receives quota; FAB always visible if logged in (product choice). |

### Root cause (fixed): stale `tier` in React state

When `/api/api-keys/user` returned `{ tier: null }`, the hook cleared `localStorage` but **did not** set `setTier(null)` / `setUnlockedTheme(null)`. React state could keep `foundersClub` from a previous session, so free users still saw premium UI. Also removed pre-API **localStorage hydration** that ran while auth was still loading.

### Error / non-OK responses

For authenticated users, non-OK responses (except 503 cache fallback for anonymous) clear tier state so **false premium** is not preferred over a transient API failure.

## Server (must remain authoritative)

| Route | Enforcement |
|-------|-------------|
| `app/api/ai/chat/route.ts` | `isPaid` from tier; free quota. |
| `app/api/ai/usage/route.ts` | Same pattern. |
| `app/api/metrics/export/route.ts` | Stripe / tier checks for exports. |

## Manual smoke (free test account)

1. Sign in with an account with no paid subscription; clear `localStorage` keys `pocket-portfolio-tier*` if testing stale cache.
2. Dashboard: confirm **Total / Daily / All-time** visible; **annualized, volatility, Sharpe, beta, max drawdown** show `—`.
3. **Insights** tab: upgrade CTA only; no sector donut or portfolio beta card.
4. Ask AI: limited quota; no unlimited paid behavior.
