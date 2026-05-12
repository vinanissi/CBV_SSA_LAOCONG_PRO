/**
 * PHASE_80B — HOME_ALERT operational state runtime (extends PHASE_80A).
 *
 * Principles:
 * - GAS computes, Sheet stores, AppSheet displays.
 * - Idempotent refresh using SOURCE_HASH (dedupe).
 * - Append-only audit log via ADMIN_AUDIT_LOG (no delete of old alerts).
 * - No triggers created here; manual-first.
 */

// ===== Operational States =====

var HOME_ALERT_STATUS = {
  OPEN: 'OPEN',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_RESPONSE: 'WAITING_RESPONSE',
  ESCALATED: 'ESCALATED',
  RESOLVED: 'RESOLVED',
  AUTO_CLEARED: 'AUTO_CLEARED',
  EXPIRED: 'EXPIRED'
};

function HomeAlert_isActiveStatus_(status) {
  return [HOME_ALERT_STATUS.OPEN, HOME_ALERT_STATUS.ACKNOWLEDGED, HOME_ALERT_STATUS.IN_PROGRESS, HOME_ALERT_STATUS.WAITING_RESPONSE, HOME_ALERT_STATUS.ESCALATED].indexOf(String(status || '').trim()) >= 0;
}

function HomeAlert_isTerminalStatus_(status) {
  return [HOME_ALERT_STATUS.RESOLVED, HOME_ALERT_STATUS.AUTO_CLEARED, HOME_ALERT_STATUS.EXPIRED].indexOf(String(status || '').trim()) >= 0;
}

function HomeAlert_allowedTransitions_() {
  var S = HOME_ALERT_STATUS;
  return {
    OPEN: [S.ACKNOWLEDGED, S.IN_PROGRESS, S.WAITING_RESPONSE, S.ESCALATED, S.RESOLVED],
    ACKNOWLEDGED: [S.IN_PROGRESS, S.WAITING_RESPONSE, S.ESCALATED, S.RESOLVED],
    IN_PROGRESS: [S.WAITING_RESPONSE, S.ESCALATED, S.RESOLVED],
    WAITING_RESPONSE: [S.IN_PROGRESS, S.ESCALATED, S.RESOLVED],
    ESCALATED: [S.IN_PROGRESS, S.WAITING_RESPONSE, S.RESOLVED],
    RESOLVED: [],
    AUTO_CLEARED: [],
    EXPIRED: []
  };
}

function HomeAlert_bootstrap() {
  var traceId = HomeAlert_newTraceId_();

  // Prefer repo bootstrap mechanisms if present.
  try {
    if (typeof ensureAllSchemasImpl === 'function') ensureAllSchemasImpl();
    if (typeof ensureSchema === 'function') ensureSchema({ appendMissingColumns: true });
  } catch (e) {
    // Fallback to create HOME_ALERT only (minimal).
    HomeAlert_ensureHomeAlertSheet_();
  }

  HomeAlert_ensureHomeAlertSheet_();
  try {
    HomeAlert_ensureWorkloadSheet_();
  } catch (eW) {}

  try {
    if (typeof HomeAlertSlaPolicy_ensureSheet_ === 'function') HomeAlertSlaPolicy_ensureSheet_();
    if (typeof HomeAlertSlaMetrics_ensureSheet_ === 'function') HomeAlertSlaMetrics_ensureSheet_();
    if (typeof HomeAlertSlaPolicy_seedDefaults === 'function') HomeAlertSlaPolicy_seedDefaults();
  } catch (eP) {}

  try {
    if (typeof HomeAlertSafeAutomation_ensureSheets_ === 'function') HomeAlertSafeAutomation_ensureSheets_();
    if (typeof HomeAlertSafeAutomation_seedDefaults === 'function') HomeAlertSafeAutomation_seedDefaults();
    if (typeof HomeAlertDailyOperationalSnapshot_ensureSheet_ === 'function') HomeAlertDailyOperationalSnapshot_ensureSheet_();
  } catch (e84) {}

  try {
    if (typeof logAdminAudit === 'function') {
      logAdminAudit('HOME_ALERT_BOOTSTRAP', 'HOME_ALERT', 'HOME_ALERT', 'UPDATE', {}, { traceId: traceId }, 'HomeAlert_bootstrap ok');
    }
  } catch (e2) {}

  return { ok: true, traceId: traceId };
}

/**
 * Refresh alerts from sources and upsert into HOME_ALERT.
 *
 * Options (manual-first defaults):
 * - autoClearMissing: mark alerts not generated in this run as AUTO_CLEARED (default false)
 * - autoExpire: expire alerts when EXPIRES_AT < now (default false)
 */
function HomeAlert_refresh(options) {
  var traceId = HomeAlert_newTraceId_();
  var startedAt = cbvNow();
  HomeAlert_ensureHomeAlertSheet_();

  var opts = options || {};
  var autoClearMissing = opts.autoClearMissing === true;
  var autoExpire = opts.autoExpire === true;

  var generated = [];
  var stats = { traceId: traceId, generated: 0, upserted: 0, updated: 0, inserted: 0, autoCleared: 0, expired: 0, errors: [] };

  try {
    generated = generated.concat(HomeAlert_generateFromTask_(traceId));
  } catch (e1) { stats.errors.push('TASK: ' + (e1.message || String(e1))); }

  try {
    generated = generated.concat(HomeAlert_generateFromFinance_(traceId));
  } catch (e2) { stats.errors.push('FINANCE: ' + (e2.message || String(e2))); }

  try {
    generated = generated.concat(HomeAlert_generateFromLogs_(traceId));
  } catch (e3) { stats.errors.push('LOGS: ' + (e3.message || String(e3))); }

  stats.generated = generated.length;

  var generatedIds = {};
  generated.forEach(function(a) { generatedIds[String(a.ALERT_ID || '').trim()] = true; });

  generated.forEach(function(alert) {
    try {
      HomeAlert_enrichUxFields_(alert);
      var r = HomeAlert_upsertAlert_(alert, traceId);
      stats.upserted++;
      if (r && r.action === 'INSERT') stats.inserted++;
      if (r && r.action === 'UPDATE') stats.updated++;
    } catch (e) {
      stats.errors.push('UPSERT: ' + (e.message || String(e)));
    }
  });

  try {
    if (autoExpire) {
      stats.expired = HomeAlert_autoExpire_(traceId);
    }
  } catch (e5) {
    stats.errors.push('AUTO_EXPIRE: ' + (e5.message || String(e5)));
  }

  try {
    if (autoClearMissing) {
      stats.autoCleared = HomeAlert_autoClearMissing_(generatedIds, traceId);
    }
  } catch (e6) {
    stats.errors.push('AUTO_CLEAR: ' + (e6.message || String(e6)));
  }

  try {
    if (typeof logAdminAudit === 'function') {
      logAdminAudit(
        'HOME_ALERT_REFRESH',
        'HOME_ALERT',
        'HOME_ALERT',
        'UPDATE',
        { startedAt: startedAt },
        { finishedAt: cbvNow(), stats: stats },
        'HomeAlert_refresh traceId=' + traceId + ' generated=' + stats.generated + ' upserted=' + stats.upserted
      );
    }
  } catch (e4) {}

  return { ok: stats.errors.length === 0, traceId: traceId, stats: stats };
}

function HomeAlert_generateFromTask_(traceId) {
  var out = [];
  var now = new Date();
  var taskSheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_MAIN) ? CBV_CONFIG.SHEETS.TASK_MAIN : 'TASK_MAIN';
  var sheet = _sheet(taskSheetName);
  var rows = _rows(sheet);

  rows.forEach(function(t) {
    var id = String(t.ID || '').trim();
    if (!id) return;
    var status = String(t.STATUS || '').trim();
    if (['DONE', 'CANCELLED', 'ARCHIVED'].indexOf(status) >= 0) return;
    if (t.IS_DELETED === true || String(t.IS_DELETED) === 'true') return;

    var due = t.DUE_DATE;
    if (!due) return;
    var dueDt = (due instanceof Date) ? due : new Date(due);
    if (isNaN(dueDt.getTime())) return;

    var diffMs = now.getTime() - dueDt.getTime();
    if (diffMs <= 0) return;

    var overdueDays = Math.floor(diffMs / (24 * 3600 * 1000));
    var prio = String(t.PRIORITY || '').trim();
    var base = (prio === 'CAO' || prio === 'HIGH' || prio === 'URGENT') ? 80 : (prio === 'TRUNG_BINH' || prio === 'MEDIUM') ? 50 : 30;
    var score = base + Math.min(20, overdueDays * 2);

    var title = 'Task quá hạn: ' + (t.TITLE || id);
    var msg = 'Task ' + id + ' quá hạn ' + overdueDays + ' ngày. DUE_DATE=' + HomeAlert_fmtDate_(dueDt) + ' STATUS=' + status + ' PRIORITY=' + prio;

    out.push(HomeAlert_buildAlert_({
      alertCode: 'TASK_OVERDUE',
      alertType: 'WORKFLOW',
      severity: overdueDays >= 3 ? 'HIGH' : 'MEDIUM',
      priorityScore: score,
      title: title,
      message: msg,
      moduleCode: 'TASK',
      relatedEntityType: 'TASK_MAIN',
      relatedEntityId: id,
      relatedRecordUrl: '',
      actionLabel: 'Acknowledge',
      actionType: 'ACK_ALERT',
      actionPayload: { alertCode: 'TASK_OVERDUE', taskId: id },
      status: HOME_ALERT_STATUS.OPEN,
      isActive: true,
      isResolved: false,
      dueAt: dueDt,
      sortKey: 'TASK_OVERDUE_' + String(9999 - score),
      displayGroup: 'TASK',
      badgeText: overdueDays + 'd',
      badgeColor: overdueDays >= 3 ? 'Red' : 'Orange',
      traceId: traceId,
      sourceKey: ['TASK_OVERDUE', id, String(dueDt.getTime()), status, prio].join('|')
    }));
  });

  return out;
}

function HomeAlert_generateFromFinance_(traceId) {
  var out = [];
  var now = new Date();
  var finSheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.FINANCE_TRANSACTION) ? CBV_CONFIG.SHEETS.FINANCE_TRANSACTION : 'FINANCE_TRANSACTION';
  var sheet = _sheet(finSheetName);
  var rows = _rows(sheet);

  rows.forEach(function(f) {
    var id = String(f.ID || '').trim();
    if (!id) return;
    if (f.IS_DELETED === true || String(f.IS_DELETED) === 'true') return;

    var status = String(f.STATUS || '').trim();
    if (!status) return;
    if (['CONFIRMED', 'CANCELLED', 'ARCHIVED'].indexOf(status) >= 0) return;

    var transDate = f.TRANS_DATE;
    var transDt = transDate instanceof Date ? transDate : (transDate ? new Date(transDate) : null);
    if (!transDt || isNaN(transDt.getTime())) transDt = null;

    var ageDays = transDt ? Math.floor((now.getTime() - transDt.getTime()) / (24 * 3600 * 1000)) : 0;
    if (ageDays < 2) return;

    var amount = Number(f.AMOUNT || 0);
    var score = 60 + Math.min(20, ageDays * 2) + (amount >= 10000000 ? 10 : 0);
    var title = 'Finance chờ xác nhận: ' + (f.TRANS_CODE || id);
    var msg = 'Giao dịch ' + id + ' STATUS=' + status + ' AGE=' + ageDays + 'd' + (transDt ? ' TRANS_DATE=' + HomeAlert_fmtDate_(transDt) : '') + ' AMOUNT=' + amount;

    out.push(HomeAlert_buildAlert_({
      alertCode: 'FIN_UNCONFIRMED_OLD',
      alertType: 'DATA',
      severity: ageDays >= 7 ? 'HIGH' : 'MEDIUM',
      priorityScore: score,
      title: title,
      message: msg,
      moduleCode: 'FINANCE',
      relatedEntityType: 'FINANCE_TRANSACTION',
      relatedEntityId: id,
      relatedRecordUrl: '',
      actionLabel: 'Acknowledge',
      actionType: 'ACK_ALERT',
      actionPayload: { alertCode: 'FIN_UNCONFIRMED_OLD', financeId: id },
      status: HOME_ALERT_STATUS.OPEN,
      isActive: true,
      isResolved: false,
      dueAt: '',
      sortKey: 'FIN_UNCONFIRMED_OLD_' + String(9999 - score),
      displayGroup: 'FINANCE',
      badgeText: ageDays + 'd',
      badgeColor: ageDays >= 7 ? 'Red' : 'Orange',
      traceId: traceId,
      sourceKey: ['FIN_UNCONFIRMED_OLD', id, status, transDt ? String(transDt.getTime()) : ''].join('|')
    }));
  });

  return out;
}

function HomeAlert_generateFromLogs_(traceId) {
  var out = [];
  var patterns = ['ERROR', 'EXCEPTION', 'FAILED', 'CRITICAL'];
  var now = new Date();
  var windowDays = 3;

  function scanLog(sheetName, moduleCode) {
    var sheet = _sheet(sheetName);
    var rows = _rows(sheet);
    rows.forEach(function(r) {
      var id = String(r.ID || '').trim();
      if (!id) return;
      var note = String(r.NOTE || '').trim();
      if (!note) return;
      var noteUpper = note.toUpperCase();
      var hit = patterns.find(function(p) { return noteUpper.indexOf(p) >= 0; }) || '';
      if (!hit) return;

      var createdAt = r.CREATED_AT;
      var createdDt = createdAt instanceof Date ? createdAt : (createdAt ? new Date(createdAt) : null);
      if (createdDt && !isNaN(createdDt.getTime())) {
        var ageDays = Math.floor((now.getTime() - createdDt.getTime()) / (24 * 3600 * 1000));
        if (ageDays > windowDays) return;
      }

      var score = 40;
      var severity = hit === 'CRITICAL' ? 'HIGH' : 'MEDIUM';
      out.push(HomeAlert_buildAlert_({
        alertCode: moduleCode + '_LOG_NOTE_ERROR',
        alertType: 'RUNTIME',
        severity: severity,
        priorityScore: score,
        title: moduleCode + ' log note contains ' + hit,
        message: note.length > 300 ? note.slice(0, 300) + '…' : note,
        moduleCode: moduleCode,
        relatedEntityType: sheetName,
        relatedEntityId: id,
        relatedRecordUrl: '',
        actionLabel: 'Acknowledge',
        actionType: 'ACK_ALERT',
        actionPayload: { alertCode: moduleCode + '_LOG_NOTE_ERROR', logId: id, table: sheetName },
        status: HOME_ALERT_STATUS.OPEN,
        isActive: true,
        isResolved: false,
        dueAt: '',
        sortKey: moduleCode + '_LOG_' + id,
        displayGroup: 'RUNTIME',
        badgeText: hit,
        badgeColor: severity === 'HIGH' ? 'Red' : 'Orange',
        traceId: traceId,
        sourceKey: [moduleCode + '_LOG_NOTE_ERROR', sheetName, id, hit].join('|')
      }));
    });
  }

  var taskLog = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_UPDATE_LOG) ? CBV_CONFIG.SHEETS.TASK_UPDATE_LOG : 'TASK_UPDATE_LOG';
  var finLog = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.FINANCE_LOG) ? CBV_CONFIG.SHEETS.FINANCE_LOG : 'FINANCE_LOG';
  scanLog(taskLog, 'TASK');
  scanLog(finLog, 'FINANCE');

  return out;
}

function HomeAlert_upsertAlert_(alert, traceId) {
  var sheetName = HomeAlert_getSheetName_();
  var sheet = _sheet(sheetName);
  var rows = _rows(sheet);

  var byId = {};
  rows.forEach(function(r) { byId[String(r.ALERT_ID || '').trim()] = r; });

  var alertId = String(alert.ALERT_ID || '').trim();
  cbvAssert(alertId, 'Missing ALERT_ID');

  var existing = byId[alertId] || null;
  var now = cbvNow();

  if (existing) {
    var patch = HomeAlert_mergeIncomingWithExisting_(existing, alert);
    patch.UPDATED_AT = now;
    patch.TRACE_ID = traceId || patch.TRACE_ID || '';
    patch.STATE_CHANGED_AT = existing.STATE_CHANGED_AT || '';
    patch.STATE_CHANGED_BY = existing.STATE_CHANGED_BY || '';
    patch.ACKNOWLEDGED_AT = existing.ACKNOWLEDGED_AT || '';
    patch.ACKNOWLEDGED_BY = existing.ACKNOWLEDGED_BY || '';
    patch.ESCALATED_AT = existing.ESCALATED_AT || '';
    patch.AUTO_CLEARED_AT = existing.AUTO_CLEARED_AT || '';
    patch.AUTO_CLEARED_BY = existing.AUTO_CLEARED_BY || '';
    patch.EXPIRES_AT = existing.EXPIRES_AT || patch.EXPIRES_AT || '';
    patch.LAST_ACTION = existing.LAST_ACTION || '';
    if (existing.CREATED_AT) patch.CREATED_AT = existing.CREATED_AT;

    // Ensure UX fields match final merged operational status.
    var mergedForUx = {};
    Object.keys(existing).forEach(function(k) { mergedForUx[k] = existing[k]; });
    Object.keys(patch).forEach(function(k2) { mergedForUx[k2] = patch[k2]; });
    var uxPatch = HomeAlert_enrichUxFields_(mergedForUx);
    Object.keys(uxPatch).forEach(function(k3) { patch[k3] = uxPatch[k3]; });

    _updateRow(sheetName, existing._rowNumber, patch);
    return { action: 'UPDATE', alertId: alertId };
  }

  var record = {};
  Object.keys(alert).forEach(function(k) { record[k] = alert[k]; });
  if (!record.CREATED_AT) record.CREATED_AT = now;
  record.UPDATED_AT = now;
  record.TRACE_ID = traceId || record.TRACE_ID || '';
  record.STATE_CHANGED_AT = now;
  record.STATE_CHANGED_BY = (typeof mapCurrentUserEmailToInternalId === 'function' ? mapCurrentUserEmailToInternalId() : null) || cbvUser();
  record.LAST_ACTION = 'UPSERT_INSERT';

  // UX enrichment before insert.
  HomeAlert_enrichUxFields_(record);

  _appendRecord(sheetName, record);
  return { action: 'INSERT', alertId: alertId };
}

function HomeAlert_resolveAlert(alertId, note) {
  return HomeAlert_transitionAlert_(alertId, HOME_ALERT_STATUS.RESOLVED, { RESOLVED_AT: cbvNow(), RESOLVED_BY: HomeAlert_actorId_() }, note || '');
}

function HomeAlert_acknowledgeAlert(alertId, note) {
  return HomeAlert_transitionAlert_(alertId, HOME_ALERT_STATUS.ACKNOWLEDGED, { ACKNOWLEDGED_AT: cbvNow(), ACKNOWLEDGED_BY: HomeAlert_actorId_() }, note || '');
}

function HomeAlert_startProgress(alertId, note) {
  return HomeAlert_transitionAlert_(alertId, HOME_ALERT_STATUS.IN_PROGRESS, {}, note || '');
}

function HomeAlert_waitResponse(alertId, note) {
  return HomeAlert_transitionAlert_(alertId, HOME_ALERT_STATUS.WAITING_RESPONSE, {}, note || '');
}

function HomeAlert_escalateAlert(alertId, note) {
  return HomeAlert_transitionAlert_(alertId, HOME_ALERT_STATUS.ESCALATED, { ESCALATED_AT: cbvNow() }, note || '');
}

function HomeAlert_expireAlert(alertId, note) {
  return HomeAlert_transitionAlert_(alertId, HOME_ALERT_STATUS.EXPIRED, {}, note || 'expired');
}

function HomeAlert_autoClearAlert(alertId, note) {
  return HomeAlert_transitionAlert_(alertId, HOME_ALERT_STATUS.AUTO_CLEARED, { AUTO_CLEARED_AT: cbvNow(), AUTO_CLEARED_BY: HomeAlert_actorId_() }, note || 'auto-cleared');
}

function HomeAlert_healthCheck() {
  var traceId = HomeAlert_newTraceId_();
  var findings = [];
  try {
    HomeAlert_ensureHomeAlertSheet_();
  } catch (e) {
    findings.push({ code: 'HOME_ALERT_SHEET', severity: 'CRITICAL', message: e.message || String(e) });
  }

  // Basic dependencies check (read-only).
  ['TASK_MAIN', 'FINANCE_TRANSACTION', 'TASK_UPDATE_LOG', 'FINANCE_LOG'].forEach(function(t) {
    try {
      var mapped = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS[t]) ? CBV_CONFIG.SHEETS[t] : t;
      var s = SpreadsheetApp.getActive().getSheetByName(mapped);
      if (!s) findings.push({ code: 'SHEET_MISSING', severity: 'ERROR', message: 'Missing sheet: ' + t + ' (mapped=' + mapped + ')' });
    } catch (e2) {
      findings.push({ code: 'SHEET_CHECK', severity: 'ERROR', message: t + ': ' + (e2.message || String(e2)) });
    }
  });

  var ok = findings.filter(function(f) { return f.severity === 'CRITICAL' || f.severity === 'ERROR'; }).length === 0;
  return { ok: ok, traceId: traceId, findings: findings };
}

function HomeAlert_selfTest() {
  var traceId = HomeAlert_newTraceId_();
  var checks = [];
  var warnings = [];
  var errors = [];

  var h = HomeAlert_healthCheck();
  checks.push({ name: 'healthCheck', ok: h.ok, details: h });
  if (!h.ok) errors.push('Health check failed: ' + JSON.stringify(h.findings || []));

  // Bootstrap must not throw.
  try {
    var b = HomeAlert_bootstrap();
    checks.push({ name: 'bootstrap', ok: true, details: b });
  } catch (e1) {
    checks.push({ name: 'bootstrap', ok: false, details: { error: e1.message || String(e1) } });
    errors.push('Bootstrap exception: ' + (e1.message || String(e1)));
  }

  // Refresh must return stats.
  try {
    var r = HomeAlert_refresh({ autoClearMissing: false, autoExpire: false });
    checks.push({ name: 'refresh', ok: r.ok, details: { traceId: r.traceId, stats: r.stats } });
    if (!r.ok) warnings.push('Refresh had errors: ' + JSON.stringify(r.stats.errors || []));
  } catch (e2) {
    checks.push({ name: 'refresh', ok: false, details: { error: e2.message || String(e2) } });
    errors.push('Refresh exception: ' + (e2.message || String(e2)));
  }

  try {
    var s = HomeAlert_validateStateMachine_();
    checks.push({ name: 'stateMachine', ok: s.ok, details: s });
    if (!s.ok) errors.push('State machine invalid: ' + JSON.stringify(s.errors || []));
  } catch (e3) {
    checks.push({ name: 'stateMachine', ok: false, details: { error: e3.message || String(e3) } });
    errors.push('State machine exception: ' + (e3.message || String(e3)));
  }

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  return {
    ok: status !== 'FAIL',
    phase: 'PHASE_80B_HOME_ALERT_OPERATIONAL_STATE_RUNTIME',
    status: status,
    severity: severity,
    checkedAt: cbvNow(),
    runBy: (typeof mapCurrentUserEmailToInternalId === 'function' ? mapCurrentUserEmailToInternalId() : null) || cbvUser(),
    traceId: traceId,
    testSuite: 'HOME_ALERT_RUNTIME',
    summary: 'HOME_ALERT runtime self-test: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'GO' ? 'Manual AppSheet setup: add HOME_ALERT table + operational actions (ACK/IN_PROGRESS/WAIT/ESCALATE/RESOLVE).' : 'Fix errors then rerun HomeAlert_selfTest().',
    reportText: '',
    reportJson: { health: h },
    contractVersion: 'CBV_TEST_CONSOLE_V1'
  };
}

// ===== HOME_ALERT UX Test Console (separate) =====

var __HOME_ALERT_UX_TEST_CONSOLE_LAST_REPORT = null;

