# CBV Test Runner Documentation

**File:** `07_TEST/CBV_TEST_RUNNER.gs` (copy-paste into Apps Script)

---

## 1. What Each Test Checks

### testSchemaIntegrity()
- **Scope:** All 9 required sheets and their required columns
- **Checks:**
  - USER_DIRECTORY, DON_VI, MASTER_CODE, ENUM_DICTIONARY, TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG, ADMIN_AUDIT_LOG exist
  - Each sheet has its minimal required columns (e.g. ID, EMAIL, ROLE, STATUS for USER_DIRECTORY)
- **Findings:** SHEET_MISSING (HIGH), COL_MISSING (MEDIUM)

### testSeedConsistency()
- **Scope:** USER_DIRECTORY, DON_VI, MASTER_CODE, TASK_MAIN
- **Checks:**
  - No duplicate IDs per table
  - No blank ID
  - No blank EMAIL (USER_DIRECTORY)
  - No duplicate EMAIL (USER_DIRECTORY)
- **Findings:** BLANK_ID, DUP_ID, BLANK_EMAIL, DUP_EMAIL (HIGH/MEDIUM)

### testEnumConsistency()
- **Scope:** ENUM_DICTIONARY + enum usage in USER_DIRECTORY, DON_VI, TASK_MAIN
- **Checks:**
  - ENUM_DICTIONARY has ENUM_GROUP, ENUM_VALUE
  - Required groups present (TASK_STATUS, PRIORITY, DON_VI_TYPE, USER_ROLE)
  - At most 1 default per group (IS_DEFAULT)
  - USER_DIRECTORY.ROLE in USER_ROLE
  - DON_VI.DON_VI_TYPE in DON_VI_TYPE
  - TASK_MAIN.STATUS in TASK_STATUS
  - TASK_MAIN.PRIORITY in PRIORITY/TASK_PRIORITY
  - DONE tasks have DONE_AT set
- **Findings:** ENUM_EMPTY, ENUM_COLS, MULTI_DEFAULT, ENUM_MISSING_GROUP, INVALID_ENUM, DONE_NO_TS (HIGH/MEDIUM)

### testRefIntegrity()
- **Scope:** All foreign key references
- **Checks:**
  - USER_DIRECTORY.DON_VI_ID → DON_VI.ID (when not blank)
  - DON_VI.MANAGER_USER_ID → USER_DIRECTORY.ID (active user)
  - DON_VI.PARENT_ID → DON_VI.ID
  - TASK_MAIN.OWNER_ID → USER_DIRECTORY.ID (active)
  - TASK_MAIN.REPORTER_ID → USER_DIRECTORY.ID
  - TASK_MAIN.DON_VI_ID → DON_VI.ID
  - TASK_MAIN.TASK_TYPE_ID → MASTER_CODE (MASTER_GROUP=TASK_TYPE, STATUS=ACTIVE)
- **Findings:** BAD_REF (HIGH/MEDIUM)

### testDonViHierarchy()
- **Scope:** DON_VI tree
- **Checks:**
  - No self-reference (PARENT_ID ≠ own ID)
  - No circular references (A→B→A)
  - PARENT_ID exists in DON_VI when not blank
  - At least one root (PARENT_ID empty)
- **Findings:** SELF_PARENT, CIRCULAR, ORPHAN_PARENT, NO_ROOT (HIGH)

### testTaskWorkflowRules()
- **Scope:** TASK_MAIN
- **Checks:**
  - STATUS is valid (NEW, ASSIGNED, IN_PROGRESS, WAITING, DONE, CANCELLED, ARCHIVED)
  - DONE tasks have DONE_AT set
- **Findings:** INVALID_STATUS (HIGH), DONE_NO_TS (MEDIUM)

### testFieldPolicyReadiness()
- **Scope:** Policy audit (informational)
- **Checks:** Documents that STATUS, DONE_AT, IS_DELETED must NOT be form-editable
- **Findings:** POLICY_AUDIT (HIGH) — for manual AppSheet review

