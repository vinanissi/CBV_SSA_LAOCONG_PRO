---
doc: 023_TASK_OBS_STAGING_RUNBOOK
phase: PHASE_B_LIVE_STAGING_GREEN_EXECUTION_PREP
purpose: Ordered operator runbook — clasp + Apps Script + TASK_OBS menus (staging only)
---

# TASK_OBS — staging runbook (operator-executed)

**Do not** run `clasp push` or bind ids from this automation without operator confirmation. **Do not** record real Spreadsheet ID, Script ID, tokens, or PAT in any repo file.

## 1. Prepare local `.clasp.json` (outside Git)

- Copy `apps-script/task/.clasp.json.example` → `apps-script/task/.clasp.json` on **operator PC only**.
- Set `scriptId` to the **staging** TASK Apps Script project id (from Apps Script URL / project settings) — value lives **only** in local file + optional vault; **never** commit `.clasp.json`.

## 2. `clasp status`

- From `apps-script/task/` (or repo root per your layout): `clasp status`
- Confirm logged-in Google account matches staging owner expectations.

## 3. `clasp push` (if operator confirms)

- Only after code review and **staging** target confirmation: `clasp push`
- **Not** production script project.

## 4. Open Apps Script (staging project)

- Verify project name / internal code matches staging runbook.

## 5. Set Script Properties

| Key | Required | Notes |
|-----|----------|-------|
| `CBV_TASK_DB_ID` | **Yes** | Staging spreadsheet id — vault only. |
| `CBV_MAIN_CONTROL_WEBAPP_URL` | Optional | For emit paths; do not log URL with embedded secrets. |
| `CBV_MAIN_WEBAPP_TOKEN` | Optional | **Secret** — never commit. |

## 6. Run functions (order recommended)

Use **Run** dropdown in editor or spreadsheet-bound menus after deploy:

1. **`TaskObs_bootstrapDryRun`** — confirms id + schema path; fix blockers before writes.
2. **`TaskObs_bootstrap`** — creates OBS sheets/headers (add-only).
3. **`TaskObs_healthCheck`** — review UI + `TASK_OBS_HEALTH` / findings.
4. **`TaskObs_runSelfTest`** — generates **RUN_ID**; appends test rows.

## 7. Record (operator fills `023_TASK_OBS_LIVE_GREEN_RUN_REPORT_TEMPLATE.md` copy)

- **RUN_ID** from self-test summary or `TASK_OBS_TEST_RUN` sheet.
- **Health** code / ok flag.
- **Row counts** before/after on `TASK_OBS_TEST_RUN` (and optionally `TASK_OBS_TEST_RESULT`).
- **Warnings/errors** from UI or execution transcript (redact secrets).
- **TASK_MAIN mutation check:** row count or hash of first/last row id unchanged — **required PASS** for green narrative.

## 8. No production deploy

- Do not change clasp target to production script id in the same session as staging experiments.

## Rollback / abort

- If wrong spreadsheet was opened: **do not** run bootstrap; clear Script Property and reset correct id.
- If bootstrap ran on wrong file: use Drive version history on that file (operational recovery — out of Git scope).
