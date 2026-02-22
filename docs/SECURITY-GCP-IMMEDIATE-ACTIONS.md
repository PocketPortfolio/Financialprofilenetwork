# GCP Security Immediate Actions Checklist

**Context:** Google Cloud security advisory (Feb 2026) on service account keys, API keys, and operational safeguards. This doc is the executable checklist for Pocket Portfolio (`pocket-portfolio-67fa6`).

---

## 1. Git history – secrets not committed ✅

**Action taken:** Checked that `.env`, `.env.local`, and `.env.production.local` have **no commits** in git history.

**Result:** No commits reference these files. `.gitignore` correctly has `.env` and `.env.*` (with `!.env.example`), so env files with secrets are not tracked.

**Optional re-check (run locally):**
```bash
git log --all --oneline -- .env.local .env .env.production.local
```
If this prints nothing, you're good. If it prints commit hashes, treat any secrets in those files as compromised: rotate them and consider removing the files from history (e.g. `git filter-repo`).

---

## 2. GCP Console – restrict API keys (do now)

**Where:** [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials?project=pocket-portfolio-67fa6)

### 2a. Google API key used by the app (`NEXT_PUBLIC_GOOGLE_API_KEY`)

Used in: `app/lib/google-drive/driveService.ts` (Google Drive).

- [ ] Open **Credentials** → find the API key that matches the one in your env (starts with `AIza...`).
- [ ] Click the key → **Edit**.
- [ ] **Application restrictions:** set to **HTTP referrers** and add only:
  - `https://www.pocketportfolio.app/*`
  - `https://pocketportfolio.app/*`
  - `http://localhost:*` (for dev only; remove or tighten in production if desired).
- [ ] **API restrictions:** set to **Restrict key** and enable only:
  - **Drive API** (and any other Google APIs this app actually calls).
- [ ] Save.

### 2b. Firebase client / web API key

Firebase uses a “Web API Key” in client config (`NEXT_PUBLIC_FIREBASE_*` in `app/lib/env-utils.ts`).

- [ ] In the same **Credentials** page, find the key used as Firebase’s “apiKey” in your client config.
- [ ] **Application restrictions:** HTTP referrers as above (your domains + optional localhost).
- [ ] **API restrictions:** Restrict to the Firebase APIs you use (e.g. Authentication, Firestore, Cloud Messaging, etc.). Do **not** leave “Don’t restrict key”.

---

## 3. GCP Console – audit and disable dormant keys (do now)

**Where:** [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials?project=pocket-portfolio-67fa6)

- [ ] List all **API keys**. For each key, check **usage** (e.g. last 30 days). Disable or delete any with no activity in 30+ days.
- [ ] Go to **IAM & Admin → Service Accounts**.
- [ ] For each service account, open **Keys** and review user-managed keys. Delete keys that are unused or redundant.
- [ ] Prefer one key per environment/purpose; remove old keys after rotating to a new one.

---

## 4. Firebase Admin key – Secret Manager and rotation (plan and execute)

**Current state:** Firebase Admin is initialized with env vars `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` in many places (e.g. `app/api/webhooks/stripe/route.ts`, `app/api/api-keys/user/route.ts`, `app/api/cron/stack-reveal/route.ts`, `app/api/tickers/[...ticker]/route.ts`). These are long-lived service account credentials.

**Target state (per Google’s advisory):**

1. **Zero-code storage:** Store the private key (or full credential) in [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=pocket-portfolio-67fa6). At runtime (e.g. in Vercel or your host), fetch the secret and set `FIREBASE_PRIVATE_KEY` (and optionally the other two) from it—never commit the key.
2. **Mandatory rotation:** In **IAM & Admin → Organization Policies** (or project), set `iam.serviceAccountKeyExpiryHours` to enforce a max key lifetime (e.g. 90 days). Rotate the Firebase Admin key before expiry and update the secret in Secret Manager and in Vercel env.
3. **Least privilege:** In **IAM & Admin → IAM Recommender**, review the Firebase Admin service account (`firebase-adminsdk-...@pocket-portfolio-67fa6.iam.gserviceaccount.com`) and remove any recommended unused permissions.

**Concrete steps:**

- [ ] Create a secret in Secret Manager, e.g. `firebase-admin-private-key`, with the current private key value (or a JSON with `project_id`, `client_email`, `private_key`).
- [ ] Ensure the runtime (Vercel/server) has access to Secret Manager (e.g. a service account with `roles/secretmanager.secretAccessor`) or use another secure mechanism to inject the value into `FIREBASE_PRIVATE_KEY` at deploy/runtime.
- [ ] (Optional) Refactor app to read Firebase Admin creds from a single helper that loads from Secret Manager when available and falls back to env for local dev.
- [ ] Set `iam.serviceAccountKeyExpiryHours` and add a calendar reminder to rotate the key and update the secret before expiry.
- [ ] Run IAM Recommender and prune unused roles for the Firebase Admin service account.

---

## 5. Operational safeguards (do now)

### Essential Contacts

- [ ] **GCP Console → [Essential Contacts](https://console.cloud.google.com/iam-admin/essential-contacts?project=pocket-portfolio-67fa6):** Add/verify contacts for **Security** and **Legal** so critical security notifications reach the right people.

### Billing alerts

- [ ] **Billing → [Budgets & alerts](https://console.cloud.google.com/billing/budgets):** Create a budget (e.g. monthly) and set alerts at 50%, 90%, 100%.
- [ ] **Billing → [Alerts](https://console.cloud.google.com/billing/alerts):** Enable billing anomaly alerts if available.
- [ ] Ensure the email for these alerts is monitored; a consumption spike can indicate compromised credentials.

---

## Summary

| # | Action | Owner | Status |
|---|--------|--------|--------|
| 1 | Confirm no secrets in git history | Done | ✅ No .env* in history |
| 2 | Restrict Google API key + Firebase key (APIs + referrers) | You | ☐ Do in Console |
| 3 | Audit and disable dormant API keys and SA keys | You | ☐ Do in Console |
| 4 | Move Firebase Admin key to Secret Manager + set key expiry + least privilege | You | ☐ Plan then execute |
| 5 | Set Essential Contacts and billing/budget alerts | You | ☐ Do in Console |

After completing 2, 3, and 5 in the Console, you’ve addressed the immediate GCP advisory items. Item 4 is the longer-term hardening for the Firebase Admin credential.
