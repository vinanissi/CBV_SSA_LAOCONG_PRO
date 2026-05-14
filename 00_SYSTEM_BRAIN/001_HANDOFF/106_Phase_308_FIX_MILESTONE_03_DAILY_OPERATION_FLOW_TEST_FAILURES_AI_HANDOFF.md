# AI Handoff — 106 Phase 308 (Fix M03 test failures)

**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Date:** 2026-05-14  

## Fixes shipped

1. **`id` ReferenceError** — `998S` `CbvDailyOp_getSecondaryActionsForTask_`: restored local `id` from `taskId`.  
2. **Nav tests vs encoded URLs** — `998F`: all primary (`CbvWebAppVi__navBtn_`) and secondary nav anchors include `data-route="<canonical path>"`.  
3. **998T** — `CbvTcsMilestone03__htmlSignalsRoute_` + `CbvTcsMilestone03__snippetSafe_`; NAV_PRIMARY/NAV_SECONDARY/NAV_NO_DUP_SLA logic updated; TASK_CARD_MARKERS detail includes `htmlLen`, `missing`, `exception`, `probeTaskId`.  
4. **Drive `tagStem`** — `MILESTONE_03_DAILY_OPERATION_FLOW` (no leading `105_`) so filenames are `{seq}_MILESTONE_03_DAILY_OPERATION_FLOW_*` only.

## What you run

`clasp push` → **🧪 CBV Test Console** → **Run Milestone 03 Daily Operation Flow Test** → confirm six files and `envelopeOk`.

## Do not

- Delete or overwrite existing `105_105_*` Drive evidence.  
- Tag until new bundle audited GO/GO_WITH_WARNINGS.