function HomeAlertUx_TestConsole_run() {
  var traceId = HomeAlert_newTraceId_();
  var checks = [];
  var warnings = [];
  var errors = [];

  try {
    var s = HomeAlertUx_checkSchema_();
    checks.push({ name: 'schemaUxColumns', ok: s.ok, details: s });
    if (!s.ok) errors = errors.concat(s.errors || []);
  } catch (e1) {
    checks.push({ name: 'schemaUxColumns', ok: false, details: { error: e1.message || String(e1) } });
    errors.push('Schema check exception: ' + (e1.message || String(e1)));
  }

  try {
    var sm = HomeAlert_validateStateMachine_();
    checks.push({ name: 'stateMachine', ok: sm.ok, details: sm });
    if (!sm.ok) errors.push('State machine invalid: ' + JSON.stringify(sm.errors || []));
  } catch (e2) {
    checks.push({ name: 'stateMachine', ok: false, details: { error: e2.message || String(e2) } });
    errors.push('State machine exception: ' + (e2.message || String(e2)));
  }

  var refreshResult = null;
  try {
    refreshResult = HomeAlert_refresh({ autoClearMissing: false, autoExpire: false });
    checks.push({ name: 'refresh', ok: refreshResult.ok, details: refreshResult.stats });
    if (!refreshResult.ok) warnings.push('Refresh had errors: ' + JSON.stringify(refreshResult.stats.errors || []));
  } catch (e3) {
    checks.push({ name: 'refresh', ok: false, details: { error: e3.message || String(e3) } });
    errors.push('Refresh exception: ' + (e3.message || String(e3)));
  }

  try {
    var v = HomeAlertUx_validateUxOutput_();
    checks.push({ name: 'uxOutput', ok: v.ok, details: v });
    if (!v.ok) errors = errors.concat(v.errors || []);
    warnings = warnings.concat(v.warnings || []);
  } catch (e4) {
    checks.push({ name: 'uxOutput', ok: false, details: { error: e4.message || String(e4) } });
    errors.push('UX validate exception: ' + (e4.message || String(e4)));
  }

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: 'PHASE_80C_HOME_ALERT_OPERATIONAL_UX_RUNTIME',
    status: status,
    severity: severity,
    checkedAt: cbvNow(),
    runBy: HomeAlert_actorId_(),
    traceId: traceId,
    testSuite: 'HOME_ALERT_UX_RUNTIME',
    summary: 'HOME_ALERT UX runtime test: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'GO' ? 'Update AppSheet Deck view to use DISPLAY_* and CARD_* fields; hide raw fields.' : 'Fix errors and rerun HomeAlertUx_TestConsole_run().',
    reportText: '',
    reportJson: { refresh: refreshResult },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: true
  };

  report.reportText = HomeAlertUx_formatReportText_(report);
  __HOME_ALERT_UX_TEST_CONSOLE_LAST_REPORT = report;
  Logger.log(report.reportText);
  return report;
}

function HomeAlertUx_TestConsole_showReport() {
  var r = __HOME_ALERT_UX_TEST_CONSOLE_LAST_REPORT;
  if (!r) return { ok: false, message: 'No report. Run HomeAlertUx_TestConsole_run() first.' };
  Logger.log(r.reportText || JSON.stringify(r, null, 2));
  return r;
}

function HomeAlertUx_TestConsole_copyAiHandoff() {
  var r = __HOME_ALERT_UX_TEST_CONSOLE_LAST_REPORT;
  if (!r) return 'No report. Run HomeAlertUx_TestConsole_run() first.';
  var text = [
    'PHASE: ' + r.phase,
    'STATUS: ' + r.status,
    'SEVERITY: ' + r.severity,
    'TRACE: ' + r.traceId,
    'CHECKED_AT: ' + r.checkedAt,
    'SUMMARY: ' + r.summary,
    'WARNINGS: ' + JSON.stringify(r.warnings || []),
    'ERRORS: ' + JSON.stringify(r.errors || []),
    'NEXT_STEP: ' + r.nextStep
  ].join('\n');
  Logger.log(text);
  return text;
}

function HomeAlertUx_checkSchema_() {
  var requiredUx = [
    'DISPLAY_TITLE', 'DISPLAY_SUBTITLE', 'DISPLAY_SUMMARY', 'DISPLAY_FOOTER',
    'DISPLAY_ICON', 'DISPLAY_COLOR', 'DISPLAY_ACTION_TEXT',
    'CARD_GROUP', 'CARD_SORT', 'UX_VISIBLE', 'UX_GROUP_ORDER'
  ];
  var sheetName = HomeAlert_getSheetName_();
  var sheet = _sheet(sheetName);
  var headers = _headers(sheet);
  var missing = requiredUx.filter(function(c) { return headers.indexOf(c) === -1; });
  return { ok: missing.length === 0, sheet: sheetName, missing: missing, errors: missing.map(function(c) { return 'Missing UX column: ' + c; }) };
}

function HomeAlertUx_validateUxOutput_() {
  var sheetName = HomeAlert_getSheetName_();
  var rows = _rows(_sheet(sheetName));
  var errors = [];
  var warnings = [];

  if (!rows || rows.length === 0) {
    warnings.push('HOME_ALERT has no rows; cannot validate UX outputs on data.');
    return { ok: true, warnings: warnings, errors: errors, sampleChecked: 0 };
  }

  var active = rows.filter(function(r) { return HomeAlert_isActiveStatus_(String(r.STATUS || '').trim()); });
  var sample = (active.length ? active : rows).slice(0, 20);

  sample.forEach(function(r) {
    var id = String(r.ALERT_ID || '').trim();
    if (!String(r.DISPLAY_TITLE || '').trim()) errors.push('DISPLAY_TITLE empty for ' + id);
    if (!String(r.DISPLAY_SUMMARY || '').trim()) errors.push('DISPLAY_SUMMARY empty for ' + id);
    if (!String(r.CARD_GROUP || '').trim()) errors.push('CARD_GROUP empty for ' + id);
    if (!String(r.CARD_SORT || '').trim()) errors.push('CARD_SORT empty for ' + id);
  });

  // Duplicate checks
  var seenId = {};
  var dupIds = 0;
  rows.forEach(function(r) {
    var id = String(r.ALERT_ID || '').trim();
    if (!id) return;
    if (seenId[id]) dupIds++;
    else seenId[id] = true;
  });
  if (dupIds > 0) errors.push('Duplicate ALERT_ID count=' + dupIds);

  return { ok: errors.length === 0, warnings: warnings, errors: errors, sampleChecked: sample.length };
}

function HomeAlertUx_formatReportText_(r) {
  var lines = [];
  lines.push('=== HOME_ALERT UX TEST CONSOLE ===');
  lines.push('phase=' + r.phase);
  lines.push('status=' + r.status + ' severity=' + r.severity);
  lines.push('checkedAt=' + r.checkedAt + ' runBy=' + r.runBy);
  lines.push('traceId=' + r.traceId);
  lines.push('summary=' + r.summary);
  lines.push('checks=' + (r.checks ? r.checks.length : 0));
  (r.checks || []).forEach(function(c) { lines.push('- ' + c.name + ': ' + (c.ok ? 'OK' : 'FAIL')); });
  if ((r.warnings || []).length) lines.push('warnings=' + JSON.stringify(r.warnings, null, 2));
  if ((r.errors || []).length) lines.push('errors=' + JSON.stringify(r.errors, null, 2));
  lines.push('nextStep=' + r.nextStep);
  return lines.join('\n');
}

// ===== Test Console (separate, not in business menu) =====

var __HOME_ALERT_TEST_CONSOLE_LAST_REPORT = null;

function HomeAlert_TestConsole_run() {
  var report = HomeAlert_selfTest();
  report.reportText = HomeAlert_TestConsole_formatReportText_(report);
  __HOME_ALERT_TEST_CONSOLE_LAST_REPORT = report;
  Logger.log(report.reportText);
  return report;
}

function HomeAlert_TestConsole_showReport() {
  var r = __HOME_ALERT_TEST_CONSOLE_LAST_REPORT;
  if (!r) return { ok: false, message: 'No report. Run HomeAlert_TestConsole_run() first.' };
  Logger.log(r.reportText || JSON.stringify(r, null, 2));
  return r;
}

function HomeAlert_TestConsole_copyAiHandoff() {
  var r = __HOME_ALERT_TEST_CONSOLE_LAST_REPORT;
  if (!r) return 'No report. Run HomeAlert_TestConsole_run() first.';
  var text = [
    'PHASE: ' + r.phase,
    'STATUS: ' + r.status,
    'SEVERITY: ' + r.severity,
    'TRACE: ' + r.traceId,
    'CHECKED_AT: ' + r.checkedAt,
    'SUMMARY: ' + r.summary,
    'WARNINGS: ' + JSON.stringify(r.warnings || []),
    'ERRORS: ' + JSON.stringify(r.errors || []),
    'NEXT_STEP: ' + r.nextStep
  ].join('\n');
  Logger.log(text);
  return text;
}

// ===== Internals =====

function HomeAlert_getSheetName_() {
  return (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.HOME_ALERT) ? CBV_CONFIG.SHEETS.HOME_ALERT : 'HOME_ALERT';
}

function HomeAlert_ensureHomeAlertSheet_() {
  var ss = SpreadsheetApp.getActive();
  var name = HomeAlert_getSheetName_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    var headers = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT) ? CBV_SCHEMA_MANIFEST.HOME_ALERT : null;
    cbvAssert(headers && headers.length > 0, 'Missing CBV_SCHEMA_MANIFEST.HOME_ALERT');
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return { created: true, name: name };
  }
  return { created: false, name: name };
}

function HomeAlert_buildAlert_(p) {
  var sourceHash = HomeAlert_hashHex_(String(p.sourceKey || ''));
  var alertId = 'HAL_' + sourceHash.slice(0, 16);
  return {
    ALERT_ID: alertId,
    ALERT_CODE: p.alertCode || '',
    ALERT_TYPE: p.alertType || '',
    SEVERITY: p.severity || '',
    PRIORITY_SCORE: p.priorityScore || 0,
    TITLE: p.title || '',
    MESSAGE: p.message || '',
    MODULE_CODE: p.moduleCode || '',
    RELATED_ENTITY_TYPE: p.relatedEntityType || '',
    RELATED_ENTITY_ID: p.relatedEntityId || '',
    RELATED_RECORD_URL: p.relatedRecordUrl || '',
    ACTION_LABEL: p.actionLabel || '',
    ACTION_TYPE: p.actionType || '',
    ACTION_PAYLOAD_JSON: JSON.stringify(p.actionPayload || {}),
    STATUS: p.status || HOME_ALERT_STATUS.OPEN,
    IS_ACTIVE: p.isActive === true,
    IS_RESOLVED: p.isResolved === true,
    CREATED_AT: '',
    UPDATED_AT: '',
    DUE_AT: p.dueAt || '',
    ASSIGNED_TO: p.assignedTo || '',
    SORT_KEY: p.sortKey || '',
    DISPLAY_GROUP: p.displayGroup || '',
    BADGE_TEXT: p.badgeText || '',
    BADGE_COLOR: p.badgeColor || '',
    TRACE_ID: p.traceId || '',
    SOURCE_HASH: sourceHash,
    RESOLVED_AT: '',
    RESOLVED_BY: '',
    NOTE: '',
    ACKNOWLEDGED_AT: '',
    ACKNOWLEDGED_BY: '',
    STATE_CHANGED_AT: '',
    STATE_CHANGED_BY: '',
    ESCALATED_AT: '',
    EXPIRES_AT: p.expiresAt || '',
    AUTO_CLEARED_AT: '',
    AUTO_CLEARED_BY: '',
    LAST_ACTION: '',
    DISPLAY_TITLE: '',
    DISPLAY_SUBTITLE: '',
    DISPLAY_STATUS: '',
    DISPLAY_BADGE: '',
    DISPLAY_ICON: '',
    DISPLAY_COLOR: '',
    DISPLAY_ACTION_TEXT: '',
    DISPLAY_PRIORITY_LABEL: '',
    DISPLAY_TIME_AGO: '',
    DISPLAY_ASSIGNEE: '',
    DISPLAY_SUMMARY: '',
    DISPLAY_FOOTER: '',
    CARD_GROUP: '',
    CARD_SORT: '',
    CARD_LAYOUT: '',
    UX_VISIBLE: '',
    UX_GROUP_ORDER: '',
    UX_ACTION_HINT: '',
    DESKTOP_TITLE: '',
    DESKTOP_SUBTITLE: '',
    DESKTOP_PRIMARY_LINE: '',
    DESKTOP_SECONDARY_LINE: '',
    DESKTOP_META_LINE: '',
    DESKTOP_ACTION_LINE: '',
    DESKTOP_DETAIL_TITLE: '',
    DESKTOP_DETAIL_SUMMARY: '',
    DESKTOP_DETAIL_CONTEXT: '',
    DESKTOP_DETAIL_NEXT_ACTION: '',
    DESKTOP_DETAIL_DEBUG_VISIBLE: false,
    DESKTOP_GROUP: '',
    DESKTOP_SORT: '',
    DESKTOP_IS_OPERATOR_VIEW: true,
    ATTENTION_LEVEL: '',
    ATTENTION_LABEL: '',
    ATTENTION_ICON: '',
    ATTENTION_COLOR: '',
    ATTENTION_REASON: '',
    ACTION_FOCUS: '',
    ACTION_HINT: '',
    ACTION_PRIORITY: 0,
    OWNER_LABEL: '',
    OWNER_QUEUE: '',
    OPERATOR_PRIMARY_TEXT: '',
    OPERATOR_SECONDARY_TEXT: '',
    OPERATOR_META_TEXT: '',
    OPERATOR_NEXT_ACTION: '',
    OPERATOR_HIDE_SORT_KEYS: true,
    ASSIGNMENT_STATUS: '',
    ASSIGNMENT_QUEUE: '',
    ASSIGNED_TO_LABEL: '',
    ASSIGNED_TEAM: '',
    ASSIGNED_TEAM_LABEL: '',
    ASSIGNED_BY: '',
    ASSIGNMENT_NOTE: '',
    CLAIMED_AT: '',
    CLAIMED_BY: '',
    LAST_OPERATOR_ACTION: '',
    LAST_OPERATOR_ACTION_AT: '',
    LAST_OPERATOR_ACTION_BY: '',
    ESCALATE_AFTER_AT: '',
    IS_STUCK: false,
    STUCK_REASON: '',
    IS_BLOCKED: false,
    BLOCKED_REASON: '',
    QUEUE_GROUP: '',
    QUEUE_LABEL: '',
    QUEUE_SORT: '',
    WORKLOAD_KEY: '',
    OPERATOR_DASHBOARD_GROUP: '',
    OPERATOR_DASHBOARD_SORT: '',
    SLA_POLICY: p.slaPolicy || (p.dueAt ? 'USE_DUE_AT' : ''),
    SLA_TARGET_MINUTES: '',
    SLA_DUE_AT: '',
    SLA_STATUS: '',
    SLA_BREACH_LEVEL: 0,
    SLA_ELAPSED_MINUTES: '',
    SLA_LAST_CHECKED_AT: '',
    SLA_NEXT_REVIEW_AT: '',
    ESCALATION_LEVEL: 0,
    ESCALATION_STATUS: 'NONE',
    ESCALATION_REASON: '',
    ESCALATED_BY: '',
    ESCALATED_TO: '',
    LAST_ESCALATION_CHECK_AT: '',
    ESCALATION_NEXT_ACTION: '',
    ESCALATION_TRACE_ID: ''
  };
}

function HomeAlert_newTraceId_() {
  return 'TRACE_HOME_ALERT_' + Utilities.getUuid();
}

function HomeAlert_hashHex_(input) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  return bytes.map(function(b) {
    var v = (b < 0 ? b + 256 : b);
    var s = v.toString(16);
    return s.length === 1 ? '0' + s : s;
  }).join('');
}

function HomeAlert_fmtDate_(d) {
  try {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  } catch (e) {
    return String(d);
  }
}

function HomeAlert_TestConsole_formatReportText_(r) {
  var lines = [];
  lines.push('=== HOME_ALERT TEST CONSOLE ===');
  lines.push('phase=' + r.phase);
  lines.push('status=' + r.status + ' severity=' + r.severity);
  lines.push('checkedAt=' + r.checkedAt + ' runBy=' + r.runBy);
  lines.push('traceId=' + r.traceId);
  lines.push('summary=' + r.summary);
  lines.push('checks=' + (r.checks ? r.checks.length : 0));
  (r.checks || []).forEach(function(c) { lines.push('- ' + c.name + ': ' + (c.ok ? 'OK' : 'FAIL')); });
  if ((r.warnings || []).length) lines.push('warnings=' + JSON.stringify(r.warnings, null, 2));
  if ((r.errors || []).length) lines.push('errors=' + JSON.stringify(r.errors, null, 2));
  lines.push('nextStep=' + r.nextStep);
  return lines.join('\n');
}

function HomeAlert_actorId_() {
  return (typeof mapCurrentUserEmailToInternalId === 'function' ? mapCurrentUserEmailToInternalId() : null) || cbvUser();
}

/**
 * Enrich UX/display fields for an alert record.
 * Mutates the alert object and also returns a patch of UX fields.
 */
function HomeAlert_enrichUxFields_(alert) {
  var a = alert || {};
  var status = String(a.STATUS || '').trim() || HOME_ALERT_STATUS.OPEN;
  var severity = String(a.SEVERITY || '').trim();
  var moduleCode = String(a.MODULE_CODE || '').trim();
  var alertCode = String(a.ALERT_CODE || '').trim();

  var icon = HomeAlert_getDisplayIcon_(severity, moduleCode, alertCode);
  var color = HomeAlert_getDisplayColor_(severity, status);
  var actionText = HomeAlert_getDisplayActionText_(status);
  var priorityLabel = HomeAlert_getDisplayPriorityLabel_(Number(a.PRIORITY_SCORE || 0), severity);
  var timeAgo = HomeAlert_buildDisplayTimeAgo_(a);

  var displayTitle = HomeAlert_buildDisplayTitle_(a, icon);
  var displaySubtitle = HomeAlert_buildDisplaySubtitle_(a);
  var displaySummary = HomeAlert_buildDisplaySummary_(a, timeAgo, priorityLabel);
  var displayFooter = HomeAlert_buildDisplayFooter_(a);

  var group = HomeAlert_getCardGroup_(a);
  var sort = HomeAlert_getCardSort_(a);

  var uxVisible = HomeAlert_isActiveStatus_(status);
  var groupOrder = HomeAlert_getUxGroupOrder_(a);
  var actionHint = HomeAlert_getUxActionHint_(status);

  var patch = {
    DISPLAY_TITLE: displayTitle,
    DISPLAY_SUBTITLE: displaySubtitle,
    DISPLAY_STATUS: status,
    DISPLAY_BADGE: severity || '',
    DISPLAY_ICON: icon,
    DISPLAY_COLOR: color,
    DISPLAY_ACTION_TEXT: actionText,
    DISPLAY_PRIORITY_LABEL: priorityLabel,
    DISPLAY_TIME_AGO: timeAgo,
    DISPLAY_ASSIGNEE: String(a.ASSIGNED_TO || '').trim(),
    DISPLAY_SUMMARY: displaySummary,
    DISPLAY_FOOTER: displayFooter,
    CARD_GROUP: group,
    CARD_SORT: sort,
    CARD_LAYOUT: 'STANDARD',
    UX_VISIBLE: uxVisible === true,
    UX_GROUP_ORDER: groupOrder,
    UX_ACTION_HINT: actionHint
  };

  Object.keys(patch).forEach(function(k) { a[k] = patch[k]; });

  // PHASE 80D — enrich desktop operational workspace fields on top of base UX.
  var desktopPatch = HomeAlert_enrichDesktopUxFields_(a);
  Object.keys(desktopPatch).forEach(function(dk) { patch[dk] = desktopPatch[dk]; });

  return patch;
}

function HomeAlert_buildDisplayTitle_(alert, icon) {
  var a = alert || {};
  var code = String(a.ALERT_CODE || '').trim();
  var base;
  if (code === 'TASK_OVERDUE') base = 'Task quá hạn';
  else if (code === 'FIN_UNCONFIRMED_OLD') base = 'Finance chờ xác nhận';
  else if (code && code.indexOf('_LOG_NOTE_ERROR') >= 0) base = 'Lỗi runtime log';
  else base = String(a.TITLE || 'Cảnh báo').trim();
  return (icon ? (icon + ' ') : '') + base;
}

function HomeAlert_buildDisplaySubtitle_(alert) {
  var a = alert || {};
  var title = String(a.TITLE || '').trim();
  if (title) return title;
  var ent = String(a.RELATED_ENTITY_TYPE || '').trim();
  var id = String(a.RELATED_ENTITY_ID || '').trim();
  return [ent, id].filter(Boolean).join(' · ');
}

function HomeAlert_buildDisplaySummary_(alert, timeAgo, priorityLabel) {
  var a = alert || {};
  var status = String(a.STATUS || '').trim();
  var sev = String(a.SEVERITY || '').trim();
  var prio = priorityLabel || '';
  var bits = [];
  if (timeAgo) bits.push(timeAgo);
  if (prio) bits.push(prio);
  if (sev) bits.push(sev);
  if (status) bits.push(status);
  return bits.join(' · ');
}

function HomeAlert_buildDisplayFooter_(alert) {
  var a = alert || {};
  var moduleCode = String(a.MODULE_CODE || '').trim();
  var assignee = String(a.ASSIGNED_TO || '').trim();
  var hint = HomeAlert_getUxActionHint_(String(a.STATUS || '').trim());
  return [moduleCode, assignee, hint].filter(Boolean).join(' · ');
}

function HomeAlert_getDisplayIcon_(severity, moduleCode, alertCode) {
  var s = String(severity || '').trim().toUpperCase();
  if (s === 'HIGH' || s === 'CRITICAL') return '🔴';
  if (s === 'MEDIUM') return '🟠';
  if (s === 'LOW') return '🟡';
  if (moduleCode === 'TASK') return '🧩';
  if (moduleCode === 'FINANCE') return '💰';
  if (String(alertCode || '').indexOf('_LOG_NOTE_ERROR') >= 0) return '🧯';
  return 'ℹ️';
}

function HomeAlert_getDisplayColor_(severity, status) {
  var st = String(status || '').trim();
  if (HomeAlert_isTerminalStatus_(st)) return 'Gray';
  var s = String(severity || '').trim().toUpperCase();
  if (s === 'HIGH' || s === 'CRITICAL') return 'Red';
  if (s === 'MEDIUM') return 'Orange';
  if (s === 'LOW') return 'Yellow';
  return 'Blue';
}

function HomeAlert_getDisplayActionText_(status) {
  var st = String(status || '').trim();
  if (st === HOME_ALERT_STATUS.OPEN) return 'Nhận xử lý';
  if (st === HOME_ALERT_STATUS.ACKNOWLEDGED) return 'Bắt đầu';
  if (st === HOME_ALERT_STATUS.IN_PROGRESS) return 'Cập nhật';
  if (st === HOME_ALERT_STATUS.WAITING_RESPONSE) return 'Tiếp tục';
  if (st === HOME_ALERT_STATUS.ESCALATED) return 'Xử lý';
  if (st === HOME_ALERT_STATUS.RESOLVED) return 'Đã xong';
  if (st === HOME_ALERT_STATUS.AUTO_CLEARED) return 'Auto cleared';
  if (st === HOME_ALERT_STATUS.EXPIRED) return 'Expired';
  return '';
}

function HomeAlert_getUxActionHint_(status) {
  var st = String(status || '').trim();
  if (st === HOME_ALERT_STATUS.OPEN) return 'cần nhận xử lý';
  if (st === HOME_ALERT_STATUS.ACKNOWLEDGED) return 'đã nhận';
  if (st === HOME_ALERT_STATUS.IN_PROGRESS) return 'đang xử lý';
  if (st === HOME_ALERT_STATUS.WAITING_RESPONSE) return 'chờ phản hồi';
  if (st === HOME_ALERT_STATUS.ESCALATED) return 'đã escalated';
  if (st === HOME_ALERT_STATUS.RESOLVED) return 'đã resolved';
  if (st === HOME_ALERT_STATUS.AUTO_CLEARED) return 'auto cleared';
  if (st === HOME_ALERT_STATUS.EXPIRED) return 'đã expired';
  return '';
}

