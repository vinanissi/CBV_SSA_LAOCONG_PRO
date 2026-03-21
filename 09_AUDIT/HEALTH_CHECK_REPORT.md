# System Health Check Report — CBV_SSA_LAOCONG_PRO

`selfAuditBootstrap()` produces a structured health report. This document describes the report model and how to interpret it.

---

## 1. Report Structure

```json
{
  "ok": false,
  "code": "AUDIT_FAIL",
  "message": "Bootstrap audit found issues - review mustFixNow",
  "data": {
    "mismatchedSheets": [],
    "warnings": []
  },
  "errors": ["SCHEMA_MISSING_COLUMN: Required column X is missing..."],
  "auditReport": {
    "auditRunAt": "2025-03-18T10:00:00.000Z",
    "systemHealth": "FAIL",
    "bootstrapSafe": false,
    "appsheetReady": false,
    "totals": { "critical": 2, "high": 5, "medium": 8, "low": 4, "info": 10 },
    "sectionResults": { "sheetsExist": "PASS", "schemaIntegrity": "FAIL", ... },
    "mustFixNow": ["..."],
    "warnings": ["..."],
    "top10Issues": [{ "severity": "CRITICAL", "table": "TASK_MAIN", "issue": "...", "message": "..." }],
    "safeNextSteps": ["Fix MUST_FIX_NOW items", "Re-run selfAuditBootstrap()"],
    "findings": [...]
  }
}
```

---

## 2. Verdict Fields

| Field | Meaning |
|-------|---------|
| **SYSTEM_HEALTH** | PASS / WARN / FAIL |
| **BOOTSTRAP_SAFE** | YES if no CRITICAL/HIGH findings; NO otherwise |
| **APPSHEET_READY** | YES if schema/ref/key issues resolved; NO otherwise |
| **TOP_10_ISSUES** | First 10 findings by severity |
| **MUST_FIX_NOW** | CRITICAL and HIGH findings |
| **SAFE_NEXT_STEPS** | Recommended actions |

---

## 3. Section Results

| Section | PASS | WARN | FAIL |
|---------|------|------|------|
| sheetsExist | All required sheets present | — | Missing sheets |
| schemaIntegrity | Headers valid | — | Empty or invalid headers |
| *table*_headers | No dupes, no blanks, required cols present | Unexpected columns | Duplicate/blank/missing |
| enumIntegrity | ENUM_DICTIONARY valid | Missing/empty | Duplicates, missing groups |
| masterCodeIntegrity | No duplicate IDs | — | Duplicate MASTER_CODE.ID |
| refIntegrity | No orphans | — | Orphan child rows |
| workflowIntegrity | DONE_AT set, progress in range | NEW+100% progress | DONE without DONE_AT, progress out of range |
| requiredCompleteness | No blank required fields | — | Blank required values |
| duplicateKeys | No duplicate primary keys | — | Duplicate IDs |
| softDeleteConsistency | IS_DELETED aligned with STATUS | — | Deleted but ACTIVE |
| logIntegrity | ACTION, CREATED_AT present | — | Blank ACTION |
| appSheetReadiness | No blockers | — | Schema/ref/key blockers |

---

## 4. Severity Model

| Severity | Meaning |
|----------|---------|
| CRITICAL | System broken; bootstrap unsafe |
| HIGH | AppSheet or data at risk |
| MEDIUM | Should fix soon |
| LOW | Informational; optional fix |
| INFO | No action required |

---

## 5. Integration with initAll()

1. Run `selfAuditBootstrap()` before `initAll()`.
2. If `bootstrapSafe === false`, fix `mustFixNow` items.
3. If `bootstrapSafe === true`, run `initAll()`.
4. Run `verifyAppSheetReadiness()` after init.

---

## 6. Integration with verifyAppSheetReadiness()

`verifyAppSheetReadiness()` calls `selfAuditBootstrap()` first. If audit fails, it returns `ok: false` and includes `auditReport` in `data`.

---

## 7. Logging

- Each run appends one row to ADMIN_AUDIT_LOG (AUDIT_TYPE=BOOTSTRAP_AUDIT).
- Logger output: SYSTEM_HEALTH, BOOTSTRAP_SAFE, APPSHEET_READY, TOP_10, MUST_FIX_NOW.
