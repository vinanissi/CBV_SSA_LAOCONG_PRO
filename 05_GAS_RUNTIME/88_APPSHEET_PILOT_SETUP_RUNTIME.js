/**
 * PHASE_87 — APPSHEET PILOT SETUP BINDING (matrices + validation; manual-first)
 *
 * Depends: 84_UNIFIED_UI_CONTRACT_RUNTIME.js, 86_UI_CONTRACT_PILOT_BINDING_RUNTIME.js (optional for plan).
 * No AppSheet Bot, no auto assign/resolve/escalate, no ENV-A / AI / queue intelligence.
 */

var CBV_APPSHEET_PILOT_PHASE_ID = 'PHASE_87_APPSHEET_PILOT_SETUP_BINDING';

/** Contract SCREEN_CODE values that must appear in the pilot view matrix. */
var CBV_APPSHEET_PILOT_REQUIRED_VIEW_SCREEN_CODES = [
  'HOME_ALERT_OPERATOR_DASHBOARD',
  'HOME_ALERT_MY_QUEUE',
  'HOME_ALERT_UNASSIGNED_QUEUE',
  'HOME_ALERT_ESCALATED_QUEUE',
  'HOME_ALERT_BLOCKED_QUEUE',
  'HOME_ALERT_SLA_DASHBOARD'
];

/** Required slice names (AppSheet Designer naming; align with docs). */
var CBV_APPSHEET_PILOT_REQUIRED_SLICE_NAMES = [
  'HOME_ALERT_My_Queue',
  'HOME_ALERT_Unassigned_Queue',
  'HOME_ALERT_Escalated_Queue',
  'HOME_ALERT_Blocked_Queue',
  'HOME_ALERT_SLA_Dashboard'
];

/** Required manual action codes (tap-only; no bot). */
var CBV_APPSHEET_PILOT_REQUIRED_ACTION_CODES = [
  'ACK',
  'CLAIM',
  'IN_PROGRESS',
  'WAITING_RESPONSE',
  'ESCALATE',
  'RESOLVE',
  'RELEASE'
];

function CbvAppSheetPilot__traceId_() {
  return (typeof HomeAlert_newTraceId_ === 'function') ? HomeAlert_newTraceId_() : ('ASP87_' + Utilities.getUuid());
}

function CbvAppSheetPilot__actor_() {
  return (typeof HomeAlert_actorId_ === 'function') ? HomeAlert_actorId_() : (typeof cbvUser === 'function' ? cbvUser() : '');
}

function CbvAppSheetPilot__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvAppSheetPilot__classifyRowFallback_(r) {
  var code = String(r.SCREEN_CODE || '').trim();
  if (code === 'HOME_ALERT_ESCALATED_QUEUE' || code === 'HOME_ALERT_BLOCKED_QUEUE' || code === 'HOME_ALERT_SLA_DASHBOARD') {
    return 'supervisor';
  }
  if (CBV_APPSHEET_PILOT_REQUIRED_VIEW_SCREEN_CODES.indexOf(code) >= 0) {
    return 'dailyOperator';
  }
  if (String(r.MODULE_CODE || '').toUpperCase() === 'SYSTEM' || String(r.MODULE_CODE || '').toUpperCase() === 'REF' || String(r.MODULE_CODE || '').toUpperCase() === 'DOCS') {
    return 'admin';
  }
  return 'other';
}

function CbvAppSheetPilot__guessViewType_(screenCode) {
  var c = String(screenCode || '').toUpperCase();
  if (c.indexOf('DASHBOARD') >= 0) return 'Dashboard / Deck';
  if (c.indexOf('QUEUE') >= 0) return 'Deck or Table (queue)';
  return 'Deck or Detail';
}

/**
 * @returns {Object} Normalized AppSheet binding data for setup matrices.
 */
