# PHASE 82 — SLA_AND_ESCALATION_RUNTIME (Prompt Archive)

**Repo:** CBV_SSA_LAOCONG_PRO  
**Standard:** CBV Operational Ecosystem Standard V1  
**Context:** HOME_ALERT operational coordination runtime (Phase 80A→81); operator UX = `OPERATOR_*` only (no legacy DISPLAY/CARD/UX/DESKTOP binding for operator deck).

## Objective

Runtime-first, memory-first, append-only, manual-first → auto-later; no AppSheet Bot; no automatic production triggers; no destructive migration; no overwrite of prior reports/handoffs; no fake GO.

## Deliverables (summary)

- **SLA columns:** SLA_POLICY, SLA_TARGET_MINUTES, SLA_DUE_AT, SLA_STATUS, SLA_BREACH_LEVEL, SLA_ELAPSED_MINUTES, SLA_LAST_CHECKED_AT, SLA_NEXT_REVIEW_AT (status set: NO_SLA, ON_TRACK, DUE_SOON, OVERDUE, BREACHED, PAUSED, RESOLVED).
- **Escalation columns:** ESCALATION_LEVEL, ESCALATION_STATUS, ESCALATION_REASON, ESCALATED_AT (pre-existing), ESCALATED_BY, ESCALATED_TO, LAST_ESCALATION_CHECK_AT, ESCALATION_NEXT_ACTION, ESCALATION_TRACE_ID.
- **Stuck detection:** multi-signal helper (unclaimed, in progress, waiting, blocked, SLA overdue, operator overload) — non-destructive suggestions / sheet flags only.
- **Manual GAS:** HomeAlert_checkSlaRuntime, HomeAlert_detectStuckItems, HomeAlert_suggestEscalations, HomeAlert_escalateByPolicy, HomeAlert_acknowledgeEscalation, HomeAlert_resolveEscalation, HomeAlert_pauseSla, HomeAlert_resumeSla (idempotent where applicable, traceId, append audit via existing patch path).
- **Operator contract:** OPERATOR_* + ATTENTION_LABEL + OPERATOR_DASHBOARD_* reflect SLA/escalation; official policy groupBy/sortBy use dashboard columns (not DESKTOP_SORT).
- **Test console:** `HomeAlertSlaEscalation_TestConsole_run()` under top-level menu **🧪 CBV Test Console** (separate from CBV PRO business menu).
- **Artifacts:** append-only REPORT + HANDOFF in `00_SYSTEM_BRAIN`.

*(Full execution spec was provided in the phase request to Cursor; this file is the frozen prompt reference for Phase 82.)*