### testAppSheetReadiness()
- **Scope:** Slice data sources
- **Checks:**
  - USER_DIRECTORY has data (ACTIVE_USERS slice)
  - DON_VI has data (ACTIVE_DON_VI slice)
  - MASTER_CODE has MASTER_GROUP=TASK_TYPE (ACTIVE_TASK_TYPE slice)
- **Findings:** SLICE_SOURCE (HIGH)

### testMigrationSafety()
- **Scope:** Schema manifest
- **Checks:** TASK_MAIN has DON_VI_ID if CBV_SCHEMA_MANIFEST is defined
- **Findings:** MIGRATION (MEDIUM)

---

## 2. How to Run Safely

### Idempotent, read-only
- Tests **do not write** to sheets
- Safe to run repeatedly
- No destructive operations

### Ways to run

| Method | Steps |
|--------|-------|
| **GAS editor** | Open script editor → select `runAllSystemTests` → Run |
| **Custom menu** | Add menu item that calls `runTaskSystemTests()` (shows dialog) |
| **Logs** | Call `runAllSystemTests()` and `Logger.log(JSON.stringify(result))` to inspect |

### Dependencies
- **CBV_CONFIG** (00_CORE_CONFIG): Used for sheet name mapping. If absent, uses default names (USER_DIRECTORY, DON_VI, etc.).
- **Spreadsheet context:** Must run in a spreadsheet-bound script (SpreadsheetApp.getActive()).

---

## 3. How to Interpret Results

### Return structure

```javascript
{
  ok: true | false,           // true only when verdict === 'PASS'
  verdict: 'PASS' | 'WARNING' | 'FAIL',
  results: [                  // One per test category
    { ok, category, findings: [...], stats: {} }
  ],
  summary: {
    verdict, high, medium, low, total, summary
  },
  mustFixBeforeDeploy: [...]  // HIGH findings only
}
```

### Verdict rules

| Verdict | Condition |
|---------|-----------|
| **PASS** | 0 HIGH, 0 MEDIUM blocking |
| **WARNING** | 0 HIGH, ≥1 MEDIUM |
| **FAIL** | ≥1 HIGH |

### Severity

| Severity | Meaning |
|----------|---------|
| **HIGH** | Blocks deployment; fix before deploy |
| **MEDIUM** | Should fix or document |
| **LOW** | Informational |

### Finding format

```javascript
{
  code: 'BAD_REF',
  table: 'TASK_MAIN',
  severity: 'HIGH',
  message: 'OWNER_ID not found: UD_XXX',
  rowId: 'TASK_001',
  field: 'OWNER_ID'
}
```

### Action by verdict

| Verdict | Action |
|---------|--------|
| **PASS** | Safe to deploy |
| **WARNING** | Fix MEDIUM items or get sign-off; deploy acceptable |
| **FAIL** | **Do not deploy** until all HIGH items in `mustFixBeforeDeploy` are resolved |

---

## 4. Assertion Helpers (for custom tests)

Use these when extending tests or writing new checks:

| Function | Purpose |
|----------|---------|
| `assertEquals(expected, actual, message)` | Asserts expected === actual |
| `assertTrue(condition, message)` | Asserts condition is true |
| `assertNotEmpty(value, message)` | Asserts value is not null/empty |
| `assertRefExists(refValue, idSet, refName, rowId)` | Asserts refValue exists in idSet (skips if blank) |

Each returns `{ ok: boolean, message: string }` (assertRefExists adds `rowId`, `field`).

---

## 5. buildRegressionSummary()

**Input:** Array of test results (each with `findings` array).

**Output:**
```javascript
{
  verdict: 'PASS' | 'WARNING' | 'FAIL',
  high: 0,
  medium: 0,
  low: 0,
  total: 0,
  summary: 'PASS — HIGH:0 MEDIUM:0 LOW:0'
}
```

Use to compare before/after when making changes.
