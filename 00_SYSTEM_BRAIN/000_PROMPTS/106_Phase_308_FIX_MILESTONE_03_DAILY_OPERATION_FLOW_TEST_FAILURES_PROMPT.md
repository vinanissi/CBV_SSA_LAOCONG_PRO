# 106 — Phase 308 FIX MILESTONE 03 DAILY OPERATION FLOW TEST FAILURES — PROMPT (append-only)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Date:** 2026-05-14  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  

## Source audit

Drive bundle `105_105_MILESTONE_03_DAILY_OPERATION_FLOW_*` (duplicate numeric prefix + test failures).

## Failures addressed in code

1. **TASK_CARD_MARKERS** — `ReferenceError: id is not defined` in `CbvDailyOp_getSecondaryActionsForTask_` (removed `var id`, still used in stuck/help URLs). Fix: restore `var id = String(t.taskId || '').trim();`.

2. **NAV_PRIMARY / NAV_SECONDARY** — tests used raw `indexOf('/workspace/daily')` and `indexOf('/home-alert/sla')` while `CbvWebAppRouteUrl_build` emits encoded paths. Fix: `data-route="…"` on primary/secondary anchors (`998F`) + test helper `CbvTcsMilestone03__htmlSignalsRoute_` (data-route | encoded | raw).

3. **NAV_NO_DUP_SLA** — extended to reject SLA in primary via raw, encoded, or `data-route="/home-alert/sla"`.

4. **Drive naming** — `tagStem` changed from `105_MILESTONE_03_DAILY_OPERATION_FLOW` to `MILESTONE_03_DAILY_OPERATION_FLOW` so exporter emits `{seq}_MILESTONE_03_DAILY_OPERATION_FLOW_*` (e.g. `106_…` when folder next seq is 106). Do not delete old `105_105_*` files.

5. **Test detail** — richer `detail` for TASK_CARD_MARKERS, NAV_PRIMARY, NAV_SECONDARY.

## Runtime verify

🧪 CBV Test Console → **Run Milestone 03 Daily Operation Flow Test** → expect GO/GO_WITH_WARNINGS, `envelopeOk=true`, six files on Drive with expected stem after next folder sequence.