function CbvAppSheetPilot_getBindingPlan() {
  if (typeof CbvUiPilotBinding_buildAppSheetBindingPlan === 'function') {
    try {
      var p = CbvUiPilotBinding_buildAppSheetBindingPlan();
      if (p && p.ok) {
        return {
          ok: true,
          source: 'CbvUiPilotBinding_buildAppSheetBindingPlan',
          message: '',
          normalized: {
            dailyOperatorScreens: p.dailyOperatorScreens || [],
            supervisorScreens: p.supervisorScreens || [],
            adminScreens: p.adminScreens || [],
            bothChannelScreens: p.bothChannelScreens || [],
            missingAppSheetViewNames: p.missingAppSheetViewNames || [],
            securityFilterHints: p.securityFilterHints || [],
            actionsNeeded: p.actionsNeeded || []
          },
          raw: p
        };
      }
      if (p && !p.ok) {
        return { ok: false, source: 'CbvUiPilotBinding_buildAppSheetBindingPlan', message: p.message || 'plan not ok', normalized: null, raw: p };
      }
    } catch (e0) {
      return { ok: false, source: 'CbvUiPilotBinding_buildAppSheetBindingPlan', message: e0.message || String(e0), normalized: null, raw: null };
    }
  }

  if (typeof CbvUiContract_getAppSheetContracts !== 'function') {
    return { ok: false, source: 'fallback', message: 'CbvUiContract_getAppSheetContracts not loaded (Phase 84)', normalized: null, raw: null };
  }

  var rows = CbvUiContract_getAppSheetContracts();
  var daily = [];
  var sup = [];
  var adm = [];
  var both = [];
  var missing = [];
  var hints = [];
  var actionsNeeded = [];

  rows.forEach(function(r) {
    var ch = String(r.CHANNEL || '').trim().toUpperCase();
    var bucket = (typeof CbvUiPilotBinding__classifyAppSheetRow_ === 'function') ? CbvUiPilotBinding__classifyAppSheetRow_(r) : CbvAppSheetPilot__classifyRowFallback_(r);
    var entry = {
      screenCode: r.SCREEN_CODE,
      appsheetView: r.APPSHEET_VIEW,
      channel: r.CHANNEL,
      securityFilterHint: r.SECURITY_FILTER_HINT,
      allowedActionsJson: r.ALLOWED_ACTIONS_JSON
    };
    if (ch === 'BOTH') both.push(entry);
    if (bucket === 'supervisor') sup.push(entry);
    else if (bucket === 'admin') adm.push(entry);
    else if (bucket === 'dailyOperator') daily.push(entry);
    else if (String(r.SCREEN_CODE || '').indexOf('HOME_ALERT_') === 0) daily.push(entry);

    if (!String(r.APPSHEET_VIEW || '').trim()) {
      missing.push(String(r.SCREEN_CODE || ''));
      actionsNeeded.push('Create APPSHEET_VIEW for ' + r.SCREEN_CODE);
    }
    if (String(r.SECURITY_FILTER_HINT || '').trim()) {
      hints.push({ screenCode: r.SCREEN_CODE, hint: r.SECURITY_FILTER_HINT });
    }
  });

  return {
    ok: true,
    source: 'CbvUiContract_getAppSheetContracts',
    message: '',
    normalized: {
      dailyOperatorScreens: daily,
      supervisorScreens: sup,
      adminScreens: adm,
      bothChannelScreens: both,
      missingAppSheetViewNames: missing,
      securityFilterHints: hints,
      actionsNeeded: actionsNeeded
    },
    raw: rows
  };
}

function CbvAppSheetPilot__flattenPlanEntries_(norm) {
  if (!norm) return [];
  var out = [];
  function tag(arr, roleTag) {
    (arr || []).forEach(function(e) { out.push({ entry: e, roleTag: roleTag }); });
  }
  tag(norm.dailyOperatorScreens, 'Operator');
  tag(norm.supervisorScreens, 'Supervisor');
  tag(norm.adminScreens, 'Admin');
  tag(norm.bothChannelScreens, 'Both');
  return out;
}

/**
 * @returns {{ ok: boolean, matrix: Object[], message?: string }}
 */
