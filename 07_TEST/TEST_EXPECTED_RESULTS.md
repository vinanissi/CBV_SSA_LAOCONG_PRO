# Test Expected Results

**Purpose:** Reference for pass/fail expectations. Use with `task_system_regression_report_template.md`.

---

## 1. Good Seed (test_seed_data.tsv)

When validating `test_seed_data.tsv`:

| Category | Expected | Notes |
|----------|----------|-------|
| Schema | PASS | All tables and required columns present |
| Seed Data | PASS | No duplicates, no blank keys |
| Enum | PASS | All values in ENUM_DICTIONARY |
| Ref | PASS | All refs resolve |
| Hierarchy | PASS | 1 root, no cycles, no orphans |
| Workflow | PASS | STATUS valid; no DONE without DONE_AT |

**Overall:** PASS

---

## 2. Corrupted Seed (test_corrupted_seed_samples.tsv)

When validating corrupted samples:

| Category | Expected | Issues to Detect |
|----------|----------|------------------|
| Seed Data | FAIL | Duplicate IDs, blank required |
| Enum | FAIL | Invalid ROLE, STATUS, PRIORITY |
| Ref | FAIL | Broken DON_VI_ID, OWNER_ID, TASK_TYPE_ID, PARENT_ID |
| Hierarchy | FAIL | Circular ref, self-ref, orphan parent |
| Workflow | FAIL | DONE without DONE_AT; invalid STATUS |

**Overall:** FAIL (multiple HIGH)

---

## 3. Schema Tests

| Test | Expected |
|------|----------|
| All 9 required sheets exist | PASS |
| USER_DIRECTORY has ID, EMAIL, ROLE, STATUS | PASS |
| TASK_MAIN has STATUS, OWNER_ID, DONE_AT | PASS |
| ENUM_DICTIONARY has ENUM_GROUP, ENUM_VALUE | PASS |

---

## 4. Enum Tests

| ENUM_GROUP | Expected Values (active) |
|------------|--------------------------|
| TASK_STATUS | NEW, ASSIGNED, IN_PROGRESS, WAITING, DONE, CANCELLED, ARCHIVED |
| PRIORITY / TASK_PRIORITY | CAO, TRUNG_BINH, THAP (or LOW, MEDIUM, HIGH, URGENT legacy) |
| DON_VI_TYPE | CONG_TY, HTX, DOI_KINH_DOANH, BO_PHAN, NHOM |
| USER_ROLE | ADMIN, OPERATOR, VIEWER |
| RECORD_STATUS | ACTIVE, INACTIVE |

---

## 5. Workflow Transitions (TASK_VALID_TRANSITIONS)

| From | Valid To |
|------|----------|
| NEW | ASSIGNED, IN_PROGRESS, CANCELLED |
| ASSIGNED | IN_PROGRESS, CANCELLED |
| IN_PROGRESS | WAITING, DONE, CANCELLED |
| WAITING | IN_PROGRESS, CANCELLED |
| DONE | IN_PROGRESS, ARCHIVED |
| CANCELLED | IN_PROGRESS, ARCHIVED |
| ARCHIVED | (none) |

**Invalid examples:** NEW→DONE, DONE→NEW (unless MỞ LẠI), ARCHIVED→*

---

## 6. Regression Baseline

When establishing baseline:

- Record: `highCount`, `mediumCount`, `lowCount`, `totalFindings`
- Store in SYSTEM_HEALTH_LOG or regression report
- Future runs: compare; no new HIGH = regression PASS
