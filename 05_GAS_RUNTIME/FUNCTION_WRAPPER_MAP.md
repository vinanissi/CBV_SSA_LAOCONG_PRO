# CBV PRO Function Wrapper Map

Wrapper = public menu entry. Impl = real execution logic.

| Wrapper Function | Implementation Function | Module/File | Status | Notes |
|-----------------|-------------------------|-------------|--------|-------|
| runFullDeployment | runFullDeploymentImpl | 98_deployment_bootstrap.gs | implemented | Full one-click deployment |
| ensureAllSchemas | ensureAllSchemasImpl | 98_schema_manager.gs | implemented | |
| seedAllData | seedAllDataImpl | 98_seed_manager.gs | implemented | |
| installTriggers | installTriggersImpl | 90_BOOTSTRAP_INSTALL.gs | implemented | |
| removeCbvTriggers | removeCbvTriggersImpl | 90_BOOTSTRAP_INSTALL.gs | implemented | |
| selfAuditBootstrap | selfAuditBootstrapImpl | 90_BOOTSTRAP_AUDIT.gs | implemented | |
| verifyAppSheetReadiness | verifyAppSheetReadinessImpl | 50_APPSHEET_VERIFY.gs | implemented | |
| testSchemaIntegrity | (testSchemaIntegrity) | 97_TASK_SYSTEM_TEST_RUNNER.gs | implemented | No Impl suffix - direct |
| validateAllEnums | validateAllEnumsImpl | 98_validation_engine.gs | implemented | |
| validateAllRefs | validateAllRefsImpl | 98_validation_engine.gs | implemented | |
| validateDonViHierarchy | validateDonViHierarchyImpl | 98_validation_engine.gs | implemented | |
| runAllSystemTests | runAllSystemTestsImpl | 97_TASK_SYSTEM_TEST_RUNNER.gs | implemented | |
| generateDeploymentReport | runFullDeploymentImpl + generateDeploymentReportImpl | 98_deployment, 98_audit_logger | implemented | Menu: runs deployment; with report arg: writes to log |
| ensureSeedEnumDictionary | seedEnumDictionary | 01_ENUM_SEED.gs | implemented | Alias |
| ensureSeedDonVi | ensureSeedDonVi | 95_TASK_SYSTEM_BOOTSTRAP.gs | implemented | No Impl suffix |
| ensureSeedMasterCode | ensureSeedTaskType | 95_TASK_SYSTEM_BOOTSTRAP.gs | implemented | Alias |
| ensureSeedUserDirectory | seedUserDirectory | 90_BOOTSTRAP_USER_SEED.gs | implemented | Optional |
| buildActiveSlicesSpec | buildActiveSlicesSpec | 95_TASK_SYSTEM_BOOTSTRAP.gs | implemented | No Impl suffix |
| buildEnumSpecReport | auditEnumConsistency / enumHealthCheck | 01_ENUM_AUDIT | implemented | |
| auditTaskModule | selfAuditTaskSystemFull / selfAuditTaskSystem | 95, 96 | implemented | |
| seedTaskDemo | seedGoldenDataset | 99_DEBUG_SAMPLE_DATA.gs | implemented | |
| testTaskWorkflowRules | runTaskSystemTests / runAllSystemTestsImpl | 97 | implemented | |
| testFieldPolicyReadiness | testFieldPolicyReadiness / runTaskSystemTests | 97 | implemented | |
| createSampleTaskRows | seedTaskDemo (wrapper) | - | implemented | Delegates |
| auditHoSoModule | runHoSoTests | 99_DEBUG_TEST_HOSO.gs | implemented | |
| seedHoSoDemo | seedGoldenDataset | 99_DEBUG_SAMPLE_DATA.gs | implemented | |
| testHoSoRelations | auditHoSoModule | - | implemented | Delegates |
| auditFinanceModule | runFinanceTests | 99_DEBUG_TEST_FINANCE.gs | implemented | |
| seedFinanceDemo | seedGoldenDataset | 99_DEBUG_SAMPLE_DATA.gs | implemented | |
| testFinanceDonViMapping | auditFinanceModule | - | implemented | Delegates |
| dumpAllSheetSchemas | getRequiredSheetNames, getSchemaHeaders | 90_BOOTSTRAP_SCHEMA.gs | implemented | |
| auditSchemaMismatch | selfAuditBootstrapImpl | 90_BOOTSTRAP_AUDIT.gs | implemented | |
| dumpSchemaProfileFull | dumpAllSheetSchemas | - | implemented | Delegates |
| repairTaskSystemSafely | repairTaskSystemSafelyImpl | 95_TASK_SYSTEM_BOOTSTRAP.gs | implemented | |
| repairSchemaSafely | repairSchemaColumns / repairSchemaAndData | 90_BOOTSTRAP_REPAIR.gs | implemented | |
| repairEnumSafely | runSafeRepair | 01_ENUM_SYNC_SERVICE.gs | implemented | |
| repairRefSafely | (informational) | - | placeholder | Uses repair toàn hệ thống |
| enforceFinalSchemaSafely | repairSchemaColumns / ensureAllSchemasImpl | - | implemented | |
| openSystemHealthLogSheet | openSheetByName_ | 90_BOOTSTRAP_MENU_HELPERS.gs | implemented | |
| openAdminAuditLogSheet | openSheetByName_ | 90_BOOTSTRAP_MENU_HELPERS.gs | implemented | |
| showMissingFunctionReport | - | 90_BOOTSTRAP_MENU_HELPERS.gs | implemented | |
| verifyMenuBindings | - | 90_BOOTSTRAP_MENU_HELPERS.gs | implemented | |
| showDailyAdminGuide | - | 90_BOOTSTRAP_MENU_HELPERS.gs | implemented | |

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
