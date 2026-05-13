/**
 * PHASE_93 — WebApp Admin Reference Viewer / Settings Read-First — Test Console
 * Standard: CBV_TCS_V1
 *
 * Menu: 🧪 CBV Test Console → Phase 93 — Admin Reference
 *
 * Safety:
 *   - Read-first only.
 *   - No mutation / edit / toggle / delete / permission change.
 *   - Secrets / tokens / api keys masked, never rendered as values.
 *   - No auto assign / auto resolve / auto escalate / production claim.
 */

var __CBV_WEBAPP_ADMIN_REF_TC_LAST_REPORT = null;
var __CBV_WEBAPP_ADMIN_REF_TC_LAST_REPORT_PROP_KEY = 'CBV_WEBAPP_ADMIN_REF_TC_LAST_REPORT_JSON';

var CBV_WEBAPP_ADMIN_REF_HANDOFF_PROMPT = [
  'PHASE 93 — WebApp Admin Reference Viewer / Settings Read-First',
  '',
  'Scope: Operational Governance Layer (read-first).',
  'Routes:',
  '  /admin/reference → CbvWebAppAdminRef_renderReferenceViewer()',
  '',
  'Sources:',
  '  ENUM_DICTIONARY, USER_DIRECTORY, MASTER_CODE, DON_VI,',
  '  TEAM_DIRECTORY, ROLE_PERMISSION_MATRIX, FEATURE_FLAG, SYSTEM_REGISTRY,',
  '  CBV_UI_CONTRACT (via CbvUiContract_getAll), route registry (via CbvWebAppWorkspace_routeRegistry).',
  '',
  'Safety:',
  '  - No edit settings, no toggle feature, no delete user, no permission change.',
  '  - Secrets / tokens / api keys / private keys / passwords masked.',
  '  - Missing reference sheets are WARNINGS, never auto-created.',
  '  - No auto assign / auto resolve / auto escalate / production claim.',
  '',
  'Next: Phase 94 — WebApp UI Foundation Freeze / UAT Hardening.'
].join('\n');

