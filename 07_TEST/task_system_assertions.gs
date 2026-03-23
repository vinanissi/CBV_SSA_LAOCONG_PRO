/**
 * CBV Task System Assertions - Test helpers for validation.
 * Idempotent, safe. Use with task_system_test_runner.gs.
 * Dependencies: 00_CORE_CONFIG (optional; uses CBV_CONFIG.SHEETS if available)
 */

/** Severity levels */
var TEST_SEVERITY = { HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW', INFO: 'INFO' };

/** Logs a test result and optional finding */
function logTestResult(name, ok, message, severity, rowId, field) {
  var s = severity || TEST_SEVERITY.MEDIUM;
  return {
    name: name,
    ok: ok === true,
    message: message || (ok ? 'OK' : 'FAIL'),
    severity: s,
    rowId: rowId || '',
    field: field || ''
  };
}

/**
 * Asserts expected === actual.
 * @param {*} expected
 * @param {*} actual
 * @param {string} message
 * @returns {{ ok: boolean, message: string }}
 */
function assertEquals(expected, actual, message) {
  var ok = expected === actual;
  return {
    ok: ok,
    message: message || (ok ? 'OK' : 'Expected ' + expected + ', got ' + actual)
  };
}

/**
 * Asserts condition is true.
 * @param {boolean} condition
 * @param {string} message
 * @returns {{ ok: boolean, message: string }}
 */
function assertTrue(condition, message) {
  return {
    ok: condition === true,
    message: message || (condition ? 'OK' : 'Expected true')
  };
}

/**
 * Asserts value is not empty (not null, not '', not undefined).
 * @param {*} value
 * @param {string} message
 * @returns {{ ok: boolean, message: string }}
 */
function assertNotEmpty(value, message) {
  var empty = value === null || value === undefined || String(value).trim() === '';
  return {
    ok: !empty,
    message: message || (empty ? 'Value is empty' : 'OK')
  };
}

/**
 * Asserts ref exists in given set of IDs.
 * @param {string} refValue - ID to check
 * @param {Object} idSet - { id: true } map
 * @param {string} refName - e.g. 'OWNER_ID'
 * @param {string} rowId - Row identifier for reporting
 * @returns {{ ok: boolean, message: string, rowId: string, field: string }}
 */
function assertRefExists(refValue, idSet, refName, rowId) {
  if (!refValue || String(refValue).trim() === '') {
    return { ok: true, message: 'OK', rowId: rowId || '', field: refName || '' };
  }
  var ok = idSet && idSet[String(refValue).trim()] === true;
  return {
    ok: ok,
    message: ok ? 'OK' : 'Ref ' + refName + '=' + refValue + ' not found',
    rowId: rowId || '',
    field: refName || ''
  };
}

/**
 * Asserts enum value is in allowed set.
 * @param {string} value
 * @param {string[]} allowed
 * @param {string} fieldName
 * @param {string} rowId
 * @returns {{ ok: boolean, message: string, rowId: string, field: string }}
 */
function assertValidEnum(value, allowed, fieldName, rowId) {
  if (!value || String(value).trim() === '') {
    return { ok: false, message: 'Empty ' + fieldName, rowId: rowId || '', field: fieldName || '' };
  }
  var v = String(value).trim();
  var ok = allowed && allowed.indexOf(v) !== -1;
  return {
    ok: ok,
    message: ok ? 'OK' : fieldName + '=' + v + ' not in [' + (allowed ? allowed.join(',') : '') + ']',
    rowId: rowId || '',
    field: fieldName || ''
  };
}

/**
 * Builds ID set from sheet column.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} idCol - Column name (e.g. 'ID')
 * @param {Object} headers - { COL: index }
 * @returns {Object} { id: true }
 */
function buildIdSet(sheet, idCol, headers) {
  if (!sheet || sheet.getLastRow() < 2) return {};
  var idx = headers[idCol];
  if (idx === undefined || idx < 0) return {};
  var values = sheet.getRange(2, idx + 1, sheet.getLastRow(), idx + 1).getValues();
  var set = {};
  values.forEach(function(r) {
    var id = String(r[0] || '').trim();
    if (id) set[id] = true;
  });
  return set;
}

/**
 * Builds enum value set from ENUM_DICTIONARY for a group.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} enumSheet
 * @param {string} group - ENUM_GROUP
 * @param {Object} headers - { ENUM_GROUP: i, ENUM_VALUE: j, IS_ACTIVE: k }
 * @returns {string[]}
 */
function buildEnumValueSet(enumSheet, group, headers) {
  if (!enumSheet || enumSheet.getLastRow() < 2) return [];
  var rows = enumSheet.getRange(2, 1, enumSheet.getLastRow(), enumSheet.getLastColumn()).getValues();
  var h = headers;
  var gi = h.ENUM_GROUP >= 0 ? h.ENUM_GROUP : -1;
  var vi = h.ENUM_VALUE >= 0 ? h.ENUM_VALUE : -1;
  var ai = h.IS_ACTIVE >= 0 ? h.IS_ACTIVE : -1;
  var out = [];
  rows.forEach(function(r) {
    var g = gi >= 0 ? String(r[gi] || '').trim() : '';
    if (g !== group) return;
    var v = vi >= 0 ? String(r[vi] || '').trim() : '';
    if (!v) return;
    var active = ai < 0 ? true : (r[ai] === true || String(r[ai]) === 'true');
    if (active) out.push(v);
  });
  return out;
}

/**
 * Converts headers array to { COL: index } map.
 * @param {string[]} headers
 * @returns {Object}
 */
function headersToMap(headers) {
  var m = {};
  if (!headers || !headers.length) return m;
  headers.forEach(function(h, i) {
    m[h] = i;
  });
  return m;
}

/**
 * Gets sheet by name. Uses CBV_CONFIG.SHEETS if available.
 * @param {string} logicalName - e.g. 'USER_DIRECTORY'
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function _testSheet(logicalName) {
  var ss = SpreadsheetApp.getActive();
  var name = logicalName;
  if (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS[logicalName]) {
    name = CBV_CONFIG.SHEETS[logicalName];
  }
  return ss.getSheetByName(name) || null;
}
