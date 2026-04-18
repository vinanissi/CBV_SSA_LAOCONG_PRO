# CBV PRO Function Wrapper Map

Wrapper = public menu entry. Impl = real execution logic.

| Wrapper Function | Implementation Function | Module/File | Status | Notes |
|-----------------|-------------------------|-------------|--------|-------|
| runFullDeployment | runFullDeploymentImpl | 98_deployment_bootstrap.js | implemented | Full one-click deployment |
| ensureAllSchemas | ensureAllSchemasImpl | 98_schema_manager.js | implemented | |
| seedAllData | seedAllDataImpl | 98_seed_manager.js | implemented | |
| installTriggers | installTriggersImpl | 90_BOOTSTRAP_INSTALL.js | implemented | |
| removeCbvTriggers | removeCbvTriggersImpl | 90_BOOTSTRAP_INSTALL.js | implemented | |
| selfAuditBootstrap | selfAuditBootstrapImpl | 90_BOOTSTRAP_AUDIT.js | implemented | |
| verifyAppSheetReadiness | verifyAppSheetReadinessImpl | 50_APPSHEET_VERIFY.js | implemented | |
| testSchemaIntegrity | (testSchemaIntegrity) | 97_TASK_SYSTEM_TEST_RUNNER.js | implemented | No Impl suffix - direct |
| validateAllEnums | validateAllEnumsImpl | 98_validation_engine.js | implemented | |
| validateAllRefs | validateAllRefsImpl | 98_validation_engine.js | implemented | |
| validateDonViHierarchy | validateDonViHierarchyImpl | 98_validation_engine.js | implemented | |
| runAllSystemTests | runAllSystemTestsImpl | 97_TASK_SYSTEM_TEST_RUNNER.js | implemented | |
| generateDeploymentReport | runFullDeploymentImpl + generateDeploymentReportImpl | 98_deployment, 98_audit_logger | implemented | Menu: runs deployment; with report arg: writes to log |
| ensureSeedEnumDictionary | seedEnumDictionary | 01_ENUM_SEED.js | implemented | Alias |
| ensureSeedDonVi | ensureSeedDonVi | 95_TASK_SYSTEM_BOOTSTRAP.js | implemented | No Impl suffix |
| ensureSeedMasterCode | ensureSeedTaskType | 95_TASK_SYSTEM_BOOTSTRAP.js | implemented | Alias |
| ensureSeedUserDirectory | seedUserDirectory | 90_BOOTSTRAP_USER_SEED.js | implemented | Optional |
| buildActiveSlicesSpec | buildActiveSlicesSpecImpl | 95_TASK_SYSTEM_BOOTSTRAP.js | implemented | |
| buildEnumSpecReport | auditEnumConsistency / enumHealthCheck | 01_ENUM_AUDIT | implemented | |
| auditTaskModule | selfAuditTaskSystemFull / selfAuditTaskSystem | 95, 96 | implemented | |
| seedTaskDemo | seedGoldenDataset | 99_DEBUG_SAMPLE_DATA.js | implemented | |
| testTaskWorkflowRules | runTaskSystemTests / runAllSystemTestsImpl | 97 | implemented | |
| testFieldPolicyReadiness | testFieldPolicyReadinessImpl | 97_TASK_SYSTEM_TEST_RUNNER.js | implemented | |
| createSampleTaskRows | seedTaskDemo (wrapper) | - | implemented | Delegates |
| auditHoSoModule | runHoSoTests | 99_DEBUG_TEST_HOSO.js | implemented | |
| seedHoSoDemo | seedGoldenDataset | 99_DEBUG_SAMPLE_DATA.js | implemented | |
| testHoSoRelations | auditHoSoModule | - | implemented | Delegates |
| auditFinanceModule | runFinanceTests | 99_DEBUG_TEST_FINANCE.js | implemented | |
| seedFinanceDemo | seedGoldenDataset | 99_DEBUG_SAMPLE_DATA.js | implemented | |
| testFinanceDonViMapping | auditFinanceModule | - | implemented | Delegates |
| dumpAllSheetSchemas | getRequiredSheetNames, getSchemaHeaders | 90_BOOTSTRAP_SCHEMA.js | implemented | |
| auditSchemaMismatch | selfAuditBootstrapImpl | 90_BOOTSTRAP_AUDIT.js | implemented | |
| dumpSchemaProfileFull | dumpAllSheetSchemas | - | implemented | Delegates |
| repairTaskSystemSafely | repairTaskSystemSafelyImpl | 95_TASK_SYSTEM_BOOTSTRAP.js | implemented | |
| repairSchemaSafely | repairSchemaColumns / repairSchemaAndData | 90_BOOTSTRAP_REPAIR.js | implemented | |
| repairEnumSafely | runSafeRepair | 01_ENUM_SYNC_SERVICE.js | implemented | |
| repairRefSafely | (informational) | - | placeholder | Uses repair toàn hệ thống |
| enforceFinalSchemaSafely | repairSchemaColumns / ensureAllSchemasImpl | - | implemented | |
| openSystemHealthLogSheet | openSheetByName_ | 90_BOOTSTRAP_MENU_HELPERS.js | implemented | |
| openAdminAuditLogSheet | openSheetByName_ | 90_BOOTSTRAP_MENU_HELPERS.js | implemented | |
| showMissingFunctionReport | - | 90_BOOTSTRAP_MENU_HELPERS.js | implemented | |
| verifyMenuBindings | - | 90_BOOTSTRAP_MENU_HELPERS.js | implemented | |
| showDailyAdminGuide | - | 90_BOOTSTRAP_MENU_HELPERS.js | implemented | |

## Migration Notes

| Old Function Name | New Wrapper Name | New Impl Name | Compatibility |
|-------------------|------------------|---------------|----------------|
| runFullDeployment | runFullDeployment | runFullDeploymentImpl | Menu binds to wrapper |
| ensureAllSchemas | ensureAllSchemas | ensureAllSchemasImpl | Menu binds to wrapper |
| seedAllData | seedAllData | seedAllDataImpl | Menu binds to wrapper |
| installTriggers | installTriggers | installTriggersImpl | Menu binds to wrapper |
| removeCbvTriggers | removeCbvTriggers | removeCbvTriggersImpl | Menu binds to wrapper |
| selfAuditBootstrap | selfAuditBootstrap | selfAuditBootstrapImpl | Menu binds to wrapper |
| verifyAppSheetReadiness | verifyAppSheetReadiness | verifyAppSheetReadinessImpl | Menu binds to wrapper |
| validateAllEnums | validateAllEnums | validateAllEnumsImpl | Menu binds to wrapper |
| validateAllRefs | validateAllRefs | validateAllRefsImpl | Menu binds to wrapper |
| validateDonViHierarchy | validateDonViHierarchy | validateDonViHierarchyImpl | Menu binds to wrapper |
| runAllSystemTests | runAllSystemTests | runAllSystemTestsImpl | Menu binds to wrapper |
| repairTaskSystemSafely | repairTaskSystemSafely | repairTaskSystemSafelyImpl | Menu binds to wrapper |

## Backward Compatibility

- `runFullDeploymentMenu()` → calls `runFullDeployment()` (wrapper)
- `menuRunFullDeployment()` → calls `runFullDeployment()` (wrapper)
- All `menu*` handlers delegate to wrappers; menu can bind to either `menu*` or wrapper names.
