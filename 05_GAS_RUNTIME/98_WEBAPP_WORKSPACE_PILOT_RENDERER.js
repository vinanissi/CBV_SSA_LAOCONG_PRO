/**
 * PHASE_90 — WebApp Workspace Pilot Pages — Renderer
 *
 * Read-first UI only. No write actions.
 * Phase 96 — optional Vietnamese copy via CbvWebAppVi_* helpers (route paths unchanged).
 */

/** Absolute ?route= URLs for pilot home links (Phase 96.1). */
function CbvWebAppPilotRenderer__routeUrls_() {
  function b(route) {
    if (typeof CbvWebAppRouteUrl_build === 'function') {
      try {
        return CbvWebAppRouteUrl_build(route);
      } catch (e1) { /* ignore */ }
    }
    return '#missing-route-url-helper';
  }
  var m = (typeof CbvWebAppRouteUrl_getRouteMap === 'function') ? CbvWebAppRouteUrl_getRouteMap() : null;
  if (!m) {
    return {
      myQueue: b('/home-alert/my-queue'),
      sla: b('/home-alert/sla'),
      timeline: b('/home-alert/timeline'),
      kanban: b('/home-alert/kanban'),
      runtimeHealth: b('/runtime/health'),
      reports: b('/reports')
    };
  }
  return {
    myQueue: b(m.myQueue),
    sla: b(m.sla),
    timeline: b(m.timeline),
    kanban: b(m.kanban),
    runtimeHealth: b(m.runtimeHealth),
    reports: b(m.reports)
  };
}

function CbvWebAppPilotRenderer__viText_(key, fallbackEn) {
  if (typeof CbvWebAppVi_getLabel === 'function') {
    try {
      var t = CbvWebAppVi_getLabel(key);
      if (t) return t;
    } catch (eV) { /* ignore */ }
  }
  return fallbackEn;
}

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
  if (!res || res.ok === false) state = CbvWebAppPilotRenderer_renderState_({ type: 'warning', title: CbvWebAppPilotRenderer__viText_('home_dashboard_state', 'Home dashboard'), message: CbvWebAppPilotRenderer__viText_('data_not_available', 'Data not available (read-first).'), detail: res });
  else if (res.data && res.data.cards && res.data.cards.length === 0) state = CbvWebAppPilotRenderer_renderState_({ type: 'empty', title: CbvWebAppPilotRenderer__viText_('home_dashboard_state', 'Home dashboard'), message: CbvWebAppPilotRenderer__viText_('no_items', 'No items found.'), detail: res });
  else state = CbvWebAppPilotRenderer_renderState_({ type: 'ready', title: CbvWebAppPilotRenderer__viText_('home_dashboard_state', 'Home dashboard'), message: '', detail: null });

  var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_HOME_PILOT');
  t.COMPONENTS = CbvWebAppPilotRenderer__includeComponents_();
  t.MODEL = {
    state: state,
    result: res,
    i18n: (typeof CbvWebAppVi_getPilotPageI18n_ === 'function') ? CbvWebAppVi_getPilotPageI18n_('home') : null,
    routeUrls: CbvWebAppPilotRenderer__routeUrls_()
  };
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
  if (!res || res.ok === false) state = CbvWebAppPilotRenderer_renderState_({ type: 'warning', title: CbvWebAppPilotRenderer__viText_('my_queue_state', 'My Queue'), message: CbvWebAppPilotRenderer__viText_('data_not_available', 'Data not available (read-first).'), detail: res });
  else if (!cards || cards.length === 0) state = CbvWebAppPilotRenderer_renderState_({ type: 'empty', title: CbvWebAppPilotRenderer__viText_('my_queue_state', 'My Queue'), message: CbvWebAppPilotRenderer__viText_('no_rows', 'No rows found.'), detail: res });
  else state = CbvWebAppPilotRenderer_renderState_({ type: 'ready', title: CbvWebAppPilotRenderer__viText_('my_queue_state', 'My Queue'), message: '', detail: null });

  var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_QUEUE_PILOT');
  t.COMPONENTS = CbvWebAppPilotRenderer__includeComponents_();
  t.MODEL = { state: state, result: res, i18n: (typeof CbvWebAppVi_getPilotPageI18n_ === 'function') ? CbvWebAppVi_getPilotPageI18n_('queue') : null };
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
  if (!res || res.ok === false) state = CbvWebAppPilotRenderer_renderState_({ type: 'warning', title: CbvWebAppPilotRenderer__viText_('sla_state', 'SLA'), message: CbvWebAppPilotRenderer__viText_('data_not_available', 'Data not available (read-first).'), detail: res });
  else state = CbvWebAppPilotRenderer_renderState_({ type: 'ready', title: CbvWebAppPilotRenderer__viText_('sla_state', 'SLA'), message: '', detail: null });

  var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_SLA_PILOT');
  t.COMPONENTS = CbvWebAppPilotRenderer__includeComponents_();
  t.MODEL = { state: state, result: res, i18n: (typeof CbvWebAppVi_getPilotPageI18n_ === 'function') ? CbvWebAppVi_getPilotPageI18n_('sla') : null };
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
          '<div class="cbv-card"><h3>' + CbvWebAppPilotRenderer__viText_('placeholder_timeline', 'Timeline (preview — fallback)') + '</h3>' +
          '<p class="cbv-muted">' + CbvWebAppPilotRenderer__viText_('fallback_renderer_failed', 'Phase 91 renderer failed; showing Phase 90 fallback.') + ' ' + CbvWebAppPilotRenderer__viText_('read_first_preview', 'Read-first preview only.') + '</p>' +
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
      '<div class="cbv-card"><h3>' + CbvWebAppPilotRenderer__viText_('placeholder_timeline', 'Timeline (Phase 90 preview)') + '</h3>' +
      '<p class="cbv-muted">' + CbvWebAppPilotRenderer__viText_('read_first_preview', 'Read-first preview only.') + ' ' + CbvWebAppPilotRenderer__viText_('phase91_not_loaded', 'Phase 91 renderer not loaded.') + '</p>' +
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
          '<div class="cbv-card"><h3>' + CbvWebAppPilotRenderer__viText_('placeholder_kanban', 'Kanban (preview — fallback)') + '</h3>' +
          '<p class="cbv-muted">' + CbvWebAppPilotRenderer__viText_('fallback_renderer_failed', 'Phase 91 renderer failed; showing Phase 90 fallback.') + ' ' + CbvWebAppPilotRenderer__viText_('read_first_preview', 'Read-first preview only.') + '</p>' +
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
      '<div class="cbv-card"><h3>' + CbvWebAppPilotRenderer__viText_('placeholder_kanban', 'Kanban (Phase 90 preview)') + '</h3>' +
      '<p class="cbv-muted">' + CbvWebAppPilotRenderer__viText_('read_first_preview', 'Read-first preview only.') + ' ' + CbvWebAppPilotRenderer__viText_('phase91_not_loaded', 'Phase 91 renderer not loaded.') + '</p>' +
      '<pre class="cbv-pre">' + JSON.stringify(res.data || {}, null, 2) + '</pre></div></div>',
    warnings: res.warnings || []
  };
}

