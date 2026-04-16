/**
 * CBV System Test Runner - Copy-paste ready GAS.
 * Idempotent, read-only, no destructive writes.
 * Dependencies: CBV_CONFIG (00_CORE_CONFIG) - falls back to sheet names if absent.
 */

// ========== ASSERTION HELPERS ==========

/** @returns {{ ok: boolean, message: string }} */
function assertEquals(expected, actual, message) {
  var ok = expected === actual;
  return { ok: ok, message: message || (ok ? 'OK' : 'Expected ' + expected + ', got ' + actual) };
}

/** @returns {{ ok: boolean, message: string }} */
function assertTrue(condition, message) {
  return { ok: condition === true, message: message || (condition ? 'OK' : 'Expected true') };
}

/** @returns {{ ok: boolean, message: string }} */
function assertNotEmpty(value, message) {
  var empty = value === null || value === undefined || String(value).trim() === '';
  return { ok: !empty, message: message || (empty ? 'Value is empty' : 'OK') };
}

/** @returns {{ ok: boolean, message: string, rowId: string, field: string }} */
function assertRefExists(refValue, idSet, refName, rowId) {
  if (!refValue || String(refValue).trim() === '') {
    return { ok: true, message: 'OK', rowId: rowId || '', field: refName || '' };
  }
  var ok = idSet && idSet[String(refValue).trim()] === true;
  return { ok: ok, message: ok ? 'OK' : 'Ref ' + refName + '=' + refValue + ' not found', rowId: rowId || '', field: refName || '' };
}

// ========== CONFIG ==========

var TEST_REQUIRED_SHEETS = [
  'USER_DIRECTORY', 'DON_VI', 'MASTER_CODE', 'ENUM_DICTIONARY',
  'TASK_MAIN', 'TASK_CHECKLIST', 'TASK_ATTACHMENT', 'TASK_UPDATE_LOG', 'ADMIN_AUDIT_LOG'
];

var TEST_REQUIRED_COLS = {
  USER_DIRECTORY: ['ID', 'EMAIL', 'DISPLAY_NAME', 'ROLE', 'STATUS', 'IS_DELETED'],
  DON_VI: ['ID', 'DON_VI_TYPE', 'CODE', 'NAME', 'PARENT_ID', 'STATUS', 'MANAGER_USER_ID', 'IS_DELETED'],
  MASTER_CODE: ['ID', 'MASTER_GROUP', 'CODE', 'NAME', 'STATUS', 'IS_DELETED'],
  ENUM_DICTIONARY: ['ID', 'ENUM_GROUP', 'ENUM_VALUE', 'DISPLAY_TEXT', 'IS_ACTIVE'],
  TASK_MAIN: ['ID', 'TITLE', 'STATUS', 'PRIORITY', 'OWNER_ID', 'DON_VI_ID', 'TASK_TYPE_ID', 'IS_DELETED', 'DONE_AT'],
  TASK_CHECKLIST: ['ID', 'TASK_ID', 'TITLE', 'IS_REQUIRED', 'IS_DONE', 'DONE_BY'],
  TASK_UPDATE_LOG: ['ID', 'TASK_ID', 'UPDATE_TYPE', 'ACTOR_ID', 'IS_DELETED'],
  TASK_ATTACHMENT: ['ID', 'TASK_ID', 'IS_DELETED'],
  ADMIN_AUDIT_LOG: ['ID', 'AUDIT_TYPE', 'ENTITY_TYPE', 'ACTION', 'ACTOR_ID', 'CREATED_AT']
};

var TEST_VALID_STATUS = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING', 'DONE', 'CANCELLED', 'ARCHIVED'];

// ========== HELPERS ==========

function _getSheet(name) {
  var ss = SpreadsheetApp.getActive();
  var sheetName = name;
  if (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS[name]) {
    sheetName = CBV_CONFIG.SHEETS[name];
  }
  return ss.getSheetByName(sheetName) || null;
}

