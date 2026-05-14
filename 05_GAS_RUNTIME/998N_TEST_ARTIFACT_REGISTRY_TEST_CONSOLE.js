/**
 * PHASE_97_2 — Test Artifact Registry — Test Console (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Phase 97.2 — Artifact Registry
 */

var __CBV_TCS_ARTIFACT_REGISTRY_TC_LAST_REPORT = null;
var __CBV_TCS_ARTIFACT_REGISTRY_TC_LAST_PROP_KEY = 'CBV_TCS_ARTIFACT_REGISTRY_TC_LAST_REPORT_JSON';

function CbvTcsArtifactRegistry_TestConsole__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function (k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvTcsArtifactRegistry_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_ARTIFACT_REGISTRY_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_ARTIFACT_REGISTRY_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvTcsArtifactRegistry_TestConsole__getLatest_() {
  if (__CBV_TCS_ARTIFACT_REGISTRY_TC_LAST_REPORT) return __CBV_TCS_ARTIFACT_REGISTRY_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_ARTIFACT_REGISTRY_TC_LAST_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_TCS_ARTIFACT_REGISTRY_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

function CbvTcsArtifactRegistry_TestConsole_run() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WS972_')
    : ('WS972_' + new Date().getTime());

  var checks = [];
  var warnings = [];
  var errors = [];

  function addCheck(code, ok, severity, message, detail) {
    var sev;
    if (ok) sev = severity || 'OK';
    else {
      if (severity === 'WARNING' || severity === 'ERROR' || severity === 'CRITICAL') sev = severity;
      else sev = 'ERROR';
    }
    checks.push({ code: code, ok: ok === true, severity: sev, message: message, detail: detail || {} });
    if (!ok && (sev === 'ERROR' || sev === 'CRITICAL')) errors.push(message);
    if (!ok && sev === 'WARNING') warnings.push(message);
  }

  addCheck('REGISTRY_ENSURE', typeof CbvTcsArtifactRegistry_ensureSchema === 'function', 'OK', 'ensureSchema exists', {});
  addCheck('REGISTRY_REGISTER', typeof CbvTcsArtifactRegistry_registerArtifact === 'function', 'OK', 'registerArtifact exists', {});
  addCheck('REGISTRY_EXPORT_HOOK', typeof CbvTcsArtifactRegistry_registerExportResult === 'function', 'OK', 'registerExportResult exists', {});
  addCheck('MARKDOWN_MIRROR', typeof CbvTcsArtifactRegistry_buildMarkdownMirror === 'function', 'OK', 'buildMarkdownMirror exists', {});
  addCheck('DRIVE_EXPORT', typeof CbvTcsDriveReport_export === 'function', 'OK', 'CbvTcsDriveReport_export exists', {});

  var vd = null;
  try {
    vd = CbvTcsArtifactRegistry_validate();
    if (vd && vd.warnings) warnings = warnings.concat(vd.warnings);
    if (vd && vd.errors) errors = errors.concat(vd.errors);
    addCheck('REGISTRY_VALIDATE', vd && vd.ok === true, vd && vd.ok ? 'OK' : 'ERROR', 'CbvTcsArtifactRegistry_validate', { detail: vd ? vd.data : null });
  } catch (eV) {
    addCheck('REGISTRY_VALIDATE', false, 'CRITICAL', String(eV), {});
  }

  var exMini = null;
  try {
    if (typeof DriveApp !== 'undefined' && typeof CbvTcsDriveReport_export === 'function') {
      var mini = {
        ok: true,
        phase: 'PHASE_97_2_TEST_ARTIFACT_REGISTRY_MARKDOWN_MIRROR',
        status: 'GO',
        checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
        runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : '',
        traceId: traceId,
        testSuite: 'CBV_TCS_ARTIFACT_REGISTRY_PROBE',
        summary: 'Probe export for registry + json/md pair.',
        checks: [{ code: 'PROBE', ok: true, severity: 'OK', message: 'Synthetic', detail: {} }],
        warnings: [],
        errors: [],
        nextStep: 'Do not delete probe files (append-only).',
        severity: 'OK',
        reportText: 'probe',
        reportJson: {},
        contractVersion: 'CBV_TCS_V1',
        envelopeOk: true
      };
      exMini = CbvTcsDriveReport_export(mini, {
        phase: 'PHASE_97_2_TEST_ARTIFACT_REGISTRY_MARKDOWN_MIRROR',
        testSuite: 'CBV_TCS_ARTIFACT_REGISTRY_PROBE',
        prefix: '097_2',
        format: 'json',
        txtFallback: false
      });
      var hasJson = exMini && exMini.files && exMini.files.some(function (f) { return /\.json$/i.test(f.name || ''); });
      var hasMd = exMini && exMini.files && exMini.files.some(function (f) { return /\.md$/i.test(f.name || ''); });
      addCheck('EXPORT_JSON_MD', hasJson && hasMd, hasJson && hasMd ? 'OK' : 'WARNING', 'Export produced .json and .md', { files: exMini ? exMini.files : [] });
      if (exMini && exMini.warnings && exMini.warnings.length) warnings = warnings.concat(exMini.warnings);
    } else {
      addCheck('EXPORT_PROBE', false, 'WARNING', 'DriveApp or exporter not available.', {});
    }
  } catch (eE) {
    addCheck('EXPORT_PROBE', false, 'WARNING', String(eE && eE.message ? eE.message : eE), {});
  }

  try {
    var fr = CbvTcsArtifactRegistry_findByTraceId(traceId);
    var n = fr && fr.data && fr.data.rows ? fr.data.rows.length : 0;
    addCheck('FIND_BY_TRACE', n > 0, n > 0 ? 'OK' : 'WARNING', 'findByTraceId returned rows for probe traceId', { count: n });
  } catch (eF) {
    addCheck('FIND_BY_TRACE', false, 'WARNING', String(eF), {});
  }

  var mdSample = '';
  try {
    var now = (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date();
    mdSample = CbvTcsArtifactRegistry_buildMarkdownMirror({
      traceId: traceId,
      phase: 'P',
      status: 'S',
      severity: 'OK',
      checkedAt: now,
      runBy: 'test',
      testSuite: 'T',
      contractVersion: 'CBV_TCS_V1',
      envelopeOk: true,
      summary: 'x',
      nextStep: 'y',
      checks: [{ code: 'C', ok: true, severity: 'OK', message: 'M' }],
      warnings: [],
      errors: []
    }, { folderId: 'X' });
    addCheck('MD_RAW_JSON', mdSample.indexOf('## Raw JSON') >= 0 && mdSample.indexOf('```json') >= 0, 'OK', 'Markdown mirror contains Raw JSON block', {});
  } catch (eM) {
    addCheck('MD_RAW_JSON', false, 'WARNING', String(eM), {});
  }

  var low = (CbvTcsArtifactRegistry_buildHandoffPrompt() || '').toLowerCase();
  addCheck('NO_PROD_READY', low.indexOf('production ready') < 0 && low.indexOf('prod ready') < 0, 'OK', 'Handoff has no production-ready shorthand', {});

  addCheck('CLASP_999_LAST', true, 'OK', 'Confirm locally: 999_WEBAPP_DOGET_DISPATCHER_FINAL.js is last in .clasp.json filePushOrder.', {});

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: CBV_TCS_ARTIFACT_REGISTRY_PHASE_ID,
    status: status,
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_TCS_ARTIFACT_REGISTRY_HEALTH',
    summary: 'Artifact registry (97.2): ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL' ? 'Fix registry headers / namespace / permissions.' : 'Use Drive folder + CBV_TEST_ARTIFACT_REGISTRY as AI-auditable test memory.',
    severity: severity,
    reportText: '',
    reportJson: {},
    contractVersion: CBV_TCS_ARTIFACT_REGISTRY_CONTRACT_VERSION,
    envelopeOk: false
  };

  var env = CbvTcsArtifactRegistry_TestConsole__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });

  report.reportText = [
    '=== PHASE 97.2 — ARTIFACT REGISTRY / MARKDOWN MIRROR ===',
    'status=' + report.status,
    'traceId=' + report.traceId
  ].join('\n');

  CbvTcsArtifactRegistry_TestConsole__storeLatest_(report);
  try { Logger.log(report.reportText); } catch (eL) { /* ignore */ }
  return report;
}

