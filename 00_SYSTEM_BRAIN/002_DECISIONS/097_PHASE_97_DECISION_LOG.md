# Decision log — Phase 97 — Staff trial / feedback capture

**Date:** 2026-05-14  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Phase:** `PHASE_97_STAFF_TRIAL_FEEDBACK_CAPTURE`  
**Status:** ACCEPTED (pilot tier).

---

## 1. Context

Phase 96.1 delivered canonical WebApp URLs. Phase 97 adds an operational layer for **staff trial execution**: machine-readable runbook/schema/triage, a **dedicated feedback sheet** (`CBV_WEBAPP_UAT_FEEDBACK`) with append-only capture via `CbvWebAppStaffTrial_createFeedback`, and a **CBV_TCS_V1** Test Console (`998K`) — without WebApp business mutation.

## 2. Decision

1. **Feedback is isolated** in sheet `CBV_WEBAPP_UAT_FEEDBACK` with fixed headers (see `998J` / `WEBAPP_UAT_FEEDBACK_SCHEMA.md` §7). No writes to `TASK_MAIN` or other business tables from Phase 97 APIs.
2. **Append-only by policy** for feedback history; physical row delete is out of scope; `IS_DELETED` is reserved for future soft-filter only.
3. **Phase 95 scripted UAT schema** (17-field `UAT_ID` model) remains documented separately; Phase 97 sheet uses the wider capture model for trial operations.
4. **Triage matrix** is advisory; human pilot lead owns GO / GO_WITH_WARNINGS / NO_GO.
5. **999 dispatcher file** remains last in `.clasp.json` `filePushOrder`; `998J`/`998K` load immediately after `998I`.

## 3. Consequences

- Pilot teams can record issues with consistent enums (`FEEDBACK_TYPE`, `SEVERITY`, `STATUS`, `DECISION`).
- Engineering must not repurpose `createFeedback` for business writes.
- Any future “update feedback row” automation requires a new phase + decision + mutation audit.

## 4. Not in scope

- AppSheet Bot, AI runtime decisions, auto assign/resolve/escalate.
- Production certification language in runtime prompts.