/* ------------------------------------------------------------------ */
/* Phase 92 — Observability placeholder dispatchers                    */
/*                                                                     */
/* The Phase 89 dispatcher (94_WEBAPP_WORKSPACE_RENDERER.js) routes    */
/* /runtime/health and /reports here. If Phase 92 renderers are loaded */
/* we delegate to them; otherwise we fall back to a clean read-first   */
/* placeholder. Read-first only — no mutation, no auto-heal.           */
/* ------------------------------------------------------------------ */

function CbvWebAppPilotRenderer_renderRuntimeHealthPlaceholder() {
  if (typeof CbvWebAppObservability_renderRuntimeHealth === 'function') {
    try {
      return CbvWebAppObservability_renderRuntimeHealth();
    } catch (eRH) {
      var fbWarn = ['Phase 92 runtime health renderer error: ' + (eRH && eRH.message ? eRH.message : String(eRH))];
      return {
        bodyHtml: '<div>' + (CbvWebAppPilotRenderer__includeComponents_() || '') +
          '<div class="cbv-card"><h3>' + CbvWebAppPilotRenderer__viText_('runtime_health_title', 'Runtime Health') + ' (' + CbvWebAppPilotRenderer__viText_('read_first_preview', 'preview') + ')</h3>' +
          '<p class="cbv-muted">' + CbvWebAppPilotRenderer__viText_('fallback_renderer_failed', 'Phase 92 renderer failed; showing read-first fallback.') + ' ' + CbvWebAppPilotRenderer__viText_('no_mutations', 'No mutations.') + ' ' + CbvWebAppPilotRenderer__viText_('no_auto_heal', 'No auto-heal.') + '</p>' +
          '<pre class="cbv-pre">' + JSON.stringify({ warnings: fbWarn }, null, 2) + '</pre></div></div>',
        warnings: fbWarn
      };
    }
  }
  return {
    bodyHtml: '<div>' + (CbvWebAppPilotRenderer__includeComponents_() || '') +
      '<div class="cbv-card"><h3>' + CbvWebAppPilotRenderer__viText_('placeholder_runtime', 'Runtime Health (placeholder)') + '</h3>' +
      '<p class="cbv-muted">' + CbvWebAppPilotRenderer__viText_('read_first_preview', 'Read-first preview only.') + ' ' + CbvWebAppPilotRenderer__viText_('phase92_not_loaded', 'Phase 92 renderer not loaded.') + '</p>' +
      '<p class="cbv-muted">' + (typeof CbvWebAppVi_getSafetyFooter === 'function' ? CbvWebAppVi_getSafetyFooter('/runtime/health') : 'Safety: No auto-heal · No auto resolve · No auto escalate · No production claim') + '</p></div></div>',
    warnings: ['Phase 92 observability renderer not loaded.']
  };
}

