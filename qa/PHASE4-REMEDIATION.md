# Phase 4 — Remediation (monorepo QA)

| Field | Value |
|-------|-------|
| Date | 2026-09-25 22:14 EDT |
| Branch | `feat/monorepo-public` |
| Tip at start | `b6661f1` (pre-pull) |
| Tip after Apps pull | `a34f103` (`a34f103`) |
| Kit JSON mutated? | **No** |
| Console UI rewritten by QA? | **No** (Apps owned craft) |
| PR #1 merged? | **No** |

## Defect disposition

| Defect ID | Pre status | Post status | Who fixed | QA action |
|-----------|------------|-------------|-----------|-----------|
| DEFECT-CON-UI-001 | Open | **Fixed** | Apps (`c02d80a`/`a34f103`) | Status→Fixed; regress |
| DEFECT-CON-DOC-001 | Open | **Fixed** | Apps | Status→Fixed; regress brand-check |
| DEFECT-CON-QA-001 | Open | **Fixed** | Apps | Status→Fixed; features.json regen verified |
| DEFECT-BOT-ENG-001 | Open | **Fixed** | Apps | Status→Fixed; scene/feel/do/go parity |
| DEFECT-BOT-UI-002 | Open | **Fixed** | Apps | Status→Fixed; ZONES kit-hydrated |
| DEFECT-CON-BANNER-002 | Open | **Fixed** | Apps | Status→Fixed; look-ahead 0.32/0.52 |

## QA-owned smallest safe fixes (this pass)

1. **`kit/check-consumers.mjs`** — strengthen look-ahead gate: every `viewW*<n>` literal must ∈ kit `cameraLookAheadRight/Left` (catches legacy `0.35` dual). Prefer gate over UI rewrite.
2. **`HABITAT-PORT.md`** — correct banner dual-table shame: row now says kit ratios + gate catches drift (was falsely "Already present / identical" while 0.35 lingered).

## Out of scope (honored)

- No console UI rewrite by QA
- No invented adapter APIs
- No kit JSON invention
- No merge of PR #1
- Never Casque
