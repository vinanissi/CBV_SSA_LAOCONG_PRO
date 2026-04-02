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
 * 1. Daily Admin Flow (most important, top)
 * 2. Bootstrap & Init
 * 3. Audit & Health
 * 4. Master Data
 * 5. Task Module
 * 6. Hồ sơ Module
 * 7. Tài chính Module
 * 8. Schema Tools
 * 9. Repair Zone (dangerous, separated)
 * 10. Dev / Admin
 */

/**
 * Build the CBV PRO menu. Called from onOpen.
 */
function buildCbvProMenu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;

  var menu = ui.createMenu('🚀 CBV PRO');

  // 1. Daily Admin Flow - most important
  menu.addSubMenu(
    ui.createMenu('📅 Daily Admin Flow')
      .addItem('✔ Kiểm tra sức khỏe', 'menuDailyHealthCheck')
      .addItem('✔ Xác minh AppSheet', 'menuVerifyAppSheetReadiness')
      .addItem('📄 Mở SYSTEM_HEALTH_LOG', 'menuOpenHealthLog')
      .addItem('📄 Mở ADMIN_AUDIT_LOG', 'menuOpenAuditLog')
      .addItem('🔎 Chạy Audit nhanh', 'menuQuickAuditRun')
      .addItem('📖 Hướng dẫn Admin hàng ngày', 'showDailyAdminGuide')
  );

  // 2. Bootstrap & Init
  menu.addSubMenu(
    ui.createMenu('🏗️ Bootstrap & Init')
      .addItem('▶ Triển khai đầy đủ', 'menuRunFullDeployment')
      .addItem('📐 Đảm bảo schema', 'menuEnsureSchemas')
      .addItem('🌱 Gieo tất cả dữ liệu', 'menuSeedAllData')
      .addItem('🔒 Bảo vệ sheet nhạy cảm', 'menuProtectSensitiveSheets')
      .addItem('⏰ Cài đặt Triggers', 'menuInstallTriggers')
      .addItem('⏹ Gỡ Triggers', 'menuRemoveTriggers')
  );

  // 3. Audit & Health
  menu.addSubMenu(
    ui.createMenu('🔎 Audit & Health')
      .addItem('🩺 Self Audit', 'menuSelfAuditBootstrap')
      .addItem('✅ Xác minh AppSheet', 'menuVerifyAppSheet')
      .addItem('📐 Kiểm tra Schema', 'menuTestSchemaIntegrity')
      .addItem('📊 Kiểm tra Enum', 'menuValidateEnums')
      .addItem('🔗 Kiểm tra Ref', 'menuValidateRefs')
      .addItem('🏢 Kiểm tra DON_VI', 'menuValidateDonViHierarchy')
      .addItem('🧪 Chạy tất cả test', 'menuRunAllTests')
      .addItem('📋 Báo cáo triển khai', 'menuGenerateDeploymentReport')
  );

  // 4. Master Data
  menu.addSubMenu(
    ui.createMenu('🗂️ Master Data')
      .addItem('📊 Gieo ENUM_DICTIONARY', 'menuSeedEnumDictionary')
      .addItem('🏢 Gieo DON_VI', 'menuSeedDonVi')
      .addItem('📑 Gieo MASTER_CODE', 'menuSeedMasterCode')
      .addItem('👤 Gieo USER_DIRECTORY', 'menuSeedUserDirectory')
      .addItem('📋 Xây Slice Spec', 'menuBuildSliceSpec')
      .addItem('📋 Báo cáo Enum', 'menuBuildEnumSpecReport')
  );

  // 5. Task Module
  menu.addSubMenu(
    ui.createMenu('✅ Task Module')
      .addItem('🔎 Audit Task', 'menuAuditTaskModule')
      .addItem('🌱 Gieo Task Demo', 'menuSeedTaskDemo')
      .addItem('🧪 Test Task Workflow', 'menuTestTaskWorkflow')
      .addItem('📋 Test Field Policy', 'menuTestTaskFieldPolicy')
      .addItem('➕ Tạo mẫu Task', 'menuCreateSampleTaskRows')
  );

  // 6. Hồ sơ Module
  menu.addSubMenu(
    ui.createMenu('📁 Hồ sơ Module')
      .addItem('▶ Triển khai HO_SO (bootstrap+seed+audit+smoke)', 'menuHosoFullDeploy')
      .addItem('🔎 Audit Hồ sơ', 'menuAuditHoSo')
      .addItem('🌱 Gieo Hồ sơ Demo', 'menuSeedHoSoDemo')
      .addItem('🧪 Test Quan hệ Hồ sơ', 'menuTestHoSoRelations')
      .addItem('🔍 Kiểm tra hồ sơ đầy đủ', 'menuCheckHoSoCompleteness')
      .addItem('⏰ Giấy tờ sắp hết hạn (60 ngày)', 'menuGetExpiringDocs')
      .addItem('📋 Xuất báo cáo hồ sơ', 'menuGenerateHoSoReport')
  );

  // 7. Tài chính Module
  menu.addSubMenu(
    ui.createMenu('💰 Tài chính Module')
      .addItem('🔎 Audit Tài chính', 'menuAuditFinance')
      .addItem('🌱 Gieo Tài chính Demo', 'menuSeedFinanceDemo')
      .addItem('🧪 Test DON_VI mapping', 'menuTestFinanceDonViMapping')
  );

  // 8. Schema Tools
  menu.addSubMenu(
    ui.createMenu('🧰 Schema Tools')
      .addItem('📋 Dump tất cả Schema', 'menuDumpAllSheetSchemas')
      .addItem('⚠ Kiểm tra lệch Schema', 'menuAuditSchemaMismatch')
      .addItem('📋 Schema Profile đầy đủ', 'menuDumpFullSchemaProfile')
  );

  // 9. Repair Zone - dangerous, clearly separated
  menu.addSubMenu(
    ui.createMenu('🛠️ Repair Zone')
      .addItem('⚠ Sửa toàn hệ thống', 'menuRepairWholeSystemSafely')
      .addItem('⚠ Sửa Schema', 'menuRepairSchemaSafely')
      .addItem('⚠ Sửa Enum', 'menuRepairEnumSafely')
      .addItem('⚠ Sửa Ref', 'menuRepairRefSafely')
      .addItem('⚠ Áp dụng Schema cuối', 'menuEnforceFinalSchemaSafely')
  );

  // 10. Dev / Admin
  menu.addSubMenu(
    ui.createMenu('⚙️ Dev / Admin')
      .addItem('📄 Mở SYSTEM_HEALTH_LOG', 'menuOpenSystemHealthLog')
      .addItem('📄 Mở ADMIN_AUDIT_LOG', 'menuOpenAdminAuditLog')
      .addItem('🔍 Báo cáo hàm thiếu', 'showMissingFunctionReport')
      .addItem('🔗 Kiểm tra Menu', 'verifyMenuBindings')
      .addItem('📖 Hướng dẫn Admin', 'showDailyAdminGuide')
  );

  menu.addToUi();
}

/**
 * onOpen trigger. Installs CBV PRO menu. Idempotent (menu recreated each open).
 */
function onOpen() {
  buildCbvProMenu_();
}
