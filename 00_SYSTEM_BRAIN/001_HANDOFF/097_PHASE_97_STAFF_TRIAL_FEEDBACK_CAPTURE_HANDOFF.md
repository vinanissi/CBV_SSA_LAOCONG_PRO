# Handoff — Phase 97 — Staff Trial Execution / Feedback Capture

**To:** Pilot lead / Runtime owner  
**From:** Phase 97 implementation  
**Date:** 2026-05-14

## What shipped

- **Runtime (`998J`):** ensures sheet `CBV_WEBAPP_UAT_FEEDBACK` + headers; exposes runbook/schema/triage JSON; `createFeedback` appends one row (validated enums + frozen routes); `listRecentFeedback`; `buildHandoffPrompt`; `validate` (includes Phase 96.1 helper probe + namespace mutation probe).
- **Test Console (`998K`):** CBV_TCS_V1 report + menu under **CBV Test Console → Phase 97 — Staff Trial**.
- **Docs:** Vietnamese runbook, triage matrix, AI handoff template; schema §7 in `WEBAPP_UAT_FEEDBACK_SCHEMA.md`.

## Operating steps

1. `clasp push` (or deploy) so `998J`/`998K` load after `998I`.
2. Open the **bound** spreadsheet → **Run Staff Trial Health Check**. If sheet missing, run `CbvWebAppStaffTrial_ensureSchema()` once (menu can be added later or run from script editor).
3. Staff follow `docs/webapp/WEBAPP_STAFF_TRIAL_RUNBOOK_VI.md`.
4. Capture issues via `CbvWebAppStaffTrial_createFeedback` (from script editor / future thin UI) — **never** point this API at business tables.

## Hard rules

- No TASK_MAIN / business writes from Phase 97.
- No production certification narrative in pilot artefacts.
- Frozen routes unchanged; Phase 96.1 URL builder must remain available.

## Suggested next step

After trial: aggregate `DECISION` / `SEVERITY` in sheet, fill `WEBAPP_PHASE_97_AI_HANDOFF.md`, attach latest `CbvWebAppStaffTrial_TestConsole_run` JSON, then schedule fix pack or widen pilot per governance.
