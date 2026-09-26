---
id: OP-CMD-MSFT-SYNC-EXEC-2026-09-26
title: Microsoft Identity + OneDrive Sovereign Sync — Command Execution Lock
status: CODE_SHIPPED_PENDING_PLATFORM_PHASE0
date: 2026-09-26
roles: [CEO, CPO, Eng, Platform, Head of AI, CCO, Marketing, Creative]
governance: docs/command/claims-vs-codebase-calibration.md
architecture_ssot: canvases/microsoft-onedrive-sovereign-blueprint.canvas.tsx
alignment: canvases/microsoft-onedrive-cmd-alignment.canvas.tsx
org_report: canvases/microsoft-north-star-org-report.canvas.tsx
---

# Microsoft Identity + OneDrive Sovereign Sync — Execution Lock

**Purpose.** Single command lock for build. Identity for everyone. OneDrive Sovereign Sync for paid seats only. Dual-plane OAuth matching Google. No scope beyond these two jobs.

**North star (CEO):** Anyone may Sign in with Microsoft. Only paid Sovereign Sync seats may Connect OneDrive. OneDrive is the user’s Sovereign Sync store — a replica they own — not our warehouse and not a Microsoft 365 programme.

---

## 1. Locked product rules

| Rule | Lock |
|------|------|
| Sign-in | Open to all users. Firebase `OAuthProvider('microsoft.com')`. Scopes: `openid`, `email`, `profile`. |
| Account linking | Same email as an existing Google-linked Firebase user → link onto that UID. No tier/quota fork. |
| OneDrive sync | Corporate Ecosystem and Founders Club only — same gate as `getSyncEntitlements` for Drive. |
| Active cloud | One Sovereign Sync cloud active at a time (Drive **or** OneDrive). |
| Folder | App folder (`Files.ReadWrite.AppFolder` → `Apps/Pocket Portfolio`) for v1. |
| Authority | `login.microsoftonline.com/common` (personal + work). Delegated user consent only. |
| Tokens | Browser only (`sessionStorage` / MSAL cache). No refresh token on Vercel, Firestore, or KV. No Graph proxy route. |
| Ask AI | Unchanged. No Graph content on `/api/ai/chat`. |
| Encryption | Do not claim. `encryptBeforeSync` remains unimplemented (same as Drive). |

---

## 2. Hard out of scope (this programme)

- Mail / Outlook (`Mail.Read`, `Mail.Send`)
- SharePoint / Sites (`Sites.*`)
- Teams, admin-consent, or application (app-only) Graph permissions
- Free-tier OneDrive attach
- Drive + OneDrive auto-sync together
- Replacing Firestore signed-in trades with OneDrive as system of record
- Moving Ask AI onto Microsoft models or Graph

Anything above needs a **new CPO priority**, not a silent expansion of this lock.

---

## 3. Architecture (execution shape)

```text
Browser
  ├─ Firebase Auth  →  microsoft.com provider  →  UID / tier / AI quota
  ├─ MSAL (paid)    →  Files.ReadWrite.AppFolder  →  user's OneDrive replica
  └─ Ask AI         →  buildPortfolioContext → /api/ai/chat  (unchanged)

Working set: guest localStorage | signed-in Firestore trades
Replica file: pocket_portfolio_db.json (+ optional pocket_view.xlsx)
```

Google remains the reference dual plane: identity ≠ file consent.

---

## 4. Build phases

### Phase 0 — Prerequisites (Platform + Eng)

| Task | Owner | Done when |
|------|-------|-----------|
| Azure AD app registration (multi-tenant + personal) | Platform | App ID + redirect to Firebase `__/auth/handler` |
| Enable Firebase Auth provider `microsoft.com` | Platform | Provider live in Firebase console |
| Env: public client IDs for Auth + MSAL (no secrets in client for Graph beyond public client id) | Platform | Documented in eng runbook; no refresh token server-side |
| CSP: `login.microsoftonline.com`, `login.live.com`, `graph.microsoft.com` | Platform | `middleware.ts` updated; prod CSP verified |

### Phase 1 — Sign in with Microsoft (anyone)

| Task | Owner | Done when |
|------|-------|-----------|
| `useAuth`: `signInWithMicrosoft` via `OAuthProvider('microsoft.com')` | Eng | Popup + redirect parity with Google |
| Account linking on email match | Eng | Same UID; tier/quota preserved |
| Auth UI: Microsoft button (surface + mark; amber stays accent) | Eng + Creative | Visible beside Google; brand gate pass |
| Analytics: sign-in method dimension | Eng | Distinguishes `google` vs `microsoft` |
| Smoke: free user signs in with Microsoft, no OneDrive UI unlock | CPO + Eng | Acceptance A1–A3 |

### Phase 2 — OneDrive Sovereign Sync (paid only)

