/**
 * CBV Audit Service - Self-audit and system health checks.
 */

/**
 * Basic audit: required sheets exist.
 * @returns {Object} { ok, code, message, data: { missingSheets } }
 */
function auditSystem() {
  const requiredSheets = getRequiredSheetNames();
  const ss = SpreadsheetApp.getActive();
  const existing = ss.getSheets().map(function (s) { return s.getName(); });
  const missing = requiredSheets.filter(function (name) { return existing.indexOf(name) === -1; });

  const result = {
    ok: missing.length === 0,
    code: missing.length === 0 ? 'AUDIT_OK' : 'AUDIT_FAIL',
    message: missing.length === 0 ? 'System audit passed' : 'Missing sheets: ' + missing.join(', '),
    data: { missingSheets: missing },
    errors: missing.length > 0 ? missing : []
  };
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Full bootstrap self-audit: sheets, headers, GAS symbols, triggers.
 * @returns {Object} Structured result compatible with bootstrap report format
 */
function selfAuditBootstrap() {
  const result = buildStructuredBootstrapReport();
  result.code = 'AUDIT_BOOTSTRAP';

  const requiredSheets = getRequiredSheetNames();
  const ss = SpreadsheetApp.getActive();

  requiredSheets.forEach(function (name) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) {
      result.data.mismatchedSheets.push({ sheet: name, reason: 'MISSING' });
      result.errors.push('Missing sheet: ' + name);
      return;
    }

    const expectedHeaders = getSchemaHeaders(name);
    const check = ensureHeadersMatchOrReport(sheet, expectedHeaders);

    if (!check.match) {
      let detail = 'Unknown';
      if (check.mismatchReason === 'HEADER_MISMATCH' && check.mismatchAt !== undefined) {
        detail = 'Col ' + (check.mismatchAt + 1) + ': expected "' + check.expected + '", got "' + check.actual + '"';
      } else if (check.extraColumns && check.extraColumns.length) {
        detail = 'Extra: ' + check.extraColumns.join(', ');
      } else if (check.canExtend && check.missingCount) {
        detail = 'Missing ' + check.missingCount + ' columns at end';
      }
      result.data.mismatchedSheets.push({
        sheet: name,
        reason: check.mismatchReason || (check.canExtend ? 'INCOMPLETE_HEADERS' : 'HEADER_MISMATCH'),
        detail: detail
      });
      result.errors.push('Header mismatch: ' + name);
    }
  });

  const triggers = ScriptApp.getProjectTriggers();
  const dailyExists = triggers.some(function (t) { return t.getHandlerFunction() === 'dailyHealthCheck'; });
  if (!dailyExists) {
    result.data.warnings.push('Trigger dailyHealthCheck not installed - run installTriggers()');
  }

  result.ok = result.data.mismatchedSheets.length === 0;
  result.code = result.ok ? 'AUDIT_OK' : 'AUDIT_FAIL';
  result.message = result.ok
    ? 'Bootstrap self-audit passed'
    : 'Bootstrap audit found issues - review mismatchedSheets';

  Logger.log('selfAuditBootstrap: ' + JSON.stringify(result, null, 2));
  return result;
}