function HomeAlert_getDisplayPriorityLabel_(priorityScore, severity) {
  var score = Number(priorityScore || 0);
  var s = String(severity || '').trim().toUpperCase();
  if (s === 'HIGH' || s === 'CRITICAL' || score >= 80) return 'HIGH';
  if (s === 'MEDIUM' || score >= 50) return 'MEDIUM';
  if (s === 'LOW' || score > 0) return 'LOW';
  return '';
}

function HomeAlert_buildDisplayTimeAgo_(alert) {
  var a = alert || {};
  var dt = a.UPDATED_AT || a.CREATED_AT || '';
  var d = dt instanceof Date ? dt : (dt ? new Date(dt) : null);
  if (!d || isNaN(d.getTime())) return '';
  var diff = Math.floor((new Date().getTime() - d.getTime()) / 1000);
  if (diff < 60) return diff + 's ago';
  var m = Math.floor(diff / 60);
  if (m < 60) return m + 'm ago';
  var h = Math.floor(m / 60);
  if (h < 48) return h + 'h ago';
  var days = Math.floor(h / 24);
  return days + 'd ago';
}

function HomeAlert_getCardGroup_(alert) {
  var a = alert || {};
  var sev = String(a.SEVERITY || '').trim().toUpperCase();
  if (sev === 'HIGH' || sev === 'CRITICAL') return '🚨 Khẩn cấp';
  if (sev === 'MEDIUM') return '⚠️ Cần chú ý';
  if (sev === 'LOW') return '🟡 Theo dõi';
  return 'ℹ️ Thông tin';
}

function HomeAlert_getUxGroupOrder_(alert) {
  var a = alert || {};
  var sev = String(a.SEVERITY || '').trim().toUpperCase();
  if (sev === 'HIGH' || sev === 'CRITICAL') return 1;
  if (sev === 'MEDIUM') return 2;
  if (sev === 'LOW') return 3;
  return 9;
}

function HomeAlert_getCardSort_(alert) {
  var a = alert || {};
  var score = Number(a.PRIORITY_SCORE || 0);
  var inv = Math.max(0, 999999 - Math.floor(score));
  var invStr = String(inv);
  while (invStr.length < 6) invStr = '0' + invStr;
  var d = a.UPDATED_AT || a.CREATED_AT || cbvNow();
  var dt = d instanceof Date ? d : (d ? new Date(d) : new Date());
  var ts = Utilities.formatDate(dt, Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  var id = String(a.ALERT_ID || '').trim();
  return invStr + '_' + ts + (id ? '_' + id : '');
}

function HomeAlert_mergeIncomingWithExisting_(existing, incoming) {
  var exStatus = String(existing.STATUS || '').trim();
  var patch = {};

  // Always refresh "computed" presentation fields.
  [
    'ALERT_CODE', 'ALERT_TYPE', 'SEVERITY', 'PRIORITY_SCORE', 'TITLE', 'MESSAGE',
    'MODULE_CODE', 'RELATED_ENTITY_TYPE', 'RELATED_ENTITY_ID', 'RELATED_RECORD_URL',
    'ACTION_LABEL', 'ACTION_TYPE', 'ACTION_PAYLOAD_JSON',
    'SORT_KEY', 'DISPLAY_GROUP', 'BADGE_TEXT', 'BADGE_COLOR', 'SOURCE_HASH',
    'DISPLAY_TITLE', 'DISPLAY_SUBTITLE', 'DISPLAY_STATUS', 'DISPLAY_BADGE', 'DISPLAY_ICON', 'DISPLAY_COLOR',
    'DISPLAY_ACTION_TEXT', 'DISPLAY_PRIORITY_LABEL', 'DISPLAY_TIME_AGO', 'DISPLAY_ASSIGNEE', 'DISPLAY_SUMMARY', 'DISPLAY_FOOTER',
    'CARD_GROUP', 'CARD_SORT', 'CARD_LAYOUT', 'UX_VISIBLE', 'UX_GROUP_ORDER', 'UX_ACTION_HINT',
    'DESKTOP_TITLE', 'DESKTOP_SUBTITLE', 'DESKTOP_PRIMARY_LINE', 'DESKTOP_SECONDARY_LINE',
    'DESKTOP_META_LINE', 'DESKTOP_ACTION_LINE',
    'DESKTOP_DETAIL_TITLE', 'DESKTOP_DETAIL_SUMMARY', 'DESKTOP_DETAIL_CONTEXT', 'DESKTOP_DETAIL_NEXT_ACTION',
    'DESKTOP_DETAIL_DEBUG_VISIBLE',
    'DESKTOP_GROUP', 'DESKTOP_SORT', 'DESKTOP_IS_OPERATOR_VIEW',
    'ATTENTION_LEVEL', 'ATTENTION_LABEL', 'ATTENTION_ICON', 'ATTENTION_COLOR', 'ATTENTION_REASON',
    'ACTION_FOCUS', 'ACTION_HINT', 'ACTION_PRIORITY',
    'OWNER_LABEL', 'OWNER_QUEUE',
    'OPERATOR_PRIMARY_TEXT', 'OPERATOR_SECONDARY_TEXT', 'OPERATOR_META_TEXT', 'OPERATOR_NEXT_ACTION',
    'OPERATOR_HIDE_SORT_KEYS',
    'ASSIGNMENT_STATUS', 'ASSIGNMENT_QUEUE', 'ASSIGNED_TO_LABEL', 'ASSIGNED_TEAM', 'ASSIGNED_TEAM_LABEL',
    'ASSIGNED_BY', 'ASSIGNMENT_NOTE', 'CLAIMED_AT', 'CLAIMED_BY',
    'LAST_OPERATOR_ACTION', 'LAST_OPERATOR_ACTION_AT', 'LAST_OPERATOR_ACTION_BY',
    'ESCALATE_AFTER_AT', 'IS_STUCK', 'STUCK_REASON', 'IS_BLOCKED', 'BLOCKED_REASON',
    'QUEUE_GROUP', 'QUEUE_LABEL', 'QUEUE_SORT', 'WORKLOAD_KEY',
    'OPERATOR_DASHBOARD_GROUP', 'OPERATOR_DASHBOARD_SORT'
  ].forEach(function(k) { patch[k] = incoming[k]; });

  var preserveOps = [
    'CLAIMED_AT', 'CLAIMED_BY', 'ASSIGNED_BY', 'ASSIGNMENT_NOTE',
    'LAST_OPERATOR_ACTION', 'LAST_OPERATOR_ACTION_AT', 'LAST_OPERATOR_ACTION_BY',
    'IS_BLOCKED', 'BLOCKED_REASON',
    'ASSIGNMENT_QUEUE', 'ASSIGNED_TEAM', 'ASSIGNED_TEAM_LABEL',
    'SLA_POLICY', 'SLA_TARGET_MINUTES'
  ];
  preserveOps.forEach(function(pk) {
    var inc = incoming[pk];
    var ex = existing[pk];
    var incEmpty = inc === undefined || inc === null || inc === '';
    if (incEmpty && ex !== undefined && ex !== null && ex !== '') patch[pk] = ex;
  });

  // Keep assignment/due unless incoming explicitly provides.
  patch.DUE_AT = incoming.DUE_AT !== undefined && incoming.DUE_AT !== '' ? incoming.DUE_AT : (existing.DUE_AT || '');
  patch.ASSIGNED_TO = incoming.ASSIGNED_TO !== undefined && incoming.ASSIGNED_TO !== '' ? incoming.ASSIGNED_TO : (existing.ASSIGNED_TO || '');
  patch.EXPIRES_AT = incoming.EXPIRES_AT !== undefined && incoming.EXPIRES_AT !== '' ? incoming.EXPIRES_AT : (existing.EXPIRES_AT || '');

  // Manual-first: do NOT override operational status unless existing is OPEN (or blank).
  if (!exStatus || exStatus === HOME_ALERT_STATUS.OPEN) {
    patch.STATUS = incoming.STATUS || HOME_ALERT_STATUS.OPEN;
    patch.IS_ACTIVE = incoming.IS_ACTIVE === true;
    patch.IS_RESOLVED = incoming.IS_RESOLVED === true;
  } else {
    patch.STATUS = existing.STATUS;
    patch.IS_ACTIVE = existing.IS_ACTIVE;
    patch.IS_RESOLVED = existing.IS_RESOLVED;
  }

  // Preserve terminal fields.
  patch.RESOLVED_AT = existing.RESOLVED_AT || '';
  patch.RESOLVED_BY = existing.RESOLVED_BY || '';
  patch.NOTE = existing.NOTE || '';

  // Operational timestamps preserved.
  patch.ACKNOWLEDGED_AT = existing.ACKNOWLEDGED_AT || '';
  patch.ACKNOWLEDGED_BY = existing.ACKNOWLEDGED_BY || '';
  patch.STATE_CHANGED_AT = existing.STATE_CHANGED_AT || '';
  patch.STATE_CHANGED_BY = existing.STATE_CHANGED_BY || '';
  patch.ESCALATED_AT = existing.ESCALATED_AT || '';
  patch.AUTO_CLEARED_AT = existing.AUTO_CLEARED_AT || '';
  patch.AUTO_CLEARED_BY = existing.AUTO_CLEARED_BY || '';
  patch.LAST_ACTION = existing.LAST_ACTION || '';

  return patch;
}

// =============================================================================
// PHASE_81 — OPERATIONAL_ASSIGNMENT_RUNTIME (coordination fields + workload sheet)
// Runtime-first; append-only audit; no triggers. ASSIGNMENT_* derived in GAS.
// =============================================================================

var HOME_ALERT_RUNTIME_QUEUE_CODES = [
  'UNASSIGNED_QUEUE', 'MY_QUEUE', 'TEAM_QUEUE', 'WAITING_QUEUE', 'ESCALATED_QUEUE', 'BLOCKED_QUEUE', 'DONE_QUEUE'
];

// =============================================================================
// PHASE_82 — SLA_AND_ESCALATION_RUNTIME (runtime-first, append-only audit, manual-first)
// =============================================================================

var HOME_ALERT_SLA_STATUS = {
  NO_SLA: 'NO_SLA',
  ON_TRACK: 'ON_TRACK',
  DUE_SOON: 'DUE_SOON',
  OVERDUE: 'OVERDUE',
  BREACHED: 'BREACHED',
  PAUSED: 'PAUSED',
  RESOLVED: 'RESOLVED'
};

var HOME_ALERT_ESCALATION_STATUS = {
  NONE: 'NONE',
  SUGGESTED: 'SUGGESTED',
  ESCALATED: 'ESCALATED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  WAITING: 'WAITING',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED'
};

/** @returns {number} */
function HomeAlert_parseMinutes_(raw) {
  var n = Math.round(Number(String(raw || '').trim()));
  return isNaN(n) || n <= 0 ? 0 : n;
}

function HomeAlert_toDate_(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  var d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function HomeAlert_slaPickAnchor_(a, policy) {
  var pol = String(policy || '').trim().toUpperCase();
  if (pol === 'USE_DUE_AT' || pol === 'FROM_DUE_AT') {
    return HomeAlert_toDate_(a.DUE_AT);
  }
  if (pol === 'FROM_CLAIMED') {
    return HomeAlert_toDate_(a.CLAIMED_AT) || HomeAlert_toDate_(a.CREATED_AT);
  }
  if (pol === 'FROM_STATE') {
    return HomeAlert_toDate_(a.STATE_CHANGED_AT) || HomeAlert_toDate_(a.UPDATED_AT) || HomeAlert_toDate_(a.CREATED_AT);
  }
  if (pol === 'FROM_LAST_ACTIVITY' || pol === 'FROM_ACTIVITY') {
    return HomeAlert_toDate_(a.UPDATED_AT) || HomeAlert_toDate_(a.CREATED_AT);
  }
  // default FROM_CREATED
  return HomeAlert_toDate_(a.CREATED_AT) || HomeAlert_toDate_(a.UPDATED_AT);
}

/**
 * Computes SLA + escalation coordination columns. Mutates `alert` and returns patch.
 * Non-destructive to manual escalation rows except sync from operational STATUS=ESCALATED.
 */
function HomeAlert_enrichSlaEscalationRuntime_(alert) {
  var a = alert || {};
  var patch = {};
  var now = cbvNow();
  var st = String(a.STATUS || '').trim();

  if (HomeAlert_isTerminalStatus_(st)) {
    patch.SLA_STATUS = HOME_ALERT_SLA_STATUS.RESOLVED;
    patch.SLA_BREACH_LEVEL = 0;
    patch.SLA_ELAPSED_MINUTES = '';
    patch.SLA_NEXT_REVIEW_AT = '';
    if (String(a.ESCALATION_STATUS || '').trim() !== HOME_ALERT_ESCALATION_STATUS.RESOLVED
        && String(a.ESCALATION_STATUS || '').trim() !== HOME_ALERT_ESCALATION_STATUS.CANCELLED
        && String(a.ESCALATION_STATUS || '').trim() !== HOME_ALERT_ESCALATION_STATUS.NONE) {
      patch.ESCALATION_STATUS = HOME_ALERT_ESCALATION_STATUS.RESOLVED;
      patch.ESCALATION_NEXT_ACTION = '';
    }
    Object.keys(patch).forEach(function(k) { a[k] = patch[k]; });
    return patch;
  }

  if (String(a.SLA_STATUS || '').trim() === HOME_ALERT_SLA_STATUS.PAUSED) {
    patch.SLA_STATUS = HOME_ALERT_SLA_STATUS.PAUSED;
    patch.SLA_NEXT_REVIEW_AT = new Date(now.getTime() + 60 * 60 * 1000);
    Object.keys(patch).forEach(function(k) { a[k] = patch[k]; });
    return patch;
  }

  var reg = (typeof HomeAlert_getSlaPolicy_ === 'function') ? HomeAlert_getSlaPolicy_(a) : null;
  if (typeof HomeAlertSlaPolicy_applyAnchorsToAlert_ === 'function') {
    HomeAlertSlaPolicy_applyAnchorsToAlert_(a, reg);
  }

  var policy = String(a.SLA_POLICY || '').trim();
  var targetMin = HomeAlert_parseMinutes_(a.SLA_TARGET_MINUTES);
  var dueAt = null;
  var windowMin = targetMin;

  if (!policy && HomeAlert_toDate_(a.DUE_AT)) {
    policy = 'USE_DUE_AT';
  }

  if (String(policy).toUpperCase() === 'USE_DUE_AT' || String(policy).toUpperCase() === 'FROM_DUE_AT') {
    dueAt = HomeAlert_toDate_(a.DUE_AT);
    var created0 = HomeAlert_toDate_(a.CREATED_AT);
    if (dueAt && created0) windowMin = Math.max(1, Math.round((dueAt.getTime() - created0.getTime()) / 60000));
  } else if (policy && targetMin > 0) {
    var anchor0 = HomeAlert_slaPickAnchor_(a, policy);
    if (anchor0) dueAt = new Date(anchor0.getTime() + targetMin * 60000);
  }

  if (!dueAt || isNaN(dueAt.getTime())) {
    patch.SLA_STATUS = HOME_ALERT_SLA_STATUS.NO_SLA;
    patch.SLA_DUE_AT = '';
    patch.SLA_BREACH_LEVEL = 0;
    patch.SLA_ELAPSED_MINUTES = '';
    patch.SLA_NEXT_REVIEW_AT = '';
  } else {
    patch.SLA_DUE_AT = dueAt;
    var anchorForElapsed = HomeAlert_toDate_(a.CREATED_AT) || HomeAlert_toDate_(a.UPDATED_AT) || now;
    if (policy && String(policy).toUpperCase() !== 'USE_DUE_AT' && String(policy).toUpperCase() !== 'FROM_DUE_AT') {
      anchorForElapsed = HomeAlert_slaPickAnchor_(a, policy) || anchorForElapsed;
    }
    patch.SLA_ELAPSED_MINUTES = Math.max(0, Math.round((now.getTime() - anchorForElapsed.getTime()) / 60000));
    var untilDueMs = dueAt.getTime() - now.getTime();
    var win = windowMin > 0 ? windowMin : 60;
    var cfgSoon = reg ? HomeAlert_parseMinutes_(reg.DUE_SOON_MINUTES) : 0;
    var b1 = reg ? HomeAlert_parseMinutes_(reg.BREACH_LEVEL_1_MINUTES) : 0;
    var b2 = reg ? HomeAlert_parseMinutes_(reg.BREACH_LEVEL_2_MINUTES) : 0;
    var soonMs;
    var breach1Ms;
    var breach2Ms;
    if (reg) {
      soonMs = cfgSoon > 0 ? cfgSoon * 60000 : Math.max(60000, Math.floor(win * 0.2 * 60000));
      breach1Ms = b1 > 0 ? b1 * 60000 : 60000;
      breach2Ms = b2 > 0 ? b2 * 60000 : 3 * 3600000;
    } else {
      var soonMinutes = Math.max(5, Math.floor(win * 0.2));
      soonMs = soonMinutes * 60000;
      breach1Ms = 60000;
      breach2Ms = 3 * 3600000;
    }
    if (untilDueMs < -breach2Ms) {
      patch.SLA_STATUS = HOME_ALERT_SLA_STATUS.BREACHED;
      patch.SLA_BREACH_LEVEL = 2;
    } else if (untilDueMs < -breach1Ms) {
      patch.SLA_STATUS = HOME_ALERT_SLA_STATUS.OVERDUE;
      patch.SLA_BREACH_LEVEL = 1;
    } else if (untilDueMs < 0) {
      patch.SLA_STATUS = HOME_ALERT_SLA_STATUS.OVERDUE;
      patch.SLA_BREACH_LEVEL = 0;
    } else if (untilDueMs <= soonMs) {
      patch.SLA_STATUS = HOME_ALERT_SLA_STATUS.DUE_SOON;
      patch.SLA_BREACH_LEVEL = 0;
    } else {
      patch.SLA_STATUS = HOME_ALERT_SLA_STATUS.ON_TRACK;
      patch.SLA_BREACH_LEVEL = 0;
    }
    patch.SLA_NEXT_REVIEW_AT = new Date(Math.min(dueAt.getTime(), now.getTime() + 15 * 60000));
  }

  if (reg) {
    var escM = HomeAlert_parseMinutes_(reg.ESCALATE_AFTER_MINUTES);
    var tgt = String(reg.ESCALATE_TO_USER || reg.ESCALATE_TO_TEAM || '').trim();
    if (escM > 0 && tgt && !String(a.ESCALATION_NEXT_ACTION || '').trim()) {
      patch.ESCALATION_NEXT_ACTION = 'Policy: sau ' + escM + ' phút xem xét escalate tới ' + tgt + '.';
    }
  }

  if (st === HOME_ALERT_STATUS.ESCALATED) {
    var es = String(a.ESCALATION_STATUS || '').trim();
    if (!es || es === HOME_ALERT_ESCALATION_STATUS.NONE || es === HOME_ALERT_ESCALATION_STATUS.SUGGESTED) {
      patch.ESCALATION_STATUS = HOME_ALERT_ESCALATION_STATUS.ESCALATED;
      patch.ESCALATION_LEVEL = Math.max(1, Number(a.ESCALATION_LEVEL || 1) || 1);
      patch.ESCALATION_REASON = patch.ESCALATION_REASON || a.ESCALATION_REASON || 'Operational status ESCALATED';
      patch.ESCALATION_NEXT_ACTION = 'Theo dõi xử lý sau escalate.';
    }
  }

  Object.keys(patch).forEach(function(k) { a[k] = patch[k]; });
  return patch;
}

/**
 * @returns {{ stuck: boolean, signals: Array<{code:string,message:string}> }}
 */
function HomeAlert_evaluateStuckSignals_(alert) {
  var a = alert || {};
  var signals = [];
  if (!HomeAlert_isActiveStatus_(String(a.STATUS || '').trim())) {
    return { stuck: false, signals: signals };
  }

  var now = cbvNow();
  var st = String(a.STATUS || '').trim();
  var assignee = String(a.ASSIGNED_TO || '').trim();

  function ageHours(ref) {
    var d = HomeAlert_toDate_(ref);
    if (!d) return null;
    return (now.getTime() - d.getTime()) / 3600000;
  }

  if (!assignee && (st === HOME_ALERT_STATUS.OPEN || st === HOME_ALERT_STATUS.ACKNOWLEDGED)) {
    var ah = ageHours(a.CREATED_AT);
    if (ah != null && ah >= 24) signals.push({ code: 'UNCLAIMED_TOO_LONG', message: 'Chưa claim >=24h' });
  }

  if (st === HOME_ALERT_STATUS.IN_PROGRESS) {
    var ref = a.CLAIMED_AT || a.STATE_CHANGED_AT || a.UPDATED_AT;
    var ih = ageHours(ref);
    if (ih != null && ih >= 48) signals.push({ code: 'IN_PROGRESS_TOO_LONG', message: 'IN_PROGRESS >=48h không đổi trạng thái' });
  }

  if (st === HOME_ALERT_STATUS.WAITING_RESPONSE) {
    var wh = ageHours(a.STATE_CHANGED_AT || a.UPDATED_AT);
    if (wh != null && wh >= 72) signals.push({ code: 'WAITING_TOO_LONG', message: 'WAITING >=72h' });
  }

  if (a.IS_BLOCKED === true || String(a.IS_BLOCKED).toUpperCase() === 'TRUE') {
    var bh = ageHours(a.UPDATED_AT || a.STATE_CHANGED_AT);
    if (bh != null && bh >= 24) signals.push({ code: 'BLOCKED_TOO_LONG', message: 'BLOCKED >=24h' });
  }

  var slaSt = String(a.SLA_STATUS || '').trim();
  if (slaSt === HOME_ALERT_SLA_STATUS.OVERDUE || slaSt === HOME_ALERT_SLA_STATUS.BREACHED) {
    signals.push({ code: 'SLA_OVERDUE', message: 'SLA ' + slaSt });
  }

  if (assignee) {
    try {
      var loadRows = HomeAlertWorkload_getOperatorLoad_(assignee);
      var row = loadRows && loadRows[0];
      var ac = Number(row && row.ACTIVE_ALERT_COUNT) || 0;
      if (ac >= 15) signals.push({ code: 'OPERATOR_OVERLOAD', message: 'ACTIVE_ALERT_COUNT>=' + ac });
    } catch (eL) {}
  }

  return { stuck: signals.length > 0, signals: signals };
}

function HomeAlert_getWorkloadSheetName_() {
  return (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.HOME_ALERT_WORKLOAD)
    ? CBV_CONFIG.SHEETS.HOME_ALERT_WORKLOAD
    : 'HOME_ALERT_WORKLOAD';
}

function HomeAlert_ensureWorkloadSheet_() {
  var ss = SpreadsheetApp.getActive();
  var name = HomeAlert_getWorkloadSheetName_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    var headers = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT_WORKLOAD)
      ? CBV_SCHEMA_MANIFEST.HOME_ALERT_WORKLOAD
      : null;
    cbvAssert(headers && headers.length > 0, 'Missing CBV_SCHEMA_MANIFEST.HOME_ALERT_WORKLOAD');
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return { created: true, name: name };
  }
  return { created: false, name: name };
}

function HomeAlert_lookupUserDirectoryLabel_(userId) {
  var id = String(userId || '').trim();
  if (!id) return '';
  try {
    var udName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.USER_DIRECTORY)
      ? CBV_CONFIG.SHEETS.USER_DIRECTORY
      : 'USER_DIRECTORY';
    var sh = SpreadsheetApp.getActive().getSheetByName(udName);
    if (!sh) return id;
    var rows = _rows(sh);
    var r = rows.find(function(x) { return String(x.ID || '').trim() === id; }) || null;
    if (!r) return id;
    return String(r.DISPLAY_NAME || r.FULL_NAME || r.EMAIL || id).trim() || id;
  } catch (e) {
    return id;
  }
}

function HomeAlert_lastOperatorPatch_(actionKey) {
  var now = cbvNow();
  return {
    LAST_OPERATOR_ACTION: String(actionKey || '').trim(),
    LAST_OPERATOR_ACTION_AT: now,
    LAST_OPERATOR_ACTION_BY: HomeAlert_actorId_()
  };
}