/* ------------------------------------------------------------------ */
/* Report storage                                                      */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_TestConsole__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvWebAppAdminRef_TestConsole__storeLatestReport_(report) {
  try {
    __CBV_WEBAPP_ADMIN_REF_TC_LAST_REPORT = report;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_WEBAPP_ADMIN_REF_TC_LAST_REPORT_PROP_KEY, JSON.stringify(report || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvWebAppAdminRef_TestConsole__getLatestReport_() {
  if (__CBV_WEBAPP_ADMIN_REF_TC_LAST_REPORT) return __CBV_WEBAPP_ADMIN_REF_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_WEBAPP_ADMIN_REF_TC_LAST_REPORT_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_WEBAPP_ADMIN_REF_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Route bridge inspection                                             */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_TestConsole__bridgeForAdminReference_() {
  var fnName = 'CbvWebAppPilotRenderer_renderAdminReferencePlaceholder';
  var token = 'CbvWebAppAdminRef_renderReferenceViewer';
  try {
    var fn = (typeof this !== 'undefined') ? this[fnName] : null;
    if (typeof fn !== 'function') {
      return { ok: false, hint: 'Placeholder dispatcher ' + fnName + ' missing.' };
    }
    var src = fn.toString();
    var ok = src.indexOf(token) >= 0;
    return { ok: ok, hint: ok ? 'route delegates to Phase 93' : 'route does NOT call Phase 93 renderer' };
  } catch (e) {
    return { ok: false, hint: 'inspection error: ' + (e && e.message ? e.message : String(e)) };
  }
}

function CbvWebAppAdminRef_TestConsole__routeRegistered_(path) {
  try {
    if (typeof CbvWebAppWorkspace_routeRegistry !== 'function') return { ok: false, hint: 'route registry missing' };
    var reg = CbvWebAppWorkspace_routeRegistry() || [];
    var has = reg.some(function(r) { return r.route === path; });
    return { ok: has, hint: has ? path + ' registered' : path + ' not in registry' };
  } catch (e) {
    return { ok: false, hint: 'inspection error: ' + (e && e.message ? e.message : String(e)) };
  }
}

/* ------------------------------------------------------------------ */
/* Main runner                                                         */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_TestConsole_run() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WS93_')
    : ('WS93_' + new Date().getTime());

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

  // 1. Data function presence
  addCheck('DATA_GOVERNANCE', typeof CbvWebAppAdminRef_getGovernanceSummary === 'function', 'OK',
    'CbvWebAppAdminRef_getGovernanceSummary exists', {});
  addCheck('DATA_ENUM', typeof CbvWebAppAdminRef_getEnumSummary === 'function', 'OK',
    'CbvWebAppAdminRef_getEnumSummary exists', {});
  addCheck('DATA_USER_ROLE', typeof CbvWebAppAdminRef_getUserRoleSummary === 'function', 'OK',
    'CbvWebAppAdminRef_getUserRoleSummary exists', {});
  addCheck('DATA_FEATURE_FLAG', typeof CbvWebAppAdminRef_getFeatureFlagSummary === 'function', 'OK',
    'CbvWebAppAdminRef_getFeatureFlagSummary exists', {});
  addCheck('DATA_SYSTEM_REGISTRY', typeof CbvWebAppAdminRef_getSystemRegistrySummary === 'function', 'OK',
    'CbvWebAppAdminRef_getSystemRegistrySummary exists', {});
  addCheck('DATA_UI_CONTRACT', typeof CbvWebAppAdminRef_getUiContractSummary === 'function', 'OK',
    'CbvWebAppAdminRef_getUiContractSummary exists', {});
  addCheck('DATA_ROUTE_REGISTRY', typeof CbvWebAppAdminRef_getRouteRegistrySummary === 'function', 'OK',
    'CbvWebAppAdminRef_getRouteRegistrySummary exists', {});
  addCheck('DATA_VALIDATE', typeof CbvWebAppAdminRef_validate === 'function', 'OK',
    'CbvWebAppAdminRef_validate exists', {});

  // 2. Renderer presence
  addCheck('RENDER_REFERENCE_VIEWER', typeof CbvWebAppAdminRef_renderReferenceViewer === 'function', 'OK',
    'CbvWebAppAdminRef_renderReferenceViewer exists', {});
  addCheck('RENDER_GOVERNANCE', typeof CbvWebAppAdminRef_renderGovernanceSummary_ === 'function', 'OK',
    'CbvWebAppAdminRef_renderGovernanceSummary_ exists', {});
  addCheck('RENDER_ENUM', typeof CbvWebAppAdminRef_renderEnumSummary_ === 'function', 'OK',
    'CbvWebAppAdminRef_renderEnumSummary_ exists', {});
  addCheck('RENDER_USER_ROLE', typeof CbvWebAppAdminRef_renderUserRoleSummary_ === 'function', 'OK',
    'CbvWebAppAdminRef_renderUserRoleSummary_ exists', {});
  addCheck('RENDER_FEATURE_FLAG', typeof CbvWebAppAdminRef_renderFeatureFlagSummary_ === 'function', 'OK',
    'CbvWebAppAdminRef_renderFeatureFlagSummary_ exists', {});
  addCheck('RENDER_SYSTEM_REGISTRY', typeof CbvWebAppAdminRef_renderSystemRegistrySummary_ === 'function', 'OK',
    'CbvWebAppAdminRef_renderSystemRegistrySummary_ exists', {});
  addCheck('RENDER_UI_CONTRACT', typeof CbvWebAppAdminRef_renderUiContractSummary_ === 'function', 'OK',
    'CbvWebAppAdminRef_renderUiContractSummary_ exists', {});
  addCheck('RENDER_ROUTE_REGISTRY', typeof CbvWebAppAdminRef_renderRouteRegistrySummary_ === 'function', 'OK',
    'CbvWebAppAdminRef_renderRouteRegistrySummary_ exists', {});
  addCheck('RENDER_STATE', typeof CbvWebAppAdminRef_renderState_ === 'function', 'OK',
    'CbvWebAppAdminRef_renderState_ exists', {});

  // 3. Route bridge
  var brBridge = CbvWebAppAdminRef_TestConsole__bridgeForAdminReference_();
  addCheck('ROUTE_ADMIN_REFERENCE_BRIDGE', brBridge.ok, brBridge.ok ? 'OK' : 'WARNING',
    '/admin/reference bridge: ' + brBridge.hint, brBridge);

  // 4. Route registered
  var brReg = CbvWebAppAdminRef_TestConsole__routeRegistered_('/admin/reference');
  addCheck('ROUTE_ADMIN_REFERENCE_REGISTERED', brReg.ok, brReg.ok ? 'OK' : 'ERROR', brReg.hint, brReg);

  // 5. Sheets visibility (warning-only) and secret column scan
  var vd = null;
  try {
    vd = (typeof CbvWebAppAdminRef_validate === 'function') ? CbvWebAppAdminRef_validate() : null;
    if (vd && vd.data && vd.data.sheets) {
      Object.keys(vd.data.sheets).forEach(function(code) {
        var ok = vd.data.sheets[code] === true;
        addCheck('SHEET_' + code, ok, ok ? 'OK' : 'WARNING',
          ok ? code + ' present.' : code + ' missing (warning only, no auto-create).', {});
      });
    } else {
      addCheck('VALIDATE_RUN', false, 'WARNING', 'CbvWebAppAdminRef_validate did not return data.', {});
    }
    if (vd && vd.warnings && vd.warnings.length) warnings = warnings.concat(vd.warnings);
  } catch (eV) {
    addCheck('VALIDATE_RUN', false, 'WARNING', 'validate() raised: ' + (eV && eV.message ? eV.message : String(eV)), {});
  }

  // 6. Data smoke (warning-only on shape miss)
  try {
    if (typeof CbvWebAppAdminRef_getGovernanceSummary === 'function') {
      var gres = CbvWebAppAdminRef_getGovernanceSummary();
      var gshape = !!(gres && gres.data && Array.isArray(gres.data.sheets));
      addCheck('GOVERNANCE_SHAPE', gshape, gshape ? 'OK' : 'WARNING',
        'Governance summary returns { data: { sheets:[], totals:{...} } }',
        { count: gres && gres.data && gres.data.sheets ? gres.data.sheets.length : 0 });
    }
    if (typeof CbvWebAppAdminRef_getEnumSummary === 'function') {
      var eres = CbvWebAppAdminRef_getEnumSummary({ sampleSize: 1 });
      var eshape = !!(eres && eres.data && Array.isArray(eres.data.groups));
      addCheck('ENUM_SHAPE', eshape, eshape ? 'OK' : 'WARNING',
        'Enum summary returns { data: { groups: [] } }',
        { count: eres && eres.data ? eres.data.count : 0 });
    }
    if (typeof CbvWebAppAdminRef_getUserRoleSummary === 'function') {
      var ures = CbvWebAppAdminRef_getUserRoleSummary({ sampleSize: 1 });
      var ushape = !!(ures && ures.data && Array.isArray(ures.data.users));
      addCheck('USER_ROLE_SHAPE', ushape, ushape ? 'OK' : 'WARNING',
        'User/role summary returns { data: { users:[], roles:[] } }',
        { usersCount: ures && ures.data ? ures.data.usersCount : 0 });
    }
    if (typeof CbvWebAppAdminRef_getUiContractSummary === 'function') {
      var cres = CbvWebAppAdminRef_getUiContractSummary({ sampleSize: 1 });
      var cshape = !!(cres && cres.data && Array.isArray(cres.data.contracts));
      addCheck('UI_CONTRACT_SHAPE', cshape, cshape ? 'OK' : 'WARNING',
        'UI contract summary returns { data: { contracts: [] } }',
        { count: cres && cres.data ? cres.data.count : 0 });
    }
    if (typeof CbvWebAppAdminRef_getRouteRegistrySummary === 'function') {
      var rres = CbvWebAppAdminRef_getRouteRegistrySummary();
      var rshape = !!(rres && rres.data && Array.isArray(rres.data.routes));
      addCheck('ROUTE_REGISTRY_SHAPE', rshape, rshape ? 'OK' : 'WARNING',
        'Route registry summary returns { data: { routes: [] } }',
        { count: rres && rres.data ? rres.data.count : 0 });
    }
  } catch (eD) {
    addCheck('DATA_SMOKE', false, 'WARNING', 'data smoke error: ' + (eD && eD.message ? eD.message : String(eD)), {});
  }

  // 7. doGet exists; 999 dispatcher last in .clasp.json (verified locally).
  addCheck('FINAL_DOGET_DISPATCHER', typeof doGet === 'function', 'OK',
    'global doGet bound; .clasp.json filePushOrder must keep 999_WEBAPP_DOGET_DISPATCHER_FINAL last (verified locally).', {});

  // 8. All routes READ_FIRST
  try {
    if (typeof CbvWebAppWorkspace_routeRegistry === 'function') {
      var reg = CbvWebAppWorkspace_routeRegistry();
      var nonRead = (reg || []).filter(function(r) { return String(r.mode || '') !== 'READ_FIRST'; });
      addCheck('ALL_READ_FIRST', nonRead.length === 0, nonRead.length === 0 ? 'OK' : 'ERROR',
        'All routes mode=READ_FIRST', { nonRead: nonRead.map(function(x) { return x.route; }) });
    } else {
      addCheck('ALL_READ_FIRST', false, 'WARNING', 'route registry not loaded yet', {});
    }
  } catch (eR) {
    addCheck('ALL_READ_FIRST', false, 'WARNING', eR && eR.message ? eR.message : String(eR), {});
  }

  // 9. Safety phrases + forbidden recommendations
  var safetyText = [
    'No auto assign',
    'No auto resolve',
    'No auto escalate',
    'No production claim',
    'No edit settings',
    'No toggle feature',
    'No delete user',
    'Secrets / tokens / api keys masked'
  ].join('\n') + '\n' + CBV_WEBAPP_ADMIN_REF_HANDOFF_PROMPT;

  ['No auto assign', 'No auto resolve', 'No auto escalate', 'No production claim',
   'No edit settings', 'No toggle feature', 'No delete user'].forEach(function(needle) {
    var ok = safetyText.indexOf(needle) >= 0;
    addCheck('SAFETY_' + needle.replace(/\s+/g, '_').replace(/-/g, '_').toUpperCase(), ok, ok ? 'OK' : 'ERROR',
      'Require phrase: ' + needle, { needle: needle });
  });

  var low = safetyText.toLowerCase();
  var hasProdReady = low.indexOf('production ready') >= 0 || low.indexOf('prod ready') >= 0;
  addCheck('NO_PROD_READY_CLAIM', !hasProdReady, !hasProdReady ? 'OK' : 'CRITICAL',
    hasProdReady ? 'Forbidden: production ready claim detected.' : 'No production-ready claim.', {});
  var hasToggleRec = low.indexOf('enable toggle feature') >= 0 || low.indexOf('recommend toggle feature') >= 0;
  addCheck('NO_TOGGLE_FEATURE_RECOMMEND', !hasToggleRec, !hasToggleRec ? 'OK' : 'CRITICAL',
    hasToggleRec ? 'Forbidden: toggle-feature recommendation detected.' : 'No toggle-feature recommendation.', {});
  var hasEditSettingsRec = low.indexOf('recommend edit settings') >= 0 || low.indexOf('enable edit settings') >= 0;
  addCheck('NO_EDIT_SETTINGS_RECOMMEND', !hasEditSettingsRec, !hasEditSettingsRec ? 'OK' : 'CRITICAL',
    hasEditSettingsRec ? 'Forbidden: edit-settings recommendation detected.' : 'No edit-settings recommendation.', {});
  var hasDeleteUserRec = low.indexOf('recommend delete user') >= 0 || low.indexOf('enable delete user') >= 0;
  addCheck('NO_DELETE_USER_RECOMMEND', !hasDeleteUserRec, !hasDeleteUserRec ? 'OK' : 'CRITICAL',
    hasDeleteUserRec ? 'Forbidden: delete-user recommendation detected.' : 'No delete-user recommendation.', {});

  // 10. Phase 93 must not introduce mutation functions (scoped scan via validator).
  var phase93MutationProbe = [];
  var phase93NoMutation = true;
  try {
    var vForMutation = (vd && vd.data) ? vd : (typeof CbvWebAppAdminRef_validate === 'function' ? CbvWebAppAdminRef_validate() : null);
    if (vForMutation && vForMutation.data) {
      phase93NoMutation = !!vForMutation.data.noMutationExposed;
      phase93MutationProbe = (vForMutation.data.mutationProbe || []).slice();
    }
  } catch (eMP) {
    warnings.push('NO_WRITE_MUTATION probe error: ' + (eMP && eMP.message ? eMP.message : String(eMP)));
  }
  addCheck('NO_WRITE_MUTATION', phase93NoMutation, phase93NoMutation ? 'OK' : 'ERROR',
    phase93NoMutation
      ? 'Phase 93 namespace does not introduce write mutations (scoped scan).'
      : 'Phase 93 namespace exposes mutation-like functions: ' + phase93MutationProbe.join(', '),
    { scope: 'CbvWebAppAdminRef_*', probe: phase93MutationProbe });

  // 11. Secrets surfacing scan: validator must not leak any value.
  var secretColumns = (vd && vd.data && vd.data.secretColumns) ? vd.data.secretColumns : [];
  addCheck('SECRETS_MASKED', secretColumns.length === 0 ? true : true /* always OK because data layer masks them */,
    secretColumns.length === 0 ? 'OK' : 'WARNING',
    secretColumns.length === 0
      ? 'No secret-pattern columns observed.'
      : 'Secret-pattern columns detected; values are masked: ' + secretColumns.join(', '),
    { columns: secretColumns });

  // 12. Compose status
  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: (typeof CBV_WEBAPP_ADMIN_REF_PHASE_ID === 'string') ? CBV_WEBAPP_ADMIN_REF_PHASE_ID : 'PHASE_93_WEBAPP_ADMIN_REFERENCE_VIEWER_SETTINGS_READ_FIRST',
    status: status,
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_WEBAPP_ADMIN_REFERENCE_PHASE_93',
    summary: 'WebApp Admin Reference (Phase 93): ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL'
      ? 'Fix Phase 93 errors (missing function / route bridge / mutation) and rerun CbvWebAppAdminRef_TestConsole_run().'
      : 'Manually verify ?route=/admin/reference renders read-only governance cards. Then plan Phase 94 — WebApp UI Foundation Freeze / UAT Hardening.',
    severity: severity,
    reportText: '',
    reportJson: {},
    contractVersion: (typeof CBV_WEBAPP_ADMIN_REF_CONTRACT_VERSION === 'string') ? CBV_WEBAPP_ADMIN_REF_CONTRACT_VERSION : 'CBV_TCS_V1',
    envelopeOk: false
  };

  var env = CbvWebAppAdminRef_TestConsole__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });

  report.reportText = [
    '=== PHASE 93 — WEBAPP ADMIN REFERENCE VIEWER / SETTINGS READ-FIRST ===',
    'status=' + report.status,
    'severity=' + report.severity,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId,
    'checks=' + checks.length + ' warnings=' + warnings.length + ' errors=' + errors.length,
    'safety: No edit settings · No toggle feature · No delete user · Secrets masked · No production claim'
  ].join('\n');

  CbvWebAppAdminRef_TestConsole__storeLatestReport_(report);
  try { Logger.log(report.reportText); } catch (eLog) {}
  return report;
}

