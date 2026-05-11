---
doc: 023_LIVE_STAGING_PREFLIGHT
phase: PHASE_B_LIVE_STAGING_GREEN_EXECUTION_PREP
purpose: Preconditions before running TASK_OBS live on staging
generatedAt: 2026-05-11T22:30:00+07:00
---

# Live staging preflight — TASK_OBS

## Conditions before running for real

1. **Dedicated staging workbook** exists and is named/labeled in your runbook so operators cannot confuse it with production.
2. **TASK Apps Script project** is the one intended for staging (separate from prod script project recommended).
3. **OAuth / authorization** completed for the account that will execute menus (Editor on staging spreadsheet).
4. **Script Properties** can be edited in the Apps Script UI for that project.
5. **No production URL** in browser tab when setting properties or running menus.

## Confirming “staging” vs “production”

- Compare **internal runbook name**, **Drive folder**, and **naming convention** (e.g. suffix `-STAGING`) — do not rely on sheet title alone.
- **Never** reuse production `CBV_TASK_DB_ID` value in a staging script for “quick test” — use a **different** spreadsheet id stored only in vault + Script Properties.
- Optional: different Google account or Shared Drive for staging assets.

## Setting `CBV_TASK_DB_ID` (no real ID in Git)

1. Open the **staging** spreadsheet in the browser; copy the id from the URL pattern `.../d/<SPREADSHEET_ID>/edit`.
2. Open **Apps Script** for the **staging** TASK project → **Project Settings** → **Script properties**.
3. Add property key **`CBV_TASK_DB_ID`**, value = the id from step 1.
4. **Do not** paste the id into Git, Slack logs, or markdown in this repo — use `VAULT_ONLY` in templates.
5. Redact if pasting screenshots for audits.

## Confirm operator has Editor access

- Open staging spreadsheet as the same user who will run menus → confirm **Editor** (not Viewer).
- If using service account: share spreadsheet with SA email as Editor.

## Confirm `.clasp.json` is local-only

- Repo must contain only `.clasp.json.example`.
- Real `.clasp.json` stays on operator machine and is listed in `.gitignore` — run `git status` and confirm no `apps-script/task/.clasp.json` staged.

## Confirm sample data not run on production

- **Policy:** `TaskObs_generateSampleData` and self-test append paths run **only** after preflight passes on **staging** id.
- If unsure which id is bound, run **`TaskObs_bootstrapDryRun`** first and verify messages refer to expected environment (no prod workbook name in UI if ambiguous).

## Preflight conclusion

| State | When |
|-------|------|
| **READY** | Staging-only id confirmed, Editor access, script project confirmed, properties UI reachable, clasp local-only. |
| **READY_WITH_WARNINGS** | Optional MAIN_CONTROL URL/token missing — acceptable for TASK-only green if emit not required. |
| **BLOCKED** | Missing `CBV_TASK_DB_ID`, wrong spreadsheet, no edit access, or ambiguity staging vs prod. |

**This document’s conclusion (planning-only):** **READY_WITH_WARNINGS** — operator must still perform live steps; automation here does not set properties or run clasp.
