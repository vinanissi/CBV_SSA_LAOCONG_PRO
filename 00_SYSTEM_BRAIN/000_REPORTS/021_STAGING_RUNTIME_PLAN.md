---
doc: 021_STAGING_RUNTIME_PLAN
phase: PHASE_B_TEST_RUNTIME_GREEN_BASELINE
purpose: Staging-only plan for TASK_OBS green baseline (no live deploy in this doc)
generatedAt: 2026-05-11T22:00:00+07:00
---

# Staging runtime plan — TASK_OBS green baseline

**Doctrine:** staging-first; no production Apps Script deploy during baseline phase; operator confirms each spreadsheet binding.

## 1. `CBV_TASK_DB_ID` flow

| Step | Action |
|------|--------|
| 1 | Create or choose a **staging** Google Spreadsheet (container for TASK module + OBS sheets). |
| 2 | Copy Spreadsheet ID (from URL) — store only in **Script Properties** `CBV_TASK_DB_ID` on the **TASK** Apps Script project (or vault runbook), **never** in Git. |
| 3 | Bind the TASK script project to that spreadsheet via clasp **operator machine** (`.clasp.json` local, gitignored). |
| 4 | `TaskObs_bootstrapDryRun()` — validates id present + schema report path; fails fast if id missing. |
| 5 | `TaskObs_bootstrap()` — creates missing OBS sheets + headers (add-only). |

## 2. Staging spreadsheet binding

- **One spreadsheet** = TASK operational data + TASK_OBS telemetry tables for that environment.
- **Separation:** Production workbook must use a **different** script project or at minimum a different `CBV_TASK_DB_ID` — never point staging script at prod id during experiments.
- **Access:** Service account or human operator running menus must have **Editor** on staging file (for append).

## 3. Script Properties required

| Key | Required | Purpose |
|-----|----------|---------|
| `CBV_TASK_DB_ID` | **REQUIRED** | Opens TASK DB via `SpreadsheetApp.openById`. |
| `CBV_MAIN_CONTROL_WEBAPP_URL` | OPTIONAL | Optional emit to MAIN_CONTROL webapp (health mentions if missing). |
| `CBV_MAIN_WEBAPP_TOKEN` | OPTIONAL | Paired with URL for emit; **secret** — rotate if exposed. |

No other TASK_OBS baseline keys are mandatory for green self-test (per current adapter).

## 4. OBS sheet creation flow

1. Load `TaskObs_getConfig()` → sheet name map (`TASK_OBS_*`).
2. `CBV_Obs_ensureSheets(config)` — create missing tabs, align headers add-only (`250_*` / schema).
3. `TaskObs_bootstrap()` — optional health row `TASK_OBS_BOOTSTRAP` best-effort.
4. Operator visually confirms all expected tabs exist (see `021_TASK_OBS_SHEET_MAP.md`).

## 5. Health / self-test flow

1. **Health:** `TaskObs_healthCheck()` (menu or runner) → findings in memory + append `TASK_OBS_HEALTH` + non-INFO rows to `TASK_OBS_FINDING`.
2. **Self-test:** `TaskObs_runSelfTest()` → `RUN_ID` generated; appends `TASK_OBS_TEST_RUN` (start + finish rows), `TASK_OBS_TEST_RESULT` per case, findings/audit/event samples as coded.
3. **Trace:** `RUN_ID` is the primary **traceId** for correlating rows across sheets for that run.

## 6. Append-only verification flow

1. Record `lastRow` (or row count) on `TASK_OBS_TEST_RUN` **before** self-test.
2. Run self-test once.
3. Confirm new rows appended (count increased); **no** mass clear of historical rows.
4. Export or screenshot for audit optional; markdown append-only report in `000_REPORTS/RUN_*` if operator maintains RUN folders.

## Rollback-safe notes

- **Drive:** Use version history on staging spreadsheet if a bad bootstrap occurred (rare; bootstrap is add-only).
- **Script:** Apps Script version history before risky edits (not part of this baseline doc execution).
- **Git:** No repo rollback required for staging-only operations if code unchanged.

## Staging-only doctrine (summary)

- Configure → dry-run → bootstrap → health → self-test → verify append-only → document RUN_ID in operator log.
- **Never** run sample-data or self-test menus against production `CBV_TASK_DB_ID` until explicit prod sign-off.
