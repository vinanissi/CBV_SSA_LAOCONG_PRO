/**
 * PHASE_80A — HOME_ALERT sheet-driven runtime.
 *
 * Principles:
 * - GAS computes, Sheet stores, AppSheet displays.
 * - Idempotent refresh using SOURCE_HASH (dedupe).
 * - Append-only audit log via ADMIN_AUDIT_LOG (no delete of old alerts).
 * - No triggers created here; manual-first.
 */

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

function HomeAlert_refresh() {
  var traceId = HomeAlert_newTraceId_();
  var startedAt = cbvNow();
  HomeAlert_ensureHomeAlertSheet_();

  var generated = [];
  var stats = { traceId: traceId, generated: 0, upserted: 0, updated: 0, inserted: 0, errors: [] };

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

  generated.forEach(function(alert) {
    try {
      var r = HomeAlert_upsertAlert_(alert, traceId);
      stats.upserted++;
      if (r && r.action === 'INSERT') stats.inserted++;
      if (r && r.action === 'UPDATE') stats.updated++;
    } catch (e) {
      stats.errors.push('UPSERT: ' + (e.message || String(e)));
    }
  });

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
      actionLabel: 'Resolve',
      actionType: 'RESOLVE_ALERT',
      actionPayload: { alertCode: 'TASK_OVERDUE', taskId: id },
      status: 'OPEN',
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
      actionLabel: 'Resolve',
      actionType: 'RESOLVE_ALERT',
      actionPayload: { alertCode: 'FIN_UNCONFIRMED_OLD', financeId: id },
      status: 'OPEN',
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
        actionLabel: 'Resolve',
        actionType: 'RESOLVE_ALERT',
        actionPayload: { alertCode: moduleCode + '_LOG_NOTE_ERROR', logId: id, table: sheetName },
        status: 'OPEN',
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
    var patch = {};
    Object.keys(alert).forEach(function(k) { patch[k] = alert[k]; });
    patch.UPDATED_AT = now;
    patch.TRACE_ID = traceId || patch.TRACE_ID || '';
    if (existing.CREATED_AT) patch.CREATED_AT = existing.CREATED_AT;
    _updateRow(sheetName, existing._rowNumber, patch);
    return { action: 'UPDATE', alertId: alertId };
  }

  var record = {};
  Object.keys(alert).forEach(function(k) { record[k] = alert[k]; });
  if (!record.CREATED_AT) record.CREATED_AT = now;
  record.UPDATED_AT = now;
  record.TRACE_ID = traceId || record.TRACE_ID || '';
  _appendRecord(sheetName, record);
  return { action: 'INSERT', alertId: alertId };
}

function HomeAlert_resolveAlert(alertId, note) {
  HomeAlert_ensureHomeAlertSheet_();
  var traceId = HomeAlert_newTraceId_();
  var sheetName = HomeAlert_getSheetName_();
  var sheet = _sheet(sheetName);
  var rows = _rows(sheet);
  var id = String(alertId || '').trim();
  cbvAssert(id, 'alertId required');

  var row = rows.find(function(r) { return String(r.ALERT_ID || '').trim() === id; }) || null;
  cbvAssert(row, 'Alert not found: ' + id);

  var before = { STATUS: row.STATUS, IS_ACTIVE: row.IS_ACTIVE, IS_RESOLVED: row.IS_RESOLVED, NOTE: row.NOTE };
  var patch = {
    STATUS: 'RESOLVED',
    IS_ACTIVE: false,
    IS_RESOLVED: true,
    RESOLVED_AT: cbvNow(),
    RESOLVED_BY: (typeof mapCurrentUserEmailToInternalId === 'function' ? mapCurrentUserEmailToInternalId() : null) || cbvUser(),
    NOTE: note || row.NOTE || '',
    UPDATED_AT: cbvNow(),
    TRACE_ID: traceId
  };
  _updateRow(sheetName, row._rowNumber, patch);

  try {
    if (typeof logAdminAudit === 'function') {
      logAdminAudit('HOME_ALERT_RESOLVE', 'HOME_ALERT', id, 'UPDATE', before, patch, 'Resolve alert ' + id);
    }
  } catch (e) {}

  return { ok: true, alertId: id, traceId: traceId };
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
    var r = HomeAlert_refresh();
    checks.push({ name: 'refresh', ok: r.ok, details: { traceId: r.traceId, stats: r.stats } });
    if (!r.ok) warnings.push('Refresh had errors: ' + JSON.stringify(r.stats.errors || []));
  } catch (e2) {
    checks.push({ name: 'refresh', ok: false, details: { error: e2.message || String(e2) } });
    errors.push('Refresh exception: ' + (e2.message || String(e2)));
  }

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  return {
    ok: status !== 'FAIL',
    phase: 'PHASE_80A_HOME_ALERT_SHEET_DRIVEN_RUNTIME',
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
    nextStep: status === 'GO' ? 'Manual AppSheet setup: add HOME_ALERT table + views/slice/actions.' : 'Fix errors then rerun HomeAlert_selfTest().',
    reportText: '',
    reportJson: { health: h },
    contractVersion: 'CBV_TEST_CONSOLE_V1'
  };
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
    STATUS: p.status || 'OPEN',
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
    NOTE: ''
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

