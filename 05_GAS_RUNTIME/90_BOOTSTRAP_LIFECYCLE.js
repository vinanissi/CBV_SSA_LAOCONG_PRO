/**
 * CBV Bootstrap Lifecycle - Orchestration, SYSTEM_HEALTH_LOG, safe schema append.
 * Integrates selfAuditBootstrap, initAll, verifyAppSheetReadiness.
 */

/** Default initAll options */
var BOOTSTRAP_DEFAULT_OPTIONS = {
  appendMissingColumns: false,
  writeHealthLog: true,
  failOnCritical: false,
  verbose: true
};

/**
 * Merge user options with defaults. Safe merge.
 * @param {Object} opts - User options
 * @returns {Object} Merged options
 */
function mergeBootstrapOptions(opts) {
  opts = opts || {};
  return {
    appendMissingColumns: opts.appendMissingColumns === true,
    writeHealthLog: opts.writeHealthLog !== false,
    failOnCritical: opts.failOnCritical === true,
    verbose: opts.verbose !== false
  };
}

/**
 * Create SYSTEM_HEALTH_LOG sheet if missing. Idempotent.
 * @returns {{ created: boolean, sheet: GoogleAppsScript.Spreadsheet.Sheet }}
 */
function createOrEnsureSystemHealthLogSheet() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(SYSTEM_HEALTH_LOG_SHEET);
  var created = !sheet;
  if (!sheet) {
    sheet = ss.insertSheet(SYSTEM_HEALTH_LOG_SHEET);
  }
  var headers = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
  var expected = SYSTEM_HEALTH_LOG_HEADERS;
  if (headers.length === 0 || headers.length < expected.length) {
    sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
  }
  return { created: created, sheet: sheet };
}

/**
 * Append one summary row to SYSTEM_HEALTH_LOG.
 * @param {Object} summary - Health summary object
 */
function appendSystemHealthLogRow(summary) {
  try {
    var sh = createOrEnsureSystemHealthLogSheet();
    var sheet = sh.sheet;
    var runId = typeof cbvMakeId === 'function' ? cbvMakeId('SHL') : 'SHL_' + new Date().getTime();
    var runAt = (summary.auditRunAt || new Date().toISOString());
    var totals = summary.totals || {};
    var mustFixStr = Array.isArray(summary.mustFixNow) ? summary.mustFixNow.join('; ') : '';
    var warnStr = Array.isArray(summary.warnings) ? summary.warnings.join('; ') : '';
    if (mustFixStr.length > 4000) mustFixStr = mustFixStr.substring(0, 3997) + '...';
    if (warnStr.length > 4000) warnStr = warnStr.substring(0, 3997) + '...';
    var summaryJson = JSON.stringify({
      systemHealth: summary.systemHealth,
      bootstrapSafe: summary.bootstrapSafe,
      appsheetReady: summary.appsheetReady,
      top5: (summary.top10Issues || []).slice(0, 5)
    });
    if (summaryJson.length > 4000) summaryJson = summaryJson.substring(0, 3997) + '...';
    var row = [
      runId,
      runAt,
      summary.systemHealth || '',
      summary.bootstrapSafe ? 'YES' : 'NO',
      summary.appsheetReady ? 'YES' : 'NO',
      totals.critical || 0,
      totals.high || 0,
      totals.medium || 0,
      totals.low || 0,
      totals.info || 0,
      summary.schemaUpdated ? 'YES' : 'NO',
      summary.appendedColumnsCount || 0,
      mustFixStr,
      warnStr,
      summaryJson
    ];
    sheet.appendRow(row);
  } catch (e) {
    Logger.log('appendSystemHealthLogRow error: ' + e);
  }
}

/**
 * Get missing columns: expected minus current. Order preserved for append.
 * @param {string[]} currentHeaders
 * @param {string[]} expectedHeaders
 * @returns {string[]} Columns to append (in expected order)
 */
function getMissingColumnsForAppend(currentHeaders, expectedHeaders) {
  var currentSet = {};
  currentHeaders.forEach(function(h) { currentSet[String(h || '').trim()] = true; });
  return expectedHeaders.filter(function(e) {
    var k = String(e || '').trim();
    return k && !currentSet[k];
  });
}

