# Decision log — 111 Milestone 06 Staff Workboard Production MVP

## Decision

Adopt **explicit route+param parsing** on the WebApp entry (`94` + `998H`) so `?route=/path?taskId=...` and `?route=/path&taskId=...` both resolve to `route=/path` and merged params, without breaking plain paths.

## Rationale

Google Web App deployments commonly pass the entire string as the `route` parameter when operators append `?taskId=` inside the encoded route value; the previous `__resolveRoute_` treated that as one unknown route.

## Workboard data

Reuse **HOME_ALERT / pilot queue** via existing `CbvStaffWorkspace_readTasksAdapter_` — no TASK_MAIN mutation, no synthetic production rows.

## AppSheet

All deep links built only from **Script Properties**; repository contains **no** real AppSheet app id. Missing config → **safe-disabled** copy only.

## Navigation

Primary VI nav adds **Workboard** after home; staff bottom nav lists **Workboard** first for thumb reach. **Daily** route unchanged.

## Test Console

M06 tests live only under **🧪 CBV Test Console**; business menus unchanged.

## Tag readiness

**Not tagged** in-repo until GAS-run Drive bundle confirms `envelopeOk: true` and acceptable status (user policy).
