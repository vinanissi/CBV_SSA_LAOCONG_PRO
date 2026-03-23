# CBV Test System

Validation and regression tests for the CBV Google Sheets + AppSheet + GAS architecture.

## Quick Start

1. **Run tests from the spreadsheet:** Menu **CBV_SSA** → **Chạy Test Hệ Thống**
2. **Run from GAS editor:** `runAllSystemTests()` or `runTaskSystemTests()`

## Artifacts

| File | Purpose |
|------|---------|
| TEST_STRATEGY.md | Strategy, categories, verdict rules |
| TEST_CASE_MATRIX.md | Full test case matrix (73 cases) |
| TEST_SEED_CORRUPTION_CASES.md | Intentionally broken data samples |
| TEST_EXPECTED_RESULTS.md | Expected pass/fail reference |
| test_seed_data.tsv | Good baseline (for manual validation) |
| test_corrupted_seed_samples.tsv | Corrupted samples |
| task_system_assertions.gs | Assertion helpers |
| task_system_mock_data.gs | Mock fixtures (good + bad) |
| task_system_test_runner.gs | Full runner (07_TEST source) |
| task_system_regression_report_template.md | Report template |

## Deployed GAS (05_GAS_RUNTIME)

- `97_TASK_SYSTEM_TEST_ASSERTIONS.gs`
- `97_TASK_SYSTEM_TEST_MOCK.gs`
- `97_TASK_SYSTEM_TEST_RUNNER.gs` — contains `runAllSystemTests()`, `runTaskSystemTests()`

## Deployment Checklist

See **09_AUDIT/SYSTEM_HEALTH_TEST_CHECKLIST.md**.
