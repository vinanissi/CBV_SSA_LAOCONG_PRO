/**
 * PHASE_86 — UI CONTRACT PILOT BINDING (read-only plans + validation)
 *
 * Depends on Phase 85: 84_UNIFIED_UI_CONTRACT_RUNTIME.js (load before this file).
 * No new business logic for HOME_ALERT rows; no ENV-A, AI, queue intelligence, AppSheet Bot.
 */

var CBV_UI_PILOT_BINDING_PHASE_ID = 'PHASE_86_UI_CONTRACT_PILOT_BINDING';

/** AppSheet-daily baseline (operator + triage + SLA shell). */
var CBV_UI_PILOT_BINDING_APPSHEET_DAILY_CODES = [
  'HOME_ALERT_OPERATOR_DASHBOARD',
  'HOME_ALERT_MY_QUEUE',
  'HOME_ALERT_UNASSIGNED_QUEUE',
  'HOME_ALERT_ESCALATED_QUEUE',
  'HOME_ALERT_BLOCKED_QUEUE',
  'HOME_ALERT_SLA_DASHBOARD'
];

/** WebApp-advanced baseline (per Phase 86 spec). */
var CBV_UI_PILOT_BINDING_WEB_ADVANCED_CODES = [
  'HOME_ALERT_TIMELINE',
  'HOME_ALERT_KANBAN',
  'RUNTIME_HEALTH_DASHBOARD',
  'CBV_TEST_CONSOLE',
  'REPORT_HANDOFF_VIEWER',
  'ADMIN_REFERENCE_VIEWER'
];

function CbvUiPilotBinding__traceId_() {
  return (typeof HomeAlert_newTraceId_ === 'function') ? HomeAlert_newTraceId_() : ('UIP86_' + Utilities.getUuid());
}

function CbvUiPilotBinding__actor_() {
  return (typeof HomeAlert_actorId_ === 'function') ? HomeAlert_actorId_() : (typeof cbvUser === 'function' ? cbvUser() : '');
}

function CbvUiPilotBinding__rowObjectsAll_() {
  if (typeof CbvUiContract__rowObjects_ === 'function') return CbvUiContract__rowObjects_();
  if (typeof CbvUiContract_getAll === 'function') return CbvUiContract_getAll();
  return [];
}

/**
 * @returns {{ ok: boolean, contracts: Object[], message: string }}
 */
function CbvUiPilotBinding_getContracts() {
  if (typeof CbvUiContract_getAll !== 'function') {
    return { ok: false, contracts: [], message: 'Phase 85 runtime missing: CbvUiContract_getAll not loaded' };
  }
  try {
    return { ok: true, contracts: CbvUiContract_getAll(), message: '' };
  } catch (e) {
    return { ok: false, contracts: [], message: e.message || String(e) };
  }
}

function CbvUiPilotBinding__classifyAppSheetRow_(r) {
  var code = String(r.SCREEN_CODE || '').trim();
  if (code === 'HOME_ALERT_ESCALATED_QUEUE' || code === 'HOME_ALERT_BLOCKED_QUEUE' || code === 'HOME_ALERT_SLA_DASHBOARD') {
    return 'supervisor';
  }
  if (CBV_UI_PILOT_BINDING_APPSHEET_DAILY_CODES.indexOf(code) >= 0) {
    return 'dailyOperator';
  }
  if (String(r.MODULE_CODE || '').toUpperCase() === 'SYSTEM' || String(r.MODULE_CODE || '').toUpperCase() === 'REF' || String(r.MODULE_CODE || '').toUpperCase() === 'DOCS') {
    return 'admin';
  }
  return 'other';
}

/**
 * @returns {Object} Binding plan for AppSheet pilot (documentation + gap list).
 */
