---
doc: WORKSPACE_AUDIT
phase: T0_TASK_BINDING_BRAIN_BOOTSTRAP
purpose: Read-only inventory of TASK / MAIN_CONTROL / runtime / test surfaces for T0 binding
doctrine: Descriptive only; no production schema or workflow changes in this phase
generatedAt: 2026-05-11T18:58:24+07:00
---

# WORKSPACE_AUDIT

## 1. `apps-script/task`

### `.clasp.json.example`

- **rootDir:** `src`
- **fileExtension:** `js`
- **scriptId placeholder:** `PASTE_TASK_SCRIPT_ID_HERE` (example-only; no live binding in repo by design here).

### `filePushOrder` (declared order)

Observed sequence (abridged labels):

1. Core TASK layer: `20_TASK_REPOSITORY.js` → `20_TASK_VALIDATION.js` → `20_TASK_STATUS_SNAPSHOT.js` → `20_TASK_SERVICE.js` → `20_TASK_MIGRATION_HELPER.js` → `90_BOOTSTRAP_TASK.js`
2. **OBS core (task bundle):** `250_CBV_OBS_CORE_SCHEMA.js` → `251_CBV_OBS_CORE_WRITER.js` → `255_CBV_OBS_CORE_MENU_HELPERS.js` → `300_TASK_OBS_CONFIG.js` → `301_TASK_OBS_ADAPTER.js`
3. System layer: `95_TASK_SYSTEM_BOOTSTRAP.js` → `96_TASK_SYSTEM_AUDIT_REPAIR.js` → test stack → `307_TASK_OBS_MENU.js` → debug entries last.

**Note:** OBS files are present under `apps-script/task/src/` as untracked/new in current working tree audit snapshot.

### Dependency TASK → core

- **Logical:** `90_BOOTSTRAP_TASK.js` documents dependency on shared bootstrap/schema helpers (`ensureSheetExists`, `getSchemaHeaders`, `_writeHeaders`) supplied by the **container** project or linked library, not duplicated in the task-only file list.
- **Clasp:** Task project is a **separate** Apps Script project from `apps-script/core-runtime-lib` (distinct `filePushOrder` and scriptId). Operators must align **library attachment** or **monolithic push** policy manually—this repo supports split layouts.

### OBS files (task)

| File | Role (from naming / skim) |
|------|---------------------------|
| `250_CBV_OBS_CORE_SCHEMA.js` | OBS schema for task-side bundle |
| `251_CBV_OBS_CORE_WRITER.js` | OBS writer |
| `255_CBV_OBS_CORE_MENU_HELPERS.js` | Menu helpers |
| `300_TASK_OBS_CONFIG.js` | TASK_OBS config |
| `301_TASK_OBS_ADAPTER.js` | Adapter boundary |
| `307_TASK_OBS_MENU.js` | Operator menu surface |

### Bootstrap / system / menu

- **Bootstrap:** `90_BOOTSTRAP_TASK.js`, `95_TASK_SYSTEM_BOOTSTRAP.js`
- **Audit/repair:** `96_TASK_SYSTEM_AUDIT_REPAIR.js`
- **Tests:** `97_TASK_SYSTEM_TEST_*.js`, `99_DEBUG_*`
- **Menus:** OBS menu file `307_TASK_OBS_MENU.js`; system tests invoked per project wiring (not redesigned here).

---

## 2. `apps-script/main-control`

### MC_OBS stack (files)

| File | Concern |
|------|---------|
| `300_MC_OBS_SCHEMA.js` | Schema |
| `301_MC_OBS_BOOTSTRAP.js` | Bootstrap |
| `302_MC_OBS_WRITER.js` | Writer |
| `303_MC_OBS_HEALTH.js` | Health |
| `304_MC_OBS_TEST_RUNNER.js` | Self/smoke/schema test runner entrypoints |
| `305_MC_OBS_AI_EXPORT.js` | AI diagnostic export |
| `306_MC_OBS_MODULE_CLIENT.js` | Module client |
| `307_MC_OBS_MENU.js` | Operator menu (`MAIN_CONTROL OBS`) |

