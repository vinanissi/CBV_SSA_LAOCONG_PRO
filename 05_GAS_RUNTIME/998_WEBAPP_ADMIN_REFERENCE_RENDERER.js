/**
 * PHASE_93 — WebApp Admin Reference Viewer / Settings Read-First — Renderer
 *
 * Operational Governance Layer (read-first).
 *
 * Read-first UI for /admin/reference. No edit / no toggle / no delete /
 * no permission / no feature-flag-toggle controls. Secrets are never
 * rendered — masked values + warning only.
 *
 * Public functions:
 *   - CbvWebAppAdminRef_renderReferenceViewer()
 *   - CbvWebAppAdminRef_renderGovernanceSummary_()
 *   - CbvWebAppAdminRef_renderEnumSummary_()
 *   - CbvWebAppAdminRef_renderUserRoleSummary_()
 *   - CbvWebAppAdminRef_renderFeatureFlagSummary_()
 *   - CbvWebAppAdminRef_renderSystemRegistrySummary_()
 *   - CbvWebAppAdminRef_renderUiContractSummary_()
 *   - CbvWebAppAdminRef_renderRouteRegistrySummary_()
 *   - CbvWebAppAdminRef_renderState_(state)
 */

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_renderState_(state) {
  var s = state || {};
  var t = String(s.type || '').trim() || 'ready';
  return {
    type: t,
    title: String(s.title || '').trim(),
    message: String(s.message || '').trim(),
    detail: s.detail || null
  };
}

function CbvWebAppAdminRef__includeComponents_() {
  try {
    if (typeof HtmlService === 'undefined') return '';
    return HtmlService.createHtmlOutputFromFile('html/WEBAPP_ADMIN_REFERENCE_COMPONENTS').getContent();
  } catch (e) {
    try {
      return HtmlService.createHtmlOutputFromFile('html/WEBAPP_OBSERVABILITY_COMPONENTS').getContent();
    } catch (e2) {
      return '';
    }
  }
}

