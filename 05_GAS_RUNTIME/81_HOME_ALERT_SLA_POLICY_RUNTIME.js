/**
 * PHASE_83 — HOME_ALERT SLA_POLICY_REGISTRY_AND_OPERATIONAL_CONTROL
 *
 * Runtime-first; append-only; manual-first; no triggers; no AppSheet Bot.
 * Depends on: 03_SHARED_REPOSITORY, 80_HOME_ALERT_RUNTIME (SLA status enums, parse/toDate helpers).
 */

var __HOME_ALERT_SLA_POLICY_ROW_CACHE = null;

function HomeAlertSlaPolicy_getSheetName_() {
  return (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.HOME_ALERT_SLA_POLICY)
    ? CBV_CONFIG.SHEETS.HOME_ALERT_SLA_POLICY
    : 'HOME_ALERT_SLA_POLICY';
}

function HomeAlertSlaMetrics_getSheetName_() {
  return (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.HOME_ALERT_SLA_METRICS)
    ? CBV_CONFIG.SHEETS.HOME_ALERT_SLA_METRICS
    : 'HOME_ALERT_SLA_METRICS';
}

function HomeAlert_clearSlaPolicyCache_() {
  __HOME_ALERT_SLA_POLICY_ROW_CACHE = null;
}

function HomeAlertSlaPolicy_rowActive_(r) {
  if (!r) return false;
  if (r.IS_DELETED === true || String(r.IS_DELETED).toUpperCase() === 'TRUE') return false;
  var ac = r.ACTIVE;
  if (ac === '' || ac === undefined || ac === null) return false;
  return ac === true || String(ac).toUpperCase() === 'TRUE';
}

function HomeAlertSlaPolicy_ensureSheet_() {
  var ss = SpreadsheetApp.getActive();
  var name = HomeAlertSlaPolicy_getSheetName_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    var headers = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT_SLA_POLICY)
      ? CBV_SCHEMA_MANIFEST.HOME_ALERT_SLA_POLICY
      : null;
    cbvAssert(headers && headers.length > 0, 'Missing CBV_SCHEMA_MANIFEST.HOME_ALERT_SLA_POLICY');
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return { created: true, name: name };
  }
  return { created: false, name: name };
}

function HomeAlertSlaMetrics_ensureSheet_() {
  var ss = SpreadsheetApp.getActive();
  var name = HomeAlertSlaMetrics_getSheetName_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    var headers = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT_SLA_METRICS)
      ? CBV_SCHEMA_MANIFEST.HOME_ALERT_SLA_METRICS
      : null;
    cbvAssert(headers && headers.length > 0, 'Missing CBV_SCHEMA_MANIFEST.HOME_ALERT_SLA_METRICS');
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return { created: true, name: name };
  }
  return { created: false, name: name };
}

function HomeAlertSlaPolicy_loadRows_() {
  if (__HOME_ALERT_SLA_POLICY_ROW_CACHE) return __HOME_ALERT_SLA_POLICY_ROW_CACHE;
  try {
    HomeAlertSlaPolicy_ensureSheet_();
    var name = HomeAlertSlaPolicy_getSheetName_();
    __HOME_ALERT_SLA_POLICY_ROW_CACHE = _rows(_sheet(name));
  } catch (e) {
    __HOME_ALERT_SLA_POLICY_ROW_CACHE = [];
  }
  return __HOME_ALERT_SLA_POLICY_ROW_CACHE;
}

function HomeAlertSlaPolicy_sortByOrder_(arr) {
  return (arr || []).slice().sort(function(a, b) {
    return Number(a.SORT_ORDER || 0) - Number(b.SORT_ORDER || 0);
  });
}

/**
 * @returns {object|null} Raw sheet row (first match) or null
 */
