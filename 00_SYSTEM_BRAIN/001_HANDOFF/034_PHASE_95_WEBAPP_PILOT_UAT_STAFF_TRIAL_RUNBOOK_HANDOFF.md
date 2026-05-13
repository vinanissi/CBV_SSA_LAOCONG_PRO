# 034 — Phase 95 WebApp Pilot UAT / Staff Trial Runbook — Handoff

For: the next AI or engineer running the pilot staff trial and planning Phase 96.

---

## Phase 95 scope

- Define the **runbook** for the pilot staff trial against the Phase 94 frozen WebApp.
- Provide role-specific scripts (Admin / Supervisor / Operator).
- Provide a frozen feedback schema, triage matrix, go/no-go criteria, and signoff template.
- Add a CBV_TCS_V1 Test Console for runbook readiness.
- **No new feature, no new mutation, no production claim, no AppSheet Bot, no AI runtime.**

## Participants

- **Admin** — at least 1. Validates governance + runtime health + report viewer + masking.
- **Supervisor** — at least 1. Validates SLA + Timeline + Kanban interpretation; verifies no drag-drop save.
- **Operator** — at least 2. Validates Workspace + My Queue across Desktop / Tablet / Mobile.
- **Shadow observer** — recommended; captures feedback so testers stay focused.

## Routes to test

Operational (READ_FIRST, PILOT):

- `/workspace`
- `/home-alert/my-queue`
- `/home-alert/sla`
- `/home-alert/timeline`
- `/home-alert/kanban`
- `/runtime/health`
- `/reports`
- `/admin/reference`

Support (READ_ONLY):

- `?action=ping`

## Feedback fields (17)

`UAT_ID · SESSION_ID · TEST_DATE · TESTER_EMAIL · TESTER_ROLE · ROUTE · DEVICE_TYPE · SCENARIO · RESULT · SEVERITY · SPEED_RATING · USABILITY_RATING · CONFUSION_POINT · ERROR_MESSAGE · SUGGESTED_FIX · IS_BLOCKER · CREATED_AT`.

Rules: append-only · `IS_BLOCKER ⇔ SEVERITY = BLOCKER` · verbatim error text.

## Go / No-Go criteria

- **GO:** all routes open · no BLOCKER · no security leak · no mutation UI · operators understand ≥80% of cards · supervisor interprets SLA/Timeline/Kanban · admin reads health/report/governance · base 4 safety phrases verbatim + `No drag-drop save` on Timeline/Kanban · Phase 94 + 95 Test Console GO or GO_WITH_WARNINGS.
- **GO_WITH_WARNINGS:** GO + ≤2 HIGH waivers + MEDIUM tracked.
- **NO_GO:** any BLOCKER · security leak · route crash · fake mutation UI · operator cannot use My Queue · production-ready claim · Phase 94 or 95 Test Console FAIL.

Waiver: max 2 per pilot; HIGH only; never for BLOCKER; recorded in `WEBAPP_PILOT_SIGNOFF_TEMPLATE.md` with UAT lead + Phase 95 owner signatures.

## No mutation rule (Phase 95)

- Namespace: `CbvWebAppUat_*`.
- `CbvWebAppUat_validate()` runs a verb-at-start mutation probe scoped to this namespace, using the same allowlist pattern as Phase 91.1 / 92 / 93 / 94.
- Allowlist: `_get*`, `_validate`, private helpers (`__*`), Test Console (`*TestConsole_*`).
- Test Console (`998E`) surfaces this via `NO_WRITE_MUTATION` and prohibits write/mutation/AppSheet-Bot/AI-runtime recommendations in the handoff text.

## Known limitations

- Apps Script cannot read `.clasp.json` at runtime → carry-over WARNING from Phase 94.
- Phase 95 does **not** auto-create the optional `WEBAPP_UAT_RESULTS` sheet. Teams prepare it manually if they choose the sheet storage mode.
- Phase 95 does **not** ship a result-sheet validator. A future phase may add one.
- Phase 95 surfaces only as docs + Test Console menu. No HTML / renderer change.

## Recommended next phase

| Pilot outcome | Phase 96 must be |
|---------------|------------------|
| **GO** | Phase 96 — Controlled WebApp Action Design / Mutation Guard Blueprint |
| **GO_WITH_WARNINGS** | Phase 96 — Controlled WebApp Action Design / Mutation Guard Blueprint (track HIGH waivers as first items) |
| **NO_GO** | Phase 96 — UAT Fix Pack (**NOT** mutation design). Address BLOCKERs; re-run scripts; schedule another pilot. |

Phase 96 selection is **mandatory** before any further mutation design work begins. Skipping the UAT Fix Pack on NO_GO is forbidden.

## Pilot tag

After the Phase 95 Test Console is GO or GO_WITH_WARNINGS **and** the runbook has been reviewed, optional pilot tag: `v2.4.12-webapp-pilot-uat-runbook`. **No production tag.**

## Safety summary (must persist in future phases)

- Read-first only.
- No mutation buttons / no writeback / no drag-drop save.
- Safety footer phrases verbatim on every operational route.
- FE state vocabulary unchanged (`loading | empty | warning | error | partial | ready`).
- Route freeze matrix unchanged.
- Secrets / tokens / API keys masked.
- `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` absolute last in `.clasp.json` filePushOrder.
- No production claim.
- No AppSheet Bot.
- No AI runtime / ENV-A / queue intelligence.