function CbvWebAppAdminRef__esc_(v) {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function CbvWebAppAdminRef__vi_(key, en) {
  if (typeof CbvWebAppVi_getLabel !== 'function') return en;
  try {
    var t = CbvWebAppVi_getLabel(key);
    return t || en;
  } catch (e) {
    return en;
  }
}

function CbvWebAppAdminRef__statusBadgeClass_(status) {
  var s = String(status || '').toUpperCase();
  if (s === 'FAIL' || s === 'ERROR' || s === 'CRITICAL') return 'crit';
  if (s === 'WARNING' || s === 'GO_WITH_WARNINGS' || s === 'PENDING') return 'warn';
  if (s === 'GO' || s === 'OK') return 'ok';
  return 'warn';
}

function CbvWebAppAdminRef__safetyFooter_() {
  if (typeof CbvWebAppVi_getSafetyFooterHtml === 'function') {
    try {
      var extra = (typeof CbvWebAppVi_getLabel === 'function') ? CbvWebAppVi_getLabel('admin_safety_extra') : '';
      return [
        '<div class="cbv-card" style="margin-top:14px">',
        CbvWebAppVi_getSafetyFooterHtml('/admin/reference'),
        extra ? '<div class="cbv-muted" style="margin-top:6px">' + CbvWebAppAdminRef__esc_(extra) + '</div>' : '',
        '</div>'
      ].join('');
    } catch (e) { /* fall through */ }
  }
  return [
    '<div class="cbv-card" style="margin-top:14px">',
    '<div class="cbv-muted">Read-first governance. Safety: No edit · No toggle · No delete · No feature flag toggle · No permission change · Secrets masked · No production claim.</div>',
    '</div>'
  ].join('');
}

function CbvWebAppAdminRef__warningsBlock_(warnings) {
  if (!warnings || !warnings.length) return '';
  var html = ['<div class="cbv-card" style="margin-top:12px"><h3>' + CbvWebAppAdminRef__vi_('warnings_title', 'Warnings') + '</h3><ul>'];
  for (var i = 0; i < warnings.length; i++) {
    html.push('<li class="cbv-muted">' + CbvWebAppAdminRef__esc_(String(warnings[i])) + '</li>');
  }
  html.push('</ul></div>');
  return html.join('');
}

/* ------------------------------------------------------------------ */
/* Sub-renderers — each returns an HTML string                         */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_renderGovernanceSummary_() {
  var res;
  try { res = CbvWebAppAdminRef_getGovernanceSummary(); }
  catch (e) { res = { ok: false, data: null, warnings: [], errors: [e && e.message ? e.message : String(e)] }; }
  var d = res && res.data ? res.data : { sheets: [], totals: {}, status: 'WARNING', severity: 'WARNING' };

  var html = [];
  html.push('<div class="cbv-card">');
  html.push('<h3>' + CbvWebAppAdminRef__vi_('governance_summary_h3', 'Governance Summary') + '</h3>');
  html.push('<div class="cbv-muted">' + CbvWebAppAdminRef__vi_('overall_label', 'overall') + ': <span class="cbv-badge ' + CbvWebAppAdminRef__statusBadgeClass_(d.status) + '">' + CbvWebAppAdminRef__esc_(d.status || '?') + '</span> · ' + CbvWebAppAdminRef__vi_('severity_label', 'severity') + ': ' + CbvWebAppAdminRef__esc_(d.severity || '?') + '</div>');

  var totals = d.totals || {};
  html.push('<div class="cbv-muted" style="margin-top:6px">');
  html.push('enums: ' + (totals.enums || 0) + ' · users: ' + (totals.users || 0) + ' · teams: ' + (totals.teams || 0) + ' · roles: ' + (totals.roles || 0) + ' · feature flags: ' + (totals.featureFlags || 0) + ' · systems: ' + (totals.systems || 0) + ' · UI contracts: ' + (totals.uiContracts || 0) + ' · routes: ' + (totals.routes || 0));
  html.push('</div>');

  var sheets = d.sheets || [];
  html.push('<div style="margin-top:10px">');
  for (var i = 0; i < sheets.length; i++) {
    var s = sheets[i];
    var sCls = s.exists ? 'ok' : 'warn';
    html.push('<div class="cbv-card" style="margin:6px 0">');
    html.push('<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">');
    html.push('<div style="font-weight:700">' + CbvWebAppAdminRef__esc_(s.name || s.code) + '</div>');
    html.push('<span class="cbv-badge ' + sCls + '">' + (s.exists ? CbvWebAppAdminRef__vi_('present', 'PRESENT') : CbvWebAppAdminRef__vi_('missing', 'MISSING')) + '</span>');
    html.push('</div>');
    html.push('<div class="cbv-muted" style="margin-top:6px"><code>' + CbvWebAppAdminRef__esc_(s.code) + '</code> · ' + CbvWebAppAdminRef__vi_('rows_short', 'rows') + ': ' + (s.rowCount || 0));
    if (s.note) html.push(' · ' + CbvWebAppAdminRef__esc_(s.note));
    html.push('</div>');
    html.push('</div>');
  }
  html.push('</div>');
  html.push('</div>');
  return html.join('');
}

function CbvWebAppAdminRef_renderEnumSummary_() {
  var res;
  try { res = CbvWebAppAdminRef_getEnumSummary({ sampleSize: 5 }); }
  catch (e) { res = { ok: false, data: { groups: [] }, warnings: [], errors: [e && e.message ? e.message : String(e)] }; }
  var d = res && res.data ? res.data : { count: 0, groups: [] };

  var html = [];
  html.push('<div class="cbv-card" style="margin-top:10px">');
  html.push('<h3>' + CbvWebAppAdminRef__vi_('enum_dictionary_h3', 'Enum Dictionary') + '</h3>');
  html.push('<div class="cbv-muted">' + CbvWebAppAdminRef__vi_('total_active_enums', 'total active enums') + ': ' + (d.count || 0) + ' · ' + CbvWebAppAdminRef__vi_('groups_short', 'groups') + ': ' + ((d.groups || []).length) + '</div>');
  if (!d.groups || !d.groups.length) {
    html.push('<div class="cbv-state cbv-muted">' + CbvWebAppAdminRef__vi_('no_enum_rows', 'No enum rows visible. Check warnings.') + '</div>');
  } else {
    html.push('<div style="margin-top:10px">');
    for (var i = 0; i < d.groups.length; i++) {
      var g = d.groups[i];
      html.push('<div class="cbv-card" style="margin:6px 0">');
      html.push('<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">');
      html.push('<div style="font-weight:700">' + CbvWebAppAdminRef__esc_(g.enumType) + '</div>');
      html.push('<span class="cbv-badge">' + (g.count || 0) + '</span>');
      html.push('</div>');
      if (g.sampleValues && g.sampleValues.length) {
        html.push('<div class="cbv-muted" style="margin-top:6px">' + CbvWebAppAdminRef__vi_('sample_label', 'sample') + ': ' + CbvWebAppAdminRef__esc_(g.sampleValues.join(', ')) + '</div>');
      }
      html.push('</div>');
    }
    html.push('</div>');
  }
  html.push('</div>');
  return html.join('');
}

function CbvWebAppAdminRef_renderUserRoleSummary_() {
  var res;
  try { res = CbvWebAppAdminRef_getUserRoleSummary({ sampleSize: 25 }); }
  catch (e) { res = { ok: false, data: { users: [], roles: [] }, warnings: [], errors: [e && e.message ? e.message : String(e)] }; }
  var d = res && res.data ? res.data : { usersCount: 0, teamsCount: 0, rolesCount: 0, users: [], roles: [] };

  var html = [];
  html.push('<div class="cbv-card" style="margin-top:10px">');
  html.push('<h3>' + CbvWebAppAdminRef__vi_('users_roles_teams_h3', 'Users / Roles / Teams') + '</h3>');
  html.push('<div class="cbv-muted">' + CbvWebAppAdminRef__vi_('users_count_short', 'users') + ': ' + (d.usersCount || 0) + ' · ' + CbvWebAppAdminRef__vi_('teams_count_short', 'teams') + ': ' + (d.teamsCount || 0) + ' · ' + CbvWebAppAdminRef__vi_('roles_count_short', 'roles') + ': ' + (d.rolesCount || 0) + ' · <em>' + CbvWebAppAdminRef__vi_('emails_masked_note', 'emails masked') + '</em></div>');

  if (d.users && d.users.length) {
    html.push('<div style="margin-top:10px"><h4>' + CbvWebAppAdminRef__vi_('users_sample_masked_h4', 'Users (sample, masked)') + '</h4>');
    for (var i = 0; i < d.users.length; i++) {
      var u = d.users[i];
      html.push('<div class="cbv-card" style="margin:6px 0">');
      html.push('<div><code>' + CbvWebAppAdminRef__esc_(u.email || '') + '</code></div>');
      html.push('<div class="cbv-muted" style="margin-top:4px">' + CbvWebAppAdminRef__vi_('name_field_short', 'name') + ': ' + CbvWebAppAdminRef__esc_(u.displayName || '') + ' · ' + CbvWebAppAdminRef__vi_('role_field_short', 'role') + ': ' + CbvWebAppAdminRef__esc_(u.role || '') + ' · ' + CbvWebAppAdminRef__vi_('team_field_short', 'team') + ': ' + CbvWebAppAdminRef__esc_(u.teamCode || '') + ' · ' + CbvWebAppAdminRef__vi_('status_field_short', 'status') + ': ' + CbvWebAppAdminRef__esc_(u.status || '') + '</div>');
      html.push('</div>');
    }
    html.push('</div>');
  }

  if (d.roles && d.roles.length) {
    html.push('<div style="margin-top:10px"><h4>' + CbvWebAppAdminRef__vi_('roles_h4', 'Roles') + '</h4>');
    for (var j = 0; j < d.roles.length; j++) {
      var r = d.roles[j];
      html.push('<div class="cbv-card" style="margin:6px 0">');
      html.push('<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">');
      html.push('<div style="font-weight:700">' + CbvWebAppAdminRef__esc_(r.roleCode || '?') + '</div>');
      html.push('<span class="cbv-badge">' + (r.permissions || 0) + ' ' + CbvWebAppAdminRef__vi_('perms_short', 'perms') + '</span>');
      html.push('</div>');
      if (r.modules && r.modules.length) {
        html.push('<div class="cbv-muted" style="margin-top:4px">' + CbvWebAppAdminRef__vi_('modules_short', 'modules') + ': ' + CbvWebAppAdminRef__esc_(r.modules.join(', ')) + '</div>');
      }
      html.push('</div>');
    }
    html.push('</div>');
  }
  html.push('</div>');
  return html.join('');
}

function CbvWebAppAdminRef_renderFeatureFlagSummary_() {
  var res;
  try { res = CbvWebAppAdminRef_getFeatureFlagSummary({ sampleSize: 50 }); }
  catch (e) { res = { ok: false, data: { flags: [] }, warnings: [], errors: [e && e.message ? e.message : String(e)] }; }
  var d = res && res.data ? res.data : { count: 0, enabledCount: 0, disabledCount: 0, flags: [] };

  var html = [];
  html.push('<div class="cbv-card" style="margin-top:10px">');
  html.push('<h3>' + CbvWebAppAdminRef__vi_('feature_flags_h3', 'Feature Flags') + ' <span class="cbv-muted" style="font-weight:400">(' + CbvWebAppAdminRef__vi_('read_only_short', 'read-only') + ')</span></h3>');
  html.push('<div class="cbv-muted">' + CbvWebAppAdminRef__vi_('total_short', 'total') + ': ' + (d.count || 0) + ' · ' + CbvWebAppAdminRef__vi_('ff_enabled', 'enabled') + ': ' + (d.enabledCount || 0) + ' · ' + CbvWebAppAdminRef__vi_('ff_disabled', 'disabled') + ': ' + (d.disabledCount || 0) + ' · <em>' + CbvWebAppAdminRef__vi_('no_toggle_buttons_note', 'no toggle buttons') + '</em></div>');

  if (d.flags && d.flags.length) {
    html.push('<div style="margin-top:10px">');
    for (var i = 0; i < d.flags.length; i++) {
      var f = d.flags[i];
      var cls = f.enabled ? 'ok' : 'warn';
      html.push('<div class="cbv-card" style="margin:6px 0">');
      html.push('<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">');
      html.push('<div style="font-weight:700">' + CbvWebAppAdminRef__esc_(f.featureCode || '?') + '</div>');
      html.push('<span class="cbv-badge ' + cls + '">' + (f.enabled ? CbvWebAppAdminRef__vi_('enabled_short', 'ENABLED') : CbvWebAppAdminRef__vi_('disabled_short', 'DISABLED')) + '</span>');
      html.push('</div>');
      html.push('<div class="cbv-muted" style="margin-top:4px">' + CbvWebAppAdminRef__vi_('owner_short', 'owner') + ': ' + CbvWebAppAdminRef__esc_(f.owner || '') + (f.note ? ' · ' + CbvWebAppAdminRef__esc_(f.note) : '') + '</div>');
      html.push('</div>');
    }
    html.push('</div>');
  } else {
    html.push('<div class="cbv-state cbv-muted">' + CbvWebAppAdminRef__vi_('no_feature_flag_rows', 'No feature flag rows visible.') + '</div>');
  }
  html.push('</div>');
  return html.join('');
}

function CbvWebAppAdminRef_renderSystemRegistrySummary_() {
  var res;
  try { res = CbvWebAppAdminRef_getSystemRegistrySummary({ sampleSize: 50 }); }
  catch (e) { res = { ok: false, data: { systems: [] }, warnings: [], errors: [e && e.message ? e.message : String(e)] }; }
  var d = res && res.data ? res.data : { count: 0, systems: [] };

  var html = [];
  html.push('<div class="cbv-card" style="margin-top:10px">');
  html.push('<h3>' + CbvWebAppAdminRef__vi_('system_registry_h3', 'System Registry') + '</h3>');
  html.push('<div class="cbv-muted">' + CbvWebAppAdminRef__vi_('total_short', 'total') + ': ' + (d.count || 0) + '</div>');
  if (d.systems && d.systems.length) {
    html.push('<div style="margin-top:10px">');
    for (var i = 0; i < d.systems.length; i++) {
      var s = d.systems[i];
      html.push('<div class="cbv-card" style="margin:6px 0">');
      html.push('<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">');
      html.push('<div style="font-weight:700">' + CbvWebAppAdminRef__esc_(s.systemCode || '?') + '</div>');
      html.push('<span class="cbv-badge">' + CbvWebAppAdminRef__esc_(s.status || '?') + '</span>');
      html.push('</div>');
      html.push('<div class="cbv-muted" style="margin-top:4px">' + CbvWebAppAdminRef__vi_('modules_short', 'module') + ': ' + CbvWebAppAdminRef__esc_(s.moduleCode || '') + ' · ' + CbvWebAppAdminRef__vi_('owner_short', 'owner') + ': ' + CbvWebAppAdminRef__esc_(s.owner || '') + (s.note ? ' · ' + CbvWebAppAdminRef__esc_(s.note) : '') + '</div>');
      html.push('</div>');
    }
    html.push('</div>');
  } else {
    html.push('<div class="cbv-state cbv-muted">' + CbvWebAppAdminRef__vi_('no_system_registry_rows', 'No system registry rows visible.') + '</div>');
  }
  html.push('</div>');
  return html.join('');
}

function CbvWebAppAdminRef_renderUiContractSummary_() {
  var res;
  try { res = CbvWebAppAdminRef_getUiContractSummary({ sampleSize: 50 }); }
  catch (e) { res = { ok: false, data: { contracts: [] }, warnings: [], errors: [e && e.message ? e.message : String(e)] }; }
  var d = res && res.data ? res.data : { count: 0, byChannel: {}, byScreenType: {}, pilotReadyCount: 0, contracts: [] };

  var html = [];
  html.push('<div class="cbv-card" style="margin-top:10px">');
  html.push('<h3>' + CbvWebAppAdminRef__vi_('ui_contract_registry_h3', 'UI Contract Registry') + '</h3>');
  html.push('<div class="cbv-muted">' + CbvWebAppAdminRef__vi_('total_short', 'total') + ': ' + (d.count || 0) + ' · pilot-ready: ' + (d.pilotReadyCount || 0) + '</div>');
  html.push('<div class="cbv-muted" style="margin-top:4px">' + CbvWebAppAdminRef__vi_('by_mode_short', 'by channel') + ': <code>' + CbvWebAppAdminRef__esc_(JSON.stringify(d.byChannel || {})) + '</code></div>');
  html.push('<div class="cbv-muted" style="margin-top:4px">' + CbvWebAppAdminRef__vi_('by_page_type_short', 'by screenType') + ': <code>' + CbvWebAppAdminRef__esc_(JSON.stringify(d.byScreenType || {})) + '</code></div>');

  if (d.contracts && d.contracts.length) {
    html.push('<div style="margin-top:10px">');
    for (var i = 0; i < d.contracts.length; i++) {
      var c = d.contracts[i];
      html.push('<div class="cbv-card" style="margin:6px 0">');
      html.push('<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">');
      html.push('<div style="font-weight:700">' + CbvWebAppAdminRef__esc_(c.screenCode || '?') + '</div>');
      html.push('<span class="cbv-badge ' + (c.isPilotReady ? 'ok' : 'warn') + '">' + (c.isPilotReady ? CbvWebAppAdminRef__vi_('pilot_ready_badge', 'PILOT_READY') : CbvWebAppAdminRef__vi_('pending_badge', 'PENDING')) + '</span>');
      html.push('</div>');
      html.push('<div class="cbv-muted" style="margin-top:4px">' + CbvWebAppAdminRef__esc_(c.screenName || '') + ' · ' + CbvWebAppAdminRef__vi_('channel_short', 'channel') + ': ' + CbvWebAppAdminRef__esc_(c.channel || '') + ' · ' + CbvWebAppAdminRef__vi_('type_short', 'type') + ': ' + CbvWebAppAdminRef__esc_(c.screenType || '') + ' · ' + CbvWebAppAdminRef__vi_('modules_short', 'module') + ': ' + CbvWebAppAdminRef__esc_(c.moduleCode || '') + '</div>');
      if (c.webAppRoute || c.appSheetView) {
        html.push('<div class="cbv-muted" style="margin-top:4px">' + CbvWebAppAdminRef__vi_('webapp_short', 'webApp') + ': <code>' + CbvWebAppAdminRef__esc_(c.webAppRoute || '') + '</code> · ' + CbvWebAppAdminRef__vi_('appsheet_short', 'appSheet') + ': <code>' + CbvWebAppAdminRef__esc_(c.appSheetView || '') + '</code></div>');
      }
      html.push('</div>');
    }
    html.push('</div>');
  } else {
    html.push('<div class="cbv-state cbv-muted">' + CbvWebAppAdminRef__vi_('ui_contract_unavailable', 'UI contract registry unavailable.') + '</div>');
  }
  html.push('</div>');
  return html.join('');
}

function CbvWebAppAdminRef_renderRouteRegistrySummary_() {
  var res;
  try { res = CbvWebAppAdminRef_getRouteRegistrySummary(); }
  catch (e) { res = { ok: false, data: { routes: [] }, warnings: [], errors: [e && e.message ? e.message : String(e)] }; }
  var d = res && res.data ? res.data : { count: 0, readFirstCount: 0, pilotReadyCount: 0, byMode: {}, byPageType: {}, routes: [] };

  var html = [];
  html.push('<div class="cbv-card" style="margin-top:10px">');
  html.push('<h3>' + CbvWebAppAdminRef__vi_('route_registry_h3', 'Route Registry') + '</h3>');
  html.push('<div class="cbv-muted">' + CbvWebAppAdminRef__vi_('total_short', 'total') + ': ' + (d.count || 0) + ' · read-first: ' + (d.readFirstCount || 0) + ' · pilot-ready: ' + (d.pilotReadyCount || 0) + '</div>');
  html.push('<div class="cbv-muted" style="margin-top:4px">by mode: <code>' + CbvWebAppAdminRef__esc_(JSON.stringify(d.byMode || {})) + '</code></div>');
  html.push('<div class="cbv-muted" style="margin-top:4px">by pageType: <code>' + CbvWebAppAdminRef__esc_(JSON.stringify(d.byPageType || {})) + '</code></div>');

  if (d.routes && d.routes.length) {
    html.push('<div style="margin-top:10px">');
    for (var i = 0; i < d.routes.length; i++) {
      var r = d.routes[i];
      var cls = r.mode === 'READ_FIRST' ? 'ok' : 'warn';
      html.push('<div class="cbv-card" style="margin:6px 0">');
      html.push('<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">');
      html.push('<div style="font-weight:700"><code>' + CbvWebAppAdminRef__esc_(r.route || '') + '</code></div>');
      html.push('<span class="cbv-badge ' + cls + '">' + CbvWebAppAdminRef__esc_(r.mode || '?') + '</span>');
      html.push('</div>');
      html.push('<div class="cbv-muted" style="margin-top:4px">' + CbvWebAppAdminRef__esc_(r.title || '') + ' · ' + CbvWebAppAdminRef__vi_('page_type_short', 'pageType') + ': ' + CbvWebAppAdminRef__esc_(r.pageType || '') + ' · ' + CbvWebAppAdminRef__vi_('role_required_short', 'role') + ': ' + CbvWebAppAdminRef__esc_(r.requiredRole || 'ANY') + ' · ' + CbvWebAppAdminRef__vi_('pilot_ready_short', 'pilot-ready') + ': ' + (r.isPilotReady ? CbvWebAppAdminRef__vi_('yes_short', 'yes') : CbvWebAppAdminRef__vi_('no_short', 'no')) + '</div>');
      html.push('</div>');
    }
    html.push('</div>');
  } else {
    html.push('<div class="cbv-state cbv-muted">' + CbvWebAppAdminRef__vi_('route_registry_unavailable', 'Route registry unavailable.') + '</div>');
  }
  html.push('</div>');
  return html.join('');
}

/* ------------------------------------------------------------------ */
/* Top-level page renderer                                             */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef__inlineReferenceViewer_(govRes) {
  var html = [];
  html.push(CbvWebAppAdminRef__includeComponents_() || '');
  html.push('<div class="cbv-card">');
  html.push('<h3>' + CbvWebAppAdminRef__vi_('admin_ref_viewer_h3', 'Admin Reference Viewer (read-first)') + '</h3>');
  html.push('<div class="cbv-muted">' + CbvWebAppAdminRef__vi_('admin_ref_viewer_sub', 'Operational Governance Layer · sheet presence + summaries · No edit / no toggle / no delete · Secrets masked.') + '</div>');
  html.push('</div>');

  html.push(CbvWebAppAdminRef_renderGovernanceSummary_());
  html.push(CbvWebAppAdminRef_renderEnumSummary_());
  html.push(CbvWebAppAdminRef_renderUserRoleSummary_());
  html.push(CbvWebAppAdminRef_renderFeatureFlagSummary_());
  html.push(CbvWebAppAdminRef_renderSystemRegistrySummary_());
  html.push(CbvWebAppAdminRef_renderUiContractSummary_());
  html.push(CbvWebAppAdminRef_renderRouteRegistrySummary_());

  if (govRes && govRes.warnings && govRes.warnings.length) {
    html.push(CbvWebAppAdminRef__warningsBlock_(govRes.warnings));
  }
  html.push(CbvWebAppAdminRef__safetyFooter_());
  return html.join('');
}

function CbvWebAppAdminRef_renderReferenceViewer() {
  var govRes = null;
  try {
    govRes = CbvWebAppAdminRef_getGovernanceSummary();
  } catch (e) {
    govRes = { ok: false, data: null, warnings: [], errors: [e && e.message ? e.message : String(e)] };
  }

  var bodyHtml = null;
  try {
    if (typeof HtmlService !== 'undefined' && HtmlService.createTemplateFromFile) {
      var t = HtmlService.createTemplateFromFile('html/WEBAPP_ADMIN_REFERENCE_VIEWER');
      t.COMPONENTS = CbvWebAppAdminRef__includeComponents_();
      t.MODEL = {
        state: CbvWebAppAdminRef_renderState_({
          type: govRes && govRes.ok ? 'ready' : 'warning',
          title: (typeof CbvWebAppVi_getRouteLabel === 'function') ? CbvWebAppVi_getRouteLabel('/admin/reference') : 'Admin Reference',
          message: '',
          detail: null
        }),
        result: govRes,
        sections: {
          governance: CbvWebAppAdminRef_renderGovernanceSummary_(),
          enums: CbvWebAppAdminRef_renderEnumSummary_(),
          userRole: CbvWebAppAdminRef_renderUserRoleSummary_(),
          featureFlag: CbvWebAppAdminRef_renderFeatureFlagSummary_(),
          systemRegistry: CbvWebAppAdminRef_renderSystemRegistrySummary_(),
          uiContract: CbvWebAppAdminRef_renderUiContractSummary_(),
          routeRegistry: CbvWebAppAdminRef_renderRouteRegistrySummary_()
        }
      };
      bodyHtml = t.evaluate().getContent();
    }
  } catch (eTpl) {
    bodyHtml = null;
  }
  if (!bodyHtml) bodyHtml = CbvWebAppAdminRef__inlineReferenceViewer_(govRes);

  return {
    bodyHtml: bodyHtml,
    warnings: (govRes && govRes.warnings) ? govRes.warnings : []
  };
}
