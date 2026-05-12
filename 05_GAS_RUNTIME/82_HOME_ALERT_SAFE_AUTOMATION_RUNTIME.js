/**
 * PHASE_84 — SAFE_OPERATIONAL_AUTOMATION_RUNTIME (HOME_ALERT)
 *
 * Human-in-the-loop; append-only run log; allowlist-only execution.
 * No auto assign/resolve/close/escalate; no AppSheet Bot; bootstrap does NOT install triggers.
 */

var HOME_ALERT_SAFE_AUTOMATION_ALLOWLIST = [
  'HomeAlert_refresh',
  'HomeAlertSlaMetrics_refresh',
  'HomeAlert_detectStuckItems',
  'HomeAlertDailyOperationalSnapshot_generate',
  'HomeAlertSafeAutomation_healthCheck'
];

var HOME_ALERT_SAFE_AUTOMATION_FORBIDDEN_SUBSTRINGS = [
  'autoassign', 'autoresolve', 'autoclose', 'autoescalate', 'forceescalate',
  'delete', 'purge', 'destructive'
];

var HOME_ALERT_SAFE_AUTOMATION_RUN_DUE_HANDLER = 'HomeAlertSafeAutomation_runDue';

function HomeAlertSafeAutomation_getConfigSheetName_() {
  return (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.HOME_ALERT_AUTOMATION_CONFIG)
    ? CBV_CONFIG.SHEETS.HOME_ALERT_AUTOMATION_CONFIG
    : 'HOME_ALERT_AUTOMATION_CONFIG';
}

function HomeAlertSafeAutomation_getRunLogSheetName_() {
  return (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.HOME_ALERT_AUTOMATION_RUN_LOG)
    ? CBV_CONFIG.SHEETS.HOME_ALERT_AUTOMATION_RUN_LOG
    : 'HOME_ALERT_AUTOMATION_RUN_LOG';
}

function HomeAlertSafeAutomation_configRowEnabled_(r) {
  if (!r || r.IS_DELETED === true || String(r.IS_DELETED).toUpperCase() === 'TRUE') return false;
  var e = r.ENABLED;
  return e === true || String(e).toUpperCase() === 'TRUE';
}

function HomeAlertSafeAutomation_configRowSafe_(r) {
  var s = r.SAFE_MODE;
  return s === true || String(s).toUpperCase() === 'TRUE';
}

function HomeAlertSafeAutomation_configRowAllowWrite_(r) {
  var w = r.ALLOW_WRITE;
  return w === true || String(w).toUpperCase() === 'TRUE';
}

function HomeAlertSafeAutomation_configRowAllowTriggerInstall_(r) {
  var t = r.ALLOW_TRIGGER_INSTALL;
  return t === true || String(t).toUpperCase() === 'TRUE';
}

function HomeAlertSafeAutomation_forbiddenHit_(text) {
  var s = String(text || '').toLowerCase();
  for (var i = 0; i < HOME_ALERT_SAFE_AUTOMATION_FORBIDDEN_SUBSTRINGS.length; i++) {
    if (s.indexOf(HOME_ALERT_SAFE_AUTOMATION_FORBIDDEN_SUBSTRINGS[i]) >= 0) return HOME_ALERT_SAFE_AUTOMATION_FORBIDDEN_SUBSTRINGS[i];
  }
  return '';
}

function HomeAlertSafeAutomation_validateNoForbiddenAutomation_() {
  var errors = [];
  try {
    HomeAlertSafeAutomation_ensureSheets_();
    var rows = _rows(_sheet(HomeAlertSafeAutomation_getConfigSheetName_()));
    rows.forEach(function(r) {
      if (r.IS_DELETED === true || String(r.IS_DELETED).toUpperCase() === 'TRUE') return;
      var pack = [
        r.AUTOMATION_CODE, r.AUTOMATION_TYPE, r.FUNCTION_NAME, r.NOTE, r.SCHEDULE_LABEL
      ].map(function(x) { return String(x || ''); }).join(' ');
      var hit = HomeAlertSafeAutomation_forbiddenHit_(pack);
      if (hit) errors.push('Forbidden token "' + hit + '" in config ' + String(r.AUTOMATION_CODE || '').trim());
    });
  } catch (e) {
    errors.push(e.message || String(e));
  }
  return { ok: errors.length === 0, errors: errors };
}

function HomeAlertSafeAutomation_isAllowlisted_(fnName) {
  var n = String(fnName || '').trim();
  return HOME_ALERT_SAFE_AUTOMATION_ALLOWLIST.indexOf(n) >= 0;
}

function HomeAlertSafeAutomation_ensureSheets_() {
  var ss = SpreadsheetApp.getActive();
  function ensure(nameKey, manifestKey) {
    var name = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS[nameKey])
      ? CBV_CONFIG.SHEETS[nameKey]
      : manifestKey;
    var sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      var headers = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST[manifestKey])
        ? CBV_SCHEMA_MANIFEST[manifestKey]
        : null;
      cbvAssert(headers && headers.length > 0, 'Missing manifest ' + manifestKey);
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    return name;
  }
  ensure('HOME_ALERT_AUTOMATION_CONFIG', 'HOME_ALERT_AUTOMATION_CONFIG');
  ensure('HOME_ALERT_AUTOMATION_RUN_LOG', 'HOME_ALERT_AUTOMATION_RUN_LOG');
  HomeAlertDailyOperationalSnapshot_ensureSheet_();
  return { ok: true };
}

