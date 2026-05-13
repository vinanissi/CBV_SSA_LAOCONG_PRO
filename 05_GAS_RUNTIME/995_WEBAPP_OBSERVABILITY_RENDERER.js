/**
 * PHASE_92 — WebApp Observability — Renderer
 *
 * Read-first UI for:
 *   /runtime/health  → CbvWebAppObservability_renderRuntimeHealth()
 *   /reports         → CbvWebAppObservability_renderReportViewer()
 *
 * No auto-heal buttons. No delete buttons. No edit buttons. No mutation controls.
 * Safety footer preserved.
 *
 * Public functions:
 *   - CbvWebAppObservability_renderRuntimeHealth()
 *   - CbvWebAppObservability_renderReportViewer()
 *   - CbvWebAppObservability_renderHealthCard_(card)
 *   - CbvWebAppObservability_renderReportRow_(row)
 *   - CbvWebAppObservability_renderState_(state)
 */

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability_renderState_(state) {
  var s = state || {};
  var t = String(s.type || '').trim() || 'ready';
  return {
    type: t,
    title: String(s.title || '').trim(),
    message: String(s.message || '').trim(),
    detail: s.detail || null
  };
}

function CbvWebAppObservability__includeComponents_() {
  try {
    if (typeof HtmlService === 'undefined') return '';
    return HtmlService.createHtmlOutputFromFile('html/WEBAPP_OBSERVABILITY_COMPONENTS').getContent();
  } catch (e) {
    try {
      return HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
    } catch (e2) {
      return '';
    }
  }
}