function CbvUiPilotBinding_buildAppSheetBindingPlan() {
  var gc = CbvUiPilotBinding_getContracts();
  if (!gc.ok) return { ok: false, message: gc.message, dailyOperatorScreens: [], supervisorScreens: [], adminScreens: [], bothChannelScreens: [], missingAppSheetViewNames: [], securityFilterHints: [], actionsNeeded: [] };

  var appsheetRows = gc.contracts.filter(function(r) {
    var ch = String(r.CHANNEL || '').trim().toUpperCase();
    return ch === 'APPSHEET' || ch === 'BOTH';
  });

  var daily = [];
  var sup = [];
  var adm = [];
  var both = [];
  var missing = [];
  var hints = [];
  var actions = [];

  appsheetRows.forEach(function(r) {
    var ch = String(r.CHANNEL || '').trim().toUpperCase();
    if (ch === 'BOTH') both.push(r);
    var bucket = CbvUiPilotBinding__classifyAppSheetRow_(r);
    var entry = {
      screenCode: r.SCREEN_CODE,
      appsheetView: r.APPSHEET_VIEW,
      channel: r.CHANNEL,
      securityFilterHint: r.SECURITY_FILTER_HINT,
      allowedActionsJson: r.ALLOWED_ACTIONS_JSON
    };
    if (bucket === 'supervisor') sup.push(entry);
    else if (bucket === 'admin') adm.push(entry);
    else if (bucket === 'dailyOperator') daily.push(entry);
    else if (String(r.SCREEN_CODE || '').indexOf('HOME_ALERT_') === 0) daily.push(entry);

    if (!String(r.APPSHEET_VIEW || '').trim()) {
      missing.push(String(r.SCREEN_CODE || ''));
      actions.push('Create or rename AppSheet view to match APPSHEET_VIEW for ' + r.SCREEN_CODE);
    }
    if (String(r.SECURITY_FILTER_HINT || '').trim()) hints.push({ screenCode: r.SCREEN_CODE, hint: r.SECURITY_FILTER_HINT });
  });

  if (missing.length) {
    actions.push('Verify slice row filters use USEREMAIL() and USERSETTINGS("Role"); never legacy row-user tokens.');
  }

  return {
    ok: true,
    dailyOperatorScreens: daily,
    supervisorScreens: sup,
    adminScreens: adm,
    bothChannelScreens: both,
    missingAppSheetViewNames: missing,
    securityFilterHints: hints,
    actionsNeeded: actions,
    contractVersion: typeof CBV_UI_CONTRACT_VERSION !== 'undefined' ? CBV_UI_CONTRACT_VERSION : 'CBV_UI_CONTRACT_V1'
  };
}

/**
 * @returns {Object} WebApp route plan skeleton for pilot.
 */
function CbvUiPilotBinding_buildWebAppRoutePlan() {
  var gc = CbvUiPilotBinding_getContracts();
  if (!gc.ok) return { ok: false, message: gc.message, routes: [], missingRouteMetadata: [], byRoute: {} };

  var webRows = gc.contracts.filter(function(r) {
    var ch = String(r.CHANNEL || '').trim().toUpperCase();
    return ch === 'WEBAPP' || ch === 'BOTH';
  });

  var routes = [];
  var missing = [];
  var byRoute = {};

  webRows.forEach(function(r) {
    var route = String(r.WEBAPP_ROUTE || '').trim();
    var entry = {
      route: route,
      screenCode: r.SCREEN_CODE,
      screenType: r.SCREEN_TYPE,
      dataSourceSheet: r.DATA_SOURCE_SHEET,
      userRole: r.USER_ROLE,
      teamCode: r.TEAM_CODE,
      pilotReady: r.IS_PILOT_READY === true || String(r.IS_PILOT_READY || '').toUpperCase() === 'TRUE',
      channel: r.CHANNEL
    };
    routes.push(entry);
    if (!route) missing.push(String(r.SCREEN_CODE || ''));
    if (route) {
      if (!byRoute[route]) byRoute[route] = [];
      byRoute[route].push(entry);
    }
  });

  return {
    ok: true,
    routes: routes,
    missingRouteMetadata: missing,
    byRoute: byRoute,
    readFirstPilotNote: 'Pilot WebApp routes should be read-first; no destructive writes without explicit human action.',
    contractVersion: typeof CBV_UI_CONTRACT_VERSION !== 'undefined' ? CBV_UI_CONTRACT_VERSION : 'CBV_UI_CONTRACT_V1'
  };
}

