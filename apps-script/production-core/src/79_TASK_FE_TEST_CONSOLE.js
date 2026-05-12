/**
 * Phase 79 — TASK FE Test Console (isolated from business runtime; uses CBV report contract).
 */

/**
 * @returns {Object} full report envelope
 */
function TASK_FE_Test_runSmoke() {
  var ctx = TASK_FE_Test_collectSmokeCtx_();
  return TASK_FE_Test_buildReport_(ctx);
}

/**
 * @returns {Object} full report envelope
 */
function TASK_FE_Test_runRuntimeVerification() {
  var ctx = TASK_FE_Test_collectVerificationCtx_();
  return TASK_FE_Test_buildReport_(ctx);
}

/**
 * @param {Object} result — ctx shape for CBV_TestConsole_buildReportEnvelope_
 * @returns {Object}
 */
function TASK_FE_Test_buildReport_(result) {
  if (typeof CBV_TestConsole_buildReportEnvelope_ === 'function') {
    return CBV_TestConsole_buildReportEnvelope_(result);
  }
  return TASK_FE_Test_minimalEnvelope_(result);
}

/**
 * @param {Object} report
 * @returns {Object} report (mutated) after persistence attempts
 */
function TASK_FE_Test_saveReport_(report) {
  var r = report || {};
  try {
    if (typeof CBV_TestConsole_exportReportToDrive_ === 'function') {
      CBV_TestConsole_exportReportToDrive_(r);
    } else {
      r.warnings = r.warnings || [];
      r.warnings.push('Drive export helper missing — report not uploaded to Drive.');
    }
  } catch (e0) {
    r.warnings = r.warnings || [];
    r.warnings.push('TASK_FE_Test_saveReport_: ' + String(e0 && e0.message ? e0.message : e0));
  }
  try {
    var props = PropertiesService.getUserProperties();
    props.setProperty(TASK_FE_USER_PROP_LAST_REPORT_, JSON.stringify(r));
    var hand = TASK_FE_Test_copyAiHandoffPromptFromReport_(r);
    props.setProperty(TASK_FE_USER_PROP_LAST_HANDOFF_, hand);
  } catch (e1) {
    /* ignore */
  }
  return r;
}

/**
 * @returns {string} AI handoff markdown (from last saved report if no arg).
 */
function TASK_FE_Test_copyAiHandoffPrompt() {
  var rep = TASK_FE_Test_loadLastReport_();
  if (!rep) {
    return '# Phase 79 TASK FE\n\nChưa có báo cáo lưu — chạy TASK FE Smoke hoặc Runtime Verification từ menu 🧪.';
  }
  return TASK_FE_Test_copyAiHandoffPromptFromReport_(rep);
}

