/**
 * CBV PRO Menu - Safe Wrappers
 * All menu items bind to wrapper names. Wrappers delegate to *Impl
 * and show friendly alerts when impl is missing or errors.
 * Dependencies: 90_BOOTSTRAP_MENU_HELPERS (callIfExists_, runSafeMenuStep_, openSheetByName_)
 */

// ==================== REQUIRED WRAPPER SET (menu bindings use these names) ====================

function runFullDeployment() {
  var r = callIfExists_('runFullDeploymentImpl', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'runFullDeploymentImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  var msg = 'Triển khai: ' + (r.verdict || 'N/A') + (r.report && r.report.summary ? '\n' + JSON.stringify(r.report.summary, null, 2) : '');
  if (r.mustFix && r.mustFix.length > 0) {
    msg += '\n\nCần sửa (' + r.mustFix.length + '):\n' + r.mustFix.slice(0, 8).join('\n');
    if (r.mustFix.length > 8) msg += '\n... +' + (r.mustFix.length - 8) + ' nữa';
  }
  SpreadsheetApp.getUi().alert('Triển khai đầy đủ', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function ensureAllSchemas() {
  var r = callIfExists_('ensureAllSchemasImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'ensureAllSchemasImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Đảm bảo schema', r && r.ok ? 'Schema OK' : (r ? JSON.stringify(r) : 'Xong'), SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function seedAllData() {
  var r = callIfExists_('seedAllDataImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'seedAllDataImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  var msg = r ? ('DON_VI: ' + (r.donVi || 0) + ', USER: ' + (r.user || 0) + ', ENUM: ' + (r.enum || 0) + ', MC: ' + (r.masterCode || 0)) : 'Xong';
  SpreadsheetApp.getUi().alert('Gieo dữ liệu', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function installTriggers() {
  var r = callIfExists_('installTriggersImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'installTriggersImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Cài đặt Triggers', r.ok ? 'Đã cài đặt' : (r.message || JSON.stringify(r)), SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function removeCbvTriggers() {
  var n = callIfExists_('removeCbvTriggersImpl');
  if (n == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'removeCbvTriggersImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Đã gỡ Triggers', 'Đã gỡ ' + (typeof n === 'number' ? n : 0) + ' CBV trigger(s).', SpreadsheetApp.getUi().ButtonSet.OK);
  return n;
}

function selfAuditBootstrap(opts) {
  var o = opts || {};
  var r = callIfExists_('selfAuditBootstrapImpl', o);
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'selfAuditBootstrapImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function verifyAppSheetReadiness() {
  var r = callIfExists_('verifyAppSheetReadinessImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'verifyAppSheetReadinessImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function testSchemaIntegrity() {
  var r = callIfExists_('testSchemaIntegrity') || callIfExists_('auditSystem');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'testSchemaIntegrity chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function validateAllEnums() {
  var r = callIfExists_('validateAllEnumsImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'validateAllEnumsImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function validateAllRefs() {
  var r = callIfExists_('validateAllRefsImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'validateAllRefsImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function validateDonViHierarchy() {
  var r = callIfExists_('validateDonViHierarchyImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'validateDonViHierarchyImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function runAllSystemTests() {
  var r = callIfExists_('runAllSystemTestsImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'runAllSystemTestsImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function generateDeploymentReport(report) {
  if (report && typeof report === 'object' && (report.runId !== undefined || report.verdict !== undefined)) {
    return (typeof generateDeploymentReportImpl === 'function' ? generateDeploymentReportImpl : function() {})(report);
  }
  var r = callIfExists_('runFullDeploymentImpl', { dryRun: false });
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'runFullDeploymentImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Báo cáo triển khai', 'Verdict: ' + r.verdict + '\nĐã ghi ADMIN_AUDIT_LOG.', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function ensureSeedEnumDictionary() {
  var r = callIfExists_('seedEnumDictionary') || callIfExists_('ensureSeedEnumDictionary');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'seedEnumDictionary chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Gieo ENUM_DICTIONARY', r && r.data ? ('Đã thêm: ' + (r.data.inserted || 0)) : 'Xong', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function ensureSeedDonVi() {
  var r = callIfExists_('ensureSeedDonVi');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'ensureSeedDonVi chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Gieo DON_VI', r ? ('Đã thêm: ' + (r.inserted || 0) + ' hàng') : 'Xong', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function ensureSeedMasterCode() {
  var r = callIfExists_('ensureSeedTaskType') || callIfExists_('ensureSeedMasterCode');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'ensureSeedTaskType chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Gieo MASTER_CODE', r ? ('Đã thêm: ' + (r.inserted || 0) + ' hàng') : 'Xong', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function ensureSeedUserDirectory() {
  var res = callIfExists_('ensureSeedUserDirectoryImpl') || callIfExists_('seedUserDirectory');
  if (res == null && !_menuFnExists_('seedUserDirectory')) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'ensureSeedUserDirectoryImpl / seedUserDirectory chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Gieo USER_DIRECTORY', res ? ('Đã thêm: ' + (res.inserted || res.added || 0)) : 'Xong', SpreadsheetApp.getUi().ButtonSet.OK);
  return res;
}

function buildActiveSlicesSpec() {
  return callIfExists_('buildActiveSlicesSpec') || null;
}

function buildEnumSpecReport() {
  var r = callIfExists_('auditEnumConsistency') || callIfExists_('enumHealthCheck', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'auditEnumConsistency / enumHealthCheck chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Báo cáo Enum', (r.status || (r.ok ? 'OK' : 'Có vấn đề')) + (r.summary ? '\n' + JSON.stringify(r.summary) : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function auditTaskModule() {
  var r = callIfExists_('selfAuditTaskSystemFull') || callIfExists_('selfAuditTaskSystem');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'selfAuditTaskSystem chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  var msg = (r.ok ? 'OK' : 'Có vấn đề') + (r.findings && r.findings.length ? '\n\n' + r.findings.slice(0, 5).map(function(f) { return f.message || f.code; }).join('\n') : '');
  SpreadsheetApp.getUi().alert('Audit Task', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function seedTaskDemo() {
  var r = callIfExists_('seedGoldenDataset', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'seedGoldenDataset chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Gieo Task Demo', r.message || 'Xong', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function testTaskWorkflowRules() { return (callIfExists_('runTaskSystemTests') || callIfExists_('runAllSystemTestsImpl') || callIfExists_('runAllSystemTests')) || null; }
function testFieldPolicyReadiness() { return callIfExists_('testFieldPolicyReadiness') || callIfExists_('runTaskSystemTests') || null; }
function createSampleTaskRows() { return seedTaskDemo(); }

function auditFinanceModule() {
  var r = callIfExists_('runFinanceTests');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'runFinanceTests chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Audit Tài chính', r.ok !== false ? 'OK' : 'Có vấn đề', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function seedFinanceDemo() {
  var r = callIfExists_('seedGoldenDataset', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'seedGoldenDataset chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Gieo Tài chính Demo', r.message || 'Xong', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function testFinanceDonViMapping() { return auditFinanceModule(); }

function dumpAllSheetSchemas() {
  var names = callIfExists_('getRequiredSheetNames');
  if (!names || !names.length) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'getRequiredSheetNames chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  var out = names.map(function(n) {
    var h = callIfExists_('getSchemaHeaders', n);
    return n + ': ' + (h ? h.join(', ') : 'N/A');
  }).join('\n\n');
  SpreadsheetApp.getUi().alert('Schema tất cả sheet', out.slice(0, 3000), SpreadsheetApp.getUi().ButtonSet.OK);
  return { names: names };
}

function auditSchemaMismatch() {
  var r = callIfExists_('selfAuditBootstrapImpl', {}) || callIfExists_('selfAuditBootstrap', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'selfAuditBootstrapImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  var findings = (r.auditReport && r.auditReport.findings) ? r.auditReport.findings.filter(function(f) { return (f.issue_code || '').indexOf('SCHEMA_') === 0; }) : [];
  var msg = findings.length === 0 ? 'Không có lệch schema' : findings.slice(0, 10).map(function(f) { return f.table + '.' + f.column + ': ' + f.message; }).join('\n');
  SpreadsheetApp.getUi().alert('Lệch Schema', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function dumpSchemaProfileFull() { return dumpAllSheetSchemas(); }

function repairTaskSystemSafely() {
  var r = callIfExists_('repairTaskSystemSafelyImpl', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'repairTaskSystemSafely chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  var msg = 'Task repair: ' + (r.appended && r.appended.length ? r.appended.length + ' cols' : 'OK');
  SpreadsheetApp.getUi().alert('Sửa Task System', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function repairSchemaSafely() {
  var r = callIfExists_('repairSchemaColumns') || callIfExists_('repairSchemaAndData', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'repairSchemaColumns chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Sửa Schema', r.appended ? r.appended.join(', ') : (r.schemaRepairs ? r.schemaRepairs.join(', ') : 'Xong'), SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function repairEnumSafely() {
  var r = callIfExists_('runSafeRepair', { dryRun: false, createMissingEnums: true });
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'runSafeRepair chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Sửa Enum', r.planned ? r.planned.length + ' actions' : 'Xong', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function repairRefSafely() {
  SpreadsheetApp.getUi().alert('Ref Repair', 'Sử dụng Repair toàn hệ thống hoặc repairSchemaAndData. Ref được sửa khi chạy repair tổng thể.');
  return {};
}

function enforceFinalSchemaSafely() {
  var r = callIfExists_('repairSchemaColumns') || callIfExists_('ensureAllSchemasImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'repairSchemaColumns / ensureAllSchemasImpl chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Áp dụng Schema cuối', 'Đã chạy.', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function openSystemHealthLogSheet() { openSheetByName_(MENU_SHEET_NAMES.SYSTEM_HEALTH_LOG); }
function openAdminAuditLogSheet() { openSheetByName_(MENU_SHEET_NAMES.ADMIN_AUDIT_LOG); }

// ==================== DAILY ADMIN FLOW (menu* = backward compat) ====================

function menuDailyHealthCheck() {
  var r = selfAuditBootstrap({ writeHealthLog: true });
  if (r == null) return;
  var sh = (r.auditReport && r.auditReport.systemHealth) ? r.auditReport.systemHealth : 'N/A';
  var msg = 'Sức khỏe hệ thống: ' + sh + '\nBOOTSTRAP_SAFE: ' + (r.auditReport && r.auditReport.bootstrapSafe) + '\nAPPSHEET_READY: ' + (r.auditReport && r.auditReport.appsheetReady);
  SpreadsheetApp.getUi().alert('Kiểm tra sức khỏe', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuQuickAuditRun() {
  var r = selfAuditBootstrap({});
  if (r == null) return;
  var ok = r.ok;
  var msg = ok ? 'Audit: OK' : 'Audit: Có vấn đề\n' + ((r.errors || []).slice(0, 5).join('\n') || '');
  SpreadsheetApp.getUi().alert('Audit nhanh', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuVerifyAppSheetReadiness() {
  var r = verifyAppSheetReadiness();
  if (r == null) return;
  var msg = (r.appsheetReady || r.ok ? 'Sẵn sàng AppSheet' : 'Chưa sẵn sàng') + ((r.reasons && r.reasons.length) ? '\n' + r.reasons.slice(0, 3).join('; ') : '');
  SpreadsheetApp.getUi().alert('AppSheet', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuOpenHealthLog() {
  openSheetByName_(MENU_SHEET_NAMES.SYSTEM_HEALTH_LOG);
}

function menuOpenAuditLog() {
  openSheetByName_(MENU_SHEET_NAMES.ADMIN_AUDIT_LOG);
}

// ==================== BOOTSTRAP & INIT ====================

function menuRunFullDeployment() {
  runFullDeployment();
}

function menuInitAll() {
  runSafeMenuStep_('initAll', 'Khởi tạo toàn bộ', function(res) { return res ? 'Đã chạy initAll()' : 'Khởi tạo xong'; });
}

function menuEnsureSchemas() {
  ensureAllSchemas();
}

function menuSeedAllData() {
  seedAllData();
}

function menuProtectSensitiveSheets() {
  runSafeMenuStep_('protectSensitiveSheets', 'Bảo vệ sheet nhạy cảm');
}

function menuInstallTriggers() {
  installTriggers();
}

function menuRemoveTriggers() {
  removeCbvTriggers();
}

// ==================== AUDIT & HEALTH ====================

function menuSelfAuditBootstrap() {
  var r = selfAuditBootstrap({ writeHealthLog: true });
  if (r == null) return;
  var ar = r.auditReport || {};
  var msg = 'Health: ' + ar.systemHealth + '\nBootstrapSafe: ' + ar.bootstrapSafe + '\nAppSheetReady: ' + ar.appsheetReady;
  if (ar.totals) msg += '\n\nCritical: ' + ar.totals.critical + ', High: ' + ar.totals.high + ', Medium: ' + ar.totals.medium + ', Low: ' + ar.totals.low;
  SpreadsheetApp.getUi().alert('Self Audit', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuVerifyAppSheet() {
  menuVerifyAppSheetReadiness();
}

function menuTestSchemaIntegrity() {
  var r = callIfExists_('testSchemaIntegrity') || callIfExists_('auditSystem');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'testSchemaIntegrity hoặc auditSystem chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = r.ok !== false ? 'Schema OK' : ('Lỗi: ' + (r.data && r.data.missingSheets ? r.data.missingSheets.join(', ') : ''));
  SpreadsheetApp.getUi().alert('Kiểm tra Schema', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuValidateEnums() {
  var r = validateAllEnums();
  if (r == null) return;
  SpreadsheetApp.getUi().alert('Kiểm tra Enum', r && r.ok ? 'Enum OK' : (r ? JSON.stringify(r.findings || []) : 'Xong'), SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuValidateRefs() {
  var r = validateAllRefs();
  if (r == null) return;
  SpreadsheetApp.getUi().alert('Kiểm tra Ref', r && r.ok ? 'Ref OK' : (r ? JSON.stringify(r.findings || []) : 'Xong'), SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuValidateDonViHierarchy() {
  var r = validateDonViHierarchy();
  if (r == null) return;
  SpreadsheetApp.getUi().alert('Kiểm tra DON_VI', r && r.ok ? 'DON_VI OK' : (r ? JSON.stringify(r.findings || []) : 'Xong'), SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuRunAllTests() {
  var r = runAllSystemTests();
  if (r == null) return;
  var msg = (r.verdict || (r.ok ? 'PASS' : 'FAIL')) + (r.summary ? '\n' + JSON.stringify(r.summary) : '');
  SpreadsheetApp.getUi().alert('Chạy tất cả test', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuGenerateDeploymentReport() {
  generateDeploymentReport();
}

// ==================== MASTER DATA ====================

function menuSeedEnumDictionary() {
  ensureSeedEnumDictionary();
}

function menuSeedDonVi() {
  ensureSeedDonVi();
}

function menuSeedMasterCode() {
  ensureSeedMasterCode();
}

function menuSeedUserDirectory() {
  var fn = callIfExists_('ensureSeedUserDirectory') || callIfExists_('seedUserDirectory');
  if (fn == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'ensureSeedUserDirectory / seedUserDirectory chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var r = typeof fn === 'function' ? fn() : null;
  SpreadsheetApp.getUi().alert('Gieo USER_DIRECTORY', r ? ('Đã thêm: ' + (r.inserted || r.added || 0)) : 'Xong', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuBuildSliceSpec() {
  var r = callIfExists_('buildActiveSlicesSpec');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'buildActiveSlicesSpec chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Slice Spec', JSON.stringify(r, null, 2), SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuBuildEnumSpecReport() {
  var r = callIfExists_('auditEnumConsistency') || callIfExists_('enumHealthCheck', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'auditEnumConsistency / enumHealthCheck chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = r.status || (r.ok ? 'OK' : 'Có vấn đề') + (r.summary ? '\n' + JSON.stringify(r.summary) : '');
  SpreadsheetApp.getUi().alert('Báo cáo Enum', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ==================== TASK MODULE ====================

function menuAuditTaskModule() {
  var r = callIfExists_('selfAuditTaskSystemFull') || callIfExists_('selfAuditTaskSystem');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'selfAuditTaskSystem chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = (r.ok ? 'OK' : 'Có vấn đề') + (r.findings && r.findings.length ? '\n\n' + r.findings.slice(0, 5).map(function(f) { return f.message || f.code; }).join('\n') : '');
  SpreadsheetApp.getUi().alert('Audit Task', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuSeedTaskDemo() {
  var r = callIfExists_('seedGoldenDataset', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'seedGoldenDataset chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Gieo dữ liệu Task Demo', r.message || 'Xong', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuTestTaskWorkflow() {
  runSafeMenuStep_('runTaskSystemTests', 'Test Task Workflow');
}

function menuTestTaskFieldPolicy() {
  var r = callIfExists_('testFieldPolicyReadiness') || callIfExists_('runTaskSystemTests');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'testFieldPolicyReadiness chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Test Field Policy', JSON.stringify(r, null, 2).slice(0, 500), SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuCreateSampleTaskRows() {
  menuSeedTaskDemo();
}

// ==================== HỒ SƠ MODULE ====================
// menuAuditHoSo, menuSeedHoSoDemo, menuTestHoSoRelations, menuHosoFullDeploy → 10_HOSO_MENU.gs

// ==================== TÀI CHÍNH MODULE ====================

function menuAuditFinance() {
  var r = callIfExists_('runFinanceTests');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'runFinanceTests chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Audit Tài chính', r.ok !== false ? 'OK' : 'Có vấn đề', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuSeedFinanceDemo() {
  var r = callIfExists_('seedGoldenDataset', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'seedGoldenDataset chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Gieo Tài chính Demo', r.message || 'Xong', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuTestFinanceDonViMapping() {
  menuAuditFinance();
}

// ==================== SCHEMA TOOLS ====================

function menuDumpAllSheetSchemas() {
  var names = callIfExists_('getRequiredSheetNames');
  if (!names || !names.length) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'getRequiredSheetNames chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var out = names.map(function(n) {
    var h = callIfExists_('getSchemaHeaders', n);
    return n + ': ' + (h ? h.join(', ') : 'N/A');
  }).join('\n\n');
  SpreadsheetApp.getUi().alert('Schema tất cả sheet', out.slice(0, 3000), SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuAuditSchemaMismatch() {
  var r = callIfExists_('selfAuditBootstrap', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'selfAuditBootstrap chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var findings = (r.auditReport && r.auditReport.findings) ? r.auditReport.findings.filter(function(f) { return (f.issue_code || '').indexOf('SCHEMA_') === 0; }) : [];
  var msg = findings.length === 0 ? 'Không có lệch schema' : findings.slice(0, 10).map(function(f) { return f.table + '.' + f.column + ': ' + f.message; }).join('\n');
  SpreadsheetApp.getUi().alert('Lệch Schema', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuDumpFullSchemaProfile() {
  menuDumpAllSheetSchemas();
}

// ==================== REPAIR ZONE ====================

function menuRepairWholeSystemSafely() {
  var r = callIfExists_('repairSchemaAndData', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'repairSchemaAndData chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = 'Schema: ' + (r.schemaRepairs && r.schemaRepairs.length ? r.schemaRepairs.join('; ') : 'none') + '\nUser: ' + (r.userRepaired || 0) + '\nTASK_MAIN DON_VI_ID: ' + (r.taskMainDonViFilled || 0);
  SpreadsheetApp.getUi().alert('Sửa toàn hệ thống', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuRepairSchemaSafely() {
  var r = callIfExists_('repairSchemaColumns') || callIfExists_('repairSchemaAndData', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'repairSchemaColumns chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Sửa Schema', r.appended ? r.appended.join(', ') : (r.schemaRepairs ? r.schemaRepairs.join(', ') : 'Xong'), SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuRepairEnumSafely() {
  var r = callIfExists_('runSafeRepair', { dryRun: false, createMissingEnums: true });
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'runSafeRepair chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Sửa Enum', r.planned ? r.planned.length + ' actions' : 'Xong', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuRepairRefSafely() {
  SpreadsheetApp.getUi().alert('Ref Repair', 'Sử dụng Repair toàn hệ thống hoặc repairSchemaAndData. Ref được sửa khi chạy repair tổng thể.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuEnforceFinalSchemaSafely() {
  var r = callIfExists_('repairSchemaColumns') || callIfExists_('ensureAllSchemas');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'repairSchemaColumns / ensureAllSchemas chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Áp dụng Schema cuối', 'Đã chạy.', SpreadsheetApp.getUi().ButtonSet.OK);
}

// ==================== DEV / ADMIN ====================

function menuOpenSystemHealthLog() {
  menuOpenHealthLog();
}

function menuOpenAdminAuditLog() {
  menuOpenAuditLog();
}

// Backward compatibility: preserve old menu handler names
function runFullDeploymentMenu() { menuRunFullDeployment(); }
function runEnumHealthCheck() {
  var h = callIfExists_('enumHealthCheck', {});
  if (h == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'enumHealthCheck chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = 'Status: ' + (h.status || 'N/A') + '\nRegistry: ' + (h.enumRegistryValid ? 'OK' : 'FAIL') + '\nUsage: ' + (h.enumUsageValid ? 'OK' : 'FAIL');
  SpreadsheetApp.getUi().alert('Enum Health', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
function runSchemaAndDataRepair() { menuRepairWholeSystemSafely(); }
function runTaskSystemProBootstrap() {
  var r = callIfExists_('taskSystemProBootstrapAll');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'taskSystemProBootstrapAll chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = 'DON_VI: ' + (r.donVi.created ? 'created' : 'exists') + '\nSeed DON_VI: +' + (r.seedDonVi.inserted || 0) + '\nSeed TASK_TYPE: +' + (r.seedTaskType.inserted || 0) + '\nAudit: ' + (r.audit.ok ? 'OK' : 'FAIL');
  SpreadsheetApp.getUi().alert('Task PRO Bootstrap', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
function runTaskSystemAudit() {
  var r = callIfExists_('selfAuditTaskSystemFull') || callIfExists_('selfAuditTaskSystem');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'selfAuditTaskSystem chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = r.summary || (r.ok ? 'OK' : 'FAIL');
  if (r.findings && r.findings.length) msg += '\n\n' + r.findings.slice(0, 8).map(function(f) { return (f.severity || '') + ': ' + (f.message || f.code); }).join('\n');
  SpreadsheetApp.getUi().alert('Task System Audit', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
function runTaskSystemRepairDryRun() {
  var r = callIfExists_('repairTaskSystemSafelyImpl', { dryRun: true });
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'repairTaskSystemSafely chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = 'Dry run: would append ' + (r.appended ? r.appended.length : 0) + ' columns';
  if (r.appended && r.appended.length) msg += '\n\n' + r.appended.slice(0, 10).join('\n');
  SpreadsheetApp.getUi().alert('Task Repair (Dry Run)', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
function runSafeRepairDryRun() {
  var r = callIfExists_('runSafeRepair', { dryRun: true });
  if (r == null) {
    SpreadsheetApp.getUi().alert('Chưa tải', 'runSafeRepair chưa được tải.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = 'Dry run: ' + (r.planned ? r.planned.length : 0) + ' planned actions';
  SpreadsheetApp.getUi().alert('Safe Repair (Dry Run)', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
/** Menu handler for Task tests. */
function menuRunTaskSystemTests() {
  var r = runAllSystemTests();
  if (r == null) return;
  var v = r.verdict || (r.ok ? 'PASS' : 'FAIL');
  var msg = v + (r.summary ? '\n' + JSON.stringify(r.summary) : '');
  SpreadsheetApp.getUi().alert('Task Tests', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