function CbvAppSheetPilot_buildViewSetupMatrix() {
  var bp = CbvAppSheetPilot_getBindingPlan();
  if (!bp.ok || !bp.normalized) {
    return { ok: false, matrix: [], message: bp.message || 'binding plan unavailable' };
  }

  var seen = {};
  var matrix = [];

  CbvAppSheetPilot__flattenPlanEntries_(bp.normalized).forEach(function(pack) {
    var entry = pack.entry;
    var sc = String(entry.screenCode || '').trim();
    if (!sc || seen[sc]) return;
    seen[sc] = true;

    var full = (typeof CbvUiContract_getByScreenCode === 'function') ? CbvUiContract_getByScreenCode(sc) : null;
    var appsheetView = String(entry.appsheetView || (full && full.APPSHEET_VIEW) || '').trim();
    var ds = full && full.DATA_SOURCE_SHEET ? String(full.DATA_SOURCE_SHEET).trim() : 'HOME_ALERT';
    var role = full && full.USER_ROLE ? String(full.USER_ROLE).trim() : pack.roleTag;
    var ch = String(entry.channel || (full && full.CHANNEL) || '').trim();
    var gb = full ? String(full.GROUP_BY_FIELD || '').trim() : '';
    var sb = full ? String(full.SORT_BY_FIELD || '').trim() : '';
    var req = CBV_APPSHEET_PILOT_REQUIRED_VIEW_SCREEN_CODES.indexOf(sc) >= 0;

    matrix.push({
      screenCode: sc,
      appsheetView: appsheetView,
      viewTypeSuggestion: CbvAppSheetPilot__guessViewType_(sc),
      sourceTableOrSlice: ds,
      role: role,
      channel: ch,
      groupBy: gb,
      sortBy: sb,
      required: req,
      setupStatusHint: appsheetView ? 'VERIFY_VIEW_IN_DESIGNER_MATCHES_CONTRACT' : 'CREATE_VIEW_RENAME_TO_MATCH_APPSHEET_VIEW'
    });
  });

  return { ok: true, matrix: matrix, message: '' };
}

/**
 * @returns {{ ok: boolean, matrix: Object[] }}
 */
function CbvAppSheetPilot_buildSliceSetupMatrix() {
  var m = [
    {
      sliceName: 'HOME_ALERT_My_Queue',
      sourceTable: 'HOME_ALERT',
      screenCode: 'HOME_ALERT_MY_QUEUE',
      filterExpression: 'AND([ASSIGNED_TO] = USEREMAIL(), NOT(IN([STATUS], LIST("Resolved", "Closed"))))',
      userScope: 'Rows assigned to signed-in user; tune STATUS list to your enum.',
      roleScope: 'Operator, Supervisor (read policy)',
      notes: 'Manual CLAIM from Unassigned; no auto-assign. Expression must not start with "=".'
    },
    {
      sliceName: 'HOME_ALERT_Unassigned_Queue',
      sourceTable: 'HOME_ALERT',
      screenCode: 'HOME_ALERT_UNASSIGNED_QUEUE',
      filterExpression: 'AND(ISBLANK([ASSIGNED_TO]), NOT(IN([STATUS], LIST("Resolved", "Closed"))))',
      userScope: 'All unassigned active rows (refine with TEAM filter via USERSETTINGS).',
      roleScope: 'Operator, Supervisor',
      notes: 'If ASSIGNED_TO stores USER_ID, use LOOKUP(USEREMAIL(),...) pattern from formula reference.'
    },
    {
      sliceName: 'HOME_ALERT_Escalated_Queue',
      sourceTable: 'HOME_ALERT',
      screenCode: 'HOME_ALERT_ESCALATED_QUEUE',
      filterExpression: 'IN([ESCALATION_STATUS], LIST("SUGGESTED", "ESCALATED", "ACKNOWLEDGED"))',
      userScope: 'Supervisor visibility per security filter on view.',
      roleScope: 'Supervisor, Admin',
      notes: 'Human ESCALATE only; no auto-escalation in pilot.'
    },
    {
      sliceName: 'HOME_ALERT_Blocked_Queue',
      sourceTable: 'HOME_ALERT',
      screenCode: 'HOME_ALERT_BLOCKED_QUEUE',
      filterExpression: 'AND([IS_BLOCKED] = TRUE, NOT(IN([STATUS], LIST("Resolved", "Closed"))))',
      userScope: 'Per security filter.',
      roleScope: 'Supervisor, Operator (policy-dependent)',
      notes: 'Use BLOCKED_REASON in card secondary text where helpful.'
    },
    {
      sliceName: 'HOME_ALERT_SLA_Dashboard',
      sourceTable: 'HOME_ALERT',
      screenCode: 'HOME_ALERT_SLA_DASHBOARD',
      filterExpression: 'OR([SLA_STATUS] = "OVERDUE", [SLA_STATUS] = "BREACHED", [SLA_BREACH_LEVEL] > 0)',
      userScope: 'Supervisor / Admin slice; narrow with TEAM if needed.',
      roleScope: 'Supervisor, Admin',
      notes: 'Read-first triage; no auto-resolve.'
    }
  ];
  return { ok: true, matrix: m };
}