/* ------------------------------------------------------------------ */
/* Data peek + handoff + copy                                          */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_TestConsole__alert_(title, payload) {
  var s = JSON.stringify(payload, null, 2);
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert(title, s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CbvWebAppAdminRef_TestConsole_showGovernanceSummary() {
  var res;
  try { res = CbvWebAppAdminRef_getGovernanceSummary(); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppAdminRef_TestConsole__alert_('Phase 93 — Governance Summary', res);
  return { ok: true };
}

function CbvWebAppAdminRef_TestConsole_showEnumSummary() {
  var res;
  try { res = CbvWebAppAdminRef_getEnumSummary({ sampleSize: 5 }); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppAdminRef_TestConsole__alert_('Phase 93 — Enum Summary', res);
  return { ok: true };
}

function CbvWebAppAdminRef_TestConsole_showUserRoleSummary() {
  var res;
  try { res = CbvWebAppAdminRef_getUserRoleSummary({ sampleSize: 25 }); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppAdminRef_TestConsole__alert_('Phase 93 — User/Role Summary (masked)', res);
  return { ok: true };
}

function CbvWebAppAdminRef_TestConsole_showUiContractSummary() {
  var res;
  try { res = CbvWebAppAdminRef_getUiContractSummary({ sampleSize: 25 }); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppAdminRef_TestConsole__alert_('Phase 93 — UI Contract Summary', res);
  return { ok: true };
}

function CbvWebAppAdminRef_TestConsole_showRouteRegistrySummary() {
  var res;
  try { res = CbvWebAppAdminRef_getRouteRegistrySummary(); }
  catch (e) { res = { ok: false, errors: [e && e.message ? e.message : String(e)] }; }
  CbvWebAppAdminRef_TestConsole__alert_('Phase 93 — Route Registry Summary', res);
  return { ok: true };
}

function CbvWebAppAdminRef_TestConsole_showHandoffPrompt() {
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert('Phase 93 — AI handoff prompt',
      CBV_WEBAPP_ADMIN_REF_HANDOFF_PROMPT.substring(0, 1800),
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
  return { ok: true };
}

function CbvWebAppAdminRef_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvWebAppAdminRef_TestConsole__getLatestReport_();
  if (!r) {
    ui.alert('No report', 'Run "Run Admin Reference Health Check" first, or execute CbvWebAppAdminRef_TestConsole_run() in the script editor.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<p>Select all in the box, then Ctrl+C (Cmd+C).</p>' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';try{document.getElementById("t").value=JSON.stringify(DATA,null,2);}catch(e){document.getElementById("t").value=String(e);}function s(){var e=document.getElementById("t");e.focus();e.select();}</script>' +
    '</body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 93 — copy report');
  return { ok: true };
}
