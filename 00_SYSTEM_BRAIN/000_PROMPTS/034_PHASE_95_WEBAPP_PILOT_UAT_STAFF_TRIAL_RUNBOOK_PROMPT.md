# PHASE 95 — WebApp Pilot UAT / Staff Trial Runbook (Prompt)

> Snapshot of the AI handoff prompt that drove Phase 95. Captured per CBV Operational Ecosystem Standard V1.

---

Repo: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
GitHub: `https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO`  
Branch: `phase/from-v2.4.1-TASK-FIN`

Standards:

- CBV Operational Ecosystem Standard V1
- CBV Test Console Standard: `00_SYSTEM_BRAIN/000_TEST_CONSOLE/CBV_TCS_V1/docs/CBV_TCS_V1_STANDARD.md`

## Architecture (recap)

- Sheets/GAS = operational database + runtime
- WebApp = operational workspace (Phase 89 – 94 read-first)
- AppSheet = lightweight operator shell

## Phase 95 theme

Operational Ergonomics + Staff Trial.

This is NOT a feature phase. It defines the **runbook** for the pilot staff trial against the frozen WebApp surface (Phase 94). No new mutation, no new writeback, no auto-actions.

## Mission

1. Standardise the staff trial process.
2. Author UAT session plans for Admin / Supervisor / Operator.
3. Define the feedback capture schema.
4. Define the optional UAT result-log sheet contract (append-only, no auto-create).
5. Define the UAT issue triage matrix.
6. Define go / no-go criteria for the pilot.
7. Define the pilot signoff template.
8. Add a Phase 95 Test Console (CBV_TCS_V1).
9. **No write / mutation actions added to WebApp.**

## In scope

- Pilot UAT runbook + staff trial scripts (Admin / Supervisor / Operator).
- Feedback schema + result-log sheet contract.
- Issue triage matrix + go/no-go criteria + signoff template.
- Phase 95 Test Console under `🧪 CBV Test Console → Phase 95 — Pilot UAT`.
- Route smoke checklist reuse from Phase 94.

## Out of scope

- New WebApp feature.
- Write actions / mutation runtime / controlled writeback.
- AI assist / automation runtime.
- AppSheet Bot.
- Production certification.

## Files to create

Runtime:

1. `05_GAS_RUNTIME/998D_WEBAPP_UAT_RUNBOOK.js`
2. `05_GAS_RUNTIME/998E_WEBAPP_UAT_TEST_CONSOLE.js`

Docs:

3. `docs/webapp/PHASE_95_WEBAPP_PILOT_UAT_STAFF_TRIAL_RUNBOOK.md`
4. `docs/webapp/WEBAPP_PILOT_UAT_RUNBOOK.md`
5. `docs/webapp/WEBAPP_ADMIN_UAT_SCRIPT.md`
6. `docs/webapp/WEBAPP_SUPERVISOR_UAT_SCRIPT.md`
7. `docs/webapp/WEBAPP_OPERATOR_UAT_SCRIPT.md`
8. `docs/webapp/WEBAPP_UAT_FEEDBACK_SCHEMA.md`
9. `docs/webapp/WEBAPP_UAT_RESULT_LOG_CONTRACT.md`
10. `docs/webapp/WEBAPP_UAT_ISSUE_TRIAGE_MATRIX.md`
11. `docs/webapp/WEBAPP_PILOT_GO_NO_GO_CRITERIA.md`
12. `docs/webapp/WEBAPP_PILOT_SIGNOFF_TEMPLATE.md`

Brain:

13. `00_SYSTEM_BRAIN/000_REPORTS/034_PHASE_95_WEBAPP_PILOT_UAT_STAFF_TRIAL_RUNBOOK_REPORT.md`
14. `00_SYSTEM_BRAIN/001_HANDOFF/034_PHASE_95_WEBAPP_PILOT_UAT_STAFF_TRIAL_RUNBOOK_HANDOFF.md`

## Updates

- `.clasp.json`: insert `998D_`, `998E_` after Phase 94 and before `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` (keep last).
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js`: submenu `Phase 95 — Pilot UAT` under `🧪 CBV Test Console`.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js`: Phase 95 wrappers.
- `05_GAS_RUNTIME/CLASP_PUSH_ORDER.md`: Phase 95 rationale.
- `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md`: Phase 95 section.

Do NOT modify business menus. Do NOT add WebApp write action buttons. Do NOT add AppSheet Bot.

## UAT runtime

`CbvWebAppUat_getPilotScope`, `_getAdminScript`, `_getSupervisorScript`, `_getOperatorScript`, `_getFeedbackSchema`, `_getIssueTriageMatrix`, `_getGoNoGoCriteria`, `_validate` — each returning the standard envelope with `ok / data / warnings / errors / checkedAt`. The validator runs a Phase 95-scoped mutation probe (same verb-at-start + allowlist pattern as Phase 91.1 / 92 / 93 / 94).

## Test Console (CBV_TCS_V1)

Menu actions: Run Pilot UAT Readiness Check · Show Pilot Scope · Show Admin/Supervisor/Operator UAT Script · Show Feedback Schema · Show Go/No-Go Criteria · Show AI Handoff Prompt · Copy Latest Report. Returns the full CBV_TCS_V1 envelope.

## Tagging

Do NOT tag production. Optional pilot tag after the Test Console is GO/GO_WITH_WARNINGS and the runbook is reviewed: `v2.4.12-webapp-pilot-uat-runbook`.

## Expected final status

- Pilot UAT readiness: **GO_WITH_WARNINGS** until staff trial is actually run.
- Production readiness: **NOT YET**.
- Next: **Phase 96 — Controlled WebApp Action Design / Mutation Guard Blueprint** (only if UAT PASS / GO_WITH_WARNINGS). If UAT FAIL, Phase 96 must be a UAT Fix Pack instead.
