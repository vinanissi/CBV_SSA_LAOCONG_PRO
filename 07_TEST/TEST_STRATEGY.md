# CBV Test System Strategy

**Purpose:** Validate seed data integrity, schema completeness, enum/ref safety, hierarchy correctness, workflow safety, regression detection, and deployment readiness for the CBV Google Sheets + AppSheet + GAS architecture.

**Scope:** USER_DIRECTORY, DON_VI, MASTER_CODE, ENUM_DICTIONARY, TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG, ADMIN_AUDIT_LOG.

---

## 1. Architecture Respected (No Redesign)

| Component | Role |
|-----------|------|
| USER_DIRECTORY | Canonical user table; users global; no HTX dependency |
| DON_VI | Real organizational unit table (CONG_TY, HTX, DOI_KINH_DOANH, BO_PHAN, NHOM) |
| MASTER_CODE | Static/semi-static shared master data only; NO DON_VI, NO USER |
| ENUM_DICTIONARY | Strict system enums only |
| TASK_* | TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG, ADMIN_AUDIT_LOG |

---

## 2. Test Categories

| # | Category | Goal | Artifact |
|---|----------|------|----------|
| A | SCHEMA TESTS | Required tables and columns exist | testSchemaIntegrity() |
| B | SEED DATA TESTS | No duplicates, no blank keys, valid refs | testSeedConsistency() |
| C | ENUM TESTS | ENUM_DICTIONARY structure; consuming tables use valid values | testEnumConsistency() |
| D | REF INTEGRITY TESTS | All FKs resolve | testRefIntegrity() |
| E | HIERARCHY TESTS | DON_VI tree valid (no cycles, orphans) | testDonViHierarchy() |
| F | TASK WORKFLOW TESTS | Valid transitions; DONE_AT when DONE | testTaskWorkflowRules() |
| G | FIELD POLICY TESTS | Visible/hidden/editable policy audit | testFieldPolicyReadiness() |
| H | APPSHEET READINESS | Slices, key fields, dropdown-only refs | testAppSheetReadiness() |
| I | SAFE MIGRATION TESTS | No destructive assumptions; append-safe | testMigrationSafety() |
| J | REGRESSION TESTS | Baseline health; before/after comparison | buildRegressionSummary() |

---

## 3. Severity Classification

| Severity | Examples |
|----------|----------|
| **HIGH** | Broken reference, invalid enum, duplicate ID, circular hierarchy |
| **MEDIUM** | Inconsistent status, missing optional data, bad naming |
| **LOW** | Formatting inconsistency, minor display issues |

---

## 4. Overall Verdict

| Verdict | Condition |
|---------|-----------|
| **PASS** | 0 HIGH, 0 MEDIUM blocking |
| **WARNING** | 0 HIGH, ≥1 MEDIUM |
| **FAIL** | ≥1 HIGH |

---

## 5. Execution Model

- **Idempotent:** Safe to run repeatedly.
- **Non-destructive:** No writes by default; read-only validation.
- **Structured output:** Each test returns `{ ok, findings[], stats }`.
- **Runner:** `runAllSystemTests()` orchestrates all categories; produces final report.

---

## 6. File Layout

```
07_TEST/
├── TEST_STRATEGY.md
├── TEST_CASE_MATRIX.md
├── TEST_SEED_CORRUPTION_CASES.md
├── TEST_EXPECTED_RESULTS.md
├── test_seed_data.tsv              # Good baseline
├── test_corrupted_seed_samples.tsv # Intentionally broken rows
├── task_system_assertions.gs       # assertEquals, assertRefExists, etc.
├── task_system_mock_data.gs        # Fixtures (good + broken)
├── task_system_test_runner.gs      # runAllSystemTests, category runners
└── task_system_regression_report_template.md
05_GAS_RUNTIME/                     # Deployed to Apps Script
├── 97_TASK_SYSTEM_TEST_ASSERTIONS.gs
├── 97_TASK_SYSTEM_TEST_MOCK.gs
└── 97_TASK_SYSTEM_TEST_RUNNER.gs   # runAllSystemTests, runTaskSystemTests
09_AUDIT/
└── SYSTEM_HEALTH_TEST_CHECKLIST.md
```

---

## 7. How to Run Before AppSheet Deploy

1. Run `runAllSystemTests()` from GAS editor or via custom menu.
2. Inspect `buildRegressionSummary()` output.
3. Fix any HIGH findings before deploy.
4. Resolve MEDIUM findings or document as known.
5. Use `SYSTEM_HEALTH_TEST_CHECKLIST.md` for go/no-go.
