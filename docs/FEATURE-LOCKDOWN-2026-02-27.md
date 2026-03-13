# Feature Lockdown — 2026-02-27

**Status:** Authorized. Effective once production smoke tests (Section 3 of handoff) show green in GA4 DebugView.

---

## Policy

- **`main` is locked** for feature development for **14 days** from the date smoke tests clear.
- **Permitted:** Critical security patches only. No new features, no UI tweaks, no product changes.
- **Handoff doc:** `docs/FEATURE-LOCKDOWN-HANDOFF-2026-02-27.md` — distribute to Lead Engineer, Head of Data, Head of Marketing.

---

## Pre-lockdown checklist

1. [ ] Handoff doc sent to Lead Engineer, Head of Data, Head of Marketing.
2. [ ] Smoke test (Section 3 of handoff) executed on **production**; GA4 DebugView shows all three events.
3. [ ] 14-day clock started; revenue cohort review scheduled.

---

*Revenue review in 14 days. End of feature lockdown.*
