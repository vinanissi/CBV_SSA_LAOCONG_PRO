# CBV PRO Wrapper + Impl Migration Note

## Architecture

- **Wrapper** = public menu entry, calls Impl, shows alert if missing
- **Impl** = real logic, uses `*Impl` suffix

## Key Renames (Old → Impl)

| Old | Impl |
|-----|------|
| runFullDeployment | runFullDeploymentImpl |
| ensureAllSchemas | ensureAllSchemasImpl |
| seedAllData | seedAllDataImpl |
| installTriggers | installTriggersImpl |
| removeCbvTriggers | removeCbvTriggersImpl |
| selfAuditBootstrap | selfAuditBootstrapImpl |
| verifyAppSheetReadiness | verifyAppSheetReadinessImpl |
| validateAllEnums | validateAllEnumsImpl |
| validateAllRefs | validateAllRefsImpl |
| validateDonViHierarchy | validateDonViHierarchyImpl |
| runAllSystemTests | runAllSystemTestsImpl |
| repairTaskSystemSafely | repairTaskSystemSafelyImpl |
| generateDeploymentReport (write) | generateDeploymentReportImpl |

## Backward Compatibility

- `runFullDeploymentMenu()` → calls `runFullDeployment()` (wrapper)
- `generateDeploymentReport(report)` with report arg → delegates to `generateDeploymentReportImpl(report)`
- All `menu*` handlers delegate to wrappers

## Files Modified

- 98_deployment_bootstrap.js
- 98_schema_manager.js
- 98_seed_manager.js
- 98_validation_engine.js
- 98_audit_logger.js
- 97_TASK_SYSTEM_TEST_RUNNER.js
- 90_BOOTSTRAP_AUDIT.js
- 50_APPSHEET_VERIFY.js
- 90_BOOTSTRAP_INIT.js
- 90_BOOTSTRAP_INSTALL.js
- 95_TASK_SYSTEM_BOOTSTRAP.js
- 90_BOOTSTRAP_MENU_WRAPPERS.js
- 90_BOOTSTRAP_MENU_HELPERS.js
