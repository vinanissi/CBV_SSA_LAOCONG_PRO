# System Health Test Checklist

**Purpose:** Go/no-go checklist before AppSheet deployment. Run `runAllSystemTests()` and validate each item.

---

## Pre-Deploy Validation

### 1. Run Full Test Suite

| Step | Action | Expected |
|------|--------|----------|
| 1.1 | Open Google Sheet, menu **CBV** → **Chạy Test Hệ Thống** (or run `runTaskSystemTests()` in GAS editor) | Dialog shows verdict |
| 1.2 | Or run `runAllSystemTests()` and inspect return object | `{ verdict, summary, mustFixBeforeDeploy }` |

---

### 2. Verdict Interpretation

| Verdict | Condition | Action |
|---------|-----------|--------|
| **PASS** | 0 HIGH, 0 MEDIUM blocking | Ready for deploy |
| **WARNING** | 0 HIGH, ≥1 MEDIUM | Fix MEDIUM or document; deploy acceptable with sign-off |
| **FAIL** | ≥1 HIGH | **Do NOT deploy** until all HIGH fixed |

---

### 3. Must-Fix Items (HIGH)

Before deploy, resolve all items in `mustFixBeforeDeploy`:

- Broken references (OWNER_ID, DON_VI_ID, TASK_TYPE_ID, MANAGER_USER_ID, PARENT_ID)
- Invalid enum values (ROLE, DON_VI_TYPE, STATUS, PRIORITY)
- Duplicate IDs
- Blank required fields (ID, EMAIL)
- Circular DON_VI hierarchy
- Self-parent in DON_VI
- DONE without DONE_AT (if DONE_AT is required by policy)
- Missing sheets or required columns

---

### 4. Test Categories Summary

| Category | Scope |
|----------|-------|
| SCHEMA | 9 required sheets, required columns |
| SEED | Duplicate IDs, blank required, EMAIL unique |
| ENUM | ENUM_DICTIONARY structure, usage in USER_DIRECTORY, DON_VI, TASK_MAIN |
| REF | USER_DIRECTORY.DON_VI_ID, DON_VI.MANAGER_USER_ID/PARENT_ID, TASK_MAIN refs |
| HIERARCHY | DON_VI tree: no self-ref, no cycles, ≥1 root |
| WORKFLOW | TASK_MAIN.STATUS valid, DONE_AT when DONE |
| FIELD_POLICY | Audit: STATUS, DONE_AT, IS_DELETED not form-editable |
| APPSHEET | ACTIVE_USERS, ACTIVE_DON_VI, ACTIVE_TASK_TYPE slice sources |
| MIGRATION | Non-destructive schema assumptions |

---

### 5. Deployment Readiness

| Check | Status |
|-------|--------|
| runAllSystemTests() → verdict PASS or WARNING (0 HIGH) | [ ] |
| mustFixBeforeDeploy empty | [ ] |
| Schema bootstrap run | [ ] |
| Seed data loaded (DON_VI, USER_DIRECTORY, ENUM_DICTIONARY, MASTER_CODE) | [ ] |
| AppSheet slices configured | [ ] |
| Workflow fields locked in AppSheet | [ ] |

---

### 6. Regression Baseline

After first PASS:

1. Record `{ high, medium, low, total }` from `buildRegressionSummary(results)`.
2. Store in SYSTEM_HEALTH_LOG or project docs.
3. Future runs: compare; no new HIGH = regression PASS.

---

### 7. References

| Doc | Path |
|-----|------|
| Test Strategy | 07_TEST/TEST_STRATEGY.md |
| Test Case Matrix | 07_TEST/TEST_CASE_MATRIX.md |
| Corruption Cases | 07_TEST/TEST_SEED_CORRUPTION_CASES.md |
| Expected Results | 07_TEST/TEST_EXPECTED_RESULTS.md |
| Regression Template | 07_TEST/task_system_regression_report_template.md |
| GAS Runner | 05_GAS_RUNTIME/97_TASK_SYSTEM_TEST_RUNNER.js |