function HomeAlertDailyOperationalSnapshot_ensureSheet_() {
  var ss = SpreadsheetApp.getActive();
  var name = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.HOME_ALERT_DAILY_SNAPSHOT)
    ? CBV_CONFIG.SHEETS.HOME_ALERT_DAILY_SNAPSHOT
    : 'HOME_ALERT_DAILY_SNAPSHOT';
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    var headers = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT_DAILY_SNAPSHOT)
      ? CBV_SCHEMA_MANIFEST.HOME_ALERT_DAILY_SNAPSHOT
      : null;
    cbvAssert(headers && headers.length > 0, 'Missing CBV_SCHEMA_MANIFEST.HOME_ALERT_DAILY_SNAPSHOT');
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return name;
}

function HomeAlertSafeAutomation_appendRunLog_(rec) {
  var name = HomeAlertSafeAutomation_getRunLogSheetName_();
  _appendRecord(name, rec);
}

function HomeAlertSafeAutomation_updateConfigRow_(rowNum, patch) {
  _updateRow(HomeAlertSafeAutomation_getConfigSheetName_(), rowNum, patch);
}

function HomeAlertSafeAutomation_seedDefaults() {
  HomeAlertSafeAutomation_ensureSheets_();
  var name = HomeAlertSafeAutomation_getConfigSheetName_();
  var sh = _sheet(name);
  if (sh.getLastRow() > 1) return { ok: true, seeded: 0, message: 'Automation config already present' };

  var now = cbvNow();
  var actor = (typeof HomeAlert_actorId_ === 'function') ? HomeAlert_actorId_() : (typeof cbvUser === 'function' ? cbvUser() : '');
  var rows = [
    {
      CONFIG_ID: 'CFG_HOME_ALERT_REFRESH',
      AUTOMATION_CODE: 'HOME_ALERT_REFRESH',
      AUTOMATION_TYPE: 'CLOCK',
      FUNCTION_NAME: 'HomeAlert_refresh',
      ENABLED: true,
      SAFE_MODE: true,
      FREQUENCY_MINUTES: 15,
      SCHEDULE_LABEL: 'every_15m',
      LAST_RUN_AT: '',
      LAST_STATUS: '',
      LAST_TRACE_ID: '',
      LAST_ERROR: '',
      RUN_COUNT: 0,
      MAX_RUNTIME_SECONDS: 120,
      ALLOW_WRITE: true,
      ALLOW_NOTIFICATION: false,
      ALLOW_TRIGGER_INSTALL: false,
      NOTE: 'Phase84 seed: refresh alerts (no autoClear/autoExpire)',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      IS_DELETED: false
    },
    {
      CONFIG_ID: 'CFG_SLA_METRICS_REFRESH',
      AUTOMATION_CODE: 'SLA_METRICS_REFRESH',
      AUTOMATION_TYPE: 'CLOCK',
      FUNCTION_NAME: 'HomeAlertSlaMetrics_refresh',
      ENABLED: true,
      SAFE_MODE: true,
      FREQUENCY_MINUTES: 30,
      SCHEDULE_LABEL: 'every_30m',
      LAST_RUN_AT: '',
      LAST_STATUS: '',
      LAST_TRACE_ID: '',
      LAST_ERROR: '',
      RUN_COUNT: 0,
      MAX_RUNTIME_SECONDS: 120,
      ALLOW_WRITE: true,
      ALLOW_NOTIFICATION: false,
      ALLOW_TRIGGER_INSTALL: false,
      NOTE: 'Phase84 seed',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      IS_DELETED: false
    },
    {
      CONFIG_ID: 'CFG_STUCK_DRY_RUN',
      AUTOMATION_CODE: 'STUCK_DETECTION_DRY_RUN',
      AUTOMATION_TYPE: 'CLOCK',
      FUNCTION_NAME: 'HomeAlert_detectStuckItems',
      ENABLED: true,
      SAFE_MODE: true,
      FREQUENCY_MINUTES: 15,
      SCHEDULE_LABEL: 'dry_run_apply_false',
      LAST_RUN_AT: '',
      LAST_STATUS: '',
      LAST_TRACE_ID: '',
      LAST_ERROR: '',
      RUN_COUNT: 0,
      MAX_RUNTIME_SECONDS: 120,
      ALLOW_WRITE: false,
      ALLOW_NOTIFICATION: false,
      ALLOW_TRIGGER_INSTALL: false,
      NOTE: 'Phase84: apply=false (report/suggestion only)',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      IS_DELETED: false
    },
    {
      CONFIG_ID: 'CFG_DAILY_SNAPSHOT',
      AUTOMATION_CODE: 'DAILY_OPERATIONAL_SNAPSHOT',
      AUTOMATION_TYPE: 'DAILY',
      FUNCTION_NAME: 'HomeAlertDailyOperationalSnapshot_generate',
      ENABLED: true,
      SAFE_MODE: true,
      FREQUENCY_MINUTES: 1440,
      SCHEDULE_LABEL: 'DAILY',
      LAST_RUN_AT: '',
      LAST_STATUS: '',
      LAST_TRACE_ID: '',
      LAST_ERROR: '',
      RUN_COUNT: 0,
      MAX_RUNTIME_SECONDS: 180,
      ALLOW_WRITE: true,
      ALLOW_NOTIFICATION: false,
      ALLOW_TRIGGER_INSTALL: false,
      NOTE: 'Phase84: one snapshot per local calendar day',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      IS_DELETED: false
    },
    {
      CONFIG_ID: 'CFG_RUNTIME_HEALTH',
      AUTOMATION_CODE: 'RUNTIME_HEALTH_CHECK',
      AUTOMATION_TYPE: 'CLOCK',
      FUNCTION_NAME: 'HomeAlertSafeAutomation_healthCheck',
      ENABLED: true,
      SAFE_MODE: true,
      FREQUENCY_MINUTES: 60,
      SCHEDULE_LABEL: 'every_60m',
      LAST_RUN_AT: '',
      LAST_STATUS: '',
      LAST_TRACE_ID: '',
      LAST_ERROR: '',
      RUN_COUNT: 0,
      MAX_RUNTIME_SECONDS: 60,
      ALLOW_WRITE: false,
      ALLOW_NOTIFICATION: false,
      ALLOW_TRIGGER_INSTALL: false,
      NOTE: 'Phase84 seed: read-only health evidence',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      IS_DELETED: false
    }
  ];
  rows.forEach(function(rec) { _appendRecord(name, rec); });
  return { ok: true, seeded: rows.length };
}

