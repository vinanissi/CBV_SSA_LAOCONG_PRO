/**
 * PHASE_90 — WebApp Workspace Pilot Pages — Renderer
 *
 * Read-first UI only. No write actions.
 */

function CbvWebAppPilotRenderer_renderState_(state) {
  var s = state || {};
  var t = String(s.type || '').trim() || 'ready';
  var title = String(s.title || '').trim();
  var message = String(s.message || '').trim();
  var detail = s.detail || null;
  return {
    type: t,
    title: title,
    message: message,
    detail: detail
  };
}

function CbvWebAppPilotRenderer__includeComponents_() {
  try {
    return HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
  } catch (e) {
    return '';
  }
}

function CbvWebAppPilotRenderer_renderHome() {
  var res = null;
  try {
    res = CbvWebAppPilotData_getHomeDashboard();
  } catch (e) {
    res = { ok: false, data: null, warnings: [], errors: [e && e.message ? e.message : String(e)] };
  }

  var state;
  if (!res || res.ok === false) state = CbvWebAppPilotRenderer_renderState_({ type: 'warning', title: 'Home dashboard', message: 'Data not available (read-first).', detail: res });
  else if (res.data && res.data.cards && res.data.cards.length === 0) state = CbvWebAppPilotRenderer_renderState_({ type: 'empty', title: 'Home dashboard', message: 'No items found.', detail: res });
  else state = CbvWebAppPilotRenderer_renderState_({ type: 'ready', title: 'Home dashboard', message: '', detail: null });

  var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_HOME_PILOT');
  t.COMPONENTS = CbvWebAppPilotRenderer__includeComponents_();
  t.MODEL = { state: state, result: res };
  return { bodyHtml: t.evaluate().getContent(), warnings: (res && res.warnings) ? res.warnings : [] };
}

function CbvWebAppPilotRenderer_renderQueue() {
  var res = null;
  try {
    res = CbvWebAppPilotData_getQueueCards(Session.getActiveUser().getEmail());
  } catch (e) {
    res = { ok: false, data: null, warnings: [], errors: [e && e.message ? e.message : String(e)] };
  }

  var cards = res && res.data && res.data.cards ? res.data.cards : [];
  var state;
  if (!res || res.ok === false) state = CbvWebAppPilotRenderer_renderState_({ type: 'warning', title: 'My Queue', message: 'Data not available (read-first).', detail: res });
  else if (!cards || cards.length === 0) state = CbvWebAppPilotRenderer_renderState_({ type: 'empty', title: 'My Queue', message: 'No rows found.', detail: res });
  else state = CbvWebAppPilotRenderer_renderState_({ type: 'ready', title: 'My Queue', message: '', detail: null });

  var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_QUEUE_PILOT');
  t.COMPONENTS = CbvWebAppPilotRenderer__includeComponents_();
  t.MODEL = { state: state, result: res };
  return { bodyHtml: t.evaluate().getContent(), warnings: (res && res.warnings) ? res.warnings : [] };
}

function CbvWebAppPilotRenderer_renderSla() {
  var res = null;
  try {
    res = CbvWebAppPilotData_getSlaWidgets();
  } catch (e) {
    res = { ok: false, data: null, warnings: [], errors: [e && e.message ? e.message : String(e)] };
  }

  var state;
  if (!res || res.ok === false) state = CbvWebAppPilotRenderer_renderState_({ type: 'warning', title: 'SLA', message: 'Data not available (read-first).', detail: res });
  else state = CbvWebAppPilotRenderer_renderState_({ type: 'ready', title: 'SLA', message: '', detail: null });

  var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_SLA_PILOT');
  t.COMPONENTS = CbvWebAppPilotRenderer__includeComponents_();
  t.MODEL = { state: state, result: res };
  return { bodyHtml: t.evaluate().getContent(), warnings: (res && res.warnings) ? res.warnings : [] };
}