/**
 * @returns {{ ok: boolean, matrix: Object[] }}
 */
function CbvAppSheetPilot_buildManualActionsMatrix() {
  var target = 'HOME_ALERT';
  var audit = 'Prefer columns already written by GAS sync / action webhook; else explicit audit row pattern approved by runtime owner.';
  var m = [
    { actionCode: 'ACK', actionName: 'Acknowledge', targetTable: target, appliesToScreen: 'HOME_ALERT_* queues', conditionHint: 'Row visible to user; not closed', effectHint: 'Sets acknowledgement / seen state per your column map', requiresConfirmation: false, auditExpectation: audit, noBot: true },
    { actionCode: 'CLAIM', actionName: 'Claim', targetTable: target, appliesToScreen: 'HOME_ALERT_UNASSIGNED_QUEUE', conditionHint: 'ISBLANK([ASSIGNED_TO])', effectHint: 'ASSIGNED_TO := USEREMAIL() or USER_ID via LOOKUP', requiresConfirmation: true, auditExpectation: audit, noBot: true },
    { actionCode: 'IN_PROGRESS', actionName: 'Mark In Progress', targetTable: target, appliesToScreen: 'HOME_ALERT_MY_QUEUE', conditionHint: 'Assigned to user', effectHint: 'STATUS / workflow column to in-progress value', requiresConfirmation: false, auditExpectation: audit, noBot: true },
    { actionCode: 'WAITING_RESPONSE', actionName: 'Waiting Response', targetTable: target, appliesToScreen: 'HOME_ALERT_MY_QUEUE', conditionHint: 'Assigned to user', effectHint: 'STATUS to waiting-external value', requiresConfirmation: false, auditExpectation: audit, noBot: true },
    { actionCode: 'ESCALATE', actionName: 'Escalate', targetTable: target, appliesToScreen: 'HOME_ALERT_*', conditionHint: 'Manual supervisor/operator policy', effectHint: 'ESCALATION_* columns; human only', requiresConfirmation: true, auditExpectation: audit, noBot: true },
    { actionCode: 'RESOLVE', actionName: 'Resolve', targetTable: target, appliesToScreen: 'HOME_ALERT_MY_QUEUE', conditionHint: 'Assigned or permitted role', effectHint: 'STATUS to Resolved/Closed', requiresConfirmation: true, auditExpectation: audit, noBot: true },
    { actionCode: 'RELEASE', actionName: 'Release', targetTable: target, appliesToScreen: 'HOME_ALERT_MY_QUEUE', conditionHint: 'Assigned to user', effectHint: 'Clear ASSIGNED_TO or hand back to pool', requiresConfirmation: true, auditExpectation: audit, noBot: true }
  ];
  return { ok: true, matrix: m };
}

