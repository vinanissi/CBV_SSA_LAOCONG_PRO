# Phase Report — CASE_REFACTOR_02 Case Read Model

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_02_CASE_READ_MODEL` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-01 |
| **RUNTIME_STATE** | NOT_WIRED |

---

## Scope

- Formal Case Read Model contract (V1) + derivation + diagnostics docs
- Pure TypeScript projection in `apps/workboard/src/modules/ocms/`
- `getCaseReadModelForTask()` stable API
- `useCaseReadModel` exposes `runtimeReadModel` (additive)
- Static checks `runCaseReadModelChecks()`
- No UI workspace redesign; strip unchanged (uses `ocmsCore`)

---

## Authority documents read

- `ADR_CASE_CENTRIC_RUNTIME.md`, `CASE_RUNTIME_AUTHORITY_V1.md`
- `CASE_ENTITY_BOUNDARY_CONTRACT.md`, `CASE_READ_MODEL_AUTHORITY.md`
- `OCMS_READ_MODEL_CONTRACT.md`
- Phase 00/01 reports and handoffs

---

## Contracts created/updated

| Artifact | Path |
|----------|------|
| Contract V1 | `CASE/CASE_READ_MODEL_CONTRACT.md` |
| Derivation rules | `CASE/CASE_READ_MODEL_DERIVATION_RULES.md` |
| Diagnostics | `CASE/CASE_READ_MODEL_DIAGNOSTICS.md` |

---

## Source code (read-only)

| File | Role |
|------|------|
| `caseRuntimeReadModelTypes.ts` | V1 types |
| `caseReadModelDiagnostics.ts` | Codes + severity |
| `caseReadModelProjection.ts` | Pure mappers |
| `deriveCaseRuntimeReadModel.ts` | Composes ocms + slices |
| `getCaseReadModelForTask.ts` | Public API |
| `caseReadModelChecks.ts` | Static validation |
| `useCaseReadModel.ts` | +`runtimeReadModel` |
| `deriveCaseReadModel.ts` | checklist count param (optional) |

---

## Derivation summary

Task-anchored → OCMS `CaseReadModel` → project checklist, documents, timeline (incl. notes as COMMENT), handoff, single task ref, workflowState from lifecycle.

---

## Tests / checks

| Check | Result |
|-------|--------|
| `npm run build` (workboard) | **PASS** |
| `runCaseReadModelChecks()` | **GO_WITH_WARNINGS** (0 failures) |
| Forbidden artifacts | None introduced |

---

## Warnings

1. Multi-task Case grouping not implemented — diagnostic always INFO.  
2. Checklist passed into hook only when caller supplies `checklistItems` — Focus workspace not wired yet (phase 03).  
3. `runtimeReadModel` computed when strip enabled — same flag gate.  
4. Case context summary requires `taskDetail` for description field.

---

## Risks

- Duplicate derivation if callers invoke both `deriveCaseReadModel` and `getCaseReadModelForTask` — acceptable for phase 02; optimize in phase 03.

---

## Recommended next phase

**`PHASE_CASE_REFACTOR_03_CASE_WORKSPACE`** — Case Workspace UI using `runtimeReadModel`; wire checklist from focus runtime; no CASE_MAIN.

---

## Bundle

`phase_tmp/0001_PHASE_CASE_REFACTOR_02_CASE_READ_MODEL.zip`
