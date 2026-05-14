# Decision log — 103 Milestone 02 Staff Operation Workspace

**Append-only** · 2026-05-14

## D-103-1 — Adapter scope

**Decision:** Bind staff task workspace to existing **HOME_ALERT** pilot queue reader (`CbvWebAppPilotData_getQueueCards`) instead of opening TASK_MAIN from WebApp.

**Rationale:** Manual-first and read-first; avoids new sheet coupling and respects “no uncontrolled mutation”. TASK_MAIN remains AppSheet/GAS service domain.

## D-103-2 — Feedback sink

**Decision:** Optional sheet `CBV_STAFF_OPERATION_FEEDBACK` append-only when present; **no** auto-`insertSheet` from production Web path in this milestone.

**Rationale:** Avoid destructive migration; operators can add the sheet deliberately. Web UI explains the contract; `submitFeedbackSafe_` validates and refuses silent no-ops without note.

## D-103-3 — Route aliases

**Decision:** Register both `/workspace/staff/*` and `/staff/*` for the same page types.

**Rationale:** Spec allowed either namespace; aliases reduce friction for bookmarks and tests.

## D-103-4 — Test / Drive

**Decision:** Reuse `998P` envelope + `998L` six-file bundle machinery with new `tagStem` `MILESTONE_02_STAFF_WORKSPACE`.

**Rationale:** One consistent CBV_TCS_V1 path; no duplicate envelope logic beyond Milestone 02-specific checks and handoff copy.