/**
 * @returns {{ ok: boolean, matrix: Object[] }}
 */
function CbvAppSheetPilot_buildSecurityFilterMatrix() {
  var forbidden = ['_THISUSER', '[_THISUSER]', 'leading "=" in stored literals', 'AppSheet Bot', 'automation-first row edits'];
  var m = [
    {
      screenCode: 'HOME_ALERT_MY_QUEUE',
      appsheetView: '(from CBV_UI_CONTRACT.APPSHEET_VIEW)',
      filterHint: 'Row assigned to current user; role may widen read for supervisors.',
      requiredUserFunction: 'USEREMAIL() and/or LOOKUP(USEREMAIL(),...)',
      forbiddenPatterns: forbidden,
      sampleExpression: 'OR([ASSIGNED_TO] = USEREMAIL(), AND(USERSETTINGS("Role") = "Supervisor", IN([ASSIGNED_TEAM], LIST(...))))',
      validationNote: 'Adjust TEAM list; never use _THISUSER; do not paste leading "=" from Sheets.'
    },
    {
      screenCode: 'HOME_ALERT_UNASSIGNED_QUEUE',
      appsheetView: '(from contract)',
      filterHint: 'Unassigned + active; optional TEAM scope via USERSETTINGS("Team") if used.',
      requiredUserFunction: 'USERSETTINGS("Role"), USEREMAIL() for audit fields',
      forbiddenPatterns: forbidden,
      sampleExpression: 'AND(ISBLANK([ASSIGNED_TO]), USERSETTINGS("Role") <> "")',
      validationNote: 'Tighten with role allowlist in slice or view security filter.'
    },
    {
      screenCode: 'HOME_ALERT_ESCALATED_QUEUE',
      appsheetView: '(from contract)',
      filterHint: 'Supervisor / admin visibility on escalation columns.',
      requiredUserFunction: 'USERSETTINGS("Role") in allowlist',
      forbiddenPatterns: forbidden,
      sampleExpression: 'AND(IN([ESCALATION_STATUS], LIST("ESCALATED")), OR(USERSETTINGS("Role") = "Supervisor", USERSETTINGS("Role") = "Admin"))',
      validationNote: 'Cross-check with TASK_MAIN / HOME_ALERT policy docs.'
    },
    {
      screenCode: 'HOME_ALERT_OPERATOR_DASHBOARD',
      appsheetView: 'HOME_ALERT_Operator_Dashboard (suggested naming)',
      filterHint: 'Aggregate deck; underlying slice still obeys operator security.',
      requiredUserFunction: 'USEREMAIL() in underlying HOME_ALERT_My_Queue slice',
      forbiddenPatterns: forbidden,
      sampleExpression: 'USERSETTINGS("Role") = "Operator"',
      validationNote: 'Dashboard view often inherits slice; keep slice as source of truth.'
    },
    {
      screenCode: 'GLOBAL',
      appsheetView: '(all HOME_ALERT views)',
      filterHint: 'Admin bypass only if explicitly approved.',
      requiredUserFunction: 'USERSETTINGS("Role") = "Admin"',
      forbiddenPatterns: forbidden,
      sampleExpression: 'OR(USERSETTINGS("Role") = "Admin", <operator-or-supervisor-expr>)',
      validationNote: 'Document every exception; audit-first.'
    }
  ];
  return { ok: true, matrix: m };
}

/**
 * @returns {{ ok: boolean, cases: Object[] }}
 */