function CbvWebAppPilotRenderer_renderTimelinePlaceholder() {
  // Phase 91 — delegate to CbvWebAppTimelineKanban_renderTimeline if available.
  // Phase 90 placeholder remains as fallback when Phase 91 not loaded yet.
  if (typeof CbvWebAppTimelineKanban_renderTimeline === 'function') {
    try {
      return CbvWebAppTimelineKanban_renderTimeline();
    } catch (eP91) {
      // fall through to Phase 90 fallback below; surface as warning
      var fallbackWarn = ['Phase 91 timeline renderer error: ' + (eP91 && eP91.message ? eP91.message : String(eP91))];
      var resErr = { ok: false, data: null, warnings: fallbackWarn, errors: fallbackWarn };
      return {
        bodyHtml: '<div>' + (CbvWebAppPilotRenderer__includeComponents_() || '') +
          '<div class="cbv-card"><h3>Timeline (preview — fallback)</h3>' +
          '<p class="cbv-muted">Phase 91 renderer failed; showing Phase 90 fallback. No mutations.</p>' +
          '<pre class="cbv-pre">' + JSON.stringify(resErr, null, 2) + '</pre></div></div>',
        warnings: fallbackWarn
      };
    }
  }

  var res = null;
  try {
    res = CbvWebAppPilotData_getTimelinePreview();
  } catch (e) {
    res = { ok: false, data: null, warnings: [], errors: [e && e.message ? e.message : String(e)] };
  }
  return {
    bodyHtml: '<div>' + (CbvWebAppPilotRenderer__includeComponents_() || '') +
      '<div class="cbv-card"><h3>Timeline (Phase 90 preview)</h3>' +
      '<p class="cbv-muted">Read-first preview only. No mutations. Phase 91 renderer not loaded.</p>' +
      '<pre class="cbv-pre">' + JSON.stringify(res.data || {}, null, 2) + '</pre></div></div>',
    warnings: res.warnings || []
  };
}

function CbvWebAppPilotRenderer_renderKanbanPlaceholder() {
  // Phase 91 — delegate to CbvWebAppTimelineKanban_renderKanban if available.
  // Phase 90 placeholder remains as fallback when Phase 91 not loaded yet.
  if (typeof CbvWebAppTimelineKanban_renderKanban === 'function') {
    try {
      return CbvWebAppTimelineKanban_renderKanban();
    } catch (eP91k) {
      var fallbackWarnK = ['Phase 91 kanban renderer error: ' + (eP91k && eP91k.message ? eP91k.message : String(eP91k))];
      var resErrK = { ok: false, data: null, warnings: fallbackWarnK, errors: fallbackWarnK };
      return {
        bodyHtml: '<div>' + (CbvWebAppPilotRenderer__includeComponents_() || '') +
          '<div class="cbv-card"><h3>Kanban (preview — fallback)</h3>' +
          '<p class="cbv-muted">Phase 91 renderer failed; showing Phase 90 fallback. No mutations.</p>' +
          '<pre class="cbv-pre">' + JSON.stringify(resErrK, null, 2) + '</pre></div></div>',
        warnings: fallbackWarnK
      };
    }
  }

  var res = null;
  try {
    res = CbvWebAppPilotData_getKanbanPreview();
  } catch (e) {
    res = { ok: false, data: null, warnings: [], errors: [e && e.message ? e.message : String(e)] };
  }
  return {
    bodyHtml: '<div>' + (CbvWebAppPilotRenderer__includeComponents_() || '') +
      '<div class="cbv-card"><h3>Kanban (Phase 90 preview)</h3>' +
      '<p class="cbv-muted">Read-first preview only. No mutations. Phase 91 renderer not loaded.</p>' +
      '<pre class="cbv-pre">' + JSON.stringify(res.data || {}, null, 2) + '</pre></div></div>',
    warnings: res.warnings || []
  };
}

