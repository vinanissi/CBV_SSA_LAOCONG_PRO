# Test Evidence — CASE_REFACTOR_02 Case Read Model

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_02_CASE_READ_MODEL` |
| **Date** | 2026-06-01 |

---

## Files inspected

- `deriveCaseReadModel.ts`, `useCaseReadModel.ts`, `caseDiscovery.ts`
- `workInboxOperationalTypes.ts`, `workInboxChecklistTypes.ts`
- `focusLayoutShared.ts` (handoff projection)
- New `ocms/caseReadModel*.ts`, `deriveCaseRuntimeReadModel.ts`

---

## Checks performed

| Check | Result |
|-------|--------|
| `runCaseReadModelChecks()` | GO_WITH_WARNINGS, 0 failed |
| `npm run build` (workboard) | PASS (tsc + vite) |
| grep CASE_MAIN in new ocms files | None |
| grep CaseService/Repository/API | None in new files |

---

## Read-only verification

- No `fetch` in deriver/projection  
- No `createCase` / `updateCase`  
- `deriveCaseRuntimeReadModel` wraps existing OCMS derive only  

---

## Diagnostics examples

From sample check run: `MULTI_TASK_GROUPING_DEFERRED`, `DERIVED_FROM_TASK_ONLY`, optional `NO_HANDOFF` when no handoff events.

---

## Unresolved warnings

1. Focus workspace does not pass `checklistItems` yet — checklist slice empty until phase 03.  
2. Multi-task grouping deferred.  
3. RUNTIME_STATE NOT_WIRED.

---

*Phase 02 validation complete.*
