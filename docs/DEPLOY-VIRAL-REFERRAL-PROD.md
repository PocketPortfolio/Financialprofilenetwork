# Viral referral loop — production readiness

Use this before making the **Route to Rise / viral_moment_v1** campaign public.

## 1. Deploy code

- Merge and deploy the branch that includes `POST /api/referral/complete`, `ReferralCapture`, `referralIndex` upsert in `GET /api/api-keys/user`, campaign tagging on `referralEvents`, admin **Viral campaign (viral_moment_v1)** metrics, **middleware apex → `www`** (preserves `?ref=`), and **`pp_referral_code` cookie** (`Domain=.pocketportfolio.app`) so referrals survive apex/www hops.
- Run locally: `npm run lint` and `npm run typecheck` (must pass). If `npm run build` fails on “Cannot find module for page”, delete `.next` and run `npm run build` again.

## 2. Vercel environment (Production)

Confirm these are set for **Production** (same values you already use for Stripe, Ask AI, and admin analytics):

| Variable | Purpose |
|----------|---------|
| `FIREBASE_PROJECT_ID` | Must match live Firebase project |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK service account |
| `FIREBASE_PRIVATE_KEY` | PEM with `\n` newlines in the string |

No new env vars are required specifically for the referral campaign (campaign id is `viral_moment_v1` in code).

`NEXT_PUBLIC_*` Firebase client config must point at the **same** project id as Admin.

## 3. Firestore security rules

Deploy updated rules so `referralIndex` and `referralRewardClaims` are explicitly server-only (Admin SDK bypasses rules; clients cannot read/write):

```bash
firebase deploy --only firestore:rules
```

(From repo root, with Firebase CLI logged into the correct project.)

## 4. Firestore indexes

No new composite indexes are required for the referral queries in use (single-field `timestamp` range on `referralEvents` is auto-indexed).

## 5. Production smoke test (before public post)

Do this in **production** URLs (`https://www.pocketportfolio.app`), not only localhost.

1. **Canonical host (after deploy)**  
   - Open `http://pocketportfolio.app/?ref=REF-TEST` (no `www`). Expect **307** to `https://www.pocketportfolio.app/?ref=REF-TEST` (query preserved). DevTools → Application → Cookies → confirm `pp_referral_code` on `.pocketportfolio.app` when a valid `REF-*` is present.

2. **Referrer (existing account)**  
   - Sign in → open `/invite` or `/dashboard` (triggers `GET /api/api-keys/user`).  
   - In Firestore: `referralIndex` should contain `REF-` + first 8 chars of that user’s Firebase `uid` (uppercase), with `referrerEmail` lowercased.

3. **Landing + click**  
   - Incognito: open `https://www.pocketportfolio.app/?ref=REF-XXXXXXXX&utm_campaign=viral_moment_v1` (use referrer’s real code).  
   - Confirm `referralEvents` gains a **click** with `campaign` / `metadata` when applicable.

4. **Referee (new account)**  
   - New Google account (or account created &lt; 48h per server rule).  
   - After sign-in, `POST /api/referral/complete` should run from `ReferralCapture`.  
   - `referralRewardClaims` doc id: `viral_moment_v1__{refereeUid}`.  
   - `referralEvents` **conversion** row; referrer’s `apiKeysByEmail` gets `tier: foundersClub`, `expiresAt` ~7 days, `referralViralRewardCampaign: viral_moment_v1`.

5. **Admin**  
   - Signed-in admin (Firebase custom claim `admin: true`) → `/admin/analytics` → **Referrals** → **Viral campaign (viral_moment_v1)** shows non-zero counts after the above.

6. **Paid path**  
   - Referrer who already has Founders Club with **no** `expiresAt` (active subscription) should **not** be overwritten by a referral trial (server skips grant; conversion still logged once per new referee).

## 6. What “no `apiKeysByEmail` doc” means

Free users often have **no** `apiKeysByEmail` row until checkout, seat grant, or **referral reward**. That is expected. For referral testing, **`referralIndex`** is the right place to confirm the sharer is indexed.

## 7. Go-live checklist

- [ ] Production deploy complete  
- [ ] `firestore:rules` deployed  
- [ ] Smoke test 1–6 passed  
- [ ] `/admin/analytics` viral campaign section verified  
- [ ] Marketing links use `https://www.pocketportfolio.app/?ref=REF-...` (not `/join` unless you add routing)  
- [ ] Optional: set calendar reminder to review trial expiry and conversion quality after 7 days  
