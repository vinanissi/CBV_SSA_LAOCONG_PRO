---
doc: 024_RUNTIME_EVIDENCE_FLOW
phase: PHASE_B_LIVE_STAGING_OPERATOR_RUN_PREP
purpose: Flow from RUN_ID generation to Git-safe vs vault-only artefacts
generatedAt: 2026-05-11T23:00:00+07:00
---

# Runtime evidence flow

## Steps

1. **RUN_ID generated** — by `TaskObs_runSelfTest` (or equivalent); appears in `TASK_OBS_TEST_RUN` / summary JSON.
2. **OBS rows appended** — `TASK_OBS_TEST_RESULT`, optional `TASK_OBS_FINDING`, `TASK_OBS_AUDIT`, `TASK_OBS_EVENT_TRACE`.
3. **Health evidence** — prior or post health rows in `TASK_OBS_HEALTH`; findings sheet for non-INFO.
4. **Self-test evidence** — row deltas + UI alert text (redacted).
5. **Checklist sign-off** — `023_LIVE_STAGING_EXECUTION_GATE_CHECKLIST.md` (or printed copy) with Y/N.
6. **AI export** — if run: output may contain paths; **redact** before Git.
7. **Sanitized RUN report** — copy of `023_TASK_OBS_LIVE_GREEN_RUN_REPORT_TEMPLATE.md` with **no** raw spreadsheet id / script id / token; RUN_ID may be shortened or hashed per policy.
8. **Git-safe artefacts** — markdown summary: date, environment=staging, status GO/WARN/FAIL, **relative** sheet names only, no ids.
9. **Vault-only artefacts** — full RUN report with internal refs, unredacted screenshots for internal audit, Script Property export (never Git).

## Classification

| Class | Examples | Git? |
|-------|----------|------|
| **Git-safe** | Sanitized RUN summary, gate checklist PDF without URLs, commit message “docs(runtime): record …” | **Yes** |
| **Vault-only** | Full RUN_ID + spreadsheet id + script project id + operator raw notes | **No** |
| **Secret** | `CBV_MAIN_WEBAPP_TOKEN`, OAuth refresh tokens, webhook secrets | **Never** — rotate if exposed |
| **Runtime-only** | Live `TASK_OBS_*` row data in Google Sheets | **Stays in Sheets**; export to Git only if sanitized |

## Rule of thumb

If unsure → **Vault-only**. When in doubt, publish **one paragraph** summary + link to internal ticket — no ids.