function HomeAlertSlaPolicy_pickRow_(alert, rows) {
  var a = alert || {};
  var code = String(a.ALERT_CODE || '').trim();
  var typ = String(a.ALERT_TYPE || '').trim();
  var mod = String(a.MODULE_CODE || '').trim();
  var sev = String(a.SEVERITY || '').trim().toUpperCase();
  var active = (rows || []).filter(function(r) { return HomeAlertSlaPolicy_rowActive_(r); });

  function pickWhere(pred) {
    var hit = active.filter(pred);
    hit = HomeAlertSlaPolicy_sortByOrder_(hit);
    return hit.length ? hit[0] : null;
  }

  var r0 = pickWhere(function(r) {
    var rc = String(r.ALERT_CODE || '').trim();
    return rc && code && rc === code;
  });
  if (r0) return r0;

  var r1 = pickWhere(function(r) {
    var rt = String(r.ALERT_TYPE || '').trim();
    return rt && typ && rt === typ;
  });
  if (r1) return r1;

  var r2 = pickWhere(function(r) {
    var rm = String(r.MODULE_CODE || '').trim();
    var rs = String(r.SEVERITY || '').trim().toUpperCase();
    return rm && rs && mod && sev && rm === mod && rs === sev;
  });
  if (r2) return r2;

  var r3 = pickWhere(function(r) {
    var rm = String(r.MODULE_CODE || '').trim();
    var rs = String(r.SEVERITY || '').trim();
    return rm && mod && rm === mod && !rs;
  });
  if (r3) return r3;

  var r4 = pickWhere(function(r) {
    var rm = String(r.MODULE_CODE || '').trim();
    var rs = String(r.SEVERITY || '').trim().toUpperCase();
    return rs && sev && rs === sev && !rm;
  });
  if (r4) return r4;

  return pickWhere(function(r) {
    var pc = String(r.POLICY_CODE || '').trim().toUpperCase();
    return pc === 'DEFAULT';
  });
}

/**
 * @returns {object|null} Normalized policy fields (numbers parsed)
 */
function HomeAlert_getSlaPolicy_(alert) {
  var rows = HomeAlertSlaPolicy_loadRows_();
  var raw = HomeAlertSlaPolicy_pickRow_(alert, rows);
  if (!raw) return null;
  return {
    POLICY_ID: String(raw.POLICY_ID || '').trim(),
    POLICY_CODE: String(raw.POLICY_CODE || '').trim(),
    ALERT_CODE: String(raw.ALERT_CODE || '').trim(),
    ALERT_TYPE: String(raw.ALERT_TYPE || '').trim(),
    MODULE_CODE: String(raw.MODULE_CODE || '').trim(),
    SEVERITY: String(raw.SEVERITY || '').trim(),
    SLA_POLICY: String(raw.SLA_POLICY || '').trim(),
    TARGET_MINUTES: HomeAlert_parseMinutes_(raw.TARGET_MINUTES),
    DUE_SOON_MINUTES: HomeAlert_parseMinutes_(raw.DUE_SOON_MINUTES),
    BREACH_LEVEL_1_MINUTES: HomeAlert_parseMinutes_(raw.BREACH_LEVEL_1_MINUTES),
    BREACH_LEVEL_2_MINUTES: HomeAlert_parseMinutes_(raw.BREACH_LEVEL_2_MINUTES),
    ESCALATE_AFTER_MINUTES: HomeAlert_parseMinutes_(raw.ESCALATE_AFTER_MINUTES),
    ESCALATE_TO_TEAM: String(raw.ESCALATE_TO_TEAM || '').trim(),
    ESCALATE_TO_USER: String(raw.ESCALATE_TO_USER || '').trim(),
    PRIORITY_WEIGHT: Number(raw.PRIORITY_WEIGHT || 0) || 0,
    _raw: raw
  };
}

function HomeAlert_resolveSlaPolicyCode_(alert) {
  var p = HomeAlert_getSlaPolicy_(alert);
  return p ? p.POLICY_CODE : '';
}

/** Apply registry anchor/target to alert when not manually diverged from registry defaults. */
function HomeAlertSlaPolicy_applyAnchorsToAlert_(alert, reg) {
  var a = alert || {};
  if (!reg) return;
  var regAnchor = String(reg.SLA_POLICY || '').trim();
  var regT = HomeAlert_parseMinutes_(reg.TARGET_MINUTES);
  var curAnchor = String(a.SLA_POLICY || '').trim();
  var curT = HomeAlert_parseMinutes_(a.SLA_TARGET_MINUTES);
  if (regAnchor) {
    if (!curAnchor || curAnchor === regAnchor) a.SLA_POLICY = regAnchor;
  }
  var anchorUp = String(regAnchor || '').toUpperCase();
  var useDue = anchorUp === 'USE_DUE_AT' || anchorUp === 'FROM_DUE_AT';
  if (regT > 0) {
    if (!curT || curT === regT) a.SLA_TARGET_MINUTES = regT;
  } else if (useDue) {
    if (!curT) a.SLA_TARGET_MINUTES = '';
  }
}

