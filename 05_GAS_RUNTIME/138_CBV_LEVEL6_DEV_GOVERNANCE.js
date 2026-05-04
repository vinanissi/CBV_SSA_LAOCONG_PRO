/**
 * CBV Level 6 Pro — dev governance checks.
 * Dependencies: 130, 133, 134
 */

/**
 * @param {Object} record
 * @returns {Object}
 */
function CBV_L6_logGovernanceCheck(record) {
  try {
    cbvL6EnsureCoreSheet_('DEV_GOVERNANCE_CHECK', 'DEV_GOVERNANCE_CHECK');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.DEV_GOVERNANCE_CHECK);
    var r = record || {};
    var id = r.CHECK_ID || r.checkId || cbvCoreV2NewEventId_('GOV');
    cbvCoreV2AppendRowByHeaders_(sheet, {
      CHECK_ID: id,
      MODULE_CODE: String(r.MODULE_CODE || r.moduleCode || 'L6'),
      CHECK_NAME: String(r.CHECK_NAME || r.checkName || 'UNKNOWN'),
      SEVERITY: String(r.SEVERITY || r.severity || 'INFO'),
      STATUS: String(r.STATUS || r.status || 'OK'),
      MESSAGE: String(r.MESSAGE || r.message || ''),
      CREATED_AT: cbvCoreV2IsoNow_(),
      PAYLOAD_JSON: r.PAYLOAD_JSON != null ? cbvCoreV2SafeStringify_(r.PAYLOAD_JSON) : (r.payload != null ? cbvCoreV2SafeStringify_(r.payload) : '')
    });
    return { ok: true, code: 'GOV_LOGGED', message: 'OK', data: { checkId: id }, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}

/**
 * @returns {Object}
 */
function CBV_L6_checkNoVersionInTechnicalCommand() {
  var issues = [];
  var reBad = /\b(HOSO|HO_SO)_V[0-9]+[^A-Za-z0-9_]?/i;
  var reLegacyCmd = /\b(HO_SO_(CREATE|UPDATE|SEARCH|PRINT|ATTACH_FILE|GET_DETAIL|CHANGE_STATUS|IMPORT_BATCH|REBUILD_SEARCH_INDEX|HEALTH_CHECK)|HOSO_V2_2_[A-Z0-9_]+)\b/;
  var ss = cbvCoreV2GetSpreadsheet_();

  function scanSheet_(sheetName, label) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 1) return;
    var lr = sheet.getLastRow();
    var lc = Math.min(30, Math.max(sheet.getLastColumn(), 1));
    var data = sheet.getRange(1, 1, lr, lc).getValues();
    var r;
    for (r = 0; r < data.length; r++) {
      var col;
      for (col = 0; col < data[r].length; col++) {
        var cell = String(data[r][col] || '');
        if (reBad.test(cell)) {
          issues.push({ where: label, row: r + 1, col: col + 1, sample: cell.slice(0, 120) });
        }
        if (reLegacyCmd.test(cell)) {
          issues.push({ where: label, row: r + 1, col: col + 1, issue: 'LEGACY_COMMAND_TOKEN', sample: cell.slice(0, 120) });
        }
      }
    }
  }

  scanSheet_(CBV_CORE_V2.SHEETS.CONFIG_REGISTRY, 'CONFIG_REGISTRY');
  scanSheet_(CBV_CORE_V2.SHEETS.MODULE_REGISTRY, 'MODULE_REGISTRY');

  return { ok: issues.length === 0, issues: issues };
}

/**
 * @returns {Object}
 */
function CBV_L6_checkNoLegacyHosoSheetUsage() {
  var issues = [];
  if (typeof HO_SO_V2 !== 'undefined' && HO_SO_V2.SHEETS) {
    var master = String(HO_SO_V2.SHEETS.MASTER || '');
    if (master && master !== 'HO_SO_MASTER') {
      issues.push({ check: 'HOSO_MASTER_NAME', message: 'HO_SO_V2.MASTER is not default HO_SO_MASTER: ' + master });
    }
  }
  var flag = cbvL6ReadGovernanceConfigFlag_('HOSO_USE_LEGACY_SHEETS');
  if (String(flag).toUpperCase() === 'TRUE') {
    issues.push({ check: 'CONFIG', message: 'HOSO_USE_LEGACY_SHEETS is TRUE' });
  }
  return { ok: issues.length === 0, issues: issues };
}

/**
 * @param {string} key
 * @returns {string}
 */
function cbvL6ReadGovernanceConfigFlag_(key) {
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.CONFIG_REGISTRY);
  if (!sheet) return '';
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var kCol = map['CONFIG_KEY'];
  var jCol = map['CONFIG_JSON'];
  if (!kCol || !jCol) return '';
  var last = sheet.getLastRow();
  if (last < 2) return '';
  var r;
  for (r = 2; r <= last; r++) {
    if (String(sheet.getRange(r, kCol).getValue() || '').trim() === key) {
      return String(sheet.getRange(r, jCol).getValue() || '');
    }
  }
  return '';
}

