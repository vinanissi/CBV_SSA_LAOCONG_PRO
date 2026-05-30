# PHASE SECURITY Runtime Fix — AI Handoff

**To:** Next agent (`PHASE_FOCUS_RUNTIME_FIX`)  
**From:** `PHASE_SECURITY_RUNTIME_FIX`  
**Date:** 2026-05-30  
**Report:** `00_SYSTEM_BRAIN/000_REPORTS/PHASE_SECURITY_RUNTIME_FIX_REPORT.md`  
**ADR:** `00_SYSTEM_BRAIN/002_DECISIONS/ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md` (ratification note appended)

---

## What was delivered

1. **Row-level task permissions** in `workers/api/src/auth/taskPermissions.ts`.
2. **Snapshot filtering** — `filterSnapshotForUser()` in `taskGsDb.ts`; no full TASK_MAIN leak to client.
3. **Write protection** — status / complete / comment / assign / create check permissions before GAS.
4. **Legacy RF12 block** — router rejects TASKS write paths when `google_sheet_existing_db` expected.
5. **Permission smoke tests** — `npm run test:permissions` in `workers/api`.
6. **Build/typecheck PASS** — worker + workboard.

---

## Read first

1. `000_REPORTS/PHASE_SECURITY_RUNTIME_FIX_REPORT.md`
2. `000_REPORTS/PHASE_UI_RUNTIME_TRACE_AUDIT_REPORT.md`
3. `workers/api/src/auth/taskPermissions.ts`
4. `workers/api/src/modules/taskGsDb.ts`
5. `workers/api/src/router.ts`
6. `apps/workboard/src/modules/task/useInlineExecution.ts`

---

## Security acceptance (verified in code)

| Criterion | Status |
|-----------|--------|
| Snapshot filtered by `canUserSeeTask` | ✅ Worker-side |
| Status/complete/comment/assign → 403 if unauthorized | ✅ |
| No mock success on GS_01 writes | ✅ |
| No operator write fallback to TASKS legacy | ✅ Router blocked |
| Build PASS | ✅ |

---

## Do NOT redo in next phase

- Worker permission matrix
- Snapshot row filter
- Router legacy write guards
- GAS / schema / HOME_ALERT

---

## Known gaps (document only — not security blockers for Focus phase)

| Gap | Notes |
|-----|-------|
| GAS snapshot may omit `isPrivate` on summary rows | Private leak risk until GAS enriches list payload |
| Handoff UI = status POST only | Warning on status handler; real handoff needs `/assign` wiring in Focus phase |
| Focus Mode actions stubbed | **Next phase scope** |
| Sidebar `/observe`, `/config` 404 | **Next phase scope** |
| `/api/today` mock | Out of scope |

---

## WIRED write path (unchanged — now secured)

```text
useInlineExecution / TaskCard
  → POST /api/tasks/:id/{status|complete|assign|comments}
  → taskGsDb handler
  → loadTaskForPermissionCheck + can*Task
  → gs* (googleSheetTaskDbAdapter)
  → GAS taskDb*
  → TASK_MAIN + TASK_UPDATE_LOG
```

**Requires:** `CBV_TASK_RUNTIME_MODE=google_sheet_existing_db` + `GAS_TASK_API_URL` + deployed GAS.

---

## Next phase

**PHASE_FOCUS_RUNTIME_FIX**

Goals:

1. Pass real handlers into `WorkInboxFocusModeV3` / `FocusActionBar` (reuse `useInlineExecution`).
2. Fix `OperatorMainSidebar` routes: `/observation`, `/plugins`.
3. Optional: wire handoff to `POST /assign` instead of status-only.

Prompt: use report § Next Recommended Phase in `PHASE_SECURITY_RUNTIME_FIX_REPORT.md`.

---

## Test commands

```bash
cd workers/api && npm run typecheck && npm run test:permissions
cd apps/workboard && npm run build
```

---

*Append-only handoff.*