/**
 * @returns {Object} Pilot checklist sections (machine-readable; also used in docs).
 */
function CbvUiPilotBinding_buildPilotChecklist() {
  return {
    ok: true,
    sections: [
      {
        id: 'admin_setup',
        title: 'Admin setup',
        items: [
          { id: 'A1', text: 'clasp push latest GAS; open bound spreadsheet.', passCriteria: 'No compile errors in Apps Script.' },
          { id: 'A2', text: 'Run 🧪 CBV Test Console → Phase 85 → Validate; then Phase 86 → Pilot Binding health.', passCriteria: 'Status GO or GO_WITH_WARNINGS with zero ERROR-severity binding checks.' },
          { id: 'A3', text: 'For each APPSHEET_VIEW in CBV_UI_CONTRACT, create/rename AppSheet view.', passCriteria: 'View names match contract (case/spacing per your AppSheet convention).' },
          { id: 'A4', text: 'Document deep links / actions from ALLOWED_ACTIONS_JSON as manual AppSheet actions.', passCriteria: 'No AppSheet Bot; actions are explicit taps.' }
        ]
      },
      {
        id: 'supervisor_validation',
        title: 'Supervisor validation',
        items: [
          { id: 'S1', text: 'Open escalated / blocked / SLA slices; confirm counts match expectations.', passCriteria: 'No silent auto-escalation; human actions only.' },
          { id: 'S2', text: 'Verify security filters with USEREMAIL() / USERSETTINGS("Role").', passCriteria: 'Cross-role leakage not observed on sample accounts.' }
        ]
      },
      {
        id: 'operator_workflow',
        title: 'Operator workflow',
        items: [
          { id: 'O1', text: 'My queue: claim/ack/in-progress/resolve paths.', passCriteria: 'State transitions match HOME_ALERT operational rules.' },
          { id: 'O2', text: 'Unassigned queue (AppSheet): triage only.', passCriteria: 'CLAIM visible; no auto-assign.' }
        ]
      },
      {
        id: 'security_check',
        title: 'Security check',
        items: [
          { id: 'SEC1', text: 'No _THISUSER in stored expressions; no leading = in AppSheet-oriented contract fields.', passCriteria: 'CbvUiPilotBinding_validate passes.' }
        ]
      },
      {
        id: 'sla_escalation_visibility',
        title: 'SLA & escalation visibility',
        items: [
          { id: 'SLA1', text: 'SLA dashboard slice shows SLA_* columns / badges.', passCriteria: 'Breaches visible; no auto-resolve.' },
          { id: 'ESC1', text: 'Escalated queue visible to intended roles only.', passCriteria: 'Filter matches policy docs.' }
        ]
      },
      {
        id: 'webapp_route_check',
        title: 'WebApp route check',
        items: [
          { id: 'W1', text: 'Each WEBAPP_ROUTE in contract maps to a stub or future page in WebApp project.', passCriteria: '404 acceptable for skeleton; no destructive API.' }
        ]
      },
      {
        id: 'appsheet_deeplink_check',
        title: 'AppSheet deep link check',
        items: [
          { id: 'D1', text: 'APPSHEET_DEEPLINK_EXPR opens intended view on device.', passCriteria: 'No expression starting with "=" in contract cells.' }
        ]
      }
    ]
  };
}

function CbvUiPilotBinding__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

/**
 * @returns {{ ok: boolean, errors: string[], warnings: string[], checks: Object[] }}
 */
