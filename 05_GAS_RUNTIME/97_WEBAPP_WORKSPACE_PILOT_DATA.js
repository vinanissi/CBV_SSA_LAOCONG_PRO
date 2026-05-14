/**
 * PHASE_90 — WebApp Workspace Pilot Pages — Data binding (read-first)
 *
 * No destructive writes. No auto assign/resolve/escalate. No production claim.
 */

function CbvWebAppPilotData__out_(ok, data, warnings, errors) {
  return {
    ok: ok === true,
    data: data || null,
    warnings: warnings || [],
    errors: errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CbvWebAppPilotData__getSheetSafe_(name) {
  try {
    var ss = SpreadsheetApp.getActive();
    var sh = ss.getSheetByName(String(name || '').trim());
    if (!sh) return { ok: false, sheet: null, warning: 'Missing sheet: ' + name };
    return { ok: true, sheet: sh, warning: '' };
  } catch (e) {
    return { ok: false, sheet: null, warning: 'Sheet access error: ' + (e && e.message ? e.message : String(e)) };
  }
}

function CbvWebAppPilotData__headerIndex_(headers) {
  var idx = {};
  (headers || []).forEach(function(h, i) { idx[String(h || '').trim()] = i; });
  return idx;
}

function CbvWebAppPilotData__pickIdx_(idx, candidates) {
  for (var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    if (idx[c] !== undefined) return idx[c];
  }
  return undefined;
}

function CbvWebAppPilotData__readRows_(sh, limit) {
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return { headers: [], rows: [] };
  var lastCol = sh.getLastColumn();
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var n = Math.min(limit || 200, lastRow - 1);
  var values = sh.getRange(2, 1, n, lastCol).getValues();
  return { headers: headers, rows: values };
}

function CbvWebAppPilotData__isResolved_(status) {
  var s = String(status || '').trim().toLowerCase();
  return s === 'resolved' || s === 'closed' || s === 'done';
}

function CbvWebAppPilotData__toNum_(v) {
  if (v == null || v === '') return 0;
  var n = Number(v);
  return isNaN(n) ? 0 : n;
}

function CbvWebAppPilotData__isToday_(d) {
  try {
    if (!d) return false;
    var dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return false;
    var now = new Date();
    return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth() && dt.getDate() === now.getDate();
  } catch (e) {
    return false;
  }
}

function CbvWebAppPilotData_getQueueCards(userEmail) {
  var warnings = [];
  var errors = [];
  var email = String(userEmail || '').trim() || (Session.getActiveUser ? Session.getActiveUser().getEmail() : '');

  var got = CbvWebAppPilotData__getSheetSafe_((typeof CBV_WEBAPP_WS_SHEETS !== 'undefined' && CBV_WEBAPP_WS_SHEETS.HOME_ALERT) ? CBV_WEBAPP_WS_SHEETS.HOME_ALERT : 'HOME_ALERT');
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppPilotData__out_(false, { userEmail: email, count: 0, cards: [] }, warnings, errors);
  }

  var pack = CbvWebAppPilotData__readRows_(got.sheet, 200);
  var idx = CbvWebAppPilotData__headerIndex_(pack.headers);

  var iId = CbvWebAppPilotData__pickIdx_(idx, ['ALERT_ID', 'HOME_ALERT_ID', 'ID']);
  var iStatus = CbvWebAppPilotData__pickIdx_(idx, ['STATUS']);
  var iAssigned = CbvWebAppPilotData__pickIdx_(idx, ['ASSIGNED_TO']);
  var iPriority = CbvWebAppPilotData__pickIdx_(idx, ['PRIORITY_SCORE', 'PRIORITY']);
  var iSlaStatus = CbvWebAppPilotData__pickIdx_(idx, ['SLA_STATUS']);
  var iBreach = CbvWebAppPilotData__pickIdx_(idx, ['SLA_BREACH_LEVEL']);
  var iUpdated = CbvWebAppPilotData__pickIdx_(idx, ['UPDATED_AT', 'UPDATEDAT', 'UPDATED_DATE']);

  var iOp1 = CbvWebAppPilotData__pickIdx_(idx, ['OPERATOR_PRIMARY_TEXT']);
  var iOp2 = CbvWebAppPilotData__pickIdx_(idx, ['OPERATOR_SECONDARY_TEXT']);
  var iOpMeta = CbvWebAppPilotData__pickIdx_(idx, ['OPERATOR_META_TEXT']);
  var iOpNext = CbvWebAppPilotData__pickIdx_(idx, ['OPERATOR_NEXT_ACTION']);
  var iTaskRowKey = CbvWebAppPilotData__pickIdx_(idx, ['TASK_ROW_KEY', 'ROW_KEY']);
  var iTaskMainId = CbvWebAppPilotData__pickIdx_(idx, ['TASK_MAIN_ID']);
  var iTaskIdCol = CbvWebAppPilotData__pickIdx_(idx, ['TASK_ID']);

  if (iStatus === undefined || iAssigned === undefined) {
    warnings.push('HOME_ALERT missing STATUS/ASSIGNED_TO columns; queue cards limited.');
  }
  if (iOp1 === undefined) warnings.push('Missing OPERATOR_PRIMARY_TEXT (cards will fallback to ID).');

  var cards = [];
  for (var r = 0; r < pack.rows.length; r++) {
    var row = pack.rows[r];
    var assigned = iAssigned !== undefined ? String(row[iAssigned] || '').trim() : '';
    if (assigned && email && assigned !== email) continue;
    var status = iStatus !== undefined ? String(row[iStatus] || '').trim() : '';
    if (CbvWebAppPilotData__isResolved_(status)) continue;

    var id = iId !== undefined ? String(row[iId] || '').trim() : '';
    var op1 = iOp1 !== undefined ? String(row[iOp1] || '').trim() : '';
    var op2 = iOp2 !== undefined ? String(row[iOp2] || '').trim() : '';
    var opm = iOpMeta !== undefined ? String(row[iOpMeta] || '').trim() : '';
    var opn = iOpNext !== undefined ? String(row[iOpNext] || '').trim() : '';

    var slaStatus = iSlaStatus !== undefined ? String(row[iSlaStatus] || '').trim() : '';
    var breach = iBreach !== undefined ? CbvWebAppPilotData__toNum_(row[iBreach]) : 0;
    var updatedAt = iUpdated !== undefined ? row[iUpdated] : '';

    cards.push({
      id: id,
      title: op1 || id || '(no title)',
      status: status,
      assignedTo: assigned,
      moduleCode: 'HOME_ALERT',
      priority: iPriority !== undefined ? row[iPriority] : '',
      slaStatus: slaStatus,
      slaBreachLevel: breach,
      operatorPrimaryText: op1,
      operatorSecondaryText: op2,
      operatorMetaText: opm,
      operatorNextAction: opn,
      updatedAt: updatedAt,
      taskRowKey: iTaskRowKey !== undefined ? String(row[iTaskRowKey] || '').trim() : '',
      TASK_MAIN_ID: iTaskMainId !== undefined ? String(row[iTaskMainId] || '').trim() : '',
      TASK_ID: iTaskIdCol !== undefined ? String(row[iTaskIdCol] || '').trim() : ''
    });
  }

  // Sort by breach desc, then updated desc (best-effort).
  cards.sort(function(a, b) {
    var bd = (b.slaBreachLevel || 0) - (a.slaBreachLevel || 0);
    if (bd !== 0) return bd;
    var ad = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
    var bd2 = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
    return bd2 - ad;
  });

  return CbvWebAppPilotData__out_(true, { userEmail: email, count: cards.length, cards: cards.slice(0, 100) }, warnings, errors);
}

function CbvWebAppPilotData_getHomeDashboard() {
  var warnings = [];
  var errors = [];

  var user = (Session.getActiveUser ? Session.getActiveUser().getEmail() : '');
  var queue = CbvWebAppPilotData_getQueueCards(user);
  warnings = warnings.concat(queue.warnings || []);

  var got = CbvWebAppPilotData__getSheetSafe_((typeof CBV_WEBAPP_WS_SHEETS !== 'undefined' && CBV_WEBAPP_WS_SHEETS.HOME_ALERT) ? CBV_WEBAPP_WS_SHEETS.HOME_ALERT : 'HOME_ALERT');
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppPilotData__out_(false, {
      totals: { myQueue: queue.data ? queue.data.count : 0, unassigned: 0, breached: 0, escalated: 0, blocked: 0, resolvedToday: 0 },
      cards: (queue.data && queue.data.cards) ? queue.data.cards.slice(0, 12) : [],
      warnings: warnings
    }, warnings, errors);
  }

  var pack = CbvWebAppPilotData__readRows_(got.sheet, 200);
  var idx = CbvWebAppPilotData__headerIndex_(pack.headers);

  var iStatus = CbvWebAppPilotData__pickIdx_(idx, ['STATUS']);
  var iAssigned = CbvWebAppPilotData__pickIdx_(idx, ['ASSIGNED_TO']);
  var iSlaStatus = CbvWebAppPilotData__pickIdx_(idx, ['SLA_STATUS']);
  var iBreach = CbvWebAppPilotData__pickIdx_(idx, ['SLA_BREACH_LEVEL']);
  var iEsc = CbvWebAppPilotData__pickIdx_(idx, ['ESCALATION_STATUS']);
  var iBlocked = CbvWebAppPilotData__pickIdx_(idx, ['IS_BLOCKED']);
  var iUpdated = CbvWebAppPilotData__pickIdx_(idx, ['UPDATED_AT', 'UPDATEDAT', 'UPDATED_DATE']);

  var totals = { myQueue: queue.data ? queue.data.count : 0, unassigned: 0, breached: 0, escalated: 0, blocked: 0, resolvedToday: 0 };

  for (var r = 0; r < pack.rows.length; r++) {
    var row = pack.rows[r];
    var status = iStatus !== undefined ? String(row[iStatus] || '').trim() : '';
    var assigned = iAssigned !== undefined ? String(row[iAssigned] || '').trim() : '';
    var sla = iSlaStatus !== undefined ? String(row[iSlaStatus] || '').trim() : '';
    var breach = iBreach !== undefined ? CbvWebAppPilotData__toNum_(row[iBreach]) : 0;

    if (!assigned && !CbvWebAppPilotData__isResolved_(status)) totals.unassigned++;
    if (breach > 0 || sla.toUpperCase() === 'OVERDUE' || sla.toUpperCase() === 'BREACHED') totals.breached++;

    if (iEsc !== undefined) {
      var es = String(row[iEsc] || '').trim().toUpperCase();
      if (es === 'ESCALATED' || es === 'ACKNOWLEDGED') totals.escalated++;
    }
    if (iBlocked !== undefined) {
      var b = row[iBlocked];
      var bt = (b === true || String(b).trim().toUpperCase() === 'TRUE' || String(b).trim().toUpperCase() === 'YES');
      if (bt) totals.blocked++;
    }

    if (CbvWebAppPilotData__isResolved_(status)) {
      var up = iUpdated !== undefined ? row[iUpdated] : null;
      if (CbvWebAppPilotData__isToday_(up)) totals.resolvedToday++;
    }
  }

  var topCards = (queue.data && queue.data.cards) ? queue.data.cards.slice(0, 12) : [];
  return CbvWebAppPilotData__out_(true, { totals: totals, cards: topCards, warnings: warnings }, warnings, errors);
}

