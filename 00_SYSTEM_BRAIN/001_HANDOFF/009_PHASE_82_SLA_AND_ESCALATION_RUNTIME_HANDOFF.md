# PHASE 82 — SLA_AND_ESCALATION_RUNTIME — AI Handoff (Append-Only)

## Phase purpose

Introduce **SLA timing**, **escalation coordination**, and **multi-signal stuck detection** for HOME_ALERT as **runtime output** (sheet-backed, GAS-computed), without AppSheet Bot, without auto-installed production triggers, and without destructive migrations.

## Runtime added

- **Column groups:** SLA_* and ESCALATION_* on `HOME_ALERT` (manifest + audit optionalColumns).
- **Enrichment:** `HomeAlert_enrichSlaEscalationRuntime_()` invoked inside `HomeAlert_enrichDesktopUxFields_()` **before** `HomeAlert_enrichAssignmentFields_()` so stuck/SLA signals align.
- **Stuck:** `HomeAlert_evaluateStuckSignals_()` drives `HomeAlert_detectStuck_()` / `HomeAlert_getStuckReason_()` (expanded beyond the old 48h-only heuristic).

## Functions added / exposed

| Function | Role |
|----------|------|
| `HomeAlert_checkSlaRuntime()` | Stamp `SLA_LAST_CHECKED_AT` and full re-enrich per active row (via `HomeAlert_patchAlertOperational_`). |
| `HomeAlert_detectStuckItems(options)` | Returns `{ items, patched }`; optional `apply:false` for dry output. |
| `HomeAlert_suggestEscalations(options)` | Sets `ESCALATION_STATUS=SUGGESTED` when stuck/SLA severe; idempotent vs existing non-NONE states. |
| `HomeAlert_escalateByPolicy(alertId, payload)` | Writes escalation coordination fields + trace; idempotent if already escalated to same target/level. |
| `HomeAlert_acknowledgeEscalation` / `HomeAlert_resolveEscalation` | Coordination lifecycle; idempotent. |
| `HomeAlert_pauseSla` / `HomeAlert_resumeSla` | SLA pause/resume without deleting data. |
| `HomeAlertSlaEscalation_TestConsole_run` | Phase 82 QA report envelope. |

## Test status

Use `HomeAlertSlaEscalation_TestConsole_run()` after schema append on the spreadsheet. Treat **FAIL** as blocking; **GO_WITH_WARNINGS** requires explicit review (refresh errors, missing legacy columns, envelope warnings).

## Warnings for next AI / Cursor

1. **Do not** revert `HomeAlert_getOfficialOperatorDisplayConfig_()` to use `DESKTOP_SORT` / `ATTENTION_LABEL` for `groupBy`/`sortBy` without an explicit UX phase — Phase 82 locks operator grouping/sorting to **OPERATOR_DASHBOARD_***.
2. **Do not** add `ScriptApp.newTrigger` inside HOME_ALERT runtime without a dedicated “production triggers” phase and stakeholder sign-off.
3. **Preserve** `preserveOps` merge behavior for `SLA_POLICY` / `SLA_TARGET_MINUTES` when refreshing generated alerts.
4. **Escalation** `ESCALATED_AT` is shared with historical operational usage; new fields `ESCALATED_BY` / `ESCALATED_TO` / `ESCALATION_TRACE_ID` carry coordination semantics.

## Next recommended phase

- **Phase 83 (suggested):** SLA policy registry (per ALERT_CODE defaults), optional scheduled **read-only** SLA checker (still no auto-resolve), or AppSheet action bindings for the new GAS entry points.

## What AI must not break next time

- TASK_MAIN production baseline (SHARED_WITH / IS_PRIVATE) and related security filters.
- HOME_ALERT append-only audit posture (`logAdminAudit` / no row deletes).
- Isolation of **🧪 CBV Test Console** from the **CBV PRO** business menu.