function CbvWebAppPilotRenderer_renderReportsPlaceholder() {
  if (typeof CbvWebAppObservability_renderReportViewer === 'function') {
    try {
      return CbvWebAppObservability_renderReportViewer();
    } catch (eRP) {
      var fbWarnR = ['Phase 92 report viewer renderer error: ' + (eRP && eRP.message ? eRP.message : String(eRP))];
      return {
        bodyHtml: '<div>' + (CbvWebAppPilotRenderer__includeComponents_() || '') +
          '<div class="cbv-card"><h3>' + CbvWebAppPilotRenderer__viText_('reports_title', 'Reports') + ' (' + CbvWebAppPilotRenderer__viText_('read_first_preview', 'preview') + ')</h3>' +
          '<p class="cbv-muted">' + CbvWebAppPilotRenderer__viText_('fallback_renderer_failed', 'Phase 92 renderer failed; showing read-first fallback.') + ' ' + CbvWebAppPilotRenderer__viText_('no_mutations', 'No mutations.') + ' ' + CbvWebAppPilotRenderer__viText_('no_delete_edit_report', 'No delete report. No edit report.') + '</p>' +
          '<pre class="cbv-pre">' + JSON.stringify({ warnings: fbWarnR }, null, 2) + '</pre></div></div>',
        warnings: fbWarnR
      };
    }
  }
  return {
    bodyHtml: '<div>' + (CbvWebAppPilotRenderer__includeComponents_() || '') +
      '<div class="cbv-card"><h3>' + CbvWebAppPilotRenderer__viText_('placeholder_reports', 'Reports (placeholder)') + '</h3>' +
      '<p class="cbv-muted">' + CbvWebAppPilotRenderer__viText_('read_first_preview', 'Read-first preview only.') + ' ' + CbvWebAppPilotRenderer__viText_('phase92_not_loaded', 'Phase 92 renderer not loaded.') + '</p>' +
      '<p class="cbv-muted">' + (typeof CbvWebAppVi_getSafetyFooter === 'function' ? CbvWebAppVi_getSafetyFooter('/reports') : 'Safety: No auto-heal · No auto resolve · No auto escalate · No production claim') + '</p></div></div>',
    warnings: ['Phase 92 observability renderer not loaded.']
  };
}

/* ------------------------------------------------------------------ */
/* Phase 93 — Admin Reference Viewer placeholder dispatcher.           */
/* Delegates to CbvWebAppAdminRef_renderReferenceViewer() if loaded.   */
/* Otherwise falls back to a clean read-first placeholder.             */
/* No edit / no toggle / no delete / no permission change.             */
/* ------------------------------------------------------------------ */

function CbvWebAppPilotRenderer_renderAdminReferencePlaceholder() {
  if (typeof CbvWebAppAdminRef_renderReferenceViewer === 'function') {
    try {
      return CbvWebAppAdminRef_renderReferenceViewer();
    } catch (eAR) {
      var fbWarnA = ['Phase 93 admin reference renderer error: ' + (eAR && eAR.message ? eAR.message : String(eAR))];
      return {
        bodyHtml: '<div>' + (CbvWebAppPilotRenderer__includeComponents_() || '') +
          '<div class="cbv-card"><h3>' + CbvWebAppPilotRenderer__viText_('admin_ref_title', 'Admin Reference') + ' (' + CbvWebAppPilotRenderer__viText_('read_first_preview', 'preview') + ')</h3>' +
          '<p class="cbv-muted">' + CbvWebAppPilotRenderer__viText_('fallback_renderer_failed', 'Phase 93 renderer failed; showing read-first fallback.') + ' ' + CbvWebAppPilotRenderer__viText_('admin_safety_extra', 'No edit · No toggle · No delete · Secrets masked.') + '</p>' +
          '<pre class="cbv-pre">' + JSON.stringify({ warnings: fbWarnA }, null, 2) + '</pre></div></div>',
        warnings: fbWarnA
      };
    }
  }
  return {
    bodyHtml: '<div>' + (CbvWebAppPilotRenderer__includeComponents_() || '') +
      '<div class="cbv-card"><h3>' + CbvWebAppPilotRenderer__viText_('placeholder_admin', 'Admin Reference (placeholder)') + '</h3>' +
      '<p class="cbv-muted">' + CbvWebAppPilotRenderer__viText_('read_first_preview', 'Read-first preview only.') + ' ' + CbvWebAppPilotRenderer__viText_('phase93_not_loaded', 'Phase 93 renderer not loaded.') + '</p>' +
      '<p class="cbv-muted">' + (typeof CbvWebAppVi_getSafetyFooter === 'function' ? (CbvWebAppVi_getSafetyFooter('/admin/reference') + ' · ' + CbvWebAppVi_getLabel('admin_safety_extra')) : 'Safety: No edit settings · No toggle feature · No delete user · Secrets masked · No production claim') + '</p></div></div>',
    warnings: ['Phase 93 admin reference renderer not loaded.']
  };
}

