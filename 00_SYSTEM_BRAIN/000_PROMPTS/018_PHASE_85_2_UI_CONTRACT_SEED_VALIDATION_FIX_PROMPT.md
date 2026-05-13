# Phase 85.2 — UI contract seed data validation fix (archived prompt)

**Saved:** 2026-05-13  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
**Branch:** `phase/from-v2.4.1-TASK-FIN`

## Context (GAS)

After Phase 85.1 compile fix, GAS Test Console ran successfully. Bootstrap created the sheet and seeded 12 rows. **Validate** failed with three errors tied to **baseline seed literals** in `84_UNIFIED_UI_CONTRACT_RUNTIME.js`, not to architecture.

## Errors addressed

1. `HOME_ALERT_OPERATOR_DASHBOARD` — `SECURITY_FILTER_HINT` contained substring `_THISUSER`, tripping `CbvUiContract__scanExprFields_` (forbidden token scan on AppSheet-oriented fields).  
2. `CBV_TEST_CONSOLE` — `SORT_BY_FIELD` was `DISPLAY_ORDER`; prefix rule treats `DISPLAY_*` as legacy HOME_ALERT display column names in mapping fields.  
3. `ADMIN_REFERENCE_VIEWER` — `SECONDARY_TEXT_FIELD` was `DISPLAY_TEXT` (same prefix rule). ENUM row still uses real column `ENUM_LABEL` for secondary label.

## Mission (hotfix)

- Adjust **seed defaults only** in `CbvUiContract__baselineSeedRows_` / inline objects.  
- Keep `OPERATOR_*` mapping for all `HOME_ALERT_*` screens.  
- Do not relax `CbvUiContract_validate()` rules.  
- Append-only brain: this prompt, `018` report, `018` handoff.  
- No ENV-A, AI runtime, AppSheet Bot, auto assign/resolve/escalate.

## Git

Commit: `fix(ui-contract): repair phase 85 seed validation errors`  
Push: `origin phase/from-v2.4.1-TASK-FIN`

## Post-deploy

`clasp push` → Test Console Phase 85 → **existing rows**: delete the three affected rows or edit cells to match new seed, then **Bootstrap** (idempotent append) or rely on manual correction.