function HomeAlert_appendAlertNote_(row, note, patch) {
  var n = String(note || '').trim();
  if (!n) return;
  var prev = String(row.NOTE || '').trim();
  var entry = '[' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') + '] ' + n;
  patch.NOTE = prev ? (prev + '\n' + entry) : entry;
}

function HomeAlert_patchAlertOperational_(alertId, patch, actionKey, note) {
  HomeAlert_ensureHomeAlertSheet_();
  var traceId = HomeAlert_newTraceId_();
  var sheetName = HomeAlert_getSheetName_();
  var rows = _rows(_sheet(sheetName));
  var id = String(alertId || '').trim();
  var row = rows.find(function(r) { return String(r.ALERT_ID || '').trim() === id; }) || null;
  cbvAssert(row, 'Alert not found: ' + id);

  var op = HomeAlert_lastOperatorPatch_(actionKey);
  Object.keys(op).forEach(function(k) { patch[k] = op[k]; });
  HomeAlert_appendAlertNote_(row, note, patch);

  patch.UPDATED_AT = cbvNow();
  patch.TRACE_ID = traceId;

  var merged = {};
  Object.keys(row).forEach(function(k0) { merged[k0] = row[k0]; });
  Object.keys(patch).forEach(function(k1) { merged[k1] = patch[k1]; });

  var ux = HomeAlert_enrichUxFields_(merged);
  Object.keys(ux).forEach(function(k2) { patch[k2] = ux[k2]; });

  var before = { STATUS: row.STATUS, ASSIGNED_TO: row.ASSIGNED_TO, ASSIGNMENT_QUEUE: row.ASSIGNMENT_QUEUE, IS_BLOCKED: row.IS_BLOCKED };
  _updateRow(sheetName, row._rowNumber, patch);

  try {
    if (typeof logAdminAudit === 'function') {
      logAdminAudit('HOME_ALERT_ASSIGNMENT_RUNTIME', 'HOME_ALERT', id, 'UPDATE', before, patch, 'HomeAlert_patchAlertOperational_ ' + actionKey);
    }
  } catch (e) {}

  return { ok: true, alertId: id, action: actionKey, traceId: traceId };
}

function HomeAlert_getAssignmentStatus_(alert) {
  var a = alert || {};
  var stSheet = String(a.STATUS || '').trim();
  if (HomeAlert_isTerminalStatus_(stSheet)) return 'RESOLVED';
  if (a.IS_BLOCKED === true || String(a.IS_BLOCKED).toUpperCase() === 'TRUE') return 'BLOCKED';
  if (stSheet === HOME_ALERT_STATUS.ESCALATED) return 'ESCALATED';
  if (stSheet === HOME_ALERT_STATUS.WAITING_RESPONSE) return 'WAITING_RESPONSE';
  if (stSheet === HOME_ALERT_STATUS.IN_PROGRESS) return 'IN_PROGRESS';
  var h = String(a.ASSIGNED_TO || a.CLAIMED_BY || '').trim();
  if (h) return 'ASSIGNED';
  return 'UNASSIGNED';
}

function HomeAlert_getAssignmentQueue_(alert, perspectiveOperatorId) {
  var a = alert || {};
  var stSheet = String(a.STATUS || '').trim();
  var q;
  if (HomeAlert_isTerminalStatus_(stSheet)) q = 'DONE_QUEUE';
  else if (a.IS_BLOCKED === true || String(a.IS_BLOCKED).toUpperCase() === 'TRUE') q = 'BLOCKED_QUEUE';
  else if (stSheet === HOME_ALERT_STATUS.ESCALATED) q = 'ESCALATED_QUEUE';
  else if (stSheet === HOME_ALERT_STATUS.WAITING_RESPONSE) q = 'WAITING_QUEUE';
  else {
    var assignee = String(a.ASSIGNED_TO || '').trim();
    var pov = String(perspectiveOperatorId || '').trim();
    if (!assignee) q = 'UNASSIGNED_QUEUE';
    else if (pov && assignee === pov) q = 'MY_QUEUE';
    else q = 'TEAM_QUEUE';
  }
  var route = String(a.ASSIGNED_TEAM || '').trim();
  var allowOverride = [HOME_ALERT_STATUS.OPEN, HOME_ALERT_STATUS.ACKNOWLEDGED, HOME_ALERT_STATUS.IN_PROGRESS].indexOf(stSheet) >= 0;
  if (allowOverride && route && HOME_ALERT_RUNTIME_QUEUE_CODES.indexOf(route) >= 0) return route;
  return q;
}

function HomeAlert_getQueueGroup_(alert) {
  var q = HomeAlert_getAssignmentQueue_(alert, HomeAlert_actorId_());
  var map = {
    UNASSIGNED_QUEUE: 10,
    MY_QUEUE: 20,
    TEAM_QUEUE: 30,
    WAITING_QUEUE: 40,
    ESCALATED_QUEUE: 50,
    BLOCKED_QUEUE: 60,
    DONE_QUEUE: 90
  };
  return map[q] != null ? map[q] : 0;
}

function HomeAlert_getQueueLabel_(alert) {
  var q = HomeAlert_getAssignmentQueue_(alert, HomeAlert_actorId_());
  var labels = {
    UNASSIGNED_QUEUE: 'UNASSIGNED_QUEUE',
    MY_QUEUE: 'MY_QUEUE',
    TEAM_QUEUE: 'TEAM_QUEUE',
    WAITING_QUEUE: 'WAITING_QUEUE',
    ESCALATED_QUEUE: 'ESCALATED_QUEUE',
    BLOCKED_QUEUE: 'BLOCKED_QUEUE',
    DONE_QUEUE: 'DONE_QUEUE'
  };
  return labels[q] || q;
}

function HomeAlert_getQueueSort_(alert) {
  var base = HomeAlert_getQueueGroup_(alert) * 100000;
  var ps = Number(alert.PRIORITY_SCORE || 0) || 0;
  return base + Math.min(99999, ps);
}

function HomeAlert_getOperatorDashboardGroup_(alert) {
  var q = HomeAlert_getAssignmentQueue_(alert, HomeAlert_actorId_());
  var dash = {
    UNASSIGNED_QUEUE: '🚨 Chưa ai nhận',
    MY_QUEUE: '👤 Việc của tôi',
    TEAM_QUEUE: '👥 Việc của đội',
    WAITING_QUEUE: '⏳ Chờ phản hồi',
    ESCALATED_QUEUE: '🔥 Escalated',
    BLOCKED_QUEUE: '⚠ Bị kẹt',
    DONE_QUEUE: '✅ Đã xử lý'
  };
  return dash[q] || q;
}

function HomeAlert_getOperatorDashboardSort_(alert) {
  var a = alert || {};
  var g = HomeAlert_getQueueGroup_(a);
  var ps = Number(a.PRIORITY_SCORE || 0) || 0;
  var bonus = 0;
  var ss = String(a.SLA_STATUS || '').trim();
  if (ss === HOME_ALERT_SLA_STATUS.BREACHED) bonus = 500000;
  else if (ss === HOME_ALERT_SLA_STATUS.OVERDUE) bonus = 250000;
  else if (ss === HOME_ALERT_SLA_STATUS.DUE_SOON) bonus = 80000;
  return g * 1000000 + bonus + Math.min(999999, ps);
}

function HomeAlert_detectStuck_(alert) {
  return HomeAlert_evaluateStuckSignals_(alert).stuck;
}

function HomeAlert_getStuckReason_(alert) {
  var ev = HomeAlert_evaluateStuckSignals_(alert);
  if (!ev.stuck) return '';
  return ev.signals.map(function(s) { return s.message; }).join(' | ');
}

function HomeAlert_getEscalateAfterAt_(alert) {
  var a = alert || {};
  if (String(a.STATUS || '').trim() !== HOME_ALERT_STATUS.WAITING_RESPONSE) return '';
  var ref = a.STATE_CHANGED_AT || a.UPDATED_AT;
  if (!ref) return '';
  var dt = ref instanceof Date ? ref : new Date(ref);
  if (isNaN(dt.getTime())) return '';
  return new Date(dt.getTime() + 48 * 3600 * 1000);
}

function HomeAlert_enrichAssignmentFields_(alert) {
  var a = alert || {};
  var st = HomeAlert_getAssignmentStatus_(a);
  var q = HomeAlert_getAssignmentQueue_(a, HomeAlert_actorId_());
  var assignee = String(a.ASSIGNED_TO || '').trim();
  var patch = {
    ASSIGNMENT_STATUS: st,
    ASSIGNMENT_QUEUE: q,
    ASSIGNED_TO_LABEL: assignee ? HomeAlert_lookupUserDirectoryLabel_(assignee) : '',
    ASSIGNED_TEAM: String(a.ASSIGNED_TEAM || '').trim(),
    ASSIGNED_TEAM_LABEL: HomeAlert_getRuntimeQueueHumanLabel_(String(a.ASSIGNED_TEAM || '').trim()) || '',
    QUEUE_GROUP: HomeAlert_getQueueGroup_(a),
    QUEUE_LABEL: HomeAlert_getQueueLabel_(a),
    QUEUE_SORT: HomeAlert_getQueueSort_(a),
    WORKLOAD_KEY: [String(a.ASSIGNED_TEAM || '').trim() || 'NA', assignee || 'UNASSIGNED'].join('|'),
    OPERATOR_DASHBOARD_GROUP: HomeAlert_getOperatorDashboardGroup_(a),
    OPERATOR_DASHBOARD_SORT: HomeAlert_getOperatorDashboardSort_(a),
    IS_STUCK: HomeAlert_detectStuck_(a),
    STUCK_REASON: HomeAlert_getStuckReason_(a),
    ESCALATE_AFTER_AT: HomeAlert_getEscalateAfterAt_(a)
  };

  Object.keys(patch).forEach(function(k) { a[k] = patch[k]; });
  return patch;
}

function HomeAlert_getRuntimeQueueHumanLabel_(code) {
  if (!code) return '';
  var map = {
    UNASSIGNED_QUEUE: 'Unassigned pool',
    MY_QUEUE: 'My queue',
    TEAM_QUEUE: 'Team queue',
    WAITING_QUEUE: 'Waiting',
    ESCALATED_QUEUE: 'Escalated',
    BLOCKED_QUEUE: 'Blocked',
    DONE_QUEUE: 'Done'
  };
  return map[code] || code;
}

function HomeAlert_claimAlert(alertId, note) {
  HomeAlert_ensureHomeAlertSheet_();
  var sheetName = HomeAlert_getSheetName_();
  var rows = _rows(_sheet(sheetName));
  var id = String(alertId || '').trim();
  var row = rows.find(function(r) { return String(r.ALERT_ID || '').trim() === id; }) || null;
  cbvAssert(row, 'Alert not found: ' + id);
  var actor = HomeAlert_actorId_();
  var cur = String(row.ASSIGNED_TO || '').trim();
  cbvAssert(!cur || cur === actor, 'Alert already assigned to another operator');
  var fromStatus = String(row.STATUS || HOME_ALERT_STATUS.OPEN).trim();
  var towards = HOME_ALERT_STATUS.IN_PROGRESS;
  var ex = { ASSIGNED_TO: actor, CLAIMED_AT: cbvNow(), CLAIMED_BY: actor, ASSIGNED_TEAM: '', ASSIGNED_TEAM_LABEL: '' };
  Object.assign(ex, HomeAlert_lastOperatorPatch_('CLAIM'));
  if (fromStatus === towards && cur === actor) {
    return HomeAlert_patchAlertOperational_(id, ex, 'CLAIM', note);
  }
  if (fromStatus === towards && !cur) {
    return HomeAlert_transitionAlert_(id, towards, ex, note || '');
  }
  var allowed = HomeAlert_allowedTransitions_()[fromStatus] || [];
  cbvAssert(allowed.indexOf(towards) >= 0, 'Invalid transition for claim: ' + fromStatus + ' -> ' + towards);
  return HomeAlert_transitionAlert_(id, towards, ex, note || '');
}

function HomeAlert_assignAlert(alertId, userId, note) {
  HomeAlert_ensureHomeAlertSheet_();
  var uid = String(userId || '').trim();
  cbvAssert(uid, 'userId required');
  var sheetName = HomeAlert_getSheetName_();
  var rows = _rows(_sheet(sheetName));
  var id = String(alertId || '').trim();
  var row = rows.find(function(r) { return String(r.ALERT_ID || '').trim() === id; }) || null;
  cbvAssert(row, 'Alert not found: ' + id);
  cbvAssert(!HomeAlert_isTerminalStatus_(String(row.STATUS || '').trim()), 'Cannot assign terminal alert');
  var fromStatus = String(row.STATUS || HOME_ALERT_STATUS.OPEN).trim();
  var ex = { ASSIGNED_TO: uid, ASSIGNED_BY: HomeAlert_actorId_(), ASSIGNED_TEAM: '', ASSIGNED_TEAM_LABEL: '' };
  Object.assign(ex, HomeAlert_lastOperatorPatch_('ASSIGN'));
  var towards = fromStatus;
  if (fromStatus === HOME_ALERT_STATUS.OPEN || fromStatus === HOME_ALERT_STATUS.ACKNOWLEDGED) {
    towards = HOME_ALERT_STATUS.IN_PROGRESS;
  }
  if (towards !== fromStatus) {
    var allowed = HomeAlert_allowedTransitions_()[fromStatus] || [];
    cbvAssert(allowed.indexOf(towards) >= 0, 'Invalid transition for assign: ' + fromStatus + ' -> ' + towards);
  }
  return HomeAlert_transitionAlert_(id, towards, ex, note || '');
}

function HomeAlert_transferQueue(alertId, queueCode, note) {
  var code = String(queueCode || '').trim();
  cbvAssert(HOME_ALERT_RUNTIME_QUEUE_CODES.indexOf(code) >= 0, 'Invalid queueCode: ' + code);
  var patch = { ASSIGNED_TEAM: code, ASSIGNED_TEAM_LABEL: HomeAlert_getRuntimeQueueHumanLabel_(code) };
  return HomeAlert_patchAlertOperational_(String(alertId || '').trim(), patch, 'TRANSFER_QUEUE', note);
}

function HomeAlert_markWaiting(alertId, note) {
  var ex = HomeAlert_lastOperatorPatch_('MARK_WAITING');
  ex.ASSIGNED_TEAM = '';
  ex.ASSIGNED_TEAM_LABEL = '';
  return HomeAlert_transitionAlert_(String(alertId || '').trim(), HOME_ALERT_STATUS.WAITING_RESPONSE, ex, note || '');
}

function HomeAlert_escalateOperational(alertId, note) {
  var ex = HomeAlert_lastOperatorPatch_('ESCALATE_OPS');
  ex.ESCALATED_AT = cbvNow();
  ex.ASSIGNED_TEAM = '';
  ex.ASSIGNED_TEAM_LABEL = '';
  return HomeAlert_transitionAlert_(String(alertId || '').trim(), HOME_ALERT_STATUS.ESCALATED, ex, note || '');
}

function HomeAlert_markBlocked(alertId, reason) {
  var patch = {
    IS_BLOCKED: true,
    BLOCKED_REASON: String(reason || '').trim()
  };
  return HomeAlert_patchAlertOperational_(String(alertId || '').trim(), patch, 'BLOCK', String(reason || ''));
}

function HomeAlert_resolveOperational(alertId, note) {
  var ex = HomeAlert_lastOperatorPatch_('RESOLVE_OPS');
  ex.RESOLVED_AT = cbvNow();
  ex.RESOLVED_BY = HomeAlert_actorId_();
  ex.IS_BLOCKED = false;
  ex.BLOCKED_REASON = '';
  ex.ASSIGNED_TEAM = '';
  ex.ASSIGNED_TEAM_LABEL = '';
  return HomeAlert_transitionAlert_(String(alertId || '').trim(), HOME_ALERT_STATUS.RESOLVED, ex, note || '');
}

function HomeAlertWorkload_refresh() {
  var traceId = HomeAlert_newTraceId_();
  HomeAlert_ensureWorkloadSheet_();
  var wlName = HomeAlert_getWorkloadSheetName_();
  var wlSheet = _sheet(wlName);
  var last = wlSheet.getLastRow();
  if (last > 1) {
    wlSheet.deleteRows(2, last - 1);
  }

  var homeName = HomeAlert_getSheetName_();
  var alerts = _rows(_sheet(homeName));
  var now = cbvNow();

  var byOp = {};
  var poolUnassigned = 0;
  var poolOverdue = 0;
  var poolEscalated = 0;
  var poolBlocked = 0;
  var poolWaiting = 0;

  function bump(opId, field) {
    var k = String(opId || '').trim() || '__UNASSIGNED__';
    if (!byOp[k]) {
      byOp[k] = {
        OPERATOR_ID: k === '__UNASSIGNED__' ? '' : k,
        OPERATOR_LABEL: k === '__UNASSIGNED__' ? '(Unassigned pool)' : HomeAlert_lookupUserDirectoryLabel_(k),
        TEAM_ID: '',
        TEAM_LABEL: '',
        ACTIVE_ALERT_COUNT: 0,
        UNASSIGNED_COUNT: 0,
        OVERDUE_COUNT: 0,
        ESCALATED_COUNT: 0,
        BLOCKED_COUNT: 0,
        WAITING_COUNT: 0
      };
    }
    byOp[k][field] = (byOp[k][field] || 0) + 1;
  }

  alerts.forEach(function(r) {
    var id = String(r.ALERT_ID || '').trim();
    if (!id) return;
    var st = String(r.STATUS || '').trim();
    if (!HomeAlert_isActiveStatus_(st)) return;
    var assignee = String(r.ASSIGNED_TO || '').trim();
    var due = r.DUE_AT;
    var dueDt = due instanceof Date ? due : (due ? new Date(due) : null);
    var overdue = dueDt && !isNaN(dueDt.getTime()) && now.getTime() > dueDt.getTime();

    if (!assignee) {
      poolUnassigned++;
      if (overdue) poolOverdue++;
      if (st === HOME_ALERT_STATUS.ESCALATED) poolEscalated++;
      if (r.IS_BLOCKED === true || String(r.IS_BLOCKED).toUpperCase() === 'TRUE') poolBlocked++;
      if (st === HOME_ALERT_STATUS.WAITING_RESPONSE) poolWaiting++;
      return;
    }

    bump(assignee, 'ACTIVE_ALERT_COUNT');
    if (overdue) bump(assignee, 'OVERDUE_COUNT');
    if (st === HOME_ALERT_STATUS.ESCALATED) bump(assignee, 'ESCALATED_COUNT');
    if (r.IS_BLOCKED === true || String(r.IS_BLOCKED).toUpperCase() === 'TRUE') bump(assignee, 'BLOCKED_COUNT');
    if (st === HOME_ALERT_STATUS.WAITING_RESPONSE) bump(assignee, 'WAITING_COUNT');
  });

  var records = [];
  records.push({
    WORKLOAD_ID: 'WL_POOL_UNASSIGNED',
    OPERATOR_ID: '',
    OPERATOR_LABEL: '(Pool)',
    TEAM_ID: '',
    TEAM_LABEL: '',
    ACTIVE_ALERT_COUNT: poolUnassigned,
    UNASSIGNED_COUNT: poolUnassigned,
    OVERDUE_COUNT: poolOverdue,
    ESCALATED_COUNT: poolEscalated,
    BLOCKED_COUNT: poolBlocked,
    WAITING_COUNT: poolWaiting,
    LAST_REFRESH_AT: now,
    TRACE_ID: traceId
  });

  Object.keys(byOp).forEach(function(k) {
    if (k === '__UNASSIGNED__') return;
    var o = byOp[k];
    records.push({
      WORKLOAD_ID: 'WL_' + HomeAlert_hashHex_(k).slice(0, 16),
      OPERATOR_ID: o.OPERATOR_ID,
      OPERATOR_LABEL: o.OPERATOR_LABEL,
      TEAM_ID: o.TEAM_ID,
      TEAM_LABEL: o.TEAM_LABEL,
      ACTIVE_ALERT_COUNT: o.ACTIVE_ALERT_COUNT,
      UNASSIGNED_COUNT: 0,
      OVERDUE_COUNT: o.OVERDUE_COUNT,
      ESCALATED_COUNT: o.ESCALATED_COUNT,
      BLOCKED_COUNT: o.BLOCKED_COUNT,
      WAITING_COUNT: o.WAITING_COUNT,
      LAST_REFRESH_AT: now,
      TRACE_ID: traceId
    });
  });

  records.forEach(function(rec) {
    _appendRecord(wlName, rec);
  });

  return { ok: true, traceId: traceId, rowsWritten: records.length };
}

function HomeAlertWorkload_getOperatorLoad_(operatorId) {
  var id = String(operatorId || '').trim();
  HomeAlert_ensureWorkloadSheet_();
  var wlName = HomeAlert_getWorkloadSheetName_();
  var rows = _rows(_sheet(wlName));
  return rows.filter(function(r) { return String(r.OPERATOR_ID || '').trim() === id; });
}

function HomeAlertWorkload_TestConsole_run() {
  var traceId = HomeAlert_newTraceId_();
  try {
    var r = HomeAlertWorkload_refresh();
    return { ok: true, traceId: traceId, refresh: r };
  } catch (e) {
    return { ok: false, traceId: traceId, error: e.message || String(e) };
  }
}

function HomeAlert_transitionAlert_(alertId, toStatus, extraPatch, note) {
  HomeAlert_ensureHomeAlertSheet_();
  var traceId = HomeAlert_newTraceId_();
  var sheetName = HomeAlert_getSheetName_();
  var rows = _rows(_sheet(sheetName));
  var id = String(alertId || '').trim();
  cbvAssert(id, 'alertId required');

  var row = rows.find(function(r) { return String(r.ALERT_ID || '').trim() === id; }) || null;
  cbvAssert(row, 'Alert not found: ' + id);

  var fromStatus = String(row.STATUS || HOME_ALERT_STATUS.OPEN).trim();
  var allowed = HomeAlert_allowedTransitions_();
  var allowedNext = allowed[fromStatus] || [];
  cbvAssert(allowedNext.indexOf(toStatus) >= 0 || fromStatus === toStatus, 'Invalid transition: ' + fromStatus + ' -> ' + toStatus);

  var now = cbvNow();
  var patch = {
    STATUS: toStatus,
    IS_ACTIVE: HomeAlert_isActiveStatus_(toStatus),
    IS_RESOLVED: HomeAlert_isTerminalStatus_(toStatus),
    UPDATED_AT: now,
    TRACE_ID: traceId,
    STATE_CHANGED_AT: now,
    STATE_CHANGED_BY: HomeAlert_actorId_(),
    LAST_ACTION: 'TRANSITION_' + fromStatus + '_TO_' + toStatus
  };

  if (extraPatch) {
    Object.keys(extraPatch).forEach(function(k) { patch[k] = extraPatch[k]; });
  }

  var n = String(note || '').trim();
  if (n) {
    var prev = String(row.NOTE || '').trim();
    var entry = '[' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') + '] ' + n;
    patch.NOTE = prev ? (prev + '\n' + entry) : entry;
  }

  // Terminal field helpers
  if (toStatus === HOME_ALERT_STATUS.RESOLVED) {
    patch.RESOLVED_AT = patch.RESOLVED_AT || now;
    patch.RESOLVED_BY = patch.RESOLVED_BY || HomeAlert_actorId_();
  }
  if (toStatus === HOME_ALERT_STATUS.AUTO_CLEARED) {
    patch.AUTO_CLEARED_AT = patch.AUTO_CLEARED_AT || now;
    patch.AUTO_CLEARED_BY = patch.AUTO_CLEARED_BY || HomeAlert_actorId_();
  }

  // UX enrichment for state change (must match new status).
  var merged = {};
  Object.keys(row).forEach(function(k0) { merged[k0] = row[k0]; });
  Object.keys(patch).forEach(function(k1) { merged[k1] = patch[k1]; });
  var ux = HomeAlert_enrichUxFields_(merged);
  Object.keys(ux).forEach(function(k2) { patch[k2] = ux[k2]; });

  var before = {
    STATUS: row.STATUS, IS_ACTIVE: row.IS_ACTIVE, IS_RESOLVED: row.IS_RESOLVED,
    NOTE: row.NOTE, UPDATED_AT: row.UPDATED_AT
  };
  _updateRow(sheetName, row._rowNumber, patch);

  try {
    if (typeof logAdminAudit === 'function') {
      logAdminAudit('HOME_ALERT_TRANSITION', 'HOME_ALERT', id, 'UPDATE', before, patch, 'Transition ' + fromStatus + ' -> ' + toStatus);
    }
  } catch (e) {}

  return { ok: true, alertId: id, fromStatus: fromStatus, toStatus: toStatus, traceId: traceId };
}

