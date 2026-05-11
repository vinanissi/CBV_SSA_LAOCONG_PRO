/**
 * CBV Test Console Runtime V2 — report envelope contract (V2).
 */

var CBV_TEST_CONSOLE_CONTRACT_VERSION = '2.0.0';

var CBV_TEST_CONSOLE_ENVELOPE_KEYS_ = [
  'ok',
  'phase',
  'status',
  'checkedAt',
  'runBy',
  'traceId',
  'testSuite',
  'summary',
  'checks',
  'warnings',
  'errors',
  'nextStep',
  'severity',
  'reportText',
  'reportJson',
  'contractVersion',
  'envelopeOk'
];

/**
 * @param {*} sev
 * @returns {number}
 */
function CBV_TestConsole_severityRank_(sev) {
  var s = String(sev || '').toUpperCase();
  if (s === 'CRITICAL') return 4;
  if (s === 'ERROR') return 3;
  if (s === 'WARNING') return 2;
  if (s === 'OK') return 1;
  return 0;
}

/**
 * @param {Object} report
 * @returns {{ envelopeOk: boolean, errors: string[] }}
 */
function CBV_TestConsole_validateReportEnvelope_(report) {
  var errors = [];
  var i;
  if (!report || typeof report !== 'object') {
    return { envelopeOk: false, errors: ['REPORT_NOT_OBJECT'] };
  }
  for (i = 0; i < CBV_TEST_CONSOLE_ENVELOPE_KEYS_.length; i++) {
    var k = CBV_TEST_CONSOLE_ENVELOPE_KEYS_[i];
    if (!Object.prototype.hasOwnProperty.call(report, k)) errors.push('MISSING:' + k);
  }
  if (!Array.isArray(report.checks)) errors.push('CHECKS_NOT_ARRAY');
  if (!Array.isArray(report.warnings)) errors.push('WARNINGS_NOT_ARRAY');
  if (!Array.isArray(report.errors)) errors.push('ERRORS_NOT_ARRAY');
  var st = String(report.status || '');
  if (st !== 'GO' && st !== 'GO_WITH_WARNINGS' && st !== 'FAIL') errors.push('BAD_STATUS');
  return { envelopeOk: errors.length === 0, errors: errors };
}

/**
 * @param {Object} report
 * @returns {string}
 */
function CBV_TestConsole_buildReportMarkdown_(report) {
  var r = report || {};
  var lines = [];
  lines.push('# CBV TEST CONSOLE REPORT');
  lines.push('');
  lines.push('## Metadata');
  lines.push('');
  lines.push('- Phase: ' + String(r.phase != null ? r.phase : ''));
  lines.push('- Status: ' + String(r.status != null ? r.status : ''));
  lines.push('- Severity: ' + String(r.severity != null ? r.severity : ''));
  lines.push('- CheckedAt: ' + String(r.checkedAt != null ? r.checkedAt : ''));
  lines.push('- RunBy: ' + String(r.runBy != null ? r.runBy : ''));
  lines.push('- TraceId: ' + String(r.traceId != null ? r.traceId : ''));
  lines.push('- TestSuite: ' + String(r.testSuite != null ? r.testSuite : ''));
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(String(r.summary != null ? r.summary : ''));
  lines.push('');
  lines.push('## Checks');
  lines.push('');
  var checks = r.checks || [];
  var j;
  for (j = 0; j < checks.length; j++) {
    var c = checks[j] || {};
    var tag = String(c.severity || 'OK').toUpperCase();
    lines.push('- [' + tag + '] ' + String(c.code || '') + ' — ' + String(c.message || ''));
  }
  if (!checks.length) lines.push('- (no checks)');
  lines.push('');
  lines.push('## Warnings');
  lines.push('');
  var w = r.warnings || [];
  for (j = 0; j < w.length; j++) lines.push('- ' + String(w[j]));
  if (!w.length) lines.push('- (none)');
  lines.push('');
  lines.push('## Errors');
  lines.push('');
  var er = r.errors || [];
  for (j = 0; j < er.length; j++) lines.push('- ' + String(er[j]));
  if (!er.length) lines.push('- (none)');
  lines.push('');
  lines.push('## Next Step');
  lines.push('');
  lines.push(String(r.nextStep != null ? r.nextStep : ''));
  lines.push('');
  lines.push('## Raw JSON');
  lines.push('');
  lines.push('```json');
  lines.push(String(r.reportJson != null ? r.reportJson : '{}'));
  lines.push('```');
  lines.push('');
  return lines.join('\n');
}
