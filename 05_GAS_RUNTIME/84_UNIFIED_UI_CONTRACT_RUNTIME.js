/**
 * PHASE_85 — CBV Unified UI Contract (AppSheet + WebApp metadata layer)
 *
 * Runtime-first, manual-first, audit-friendly. Does not modify HOME_ALERT operator columns.
 * No AppSheet Bot, no auto-escalation, no destructive migration.
 */

var CBV_UI_CONTRACT_PHASE_ID = 'PHASE_85_UNIFIED_UI_CONTRACT';
var CBV_UI_CONTRACT_VERSION = 'CBV_UI_CONTRACT_V1';

var CBV_UI_CONTRACT_CHANNELS = { APPSHEET: 'APPSHEET', WEBAPP: 'WEBAPP', BOTH: 'BOTH' };

var CBV_UI_CONTRACT_SCREEN_TYPES = [
  'DASHBOARD', 'QUEUE', 'DETAIL', 'FORM', 'KANBAN', 'TIMELINE', 'HEALTH', 'TEST_CONSOLE', 'REPORT_VIEWER'
];

/** Baseline SCREEN_CODE values that must exist after bootstrap (idempotent seed). */
var CBV_UI_CONTRACT_BASELINE_SCREEN_CODES = [
  'HOME_ALERT_OPERATOR_DASHBOARD',
  'HOME_ALERT_MY_QUEUE',
  'HOME_ALERT_UNASSIGNED_QUEUE',
  'HOME_ALERT_ESCALATED_QUEUE',
  'HOME_ALERT_BLOCKED_QUEUE',
  'HOME_ALERT_SLA_DASHBOARD',
  'HOME_ALERT_TIMELINE',
  'HOME_ALERT_KANBAN',
  'RUNTIME_HEALTH_DASHBOARD',
  'CBV_TEST_CONSOLE',
  'REPORT_HANDOFF_VIEWER',
  'ADMIN_REFERENCE_VIEWER'
];

var CBV_UI_CONTRACT_FORBIDDEN_FIELD_PREFIXES = ['DISPLAY_', 'CARD_', 'UX_', 'DESKTOP_'];

function CbvUiContract__sheetName_() {
  return (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.CBV_UI_CONTRACT)
    ? CBV_CONFIG.SHEETS.CBV_UI_CONTRACT
    : 'CBV_UI_CONTRACT';
}

function CbvUiContract__traceId_() {
  return (typeof HomeAlert_newTraceId_ === 'function') ? HomeAlert_newTraceId_() : ('UIC_' + Utilities.getUuid());
}

function CbvUiContract__actor_() {
  return (typeof HomeAlert_actorId_ === 'function') ? HomeAlert_actorId_() : (typeof cbvUser === 'function' ? cbvUser() : '');
}

function CbvUiContract__isTruthy_(v) {
  if (v === true || v === 1) return true;
  var s = String(v || '').trim().toUpperCase();
  return s === 'TRUE' || s === 'YES' || s === '1' || s === 'Y';
}

function CbvUiContract__headersFromManifest_() {
  var m = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.CBV_UI_CONTRACT)
    ? CBV_SCHEMA_MANIFEST.CBV_UI_CONTRACT
    : null;
  cbvAssert(m && m.length, 'CBV_SCHEMA_MANIFEST.CBV_UI_CONTRACT missing');
  return m;
}

function CbvUiContract__ensureSheet_() {
  var ss = SpreadsheetApp.getActive();
  var name = CbvUiContract__sheetName_();
  var sh = ss.getSheetByName(name);
  var created = false;
  if (!sh) {
    sh = ss.insertSheet(name);
    created = true;
  }
  var expected = CbvUiContract__headersFromManifest_();
  var cur = sh.getLastColumn() > 0 ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
  if (cur.length < expected.length) {
    sh.getRange(1, 1, 1, expected.length).setValues([expected]);
  }
  return { sheet: sh, created: created, name: name };
}

function CbvUiContract__rowObjects_() {
  var ens = CbvUiContract__ensureSheet_();
  var sh = ens.sheet;
  if (sh.getLastRow() < 2) return [];
  return _rows(sh);
}

function CbvUiContract__isHomeAlertScreenRow_(r) {
  return String(r.SCREEN_CODE || '').indexOf('HOME_ALERT_') === 0;
}

