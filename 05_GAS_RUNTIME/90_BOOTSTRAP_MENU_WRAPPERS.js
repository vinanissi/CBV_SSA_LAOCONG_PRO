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

/** CBV Test Console — Phase 85 Unified UI Contract */
function menuCbvTestConsoleUiContract85_bootstrap() {
  runSafeMenuStep_('CbvUiContract_bootstrap', 'Bootstrap UI Contract', function (r) {
    if (!r) return 'No result';
    return JSON.stringify(r, null, 2);
  });
}

function menuCbvTestConsoleUiContract85_health() {
  runSafeMenuStep_('CbvUiContract_healthCheck', 'UI Contract Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleUiContract85_validate() {
  runSafeMenuStep_('CbvUiContract_validate', 'Validate UI Contract', function (r) {
    if (!r) return 'No result';
    return 'ok=' + r.ok + '\nerrors=' + (r.errors || []).length + '\n' + (r.errors || []).slice(0, 8).join('\n');
  });
}

function menuCbvTestConsoleUiContract85_pilotMatrix() {
  runSafeMenuStep_('CbvUiContract_generatePilotMatrix', 'Pilot Matrix', function (r) {
    if (!r || !r.matrix) return 'No result';
    var m = r.matrix;
    return [
      'appSheetDaily: ' + m.appSheetDaily.length,
      'webAppAdvanced: ' + m.webAppAdvanced.length,
      'both: ' + m.both.length,
      'notPilotReady: ' + m.notPilotReady.length
    ].join('\n');
  });
}

function menuCbvTestConsoleUiContract85_handoff() {
  runSafeMenuStep_('CbvUiContract_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleUiContract85_copyReport() {
  runSafeMenuStep_('CbvUiContract_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 86 UI Contract pilot binding */
function menuCbvTestConsoleUiPilot86_health() {
  runSafeMenuStep_('CbvUiPilotBinding_healthCheck', 'Pilot Binding Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleUiPilot86_appsheetPlan() {
  runSafeMenuStep_('CbvUiPilotBinding_TestConsole_showAppSheetPlan', 'AppSheet Binding Plan', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleUiPilot86_webappPlan() {
  runSafeMenuStep_('CbvUiPilotBinding_TestConsole_showWebAppRoutePlan', 'WebApp Route Plan', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleUiPilot86_checklist() {
  runSafeMenuStep_('CbvUiPilotBinding_TestConsole_showPilotChecklist', 'Pilot Checklist', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleUiPilot86_handoff() {
  runSafeMenuStep_('CbvUiPilotBinding_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleUiPilot86_copyReport() {
  runSafeMenuStep_('CbvUiPilotBinding_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 87 AppSheet pilot setup (CBV_TCS_V1) */
function menuCbvTestConsoleAppSheetPilot87_health() {
  runSafeMenuStep_('CbvAppSheetPilot_healthCheck', 'AppSheet Pilot Setup Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleAppSheetPilot87_views() {
  runSafeMenuStep_('CbvAppSheetPilot_TestConsole_showViewMatrix', 'View Setup Matrix', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleAppSheetPilot87_slices() {
  runSafeMenuStep_('CbvAppSheetPilot_TestConsole_showSliceMatrix', 'Slice Setup Matrix', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleAppSheetPilot87_actions() {
  runSafeMenuStep_('CbvAppSheetPilot_TestConsole_showManualActionsMatrix', 'Manual Actions Matrix', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleAppSheetPilot87_security() {
  runSafeMenuStep_('CbvAppSheetPilot_TestConsole_showSecurityFilterMatrix', 'Security Filter Matrix', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleAppSheetPilot87_uat() {
  runSafeMenuStep_('CbvAppSheetPilot_TestConsole_showUatScript', 'UAT Script', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleAppSheetPilot87_handoff() {
  runSafeMenuStep_('CbvAppSheetPilot_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleAppSheetPilot87_copyReport() {
  runSafeMenuStep_('CbvAppSheetPilot_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 88 FE architecture rebalance closeout (CBV_TCS_V1) */
function menuCbvTestConsoleFeArch88_run() {
  runSafeMenuStep_('CbvFeArchitecture_TestConsole_run', 'FE Architecture Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleFeArch88_matrix() {
  runSafeMenuStep_('CbvFeArchitecture_TestConsole_showOwnershipMatrix', 'FE Ownership Matrix', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleFeArch88_decision() {
  runSafeMenuStep_('CbvFeArchitecture_TestConsole_showDecision', 'Architecture Decision', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleFeArch88_handoff() {
  runSafeMenuStep_('CbvFeArchitecture_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleFeArch88_copyReport() {
  runSafeMenuStep_('CbvFeArchitecture_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 89 WebApp workspace skeleton (CBV_TCS_V1) */
function menuCbvTestConsoleWebAppWs89_run() {
  runSafeMenuStep_('CbvWebAppWorkspace_TestConsole_run', 'WebApp Workspace Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleWebAppWs89_routes() {
  runSafeMenuStep_('CbvWebAppWorkspace_TestConsole_showRouteRegistry', 'Route Registry', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppWs89_home() {
  runSafeMenuStep_('CbvWebAppWorkspace_TestConsole_showHomeSummary', 'Home Summary', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppWs89_handoff() {
  runSafeMenuStep_('CbvWebAppWorkspace_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppWs89_copyReport() {
  runSafeMenuStep_('CbvWebAppWorkspace_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 90 WebApp pilot pages (CBV_TCS_V1) */
function menuCbvTestConsoleWebAppPilot90_run() {
  runSafeMenuStep_('CbvWebAppPilot_TestConsole_run', 'WebApp Pilot Pages Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleWebAppPilot90_home() {
  runSafeMenuStep_('CbvWebAppPilot_TestConsole_showHomeDashboard', 'Home Dashboard Data', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppPilot90_queue() {
  runSafeMenuStep_('CbvWebAppPilot_TestConsole_showQueueCards', 'Queue Cards Data', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppPilot90_sla() {
  runSafeMenuStep_('CbvWebAppPilot_TestConsole_showSlaWidgets', 'SLA Widgets Data', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppPilot90_handoff() {
  runSafeMenuStep_('CbvWebAppPilot_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppPilot90_copyReport() {
  runSafeMenuStep_('CbvWebAppPilot_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 91 WebApp timeline/kanban read-first pages (CBV_TCS_V1) */
function menuCbvTestConsoleWebAppTlk91_run() {
  runSafeMenuStep_('CbvWebAppTimelineKanban_TestConsole_run', 'Timeline/Kanban Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleWebAppTlk91_timeline() {
  runSafeMenuStep_('CbvWebAppTimelineKanban_TestConsole_showTimelineData', 'Timeline Data', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppTlk91_kanban() {
  runSafeMenuStep_('CbvWebAppTimelineKanban_TestConsole_showKanbanData', 'Kanban Data', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppTlk91_handoff() {
  runSafeMenuStep_('CbvWebAppTimelineKanban_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppTlk91_copyReport() {
  runSafeMenuStep_('CbvWebAppTimelineKanban_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 92 WebApp Observability (Runtime Health + Report Viewer). */
function menuCbvTestConsoleWebAppObs92_run() {
  runSafeMenuStep_('CbvWebAppObservability_TestConsole_run', 'Observability Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleWebAppObs92_runtimeHealth() {
  runSafeMenuStep_('CbvWebAppObservability_TestConsole_showRuntimeHealth', 'Runtime Health Data', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppObs92_recentReports() {
  runSafeMenuStep_('CbvWebAppObservability_TestConsole_showRecentReports', 'Recent Reports', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppObs92_traceSummary() {
  runSafeMenuStep_('CbvWebAppObservability_TestConsole_showTraceSummary', 'Trace Summary', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppObs92_handoff() {
  runSafeMenuStep_('CbvWebAppObservability_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppObs92_copyReport() {
  runSafeMenuStep_('CbvWebAppObservability_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 93 WebApp Admin Reference Viewer / Settings Read-First. */
function menuCbvTestConsoleWebAppAdminRef93_run() {
  runSafeMenuStep_('CbvWebAppAdminRef_TestConsole_run', 'Admin Reference Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleWebAppAdminRef93_governance() {
  runSafeMenuStep_('CbvWebAppAdminRef_TestConsole_showGovernanceSummary', 'Governance Summary', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppAdminRef93_enum() {
  runSafeMenuStep_('CbvWebAppAdminRef_TestConsole_showEnumSummary', 'Enum Summary', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppAdminRef93_userRole() {
  runSafeMenuStep_('CbvWebAppAdminRef_TestConsole_showUserRoleSummary', 'User/Role Summary', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppAdminRef93_uiContract() {
  runSafeMenuStep_('CbvWebAppAdminRef_TestConsole_showUiContractSummary', 'UI Contract Summary', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppAdminRef93_routeRegistry() {
  runSafeMenuStep_('CbvWebAppAdminRef_TestConsole_showRouteRegistrySummary', 'Route Registry Summary', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppAdminRef93_handoff() {
  runSafeMenuStep_('CbvWebAppAdminRef_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppAdminRef93_copyReport() {
  runSafeMenuStep_('CbvWebAppAdminRef_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 94 WebApp UI Foundation Freeze / UAT Hardening. */
function menuCbvTestConsoleWebAppUiFreeze94_run() {
  runSafeMenuStep_('CbvWebAppUiFreeze_TestConsole_run', 'UI Freeze Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleWebAppUiFreeze94_routeMatrix() {
  runSafeMenuStep_('CbvWebAppUiFreeze_TestConsole_showRouteFreezeMatrix', 'Route Freeze Matrix', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppUiFreeze94_uiStandard() {
  runSafeMenuStep_('CbvWebAppUiFreeze_TestConsole_showUiStandard', 'UI Standard', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppUiFreeze94_uatChecklist() {
  runSafeMenuStep_('CbvWebAppUiFreeze_TestConsole_showUatChecklist', 'UAT Checklist', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppUiFreeze94_handoff() {
  runSafeMenuStep_('CbvWebAppUiFreeze_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppUiFreeze94_copyReport() {
  runSafeMenuStep_('CbvWebAppUiFreeze_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 95 WebApp Pilot UAT / Staff Trial Runbook. */
function menuCbvTestConsoleWebAppUat95_run() {
  runSafeMenuStep_('CbvWebAppUat_TestConsole_run', 'Pilot UAT Readiness Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleWebAppUat95_pilotScope() {
  runSafeMenuStep_('CbvWebAppUat_TestConsole_showPilotScope', 'Pilot Scope', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppUat95_adminScript() {
  runSafeMenuStep_('CbvWebAppUat_TestConsole_showAdminScript', 'Admin UAT Script', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppUat95_supervisorScript() {
  runSafeMenuStep_('CbvWebAppUat_TestConsole_showSupervisorScript', 'Supervisor UAT Script', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppUat95_operatorScript() {
  runSafeMenuStep_('CbvWebAppUat_TestConsole_showOperatorScript', 'Operator UAT Script', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppUat95_feedbackSchema() {
  runSafeMenuStep_('CbvWebAppUat_TestConsole_showFeedbackSchema', 'Feedback Schema', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppUat95_goNoGo() {
  runSafeMenuStep_('CbvWebAppUat_TestConsole_showGoNoGoCriteria', 'Go/No-Go Criteria', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppUat95_handoff() {
  runSafeMenuStep_('CbvWebAppUat_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppUat95_copyReport() {
  runSafeMenuStep_('CbvWebAppUat_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 96 WebApp Vietnamese UX / user-flow guides. */
function menuCbvTestConsoleWebAppVi96_run() {
  runSafeMenuStep_('CbvWebAppViUx_TestConsole_run', 'Vietnamese UX Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleWebAppVi96_labels() {
  runSafeMenuStep_('CbvWebAppViUx_TestConsole_showLabelDictionary', 'Label Dictionary', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppVi96_links() {
  runSafeMenuStep_('CbvWebAppViUx_TestConsole_showRouteLinks', 'Route Links', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppVi96_operator() {
  runSafeMenuStep_('CbvWebAppViUx_TestConsole_showOperatorGuide', 'Operator Guide', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppVi96_supervisor() {
  runSafeMenuStep_('CbvWebAppViUx_TestConsole_showSupervisorGuide', 'Supervisor Guide', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppVi96_admin() {
  runSafeMenuStep_('CbvWebAppViUx_TestConsole_showAdminGuide', 'Admin Guide', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppVi96_handoff() {
  runSafeMenuStep_('CbvWebAppViUx_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppVi96_copyReport() {
  runSafeMenuStep_('CbvWebAppViUx_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 96.1 WebApp canonical route URL (absolute /exec?route= links). */
function menuCbvTestConsoleWebAppRoute961_run() {
  runSafeMenuStep_('CbvWebAppRouteUrl_TestConsole_run', 'Route URL Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleWebAppRoute961_map() {
  runSafeMenuStep_('CbvWebAppRouteUrl_TestConsole_showRouteMap', 'Route URL Map', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppRoute961_nav() {
  runSafeMenuStep_('CbvWebAppRouteUrl_TestConsole_showNavItems', 'Vietnamese Nav URLs', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppRoute961_checklist() {
  runSafeMenuStep_('CbvWebAppRouteUrl_TestConsole_showAuditChecklist', 'Link Audit Checklist', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppRoute961_handoff() {
  runSafeMenuStep_('CbvWebAppRouteUrl_TestConsole_showHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppRoute961_copyReport() {
  runSafeMenuStep_('CbvWebAppRouteUrl_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 97 Staff Trial / feedback capture. */
function menuCbvTestConsoleWebAppStaff97_run() {
  runSafeMenuStep_('CbvWebAppStaffTrial_TestConsole_run', 'Staff Trial Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleWebAppStaff97_runbook() {
  runSafeMenuStep_('CbvWebAppStaffTrial_TestConsole_showRunbook', 'Staff Trial Runbook', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppStaff97_schema() {
  runSafeMenuStep_('CbvWebAppStaffTrial_TestConsole_showFeedbackSchema', 'Feedback Schema', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppStaff97_triage() {
  runSafeMenuStep_('CbvWebAppStaffTrial_TestConsole_showTriageMatrix', 'Triage Matrix', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleWebAppStaff97_handoff() {
  runSafeMenuStep_('CbvWebAppStaffTrial_TestConsole_copyAiHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Dialog opened — select text and copy.' : (r && r.message) || 'Done';
  });
}

function menuCbvTestConsoleWebAppStaff97_copyReport() {
  runSafeMenuStep_('CbvWebAppStaffTrial_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 97.1 Drive report export (CBV_TCS_V1). */
function menuCbvTestConsoleDrive971_run() {
  runSafeMenuStep_('CbvTcsDriveReport_TestConsole_run', 'Drive Export Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleDrive971_exportP97() {
  runSafeMenuStep_('CbvTcsDriveReport_exportLatestPhase97ToDrive', 'Export Phase 97 Report to Drive', function (r) {
    if (!r) return 'No result';
    if (r.ok === false && r.message) return r.message;
    var n = r && r.files ? r.files.length : 0;
    return 'Drive export: ' + (r && r.ok ? 'ok' : 'partial/fail') + '\nFiles: ' + n;
  });
}

function menuCbvTestConsoleDrive971_copyResult() {
  runSafeMenuStep_('CbvTcsDriveReport_TestConsole_copyLatestResult', 'Copy Drive Export Result', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — Phase 97.2 Artifact Registry / markdown mirror. */
function menuCbvTestConsoleArtifact972_run() {
  runSafeMenuStep_('CbvTcsArtifactRegistry_TestConsole_run', 'Artifact Registry Health Check', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleArtifact972_recent() {
  runSafeMenuStep_('CbvTcsArtifactRegistry_TestConsole_showRecent', 'Recent Artifacts', function (r) {
    return r && r.ok ? 'Shown in dialog.' : 'Done';
  });
}

function menuCbvTestConsoleArtifact972_byTrace() {
  runSafeMenuStep_('CbvTcsArtifactRegistry_TestConsole_showByTraceId', 'Find By TraceId', function (r) {
    return r && r.ok ? 'Shown in dialog.' : (r && r.message) || 'Done';
  });
}

function menuCbvTestConsoleArtifact972_copyReport() {
  runSafeMenuStep_('CbvTcsArtifactRegistry_TestConsole_copyLatestReport', 'Copy Latest Report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

function menuCbvTestConsoleArtifact972_handoff() {
  runSafeMenuStep_('CbvTcsArtifactRegistry_TestConsole_copyAiHandoffPrompt', 'AI Handoff Prompt', function (r) {
    return r && r.ok ? 'Dialog opened — select text and copy.' : (r && r.message) || 'Done';
  });
}

/** Milestone 01 — one-click full operational workspace test + Drive bundle. */
function menuCbvTestConsoleMilestone01_runFull() {
  runSafeMenuStep_('CbvTcsMilestone01OpWorkspace_TestConsole_runFull', 'Milestone 01 Full Operational Workspace Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleMilestone01_copyReport() {
  runSafeMenuStep_('CbvTcsMilestone01OpWorkspace_TestConsole_copyLatestReport', 'Copy Milestone 01 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** Milestone 02 — staff operation workspace test + Drive bundle. */
function menuCbvTestConsoleMilestone02_runFull() {
  runSafeMenuStep_('CbvTcsMilestone02StaffWorkspace_TestConsole_runFull', 'Milestone 02 Staff Workspace Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleMilestone02_copyReport() {
  runSafeMenuStep_('CbvTcsMilestone02StaffWorkspace_TestConsole_copyLatestReport', 'Copy Milestone 02 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** Milestone 03 — daily operation flow test + Drive bundle. */
function menuCbvTestConsoleMilestone03_runFull() {
  runSafeMenuStep_('CbvTcsMilestone03DailyOp_TestConsole_runFull', 'Milestone 03 Daily Operation Flow Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleMilestone03_copyReport() {
  runSafeMenuStep_('CbvTcsMilestone03DailyOp_TestConsole_copyLatestReport', 'Copy Milestone 03 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** Milestone 04 — operation execution flow test + Drive bundle. */
function menuCbvTestConsoleMilestone04_runFull() {
  runSafeMenuStep_('CbvTcsMilestone04ExecFlow_TestConsole_runFull', 'Milestone 04 Operation Execution Flow Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleMilestone04_copyReport() {
  runSafeMenuStep_('CbvTcsMilestone04ExecFlow_TestConsole_copyLatestReport', 'Copy Milestone 04 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** Milestone 05 — guided SOP runtime test + Drive bundle. */
function menuCbvTestConsoleMilestone05_runFull() {
  runSafeMenuStep_('CbvTcsMilestone05GuidedSop_TestConsole_runFull', 'Milestone 05 Guided SOP Runtime Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleMilestone05_copyReport() {
  runSafeMenuStep_('CbvTcsMilestone05GuidedSop_TestConsole_copyLatestReport', 'Copy Milestone 05 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** Milestone 06 — staff workboard production MVP test + Drive bundle. */
function menuCbvTestConsoleMilestone06_runFull() {
  runSafeMenuStep_('CbvTcsMilestone06StaffWorkboard_TestConsole_runFull', 'Milestone 06 Staff Workboard Production MVP Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleMilestone06_copyReport() {
  runSafeMenuStep_('CbvTcsMilestone06StaffWorkboard_TestConsole_copyLatestReport', 'Copy Milestone 06 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** Milestone 07 — AppSheet Live Bridge test + Drive bundle. */
function menuCbvTestConsoleMilestone07_runFull() {
  runSafeMenuStep_('CbvTcsMilestone07AppSheetLiveBridge_TestConsole_runFull', 'M07 — AppSheet Live Bridge Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleMilestone07_copyReport() {
  runSafeMenuStep_('CbvTcsMilestone07AppSheetLiveBridge_TestConsole_copyLatestReport', 'Copy Milestone 07 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** Milestone 08 — Operational State Runtime test + Drive bundle. */
function menuCbvTestConsoleMilestone08_runFull() {
  runSafeMenuStep_('CbvTcsMilestone08OperationalState_TestConsole_runFull', 'M08 — Operational State Runtime Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleMilestone08_copyReport() {
  runSafeMenuStep_('CbvTcsMilestone08OperationalState_TestConsole_copyLatestReport', 'Copy Milestone 08 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** Milestone 09 — Interactive Task Runtime test + Drive bundle. */
function menuCbvTestConsoleMilestone09_runFull() {
  runSafeMenuStep_('CbvTcsMilestone09InteractiveTask_TestConsole_runFull', 'M09 — Interactive Task Runtime Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleMilestone09_copyReport() {
  runSafeMenuStep_('CbvTcsMilestone09InteractiveTask_TestConsole_copyLatestReport', 'Copy Milestone 09 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** PHASE_RF_02 — Workboard Core health test (CBV_TCS_V1). */
function menuCbvTestConsoleRf02_runFull() {
  runSafeMenuStep_('CBV_RF02_Test_runWorkboardCoreHealth', 'RF_02 Workboard Core Health Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleRf02_copyReport() {
  runSafeMenuStep_('CbvTcsRf02WorkboardCore_TestConsole_copyLatestReport', 'Copy RF_02 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** PHASE_RF_03 — Operational Coordination health test. */
function menuCbvTestConsoleRf03_runFull() {
  runSafeMenuStep_('CBV_RF03_Test_runOperationalCoordinationHealth', 'RF_03 Operational Coordination Health Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleRf03_copyReport() {
  runSafeMenuStep_('CbvTcsRf03OperationalCoordination_TestConsole_copyLatestReport', 'Copy RF_03 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** PHASE_RF_04 — Observation Runtime health test. */
function menuCbvTestConsoleRf04_runFull() {
  runSafeMenuStep_('CBV_RF04_Test_runObservationRuntimeHealth', 'RF_04 Observation Runtime Health Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleRf04_copyReport() {
  runSafeMenuStep_('CbvTcsRf04ObservationRuntime_TestConsole_copyLatestReport', 'Copy RF_04 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** PHASE_RF_05 — Plugin Runtime health test. */
function menuCbvTestConsoleRf05_runFull() {
  runSafeMenuStep_('CBV_RF05_Test_runPluginRuntimeHealth', 'RF_05 Plugin Runtime Health Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleRf05_copyReport() {
  runSafeMenuStep_('CbvTcsRf05PluginRuntime_TestConsole_copyLatestReport', 'Copy RF_05 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** PHASE_RF_06 — Finance/HO_SO plugin activation test. */
function menuCbvTestConsoleRf06_runFull() {
  runSafeMenuStep_('CBV_RF06_Test_runFinanceHoSoPluginActivationHealth', 'RF_06 Finance/HO_SO Activation Test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

function menuCbvTestConsoleRf06_copyReport() {
  runSafeMenuStep_('CbvTcsRf06FinanceHoSoPluginActivation_TestConsole_copyLatestReport', 'Copy RF_06 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** PHASE_RF_07 — Runtime lock verification. */
function menuCbvTestConsoleRf07_runFull() {
  runSafeMenuStep_('CBV_RF07_Test_runRuntimeLockVerification', 'RF_07 Runtime Lock Verification', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no') + '\nLock: ' + (r.runtimeLockStatus || '');
  });
}

function menuCbvTestConsoleRf07_copyReport() {
  runSafeMenuStep_('CbvTcsRf07RuntimeLock_TestConsole_copyLatestReport', 'Copy RF_07 report', function (r) {
    return r && r.ok ? 'Dialog opened — select JSON and copy.' : (r && r.message) || 'Done';
  });
}

/** CBV Test Console — HOME_ALERT Phase 82 SLA & escalation QA. */
function menuCbvTestConsoleHomeAlertSla82() {
  runSafeMenuStep_('HomeAlertSlaEscalation_TestConsole_run', 'HOME_ALERT SLA/Escalation test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

/** CBV Test Console — HOME_ALERT Phase 83 SLA policy registry QA. */
function menuCbvTestConsoleHomeAlertSla83() {
  runSafeMenuStep_('HomeAlertSlaPolicy_TestConsole_run', 'HOME_ALERT SLA Policy Registry test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

/** CBV Test Console — HOME_ALERT Phase 84 safe automation runtime QA. */
function menuCbvTestConsoleHomeAlertSafeAutomation84() {
  runSafeMenuStep_('HomeAlertSafeAutomation_TestConsole_run', 'HOME_ALERT Safe Automation Runtime test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

/** CBV Test Console — REF-A operational reference layer QA. */
function menuCbvTestConsoleOperationalReferenceRefA() {
  runSafeMenuStep_('CbvRef_TestConsole_run', 'Operational Reference Layer (REF-A) test', function (r) {
    if (!r) return 'No result';
    return (r.status || '') + '\n' + (r.summary || '') + '\nEnvelope OK: ' + (r.envelopeOk ? 'yes' : 'no');
  });
}

