# Decision 033 — WebApp UI Foundation Freeze

**Date:** 2026-05-13  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Phase:** PHASE_94_WEBAPP_UI_FOUNDATION_FREEZE_UAT_HARDENING  
**Status:** ACCEPTED (pilot tier).

---

## 1. Context

After Phase 89 (skeleton), Phase 90 (pilot pages), Phase 91 (Timeline / Kanban), Phase 91.1 (mutation validator hotfix), Phase 92 (Observability), and Phase 93 (Admin Reference), the WebApp surface is functionally complete at pilot tier. Continued ad-hoc evolution risks contract drift (route mode changes, FE state name changes, safety footer reword), which would invalidate audit artefacts (screenshots, reports, mutation validator allowlists).

## 2. Decision

The WebApp route foundation is **frozen** at pilot tier as of this commit. Specifically:

1. **WebApp route foundation is frozen at pilot level.** The route set, owners, modes, statuses and renderer names are captured in `docs/webapp/WEBAPP_ROUTE_FREEZE_MATRIX.md` and in `CbvWebAppUiFreeze_getRouteFreezeMatrix()`.
2. **Read-first routes are frozen.** Every operational route has `mode = READ_FIRST`. No mutation phase may relax this without an explicit successor freeze decision.
3. **Safety footer phrases are frozen.** The four base phrases (`No auto assign`, `No auto resolve`, `No auto escalate`, `No production claim`) plus Timeline/Kanban-only `No drag-drop save` must appear verbatim in every operational route footer.
4. **FE state vocabulary is frozen.** `loading | empty | warning | error | partial | ready`. No new state names without a successor freeze.
5. **No mutation UI before an explicit future mutation phase.** No edit / save / delete / toggle / drag-drop save / assign / resolve / escalate buttons may be introduced in the WebApp before such a phase ships its own validator and audit footprint.
6. **No production claim** anywhere in WebApp UI, reports, prompts, or handoffs.
7. **Future polish must not alter runtime semantics.** Polish PRs must keep the Phase 94 Test Console GO or GO_WITH_WARNINGS, must keep all prior mutation validators clean, and must not change route paths / modes / FE state names / safety phrases.

## 3. Consequences

### 3.1 Accepted

- Polish is welcome but bounded. The audit surface stays stable.
- Operators / supervisors / admins can rely on documented behaviour.
- AI-handoff prompts can quote frozen phrases without risk of drift.

### 3.2 Trade-offs

- Refactors that touch route paths / mode / state names / safety phrases now require a successor decision file in `00_SYSTEM_BRAIN/002_DECISIONS/` and a successor freeze phase (likely Phase 95 or later).
- Three `*_COMPONENTS.html` partials remain (Phase 90/92/93). Consolidation is deferred.

## 4. Not affected by this decision

- AppSheet lightweight operator shell (separate channel; manual-first).
- Sheets / GAS services / mutation services (their own audit trail).
- Future advanced features (queue intelligence, AI runtime, ENV-A) — explicitly out of scope.

## 5. Implementation pointers

- `05_GAS_RUNTIME/998B_WEBAPP_UI_FREEZE_AUDIT.js` — runtime source of truth.
- `05_GAS_RUNTIME/998C_WEBAPP_UI_FREEZE_TEST_CONSOLE.js` — CBV_TCS_V1 health gate.
- `docs/webapp/WEBAPP_ROUTE_FREEZE_MATRIX.md` — frozen route matrix.
- `docs/webapp/WEBAPP_UI_FOUNDATION_STANDARD.md` — frozen UI semantics.
- `docs/webapp/WEBAPP_SAFETY_FOOTER_STANDARD.md` — frozen safety footer phrases.
- `docs/webapp/WEBAPP_FE_STATE_FREEZE_STANDARD.md` — frozen FE state vocabulary.
- `docs/webapp/WEBAPP_RESPONSIVE_ACCESSIBILITY_BASELINE.md` — pilot baseline.
- `docs/webapp/WEBAPP_UAT_MASTER_CHECKLIST.md` — UAT sign-off contract.
- `docs/webapp/WEBAPP_ROUTE_SMOKE_TEST_MATRIX.md` — per-route manual smoke.
- `docs/webapp/WEBAPP_UI_CONSISTENCY_AUDIT.md` — findings + future polish rules.

## 6. Reversal procedure

To reverse this decision (e.g. unfreeze to add a write path):

1. Write a new decision file under `00_SYSTEM_BRAIN/002_DECISIONS/` referencing this one as superseded.
2. Run a new freeze phase (e.g. Phase XX) that updates: route freeze matrix, mutation validator allowlists, safety footer text, FE state vocabulary as needed.
3. Update the Phase 94 Test Console expectations to reflect the new contract.
4. Bump a new pilot tag; **do not retag** `v2.4.11-webapp-ui-foundation-freeze`.

## 7. References

- `docs/webapp/PHASE_94_WEBAPP_UI_FOUNDATION_FREEZE_UAT_HARDENING.md`
- `00_SYSTEM_BRAIN/000_TEST_CONSOLE/CBV_TCS_V1/docs/CBV_TCS_V1_STANDARD.md`
- `00_SYSTEM_BRAIN/002_DECISIONS/022_FE_ARCHITECTURE_REBALANCE_DECISION.md`
