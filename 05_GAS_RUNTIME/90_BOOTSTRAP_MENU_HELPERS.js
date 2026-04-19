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
 * Nhóm tab để ẩn/hiện hàng loạt (khớp CBV_SCHEMA_MANIFEST + SYSTEM_HEALTH_LOG).
 * Chỉ thao tác tab có tên trùng; tab khác trong file không đụng tới.
 */
var CBV_SHEET_VISIBILITY_GROUPS_ = {
  core: {
    label: 'Master & dùng chung',
    sheets: ['USER_DIRECTORY', 'DON_VI', 'MASTER_CODE']
  },
  audit: {
    label: 'Nhật ký & kiểm tra',
    sheets: ['ADMIN_AUDIT_LOG']
  },
  health: {
    label: 'SYSTEM_HEALTH_LOG',
    sheets: []
  },
  hoso: {
    label: 'Hồ sơ (HO_SO)',
    sheets: ['HO_SO_MASTER', 'HO_SO_FILE', 'HO_SO_RELATION', 'HO_SO_DETAIL_PHUONG_TIEN', 'HO_SO_UPDATE_LOG', 'DOC_REQUIREMENT']
  },
  task: {
    label: 'Công việc (TASK)',
    sheets: ['TASK_MAIN', 'TASK_CHECKLIST', 'TASK_UPDATE_LOG', 'TASK_ATTACHMENT']
  },
  finance: {
    label: 'Tài chính',
    sheets: ['FINANCE_TRANSACTION', 'FINANCE_ATTACHMENT', 'FINANCE_LOG', 'FIN_EXPORT_FILTER']
  },
  eventRule: {
    label: 'Sự kiện & quy tắc',
    sheets: ['EVENT_QUEUE', 'RULE_DEF']
  }
};

/** Resolve SYSTEM_HEALTH_LOG sheet name into group `health` */
function cbvResolveSheetVisibilityGroups_() {
  var healthName = typeof SYSTEM_HEALTH_LOG_SHEET !== 'undefined' ? SYSTEM_HEALTH_LOG_SHEET : 'SYSTEM_HEALTH_LOG';
  var copy = {};
  Object.keys(CBV_SHEET_VISIBILITY_GROUPS_).forEach(function(k) {
    var g = CBV_SHEET_VISIBILITY_GROUPS_[k];
    copy[k] = { label: g.label, sheets: g.sheets.slice() };
  });
  copy.health.sheets = [healthName];
  return copy;
}

/**
 * Ẩn hoặc hiện một nhóm tab. Khi ẩn, giữ ít nhất một tab còn hiển thị.
 * @param {string} groupKey - key trong CBV_SHEET_VISIBILITY_GROUPS_
 * @param {boolean} hidden - true = ẩn
 * @returns {{ ok: boolean, affected?: number, reason?: string }}
 */
function setCbvSheetGroupHidden_(groupKey, hidden) {
  var groups = cbvResolveSheetVisibilityGroups_();
  var g = groups[groupKey];
  if (!g || !g.sheets || !g.sheets.length) {
    return { ok: false, reason: 'UNKNOWN_GROUP' };
  }
  var ss = SpreadsheetApp.getActive();
  if (hidden) {
    var visibleCount = 0;
    ss.getSheets().forEach(function(s) {
      if (!s.isSheetHidden()) visibleCount++;
    });
    var wouldHide = 0;
    g.sheets.forEach(function(name) {
      var sh = ss.getSheetByName(name);
      if (sh && !sh.isSheetHidden()) wouldHide++;
    });
    if (visibleCount - wouldHide < 1) {
      return { ok: false, reason: 'LAST_SHEET' };
    }
  }
  var affected = 0;
  g.sheets.forEach(function(name) {
    var sh = ss.getSheetByName(name);
    if (!sh) return;
    if (hidden) sh.hideSheet();
    else sh.showSheet();
    affected++;
  });
  return { ok: true, affected: affected };
}

/**
 * Menu helper: ẩn/hiện nhóm + thông báo tiếng Việt.
 */
function menuCbvSheetGroupSet_(groupKey, hidden) {
  var groups = cbvResolveSheetVisibilityGroups_();
  var g = groups[groupKey];
  var ui = SpreadsheetApp.getUi();
  var r = setCbvSheetGroupHidden_(groupKey, hidden);
  if (!r.ok && r.reason === 'LAST_SHEET') {
    ui.alert('Ẩn tab', 'Không thể ẩn nhóm này: phải còn ít nhất một tab hiển thị. Hãy hiện một nhóm khác trước.', ui.ButtonSet.OK);
    return r;
  }
  if (!r.ok) {
    ui.alert('Tab', 'Nhóm không hợp lệ hoặc không có tab tương ứng.', ui.ButtonSet.OK);
    return r;
  }
  var action = hidden ? 'Đã ẩn' : 'Đã hiện';
  var label = g ? g.label : groupKey;
  ui.alert('Tab theo nhóm', action + ' — ' + label + ' (' + r.affected + ' tab trong file).', ui.ButtonSet.OK);
  return r;
}

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
