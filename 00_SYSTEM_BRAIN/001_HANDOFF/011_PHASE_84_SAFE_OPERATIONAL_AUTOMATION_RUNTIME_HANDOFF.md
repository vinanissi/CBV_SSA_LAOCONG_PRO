# PHASE 84 — AI handoff (append-only)

## Phase purpose

Operational automation that is **safe by default**: refresh HOME_ALERT, refresh SLA metrics, stuck detection as **dry-run**, daily operational snapshot, and runtime health checks — all **human-in-the-loop**, no auto assign/resolve/close/escalate.

## Runtime added

- `05_GAS_RUNTIME/82_HOME_ALERT_SAFE_AUTOMATION_RUNTIME.js`

## Sheets added

- `HOME_ALERT_AUTOMATION_CONFIG`
- `HOME_ALERT_AUTOMATION_RUN_LOG` (append-only)
- `HOME_ALERT_DAILY_SNAPSHOT` (upsert by `SNAPSHOT_DATE`, no history deletion)

## Functions added (surface)

- `HomeAlertSafeAutomation_ensureSheets_`, `seedDefaults`, `listConfigs`, `runOne`, `runDue`, `healthCheck`
- `HomeAlertSafeAutomation_installSafeTriggers` / `removeSafeTriggers` / `validateNoForbiddenAutomation_`
- `HomeAlertDailyOperationalSnapshot_ensureSheet_`, `generate`, `formatText_` (implementation via `execute_` to avoid recursion)
- `HomeAlertSafeAutomation_TestConsole_run` + menu `menuCbvTestConsoleHomeAlertSafeAutomation84`

## Automation allowlist

- `HomeAlert_refresh`
- `HomeAlertSlaMetrics_refresh`
- `HomeAlert_detectStuckItems` (automation forces `apply: false`)
- `HomeAlertDailyOperationalSnapshot_generate` (internal `execute_`)
- `HomeAlertSafeAutomation_healthCheck`

## Forbidden automation rules

- Substrings blocked in config text: autoAssign, autoResolve, autoClose, autoEscalate, forceEscalate, delete, purge, destructive (case-insensitive scan on selected fields).
- Project triggers: test console flags handlers whose names suggest forbidden automation (same family of keywords).

## Trigger policy

- **Bootstrap:** must **not** install triggers.
- **Test console:** must **not** install triggers; verifies `runDue` does not change trigger count.
- **Production optional:** operator manually calls `HomeAlertSafeAutomation_installSafeTriggers()` → single clock firing `HomeAlertSafeAutomation_runDue` only (after `removeSafeTriggers` dedupe).

## Daily snapshot behaviour

- Aggregates active HOME_ALERT rows (counts, top codes/operators, summary text, recommended actions text).
- Upserts the row for **today’s calendar date**; preserves original `CREATED_AT` / `CREATED_BY` on update.
- No outbound email in this phase.

## Warnings

- Do not chain `installSafeTriggers` into bootstrap or tests.
- Do not extend allowlist toward assignment/escalation “auto” behaviours without a new phase and explicit governance.

## Next recommended phase

- Optional: notification channel design (still read-only / opt-in), or operational playbook linking snapshot → manual queues.

## What AI/Cursor must not break next time

- TASK_MAIN prod baseline (SHARED_WITH / IS_PRIVATE / security filters) — unchanged here.
- Phase 82/83 HOME_ALERT SLA surfaces and `HomeAlert_enrichSlaEscalationRuntime_` contracts.
- Operator UX / `OPERATOR_*` contract — do not rename or remove without migration.
- Append-only brain artifacts: never overwrite older phase prompts/reports/handoffs.
