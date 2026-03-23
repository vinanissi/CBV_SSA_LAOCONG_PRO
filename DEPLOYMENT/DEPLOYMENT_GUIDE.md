# CBV One-Click Deployment Guide

## Overview

The CBV system provides a single function `runFullDeployment()` that:

1. Ensures all required sheets and columns
2. Seeds missing data (DON_VI, USER_DIRECTORY, ENUM_DICTIONARY, MASTER_CODE)
3. Validates enum consistency, ref integrity, DON_VI hierarchy
4. Runs full system tests
5. Generates a deployment report
6. Writes the report to ADMIN_AUDIT_LOG

**Idempotent and safe:** Run multiple times without breaking existing data. No destructive operations.

---

## How to Run

### Option 1: Menu (recommended)

1. Open the CBV spreadsheet
2. Refresh the page (or re-open) so the menu loads
3. Click **CBV_SSA** → **Full Deployment (One-Click)**
4. Review the alert with verdict (PASS / WARNING / FAIL)

### Option 2: Apps Script Editor

1. Open **Extensions** → **Apps Script**
2. Run the function `runFullDeployment` (no parameters)
3. Check **View** → **Logs** or **Execution log**

### Option 3: With Options

```javascript
// Skip seed (schema + validate + test only)
runFullDeployment({ skipSeed: true });

// Skip tests (schema + seed + validate only)
runFullDeployment({ skipTests: true });

// Dry run (no write to ADMIN_AUDIT_LOG)
runFullDeployment({ dryRun: true });
```

---

## Expected Output

| Verdict | Meaning |
|---------|---------|
| **PASS** | All checks passed. System ready for use. |
| **WARNING** | Some medium-severity issues or warnings. Review recommended but deploy may proceed. |
| **FAIL** | High-severity issues. Fix before deploying. |

### Example PASS

```
Deployment: PASS

{
  "high": 0,
  "medium": 0,
  "verdict": "PASS",
  "schemaOk": true,
  "seedOk": true,
  "enumOk": true,
  "refOk": true,
  "hierarchyOk": true,
  "testsOk": true
}
```

### Example WARNING

```
Deployment: WARNING

{
  "high": 0,
  "medium": 2,
  "verdict": "WARNING",
  ...
}

Warnings: [list of items]
```

### Example FAIL

```
Deployment: FAIL

{
  "high": 3,
  "medium": 1,
  "verdict": "FAIL",
  ...
}

Must fix (3):
- TASK_MAIN: invalid OWNER_ID ref
- ENUM_DICTIONARY: TASK_STATUS missing
- DON_VI: circular hierarchy detected
```

---

## How to Interpret Results

### PASS

- Schema is complete
- Seed data is present (or not needed)
- Enums are consistent
- References resolve correctly
- DON_VI hierarchy is valid
- All system tests passed

**Next step:** Run `verifyAppSheetReadiness()` if using AppSheet. Sync data. Proceed with normal operation.

### WARNING

- Some non-critical issues exist
- Examples: missing optional columns, deprecated fields, medium-priority test failures

**Next step:** Review `report.warnings` and `report.steps`. Fix if possible. Re-run deployment. If acceptable, proceed with caution.

### FAIL

- At least one high-severity issue
- Examples: missing required sheets, broken refs, invalid enums, circular DON_VI hierarchy

**Next step:** Fix all items in `report.mustFix`. Re-run deployment until PASS or WARNING.

---

## What to Do if FAIL

1. Read `report.mustFix` — these are the blocking issues
2. Fix manually or via repair scripts:
   - Schema: run `initAll()` or `ensureAllSchemas()`
   - Seed: run `ensureSeedDonVi()`, `seedEnumDictionary()`, `ensureSeedTaskType()`
   - Refs: use `repairTaskSystemSafely()` (dry run first)
   - Hierarchy: fix DON_VI.PARENT_ID in spreadsheet
3. Re-run `runFullDeployment()`
4. If still failing, check ADMIN_AUDIT_LOG for full report details (AFTER_JSON column)

---

## Safe Re-run Instructions

- **Re-run anytime.** Deployment is idempotent.
- No rows are deleted
- No columns are removed
- Only missing sheets/columns are created
- Only missing seed rows are inserted
- Validation and tests are read-only

---

## Architecture (Do Not Change)

| Table | Purpose |
|-------|---------|
| USER_DIRECTORY | Users, independent of HTX |
| DON_VI | Organization hierarchy |
| MASTER_CODE | Static business data (e.g. TASK_TYPE) |
| ENUM_DICTIONARY | Enums only |
| TASK_MAIN | Tasks |
| TASK_CHECKLIST | Task checklist items |
| TASK_ATTACHMENT | Task attachments |
| TASK_UPDATE_LOG | Task change log |
| ADMIN_AUDIT_LOG | Admin audit trail (deployment reports) |

---

## Related Functions

| Function | Purpose |
|----------|---------|
| `initAll()` | Bootstrap sheets, enums, display text |
| `selfAuditTaskSystemFull()` | Task system audit only |
| `runAllSystemTests()` | Tests only (no schema/seed) |
| `verifyAppSheetReadiness()` | AppSheet sync check |
