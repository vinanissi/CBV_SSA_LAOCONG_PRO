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
      'Chưa tải',
      friendlyName + ' chưa được tải. Kiểm tra file GAS và CLASP_PUSH_ORDER.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return false;
  }
  try {
    var result = args && args.length ? fn.apply(null, args) : fn();
    var msg = (typeof formatter === 'function' && result !== undefined) ? formatter(result) : (result ? String(result) : 'Xong');
    SpreadsheetApp.getUi().alert(friendlyName, msg, SpreadsheetApp.getUi().ButtonSet.OK);
    return true;
  } catch (e) {
    SpreadsheetApp.getUi().alert(
      'Lỗi',
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
    ? 'Tất cả hàm Impl cần thiết đã được tải.'
    : 'Chưa tải (' + missing.length + '):\n' + missing.slice(0, 20).join('\n') + (missing.length > 20 ? '\n... +' + (missing.length - 20) : '');
  SpreadsheetApp.getUi().alert('Kiểm tra hàm Impl', msg, SpreadsheetApp.getUi().ButtonSet.OK);
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
    ? 'Menu bindings OK. Wrappers và menu* handlers đều tồn tại.'
    : 'Một số binding thiếu. Wrappers: ' + (wrapperOk ? 'OK' : 'FAIL') + ', Menu: ' + (menuOk ? 'OK' : 'FAIL') + '. Chạy showMissingFunctionReport().';
  SpreadsheetApp.getUi().alert('Menu Bindings', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Show daily admin guide (inline instructions).
 */
function showDailyAdminGuide() {
  var msg = [
    '📅 QUY TRÌNH HÀNG NGÀY',
    '',
    '1. Kiểm tra sức khỏe: Daily Admin Flow → Kiểm tra sức khỏe',
    '2. Xem nhật ký: Mở SYSTEM_HEALTH_LOG hoặc ADMIN_AUDIT_LOG',
    '3. Audit nhanh: Daily Admin Flow → Chạy Audit nhanh',
    '',
    '🔎 Khi có cảnh báo:',
    '- WARN: Xem chi tiết, sửa nếu cần',
    '- FAIL: Dùng Repair Zone (cẩn thận)',
    '',
    '🛠️ Sửa chữa chỉ khi:',
    '- Đã xác định nguyên nhân',
    '- Đã backup dữ liệu',
    '- Repair Zone → Sửa schema/data an toàn'
  ].join('\n');
  SpreadsheetApp.getUi().alert('Hướng dẫn Admin hàng ngày', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
