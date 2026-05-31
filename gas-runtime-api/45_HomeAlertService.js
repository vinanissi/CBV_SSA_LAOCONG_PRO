/**
 * HOME_ALERT runtime — read today summary, claim, resolve (gas-runtime-api).
 */

function homeAlertNowIso_() {
  return Utilities.formatDate(new Date(), CBV_TASK_DB_CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
}

function homeAlertIsActiveRow_(rec) {
  var active = String(rec.IS_ACTIVE || '').toLowerCase();
  if (active === 'false' || active === '0' || active === 'no') return false;
  var resolved = String(rec.IS_RESOLVED || '').toLowerCase();
  if (resolved === 'true' || resolved === '1' || resolved === 'yes') return false;
  var st = String(rec.STATUS || '').trim();
  return CBV_HOME_ALERT_ACTIVE.indexOf(st) >= 0;
}

function homeAlertSeverityUi_(raw) {
  var s = String(raw || '').trim().toUpperCase();
  if (s === 'CRITICAL' || s === 'HIGH' || s === 'ERROR') return 'error';
  if (s === 'MEDIUM' || s === 'WARN' || s === 'WARNING') return 'warn';
  return 'info';
}

function homeAlertBuildHref_(rec) {
  var url = String(rec.RELATED_RECORD_URL || '').trim();
  if (url && (url.indexOf('/') === 0 || url.indexOf('http') === 0)) return url.indexOf('/') === 0 ? url : url;
  var type = String(rec.RELATED_ENTITY_TYPE || rec.MODULE_CODE || '').trim().toUpperCase();
  var id = String(rec.RELATED_ENTITY_ID || '').trim();
  if (!id) return '';
  if (type === 'TASK' || type === 'TASK_MAIN' || String(rec.MODULE_CODE || '').toUpperCase() === 'TASK') {
    return '/inbox/' + encodeURIComponent(id);
  }
  if (type === 'HO_SO' || type === 'HOSO') return '/hoso';
  if (type === 'FINANCE') return '/finance';
  return '';
}

function homeAlertMapAlert_(rec) {
  var id = String(rec.ALERT_ID || '').trim();
  var type = String(rec.ALERT_TYPE || rec.ALERT_CODE || 'ALERT').trim();
  var moduleCode = String(rec.MODULE_CODE || 'TASK').trim();
  var relatedType = String(rec.RELATED_ENTITY_TYPE || '').trim();
  var relatedId = String(rec.RELATED_ENTITY_ID || '').trim();
  var taskId = relatedType.toUpperCase() === 'TASK' || relatedType.toUpperCase() === 'TASK_MAIN' ? relatedId : '';
  if (!taskId && moduleCode.toUpperCase() === 'TASK' && relatedId) taskId = relatedId;

  return {
    alertId: id,
    type: type,
    severity: homeAlertSeverityUi_(rec.SEVERITY),
    title: String(rec.DISPLAY_TITLE || rec.TITLE || '').trim() || id,
    message: String(rec.DISPLAY_SUMMARY || rec.MESSAGE || '').trim(),
    module: moduleCode || 'TASK',
    resourceId: relatedId || id,
    href: homeAlertBuildHref_(rec),
    nextStep: String(rec.OPERATOR_NEXT_ACTION || rec.ACTION_LABEL || rec.DISPLAY_ACTION_TEXT || '').trim(),
    createdAt: String(rec.CREATED_AT || rec.UPDATED_AT || ''),
    updatedAt: String(rec.UPDATED_AT || rec.CREATED_AT || ''),
    dueAt: String(rec.DUE_AT || ''),
    status: String(rec.STATUS || '').trim(),
    assignedTo: String(rec.ASSIGNED_TO || '').trim(),
    claimedBy: String(rec.CLAIMED_BY || '').trim(),
    relatedEntityType: relatedType,
    relatedEntityId: relatedId,
    taskId: taskId,
    priority: String(rec.PRIORITY_SCORE || ''),
    autoResolve: false,
    autoEscalate: false,
  };
}

function homeAlertReadRows_() {
  var info = taskDbReadHeaders_(CBV_HOME_ALERT_SHEET);
  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { rows: [], info: info };
  var values = sheet.getRange(2, 1, lastRow, sheet.getLastColumn()).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var rec = taskDbRowToRecord_(info.headerMap, values[i]);
    rec._rowNumber = i + 2;
    rows.push(rec);
  }
  return { rows: rows, info: info };
}

function homeAlertFindRow_(alertId) {
  var id = String(alertId || '').trim();
  var data = homeAlertReadRows_();
  for (var i = 0; i < data.rows.length; i++) {
    if (String(data.rows[i].ALERT_ID || '').trim() === id) return { record: data.rows[i], info: data.info, rowNumber: data.rows[i]._rowNumber };
  }
  return null;
}

function homeAlertPatchRow_(found, patch) {
  var info = found.info;
  var sheet = info.sheet;
  Object.keys(patch).forEach(function (col) {
    var idx = info.headerMap[col.toUpperCase()];
    if (idx !== undefined) sheet.getRange(found.rowNumber, idx + 1).setValue(patch[col]);
  });
}

function homeAlertAppendNote_(rec, note, patch) {
  var n = String(note || '').trim();
  if (!n) return;
  var prev = String(rec.NOTE || '').trim();
  var entry = '[' + Utilities.formatDate(new Date(), CBV_TASK_DB_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm') + '] ' + n;
  patch.NOTE = prev ? prev + '\n' + entry : entry;
}

