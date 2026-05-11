---
doc: 024_OPERATOR_EXECUTION_PACKAGE
phase: PHASE_B_LIVE_STAGING_OPERATOR_RUN_PREP
purpose: Single package so a second operator can execute staging RUN correctly
generatedAt: 2026-05-11T23:00:00+07:00
---

# Operator execution package — TASK_OBS live staging

Read first: `023_LIVE_STAGING_PREFLIGHT.md`, `023_TASK_OBS_STAGING_RUNBOOK.md`, `023_LIVE_STAGING_EXECUTION_GATE_CHECKLIST.md`, `023_TASK_OBS_LIVE_GREEN_RUN_REPORT_TEMPLATE.md`.

## 1. Preconditions

- [ ] Staging spreadsheet identity confirmed (non-production naming / runbook).
- [ ] TASK Apps Script project = **staging** project (not prod script id in clasp).
- [ ] `CBV_TASK_DB_ID` set in **Script properties** to staging spreadsheet id (**vault only** — never paste into Git).
- [ ] Executor has **Editor** on staging spreadsheet.
- [ ] Latest code pushed to staging script (operator `clasp push` if needed).

## 2. Local-only files

- `.clasp.json` (real) — **machine only**, gitignored.
- Any operator notes with **real ids** — **vault** or encrypted note store.

## 3. Required permissions

- Apps Script: run as user who can open the staging spreadsheet.
- OAuth scopes: accept only what the project requires; review consent screen if enterprise policy applies.

## 4. Apps Script authorization

- First run: complete authorization flow in browser.
- Re-authorize if project changed or scopes changed.

## 5. Staging verification

- Open staging spreadsheet URL from **trusted runbook** (not from unverified chat).
- Confirm file title / folder matches **staging** convention.

## 6. Dry-run order

1. Run **`TaskObs_bootstrapDryRun`** (Editor Run or menu).
2. Read output: must not show **BLOCKER** for missing `CBV_TASK_DB_ID` or missing core.
3. If BLOCKER → fix properties / deploy; **abort** until dry-run acceptable.

## 7. Bootstrap order

1. **`TaskObs_bootstrap`** after dry-run OK.
2. Visually confirm `TASK_OBS_*` tabs exist (`021_TASK_OBS_SHEET_MAP.md`).

## 8. Health order

1. **`TaskObs_healthCheck`**.
2. Record outcome (ok / code / findings count) — **no secrets** in notes.

## 9. Self-test order

1. Record **row count** on `TASK_OBS_TEST_RUN` **before** run.
2. **`TaskObs_runSelfTest`**.
3. Record **RUN_ID** from UI or sheet (store **vault** or redacted report).

## 10. RUN_ID capture

- Primary: last rows in `TASK_OBS_TEST_RUN` with `RUN_TYPE` = `SELF_TEST` and `NOTE` = `FINAL` / `STARTED` pair.
- Copy RUN_ID to gate checklist + RUN report template **copy** (not this repo file with real id unless redacted).

## 11. Evidence capture

- Screenshot: redact URL bar if it contains spreadsheet id; or crop to sheet grid only.
- Export CSV: strip id columns if any; prefer OBS-only sheets.
- Transcript: remove token lines, property values.

## 12. Rollback notes

- Wrong property id: clear `CBV_TASK_DB_ID`, set correct value; use Drive version history on spreadsheet if wrong bootstrap ran.
- Do **not** mass-delete OBS rows in Git — operational recovery in Sheets only.

## 13. Abort conditions

- Any doubt staging vs prod → **stop** before bootstrap.
- Health returns unresolved **BLOCKER** for your org → stop; fix config.
- `TASK_MAIN` row count changes unexpectedly → **abort** self-test narrative; incident review.

## Handoff

- Another operator: start at **section 1**; do not skip dry-run.