/**
 * Append missing columns to sheet. Only appends at end. Never reorders/renames/deletes.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string[]} columnsToAppend
 * @returns {{ appended: number, columns: string[] }}
 */
function appendMissingColumnsToSheet(sheet, columnsToAppend) {
  if (!sheet || !columnsToAppend || columnsToAppend.length === 0) {
    return { appended: 0, columns: [] };
  }
  var lastCol = sheet.getLastColumn();
  var currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var newHeaders = currentHeaders.concat(columnsToAppend);
  sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
  return { appended: columnsToAppend.length, columns: columnsToAppend };
}

/**
 * Ensure schema: compare to manifest, optionally append missing columns.
 * Safe: only append, never reorder/rename/delete.
 * @param {Object} options - { appendMissingColumns: boolean }
 * @returns {{ schemaUpdated: boolean, appendedColumns: Array<{table:string, columns:string[]}>, findings: string[] }}
 */
function ensureSchema(options) {
  options = options || {};
  var appendMissingColumns = options.appendMissingColumns === true;
  var schemaUpdated = false;
  var appendedColumns = [];
  var findings = [];
  var sheetNames = getRequiredSheetNames();

  sheetNames.forEach(function(name) {
    var sheet = SpreadsheetApp.getActive().getSheetByName(name);
    if (!sheet) return;
    var expected = getSchemaHeaders(name);
    var lastCol = sheet.getLastColumn();
    var currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    var missing = getMissingColumnsForAppend(currentHeaders, expected);

    if (missing.length > 0) {
      findings.push(name + ': missing columns ' + missing.join(', '));
      if (appendMissingColumns) {
        var result = appendMissingColumnsToSheet(sheet, missing);
        if (result.appended > 0) {
          schemaUpdated = true;
          appendedColumns.push({ table: name, columns: result.columns });
        }
      }
    }
  });

  return { schemaUpdated: schemaUpdated, appendedColumns: appendedColumns, findings: findings };
}

/**
 * Check if critical issues exist and we should abort.
 * @param {Object} auditReport
 * @returns {{ shouldAbort: boolean, reason: string }}
 */
function maybeAbortOnCritical(auditReport) {
  if (!auditReport || !auditReport.totals) return { shouldAbort: false, reason: '' };
  var critical = auditReport.totals.critical || 0;
  if (critical > 0) {
    return { shouldAbort: true, reason: 'Critical issues: ' + critical + '. Fix before continuing.' };
  }
  return { shouldAbort: false, reason: '' };
}

/**
 * Build final bootstrap summary for initAll return.
 * @param {Object} params
 * @returns {Object}
 */
function buildBootstrapSummary(params) {
  var auditReport = params.auditReport || {};
  var schemaResult = params.schemaResult || {};
  var verifyResult = params.verifyResult || {};
  var bootstrapSafe = auditReport.bootstrapSafe !== false;
  var appsheetReady = auditReport.appsheetReady !== false;
  var appended = schemaResult.appendedColumns || [];
  var appendedCount = appended.reduce(function(sum, a) { return sum + (a.columns ? a.columns.length : 0); }, 0);

  var nextSteps = [];
  if (bootstrapSafe) {
    nextSteps.push('Run verifyAppSheetReadiness() to confirm AppSheet sync');
    if (appendedCount > 0) nextSteps.push('Refresh AppSheet schema to pick up new columns');
  } else {
    nextSteps.push('Fix MUST_FIX_NOW items from audit');
    nextSteps.push('Re-run initAll() after fixes');
  }

  return {
    ok: bootstrapSafe,
    bootstrapSafe: bootstrapSafe,
    appsheetReady: appsheetReady,
    schemaUpdated: schemaResult.schemaUpdated || false,
    appendedColumns: appended,
    appendedColumnsCount: appendedCount,
    auditSummary: {
      systemHealth: auditReport.systemHealth,
      totals: auditReport.totals,
      mustFixNow: auditReport.mustFixNow,
      warnings: auditReport.warnings
    },
    verifyResult: {
      status: verifyResult.status,
      blockers: verifyResult.blockers,
      reasons: verifyResult.reasons
    },
    nextSteps: nextSteps
  };
}