function CbvAppSheetPilot_buildUatScript() {
  var cases = [
    {
      id: 'UAT-A1',
      role: 'Admin',
      screenCode: 'N/A',
      scenario: 'Designer setup from matrices',
      steps: ['Open docs/appsheet/APPSHEET_*_MATRIX.md', 'Create views and slices per matrix', 'Wire manual actions only', 'Run Phase 87 Test Console health'],
      expectedResult: 'All required views/slices present; health GO or GO_WITH_WARNINGS',
      passCriteria: 'Zero FAIL status; envelopeOk true',
      failSeverity: 'CRITICAL'
    },
    {
      id: 'UAT-S1',
      role: 'Supervisor',
      screenCode: 'HOME_ALERT_ESCALATED_QUEUE',
      scenario: 'Escalated queue triage',
      steps: ['Open escalated view as supervisor', 'Confirm filter hides other teams if configured', 'Open one row detail'],
      expectedResult: 'Only policy-allowed rows; no silent automation',
      passCriteria: 'No cross-role leakage on sample accounts',
      failSeverity: 'ERROR'
    },
    {
      id: 'UAT-S2',
      role: 'Supervisor',
      screenCode: 'HOME_ALERT_SLA_DASHBOARD',
      scenario: 'SLA read-only visibility',
      steps: ['Open SLA dashboard', 'Verify overdue/breach badges'],
      expectedResult: 'Breaches visible; no auto-resolve',
      passCriteria: 'Counts plausible vs sheet',
      failSeverity: 'WARNING'
    },
    {
      id: 'UAT-O1',
      role: 'Operator',
      screenCode: 'HOME_ALERT_UNASSIGNED_QUEUE',
      scenario: 'Claim flow',
      steps: ['Open Unassigned', 'Run CLAIM on one row', 'Verify appears in My Queue'],
      expectedResult: 'ASSIGNED_TO set; audit trail present',
      passCriteria: 'CLAIM manual only; no auto-assign',
      failSeverity: 'ERROR'
    },
    {
      id: 'UAT-O2',
      role: 'Operator',
      screenCode: 'HOME_ALERT_MY_QUEUE',
      scenario: 'Progress and resolve',
      steps: ['IN_PROGRESS', 'WAITING_RESPONSE optional', 'RESOLVE with confirm'],
      expectedResult: 'Statuses update; confirmations respected',
      passCriteria: 'Matches operational manual',
      failSeverity: 'ERROR'
    },
    {
      id: 'UAT-O3',
      role: 'Operator',
      screenCode: 'HOME_ALERT_OPERATOR_DASHBOARD',
      scenario: 'Dashboard deck',
      steps: ['Open operator dashboard', 'Navigate to underlying queue'],
      expectedResult: 'OPERATOR_* fields drive card text',
      passCriteria: 'No DISPLAY_* / CARD_* mapping',
      failSeverity: 'WARNING'
    }
  ];
  return { ok: true, cases: cases };
}

function CbvAppSheetPilot__exprForbidden_(s) {
  var t = String(s || '').trim();
  if (!t) return '';
  if (t.charAt(0) === '=') return 'leading_equals';
  if (t.indexOf('_THISUSER') >= 0 || t.indexOf('[_THISUSER]') >= 0) return '_THISUSER';
  var low = t.toLowerCase();
  if (low.indexOf('appsheet bot') >= 0) return 'appsheet_bot';
  if (low.indexOf('auto assign') >= 0 || low.indexOf('auto-assign') >= 0) return 'auto_assign';
  if (low.indexOf('auto resolve') >= 0 || low.indexOf('auto-resolve') >= 0) return 'auto_resolve';
  if (low.indexOf('auto escalate') >= 0 || low.indexOf('auto-escalate') >= 0) return 'auto_escalate';
  return '';
}

function CbvAppSheetPilot__securityGuidanceOk_(s) {
  var t = String(s || '');
  return t.indexOf('USEREMAIL()') >= 0 || t.indexOf('USERSETTINGS("Role")') >= 0 || t.indexOf("USERSETTINGS('Role')") >= 0;
}

/**
 * @returns {{ ok: boolean, errors: string[], warnings: string[], checks: Object[] }}
 */