function CbvUiPilotBinding_validate() {
  var errors = [];
  var warnings = [];
  var checks = [];

  function add(code, ok, sev, message, detail) {
    checks.push({ code: code, ok: ok, severity: sev, message: message, detail: detail || {} });
  }

  if (typeof CbvUiContract_validate !== 'function') {
    add('PHASE85_RUNTIME', false, 'ERROR', 'CbvUiContract_validate not loaded', {});
    errors.push('Phase 85 UI Contract runtime not loaded');
    return { ok: false, errors: errors, warnings: warnings, checks: checks };
  }

  var base = CbvUiContract_validate();
  (base.checks || []).forEach(function(c) { checks.push(c); });
  errors = errors.concat(base.errors || []);
  warnings = warnings.concat(base.warnings || []);

  var rows = [];
  try {
    rows = CbvUiPilotBinding__rowObjectsAll_();
  } catch (e0) {
    add('CONTRACT_ROWS', false, 'ERROR', e0.message || String(e0), {});
    errors.push(e0.message || String(e0));
    return { ok: false, errors: errors, warnings: warnings, checks: checks };
  }

  var codes = {};
  rows.forEach(function(r) {
    var c = String(r.SCREEN_CODE || '').trim();
    if (c) codes[c] = true;
  });

  rows.forEach(function(r) {
    var sc = String(r.SCREEN_CODE || '').trim();
    if (!sc) return;
    var ch = String(r.CHANNEL || '').trim().toUpperCase();

    if (ch === 'APPSHEET' || ch === 'BOTH') {
      var v = String(r.APPSHEET_VIEW || '').trim();
      var vOk = !!v;
      add('APPSHEET_VIEW_' + sc, vOk, vOk ? 'OK' : 'ERROR', 'APPSHEET_VIEW required for APPSHEET/BOTH', { screenCode: sc, channel: ch });
      if (!vOk) errors.push('SCREEN ' + sc + ': missing APPSHEET_VIEW for channel ' + ch);
    }

    if (ch === 'WEBAPP' || ch === 'BOTH') {
      var rt = String(r.WEBAPP_ROUTE || '').trim();
      var rOk = !!rt;
      add('WEBAPP_ROUTE_' + sc, rOk, rOk ? 'OK' : 'ERROR', 'WEBAPP_ROUTE required for WEBAPP/BOTH', { screenCode: sc, channel: ch });
      if (!rOk) errors.push('SCREEN ' + sc + ': missing WEBAPP_ROUTE for channel ' + ch);
    }
  });

  CBV_UI_PILOT_BINDING_APPSHEET_DAILY_CODES.forEach(function(c) {
    var ok = !!codes[c];
    add('DAILY_APPSHEET_' + c, ok, ok ? 'OK' : 'WARNING', 'AppSheet daily screen present', { screenCode: c });
    if (!ok) warnings.push('Expected AppSheet-daily baseline missing: ' + c);
  });

  CBV_UI_PILOT_BINDING_WEB_ADVANCED_CODES.forEach(function(c) {
    var ok = !!codes[c];
    add('WEB_ADVANCED_' + c, ok, ok ? 'OK' : 'WARNING', 'Web advanced screen present', { screenCode: c });
    if (!ok) warnings.push('Expected WebApp-advanced baseline missing: ' + c);
  });

  return { ok: errors.length === 0, errors: errors, warnings: warnings, checks: checks };
}

/**
 * @returns {Object} Standard health / QA envelope.
 */