function HomeAlertSafeAutomation_listConfigs() {
  HomeAlertSafeAutomation_ensureSheets_();
  return _rows(_sheet(HomeAlertSafeAutomation_getConfigSheetName_()));
}

function HomeAlertSafeAutomation_findConfigByCode_(rows, code) {
  var c = String(code || '').trim();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].AUTOMATION_CODE || '').trim() === c) return rows[i];
  }
  return null;
}

function HomeAlertDailyOperationalSnapshot_formatText_(summary) {
  var s = summary || {};
  var lines = [];
  lines.push('HOME_ALERT daily snapshot (read-only)');
  lines.push('ACTIVE=' + (s.ACTIVE_COUNT || 0) + ' DUE_SOON=' + (s.DUE_SOON_COUNT || 0) + ' OVERDUE=' + (s.OVERDUE_COUNT || 0) + ' BREACHED=' + (s.BREACHED_COUNT || 0));
  lines.push('ESCALATED=' + (s.ESCALATED_COUNT || 0) + ' STUCK=' + (s.STUCK_COUNT || 0) + ' BLOCKED=' + (s.BLOCKED_COUNT || 0));
  lines.push('WAITING=' + (s.WAITING_COUNT || 0) + ' UNASSIGNED_ACTIVE=' + (s.UNASSIGNED_COUNT || 0) + ' OVERLOAD_HINTS=' + (s.OPERATOR_OVERLOAD_COUNT || 0));
  return lines.join('\n');
}

