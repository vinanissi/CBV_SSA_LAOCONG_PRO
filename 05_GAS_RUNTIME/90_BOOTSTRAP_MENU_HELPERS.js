/**
 * CBV PRO Menu - Admin Helpers
 * Safe utilities for menu actions. No silent failures.
 * Dependencies: 00_CORE_CONFIG (CBV_CONFIG)
 */

/** Sheet names for admin navigation */
var MENU_SHEET_NAMES = {
  SYSTEM_HEALTH_LOG: typeof SYSTEM_HEALTH_LOG_SHEET !== 'undefined' ? SYSTEM_HEALTH_LOG_SHEET : 'SYSTEM_HEALTH_LOG',
  ADMIN_AUDIT_LOG: typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.ADMIN_AUDIT_LOG
    ? CBV_CONFIG.SHEETS.ADMIN_AUDIT_LOG : 'ADMIN_AUDIT_LOG'
};

/**
 * Call implementation function by name. Returns result or null if missing.
 * Use for safe menu wrappers — never crashes; returns null when fn absent.
 * @param {string} fnName - Global function name
 * @param {...*} args - Arguments to pass
 * @returns {*} Result or null
 */
function callIfExists_(fnName) {
  if (typeof fnName !== 'string' || !fnName) return null;
  var fn;
  try {
    fn = eval(fnName);
  } catch (e) {
    return null;
  }
  if (typeof fn !== 'function') return null;
  var args = Array.prototype.slice.call(arguments, 1);
  try {
    return fn.apply(null, args);
  } catch (e) {
    throw e;
  }
}

/** Check if a global function exists by name. */
function _menuFnExists_(fnName) {
  try {
    return typeof eval(fnName) === 'function';
  } catch (e) {
    return false;
  }
}

/**
 * Run a menu step safely. Shows alert if implementation missing.
 * @param {string} fnName - Implementation function name
 * @param {string} friendlyName - Display name for alerts
 * @param {Function} [formatter] - Optional: (result) => string for success message
 * @param {Array} [args] - Optional arguments to pass
 * @returns {boolean} true if ran successfully
 */
function runSafeMenuStep_(fnName, friendlyName, formatter, args) {
  friendlyName = friendlyName || fnName;
  var fn = null;
  try {
    fn = _menuFnExists_(fnName) ? eval(fnName) : null;
  } catch (e) {}
  if (typeof fn !== 'function') {
    SpreadsheetApp.getUi().alert(
      'Not loaded',
      friendlyName + ' is not loaded. Check GAS files and CLASP_PUSH_ORDER.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return false;
  }
  try {
    var result = args && args.length ? fn.apply(null, args) : fn();
    var msg = (typeof formatter === 'function' && result !== undefined) ? formatter(result) : (result ? String(result) : 'Done');
    SpreadsheetApp.getUi().alert(friendlyName, msg, SpreadsheetApp.getUi().ButtonSet.OK);
    return true;
  } catch (e) {
    SpreadsheetApp.getUi().alert(
      'Error',
      friendlyName + ': ' + (e.message || String(e)),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return false;
  }
}

/**
 * Open (activate) a sheet by name. Scrolls to it. Creates if missing = false.
 * @param {string} sheetName - Sheet name
 * @param {boolean} [createIfMissing=false] - Create sheet if not found
 */
function openSheetByName_(sheetName, createIfMissing) {
  if (!sheetName || String(sheetName).trim() === '') return;
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet && createIfMissing) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet) sheet.activate();
}

/**
 * Show report of required Impl functions that are missing.
 */
function showMissingFunctionReport() {
  var requiredImpl = [
    'runFullDeploymentImpl', 'ensureAllSchemasImpl', 'seedAllDataImpl',
    'installTriggersImpl', 'removeCbvTriggersImpl', 'selfAuditBootstrapImpl',
    'verifyAppSheetReadinessImpl', 'validateAllEnumsImpl', 'validateAllRefsImpl',
    'validateDonViHierarchyImpl', 'runAllSystemTestsImpl',     'repairTaskSystemSafelyImpl', 'generateDeploymentReportImpl',
    'runSafeRepair', 'seedEnumDictionary', 'ensureSeedDonVi', 'ensureSeedTaskType',
    'selfAuditTaskSystem', 'selfAuditTaskSystemFull', 'seedGoldenDataset',
    'repairSchemaColumns', 'repairSchemaAndData', 'buildActiveSlicesSpecImpl', 'runHoSoTests', 'runFinanceTests',
    'getRequiredSheetNames', 'testSchemaIntegrity', 'testFieldPolicyReadinessImpl',
    'checkHoSoCompleteness', 'getExpiringDocs', 'generateHoSoReport'
  ];
  var missing = requiredImpl.filter(function(name) { return !_menuFnExists_(name); });
  var msg = missing.length === 0
    ? 'All required Impl functions are loaded.'
    : 'Not loaded (' + missing.length + '):\n' + missing.slice(0, 20).join('\n') + (missing.length > 20 ? '\n... +' + (missing.length - 20) : '');
  SpreadsheetApp.getUi().alert('Impl function check', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Verify menu bindings (sanity check). Checks both wrapper and menu* handlers.
 */
function verifyMenuBindings() {
  var wrappers = ['runFullDeployment', 'selfAuditBootstrap', 'ensureAllSchemas', 'seedAllData'];
  var menuHandlers = ['menuDailyHealthCheck', 'menuRunFullDeployment', 'menuSelfAuditBootstrap'];
  var wrapperOk = wrappers.every(function(fn) { return _menuFnExists_(fn); });
  var menuOk = menuHandlers.every(function(fn) { return _menuFnExists_(fn); });
  var ok = wrapperOk && menuOk;
  var msg = ok
    ? 'Menu bindings OK. Wrappers and menu* handlers exist.'
    : 'Some bindings missing. Wrappers: ' + (wrapperOk ? 'OK' : 'FAIL') + ', Menu: ' + (menuOk ? 'OK' : 'FAIL') + '. Run showMissingFunctionReport().';
  SpreadsheetApp.getUi().alert('Menu bindings', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Show daily admin guide (inline instructions).
 */
function showDailyAdminGuide() {
  var msg = [
    'DAILY WORKFLOW',
    '',
    '1. Health check: Daily operations → Run system health check',
    '2. Logs: Open SYSTEM_HEALTH_LOG or ADMIN_AUDIT_LOG',
    '3. Quick audit: Daily operations → Quick audit run',
    '',
    'WHEN YOU SEE WARNINGS:',
    '- WARN: Review details; fix if needed',
    '- FAIL: Use Repair zone (careful)',
    '',
    'REPAIR ONLY WHEN:',
    '- Root cause is known',
    '- Data is backed up',
    '- Repair zone → safe schema/data repair'
  ].join('\n');
  SpreadsheetApp.getUi().alert('Daily admin guide', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
