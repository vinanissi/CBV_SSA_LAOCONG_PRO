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

- 98_deployment_bootstrap.gs
- 98_schema_manager.gs
- 98_seed_manager.gs
- 98_validation_engine.gs
- 98_audit_logger.gs
- 97_TASK_SYSTEM_TEST_RUNNER.gs
- 90_BOOTSTRAP_AUDIT.gs
- 50_APPSHEET_VERIFY.gs
- 90_BOOTSTRAP_INIT.gs
- 90_BOOTSTRAP_INSTALL.gs
- 95_TASK_SYSTEM_BOOTSTRAP.gs
- 90_BOOTSTRAP_MENU_WRAPPERS.gs
- 90_BOOTSTRAP_MENU_HELPERS.gs
