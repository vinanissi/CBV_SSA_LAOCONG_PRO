# AI handoff — M09.1 row key + SOP contract

## Summary

M09.1 tightens TASK_MAIN record URLs to **explicit row keys only** (already in `998Y` via `resolveExplicitTaskMainRowKey_` + `buildTaskMainDetailUrl_` / `Form`). This session completed **test console assertions** (`999H`), **workboard SOP `module` default**, and **legacy `__sopHref_` query parity** (`module`, `from`).

## Files touched (this session)

- `05_GAS_RUNTIME/998Y_WEBAPP_STAFF_WORKBOARD_PRODUCTION.js`  
- `05_GAS_RUNTIME/999G_MILESTONE_09_INTERACTIVE_TASK_RUNTIME.js`  
- `05_GAS_RUNTIME/999H_MILESTONE_09_INTERACTIVE_TASK_TEST_CONSOLE.js`  
- `00_SYSTEM_BRAIN/000_PROMPTS/119_PHASE_M09_1_FIX_INTERACTIVE_TASK_RUNTIME_FAILURES_PROMPT.md`  
- `00_SYSTEM_BRAIN/000_REPORTS/REPORT_M09_1_ROWKEY_SOP_LOCAL_2026-05-14.md`  
- This file  

## Verification gap

**GAS M09/M07/M08 not re-run here.** After `clasp push`, expect a **new** M09 bundle (e.g. `122_*`), never overwrite `121_*`. Confirm `envelopeOk`, empty `warnings`/`errors` only on successful runs.

## Commit

Delivered as the current tip of `origin/phase/from-v2.4.1-TASK-FIN` with message:  
`fix(M09.1): explicit TASK_MAIN row keys, SOP URL context, stricter M09 tests`
