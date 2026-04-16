/**
 * CBV Deployment Audit Logger - Writes deployment report to ADMIN_AUDIT_LOG.
 * Non-destructive. Append-only.
 *
 * Dependencies: 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_LOGGER (logAdminAudit)
 */

/**
 * Writes deployment report to ADMIN_AUDIT_LOG. Used by runFullDeploymentImpl.
 * @param {Object} report - From runFullDeploymentImpl
 */
function generateDeploymentReportImpl(report) {
  if (!report) return;
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.ADMIN_AUDIT_LOG)
    ? CBV_CONFIG.SHEETS.ADMIN_AUDIT_LOG : 'ADMIN_AUDIT_LOG';
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet) return;

  var auditType = 'DEPLOYMENT_RUN';
  var entityType = 'SYSTEM';
  var entityId = report.runId || 'DEP_' + Date.now();
  var action = report.verdict || 'UNKNOWN';
  var note = buildDeploymentNote(report);

  if (typeof logAdminAudit === 'function') {
    logAdminAudit(auditType, entityType, entityId, action, {}, { report: report }, note);
    return;
  }

  // Fallback: append row directly
  var headers = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
  var idPrefix = typeof cbvMakeId === 'function' ? cbvMakeId('AAL') : 'AAL_' + Date.now();
  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var actor = typeof cbvUser === 'function' ? cbvUser() : 'system';
  var record = {
    ID: idPrefix,
    AUDIT_TYPE: auditType,
    ENTITY_TYPE: entityType,
    ENTITY_ID: entityId,
    ACTION: action,
    BEFORE_JSON: '{}',
    AFTER_JSON: JSON.stringify({ report: report }),
    NOTE: note,
    ACTOR_ID: actor,
    CREATED_AT: now
  };
  var row = headers.map(function(h) { return record[h] !== undefined ? record[h] : ''; });
  sheet.appendRow(row);
}

/**
 * Builds human-readable note from report.
 * @param {Object} report
 * @returns {string}
 */
function buildDeploymentNote(report) {
  var parts = [];
  parts.push('Verdict: ' + (report.verdict || '?'));
  if (report.summary) {
    parts.push('high=' + (report.summary.high || 0));
    parts.push('medium=' + (report.summary.medium || 0));
  }
  if (report.mustFix && report.mustFix.length > 0) {
    parts.push('mustFix=' + report.mustFix.length);
  }
  return parts.join(' | ');
}