function HomeAlert_autoClearMissing_(generatedIds, traceId) {
  var sheetName = HomeAlert_getSheetName_();
  var rows = _rows(_sheet(sheetName));
  var cleared = 0;
  rows.forEach(function(r) {
    var id = String(r.ALERT_ID || '').trim();
    if (!id) return;
    if (generatedIds && generatedIds[id] === true) return;
    var status = String(r.STATUS || '').trim();
    if (!HomeAlert_isActiveStatus_(status)) return;
    try {
      HomeAlert_autoClearAlert(id, 'Not generated in refresh traceId=' + traceId);
      cleared++;
    } catch (e) {}
  });
  return cleared;
}

function HomeAlert_autoExpire_() {
  var sheetName = HomeAlert_getSheetName_();
  var rows = _rows(_sheet(sheetName));
  var now = new Date();
  var count = 0;
  rows.forEach(function(r) {
    var id = String(r.ALERT_ID || '').trim();
    if (!id) return;
    var status = String(r.STATUS || '').trim();
    if (!HomeAlert_isActiveStatus_(status)) return;
    var expiresAt = r.EXPIRES_AT;
    var exp = expiresAt instanceof Date ? expiresAt : (expiresAt ? new Date(expiresAt) : null);
    if (!exp || isNaN(exp.getTime())) return;
    if (now.getTime() <= exp.getTime()) return;
    try {
      HomeAlert_expireAlert(id, 'EXPIRES_AT reached');
      count++;
    } catch (e) {}
  });
  return count;
}

function HomeAlert_validateStateMachine_() {
  var errors = [];
  var allowed = HomeAlert_allowedTransitions_();
  Object.keys(HOME_ALERT_STATUS).forEach(function(k) {
    var s = HOME_ALERT_STATUS[k];
    if (allowed[s] === undefined) errors.push('Missing transitions for status: ' + s);
  });
  // Terminal statuses must have no outgoing transitions
  [HOME_ALERT_STATUS.RESOLVED, HOME_ALERT_STATUS.AUTO_CLEARED, HOME_ALERT_STATUS.EXPIRED].forEach(function(s) {
    var out = allowed[s] || [];
    if (out.length) errors.push('Terminal status has outgoing transitions: ' + s);
  });
  return { ok: errors.length === 0, errors: errors };
}

// =============================================================================
// PHASE 80D — DESKTOP OPERATIONAL WORKSPACE RUNTIME
// =============================================================================
//
// Mục tiêu UX:
// - 3 giây hiểu việc cần xử lý.
// - Desktop cockpit rõ ràng, không còn raw/debug.
// - AppSheet chỉ hiển thị + bấm action; GAS sinh toàn bộ DESKTOP_* fields.
//
// Lưu ý:
// - Append-only; không xoá/rename cột cũ (`DISPLAY_*`, `CARD_*`, `UX_*`).
// - Không tạo VC/Bot/Trigger; manual-first.
// - State machine Phase 80B giữ nguyên.
// =============================================================================

/** Drive folder ID cho 000_SYSTEM_BRAIN online archive (Phase 80D §8.5). */
var HOME_ALERT_DEFAULT_SYSTEM_BRAIN_DRIVE_FOLDER_ID = '1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG';

/**
 * Lấy Drive folder ID online archive cho 000_SYSTEM_BRAIN.
 *
 * Ưu tiên Script Property `CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID` nếu được cấu hình;
 * fallback hằng số mặc định ở trên. KHÔNG tạo trigger/upload tự động ở phase này.
 */
function HomeAlert_getSystemBrainDriveFolderId_() {
  try {
    var v = PropertiesService.getScriptProperties().getProperty('CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID');
    if (v && String(v).trim()) return String(v).trim();
  } catch (e) {}
  return HOME_ALERT_DEFAULT_SYSTEM_BRAIN_DRIVE_FOLDER_ID;
}

/**
 * Enrich desktop operational workspace fields onto an alert.
 *
 * - Idempotent; chỉ tính từ field hiện hữu, không gọi I/O.
 * - Mutates `alert` và trả về patch của các cột `DESKTOP_*`.
 */
function HomeAlert_enrichDesktopUxFields_(alert) {
  var a = alert || {};

  var patch = {
    DESKTOP_TITLE: HomeAlert_buildDesktopTitle_(a),
    DESKTOP_SUBTITLE: HomeAlert_buildDesktopSubtitle_(a),
    DESKTOP_PRIMARY_LINE: HomeAlert_buildDesktopPrimaryLine_(a),
    DESKTOP_SECONDARY_LINE: HomeAlert_buildDesktopSecondaryLine_(a),
    DESKTOP_META_LINE: HomeAlert_buildDesktopMetaLine_(a),
    DESKTOP_ACTION_LINE: HomeAlert_buildDesktopActionLine_(a),
    DESKTOP_DETAIL_TITLE: HomeAlert_buildDesktopDetailTitle_(a),
    DESKTOP_DETAIL_SUMMARY: HomeAlert_buildDesktopDetailSummary_(a),
    DESKTOP_DETAIL_CONTEXT: HomeAlert_buildDesktopDetailContext_(a),
    DESKTOP_DETAIL_NEXT_ACTION: HomeAlert_buildDesktopDetailNextAction_(a),
    DESKTOP_DETAIL_DEBUG_VISIBLE: false,
    DESKTOP_GROUP: HomeAlert_getDesktopGroup_(a),
    DESKTOP_SORT: HomeAlert_getDesktopSort_(a),
    DESKTOP_IS_OPERATOR_VIEW: true
  };

  Object.keys(patch).forEach(function(k) { a[k] = patch[k]; });

  // PHASE 82 — SLA + escalation runtime (before assignment so stuck logic can use SLA signals).
  var slaEscalationPatch = HomeAlert_enrichSlaEscalationRuntime_(a);
  Object.keys(slaEscalationPatch).forEach(function(sk) {
    patch[sk] = slaEscalationPatch[sk];
    a[sk] = slaEscalationPatch[sk];
  });

  // PHASE 81 — assignment / queue / dashboard grouping (before attention so OPERATOR_* sees queue metadata).
  var assignmentPatch = HomeAlert_enrichAssignmentFields_(a);
  Object.keys(assignmentPatch).forEach(function(ak) { patch[ak] = assignmentPatch[ak]; });

  // PHASE 80E — operator attention runtime (depends on DESKTOP_* + DISPLAY_* already on `a`).
  var attentionPatch = HomeAlert_enrichAttentionFields_(a);
  Object.keys(attentionPatch).forEach(function(k2) { patch[k2] = attentionPatch[k2]; });

  return patch;
}

function HomeAlert_buildDesktopTitle_(alert) {
  var a = alert || {};
  var icon = HomeAlert_getDisplayIcon_(a.SEVERITY, a.MODULE_CODE, a.ALERT_CODE);
  var code = String(a.ALERT_CODE || '').trim();
  var base;
  if (code === 'TASK_OVERDUE') base = 'Task quá hạn';
  else if (code === 'FIN_UNCONFIRMED_OLD') base = 'Giao dịch chờ xác nhận';
  else if (code.indexOf('_LOG_NOTE_ERROR') >= 0) base = 'Lỗi runtime cần xem';
  else base = HomeAlert_desktopFallbackTitle_(a);
  return (icon ? (icon + ' ') : '') + base;
}

function HomeAlert_desktopFallbackTitle_(alert) {
  var a = alert || {};
  var t = String(a.TITLE || '').trim();
  if (t) return t.length > 80 ? t.slice(0, 80) + '…' : t;
  return 'Cảnh báo cần xử lý';
}

function HomeAlert_buildDesktopSubtitle_(alert) {
  var a = alert || {};
  var raw = String(a.TITLE || '').trim();
  if (!raw) {
    var ent = String(a.RELATED_ENTITY_TYPE || '').trim();
    var id = String(a.RELATED_ENTITY_ID || '').trim();
    return [ent, id].filter(Boolean).join(' · ');
  }
  // Nếu TITLE bắt đầu bằng tiền tố kỹ thuật ("Task quá hạn: ", "Finance chờ xác nhận: "), giữ phần ngữ nghĩa cho operator.
  var stripped = raw
    .replace(/^Task quá hạn:\s*/i, '')
    .replace(/^Finance chờ xác nhận:\s*/i, '')
    .replace(/^[A-Z_]+ log note contains\s*/i, '');
  stripped = stripped.replace(/\s+/g, ' ').trim();
  if (!stripped) stripped = raw;
  return stripped.length > 160 ? stripped.slice(0, 160) + '…' : stripped;
}

function HomeAlert_buildDesktopPrimaryLine_(alert) {
  var a = alert || {};
  var code = String(a.ALERT_CODE || '').trim();
  var status = String(a.STATUS || '').trim();
  var bits = [];

  if (code === 'TASK_OVERDUE') {
    var od = HomeAlert_computeOverdueDays_(a);
    if (od !== null) bits.push('Quá hạn ' + od + ' ngày');
    else bits.push('Quá hạn');
  } else if (code === 'FIN_UNCONFIRMED_OLD') {
    var age = HomeAlert_extractDaysFromBadge_(a.BADGE_TEXT);
    if (age !== null) bits.push('Chờ xác nhận ' + age + ' ngày');
    else bits.push('Chờ xác nhận');
  } else if (code.indexOf('_LOG_NOTE_ERROR') >= 0) {
    var hit = String(a.BADGE_TEXT || '').trim() || 'lỗi';
    bits.push('Phát hiện ' + hit);
  } else {
    var sev = String(a.SEVERITY || '').trim();
    if (sev) bits.push('Mức độ ' + sev);
  }

  if (status) bits.push(status);
  return bits.join(' · ');
}

function HomeAlert_buildDesktopSecondaryLine_(alert) {
  var a = alert || {};
  var bits = [];
  var prio = HomeAlert_getDisplayPriorityLabel_(Number(a.PRIORITY_SCORE || 0), a.SEVERITY);
  var prioLabel = HomeAlert_localizePriorityLabel_(prio);
  if (prioLabel) bits.push('Ưu tiên: ' + prioLabel);

  var assignee = String(a.ASSIGNED_TO || '').trim();
  bits.push('Phụ trách: ' + (assignee || 'chưa giao'));

  return bits.join(' · ');
}

function HomeAlert_localizePriorityLabel_(label) {
  var l = String(label || '').trim().toUpperCase();
  if (l === 'HIGH' || l === 'CRITICAL') return 'High';
  if (l === 'MEDIUM') return 'Medium';
  if (l === 'LOW') return 'Low';
  return '';
}

function HomeAlert_buildDesktopMetaLine_(alert) {
  var a = alert || {};
  var bits = [];
  var moduleCode = String(a.MODULE_CODE || '').trim();
  if (moduleCode) bits.push(moduleCode);

  var entity = String(a.RELATED_ENTITY_TYPE || '').trim();
  if (entity) bits.push(entity);

  var dt = a.UPDATED_AT || a.CREATED_AT || '';
  var d = dt instanceof Date ? dt : (dt ? new Date(dt) : null);
  if (d && !isNaN(d.getTime())) {
    var hhmm;
    try {
      hhmm = Utilities.formatDate(d, Session.getScriptTimeZone(), 'HH:mm');
    } catch (e) {
      hhmm = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }
    bits.push('cập nhật ' + hhmm);
  }

  return bits.join(' · ');
}

function HomeAlert_buildDesktopActionLine_(alert) {
  var a = alert || {};
  var actionText = HomeAlert_getDisplayActionText_(a.STATUS);
  if (!actionText) return 'Việc cần làm: theo dõi';
  return 'Việc cần làm: ' + actionText;
}

function HomeAlert_buildDesktopDetailTitle_(alert) {
  return HomeAlert_buildDesktopTitle_(alert);
}

function HomeAlert_buildDesktopDetailSummary_(alert) {
  var a = alert || {};
  var code = String(a.ALERT_CODE || '').trim();
  var status = String(a.STATUS || '').trim() || HOME_ALERT_STATUS.OPEN;

  if (code === 'TASK_OVERDUE') {
    var od = HomeAlert_computeOverdueDays_(a);
    if (od !== null) return 'Task này đã quá hạn ' + od + ' ngày và đang ' + status + '.';
    return 'Task này đang quá hạn và hiện trạng thái ' + status + '.';
  }
  if (code === 'FIN_UNCONFIRMED_OLD') {
    var age = HomeAlert_extractDaysFromBadge_(a.BADGE_TEXT);
    if (age !== null) return 'Giao dịch tài chính đã chờ xác nhận ' + age + ' ngày và đang ' + status + '.';
    return 'Giao dịch tài chính đang chờ xác nhận và hiện trạng thái ' + status + '.';
  }
  if (code.indexOf('_LOG_NOTE_ERROR') >= 0) {
    var hit = String(a.BADGE_TEXT || '').trim() || 'lỗi';
    var module = String(a.MODULE_CODE || '').trim() || 'hệ thống';
    return 'Hệ thống ghi nhận ' + hit + ' ở module ' + module + ', hiện trạng thái ' + status + '.';
  }

  var msg = String(a.MESSAGE || a.TITLE || '').trim();
  if (msg) {
    var trimmed = msg.length > 220 ? msg.slice(0, 220) + '…' : msg;
    return trimmed + ' (trạng thái: ' + status + ')';
  }
  return 'Cảnh báo cần xử lý. Trạng thái hiện tại: ' + status + '.';
}

function HomeAlert_buildDesktopDetailContext_(alert) {
  var a = alert || {};
  var bits = [];
  var entity = String(a.RELATED_ENTITY_TYPE || '').trim();
  if (entity) bits.push('Nguồn: ' + entity);
  var entityId = String(a.RELATED_ENTITY_ID || '').trim();
  if (entityId) bits.push('Mã liên quan: ' + entityId);
  var moduleCode = String(a.MODULE_CODE || '').trim();
  if (moduleCode && !entity) bits.push('Module: ' + moduleCode);
  return bits.join(' · ');
}

function HomeAlert_buildDesktopDetailNextAction_(alert) {
  var a = alert || {};
  var st = String(a.STATUS || '').trim() || HOME_ALERT_STATUS.OPEN;
  if (st === HOME_ALERT_STATUS.OPEN) return 'Nhận xử lý hoặc chuyển trạng thái phù hợp.';
  if (st === HOME_ALERT_STATUS.ACKNOWLEDGED) return 'Bắt đầu xử lý hoặc đặt trạng thái chờ phản hồi nếu cần.';
  if (st === HOME_ALERT_STATUS.IN_PROGRESS) return 'Tiếp tục cập nhật tiến độ; đặt chờ phản hồi nếu bị block.';
  if (st === HOME_ALERT_STATUS.WAITING_RESPONSE) return 'Khi có phản hồi, tiếp tục xử lý hoặc resolve.';
  if (st === HOME_ALERT_STATUS.ESCALATED) return 'Đã đẩy lên cấp cao hơn, theo dõi và xử lý sớm.';
  if (st === HOME_ALERT_STATUS.RESOLVED) return 'Alert đã đóng (resolved), không cần thao tác thêm.';
  if (st === HOME_ALERT_STATUS.AUTO_CLEARED) return 'Alert tự động hết hạn (auto cleared), không cần thao tác.';
  if (st === HOME_ALERT_STATUS.EXPIRED) return 'Alert đã expired, không cần thao tác.';
  return 'Xem chi tiết và quyết định bước tiếp theo.';
}

function HomeAlert_getDesktopGroup_(alert) {
  // Tái dùng grouping của CARD_GROUP để cockpit đồng nhất với view cũ.
  return HomeAlert_getCardGroup_(alert);
}

/**
 * Sort key dành cho desktop deck.
 *
 * Format: `${PRIORITY_SCORE_PADDED_6}_${YYYYMMDDHHMMSS}`
 *
 * Sort DESC trong AppSheet (priority cao + cập nhật mới nhất nổi lên trước).
 */
function HomeAlert_getDesktopSort_(alert) {
  var a = alert || {};
  var score = Math.max(0, Math.floor(Number(a.PRIORITY_SCORE || 0)));
  var scoreStr = String(score);
  while (scoreStr.length < 6) scoreStr = '0' + scoreStr;
  var d = a.UPDATED_AT || a.CREATED_AT || cbvNow();
  var dt = d instanceof Date ? d : (d ? new Date(d) : new Date());
  var ts;
  try {
    ts = Utilities.formatDate(dt, Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  } catch (e) {
    ts = '00000000000000';
  }
  return scoreStr + '_' + ts;
}

function HomeAlert_computeOverdueDays_(alert) {
  var a = alert || {};
  var due = a.DUE_AT;
  if (!due) return null;
  var dueDt = due instanceof Date ? due : new Date(due);
  if (isNaN(dueDt.getTime())) return null;
  var diffMs = new Date().getTime() - dueDt.getTime();
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / (24 * 3600 * 1000));
}

function HomeAlert_extractDaysFromBadge_(badge) {
  var b = String(badge || '').trim();
  var m = b.match(/^(\d+)\s*d$/i);
  if (!m) return null;
  var n = parseInt(m[1], 10);
  return isNaN(n) ? null : n;
}

// =============================================================================
// PHASE 80E — OPERATOR ATTENTION RUNTIME
// =============================================================================
// Operator-facing text + attention level; sort keys (CARD_SORT/DESKTOP_SORT)
// remain sheet columns for sort only — not shown in operator UX (see AppSheet docs).
// =============================================================================

/**
 * Enrich attention / operator display fields. Requires DESKTOP_* already on `alert`.
 * Mutates `alert` and returns patch for ATTENTION_*, ACTION_*, OWNER_*, OPERATOR_*.
 */
function HomeAlert_enrichAttentionFields_(alert) {
  var a = alert || {};

  var level = HomeAlert_getAttentionLevel_(a);
  var label = HomeAlert_getAttentionLabel_(a);
  var icon = HomeAlert_getAttentionIcon_(a);
  var color = HomeAlert_getAttentionColor_(a);
  var reason = HomeAlert_getAttentionReason_(a);
  var actionFocus = HomeAlert_getActionFocus_(a);
  var actionHint = HomeAlert_getActionHint_(a);
  var actionPriority = HomeAlert_getActionPriority_(a);
  var ownerLabel = HomeAlert_getOwnerLabel_(a);
  var ownerQueue = HomeAlert_getOwnerQueue_(a);

  a.OWNER_LABEL = ownerLabel;
  a.OWNER_QUEUE = ownerQueue;

  var patch = {
    ATTENTION_LEVEL: level,
    ATTENTION_LABEL: label,
    ATTENTION_ICON: icon,
    ATTENTION_COLOR: color,
    ATTENTION_REASON: reason,
    ACTION_FOCUS: actionFocus,
    ACTION_HINT: actionHint,
    ACTION_PRIORITY: actionPriority,
    OWNER_LABEL: ownerLabel,
    OWNER_QUEUE: ownerQueue,
    OPERATOR_PRIMARY_TEXT: HomeAlert_buildOperatorPrimaryText_(a),
    OPERATOR_SECONDARY_TEXT: HomeAlert_buildOperatorSecondaryText_(a),
    OPERATOR_META_TEXT: HomeAlert_buildOperatorMetaText_(a),
    OPERATOR_NEXT_ACTION: HomeAlert_buildOperatorNextAction_(a),
    OPERATOR_HIDE_SORT_KEYS: true
  };

  Object.keys(patch).forEach(function(k) { a[k] = patch[k]; });
  return patch;
}

function HomeAlert_getAttentionLevel_(alert) {
  var a = alert || {};
  var slaSt = String(a.SLA_STATUS || '').trim();
  if (slaSt === HOME_ALERT_SLA_STATUS.BREACHED) return 'CRITICAL';
  if (slaSt === HOME_ALERT_SLA_STATUS.OVERDUE) return 'WARNING';
  var st = String(a.STATUS || '').trim();
  if (st === HOME_ALERT_STATUS.WAITING_RESPONSE) return 'WAITING';
  if (st === HOME_ALERT_STATUS.ESCALATED) return 'WARNING';
  var sev = String(a.SEVERITY || '').trim().toUpperCase();
  if (sev === 'HIGH' || sev === 'CRITICAL') return 'CRITICAL';
  if (sev === 'MEDIUM') return 'WARNING';
  if (sev === 'LOW') return 'INFO';
  if (HomeAlert_isTerminalStatus_(st)) return 'INFO';
  return 'INFO';
}

function HomeAlert_getAttentionLabel_(alert) {
  var lvl = HomeAlert_getAttentionLevel_(alert);
  if (lvl === 'CRITICAL') return 'Cần xử lý ngay';
  if (lvl === 'WARNING') return 'Cần chú ý';
  if (lvl === 'WAITING') return 'Đang chờ phản hồi';
  return 'Thông tin';
}

function HomeAlert_getAttentionIcon_(alert) {
  var lvl = HomeAlert_getAttentionLevel_(alert);
  if (lvl === 'CRITICAL') return '🔴';
  if (lvl === 'WARNING') return '🟠';
  if (lvl === 'WAITING') return '🟡';
  return 'ℹ️';
}

function HomeAlert_getAttentionColor_(alert) {
  var lvl = HomeAlert_getAttentionLevel_(alert);
  if (lvl === 'CRITICAL') return 'Red';
  if (lvl === 'WARNING') return 'Orange';
  if (lvl === 'WAITING') return 'Yellow';
  return 'Blue';
}

function HomeAlert_getAttentionReason_(alert) {
  var a = alert || {};
  var prim = String(a.DESKTOP_PRIMARY_LINE || '').trim();
  if (prim) {
    var parts = prim.split(' · ');
    if (parts.length && parts[0]) return parts[0];
    return prim;
  }
  var msg = String(a.MESSAGE || '').trim();
  if (msg) return msg.length > 120 ? msg.slice(0, 120) + '…' : msg;
  return 'Cần xem xét';
}

function HomeAlert_getActionFocus_(alert) {
  var a = alert || {};
  return HomeAlert_getDisplayActionText_(String(a.STATUS || '').trim());
}

/**
 * ACTION_HINT column (Phase 80E). Khác với UX_ACTION_HINT / HomeAlert_getUxActionHint_.
 */
function HomeAlert_getActionHint_(alert) {
  var focus = HomeAlert_getActionFocus_(alert);
  if (!focus) return 'Cập nhật trạng thái phù hợp trên AppSheet.';
  return 'Bấm ' + focus + ' hoặc cập nhật trạng thái';
}

function HomeAlert_getActionPriority_(alert) {
  var a = alert || {};
  var n = Math.round(Number(a.PRIORITY_SCORE || 0));
  if (isNaN(n)) n = 0;
  if (n < 0) n = 0;
  if (n > 100) n = 100;
  return n;
}

function HomeAlert_getOwnerLabel_(alert) {
  var a = alert || {};
  var assignee = String(a.ASSIGNED_TO || '').trim();
  return 'Phụ trách: ' + (assignee || 'chưa giao');
}

function HomeAlert_getOwnerQueue_(alert) {
  var a = alert || {};
  var mod = String(a.MODULE_CODE || '').trim().toUpperCase();
  if (mod === 'TASK') return 'TASK_QUEUE';
  if (mod === 'FINANCE') return 'FINANCE_QUEUE';
  return 'GENERAL_QUEUE';
}

function HomeAlert_buildOperatorHeadline_(alert) {
  var a = alert || {};
  var code = String(a.ALERT_CODE || '').trim();
  if (code === 'TASK_OVERDUE') return 'Task quá hạn';
  if (code === 'FIN_UNCONFIRMED_OLD') return 'Giao dịch chờ xác nhận';
  if (code.indexOf('_LOG_NOTE_ERROR') >= 0) return 'Lỗi runtime log';
  return HomeAlert_desktopFallbackTitle_(a);
}