function _getHeaders(sheet) {
  if (!sheet || sheet.getLastColumn() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

// ========== TESTS ==========

function testSchemaIntegrity() {
  var findings = [];
  var stats = { missingSheets: [], missingCols: {} };
  TEST_REQUIRED_SHEETS.forEach(function(name) {
    var sheet = _getSheet(name);
    if (!sheet) {
      stats.missingSheets.push(name);
      findings.push({ code: 'SHEET_MISSING', table: name, severity: 'HIGH', message: name + ' sheet missing' });
      return;
    }
    var headers = _getHeaders(sheet);
    var required = TEST_REQUIRED_COLS[name];
    if (required) {
      var missing = [];
      required.forEach(function(col) {
        if (headers.indexOf(col) === -1) missing.push(col);
      });
      if (missing.length > 0) {
        stats.missingCols[name] = missing;
        missing.forEach(function(c) {
          findings.push({ code: 'COL_MISSING', table: name, severity: 'MEDIUM', message: name + '.' + c + ' missing', field: c });
        });
      }
    }
  });
  return { ok: findings.length === 0, category: 'SCHEMA', findings: findings, stats: stats };
}

function testSeedConsistency() {
  var findings = [];
  var stats = { duplicateIds: {}, blankRequired: 0 };
  ['USER_DIRECTORY', 'DON_VI', 'MASTER_CODE', 'TASK_MAIN'].forEach(function(tableName) {
    var sheet = _getSheet(tableName);
    if (!sheet || sheet.getLastRow() < 2) return;
    var headers = _getHeaders(sheet);
    var data = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
    var idIdx = headers.indexOf('ID');
    var ids = {};
    var emailIdx = tableName === 'USER_DIRECTORY' ? headers.indexOf('EMAIL') : -1;
    var emails = {};
    data.forEach(function(row, i) {
      var rowNum = i + 2;
      var id = String(row[idIdx] || '').trim();
      if (!id) {
        findings.push({ code: 'BLANK_ID', table: tableName, severity: 'HIGH', message: 'Blank ID row ' + rowNum, rowId: '', field: 'ID' });
        stats.blankRequired++;
      } else if (ids[id]) {
        findings.push({ code: 'DUP_ID', table: tableName, severity: 'HIGH', message: 'Duplicate ID: ' + id, rowId: id, field: 'ID' });
        if (!stats.duplicateIds[tableName]) stats.duplicateIds[tableName] = [];
        stats.duplicateIds[tableName].push(id);
      } else ids[id] = true;
      if (emailIdx >= 0) {
        var email = String(row[emailIdx] || '').trim();
        if (!email) findings.push({ code: 'BLANK_EMAIL', table: tableName, severity: 'HIGH', message: 'Blank EMAIL row ' + rowNum, rowId: id, field: 'EMAIL' });
        else if (emails[email]) findings.push({ code: 'DUP_EMAIL', table: tableName, severity: 'MEDIUM', message: 'Duplicate EMAIL: ' + email, rowId: id, field: 'EMAIL' });
        else emails[email] = true;
      }
    });
  });
  return { ok: findings.length === 0, category: 'SEED', findings: findings, stats: stats };
}

function testEnumConsistency() {
  var findings = [];
  var enumSheet = _getSheet('ENUM_DICTIONARY');
  var stats = { groups: {}, missingGroups: [] };
  var requiredGroups = ['TASK_STATUS', 'TASK_PRIORITY', 'PRIORITY', 'DON_VI_TYPE', 'USER_ROLE', 'ROLE'];
  if (!enumSheet || enumSheet.getLastRow() < 2) {
    findings.push({ code: 'ENUM_EMPTY', table: 'ENUM_DICTIONARY', severity: 'HIGH', message: 'ENUM_DICTIONARY missing or empty' });
    return { ok: false, category: 'ENUM', findings: findings, stats: stats };
  }
  var headers = _getHeaders(enumSheet);
  var gi = headers.indexOf('ENUM_GROUP');
  var vi = headers.indexOf('ENUM_VALUE');
  var ai = headers.indexOf('IS_ACTIVE');
  var di = headers.indexOf('IS_DEFAULT');
  if (gi < 0 || vi < 0) {
    findings.push({ code: 'ENUM_COLS', table: 'ENUM_DICTIONARY', severity: 'HIGH', message: 'Missing ENUM_GROUP or ENUM_VALUE' });
    return { ok: false, category: 'ENUM', findings: findings, stats: stats };
  }
  var groupValues = {};
  var groupDefaults = {};
  var data = enumSheet.getRange(2, 1, enumSheet.getLastRow(), headers.length).getValues();
  data.forEach(function(row) {
    var g = String(row[gi] || '').trim();
    var v = String(row[vi] || '').trim();
    var active = ai < 0 ? true : (row[ai] === true || String(row[ai]) === 'true');
    var def = di >= 0 && (row[di] === true || String(row[di]) === 'true');
    if (!g || !v) return;
    if (!groupValues[g]) groupValues[g] = [];
    if (active) groupValues[g].push(v);
    if (def) {
      if (groupDefaults[g]) findings.push({ code: 'MULTI_DEFAULT', table: 'ENUM_DICTIONARY', severity: 'MEDIUM', message: 'ENUM_GROUP ' + g + ' has >1 default', field: g });
      groupDefaults[g] = (groupDefaults[g] || 0) + 1;
    }
  });
  requiredGroups.forEach(function(g) {
    var v = groupValues[g] || groupValues[g === 'ROLE' ? 'USER_ROLE' : g] || [];
    if (v.length === 0 && groupValues[g] === undefined) {
      var alias = (g === 'PRIORITY' ? 'TASK_PRIORITY' : g) || g;
      if (!groupValues[alias] || groupValues[alias].length === 0) {
        findings.push({ code: 'ENUM_MISSING_GROUP', table: 'ENUM_DICTIONARY', severity: 'MEDIUM', message: 'ENUM_GROUP ' + g + ' empty or missing', field: g });
        stats.missingGroups.push(g);
      }
    }
  });
  var userSheet = _getSheet('USER_DIRECTORY');
  if (userSheet && userSheet.getLastRow() >= 2) {
    var uh = _getHeaders(userSheet);
    var roleIdx = uh.indexOf('ROLE');
    var uidIdx = uh.indexOf('ID');
    if (roleIdx >= 0) {
      var roleAllowed = groupValues.USER_ROLE || groupValues.ROLE || [];
      userSheet.getRange(2, 1, userSheet.getLastRow(), uh.length).getValues().forEach(function(r) {
        var role = String(r[roleIdx] || '').trim();
        var id = String(r[uidIdx] || '').trim();
        if (role && roleAllowed.indexOf(role) === -1) findings.push({ code: 'INVALID_ENUM', table: 'USER_DIRECTORY', severity: 'HIGH', message: 'ROLE=' + role + ' invalid', rowId: id, field: 'ROLE' });
      });
    }
  }
  var dvSheet = _getSheet('DON_VI');
  if (dvSheet && dvSheet.getLastRow() >= 2) {
    var dh = _getHeaders(dvSheet);
    var dti = dh.indexOf('DON_VI_TYPE');
    var didIdx = dh.indexOf('ID');
    if (dti >= 0) {
      var dtAllowed = groupValues.DON_VI_TYPE || [];
      dvSheet.getRange(2, 1, dvSheet.getLastRow(), dh.length).getValues().forEach(function(r) {
        var dt = String(r[dti] || '').trim();
        var id = String(r[didIdx] || '').trim();
        if (dt && dtAllowed.indexOf(dt) === -1) findings.push({ code: 'INVALID_ENUM', table: 'DON_VI', severity: 'HIGH', message: 'DON_VI_TYPE=' + dt + ' invalid', rowId: id, field: 'DON_VI_TYPE' });
      });
    }
  }
  var taskSheet = _getSheet('TASK_MAIN');
  if (taskSheet && taskSheet.getLastRow() >= 2) {
    var th = _getHeaders(taskSheet);
    var si = th.indexOf('STATUS');
    var pi = th.indexOf('PRIORITY');
    var tidIdx = th.indexOf('ID');
    var doneIdx = th.indexOf('DONE_AT');
    var prioAllowed = groupValues.TASK_PRIORITY || groupValues.PRIORITY || ['CAO', 'TRUNG_BINH', 'THAP'];
    taskSheet.getRange(2, 1, taskSheet.getLastRow(), th.length).getValues().forEach(function(r) {
      var id = String(r[tidIdx] || '').trim();
      var st = String(r[si] || '').trim();
      var p = String(r[pi] || '').trim();
      var done = r[doneIdx];
      if (st && TEST_VALID_STATUS.indexOf(st) === -1) findings.push({ code: 'INVALID_ENUM', table: 'TASK_MAIN', severity: 'HIGH', message: 'STATUS=' + st + ' invalid', rowId: id, field: 'STATUS' });
      if (p && prioAllowed.indexOf(p) === -1 && ['CAO', 'TRUNG_BINH', 'THAP', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].indexOf(p) === -1) findings.push({ code: 'INVALID_ENUM', table: 'TASK_MAIN', severity: 'MEDIUM', message: 'PRIORITY=' + p + ' invalid', rowId: id, field: 'PRIORITY' });
      if (st === 'DONE' && (!done || String(done).trim() === '')) findings.push({ code: 'DONE_NO_TS', table: 'TASK_MAIN', severity: 'MEDIUM', message: 'DONE without DONE_AT', rowId: id, field: 'DONE_AT' });
    });
  }
  stats.groups = groupValues;
  return { ok: findings.length === 0, category: 'ENUM', findings: findings, stats: stats };
}

function testRefIntegrity() {
  var findings = [];
  var userIds = {};
  var donViIds = {};
  var taskTypeIds = {};
  var userSheet = _getSheet('USER_DIRECTORY');
  if (userSheet && userSheet.getLastRow() >= 2) {
    var uh = _getHeaders(userSheet);
    var uidIdx = uh.indexOf('ID');
    var ustatIdx = uh.indexOf('STATUS');
    var udelIdx = uh.indexOf('IS_DELETED');
    userSheet.getRange(2, 1, userSheet.getLastRow(), uh.length).getValues().forEach(function(r) {
      var id = String(r[uidIdx] || '').trim();
      var st = String(r[ustatIdx] || '').trim();
      var del = udelIdx >= 0 && (r[udelIdx] === true || String(r[udelIdx]) === 'true');
      if (id && st === 'ACTIVE' && !del) userIds[id] = true;
    });
  }
  var dvSheet = _getSheet('DON_VI');
  if (dvSheet && dvSheet.getLastRow() >= 2) {
    var dh = _getHeaders(dvSheet);
    var didIdx = dh.indexOf('ID');
    dvSheet.getRange(2, 1, dvSheet.getLastRow(), dh.length).getValues().forEach(function(r) {
      var id = String(r[didIdx] || '').trim();
      if (id) donViIds[id] = true;
    });
  }
  var mcSheet = _getSheet('MASTER_CODE');
  if (mcSheet && mcSheet.getLastRow() >= 2) {
    var mh = _getHeaders(mcSheet);
    var midIdx = mh.indexOf('ID');
    var mgIdx = mh.indexOf('MASTER_GROUP');
    var mstatIdx = mh.indexOf('STATUS');
    mcSheet.getRange(2, 1, mcSheet.getLastRow(), mh.length).getValues().forEach(function(r) {
      var id = String(r[midIdx] || '').trim();
      var g = String(r[mgIdx] || '').trim();
      var st = String(r[mstatIdx] || '').trim();
      if (id && g === 'TASK_TYPE' && st === 'ACTIVE') taskTypeIds[id] = true;
    });
  }
  if (userSheet && userSheet.getLastRow() >= 2) {
    var uh2 = _getHeaders(userSheet);
    var dvidIdx = uh2.indexOf('DON_VI_ID');
    var uidIdx2 = uh2.indexOf('ID');
    if (dvidIdx >= 0) {
      userSheet.getRange(2, 1, userSheet.getLastRow(), uh2.length).getValues().forEach(function(r) {
        var dvid = String(r[dvidIdx] || '').trim();
        var id = String(r[uidIdx2] || '').trim();
        if (dvid && !donViIds[dvid]) findings.push({ code: 'BAD_REF', table: 'USER_DIRECTORY', severity: 'MEDIUM', message: 'DON_VI_ID not found: ' + dvid, rowId: id, field: 'DON_VI_ID' });
      });
    }
  }
  if (dvSheet && dvSheet.getLastRow() >= 2) {
    var dh2 = _getHeaders(dvSheet);
    var muIdx = dh2.indexOf('MANAGER_USER_ID');
    var pidIdx = dh2.indexOf('PARENT_ID');
    var didIdx2 = dh2.indexOf('ID');
    dvSheet.getRange(2, 1, dvSheet.getLastRow(), dh2.length).getValues().forEach(function(r) {
      var id = String(r[didIdx2] || '').trim();
      var mu = String(r[muIdx] || '').trim();
      var pid = String(r[pidIdx] || '').trim();
      if (mu && !userIds[mu]) findings.push({ code: 'BAD_REF', table: 'DON_VI', severity: 'HIGH', message: 'MANAGER_USER_ID not found: ' + mu, rowId: id, field: 'MANAGER_USER_ID' });
      if (pid && !donViIds[pid]) findings.push({ code: 'BAD_REF', table: 'DON_VI', severity: 'HIGH', message: 'PARENT_ID not found: ' + pid, rowId: id, field: 'PARENT_ID' });
    });
  }
  var taskSheet = _getSheet('TASK_MAIN');
  if (taskSheet && taskSheet.getLastRow() >= 2) {
    var th2 = _getHeaders(taskSheet);
    var oidx = th2.indexOf('OWNER_ID');
    var ridx = th2.indexOf('REPORTER_ID');
    var dvidx = th2.indexOf('DON_VI_ID');
    var ttidx = th2.indexOf('TASK_TYPE_ID');
    var tididx2 = th2.indexOf('ID');
    taskSheet.getRange(2, 1, taskSheet.getLastRow(), th2.length).getValues().forEach(function(r) {
      var id = String(r[tididx2] || '').trim();
      var oid = String(r[oidx] || '').trim();
      var rid = String(r[ridx] || '').trim();
      var dvid = String(r[dvidx] || '').trim();
      var ttid = String(r[ttidx] || '').trim();
      if (oid && !userIds[oid]) findings.push({ code: 'BAD_REF', table: 'TASK_MAIN', severity: 'HIGH', message: 'OWNER_ID not found: ' + oid, rowId: id, field: 'OWNER_ID' });
      if (rid && !userIds[rid]) findings.push({ code: 'BAD_REF', table: 'TASK_MAIN', severity: 'MEDIUM', message: 'REPORTER_ID not found: ' + rid, rowId: id, field: 'REPORTER_ID' });
      if (dvid && !donViIds[dvid]) findings.push({ code: 'BAD_REF', table: 'TASK_MAIN', severity: 'MEDIUM', message: 'DON_VI_ID not found: ' + dvid, rowId: id, field: 'DON_VI_ID' });
      if (ttid && !taskTypeIds[ttid]) findings.push({ code: 'BAD_REF', table: 'TASK_MAIN', severity: 'HIGH', message: 'TASK_TYPE_ID not found: ' + ttid, rowId: id, field: 'TASK_TYPE_ID' });
    });
  }
  return { ok: findings.length === 0, category: 'REF', findings: findings, stats: {} };
}

function testDonViHierarchy() {
  var findings = [];
  var dvSheet = _getSheet('DON_VI');
  if (!dvSheet || dvSheet.getLastRow() < 2) return { ok: true, category: 'HIERARCHY', findings: [], stats: { roots: 0 } };
  var headers = _getHeaders(dvSheet);
  var idIdx = headers.indexOf('ID');
  var pidIdx = headers.indexOf('PARENT_ID');
  var nodes = {};
  dvSheet.getRange(2, 1, dvSheet.getLastRow(), headers.length).getValues().forEach(function(r) {
    var id = String(r[idIdx] || '').trim();
    var pid = String(r[pidIdx] || '').trim();
    if (id) nodes[id] = { id: id, parentId: pid || null };
  });
  var roots = 0;
  Object.keys(nodes).forEach(function(id) {
    var n = nodes[id];
    if (n.parentId === id) findings.push({ code: 'SELF_PARENT', table: 'DON_VI', severity: 'HIGH', message: 'Self-reference: ' + id, rowId: id, field: 'PARENT_ID' });
    else if (!n.parentId || n.parentId === '') roots++;
    else if (!nodes[n.parentId]) findings.push({ code: 'ORPHAN_PARENT', table: 'DON_VI', severity: 'HIGH', message: 'PARENT_ID not in DON_VI: ' + n.parentId, rowId: id, field: 'PARENT_ID' });
  });
  Object.keys(nodes).forEach(function(id) {
    var seen = {};
    var cur = id;
    var count = 0;
    while (cur && nodes[cur] && nodes[cur].parentId) {
      if (seen[cur]) { findings.push({ code: 'CIRCULAR', table: 'DON_VI', severity: 'HIGH', message: 'Circular ref involving: ' + id, rowId: id, field: 'PARENT_ID' }); break; }
      seen[cur] = true;
      cur = nodes[cur].parentId;
      if (++count > 100) break;
    }
  });
  if (roots === 0) findings.push({ code: 'NO_ROOT', table: 'DON_VI', severity: 'HIGH', message: 'No root node (PARENT_ID empty)' });
  return { ok: findings.length === 0, category: 'HIERARCHY', findings: findings, stats: { roots: roots, nodes: Object.keys(nodes).length } };
}

function testTaskWorkflowRules() {
  var findings = [];
  var taskSheet = _getSheet('TASK_MAIN');
  if (!taskSheet || taskSheet.getLastRow() < 2) return { ok: true, category: 'WORKFLOW', findings: [], stats: {} };
  var headers = _getHeaders(taskSheet);
  var si = headers.indexOf('STATUS');
  var di = headers.indexOf('DONE_AT');
  var tidIdx = headers.indexOf('ID');
  taskSheet.getRange(2, 1, taskSheet.getLastRow(), headers.length).getValues().forEach(function(r) {
    var id = String(r[tidIdx] || '').trim();
    var st = String(r[si] || '').trim();
    var done = r[di];
    if (st === 'DONE' && (!done || String(done).trim() === '')) findings.push({ code: 'DONE_NO_TS', table: 'TASK_MAIN', severity: 'MEDIUM', message: 'DONE without DONE_AT', rowId: id, field: 'DONE_AT' });
    if (st && TEST_VALID_STATUS.indexOf(st) === -1) findings.push({ code: 'INVALID_STATUS', table: 'TASK_MAIN', severity: 'HIGH', message: 'STATUS=' + st + ' not valid', rowId: id, field: 'STATUS' });
  });
  return { ok: findings.length === 0, category: 'WORKFLOW', findings: findings, stats: {} };
}

function testFieldPolicyReadiness() {
  var findings = [];
  [{ table: 'TASK_MAIN', field: 'STATUS', policy: 'NOT form-editable', severity: 'HIGH' },
   { table: 'TASK_MAIN', field: 'DONE_AT', policy: 'NOT form-editable', severity: 'HIGH' },
   { table: 'TASK_MAIN', field: 'IS_DELETED', policy: 'NOT form-editable', severity: 'HIGH' }].forEach(function(p) {
    findings.push({ code: 'POLICY_AUDIT', table: p.table, severity: p.severity, message: p.field + ': ' + p.policy, field: p.field });
  });
  return { ok: true, category: 'FIELD_POLICY', findings: findings, stats: { policyChecks: 3 } };
}

function testAppSheetReadiness() {
  var findings = [];
  var userSheet = _getSheet('USER_DIRECTORY');
  var dvSheet = _getSheet('DON_VI');
  var mcSheet = _getSheet('MASTER_CODE');
  if (!userSheet || userSheet.getLastRow() < 2) findings.push({ code: 'SLICE_SOURCE', table: 'USER_DIRECTORY', severity: 'HIGH', message: 'ACTIVE_USERS requires USER_DIRECTORY data' });
  if (!dvSheet || dvSheet.getLastRow() < 2) findings.push({ code: 'SLICE_SOURCE', table: 'DON_VI', severity: 'HIGH', message: 'ACTIVE_DON_VI requires DON_VI data' });
  if (mcSheet && mcSheet.getLastRow() >= 2) {
    var mh = _getHeaders(mcSheet);
    var mgIdx = mh.indexOf('MASTER_GROUP');
    var hasTaskType = false;
    mcSheet.getRange(2, 1, mcSheet.getLastRow(), mh.length).getValues().forEach(function(r) {
      if (String(r[mgIdx] || '') === 'TASK_TYPE') hasTaskType = true;
    });
    if (!hasTaskType) findings.push({ code: 'SLICE_SOURCE', table: 'MASTER_CODE', severity: 'HIGH', message: 'ACTIVE_TASK_TYPE requires MASTER_GROUP=TASK_TYPE' });
  }
  return { ok: findings.length === 0, category: 'APPSHEET', findings: findings, stats: {} };
}

function testMigrationSafety() {
  var findings = [];
  if (typeof CBV_SCHEMA_MANIFEST !== 'undefined') {
    if (CBV_SCHEMA_MANIFEST.TASK_MAIN && CBV_SCHEMA_MANIFEST.TASK_MAIN.indexOf('DON_VI_ID') === -1) {
      findings.push({ code: 'MIGRATION', table: 'TASK_MAIN', severity: 'MEDIUM', message: 'DON_VI_ID may need schema append' });
    }
  }
  return { ok: findings.length === 0, category: 'MIGRATION', findings: findings, stats: {} };
}

function buildRegressionSummary(results) {
  if (!results || !results.length) return { verdict: 'UNKNOWN', high: 0, medium: 0, low: 0, total: 0, summary: 'No results' };
  var high = 0, medium = 0, low = 0;
  results.forEach(function(r) {
    (r.findings || []).forEach(function(f) {
      if (f.severity === 'HIGH') high++;
      else if (f.severity === 'MEDIUM') medium++;
      else low++;
    });
  });
  var verdict = high > 0 ? 'FAIL' : (medium > 0 ? 'WARNING' : 'PASS');
  return { verdict: verdict, high: high, medium: medium, low: low, total: high + medium + low, summary: verdict + ' — HIGH:' + high + ' MEDIUM:' + medium + ' LOW:' + low };
}

function runAllSystemTests() {
  var results = [];
  var tests = [testSchemaIntegrity, testSeedConsistency, testEnumConsistency, testRefIntegrity, testDonViHierarchy, testTaskWorkflowRules, testFieldPolicyReadiness, testAppSheetReadiness, testMigrationSafety];
  tests.forEach(function(fn) {
    try { results.push(fn()); } catch (e) {
      results.push({ ok: false, category: fn.name || 'unknown', findings: [{ code: 'EXCEPTION', severity: 'HIGH', message: e.message || String(e) }], stats: {} });
    }
  });
  var summary = buildRegressionSummary(results);
  var mustFix = [];
  results.forEach(function(r) {
    (r.findings || []).forEach(function(f) {
      if (f.severity === 'HIGH') mustFix.push((f.table || '') + '.' + (f.field || '') + ': ' + (f.message || ''));
    });
  });
  return { ok: summary.verdict === 'PASS', verdict: summary.verdict, results: results, summary: summary, mustFixBeforeDeploy: mustFix };
}