function HomeAlertSlaPolicy_seedDefaults() {
  HomeAlertSlaPolicy_ensureSheet_();
  var name = HomeAlertSlaPolicy_getSheetName_();
  var sh = _sheet(name);
  if (sh.getLastRow() > 1) return { ok: true, seeded: 0, message: 'Policies already present' };

  var now = cbvNow();
  var actor = (typeof HomeAlert_actorId_ === 'function') ? HomeAlert_actorId_() : (typeof cbvUser === 'function' ? cbvUser() : '');
  var defaults = [
    {
      POLICY_ID: 'POL_DEFAULT',
      POLICY_CODE: 'DEFAULT',
      ALERT_CODE: '',
      ALERT_TYPE: '',
      MODULE_CODE: '',
      SEVERITY: '',
      SLA_POLICY: 'FROM_CREATED',
      TARGET_MINUTES: 2880,
      DUE_SOON_MINUTES: 360,
      BREACH_LEVEL_1_MINUTES: 60,
      BREACH_LEVEL_2_MINUTES: 180,
      ESCALATE_AFTER_MINUTES: '',
      ESCALATE_TO_TEAM: '',
      ESCALATE_TO_USER: '',
      PRIORITY_WEIGHT: 1,
      ACTIVE: true,
      SORT_ORDER: 999,
      NOTE: 'Phase83 seed: fallback SLA',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      IS_DELETED: false
    },
    {
      POLICY_ID: 'POL_TASK_OVERDUE',
      POLICY_CODE: 'TASK_OVERDUE',
      ALERT_CODE: 'TASK_OVERDUE',
      ALERT_TYPE: 'WORKFLOW',
      MODULE_CODE: 'TASK',
      SEVERITY: '',
      SLA_POLICY: 'USE_DUE_AT',
      TARGET_MINUTES: '',
      DUE_SOON_MINUTES: 1440,
      BREACH_LEVEL_1_MINUTES: 60,
      BREACH_LEVEL_2_MINUTES: 180,
      ESCALATE_AFTER_MINUTES: 2880,
      ESCALATE_TO_TEAM: 'ESCALATED_QUEUE',
      ESCALATE_TO_USER: '',
      PRIORITY_WEIGHT: 10,
      ACTIVE: true,
      SORT_ORDER: 10,
      NOTE: 'Phase83 seed',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      IS_DELETED: false
    },
    {
      POLICY_ID: 'POL_FIN_UNCONFIRMED',
      POLICY_CODE: 'FIN_UNCONFIRMED_OLD',
      ALERT_CODE: 'FIN_UNCONFIRMED_OLD',
      ALERT_TYPE: 'DATA',
      MODULE_CODE: 'FINANCE',
      SEVERITY: '',
      SLA_POLICY: 'FROM_CREATED',
      TARGET_MINUTES: 4320,
      DUE_SOON_MINUTES: 720,
      BREACH_LEVEL_1_MINUTES: 120,
      BREACH_LEVEL_2_MINUTES: 360,
      ESCALATE_AFTER_MINUTES: 4320,
      ESCALATE_TO_TEAM: 'ESCALATED_QUEUE',
      ESCALATE_TO_USER: '',
      PRIORITY_WEIGHT: 10,
      ACTIVE: true,
      SORT_ORDER: 20,
      NOTE: 'Phase83 seed',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      IS_DELETED: false
    },
    {
      POLICY_ID: 'POL_TASK_LOG_ERR',
      POLICY_CODE: 'TASK_LOG_NOTE_ERROR',
      ALERT_CODE: 'TASK_LOG_NOTE_ERROR',
      ALERT_TYPE: 'RUNTIME',
      MODULE_CODE: 'TASK',
      SEVERITY: '',
      SLA_POLICY: 'FROM_CREATED',
      TARGET_MINUTES: 1440,
      DUE_SOON_MINUTES: 240,
      BREACH_LEVEL_1_MINUTES: 60,
      BREACH_LEVEL_2_MINUTES: 120,
      ESCALATE_AFTER_MINUTES: 1440,
      ESCALATE_TO_TEAM: 'ESCALATED_QUEUE',
      ESCALATE_TO_USER: '',
      PRIORITY_WEIGHT: 20,
      ACTIVE: true,
      SORT_ORDER: 30,
      NOTE: 'Phase83 seed: TASK_*_LOG_NOTE_ERROR',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      IS_DELETED: false
    },
    {
      POLICY_ID: 'POL_FIN_LOG_ERR',
      POLICY_CODE: 'FINANCE_LOG_NOTE_ERROR',
      ALERT_CODE: 'FINANCE_LOG_NOTE_ERROR',
      ALERT_TYPE: 'RUNTIME',
      MODULE_CODE: 'FINANCE',
      SEVERITY: '',
      SLA_POLICY: 'FROM_CREATED',
      TARGET_MINUTES: 1440,
      DUE_SOON_MINUTES: 240,
      BREACH_LEVEL_1_MINUTES: 60,
      BREACH_LEVEL_2_MINUTES: 120,
      ESCALATE_AFTER_MINUTES: 1440,
      ESCALATE_TO_TEAM: 'ESCALATED_QUEUE',
      ESCALATE_TO_USER: '',
      PRIORITY_WEIGHT: 20,
      ACTIVE: true,
      SORT_ORDER: 40,
      NOTE: 'Phase83 seed: FINANCE_*_LOG_NOTE_ERROR',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      IS_DELETED: false
    }
  ];

  var n = 0;
  defaults.forEach(function(rec) {
    _appendRecord(name, rec);
    n++;
  });
  HomeAlert_clearSlaPolicyCache_();
  return { ok: true, seeded: n };
}