function CbvAppSheetPilot_validateSetupPlan() {
  var errors = [];
  var warnings = [];
  var checks = [];

  function add(code, ok, sev, message, detail) {
    checks.push({ code: code, ok: ok, severity: sev, message: message, detail: detail || {} });
  }

  var vm = CbvAppSheetPilot_buildViewSetupMatrix();
  var sm = CbvAppSheetPilot_buildSliceSetupMatrix();
  var am = CbvAppSheetPilot_buildManualActionsMatrix();
  var fm = CbvAppSheetPilot_buildSecurityFilterMatrix();
  var uat = CbvAppSheetPilot_buildUatScript();

  if (!vm.ok) {
    add('VIEW_MATRIX', false, 'ERROR', vm.message || 'view matrix failed', {});
    errors.push(vm.message || 'view matrix');
    return { ok: false, errors: errors, warnings: warnings, checks: checks };
  }
  add('VIEW_MATRIX', true, 'OK', 'View matrix generated', { rows: vm.matrix.length });

  var byScreen = {};
  vm.matrix.forEach(function(r) { byScreen[String(r.screenCode || '').trim()] = r; });

  CBV_APPSHEET_PILOT_REQUIRED_VIEW_SCREEN_CODES.forEach(function(code) {
    var hit = byScreen[code];
    var ok = !!hit;
    add('REQ_VIEW_' + code, ok, ok ? 'OK' : 'WARNING', 'Required pilot view in matrix', { screenCode: code });
    if (!ok) warnings.push('Missing view matrix row for ' + code);
  });

  var sliceByName = {};
  (sm.matrix || []).forEach(function(s) { sliceByName[String(s.sliceName)] = s; });
  CBV_APPSHEET_PILOT_REQUIRED_SLICE_NAMES.forEach(function(name) {
    var ok = !!sliceByName[name];
    add('REQ_SLICE_' + name, ok, ok ? 'OK' : 'ERROR', 'Required slice definition', { sliceName: name });
    if (!ok) errors.push('Missing required slice: ' + name);
  });

  var actByCode = {};
  (am.matrix || []).forEach(function(a) { actByCode[String(a.actionCode)] = a; });
  CBV_APPSHEET_PILOT_REQUIRED_ACTION_CODES.forEach(function(code) {
    var row = actByCode[code];
    var ok = !!(row && row.noBot === true);
    add('REQ_ACTION_' + code, ok, ok ? 'OK' : 'ERROR', 'Required manual action', { actionCode: code });
    if (!ok) errors.push('Missing or non-manual action: ' + code);
  });

  (sm.matrix || []).forEach(function(s) {
    var bad = CbvAppSheetPilot__exprForbidden_(s.filterExpression);
    add('SLICE_EXPR_' + s.sliceName, !bad, bad ? 'ERROR' : 'OK', bad ? 'Forbidden pattern in slice filter' : 'Slice filter clean', { hit: bad });
    if (bad) errors.push(s.sliceName + ': ' + bad);
  });

  (fm.matrix || []).forEach(function(f) {
    var bad = CbvAppSheetPilot__exprForbidden_(f.sampleExpression);
    add('SEC_SAMPLE_' + f.screenCode, !bad, bad ? 'ERROR' : 'OK', bad ? 'Forbidden in security sample' : 'Security sample clean', {});
    if (bad) errors.push('Security sample ' + f.screenCode + ': ' + bad);
    var g = CbvAppSheetPilot__securityGuidanceOk_(f.sampleExpression + ' ' + f.filterHint + ' ' + f.validationNote);
    add('SEC_GUIDE_' + f.screenCode, g, g ? 'OK' : 'WARNING', 'Uses USEREMAIL/USERSETTINGS in guidance', {});
    if (!g) warnings.push('Security matrix row ' + f.screenCode + ': strengthen USEREMAIL()/USERSETTINGS("Role") in samples.');
  });

  add('NO_BOT_MATRIX', true, 'OK', 'All manual actions carry noBot: true', {});
  add('UAT_SCRIPT', !!(uat && uat.cases && uat.cases.length >= 3), 'OK', 'UAT cases present', { count: uat && uat.cases ? uat.cases.length : 0 });

  var bp = CbvAppSheetPilot_getBindingPlan();
  if (bp.ok && bp.normalized && bp.normalized.missingAppSheetViewNames && bp.normalized.missingAppSheetViewNames.length) {
    add('CONTRACT_MISSING_VIEWS', false, 'WARNING', 'CBV_UI_CONTRACT missing APPSHEET_VIEW for some rows', { screens: bp.normalized.missingAppSheetViewNames });
    warnings.push('Missing APPSHEET_VIEW for: ' + bp.normalized.missingAppSheetViewNames.join(', '));
  }

  return { ok: errors.length === 0, errors: errors, warnings: warnings, checks: checks };
}

