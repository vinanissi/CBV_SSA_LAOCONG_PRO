# PHASE 83 — SLA_POLICY_REGISTRY_AND_OPERATIONAL_CONTROL — AI Handoff (Append-Only)

## Phase purpose

Move SLA/Escalation from **fixed runtime heuristics** to a **registry-driven** model: policies live on `HOME_ALERT_SLA_POLICY`, metrics on `HOME_ALERT_SLA_METRICS`, with validation and manual recompute entry points — still append-only, manual-first, no triggers, no AppSheet Bot.

## Runtime added

- **Sheets:** `HOME_ALERT_SLA_POLICY`, `HOME_ALERT_SLA_METRICS` (manifest + `ensure` + default seed).
- **Resolver:** `HomeAlert_getSlaPolicy_(alert)` returns normalized policy; `HomeAlert_resolveSlaPolicyCode_(alert)` returns `POLICY_CODE`; in-memory row cache with `HomeAlert_clearSlaPolicyCache_()`.
- **Matching order:** `ALERT_CODE` → `ALERT_TYPE` → `MODULE+SEVERITY` → `MODULE` → `SEVERITY` → `POLICY_CODE === DEFAULT`; skip `IS_DELETED` / inactive `ACTIVE`.

## Functions added (primary)

| Area | Functions |
|------|-----------|
| Sheet lifecycle | `HomeAlertSlaPolicy_ensureSheet_`, `HomeAlertSlaMetrics_ensureSheet_`, `HomeAlertSlaPolicy_seedDefaults` |
| Resolver | `HomeAlert_getSlaPolicy_`, `HomeAlert_resolveSlaPolicyCode_`, `HomeAlert_clearSlaPolicyCache_`, `HomeAlertSlaPolicy_applyAnchorsToAlert_` |
| Ops | `HomeAlertSlaPolicy_upsertPolicy`, `HomeAlertSlaPolicy_deactivatePolicy`, `HomeAlertSlaPolicy_listActivePolicies`, `HomeAlertSlaPolicy_validateCoverage`, `HomeAlertSlaPolicy_recomputeAllAlerts` |
| Metrics | `HomeAlertSlaMetrics_refresh`, `HomeAlertSlaMetrics_buildSnapshot_` |
| QA | `HomeAlertSlaPolicy_TestConsole_run`, `HomeAlertSlaPolicy_TestConsole_showReport` |

## Policy resolver behavior

- Fills alert `SLA_POLICY` / `SLA_TARGET_MINUTES` from registry when not manually divergent (same heuristic as Phase 83 spec: skip overwrite when current values differ from registry defaults).
- Drives **DUE_SOON** window via `DUE_SOON_MINUTES` (fallback to legacy % window when unset).
- Drives **breach ladder** via `BREACH_LEVEL_1_MINUTES` / `BREACH_LEVEL_2_MINUTES` (fallback to Phase 82-like defaults when unset on row but registry exists with zeros).
- Sets `ESCALATION_NEXT_ACTION` **policy hint** only when empty (does not auto-escalate).

## Metrics runtime behavior

- `HomeAlertSlaMetrics_buildSnapshot_` aggregates active alerts by `ALERT_CODE` for current UTC date bucket.
- `HomeAlertSlaMetrics_refresh` upserts by `METRIC_ID` (idempotent; does not delete historical rows).

## Warnings

- Resolver cache must be cleared after manual policy edits if you need immediate consistency within the same execution context (otherwise rely on `HomeAlert_clearSlaPolicyCache_()`).

## Next recommended phase

- **Phase 84 (suggested):** AppSheet action bindings for policy upsert / metrics refresh; or read-only time-driven **manual** menu “SLA daily rollup” still without automatic triggers.

## What AI/Cursor must not break next time

- **TASK_MAIN** production baseline (SHARED_WITH / IS_PRIVATE) and security filters.
- **Phase 82** manual SLA/escalation APIs and audit posture.
- **Operator UX contract:** `OPERATOR_*`, `OPERATOR_DASHBOARD_GROUP` / `OPERATOR_DASHBOARD_SORT` — no legacy DISPLAY/CARD/UX/DESKTOP in operator deck.
- **Do not** add `ScriptApp.newTrigger` inside HOME_ALERT/policy runtime without an explicit approved phase.
- **Do not** delete historical `HOME_ALERT_SLA_METRICS` rows (append / upsert model).
