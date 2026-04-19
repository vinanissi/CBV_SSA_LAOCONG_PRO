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
    SpreadsheetApp.getUi().alert('Not loaded', 'runFullDeploymentImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  var msg = 'Deployment: ' + (r.verdict || 'N/A') + (r.report && r.report.summary ? '\n' + JSON.stringify(r.report.summary, null, 2) : '');
  if (r.mustFix && r.mustFix.length > 0) {
    msg += '\n\nMust fix (' + r.mustFix.length + '):\n' + r.mustFix.slice(0, 8).join('\n');
    if (r.mustFix.length > 8) msg += '\n... +' + (r.mustFix.length - 8) + ' more';
  }
  SpreadsheetApp.getUi().alert('Full deployment', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function ensureAllSchemas() {
  var r = callIfExists_('ensureAllSchemasImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'ensureAllSchemasImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Ensure schema', r && r.ok ? 'Schema OK' : (r ? JSON.stringify(r) : 'Done'), SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function seedAllData() {
  var r = callIfExists_('seedAllDataImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'seedAllDataImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  var msg = r ? ('DON_VI: ' + (r.donVi || 0) + ', USER: ' + (r.user || 0) + ', ENUM: ' + (r.enum || 0) + ', MC: ' + (r.masterCode || 0)) : 'Done';
  SpreadsheetApp.getUi().alert('Seed data', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function installTriggers() {
  var r = callIfExists_('installTriggersImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'installTriggersImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Install triggers', r.ok ? 'Installed' : (r.message || JSON.stringify(r)), SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function removeCbvTriggers() {
  var n = callIfExists_('removeCbvTriggersImpl');
  if (n == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'removeCbvTriggersImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Triggers removed', 'Removed ' + (typeof n === 'number' ? n : 0) + ' CBV trigger(s).', SpreadsheetApp.getUi().ButtonSet.OK);
  return n;
}

function menuInstallOnEditTrigger() {
  if (!_menuFnExists_('installOnEditTrigger')) {
    SpreadsheetApp.getUi().alert('Not loaded', 'installOnEditTrigger is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  try {
    installOnEditTrigger();
  } catch (err) {
    SpreadsheetApp.getUi().alert('Error', String(err.message || err), SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('onEdit', 'onEditTaskHandler installed.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuUninstallOnEditTrigger() {
  if (!_menuFnExists_('uninstallOnEditTrigger')) {
    SpreadsheetApp.getUi().alert('Not loaded', 'uninstallOnEditTrigger is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  try {
    uninstallOnEditTrigger();
  } catch (err) {
    SpreadsheetApp.getUi().alert('Error', String(err.message || err), SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('onEdit', 'onEditTaskHandler trigger removed.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuCoreEventQueueProcessNow() {
  if (!_menuFnExists_('processCoreEventQueueBatch_')) {
    SpreadsheetApp.getUi().alert('Not loaded', 'processCoreEventQueueBatch_ is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  try {
    var n = processCoreEventQueueBatch_(50);
    SpreadsheetApp.getUi().alert('EVENT_QUEUE', 'Processed ' + n + ' event(s) (batch).', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (err) {
    SpreadsheetApp.getUi().alert('Error', String(err.message || err), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function menuInstallCoreEventQueueTrigger() {
  if (!_menuFnExists_('installCoreEventQueueTrigger')) {
    SpreadsheetApp.getUi().alert('Not loaded', 'installCoreEventQueueTrigger is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  try {
    installCoreEventQueueTrigger();
    SpreadsheetApp.getUi().alert('EVENT_QUEUE', 'Installed: coreEventQueueProcessMinutely every 5 minutes.', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (err) {
    SpreadsheetApp.getUi().alert('Error', String(err.message || err), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function menuUninstallCoreEventQueueTrigger() {
  if (!_menuFnExists_('uninstallCoreEventQueueTrigger')) {
    SpreadsheetApp.getUi().alert('Not loaded', 'uninstallCoreEventQueueTrigger is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  try {
    uninstallCoreEventQueueTrigger();
    SpreadsheetApp.getUi().alert('EVENT_QUEUE', 'Trigger removed.', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (err) {
    SpreadsheetApp.getUi().alert('Error', String(err.message || err), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function selfAuditBootstrap(opts) {
  var o = opts || {};
  var r = callIfExists_('selfAuditBootstrapImpl', o);
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'selfAuditBootstrapImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function verifyAppSheetReadiness() {
  var r = callIfExists_('verifyAppSheetReadinessImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'verifyAppSheetReadinessImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function testSchemaIntegrity() {
  var r = callIfExists_('testSchemaIntegrity') || callIfExists_('auditSystem');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'testSchemaIntegrity is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function validateAllEnums() {
  var r = callIfExists_('validateAllEnumsImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'validateAllEnumsImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function validateAllRefs() {
  var r = callIfExists_('validateAllRefsImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'validateAllRefsImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function validateDonViHierarchy() {
  var r = callIfExists_('validateDonViHierarchyImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'validateDonViHierarchyImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function runAllSystemTests() {
  var r = callIfExists_('runAllSystemTestsImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'runAllSystemTestsImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
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
    SpreadsheetApp.getUi().alert('Not loaded', 'runFullDeploymentImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Deployment report', 'Verdict: ' + r.verdict + '\nWritten to ADMIN_AUDIT_LOG.', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function ensureSeedEnumDictionary() {
  var r = callIfExists_('seedEnumDictionary') || callIfExists_('ensureSeedEnumDictionary');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'seedEnumDictionary is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Seed ENUM_DICTIONARY', r && r.data ? ('Added: ' + (r.data.inserted || 0)) : 'Done', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function ensureSeedDonVi() {
  var r = callIfExists_('ensureSeedDonVi');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'ensureSeedDonVi is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Seed DON_VI', r ? ('Added: ' + (r.inserted || 0) + ' row(s)') : 'Done', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function ensureSeedMasterCode() {
  var r = callIfExists_('ensureSeedTaskType') || callIfExists_('ensureSeedMasterCode');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'ensureSeedTaskType is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Seed MASTER_CODE', r ? ('Added: ' + (r.inserted || 0) + ' row(s)') : 'Done', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function ensureSeedUserDirectory() {
  var res = callIfExists_('seedUserDirectory');
  if (res == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'seedUserDirectory is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Seed USER_DIRECTORY', res ? ('Added: ' + (res.inserted || res.added || 0)) : 'Done', SpreadsheetApp.getUi().ButtonSet.OK);
  return res;
}

function buildActiveSlicesSpec() {
  var r = callIfExists_('buildActiveSlicesSpecImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'buildActiveSlicesSpecImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Slice Spec', JSON.stringify(r, null, 2), SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function buildEnumSpecReport() {
  var r = callIfExists_('auditEnumConsistency') || callIfExists_('enumHealthCheck', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'auditEnumConsistency / enumHealthCheck is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Enum report', (r.status || (r.ok ? 'OK' : 'Issues')) + (r.summary ? '\n' + JSON.stringify(r.summary) : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function auditTaskModule() {
  var r = callIfExists_('selfAuditTaskSystemFull') || callIfExists_('selfAuditTaskSystem');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'selfAuditTaskSystem is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  var msg = (r.ok ? 'OK' : 'Issues') + (r.findings && r.findings.length ? '\n\n' + r.findings.slice(0, 5).map(function(f) { return f.message || f.code; }).join('\n') : '');
  SpreadsheetApp.getUi().alert('Audit Task', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function seedTaskDemo() {
  var r = callIfExists_('seedGoldenDataset', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'seedGoldenDataset is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Seed Task demo', r.message || 'Done', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function testTaskWorkflowRules() { return (callIfExists_('runTaskSystemTests') || callIfExists_('runAllSystemTestsImpl') || callIfExists_('runAllSystemTests')) || null; }
function testFieldPolicyReadiness() {
  var r = callIfExists_('testFieldPolicyReadinessImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'testFieldPolicyReadinessImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Field Policy', r.ok !== false ? 'PASS' : JSON.stringify(r.findings || r), SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}
function createSampleTaskRows() { return seedTaskDemo(); }

function auditFinanceModule() {
  var r = callIfExists_('runFinanceTests');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'runFinanceTests is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Finance audit', r.ok !== false ? 'OK' : 'Issues', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function seedFinanceDemo() {
  var r = callIfExists_('seedGoldenDataset', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'seedGoldenDataset is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Seed Finance demo', r.message || 'Done', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function testFinanceDonViMapping() { return auditFinanceModule(); }

function dumpAllSheetSchemas() {
  var names = callIfExists_('getRequiredSheetNames');
  if (!names || !names.length) {
    SpreadsheetApp.getUi().alert('Not loaded', 'getRequiredSheetNames is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  var out = names.map(function(n) {
    var h = callIfExists_('getSchemaHeaders', n);
    return n + ': ' + (h ? h.join(', ') : 'N/A');
  }).join('\n\n');
  SpreadsheetApp.getUi().alert('All sheet schemas', out.slice(0, 3000), SpreadsheetApp.getUi().ButtonSet.OK);
  return { names: names };
}

function auditSchemaMismatch() {
  var r = callIfExists_('selfAuditBootstrapImpl', {}) || callIfExists_('selfAuditBootstrap', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'selfAuditBootstrapImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  var findings = (r.auditReport && r.auditReport.findings) ? r.auditReport.findings.filter(function(f) { return (f.issue_code || '').indexOf('SCHEMA_') === 0; }) : [];
  var msg = findings.length === 0 ? 'No schema mismatch' : findings.slice(0, 10).map(function(f) { return f.table + '.' + f.column + ': ' + f.message; }).join('\n');
  SpreadsheetApp.getUi().alert('Schema mismatch', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function dumpSchemaProfileFull() { return dumpAllSheetSchemas(); }

function repairTaskSystemSafely() {
  var r = callIfExists_('repairTaskSystemSafelyImpl', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'repairTaskSystemSafely is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  var msg = 'Task repair: ' + (r.appended && r.appended.length ? r.appended.length + ' cols' : 'OK');
  SpreadsheetApp.getUi().alert('Repair Task system', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function repairSchemaSafely() {
  var r = callIfExists_('repairSchemaColumns') || callIfExists_('repairSchemaAndData', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'repairSchemaColumns is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Repair schema', r.appended ? r.appended.join(', ') : (r.schemaRepairs ? r.schemaRepairs.join(', ') : 'Done'), SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function repairWholeSystemSafely() {
  var r = callIfExists_('repairSchemaAndData');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'repairSchemaAndData is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Repair whole system', r.message || 'Completed.', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function repairEnumSafely() {
  var r = callIfExists_('runSafeRepair', { dryRun: false, createMissingEnums: true });
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'runSafeRepair is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  SpreadsheetApp.getUi().alert('Repair enum', r.planned ? r.planned.length + ' actions' : 'Done', SpreadsheetApp.getUi().ButtonSet.OK);
  return r;
}

function repairRefSafely() {
  SpreadsheetApp.getUi().alert('Ref Repair', 'Use Repair whole system or repairSchemaAndData. Refs are fixed when you run full repair.');
  return {};
}

function enforceFinalSchemaSafely() {
  var r = callIfExists_('repairSchemaColumns') || callIfExists_('ensureAllSchemasImpl');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'repairSchemaColumns / ensureAllSchemasImpl is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return r;
}

function openSystemHealthLogSheet() { openSheetByName_(MENU_SHEET_NAMES.SYSTEM_HEALTH_LOG); }
function openAdminAuditLogSheet() { openSheetByName_(MENU_SHEET_NAMES.ADMIN_AUDIT_LOG); }

// ==================== DAILY ADMIN FLOW (menu* = backward compat) ====================

function menuDailyHealthCheck() {
  var r = selfAuditBootstrap({ writeHealthLog: true });
  if (r == null) return;
  var sh = (r.auditReport && r.auditReport.systemHealth) ? r.auditReport.systemHealth : 'N/A';
  var msg = 'System health: ' + sh + '\nBOOTSTRAP_SAFE: ' + (r.auditReport && r.auditReport.bootstrapSafe) + '\nAPPSHEET_READY: ' + (r.auditReport && r.auditReport.appsheetReady);
  SpreadsheetApp.getUi().alert('Health check', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuQuickAuditRun() {
  var r = selfAuditBootstrap({});
  if (r == null) return;
  var ok = r.ok;
  var msg = ok ? 'Audit: OK' : 'Audit: issues\n' + ((r.errors || []).slice(0, 5).join('\n') || '');
  SpreadsheetApp.getUi().alert('Quick audit', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuVerifyAppSheetReadiness() {
  var r = verifyAppSheetReadiness();
  if (r == null) return;
  var msg = (r.appsheetReady || r.ok ? 'AppSheet ready' : 'Not ready') + ((r.reasons && r.reasons.length) ? '\n' + r.reasons.slice(0, 3).join('; ') : '');
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
  runSafeMenuStep_('initAll', 'Initialize all', function(res) { return res ? 'Ran initAll()' : 'Initialization done'; });
}

function menuEnsureSchemas() {
  ensureAllSchemas();
}

function menuSeedAllData() {
  seedAllData();
}

function menuProtectSensitiveSheets() {
  runSafeMenuStep_('protectSensitiveSheets', 'Protect sensitive sheets');
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
    SpreadsheetApp.getUi().alert('Not loaded', 'testSchemaIntegrity or auditSystem is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = r.ok !== false ? 'Schema OK' : ('Error: ' + (r.data && r.data.missingSheets ? r.data.missingSheets.join(', ') : ''));
  SpreadsheetApp.getUi().alert('Schema check', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuValidateEnums() {
  var r = validateAllEnums();
  if (r == null) return;
  SpreadsheetApp.getUi().alert('Enum check', r && r.ok ? 'Enum OK' : (r ? JSON.stringify(r.findings || []) : 'Done'), SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuValidateRefs() {
  var r = validateAllRefs();
  if (r == null) return;
  SpreadsheetApp.getUi().alert('Ref check', r && r.ok ? 'Ref OK' : (r ? JSON.stringify(r.findings || []) : 'Done'), SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuValidateDonViHierarchy() {
  var r = validateDonViHierarchy();
  if (r == null) return;
  SpreadsheetApp.getUi().alert('DON_VI check', r && r.ok ? 'DON_VI OK' : (r ? JSON.stringify(r.findings || []) : 'Done'), SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuRunAllTests() {
  var r = runAllSystemTests();
  if (r == null) return;
  var msg = (r.verdict || (r.ok ? 'PASS' : 'FAIL')) + (r.summary ? '\n' + JSON.stringify(r.summary) : '');
  SpreadsheetApp.getUi().alert('Run all tests', msg, SpreadsheetApp.getUi().ButtonSet.OK);
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
    SpreadsheetApp.getUi().alert('Not loaded', 'ensureSeedUserDirectory / seedUserDirectory is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var r = typeof fn === 'function' ? fn() : null;
  SpreadsheetApp.getUi().alert('Seed USER_DIRECTORY', r ? ('Added: ' + (r.inserted || r.added || 0)) : 'Done', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuBuildSliceSpec() {
  buildActiveSlicesSpec();
}

function menuBuildEnumSpecReport() {
  var r = callIfExists_('auditEnumConsistency') || callIfExists_('enumHealthCheck', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'auditEnumConsistency / enumHealthCheck is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = r.status || (r.ok ? 'OK' : 'Issues') + (r.summary ? '\n' + JSON.stringify(r.summary) : '');
  SpreadsheetApp.getUi().alert('Enum report', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ==================== TASK MODULE ====================

function menuAuditTaskModule() {
  var r = callIfExists_('selfAuditTaskSystemFull') || callIfExists_('selfAuditTaskSystem');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'selfAuditTaskSystem is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = (r.ok ? 'OK' : 'Issues') + (r.findings && r.findings.length ? '\n\n' + r.findings.slice(0, 5).map(function(f) { return f.message || f.code; }).join('\n') : '');
  SpreadsheetApp.getUi().alert('Audit Task', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuSeedTaskDemo() {
  var r = callIfExists_('seedGoldenDataset', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'seedGoldenDataset is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Seed Task demo data', r.message || 'Done', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuTestTaskWorkflow() {
  runSafeMenuStep_('runTaskSystemTests', 'Test Task Workflow');
}

function menuTestTaskFieldPolicy() {
  testFieldPolicyReadiness();
}

function menuCreateSampleTaskRows() {
  menuSeedTaskDemo();
}

// ==================== HO_SO MODULE ====================
// menuAuditHoSo, menuSeedHoSoDemo, menuTestHoSoRelations, menuHosoFullDeploy → 10_HOSO_MENU.gs

// ==================== FINANCE MODULE ====================

function menuAuditFinance() {
  var r = callIfExists_('runFinanceTests');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'runFinanceTests is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Finance audit', r.ok !== false ? 'OK' : 'Issues', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuExportFinancePeriodToDrive() {
  var ui = SpreadsheetApp.getUi();
  var tz = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.TIMEZONE) ? CBV_CONFIG.TIMEZONE : Session.getScriptTimeZone();
  var r1 = ui.prompt('Export tài chính theo kỳ', 'Từ ngày (yyyy-MM-dd):', ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  var r2 = ui.prompt('Export tài chính theo kỳ', 'Đến ngày (yyyy-MM-dd):', ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  var s1 = String(r1.getResponseText() || '').trim();
  var s2 = String(r2.getResponseText() || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s1) || !/^\d{4}-\d{2}-\d{2}$/.test(s2)) {
    ui.alert('Định dạng ngày phải là yyyy-MM-dd (ví dụ 2025-04-01).');
    return;
  }
  var start = Utilities.parseDate(s1 + ' 12:00:00', tz, 'yyyy-MM-dd HH:mm:ss');
  var end = Utilities.parseDate(s2 + ' 12:00:00', tz, 'yyyy-MM-dd HH:mm:ss');
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    ui.alert('Không đọc được ngày.');
    return;
  }
  if (s2 < s1) {
    ui.alert('Đến ngày phải ≥ Từ ngày.');
    return;
  }
  var r = callIfExists_('exportFinancePeriodToDrive', { start: start, end: end });
  if (r == null) {
    ui.alert('Not loaded', 'exportFinancePeriodToDrive is not loaded.', ui.ButtonSet.OK);
    return;
  }
  if (!r.ok) {
    ui.alert('Export thất bại', r.message || JSON.stringify(r), ui.ButtonSet.OK);
    return;
  }
  ui.alert(
    'Đã tạo file',
    'Tên: ' + (r.fileName || '') + '\nSố dòng (đã lọc): ' + (r.rowCount != null ? r.rowCount : 0) + '\n\nMở bằng link:\n' + (r.url || ''),
    ui.ButtonSet.OK
  );
}

function menuSeedFinanceDemo() {
  var r = callIfExists_('seedGoldenDataset', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'seedGoldenDataset is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Seed Finance demo', r.message || 'Done', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuTestFinanceDonViMapping() {
  menuAuditFinance();
}

// ==================== SCHEMA TOOLS ====================

function menuDumpAllSheetSchemas() {
  var names = callIfExists_('getRequiredSheetNames');
  if (!names || !names.length) {
    SpreadsheetApp.getUi().alert('Not loaded', 'getRequiredSheetNames is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var out = names.map(function(n) {
    var h = callIfExists_('getSchemaHeaders', n);
    return n + ': ' + (h ? h.join(', ') : 'N/A');
  }).join('\n\n');
  SpreadsheetApp.getUi().alert('All sheet schemas', out.slice(0, 3000), SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuAuditSchemaMismatch() {
  var r = callIfExists_('selfAuditBootstrap', {});
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'selfAuditBootstrap is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var findings = (r.auditReport && r.auditReport.findings) ? r.auditReport.findings.filter(function(f) { return (f.issue_code || '').indexOf('SCHEMA_') === 0; }) : [];
  var msg = findings.length === 0 ? 'No schema mismatch' : findings.slice(0, 10).map(function(f) { return f.table + '.' + f.column + ': ' + f.message; }).join('\n');
  SpreadsheetApp.getUi().alert('Schema mismatch', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuDumpFullSchemaProfile() {
  menuDumpAllSheetSchemas();
}

// ==================== REPAIR ZONE ====================

function menuRepairWholeSystemSafely() {
  repairWholeSystemSafely();
}

function menuRepairSchemaSafely() {
  repairSchemaSafely();
}

function menuRepairEnumSafely() {
  var r = callIfExists_('runSafeRepair', { dryRun: false, createMissingEnums: true });
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'runSafeRepair is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Repair enum', r.planned ? r.planned.length + ' actions' : 'Done', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuRepairRefSafely() {
  SpreadsheetApp.getUi().alert('Ref Repair', 'Use Repair whole system or repairSchemaAndData. Refs are fixed when you run full repair.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuEnforceFinalSchemaSafely() {
  var r = callIfExists_('enforceFinalSchemaSafely');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'enforceFinalSchemaSafely is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  SpreadsheetApp.getUi().alert('Apply final schema', 'Completed.', SpreadsheetApp.getUi().ButtonSet.OK);
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
    SpreadsheetApp.getUi().alert('Not loaded', 'enumHealthCheck is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = 'Status: ' + (h.status || 'N/A') + '\nRegistry: ' + (h.enumRegistryValid ? 'OK' : 'FAIL') + '\nUsage: ' + (h.enumUsageValid ? 'OK' : 'FAIL');
  SpreadsheetApp.getUi().alert('Enum Health', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
function runSchemaAndDataRepair() { menuRepairWholeSystemSafely(); }
function runTaskSystemProBootstrap() {
  var r = callIfExists_('taskSystemProBootstrapAll');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'taskSystemProBootstrapAll is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = 'DON_VI: ' + (r.donVi.created ? 'created' : 'exists') + '\nSeed DON_VI: +' + (r.seedDonVi.inserted || 0) + '\nSeed TASK_TYPE: +' + (r.seedTaskType.inserted || 0) + '\nAudit: ' + (r.audit.ok ? 'OK' : 'FAIL');
  SpreadsheetApp.getUi().alert('Task PRO Bootstrap', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
function runTaskSystemAudit() {
  var r = callIfExists_('selfAuditTaskSystemFull') || callIfExists_('selfAuditTaskSystem');
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'selfAuditTaskSystem is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = r.summary || (r.ok ? 'OK' : 'FAIL');
  if (r.findings && r.findings.length) msg += '\n\n' + r.findings.slice(0, 8).map(function(f) { return (f.severity || '') + ': ' + (f.message || f.code); }).join('\n');
  SpreadsheetApp.getUi().alert('Task System Audit', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
function runTaskSystemRepairDryRun() {
  var r = callIfExists_('repairTaskSystemSafelyImpl', { dryRun: true });
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'repairTaskSystemSafely is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  var msg = 'Dry run: would append ' + (r.appended ? r.appended.length : 0) + ' columns';
  if (r.appended && r.appended.length) msg += '\n\n' + r.appended.slice(0, 10).join('\n');
  SpreadsheetApp.getUi().alert('Task Repair (Dry Run)', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
function runSafeRepairDryRun() {
  var r = callIfExists_('runSafeRepair', { dryRun: true });
  if (r == null) {
    SpreadsheetApp.getUi().alert('Not loaded', 'runSafeRepair is not loaded.', SpreadsheetApp.getUi().ButtonSet.OK);
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

function menuCheckHoSoCompleteness() {
  var ui = SpreadsheetApp.getUi();
  var id = ui.prompt('HoSo completeness', 'Enter HoSo ID (HO_SO_MASTER.ID):', ui.ButtonSet.OK_CANCEL);
  if (id.getSelectedButton() !== ui.Button.OK) return;
  var hoSoId = id.getResponseText().trim();
  if (!hoSoId) return;
  var result = callIfExists_('checkHoSoCompleteness', hoSoId);
  if (!result) { ui.alert('checkHoSoCompleteness is not loaded'); return; }
  if (result.ok) {
    ui.alert('✅ Required documents complete.\nHave: ' + result.data.have + '/' + result.data.total + ' document type(s).');
  } else {
    var missing = result.data.missing.map(function(m) { return '• ' + m.DOC_TYPE; }).join('\n');
    ui.alert('⚠️ Missing ' + result.data.missing.length + ' item(s):\n' + missing);
  }
}

function menuGetExpiringDocs() {
  var result = callIfExists_('getExpiringDocs', 60);
  if (!result) { SpreadsheetApp.getUi().alert('getExpiringDocs is not loaded'); return; }
  var ui = SpreadsheetApp.getUi();
  if (result.data.count === 0) {
    ui.alert('✅ No documents expiring in the next 60 days.');
  } else {
    var list = result.data.rows.slice(0, 10).map(function(f) {
      return '• ' + f.DOC_TYPE + ' | ' + f.HO_SO_ID + ' | Expires: ' + f.EXPIRY_DATE;
    }).join('\n');
    ui.alert('⚠️ ' + result.data.count + ' document(s) expiring soon:\n' + list + (result.data.count > 10 ? '\n...(and ' + (result.data.count - 10) + ' more)' : ''));
  }
}

function menuGenerateHoSoReport() {
  var ui = SpreadsheetApp.getUi();
  var id = ui.prompt('Export report', 'Enter HoSo ID:', ui.ButtonSet.OK_CANCEL);
  if (id.getSelectedButton() !== ui.Button.OK) return;
  var hoSoId = id.getResponseText().trim();
  if (!hoSoId) return;
  var result = callIfExists_('generateHoSoReport', hoSoId);
  if (!result) { ui.alert('generateHoSoReport is not loaded'); return; }
  var d = result.data;
  var summary = [
    'HoSo: ' + d.hoSo.NAME + ' (' + d.hoSo.HO_SO_TYPE + ')',
    'Status: ' + d.hoSo.STATUS,
    'Documents: ' + d.completeness.have + '/' + d.completeness.total,
    'Missing required: ' + d.completeness.missing_count,
    'Expiring soon: ' + d.expiring.length,
  ].join('\n');
  ui.alert('📋 HoSo report\n\n' + summary + '\n\nSee details in AppSheet → HS_PRINT_VIEW');
}

// ==================== Data sync (DATA_SYNC_CONTROL sheet plan JSON) ====================

function menuDataSyncEnsureBuilderAndOpen() {
  if (typeof ensureDataSyncBuilderSheet !== 'function') {
    SpreadsheetApp.getUi().alert('Not loaded', 'ensureDataSyncBuilderSheet (45_DATA_SYNC_BUILDER).', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  try {
    var sh = ensureDataSyncBuilderSheet();
    SpreadsheetApp.getActive().setActiveSheet(sh);
    sh.setActiveRange(sh.getRange('B2'));
  } catch (e) {
    SpreadsheetApp.getUi().alert('Data sync builder', String(e.message || e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function menuDataSyncEnsurePasteArea() {
  if (typeof ensureDataSyncBuilderPasteArea !== 'function') {
    SpreadsheetApp.getUi().alert('Not loaded', 'ensureDataSyncBuilderPasteArea (45_DATA_SYNC_BUILDER).', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  try {
    ensureDataSyncBuilderPasteArea();
    SpreadsheetApp.getUi().alert(
      'Data sync',
      'Đã thêm / kiểm tra nhãn form (hàng 5–9: meta B,D; header hàng 7 & 9 từ A).',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {
    SpreadsheetApp.getUi().alert('Data sync', String(e.message || e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function menuDataSyncFillHeadersFromLinkedSheets() {
  var ui = SpreadsheetApp.getUi();
  if (typeof dataSyncFillHeaderRowsFromFormLinks_ !== 'function') {
    ui.alert('Not loaded', 'dataSyncFillHeaderRowsFromFormLinks_ (45_DATA_SYNC_BUILDER).', ui.ButtonSet.OK);
    return;
  }
  try {
    if (typeof ensureDataSyncBuilderPasteArea === 'function') ensureDataSyncBuilderPasteArea();
    var n = dataSyncFillHeaderRowsFromFormLinks_();
    ui.alert(
      'Header từ sheet thật',
      'OK — hàng 7: ' + n.srcCols + ' cột; hàng 9: ' + n.tgtCols + ' cột (từ hàng 1 của tab D6 / D8).',
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert('Fill headers', String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuDataSyncImportFromPaste() {
  var ui = SpreadsheetApp.getUi();
  if (typeof dataSyncImportJobsFromPasteColumns_ !== 'function') {
    ui.alert('Not loaded', 'dataSyncImportJobsFromPasteColumns_', ui.ButtonSet.OK);
    return;
  }
  try {
    if (typeof ensureDataSyncBuilderPasteArea === 'function') ensureDataSyncBuilderPasteArea();
    var n = dataSyncImportJobsFromPasteColumns_();
    ui.alert('Import jobs', 'OK — ' + n + ' job(s) ghi vào bảng JOB (từ hàng JOB đầu).', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Import', String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuDataSyncAutoColumnMaps() {
  var ui = SpreadsheetApp.getUi();
  if (typeof dataSyncAutoFillColumnMapsFromHeaders_ !== 'function') {
    ui.alert('Not loaded', 'dataSyncAutoFillColumnMapsFromHeaders_', ui.ButtonSet.OK);
    return;
  }
  try {
    var n = dataSyncAutoFillColumnMapsFromHeaders_();
    ui.alert('Auto maps', 'OK — ' + n + ' dòng column map (khớp tên cột header). Kiểm tra keyColumns (G).', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Auto maps', String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuDataSyncMapDropdowns() {
  var ui = SpreadsheetApp.getUi();
  if (typeof dataSyncApplyColumnMapDropdowns_ !== 'function') {
    ui.alert('Not loaded', 'dataSyncApplyColumnMapDropdowns_', ui.ButtonSet.OK);
    return;
  }
  try {
    dataSyncApplyColumnMapDropdowns_();
    ui.alert('Dropdowns', 'OK — cột from/to (B/C) có list theo header từng job.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Dropdowns', String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuDataSyncPastePipeline() {
  var ui = SpreadsheetApp.getUi();
  if (
    typeof ensureDataSyncBuilderPasteArea !== 'function' ||
    typeof dataSyncImportJobsFromPasteColumns_ !== 'function' ||
    typeof dataSyncAutoFillColumnMapsFromHeaders_ !== 'function' ||
    typeof dataSyncApplyColumnMapDropdowns_ !== 'function'
  ) {
    ui.alert('Not loaded', '45_DATA_SYNC_BUILDER', ui.ButtonSet.OK);
    return;
  }
  try {
    ensureDataSyncBuilderPasteArea();
    var a = dataSyncImportJobsFromPasteColumns_();
    var b = dataSyncAutoFillColumnMapsFromHeaders_();
    dataSyncApplyColumnMapDropdowns_();
    ui.alert('Pipeline', 'OK\nJobs: ' + a + '\nMap rows: ' + b + '\n→ Generate plan khi sẵn sàng.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Pipeline', String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuDataSyncGeneratePlanToA2() {
  var ui = SpreadsheetApp.getUi();
  if (typeof buildPlanObjectFromBuilderSheet_ !== 'function') {
    ui.alert('Not loaded', 'buildPlanObjectFromBuilderSheet_ (45_DATA_SYNC_BUILDER).', ui.ButtonSet.OK);
    return;
  }
  try {
    var plan = buildPlanObjectFromBuilderSheet_();
    if (typeof validateSyncPlan === 'function') {
      var v = validateSyncPlan(plan);
      if (!v.ok) {
        ui.alert('Validate (from builder)', 'FAILED:\n' + JSON.stringify(v.issues).substring(0, 1800), ui.ButtonSet.OK);
        return;
      }
    }
    if (typeof saveDataSyncPlanToSheet === 'function') {
      saveDataSyncPlanToSheet(plan);
    } else {
      ui.alert('Not loaded', 'saveDataSyncPlanToSheet', ui.ButtonSet.OK);
      return;
    }
    ui.alert(
      'Generate plan',
      'OK — đã ghi JSON vào DATA_SYNC_CONTROL!A2\nJobs: ' + plan.jobs.length + '\nTiếp: Validate plan (A2) hoặc Build report.',
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert('Generate plan', String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuDataSyncEnsureAndOpen() {
  if (typeof ensureDataSyncControlSheet !== 'function') {
    SpreadsheetApp.getUi().alert('Not loaded', 'ensureDataSyncControlSheet not found (load 46_DATA_SYNC_PLAN_SHEET).', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  try {
    ensureDataSyncControlSheet();
    menuDataSyncOpenControlSheet();
  } catch (e) {
    SpreadsheetApp.getUi().alert('Data sync', String(e.message || e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function menuDataSyncValidatePlanFromSheet() {
  var ui = SpreadsheetApp.getUi();
  if (typeof getDataSyncPlanFromSheet !== 'function' || typeof validateSyncPlan !== 'function') {
    ui.alert('Not loaded', 'Data sync module not found.', ui.ButtonSet.OK);
    return;
  }
  try {
    var plan = getDataSyncPlanFromSheet();
    var v = validateSyncPlan(plan);
    if (typeof dataSyncWriteLastResult_ === 'function') {
      dataSyncWriteLastResult_('validateSyncPlan', { ok: v.ok, summary: {}, issues: v.issues, warnings: v.warnings });
    }
    if (!v.ok) {
      ui.alert('Validate plan', 'FAILED\n' + JSON.stringify(v.issues).substring(0, 1800), ui.ButtonSet.OK);
    } else {
      ui.alert('Validate plan', 'OK. Warnings: ' + (v.warnings ? v.warnings.length : 0), ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert('Validate plan', String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuDataSyncBuildReportFromSheet() {
  var ui = SpreadsheetApp.getUi();
  if (typeof buildDataSyncReport !== 'function' || typeof getDataSyncReportOptsFromSheet_ !== 'function') {
    ui.alert('Not loaded', 'Data sync engine not found.', ui.ButtonSet.OK);
    return;
  }
  try {
    var opts = getDataSyncReportOptsFromSheet_();
    var rep = buildDataSyncReport(opts);
    if (typeof dataSyncWriteLastResult_ === 'function') {
      dataSyncWriteLastResult_('buildDataSyncReport', rep);
    }
    var msg =
      'canApply=' +
      rep.canApply +
      '\nerrorRowCount=' +
      (rep.summary ? rep.summary.errorRowCount : '') +
      '\ncontinuation=' +
      (rep.continuation ? 'YES — re-run Build or clear F2 when done' : 'null (complete pass)');
    ui.alert('Build report (read-only)', msg, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Build report', String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuDataSyncClearContinuationFromSheet() {
  if (typeof dataSyncSetContinuationOnSheet_ !== 'function') {
    SpreadsheetApp.getUi().alert('Not loaded', 'dataSyncSetContinuationOnSheet_ not found.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  dataSyncSetContinuationOnSheet_(null);
  SpreadsheetApp.getUi().alert('Data sync', 'F2 continuation cleared. Next Build starts from row 1 chunk.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuDataSyncRunApplyFromSheet() {
  var ui = SpreadsheetApp.getUi();
  if (typeof runDataSync !== 'function' || typeof getDataSyncReportOptsFromSheet_ !== 'function') {
    ui.alert('Not loaded', 'Data sync engine / 46_DATA_SYNC_PLAN_SHEET.', ui.ButtonSet.OK);
    return;
  }
  var c = ui.alert(
    'Apply data sync',
    'Writes to TARGET sheets in the plan. Uses F2 continuation if present. Run Build report until continuation is null first when using chunks. Continue?',
    ui.ButtonSet.YES_NO
  );
  if (c !== ui.Button.YES) return;
  try {
    var opts = getDataSyncReportOptsFromSheet_();
    var r = runDataSync({
      plan: opts.plan,
      continuation: opts.continuation,
      dryRun: false
    });
    if (typeof dataSyncWriteLastResult_ === 'function') {
      dataSyncWriteLastResult_('runDataSync', r);
    }
    ui.alert('Apply', (r.message || '') + '\napplied rows (writes): ' + (r.applied != null ? r.applied : ''), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Apply', String(e.message || e), ui.ButtonSet.OK);
  }
}

function menuDataSyncRunApplyOneJobFromSheet() {
  var ui = SpreadsheetApp.getUi();
  if (
    typeof runDataSync !== 'function' ||
    typeof getDataSyncReportOptsFromSheet_ !== 'function' ||
    typeof getDataSyncPlanFromSheet !== 'function'
  ) {
    ui.alert('Not loaded', 'Data sync engine / 46_DATA_SYNC_PLAN_SHEET.', ui.ButtonSet.OK);
    return;
  }
  var res = ui.prompt('Apply một job', 'Nhập job_id trong plan (A2), ví dụ JOB_1:', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;
  var jid = String(res.getResponseText() || '').trim();
  if (!jid) {
    ui.alert('Apply', 'job_id trống.', ui.ButtonSet.OK);
    return;
  }
  try {
    var planProbe = getDataSyncPlanFromSheet();
    var found = (planProbe.jobs || []).some(function(j) {
      return String(j.id) === String(jid);
    });
    if (!found) {
      ui.alert('Apply', 'Không có job_id trong plan: ' + jid, ui.ButtonSet.OK);
      return;
    }
  } catch (e) {
    ui.alert('Apply', String(e.message || e), ui.ButtonSet.OK);
    return;
  }
  var c = ui.alert(
    'Apply một job',
    'Chỉ ghi TARGET cho job "' + jid + '". Tiếp tục?',
    ui.ButtonSet.YES_NO
  );
  if (c !== ui.Button.YES) return;
  try {
    var opts = getDataSyncReportOptsFromSheet_({ jobId: jid });
    var r = runDataSync({
      plan: opts.plan,
      continuation: opts.continuation,
      jobId: jid,
      dryRun: false
    });
    if (typeof dataSyncWriteLastResult_ === 'function') {
      dataSyncWriteLastResult_('runDataSync', r);
    }
    ui.alert(
      'Apply (một job)',
      (r.message || '') + '\njob: ' + jid + '\napplied rows: ' + (r.applied != null ? r.applied : ''),
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert('Apply (một job)', String(e.message || e), ui.ButtonSet.OK);
  }
}