function CbvWebAppPilotData_getSlaWidgets() {
  var warnings = [];
  var errors = [];

  var got = CbvWebAppPilotData__getSheetSafe_((typeof CBV_WEBAPP_WS_SHEETS !== 'undefined' && CBV_WEBAPP_WS_SHEETS.HOME_ALERT) ? CBV_WEBAPP_WS_SHEETS.HOME_ALERT : 'HOME_ALERT');
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppPilotData__out_(false, { countsBySlaStatus: {}, countsByBreachLevel: {}, breachedItems: [], resolvedCount: 0, warningItems: warnings }, warnings, errors);
  }

  var pack = CbvWebAppPilotData__readRows_(got.sheet, 200);
  var idx = CbvWebAppPilotData__headerIndex_(pack.headers);

  var iId = CbvWebAppPilotData__pickIdx_(idx, ['ALERT_ID', 'HOME_ALERT_ID', 'ID']);
  var iStatus = CbvWebAppPilotData__pickIdx_(idx, ['STATUS']);
  var iSlaStatus = CbvWebAppPilotData__pickIdx_(idx, ['SLA_STATUS']);
  var iBreach = CbvWebAppPilotData__pickIdx_(idx, ['SLA_BREACH_LEVEL']);
  var iOp1 = CbvWebAppPilotData__pickIdx_(idx, ['OPERATOR_PRIMARY_TEXT']);

  if (iSlaStatus === undefined && iBreach === undefined) warnings.push('Missing SLA_STATUS and SLA_BREACH_LEVEL; SLA widgets limited.');

  var countsBySlaStatus = {};
  var countsByBreachLevel = {};
  var breachedItems = [];
  var resolvedCount = 0;

  for (var r = 0; r < pack.rows.length; r++) {
    var row = pack.rows[r];
    var status = iStatus !== undefined ? String(row[iStatus] || '').trim() : '';
    if (CbvWebAppPilotData__isResolved_(status)) resolvedCount++;

    var sla = iSlaStatus !== undefined ? String(row[iSlaStatus] || '').trim() : '';
    var breach = iBreach !== undefined ? CbvWebAppPilotData__toNum_(row[iBreach]) : 0;

    var key = String(sla || '(blank)');
    countsBySlaStatus[key] = (countsBySlaStatus[key] || 0) + 1;

    var bKey = String(breach);
    countsByBreachLevel[bKey] = (countsByBreachLevel[bKey] || 0) + 1;

    if (breach > 0 || sla.toUpperCase() === 'OVERDUE' || sla.toUpperCase() === 'BREACHED') {
      breachedItems.push({
        id: iId !== undefined ? String(row[iId] || '') : '',
        title: iOp1 !== undefined ? String(row[iOp1] || '') : '',
        slaStatus: sla,
        breachLevel: breach
      });
    }
  }

  breachedItems.sort(function(a, b) { return (b.breachLevel || 0) - (a.breachLevel || 0); });

  return CbvWebAppPilotData__out_(true, {
    countsBySlaStatus: countsBySlaStatus,
    countsByBreachLevel: countsByBreachLevel,
    breachedItems: breachedItems.slice(0, 20),
    resolvedCount: resolvedCount,
    warningItems: warnings
  }, warnings, errors);
}

