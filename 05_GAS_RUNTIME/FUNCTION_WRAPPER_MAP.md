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
| hosoRunTests | runHosoTestsImpl | 10_HOSO_WRAPPERS.js → 10_HOSO_TEST.js | canonical | Phase A |
| hosoRunSmokeTest | runHosoSmokeTestImpl | 10_HOSO_WRAPPERS.js → 10_HOSO_TEST.js | canonical | Phase A |
| hosoAudit | auditHoso*, auditHosoHtxIntegrity | 10_HOSO_WRAPPERS.js → 10_HOSO_AUDIT_REPAIR.js | canonical | Phase A; includes HTX integrity |
| hosoSeedDemo | seedHosoDemoData_ | 10_HOSO_WRAPPERS.js → 10_HOSO_SEED.js | canonical | Phase A |
| hosoFullDeploy | hosoFullDeployImpl | 10_HOSO_WRAPPERS.js → 10_HOSO_BOOTSTRAP.js | canonical | opts.includeMigration default = false |
| runHoSoTests / runHosoTests | hosoRunTests | 10_HOSO_WRAPPERS.js | deprecated | Remove in Phase C |
| auditHoSoModule | hosoAudit | 10_HOSO_WRAPPERS.js | deprecated | Remove in Phase C |
| seedHoSoDemo | hosoSeedDemo | 10_HOSO_WRAPPERS.js | deprecated | Remove in Phase C |
| runHosoFullDeployment / hosoRunFullDeploymentMenu | hosoFullDeploy({includeMigration:false}) | 10_HOSO_WRAPPERS.js | deprecated | Remove in Phase C |
| testHoSoRelations | hosoAudit | 10_HOSO_WRAPPERS.js | legacy menu | Keep (menu binding) |
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

## HO_SO Module — Canonical Service API (Phases A + B + C done, 2026-04-21)

All code MUST call the canonical `hoso*` names. Phase C **deleted** every deprecated alias — any call to a legacy name now throws `ReferenceError`. The table below is retained as a lookup for historical diffs and to keep `auditHosoCanonicalOnly_()`'s blocklist in sync.

### HO_SO removed aliases (enforced by `auditHosoCanonicalOnly_()`)

| Canonical (only surface that exists) | Removed legacy aliases (Phase C) |
|-----------|-----------------------------------------------|
| `hosoCreate(data)` | `createHoSo`, `createHoso` |
| `hosoUpdate(id, patch)` | `updateHoso` |
| `hosoSetStatus(id, newStatus, note?)` | `changeHosoStatus`, `setHoSoStatus`, `closeHoso(id,note)` → `hosoSetStatus(id,'CLOSED',note)` |
| `hosoSoftDelete(id, note?)` | `softDeleteHoso` |
| `hosoFileAdd(data)` | `addHosoFile`, `attachHoSoFile` (merged) |
| `hosoFileRemove(fileId, note?)` | `removeHosoFile` |
| `hosoRelationAdd(data)` | `addHosoRelation`, `createHoSoRelation` (merged) |
| `hosoRelationRemove(relationId, note?)` | `removeHosoRelation` |
| `hosoGetById(id)` | `getHosoById` |
| `hosoListFiles(hosoId)` | `getHosoFiles` |
| `hosoListRelations(hosoId)` | `getHosoRelations` |
| `hosoListLogs(hosoId)` | `getHosoLogs` |
| `hosoQueryExpiring(days)` | `getExpiringHoso` |
| `hosoQueryExpired()` | `getExpiredHoso` |
| `hosoQueryExpiringDocs(daysAhead)` | `getExpiringDocs` |
| `hosoCheckCompleteness(id)` | `checkHoSoCompleteness` |
| `hosoGenerateReport(id)` | `generateHoSoReport` |

### Wrapper entry aliases removed in Phase C

| Canonical | Removed wrapper-layer aliases |
|-----------|-------------------------------|
| `hosoRunTests(opts?)` | `runHosoTests`, `runHoSoTests` |
| `hosoRunSmokeTest()` | `runHosoSmokeTest` |
| `hosoAudit()` | `hosoRunAudit`, `hosoRunAuditImpl`, `auditHoSoModule`, `auditHoSoModuleImpl` |
| `hosoSeedDemo()` | `seedHoSoDemo`, `seedHoSoDemoImpl` |
| `hosoFullDeploy({includeMigration:false})` | `hosoRunFullDeploymentMenu`, `hosoRunFullDeploymentMenuImpl`, `runHosoFullDeployment` |
| `hosoAuditLoaded_(name)` | `_hosoLoaded` |

### Migration plan

- **Phase A (done, 2026-04-21)** — canonical added, legacy kept as wrappers, events wired, gateway cleaned. No caller changes required.
- **Phase B (done, 2026-04-21)** — all internal call sites migrated to canonical names across `60_HOSO_API_GATEWAY.js` (`_api_createHoSo_`, `_api_updateHoSo_`), `99_APPSHEET_WEBHOOK.js` (3 HO_SO pending handlers), `10_HOSO_SEED.js` (2 seed helpers), `99_DEBUG_TEST_RUNNER.js` (`runAllModuleTests`), `03_SHARED_PENDING_FEEDBACK.js` (`PENDING_ADAPTER_HOSO.findById`). Legacy wrappers remain intact for external callers.
- **Phase C (done, 2026-04-21)** — deprecated wrappers deleted from `10_HOSO_SERVICE.js`, `10_HOSO_WRAPPERS.js`, `10_HOSO_AUDIT_REPAIR.js`. Residual call sites fixed in `10_HOSO_MENU.js` (3) and `90_BOOTSTRAP_MENU_HELPERS.js` (registry). New runtime gate `auditHosoCanonicalOnly_()` emits HIGH finding `HOSO_LEGACY_ALIAS_REDECLARED` if any removed identifier is re-introduced; wired into both `hosoAudit()` and `runHosoSmokeTestImpl` (smoke step `auditHosoCanonicalOnly_`).
- **Phase D (done, 2026-04-21)** — RULE_DEF is now authoritative: `hosoSeedCoreRules_()` upserts 9 canonical rules (one per HO_SO event), the pluggable `INVOKE_SERVICE` action dispatches module logic through a typed allowlist (`04_CORE_ACTION_REGISTRY.js`), and coverage audit `auditHosoRuleDefCoverage_()` fails loud if any event lacks an enabled rule or references an unregistered handler. See `CHANGELOG.md` "HO_SO Phase D" for the rule/handler table and migration notes.

### CI / pre-commit grep gate (copy into repo hook)

```bash
rg -n "\b(createHoSo|createHoso|updateHoso|changeHosoStatus|setHoSoStatus|closeHoso|softDeleteHoso|addHosoFile|attachHoSoFile|removeHosoFile|addHosoRelation|createHoSoRelation|removeHosoRelation|getHosoById|getHosoFiles|getHosoRelations|getHosoLogs|getExpiringHoso|getExpiredHoso|checkHoSoCompleteness|getExpiringDocs|generateHoSoReport|runHoSoTests|runHosoTests|runHosoSmokeTest|hosoRunAudit|hosoRunAuditImpl|auditHoSoModule|auditHoSoModuleImpl|seedHoSoDemo|seedHoSoDemoImpl|hosoRunFullDeploymentMenu|hosoRunFullDeploymentMenuImpl|runHosoFullDeployment|_hosoLoaded)\s*\(" 05_GAS_RUNTIME/ --glob '*.js'
```

Exit code MUST be `1` (no matches). Any match blocks the build.
