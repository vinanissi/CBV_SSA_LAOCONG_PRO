/**
 * PHASE_96 — WebApp Vietnamese UX — Test Console (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → Phase 96 — Vietnamese UX
 */

var __CBV_WEBAPP_VI_UX_TC_LAST_REPORT = null;
var __CBV_WEBAPP_VI_UX_TC_LAST_REPORT_PROP_KEY = 'CBV_WEBAPP_VI_UX_TC_LAST_REPORT_JSON';

var CBV_WEBAPP_VI_UX_HANDOFF_PROMPT = [
  'PHASE 96 — WebApp Vietnamese UX Refactor / User Flow Guide',
  '',
  'Scope: Việt hóa nhãn UI, chuẩn hóa wording nội bộ, gắn URL WebApp chính thức (/exec),',
  'và bổ sung hướng dẫn luồng cho Operator / Supervisor / Admin.',
  'Không đổi đường dẫn route. Không mutation. Không ghi dữ liệu từ WebApp.',
  '',
  'An toàn (tiếng Việt, mọi luồng vận hành):',
  '  Không tự động giao việc · Không tự động hoàn tất ·',
  '  Không tự động leo thang · Chưa xác nhận production',
  '  (Dòng thời gian / Bảng trạng thái thêm: Không kéo-thả để lưu thay đổi)',
  '',
  'URL chính thức (exec + ?route=, không dùng googleusercontent):',
  '  https://script.google.com/macros/s/AKfycbxJNx9Vw6NBRmSZx0ds7-sNAeyGo6VKTfO8PUDpcz8e7kq1o3W0eUWRP78zPfRlKXBUPA/exec',
  '',
  'Next: Phase 97 — Staff Trial Execution / Feedback Capture',
  '  (hoặc Phase 96.1 nếu audit copy thất bại).'
].join('\n');

