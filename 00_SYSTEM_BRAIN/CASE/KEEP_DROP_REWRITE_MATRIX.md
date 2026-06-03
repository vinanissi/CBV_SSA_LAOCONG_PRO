# Keep / Drop / Rewrite Matrix — Case-Centric Refactor Audit

**Phase:** `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT`  
**Date:** 2026-06-01  

Classification: `KEEP` | `DROP` | `REWRITE` | `ADAPTER` | `DEFER` | `UNKNOWN`

---

## Frontend

| Module/File | Current Purpose | Runtime Usage | Classification | Reason | Risk | Case-Centric Future Role | Recommended Action |
|-------------|-----------------|---------------|----------------|--------|------|--------------------------|-------------------|
| `TasksPage.tsx` | Inbox orchestration | Active | KEEP | Production entry | LOW | Case workspace host (later) | Wrap with case context; do not rewrite yet |
| `FocusTaskWorkspace.tsx` | Focus shell | Active | ADAPTER | Strip mount point | MED | Case Workspace layout | Rename/extend to CaseWorkspace when authority accepted |
| `WorkInboxCaseContextStrip.tsx` | Case strip UI | Flag-gated | KEEP | OCMS investment | LOW | Case context header | Enable after authority; enrich read model |
| `deriveCaseReadModel.ts` | Case read derivation | Flag-gated | KEEP | Core OCMS logic | LOW | Case read model builder | Extend fields per contract |
| `caseDiscovery.ts` / `caseKeyResolver.ts` | Anchors & key | Flag-gated | KEEP | No persistence | LOW | Case identity | Harden per ADR; add tests |
| `TaskDetailContent.tsx` | Legacy detail | Partial | DEFER | Superseded by focus | LOW | Retire or merge tabs | Drop after focus 100% |
| `workInboxGroupsFeature.ts` | Flags | Active | KEEP | V3 control | LOW | Unchanged | KEEP |
| `ocmsFeature.ts` | OCMS flags | Active | ADAPTER | Env name mismatch | LOW | Canonical flag doc | Align naming in authority phase |

---

## Worker / API

| Module/File | Current Purpose | Runtime Usage | Classification | Reason | Risk | Case-Centric Future Role | Recommended Action |
|-------------|-----------------|---------------|----------------|--------|------|--------------------------|-------------------|
| `router.ts` | HTTP routes | Active | KEEP | Stable | LOW | Add case routes later | No change in audit phase |
| `taskGsDb.ts` | Task snapshot/detail | Active | KEEP | SoT bridge | HIGH if broken | Task adapter under Case | KEEP |
| `workInboxOperational.ts` | WiOp bundle | Active | KEEP | Task ops | MED | Case-scoped adapter wrapper | ADAPTER in phase 02+ |
| `workInboxChecklist.ts` | Checklist API | Active | KEEP | Task persistence | MED | Case checklist proxy | DEFER until persistence ADR |
| `googleSheetTaskDbAdapter.ts` | GAS bridge | Active | KEEP | Critical path | HIGH | Same | KEEP |
| `tasks.ts` / `mockData.ts` | Mock/legacy | Dev | OPTIONAL | Dev only | LOW | Dev fixtures | KEEP for dev |
| `taskWrite.ts` | PATCH legacy | Blocked | DEPRECATED | Sheet mode blocks | LOW | None | DROP when confirmed unused |

---

## GAS

| Module/File | Current Purpose | Runtime Usage | Classification | Reason | Risk | Case-Centric Future Role | Recommended Action |
|-------------|-----------------|---------------|----------------|--------|------|--------------------------|-------------------|
| `90_BOOTSTRAP_SCHEMA.js` | Manifest | Active | KEEP | Authority | HIGH | TASK_MAIN unchanged | No schema in early refactor |
| `40_TaskDbService.js` | Task DB | Active | KEEP | Production | HIGH | Task execution | KEEP |
| `46_WorkInboxOperationalService.js` | Timeline/notes | Active | KEEP | Task-scoped | MED | Federated feed source | ADAPTER for case timeline read |
| `49_WorkInboxChecklist.js` | Checklist | Active | KEEP | Task rows | MED | Case checklist backend (future) | DEFER |
| `999Y_RF12_GAS_RUNTIME_API.js` | Legacy GET | Partial | DEPRECATED | Stubs | LOW | None | DROP when callers gone |

---

## Governance

| Module/File | Current Purpose | Runtime Usage | Classification | Reason | Risk | Case-Centric Future Role | Recommended Action |
|-------------|-----------------|---------------|----------------|--------|------|--------------------------|-------------------|
| `ADR_OCMS_*` | Case design | Binding | KEEP | Accepted | LOW | Authority base | Extend via CASE refactor ADRs |
| `OCMS_ROADMAP.md` | OCMS sequence | Planning | ADAPTER | Superseded branch | LOW | Input to CASE_ROADMAP | Cross-link; do not delete |
| `ADR_001 Work Inbox` | Inbox product | Binding | KEEP | Non-negotiable | HIGH | Front door | KEEP |
| `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH` | TASK_MAIN | Binding | KEEP | SoT | HIGH | Task under Case | KEEP |

---

## Not present (must not add in audit)

| Artifact | Classification | Action |
|----------|----------------|--------|
| `CASE_MAIN` sheet | N/A | **Do not create** until persistence phase |
| `CaseService` / `CaseRepository` | N/A | **Do not create** in refactor 01 |
| Case mutation API | N/A | **DEFER** |

---

## Summary counts (major modules)

| Classification | Count (approx.) |
|----------------|-----------------|
| KEEP | 18 |
| ADAPTER | 4 |
| DEFER | 3 |
| DEPRECATED | 3 |
| DROP | 1 (taskWrite when verified) |
| REWRITE | 0 (this audit — avoid big-bang) |
| UNKNOWN | 0 |

---

*No major runtime module left unreviewed. REWRITE reserved for explicit later phases with ADR.*