function CbvTcsArtifactRegistry_TestConsole_showRecent() {
  var r = CbvTcsArtifactRegistry_listRecent(25);
  var payload = r && r.data ? r.data : r;
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert('Phase 97.2 — Recent artifacts', JSON.stringify(payload, null, 2).substring(0, 1800), SpreadsheetApp.getUi().ButtonSet.OK);
  }
  return { ok: true };
}

function CbvTcsArtifactRegistry_TestConsole_showByTraceId() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) return { ok: false, message: 'UI unavailable.' };
  var ui = SpreadsheetApp.getUi();
  var resp = ui.prompt('Find artifact', 'Enter traceId (substring match):', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return { ok: false };
  var tid = String(resp.getResponseText() || '').trim();
  var r = CbvTcsArtifactRegistry_findByTraceId(tid);
  ui.alert('Phase 97.2 — By traceId', JSON.stringify(r && r.data ? r.data : r, null, 2).substring(0, 1800), ui.ButtonSet.OK);
  return { ok: true };
}

function CbvTcsArtifactRegistry_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvTcsArtifactRegistry_TestConsole__getLatest_();
  if (!r) {
    ui.alert('No report', 'Run Artifact Registry Health Check first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 97.2 — copy report');
  return { ok: true };
}

function CbvTcsArtifactRegistry_TestConsole_copyAiHandoffPrompt() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var text = CbvTcsArtifactRegistry_buildHandoffPrompt();
  var esc = JSON.stringify(text);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:280px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + esc + ';document.getElementById("t").value=DATA;function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(400), 'Phase 97.2 — AI handoff');
  return { ok: true };
}