function CbvUiContract__baselineSeedRows_(actor, now) {
  var opPrimary = 'OPERATOR_PRIMARY_TEXT';
  var opSec = 'OPERATOR_SECONDARY_TEXT';
  var opMeta = 'OPERATOR_META_TEXT';
  var opNext = 'OPERATOR_NEXT_ACTION';
  var opGrp = 'OPERATOR_DASHBOARD_GROUP';
  var opSort = 'OPERATOR_DASHBOARD_SORT';
  function haRow(id, screenCode, screenName, channel, screenType, view, route, order, notes, pilot, actionsJson, deeplink, secHint) {
    return {
      UI_CONTRACT_ID: id,
      SCREEN_CODE: screenCode,
      SCREEN_NAME: screenName,
      MODULE_CODE: 'HOME_ALERT',
      DOMAIN_CODE: 'OPERATIONS',
      USER_ROLE: '*',
      TEAM_CODE: '*',
      CHANNEL: channel,
      SCREEN_TYPE: screenType,
      DATA_SOURCE_SHEET: 'HOME_ALERT',
      DATA_SOURCE_VIEW: '',
      PRIMARY_KEY_FIELD: 'ALERT_ID',
      PRIMARY_TEXT_FIELD: opPrimary,
      SECONDARY_TEXT_FIELD: opSec,
      META_TEXT_FIELD: opMeta,
      NEXT_ACTION_FIELD: opNext,
      GROUP_BY_FIELD: opGrp,
      SORT_BY_FIELD: opSort,
      SORT_DIRECTION: 'ASC',
      WEBAPP_ROUTE: route,
      APPSHEET_VIEW: view,
      APPSHEET_DEEPLINK_EXPR: deeplink,
      ALLOWED_ACTIONS_JSON: actionsJson,
      PERMISSION_RULE_CODE: 'HOME_ALERT_OPERATOR_BASE',
      SECURITY_FILTER_HINT: secHint,
      SLA_BADGE_FIELD: 'SLA_STATUS',
      STATUS_FIELD: 'STATUS',
      PRIORITY_FIELD: 'PRIORITY_SCORE',
      IS_ENABLED: true,
      IS_PILOT_READY: pilot,
      DISPLAY_ORDER: order,
      NOTES: notes,
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      CONTRACT_VERSION: CBV_UI_CONTRACT_VERSION
    };
  }

  return [
    haRow('UIC_HOME_ALERT_OPERATOR_DASHBOARD', 'HOME_ALERT_OPERATOR_DASHBOARD', 'HOME_ALERT — Operator dashboard', 'BOTH', 'DASHBOARD',
      'HOME_ALERT_Operator_Dashboard', '/home-alert/operator-dashboard',
      10, 'Phase85: main operator shell (AppSheet) + richer workspace (WebApp).', true,
      '["ACK","IN_PROGRESS","WAITING_RESPONSE","ESCALATE","RESOLVE","CLAIM","RELEASE"]',
      'LINKTOVIEW("HOME_ALERT_Operator_Dashboard")',
      'Row-level security filter must respect role + assignment; use USEREMAIL() and USERSETTINGS("Role"); never _THISUSER.'),
    haRow('UIC_HOME_ALERT_MY_QUEUE', 'HOME_ALERT_MY_QUEUE', 'HOME_ALERT — My queue', 'BOTH', 'QUEUE',
      'HOME_ALERT_My_Queue', '/home-alert/my-queue',
      20, 'Phase85: assigned-to-me slice.', true,
      '["ACK","IN_PROGRESS","WAITING_RESPONSE","ESCALATE","RESOLVE"]',
      'LINKTOVIEW("HOME_ALERT_My_Queue")',
      'Typical slice: ASSIGNED_TO = USEREMAIL() (bind exact expression in AppSheet).'),
    haRow('UIC_HOME_ALERT_UNASSIGNED_QUEUE', 'HOME_ALERT_UNASSIGNED_QUEUE', 'HOME_ALERT — Unassigned queue', 'APPSHEET', 'QUEUE',
      'HOME_ALERT_Unassigned_Queue', '',
      30, 'Phase85: AppSheet-first triage; WebApp optional later.', true,
      '["CLAIM","ACK"]',
      'LINKTOVIEW("HOME_ALERT_Unassigned_Queue")',
      'Slice: unassigned + active states only.'),
    haRow('UIC_HOME_ALERT_ESCALATED_QUEUE', 'HOME_ALERT_ESCALATED_QUEUE', 'HOME_ALERT — Escalated queue', 'BOTH', 'QUEUE',
      'HOME_ALERT_Escalated_Queue', '/home-alert/escalated',
      40, 'Phase85: human escalation visibility; no auto-escalate.', true,
      '["ACK","IN_PROGRESS","RESOLVE","DE_ESCALATE"]',
      'LINKTOVIEW("HOME_ALERT_Escalated_Queue")',
      'Filter on ESCALATION_STATUS / STATUS per your slice spec.'),
    haRow('UIC_HOME_ALERT_BLOCKED_QUEUE', 'HOME_ALERT_BLOCKED_QUEUE', 'HOME_ALERT — Blocked queue', 'BOTH', 'QUEUE',
      'HOME_ALERT_Blocked_Queue', '/home-alert/blocked',
      50, 'Phase85: blocked/stuck visibility.', true,
      '["ACK","IN_PROGRESS","RESOLVE"]',
      'LINKTOVIEW("HOME_ALERT_Blocked_Queue")',
      'Use IS_BLOCKED / BLOCKED_REASON columns.'),
    haRow('UIC_HOME_ALERT_SLA_DASHBOARD', 'HOME_ALERT_SLA_DASHBOARD', 'HOME_ALERT — SLA dashboard', 'BOTH', 'DASHBOARD',
      'HOME_ALERT_SLA_Dashboard', '/home-alert/sla',
      60, 'Phase85: SLA badges from SLA_* fields; optional tie-in to HOME_ALERT_SLA_METRICS sheet.', true,
      '["ACK","IN_PROGRESS","RESOLVE"]',
      'LINKTOVIEW("HOME_ALERT_SLA_Dashboard")',
      'Prefer SLA_STATUS / SLA_BREACH_LEVEL for badges.'),
    haRow('UIC_HOME_ALERT_TIMELINE', 'HOME_ALERT_TIMELINE', 'HOME_ALERT — Timeline (WebApp)', 'WEBAPP', 'TIMELINE',
      '', '/home-alert/timeline',
      70, 'Phase85: WebApp custom visualization; same HOME_ALERT row contract.', false,
      '["ACK","IN_PROGRESS","RESOLVE"]',
      '',
      'WebApp reads HOME_ALERT; expressions N/A.'),
    haRow('UIC_HOME_ALERT_KANBAN', 'HOME_ALERT_KANBAN', 'HOME_ALERT — Kanban (WebApp)', 'WEBAPP', 'KANBAN',
      '', '/home-alert/kanban',
      80, 'Phase85: WebApp board; columns map to STATUS / queue fields.', false,
      '["ACK","IN_PROGRESS","WAITING_RESPONSE","ESCALATE","RESOLVE"]',
      '',
      'Drag-drop must remain human-in-the-loop; no auto-resolve.'),
    {
      UI_CONTRACT_ID: 'UIC_RUNTIME_HEALTH_DASHBOARD',
      SCREEN_CODE: 'RUNTIME_HEALTH_DASHBOARD',
      SCREEN_NAME: 'Runtime — Health dashboard',
      MODULE_CODE: 'SYSTEM',
      DOMAIN_CODE: 'RUNTIME',
      USER_ROLE: 'ADMIN',
      TEAM_CODE: '*',
      CHANNEL: 'WEBAPP',
      SCREEN_TYPE: 'HEALTH',
      DATA_SOURCE_SHEET: 'SYSTEM_HEALTH_LOG',
      DATA_SOURCE_VIEW: '',
      PRIMARY_KEY_FIELD: 'RUN_ID',
      PRIMARY_TEXT_FIELD: 'SYSTEM_HEALTH',
      SECONDARY_TEXT_FIELD: 'SUMMARY_JSON',
      META_TEXT_FIELD: 'RUN_AT',
      NEXT_ACTION_FIELD: 'MUST_FIX_NOW',
      GROUP_BY_FIELD: 'SYSTEM_HEALTH',
      SORT_BY_FIELD: 'RUN_AT',
      SORT_DIRECTION: 'DESC',
      WEBAPP_ROUTE: '/runtime/health',
      APPSHEET_VIEW: '',
      APPSHEET_DEEPLINK_EXPR: '',
      ALLOWED_ACTIONS_JSON: '["OPEN_ROW","EXPORT_JSON"]',
      PERMISSION_RULE_CODE: 'ADMIN_RUNTIME_READ',
      SECURITY_FILTER_HINT: 'Admin-only; no PII in exported JSON without review.',
      SLA_BADGE_FIELD: '',
      STATUS_FIELD: 'SYSTEM_HEALTH',
      PRIORITY_FIELD: 'CRITICAL_COUNT',
      IS_ENABLED: true,
      IS_PILOT_READY: false,
      DISPLAY_ORDER: 90,
      NOTES: 'Phase85: aggregates from SYSTEM_HEALTH_LOG.',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      CONTRACT_VERSION: CBV_UI_CONTRACT_VERSION
    },
    {
      UI_CONTRACT_ID: 'UIC_CBV_TEST_CONSOLE',
      SCREEN_CODE: 'CBV_TEST_CONSOLE',
      SCREEN_NAME: 'CBV — Test console hub',
      MODULE_CODE: 'SYSTEM',
      DOMAIN_CODE: 'QA',
      USER_ROLE: 'ADMIN',
      TEAM_CODE: '*',
      CHANNEL: 'WEBAPP',
      SCREEN_TYPE: 'TEST_CONSOLE',
      DATA_SOURCE_SHEET: 'CBV_UI_CONTRACT',
      DATA_SOURCE_VIEW: '',
      PRIMARY_KEY_FIELD: 'UI_CONTRACT_ID',
      PRIMARY_TEXT_FIELD: 'SCREEN_NAME',
      SECONDARY_TEXT_FIELD: 'SCREEN_CODE',
      META_TEXT_FIELD: 'CHANNEL',
      NEXT_ACTION_FIELD: 'NOTES',
      GROUP_BY_FIELD: 'MODULE_CODE',
      SORT_BY_FIELD: 'DISPLAY_ORDER',
      SORT_DIRECTION: 'ASC',
      WEBAPP_ROUTE: '/cbv/test-console',
      APPSHEET_VIEW: '',
      APPSHEET_DEEPLINK_EXPR: '',
      ALLOWED_ACTIONS_JSON: '["RUN_SUITE","COPY_REPORT","SHOW_HANDOFF"]',
      PERMISSION_RULE_CODE: 'ADMIN_QA',
      SECURITY_FILTER_HINT: 'Isolated from operational menus in Sheets UI.',
      SLA_BADGE_FIELD: '',
      STATUS_FIELD: '',
      PRIORITY_FIELD: 'DISPLAY_ORDER',
      IS_ENABLED: true,
      IS_PILOT_READY: false,
      DISPLAY_ORDER: 100,
      NOTES: 'Phase85: Sheets menu 🧪 CBV Test Console remains canonical until WebApp hub ships.',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      CONTRACT_VERSION: CBV_UI_CONTRACT_VERSION
    },
    {
      UI_CONTRACT_ID: 'UIC_REPORT_HANDOFF_VIEWER',
      SCREEN_CODE: 'REPORT_HANDOFF_VIEWER',
      SCREEN_NAME: 'Reports — Handoff viewer',
      MODULE_CODE: 'DOCS',
      DOMAIN_CODE: 'GOVERNANCE',
      USER_ROLE: 'ADMIN',
      TEAM_CODE: '*',
      CHANNEL: 'WEBAPP',
      SCREEN_TYPE: 'REPORT_VIEWER',
      DATA_SOURCE_SHEET: 'SYSTEM_REGISTRY',
      DATA_SOURCE_VIEW: '',
      PRIMARY_KEY_FIELD: 'REGISTRY_ID',
      PRIMARY_TEXT_FIELD: 'RESOURCE_NAME',
      SECONDARY_TEXT_FIELD: 'REGISTRY_CODE',
      META_TEXT_FIELD: 'RESOURCE_REF',
      NEXT_ACTION_FIELD: 'NOTE',
      GROUP_BY_FIELD: 'REGISTRY_TYPE',
      SORT_BY_FIELD: 'UPDATED_AT',
      SORT_DIRECTION: 'DESC',
      WEBAPP_ROUTE: '/reports/handoff',
      APPSHEET_VIEW: '',
      APPSHEET_DEEPLINK_EXPR: '',
      ALLOWED_ACTIONS_JSON: '["OPEN","LINK_OUT"]',
      PERMISSION_RULE_CODE: 'ADMIN_READ',
      SECURITY_FILTER_HINT: 'Append-only artifacts live in repo brain; registry may hold pointers only.',
      SLA_BADGE_FIELD: '',
      STATUS_FIELD: 'STATUS',
      PRIORITY_FIELD: '',
      IS_ENABLED: true,
      IS_PILOT_READY: false,
      DISPLAY_ORDER: 110,
      NOTES: 'Phase85: read-only consolidation; never delete prior handoff files.',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      CONTRACT_VERSION: CBV_UI_CONTRACT_VERSION
    },
    {
      UI_CONTRACT_ID: 'UIC_ADMIN_REFERENCE_VIEWER',
      SCREEN_CODE: 'ADMIN_REFERENCE_VIEWER',
      SCREEN_NAME: 'Admin — Reference viewer',
      MODULE_CODE: 'REF',
      DOMAIN_CODE: 'CONFIG',
      USER_ROLE: 'ADMIN',
      TEAM_CODE: '*',
      CHANNEL: 'WEBAPP',
      SCREEN_TYPE: 'REPORT_VIEWER',
      DATA_SOURCE_SHEET: 'ENUM_DICTIONARY',
      DATA_SOURCE_VIEW: '',
      PRIMARY_KEY_FIELD: 'ID',
      PRIMARY_TEXT_FIELD: 'ENUM_VALUE',
      SECONDARY_TEXT_FIELD: 'DISPLAY_TEXT',
      META_TEXT_FIELD: 'ENUM_GROUP',
      NEXT_ACTION_FIELD: 'NOTE',
      GROUP_BY_FIELD: 'ENUM_GROUP',
      SORT_BY_FIELD: 'SORT_ORDER',
      SORT_DIRECTION: 'ASC',
      WEBAPP_ROUTE: '/admin/reference',
      APPSHEET_VIEW: '',
      APPSHEET_DEEPLINK_EXPR: '',
      ALLOWED_ACTIONS_JSON: '["SEARCH","EXPORT_CSV"]',
      PERMISSION_RULE_CODE: 'ADMIN_REF_READ',
      SECURITY_FILTER_HINT: 'Align with REF-A; no secrets in cells.',
      SLA_BADGE_FIELD: '',
      STATUS_FIELD: 'IS_ACTIVE',
      PRIORITY_FIELD: '',
      IS_ENABLED: true,
      IS_PILOT_READY: false,
      DISPLAY_ORDER: 120,
      NOTES: 'Phase85: WebApp explorer over ENUM_DICTIONARY / registry-backed refs.',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      CONTRACT_VERSION: CBV_UI_CONTRACT_VERSION
    }
  ];
}

