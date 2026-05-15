# Phase M09.1 — Fix Interactive Task Runtime Failures (Drive report 121)

**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Scope:** Fix only `M09_ROWKEY_MISSING_SAFE_DISABLED` and `M09_SOP_ACTION` (no envelope fake, no new phase, no UI redesign).

## Contract fixes

### 1. Row key missing → fail closed

- `CbvAppSheetBridge_resolveExplicitTaskMainRowKey_(task)` — only explicit TASK_MAIN row keys (`raw.row`, `_RowNumber`, `TASK_ROW_KEY` on `raw`, `TASK_MAIN_ID`, etc.); never `taskId` / `TASK_ID` / `id` / alert ids.
- `CbvAppSheetBridge_buildTaskMainDetailUrl_` / `buildTaskMainFormUrl_` use explicit resolver → `{ ok: false, url: '', reason: 'TASK_ROW_KEY_MISSING', safeDisabled: true }` when missing.
- Loose `resolveTaskRowKey_` remains for upload/feedback/M07-style paths.

### 2. SOP action → task context in URL

- `CbvInteractiveTaskRuntime_buildSopUrl_` — `/workspace/sop` with `taskId`, `source`, `module`, optional `rowKey`, `from`, `returnRoute`.
- Workboard card + legacy `CbvStaffWorkboard__sopHref_` aligned where applicable (`module`, `from`).

### 3. M09 test console (`999H`)

- Row-key probe: `{ taskId: 'NRK_ONLY_NO_ROW', raw: {} }` asserts empty URLs, `safeDisabled`, `TASK_ROW_KEY_MISSING`.
- SOP probe: href must include `/workspace/sop`, `taskId=SOP1` (query), `source=` or `module=`, `from=`.

## Post-fix verification (GAS — deploy machine)

1. `clasp push`
2. M09 — Run Interactive Task Runtime Test → new bundle prefix (e.g. 122), do not overwrite 121.
3. M07 — AppSheet Live Bridge Test  
4. M08 — Operational State Runtime Test  

**Until GAS re-run:** treat M09/M07/M08 as **NOT VERIFIED ON GAS**; no GO claim from local-only work.