function CbvWebAppObservability__esc_(v) {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function CbvWebAppObservability__formatDate_(v) {
  if (!v) return '';
  try {
    if (v instanceof Date) return v.toISOString();
    var d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toISOString();
  } catch (e) {
    return String(v);
  }
}

function CbvWebAppObservability__severityBadgeClass_(severity) {
  var s = String(severity || '').toUpperCase();
  if (s === 'CRITICAL' || s === 'ERROR') return 'crit';
  if (s === 'WARNING') return 'warn';
  if (s === 'OK' || s === 'INFO') return 'ok';
  return 'warn';
}

function CbvWebAppObservability__statusBadgeClass_(status) {
  var s = String(status || '').toUpperCase();
  if (s === 'FAIL') return 'crit';
  if (s === 'GO_WITH_WARNINGS' || s === 'PENDING' || s === 'NOT_LOADED') return 'warn';
  if (s === 'GO' || s === 'OK') return 'ok';
  return 'warn';
}

/* ------------------------------------------------------------------ */
/* Sub-renderers                                                       */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability_renderHealthCard_(card) {
  var c = card || {};
  var sevClass = CbvWebAppObservability__statusBadgeClass_(c.status);
  var html = [];
  html.push('<div class="cbv-card" style="margin:6px 0">');
  html.push('<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">');
  html.push('<div style="font-weight:700">' + CbvWebAppObservability__esc_(c.label || c.code || '(no label)') + '</div>');
  html.push('<span class="cbv-badge ' + sevClass + '">' + CbvWebAppObservability__esc_(c.status || '?') + '</span>');
  html.push('</div>');
  html.push('<div class="cbv-muted" style="margin-top:6px"><code>' + CbvWebAppObservability__esc_(c.code || '') + '</code>');
  if (c.severity) html.push(' · severity: ' + CbvWebAppObservability__esc_(c.severity));
  html.push('</div>');
  if (c.note) html.push('<div class="cbv-muted" style="margin-top:6px">' + CbvWebAppObservability__esc_(c.note) + '</div>');
  if (c.value) html.push('<div class="cbv-muted" style="margin-top:4px">last: ' + CbvWebAppObservability__esc_(CbvWebAppObservability__formatDate_(c.value)) + '</div>');
  html.push('</div>');
  return html.join('');
}

function CbvWebAppObservability_renderReportRow_(row) {
  var r = row || {};
  var statusClass = CbvWebAppObservability__statusBadgeClass_(r.status);
  var sevClass = CbvWebAppObservability__severityBadgeClass_(r.severity);
  var checked = CbvWebAppObservability__formatDate_(r.checkedAt);
  var summary = String(r.summary || '');
  if (summary.length > 280) summary = summary.substring(0, 277) + '…';

  var html = [];
  html.push('<div class="cbv-card" style="margin:8px 0">');
  html.push('<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">');
  html.push('<div style="font-weight:800">' + CbvWebAppObservability__esc_(r.phase || '(unknown phase)') + '</div>');
  html.push('<span class="cbv-badge ' + statusClass + '">' + CbvWebAppObservability__esc_(r.status || '?') + '</span>');
  html.push('</div>');
  html.push('<div class="cbv-muted" style="margin-top:6px">');
  html.push('<code>' + CbvWebAppObservability__esc_(r.reportId || '(no id)') + '</code>');
  if (r.severity) html.push(' · <span class="cbv-badge ' + sevClass + '">' + CbvWebAppObservability__esc_(r.severity) + '</span>');
  if (r.runBy) html.push(' · runBy: ' + CbvWebAppObservability__esc_(r.runBy));
  if (r.traceId) html.push(' · trace: <code>' + CbvWebAppObservability__esc_(r.traceId) + '</code>');
  html.push('</div>');
  if (summary) html.push('<div class="cbv-muted" style="margin-top:6px">' + CbvWebAppObservability__esc_(summary) + '</div>');
  html.push('<div class="cbv-muted" style="margin-top:6px">checkedAt: ' + CbvWebAppObservability__esc_(checked) + ' · source: ' + CbvWebAppObservability__esc_(r.source || '') + '</div>');
  html.push('</div>');
  return html.join('');
}

/* ------------------------------------------------------------------ */
/* State mapping (UI only — no mutations)                              */
/* ------------------------------------------------------------------ */

/**
 * Map an envelope into a UI state descriptor. Same "mapState_" convention as
 * Phase 91.1 to keep the verb-at-start mutation scanner happy (no operational
 * "resolve" verbs in this read-first module).
 */
function CbvWebAppObservability__mapState_(res, defaults) {
  if (!res || res.ok === false) {
    return CbvWebAppObservability_renderState_({
      type: 'warning',
      title: defaults.title,
      message: 'Data not available (read-first).',
      detail: res
    });
  }
  var d = res.data || {};
  var isEmpty = (defaults.kind === 'health')
    ? !(d.healthCards && d.healthCards.length)
    : !(d.rows && d.rows.length);
  if (isEmpty) {
    return CbvWebAppObservability_renderState_({
      type: 'empty',
      title: defaults.title,
      message: 'No items found.',
      detail: res
    });
  }
  if (res.warnings && res.warnings.length) {
    return CbvWebAppObservability_renderState_({
      type: 'partial',
      title: defaults.title,
      message: 'Showing read-first data with warnings.',
      detail: null
    });
  }
  return CbvWebAppObservability_renderState_({ type: 'ready', title: defaults.title, message: '', detail: null });
}

function CbvWebAppObservability__safetyFooter_() {
  return [
    '<div class="cbv-card" style="margin-top:14px">',
    '<div class="cbv-muted">Read-first only. Safety: No auto-heal · No auto resolve · No auto escalate · No production claim.</div>',
    '</div>'
  ].join('');
}

function CbvWebAppObservability__warningsBlock_(warnings) {
  if (!warnings || !warnings.length) return '';
  var html = ['<div class="cbv-card" style="margin-top:12px"><h3>Warnings</h3><ul>'];
  for (var i = 0; i < warnings.length; i++) {
    html.push('<li class="cbv-muted">' + CbvWebAppObservability__esc_(String(warnings[i])) + '</li>');
  }
  html.push('</ul></div>');
  return html.join('');
}

function CbvWebAppObservability__inlineRuntimeHealth_(state, res) {
  var d = res && res.data ? res.data : { healthCards: [], routeSummary: {}, reportSummary: {}, testConsoleSummary: {} };
  var html = [];
  html.push(CbvWebAppObservability__includeComponents_() || '');
  html.push('<div class="cbv-card">');
  html.push('<h3>Runtime Health (read-first)</h3>');
  html.push('<div class="cbv-muted">Operational Observability Layer · per-phase Test Console probe · No auto-heal.</div>');
  if (state && state.type !== 'ready') {
    html.push('<div class="cbv-state"><span class="cbv-badge warn">' + CbvWebAppObservability__esc_(state.type.toUpperCase()) + '</span><span style="margin-left:8px">' + CbvWebAppObservability__esc_(state.message) + '</span></div>');
  }
  html.push('<div class="cbv-muted" style="margin-top:10px">');
  html.push('overall: <span class="cbv-badge ' + CbvWebAppObservability__statusBadgeClass_(d.status) + '">' + CbvWebAppObservability__esc_(d.status || '?') + '</span> · severity: ' + CbvWebAppObservability__esc_(d.severity || '?'));
  html.push('</div>');
  html.push('</div>');

  // Health cards
  html.push('<div class="cbv-card" style="margin-top:10px"><h3>Phase Health Cards</h3>');
  var cards = d.healthCards || [];
  if (!cards.length) {
    html.push('<div class="cbv-state cbv-muted">No phase cards available.</div>');
  } else {
    for (var i = 0; i < cards.length; i++) {
      html.push(CbvWebAppObservability_renderHealthCard_(cards[i]));
    }
  }
  html.push('</div>');

  // Route summary
  var rs = d.routeSummary || {};
  html.push('<div class="cbv-card" style="margin-top:10px"><h3>Route Summary</h3>');
  html.push('<div class="cbv-muted">total: ' + (rs.total || 0) + ' · read-first: ' + (rs.readFirst || 0) + (rs.missing ? ' · <em>route registry missing</em>' : '') + '</div>');
  if (rs.byMode) {
    html.push('<div class="cbv-muted" style="margin-top:4px">by mode: <code>' + CbvWebAppObservability__esc_(JSON.stringify(rs.byMode)) + '</code></div>');
  }
  if (rs.byPageType) {
    html.push('<div class="cbv-muted" style="margin-top:4px">by pageType: <code>' + CbvWebAppObservability__esc_(JSON.stringify(rs.byPageType)) + '</code></div>');
  }
  html.push('</div>');

  // Report summary
  var rp = d.reportSummary || {};
  html.push('<div class="cbv-card" style="margin-top:10px"><h3>Report Summary</h3>');
  html.push('<div class="cbv-muted">in-memory: ' + (rp.inMemoryCount || 0) + ' · SYSTEM_HEALTH_LOG rows: ' + (rp.systemHealthLogRows || 0) + ' · CBV_TEST_REPORTS rows: ' + (rp.cbvTestReportsRows || 0));
  if (rp.cbvTestReportsMissing) html.push(' · <em>CBV_TEST_REPORTS missing (warning only)</em>');
  html.push('</div>');
  html.push('</div>');

  // Test console summary
  var tc = d.testConsoleSummary || {};
  html.push('<div class="cbv-card" style="margin-top:10px"><h3>Test Console Summary</h3>');
  html.push('<div class="cbv-muted">total: ' + (tc.total || 0) + ' · loaded: ' + (tc.loaded || 0) + ' · with stored report: ' + (tc.withReport || 0) + '</div>');
  html.push('</div>');

  html.push(CbvWebAppObservability__warningsBlock_(res ? res.warnings : []));
  html.push(CbvWebAppObservability__safetyFooter_());
  return html.join('');
}

function CbvWebAppObservability__inlineReportViewer_(state, res) {
  var d = res && res.data ? res.data : { rows: [], count: 0 };
  var html = [];
  html.push(CbvWebAppObservability__includeComponents_() || '');
  html.push('<div class="cbv-card">');
  html.push('<h3>Report Viewer (read-first)</h3>');
  html.push('<div class="cbv-muted">Sources: CBV_TEST_REPORTS (sheet, if present) · SYSTEM_HEALTH_LOG · in-memory PropertiesService · Read-only.</div>');
  if (state && state.type !== 'ready') {
    html.push('<div class="cbv-state"><span class="cbv-badge warn">' + CbvWebAppObservability__esc_(state.type.toUpperCase()) + '</span><span style="margin-left:8px">' + CbvWebAppObservability__esc_(state.message) + '</span></div>');
  }
  html.push('<div class="cbv-muted" style="margin-top:10px">count: ' + (d.count || 0) + '</div>');
  if (!d.rows || !d.rows.length) {
    html.push('<div class="cbv-state cbv-muted">No reports visible. Run a phase Test Console to populate, or wait for CBV_TEST_REPORTS to appear.</div>');
  } else {
    html.push('<div style="margin-top:10px">');
    for (var i = 0; i < d.rows.length; i++) {
      html.push(CbvWebAppObservability_renderReportRow_(d.rows[i]));
    }
    html.push('</div>');
  }
  html.push('</div>');
  html.push(CbvWebAppObservability__warningsBlock_(res ? res.warnings : []));
  html.push(CbvWebAppObservability__safetyFooter_());
  return html.join('');
}

/* ------------------------------------------------------------------ */
/* Page renderers                                                      */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability_renderRuntimeHealth() {
  var res = null;
  try {
    res = CbvWebAppObservability_getRuntimeHealth();
  } catch (e) {
    res = { ok: false, data: null, warnings: [], errors: [e && e.message ? e.message : String(e)] };
  }
  var state = CbvWebAppObservability__mapState_(res, { title: 'Runtime Health (read-first)', kind: 'health' });

  var bodyHtml = null;
  try {
    if (typeof HtmlService !== 'undefined' && HtmlService.createTemplateFromFile) {
      var t = HtmlService.createTemplateFromFile('html/WEBAPP_RUNTIME_HEALTH');
      t.COMPONENTS = CbvWebAppObservability__includeComponents_();
      t.MODEL = { state: state, result: res };
      bodyHtml = t.evaluate().getContent();
    }
  } catch (eTpl) {
    bodyHtml = null;
  }
  if (!bodyHtml) bodyHtml = CbvWebAppObservability__inlineRuntimeHealth_(state, res);

  return {
    bodyHtml: bodyHtml,
    warnings: (res && res.warnings) ? res.warnings : []
  };
}

function CbvWebAppObservability_renderReportViewer() {
  var res = null;
  try {
    res = CbvWebAppObservability_getRecentReports({});
  } catch (e) {
    res = { ok: false, data: null, warnings: [], errors: [e && e.message ? e.message : String(e)] };
  }
  var state = CbvWebAppObservability__mapState_(res, { title: 'Report Viewer (read-first)', kind: 'reports' });

  var bodyHtml = null;
  try {
    if (typeof HtmlService !== 'undefined' && HtmlService.createTemplateFromFile) {
      var t = HtmlService.createTemplateFromFile('html/WEBAPP_REPORT_VIEWER');
      t.COMPONENTS = CbvWebAppObservability__includeComponents_();
      t.MODEL = { state: state, result: res };
      bodyHtml = t.evaluate().getContent();
    }
  } catch (eTpl) {
    bodyHtml = null;
  }
  if (!bodyHtml) bodyHtml = CbvWebAppObservability__inlineReportViewer_(state, res);

  return {
    bodyHtml: bodyHtml,
    warnings: (res && res.warnings) ? res.warnings : []
  };
}