/**
 * Creates CBV_UI_CONTRACT sheet (headers) and appends missing baseline rows only.
 * @returns {{ ok: boolean, createdSheet: boolean, seeded: number, skipped: number, name: string }}
 */
function CbvUiContract_bootstrap() {
  var ens = CbvUiContract__ensureSheet_();
  var name = ens.name;
  var actor = CbvUiContract__actor_();
  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var existing = CbvUiContract__rowObjects_();
  var have = {};
  existing.forEach(function(r) {
    var c = String(r.SCREEN_CODE || '').trim();
    if (c) have[c] = true;
  });
  var seeds = CbvUiContract__baselineSeedRows_(actor, now);
  var seeded = 0;
  seeds.forEach(function(rec) {
    var code = String(rec.SCREEN_CODE || '').trim();
    if (!code || have[code]) return;
    _appendRecord(name, rec);
    have[code] = true;
    seeded++;
  });
  return { ok: true, createdSheet: ens.created, seeded: seeded, skipped: seeds.length - seeded, name: name };
}

function CbvUiContract_getAll() {
  CbvUiContract__ensureSheet_();
  return CbvUiContract__rowObjects_().filter(function(r) {
    return CbvUiContract__isTruthy_(r.IS_ENABLED);
  });
}

function CbvUiContract_getByScreenCode(screenCode) {
  var c = String(screenCode || '').trim();
  if (!c) return null;
  var rows = CbvUiContract__rowObjects_();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].SCREEN_CODE || '').trim() === c) return rows[i];
  }
  return null;
}

