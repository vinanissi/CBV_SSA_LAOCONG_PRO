/**
 * CBV Task System Assertions - Test helpers for validation.
 * Source: 07_TEST/task_system_assertions.js
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

/** @returns {{ ok: boolean, message: string }} */
function assertEquals(expected, actual, message) {
  var ok = expected === actual;
  return { ok: ok, message: message || (ok ? 'OK' : 'Expected ' + expected + ', got ' + actual) };
}

/** @returns {{ ok: boolean, message: string }} */
function assertTrue(condition, message) {
  return { ok: condition === true, message: message || (condition ? 'OK' : 'Expected true') };
}

/** @returns {{ ok: boolean, message: string }} */
function assertNotEmpty(value, message) {
  var empty = value === null || value === undefined || String(value).trim() === '';
  return { ok: !empty, message: message || (empty ? 'Value is empty' : 'OK') };
}

/** @returns {{ ok: boolean, message: string, rowId: string, field: string }} */
function assertRefExists(refValue, idSet, refName, rowId) {
  if (!refValue || String(refValue).trim() === '') {
    return { ok: true, message: 'OK', rowId: rowId || '', field: refName || '' };
  }
  var ok = idSet && idSet[String(refValue).trim()] === true;
  return { ok: ok, message: ok ? 'OK' : 'Ref ' + refName + '=' + refValue + ' not found', rowId: rowId || '', field: refName || '' };
}

/** @returns {{ ok: boolean, message: string, rowId: string, field: string }} */
function assertValidEnum(value, allowed, fieldName, rowId) {
  if (!value || String(value).trim() === '') {
    return { ok: false, message: 'Empty ' + fieldName, rowId: rowId || '', field: fieldName || '' };
  }
  var v = String(value).trim();
  var ok = allowed && allowed.indexOf(v) !== -1;
  return { ok: ok, message: ok ? 'OK' : fieldName + '=' + v + ' not in allowed', rowId: rowId || '', field: fieldName || '' };
}
