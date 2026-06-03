# Case Read Model Contract — V1

**Version:** 1.0  
**Status:** ACCEPTED (`PHASE_CASE_REFACTOR_02_CASE_READ_MODEL`)  
**ADR:** `ADR_CASE_CENTRIC_RUNTIME.md`  
**Authority:** `CASE_READ_MODEL_AUTHORITY.md`  
**OCMS base:** `OCMS_READ_MODEL_CONTRACT.md` (strip V0 — preserved)

---

## 1. Dual contract (compatibility)

| Contract | Type | Consumers |
|----------|------|-----------|
| **`CaseReadModel`** | OCMS V0 (`caseReadModelTypes.ts`) | Case Context Strip, visibility, strip view |
| **`CaseRuntimeReadModel`** | Case-Centric V1 (`caseRuntimeReadModelTypes.ts`) | Case Workspace (phase 03+), tests, `getCaseReadModelForTask` |

**Rule:** `CaseRuntimeReadModel.ocmsCore` MUST remain byte-compatible with strip derivation. Strip MUST NOT require runtime model.

---

## 2. CaseRuntimeReadModel shape

```typescript
interface CaseRuntimeReadModel {
  caseId: string;           // read-model id (= caseKey in V1)
  caseKey: string;          // logical canonical key
  displayKey: string;       // operator-safe label (never raw OPERATIONS:TASK:…)
  title: string;
  caseType: CaseTypeCode;
  lifecycle: LifecycleField;
  workflowState: WorkflowStateField;
  responsibility: ResponsibilityField;
  context: CaseContextField;
  checklist: CaseChecklistItem[];
  tasks: CaseTaskRef[];
  documents: CaseDocumentRef[];
  timeline: CaseTimelineEntry[];
  handoff: CaseHandoff | null;
  diagnostics: CaseRuntimeDiagnostics;
  source: CaseReadSource;
  permissions: PermissionsField;
  ocmsCore: CaseReadModel;
}
```

### Required vs optional

| Field | Required | Notes |
|-------|----------|-------|
| caseId, caseKey, displayKey, title | Yes | Null model = derive failed |
| caseType, lifecycle, workflowState | Yes | May be low confidence |
| responsibility | Yes | responsible may be null + diagnostic |
| context | Yes | summary may be null |
| checklist, tasks, documents, timeline | Yes | Empty arrays allowed + INFO diagnostics |
| handoff | No | null + `NO_HANDOFF` diagnostic |
| permissions | Yes | From task visibility |
| diagnostics | Yes | Explicit codes — no silent fallback |

---

## 3. Field rules (summary)

| Field | Rule |
|-------|------|
| caseKey | Not operator-editable; not persisted in phase 02 |
| displayKey | From `formatCaseKeyDisplayLabel(ocmsCore)` |
| title | From task title; diagnostic if missing |
| caseType | Catalog codes; map from discovery anchor |
| lifecycle | Canonical codes; map from `TASK_MAIN.STATUS` |
| workflowState | Initially mirrors lifecycle; not workflow engine |
| Comment | `timeline[].entryType === 'COMMENT'` |
| checklist | Logical Case owner; physical `TASK_CHECKLIST` |

Full derivation: `CASE_READ_MODEL_DERIVATION_RULES.md`.

---

## 4. Diagnostics contract

See `CASE_READ_MODEL_DIAGNOSTICS.md`. Codes emitted on empty/missing slices — not errors unless BLOCKING.

---

## 5. Source contract

Uses existing `CaseReadSource` values: `TASK_ANCHORED`, `HO_SO_ANCHORED`, `FINANCE_ANCHORED`, `ALERT_ANCHORED`, `MANUAL_CASE_KEY`, `MIXED`.

---

## 6. No persistence rule

- No `CASE_MAIN`
- No Case write API
- No service/repository layer
- Projection functions are pure
- Entry point: `getCaseReadModelForTask()` in workboard `ocms/`

---

## 7. API entry

```typescript
getCaseReadModelForTask({
  task,
  operationalBundle?,
  checklistItems?,
  taskDetail?,
  operator?,
  manualCaseKey?,
}): CaseRuntimeReadModel | null
```

Task remains loader key (`taskId`).

---

*Amend via ADR + version bump.*