function CbvUiContract_getByChannel(channel) {
  var ch = String(channel || '').trim().toUpperCase();
  return CbvUiContract_getAll().filter(function(r) {
    var v = String(r.CHANNEL || '').trim().toUpperCase();
    return v === ch || v === 'BOTH';
  });
}

function CbvUiContract_getAppSheetContracts() {
  return CbvUiContract_getAll().filter(function(r) {
    var v = String(r.CHANNEL || '').trim().toUpperCase();
    return v === 'APPSHEET' || v === 'BOTH';
  });
}

function CbvUiContract_getWebAppContracts() {
  return CbvUiContract_getAll().filter(function(r) {
    var v = String(r.CHANNEL || '').trim().toUpperCase();
    return v === 'WEBAPP' || v === 'BOTH';
  });
}

function CbvUiContract__fieldUsesForbiddenPrefix_(val) {
  var s = String(val || '').trim();
  if (!s) return '';
  for (var i = 0; i < CBV_UI_CONTRACT_FORBIDDEN_FIELD_PREFIXES.length; i++) {
    var p = CBV_UI_CONTRACT_FORBIDDEN_FIELD_PREFIXES[i];
    if (s.indexOf(p) === 0) return p;
  }
  return '';
}

function CbvUiContract__scanExprFields_(r, errors, warnings) {
  var expr = String(r.APPSHEET_DEEPLINK_EXPR || '').trim();
  if (expr.charAt(0) === '=') {
    errors.push('SCREEN ' + r.SCREEN_CODE + ': APPSHEET_DEEPLINK_EXPR must not start with "="');
  }
  var pack = [r.APPSHEET_DEEPLINK_EXPR, r.SECURITY_FILTER_HINT].join(' ');
  if (pack.indexOf('_THISUSER') >= 0 || pack.indexOf('[_THISUSER]') >= 0) {
    errors.push('SCREEN ' + r.SCREEN_CODE + ': forbidden _THISUSER in AppSheet-oriented fields');
  }
}