| Task | Owner | Done when |
|------|-------|-----------|
| `@azure/msal-browser` public client + PKCE | Eng | Token in session/MSAL cache only |
| `oneDriveService.ts`: app folder, JSON + optional xlsx | Eng | Same filenames as Drive |
| `useOneDrive` + Settings “Connect OneDrive” | Eng | Behind `getSyncEntitlements` |
| Single active cloud toggle (Drive xor OneDrive) | Eng + CPO | Connecting one disconnects/disables the other for auto-sync |
| Delta sync, `If-Match` etag, 429 + `Retry-After`, pause when `document.hidden` | Eng | No 1 Hz poll |
| Disconnect clears MSAL cache; leaves user files | Eng | Acceptance A6 |
| Feature / settings copy under claim gate | Marketing + Head of AI | Approved lines only |

### Phase 3 — Ship gate

| Gate | Owner | Criterion |
|------|-------|-----------|
| Lint + typecheck | Eng | Green before merge |
| Claim review | Head of AI | No forbidden phrases on UI or launch copy |
| Completeness check | Eng | Shipped = marketed |
| Diligence note | Platform + Eng | Hosting / OAuth inventory updated (readiness, not certification) |

---

## 5. Acceptance criteria

| ID | Criterion |
|----|-----------|
| A1 | Unauthenticated user can complete Sign in with Microsoft and land in the app. |
| A2 | Free / non–Sovereign-Sync tier user signed in with Microsoft **cannot** connect OneDrive (upgrade path only). |
| A3 | Corporate or Founders user can Connect OneDrive after a **second** consent (no Files scope on sign-in). |
| A4 | Sign-in consent does not request `Files.*`. |
| A5 | Graph token never appears in network traffic to our `/api/*` routes. |
| A6 | Disconnect clears client MSAL state; `pocket_portfolio_db.json` remains in user’s OneDrive. |
| A7 | Only one of Drive / OneDrive is active for auto-sync. |
| A8 | Conflict on etag mismatch surfaces existing conflict UX (no silent overwrite). |
| A9 | Ask AI still uses `buildPortfolioContext` only; no Graph file in the prompt. |
| A10 | Public / in-app copy uses approved claims only (section 6). |

---

## 6. Claim gate (ship language)

**Approved**

- Sign in with Microsoft.
- Optional OneDrive Sovereign Sync to a folder you own (paid).
- Browser-to-cloud file replica under your control.
- Identity consent separate from file access.

**Forbidden**

- No cloud / zero server footprint.
- We encrypt your OneDrive files.
- Microsoft is the database / we replaced our servers with Microsoft.
- No data leaves your device (while signed-in sync or Firebase paths are active).
- Zero-leakage / AI never sees your data.

**“Their database” (internal product language):** Allowed to mean *user-owned Sovereign Sync replica*. External diligence must still state: signed-in working set remains Firestore today; OneDrive mirrors it like Drive.

SSOT: `docs/command/claims-vs-codebase-calibration.md` (persistence table + prohibited phrases). Do not cite Ask AI §6b for storage claims.

---

## 7. RACI for this programme

| Activity | CEO | CPO | Eng | Platform | Head of AI | CCO | Marketing | Creative |
|----------|-----|-----|-----|----------|------------|-----|-----------|----------|
| North star / scope lock | **A** | R | C | I | C | I | I | I |
| Roadmap priority / tier gate | A | **A/R** | C | I | C | C | I | I |
| Implementation | I | C | **A/R** | C | I | — | — | C (UI) |
| Azure / Firebase / CSP | I | I | C | **A/R** | I | — | — | — |
| Claim / diligence wording | A | C | C | I | **A/R** | C | C | C |
| Launch / feature copy | A | C | I | — | **C** (gate) | I | **R** | C |
| Room narrative (sell) | I | C | — | — | C | **A/R** | I | I |

---

## 8. Execution sequence (command checklist)

1. **CEO** — Confirm this lock; no M365 expansion without new mandate.  
2. **Platform** — Phase 0 complete; hand App IDs to Eng.  
3. **Eng** — Phase 1 merge behind feature flag if needed; pass A1–A2.  
4. **Creative** — Button treatment signed off.  
5. **Eng** — Phase 2; pass A3–A9.  
6. **Head of AI + Marketing** — Copy gate A10.  
7. **CPO** — Ship decision; seat UX (one active cloud) verified.  
8. **CCO** — Rooms may cite Sign in with Microsoft + paid Sovereign Sync only after Phase 3 green.

---

## 9. Success metric (CPO)

| Metric | Intent |
|--------|--------|
| Microsoft sign-in completions | Identity parity; unblocked Microsoft-account users |
| OneDrive connect rate among Sovereign Sync seats | Paid attach for Microsoft-preferring buyers |
| Zero dual-cloud conflict incidents | Single active cloud rule holds |
| Zero claim-gate violations on launch surfaces | Diligence honesty |

Hard numeric targets: TBD CEO / CPO — do not invent quotas in this lock.

---

## 10. Supersedes / related

- Blueprint: command canvas `microsoft-onedrive-sovereign-blueprint`
- CMD alignment: `microsoft-onedrive-cmd-alignment`
- Org north star: `microsoft-north-star-org-report`
- Google as-built: `app/hooks/useAuth.ts`, `app/lib/google-drive/driveService.ts`, `app/hooks/useGoogleDrive.ts`, `app/lib/utils/syncEntitlements.ts`

**This document is the execution SSOT.** Architecture debates stop here unless CEO reopens scope.