function HomeAlert_buildOperatorPrimaryText_(alert) {
  var a = alert || {};
  var icon = HomeAlert_getAttentionIcon_(a);
  var label = HomeAlert_getAttentionLabel_(a);
  var head = HomeAlert_buildOperatorHeadline_(a);
  return icon + ' ' + label + ' — ' + head;
}

function HomeAlert_buildOperatorSecondaryText_(alert) {
  var a = alert || {};
  var s = String(a.DESKTOP_SUBTITLE || '').trim();
  if (s) return s;
  return String(a.DISPLAY_SUBTITLE || '').trim();
}

function HomeAlert_buildOperatorMetaText_(alert) {
  var a = alert || {};
  var bits = [];
  var prim = String(a.DESKTOP_PRIMARY_LINE || '').trim();
  if (prim) bits.push(prim);
  var st = String(a.STATUS || '').trim();
  if (st) bits.push(st);
  var owner = String(a.OWNER_LABEL || '').trim();
  if (owner) bits.push(owner);
  var slaSt = String(a.SLA_STATUS || '').trim();
  if (slaSt && slaSt !== HOME_ALERT_SLA_STATUS.NO_SLA) bits.push('SLA:' + slaSt);
  var escSt = String(a.ESCALATION_STATUS || '').trim();
  if (escSt && escSt !== HOME_ALERT_ESCALATION_STATUS.NONE) bits.push('Esc:' + escSt);
  return bits.join(' · ');
}

function HomeAlert_buildOperatorNextAction_(alert) {
  var a = alert || {};
  var slaSt = String(a.SLA_STATUS || '').trim();
  if (slaSt === HOME_ALERT_SLA_STATUS.BREACHED || slaSt === HOME_ALERT_SLA_STATUS.OVERDUE) {
    return '👉 Ưu tiên xử lý SLA (' + slaSt + ').';
  }
  var escSt = String(a.ESCALATION_STATUS || '').trim();
  if (escSt === HOME_ALERT_ESCALATION_STATUS.SUGGESTED) {
    return '👉 Xem xét escalate theo gợi ý (runtime).';
  }
  var focus = HomeAlert_getActionFocus_(a);
  if (!focus) return '👉 Chuyển trạng thái phù hợp hoặc thêm ghi chú.';
  return '👉 ' + focus + ' hoặc chuyển trạng thái phù hợp';
}

// ===== HOME_ALERT Desktop Operational Test Console (separate) =====

var __HOME_ALERT_DESKTOP_TEST_CONSOLE_LAST_REPORT = null;

function HomeAlertDesktop_TestConsole_run() {
  var traceId = HomeAlert_newTraceId_();
  var checks = [];
  var warnings = [];
  var errors = [];

  try {
    var s = HomeAlertDesktop_checkSchema_();
    checks.push({ name: 'schemaDesktopColumns', ok: s.ok, details: s });
    if (!s.ok) errors = errors.concat(s.errors || []);
  } catch (e1) {
    checks.push({ name: 'schemaDesktopColumns', ok: false, details: { error: e1.message || String(e1) } });
    errors.push('Schema check exception: ' + (e1.message || String(e1)));
  }

  try {
    var sUx = HomeAlertUx_checkSchema_();
    checks.push({ name: 'schemaLegacyUxColumns', ok: sUx.ok, details: sUx });
    if (!sUx.ok) errors = errors.concat(sUx.errors || []);
  } catch (eUx) {
    checks.push({ name: 'schemaLegacyUxColumns', ok: false, details: { error: eUx.message || String(eUx) } });
    errors.push('Legacy UX schema check exception: ' + (eUx.message || String(eUx)));
  }

  try {
    var sm = HomeAlert_validateStateMachine_();
    checks.push({ name: 'stateMachine', ok: sm.ok, details: sm });
    if (!sm.ok) errors.push('State machine invalid: ' + JSON.stringify(sm.errors || []));
  } catch (e2) {
    checks.push({ name: 'stateMachine', ok: false, details: { error: e2.message || String(e2) } });
    errors.push('State machine exception: ' + (e2.message || String(e2)));
  }

  var refreshResult = null;
  try {
    refreshResult = HomeAlert_refresh({ autoClearMissing: false, autoExpire: false });
    checks.push({ name: 'refresh', ok: refreshResult.ok, details: refreshResult.stats });
    if (!refreshResult.ok) warnings.push('Refresh had errors: ' + JSON.stringify(refreshResult.stats.errors || []));
  } catch (e3) {
    checks.push({ name: 'refresh', ok: false, details: { error: e3.message || String(e3) } });
    errors.push('Refresh exception: ' + (e3.message || String(e3)));
  }

  try {
    var v = HomeAlertDesktop_validateDesktopOutput_();
    checks.push({ name: 'desktopOutput', ok: v.ok, details: v });
    if (!v.ok) errors = errors.concat(v.errors || []);
    warnings = warnings.concat(v.warnings || []);
  } catch (e4) {
    checks.push({ name: 'desktopOutput', ok: false, details: { error: e4.message || String(e4) } });
    errors.push('Desktop validate exception: ' + (e4.message || String(e4)));
  }

  try {
    var dup = HomeAlertDesktop_checkNoDuplicateAlertId_();
    checks.push({ name: 'noDuplicateAlertId', ok: dup.ok, details: dup });
    if (!dup.ok) errors.push('Duplicate ALERT_ID count=' + (dup.duplicates || 0));
  } catch (e5) {
    checks.push({ name: 'noDuplicateAlertId', ok: false, details: { error: e5.message || String(e5) } });
    errors.push('Duplicate check exception: ' + (e5.message || String(e5)));
  }

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var driveFolderId = HomeAlert_getSystemBrainDriveFolderId_();
  var driveFolderUrl = 'https://drive.google.com/drive/folders/' + driveFolderId;

  var report = {
    ok: status !== 'FAIL',
    phase: 'PHASE_80D_DESKTOP_OPERATIONAL_WORKSPACE_RUNTIME',
    status: status,
    severity: severity,
    checkedAt: cbvNow(),
    runBy: HomeAlert_actorId_(),
    traceId: traceId,
    testSuite: 'HOME_ALERT_DESKTOP_RUNTIME',
    summary: 'HOME_ALERT desktop operational workspace test: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'GO'
      ? 'Configure AppSheet Deck (DESKTOP_TITLE/DESKTOP_SUBTITLE/DESKTOP_GROUP/DESKTOP_SORT) and hide raw fields per 04_APPSHEET/HOME_ALERT_APPSHEET_SETUP.md.'
      : 'Fix errors then rerun HomeAlertDesktop_TestConsole_run().',
    reportText: '',
    reportJson: {
      refresh: refreshResult,
      driveFolderId: driveFolderId,
      driveFolderUrl: driveFolderUrl,
      driveFolderConfigKey: 'CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID',
      driveAutoUpload: false
    },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: true
  };

  report.reportText = HomeAlertDesktop_formatReportText_(report);
  __HOME_ALERT_DESKTOP_TEST_CONSOLE_LAST_REPORT = report;
  Logger.log(report.reportText);
  return report;
}

function HomeAlertDesktop_TestConsole_showReport() {
  var r = __HOME_ALERT_DESKTOP_TEST_CONSOLE_LAST_REPORT;
  if (!r) return { ok: false, message: 'No report. Run HomeAlertDesktop_TestConsole_run() first.' };
  Logger.log(r.reportText || JSON.stringify(r, null, 2));
  return r;
}

function HomeAlertDesktop_TestConsole_copyAiHandoff() {
  var r = __HOME_ALERT_DESKTOP_TEST_CONSOLE_LAST_REPORT;
  if (!r) return 'No report. Run HomeAlertDesktop_TestConsole_run() first.';
  var driveFolderId = (r.reportJson && r.reportJson.driveFolderId) || HomeAlert_getSystemBrainDriveFolderId_();
  var text = [
    'PHASE: ' + r.phase,
    'STATUS: ' + r.status,
    'SEVERITY: ' + r.severity,
    'TRACE: ' + r.traceId,
    'CHECKED_AT: ' + r.checkedAt,
    'SUMMARY: ' + r.summary,
    'WARNINGS: ' + JSON.stringify(r.warnings || []),
    'ERRORS: ' + JSON.stringify(r.errors || []),
    'NEXT_STEP: ' + r.nextStep,
    'DRIVE_ONLINE_OUTPUT_TARGET: https://drive.google.com/drive/folders/' + driveFolderId
  ].join('\n');
  Logger.log(text);
  return text;
}

function HomeAlertDesktop_checkSchema_() {
  var requiredDesktop = [
    'DESKTOP_TITLE', 'DESKTOP_SUBTITLE',
    'DESKTOP_PRIMARY_LINE', 'DESKTOP_SECONDARY_LINE',
    'DESKTOP_META_LINE', 'DESKTOP_ACTION_LINE',
    'DESKTOP_DETAIL_TITLE', 'DESKTOP_DETAIL_SUMMARY',
    'DESKTOP_DETAIL_CONTEXT', 'DESKTOP_DETAIL_NEXT_ACTION',
    'DESKTOP_DETAIL_DEBUG_VISIBLE',
    'DESKTOP_GROUP', 'DESKTOP_SORT', 'DESKTOP_IS_OPERATOR_VIEW'
  ];
  var sheetName = HomeAlert_getSheetName_();
  var sheet = _sheet(sheetName);
  var headers = _headers(sheet);
  var missing = requiredDesktop.filter(function(c) { return headers.indexOf(c) === -1; });
  return {
    ok: missing.length === 0,
    sheet: sheetName,
    missing: missing,
    errors: missing.map(function(c) { return 'Missing DESKTOP column: ' + c; })
  };
}

function HomeAlertDesktop_validateDesktopOutput_() {
  var sheetName = HomeAlert_getSheetName_();
  var rows = _rows(_sheet(sheetName));
  var errors = [];
  var warnings = [];

  if (!rows || rows.length === 0) {
    warnings.push('HOME_ALERT has no rows; cannot validate DESKTOP outputs on data.');
    return { ok: true, warnings: warnings, errors: errors, sampleChecked: 0 };
  }

  var active = rows.filter(function(r) { return HomeAlert_isActiveStatus_(String(r.STATUS || '').trim()); });
  var sample = (active.length ? active : rows).slice(0, 20);

  sample.forEach(function(r) {
    var id = String(r.ALERT_ID || '').trim();
    if (!String(r.DESKTOP_TITLE || '').trim()) errors.push('DESKTOP_TITLE empty for ' + id);
    if (!String(r.DESKTOP_PRIMARY_LINE || '').trim()) errors.push('DESKTOP_PRIMARY_LINE empty for ' + id);
    if (!String(r.DESKTOP_GROUP || '').trim()) errors.push('DESKTOP_GROUP empty for ' + id);
    if (!String(r.DESKTOP_SORT || '').trim()) errors.push('DESKTOP_SORT empty for ' + id);
    if (!String(r.DESKTOP_DETAIL_TITLE || '').trim()) errors.push('DESKTOP_DETAIL_TITLE empty for ' + id);
    if (!String(r.DESKTOP_DETAIL_SUMMARY || '').trim()) errors.push('DESKTOP_DETAIL_SUMMARY empty for ' + id);
    if (!String(r.DESKTOP_DETAIL_NEXT_ACTION || '').trim()) errors.push('DESKTOP_DETAIL_NEXT_ACTION empty for ' + id);
    // Phase 80C legacy fields phải vẫn còn sau enrich.
    if (!String(r.DISPLAY_TITLE || '').trim()) errors.push('DISPLAY_TITLE empty for ' + id + ' (legacy UX missing)');
    if (!String(r.CARD_GROUP || '').trim()) errors.push('CARD_GROUP empty for ' + id + ' (legacy UX missing)');
    if (!String(r.CARD_SORT || '').trim()) errors.push('CARD_SORT empty for ' + id + ' (legacy UX missing)');
  });

  return { ok: errors.length === 0, warnings: warnings, errors: errors, sampleChecked: sample.length };
}

function HomeAlertDesktop_checkNoDuplicateAlertId_() {
  var sheetName = HomeAlert_getSheetName_();
  var rows = _rows(_sheet(sheetName));
  var seen = {};
  var duplicates = 0;
  rows.forEach(function(r) {
    var id = String(r.ALERT_ID || '').trim();
    if (!id) return;
    if (seen[id]) duplicates++;
    else seen[id] = true;
  });
  return { ok: duplicates === 0, duplicates: duplicates, total: rows.length };
}

function HomeAlertDesktop_formatReportText_(r) {
  var driveFolderId = (r.reportJson && r.reportJson.driveFolderId) || HomeAlert_getSystemBrainDriveFolderId_();
  var lines = [];
  lines.push('=== HOME_ALERT DESKTOP TEST CONSOLE ===');
  lines.push('phase=' + r.phase);
  lines.push('status=' + r.status + ' severity=' + r.severity);
  lines.push('checkedAt=' + r.checkedAt + ' runBy=' + r.runBy);
  lines.push('traceId=' + r.traceId);
  lines.push('summary=' + r.summary);
  lines.push('checks=' + (r.checks ? r.checks.length : 0));
  (r.checks || []).forEach(function(c) { lines.push('- ' + c.name + ': ' + (c.ok ? 'OK' : 'FAIL')); });
  if ((r.warnings || []).length) lines.push('warnings=' + JSON.stringify(r.warnings, null, 2));
  if ((r.errors || []).length) lines.push('errors=' + JSON.stringify(r.errors, null, 2));
  lines.push('nextStep=' + r.nextStep);
  lines.push('driveOnlineOutputTarget=https://drive.google.com/drive/folders/' + driveFolderId);
  lines.push('driveAutoUpload=false (Phase 80D: chuẩn bị cấu hình, không upload tự động)');
  return lines.join('\n');
}

// ===== HOME_ALERT Operator Attention Test Console (Phase 80E) =====

var __HOME_ALERT_ATTENTION_TEST_CONSOLE_LAST_REPORT = null;

function HomeAlertAttention_TestConsole_run() {
  var traceId = HomeAlert_newTraceId_();
  var checks = [];
  var warnings = [];
  var errors = [];

  try {
    var s = HomeAlertAttention_checkSchema_();
    checks.push({ name: 'schemaAttentionColumns', ok: s.ok, details: s });
    if (!s.ok) errors = errors.concat(s.errors || []);
  } catch (e1) {
    checks.push({ name: 'schemaAttentionColumns', ok: false, details: { error: e1.message || String(e1) } });
    errors.push('Schema check exception: ' + (e1.message || String(e1)));
  }

  try {
    var sm = HomeAlert_validateStateMachine_();
    checks.push({ name: 'stateMachine', ok: sm.ok, details: sm });
    if (!sm.ok) errors.push('State machine invalid: ' + JSON.stringify(sm.errors || []));
  } catch (e2) {
    checks.push({ name: 'stateMachine', ok: false, details: { error: e2.message || String(e2) } });
    errors.push('State machine exception: ' + (e2.message || String(e2)));
  }

  try {
    var sDesk = HomeAlertDesktop_checkSchema_();
    checks.push({ name: 'schemaDesktopColumns', ok: sDesk.ok, details: sDesk });
    if (!sDesk.ok) errors = errors.concat(sDesk.errors || []);
  } catch (eD) {
    checks.push({ name: 'schemaDesktopColumns', ok: false, details: { error: eD.message || String(eD) } });
    errors.push('Desktop schema check exception: ' + (eD.message || String(eD)));
  }

  var refreshResult = null;
  try {
    refreshResult = HomeAlert_refresh({ autoClearMissing: false, autoExpire: false });
    checks.push({ name: 'refresh', ok: refreshResult.ok, details: refreshResult.stats });
    if (!refreshResult.ok) warnings.push('Refresh had errors: ' + JSON.stringify(refreshResult.stats.errors || []));
  } catch (e3) {
    checks.push({ name: 'refresh', ok: false, details: { error: e3.message || String(e3) } });
    errors.push('Refresh exception: ' + (e3.message || String(e3)));
  }

  try {
    var v = HomeAlertAttention_validateOutput_();
    checks.push({ name: 'attentionOutput', ok: v.ok, details: v });
    if (!v.ok) errors = errors.concat(v.errors || []);
    warnings = warnings.concat(v.warnings || []);
  } catch (e4) {
    checks.push({ name: 'attentionOutput', ok: false, details: { error: e4.message || String(e4) } });
    errors.push('Attention validate exception: ' + (e4.message || String(e4)));
  }

  try {
    var dup = HomeAlertDesktop_checkNoDuplicateAlertId_();
    checks.push({ name: 'noDuplicateAlertId', ok: dup.ok, details: dup });
    if (!dup.ok) errors.push('Duplicate ALERT_ID count=' + (dup.duplicates || 0));
  } catch (e5) {
    checks.push({ name: 'noDuplicateAlertId', ok: false, details: { error: e5.message || String(e5) } });
    errors.push('Duplicate check exception: ' + (e5.message || String(e5)));
  }

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var driveFolderId = HomeAlert_getSystemBrainDriveFolderId_();

  var report = {
    ok: status !== 'FAIL',
    phase: 'PHASE_80E_OPERATOR_ATTENTION_RUNTIME',
    status: status,
    severity: severity,
    checkedAt: cbvNow(),
    runBy: HomeAlert_actorId_(),
    traceId: traceId,
    testSuite: 'HOME_ALERT_OPERATOR_ATTENTION_RUNTIME',
    summary: 'HOME_ALERT operator attention runtime test: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'GO'
      ? 'Configure AppSheet ALERT_List/ALERT_Detail operator view per HOME_ALERT_APPSHEET_SETUP.md (OPERATOR_* only; hide CARD_SORT/DESKTOP_SORT/SORT_KEY).'
      : 'Fix errors then rerun HomeAlertAttention_TestConsole_run().',
    reportText: '',
    reportJson: {
      refresh: refreshResult,
      driveFolderId: driveFolderId,
      driveFolderUrl: 'https://drive.google.com/drive/folders/' + driveFolderId,
      driveFolderConfigKey: 'CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID',
      driveAutoUpload: false
    },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: true
  };

  report.reportText = HomeAlertAttention_formatReportText_(report);
  __HOME_ALERT_ATTENTION_TEST_CONSOLE_LAST_REPORT = report;
  Logger.log(report.reportText);
  return report;
}

function HomeAlertAttention_TestConsole_showReport() {
  var r = __HOME_ALERT_ATTENTION_TEST_CONSOLE_LAST_REPORT;
  if (!r) return { ok: false, message: 'No report. Run HomeAlertAttention_TestConsole_run() first.' };
  Logger.log(r.reportText || JSON.stringify(r, null, 2));
  return r;
}

function HomeAlertAttention_TestConsole_copyAiHandoff() {
  var r = __HOME_ALERT_ATTENTION_TEST_CONSOLE_LAST_REPORT;
  if (!r) return 'No report. Run HomeAlertAttention_TestConsole_run() first.';
  var driveFolderId = (r.reportJson && r.reportJson.driveFolderId) || HomeAlert_getSystemBrainDriveFolderId_();
  var text = [
    'PHASE: ' + r.phase,
    'STATUS: ' + r.status,
    'SEVERITY: ' + r.severity,
    'TRACE: ' + r.traceId,
    'CHECKED_AT: ' + r.checkedAt,
    'SUMMARY: ' + r.summary,
    'WARNINGS: ' + JSON.stringify(r.warnings || []),
    'ERRORS: ' + JSON.stringify(r.errors || []),
    'NEXT_STEP: ' + r.nextStep,
    'DRIVE_ONLINE_OUTPUT_TARGET: https://drive.google.com/drive/folders/' + driveFolderId
  ].join('\n');
  Logger.log(text);
  return text;
}

function HomeAlertAttention_checkSchema_() {
  var required = [
    'ATTENTION_LEVEL', 'ATTENTION_LABEL', 'ATTENTION_ICON', 'ATTENTION_COLOR', 'ATTENTION_REASON',
    'ACTION_FOCUS', 'ACTION_HINT', 'ACTION_PRIORITY',
    'OWNER_LABEL', 'OWNER_QUEUE',
    'OPERATOR_PRIMARY_TEXT', 'OPERATOR_SECONDARY_TEXT', 'OPERATOR_META_TEXT', 'OPERATOR_NEXT_ACTION',
    'OPERATOR_HIDE_SORT_KEYS'
  ];
  var sheetName = HomeAlert_getSheetName_();
  var sheet = _sheet(sheetName);
  var headers = _headers(sheet);
  var missing = required.filter(function(c) { return headers.indexOf(c) === -1; });
  return {
    ok: missing.length === 0,
    sheet: sheetName,
    missing: missing,
    errors: missing.map(function(c) { return 'Missing attention/operator column: ' + c; })
  };
}

function HomeAlertAttention_validateOutput_() {
  var sheetName = HomeAlert_getSheetName_();
  var rows = _rows(_sheet(sheetName));
  var errors = [];
  var warnings = [];
  var headers = _headers(_sheet(sheetName));

  if (headers.indexOf('CARD_SORT') === -1 || headers.indexOf('DESKTOP_SORT') === -1) {
    errors.push('Sort key columns CARD_SORT/DESKTOP_SORT must exist in schema for backend sort');
  }

  if (!rows || rows.length === 0) {
    warnings.push('HOME_ALERT has no rows; cannot validate OPERATOR_* outputs on data.');
    return { ok: true, warnings: warnings, errors: errors, sampleChecked: 0 };
  }

  var active = rows.filter(function(r) { return HomeAlert_isActiveStatus_(String(r.STATUS || '').trim()); });
  var sample = (active.length ? active : rows).slice(0, 20);

  sample.forEach(function(r) {
    var id = String(r.ALERT_ID || '').trim();
    if (!String(r.OPERATOR_PRIMARY_TEXT || '').trim()) errors.push('OPERATOR_PRIMARY_TEXT empty for ' + id);
    if (!String(r.OPERATOR_META_TEXT || '').trim()) errors.push('OPERATOR_META_TEXT empty for ' + id);
    if (!String(r.OPERATOR_NEXT_ACTION || '').trim()) errors.push('OPERATOR_NEXT_ACTION empty for ' + id);
    var hide = r.OPERATOR_HIDE_SORT_KEYS;
    var hideOk = hide === true || String(hide).toUpperCase() === 'TRUE';
    if (!hideOk) errors.push('OPERATOR_HIDE_SORT_KEYS not TRUE for ' + id);

    if (!String(r.DESKTOP_TITLE || '').trim()) errors.push('DESKTOP_TITLE missing for ' + id + ' (Phase 80D regression)');
    if (!String(r.CARD_SORT || '').trim() || !String(r.DESKTOP_SORT || '').trim()) {
      errors.push('CARD_SORT/DESKTOP_SORT must remain populated for sort backend on ' + id);
    }
  });

  return { ok: errors.length === 0, warnings: warnings, errors: errors, sampleChecked: sample.length };
}

function HomeAlertAttention_formatReportText_(r) {
  var driveFolderId = (r.reportJson && r.reportJson.driveFolderId) || HomeAlert_getSystemBrainDriveFolderId_();
  var lines = [];
  lines.push('=== HOME_ALERT OPERATOR ATTENTION TEST CONSOLE ===');
  lines.push('phase=' + r.phase);
  lines.push('status=' + r.status + ' severity=' + r.severity);
  lines.push('checkedAt=' + r.checkedAt + ' runBy=' + r.runBy);
  lines.push('traceId=' + r.traceId);
  lines.push('summary=' + r.summary);
  lines.push('checks=' + (r.checks ? r.checks.length : 0));
  (r.checks || []).forEach(function(c) { lines.push('- ' + c.name + ': ' + (c.ok ? 'OK' : 'FAIL')); });
  if ((r.warnings || []).length) lines.push('warnings=' + JSON.stringify(r.warnings, null, 2));
  if ((r.errors || []).length) lines.push('errors=' + JSON.stringify(r.errors, null, 2));
  lines.push('nextStep=' + r.nextStep);
  lines.push('operatorUxHideSortKeys=true (do not show CARD_SORT/DESKTOP_SORT/SORT_KEY in operator views)');
  lines.push('driveOnlineOutputTarget=https://drive.google.com/drive/folders/' + driveFolderId);
  return lines.join('\n');
}

