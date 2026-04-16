/**
 * CBV AppSheet Readiness Verification - Uses audit results.
 * Evaluates: duplicate headers, blank headers, missing keys, duplicate keys,
 * missing display columns, ref integrity, enum consistency, orphan rows.
 */
function verifyAppSheetReadinessImpl() {
  var audit = selfAuditBootstrapImpl({ writeHealthLog: false });
  var auditReport = audit.auditReport || {};
  var appsheetReady = auditReport.appsheetReady !== false;
  var mustFixNow = auditReport.mustFixNow || [];
  var warnings = auditReport.warnings || [];
  var findings = auditReport.findings || [];

  var blockers = findings.filter(function(f) {
    return f && (f.severity === 'CRITICAL' || f.severity === 'HIGH') && (
      (f.issue_code && f.issue_code.indexOf('SCHEMA_') === 0) ||
      f.issue_code === 'SCHEMA_DUPLICATE_HEADER' ||
      f.issue_code === 'SCHEMA_BLANK_HEADER' ||
      f.issue_code === 'DATA_DUPLICATE_KEY' ||
      f.issue_code === 'REF_ORPHAN' ||
      f.issue_code === 'APPSHEET_NOT_READY' ||
      f.issue_code === 'ENUM_DUPLICATE_VALUE' ||
      f.issue_code === 'ENUM_MISSING_GROUP' ||
      f.issue_code === 'ENUM_INVALID_USAGE'
    );
  }).map(function(f) { return (f.issue_code || '') + ': ' + (f.message || ''); });

  var reasons = mustFixNow.concat(warnings);
  var status = blockers.length > 0 ? 'FAIL' : (reasons.length > 0 ? 'WARN' : 'PASS');

  var result = {
    ok: appsheetReady,
    code: appsheetReady ? 'APPSHEET_READY' : 'APPSHEET_NOT_READY',
    message: appsheetReady ? 'AppSheet readiness verified' : 'AppSheet not ready: ' + (blockers[0] || 'review audit'),
    data: {
      tablesExist: getRequiredSheetNames().filter(function(n) {
        return SpreadsheetApp.getActive().getSheetByName(n) !== null;
      }),
      tablesMissing: getRequiredSheetNames().filter(function(n) {
        return SpreadsheetApp.getActive().getSheetByName(n) === null;
      }),
      appsheetReady: appsheetReady,
      status: status,
      blockers: blockers,
      reasons: reasons,
      auditReport: auditReport
    },
    errors: blockers,
    appsheetReady: appsheetReady,
    status: status,
    blockers: blockers,
    reasons: reasons
  };

  Logger.log('verifyAppSheetReadiness: status=' + status + ', appsheetReady=' + appsheetReady);
  return result;
}
