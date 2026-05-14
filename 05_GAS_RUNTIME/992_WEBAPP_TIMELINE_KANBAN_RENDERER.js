/**
 * PHASE_91 — WebApp Timeline / Kanban Read-First Pages — Renderer
 *
 * UI is read-only: no claim/resolve/escalate/assign buttons, no drag-drop.
 * Templates: html/WEBAPP_WORKSPACE_TIMELINE.html, html/WEBAPP_WORKSPACE_KANBAN.html
 * Fallback: inline read-first HTML so the page never crashes if templates miss.
 *
 * Public functions:
 *   - CbvWebAppTimelineKanban_renderTimeline()
 *   - CbvWebAppTimelineKanban_renderKanban()
 *   - CbvWebAppTimelineKanban_renderTimelineRow_(row)
 *   - CbvWebAppTimelineKanban_renderKanbanColumn_(column)
 *   - CbvWebAppTimelineKanban_renderKanbanCard_(card)
 *   - CbvWebAppTimelineKanban_renderState_(state)
 *
 * Phase 96 — optional Vietnamese labels via CbvWebAppVi_* (routes unchanged).
 */

function CbvWebAppTimelineKanban__vi_(key, en) {
  if (typeof CbvWebAppVi_getLabel !== 'function') return en;
  try {
    var t = CbvWebAppVi_getLabel(key);
    return t || en;
  } catch (e) {
    return en;
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function CbvWebAppTimelineKanban_renderState_(state) {
  var s = state || {};
  var t = String(s.type || '').trim() || 'ready';
  return {
    type: t,
    title: String(s.title || '').trim(),
    message: String(s.message || '').trim(),
    detail: s.detail || null
  };
}

function CbvWebAppTimelineKanban__includeComponents_() {
  try {
    if (typeof HtmlService === 'undefined') return '';
    return HtmlService.createHtmlOutputFromFile('html/WEBAPP_WORKSPACE_COMPONENTS').getContent();
  } catch (e) {
    return '';
  }
}

function CbvWebAppTimelineKanban__esc_(v) {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function CbvWebAppTimelineKanban__formatDate_(v) {
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

function CbvWebAppTimelineKanban__slaBadgeClass_(slaStatus, breach) {
  var b = Number(breach || 0);
  if (b > 0) return 'crit';
  var s = String(slaStatus || '').toUpperCase();
  if (s === 'OVERDUE' || s === 'BREACHED') return 'warn';
  return 'ok';
}

/* ------------------------------------------------------------------ */
/* Timeline row + Kanban card/column                                   */
/* ------------------------------------------------------------------ */

function CbvWebAppTimelineKanban_renderTimelineRow_(row) {
  var r = row || {};
  var sevClass = CbvWebAppTimelineKanban__slaBadgeClass_(r.slaStatus, r.slaBreachLevel);
  var slaLabel = CbvWebAppTimelineKanban__esc_(r.slaStatus || 'SLA');
  var breach = Number(r.slaBreachLevel || 0);
  var title = r.operatorPrimaryText || r.id || '(no title)';
  var timeStr = CbvWebAppTimelineKanban__formatDate_(r.timelineAt || r.updatedAt || r.createdAt);

  var html = [];
  html.push('<div class="cbv-card" style="margin:8px 0">');
  html.push('<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">');
  html.push('<div style="font-weight:800">' + CbvWebAppTimelineKanban__esc_(title) + '</div>');
  html.push('<span class="cbv-badge ' + sevClass + '">' + slaLabel + (breach > 0 ? ' · L' + breach : '') + '</span>');
  html.push('</div>');
  html.push('<div class="cbv-muted" style="margin-top:6px"><code>' + CbvWebAppTimelineKanban__esc_(r.id || '') + '</code>');
  if (r.status) html.push(' · ' + CbvWebAppTimelineKanban__vi_('status', 'status') + ': ' + CbvWebAppTimelineKanban__esc_(r.status));
  if (r.assignedTo) html.push(' · ' + CbvWebAppTimelineKanban__vi_('assigned_to', 'assigned') + ': ' + CbvWebAppTimelineKanban__esc_(r.assignedTo));
  if (r.moduleCode) html.push(' · module: ' + CbvWebAppTimelineKanban__esc_(r.moduleCode));
  html.push('</div>');
  if (r.operatorSecondaryText) html.push('<div class="cbv-muted" style="margin-top:6px">' + CbvWebAppTimelineKanban__esc_(r.operatorSecondaryText) + '</div>');
  if (r.operatorMetaText) html.push('<div class="cbv-muted" style="margin-top:4px">' + CbvWebAppTimelineKanban__esc_(r.operatorMetaText) + '</div>');
  if (r.operatorNextAction) {
    html.push('<div style="margin-top:8px"><span class="cbv-badge">' + CbvWebAppTimelineKanban__vi_('next_badge', 'Next') + '</span> <span class="cbv-muted" style="margin-left:6px">' + CbvWebAppTimelineKanban__esc_(r.operatorNextAction) + '</span></div>');
  }
  html.push('<div class="cbv-muted" style="margin-top:8px">' + CbvWebAppTimelineKanban__vi_('when_label', 'when') + ': ' + CbvWebAppTimelineKanban__esc_(timeStr) + '</div>');
  html.push('</div>');
  return html.join('');
}

function CbvWebAppTimelineKanban_renderKanbanCard_(card) {
  var c = card || {};
  var sevClass = CbvWebAppTimelineKanban__slaBadgeClass_(c.slaStatus, c.slaBreachLevel);
  var breach = Number(c.slaBreachLevel || 0);
  var title = c.title || c.id || '(no title)';
  var updated = CbvWebAppTimelineKanban__formatDate_(c.updatedAt);

  var html = [];
  html.push('<div class="cbv-card" style="margin:6px 0">');
  html.push('<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">');
  html.push('<div style="font-weight:700">' + CbvWebAppTimelineKanban__esc_(title) + '</div>');
  html.push('<span class="cbv-badge ' + sevClass + '">' + CbvWebAppTimelineKanban__esc_(c.slaStatus || 'SLA') + (breach > 0 ? ' · L' + breach : '') + '</span>');
  html.push('</div>');
  html.push('<div class="cbv-muted" style="margin-top:6px"><code>' + CbvWebAppTimelineKanban__esc_(c.id || '') + '</code>');
  if (c.assignedTo) html.push(' · ' + CbvWebAppTimelineKanban__vi_('assigned_to', 'assigned') + ': ' + CbvWebAppTimelineKanban__esc_(c.assignedTo));
  html.push('</div>');
  if (c.operatorMetaText) html.push('<div class="cbv-muted" style="margin-top:4px">' + CbvWebAppTimelineKanban__esc_(c.operatorMetaText) + '</div>');
  html.push('<div class="cbv-muted" style="margin-top:6px">' + CbvWebAppTimelineKanban__vi_('updated_label', 'updated') + ': ' + CbvWebAppTimelineKanban__esc_(updated) + '</div>');
  html.push('</div>');
  return html.join('');
}

function CbvWebAppTimelineKanban_renderKanbanColumn_(column) {
  var col = column || {};
  var cards = col.cards || [];
  var html = [];
  html.push('<div class="cbv-card" style="min-width:240px;max-width:280px;flex:0 0 auto">');
  html.push('<div style="display:flex;justify-content:space-between;align-items:center;gap:6px">');
  html.push('<h3 style="margin:0">' + CbvWebAppTimelineKanban__esc_(col.status || 'UNKNOWN') + '</h3>');
  html.push('<span class="cbv-badge">' + CbvWebAppTimelineKanban__esc_(String(col.count || cards.length || 0)) + '</span>');
  html.push('</div>');
  if (!cards.length) {
    html.push('<div class="cbv-state cbv-muted">' + CbvWebAppTimelineKanban__vi_('empty_check_warnings', 'No cards in this column.') + '</div>');
  } else {
    for (var i = 0; i < cards.length; i++) {
      html.push(CbvWebAppTimelineKanban_renderKanbanCard_(cards[i]));
    }
  }
  html.push('</div>');
  return html.join('');
}

/* ------------------------------------------------------------------ */
/* Page renderers                                                      */
/* ------------------------------------------------------------------ */

/**
 * Map a data envelope into a UI state descriptor.
 * Phase 91.1 — renamed from __resolveState_ (the "resolve" verb is reserved for
 * operational mutations and was triggering the mutation-name scanner). This is
 * a pure UI state mapper; no write side-effects.
 */
function CbvWebAppTimelineKanban__mapState_(res, defaults) {
  if (!res || res.ok === false) {
    return CbvWebAppTimelineKanban_renderState_({
      type: 'warning',
      title: defaults.title,
      message: CbvWebAppTimelineKanban__vi_('data_not_available', 'Data not available (read-first).'),
      detail: res
    });
  }
  var d = res.data || {};
  var isEmpty = (defaults.kind === 'timeline')
    ? !(d.rows && d.rows.length)
    : !(d.columns && d.columns.length);
  if (isEmpty) {
    return CbvWebAppTimelineKanban_renderState_({
      type: 'empty',
      title: defaults.title,
      message: CbvWebAppTimelineKanban__vi_('no_items', 'No items found.'),
      detail: res
    });
  }
  if (res.warnings && res.warnings.length) {
    return CbvWebAppTimelineKanban_renderState_({
      type: 'partial',
      title: defaults.title,
      message: CbvWebAppTimelineKanban__vi_('showing_partial', 'Showing read-first data with warnings.'),
      detail: null
    });
  }
  return CbvWebAppTimelineKanban_renderState_({ type: 'ready', title: defaults.title, message: '', detail: null });
}

function CbvWebAppTimelineKanban__safetyFooter_(route) {
  var rt = route || '/home-alert/timeline';
  if (typeof CbvWebAppVi_getSafetyFooterHtml === 'function') {
    try {
      return [
        '<div class="cbv-card" style="margin-top:14px">',
        CbvWebAppVi_getSafetyFooterHtml(rt),
        '</div>'
      ].join('');
    } catch (e) { /* fall through */ }
  }
  return [
    '<div class="cbv-card" style="margin-top:14px">',
    '<div class="cbv-muted">Read-first only. Safety: No auto assign · No auto resolve · No auto escalate · No production claim.</div>',
    '</div>'
  ].join('');
}

function CbvWebAppTimelineKanban__warningsBlock_(warnings) {
  if (!warnings || !warnings.length) return '';
  var html = ['<div class="cbv-card" style="margin-top:12px"><h3>' + CbvWebAppTimelineKanban__vi_('warnings_title', 'Warnings') + '</h3><ul>'];
  for (var i = 0; i < warnings.length; i++) {
    html.push('<li class="cbv-muted">' + CbvWebAppTimelineKanban__esc_(String(warnings[i])) + '</li>');
  }
  html.push('</ul></div>');
  return html.join('');
}

function CbvWebAppTimelineKanban__inlineTimeline_(state, res) {
  var d = res && res.data ? res.data : { rows: [], count: 0 };
  var html = [];
  html.push(CbvWebAppTimelineKanban__includeComponents_() || '');
  html.push('<div class="cbv-card">');
  html.push('<h3>' + CbvWebAppTimelineKanban__vi_('timeline_read_first_h3', 'Timeline (read-first)') + '</h3>');
  html.push('<div class="cbv-muted">' + CbvWebAppTimelineKanban__vi_('timeline_sort_hint', 'Sort: UPDATED_AT desc · fallback CREATED_AT desc · No edits / no mutation buttons.') + '</div>');
  if (state && state.type !== 'ready') {
    html.push('<div class="cbv-state"><span class="cbv-badge warn">' + CbvWebAppTimelineKanban__esc_(state.type.toUpperCase()) + '</span><span style="margin-left:8px">' + CbvWebAppTimelineKanban__esc_(state.message) + '</span></div>');
  }
  html.push('<div class="cbv-muted" style="margin-top:10px">' + CbvWebAppTimelineKanban__vi_('count_label', 'count') + ': ' + (d.count || 0) + '</div>');
  if (!d.rows || !d.rows.length) {
    html.push('<div class="cbv-state cbv-muted">' + CbvWebAppTimelineKanban__vi_('empty_check_warnings', 'Empty (or HOME_ALERT missing). Check warnings.') + '</div>');
  } else {
    html.push('<div style="margin-top:10px">');
    for (var i = 0; i < d.rows.length; i++) {
      html.push(CbvWebAppTimelineKanban_renderTimelineRow_(d.rows[i]));
    }
    html.push('</div>');
  }
  html.push('</div>');
  html.push(CbvWebAppTimelineKanban__warningsBlock_(res ? res.warnings : []));
  html.push(CbvWebAppTimelineKanban__safetyFooter_('/home-alert/timeline'));
  return html.join('');
}

function CbvWebAppTimelineKanban__inlineKanban_(state, res) {
  var d = res && res.data ? res.data : { columns: [], total: 0, groupBy: 'STATUS' };
  var html = [];
  html.push(CbvWebAppTimelineKanban__includeComponents_() || '');
  html.push('<div class="cbv-card">');
  html.push('<h3>' + CbvWebAppTimelineKanban__vi_('kanban_read_first_h3', 'Kanban (read-first)') + '</h3>');
  html.push('<div class="cbv-muted">' + CbvWebAppTimelineKanban__vi_('kanban_group_hint', 'Group by: STATUS · Cards read-only · No drag-drop save.') + '</div>');
  if (state && state.type !== 'ready') {
    html.push('<div class="cbv-state"><span class="cbv-badge warn">' + CbvWebAppTimelineKanban__esc_(state.type.toUpperCase()) + '</span><span style="margin-left:8px">' + CbvWebAppTimelineKanban__esc_(state.message) + '</span></div>');
  }
  html.push('<div class="cbv-muted" style="margin-top:10px">' + CbvWebAppTimelineKanban__vi_('count_label', 'total') + ': ' + (d.total || 0) + ' · columns: ' + ((d.columns || []).length) + '</div>');
  if (!d.columns || !d.columns.length) {
    html.push('<div class="cbv-state cbv-muted">' + CbvWebAppTimelineKanban__vi_('empty_check_warnings', 'Empty (or HOME_ALERT missing). Check warnings.') + '</div>');
  } else {
    html.push('<div style="margin-top:10px;display:flex;gap:10px;overflow-x:auto;padding-bottom:6px">');
    for (var i = 0; i < d.columns.length; i++) {
      html.push(CbvWebAppTimelineKanban_renderKanbanColumn_(d.columns[i]));
    }
    html.push('</div>');
  }
  html.push('</div>');
  html.push(CbvWebAppTimelineKanban__warningsBlock_(res ? res.warnings : []));
  html.push(CbvWebAppTimelineKanban__safetyFooter_('/home-alert/kanban'));
  return html.join('');
}

function CbvWebAppTimelineKanban_renderTimeline() {
  var res = null;
  try {
    res = CbvWebAppTimelineKanban_getTimelineData({});
  } catch (e) {
    res = { ok: false, data: null, warnings: [], errors: [e && e.message ? e.message : String(e)] };
  }
  var pageTitle = (typeof CbvWebAppVi_getRouteLabel === 'function')
    ? CbvWebAppVi_getRouteLabel('/home-alert/timeline')
    : 'Timeline (read-first)';
  var state = CbvWebAppTimelineKanban__mapState_(res, { title: pageTitle, kind: 'timeline' });

  var bodyHtml = null;
  try {
    if (typeof HtmlService !== 'undefined' && HtmlService.createTemplateFromFile) {
      var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_TIMELINE');
      t.COMPONENTS = CbvWebAppTimelineKanban__includeComponents_();
      t.MODEL = { state: state, result: res };
      bodyHtml = t.evaluate().getContent();
    }
  } catch (eTpl) {
    bodyHtml = null;
  }
  if (!bodyHtml) bodyHtml = CbvWebAppTimelineKanban__inlineTimeline_(state, res);

  return {
    bodyHtml: bodyHtml,
    warnings: (res && res.warnings) ? res.warnings : []
  };
}

function CbvWebAppTimelineKanban_renderKanban() {
  var res = null;
  try {
    res = CbvWebAppTimelineKanban_getKanbanData({});
  } catch (e) {
    res = { ok: false, data: null, warnings: [], errors: [e && e.message ? e.message : String(e)] };
  }
  var pageTitleK = (typeof CbvWebAppVi_getRouteLabel === 'function')
    ? CbvWebAppVi_getRouteLabel('/home-alert/kanban')
    : 'Kanban (read-first)';
  var state = CbvWebAppTimelineKanban__mapState_(res, { title: pageTitleK, kind: 'kanban' });

  var bodyHtml = null;
  try {
    if (typeof HtmlService !== 'undefined' && HtmlService.createTemplateFromFile) {
      var t = HtmlService.createTemplateFromFile('html/WEBAPP_WORKSPACE_KANBAN');
      t.COMPONENTS = CbvWebAppTimelineKanban__includeComponents_();
      t.MODEL = { state: state, result: res };
      bodyHtml = t.evaluate().getContent();
    }
  } catch (eTpl) {
    bodyHtml = null;
  }
  if (!bodyHtml) bodyHtml = CbvWebAppTimelineKanban__inlineKanban_(state, res);

  return {
    bodyHtml: bodyHtml,
    warnings: (res && res.warnings) ? res.warnings : []
  };
}
