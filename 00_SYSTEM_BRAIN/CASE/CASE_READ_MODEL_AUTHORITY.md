# Case Read Model Authority

**Version:** 1.0  
**Status:** ACCEPTED  
**Phase:** `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY`  
**Contract base:** `OCMS_READ_MODEL_CONTRACT.md`  
**ADR:** `ADR_CASE_CENTRIC_RUNTIME.md`, `ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md`

---

## 1. Read-model-first rule

Case Runtime phases **02–04** operate **read-first, write-later**:

1. Compose **Case** for operator context from existing stores.  
2. Leave **mutations** on Task / checklist / attachment paths unchanged.  
3. Introduce Case write model only after **persistence decision** ADR.

---

## 2. Derive Case from current runtime first

| Source | Contributes |
|--------|-------------|
| `TASK_MAIN` + detail | Title, task status, owners, dates, anchors |
| `RELATED_ENTITY_TYPE/ID` | Discovery anchors |
| HO_SO / FINANCE / ALERT projections | Module context, relations |
| Operational bundle | Checklist, attachments, timeline slices |
| OCMS discovery + key resolver | `caseKey`, diagnostics |

**Rule:** Derive — do not invent fields. Missing source → null + diagnostic warning (OCMS contract §2).

---

## 3. Forbidden (phases 01–04)

| Forbidden | Notes |
|-----------|--------|
| `CASE_MAIN` / `CASE_*` tables | Until phase 05 decision |
| Case write model | No Case POST/PATCH |
| Case API routes | No `/api/cases` production routes |
| Case Service / Repository / Store | No server-side Case persistence layer |
| Schema migration | No manifest changes for Case |
| Silent mock fallback | Production must not fake Case data |
| Event store | Timeline federation is read-merge only |

---

## 4. Projection-only first

Case Read Model is a **projection**:

- Immutable during a single render pass (re-fetch on task/bundle refresh).  
- Not authoritative for writes.  
- Does not own lifecycle mutations — displays derived WorkflowState.

---

## 5. Allowed derivation

| Field / area | Allowed |
|--------------|---------|
| `caseKey` | Per `OCMS_CASE_KEY_AUTHORITY.md` |
| `caseType` | Catalog + anchor heuristics |
| `title` | Task title + module display name precedence |
| `lifecycle` / WorkflowState | Mapped from module + task signals |
| `result` | Per `OCMS_RESULT_MODEL.md` |
| `responsibility` | Owners from task / HO_SO / directory |
| `relations` | `OCMS_CASE_RELATION_MODEL.md` |
| `workItems` | Tasks + alerts in Case scope |
| `memorySummary` | Short summary — not full timeline |
| `projections` | HO_SO, FINANCE, etc. read paths |
| `diagnostics` | Mandatory confidence / warnings |
| Checklist slice | From task checklist API (logical Case scope) |
| Documents slice | Attachments + HO_SO files (read) |
| Timeline slice | Federated read (phase 04) |

---

## 6. Forbidden derivation

| Practice | Why |
|----------|-----|
| Invent `caseKey` when discovery fails | Use `NONE` + diagnostics |
| Hide missing Responsible | Fabrication forbidden |
| Overwrite task status from Case lifecycle | Orthogonal layers |
| Persist CaseReadModel JSON to sheet | No Case store |
| Operator-editable caseKey | Identity authority |

---

## 7. Implementation alignment (existing code)

| Module | Role |
|--------|------|
| `deriveCaseReadModel.ts` | Reference implementation — extend in phase 02 |
| `caseDiscovery.ts` | Anchor precedence — do not bypass |
| `caseKeyResolver.ts` | Key format — do not fork |
| `useCaseReadModel.ts` | Hook boundary for strip / workspace |

Phase 02 may add stable export e.g. `getCaseReadModelForTask(taskId)` — still projection-only.

---

## 8. Transition: Task as temporary persistence root

```text
Operator selects taskId
    → load task + bundle
    → derive CaseReadModel
    → UI shows Case context + Task sections
    → user mutates via task/checklist APIs (unchanged)
```

Until persistence ADR: **taskId remains loader entry point**.

---

## 9. Persistence decision gate

Only **`PHASE_CASE_REFACTOR_05_PERSISTENCE_DECISION`** may recommend:

- `CASE_MAIN` or registry table  
- Case write API  
- Case-keyed checklist storage  

Requires: manifest + audit schema + ADR amendment + operator impact review.

---

*Extends OCMS Read Model Contract for Case-Centric refactor branch. OCMS contract field names remain normative unless ADR amends.*
