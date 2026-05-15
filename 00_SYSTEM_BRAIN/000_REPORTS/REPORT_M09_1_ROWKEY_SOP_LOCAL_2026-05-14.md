# M09.1 local closeout — row key safe-disable + SOP context

**Date:** 2026-05-14  
**Environment:** Local repo + `node scripts/cbv-marker-contract-self-check.mjs`  
**GAS / Drive:** Not executed in this session — **NOT VERIFIED ON GAS**.

## Changes

1. **`998Y_WEBAPP_STAFF_WORKBOARD_PRODUCTION.js`**  
   - Explicit row key resolver + TASK_MAIN detail/form builders (fail closed when row key missing).  
   - Workboard SOP `module` param uses `raw.moduleCode` or default `TASK` (not `HOME_ALERT` as module).  
   - `CbvStaffWorkboard__sopHref_` fallback now always adds `source`, `module`, `from` when `taskId` present (or `source`+`module`+`from` when only source without id).

2. **`999G_MILESTONE_09_INTERACTIVE_TASK_RUNTIME.js`**  
   - `CbvInteractiveTaskRuntime_buildSopUrl_` with full query context; `buildActiveContext_` / context panel use **explicit** row key only for TASK_MAIN semantics; SOP link uses `buildSopUrl_` with `returnRoute`; last-resort SOP URL string includes `source` / `module` / `from`.

3. **`999H_MILESTONE_09_INTERACTIVE_TASK_TEST_CONSOLE.js`**  
   - `M09_ROWKEY_MISSING_SAFE_DISABLED`: asserts `url` empty, `safeDisabled`, `reason === TASK_ROW_KEY_MISSING`, probe `NRK_ONLY_NO_ROW`.  
   - `M09_SOP_ACTION`: asserts `taskId=` (query), `source=` or `module=`, `from=`, strict `taskId` (no loose body match).

## Marker preflight

`cbv-marker-contract-self-check.mjs` — **PASS** (M06/M07/M08/M09 contracts, HTML + console JS).

## Expected GAS outcome (after push + M09 run)

- `M09_ROWKEY_MISSING_SAFE_DISABLED` = OK  
- `M09_SOP_ACTION` = OK  
- `REPORT_ENVELOPE` = OK when no other ERROR checks fail  

## Next step

Deploy: `clasp push` → run M09, M07, M08 test consoles → confirm new Drive bundle (append-only numbering).
