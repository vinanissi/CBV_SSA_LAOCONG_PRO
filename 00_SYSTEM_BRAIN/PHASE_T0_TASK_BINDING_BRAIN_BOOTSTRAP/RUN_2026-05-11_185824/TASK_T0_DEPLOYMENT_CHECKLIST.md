---
doc: TASK_T0_DEPLOYMENT_CHECKLIST
phase: T0_TASK_BINDING_BRAIN_BOOTSTRAP
purpose: Manual-first checklist before any clasp push or spreadsheet binding
doctrine: No live credentials in Git; staging before prod
generatedAt: 2026-05-11T18:58:24+07:00
---

# TASK_T0_DEPLOYMENT_CHECKLIST

## A. Clasp binding

- [ ] Copy `apps-script/task/.clasp.json.example` → local `.clasp.json` (git-ignored) **on operator machine only**.
- [ ] Fill **`scriptId`** with the **staging** Apps Script project ID for TASK module (never commit this file if policy forbids).
- [ ] Confirm **`rootDir`:** `src` and **`fileExtension`:** `js`.
- [ ] Run `clasp status` / `clasp list` locally to verify authenticated user matches intended Google account.
- [ ] Optional: `clasp open` to verify project is correct spreadsheet-bound container.

## B. spreadsheetId (container)

- [ ] Record **Spreadsheet ID** (container workbook) in operator vault / runbook — **not** in public Git.
- [ ] Verify spreadsheet has required sheets per bootstrap (`TASK_MAIN`, `TASK_CHECKLIST`, etc.) on **staging** first.

## C. scriptId

- [ ] **TASK script:** distinct from `main-control` and `core-runtime-lib`.
- [ ] Document mapping in private runbook: `TASK_SCRIPT_ID`, `MAIN_CONTROL_SCRIPT_ID`, `CORE_LIB_SCRIPT_ID` as applicable.

## D. Staging / prod separation

- [ ] **Staging:** separate spreadsheet + script or isolated tab policy per org standards.
- [ ] **Prod:** promote only after smoke + OBS health + task audit menus pass on staging.
- [ ] Never use production `scriptId` in developer `.clasp.json` during experimentation.

## E. Dependency map (logical)

- [ ] TASK bootstrap expects **schema / sheet helpers** from deployed core (library or inlined monolith).
- [ ] If using **library**: attach correct **core-runtime-lib** version in Apps Script UI; note library deployment ID.
- [ ] If using **monolith push**: confirm `05_GAS_RUNTIME` includes required TASK files **and** deliberate policy for TASK_OBS (currently drift vs task tree—resolve before relying on OBS in monolith).

## F. Push order

- [ ] Match `.clasp.json.example` **`filePushOrder`** exactly for first clean push after conflicts.
- [ ] Ensure **OBS core** files (`250*`, `251*`, `255*`) load before `300_TASK_OBS_CONFIG` / `301_TASK_OBS_ADAPTER`, before menus `307_*`, per declared order.
- [ ] After push: Apps Script editor → verify file list order / absence of parse errors.

## G. Smoke test (manual)

- [ ] From spreadsheet UI: run TASK system smoke / audit menu items if installed (environment-specific).
- [ ] Run schema integrity path on **staging** data copy.
- [ ] Verify `TASK_MAIN` headers include **SHARED_WITH**, **IS_PRIVATE**, **REPORTER_ID** when aligned to production baseline.

## H. Rollback note

- [ ] **Versioning:** use Apps Script “Manage versions” before risky pushes.
- [ ] **Spreadsheet:** restore from Drive version history or known-good copy if bootstrap damages headers (avoid running unknown repair menus on prod).
- [ ] **Git:** rollback code via branch tip move **only** per team policy (no history rewrite in this charter).

## Explicit non-actions (this run)

- Did **not** create real `.clasp.json` in repo.
- Did **not** `clasp push` or deploy web apps.
