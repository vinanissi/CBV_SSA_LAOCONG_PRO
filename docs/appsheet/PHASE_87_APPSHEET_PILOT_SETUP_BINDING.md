# Phase 87 — AppSheet pilot setup binding

**Status:** Pilot documentation + GAS matrices (no production claim).  
**Standards:** CBV Operational Ecosystem Standard V1; CBV Test Console Standard V1 (`CBV_TCS_V1`).  
**Depends on:** Phase 85 `CBV_UI_CONTRACT`, Phase 86 pilot binding plans.

## Why Phase 87 exists

Phase 86 produced machine-readable **binding plans** from `CBV_UI_CONTRACT`. Phase 87 turns the AppSheet portion into **actionable setup**: view matrix, slice matrix, manual actions matrix, security filter matrix, UAT script, and signoff checklist—so an admin can configure AppSheet **today** without inventing naming or filters from scratch.

## Scope

**In scope**

- AppSheet views, slices, manual actions, and security filters aligned to `SCREEN_CODE` / `APPSHEET_VIEW`.
- Pilot UAT and signoff artifacts.
- GAS helpers: `CbvAppSheetPilot_*` and **🧪 CBV Test Console → Phase 87 — AppSheet Pilot Setup** (health + matrix dialogs).

**Out of scope**

- AppSheet Bot, workflow automation, or triggers that assign/resolve/escalate without a human tap.
- ENV-A, AI runtime, queue intelligence.
- Changing HOME_ALERT business rules in GAS (this phase is binding/setup only).
- Production approval or go-live signoff.

## AppSheet role in the pilot

AppSheet is the **operator and supervisor daily surface**. Slices enforce row sets; views present decks/tables; actions are **explicit taps** that should align with ACK / CLAIM / IN_PROGRESS / WAITING_RESPONSE / ESCALATE / RESOLVE / RELEASE. `CBV_UI_CONTRACT` remains the naming and hint source; the matrices in `docs/appsheet/APPSHEET_*_MATRIX.md` are the step-by-step application of that contract.

## WebApp boundary

Advanced timelines, Kanban, health dashboards, and report viewers stay on **WebApp routes** per Phase 86. Phase 87 may add an optional **Open WebApp** manual action where `CHANNEL` is `BOTH`; it does not implement WebApp pages here.

## No AppSheet Bot

All actions in this phase are documented as **manual-only** (`noBot: true` in the GAS actions matrix). Do not enable AppSheet Bot or unattended row edits for pilot.

## Pilot setup flow (recommended)

1. `clasp push` (include `88_` / `89_` in push order).
2. Run **Phase 87 — AppSheet Pilot Setup → Run AppSheet Pilot Setup Health Check**.
3. Open each matrix from the Test Console or from `docs/appsheet/APPSHEET_*_MATRIX.md`.
4. Create/rename views and slices in AppSheet Designer to match.
5. Run `APPSHEET_PILOT_UAT_SCRIPT.md` with pilot accounts.
6. Complete `APPSHEET_PILOT_SIGNOFF_CHECKLIST.md` (append-only feedback per project practice).

## Pilot vs production readiness

| Gate | Pilot | Production |
|------|-------|------------|
| Matrices + health | GO or GO_WITH_WARNINGS acceptable | Not sufficient |
| Real UI verified | Required | Required |
| Signoff | Pilot signoff checklist | Separate production approval |

**Expected:** pilot setup readiness **GO_WITH_WARNINGS** until every view/slice/action is verified on device. **Production: NOT YET.**