### Test runner (OBS)

- `304_MC_OBS_TEST_RUNNER.js` exposes `MC_Obs_runSelfTest`, `MC_Obs_runSmokeTest`, `MC_Obs_runSchemaTest`, `MC_Obs_generateSampleData` (OBS-scoped sample paths per header contract).

### AI export

- `305_MC_OBS_AI_EXPORT.js` present for diagnostic export pipeline (details out of scope for T0 prep).

### Menu OBS

- `307_MC_OBS_MENU.js` — comprehensive menu tree (Bootstrap, Health, Tests, Open dashboards, setup/repair, operator guide).

---

## 3. `05_GAS_RUNTIME` (mirror drift)

### TASK files

Present (non-exhaustive): `20_TASK_*.js`, `90_BOOTSTRAP_TASK.js`, `95_TASK_SYSTEM_BOOTSTRAP.js`, `96_TASK_SYSTEM_AUDIT_REPAIR.js`, `97_TASK_SYSTEM_TEST_*.js`, `99_DEBUG_*TASK*`, etc.

### OBS files

- **Finding:** No `250_CBV_OBS_*` / `300_TASK_OBS_*` / `307_TASK_OBS_MENU.js` counterparts under `05_GAS_RUNTIME/` in this audit.
- **Risk:** **Mirror drift** between `apps-script/task` (TASK + TASK_OBS bundle) and `05_GAS_RUNTIME` (production-style monolith). Vendoring policy must decide authoritative copy for each deployment target (see `docs/TASK_OBS_RUNTIME_VENDORING.md` if present).

### Mirror drift risk summary

| Area | Risk |
|------|------|
| TASK_OBS only in task clasp tree | Deployments that push only `05_GAS_RUNTIME` will **omit** TASK_OBS until explicitly mirrored or library-wired. |
| Dual maintenance | Bugfixes could land in one tree only. |

---

## 4. `07_TEST`

### Runner mismatch risk

| Copy | Path | Notes |
|------|------|-------|
| Standalone runner | `07_TEST/task_system_test_runner.js` | Source-of-truth style comment for spreadsheet copy-paste |
| GAS bundle mirror | `05_GAS_RUNTIME/97_TASK_SYSTEM_TEST_RUNNER.js` | Comment: sourced from `07_TEST` |
| Task project | `apps-script/task/src/97_TASK_SYSTEM_TEST_RUNNER.js` | Same `TEST_REQUIRED_*` structure; helper names differ slightly (`_getTestSheet` vs `_getSheet`) |

**Risk:** Three copies can diverge on `TEST_REQUIRED_COLS` or transition tables; changes must be propagated intentionally.

### `TASK_MAIN` required columns (test harness vs production baseline)

- **07_TEST / GAS copies** minimal `TASK_MAIN` list includes:  
  `ID`, `TITLE`, `STATUS`, `PRIORITY`, `OWNER_ID`, `DON_VI_ID`, `TASK_TYPE_ID`, `IS_DELETED`, `DONE_AT`
- **`05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js`** (production-oriented manifest) includes among others **`REPORTER_ID`**, **`SHARED_WITH`**, **`IS_PRIVATE`** in `TASK_MAIN` column order.

**Gap:** Test harness “required columns” are **stricter subset but omit** visibility/privacy columns enforced by production baseline (v2.2.4+). Tests may pass while **AppSheet / service assumptions** on `SHARED_WITH` / `IS_PRIVATE` are untested, or conversely schema checks may flag “missing” columns if harness is used as sole validator.

---

## Summary

- Task clasp tree: **TASK + TASK_OBS** wired in `filePushOrder`.
- Main Control: **MC_OBS** menu + runner + AI export **present**.
- Monolith mirror: **TASK_OBS absent** from `05_GAS_RUNTIME` → treat as **known drift** until vendoring phase.
- Tests: **triplicate runners** + **column expectation drift** vs `90_BOOTSTRAP_SCHEMA` TASK_MAIN.