function CbvUiContract__validateOperatorMapping_(r, errors) {
  if (!CbvUiContract__isHomeAlertScreenRow_(r)) return;
  var expect = {
    PRIMARY_TEXT_FIELD: 'OPERATOR_PRIMARY_TEXT',
    SECONDARY_TEXT_FIELD: 'OPERATOR_SECONDARY_TEXT',
    META_TEXT_FIELD: 'OPERATOR_META_TEXT',
    NEXT_ACTION_FIELD: 'OPERATOR_NEXT_ACTION',
    GROUP_BY_FIELD: 'OPERATOR_DASHBOARD_GROUP',
    SORT_BY_FIELD: 'OPERATOR_DASHBOARD_SORT'
  };
  Object.keys(expect).forEach(function(k) {
    if (String(r[k] || '').trim() !== expect[k]) {
      errors.push('SCREEN ' + r.SCREEN_CODE + ': ' + k + ' must be ' + expect[k] + ' for HOME_ALERT_* contracts');
    }
  });
}

function CbvUiContract__validateForbiddenMapping_(r, errors) {
  var keys = [
    'PRIMARY_TEXT_FIELD', 'SECONDARY_TEXT_FIELD', 'META_TEXT_FIELD', 'NEXT_ACTION_FIELD',
    'GROUP_BY_FIELD', 'SORT_BY_FIELD'
  ];
  keys.forEach(function(k) {
    var hit = CbvUiContract__fieldUsesForbiddenPrefix_(r[k]);
    if (hit) errors.push('SCREEN ' + r.SCREEN_CODE + ': forbidden legacy prefix in ' + k + ' (' + hit + ')');
  });
}

