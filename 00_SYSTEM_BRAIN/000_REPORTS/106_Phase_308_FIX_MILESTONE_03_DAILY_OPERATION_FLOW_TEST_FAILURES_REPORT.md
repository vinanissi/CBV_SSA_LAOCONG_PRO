# 106 — Phase 308 FIX MILESTONE 03 DAILY OPERATION FLOW TEST FAILURES — REPORT (append-only)

**Date:** 2026-05-14  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  

## Audit source

- Failed Drive bundle pattern: `105_105_MILESTONE_03_DAILY_OPERATION_FLOW_*` (duplicate `105_` from `tagStem` already containing `105_` while exporter prepends sequence `105_`).

## Root causes

| Check | Root cause | Fix |
|-------|------------|-----|
| TASK_CARD_MARKERS | `CbvDailyOp_getSecondaryActionsForTask_` referenced `id` without declaring (regression after removing unused line). | Declare `var id = String(t.taskId \|\| '').trim();` |
| NAV_PRIMARY | Test required literal `/workspace/daily` in HTML; hrefs use `?route=%2Fworkspace%2Fdaily`. | `data-route="/workspace/daily"` on primary links + test accepts encoded/raw/data-route |
| NAV_SECONDARY | Same for `/home-alert/sla`. | `data-route` on secondary links + test helper |
| REPORT_ENVELOPE | Cascading FAIL from above ERROR checks. | Resolved by fixing runtime + tests (envelope rule unchanged) |

## Files updated

- `05_GAS_RUNTIME/998S_WEBAPP_DAILY_OPERATION_FLOW.js` — secondary actions `id` fix  
- `05_GAS_RUNTIME/998F_WEBAPP_VI_UX_COPY.js` — `data-route` on `CbvWebAppVi__navBtn_` and secondary `<a>`  
- `05_GAS_RUNTIME/998T_MILESTONE_03_DAILY_OPERATION_TEST_CONSOLE.js` — route detection helper, richer detail, `tagStem: 'MILESTONE_03_DAILY_OPERATION_FLOW'`  

## Files created (this phase)

- `00_SYSTEM_BRAIN/000_PROMPTS/106_Phase_308_FIX_MILESTONE_03_DAILY_OPERATION_FLOW_TEST_FAILURES_PROMPT.md`  
- `00_SYSTEM_BRAIN/000_REPORTS/106_Phase_308_FIX_MILESTONE_03_DAILY_OPERATION_FLOW_TEST_FAILURES_REPORT.md` (this file)  
- `00_SYSTEM_BRAIN/001_HANDOFF/106_Phase_308_FIX_MILESTONE_03_DAILY_OPERATION_FLOW_TEST_FAILURES_AI_HANDOFF.md`  
- `00_SYSTEM_BRAIN/002_DECISIONS/106_Phase_308_FIX_MILESTONE_03_DAILY_OPERATION_FLOW_TEST_FAILURES_DECISION.md`  

## Regression (M01 / M02)

- **Not changed:** route registry, staff pages, feedback `submitFeedbackSafe_` empty validation, VI frozen routes beyond nav HTML attributes.  
- **Risk:** low — only added `data-route` attributes (non-breaking for browsers); nav labels unchanged.  
- **Re-check on GAS:** `CbvWebAppVi_validate`, Milestone 01/02 menus unchanged.

## Expected next Drive prefix

After push, next export should follow `{NNN}_MILESTONE_03_DAILY_OPERATION_FLOW_*` (e.g. **`106_MILESTONE_03_DAILY_OPERATION_FLOW_*`** if Drive folder next sequence is 106). **Không** expect `105_105_` again.

## Tag readiness

Chỉ tag sau khi có bundle Drive mới **GO** / **GO_WITH_WARNINGS** và `envelopeOk=true` (theo quy trình repo).