function CbvWebAppPilotData_getTimelinePreview() {
  var warnings = [];
  var errors = [];

  var got = CbvWebAppPilotData__getSheetSafe_((typeof CBV_WEBAPP_WS_SHEETS !== 'undefined' && CBV_WEBAPP_WS_SHEETS.HOME_ALERT) ? CBV_WEBAPP_WS_SHEETS.HOME_ALERT : 'HOME_ALERT');
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppPilotData__out_(false, { items: [] }, warnings, errors);
  }
  var pack = CbvWebAppPilotData__readRows_(got.sheet, 100);
  var idx = CbvWebAppPilotData__headerIndex_(pack.headers);
  var iId = CbvWebAppPilotData__pickIdx_(idx, ['ALERT_ID', 'HOME_ALERT_ID', 'ID']);
  var iUpdated = CbvWebAppPilotData__pickIdx_(idx, ['UPDATED_AT', 'UPDATEDAT', 'UPDATED_DATE']);
  var iOp1 = CbvWebAppPilotData__pickIdx_(idx, ['OPERATOR_PRIMARY_TEXT']);

  var items = pack.rows.map(function(row) {
    return {
      id: iId !== undefined ? String(row[iId] || '') : '',
      title: iOp1 !== undefined ? String(row[iOp1] || '') : '',
      updatedAt: iUpdated !== undefined ? row[iUpdated] : ''
    };
  });
  items.sort(function(a, b) {
    var at = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
    var bt = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
    return bt - at;
  });
  return CbvWebAppPilotData__out_(true, { items: items.slice(0, 20) }, warnings, errors);
}