// =============================================================================
// PHASE 80F — HOME_ALERT DISPLAY COLUMN CONSOLIDATION
// =============================================================================
// Chuẩn operator: OPERATOR_* + ATTENTION_LABEL / detail metadata (see
// 04_APPSHEET/HOME_ALERT_DISPLAY_COLUMN_STANDARD.md). Legacy DISPLAY_*/CARD_*/UX_*/DESKTOP_*
// remain on sheet for Admin Debug + backward compatibility only.
// No new display column groups in this phase — helpers + test console only.
// =============================================================================

/**
 * Official AppSheet operator Deck binding (canonical Phase 80F).
 * Sort column DESKTOP_SORT is backend-only: use as Sort by DESC, never as visible label.
 *
 * @returns {{
 *   primary: string,
 *   secondary: string,
 *   summary: string,
 *   nextAction: string,
 *   groupBy: string,
 *   sortBy: string,
 *   sortOrder: string,
 *   hiddenOperatorFields: string[]
 * }}
 */
function HomeAlert_getOfficialOperatorDisplayConfig_() {
  return {
    primary: 'OPERATOR_PRIMARY_TEXT',
    secondary: 'OPERATOR_SECONDARY_TEXT',
    summary: 'OPERATOR_META_TEXT',
    nextAction: 'OPERATOR_NEXT_ACTION',
    groupBy: 'OPERATOR_DASHBOARD_GROUP',
    sortBy: 'OPERATOR_DASHBOARD_SORT',
    sortOrder: 'DESC',
    hiddenOperatorFields: [
      'CARD_SORT',
      'DESKTOP_SORT',
      'SORT_KEY',
      'SOURCE_HASH',
      'TRACE_ID',
      'ACTION_PAYLOAD_JSON',
      'ALERT_FINGERPRINT',
      'ALERT_GROUP_KEY'
    ]
  };
}

/**
 * Validate sheet schema against official operator display policy (read-only).
 *
 * @returns {{ ok: boolean, errors: string[], warnings: string[], officialConfig: object }}
 */
function HomeAlert_validateOperatorDisplayPolicy_() {
  var cfg = HomeAlert_getOfficialOperatorDisplayConfig_();
  var sheetName = HomeAlert_getSheetName_();
  var headers = _headers(_sheet(sheetName));
  var errors = [];
  var warnings = [];

  var requiredForOperator = [
    cfg.primary, cfg.secondary, cfg.summary, cfg.nextAction, cfg.groupBy, cfg.sortBy,
    'ATTENTION_LABEL', 'ATTENTION_REASON', 'ACTION_FOCUS', 'ACTION_HINT', 'OWNER_LABEL',
    'STATUS', 'DUE_AT', 'NOTE'
  ];
  requiredForOperator.forEach(function(c) {
    if (headers.indexOf(c) === -1) errors.push('Missing column required for 80F operator policy: ' + c);
  });

  cfg.hiddenOperatorFields.forEach(function(h) {
    if (headers.indexOf(h) === -1) {
      if (h === 'ALERT_FINGERPRINT' || h === 'ALERT_GROUP_KEY') {
        warnings.push('Optional column not present on sheet: ' + h);
      } else {
        warnings.push('Expected backend column missing (pre-bootstrap sheet?): ' + h);
      }
    }
  });

  var legacySamples = ['DISPLAY_TITLE', 'CARD_GROUP', 'UX_VISIBLE', 'DESKTOP_TITLE'];
  legacySamples.forEach(function(l) {
    if (headers.indexOf(l) === -1) warnings.push('Legacy column missing (backward compat / admin debug): ' + l);
  });

  warnings.push('Policy: do not bind DISPLAY_*, CARD_*, UX_*, DESKTOP_* to operator Deck headers after 80F; Admin Debug only.');

  return { ok: errors.length === 0, errors: errors, warnings: warnings, officialConfig: cfg };
}

function HomeAlertDisplayStandard_checkHiddenList_(cfg) {
  var requiredHidden = ['CARD_SORT', 'DESKTOP_SORT', 'SORT_KEY', 'SOURCE_HASH', 'TRACE_ID', 'ACTION_PAYLOAD_JSON'];
  var missing = requiredHidden.filter(function(h) { return (cfg.hiddenOperatorFields || []).indexOf(h) === -1; });
  return { ok: missing.length === 0, missing: missing };
}

function HomeAlertDisplayStandard_checkManifestSubset_(headers) {
  var warnings = [];
  if (typeof CBV_SCHEMA_MANIFEST === 'undefined' || !CBV_SCHEMA_MANIFEST.HOME_ALERT) return { ok: true, warnings: warnings };
  var m = CBV_SCHEMA_MANIFEST.HOME_ALERT;
  headers.forEach(function(h) {
    if (h && m.indexOf(h) === -1) warnings.push('Sheet header not in CBV_SCHEMA_MANIFEST.HOME_ALERT: ' + h);
  });
  return { ok: true, warnings: warnings };
}

// ===== HOME_ALERT Display Standard Test Console (Phase 80F) =====

var __HOME_ALERT_DISPLAY_STANDARD_TEST_CONSOLE_LAST_REPORT = null;

function HomeAlertDisplayStandard_TestConsole_run() {
  var traceId = HomeAlert_newTraceId_();
  var checks = [];
  var warnings = [];
  var errors = [];

  var cfg = HomeAlert_getOfficialOperatorDisplayConfig_();

  try {
    var hid = HomeAlertDisplayStandard_checkHiddenList_(cfg);
    checks.push({ name: 'hiddenOperatorFieldsList', ok: hid.ok, details: hid });
    if (!hid.ok) errors.push('hiddenOperatorFields missing entries: ' + JSON.stringify(hid.missing || []));
  } catch (e0) {
    checks.push({ name: 'hiddenOperatorFieldsList', ok: false, details: { error: e0.message || String(e0) } });
    errors.push('hidden list check exception: ' + (e0.message || String(e0)));
  }

  try {
    var pol = HomeAlert_validateOperatorDisplayPolicy_();
    checks.push({ name: 'operatorDisplayPolicy', ok: pol.ok, details: { errors: pol.errors, warningsCount: (pol.warnings || []).length } });
    errors = errors.concat(pol.errors || []);
    warnings = warnings.concat(pol.warnings || []);
  } catch (e1) {
    checks.push({ name: 'operatorDisplayPolicy', ok: false, details: { error: e1.message || String(e1) } });
    errors.push('Policy validate exception: ' + (e1.message || String(e1)));
  }

  try {
    var headers = _headers(_sheet(HomeAlert_getSheetName_()));
    var man = HomeAlertDisplayStandard_checkManifestSubset_(headers);
    checks.push({ name: 'manifestSubset', ok: true, details: man });
    warnings = warnings.concat(man.warnings || []);
  } catch (e1b) {
    checks.push({ name: 'manifestSubset', ok: false, details: { error: e1b.message || String(e1b) } });
    warnings.push('Manifest subset check exception: ' + (e1b.message || String(e1b)));
  }

  try {
    var sm = HomeAlert_validateStateMachine_();
    checks.push({ name: 'stateMachine', ok: sm.ok, details: sm });
    if (!sm.ok) errors.push('State machine invalid: ' + JSON.stringify(sm.errors || []));
  } catch (e2) {
    checks.push({ name: 'stateMachine', ok: false, details: { error: e2.message || String(e2) } });
    errors.push('State machine exception: ' + (e2.message || String(e2)));
  }

  var refreshResult = null;
  try {
    refreshResult = HomeAlert_refresh({ autoClearMissing: false, autoExpire: false });
    checks.push({ name: 'refresh', ok: refreshResult.ok, details: refreshResult.stats });
    if (!refreshResult.ok) warnings.push('Refresh had errors: ' + JSON.stringify(refreshResult.stats.errors || []));
  } catch (e3) {
    checks.push({ name: 'refresh', ok: false, details: { error: e3.message || String(e3) } });
    errors.push('Refresh exception: ' + (e3.message || String(e3)));
  }

  try {
    var att = HomeAlertAttention_validateOutput_();
    checks.push({ name: 'attentionOutputRegression', ok: att.ok, details: att });
    if (!att.ok) errors = errors.concat(att.errors || []);
    warnings = warnings.concat(att.warnings || []);
  } catch (e4) {
    checks.push({ name: 'attentionOutputRegression', ok: false, details: { error: e4.message || String(e4) } });
    errors.push('Attention validate exception: ' + (e4.message || String(e4)));
  }

  try {
    var dup = HomeAlertDesktop_checkNoDuplicateAlertId_();
    checks.push({ name: 'noDuplicateAlertId', ok: dup.ok, details: dup });
    if (!dup.ok) errors.push('Duplicate ALERT_ID count=' + (dup.duplicates || 0));
  } catch (e5) {
    checks.push({ name: 'noDuplicateAlertId', ok: false, details: { error: e5.message || String(e5) } });
    errors.push('Duplicate check exception: ' + (e5.message || String(e5)));
  }

  var manifestCount = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT) ? CBV_SCHEMA_MANIFEST.HOME_ALERT.length : 0;

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var driveFolderId = HomeAlert_getSystemBrainDriveFolderId_();

  var report = {
    ok: status !== 'FAIL',
    phase: 'PHASE_80F_HOME_ALERT_DISPLAY_COLUMN_CONSOLIDATION',
    status: status,
    severity: severity,
    checkedAt: cbvNow(),
    runBy: HomeAlert_actorId_(),
    traceId: traceId,
    testSuite: 'HOME_ALERT_DISPLAY_STANDARD_RUNTIME',
    summary: 'HOME_ALERT display column consolidation (80F): ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'GO'
      ? 'Bind operator views per HOME_ALERT_DISPLAY_COLUMN_STANDARD.md; legacy columns Admin Debug only.'
      : 'Fix errors then rerun HomeAlertDisplayStandard_TestConsole_run().',
    reportText: '',
    reportJson: {
      officialOperatorDisplayConfig: cfg,
      refresh: refreshResult,
      manifestHomeAlertColumnCount: manifestCount,
      driveFolderId: driveFolderId,
      driveFolderUrl: 'https://drive.google.com/drive/folders/' + driveFolderId,
      driveFolderConfigKey: 'CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID',
      driveAutoUpload: false
    },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: true
  };

  report.reportText = HomeAlertDisplayStandard_formatReportText_(report);
  __HOME_ALERT_DISPLAY_STANDARD_TEST_CONSOLE_LAST_REPORT = report;
  Logger.log(report.reportText);
  return report;
}

function HomeAlertDisplayStandard_TestConsole_showReport() {
  var r = __HOME_ALERT_DISPLAY_STANDARD_TEST_CONSOLE_LAST_REPORT;
  if (!r) return { ok: false, message: 'No report. Run HomeAlertDisplayStandard_TestConsole_run() first.' };
  Logger.log(r.reportText || JSON.stringify(r, null, 2));
  return r;
}

function HomeAlertDisplayStandard_TestConsole_copyAiHandoff() {
  var r = __HOME_ALERT_DISPLAY_STANDARD_TEST_CONSOLE_LAST_REPORT;
  if (!r) return 'No report. Run HomeAlertDisplayStandard_TestConsole_run() first.';
  var driveFolderId = (r.reportJson && r.reportJson.driveFolderId) || HomeAlert_getSystemBrainDriveFolderId_();
  var text = [
    'PHASE: ' + r.phase,
    'STATUS: ' + r.status,
    'SEVERITY: ' + r.severity,
    'TRACE: ' + r.traceId,
    'CHECKED_AT: ' + r.checkedAt,
    'SUMMARY: ' + r.summary,
    'WARNINGS: ' + JSON.stringify(r.warnings || []),
    'ERRORS: ' + JSON.stringify(r.errors || []),
    'NEXT_STEP: ' + r.nextStep,
    'DISPLAY_STANDARD: HOME_ALERT_DISPLAY_COLUMN_STANDARD.md',
    'DRIVE_ONLINE_OUTPUT_TARGET: https://drive.google.com/drive/folders/' + driveFolderId
  ].join('\n');
  Logger.log(text);
  return text;
}

function HomeAlertDisplayStandard_formatReportText_(r) {
  var driveFolderId = (r.reportJson && r.reportJson.driveFolderId) || HomeAlert_getSystemBrainDriveFolderId_();
  var lines = [];
  lines.push('=== HOME_ALERT DISPLAY STANDARD TEST CONSOLE (80F) ===');
  lines.push('phase=' + r.phase);
  lines.push('status=' + r.status + ' severity=' + r.severity);
  lines.push('checkedAt=' + r.checkedAt + ' runBy=' + r.runBy);
  lines.push('traceId=' + r.traceId);
  lines.push('summary=' + r.summary);
  lines.push('checks=' + (r.checks ? r.checks.length : 0));
  (r.checks || []).forEach(function(c) { lines.push('- ' + c.name + ': ' + (c.ok ? 'OK' : 'FAIL')); });
  if ((r.warnings || []).length) lines.push('warnings=' + JSON.stringify(r.warnings, null, 2));
  if ((r.errors || []).length) lines.push('errors=' + JSON.stringify(r.errors, null, 2));
  lines.push('nextStep=' + r.nextStep);
  lines.push('officialConfig=' + JSON.stringify((r.reportJson && r.reportJson.officialOperatorDisplayConfig) || {}));
  lines.push('driveOnlineOutputTarget=https://drive.google.com/drive/folders/' + driveFolderId);
  return lines.join('\n');
}

// ===== HOME_ALERT Assignment / coordination runtime test console (Phase 81) =====

var __HOME_ALERT_ASSIGNMENT_TEST_CONSOLE_LAST_REPORT = null;

function HomeAlertAssignment_checkSchema_() {
  var required = [
    'ASSIGNMENT_STATUS', 'ASSIGNMENT_QUEUE', 'ASSIGNED_TO_LABEL', 'ASSIGNED_TEAM', 'ASSIGNED_TEAM_LABEL',
    'ASSIGNED_BY', 'ASSIGNMENT_NOTE', 'CLAIMED_AT', 'CLAIMED_BY',
    'LAST_OPERATOR_ACTION', 'LAST_OPERATOR_ACTION_AT', 'LAST_OPERATOR_ACTION_BY',
    'ESCALATE_AFTER_AT', 'IS_STUCK', 'STUCK_REASON', 'IS_BLOCKED', 'BLOCKED_REASON',
    'QUEUE_GROUP', 'QUEUE_LABEL', 'QUEUE_SORT', 'WORKLOAD_KEY',
    'OPERATOR_DASHBOARD_GROUP', 'OPERATOR_DASHBOARD_SORT'
  ];
  var sheetName = HomeAlert_getSheetName_();
  var sheet = _sheet(sheetName);
  var headers = _headers(sheet);
  var missing = required.filter(function(c) { return headers.indexOf(c) === -1; });
  return {
    ok: missing.length === 0,
    sheet: sheetName,
    missing: missing,
    errors: missing.map(function(c) { return 'Missing assignment column: ' + c; })
  };
}

function HomeAlertAssignment_checkWorkloadManifest_() {
  var errors = [];
  if (typeof CBV_SCHEMA_MANIFEST === 'undefined' || !CBV_SCHEMA_MANIFEST.HOME_ALERT_WORKLOAD) {
    errors.push('CBV_SCHEMA_MANIFEST.HOME_ALERT_WORKLOAD missing');
    return { ok: false, errors: errors };
  }
  var cols = CBV_SCHEMA_MANIFEST.HOME_ALERT_WORKLOAD;
  ['WORKLOAD_ID', 'OPERATOR_ID', 'LAST_REFRESH_AT', 'TRACE_ID'].forEach(function(c) {
    if (cols.indexOf(c) === -1) errors.push('HOME_ALERT_WORKLOAD manifest missing: ' + c);
  });
  return { ok: errors.length === 0, errors: errors, columns: cols };
}

function HomeAlertAssignment_checkWorkloadSheetHeaders_() {
  try {
    HomeAlert_ensureWorkloadSheet_();
    var wl = HomeAlert_getWorkloadSheetName_();
    var headers = _headers(_sheet(wl));
    var need = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST.HOME_ALERT_WORKLOAD)
      ? CBV_SCHEMA_MANIFEST.HOME_ALERT_WORKLOAD
      : [];
    var missing = need.filter(function(c) { return headers.indexOf(c) === -1; });
    return { ok: missing.length === 0, sheet: wl, missing: missing, errors: missing.map(function(m) { return 'Workload sheet missing: ' + m; }) };
  } catch (e) {
    return { ok: false, errors: [e.message || String(e)] };
  }
}

function HomeAlertAssignment_formatReportText_(r) {
  var driveFolderId = (r.reportJson && r.reportJson.driveFolderId) || HomeAlert_getSystemBrainDriveFolderId_();
  var lines = [];
  lines.push('=== HOME_ALERT ASSIGNMENT RUNTIME TEST CONSOLE (PHASE 81) ===');
  lines.push('phase=' + r.phase);
  lines.push('status=' + r.status + ' severity=' + r.severity);
  lines.push('checkedAt=' + r.checkedAt + ' runBy=' + r.runBy);
  lines.push('traceId=' + r.traceId);
  lines.push('summary=' + r.summary);
  lines.push('checks=' + (r.checks ? r.checks.length : 0));
  (r.checks || []).forEach(function(c) { lines.push('- ' + c.name + ': ' + (c.ok ? 'OK' : 'FAIL')); });
  if ((r.warnings || []).length) lines.push('warnings=' + JSON.stringify(r.warnings, null, 2));
  if ((r.errors || []).length) lines.push('errors=' + JSON.stringify(r.errors, null, 2));
  lines.push('nextStep=' + r.nextStep);
  lines.push('driveOnlineOutputTarget=https://drive.google.com/drive/folders/' + driveFolderId);
  return lines.join('\n');
}

function HomeAlertAssignment_TestConsole_run() {
  var traceId = HomeAlert_newTraceId_();
  var checks = [];
  var warnings = [];
  var errors = [];

  try {
    var s = HomeAlertAssignment_checkSchema_();
    checks.push({ name: 'schemaAssignmentColumns', ok: s.ok, details: s });
    if (!s.ok) errors = errors.concat(s.errors || []);
  } catch (e0) {
    checks.push({ name: 'schemaAssignmentColumns', ok: false, details: { error: e0.message || String(e0) } });
    errors.push('Schema check exception: ' + (e0.message || String(e0)));
  }

  try {
    var wm = HomeAlertAssignment_checkWorkloadManifest_();
    checks.push({ name: 'workloadManifest', ok: wm.ok, details: wm });
    if (!wm.ok) errors = errors.concat(wm.errors || []);
  } catch (e0b) {
    checks.push({ name: 'workloadManifest', ok: false, details: { error: e0b.message || String(e0b) } });
    errors.push('Workload manifest exception: ' + (e0b.message || String(e0b)));
  }

  try {
    var wh = HomeAlertAssignment_checkWorkloadSheetHeaders_();
    checks.push({ name: 'workloadSheetHeaders', ok: wh.ok, details: wh });
    if (!wh.ok) errors = errors.concat(wh.errors || []);
  } catch (e0c) {
    checks.push({ name: 'workloadSheetHeaders', ok: false, details: { error: e0c.message || String(e0c) } });
    errors.push('Workload sheet header exception: ' + (e0c.message || String(e0c)));
  }

  try {
    var sm = HomeAlert_validateStateMachine_();
    checks.push({ name: 'stateMachine', ok: sm.ok, details: sm });
    if (!sm.ok) errors.push('State machine invalid: ' + JSON.stringify(sm.errors || []));
  } catch (e1) {
    checks.push({ name: 'stateMachine', ok: false, details: { error: e1.message || String(e1) } });
    errors.push('State machine exception: ' + (e1.message || String(e1)));
  }

  var refreshResult = null;
  try {
    refreshResult = HomeAlert_refresh({ autoClearMissing: false, autoExpire: false });
    checks.push({ name: 'refresh', ok: refreshResult.ok, details: refreshResult.stats });
    if (!refreshResult.ok) warnings.push('Refresh had errors: ' + JSON.stringify(refreshResult.stats.errors || []));
  } catch (e2) {
    checks.push({ name: 'refresh', ok: false, details: { error: e2.message || String(e2) } });
    errors.push('Refresh exception: ' + (e2.message || String(e2)));
  }

  try {
    var homeRows = _rows(_sheet(HomeAlert_getSheetName_()));
    var sample = homeRows.filter(function(r) { return String(r.ALERT_ID || '').trim(); }).slice(0, 5);
    var enrichOk = true;
    var enrichDetails = [];
    sample.forEach(function(r) {
      var st = String(r.ASSIGNMENT_STATUS || '').trim();
      if (!st) enrichOk = false;
      enrichDetails.push({ id: String(r.ALERT_ID || '').trim(), ASSIGNMENT_STATUS: st, ASSIGNMENT_QUEUE: String(r.ASSIGNMENT_QUEUE || '').trim() });
    });
    checks.push({ name: 'assignmentEnrichSample', ok: sample.length === 0 ? true : enrichOk, details: { rows: enrichDetails } });
    if (sample.length && !enrichOk) errors.push('ASSIGNMENT_STATUS empty on refreshed sample rows (enrich regression)');
    if (!sample.length) warnings.push('No HOME_ALERT rows to verify assignment enrich output.');
  } catch (e2b) {
    checks.push({ name: 'assignmentEnrichSample', ok: false, details: { error: e2b.message || String(e2b) } });
    errors.push('Assignment enrich sample exception: ' + (e2b.message || String(e2b)));
  }

  var workloadRefresh = null;
  try {
    workloadRefresh = HomeAlertWorkload_refresh();
    checks.push({ name: 'workloadRefresh', ok: workloadRefresh.ok, details: workloadRefresh });
    if (!workloadRefresh || !workloadRefresh.ok) errors.push('HomeAlertWorkload_refresh failed');
  } catch (eW) {
    checks.push({ name: 'workloadRefresh', ok: false, details: { error: eW.message || String(eW) } });
    errors.push('Workload refresh exception: ' + (eW.message || String(eW)));
  }

  var actionProbe = { claim: false, assign: false, wait: false, block: false, escalate: false, transfer: false };
  try {
    var rows = _rows(_sheet(HomeAlert_getSheetName_()));
    var probeId = '';
    var probe = rows.find(function(r) {
      var st = String(r.STATUS || '').trim();
      return HomeAlert_isActiveStatus_(st) && st === HOME_ALERT_STATUS.OPEN && !String(r.ASSIGNED_TO || '').trim();
    });
    if (probe) probeId = String(probe.ALERT_ID || '').trim();
    if (!probeId) {
      warnings.push('No OPEN+unassigned alert found; skipping mutating action probes (claim/wait/escalate/block/resolve).');
      checks.push({ name: 'operationalActionProbe', ok: true, details: { skipped: true } });
    } else {
      HomeAlert_claimAlert(probeId, 'Phase81 test claim');
      var afterClaim = _rows(_sheet(HomeAlert_getSheetName_())).find(function(r) { return String(r.ALERT_ID || '').trim() === probeId; });
      actionProbe.claim = String(afterClaim.ASSIGNED_TO || '').trim() === String(HomeAlert_actorId_()).trim()
        && String(afterClaim.STATUS || '').trim() === HOME_ALERT_STATUS.IN_PROGRESS;
      if (!actionProbe.claim) errors.push('claim probe failed for ' + probeId);

      HomeAlert_assignAlert(probeId, HomeAlert_actorId_(), 'Phase81 test assign self');
      actionProbe.assign = true;

      HomeAlert_transferQueue(probeId, 'TEAM_QUEUE', 'Phase81 transfer');
      actionProbe.transfer = true;

      HomeAlert_markWaiting(probeId, 'Phase81 test wait');
      var afterWait = _rows(_sheet(HomeAlert_getSheetName_())).find(function(r) { return String(r.ALERT_ID || '').trim() === probeId; });
      actionProbe.wait = String(afterWait.STATUS || '').trim() === HOME_ALERT_STATUS.WAITING_RESPONSE;

      HomeAlert_escalateOperational(probeId, 'Phase81 test escalate');
      var afterEsc = _rows(_sheet(HomeAlert_getSheetName_())).find(function(r) { return String(r.ALERT_ID || '').trim() === probeId; });
      actionProbe.escalate = String(afterEsc.STATUS || '').trim() === HOME_ALERT_STATUS.ESCALATED;

      HomeAlert_markBlocked(probeId, 'Phase81 blocked');
      var afterBlock = _rows(_sheet(HomeAlert_getSheetName_())).find(function(r) { return String(r.ALERT_ID || '').trim() === probeId; });
      actionProbe.block = afterBlock.IS_BLOCKED === true || String(afterBlock.IS_BLOCKED).toUpperCase() === 'TRUE';

      HomeAlert_resolveOperational(probeId, 'Phase81 test resolve cleanup');
      checks.push({ name: 'operationalActionProbe', ok: actionProbe.claim && actionProbe.wait && actionProbe.escalate && actionProbe.block, details: actionProbe });
      if (!(actionProbe.claim && actionProbe.wait && actionProbe.escalate && actionProbe.block)) {
        errors.push('Operational action probe incomplete: ' + JSON.stringify(actionProbe));
      }
    }
  } catch (e3) {
    checks.push({ name: 'operationalActionProbe', ok: false, details: { error: e3.message || String(e3), actionProbe: actionProbe } });
    errors.push('Action probe exception: ' + (e3.message || String(e3)));
  }

  try {
    var pol = HomeAlert_validateOperatorDisplayPolicy_();
    checks.push({ name: 'displayStandard80F', ok: pol.ok, details: { errors: pol.errors, warningsCount: (pol.warnings || []).length } });
    if (!pol.ok) errors = errors.concat(pol.errors || []);
    warnings = warnings.concat(pol.warnings || []);
  } catch (e4) {
    checks.push({ name: 'displayStandard80F', ok: false, details: { error: e4.message || String(e4) } });
    errors.push('80F policy exception: ' + (e4.message || String(e4)));
  }

  try {
    var att = HomeAlertAttention_validateOutput_();
    checks.push({ name: 'attentionOutput80E', ok: att.ok, details: att });
    if (!att.ok) errors = errors.concat(att.errors || []);
    warnings = warnings.concat(att.warnings || []);
  } catch (e5) {
    checks.push({ name: 'attentionOutput80E', ok: false, details: { error: e5.message || String(e5) } });
    errors.push('80E attention exception: ' + (e5.message || String(e5)));
  }

  try {
    var dup = HomeAlertDesktop_checkNoDuplicateAlertId_();
    checks.push({ name: 'noDuplicateAlertId', ok: dup.ok, details: dup });
    if (!dup.ok) errors.push('Duplicate ALERT_ID count=' + (dup.duplicates || 0));
  } catch (e6) {
    checks.push({ name: 'noDuplicateAlertId', ok: false, details: { error: e6.message || String(e6) } });
    errors.push('Duplicate check exception: ' + (e6.message || String(e6)));
  }

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');
  var driveFolderId = HomeAlert_getSystemBrainDriveFolderId_();

  var report = {
    ok: status !== 'FAIL',
    phase: 'PHASE_81_OPERATIONAL_ASSIGNMENT_RUNTIME',
    status: status,
    severity: severity,
    checkedAt: cbvNow(),
    runBy: HomeAlert_actorId_(),
    traceId: traceId,
    testSuite: 'HOME_ALERT_ASSIGNMENT_RUNTIME',
    summary: 'HOME_ALERT operational assignment runtime: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'GO'
      ? 'Wire AppSheet actions to GAS (Claim/Assign/Transfer/Mark Waiting/Escalate/Block/Resolve) per HOME_ALERT_APPSHEET_SETUP.md; bind coordination Deck per HOME_ALERT_ASSIGNMENT_RUNTIME_STANDARD.md.'
      : 'Fix errors then rerun HomeAlertAssignment_TestConsole_run().',
    reportText: '',
    reportJson: {
      refresh: refreshResult,
      workloadRefresh: workloadRefresh,
      actionProbe: actionProbe,
      driveFolderId: driveFolderId,
      driveFolderUrl: 'https://drive.google.com/drive/folders/' + driveFolderId,
      driveFolderConfigKey: 'CBV_SYSTEM_BRAIN_DRIVE_FOLDER_ID',
      driveAutoUpload: false
    },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: true
  };

  report.reportText = HomeAlertAssignment_formatReportText_(report);
  __HOME_ALERT_ASSIGNMENT_TEST_CONSOLE_LAST_REPORT = report;
  Logger.log(report.reportText);
  return report;
}

