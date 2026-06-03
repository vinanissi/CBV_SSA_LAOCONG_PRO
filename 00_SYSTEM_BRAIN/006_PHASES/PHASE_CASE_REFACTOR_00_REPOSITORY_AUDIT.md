# Phase — CASE_REFACTOR_00 Repository Audit

| Field | Value |
|-------|-------|
| **Phase ID** | `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT` |
| **Mode** | AUDIT |
| **Branch** | `phase/case-centric-runtime-refactor` |
| **RCLA** | CBV-RCLA v1.1 |
| **Entrypoint** | `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md` |

---

## LOAD

1. `000_RUNTIME_ENTRYPOINT.md`
2. `ADR_OCMS_FOUNDATION.md` + OCMS ADRs (00–02D)
3. `OCMS_ROADMAP.md`, `PHASE_REGISTRY.md`
4. Prior OCMS_03A–03E reports (operator validation path)
5. Runtime code paths: `apps/workboard`, `workers/api`, `gas-runtime-api`, `05_GAS_RUNTIME`

---

## GOAL

Full repository audit + evidence-based refactor plan: Task-Centric → Case-Centric Runtime.

**Forbidden:** CASE_MAIN, Case API, schema changes, runtime code changes.

---

## DELIVERABLES

| Artifact | Path |
|----------|------|
| Architecture map | `00_SYSTEM_BRAIN/CASE/CURRENT_ARCHITECTURE_MAP.md` |
| Module inventory | `00_SYSTEM_BRAIN/CASE/MODULE_INVENTORY.md` |
| Data model map | `00_SYSTEM_BRAIN/CASE/DATA_MODEL_MAP.md` |
| UI runtime map | `00_SYSTEM_BRAIN/CASE/UI_RUNTIME_MAP.md` |
| Task dependency map | `00_SYSTEM_BRAIN/CASE/TASK_DEPENDENCY_MAP.md` |
| Keep/Drop/Rewrite | `00_SYSTEM_BRAIN/CASE/KEEP_DROP_REWRITE_MATRIX.md` |
| Target architecture | `00_SYSTEM_BRAIN/CASE/CASE_TARGET_ARCHITECTURE.md` |
| Extraction plan | `00_SYSTEM_BRAIN/CASE/CASE_RUNTIME_EXTRACTION_PLAN.md` |
| Report | `000_REPORTS/PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT_REPORT.md` |
| Handoff | `001_HANDOFF/PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT_HANDOFF.md` |
| Test evidence | `005_TEST_EVIDENCE/PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT_TEST_EVIDENCE.md` |
| Roadmap | `00_SYSTEM_BRAIN/CASE/CASE_ROADMAP.md` |
| Phase registry | `00_SYSTEM_BRAIN/CASE/CASE_PHASE_REGISTRY.md` |

---

## SUCCESS CRITERIA

- All audit maps complete
- Major modules classified in matrix
- Safe next phase identified (`PHASE_CASE_REFACTOR_01_CASE_AUTHORITY`)
- No forbidden artifacts created
- No runtime source modified by this phase

---

## NEXT

`PHASE_CASE_REFACTOR_01_CASE_AUTHORITY` (DOC-ONLY)