/**
 * @returns {{ ok: boolean, errors: string[], warnings: string[], checks: Object[] }}
 */
function CbvUiContract_validate() {
  var errors = [];
  var warnings = [];
  var checks = [];

  function add(code, ok, sev, message, detail) {
    checks.push({ code: code, ok: ok, severity: sev, message: message, detail: detail || {} });
  }

  try {
    CbvUiContract__ensureSheet_();
    add('SHEET', true, 'OK', 'CBV_UI_CONTRACT present', {});
  } catch (e) {
    errors.push(e.message || String(e));
    add('SHEET', false, 'ERROR', String(e.message || e), {});
    return { ok: false, errors: errors, warnings: warnings, checks: checks };
  }

  var expected = CbvUiContract__headersFromManifest_();
  try {
    var h = _headers(_sheet(CbvUiContract__sheetName_()));
    var miss = expected.filter(function(c) { return h.indexOf(c) === -1; });
    add('HEADERS', miss.length === 0, miss.length ? 'ERROR' : 'OK', 'required headers', { missing: miss });
    if (miss.length) errors = errors.concat(miss.map(function(m) { return 'Missing header ' + m; }));
  } catch (e2) {
    add('HEADERS', false, 'ERROR', e2.message || String(e2), {});
    errors.push(e2.message || String(e2));
  }

  var rows = CbvUiContract__rowObjects_();
  var codes = {};
  rows.forEach(function(r) {
    codes[String(r.SCREEN_CODE || '').trim()] = true;
  });
  CBV_UI_CONTRACT_BASELINE_SCREEN_CODES.forEach(function(c) {
    var ok = !!codes[c];
    if (!ok) errors.push('Missing baseline SCREEN_CODE ' + c);
    add('BASELINE_' + c, ok, ok ? 'OK' : 'ERROR', 'baseline screen', { screenCode: c });
  });

  rows.forEach(function(r) {
    var sc0 = String(r.SCREEN_CODE || '').trim();
    if (!sc0) return;
    var ch = String(r.CHANNEL || '').trim().toUpperCase();
    if (['APPSHEET', 'WEBAPP', 'BOTH'].indexOf(ch) < 0) {
      errors.push('SCREEN ' + r.SCREEN_CODE + ': invalid CHANNEL ' + ch);
    }
    var st = String(r.SCREEN_TYPE || '').trim().toUpperCase();
    if (CBV_UI_CONTRACT_SCREEN_TYPES.indexOf(st) < 0) {
      errors.push('SCREEN ' + r.SCREEN_CODE + ': invalid SCREEN_TYPE ' + st);
    }
    CbvUiContract__validateOperatorMapping_(r, errors);
    CbvUiContract__validateForbiddenMapping_(r, errors);
    CbvUiContract__scanExprFields_(r, errors, warnings);
  });

  return { ok: errors.length === 0, errors: errors, warnings: warnings, checks: checks };
}

