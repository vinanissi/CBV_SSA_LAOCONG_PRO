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
    OPERATOR_HIDE_SORT_KEYS: true
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
    'OPERATOR_HIDE_SORT_KEYS'
  ].forEach(function(k) { patch[k] = incoming[k]; });

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
  return bits.join(' · ');
}

function HomeAlert_buildOperatorNextAction_(alert) {
  var a = alert || {};
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