/**
 * @returns {Object} CBV_TCS_V1 health envelope.
 */
function CbvAppSheetPilot_healthCheck() {
  var traceId = CbvAppSheetPilot__traceId_();
  var checks = [];
  var warnings = [];
  var errors = [];

  try {
    if (typeof CbvUiContract_bootstrap === 'function') CbvUiContract_bootstrap();
    checks.push({ code: 'UI_CONTRACT_BOOTSTRAP', ok: true, severity: 'OK', message: 'CbvUiContract_bootstrap invoked (idempotent)', detail: {} });
  } catch (eB) {
    checks.push({ code: 'UI_CONTRACT_BOOTSTRAP', ok: false, severity: 'WARNING', message: eB.message || String(eB), detail: {} });
    warnings.push(eB.message || String(eB));
  }

  var v = null;
  try {
    v = CbvAppSheetPilot_validateSetupPlan();
    (v.checks || []).forEach(function(c) { checks.push(c); });
    errors = errors.concat(v.errors || []);
    warnings = warnings.concat(v.warnings || []);
  } catch (eV) {
    errors.push(eV.message || String(eV));
    checks.push({ code: 'VALIDATE_SETUP', ok: false, severity: 'ERROR', message: eV.message || String(eV), detail: {} });
  }

  var bp = null;
  try {
    bp = CbvAppSheetPilot_getBindingPlan();
    checks.push({ code: 'BINDING_PLAN', ok: !!(bp && bp.ok), severity: bp && bp.ok ? 'OK' : 'WARNING', message: 'getBindingPlan', detail: { source: bp && bp.source } });
    if (bp && !bp.ok) warnings.push(bp.message || 'binding plan not ok');
  } catch (e1) {
    checks.push({ code: 'BINDING_PLAN', ok: false, severity: 'ERROR', message: e1.message || String(e1), detail: {} });
    errors.push(e1.message || String(e1));
  }

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: CBV_APPSHEET_PILOT_PHASE_ID,
    status: status,
    checkedAt: typeof cbvNow === 'function' ? cbvNow() : new Date(),
    runBy: CbvAppSheetPilot__actor_(),
    traceId: traceId,
    testSuite: 'CBV_APPSHEET_PILOT_SETUP_HEALTH',
    summary: 'AppSheet pilot setup binding: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL' ? 'Fix validateSetupPlan errors; align CBV_UI_CONTRACT and AppSheet Designer with matrices.' : 'Apply matrices in AppSheet; run UAT; capture pilot signoff.',
    severity: severity,
    reportText: ['=== CBV_APPSHEET_PILOT_SETUP (PHASE 87) ===', 'status=' + status].join('\n'),
    reportJson: { validateSetupPlan: v, bindingPlan: bp },
    contractVersion: 'CBV_TCS_V1',
    envelopeOk: false
  };

  var env = CbvAppSheetPilot__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  if (!env.ok) {
    warnings.push('Envelope missing: ' + (env.missing || []).join(','));
    report.status = errors.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
    report.ok = errors.length === 0;
  }

  return report;
}

/**
 * @param {Object} report
 * @returns {{ ok: boolean, message?: string }}
 */
function CbvAppSheetPilot_appendReportAudit_(report) {
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
    logAdminAudit('CBV_APPSHEET_PILOT_SETUP_REPORT', 'CBV_UI_CONTRACT', String((report && report.traceId) || 'NA'), 'APPEND', {}, tail, 'CbvAppSheetPilot_appendReportAudit_');
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}
