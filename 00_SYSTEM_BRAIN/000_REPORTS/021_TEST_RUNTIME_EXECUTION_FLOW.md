---
doc: 021_TEST_RUNTIME_EXECUTION_FLOW
phase: PHASE_B_TEST_RUNTIME_GREEN_BASELINE
purpose: Spec-only execution flow for test runtime / TASK_OBS on staging
---

# TEST RUNTIME execution flow (operator-confirmed)

**Forbidden in automation:** auto deploy, auto repair sheets, auto migrate data — each transition requires **human confirmation** on the correct environment.

## 1. Bootstrap

- **Input:** Staging `CBV_TASK_DB_ID` set; TASK script deployed/bound to staging spreadsheet.
- **Action:** Run **Dry Run** first (`TaskObs_menuBootstrapDryRun`), then **Bootstrap** (`TaskObs_menuBootstrap`) if dry run acceptable.
- **Stop gate:** If dry run reports missing core or id, fix configuration before continuing.

## 2. Health

- **Action:** `TaskObs_menuHealthCheck` (or equivalent).
- **Output:** UI summary + rows in `TASK_OBS_HEALTH` / `TASK_OBS_FINDING` (non-INFO).
- **Decision:** Operator classifies result as acceptable for staging or investigates blockers.

## 3. Self-test

- **Action:** `TaskObs_menuRunSelfTest`.
- **Output:** New `RUN_ID`; rows in `TASK_OBS_TEST_RUN`, `TASK_OBS_TEST_RESULT`, optional findings/audit/event rows.
- **Verification:** Row counts increase; no `TASK_MAIN` changes.

## 4. Append rows

- Implicit in steps 2–3; optional **Sample data** only if explicitly allowed on this staging (`TaskObs_menuGenerateSampleData`).

## 5. Build report

- Operator copies `RUN_ID`, key counts, and sheet screenshots or CSV exports into a **new** append-only RUN report under `00_SYSTEM_BRAIN/000_REPORTS/` or phase folder (policy per org).
- Map response to `020_TEST_RUNTIME_REPORT_TEMPLATE.json` envelope where applicable.

## 6. AI handoff

- If AI export generated: store artifact **without secrets**; reference in `021_PHASE_B_GREEN_BASELINE_AI_HANDOFF.md` successor or RUN doc.

## 7. Operator review

- Checklist `021_TASK_OBS_GREEN_BASELINE_CHECKLIST.md` signed.
- Drift risks (`05_GAS_RUNTIME`, core-runtime-lib vendoring) logged for follow-up — **not** fixed in same session unless chartered.

## 8. Next step

- Declare **staging green** for TASK_OBS baseline only; plan `phase/t0-task-obs-green-baseline` branch work if separate tracking desired.
- **Do not** promote to production deploy in the same workflow.