function CbvWebAppPilotData_getKanbanPreview() {
  var warnings = [];
  var errors = [];

  var got = CbvWebAppPilotData__getSheetSafe_((typeof CBV_WEBAPP_WS_SHEETS !== 'undefined' && CBV_WEBAPP_WS_SHEETS.HOME_ALERT) ? CBV_WEBAPP_WS_SHEETS.HOME_ALERT : 'HOME_ALERT');
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppPilotData__out_(false, { byStatus: {} }, warnings, errors);
  }
  var pack = CbvWebAppPilotData__readRows_(got.sheet, 200);
  var idx = CbvWebAppPilotData__headerIndex_(pack.headers);
  var iStatus = CbvWebAppPilotData__pickIdx_(idx, ['STATUS']);
  var iId = CbvWebAppPilotData__pickIdx_(idx, ['ALERT_ID', 'HOME_ALERT_ID', 'ID']);
  var iOp1 = CbvWebAppPilotData__pickIdx_(idx, ['OPERATOR_PRIMARY_TEXT']);

  if (iStatus === undefined) {
    warnings.push('Missing STATUS; kanban preview limited.');
    return CbvWebAppPilotData__out_(false, { byStatus: {} }, warnings, errors);
  }

  var by = {};
  for (var r = 0; r < pack.rows.length; r++) {
    var row = pack.rows[r];
    var st = String(row[iStatus] || '').trim() || '(blank)';
    if (!by[st]) by[st] = [];
    by[st].push({ id: iId !== undefined ? String(row[iId] || '') : '', title: iOp1 !== undefined ? String(row[iOp1] || '') : '' });
  }
  return CbvWebAppPilotData__out_(true, { byStatus: by }, warnings, errors);
}

