# Deployment Phase 2 - Test + Sample + AppSheet Ready

## File Tree (Created/Updated)

```
05_GAS_RUNTIME/
  test_hoso.gs          (new)
  test_task.gs          (new)
  test_finance.gs       (new)
  test_runner.gs        (new)
  sample_data.gs        (new)
  verify_appsheet.gs    (new)
  bootstrap_menu.gs     (updated - added Run All Tests, Seed Golden Data, Verify AppSheet Ready)

04_APPSHEET/
  APPSHEET_TABLE_READY_CHECKLIST.md  (new)
  APPSHEET_KEY_LABEL_MAP.md          (new)
  APPSHEET_REF_MAP.md                (new)
  APPSHEET_DEPLOYMENT_NOTES.md       (new)

06_DATABASE/
  golden_dataset_spec.md             (new)

09_AUDIT/
  SERVICE_RULE_AUDIT.md              (new)
```

## Functions to Run

| Function | Purpose |
|----------|---------|
| runAllModuleTests() | Run HO_SO, TASK, FINANCE tests |
| runHoSoTests() | HO_SO tests only |
| runTaskTests() | TASK_CENTER tests only |
| runFinanceTests() | FINANCE tests only |
| seedGoldenDataset() | Seed SAMPLE_ prefixed demo data |
| verifyAppSheetReadiness() | Check tables, keys, enums for AppSheet |

## Execution Order

1. **Bootstrap** (if not done): initAll() → selfAuditBootstrap() → installTriggers()
2. **Seed data**: seedGoldenDataset()
3. **Run tests**: runAllModuleTests()
4. **Verify AppSheet**: verifyAppSheetReadiness()

## Service-Rule Mismatches

| Mismatch | Resolution |
|----------|------------|
| assignTask (SERVICE_CONTRACT) not implemented | Documented; use createTask with OWNER_ID + setTaskStatus ASSIGNED |
| repository._rows uses lastRow-1 | Left unchanged; may be intentional |

## AppSheet-Ready Summary

- 9 tables with Key=ID, Label per APPSHEET_KEY_LABEL_MAP.md
- Ref candidates: HTX_ID, HO_SO_ID, TASK_ID, FIN_ID
- STATUS columns: use GAS actions, not inline edit
- Log tables: read-only