function HomeAlertSlaPolicy_listActivePolicies() {
  HomeAlertSlaPolicy_ensureSheet_();
  return HomeAlertSlaPolicy_loadRows_().filter(function(r) { return HomeAlertSlaPolicy_rowActive_(r); });
}

function HomeAlertSlaPolicy_deactivatePolicy(policyCode) {
  var code = String(policyCode || '').trim();
  cbvAssert(code, 'policyCode required');
  HomeAlertSlaPolicy_ensureSheet_();
  var name = HomeAlertSlaPolicy_getSheetName_();
  var rows = _rows(_sheet(name));
  var row = rows.find(function(r) { return String(r.POLICY_CODE || '').trim() === code; }) || null;
  cbvAssert(row, 'Policy not found: ' + code);
  var patch = { ACTIVE: false, UPDATED_AT: cbvNow(), UPDATED_BY: HomeAlert_actorId_() };
  _updateRow(name, row._rowNumber, patch);
  HomeAlert_clearSlaPolicyCache_();
  return { ok: true, policyCode: code };
}

function HomeAlertSlaPolicy_upsertPolicy(policy) {
  var p = policy || {};
  var id = String(p.POLICY_ID || '').trim();
  var code = String(p.POLICY_CODE || '').trim();
  cbvAssert(id || code, 'POLICY_ID or POLICY_CODE required');
  HomeAlertSlaPolicy_ensureSheet_();
  var name = HomeAlertSlaPolicy_getSheetName_();
  var rows = _rows(_sheet(name));
  var row = rows.find(function(r) { return (id && String(r.POLICY_ID || '').trim() === id) || (code && String(r.POLICY_CODE || '').trim() === code); }) || null;
  var now = cbvNow();
  var actor = HomeAlert_actorId_();
  var headers = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT_SLA_POLICY)
    ? CBV_SCHEMA_MANIFEST.HOME_ALERT_SLA_POLICY
    : [];
  function buildRecord() {
    var rec = {};
    headers.forEach(function(h) {
      if (p[h] !== undefined) rec[h] = p[h];
    });
    if (!rec.POLICY_ID) rec.POLICY_ID = id || ('POL_' + HomeAlert_hashHex_(code).slice(0, 12));
    if (!rec.POLICY_CODE) rec.POLICY_CODE = code;
    if (rec.CREATED_AT === undefined) rec.CREATED_AT = now;
    if (rec.CREATED_BY === undefined) rec.CREATED_BY = actor;
    rec.UPDATED_AT = now;
    rec.UPDATED_BY = actor;
    if (rec.IS_DELETED === undefined) rec.IS_DELETED = false;
    if (rec.ACTIVE === undefined) rec.ACTIVE = true;
    return rec;
  }
  var rec = buildRecord();
  if (row) {
    var patch = {};
    headers.forEach(function(h) {
      if (rec[h] !== undefined && h !== 'POLICY_ID' && h !== 'CREATED_AT' && h !== 'CREATED_BY') patch[h] = rec[h];
    });
    _updateRow(name, row._rowNumber, patch);
  } else {
    _appendRecord(name, rec);
  }
  HomeAlert_clearSlaPolicyCache_();
  return { ok: true, policyId: rec.POLICY_ID, policyCode: rec.POLICY_CODE };
}

