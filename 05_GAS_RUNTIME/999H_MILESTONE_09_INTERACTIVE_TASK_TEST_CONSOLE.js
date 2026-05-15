/**
 * MILESTONE_09 — Interactive Task Runtime — Full test (CBV_TCS_V1)
 *
 * Menu: 🧪 CBV Test Console → M09 — Run Interactive Task Runtime Test
 *
 * Depends: 999G, 999D, 999F, 999A, 998P, 998L, 998Y, 999B, 999C, 999E patterns
 */

/** M09 markers — pre-commit: strings must stay findable in this file (scripts/cbv-marker-contract-self-check.mjs). */
var CBV_TCS_M09_INTERACTIVE_TASK_UI_MARKERS = [
  'cbv-m09-interactive-task-root',
  'cbv-m09-clickable-task-card',
  'cbv-m09-active-task-session',
  'cbv-m09-task-context-panel',
  'cbv-m09-task-context-empty',
  'cbv-m09-task-title-click',
  'cbv-m09-open-task-action',
  'cbv-m09-appsheet-detail-action',
  'cbv-m09-appsheet-form-action',
  'cbv-m09-appsheet-list-action',
  'cbv-m09-sop-action',
  'cbv-m09-quick-note-preview',
  'cbv-m09-quick-update-safe-disabled',
  'cbv-m09-action-confirmation',
  'cbv-m09-task-timeline-preview',
  'cbv-m09-checklist-preview',
  'cbv-m09-evidence-placeholder',
  'cbv-m09-taskid-missing-fallback',
  'cbv-m09-rowkey-missing-fallback',
  'cbv-m09-route-query-param-safe',
  'cbv-m09-empty-state',
  'cbv-m09-report-envelope',
  'cbv-m09-focus-hero',
  'cbv-m09-focus-action-bar',
  'cbv-m09-focus-session-info',
  'cbv-m09-focus-task-context',
  'cbv-m09-focus-next-action',
  'cbv-m09-focus-quick-log-preview',
  'cbv-m09-focus-quick-note-form',
  'cbv-m09-focus-workflow-continuity',
  'cbv-m09-focus-safe-copy',
  'cbv-m09-focus-debug-hidden'
];

var __CBV_TCS_MILESTONE09_TC_LAST_REPORT = null;
var __CBV_TCS_MILESTONE09_TC_LAST_PROP_KEY = 'CBV_TCS_MILESTONE09_TC_LAST_REPORT_JSON';