function CbvWebAppViUx_TestConsole__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvWebAppViUx_TestConsole__storeLatestReport_(report) {
  try {
    __CBV_WEBAPP_VI_UX_TC_LAST_REPORT = report;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_WEBAPP_VI_UX_TC_LAST_REPORT_PROP_KEY, JSON.stringify(report || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvWebAppViUx_TestConsole__getLatestReport_() {
  if (__CBV_WEBAPP_VI_UX_TC_LAST_REPORT) return __CBV_WEBAPP_VI_UX_TC_LAST_REPORT;
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_WEBAPP_VI_UX_TC_LAST_REPORT_PROP_KEY);
    if (!raw) return null;
    var rep = JSON.parse(raw);
    __CBV_WEBAPP_VI_UX_TC_LAST_REPORT = rep;
    return rep;
  } catch (e) {
    return null;
  }
}

function CbvWebAppViUx_TestConsole_run() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WS96_')
    : ('WS96_' + new Date().getTime());

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

  addCheck('RUNTIME_GET_LABEL', typeof CbvWebAppVi_getLabel === 'function', 'OK', 'CbvWebAppVi_getLabel exists', {});
  addCheck('RUNTIME_GET_ROUTE_LABEL', typeof CbvWebAppVi_getRouteLabel === 'function', 'OK', 'CbvWebAppVi_getRouteLabel exists', {});
  addCheck('RUNTIME_GET_NAV', typeof CbvWebAppVi_getNavItems === 'function', 'OK', 'CbvWebAppVi_getNavItems exists', {});
  addCheck('RUNTIME_GET_SAFETY', typeof CbvWebAppVi_getSafetyFooter === 'function', 'OK', 'CbvWebAppVi_getSafetyFooter exists', {});
  addCheck('RUNTIME_GET_LINKS', typeof CbvWebAppVi_getWebAppLinks === 'function', 'OK', 'CbvWebAppVi_getWebAppLinks exists', {});
  addCheck('RUNTIME_GET_FLOW', typeof CbvWebAppVi_getUserFlowGuide === 'function', 'OK', 'CbvWebAppVi_getUserFlowGuide exists', {});
  addCheck('RUNTIME_VALIDATE', typeof CbvWebAppVi_validate === 'function', 'OK', 'CbvWebAppVi_validate exists', {});

  try {
    var nav = CbvWebAppVi_getNavItems();
    var navOk = Array.isArray(nav) && nav.length === 8 && nav[0].label === 'Trang chủ';
    addCheck('NAV_VI', navOk, navOk ? 'OK' : 'ERROR',
      'Vietnamese nav labels present (8 items, first = Trang chủ).', { first: nav && nav[0] ? nav[0].label : '' });
    var h0 = nav && nav[0] ? String(nav[0].href || '') : '';
    var absNav = h0.indexOf('https://') === 0 && h0.indexOf('?route=') >= 0 && h0.indexOf('googleusercontent.com') < 0;
    addCheck('NAV_HREF_ABSOLUTE', absNav, absNav ? 'OK' : 'WARNING',
      'Nav hrefs use canonical /exec?route= URLs (Phase 96.1).', { firstHref: h0.substring(0, 120) });
  } catch (eN) {
    addCheck('NAV_VI', false, 'WARNING', String(eN), {});
  }

  try {
    var sf = CbvWebAppVi_getSafetyFooter('/workspace');
    var sfOk = sf.indexOf('Không tự động giao việc') >= 0 && sf.indexOf('Chưa xác nhận production') >= 0;
    addCheck('SAFETY_VI_BASE', sfOk, sfOk ? 'OK' : 'ERROR', 'Base Vietnamese safety footer.', { sample: sf.substring(0, 120) });
    var sfTk = CbvWebAppVi_getSafetyFooter('/home-alert/timeline');
    var tkOk = sfTk.indexOf('Không kéo-thả') >= 0;
    addCheck('SAFETY_VI_TIMELINE_DRAG', tkOk, tkOk ? 'OK' : 'ERROR', 'Timeline includes Vietnamese drag-drop prohibition.', {});
  } catch (eS) {
    addCheck('SAFETY_VI_BASE', false, 'WARNING', String(eS), {});
  }

  try {
    var links = CbvWebAppVi_getWebAppLinks();
    var canon = links && links.canonicalExecUrl ? links.canonicalExecUrl : '';
    var noGu = canon.indexOf('googleusercontent.com') < 0;
    var hasExec = canon.indexOf('/exec') >= 0;
    addCheck('CANONICAL_NO_GOOGLEUSERCONTENT', noGu, noGu ? 'OK' : 'CRITICAL',
      noGu ? 'Canonical URL does not use googleusercontent.com.' : 'Forbidden: googleusercontent in canonical URL.', { url: canon });
    addCheck('CANONICAL_EXEC', hasExec, hasExec ? 'OK' : 'WARNING',
      hasExec ? 'Canonical URL contains /exec.' : 'Canonical URL may be missing /exec suffix.', {});
    addCheck('ROUTE_LINKS_COUNT', (links.routes || []).length === 8, (links.routes || []).length === 8 ? 'OK' : 'ERROR',
      'Eight frozen route links documented.', { count: (links.routes || []).length });
  } catch (eL) {
    addCheck('CANONICAL_NO_GOOGLEUSERCONTENT', false, 'WARNING', String(eL), {});
  }

  try {
    if (typeof CbvWebAppWorkspace_routeRegistry === 'function') {
      var reg = CbvWebAppWorkspace_routeRegistry();
      var paths = (reg || []).map(function(r) { return r.route; }).sort().join('|');
      var expected = '/admin/reference|/home-alert/kanban|/home-alert/my-queue|/home-alert/sla|/home-alert/timeline|/reports|/runtime/health|/workspace';
      addCheck('ROUTE_PATHS_UNCHANGED', paths === expected, paths === expected ? 'OK' : 'WARNING',
        paths === expected ? 'Route paths match frozen set.' : 'Route registry paths drifted from expected freeze — verify Phase 94.',
        { paths: paths });
    } else {
      addCheck('ROUTE_PATHS_UNCHANGED', false, 'WARNING', 'route registry not loaded in this context', {});
    }
  } catch (eR) {
    addCheck('ROUTE_PATHS_UNCHANGED', false, 'WARNING', String(eR), {});
  }

  try {
    var og = CbvWebAppVi_getUserFlowGuide('operator');
    var opSla = og && og.steps && og.steps.join(' ').indexOf('SLA') >= 0;
    addCheck('OPERATOR_FLOW_MENTIONS_SLA', opSla, opSla ? 'OK' : 'WARNING',
      opSla ? 'Operator user-flow mentions SLA guidance.' : 'Operator flow should mention SLA / Quá hạn when needed.', {});
  } catch (eOp) {
    addCheck('OPERATOR_FLOW_MENTIONS_SLA', false, 'WARNING', String(eOp), {});
  }

  var low = (CBV_WEBAPP_VI_UX_HANDOFF_PROMPT || '').toLowerCase();
  addCheck('NO_PROD_READY', low.indexOf('production ready') < 0 && low.indexOf('prod ready') < 0, 'OK', 'No production-ready claim in handoff.', {});
  addCheck('NO_WRITE_REC', low.indexOf('recommend write action') < 0, 'OK', 'No write-action recommendation.', {});
  addCheck('NO_MUTATION_REC', low.indexOf('recommend mutation') < 0, 'OK', 'No mutation recommendation.', {});
  addCheck('NO_BOT_REC', low.indexOf('recommend appsheet bot') < 0, 'OK', 'No AppSheet Bot recommendation.', {});
  addCheck('NO_AI_REC', low.indexOf('recommend ai runtime') < 0, 'OK', 'No AI runtime recommendation.', {});

  var vd = null;
  var viOk = true;
  var viProbe = [];
  try {
    vd = CbvWebAppVi_validate();
    if (vd && vd.data) {
      viOk = !!vd.data.noMutationExposed && !!vd.data.canonicalOk;
      viProbe = (vd.data.mutationProbe || []).slice();
    }
    if (vd && vd.warnings) warnings = warnings.concat(vd.warnings);
    if (vd && vd.errors) errors = errors.concat(vd.errors);
  } catch (eV) {
    warnings.push('CbvWebAppVi_validate error: ' + (eV && eV.message ? eV.message : String(eV)));
  }
  addCheck('VI_VALIDATE', viOk && (!vd || vd.ok !== false), (!vd || vd.ok !== false) && viOk ? 'OK' : 'ERROR',
    'CbvWebAppVi_validate passes (canonical + mutation scan).', { probe: viProbe });

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: CBV_WEBAPP_VI_PHASE_ID,
    status: status,
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date(),
    runBy: (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'CBV_WEBAPP_VI_UX_PHASE_96',
    summary: 'Vietnamese UX (Phase 96): ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL'
      ? 'Fix Phase 96 validation errors and rerun CbvWebAppViUx_TestConsole_run().'
      : 'Run manual route smoke on canonical /exec URL; collect staff feedback (Phase 97).',
    severity: severity,
    reportText: '',
    reportJson: {},
    contractVersion: CBV_WEBAPP_VI_CONTRACT_VERSION,
    envelopeOk: false
  };

  var env = CbvWebAppViUx_TestConsole__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });

  report.reportText = [
    '=== PHASE 96 — WEBAPP VIETNAMESE UX ===',
    'status=' + report.status,
    'envelopeOk=' + report.envelopeOk,
    'traceId=' + report.traceId
  ].join('\n');

  CbvWebAppViUx_TestConsole__storeLatestReport_(report);
  try { Logger.log(report.reportText); } catch (eLog) {}
  return report;
}