function CbvUiContract__validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

/**
 * @returns {Object} Standard CBV health / QA envelope (see CBV Operational Ecosystem Standard V1 test console contract).
 */
function CbvUiContract_healthCheck() {
  var traceId = CbvUiContract__traceId_();
  var checks = [];
  var warnings = [];
  var errors = [];
  var v = null;
  var boot = null;

  try {
    boot = CbvUiContract_bootstrap();
    var bootOk = !!boot && boot.ok === true;
    checks.push({
      code: 'BOOTSTRAP_IDEMPOTENT',
      ok: bootOk,
      severity: bootOk ? 'OK' : 'ERROR',
      message: 'UI Contract bootstrap is idempotent.',
      detail: boot || null
    });
  } catch (e2) {
    checks.push({
      code: 'BOOTSTRAP_IDEMPOTENT',
      ok: false,
      severity: 'ERROR',
      message: String(e2.message || e2),
      detail: {}
    });
    errors.push(e2.message || String(e2));
  }

  try {
    v = CbvUiContract_validate();
    (v.checks || []).forEach(function(c) {
      checks.push(c);
    });
    if (!v.ok) errors = errors.concat(v.errors || []);
    warnings = warnings.concat(v.warnings || []);
  } catch (e) {
    var ev = e.message || String(e);
    errors.push(ev);
    checks.push({
      code: 'VALIDATE',
      ok: false,
      severity: 'ERROR',
      message: 'CbvUiContract_validate threw',
      detail: { error: ev }
    });
  }

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: CBV_UI_CONTRACT_PHASE_ID,
    status: status,
    checkedAt: typeof cbvNow === 'function' ? cbvNow() : new Date(),
    runBy: CbvUiContract__actor_(),
    traceId: traceId,
    testSuite: 'CBV_UI_CONTRACT_HEALTH',
    summary: 'CBV_UI_CONTRACT health: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL' ? 'Run CbvUiContract_bootstrap(); fix validation errors; rerun CbvUiContract_healthCheck().' : 'Wire AppSheet views and WebApp routes from CBV_UI_CONTRACT rows; keep OPERATOR_* bindings.',
    severity: severity,
    reportText: ['=== CBV_UI_CONTRACT HEALTH ===', 'status=' + status].join('\n'),
    reportJson: { validate: v, bootstrap: boot },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: false
  };
  var env = CbvUiContract__validateEnvelope_(report);
  report.envelopeOk = env.ok;
  if (!env.ok) {
    warnings.push('Envelope missing: ' + (env.missing || []).join(','));
    report.status = errors.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
    report.ok = errors.length === 0;
  }
  return report;
}

