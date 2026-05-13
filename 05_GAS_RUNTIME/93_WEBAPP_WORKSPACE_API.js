/**
 * PHASE_89 — WebApp Operational Workspace Skeleton (read-first APIs)
 */

function CbvWebAppWorkspace__apiOut_(ok, data, warnings, errors) {
  return {
    ok: ok === true,
    data: data || null,
    warnings: warnings || [],
    errors: errors || [],
    checkedAt: CbvWebAppWorkspace__now_()
  };
}

function CbvWebAppWorkspace__getSheetSafe_(name) {
  try {
    var ss = SpreadsheetApp.getActive();
    var sh = ss.getSheetByName(String(name || '').trim());
    if (!sh) return { ok: false, sheet: null, warning: 'Missing sheet: ' + name };
    return { ok: true, sheet: sh, warning: '' };
  } catch (e) {
    return { ok: false, sheet: null, warning: 'Sheet access error: ' + (e && e.message ? e.message : String(e)) };
  }
}

function CbvWebAppWorkspace__countByField_(rows, field) {
  var out = {};
  var k = String(field || '').trim();
  for (var i = 0; i < rows.length; i++) {
    var v = rows[i] ? rows[i][k] : '';
    var key = String(v == null ? '' : v).trim();
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function CbvWebAppWorkspace_getRouteRegistry() {
  try {
    var reg = CbvWebAppWorkspace_routeRegistry();
    return CbvWebAppWorkspace__apiOut_(true, { routes: reg }, [], []);
  } catch (e) {
    return CbvWebAppWorkspace__apiOut_(false, null, [], ['route registry error: ' + (e && e.message ? e.message : String(e))]);
  }
}

function CbvWebAppWorkspace_getRoute(route) {
  try {
    var r = CbvWebAppWorkspace_routeByPath(route);
    if (!r) return CbvWebAppWorkspace__apiOut_(false, null, [], ['Route not found: ' + route]);
    return CbvWebAppWorkspace__apiOut_(true, r, [], []);
  } catch (e) {
    return CbvWebAppWorkspace__apiOut_(false, null, [], ['getRoute error: ' + (e && e.message ? e.message : String(e))]);
  }
}

function CbvWebAppWorkspace_getHomeSummary() {
  var warnings = [];
  var errors = [];

  var q = CbvWebAppWorkspace_getMyQueueSummary(Session.getActiveUser().getEmail());
  if (!q.ok) warnings = warnings.concat(q.warnings || []); // treat as warning for shell

  var sla = CbvWebAppWorkspace_getSlaSummary();
  if (!sla.ok) warnings = warnings.concat(sla.warnings || []);

  var health = CbvWebAppWorkspace_getRuntimeHealthSummary();
  if (!health.ok) warnings = warnings.concat(health.warnings || []);

  var data = {
    myQueue: q.data,
    sla: sla.data,
    runtime: health.data
  };

  return CbvWebAppWorkspace__apiOut_(errors.length === 0, data, warnings, errors);
}

function CbvWebAppWorkspace_getMyQueueSummary(userEmail) {
  var warnings = [];
  var errors = [];
  var email = String(userEmail || '').trim() || (Session.getActiveUser ? Session.getActiveUser().getEmail() : '');

  var sn = CBV_WEBAPP_WS_SHEETS.HOME_ALERT;
  var got = CbvWebAppWorkspace__getSheetSafe_(sn);
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppWorkspace__apiOut_(false, { userEmail: email, count: 0, rows: [] }, warnings, errors);
  }

  var sh = got.sheet;
  var lastRow = sh.getLastRow();
  if (lastRow < 2) {
    return CbvWebAppWorkspace__apiOut_(true, { userEmail: email, count: 0, rows: [] }, warnings, errors);
  }

  var lastCol = sh.getLastColumn();
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  headers.forEach(function(h, i) { idx[String(h || '').trim()] = i; });

  var colAssigned = idx.ASSIGNED_TO;
  var colStatus = idx.STATUS;
  var colId = idx.ALERT_ID;
  if (colAssigned === undefined || colStatus === undefined) {
    warnings.push('HOME_ALERT missing ASSIGNED_TO/STATUS headers for My Queue summary.');
    return CbvWebAppWorkspace__apiOut_(false, { userEmail: email, count: 0, rows: [] }, warnings, errors);
  }

  var limit = Math.min(200, lastRow - 1);
  var values = sh.getRange(2, 1, limit, lastCol).getValues();
  var rows = [];
  for (var r = 0; r < values.length; r++) {
    var row = values[r];
    var assigned = String(row[colAssigned] || '').trim();
    if (assigned && email && assigned !== email) continue;
    var status = String(row[colStatus] || '').trim();
    if (status && (status.toLowerCase() === 'resolved' || status.toLowerCase() === 'closed')) continue;
    rows.push({
      id: colId !== undefined ? String(row[colId] || '') : '',
      status: status,
      assignedTo: assigned
    });
  }

  return CbvWebAppWorkspace__apiOut_(true, { userEmail: email, count: rows.length, rows: rows.slice(0, 50) }, warnings, errors);
}

function CbvWebAppWorkspace_getSlaSummary() {
  var warnings = [];
  var errors = [];
  var sn = CBV_WEBAPP_WS_SHEETS.HOME_ALERT;
  var got = CbvWebAppWorkspace__getSheetSafe_(sn);
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppWorkspace__apiOut_(false, { counts: {} }, warnings, errors);
  }
  var sh = got.sheet;
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return CbvWebAppWorkspace__apiOut_(true, { counts: {} }, warnings, errors);

  var lastCol = sh.getLastColumn();
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  headers.forEach(function(h, i) { idx[String(h || '').trim()] = i; });
  var colSla = idx.SLA_STATUS;
  if (colSla === undefined) {
    warnings.push('HOME_ALERT missing SLA_STATUS header.');
    return CbvWebAppWorkspace__apiOut_(false, { counts: {} }, warnings, errors);
  }

  var limit = Math.min(200, lastRow - 1);
  var values = sh.getRange(2, 1, limit, lastCol).getValues();
  var rows = values.map(function(r) { return { SLA_STATUS: r[colSla] }; });
  var counts = CbvWebAppWorkspace__countByField_(rows, 'SLA_STATUS');

  return CbvWebAppWorkspace__apiOut_(true, { counts: counts, sampleSize: limit }, warnings, errors);
}