function CbvUiPilotBinding_healthCheck() {
  var traceId = CbvUiPilotBinding__traceId_();
  var checks = [];
  var warnings = [];
  var errors = [];

  try {
    if (typeof CbvUiContract_bootstrap === 'function') CbvUiContract_bootstrap();
    checks.push({ code: 'BOOTSTRAP_TOUCH', ok: true, severity: 'OK', message: 'CbvUiContract_bootstrap invoked (idempotent)', detail: {} });
  } catch (eB) {
    checks.push({ code: 'BOOTSTRAP_TOUCH', ok: false, severity: 'WARNING', message: eB.message || String(eB), detail: {} });
    warnings.push(eB.message || String(eB));
  }

  var v = null;
  try {
    v = CbvUiPilotBinding_validate();
    (v.checks || []).forEach(function(c) { checks.push(c); });
    errors = errors.concat(v.errors || []);
    warnings = warnings.concat(v.warnings || []);
  } catch (eV) {
    errors.push(eV.message || String(eV));
    checks.push({ code: 'VALIDATE', ok: false, severity: 'ERROR', message: eV.message || String(eV), detail: {} });
  }

  var asp = null;
  var wrp = null;
  try {
    asp = CbvUiPilotBinding_buildAppSheetBindingPlan();
    checks.push({ code: 'APPSHEET_PLAN', ok: !!(asp && asp.ok), severity: asp && asp.ok ? 'OK' : 'WARNING', message: 'buildAppSheetBindingPlan', detail: { missingViews: asp && asp.missingAppSheetViewNames ? asp.missingAppSheetViewNames.length : 0 } });
    if (asp && asp.missingAppSheetViewNames && asp.missingAppSheetViewNames.length) {
      warnings.push('Missing AppSheet views: ' + asp.missingAppSheetViewNames.join(', '));
    }
  } catch (e1) {
    checks.push({ code: 'APPSHEET_PLAN', ok: false, severity: 'ERROR', message: e1.message || String(e1), detail: {} });
    errors.push(e1.message || String(e1));
  }

  try {
    wrp = CbvUiPilotBinding_buildWebAppRoutePlan();
    checks.push({ code: 'WEBAPP_PLAN', ok: !!(wrp && wrp.ok), severity: wrp && wrp.ok ? 'OK' : 'WARNING', message: 'buildWebAppRoutePlan', detail: { missingRoutes: wrp && wrp.missingRouteMetadata ? wrp.missingRouteMetadata.length : 0 } });
    if (wrp && wrp.missingRouteMetadata && wrp.missingRouteMetadata.length) {
      warnings.push('Missing WEBAPP_ROUTE for: ' + wrp.missingRouteMetadata.join(', '));
    }
  } catch (e2) {
    checks.push({ code: 'WEBAPP_PLAN', ok: false, severity: 'ERROR', message: e2.message || String(e2), detail: {} });
    errors.push(e2.message || String(e2));
  }

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: CBV_UI_PILOT_BINDING_PHASE_ID,
    status: status,
    checkedAt: typeof cbvNow === 'function' ? cbvNow() : new Date(),
    runBy: CbvUiPilotBinding__actor_(),
    traceId: traceId,
    testSuite: 'CBV_UI_PILOT_BINDING_HEALTH',
    summary: 'UI Contract pilot binding: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL' ? 'Fix CbvUiPilotBinding_validate errors; align APPSHEET_VIEW and WEBAPP_ROUTE in CBV_UI_CONTRACT sheet.' : 'Bind AppSheet views and WebApp routes; run pilot checklist with 1 admin, 1 supervisor, 1–2 operators.',
    severity: severity,
    reportText: ['=== CBV_UI_PILOT_BINDING HEALTH ===', 'status=' + status].join('\n'),
    reportJson: { validate: v, appSheetPlan: asp, webAppPlan: wrp },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: false
  };

  var env = CbvUiPilotBinding__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  if (!env.ok) {
    warnings.push('Envelope missing: ' + (env.missing || []).join(','));
    report.status = errors.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
    report.ok = errors.length === 0;
  }

  return report;
}

/**
 * Append-only audit row when logAdminAudit exists; non-fatal if missing.
 * @param {Object} report
 * @returns {{ ok: boolean, message?: string }}
 */
function CbvUiPilotBinding_appendReportAudit_(report) {
  try {
    if (typeof logAdminAudit !== 'function') {
      return { ok: false, message: 'logAdminAudit not loaded' };
    }
    var tail = {
      status: report && report.status,
      severity: report && report.severity,
      envelopeOk: report && report.envelopeOk,
      traceId: report && report.traceId,
      phase: report && report.phase
    };
    logAdminAudit('CBV_UI_PILOT_BINDING_REPORT', 'CBV_UI_CONTRACT', String((report && report.traceId) || 'NA'), 'APPEND', {}, tail, 'CbvUiPilotBinding_appendReportAudit_');
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}