function HomeAlertSlaPolicy_validateCoverage() {
  var errors = [];
  var warnings = [];
  HomeAlertSlaPolicy_ensureSheet_();
  var policies = HomeAlertSlaPolicy_loadRows_();
  var active = policies.filter(function(r) { return HomeAlertSlaPolicy_rowActive_(r); });
  var def = active.filter(function(r) { return String(r.POLICY_CODE || '').trim().toUpperCase() === 'DEFAULT'; });
  if (!def.length) errors.push('DEFAULT policy missing or inactive');

  var byCode = {};
  active.forEach(function(r) {
    var c = String(r.ALERT_CODE || '').trim();
    if (!c) return;
    byCode[c] = (byCode[c] || 0) + 1;
  });
  Object.keys(byCode).forEach(function(k) {
    if (byCode[k] > 1) errors.push('Duplicate active ALERT_CODE policy: ' + k);
  });

  active.forEach(function(r) {
    var pc = String(r.POLICY_CODE || '').trim();
    var anchor = String(r.SLA_POLICY || '').trim();
    var tm = HomeAlert_parseMinutes_(r.TARGET_MINUTES);
    var up = anchor.toUpperCase();
    if (!anchor) warnings.push('Policy ' + pc + ': SLA_POLICY empty');
    if (tm <= 0 && up !== 'USE_DUE_AT' && up !== 'FROM_DUE_AT') {
      if (String(r.ALERT_CODE || '').trim() || pc !== 'DEFAULT') {
        warnings.push('Policy ' + pc + ': TARGET_MINUTES empty (allowed only for USE_DUE_AT)');
      }
    }
    var escM = HomeAlert_parseMinutes_(r.ESCALATE_AFTER_MINUTES);
    var tgt = String(r.ESCALATE_TO_USER || r.ESCALATE_TO_TEAM || '').trim();
    if (escM > 0 && !tgt) errors.push('Policy ' + pc + ': ESCALATE_AFTER_MINUTES set but no ESCALATE_TO_*');
  });

  try {
    if (typeof HomeAlert_ensureHomeAlertSheet_ === 'function') HomeAlert_ensureHomeAlertSheet_();
    var homeName = (typeof HomeAlert_getSheetName_ === 'function') ? HomeAlert_getSheetName_() : 'HOME_ALERT';
    var alerts = _rows(_sheet(homeName));
    var codes = {};
    alerts.forEach(function(a) {
      if (!HomeAlert_isActiveStatus_(String(a.STATUS || '').trim())) return;
      var c = String(a.ALERT_CODE || '').trim();
      if (c) codes[c] = true;
    });
    Object.keys(codes).forEach(function(ac) {
      var explicit = policies.filter(function(r) {
        return HomeAlertSlaPolicy_rowActive_(r) && String(r.ALERT_CODE || '').trim() === ac;
      });
      if (!explicit.length) warnings.push('Active ALERT_CODE ' + ac + ' has no explicit policy row (DEFAULT fallback only)');
    });
  } catch (eH) {
    warnings.push('HOME_ALERT scan skipped: ' + (eH.message || String(eH)));
  }

  return { ok: errors.length === 0, errors: errors, warnings: warnings };
}

function HomeAlertSlaPolicy_recomputeAllAlerts() {
  var traceId = HomeAlert_newTraceId_();
  HomeAlert_ensureHomeAlertSheet_();
  var name = HomeAlert_getSheetName_();
  var rows = _rows(_sheet(name));
  var n = 0;
  rows.forEach(function(r) {
    var id = String(r.ALERT_ID || '').trim();
    if (!id) return;
    if (!HomeAlert_isActiveStatus_(String(r.STATUS || '').trim())) return;
    try {
      HomeAlert_patchAlertOperational_(id, {}, 'SLA_POLICY_RECOMPUTE', '');
      n++;
    } catch (e1) {}
  });
  return { ok: true, traceId: traceId, touched: n };
}