function CbvWebAppWorkspace_getRuntimeHealthSummary() {
  var warnings = [];
  var errors = [];
  var sn = CBV_WEBAPP_WS_SHEETS.SYSTEM_HEALTH_LOG;
  var got = CbvWebAppWorkspace__getSheetSafe_(sn);
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppWorkspace__apiOut_(false, { latest: null }, warnings, errors);
  }
  var sh = got.sheet;
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return CbvWebAppWorkspace__apiOut_(true, { latest: null }, warnings, errors);
  var lastCol = sh.getLastColumn();
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  headers.forEach(function(h, i) { idx[String(h || '').trim()] = i; });
  var colAt = idx.RUN_AT;
  var colHealth = idx.SYSTEM_HEALTH;
  var colSummary = idx.SUMMARY_JSON;
  var row = sh.getRange(lastRow, 1, 1, lastCol).getValues()[0];
  return CbvWebAppWorkspace__apiOut_(true, {
    latest: {
      runAt: colAt !== undefined ? row[colAt] : '',
      systemHealth: colHealth !== undefined ? row[colHealth] : '',
      summaryJson: colSummary !== undefined ? row[colSummary] : ''
    }
  }, warnings, errors);
}

function CbvWebAppWorkspace_validate() {
  var warnings = [];
  var errors = [];
  try {
    var reg = CbvWebAppWorkspace_routeRegistry();
    if (!reg || !reg.length) errors.push('Route registry empty.');
  } catch (e0) {
    errors.push('Route registry error: ' + (e0 && e0.message ? e0.message : String(e0)));
  }
  return CbvWebAppWorkspace__apiOut_(errors.length === 0, { ok: errors.length === 0 }, warnings, errors);
}

