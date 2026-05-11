/**
 * CBV Operational Verification Runtime — Phase D (verify → governance → risk → gate → artifacts).
 */

var CBV_TEST_CONSOLE_BUNDLE_CACHE_KEY_ = 'CBV_TC_LAST_VERIFICATION_BUNDLE_V1';
var CBV_TEST_CONSOLE_BUNDLE_MAX_CHARS_ = 90000;

/**
 * @param {Object} report
 * @param {Object} [boundaryResult]
 * @returns {{
 *   ok: boolean,
 *   verificationChecks: Object[],
 *   verificationWarnings: string[],
 *   verificationErrors: string[],
 *   governanceOk: boolean,
 *   runtimeSafe: boolean,
 *   riskScore: number|null
 * }}
 */
function CBV_TestConsole_verifyReport_(report, boundaryResult) {
  var r = report || {};
  var b = boundaryResult || {};
  var verificationChecks = [];
  var verificationWarnings = [];
  var verificationErrors = [];

  function addCh(code, ok, msg, detail) {
    verificationChecks.push({
      code: String(code || ''),
      ok: !!ok,
      message: String(msg || ''),
      detail: detail != null ? detail : ''
    });
  }

  var env = CBV_TestConsole_validateReportEnvelope_(r);
  addCh('ENVELOPE', env.envelopeOk, env.envelopeOk ? 'Envelope keys OK' : 'Envelope invalid', env.errors || []);
  if (!env.envelopeOk) {
    (env.errors || []).forEach(function (er) {
      verificationErrors.push(String(er));
    });
  }

  if (!String(r.traceId || '').trim()) {
    verificationErrors.push('MISSING_TRACE_ID');
    addCh('TRACE_ID', false, 'traceId missing', '');
  } else {
    addCh('TRACE_ID', true, 'traceId present', r.traceId);
  }

  var st = String(r.status || '').toUpperCase();
  var sev = String(r.severity || '').toUpperCase();
  if (st === 'FAIL' && (sev === 'OK' || sev === 'WARNING')) {
    verificationWarnings.push('STATUS_SEVERITY_MISMATCH: FAIL with low severity label');
    addCh('STATUS_SEVERITY', false, 'Mismatch', { status: st, severity: sev });
  }

  var checks = r.checks || [];
  if (!checks.length && st === 'GO') {
    verificationWarnings.push('NO_CHECKS_BUT_GO');
    addCh('CHECKS_EMPTY', false, 'No checks while status GO', '');
  }

  var i;
  for (i = 0; i < checks.length; i++) {
    var c = checks[i] || {};
    if (!Object.prototype.hasOwnProperty.call(c, 'code') || !Object.prototype.hasOwnProperty.call(c, 'ok')) {
      verificationWarnings.push('MALFORMED_CHECK_AT_' + i);
      addCh('MALFORMED_CHECK', false, 'check missing code/ok', c);
    }
    var msg = String(c.message != null ? c.message : '');
    if (/deleteAllProperties/i.test(msg) || /deleteSheet\s*\(/i.test(msg)) {
      verificationErrors.push('UNSAFE_MUTATION_TOKEN_IN_CHECK:' + i);
      addCh('UNSAFE_MUTATION', false, 'Forbidden token in check message', c);
    }
  }

  var runtimeSafe = b.runtimeSafe !== false && b.allowed !== false;

  var ok = verificationErrors.length === 0;
  return {
    ok: ok,
    verificationChecks: verificationChecks,
    verificationWarnings: verificationWarnings,
    verificationErrors: verificationErrors,
    governanceOk: true,
    runtimeSafe: runtimeSafe,
    riskScore: null
  };
}

/**
 * @param {Object} report
 * @returns {string}
 */
function CBV_TestConsole_buildAiHandoffPromptPhaseD_(report) {
  var base = typeof CBV_TestConsole_buildAiHandoffPrompt_ === 'function' ? CBV_TestConsole_buildAiHandoffPrompt_(report) : '';
  var r = report || {};
  var dg = r.decisionGate || {};
  var risk = r.risk || {};
  var gov = r.governance || {};
  var ver = r.verification || {};
  var lines = [];
  lines.push('');
  lines.push('## Phase D — Verification / Governance / Risk / Gate');
  lines.push('');
  lines.push('```json');
  try {
    lines.push(
      JSON.stringify(
        {
          verification: { ok: ver.ok, errors: ver.verificationErrors, warnings: ver.verificationWarnings },
          governance: { ok: gov.ok, violations: gov.violations },
          risk: risk,
          decisionGate: dg
        },
        null,
        2
      )
    );
  } catch (e0) {
    lines.push('{}');
  }
  lines.push('```');
  lines.push('');
  return String(base || '') + lines.join('\n');
}

/**
 * @param {Object} report
 */
function CBV_TestConsole_cacheLastVerificationBundle_(report) {
  try {
    var slim = {
      checkedAt: report && report.checkedAt,
      traceId: report && report.traceId,
      testSuite: report && report.testSuite,
      status: report && report.status,
      severity: report && report.severity,
      summary: report && report.summary,
      nextStep: report && report.nextStep,
      checks: report && report.checks,
      warnings: report && report.warnings,
      errors: report && report.errors,
      verification: report && report.verification,
      governance: report && report.governance,
      risk: report && report.risk,
      decisionGate: report && report.decisionGate,
      registrySuite: report && report.registrySuite
    };
    var s = JSON.stringify(slim);
    if (s.length > CBV_TEST_CONSOLE_BUNDLE_MAX_CHARS_) {
      slim.summary = String(slim.summary || '').slice(0, 4000) + '…[TRUNCATED_FOR_USERPROP]';
      slim.checks = (slim.checks || []).slice(0, 80);
      s = JSON.stringify(slim);
    }
    PropertiesService.getUserProperties().setProperty(CBV_TEST_CONSOLE_BUNDLE_CACHE_KEY_, s);
  } catch (e) {
    Logger.log('cacheLastVerificationBundle_: ' + e);
  }
}

/**
 * @returns {Object|null}
 */
function CBV_TestConsole_getLastVerificationBundleSlim_() {
  try {
    var raw = PropertiesService.getUserProperties().getProperty(CBV_TEST_CONSOLE_BUNDLE_CACHE_KEY_);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * @param {string} suiteCode
 * @returns {{ report: Object, aiHandoff: string, blocked: boolean, boundary: Object }}
 */
function CBV_TestConsole_runFullVerificationPipeline_(suiteCode) {
  var code = String(suiteCode || '').trim().toUpperCase();
  CBV_TestConsole_registerDefaultSuites_();
  var suite = CBV_TestConsole_getSuite_(code);
  var traceId = CBV_TestConsole_newTraceId_();
  var boundary = CBV_TestConsole_enforceRuntimeBoundary_(suite, traceId);

  if (!boundary.allowed) {
    var ctxBlock = {
      phase: 'VERIFICATION_PIPELINE',
      testSuite: code,
      traceId: traceId,
      checkedAt: CBV_TestConsole_isoNow_(),
      runBy: CBV_TestConsole_runBy_(),
      summary: 'Blocked by runtime boundary',
      checks: [{ code: 'RUNTIME_BOUNDARY', ok: false, severity: 'WARNING', message: boundary.reasons.join('; '), detail: boundary }],
      warnings: boundary.reasons.slice(),
      errors: [],
      rawSuiteResult: null,
      ok: false,
      registrySuite: suite
    };
    var repBlock = CBV_TestConsole_buildReportEnvelope_(ctxBlock);
    repBlock.registrySuite = suite;
    repBlock.verification = CBV_TestConsole_verifyReport_(repBlock, boundary);
    repBlock.governance = CBV_TestConsole_runGovernanceRules_({ report: repBlock, suite: suite, boundary: boundary });
    repBlock.risk = CBV_TestConsole_calculateRiskScore_(repBlock);
    repBlock.decisionGate = CBV_TestConsole_buildDecisionGate_(repBlock);
    if (typeof CBV_OperationalIncident_hookFromVerificationReport_ === 'function') {
      CBV_OperationalIncident_hookFromVerificationReport_(repBlock);
    }
    CBV_TestConsole_cacheLastVerificationBundle_(repBlock);
    return { report: repBlock, aiHandoff: CBV_TestConsole_buildAiHandoffPromptPhaseD_(repBlock), blocked: true, boundary: boundary };
  }

  var ctx = CBV_TestConsole_runTestSuite_(code, traceId);
  var report = CBV_TestConsole_buildReportEnvelope_(ctx);
  report.registrySuite = suite;

  report.verification = CBV_TestConsole_verifyReport_(report, boundary);
  report.governance = CBV_TestConsole_runGovernanceRules_({ report: report, suite: suite, boundary: boundary });
  report.verification.governanceOk = report.governance.ok;
  report.verification.runtimeSafe = boundary.runtimeSafe !== false;
  report.risk = CBV_TestConsole_calculateRiskScore_(report);
  report.verification.riskScore = report.risk.riskScore;
  report.decisionGate = CBV_TestConsole_buildDecisionGate_(report);

  if (typeof CBV_OperationalIncident_hookFromVerificationReport_ === 'function') {
    CBV_OperationalIncident_hookFromVerificationReport_(report);
  }

  CBV_TestConsole_appendReportSheet_(report);
  CBV_TestConsole_exportReportToDrive_(report);

  var handoff = CBV_TestConsole_buildAiHandoffPromptPhaseD_(report);
  CBV_TestConsole_appendArtifactRegistry_({
    CREATED_AT: CBV_TestConsole_isoNow_(),
    PROMPT_FILE: '',
    REPORT_FILE: String(report.exportFileName || ''),
    DRIVE_FILE_ID: String(report.driveFileId || ''),
    DRIVE_URL: String(report.driveFileUrl || ''),
    TRACE_ID: String(report.traceId || ''),
    SUITE_CODE: code,
    COMMIT_HASH: '',
    TAG: '',
    HANDOFF_ID: String(report.traceId || ''),
    DECISION_SUMMARY: String((report.decisionGate && report.decisionGate.decisionSummary) || ''),
    RISK_SCORE: report.risk && report.risk.riskScore != null ? String(report.risk.riskScore) : '',
    NOTE: 'VERIFICATION_PIPELINE_V1'
  });

  CBV_TestConsole_cacheLastVerificationBundle_(report);
  return { report: report, aiHandoff: handoff, blocked: false, boundary: boundary };
}

/**
 * @param {Object} report
 */
function CBV_TestConsole_showOperationalViewer_(report) {
  var r = report || CBV_TestConsole_getLastVerificationBundleSlim_() || {};
  var t = HtmlService.createTemplateFromFile('333_CBV_TEST_CONSOLE_RUNTIME_VIEWER');
  try {
    t.bundleJson = JSON.stringify(r);
  } catch (e0) {
    t.bundleJson = '{}';
  }
  SpreadsheetApp.getUi().showModalDialog(t.evaluate().setWidth(960).setHeight(720), 'CBV Operational Viewer');
}

function CBV_TestConsole_menuRunVerificationPipeline() {
  var ui = SpreadsheetApp.getUi();
  try {
    var pr = ui.prompt('Verification pipeline', 'Nhập SUITE_CODE (registry), ví dụ MAIN_CONTROL_OBS:', ui.ButtonSet.OK_CANCEL);
    if (pr.getSelectedButton() !== ui.Button.OK) return;
    var code = String(pr.getResponseText() || '').trim().toUpperCase();
    if (!code) return;
    var out = CBV_TestConsole_runFullVerificationPipeline_(code);
    CBV_TestConsole_showOperationalViewer_(out.report);
    CBV_TestConsole_showAiHandoffDialog_(out.aiHandoff);
    CBV_TestConsole_menuAlertResult_('Verification pipeline', out.report);
  } catch (e) {
    ui.alert('Verification pipeline', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_TestConsole_menuRunGovernanceVerification() {
  var ui = SpreadsheetApp.getUi();
  try {
    var pr = ui.prompt('Governance verification', 'Nhập SUITE_CODE:', ui.ButtonSet.OK_CANCEL);
    if (pr.getSelectedButton() !== ui.Button.OK) return;
    var code = String(pr.getResponseText() || '').trim().toUpperCase();
    CBV_TestConsole_registerDefaultSuites_();
    var suite = CBV_TestConsole_getSuite_(code);
    var traceId = CBV_TestConsole_newTraceId_();
    var boundary = CBV_TestConsole_enforceRuntimeBoundary_(suite, traceId);
    var ctx = CBV_TestConsole_runTestSuite_(code, traceId);
    var report = CBV_TestConsole_buildReportEnvelope_(ctx);
    report.registrySuite = suite;
    var gov = CBV_TestConsole_runGovernanceRules_({ report: report, suite: suite, boundary: boundary });
    ui.alert('Governance', JSON.stringify(gov, null, 2).slice(0, 15000), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Governance', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_TestConsole_menuRunRuntimeBoundaryCheck() {
  var ui = SpreadsheetApp.getUi();
  try {
    var pr = ui.prompt('Runtime boundary', 'Nhập SUITE_CODE:', ui.ButtonSet.OK_CANCEL);
    if (pr.getSelectedButton() !== ui.Button.OK) return;
    var code = String(pr.getResponseText() || '').trim().toUpperCase();
    CBV_TestConsole_registerDefaultSuites_();
    var suite = CBV_TestConsole_getSuite_(code);
    var traceId = CBV_TestConsole_newTraceId_();
    var b = CBV_TestConsole_enforceRuntimeBoundary_(suite, traceId);
    ui.alert('Runtime boundary', JSON.stringify(b, null, 2), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Runtime boundary', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_TestConsole_menuShowOperationalViewer() {
  try {
    CBV_TestConsole_showOperationalViewer_(null);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Viewer', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_TestConsole_menuShowRiskAssessment() {
  var ui = SpreadsheetApp.getUi();
  try {
    var b = CBV_TestConsole_getLastVerificationBundleSlim_();
    var risk = b && b.risk ? b.risk : null;
    ui.alert('Risk', risk ? JSON.stringify(risk, null, 2) : 'Chưa có bundle — chạy Verification pipeline trước.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Risk', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_TestConsole_menuShowDecisionGate() {
  var ui = SpreadsheetApp.getUi();
  try {
    var b = CBV_TestConsole_getLastVerificationBundleSlim_();
    var d = b && b.decisionGate ? b.decisionGate : null;
    ui.alert('Decision gate', d ? JSON.stringify(d, null, 2) : 'Chưa có bundle — chạy Verification pipeline trước.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Decision gate', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

/**
 * Phase D aggregate self-test (non-destructive).
 * @returns {{ ok: boolean, steps: Object[] }}
 */
function CBV_TestConsole_VerificationPipeline_selfTest_() {
  var steps = [];
  function step(name, ok, detail) {
    steps.push({ name: name, ok: !!ok, detail: detail || '' });
  }

  var r1 = CBV_TestConsole_verifyReport_({ ok: true, phase: 'X', status: 'GO', severity: 'OK', traceId: 'T', testSuite: 'S', summary: '', checks: [{ code: 'A', ok: true, severity: 'OK', message: 'm', detail: '' }], warnings: [], errors: [], nextStep: 'n', reportText: '', reportJson: '{}', contractVersion: '2.0.0', envelopeOk: true }, { allowed: true, runtimeSafe: true });
  step('verify_ok', r1.ok && r1.verificationErrors.length === 0, JSON.stringify(r1.verificationErrors));

  var r2 = CBV_TestConsole_governanceRulesSelfTest_();
  step('governance_selftest', r2.ok, r2.message);

  var r3 = CBV_TestConsole_riskEngineSelfTest_();
  step('risk_selftest', r3.ok, r3.message);

  var r4 = CBV_TestConsole_decisionGateSelfTest_();
  step('decision_selftest', r4.ok, r4.message);

  var r5 = CBV_TestConsole_runtimeBoundarySelfTest_();
  step('boundary_selftest', r5.ok, r5.message);

  var r6 = CBV_TestConsole_artifactRegistrySelfTest_();
  step('artifact_selftest', r6.ok, r6.message);

  var bundle = CBV_TestConsole_getLastVerificationBundleSlim_();
  step('viewer_cache_optional', true, bundle ? 'has cache' : 'no prior cache');

  var okAll = true;
  var i;
  for (i = 0; i < steps.length; i++) {
    if (!steps[i].ok) okAll = false;
  }
  return { ok: okAll, steps: steps };
}

/**
 * @returns {{ ok: boolean, message: string }}
 */
function CBV_TestConsole_viewerRenderSelfTest_() {
  try {
    var t = HtmlService.createTemplateFromFile('333_CBV_TEST_CONSOLE_RUNTIME_VIEWER');
    t.bundleJson = JSON.stringify({ testSuite: 'VIEWER_SELFTEST', status: 'GO', checks: [], verification: {}, governance: { ok: true }, risk: { riskScore: 0, riskLevel: 'SAFE' }, decisionGate: { allowNextPhase: true } });
    var ev = t.evaluate().getContent();
    if (!ev || ev.length < 50) return { ok: false, message: 'viewer html too short' };
    return { ok: true, message: 'viewer template renders' };
  } catch (e) {
    return { ok: false, message: String(e && e.message ? e.message : e) };
  }
}

/**
 * @returns {{ ok: boolean, message: string }}
 */
function CBV_TestConsole_verificationRuntimeSelfTest_() {
  var v = CBV_TestConsole_VerificationPipeline_selfTest_();
  if (!v.ok) return { ok: false, message: 'aggregate verification self-test failed' };
  var vr = CBV_TestConsole_viewerRenderSelfTest_();
  if (!vr.ok) return vr;
  return { ok: true, message: 'verification runtime self-test OK' };
}