function HomeAlertSlaMetrics_buildSnapshot_() {
  var traceId = HomeAlert_newTraceId_();
  var now = cbvNow();
  var metricDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  HomeAlert_ensureHomeAlertSheet_();
  var homeName = HomeAlert_getSheetName_();
  var alerts = _rows(_sheet(homeName));
  var active = alerts.filter(function(a) { return HomeAlert_isActiveStatus_(String(a.STATUS || '').trim()); });

  var groups = {};
  active.forEach(function(a) {
    var code = String(a.ALERT_CODE || '').trim() || '__NA__';
    var mod = String(a.MODULE_CODE || '').trim() || '';
    if (!groups[code]) {
      groups[code] = {
        METRIC_SCOPE: 'ALERT_CODE',
        MODULE_CODE: mod,
        ALERT_CODE: code === '__NA__' ? '' : code,
        POLICY_CODE: '',
        ACTIVE_COUNT: 0,
        ON_TRACK_COUNT: 0,
        DUE_SOON_COUNT: 0,
        OVERDUE_COUNT: 0,
        BREACHED_COUNT: 0,
        ESCALATED_COUNT: 0,
        STUCK_COUNT: 0,
        BLOCKED_COUNT: 0,
        _elapsed: [],
        _overload: 0
      };
    }
    var g = groups[code];
    g.ACTIVE_COUNT++;
    var sla = String(a.SLA_STATUS || '').trim();
    if (sla === HOME_ALERT_SLA_STATUS.ON_TRACK) g.ON_TRACK_COUNT++;
    else if (sla === HOME_ALERT_SLA_STATUS.DUE_SOON) g.DUE_SOON_COUNT++;
    else if (sla === HOME_ALERT_SLA_STATUS.OVERDUE) g.OVERDUE_COUNT++;
    else if (sla === HOME_ALERT_SLA_STATUS.BREACHED) g.BREACHED_COUNT++;
    if (String(a.STATUS || '').trim() === HOME_ALERT_STATUS.ESCALATED) g.ESCALATED_COUNT++;
    if (a.IS_STUCK === true || String(a.IS_STUCK).toUpperCase() === 'TRUE') g.STUCK_COUNT++;
    if (a.IS_BLOCKED === true || String(a.IS_BLOCKED).toUpperCase() === 'TRUE') g.BLOCKED_COUNT++;
    var el = Number(a.SLA_ELAPSED_MINUTES || 0);
    if (!isNaN(el) && el > 0) g._elapsed.push(el);
    try {
      var ev = HomeAlert_evaluateStuckSignals_(a);
      if (ev.stuck && ev.signals.some(function(s) { return s.code === 'OPERATOR_OVERLOAD'; })) g._overload++;
    } catch (e2) {}
    g.POLICY_CODE = HomeAlert_resolveSlaPolicyCode_(a) || '';
  });

  var out = [];
  Object.keys(groups).forEach(function(k) {
    var g = groups[k];
    var mid = 'M_' + HomeAlert_hashHex_(Utilities.formatDate(metricDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') + '|' + k + '|' + (g.POLICY_CODE || '')).slice(0, 20);
    var avg = 0;
    var mx = 0;
    if (g._elapsed.length) {
      avg = Math.round(g._elapsed.reduce(function(s, x) { return s + x; }, 0) / g._elapsed.length);
      mx = Math.max.apply(null, g._elapsed);
    }
    out.push({
      METRIC_ID: mid,
      METRIC_DATE: metricDate,
      METRIC_SCOPE: g.METRIC_SCOPE,
      MODULE_CODE: g.MODULE_CODE,
      ALERT_CODE: g.ALERT_CODE,
      POLICY_CODE: g.POLICY_CODE,
      ACTIVE_COUNT: g.ACTIVE_COUNT,
      ON_TRACK_COUNT: g.ON_TRACK_COUNT,
      DUE_SOON_COUNT: g.DUE_SOON_COUNT,
      OVERDUE_COUNT: g.OVERDUE_COUNT,
      BREACHED_COUNT: g.BREACHED_COUNT,
      ESCALATED_COUNT: g.ESCALATED_COUNT,
      STUCK_COUNT: g.STUCK_COUNT,
      BLOCKED_COUNT: g.BLOCKED_COUNT,
      AVG_ELAPSED_MINUTES: avg,
      MAX_ELAPSED_MINUTES: mx,
      OPERATOR_OVERLOAD_COUNT: g._overload,
      SUMMARY_JSON: JSON.stringify({ traceId: traceId, groupKey: k }),
      LAST_REFRESH_AT: now,
      TRACE_ID: traceId
    });
  });

  return { traceId: traceId, rows: out };
}

function HomeAlertSlaMetrics_refresh() {
  HomeAlertSlaMetrics_ensureSheet_();
  var snap = HomeAlertSlaMetrics_buildSnapshot_();
  var name = HomeAlertSlaMetrics_getSheetName_();
  var existing = _rows(_sheet(name));
  var byId = {};
  existing.forEach(function(r) {
    var id = String(r.METRIC_ID || '').trim();
    if (id) byId[id] = r;
  });
  snap.rows.forEach(function(rec) {
    var id = String(rec.METRIC_ID || '').trim();
    if (byId[id]) {
      _updateRow(name, byId[id]._rowNumber, rec);
    } else {
      _appendRecord(name, rec);
    }
  });
  return { ok: true, traceId: snap.traceId, upserted: snap.rows.length };
}

var __HOME_ALERT_SLA_POLICY_TEST_CONSOLE_LAST_REPORT = null;

function HomeAlertSlaPolicy_validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function HomeAlertSlaPolicy_TestConsole_run() {
  var traceId = HomeAlert_newTraceId_();
  var checks = [];
  var warnings = [];
  var errors = [];

  function addCheck(code, ok, severity, message, detail) {
    checks.push({ code: code, ok: ok, severity: severity, message: message, detail: detail });
    if (!ok && severity === 'ERROR') errors.push(message);
    if (!ok && severity === 'WARNING') warnings.push(message);
  }

  var polCols = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT_SLA_POLICY) ? CBV_SCHEMA_MANIFEST.HOME_ALERT_SLA_POLICY : [];
  var metCols = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT_SLA_METRICS) ? CBV_SCHEMA_MANIFEST.HOME_ALERT_SLA_METRICS : [];

  try {
    HomeAlertSlaPolicy_ensureSheet_();
    var h = _headers(_sheet(HomeAlertSlaPolicy_getSheetName_()));
    var miss = polCols.filter(function(c) { return h.indexOf(c) === -1; });
    addCheck('POLICY_SHEET', miss.length === 0, miss.length ? 'ERROR' : 'OK', miss.length ? 'Missing policy columns: ' + miss.join(',') : 'HOME_ALERT_SLA_POLICY sheet OK', { missing: miss });
  } catch (e0) {
    addCheck('POLICY_SHEET', false, 'ERROR', e0.message || String(e0), {});
  }

  try {
    HomeAlertSlaMetrics_ensureSheet_();
    var h2 = _headers(_sheet(HomeAlertSlaMetrics_getSheetName_()));
    var miss2 = metCols.filter(function(c) { return h2.indexOf(c) === -1; });
    addCheck('METRICS_SHEET', miss2.length === 0, miss2.length ? 'ERROR' : 'OK', miss2.length ? 'Missing metrics columns: ' + miss2.join(',') : 'HOME_ALERT_SLA_METRICS sheet OK', { missing: miss2 });
  } catch (e0b) {
    addCheck('METRICS_SHEET', false, 'ERROR', e0b.message || String(e0b), {});
  }

  var seed = null;
  try {
    seed = HomeAlertSlaPolicy_seedDefaults();
    addCheck('POLICY_SEED', true, 'OK', 'seedDefaults ran', seed);
  } catch (e1) {
    addCheck('POLICY_SEED', false, 'ERROR', e1.message || String(e1), {});
  }

  var defPol = null;
  try {
    defPol = HomeAlert_getSlaPolicy_({ ALERT_CODE: '__UNKNOWN_PHASE83__', ALERT_TYPE: '', MODULE_CODE: '', SEVERITY: '' });
    addCheck('RESOLVER_DEFAULT', !!defPol, defPol ? 'OK' : 'ERROR', defPol ? 'Resolver returns DEFAULT' : 'DEFAULT missing', { policyCode: defPol && defPol.POLICY_CODE });
    if (!defPol) errors.push('DEFAULT policy not resolved');
  } catch (e2) {
    addCheck('RESOLVER_DEFAULT', false, 'ERROR', e2.message || String(e2), {});
  }

  var taskPol = null;
  try {
    taskPol = HomeAlert_getSlaPolicy_({ ALERT_CODE: 'TASK_OVERDUE', ALERT_TYPE: 'WORKFLOW', MODULE_CODE: 'TASK', SEVERITY: 'HIGH' });
    addCheck('RESOLVER_ALERT_CODE', !!taskPol, taskPol ? 'OK' : 'ERROR', taskPol ? 'TASK_OVERDUE policy' : 'missing', { policyCode: taskPol && taskPol.POLICY_CODE });
  } catch (e3) {
    addCheck('RESOLVER_ALERT_CODE', false, 'ERROR', e3.message || String(e3), {});
  }

  try {
    var dup = HomeAlertSlaPolicy_validateCoverage();
    addCheck('COVERAGE', dup.ok, dup.ok ? 'OK' : 'ERROR', 'validateCoverage', { errors: dup.errors, warnings: dup.warnings });
    errors = errors.concat(dup.errors || []);
    warnings = warnings.concat(dup.warnings || []);
  } catch (e4) {
    addCheck('COVERAGE', false, 'ERROR', e4.message || String(e4), {});
  }

  var dupManual = false;
  try {
    var rows = HomeAlertSlaPolicy_loadRows_();
    var active = rows.filter(function(r) { return HomeAlertSlaPolicy_rowActive_(r); });
    var seen = {};
    active.forEach(function(r) {
      var c = String(r.ALERT_CODE || '').trim();
      if (!c) return;
      seen[c] = (seen[c] || 0) + 1;
    });
    dupManual = Object.keys(seen).some(function(k) { return seen[k] > 1; });
    addCheck('DUPLICATE_POLICY', !dupManual, dupManual ? 'ERROR' : 'OK', dupManual ? 'Duplicate ALERT_CODE' : 'No duplicate ALERT_CODE', seen);
  } catch (e5) {
    addCheck('DUPLICATE_POLICY', false, 'WARNING', e5.message || String(e5), {});
  }

  var metRefresh = null;
  try {
    metRefresh = HomeAlertSlaMetrics_refresh();
    addCheck('METRICS_REFRESH', !!metRefresh && metRefresh.ok, metRefresh && metRefresh.ok ? 'OK' : 'ERROR', 'metrics refresh', metRefresh);
  } catch (e6) {
    addCheck('METRICS_REFRESH', false, 'ERROR', e6.message || String(e6), {});
  }

  addCheck('PHASE82_FUNCS', typeof HomeAlert_checkSlaRuntime === 'function' && typeof HomeAlert_enrichSlaEscalationRuntime_ === 'function', 'OK', 'Phase82 surface intact', {});

  var noTrig = typeof HomeAlert_installPhase83ProductionTriggers !== 'function';
  addCheck('NO_AUTO_TRIGGER', noTrig, noTrig ? 'OK' : 'ERROR', 'No Phase83 trigger installer', {});

  addCheck('MENU_WRAPPER', typeof menuCbvTestConsoleHomeAlertSla83 === 'function', typeof menuCbvTestConsoleHomeAlertSla83 === 'function' ? 'OK' : 'ERROR', 'menuCbvTestConsoleHomeAlertSla83', {});

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: 'PHASE_83_SLA_POLICY_REGISTRY_AND_OPERATIONAL_CONTROL',
    status: status,
    severity: severity,
    checkedAt: cbvNow(),
    runBy: HomeAlert_actorId_(),
    traceId: traceId,
    testSuite: 'HOME_ALERT_SLA_POLICY_REGISTRY',
    summary: 'SLA policy registry: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'GO' ? 'Tune policies on HOME_ALERT_SLA_POLICY; run HomeAlertSlaMetrics_refresh() after operational runs.' : 'Fix errors then rerun HomeAlertSlaPolicy_TestConsole_run().',
    reportText: '',
    reportJson: { seed: seed, metricsRefresh: metRefresh },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: false
  };

  var env = HomeAlertSlaPolicy_validateEnvelope_(report);
  report.envelopeOk = env.ok;
  if (!env.ok) {
    warnings.push('Envelope missing: ' + (env.missing || []).join(','));
    report.status = errors.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
    report.ok = errors.length === 0;
  }

  report.reportText = [
    '=== HOME_ALERT SLA POLICY REGISTRY (PHASE 83) ===',
    'status=' + report.status,
    'envelopeOk=' + report.envelopeOk,
    (checks || []).map(function(c) { return (c.ok ? '[OK]' : '[X]') + ' ' + c.code; }).join('\n')
  ].join('\n');

  __HOME_ALERT_SLA_POLICY_TEST_CONSOLE_LAST_REPORT = report;
  Logger.log(report.reportText);
  return report;
}

function HomeAlertSlaPolicy_TestConsole_showReport() {
  var r = __HOME_ALERT_SLA_POLICY_TEST_CONSOLE_LAST_REPORT;
  if (!r) return { ok: false, message: 'No report. Run HomeAlertSlaPolicy_TestConsole_run() first.' };
  Logger.log(r.reportText || JSON.stringify(r, null, 2));
  return r;
}