function CbvWebAppViUx_TestConsole__alert_(title, payload) {
  var s = JSON.stringify(payload, null, 2);
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert(title, s.substring(0, 1800) + (s.length > 1800 ? '\n…(truncated)' : ''), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CbvWebAppViUx_TestConsole_showLabelDictionary() {
  CbvWebAppViUx_TestConsole__alert_('Phase 96 — Label dictionary', { labels: CBV_WEBAPP_VI_LABELS, routes: CBV_WEBAPP_VI_ROUTE_PAGE_TITLE });
  return { ok: true };
}

function CbvWebAppViUx_TestConsole_showRouteLinks() {
  var res;
  try { res = CbvWebAppVi_getWebAppLinks(); }
  catch (e) { res = { error: String(e) }; }
  CbvWebAppViUx_TestConsole__alert_('Phase 96 — Route links', res);
  return { ok: true };
}

function CbvWebAppViUx_TestConsole_showOperatorGuide() {
  CbvWebAppViUx_TestConsole__alert_('Phase 96 — Operator flow', CbvWebAppVi_getUserFlowGuide('operator'));
  return { ok: true };
}

function CbvWebAppViUx_TestConsole_showSupervisorGuide() {
  CbvWebAppViUx_TestConsole__alert_('Phase 96 — Supervisor flow', CbvWebAppVi_getUserFlowGuide('supervisor'));
  return { ok: true };
}

function CbvWebAppViUx_TestConsole_showAdminGuide() {
  CbvWebAppViUx_TestConsole__alert_('Phase 96 — Admin flow', CbvWebAppVi_getUserFlowGuide('admin'));
  return { ok: true };
}

function CbvWebAppViUx_TestConsole_showHandoffPrompt() {
  if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert('Phase 96 — AI handoff', CBV_WEBAPP_VI_UX_HANDOFF_PROMPT.substring(0, 1800), SpreadsheetApp.getUi().ButtonSet.OK);
  }
  return { ok: true };
}

function CbvWebAppViUx_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = CbvWebAppViUx_TestConsole__getLatestReport_();
  if (!r) {
    ui.alert('No report', 'Run Vietnamese UX Health Check first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Phase 96 — copy report');
  return { ok: true };
}
