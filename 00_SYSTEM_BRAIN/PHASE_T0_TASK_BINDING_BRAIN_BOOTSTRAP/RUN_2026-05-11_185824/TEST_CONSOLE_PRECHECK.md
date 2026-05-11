---
doc: TEST_CONSOLE_PRECHECK
phase: T0_TASK_BINDING_BRAIN_BOOTSTRAP
purpose: Audit existing test/OBS menus and reporting hooks without new runtime
doctrine: No redesign; inventory and gaps only
generatedAt: 2026-05-11T18:58:24+07:00
---

# TEST_CONSOLE_PRECHECK

## Scope

This document audits **current** menu/test/OBS/report structure as present in the repository. **No new runtime** or menu installer was added during this bootstrap.

## Menus hiện có (repo evidence)

### MAIN_CONTROL — OBS

- **File:** `apps-script/main-control/src/307_MC_OBS_MENU.js`
- **Top-level UI menu:** `MAIN_CONTROL OBS` (emoji-prefixed per implementation).
- **Major groups (from file header contract):** Bootstrap, Health, Self/smoke/schema tests, AI diagnostic export, open dashboards / findings / latest test results / AI export / metrics / event trace / audit logs, setup (web app URL, script properties, connection package), repair registry headers, operator guide, about.

### MAIN_CONTROL — other test surfaces

- `90_CBV_CORE_V2_TESTS.js` — core v2 tests (separate from OBS).
- `139_CBV_LEVEL6_HARDENING_TESTS.js`, `140_CBV_LEVEL6_HARDENING_MENU.js` — Level-6 hardening (distinct from TASK_OBS).

### TASK project

- **OBS menu file:** `apps-script/task/src/307_TASK_OBS_MENU.js` (TASK-side OBS operator surface).
- **System test runner:** `97_TASK_SYSTEM_TEST_RUNNER.js` (+ assertions/mocks).
- **Debug entrypoints:** `99_DEBUG_TASK_TEST.js`, `99_DEBUG_TEST_TASK.js`.

### Monolith (`05_GAS_RUNTIME`)

- Menu aggregation in `90_BOOTSTRAP_MENU.js` / helpers (not re-parsed in depth here); TASK tests mirrored under `97_TASK_SYSTEM_TEST_RUNNER.js`.

## OBS layer audit (high level)

| Layer | Location | Status |
|-------|----------|--------|
| MC_OBS schema/bootstrap/writer/health | `apps-script/main-control/src/300–303*.js` | Present |
| MC_OBS tests + AI export + menu | `304`, `305`, `307` | Present |
| TASK_OBS bundle | `apps-script/task/src/250–301, 307` | Present in workspace (binding T0) |
| TASK_OBS in `05_GAS_RUNTIME` | — | **Not present** (drift vs task bundle) |

## Report structure (OBS / tests)

- **MC_OBS test runner** appends structured rows (e.g. test run, event trace, audit) per `304_MC_OBS_TEST_RUNNER.js` patterns.
- **TASK system tests** in `07_TEST` and mirrors produce findings lists / schema integrity messages suitable for console or log sink depending on deployment.

## Thiếu gì để “đạt chuẩn” (non-redesign framing)

1. **Single source of truth** for TASK system test column expectations vs `90_BOOTSTRAP_SCHEMA` TASK_MAIN (add **REPORTER_ID**, **SHARED_WITH**, **IS_PRIVATE** to harness “required” set, or document intentional subset).
2. **Explicit vendoring doc + automation** aligning `apps-script/task` TASK_OBS with `05_GAS_RUNTIME` when monolith push is required.
3. **Upstream git remote** for phase branch when team agrees (not done in this charter).
4. **Credential hygiene:** PAT-in-remote blocks “clean” collaboration story until rotated.

## Phase đề xuất (sequencing only)

1. **T0_TASK_BINDING** — clasp IDs, library links, `filePushOrder` validation on staging script.
2. **TASK_OBS vendoring / mirror** — controlled copy or documented exception list.
3. **Test harness alignment** — one authoritative `TEST_REQUIRED_COLS` export shared by `07_TEST` and GAS copies.

## Không redesign

- Không thay đổi workflow nghiệp vụ TASK, không thay MAIN_CONTROL router/core, không đổi AppSheet production binding trong phase bootstrap này.