function CbvWebAppPilotData_validate() {
  var warnings = [];
  var errors = [];

  var got = CbvWebAppPilotData__getSheetSafe_((typeof CBV_WEBAPP_WS_SHEETS !== 'undefined' && CBV_WEBAPP_WS_SHEETS.HOME_ALERT) ? CBV_WEBAPP_WS_SHEETS.HOME_ALERT : 'HOME_ALERT');
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppPilotData__out_(true, { ok: true, columns: {} }, warnings, errors);
  }

  var sh = got.sheet;
  if (sh.getLastRow() < 1) {
    warnings.push('HOME_ALERT empty.');
    return CbvWebAppPilotData__out_(true, { ok: true, columns: {} }, warnings, errors);
  }
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var idx = CbvWebAppPilotData__headerIndex_(headers);

  var rec = {
    id: CbvWebAppPilotData__pickIdx_(idx, ['ALERT_ID', 'HOME_ALERT_ID', 'ID']) !== undefined,
    status: idx.STATUS !== undefined,
    assignedTo: idx.ASSIGNED_TO !== undefined,
    slaStatus: idx.SLA_STATUS !== undefined,
    slaBreachLevel: idx.SLA_BREACH_LEVEL !== undefined,
    updatedAt: (idx.UPDATED_AT !== undefined) || (idx.UPDATEDAT !== undefined) || (idx.UPDATED_DATE !== undefined),
    op1: idx.OPERATOR_PRIMARY_TEXT !== undefined,
    op2: idx.OPERATOR_SECONDARY_TEXT !== undefined,
    opm: idx.OPERATOR_META_TEXT !== undefined,
    opn: idx.OPERATOR_NEXT_ACTION !== undefined
  };

  Object.keys(rec).forEach(function(k) {
    if (!rec[k]) warnings.push('Recommended column missing: ' + k);
  });

  return CbvWebAppPilotData__out_(true, { ok: true, columns: rec }, warnings, errors);
}

