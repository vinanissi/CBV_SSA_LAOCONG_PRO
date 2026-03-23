# CBV Deployment Report Sample

Below is a sample deployment report structure. The actual report is stored in `ADMIN_AUDIT_LOG` (AFTER_JSON column) and returned by `runFullDeployment()`.

---

## PASS Example

```json
{
  "runAt": "2025-03-21T10:00:00.000Z",
  "runId": "DEP_20250321_ABC123",
  "verdict": "PASS",
  "summary": {
    "high": 0,
    "medium": 0,
    "verdict": "PASS",
    "schemaOk": true,
    "seedOk": true,
    "enumOk": true,
    "refOk": true,
    "hierarchyOk": true,
    "testsOk": true
  },
  "mustFix": [],
  "warnings": [],
  "steps": {
    "schema": {
      "ok": true,
      "created": [],
      "appended": {},
      "logs": []
    },
    "seed": {
      "ok": true,
      "donVi": 0,
      "user": 0,
      "enum": 0,
      "masterCode": 0
    },
    "validateEnums": { "ok": true, "findings": [] },
    "validateRefs": { "ok": true, "findings": [] },
    "validateHierarchy": { "ok": true, "findings": [] },
    "tests": {
      "verdict": "PASS",
      "high": 0,
      "medium": 0,
      "low": 0
    }
  }
}
```

---

## WARNING Example

```json
{
  "runAt": "2025-03-21T10:05:00.000Z",
  "runId": "DEP_20250321_DEF456",
  "verdict": "WARNING",
  "summary": {
    "high": 0,
    "medium": 1,
    "verdict": "WARNING",
    "schemaOk": true,
    "seedOk": true,
    "enumOk": true,
    "refOk": true,
    "hierarchyOk": true,
    "testsOk": true
  },
  "mustFix": [],
  "warnings": ["TASK_MAIN: 2 rows with legacy TASK_TYPE text, consider migrating to TASK_TYPE_ID"],
  "steps": { ... }
}
```

---

## FAIL Example

```json
{
  "runAt": "2025-03-21T10:10:00.000Z",
  "runId": "DEP_20250321_GHI789",
  "verdict": "FAIL",
  "summary": {
    "high": 2,
    "medium": 1,
    "verdict": "FAIL",
    "schemaOk": true,
    "seedOk": true,
    "enumOk": false,
    "refOk": false,
    "hierarchyOk": true,
    "testsOk": false
  },
  "mustFix": [
    "ENUM_DICTIONARY: ENUM_GROUP TASK_STATUS empty or missing",
    "TASK_MAIN.OWNER_ID: invalid ref at row 5 (USER_XYZ not in USER_DIRECTORY)"
  ],
  "warnings": [],
  "steps": {
    "validateEnums": {
      "ok": false,
      "findings": [
        {
          "code": "ENUM_MISSING",
          "table": "ENUM_DICTIONARY",
          "severity": "HIGH",
          "message": "ENUM_GROUP TASK_STATUS empty or missing"
        }
      ]
    },
    "validateRefs": {
      "ok": false,
      "findings": [
        {
          "code": "INVALID_REF",
          "table": "TASK_MAIN",
          "field": "OWNER_ID",
          "severity": "HIGH",
          "message": "Invalid ref at row 5"
        }
      ]
    }
  }
}
```

---

## Issues Grouped by Severity

| Severity | Description | Action |
|----------|-------------|--------|
| **HIGH** | Blocking. Must fix before deploy. | Fix and re-run. |
| **MEDIUM** | Non-blocking. Review recommended. | Fix if possible; deploy with caution. |
| **LOW** | Informational. | Optional fix. |

---

## Recommended Fixes

| Issue | Fix |
|-------|-----|
| SHEET_MISSING | Run `initAll()` or `ensureAllSchemas()` |
| COL_MISSING | Run `ensureSchema({ appendMissingColumns: true })` |
| ENUM_MISSING | Run `seedEnumDictionary()` |
| INVALID_REF (OWNER_ID) | Add user to USER_DIRECTORY or clear OWNER_ID |
| INVALID_REF (DON_VI_ID) | Add DON_VI row or run `ensureSeedDonVi()` |
| INVALID_REF (TASK_TYPE_ID) | Run `ensureSeedTaskType()` |
| SELF_PARENT | Fix DON_VI.PARENT_ID (cannot equal ID) |
| CIRCULAR_HIERARCHY | Fix DON_VI.PARENT_ID chain |
| ORPHAN_NODE | Set PARENT_ID to existing ID or blank |