function homeAlertListActive_(limit) {
  var data = homeAlertReadRows_();
  var alerts = [];
  for (var i = 0; i < data.rows.length; i++) {
    if (!homeAlertIsActiveRow_(data.rows[i])) continue;
    alerts.push(homeAlertMapAlert_(data.rows[i]));
  }
  alerts.sort(function (a, b) {
    var pa = parseFloat(a.priority) || 0;
    var pb = parseFloat(b.priority) || 0;
    if (pb !== pa) return pb - pa;
    return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
  });
  var max = parseInt(limit, 10) || 80;
  if (max > 0 && alerts.length > max) alerts = alerts.slice(0, max);
  return alerts;
}

function homeAlertBuildTodaySummary_(payload) {
  var limit = payload && payload.alertLimit ? payload.alertLimit : 80;
  var alerts = homeAlertListActive_(limit);
  var tasks = [];
  var warnings = [];

  try {
    if (typeof taskDbReadMainSummaries_ === 'function') {
      var tr = taskDbReadMainSummaries_();
      tasks = tr.summaries || [];
    }
  } catch (e) {
    warnings.push('TASK_MAIN slice skipped: ' + (e.message || String(e)));
  }

  var actorId = payload && payload.operatorId ? String(payload.operatorId) : '';
  var today = taskDbToday_();
  var myTasks = actorId ? tasks.filter(function (t) { return t.ownerId === actorId; }) : tasks.slice(0, 20);
  var overdueTasks = tasks.filter(function (t) { return t.isOverdue || (t.dueDate && t.dueDate < today && t.status !== 'DONE'); });
  var priorityTasks = tasks.filter(function (t) {
    return t.priority === 'HIGH' || t.priority === 'URGENT' || t.priority === 'CRITICAL';
  });

  return {
    alerts: alerts,
    priorityTasks: priorityTasks.slice(0, 30),
    myTasks: myTasks.slice(0, 30),
    overdueTasks: overdueTasks.slice(0, 30),
    missingHoSo: [],
    pendingFinance: [],
    demoLabel: '',
    runtime: {
      mode: 'google_sheet_existing_db',
      source: 'HOME_ALERT',
      alertCount: alerts.length,
      generatedAt: homeAlertNowIso_(),
    },
    warnings: warnings,
  };
}

function homeAlertClaim_(alertId, actor, note) {
  var found = homeAlertFindRow_(alertId);
  if (!found) return { ok: false, message: 'Không tìm thấy alert: ' + alertId };
  var row = found.record;
  if (!homeAlertIsActiveRow_(row)) return { ok: false, message: 'Alert không còn active' };

  var uid = String(actor.userId || actor.displayName || '').trim();
  var cur = String(row.ASSIGNED_TO || '').trim();
  if (cur && cur !== uid) return { ok: false, message: 'Alert đã được giao cho operator khác' };

  var now = homeAlertNowIso_();
  var patch = {
    STATUS: CBV_HOME_ALERT_STATUS.IN_PROGRESS,
    ASSIGNED_TO: uid,
    CLAIMED_AT: now,
    CLAIMED_BY: uid,
    UPDATED_AT: now,
    STATE_CHANGED_AT: now,
    STATE_CHANGED_BY: uid,
    LAST_ACTION: 'CLAIM',
  };
  homeAlertAppendNote_(row, note || 'Claim từ Workboard', patch);
  homeAlertPatchRow_(found, patch);

  if (typeof taskDbAppendAudit_ === 'function') {
    taskDbAppendAudit_({ actor: actor.displayName, action: 'claimHomeAlert', detail: { alertId: alertId } });
  }

  return { ok: true, alert: homeAlertMapAlert_(Object.assign({}, row, patch)), alertId: alertId };
}

function homeAlertResolve_(alertId, actor, note) {
  var found = homeAlertFindRow_(alertId);
  if (!found) return { ok: false, message: 'Không tìm thấy alert: ' + alertId };
  var row = found.record;
  if (CBV_HOME_ALERT_TERMINAL.indexOf(String(row.STATUS || '').trim()) >= 0) {
    return { ok: false, message: 'Alert đã đóng' };
  }

  var uid = String(actor.userId || actor.displayName || '').trim();
  var now = homeAlertNowIso_();
  var patch = {
    STATUS: CBV_HOME_ALERT_STATUS.RESOLVED,
    IS_RESOLVED: 'true',
    IS_ACTIVE: 'false',
    RESOLVED_AT: now,
    RESOLVED_BY: uid,
    UPDATED_AT: now,
    STATE_CHANGED_AT: now,
    STATE_CHANGED_BY: uid,
    LAST_ACTION: 'RESOLVE',
  };
  homeAlertAppendNote_(row, note || 'Resolve từ Workboard', patch);
  homeAlertPatchRow_(found, patch);

  if (typeof taskDbAppendAudit_ === 'function') {
    taskDbAppendAudit_({ actor: actor.displayName, action: 'resolveHomeAlert', detail: { alertId: alertId } });
  }

  return { ok: true, alert: homeAlertMapAlert_(Object.assign({}, row, patch)), alertId: alertId };
}

function CBV_HomeAlert_getAllowedActions() {
  return CBV_HOME_ALERT_ACTIONS.slice();
}

function CBV_HomeAlert_isRegisteredAction(action) {
  return CBV_HOME_ALERT_ACTIONS.indexOf(String(action || '').trim()) >= 0;
}