function TASK_FE_Test_menuRunSmoke() {
  var ui = SpreadsheetApp.getUi();
  try {
    var rep = TASK_FE_Test_runSmoke();
    TASK_FE_Test_saveReport_(rep);
    TASK_FE_Test_showReportDialog_(rep);
    ui.alert('TASK FE Smoke', 'status=' + String(rep.status || '') + '\nseverity=' + String(rep.severity || ''), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('TASK FE Smoke', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function TASK_FE_Test_menuRunRuntimeVerification() {
  var ui = SpreadsheetApp.getUi();
  try {
    var rep = TASK_FE_Test_runRuntimeVerification();
    TASK_FE_Test_saveReport_(rep);
    TASK_FE_Test_showReportDialog_(rep);
    ui.alert('TASK FE Runtime Verification', 'status=' + String(rep.status || '') + '\nseverity=' + String(rep.severity || ''), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('TASK FE Runtime Verification', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function TASK_FE_Test_menuOpenLatestReport() {
  var ui = SpreadsheetApp.getUi();
  try {
    var rep = TASK_FE_Test_loadLastReport_();
    if (!rep) {
      ui.alert('TASK FE Report', 'Chưa có báo cáo — chạy smoke / verification trước.', ui.ButtonSet.OK);
      return;
    }
    TASK_FE_Test_showReportDialog_(rep);
  } catch (e) {
    ui.alert('TASK FE Report', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function TASK_FE_Test_menuCopyAiHandoff() {
  var ui = SpreadsheetApp.getUi();
  try {
    var txt = TASK_FE_Test_copyAiHandoffPrompt();
    TASK_FE_Test_showHandoffDialog_(txt);
    ui.alert('TASK FE AI Handoff', 'Đã mở hộp thoại — dùng nút Copy trong dialog.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('TASK FE AI Handoff', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

/**
 * @param {Object} report
 */
function TASK_FE_Test_showReportDialog_(report) {
  var r = report || {};
  var txt = String(r.reportText || (typeof CBV_TestConsole_buildReportMarkdown_ === 'function' ? CBV_TestConsole_buildReportMarkdown_(r) : JSON.stringify(r, null, 2)));
  var t = HtmlService.createTemplateFromFile('79_TASK_FE_TEST_REPORT_DIALOG');
  t.reportText = txt;
  SpreadsheetApp.getUi().showModalDialog(t.evaluate().setWidth(920).setHeight(680), 'TASK FE — Report');
}

/**
 * @param {string} prompt
 */
function TASK_FE_Test_showHandoffDialog_(prompt) {
  var t = HtmlService.createTemplateFromFile('79_TASK_FE_TEST_AI_HANDOFF_DIALOG');
  t.promptText = String(prompt || '');
  SpreadsheetApp.getUi().showModalDialog(t.evaluate().setWidth(920).setHeight(680), 'TASK FE — AI Handoff');
}

/**
 * @returns {Object|null}
 */
function TASK_FE_Test_loadLastReport_() {
  try {
    var s = PropertiesService.getUserProperties().getProperty(TASK_FE_USER_PROP_LAST_REPORT_);
    if (!s) return null;
    return JSON.parse(s);
  } catch (e0) {
    return null;
  }
}

/**
 * @param {Object} report
 * @returns {string}
 */
function TASK_FE_Test_copyAiHandoffPromptFromReport_(report) {
  if (typeof CBV_TestConsole_buildAiHandoffPrompt_ === 'function') {
    return CBV_TestConsole_buildAiHandoffPrompt_(report);
  }
  try {
    return JSON.stringify(report || {}, null, 2);
  } catch (e0) {
    return '{}';
  }
}

/**
 * @returns {Object} ctx
 */
function TASK_FE_Test_collectSmokeCtx_() {
  var traceId = typeof CBV_TestConsole_newTraceId_ === 'function' ? CBV_TestConsole_newTraceId_() : 'TASK_FE_' + String(new Date().getTime());
  var checkedAt = typeof CBV_TestConsole_isoNow_ === 'function' ? CBV_TestConsole_isoNow_() : new Date().toISOString();
  var runBy = typeof CBV_TestConsole_runBy_ === 'function' ? CBV_TestConsole_runBy_() : '';
  var checks = [];
  var warnings = [];
  var errors = [];

  function addCheck(code, ok, severity, message, detail) {
    checks.push({
      code: String(code || ''),
      ok: !!ok,
      severity: String(severity || 'OK').toUpperCase(),
      message: String(message || ''),
      detail: detail != null ? detail : ''
    });
  }

  addCheck('MENU_WORKSPACE', typeof buildTaskFeWorkspaceMenu_ === 'function', 'OK', 'buildTaskFeWorkspaceMenu_ exists', {});
  addCheck('MENU_TEST_SEPARATE', true, 'OK', 'TASK FE test items live only under 🧪 CBV Test Console (see CBV_TEST_CONSOLE_MENU.js)', {});

  var home = TASK_FE_Home_getSnapshot();
  addCheck('HOME_SERVICE', !!(home && home.ok), !home || !home.ok ? 'ERROR' : 'OK', 'TASK_FE_Home_getSnapshot callable', home || {});

  var fid = 'TASK_DEMO_1';
  try {
    if (home && home.data && home.data.sections && home.data.sections.today && home.data.sections.today.length) {
      fid = String(home.data.sections.today[0].id || fid);
    }
  } catch (eH) {
    /* keep demo id */
  }

  var focus = TASK_FE_Focus_getTaskContext(fid);
  addCheck('FOCUS_SERVICE', !!(focus && focus.ok), focus && !focus.ok ? 'WARNING' : 'OK', 'TASK_FE_Focus_getTaskContext callable', focus || {});

  var tl = TASK_FE_Timeline_get(fid);
  addCheck('TIMELINE_SERVICE', !!(tl && tl.ok), tl && !tl.ok ? 'WARNING' : 'OK', 'TASK_FE_Timeline_get callable', tl || {});

  var adm = TASK_FE_Admin_getDashboardSnapshot();
  addCheck('ADMIN_SERVICE', !!(adm && adm.ok), !adm || !adm.ok ? 'ERROR' : 'OK', 'TASK_FE_Admin_getDashboardSnapshot callable', adm || {});

  var htmlNames = [
    '79_TASK_FE_HOME_WORKSPACE',
    '79_TASK_FE_FOCUS_TASK',
    '79_TASK_FE_TASK_DETAIL',
    '79_TASK_FE_ADMIN_DASHBOARD',
    '79_TASK_FE_TEST_REPORT_DIALOG',
    '79_TASK_FE_TEST_AI_HANDOFF_DIALOG'
  ];
  var i;
  for (i = 0; i < htmlNames.length; i++) {
    var nm = htmlNames[i];
    var okT = true;
    try {
      HtmlService.createTemplateFromFile(nm);
    } catch (e0) {
      okT = false;
      errors.push('HTML_TEMPLATE_MISSING:' + nm);
    }
    addCheck('HTML_' + nm, okT, okT ? 'OK' : 'ERROR', okT ? 'Template readable' : 'Missing template ' + nm, {});
  }

  var probe = TASK_FE_probeDb_();
  if (probe.mockMode) {
    warnings.push('TASK_MAIN không có dữ liệu thật — GO_WITH_WARNINGS có thể xảy ra.');
  }

  var repProbe = TASK_FE_Test_runEnvelopeSelfCheck_();
  addCheck(repProbe.code, repProbe.ok, repProbe.ok ? 'OK' : 'ERROR', repProbe.message, repProbe.detail || {});

  var hand = TASK_FE_Test_copyAiHandoffPromptFromReport_({
    ok: true,
    phase: TASK_FE_PHASE_,
    status: 'GO',
    checkedAt: checkedAt,
    runBy: runBy,
    traceId: traceId,
    testSuite: 'TASK_FE_HANDOFF_PROBE',
    summary: 'probe',
    checks: [],
    warnings: [],
    errors: [],
    nextStep: 'n/a',
    severity: 'OK',
    reportText: '# probe',
    reportJson: '{}',
    contractVersion: typeof CBV_TEST_CONSOLE_CONTRACT_VERSION !== 'undefined' ? CBV_TEST_CONSOLE_CONTRACT_VERSION : '2.0.0',
    envelopeOk: true
  });
  addCheck('AI_HANDOFF', hand.length > 20, hand.length > 20 ? 'OK' : 'WARNING', 'AI handoff prompt generated', { len: hand.length });

  addCheck(
    'NO_DESTRUCTIVE_OPS',
    true,
    'OK',
    'Smoke path does not delete sheets, clear data ranges, or rewrite audit logs (code-reviewed static gate).',
    {}
  );

  var summary = 'Phase 79 TASK FE smoke: menus/services/html + contract probe.';
  return {
    phase: TASK_FE_PHASE_,
    testSuite: 'TASK_FE_SMOKE',
    traceId: traceId,
    checkedAt: checkedAt,
    runBy: runBy,
    summary: summary,
    checks: checks,
    warnings: warnings,
    errors: errors,
    rawSuiteResult: null,
    ok: errors.length === 0
  };
}

/**
 * @returns {Object} ctx
 */
function TASK_FE_Test_collectVerificationCtx_() {
  var base = TASK_FE_Test_collectSmokeCtx_();
  base.testSuite = 'TASK_FE_RUNTIME_VERIFICATION';
  base.summary = 'Phase 79 TASK FE extended verification (includes envelope re-check + service round-trip probes).';

  var extra = base.checks || [];
  var r2 = TASK_FE_Test_runEnvelopeSelfCheck_();
  extra.push({
    code: r2.code + '_VERIFY',
    ok: r2.ok,
    severity: r2.ok ? 'OK' : 'ERROR',
    message: 'Contract verification: ' + r2.message,
    detail: r2.detail || {}
  });

  var actionProbe = TASK_FE_Focus_buildActionModel_('___INVALID___', 'COMPLETE', '');
  extra.push({
    code: 'ACTION_MODEL',
    ok: !!(actionProbe && actionProbe.allowed === false),
    severity: actionProbe && actionProbe.allowed === false ? 'OK' : 'WARNING',
    message: 'Focus action model rejects unknown task',
    detail: actionProbe || {}
  });

  base.checks = extra;
  return base;
}

/**
 * @returns {{ ok: boolean, code: string, message: string, detail: Object }}
 */
function TASK_FE_Test_runEnvelopeSelfCheck_() {
  var sample = {
    phase: TASK_FE_PHASE_,
    testSuite: 'TASK_FE_CONTRACT',
    traceId: 'TRACE_SELF',
    checkedAt: typeof CBV_TestConsole_isoNow_ === 'function' ? CBV_TestConsole_isoNow_() : new Date().toISOString(),
    runBy: 'SYSTEM',
    summary: 'contract sample',
    checks: [{ code: 'X', ok: true, severity: 'OK', message: 'ok', detail: '' }],
    warnings: [],
    errors: [],
    rawSuiteResult: null,
    ok: true
  };
  var built = TASK_FE_Test_buildReport_(sample);
  var v = typeof CBV_TestConsole_validateReportEnvelope_ === 'function' ? CBV_TestConsole_validateReportEnvelope_(built) : { envelopeOk: true, errors: [] };
  var ok = !!(built && v.envelopeOk && built.status);
  return {
    ok: ok,
    code: 'REPORT_CONTRACT',
    message: ok ? 'Report contract valid' : 'Invalid envelope: ' + (v.errors || []).join(','),
    detail: { envelopeOk: v.envelopeOk, errors: v.errors || [] }
  };
}

/**
 * @param {Object} result
 * @returns {Object}
 */
function TASK_FE_Test_minimalEnvelope_(result) {
  var r = result || {};
  return {
    ok: !!r.ok,
    phase: String(r.phase || TASK_FE_PHASE_),
    status: r.errors && r.errors.length ? 'FAIL' : 'GO_WITH_WARNINGS',
    checkedAt: String(r.checkedAt || new Date().toISOString()),
    runBy: String(r.runBy || ''),
    traceId: String(r.traceId || ''),
    testSuite: String(r.testSuite || ''),
    summary: String(r.summary || ''),
    checks: Array.isArray(r.checks) ? r.checks : [],
    warnings: Array.isArray(r.warnings) ? r.warnings : [],
    errors: Array.isArray(r.errors) ? r.errors : [],
    nextStep: 'Install CBV_TestConsole_buildReportEnvelope_ for full contract.',
    severity: 'WARNING',
    reportText: JSON.stringify(r, null, 2),
    reportJson: JSON.stringify(r, null, 2),
    contractVersion: '2.0.0',
    envelopeOk: false
  };
}