function HomeAlertAssignment_TestConsole_showReport() {
  var r = __HOME_ALERT_ASSIGNMENT_TEST_CONSOLE_LAST_REPORT;
  if (!r) return { ok: false, message: 'No report. Run HomeAlertAssignment_TestConsole_run() first.' };
  Logger.log(r.reportText || JSON.stringify(r, null, 2));
  return r;
}

function HomeAlertAssignment_TestConsole_copyAiHandoff() {
  var r = __HOME_ALERT_ASSIGNMENT_TEST_CONSOLE_LAST_REPORT;
  if (!r) return 'No report. Run HomeAlertAssignment_TestConsole_run() first.';
  var driveFolderId = (r.reportJson && r.reportJson.driveFolderId) || HomeAlert_getSystemBrainDriveFolderId_();
  var text = [
    'PHASE: ' + r.phase,
    'STATUS: ' + r.status,
    'SEVERITY: ' + r.severity,
    'TRACE: ' + r.traceId,
    'CHECKED_AT: ' + r.checkedAt,
    'SUMMARY: ' + r.summary,
    'WARNINGS: ' + JSON.stringify(r.warnings || []),
    'ERRORS: ' + JSON.stringify(r.errors || []),
    'NEXT_STEP: ' + r.nextStep,
    'ASSIGNMENT_STANDARD: HOME_ALERT_ASSIGNMENT_RUNTIME_STANDARD.md',
    'DRIVE_ONLINE_OUTPUT_TARGET: https://drive.google.com/drive/folders/' + driveFolderId
  ].join('\n');
  Logger.log(text);
  return text;
}

// =============================================================================
// PHASE_82 — SLA / ESCALATION manual actions + test console
// =============================================================================

function HomeAlert_mergeRowWithPatch_(row, patch) {
  var m = {};
  Object.keys(row || {}).forEach(function(k) { m[k] = row[k]; });
  Object.keys(patch || {}).forEach(function(k2) { m[k2] = patch[k2]; });
  return m;
}

function HomeAlert_checkSlaRuntime() {
  var traceId = HomeAlert_newTraceId_();
  var now = cbvNow();
  var updated = 0;
  var errors = [];
  try {
    HomeAlert_ensureHomeAlertSheet_();
    var sheetName = HomeAlert_getSheetName_();
    var rows = _rows(_sheet(sheetName));
    rows.forEach(function(row) {
      var id = String(row.ALERT_ID || '').trim();
      if (!id) return;
      if (!HomeAlert_isActiveStatus_(String(row.STATUS || '').trim())) return;
      try {
        HomeAlert_patchAlertOperational_(id, { SLA_LAST_CHECKED_AT: now }, 'SLA_CHECK_RUNTIME', '');
        updated++;
      } catch (e1) {
        errors.push(id + ': ' + (e1.message || String(e1)));
      }
    });
  } catch (e0) {
    errors.push(e0.message || String(e0));
  }
  return { ok: errors.length === 0, traceId: traceId, updated: updated, errors: errors };
}

function HomeAlert_detectStuckItems(options) {
  var traceId = HomeAlert_newTraceId_();
  var opts = options || {};
  var apply = opts.apply !== false;
  var items = [];
  var patched = 0;
  try {
    HomeAlert_ensureHomeAlertSheet_();
    var sheetName = HomeAlert_getSheetName_();
    var rows = _rows(_sheet(sheetName));
    rows.forEach(function(row) {
      var id = String(row.ALERT_ID || '').trim();
      if (!id) return;
      var m = HomeAlert_mergeRowWithPatch_(row, {});
      HomeAlert_enrichSlaEscalationRuntime_(m);
      var ev = HomeAlert_evaluateStuckSignals_(m);
      if (ev.stuck) {
        items.push({ alertId: id, signals: ev.signals });
        if (apply) {
          var reason = ev.signals.map(function(s) { return s.message; }).join(' | ');
          HomeAlert_patchAlertOperational_(id, { IS_STUCK: true, STUCK_REASON: reason }, 'STUCK_DETECT', '');
          patched++;
        }
      } else if (apply) {
        var was = row.IS_STUCK === true || String(row.IS_STUCK).toUpperCase() === 'TRUE';
        if (was) {
          HomeAlert_patchAlertOperational_(id, { IS_STUCK: false, STUCK_REASON: '' }, 'STUCK_CLEAR', '');
          patched++;
        }
      }
    });
  } catch (e0) {
    return { ok: false, traceId: traceId, items: items, patched: patched, error: e0.message || String(e0) };
  }
  return { ok: true, traceId: traceId, items: items, patched: patched };
}

function HomeAlert_suggestEscalations(options) {
  var traceId = HomeAlert_newTraceId_();
  var opts = options || {};
  var apply = opts.apply !== false;
  var suggested = 0;
  try {
    HomeAlert_ensureHomeAlertSheet_();
    var sheetName = HomeAlert_getSheetName_();
    var rows = _rows(_sheet(sheetName));
    rows.forEach(function(row) {
      var id = String(row.ALERT_ID || '').trim();
      if (!id) return;
      if (!HomeAlert_isActiveStatus_(String(row.STATUS || '').trim())) return;
      var m = HomeAlert_mergeRowWithPatch_(row, {});
      HomeAlert_enrichSlaEscalationRuntime_(m);
      var ev = HomeAlert_evaluateStuckSignals_(m);
      var curEsc = String(row.ESCALATION_STATUS || '').trim() || HOME_ALERT_ESCALATION_STATUS.NONE;
      var slaSt = String(m.SLA_STATUS || '').trim();
      var need = ev.stuck || slaSt === HOME_ALERT_SLA_STATUS.OVERDUE || slaSt === HOME_ALERT_SLA_STATUS.BREACHED;
      if (!need) return;
      if (curEsc === HOME_ALERT_ESCALATION_STATUS.ESCALATED
        || curEsc === HOME_ALERT_ESCALATION_STATUS.ACKNOWLEDGED
        || curEsc === HOME_ALERT_ESCALATION_STATUS.WAITING
        || curEsc === HOME_ALERT_ESCALATION_STATUS.RESOLVED
        || curEsc === HOME_ALERT_ESCALATION_STATUS.SUGGESTED) {
        return;
      }
      if (!apply) {
        suggested++;
        return;
      }
      var reason = ev.stuck ? ev.signals.map(function(s) { return s.code; }).join(',') : ('SLA:' + slaSt);
      HomeAlert_patchAlertOperational_(id, {
        ESCALATION_STATUS: HOME_ALERT_ESCALATION_STATUS.SUGGESTED,
        ESCALATION_REASON: reason,
        LAST_ESCALATION_CHECK_AT: cbvNow(),
        ESCALATION_NEXT_ACTION: 'Xem xét escalate manual hoặc HomeAlert_escalateByPolicy().'
      }, 'ESCALATION_SUGGEST', '');
      suggested++;
    });
  } catch (e0) {
    return { ok: false, traceId: traceId, suggested: suggested, error: e0.message || String(e0) };
  }
  return { ok: true, traceId: traceId, suggested: suggested };
}

function HomeAlert_escalateByPolicy(alertId, payload) {
  var id = String(alertId || '').trim();
  var p = payload || {};
  var toUid = String(p.toUserId || p.escalatedTo || '').trim();
  var traceEsc = String(p.traceId || HomeAlert_newTraceId_()).trim();
  var lvl = Math.max(1, Math.round(Number(p.level || 1)) || 1);
  var reason = String(p.reason || 'Policy escalate').trim();
  try {
    var row = _rows(_sheet(HomeAlert_getSheetName_())).find(function(r) { return String(r.ALERT_ID || '').trim() === id; }) || null;
    if (row) {
      var es = String(row.ESCALATION_STATUS || '').trim();
      if (es === HOME_ALERT_ESCALATION_STATUS.ESCALATED && String(row.ESCALATED_TO || '').trim() === toUid && Number(row.ESCALATION_LEVEL || 0) === lvl) {
        return { ok: true, alertId: id, idempotent: true };
      }
    }
  } catch (eR) {}
  var patch = {
    ESCALATION_LEVEL: lvl,
    ESCALATION_STATUS: HOME_ALERT_ESCALATION_STATUS.ESCALATED,
    ESCALATION_REASON: reason,
    ESCALATED_AT: cbvNow(),
    ESCALATED_BY: HomeAlert_actorId_(),
    ESCALATED_TO: toUid,
    LAST_ESCALATION_CHECK_AT: cbvNow(),
    ESCALATION_NEXT_ACTION: 'Theo dõi người được escalate (' + (toUid || 'n/a') + ').',
    ESCALATION_TRACE_ID: traceEsc
  };
  return HomeAlert_patchAlertOperational_(id, patch, 'ESCALATE_BY_POLICY', reason);
}

function HomeAlert_acknowledgeEscalation(alertId, note) {
  var id = String(alertId || '').trim();
  try {
    var row = _rows(_sheet(HomeAlert_getSheetName_())).find(function(r) { return String(r.ALERT_ID || '').trim() === id; }) || null;
    if (row && String(row.ESCALATION_STATUS || '').trim() === HOME_ALERT_ESCALATION_STATUS.ACKNOWLEDGED) {
      return { ok: true, alertId: id, idempotent: true };
    }
  } catch (e0) {}
  return HomeAlert_patchAlertOperational_(id, {
    ESCALATION_STATUS: HOME_ALERT_ESCALATION_STATUS.ACKNOWLEDGED,
    ESCALATION_NEXT_ACTION: 'Tiếp tục xử lý sau khi acknowledge escalate.'
  }, 'ESCALATION_ACK', note || '');
}

function HomeAlert_resolveEscalation(alertId, note) {
  var id = String(alertId || '').trim();
  try {
    var row = _rows(_sheet(HomeAlert_getSheetName_())).find(function(r) { return String(r.ALERT_ID || '').trim() === id; }) || null;
    if (row && String(row.ESCALATION_STATUS || '').trim() === HOME_ALERT_ESCALATION_STATUS.RESOLVED) {
      return { ok: true, alertId: id, idempotent: true };
    }
  } catch (e0) {}
  return HomeAlert_patchAlertOperational_(id, {
    ESCALATION_STATUS: HOME_ALERT_ESCALATION_STATUS.RESOLVED,
    ESCALATION_NEXT_ACTION: ''
  }, 'ESCALATION_RESOLVE', note || '');
}

function HomeAlert_pauseSla(alertId, note) {
  return HomeAlert_patchAlertOperational_(String(alertId || '').trim(), {
    SLA_STATUS: HOME_ALERT_SLA_STATUS.PAUSED,
    SLA_NEXT_REVIEW_AT: ''
  }, 'SLA_PAUSE', note || '');
}

function HomeAlert_resumeSla(alertId, note) {
  return HomeAlert_patchAlertOperational_(String(alertId || '').trim(), {
    SLA_STATUS: ''
  }, 'SLA_RESUME', note || '');
}

var __HOME_ALERT_SLA_ESCALATION_TEST_CONSOLE_LAST_REPORT = null;

function HomeAlertSlaEscalation_validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function HomeAlertSlaEscalation_TestConsole_run() {
  var traceId = HomeAlert_newTraceId_();
  var checks = [];
  var warnings = [];
  var errors = [];
  var slaCols = [
    'SLA_POLICY', 'SLA_TARGET_MINUTES', 'SLA_DUE_AT', 'SLA_STATUS', 'SLA_BREACH_LEVEL',
    'SLA_ELAPSED_MINUTES', 'SLA_LAST_CHECKED_AT', 'SLA_NEXT_REVIEW_AT'
  ];
  var escCols = [
    'ESCALATION_LEVEL', 'ESCALATION_STATUS', 'ESCALATION_REASON', 'ESCALATED_AT', 'ESCALATED_BY', 'ESCALATED_TO',
    'LAST_ESCALATION_CHECK_AT', 'ESCALATION_NEXT_ACTION', 'ESCALATION_TRACE_ID'
  ];

  function addCheck(code, ok, severity, message, detail) {
    checks.push({ code: code, ok: ok, severity: severity, message: message, detail: detail });
    if (!ok && severity === 'ERROR') errors.push(message);
    if (!ok && severity === 'WARNING') warnings.push(message);
  }

  try {
    HomeAlert_ensureHomeAlertSheet_();
    var headers = _headers(_sheet(HomeAlert_getSheetName_()));
    var missSla = slaCols.filter(function(c) { return headers.indexOf(c) === -1; });
    addCheck('SLA_COLUMNS', missSla.length === 0, missSla.length ? 'ERROR' : 'OK', missSla.length ? 'Missing SLA columns: ' + missSla.join(',') : 'SLA columns present', { missing: missSla });
  } catch (e1) {
    addCheck('SLA_COLUMNS', false, 'ERROR', e1.message || String(e1), {});
  }

  try {
    var headers2 = _headers(_sheet(HomeAlert_getSheetName_()));
    var missE = escCols.filter(function(c) { return headers2.indexOf(c) === -1; });
    addCheck('ESCALATION_COLUMNS', missE.length === 0, missE.length ? 'ERROR' : 'OK', missE.length ? 'Missing escalation columns: ' + missE.join(',') : 'Escalation columns present', { missing: missE });
  } catch (e2) {
    addCheck('ESCALATION_COLUMNS', false, 'ERROR', e2.message || String(e2), {});
  }

  var slaEnumOk = Object.keys(HOME_ALERT_SLA_STATUS || {}).length >= 6;
  addCheck('SLA_STATUS_ENUM', slaEnumOk, slaEnumOk ? 'OK' : 'ERROR', slaEnumOk ? 'SLA_STATUS enum usable' : 'SLA_STATUS enum missing', HOME_ALERT_SLA_STATUS);

  var escEnumOk = Object.keys(HOME_ALERT_ESCALATION_STATUS || {}).length >= 6;
  addCheck('ESCALATION_STATUS_ENUM', escEnumOk, escEnumOk ? 'OK' : 'ERROR', escEnumOk ? 'ESCALATION_STATUS enum usable' : 'ESCALATION_STATUS enum missing', HOME_ALERT_ESCALATION_STATUS);

  addCheck('STUCK_HELPER', typeof HomeAlert_evaluateStuckSignals_ === 'function', typeof HomeAlert_evaluateStuckSignals_ === 'function' ? 'OK' : 'ERROR', 'evaluateStuckSignals_', {});
  addCheck('DETECT_STUCK_PUBLIC', typeof HomeAlert_detectStuckItems === 'function', typeof HomeAlert_detectStuckItems === 'function' ? 'OK' : 'ERROR', 'HomeAlert_detectStuckItems', {});
  var manualOk = typeof HomeAlert_checkSlaRuntime === 'function'
    && typeof HomeAlert_suggestEscalations === 'function'
    && typeof HomeAlert_escalateByPolicy === 'function';
  addCheck('MANUAL_ACTIONS', manualOk, manualOk ? 'OK' : 'ERROR', 'Manual SLA/escalation actions', {});

  try {
    var pol = HomeAlert_validateOperatorDisplayPolicy_();
    addCheck('OPERATOR_DISPLAY_POLICY', pol.ok, pol.ok ? 'OK' : 'ERROR', 'Operator display policy', { errors: pol.errors });
    if (!pol.ok) errors = errors.concat(pol.errors || []);
    warnings = warnings.concat(pol.warnings || []);
  } catch (eP) {
    addCheck('OPERATOR_DISPLAY_POLICY', false, 'ERROR', eP.message || String(eP), {});
  }

  var legacyRequired = ['DISPLAY_TITLE', 'CARD_GROUP', 'DESKTOP_TITLE'];
  try {
    var h3 = _headers(_sheet(HomeAlert_getSheetName_()));
    var missL = legacyRequired.filter(function(c) { return h3.indexOf(c) === -1; });
    addCheck('LEGACY_NOT_OPERATOR_REQUIRED', true, missL.length ? 'WARNING' : 'OK',
      missL.length ? 'Legacy columns missing (acceptable for operator-only UX if absent): ' + missL.join(',') : 'Legacy sample columns present for admin/debug',
      { missing: missL });
    if (missL.length) warnings.push('Legacy DISPLAY/CARD/DESKTOP optional for operator UX.');
  } catch (eL) {
    addCheck('LEGACY_NOT_OPERATOR_REQUIRED', true, 'WARNING', eL.message || String(eL), {});
  }

  var auditOk = typeof logAdminAudit === 'function';
  addCheck('AUDIT_SINK', auditOk, auditOk ? 'OK' : 'ERROR', 'logAdminAudit for append-only audit', {});

  var noAuto = typeof HomeAlert_installPhase82ProductionTriggers !== 'function';
  addCheck('NO_AUTO_PRODUCTION_TRIGGER', noAuto, noAuto ? 'OK' : 'ERROR', 'No Phase82 auto-trigger installer', {});

  addCheck('REPORT_ENVELOPE_HELPER', typeof HomeAlertSlaEscalation_validateEnvelope_ === 'function', typeof HomeAlertSlaEscalation_validateEnvelope_ === 'function' ? 'OK' : 'ERROR', 'validateEnvelope_', {});

  var refreshResult = null;
  try {
    refreshResult = HomeAlert_refresh({ autoClearMissing: false, autoExpire: false });
    var rOk = !!(refreshResult && refreshResult.ok);
    addCheck('REFRESH_SAFE', rOk, rOk ? 'OK' : 'WARNING', 'HomeAlert_refresh', refreshResult);
    if (refreshResult && !refreshResult.ok) warnings.push('Refresh errors: ' + JSON.stringify(refreshResult.stats.errors || []));
  } catch (eR) {
    addCheck('REFRESH_SAFE', false, 'ERROR', eR.message || String(eR), {});
  }

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: 'PHASE_82_SLA_AND_ESCALATION_RUNTIME',
    status: status,
    severity: severity,
    checkedAt: cbvNow(),
    runBy: HomeAlert_actorId_(),
    traceId: traceId,
    testSuite: 'HOME_ALERT_SLA_ESCALATION_RUNTIME',
    summary: 'HOME_ALERT SLA & escalation runtime: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'GO'
      ? 'Run HomeAlert_checkSlaRuntime() manually after workload refresh; tune SLA_POLICY/SLA_TARGET_MINUTES per alert type.'
      : 'Fix errors then rerun HomeAlertSlaEscalation_TestConsole_run().',
    reportText: '',
    reportJson: { refresh: refreshResult },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: false
  };

  var env = HomeAlertSlaEscalation_validateEnvelope_(report);
  report.envelopeOk = env.ok;
  if (!env.ok) {
    warnings.push('Envelope missing keys: ' + (env.missing || []).join(','));
    report.status = errors.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
    report.ok = errors.length === 0;
  }

  report.reportText = [
    '=== HOME_ALERT SLA / ESCALATION TEST CONSOLE (PHASE 82) ===',
    'status=' + report.status + ' severity=' + report.severity,
    'traceId=' + report.traceId,
    'envelopeOk=' + report.envelopeOk,
    (report.checks || []).map(function(c) { return (c.ok ? '[OK]' : '[X]') + ' ' + c.code + ': ' + c.message; }).join('\n')
  ].join('\n');

  __HOME_ALERT_SLA_ESCALATION_TEST_CONSOLE_LAST_REPORT = report;
  Logger.log(report.reportText);
  return report;
}

function HomeAlertSlaEscalation_TestConsole_showReport() {
  var r = __HOME_ALERT_SLA_ESCALATION_TEST_CONSOLE_LAST_REPORT;
  if (!r) return { ok: false, message: 'No report. Run HomeAlertSlaEscalation_TestConsole_run() first.' };
  Logger.log(r.reportText || JSON.stringify(r, null, 2));
  return r;
}