/** Core snapshot writer (safe runner calls this to avoid recursion via invokeAllowlisted). */
function HomeAlertDailyOperationalSnapshot_execute_() {
  var traceId = HomeAlert_newTraceId_();
  HomeAlertDailyOperationalSnapshot_ensureSheet_();
  HomeAlert_ensureHomeAlertSheet_();
  var homeName = HomeAlert_getSheetName_();
  var alerts = _rows(_sheet(homeName));
  var now = cbvNow();
  var snapDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  var summary = {
    ACTIVE_COUNT: 0,
    DUE_SOON_COUNT: 0,
    OVERDUE_COUNT: 0,
    BREACHED_COUNT: 0,
    ESCALATED_COUNT: 0,
    STUCK_COUNT: 0,
    BLOCKED_COUNT: 0,
    WAITING_COUNT: 0,
    UNASSIGNED_COUNT: 0,
    OPERATOR_OVERLOAD_COUNT: 0,
    TOP_ALERT_CODES_JSON: '[]',
    TOP_OPERATORS_JSON: '[]'
  };

  var codeCount = {};
  var opCount = {};
  alerts.forEach(function(a) {
    if (!HomeAlert_isActiveStatus_(String(a.STATUS || '').trim())) return;
    summary.ACTIVE_COUNT++;
    var sla = String(a.SLA_STATUS || '').trim();
    if (sla === HOME_ALERT_SLA_STATUS.DUE_SOON) summary.DUE_SOON_COUNT++;
    else if (sla === HOME_ALERT_SLA_STATUS.OVERDUE) summary.OVERDUE_COUNT++;
    else if (sla === HOME_ALERT_SLA_STATUS.BREACHED) summary.BREACHED_COUNT++;
    if (String(a.STATUS || '').trim() === HOME_ALERT_STATUS.ESCALATED) summary.ESCALATED_COUNT++;
    if (a.IS_STUCK === true || String(a.IS_STUCK).toUpperCase() === 'TRUE') summary.STUCK_COUNT++;
    if (a.IS_BLOCKED === true || String(a.IS_BLOCKED).toUpperCase() === 'TRUE') summary.BLOCKED_COUNT++;
    if (String(a.STATUS || '').trim() === HOME_ALERT_STATUS.WAITING_RESPONSE) summary.WAITING_COUNT++;
    if (!String(a.ASSIGNED_TO || '').trim()) summary.UNASSIGNED_COUNT++;
    try {
      var ev = HomeAlert_evaluateStuckSignals_(a);
      var sigs = ev.signals || [];
      var k;
      var overload = false;
      for (k = 0; k < sigs.length; k++) {
        if (sigs[k].code === 'OPERATOR_OVERLOAD') overload = true;
      }
      if (ev.stuck && overload) summary.OPERATOR_OVERLOAD_COUNT++;
    } catch (e0) {}
    var c = String(a.ALERT_CODE || '').trim() || 'UNKNOWN';
    codeCount[c] = (codeCount[c] || 0) + 1;
    var o = String(a.ASSIGNED_TO || '').trim() || '';
    if (o) opCount[o] = (opCount[o] || 0) + 1;
  });

  var topCodes = Object.keys(codeCount).map(function(k) { return { code: k, n: codeCount[k] }; }).sort(function(a, b) { return b.n - a.n; }).slice(0, 8);
  var topOps = Object.keys(opCount).map(function(k) { return { operator: k, n: opCount[k] }; }).sort(function(a, b) { return b.n - a.n; }).slice(0, 8);
  summary.TOP_ALERT_CODES_JSON = JSON.stringify(topCodes);
  summary.TOP_OPERATORS_JSON = JSON.stringify(topOps);

  var recText = HomeAlertDailyOperationalSnapshot_formatText_(summary);
  var recActions = [
    'Human-in-the-loop: review OPERATOR_* deck.',
    'Run HomeAlertSlaPolicy_TestConsole_run / HomeAlertSlaEscalation_TestConsole_run as needed.',
    'No auto-resolve / auto-escalate in Phase84.'
  ].join(' ');

  var snapId = 'SNAP_' + HomeAlert_hashHex_(Utilities.formatDate(snapDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')).slice(0, 16);
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.HOME_ALERT_DAILY_SNAPSHOT)
    ? CBV_CONFIG.SHEETS.HOME_ALERT_DAILY_SNAPSHOT
    : 'HOME_ALERT_DAILY_SNAPSHOT';
  var existing = _rows(_sheet(sheetName));
  var row = null;
  var j;
  for (j = 0; j < existing.length; j++) {
    var r0 = existing[j];
    var d = r0.SNAPSHOT_DATE;
    var dt = d instanceof Date ? d : (d ? new Date(d) : null);
    if (dt && !isNaN(dt.getTime()) && dt.getFullYear() === snapDate.getFullYear() && dt.getMonth() === snapDate.getMonth() && dt.getDate() === snapDate.getDate()) {
      row = r0;
      break;
    }
  }

  var rec = {
    SNAPSHOT_ID: row ? String(row.SNAPSHOT_ID || '').trim() || snapId : snapId,
    SNAPSHOT_DATE: snapDate,
    ACTIVE_COUNT: summary.ACTIVE_COUNT,
    DUE_SOON_COUNT: summary.DUE_SOON_COUNT,
    OVERDUE_COUNT: summary.OVERDUE_COUNT,
    BREACHED_COUNT: summary.BREACHED_COUNT,
    ESCALATED_COUNT: summary.ESCALATED_COUNT,
    STUCK_COUNT: summary.STUCK_COUNT,
    BLOCKED_COUNT: summary.BLOCKED_COUNT,
    WAITING_COUNT: summary.WAITING_COUNT,
    UNASSIGNED_COUNT: summary.UNASSIGNED_COUNT,
    OPERATOR_OVERLOAD_COUNT: summary.OPERATOR_OVERLOAD_COUNT,
    TOP_ALERT_CODES_JSON: summary.TOP_ALERT_CODES_JSON,
    TOP_OPERATORS_JSON: summary.TOP_OPERATORS_JSON,
    SUMMARY_TEXT: recText,
    RECOMMENDED_ACTIONS_TEXT: recActions,
    TRACE_ID: traceId,
    CREATED_AT: now,
    CREATED_BY: (typeof HomeAlert_actorId_ === 'function') ? HomeAlert_actorId_() : ''
  };

  if (row) {
    rec.CREATED_AT = row.CREATED_AT || rec.CREATED_AT;
    rec.CREATED_BY = row.CREATED_BY || rec.CREATED_BY;
    _updateRow(sheetName, row._rowNumber, rec);
  } else {
    _appendRecord(sheetName, rec);
  }

  return { ok: true, traceId: traceId, snapshotId: rec.SNAPSHOT_ID, summary: summary };
}

function HomeAlertDailyOperationalSnapshot_generate() {
  return HomeAlertDailyOperationalSnapshot_execute_();
}

function HomeAlertSafeAutomation_invokeAllowlisted_(fnName, inputObj) {
  var n = String(fnName || '').trim();
  if (!HomeAlertSafeAutomation_isAllowlisted_(n)) throw new Error('Not allowlisted: ' + n);
  if (HomeAlertSafeAutomation_forbiddenHit_(n)) throw new Error('Forbidden function name pattern');
  if (n === 'HomeAlert_refresh') {
    return typeof HomeAlert_refresh === 'function' ? HomeAlert_refresh({ autoClearMissing: false, autoExpire: false }) : null;
  }
  if (n === 'HomeAlertSlaMetrics_refresh') {
    return typeof HomeAlertSlaMetrics_refresh === 'function' ? HomeAlertSlaMetrics_refresh() : null;
  }
  if (n === 'HomeAlert_detectStuckItems') {
    var opt = inputObj && typeof inputObj === 'object' ? inputObj : {};
    return typeof HomeAlert_detectStuckItems === 'function' ? HomeAlert_detectStuckItems(opt) : null;
  }
  if (n === 'HomeAlertDailyOperationalSnapshot_generate') {
    return HomeAlertDailyOperationalSnapshot_execute_();
  }
  if (n === 'HomeAlertSafeAutomation_healthCheck') {
    return HomeAlertSafeAutomation_healthCheck();
  }
  throw new Error('Unhandled allowlisted function: ' + n);
}

function HomeAlertSafeAutomation_runOne(automationCode, options) {
  var code = String(automationCode || '').trim();
  cbvAssert(code, 'automationCode required');
  HomeAlertSafeAutomation_ensureSheets_();
  var traceId = HomeAlert_newTraceId_();
  var started = new Date().getTime();
  var rows = _rows(_sheet(HomeAlertSafeAutomation_getConfigSheetName_()));
  var cfg = HomeAlertSafeAutomation_findConfigByCode_(rows, code);
  if (!cfg) {
    var runIdBad = 'ARUN_' + Utilities.getUuid().replace(/-/g, '').slice(0, 20);
    try {
      HomeAlertSafeAutomation_appendRunLog_({
        RUN_ID: runIdBad,
        AUTOMATION_CODE: code,
        FUNCTION_NAME: '',
        STARTED_AT: new Date(started),
        FINISHED_AT: cbvNow(),
        DURATION_MS: new Date().getTime() - started,
        STATUS: 'FAIL',
        SEVERITY: 'ERROR',
        TRACE_ID: traceId,
        INPUT_JSON: JSON.stringify(options || {}),
        OUTPUT_JSON: '{}',
        ERROR_MESSAGE: 'Unknown AUTOMATION_CODE',
        SAFE_MODE: true,
        ALLOW_WRITE: false,
        RUN_BY: (typeof HomeAlert_actorId_ === 'function') ? HomeAlert_actorId_() : 'AUTOMATION',
        CREATED_AT: cbvNow()
      });
    } catch (eL) {}
    return { ok: false, traceId: traceId, error: 'Unknown AUTOMATION_CODE: ' + code, automationCode: code };
  }

  var runId = 'ARUN_' + Utilities.getUuid().replace(/-/g, '').slice(0, 20);
  var fn = String(cfg.FUNCTION_NAME || '').trim();
  var inputJson = JSON.stringify(options || {});

  function finish(status, severity, out, errMsg) {
    var finished = new Date().getTime();
    var dur = finished - started;
    HomeAlertSafeAutomation_appendRunLog_({
      RUN_ID: runId,
      AUTOMATION_CODE: code,
      FUNCTION_NAME: fn,
      STARTED_AT: new Date(started),
      FINISHED_AT: new Date(finished),
      DURATION_MS: dur,
      STATUS: status,
      SEVERITY: severity,
      TRACE_ID: traceId,
      INPUT_JSON: inputJson,
      OUTPUT_JSON: JSON.stringify(out || {}),
      ERROR_MESSAGE: errMsg || '',
      SAFE_MODE: true,
      ALLOW_WRITE: HomeAlertSafeAutomation_configRowAllowWrite_(cfg),
      RUN_BY: (typeof HomeAlert_actorId_ === 'function') ? HomeAlert_actorId_() : 'AUTOMATION',
      CREATED_AT: cbvNow()
    });
    var rc = Number(cfg.RUN_COUNT || 0) || 0;
    HomeAlertSafeAutomation_updateConfigRow_(cfg._rowNumber, {
      LAST_RUN_AT: cbvNow(),
      LAST_STATUS: status,
      LAST_TRACE_ID: traceId,
      LAST_ERROR: errMsg || '',
      RUN_COUNT: rc + 1,
      UPDATED_AT: cbvNow(),
      UPDATED_BY: (typeof HomeAlert_actorId_ === 'function') ? HomeAlert_actorId_() : ''
    });
  }

  try {
    if (!HomeAlertSafeAutomation_configRowEnabled_(cfg)) {
      finish('SKIPPED', 'INFO', { reason: 'DISABLED' }, '');
      return { ok: true, skipped: true, traceId: traceId, automationCode: code };
    }
    if (!HomeAlertSafeAutomation_configRowSafe_(cfg)) {
      finish('SKIPPED', 'WARNING', { reason: 'SAFE_MODE_OFF' }, '');
      return { ok: true, skipped: true, traceId: traceId, automationCode: code };
    }
    if (!HomeAlertSafeAutomation_isAllowlisted_(fn)) {
      throw new Error('Function not allowlisted: ' + fn);
    }
    var packHit = HomeAlertSafeAutomation_forbiddenHit_([code, fn, cfg.NOTE, cfg.AUTOMATION_TYPE].join(' '));
    if (packHit) throw new Error('Forbidden token in config: ' + packHit);

    var needsWrite = fn === 'HomeAlert_refresh' || fn === 'HomeAlertSlaMetrics_refresh' || fn === 'HomeAlertDailyOperationalSnapshot_generate';
    if (needsWrite && !HomeAlertSafeAutomation_configRowAllowWrite_(cfg)) {
      finish('SKIPPED', 'WARNING', { reason: 'ALLOW_WRITE_FALSE' }, '');
      return { ok: true, skipped: true, traceId: traceId };
    }

    var invokeInput = options || {};
    if (fn === 'HomeAlert_detectStuckItems') invokeInput = { apply: false };

    var out = HomeAlertSafeAutomation_invokeAllowlisted_(fn, invokeInput);
    finish('OK', 'OK', out, '');
    return { ok: true, traceId: traceId, output: out, automationCode: code };
  } catch (e) {
    var msg = e.message || String(e);
    finish('FAIL', 'ERROR', {}, msg);
    return { ok: false, traceId: traceId, error: msg, automationCode: code };
  }
}

function HomeAlertSafeAutomation_runDue() {
  var traceId = HomeAlert_newTraceId_();
  var results = [];
  var now = cbvNow();
  var rows = HomeAlertSafeAutomation_listConfigs().filter(function(r) { return HomeAlertSafeAutomation_configRowEnabled_(r) && HomeAlertSafeAutomation_configRowSafe_(r); });
  rows.forEach(function(cfg) {
    var code = String(cfg.AUTOMATION_CODE || '').trim();
    if (!code) return;
    var fn = String(cfg.FUNCTION_NAME || '').trim();
    if (!HomeAlertSafeAutomation_isAllowlisted_(fn)) return;

    var freq = Math.max(0, Math.round(Number(cfg.FREQUENCY_MINUTES || 0)));
    var last = cfg.LAST_RUN_AT;
    var lastDt = last instanceof Date ? last : (last ? new Date(last) : null);
    var type = String(cfg.AUTOMATION_TYPE || '').trim().toUpperCase();

    if (type === 'DAILY' || code === 'DAILY_OPERATIONAL_SNAPSHOT') {
      var d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (lastDt && !isNaN(lastDt.getTime())) {
        var dL = new Date(lastDt.getFullYear(), lastDt.getMonth(), lastDt.getDate());
        if (dL.getTime() >= d0.getTime()) return;
      }
    } else {
      if (freq <= 0) return;
      if (lastDt && !isNaN(lastDt.getTime())) {
        if (now.getTime() - lastDt.getTime() < freq * 60000) return;
      }
    }

    var r = HomeAlertSafeAutomation_runOne(code, {});
    results.push({ code: code, ok: r.ok, skipped: r.skipped });
  });
  return { ok: true, traceId: traceId, results: results };
}

function HomeAlertSafeAutomation_healthCheck() {
  var traceId = HomeAlert_newTraceId_();
  var checks = [];
  var ok = true;
  try {
    HomeAlert_ensureHomeAlertSheet_();
    checks.push({ name: 'HOME_ALERT_SHEET', ok: true });
  } catch (e1) {
    ok = false;
    checks.push({ name: 'HOME_ALERT_SHEET', ok: false, error: e1.message || String(e1) });
  }
  try {
    HomeAlertSafeAutomation_ensureSheets_();
    checks.push({ name: 'AUTOMATION_SHEETS', ok: true });
  } catch (e2) {
    ok = false;
    checks.push({ name: 'AUTOMATION_SHEETS', ok: false, error: e2.message || String(e2) });
  }
  var forb = HomeAlertSafeAutomation_validateNoForbiddenAutomation_();
  checks.push({ name: 'NO_FORBIDDEN_AUTOMATION', ok: forb.ok, errors: forb.errors });
  if (!forb.ok) ok = false;
  return { ok: ok, traceId: traceId, checks: checks };
}

function HomeAlertSafeAutomation_installSafeTriggers() {
  HomeAlertSafeAutomation_removeSafeTriggers();
  var tickMinutes = 10;
  ScriptApp.newTrigger(HOME_ALERT_SAFE_AUTOMATION_RUN_DUE_HANDLER)
    .timeBased()
    .everyMinutes(tickMinutes)
    .create();
  return { ok: true, handler: HOME_ALERT_SAFE_AUTOMATION_RUN_DUE_HANDLER, everyMinutes: tickMinutes };
}

function HomeAlertSafeAutomation_removeSafeTriggers() {
  var removed = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction && t.getHandlerFunction() === HOME_ALERT_SAFE_AUTOMATION_RUN_DUE_HANDLER) {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  return { ok: true, removed: removed };
}

var __HOME_ALERT_SAFE_AUTOMATION_TEST_CONSOLE_LAST_REPORT = null;

function HomeAlertSafeAutomation_validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function HomeAlertSafeAutomation_TestConsole_run() {
  var traceId = HomeAlert_newTraceId_();
  var checks = [];
  var warnings = [];
  var errors = [];

  function addCheck(code, ok, severity, message, detail) {
    checks.push({ code: code, ok: ok, severity: severity, message: message, detail: detail });
    if (!ok && severity === 'ERROR') errors.push(message);
    if (!ok && severity === 'WARNING') warnings.push(message);
  }

  var cfgCols = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT_AUTOMATION_CONFIG)
    ? CBV_SCHEMA_MANIFEST.HOME_ALERT_AUTOMATION_CONFIG : [];
  var logCols = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT_AUTOMATION_RUN_LOG)
    ? CBV_SCHEMA_MANIFEST.HOME_ALERT_AUTOMATION_RUN_LOG : [];
  var snapCols = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT_DAILY_SNAPSHOT)
    ? CBV_SCHEMA_MANIFEST.HOME_ALERT_DAILY_SNAPSHOT : [];

  try {
    HomeAlertSafeAutomation_ensureSheets_();
    var h = _headers(_sheet(HomeAlertSafeAutomation_getConfigSheetName_()));
    var m1 = cfgCols.filter(function(c) { return h.indexOf(c) === -1; });
    addCheck('CONFIG_SHEET', m1.length === 0, m1.length ? 'ERROR' : 'OK', 'HOME_ALERT_AUTOMATION_CONFIG', { missing: m1 });
  } catch (e0) {
    addCheck('CONFIG_SHEET', false, 'ERROR', e0.message || String(e0), {});
  }

  try {
    var h2 = _headers(_sheet(HomeAlertSafeAutomation_getRunLogSheetName_()));
    var m2 = logCols.filter(function(c) { return h2.indexOf(c) === -1; });
    addCheck('RUN_LOG_SHEET', m2.length === 0, m2.length ? 'ERROR' : 'OK', 'HOME_ALERT_AUTOMATION_RUN_LOG', { missing: m2 });
  } catch (e0b) {
    addCheck('RUN_LOG_SHEET', false, 'ERROR', e0b.message || String(e0b), {});
  }

  try {
    var h3 = _headers(_sheet((typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.HOME_ALERT_DAILY_SNAPSHOT) ? CBV_CONFIG.SHEETS.HOME_ALERT_DAILY_SNAPSHOT : 'HOME_ALERT_DAILY_SNAPSHOT'));
    var m3 = snapCols.filter(function(c) { return h3.indexOf(c) === -1; });
    addCheck('SNAPSHOT_SHEET', m3.length === 0, m3.length ? 'ERROR' : 'OK', 'HOME_ALERT_DAILY_SNAPSHOT', { missing: m3 });
  } catch (e0c) {
    addCheck('SNAPSHOT_SHEET', false, 'ERROR', e0c.message || String(e0c), {});
  }

  try {
    var sd = HomeAlertSafeAutomation_seedDefaults();
    addCheck('SEED_DEFAULTS', true, 'OK', 'seedDefaults', sd);
  } catch (e1) {
    addCheck('SEED_DEFAULTS', false, 'ERROR', e1.message || String(e1), {});
  }

  addCheck('ALLOWLIST', HOME_ALERT_SAFE_AUTOMATION_ALLOWLIST.length >= 5, HOME_ALERT_SAFE_AUTOMATION_ALLOWLIST.length >= 5 ? 'OK' : 'ERROR', 'allowlist', HOME_ALERT_SAFE_AUTOMATION_ALLOWLIST);

  try {
    var v = HomeAlertSafeAutomation_validateNoForbiddenAutomation_();
    addCheck('FORBIDDEN_VALIDATION', v.ok, v.ok ? 'OK' : 'ERROR', 'forbidden scan', v);
    if (!v.ok) errors = errors.concat(v.errors || []);
  } catch (e2) {
    addCheck('FORBIDDEN_VALIDATION', false, 'ERROR', e2.message || String(e2), {});
  }

  var hc = null;
  try {
    hc = HomeAlertSafeAutomation_healthCheck();
    addCheck('HEALTH_CHECK', !!hc && hc.ok, hc && hc.ok ? 'OK' : 'WARNING', 'HomeAlertSafeAutomation_healthCheck', hc);
    if (hc && !hc.ok) warnings.push('healthCheck returned issues');
  } catch (e3) {
    addCheck('HEALTH_CHECK', false, 'ERROR', e3.message || String(e3), {});
  }

  var r1h = null;
  try {
    r1h = HomeAlertSafeAutomation_runOne('RUNTIME_HEALTH_CHECK', {});
    addCheck('RUN_ONE_HEALTH_VIA_CONFIG', !!r1h && r1h.ok && !r1h.skipped, r1h && r1h.ok && !r1h.skipped ? 'OK' : 'WARNING', 'runOne RUNTIME_HEALTH_CHECK', r1h);
    if (r1h && r1h.skipped) warnings.push('RUNTIME_HEALTH_CHECK skipped (ENABLED/SAFE_MODE/ALLOW_WRITE?)');
  } catch (e3b) {
    addCheck('RUN_ONE_HEALTH_VIA_CONFIG', false, 'ERROR', e3b.message || String(e3b), {});
  }

  var r1s = null;
  try {
    r1s = HomeAlertSafeAutomation_runOne('STUCK_DETECTION_DRY_RUN', {});
    addCheck('RUN_ONE_STUCK_DRY', !!r1s && r1s.ok && !r1s.skipped, r1s && r1s.ok && !r1s.skipped ? 'OK' : 'WARNING', 'runOne STUCK dry-run', r1s);
    if (r1s && r1s.output && Number(r1s.output.patched || 0) !== 0) {
      addCheck('STUCK_DRY_NO_WRITE', false, 'ERROR', 'STUCK dry-run must not patch rows', r1s.output);
      errors.push('STUCK dry-run patched rows');
    }
  } catch (e3c) {
    addCheck('RUN_ONE_STUCK_DRY', false, 'ERROR', e3c.message || String(e3c), {});
  }

  function HSA_triggerHandlerForbidden_(h) {
    var hl = String(h || '').toLowerCase();
    return hl.indexOf('autoassign') >= 0 || hl.indexOf('autoresolve') >= 0 || hl.indexOf('autoclose') >= 0
      || hl.indexOf('autoescalate') >= 0 || hl.indexOf('forceescalate') >= 0;
  }

  var trigBad = [];
  try {
    ScriptApp.getProjectTriggers().forEach(function(t) {
      var h = t.getHandlerFunction && t.getHandlerFunction();
      if (HSA_triggerHandlerForbidden_(h)) trigBad.push(h);
    });
    addCheck('NO_FORBIDDEN_TRIGGERS', trigBad.length === 0, trigBad.length ? 'ERROR' : 'OK', 'ScriptApp triggers', { handlers: trigBad });
    if (trigBad.length) errors.push('Forbidden trigger handler(s): ' + trigBad.join(', '));
  } catch (eTrig) {
    addCheck('NO_FORBIDDEN_TRIGGERS', false, 'WARNING', eTrig.message || String(eTrig), {});
  }

  var rd = null;
  var trigN0 = 0;
  var trigN1 = 0;
  try {
    trigN0 = ScriptApp.getProjectTriggers().length;
  } catch (eC0) {}
  try {
    rd = HomeAlertSafeAutomation_runDue();
    addCheck('RUN_DUE', !!rd && rd.ok, 'OK', 'runDue', { resultCount: (rd && rd.results) ? rd.results.length : 0 });
  } catch (e4) {
    addCheck('RUN_DUE', false, 'ERROR', e4.message || String(e4), {});
  }
  try {
    trigN1 = ScriptApp.getProjectTriggers().length;
    addCheck('RUN_DUE_NO_TRIGGER_INSTALL', trigN1 === trigN0, trigN1 === trigN0 ? 'OK' : 'ERROR', 'trigger count stable after runDue', { before: trigN0, after: trigN1 });
    if (trigN1 !== trigN0) errors.push('runDue changed trigger count (must not install triggers)');
  } catch (eC1) {
    addCheck('RUN_DUE_NO_TRIGGER_INSTALL', false, 'WARNING', eC1.message || String(eC1), {});
  }

  var bootNoTrig = true;
  addCheck('BOOTSTRAP_NO_AUTO_TRIGGER', bootNoTrig, 'OK', 'HomeAlert_bootstrap does not call installSafeTriggers (code review contract)', {});

  addCheck('INSTALL_FN', typeof HomeAlertSafeAutomation_installSafeTriggers === 'function', 'OK', 'installSafeTriggers exists', {});
  addCheck('REMOVE_FN', typeof HomeAlertSafeAutomation_removeSafeTriggers === 'function', 'OK', 'removeSafeTriggers exists', {});

  var badCfg = false;
  try {
    var cfgs = HomeAlertSafeAutomation_listConfigs();
    cfgs.forEach(function(r) {
      var fn = String(r.FUNCTION_NAME || '').trim();
      if (fn && HOME_ALERT_SAFE_AUTOMATION_ALLOWLIST.indexOf(fn) < 0) badCfg = true;
    });
    addCheck('NO_FORBIDDEN_FN_CONFIGURED', !badCfg, badCfg ? 'ERROR' : 'OK', 'all FUNCTION_NAME in allowlist', {});
    if (badCfg) errors.push('Config references non-allowlisted function');
  } catch (e5) {
    addCheck('NO_FORBIDDEN_FN_CONFIGURED', false, 'WARNING', e5.message || String(e5), {});
  }

  var snapGen = null;
  try {
    snapGen = HomeAlertDailyOperationalSnapshot_generate();
    addCheck('DAILY_SNAPSHOT', !!snapGen && snapGen.ok, snapGen && snapGen.ok ? 'OK' : 'ERROR', 'snapshot generate', snapGen);
  } catch (e6) {
    addCheck('DAILY_SNAPSHOT', false, 'ERROR', e6.message || String(e6), {});
  }

  addCheck('PHASE82', typeof HomeAlert_checkSlaRuntime === 'function', 'OK', 'Phase82', {});
  addCheck('PHASE83', typeof HomeAlertSlaPolicy_TestConsole_run === 'function', 'OK', 'Phase83', {});
  addCheck('MENU_PHASE84', typeof menuCbvTestConsoleHomeAlertSafeAutomation84 === 'function', 'OK', 'menuCbvTestConsoleHomeAlertSafeAutomation84', {});

  var envPre = null;
  try {
    envPre = HomeAlertSafeAutomation_validateEnvelope_({
      ok: true, phase: 1, status: 1, checkedAt: 1, runBy: 1, traceId: 1, testSuite: 1, summary: 1, checks: 1, warnings: 1, errors: 1, nextStep: 1, severity: 1, reportText: 1, reportJson: 1, contractVersion: 1, envelopeOk: 1
    });
    addCheck('ENVELOPE_HELPER', envPre && envPre.ok, 'OK', 'validateEnvelope_ contract keys', envPre);
  } catch (e7) {
    addCheck('ENVELOPE_HELPER', false, 'WARNING', e7.message || String(e7), {});
  }

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: 'PHASE_84_SAFE_OPERATIONAL_AUTOMATION_RUNTIME',
    status: status,
    severity: severity,
    checkedAt: cbvNow(),
    runBy: (typeof HomeAlert_actorId_ === 'function') ? HomeAlert_actorId_() : '',
    traceId: traceId,
    testSuite: 'HOME_ALERT_SAFE_AUTOMATION',
    summary: 'Safe automation runtime: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'GO'
      ? 'Optional: HomeAlertSafeAutomation_installSafeTriggers() after ops approval; never enable forbidden patterns in config.'
      : 'Fix errors then rerun HomeAlertSafeAutomation_TestConsole_run().',
    reportText: '',
    reportJson: { healthCheck: hc, runOneHealth: r1h, runOneStuck: r1s, runDue: rd, snapshot: snapGen, triggersBefore: trigN0, triggersAfter: trigN1 },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: false
  };

  var env = HomeAlertSafeAutomation_validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });
  if (!env.ok) {
    warnings.push('Envelope missing: ' + (env.missing || []).join(','));
    report.status = errors.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
    report.ok = errors.length === 0;
  }

  report.reportText = [
    '=== HOME_ALERT SAFE AUTOMATION (PHASE 84) ===',
    'status=' + report.status,
    'envelopeOk=' + report.envelopeOk
  ].join('\n');

  __HOME_ALERT_SAFE_AUTOMATION_TEST_CONSOLE_LAST_REPORT = report;
  Logger.log(report.reportText);
  return report;
}

function HomeAlertSafeAutomation_TestConsole_showReport() {
  var r = __HOME_ALERT_SAFE_AUTOMATION_TEST_CONSOLE_LAST_REPORT;
  if (!r) return { ok: false, message: 'No report. Run HomeAlertSafeAutomation_TestConsole_run() first.' };
  Logger.log(r.reportText || JSON.stringify(r, null, 2));
  return r;
}
