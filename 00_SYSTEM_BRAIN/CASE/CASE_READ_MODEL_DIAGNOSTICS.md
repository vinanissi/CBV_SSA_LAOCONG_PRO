# Case Read Model Diagnostics

**Phase:** `PHASE_CASE_REFACTOR_02_CASE_READ_MODEL`  
**Code:** `apps/workboard/src/modules/ocms/caseReadModelDiagnostics.ts`

---

## Severity levels

| Level | Meaning |
|-------|---------|
| OK | No issue (implicit — codes only when needed) |
| INFO | Expected gap (empty checklist, deferred feature) |
| WARNING | Operator should know (missing responsible, ambiguous lifecycle) |
| ERROR | Contract risk (rare in V1) |
| BLOCKING | Cannot show Case (permission / discovery NONE) — returns null model |

---

## Diagnostic codes

| Code | Default severity | When emitted |
|------|------------------|--------------|
| `MISSING_CASE_TYPE` | ERROR | Type cannot be inferred (future strict mode) |
| `MISSING_RESPONSIBLE` | WARNING | No owner display/id |
| `AMBIGUOUS_LIFECYCLE` | WARNING | lifecycle confidence LOW/UNKNOWN |
| `NO_DOCUMENTS` | INFO | documents[] empty |
| `NO_TIMELINE` | INFO | timeline[] empty |
| `NO_HANDOFF` | INFO | handoff null |
| `NO_CHECKLIST` | INFO | checklist[] empty |
| `DERIVED_FROM_TASK_ONLY` | INFO | source TASK_ANCHORED |
| `MULTI_TASK_GROUPING_DEFERRED` | INFO | Only one task ref (V1) |
| `CASE_KEY_FALLBACK` | WARNING | OCMS key fallback warning present |
| `MISSING_TITLE` | WARNING | task.title empty |
| `LOW_CONFIDENCE` | WARNING | ocms diagnostics confidence LOW |

---

## No silent fallback rule

1. Do not invent Responsible, title, or caseKey.  
2. Do not hide empty sections — emit INFO codes.  
3. Warnings surface in `diagnostics.warnings[]` for strip/UI.  
4. OCMS `deriveCaseReadModel` null → runtime null (no synthetic Case).

---

## Examples

```json
{
  "code": "MISSING_RESPONSIBLE",
  "severity": "WARNING",
  "message": "Chưa có người phụ trách"
}
```

```json
{
  "code": "MULTI_TASK_GROUPING_DEFERRED",
  "severity": "INFO",
  "message": "Nhóm nhiều công việc / case — chưa hỗ trợ"
}
```

---

## Runtime state

`diagnostics.runtimeState` copies OCMS field — default `NOT_WIRED` until operator updates `003_RUNTIME_STATE.md`.

---

*Extend codes only via ADR + contract version bump.*