function CbvTcsMilestone09InteractiveTask_TestConsole__storeLatest_(rep) {
  try {
    __CBV_TCS_MILESTONE09_TC_LAST_REPORT = rep;
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      PropertiesService.getDocumentProperties().setProperty(__CBV_TCS_MILESTONE09_TC_LAST_PROP_KEY, JSON.stringify(rep || null));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}

function CbvTcsMilestone09__buildEvidenceHtml_(checks) {
  var failed = (checks || []).filter(function (c) { return c && c.ok === false; });
  var rows = failed.map(function (c) {
    return '<tr><td>' + String(c.code || '').replace(/</g, '&lt;') + '</td><td>' + String(c.severity || '').replace(/</g, '&lt;') + '</td><td>' + String(c.message || '').replace(/</g, '&lt;') + '</td></tr>';
  }).join('');
  var markerRow = '<div class="' + CBV_TCS_M09_INTERACTIVE_TASK_UI_MARKERS.join(' ') + '" data-cbv-m09-evidence-probe="1" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)"></div>';
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>MILESTONE_09 Evidence</title><style>body{font-family:system-ui,sans-serif}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body>' +
    markerRow +
    '<h1>MILESTONE_09 — Interactive Task Runtime</h1>' +
    (failed.length ? ('<table><thead><tr><th>code</th><th>severity</th><th>message</th></tr></thead><tbody>' + rows + '</tbody></table>') : '<p>No failed checks.</p>') +
    '</body></html>';
}

function CbvTcsMilestone09__buildAiHandoffMd_(draft, traceId) {
  return [
    '# AI Handoff — Milestone 09 (Interactive Task Runtime)',
    '',
    '**finalStatus:** `' + draft.status + '`',
    '**envelopeOk:** `' + String(draft.envelopeOk) + '`',
    '**traceId:** `' + traceId + '`',
    '',
    draft.status === 'FAIL' ? '## Outcome: FAIL\n' : '## Outcome\n',
    (draft.checks || []).filter(function (c) { return c && c.ok === false; }).map(function (c) {
      return '- **' + c.code + '** (' + c.severity + '): ' + c.message;
    }).join('\n') || '- (none)',
    '',
    '## Next',
    String(draft.nextStep || '')
  ].join('\n');
}

function CbvTcsMilestone09__viValidateDetail_(vu) {
  if (!vu) {
    return { viOk: false, note: 'CbvWebAppVi_validate returned null', errorCount: 1, warningCount: 0 };
  }
  var d = vu.data || {};
  var errs = vu.errors || [];
  var warns = vu.warnings || [];
  return {
    viOk: vu.ok === true,
    canonicalOk: d.canonicalOk === true,
    noMutationExposed: d.noMutationExposed === true,
    missingRoutes: (d.missingRoutes || []).slice(),
    missingLabels: (d.missingLabels || []).slice(),
    errorCount: errs.length,
    warningCount: warns.length,
    errorsSample: errs.slice(0, 6),
    warningsSample: warns.slice(0, 4)
  };
}

/**
 * One-click Milestone 09 Interactive Task Runtime + Drive 6-file bundle (append-only).
 */
function CbvTcsMilestone09InteractiveTask_TestConsole_runFull() {
  var traceId = (typeof CbvWebAppWorkspace__traceId_ === 'function')
    ? CbvWebAppWorkspace__traceId_().replace(/^WS\d+_/, 'WSM09_')
    : ('WSM09_' + new Date().getTime());

  var checks = [];
  var externalWarnings = [];

  function addCheck(code, ok, severity, message, detail) {
    var sev;
    if (ok) sev = severity || 'OK';
    else {
      if (severity === 'WARNING' || severity === 'ERROR' || severity === 'CRITICAL') sev = severity;
      else sev = 'ERROR';
    }
    checks.push({ code: code, ok: ok === true, severity: sev, message: message, detail: detail || {} });
  }

  try {
    var eTr = { parameter: { route: '/workspace/task-runtime?taskId=M09ABC&rowKey=RK1&source=WB' } };
    var pTr = (typeof CbvWebAppRoute_parseRouteAndParams_ === 'function') ? CbvWebAppRoute_parseRouteAndParams_(eTr.parameter.route, eTr) : null;
    var okTr =
      pTr &&
      pTr.route === '/workspace/task-runtime' &&
      String(pTr.params.taskId || '') === 'M09ABC' &&
      String(pTr.params.rowKey || '') === 'RK1' &&
      String(pTr.params.source || '') === 'WB';
    addCheck('M09_ROUTE_QUERY_PARAM_SAFE', okTr, okTr ? 'OK' : 'ERROR', 'taskId/rowKey/source preserved on task-runtime route', pTr || {});
  } catch (eR) {
    addCheck('M09_ROUTE_QUERY_PARAM_SAFE', false, 'ERROR', String(eR), {});
  }

  try {
    var pgW = (typeof CbvStaffWorkboard_renderPage_ === 'function') ? CbvStaffWorkboard_renderPage_({}) : { bodyHtml: '' };
    var hw = String((pgW && pgW.bodyHtml) || '');
    var hasCard = hw.indexOf('cbv-m09-clickable-task-card') >= 0 && hw.indexOf('data-task-id') >= 0;
    addCheck('M09_CLICKABLE_TASK_CARD', hasCard, hasCard ? 'OK' : 'ERROR', 'Workboard embeds clickable M09 task card markers', { len: hw.length });
  } catch (eC) {
    addCheck('M09_CLICKABLE_TASK_CARD', false, 'ERROR', String(eC), {});
  }

  try {
    var sess = (typeof CbvInteractiveTaskRuntime_buildSession_ === 'function')
      ? CbvInteractiveTaskRuntime_buildSession_({ taskId: 'S1', rowKey: 'RK', source: 'T', mode: 'READ_FIRST', route: '/workspace/task-runtime' })
      : null;
    var needS = ['activeTaskId', 'activeTaskRowKey', 'openedAt', 'openedBy', 'route', 'traceId', 'source', 'mode', 'focusMode', 'safeWriteEnabled'];
    var missS = needS.filter(function (k) { return !sess || sess[k] === undefined; });
    var snap = sess ? JSON.stringify(sess) : '';
    addCheck('M09_ACTIVE_TASK_SESSION', missS.length === 0, missS.length === 0 ? 'OK' : 'ERROR', 'Session object fields', { missing: missS, snapLen: snap.length });
  } catch (eS) {
    addCheck('M09_ACTIVE_TASK_SESSION', false, 'ERROR', String(eS), {});
  }

  try {
    var pan = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'M09_PANEL', rowKey: 'TEST_ROW_001', source: 'TEST' })
      : '';
    var panOk = pan.indexOf('cbv-m09-task-context-panel') >= 0 && pan.indexOf('M09_PANEL') >= 0;
    addCheck('M09_CONTEXT_PANEL_RENDER', panOk, panOk ? 'OK' : 'ERROR', 'Context panel renders for taskId', { len: pan.length });
  } catch (eP) {
    addCheck('M09_CONTEXT_PANEL_RENDER', false, 'ERROR', String(eP), {});
  }

  try {
    var emp = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ __preflightState: 'MISSING_TASKID' })
      : '';
    var empOk = emp.indexOf('cbv-m09-task-context-empty') >= 0 && emp.indexOf('cbv-m09-taskid-missing-fallback') >= 0;
    addCheck('M09_CONTEXT_PANEL_EMPTY_STATE', empOk, empOk ? 'OK' : 'ERROR', 'Empty state when taskId missing', {});
  } catch (eE) {
    addCheck('M09_CONTEXT_PANEL_EMPTY_STATE', false, 'ERROR', String(eE), {});
  }

  try {
    var tProbe = { taskId: 'IGNORED', raw: { TASK_ROW_KEY: 'TEST_ROW_001' } };
    var dUrl = (typeof CbvAppSheetBridge_buildTaskMainDetailUrl_ === 'function') ? CbvAppSheetBridge_buildTaskMainDetailUrl_(tProbe) : { ok: false };
    var cfgOn = (typeof CbvAppSheetBridge_getConfig_ === 'function') && CbvAppSheetBridge_getConfig_().configured === true;
    var detOk =
      !cfgOn ||
      (dUrl && dUrl.ok === true && String(dUrl.url || '').indexOf('TEST_ROW_001') >= 0 && String(dUrl.url || '').indexOf('{{TASK_ROW_KEY}}') < 0);
    addCheck('M09_APPSHEET_DETAIL_ACTION', detOk, detOk ? 'OK' : 'ERROR', 'Uses CbvAppSheetBridge_buildTaskMainDetailUrl_', { ok: dUrl ? dUrl.ok : null });
  } catch (eD) {
    addCheck('M09_APPSHEET_DETAIL_ACTION', false, 'ERROR', String(eD), {});
  }

  try {
    var tProbe2 = { taskId: 'IGNORED', raw: { TASK_ROW_KEY: 'TEST_ROW_001' } };
    var fUrl = (typeof CbvAppSheetBridge_buildTaskMainFormUrl_ === 'function') ? CbvAppSheetBridge_buildTaskMainFormUrl_(tProbe2) : { ok: false };
    var cfgOn2 = (typeof CbvAppSheetBridge_getConfig_ === 'function') && CbvAppSheetBridge_getConfig_().configured === true;
    var formOk =
      !cfgOn2 ||
      (fUrl && fUrl.ok === true && String(fUrl.url || '').indexOf('TEST_ROW_001') >= 0 && String(fUrl.url || '').indexOf('{{TASK_ROW_KEY}}') < 0);
    addCheck('M09_APPSHEET_FORM_ACTION', formOk, formOk ? 'OK' : 'ERROR', 'Uses CbvAppSheetBridge_buildTaskMainFormUrl_', { ok: fUrl ? fUrl.ok : null });
  } catch (eF) {
    addCheck('M09_APPSHEET_FORM_ACTION', false, 'ERROR', String(eF), {});
  }

  try {
    var lUrl = (typeof CbvAppSheetBridge_buildTaskMainUrl_ === 'function') ? CbvAppSheetBridge_buildTaskMainUrl_() : { ok: false };
    var cfgOn3 = (typeof CbvAppSheetBridge_getConfig_ === 'function') && CbvAppSheetBridge_getConfig_().configured === true;
    var listOk = !cfgOn3 || (lUrl && lUrl.ok === true && /^https:\/\//i.test(String(lUrl.url || '')));
    addCheck('M09_APPSHEET_LIST_ACTION', listOk, listOk ? 'OK' : 'ERROR', 'Uses CbvAppSheetBridge_buildTaskMainUrl_', { ok: lUrl ? lUrl.ok : null });
  } catch (eL) {
    addCheck('M09_APPSHEET_LIST_ACTION', false, 'ERROR', String(eL), {});
  }

  try {
    var noRk = { taskId: 'NRK_ONLY_NO_ROW', raw: {} };
    var badD = (typeof CbvAppSheetBridge_buildTaskMainDetailUrl_ === 'function') ? CbvAppSheetBridge_buildTaskMainDetailUrl_(noRk) : { ok: true };
    var badF = (typeof CbvAppSheetBridge_buildTaskMainFormUrl_ === 'function') ? CbvAppSheetBridge_buildTaskMainFormUrl_(noRk) : { ok: true };
    var rkSafe =
      badD &&
      badD.ok === false &&
      badF &&
      badF.ok === false &&
      String(badD.url || '') === '' &&
      String(badF.url || '') === '' &&
      badD.safeDisabled === true &&
      badF.safeDisabled === true &&
      String(badD.reason || '') === 'TASK_ROW_KEY_MISSING' &&
      String(badF.reason || '') === 'TASK_ROW_KEY_MISSING';
    addCheck('M09_ROWKEY_MISSING_SAFE_DISABLED', rkSafe, rkSafe ? 'OK' : 'ERROR', 'No fake URLs without explicit TASK_MAIN row key', {
      dOk: badD.ok,
      fOk: badF.ok,
      dUrlLen: String(badD.url || '').length,
      dReason: badD.reason,
      dSd: badD.safeDisabled
    });
  } catch (eRk) {
    addCheck('M09_ROWKEY_MISSING_SAFE_DISABLED', false, 'ERROR', String(eRk), {});
  }

  try {
    var sopP = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'SOP1', source: 'HOME_ALERT' })
      : '';
    var encTid = encodeURIComponent('SOP1');
    var hasTid = sopP.indexOf('taskId=' + encTid) >= 0 || sopP.indexOf('taskId=SOP1') >= 0;
    var hasCtx = sopP.indexOf('source=') >= 0 || sopP.indexOf('module=') >= 0;
    var hasFrom = sopP.indexOf('from=') >= 0;
    var sopOk =
      sopP.indexOf('cbv-m09-sop-action') >= 0 &&
      sopP.indexOf('/workspace/sop') >= 0 &&
      hasTid &&
      hasCtx &&
      hasFrom;
    addCheck('M09_SOP_ACTION', sopOk, sopOk ? 'OK' : 'ERROR', 'SOP link carries taskId + source/module + from', { hasTid: hasTid, hasCtx: hasCtx, hasFrom: hasFrom });
  } catch (eSo) {
    addCheck('M09_SOP_ACTION', false, 'ERROR', String(eSo), {});
  }

  try {
    var qn = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'QN1', rowKey: 'TEST_ROW_001' })
      : '';
    var qnOk = qn.indexOf('cbv-m09-quick-note-preview') >= 0;
    addCheck('M09_QUICK_NOTE_PREVIEW', qnOk, qnOk ? 'OK' : 'ERROR', 'Quick note preview UI present', {});
  } catch (eQ) {
    addCheck('M09_QUICK_NOTE_PREVIEW', false, 'ERROR', String(eQ), {});
  }

  try {
    var qu = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'QU1', rowKey: 'TEST_ROW_001' })
      : '';
    var quOk = qu.indexOf('cbv-m09-quick-update-safe-disabled') >= 0;
    addCheck('M09_QUICK_UPDATE_SAFE_DISABLED', quOk, quOk ? 'OK' : 'ERROR', 'Write path safe-disabled marker', {});
  } catch (eQu) {
    addCheck('M09_QUICK_UPDATE_SAFE_DISABLED', false, 'ERROR', String(eQu), {});
  }

  try {
    var ac = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'AC1', rowKey: 'TEST_ROW_001' })
      : '';
    var acOk = ac.indexOf('cbv-m09-action-confirmation') >= 0;
    addCheck('M09_ACTION_CONFIRMATION', acOk, acOk ? 'OK' : 'ERROR', 'Confirmation copy present', {});
  } catch (eA) {
    addCheck('M09_ACTION_CONFIRMATION', false, 'ERROR', String(eA), {});
  }

  try {
    var tl = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'TL1', rowKey: 'TEST_ROW_001' })
      : '';
    var tlOk = tl.indexOf('cbv-m09-task-timeline-preview') >= 0;
    addCheck('M09_TIMELINE_PREVIEW', tlOk, tlOk ? 'OK' : 'ERROR', 'Timeline preview section', {});
  } catch (eT) {
    addCheck('M09_TIMELINE_PREVIEW', false, 'ERROR', String(eT), {});
  }

  try {
    var cl = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'CL1', rowKey: 'TEST_ROW_001' })
      : '';
    var clOk = cl.indexOf('cbv-m09-checklist-preview') >= 0;
    addCheck('M09_CHECKLIST_PREVIEW', clOk, clOk ? 'OK' : 'ERROR', 'Checklist preview', {});
  } catch (eCl) {
    addCheck('M09_CHECKLIST_PREVIEW', false, 'ERROR', String(eCl), {});
  }

  try {
    var ev = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'EV1', rowKey: 'TEST_ROW_001' })
      : '';
    var evOk = ev.indexOf('cbv-m09-evidence-placeholder') >= 0;
    addCheck('M09_EVIDENCE_PLACEHOLDER', evOk, evOk ? 'OK' : 'ERROR', 'Evidence placeholder', {});
  } catch (eV) {
    addCheck('M09_EVIDENCE_PLACEHOLDER', false, 'ERROR', String(eV), {});
  }

  try {
    var fx = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'FX1', rowKey: 'TEST_ROW_001', source: 'TEST', probeTitle: 'FX Title' })
      : '';
    var heroOk =
      fx.indexOf('cbv-m09-focus-hero') >= 0 &&
      (fx.indexOf('FX1') >= 0 || fx.indexOf('FX Title') >= 0) &&
      fx.indexOf('Trạng thái') >= 0 &&
      fx.indexOf('SLA') >= 0;
    addCheck('M09_FOCUS_HERO_BLOCK', heroOk, heroOk ? 'OK' : 'ERROR', 'Focus hero + task fields', { len: fx.length });
  } catch (eFx) {
    addCheck('M09_FOCUS_HERO_BLOCK', false, 'ERROR', String(eFx), {});
  }

  try {
    var fx2 = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'FX2', rowKey: 'TEST_ROW_001' })
      : '';
    var barOk = fx2.indexOf('cbv-m09-focus-action-bar') >= 0 && fx2.indexOf('cbv-m09-appsheet-detail-action') >= 0;
    addCheck('M09_FOCUS_ACTION_BAR', barOk, barOk ? 'OK' : 'ERROR', 'Action bar + AppSheet action classes', {});
  } catch (eFb) {
    addCheck('M09_FOCUS_ACTION_BAR', false, 'ERROR', String(eFb), {});
  }

  try {
    var fx3 = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'FX3', rowKey: 'TEST_ROW_001' })
      : '';
    var sessOk =
      fx3.indexOf('cbv-m09-focus-session-info') >= 0 &&
      fx3.indexOf('Phiên làm việc') >= 0 &&
      fx3.indexOf('safeWriteEnabled=false') >= 0 &&
      fx3.indexOf('traceId') >= 0;
    addCheck('M09_FOCUS_SESSION_INFO', sessOk, sessOk ? 'OK' : 'ERROR', 'Session info visible', {});
  } catch (eFs) {
    addCheck('M09_FOCUS_SESSION_INFO', false, 'ERROR', String(eFs), {});
  }

  try {
    var fx4 = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'FX4', rowKey: 'TEST_ROW_001' })
      : '';
    var ctxOk = fx4.indexOf('cbv-m09-focus-task-context') >= 0 && fx4.indexOf('sourceModule') >= 0;
    addCheck('M09_FOCUS_TASK_CONTEXT', ctxOk, ctxOk ? 'OK' : 'ERROR', 'Structured task context', {});
  } catch (eFc) {
    addCheck('M09_FOCUS_TASK_CONTEXT', false, 'ERROR', String(eFc), {});
  }

  try {
    var fx5 = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'FX5', rowKey: 'TEST_ROW_001' })
      : '';
    var naOk = fx5.indexOf('cbv-m09-focus-next-action') >= 0 && fx5.indexOf('Bước tiếp theo') >= 0;
    addCheck('M09_FOCUS_NEXT_ACTION', naOk, naOk ? 'OK' : 'ERROR', 'Next action section', {});
  } catch (eFn) {
    addCheck('M09_FOCUS_NEXT_ACTION', false, 'ERROR', String(eFn), {});
  }

  try {
    var fx6 = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'FX6', rowKey: 'TEST_ROW_001' })
      : '';
    var qlOk =
      fx6.indexOf('cbv-m09-focus-quick-log-preview') >= 0 &&
      fx6.indexOf('Chưa có log trong phiên này') >= 0;
    addCheck('M09_FOCUS_QUICK_LOG_PREVIEW', qlOk, qlOk ? 'OK' : 'ERROR', 'Quick log empty state (no fake history)', {});
  } catch (eFl) {
    addCheck('M09_FOCUS_QUICK_LOG_PREVIEW', false, 'ERROR', String(eFl), {});
  }

  try {
    var fx7 = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'FX7', rowKey: 'TEST_ROW_001' })
      : '';
    var qfOk =
      fx7.indexOf('cbv-m09-focus-quick-note-form') >= 0 &&
      fx7.indexOf('cbv-m09-quick-note-preview') >= 0 &&
      fx7.indexOf('cbv-m09-quick-update-safe-disabled') >= 0 &&
      fx7.indexOf('Xem trước') >= 0;
    addCheck('M09_FOCUS_QUICK_NOTE_FORM', qfOk, qfOk ? 'OK' : 'ERROR', 'Quick note form + safe-disabled', {});
  } catch (eFq) {
    addCheck('M09_FOCUS_QUICK_NOTE_FORM', false, 'ERROR', String(eFq), {});
  }

  try {
    var fx8 = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'FX8', rowKey: 'TEST_ROW_001' })
      : '';
    var wfOk =
      fx8.indexOf('cbv-m09-focus-workflow-continuity') >= 0 &&
      fx8.indexOf('Quay lại Daily') >= 0 &&
      fx8.indexOf('Về Workboard') >= 0 &&
      fx8.indexOf('My Queue') >= 0 &&
      fx8.indexOf('Task tiếp theo') >= 0;
    addCheck('M09_FOCUS_WORKFLOW_CONTINUITY', wfOk, wfOk ? 'OK' : 'ERROR', 'Workflow continuity links', {});
  } catch (eFw) {
    addCheck('M09_FOCUS_WORKFLOW_CONTINUITY', false, 'ERROR', String(eFw), {});
  }

  try {
    var fx9 = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'FX9', rowKey: 'TEST_ROW_001', __preflightState: 'APPSHEET_UNCONFIGURED' })
      : '';
    var badPhrase = 'Chưa cấu hình AppSheet link';
    var parts = fx9.split(badPhrase);
    var copyOk = parts.length <= 1 && fx9.indexOf('cbv-m09-focus-safe-copy') >= 0;
    addCheck('M09_FOCUS_SAFE_COPY', copyOk, copyOk ? 'OK' : 'ERROR', 'Friendly AppSheet copy; no repeated technical phrase', { repeatCount: parts.length - 1 });
  } catch (eFy) {
    addCheck('M09_FOCUS_SAFE_COPY', false, 'ERROR', String(eFy), {});
  }

  try {
    var fx0 = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ taskId: 'FX0', rowKey: 'TEST_ROW_001' })
      : '';
    var dbOk = fx0.indexOf('cbv-m09-focus-debug-hidden') >= 0;
    addCheck('M09_FOCUS_DEBUG_HIDDEN', dbOk, dbOk ? 'OK' : 'ERROR', 'Debug / technical strip hidden', {});
  } catch (eFd) {
    addCheck('M09_FOCUS_DEBUG_HIDDEN', false, 'ERROR', String(eFd), {});
  }

  try {
    var empFx = (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
      ? CbvInteractiveTaskRuntime_renderContextPanelHtml_({ __preflightState: 'MISSING_TASKID' })
      : '';
    var empFxOk =
      empFx.indexOf('cbv-m09-focus-hero') >= 0 &&
      empFx.indexOf('cbv-m09-focus-action-bar') >= 0 &&
      empFx.indexOf('cbv-m09-focus-session-info') >= 0;
    addCheck('M09_FOCUS_EMPTY_STATE_MARKERS', empFxOk, empFxOk ? 'OK' : 'ERROR', 'Focus markers present without taskId', {});
  } catch (eFe) {
    addCheck('M09_FOCUS_EMPTY_STATE_MARKERS', false, 'ERROR', String(eFe), {});
  }

  try {
    var pfStates = ['HAS_DATA', 'EMPTY_DATA', 'APPSHEET_UNCONFIGURED', 'MISSING_TASKID', 'QUERY_PARAM_ROUTE'];
    var pfRes = CbvUiMarkerPreflight_runContract_({
      requiredMarkers: CBV_TCS_M09_INTERACTIVE_TASK_UI_MARKERS,
      states: pfStates,
      renderer: function (st) {
        var pr = {
          __preflightState: String(st || ''),
          taskId: st === 'MISSING_TASKID' ? '' : 'M09_TID',
          rowKey: st === 'APPSHEET_UNCONFIGURED' ? '' : 'TEST_ROW_001',
          source: 'TEST',
          route: '/workspace/task-runtime',
          mode: 'READ_FIRST'
        };
        if (st === 'HAS_DATA') pr.probeTitle = 'Preflight HAS_DATA';
        return (typeof CbvInteractiveTaskRuntime_renderContextPanelHtml_ === 'function')
          ? CbvInteractiveTaskRuntime_renderContextPanelHtml_(pr)
          : '';
      }
    });
    var pfOk = pfRes && pfRes.ok === true;
    addCheck(
      'M09_MARKER_PREFLIGHT',
      pfOk,
      pfOk ? 'OK' : 'ERROR',
      'M09 markers present for every probe state',
      { missingMarkersUnion: pfRes.missingMarkersUnion, statesChecked: pfRes.statesChecked }
    );
  } catch (ePf) {
    addCheck('M09_MARKER_PREFLIGHT', false, 'ERROR', String(ePf), {});
  }

  try {
    var pg = (typeof CbvStaffWorkboard_renderPage_ === 'function') ? CbvStaffWorkboard_renderPage_({}) : { bodyHtml: '' };
    var html = String((pg && pg.bodyHtml) || '');
    var missM = CBV_TCS_M09_INTERACTIVE_TASK_UI_MARKERS.filter(function (mk) { return html.indexOf(mk) < 0; });
    addCheck('M09_MARKERS_ON_WORKBOARD_PAGE', missM.length === 0, missM.length === 0 ? 'OK' : 'ERROR', 'Workboard embeds M09 markers', { missing: missM });
  } catch (eW) {
    addCheck('M09_MARKERS_ON_WORKBOARD_PAGE', false, 'ERROR', String(eW), {});
  }

  var m08Markers = (typeof CBV_TCS_M08_OPERATIONAL_STATE_UI_MARKERS !== 'undefined') ? CBV_TCS_M08_OPERATIONAL_STATE_UI_MARKERS : [];
  if (!m08Markers.length) {
    m08Markers = [
      'cbv-m08-ops-state-root',
      'cbv-m08-state-engine',
      'cbv-m08-state-registry',
      'cbv-m08-transition-contract',
      'cbv-m08-transition-validator',
      'cbv-m08-operational-timeline',
      'cbv-m08-timeline-empty-state',
      'cbv-m08-sla-runtime',
      'cbv-m08-sla-warning',
      'cbv-m08-today-state-dashboard',
      'cbv-m08-supervisor-state-runtime',
      'cbv-m08-event-hook-safe-disabled',
      'cbv-m08-taskid-missing-fallback',
      'cbv-m08-route-query-param-safe',
      'cbv-m08-empty-state',
      'cbv-m08-report-envelope',
      'cbv-m08-operational-state-empty'
    ];
  }
  try {
    var pg8 = (typeof CbvStaffWorkboard_renderPage_ === 'function') ? CbvStaffWorkboard_renderPage_({}) : { bodyHtml: '' };
    var h8 = String((pg8 && pg8.bodyHtml) || '');
    var miss8 = m08Markers.filter(function (mk) { return h8.indexOf(mk) < 0; });
    addCheck('REGRESSION_M08_OPERATIONAL_STATE', miss8.length === 0, miss8.length === 0 ? 'OK' : 'ERROR', 'M08 markers still on workboard', { missing: miss8 });
  } catch (e8) {
    addCheck('REGRESSION_M08_OPERATIONAL_STATE', false, 'ERROR', String(e8), {});
  }

  var m07Markers = (typeof CBV_TCS_M07_LIVE_BRIDGE_UI_MARKERS !== 'undefined') ? CBV_TCS_M07_LIVE_BRIDGE_UI_MARKERS : [];
  if (!m07Markers.length) {
    m07Markers = [
      'cbv-m07-appsheet-live-bridge-root',
      'cbv-m07-appsheet-config-runtime',
      'cbv-m07-appsheet-safe-disabled',
      'cbv-m07-deeplink-builder',
      'cbv-m07-context-handoff',
      'cbv-m07-upload-runtime',
      'cbv-m07-feedback-runtime',
      'cbv-m07-return-workboard',
      'cbv-m07-appsheet-health-runtime',
      'cbv-m07-route-query-param-safe',
      'cbv-m07-taskid-missing-fallback',
      'cbv-m07-empty-state',
      'cbv-m07-report-envelope',
      'cbv-appsheet-live-bridge-safe-disabled'
    ];
  }
  try {
    var pg7 = (typeof CbvStaffWorkboard_renderPage_ === 'function') ? CbvStaffWorkboard_renderPage_({}) : { bodyHtml: '' };
    var h7 = String((pg7 && pg7.bodyHtml) || '');
    var miss7 = m07Markers.filter(function (mk) { return h7.indexOf(mk) < 0; });
    addCheck('REGRESSION_M07_APPSHEET_LIVE_BRIDGE', miss7.length === 0, miss7.length === 0 ? 'OK' : 'ERROR', 'M07 ribbon markers still on workboard', { missing: miss7 });
  } catch (e7) {
    addCheck('REGRESSION_M07_APPSHEET_LIVE_BRIDGE', false, 'ERROR', String(e7), {});
  }

  addCheck('UI_MARKER_PREFLIGHT_RUNTIME', typeof CbvUiMarkerPreflight_runContract_ === 'function', 'OK', 'CbvUiMarkerPreflight_runContract_', {});

  var trBootstrap = (typeof CbvTcsReports_ensureSheet_ === 'function')
    ? CbvTcsReports_ensureSheet_()
    : { ok: false, error: 'CbvTcsReports_ensureSheet_ not loaded (999F_TEST_REPORTS_BOOTSTRAP_RUNTIME)' };
  var errLow = String(trBootstrap.error || '').toLowerCase();
  var bootSev = trBootstrap.ok ? 'OK' : (errLow.indexOf('permission') >= 0 || errLow.indexOf('denied') >= 0 ? 'ERROR' : 'WARNING');
  addCheck(
    'M09_TEST_REPORTS_BOOTSTRAP',
    trBootstrap.ok === true,
    bootSev,
    trBootstrap.ok
      ? 'CBV_TEST_REPORTS ensured (idempotent); missing headers appended on row 1 only.'
      : ('CBV_TEST_REPORTS bootstrap failed: ' + String(trBootstrap.error || 'unknown')),
    trBootstrap
  );

  var vu = null;
  try {
    vu = (typeof CbvWebAppVi_validate === 'function') ? CbvWebAppVi_validate() : null;
    var viDetail = CbvTcsMilestone09__viValidateDetail_(vu);
    addCheck('VI_VALIDATE', vu && vu.ok === true, vu && vu.ok ? 'OK' : 'ERROR', 'CbvWebAppVi_validate', viDetail);
    if (vu && vu.warnings) vu.warnings.forEach(function (w) { externalWarnings.push('VI_VALIDATE: ' + w); });
  } catch (eV) {
    addCheck('VI_VALIDATE', false, 'WARNING', String(eV), {});
  }

  addCheck('DRIVE_BUNDLE_FN', typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function', 'OK', 'CbvTcsDriveReport_exportMilestoneFullTestBundle', {});

  var now = (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date();
  var runBy = (typeof CbvWebAppWorkspace__actor_ === 'function') ? CbvWebAppWorkspace__actor_() : (typeof cbvUser === 'function' ? cbvUser() : '');

  var runFin = (typeof CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeRunStatusFromChecks_(checks, externalWarnings)
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['M01_FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P before 999H.' };

  var reportText = [
    '=== MILESTONE_09 — INTERACTIVE TASK RUNTIME TEST ===',
    'traceId=' + traceId,
    'runStatus=' + runFin.status,
    'runOk=' + String(runFin.ok),
    'failedChecks=' + JSON.stringify((checks || []).filter(function (c) { return c && c.ok === false; }).map(function (c) { return c.code; }))
  ].join('\n');

  var draft = {
    ok: runFin.ok,
    phase: 'MILESTONE_09_INTERACTIVE_TASK_RUNTIME',
    status: runFin.status,
    checkedAt: now,
    runBy: runBy,
    traceId: traceId,
    testSuite: 'MILESTONE_09_INTERACTIVE_TASK_RUNTIME',
    summary: 'Milestone 09 interactive task test (pre-envelope): ' + runFin.status + ' (' + runFin.severity + ')',
    checks: checks,
    warnings: runFin.warnings || [],
    errors: runFin.errors || [],
    nextStep: runFin.nextStep,
    severity: runFin.severity,
    reportText: reportText,
    reportJson: { driveFolderId: (typeof CBV_TCS_DRIVE_REPORT_FOLDER_ID !== 'undefined') ? CBV_TCS_DRIVE_REPORT_FOLDER_ID : '', milestone09: true },
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false
  };

  var keysOk = (typeof CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_ === 'function')
    ? CbvTcsMilestone01OpWorkspace_TestConsole__validateEnvelope_(draft).ok
    : false;
  var ic = (typeof CbvTcsMilestone01OpWorkspace__validateAllCheckItems_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__validateAllCheckItems_(checks)
    : { ok: false, bad: ['validator_missing'] };
  addCheck('CHECK_ITEM_CONTRACT', ic.ok === true, ic.ok ? 'OK' : 'ERROR', 'Each check row has code/ok/severity/message/detail', { bad: ic.bad || [] });

  var structCore = keysOk === true && ic.ok === true && String(reportText || '').trim().length > 0;
  var envelopeRowOk = structCore === true && runFin.status !== 'FAIL';

  checks.push({
    code: 'REPORT_ENVELOPE',
    ok: envelopeRowOk === true,
    severity: envelopeRowOk ? 'OK' : 'ERROR',
    message: 'Envelope row (top-level keys + check contract + reportText + run not FAIL)',
    detail: { keysOk: keysOk, itemContractOk: ic.ok, reportTextLen: String(reportText || '').length, runStatus: runFin.status, mode: 'CBV_TCS_V1_MILESTONE09' }
  });
  draft.checks = checks;
  draft.envelopeOk = envelopeRowOk === true;

  var fin = (typeof CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_ === 'function')
    ? CbvTcsMilestone01OpWorkspace__finalizeStatusFromPayload_({
      checks: checks,
      envelopeOk: draft.envelopeOk === true,
      externalWarnings: [],
      errors: runFin.errors || [],
      warnings: runFin.warnings || []
    })
    : { ok: false, status: 'FAIL', severity: 'ERROR', errors: ['FINALIZE_MISSING'], warnings: [], nextStep: 'Load 998P.' };

  draft.ok = fin.ok;
  draft.status = fin.status;
  draft.severity = fin.severity;
  draft.errors = fin.errors || [];
  draft.warnings = fin.warnings || [];
  draft.nextStep = fin.nextStep;
  draft.summary = 'Milestone 09 interactive task test: ' + fin.status + ' (' + fin.severity + ')';
  draft.reportText = reportText + '\nfinalStatus=' + fin.status + '\nfinalOk=' + String(fin.ok) + '\nenvelopeOk=' + String(draft.envelopeOk);

  var bundleEx = null;
  try {
    if (typeof CbvTcsDriveReport_exportMilestoneFullTestBundle === 'function' && typeof CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_ === 'function') {
      var exportDraft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, true, {
        preWrite: true,
        expectedMinFiles: 6,
        note: 'Milestone 09 Drive bundle'
      });
      exportDraft.reportJson.finalStatus = exportDraft.status;
      exportDraft.reportJson.ok = exportDraft.ok;
      exportDraft.reportJson.severity = exportDraft.severity;
      exportDraft.reportJson.envelopeOk = exportDraft.envelopeOk;

      var handoffMd = CbvTcsMilestone09__buildAiHandoffMd_(exportDraft, traceId);
      bundleEx = CbvTcsDriveReport_exportMilestoneFullTestBundle(exportDraft, {
        tagStem: 'MILESTONE_09_INTERACTIVE_TASK_RUNTIME',
        aiHandoffMarkdown: handoffMd,
        evidenceHtml: CbvTcsMilestone09__buildEvidenceHtml_(exportDraft.checks)
      });
      var fc = bundleEx && bundleEx.files ? bundleEx.files.length : 0;
      var exportOk = !!(bundleEx && bundleEx.ok === true && fc >= 6);

      if (bundleEx && bundleEx.warnings) {
        bundleEx.warnings.forEach(function (w) { externalWarnings.push('DRIVE: ' + w); });
      }
      if (bundleEx && !bundleEx.ok && bundleEx.errors && bundleEx.errors.length) {
        externalWarnings.push('CBV_TEST_REPORT_DRIVE_SAVE_FAILED: ' + bundleEx.errors.join(' | '));
      }

      var driveSix = exportOk === true;
      checks.push({
        code: 'DRIVE_SIX_FILE_BUNDLE',
        ok: driveSix,
        severity: driveSix ? 'OK' : 'ERROR',
        message: driveSix ? 'Drive export wrote >= 6 files' : 'Drive export did not write 6 files',
        detail: { fileCount: fc, exportOk: !!(bundleEx && bundleEx.ok) }
      });
      draft.checks = checks;

      if (exportOk) {
        draft = exportDraft;
        checks = draft.checks;
        draft.reportJson.driveFileCount = fc;
        draft.reportJson.driveFiles = bundleEx.files || [];
      } else {
        draft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, false, {
          fileCount: fc,
          exportOk: !!(bundleEx && bundleEx.ok),
          errors: bundleEx && bundleEx.errors ? bundleEx.errors : []
        });
        checks = draft.checks;
        draft.reportJson.driveFileCount = fc;
        draft.reportJson.driveFiles = bundleEx && bundleEx.files ? bundleEx.files : [];
      }
    }
  } catch (eD) {
    externalWarnings.push('DRIVE_BUNDLE_EXCEPTION: ' + (eD && eD.message ? eD.message : String(eD)));
    if (typeof CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_ === 'function') {
      draft = CbvTcsMilestone01OpWorkspace__draftWithOptionalDriveBundle_(draft, checks, externalWarnings, false, {
        exception: eD && eD.message ? eD.message : String(eD)
      });
      checks = draft.checks;
    }
  }

  if (!(checks || []).some(function (c) { return c && c.code === 'DRIVE_SIX_FILE_BUNDLE'; })) {
    checks.push({
      code: 'DRIVE_SIX_FILE_BUNDLE',
      ok: false,
      severity: 'ERROR',
      message: 'Drive bundle step did not complete',
      detail: { reason: 'NO_BUNDLE_RESULT' }
    });
    draft.checks = checks;
  }

  var drvB = (checks || []).filter(function (c) { return c && c.code === 'DRIVE_SIX_FILE_BUNDLE'; })[0];
  if (drvB && drvB.ok === false) {
    draft.ok = false;
    draft.status = 'FAIL';
    draft.severity = 'ERROR';
    draft.errors = draft.errors || [];
    if (draft.errors.indexOf('DRIVE_SIX_FILE_BUNDLE') < 0) draft.errors.push('DRIVE_SIX_FILE_BUNDLE');
  }

  if (draft.envelopeOk !== true || draft.ok !== (draft.status !== 'FAIL')) {
    draft.ok = false;
    if (draft.status !== 'FAIL') draft.status = 'FAIL';
    if (draft.severity !== 'CRITICAL') draft.severity = 'ERROR';
    if (draft.errors.indexOf('CONSISTENCY_GUARD') < 0) draft.errors.push('CONSISTENCY_GUARD');
  }

  var appendRes = (typeof CbvTcsReports_appendReport_ === 'function') ? CbvTcsReports_appendReport_(draft) : { ok: false, error: 'CbvTcsReports_appendReport_ not loaded' };
  if (draft.reportJson && typeof draft.reportJson === 'object') {
    draft.reportJson.cbvTestReportsAppendOk = appendRes.ok === true;
    if (!appendRes.ok) draft.reportJson.cbvTestReportsAppendError = appendRes.error || 'append_failed';
    if (appendRes.rowWritten) draft.reportJson.cbvTestReportsRow = appendRes.rowWritten;
  }
  CbvTcsMilestone09InteractiveTask_TestConsole__storeLatest_(draft);
  try { Logger.log(draft.reportText); } catch (eL) { /* ignore */ }
  return draft;
}

function CbvTcsMilestone09InteractiveTask_TestConsole_copyLatestReport() {
  if (typeof SpreadsheetApp === 'undefined' || !SpreadsheetApp.getUi) {
    return { ok: false, message: 'UI unavailable.' };
  }
  var ui = SpreadsheetApp.getUi();
  var r = null;
  try {
    if (__CBV_TCS_MILESTONE09_TC_LAST_REPORT) r = __CBV_TCS_MILESTONE09_TC_LAST_REPORT;
    else if (typeof PropertiesService !== 'undefined' && PropertiesService.getDocumentProperties) {
      var raw = PropertiesService.getDocumentProperties().getProperty(__CBV_TCS_MILESTONE09_TC_LAST_PROP_KEY);
      if (raw) r = JSON.parse(raw);
    }
  } catch (e) {
    r = null;
  }
  if (!r) {
    ui.alert('No report', 'Run M09 — Interactive Task Runtime Test first.', ui.ButtonSet.OK);
    return { ok: false };
  }
  var payload = JSON.stringify(r, null, 2);
  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="UTF-8"></head><body style="font-family:system-ui,sans-serif">' +
    '<textarea id="t" style="width:100%;height:300px"></textarea>' +
    '<p><button onclick="s()">Select all</button> <button onclick="google.script.host.close()">Close</button></p>' +
    '<script>var DATA=' + payload + ';document.getElementById("t").value=JSON.stringify(DATA,null,2);function s(){var e=document.getElementById("t");e.focus();e.select();}</script></body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), 'Milestone 09 — copy report');
  return { ok: true };
}