function CbvUiContract_generatePilotMatrix() {
  var rows = CbvUiContract_getAll();
  var matrix = {
    appSheetDaily: [],
    webAppAdvanced: [],
    both: [],
    notPilotReady: []
  };
  rows.forEach(function(r) {
    var ch = String(r.CHANNEL || '').trim().toUpperCase();
    var entry = {
      screenCode: r.SCREEN_CODE,
      screenName: r.SCREEN_NAME,
      channel: ch,
      screenType: r.SCREEN_TYPE,
      pilotReady: CbvUiContract__isTruthy_(r.IS_PILOT_READY)
    };
    if (!entry.pilotReady) matrix.notPilotReady.push(entry);
    if (ch === 'BOTH') matrix.both.push(entry);
    else if (ch === 'APPSHEET') matrix.appSheetDaily.push(entry);
    else if (ch === 'WEBAPP') matrix.webAppAdvanced.push(entry);
  });
  return { ok: true, generatedAt: typeof cbvNow === 'function' ? cbvNow() : new Date(), matrix: matrix, contractVersion: CBV_UI_CONTRACT_VERSION };
}

function CbvUiContract_buildWebAppRouteMap() {
  var routes = CbvUiContract_getWebAppContracts().map(function(r) {
    return {
      screenCode: r.SCREEN_CODE,
      webAppRoute: r.WEBAPP_ROUTE,
      screenType: r.SCREEN_TYPE,
      dataSourceSheet: r.DATA_SOURCE_SHEET,
      primaryKeyField: r.PRIMARY_KEY_FIELD,
      moduleCode: r.MODULE_CODE
    };
  }).filter(function(x) { return String(x.webAppRoute || '').trim() !== ''; });
  return { ok: true, routes: routes, contractVersion: CBV_UI_CONTRACT_VERSION };
}

function CbvUiContract_buildAppSheetGuideData() {
  var items = CbvUiContract_getAppSheetContracts().map(function(r) {
    return {
      screenCode: r.SCREEN_CODE,
      appsheetView: r.APPSHEET_VIEW,
      deeplinkExpr: r.APPSHEET_DEEPLINK_EXPR,
      securityFilterHint: r.SECURITY_FILTER_HINT,
      allowedActionsJson: r.ALLOWED_ACTIONS_JSON,
      operatorPrimaryField: r.PRIMARY_TEXT_FIELD,
      operatorSecondaryField: r.SECONDARY_TEXT_FIELD
    };
  });
  return { ok: true, items: items, contractVersion: CBV_UI_CONTRACT_VERSION };
}

/**
 * Append-only audit row for a completed UI contract report (truncated AFTER_JSON).
 * @param {Object} report
 */
function CbvUiContract_appendReportAudit_(report) {
  try {
    if (typeof logAdminAudit !== 'function') return { ok: false, message: 'logAdminAudit not loaded' };
    var tail = {
      status: report && report.status,
      severity: report && report.severity,
      envelopeOk: report && report.envelopeOk,
      traceId: report && report.traceId,
      phase: report && report.phase
    };
    logAdminAudit('CBV_UI_CONTRACT_REPORT', 'CBV_UI_CONTRACT', String((report && report.traceId) || 'NA'), 'APPEND', {},
      tail, 'CbvUiContract_appendReportAudit_');
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e.message || String(e) };
  }
}