/**
 * @returns {Object}
 */
function CBV_L6_checkRequiredPublicFunctions() {
  var required = [
    'CBV_CoreV2_bootstrap',
    'CBV_CoreV2_dispatch',
    'CBV_L6_bootstrapHardening',
    'CBV_L6_hardeningSelfTest',
    'CBV_Config_getDbId',
    'CBV_Config_getSheetName',
    'HosoCommandHandler_handle'
  ];
  var g = cbvCoreV2GlobalThis_();
  var missing = [];
  var i;
  for (i = 0; i < required.length; i++) {
    if (typeof g[required[i]] !== 'function') missing.push(required[i]);
  }
  return { ok: missing.length === 0, missing: missing };
}

/**
 * @returns {Object}
 */
function CBV_L6_checkHardeningSheetsPresent_() {
  var keys = Object.keys(CBV_LEVEL6.SHEETS);
  var missing = [];
  var i;
  for (i = 0; i < keys.length; i++) {
    var name = CBV_LEVEL6.SHEETS[keys[i]];
    if (!cbvCoreV2GetSpreadsheet_().getSheetByName(name)) missing.push(name);
  }
  return { ok: missing.length === 0, missing: missing };
}

/**
 * @returns {Object}
 */
function CBV_L6_checkSchemaHosoMaster_() {
  var sh = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.SCHEMA_REGISTRY);
  if (!sh) return { ok: false, message: 'SCHEMA_REGISTRY missing' };
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var mCol = map['MODULE_CODE'];
  var tCol = map['TABLE_CODE'];
  if (!mCol || !tCol) return { ok: false, message: 'Bad headers' };
  var last = sh.getLastRow();
  var r;
  for (r = 2; r <= last; r++) {
    var mc = cbvL6NormalizeModuleCode_(String(sh.getRange(r, mCol).getValue() || ''));
    var tc = String(sh.getRange(r, tCol).getValue() || '').toUpperCase();
    if (mc === 'HOSO' && tc === 'MASTER') return { ok: true, message: 'HOSO MASTER present' };
  }
  return { ok: false, message: 'No HOSO MASTER rows' };
}

/**
 * @returns {Object}
 */
function CBV_L6_checkPermissionAdminSeeded_() {
  var sh = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.PERMISSION_RULE);
  if (!sh) return { ok: false, message: 'PERMISSION_RULE missing' };
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var roleCol = map['ROLE'];
  var last = sh.getLastRow();
  if (last < 2 || !roleCol) return { ok: false, message: 'Empty' };
  var r;
  for (r = 2; r <= last; r++) {
    if (String(sh.getRange(r, roleCol).getValue() || '').toUpperCase() === 'ADMIN') return { ok: true, message: 'ADMIN rule present' };
  }
  return { ok: false, message: 'No ADMIN role rule' };
}

/**
 * @returns {Object}
 */
function CBV_L6_runDevGovernanceCheck() {
  var checks = [];
  var overall = true;

  var v1 = CBV_L6_checkNoVersionInTechnicalCommand();
  checks.push({ name: 'NO_VERSION_IN_TECHNICAL_COMMAND', ok: v1.ok, detail: v1 });
  if (!v1.ok) overall = false;

  var v2 = CBV_L6_checkNoLegacyHosoSheetUsage();
  checks.push({ name: 'NO_LEGACY_HOSO_SHEET_USAGE', ok: v2.ok, detail: v2 });
  if (!v2.ok) overall = false;

  var v3 = CBV_L6_checkRequiredPublicFunctions();
  checks.push({ name: 'REQUIRED_PUBLIC_FUNCTIONS', ok: v3.ok, detail: v3 });
  if (!v3.ok) overall = false;

  var v4 = CBV_L6_checkHardeningSheetsPresent_();
  checks.push({ name: 'HARDENING_SHEETS', ok: v4.ok, detail: v4 });
  if (!v4.ok) overall = false;

  var v5 = CBV_L6_checkSchemaHosoMaster_();
  checks.push({ name: 'SCHEMA_HOSO_MASTER', ok: v5.ok, detail: v5 });
  if (!v5.ok) overall = false;

  var v6 = CBV_L6_checkPermissionAdminSeeded_();
  checks.push({ name: 'PERMISSION_ADMIN', ok: v6.ok, detail: v6 });
  if (!v6.ok) overall = false;

  var severity = overall ? 'INFO' : 'WARN';
  CBV_L6_logGovernanceCheck({
    CHECK_NAME: 'CBV_L6_runDevGovernanceCheck',
    SEVERITY: severity,
    STATUS: overall ? 'OK' : 'WARN',
    MESSAGE: overall ? 'All governance checks passed' : 'Some checks failed',
    PAYLOAD_JSON: { checks: checks }
  });

  return {
    ok: overall,
    checks: checks,
    summary: overall ? 'GOVERNANCE_OK' : 'GOVERNANCE_WARN'
  };
}
