/**
 * CBV PRO Admin Menu
 * Production-minded, modular, admin-first.
 * Dependencies: 90_BOOTSTRAP_MENU_HELPERS, 90_BOOTSTRAP_MENU_WRAPPERS
 *
 * Architecture: Final non-hybrid.
 * - USER_DIRECTORY = canonical user table
 * - DON_VI = only organization table
 * - MASTER_CODE = static/semi-static master data only
 *
 * Menu structure:
 * 1. Daily operations
 * 1b. Sheet — ẩn/hiện theo nhóm
 * 2. Bootstrap & init
 * 3. Audit & health
 * 4. Master data
 * 5. Tasks
 * 6. Records (HO_SO)
 * 7. Finance
 * 8. Schema tools
 * 9. Repair zone (dangerous)
 * 10. Developer / admin
 */

/**
 * Build the CBV PRO menu. Called from onOpen.
 */
function buildCbvProMenu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;

  var menu = ui.createMenu('CBV PRO');

  // 1. Daily operations
  menu.addSubMenu(
    ui.createMenu('Daily operations')
      .addItem('Run system health check', 'menuDailyHealthCheck')
      .addItem('Verify AppSheet readiness', 'menuVerifyAppSheetReadiness')
      .addItem('Open SYSTEM_HEALTH_LOG', 'menuOpenHealthLog')
      .addItem('Open ADMIN_AUDIT_LOG', 'menuOpenAuditLog')
      .addItem('Quick audit run', 'menuQuickAuditRun')
      .addItem('Daily admin guide', 'showDailyAdminGuide')
  );

  menu.addSubMenu(
    ui.createMenu('Sheet — ẩn/hiện theo nhóm')
      .addSubMenu(ui.createMenu('Master & dùng chung').addItem('Hiện các tab nhóm này', 'menuCbvSheetsShowCore').addItem('Ẩn các tab nhóm này', 'menuCbvSheetsHideCore'))
      .addSubMenu(ui.createMenu('ADMIN_AUDIT_LOG').addItem('Hiện', 'menuCbvSheetsShowAudit').addItem('Ẩn', 'menuCbvSheetsHideAudit'))
      .addSubMenu(ui.createMenu('SYSTEM_HEALTH_LOG').addItem('Hiện', 'menuCbvSheetsShowHealth').addItem('Ẩn', 'menuCbvSheetsHideHealth'))
      .addSubMenu(ui.createMenu('Hồ sơ (HO_SO)').addItem('Hiện', 'menuCbvSheetsShowHoso').addItem('Ẩn', 'menuCbvSheetsHideHoso'))
      .addSubMenu(ui.createMenu('Công việc (TASK)').addItem('Hiện', 'menuCbvSheetsShowTask').addItem('Ẩn', 'menuCbvSheetsHideTask'))
      .addSubMenu(ui.createMenu('Tài chính').addItem('Hiện', 'menuCbvSheetsShowFinance').addItem('Ẩn', 'menuCbvSheetsHideFinance'))
      .addSubMenu(ui.createMenu('Sự kiện & quy tắc').addItem('Hiện', 'menuCbvSheetsShowEventRule').addItem('Ẩn', 'menuCbvSheetsHideEventRule'))
  );

  // 2. Bootstrap & init
  menu.addSubMenu(
    ui.createMenu('Bootstrap & init')
      .addItem('Run full deployment', 'menuRunFullDeployment')
      .addItem('Ensure sheet schemas (headers)', 'menuEnsureSchemas')
      .addItem('Seed all reference data', 'menuSeedAllData')
      .addItem('Protect sensitive sheets', 'menuProtectSensitiveSheets')
      .addItem('Install time-based triggers', 'menuInstallTriggers')
      .addItem('Remove time-based triggers', 'menuRemoveTriggers')
      .addSeparator()
      .addItem('Install ALL CBV triggers (bootstrap + task + EVENT_QUEUE)', 'menuInstallAllCbvTriggers')
      .addItem('Remove ALL CBV triggers', 'menuRemoveAllCbvTriggers')
      .addItem('Reinstall ALL CBV triggers (remove then install)', 'menuReinstallAllCbvTriggers')
      .addSeparator()
      .addItem('Install onEdit trigger (tasks)', 'menuInstallOnEditTrigger')
      .addItem('Remove onEdit trigger (tasks)', 'menuUninstallOnEditTrigger')
      .addSeparator()
      .addItem('Process EVENT_QUEUE now (batch)', 'menuCoreEventQueueProcessNow')
      .addItem('Install EVENT_QUEUE trigger (every 5 min)', 'menuInstallCoreEventQueueTrigger')
      .addItem('Remove EVENT_QUEUE trigger', 'menuUninstallCoreEventQueueTrigger')
  );

  // 3. Audit & health
  menu.addSubMenu(
    ui.createMenu('Audit & health')
      .addItem('Self-audit (bootstrap)', 'menuSelfAuditBootstrap')
      .addItem('Verify AppSheet (full)', 'menuVerifyAppSheet')
      .addItem('Validate schema integrity', 'menuTestSchemaIntegrity')
      .addItem('Validate enums', 'menuValidateEnums')
      .addItem('Validate references', 'menuValidateRefs')
      .addItem('Validate DON_VI hierarchy', 'menuValidateDonViHierarchy')
      .addItem('Run all automated tests', 'menuRunAllTests')
      .addItem('Generate deployment report', 'menuGenerateDeploymentReport')
  );

  // 4. Master data
  menu.addSubMenu(
    ui.createMenu('Master data')
      .addItem('Seed ENUM_DICTIONARY', 'menuSeedEnumDictionary')
      .addItem('Seed DON_VI', 'menuSeedDonVi')
      .addItem('Seed MASTER_CODE', 'menuSeedMasterCode')
      .addItem('Seed USER_DIRECTORY', 'menuSeedUserDirectory')
      .addItem('Build slice specification', 'menuBuildSliceSpec')
      .addItem('Build enum specification report', 'menuBuildEnumSpecReport')
  );

  // 5. Tasks
  menu.addSubMenu(
    ui.createMenu('Tasks')
      .addItem('Audit task module', 'menuAuditTaskModule')
      .addItem('Seed task demo data', 'menuSeedTaskDemo')
      .addItem('Test task workflow', 'menuTestTaskWorkflow')
      .addItem('Test field policy', 'menuTestTaskFieldPolicy')
      .addItem('Create sample task rows', 'menuCreateSampleTaskRows')
  );

  // 6. Records (HO_SO)
  menu.addSubMenu(
    ui.createMenu('Records (HO_SO)')
      .addItem('Deploy HO_SO (bootstrap + seed + audit)', 'menuHosoFullDeploy')
      .addItem('Audit HO_SO module', 'menuAuditHoSo')
      .addItem('Seed HO_SO demo data', 'menuSeedHoSoDemo')
      .addItem('Test HO_SO relations', 'menuTestHoSoRelations')
      .addItem('Check HO_SO completeness', 'menuCheckHoSoCompleteness')
      .addItem('Expiring documents (60 days)', 'menuGetExpiringDocs')
      .addItem('Generate HO_SO report', 'menuGenerateHoSoReport')
  );

  // 7. Finance
  menu.addSubMenu(
    ui.createMenu('Finance')
      .addItem('Audit finance module', 'menuAuditFinance')
      .addItem('Export kỳ → Sheet trên Drive', 'menuExportFinancePeriodToDrive')
      .addItem('Seed finance demo data', 'menuSeedFinanceDemo')
      .addItem('Test DON_VI mapping', 'menuTestFinanceDonViMapping')
  );

  // 8. Schema tools
  menu.addSubMenu(
    ui.createMenu('Schema tools')
      .addItem('Dump all sheet schemas', 'menuDumpAllSheetSchemas')
      .addItem('Audit schema vs manifest', 'menuAuditSchemaMismatch')
      .addItem('Dump full schema profile', 'menuDumpFullSchemaProfile')
  );

  // 8b. Data sync (plan on DATA_SYNC_CONTROL — see 46_DATA_SYNC_PLAN_SHEET.js; form: 45_DATA_SYNC_BUILDER.js)
  menu.addSubMenu(
    ui.createMenu('Data sync')
      .addItem('Ensure builder sheet (template) + open', 'menuDataSyncEnsureBuilderAndOpen')
      .addItem('Ensure paste labels (form hàng 5–9)', 'menuDataSyncEnsurePasteArea')
      .addItem('Fill header rows 7/9 from B6·D6 & B8·D8 (open sheets)', 'menuDataSyncFillHeadersFromLinkedSheets')
      .addItem('Import jobs (two paste columns) → job table', 'menuDataSyncImportFromPaste')
      .addItem('Auto column maps (match headers)', 'menuDataSyncAutoColumnMaps')
      .addItem('Dropdown from/to (column map)', 'menuDataSyncMapDropdowns')
      .addItem('Pipeline: import + maps + dropdowns', 'menuDataSyncPastePipeline')
      .addItem('Generate plan JSON → CONTROL A2', 'menuDataSyncGeneratePlanToA2')
      .addSeparator()
      .addItem('Ensure control sheet + open', 'menuDataSyncEnsureAndOpen')
      .addItem('Validate plan (A2)', 'menuDataSyncValidatePlanFromSheet')
      .addItem('Build report (read-only; F2 = resume chunk)', 'menuDataSyncBuildReportFromSheet')
      .addItem('Clear continuation token (F2)', 'menuDataSyncClearContinuationFromSheet')
      .addItem('Run apply (writes target…)', 'menuDataSyncRunApplyFromSheet')
      .addItem('Run apply — one job (prompt job_id)…', 'menuDataSyncRunApplyOneJobFromSheet')
  );

  // 9. Repair zone
  menu.addSubMenu(
    ui.createMenu('Repair zone')
      .addItem('Repair whole system (safe)', 'menuRepairWholeSystemSafely')
      .addItem('Repair schema columns', 'menuRepairSchemaSafely')
      .addItem('Repair enums', 'menuRepairEnumSafely')
      .addItem('Repair references (info)', 'menuRepairRefSafely')
      .addItem('Enforce final schema', 'menuEnforceFinalSchemaSafely')
  );

  // 10. Developer / admin
  menu.addSubMenu(
    ui.createMenu('Developer / admin')
      .addItem('Open SYSTEM_HEALTH_LOG', 'menuOpenSystemHealthLog')
      .addItem('Open ADMIN_AUDIT_LOG', 'menuOpenAdminAuditLog')
      .addItem('Show missing Impl report', 'showMissingFunctionReport')
      .addItem('Verify menu bindings', 'verifyMenuBindings')
      .addItem('Admin guide', 'showDailyAdminGuide')
  );

  menu.addToUi();

  try {
    ui.createMenu('MAIN Event Bridge')
      .addItem('Setup Main Event URL', 'menuMainEventBridgeSetupUrl')
      .addItem('Test Send TASK Event', 'menuMainEventBridgeTestTask')
      .addItem('Test Send FINANCE Event', 'menuMainEventBridgeTestFinance')
      .addItem('Test Send HO_SO Event', 'menuMainEventBridgeTestHoSo')
      .addItem('Check Config', 'menuMainEventBridgeCheckConfig')
      .addToUi();
  } catch (e) {
    Logger.log('[buildCbvProMenu_] MAIN Event Bridge: ' + (e && e.message ? e.message : e));
  }
}

/**
 * onOpen trigger. Installs CBV PRO menu. Idempotent (menu recreated each open).
 */
function onOpen() {
  buildCbvProMenu_();
  try {
    CBV_CoreV2_menuBootstrap();
  } catch (e) {
    Logger.log('[onOpen] CBV Core V2 menu: ' + (e && e.message ? e.message : e));
  }
  try {
    buildHoSoV2Menu_();
  } catch (e) {
    Logger.log('[onOpen] HO_SO V2 menu: ' + (e && e.message ? e.message : e));
  }
  try {
    buildCbvLevel6Menu_();
  } catch (e) {
    Logger.log('[onOpen] CBV Level 6 menu: ' + (e && e.message ? e.message : e));
  }
  try {
    buildHosoV22SetupMenu_();
  } catch (e) {
    Logger.log('[onOpen] HOSO V2.2 Setup menu: ' + (e && e.message ? e.message : e));
  }
}
