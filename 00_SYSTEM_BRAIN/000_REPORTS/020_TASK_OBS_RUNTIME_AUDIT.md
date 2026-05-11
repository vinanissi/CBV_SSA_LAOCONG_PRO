---
doc: 020_TASK_OBS_RUNTIME_AUDIT
phase: PHASE_B_TEST_RUNTIME
purpose: Read-only audit of TASK_OBS stack under apps-script/task/src
generatedAt: 2026-05-11T21:30:00+07:00
---

# TASK_OBS runtime audit (`apps-script/task/src/`)

Scope: `250_CBV_OBS_CORE_SCHEMA.js`, `251_CBV_OBS_CORE_WRITER.js`, `255_CBV_OBS_CORE_MENU_HELPERS.js`, `300_TASK_OBS_CONFIG.js`, `301_TASK_OBS_ADAPTER.js`, `307_TASK_OBS_MENU.js`.

## Summary

| Area | Assessment |
|------|------------|
| Vendoring / drift | **WARNING** — Headers mark vendored copy from `core-runtime-lib` (`300/301/305`); drift vs library source must be tracked on bump. |
| Bootstrap order | **OK** — `.clasp.json.example` orders core OBS before `300_TASK_OBS_CONFIG` / `301_TASK_OBS_ADAPTER` before menu `307_*`. |
| DB coupling | **SAFE with config** — `TaskObs_openTaskDb_()` uses `PropertiesService.getScriptProperty('CBV_TASK_DB_ID')` + `SpreadsheetApp.openById`; no hardcoded spreadsheet id in source. |
| Active spreadsheet | **CONTROLLED** — `255_*`: `setActiveSheet` only when `getActiveSpreadsheet().getId() === ss.getId()` (no cross-book tab hijack). |
| Write paths | **APPEND-ORIENTED** — `251_*` appends rows via `getRange(nextRow,...).setValues`; schema comments: add-only headers, no reorder/delete. |
| Production business | **LOW COUPLING** — TASK_OBS does not import `20_TASK_SERVICE`; optional `CBV_MAIN_CONTROL_WEBAPP_URL` / token reads for emit path only. |
| Unsafe patterns | **NONE FOUND** in sampled paths: no `deleteRow`/`clear()` on data ranges in reviewed writer/menu slices; exceptions swallowed in public APIs where documented. |

## Per-file notes

### `250_CBV_OBS_CORE_SCHEMA.js`

- **Role:** CBV_OBS_CORE schema + `CBV_Obs_ensureSheets` / header helpers (B1).
- **Dependency:** Expects `config` with `dbResolver` / sheet map; **no** `SpreadsheetApp.getActiveSpreadsheet` fallback in contract (enforced by design comment).
- **Append-only:** Documented: create missing sheets; extend headers only.

### `251_CBV_OBS_CORE_WRITER.js`

- **Role:** `CBV_Obs_append*` for health, testRun, testResult, finding, audit, eventTrace, metrics, AI export, dashboard, operator guide.
- **Flow:** `normalizeConfig` → optional `ensureSheets` (swallowed on failure) → `openDb_` → ensure headers (best-effort) → append single row.
- **Risk:** Low — failures return structured `CBV_Obs_stdResponse_` without rethrow from public append APIs.

### `255_CBV_OBS_CORE_MENU_HELPERS.js`

- **Role:** UI helpers; `CBV_Obs_openSheet` uses active SS guard before `setActiveSheet`.
- **Risk:** UI-only; no sheet mutation beyond navigation/freeze helpers (review `CBV_Obs_freezeAndResizeSheet` in same file for staging impact — cosmetic).

### `300_TASK_OBS_CONFIG.js`

- **Role:** `TaskObs_getConfig()` — `moduleCode: 'TASK'`, sheet name map (`TASK_OBS_*`), `dbResolver: TaskObs_openTaskDb_`.
- **Bootstrap:** `TaskObs_bootstrap` / `TaskObs_bootstrapDryRun` — dry run refuses if `CBV_TASK_DB_ID` missing (good staging gate).
- **Dependency:** Requires CBV_OBS_CORE symbols (`CBV_Obs_ensureSheets`, `CBV_Obs_schemaReport`, `CBV_Obs_appendHealth`).

### `301_TASK_OBS_ADAPTER.js`

- **Role:** Health, self-test, sample data, AI export build, optional emit to MAIN_CONTROL webapp.
- **Writes:** Self-test appends test run rows, test results, findings (non-INFO), audit/event samples — **all OBS-scoped**; acceptable on **staging** TASK spreadsheet only.
- **Properties:** Reads `CBV_TASK_DB_ID`, `CBV_MAIN_CONTROL_WEBAPP_URL`, `CBV_MAIN_WEBAPP_TOKEN` — **token hygiene WARNING** (never log token; ensure properties not committed).

### `307_TASK_OBS_MENU.js`

- **Role:** `onOpen` installs `🛡️ TASK OBS` menu; delegates to `TaskObs_*` handlers.
- **Risk:** `onOpen` additive for TASK-bound script; no TASK_MAIN row mutations from menu handlers in reviewed surface (bootstrap/health/self-test/OBS writes only).

## Gaps / follow-ups (next phase)

1. **Green baseline:** Run health + self-test on **staging** TASK container after `CBV_TASK_DB_ID` set; verify OBS sheets created.
2. **Mirror:** Align or document divergence vs `05_GAS_RUNTIME` for monolith deployments.
3. **Test contract:** Unify runner JSON output with `020_TEST_RUNTIME_CONTRACT.md` (this phase).

## Conclusion

**GO_WITH_WARNINGS** for code audit in isolation — safe for staging-bound OBS append operations; not a substitute for live smoke on a real staging spreadsheet.
