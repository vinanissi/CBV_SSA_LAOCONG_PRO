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

  // 2. Bootstrap & init
  menu.addSubMenu(
    ui.createMenu('Bootstrap & init')
      .addItem('Run full deployment', 'menuRunFullDeployment')
      .addItem('Ensure sheet schemas (headers)', 'menuEnsureSchemas')
      .addItem('Seed all reference data', 'menuSeedAllData')
      .addItem('Protect sensitive sheets', 'menuProtectSensitiveSheets')
      .addItem('Install time-based triggers', 'menuInstallTriggers')
      .addItem('Remove time-based triggers', 'menuRemoveTriggers')
      .addItem('Install onEdit trigger (tasks)', 'menuInstallOnEditTrigger')
      .addItem('Remove onEdit trigger (tasks)', 'menuUninstallOnEditTrigger')
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
}

/**
 * CBV Test Console — isolated from business menu (HOME_ALERT runtime QA).
 */
function buildCbvTestConsoleMenu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;
  ui.createMenu('🧪 CBV Test Console')
    .addSubMenu(
      ui.createMenu('Phase 85 — UI Contract')
        .addItem('Bootstrap UI Contract', 'menuCbvTestConsoleUiContract85_bootstrap')
        .addItem('Run UI Contract Health Check', 'menuCbvTestConsoleUiContract85_health')
        .addItem('Validate UI Contract', 'menuCbvTestConsoleUiContract85_validate')
        .addItem('Generate Pilot Matrix', 'menuCbvTestConsoleUiContract85_pilotMatrix')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleUiContract85_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleUiContract85_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 86 — Pilot Binding')
        .addItem('Run Pilot Binding Health Check', 'menuCbvTestConsoleUiPilot86_health')
        .addItem('Show AppSheet Binding Plan', 'menuCbvTestConsoleUiPilot86_appsheetPlan')
        .addItem('Show WebApp Route Plan', 'menuCbvTestConsoleUiPilot86_webappPlan')
        .addItem('Show Pilot Checklist', 'menuCbvTestConsoleUiPilot86_checklist')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleUiPilot86_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleUiPilot86_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 87 — AppSheet Pilot Setup')
        .addItem('Run AppSheet Pilot Setup Health Check', 'menuCbvTestConsoleAppSheetPilot87_health')
        .addItem('Show View Setup Matrix', 'menuCbvTestConsoleAppSheetPilot87_views')
        .addItem('Show Slice Setup Matrix', 'menuCbvTestConsoleAppSheetPilot87_slices')
        .addItem('Show Manual Actions Matrix', 'menuCbvTestConsoleAppSheetPilot87_actions')
        .addItem('Show Security Filter Matrix', 'menuCbvTestConsoleAppSheetPilot87_security')
        .addItem('Show UAT Script', 'menuCbvTestConsoleAppSheetPilot87_uat')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleAppSheetPilot87_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleAppSheetPilot87_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 88 — FE Architecture')
        .addItem('Run FE Architecture Health Check', 'menuCbvTestConsoleFeArch88_run')
        .addItem('Show FE Ownership Matrix', 'menuCbvTestConsoleFeArch88_matrix')
        .addItem('Show Architecture Decision', 'menuCbvTestConsoleFeArch88_decision')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleFeArch88_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleFeArch88_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 89 — WebApp Workspace')
        .addItem('Run WebApp Workspace Health Check', 'menuCbvTestConsoleWebAppWs89_run')
        .addItem('Show Route Registry', 'menuCbvTestConsoleWebAppWs89_routes')
        .addItem('Show Home Summary', 'menuCbvTestConsoleWebAppWs89_home')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleWebAppWs89_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleWebAppWs89_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 90 — WebApp Pilot Pages')
        .addItem('Run WebApp Pilot Pages Health Check', 'menuCbvTestConsoleWebAppPilot90_run')
        .addItem('Show Home Dashboard Data', 'menuCbvTestConsoleWebAppPilot90_home')
        .addItem('Show Queue Cards Data', 'menuCbvTestConsoleWebAppPilot90_queue')
        .addItem('Show SLA Widgets Data', 'menuCbvTestConsoleWebAppPilot90_sla')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleWebAppPilot90_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleWebAppPilot90_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 91 — Timeline / Kanban')
        .addItem('Run Timeline/Kanban Health Check', 'menuCbvTestConsoleWebAppTlk91_run')
        .addItem('Show Timeline Data', 'menuCbvTestConsoleWebAppTlk91_timeline')
        .addItem('Show Kanban Data', 'menuCbvTestConsoleWebAppTlk91_kanban')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleWebAppTlk91_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleWebAppTlk91_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 92 — Observability')
        .addItem('Run Observability Health Check', 'menuCbvTestConsoleWebAppObs92_run')
        .addItem('Show Runtime Health Data', 'menuCbvTestConsoleWebAppObs92_runtimeHealth')
        .addItem('Show Recent Reports', 'menuCbvTestConsoleWebAppObs92_recentReports')
        .addItem('Show Trace Summary', 'menuCbvTestConsoleWebAppObs92_traceSummary')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleWebAppObs92_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleWebAppObs92_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 93 — Admin Reference')
        .addItem('Run Admin Reference Health Check', 'menuCbvTestConsoleWebAppAdminRef93_run')
        .addItem('Show Governance Summary', 'menuCbvTestConsoleWebAppAdminRef93_governance')
        .addItem('Show Enum Summary', 'menuCbvTestConsoleWebAppAdminRef93_enum')
        .addItem('Show User/Role Summary', 'menuCbvTestConsoleWebAppAdminRef93_userRole')
        .addItem('Show UI Contract Summary', 'menuCbvTestConsoleWebAppAdminRef93_uiContract')
        .addItem('Show Route Registry Summary', 'menuCbvTestConsoleWebAppAdminRef93_routeRegistry')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleWebAppAdminRef93_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleWebAppAdminRef93_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 94 — UI Freeze / UAT')
        .addItem('Run UI Freeze Health Check', 'menuCbvTestConsoleWebAppUiFreeze94_run')
        .addItem('Show Route Freeze Matrix', 'menuCbvTestConsoleWebAppUiFreeze94_routeMatrix')
        .addItem('Show UI Standard', 'menuCbvTestConsoleWebAppUiFreeze94_uiStandard')
        .addItem('Show UAT Checklist', 'menuCbvTestConsoleWebAppUiFreeze94_uatChecklist')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleWebAppUiFreeze94_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleWebAppUiFreeze94_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 95 — Pilot UAT')
        .addItem('Run Pilot UAT Readiness Check', 'menuCbvTestConsoleWebAppUat95_run')
        .addItem('Show Pilot Scope', 'menuCbvTestConsoleWebAppUat95_pilotScope')
        .addItem('Show Admin UAT Script', 'menuCbvTestConsoleWebAppUat95_adminScript')
        .addItem('Show Supervisor UAT Script', 'menuCbvTestConsoleWebAppUat95_supervisorScript')
        .addItem('Show Operator UAT Script', 'menuCbvTestConsoleWebAppUat95_operatorScript')
        .addItem('Show Feedback Schema', 'menuCbvTestConsoleWebAppUat95_feedbackSchema')
        .addItem('Show Go/No-Go Criteria', 'menuCbvTestConsoleWebAppUat95_goNoGo')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleWebAppUat95_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleWebAppUat95_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 96 — Vietnamese UX')
        .addItem('Run Vietnamese UX Health Check', 'menuCbvTestConsoleWebAppVi96_run')
        .addItem('Show Label Dictionary', 'menuCbvTestConsoleWebAppVi96_labels')
        .addItem('Show Route Links', 'menuCbvTestConsoleWebAppVi96_links')
        .addItem('Show Operator Guide', 'menuCbvTestConsoleWebAppVi96_operator')
        .addItem('Show Supervisor Guide', 'menuCbvTestConsoleWebAppVi96_supervisor')
        .addItem('Show Admin Guide', 'menuCbvTestConsoleWebAppVi96_admin')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleWebAppVi96_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleWebAppVi96_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 96.1 — Route URL Fix')
        .addItem('Run Route URL Health Check', 'menuCbvTestConsoleWebAppRoute961_run')
        .addItem('Show Route URL Map', 'menuCbvTestConsoleWebAppRoute961_map')
        .addItem('Show Vietnamese Nav Items', 'menuCbvTestConsoleWebAppRoute961_nav')
        .addItem('Show Link Audit Checklist', 'menuCbvTestConsoleWebAppRoute961_checklist')
        .addItem('Show AI Handoff Prompt', 'menuCbvTestConsoleWebAppRoute961_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleWebAppRoute961_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 97 — Staff Trial')
        .addItem('Run Staff Trial Health Check', 'menuCbvTestConsoleWebAppStaff97_run')
        .addItem('Show Runbook', 'menuCbvTestConsoleWebAppStaff97_runbook')
        .addItem('Show Feedback Schema', 'menuCbvTestConsoleWebAppStaff97_schema')
        .addItem('Show Triage Matrix', 'menuCbvTestConsoleWebAppStaff97_triage')
        .addItem('Copy AI Handoff Prompt', 'menuCbvTestConsoleWebAppStaff97_handoff')
        .addItem('Copy Latest Report', 'menuCbvTestConsoleWebAppStaff97_copyReport')
    )
    .addSubMenu(
      ui.createMenu('Phase 97.1 — Drive Report Export')
        .addItem('Run Drive Export Health Check', 'menuCbvTestConsoleDrive971_run')
        .addItem('Export Latest Phase 97 Report to Drive', 'menuCbvTestConsoleDrive971_exportP97')
        .addItem('Copy Latest Drive Export Result', 'menuCbvTestConsoleDrive971_copyResult')
    )
    .addSubMenu(
      ui.createMenu('Phase 97.2 — Artifact Registry')
        .addItem('Run Artifact Registry Health Check', 'menuCbvTestConsoleArtifact972_run')
        .addItem('Show Recent Artifacts', 'menuCbvTestConsoleArtifact972_recent')
        .addItem('Find Artifact By TraceId', 'menuCbvTestConsoleArtifact972_byTrace')
        .addItem('Copy Latest Artifact Registry Report', 'menuCbvTestConsoleArtifact972_copyReport')
        .addItem('Copy AI Handoff Prompt', 'menuCbvTestConsoleArtifact972_handoff')
    )
    .addItem('Run Milestone 01 Full Operational Workspace Test', 'menuCbvTestConsoleMilestone01_runFull')
    .addItem('Copy Milestone 01 Latest Test Report', 'menuCbvTestConsoleMilestone01_copyReport')
    .addItem('Run Milestone 02 Staff Workspace Test', 'menuCbvTestConsoleMilestone02_runFull')
    .addItem('Copy Milestone 02 Latest Test Report', 'menuCbvTestConsoleMilestone02_copyReport')
    .addItem('Run Milestone 03 Daily Operation Flow Test', 'menuCbvTestConsoleMilestone03_runFull')
    .addItem('Copy Milestone 03 Latest Test Report', 'menuCbvTestConsoleMilestone03_copyReport')
    .addItem('HOME_ALERT Phase 82 — SLA & Escalation', 'menuCbvTestConsoleHomeAlertSla82')
    .addItem('HOME_ALERT Phase 83 — SLA Policy Registry', 'menuCbvTestConsoleHomeAlertSla83')
    .addItem('HOME_ALERT Phase 84 — Safe Automation Runtime', 'menuCbvTestConsoleHomeAlertSafeAutomation84')
    .addItem('REF-A — Operational Reference Layer', 'menuCbvTestConsoleOperationalReferenceRefA')
    .addToUi();
}

/**
 * onOpen trigger. Installs CBV PRO menu. Idempotent (menu recreated each open).
 */
function onOpen() {
  buildCbvProMenu_();
  buildCbvTestConsoleMenu_();
}
