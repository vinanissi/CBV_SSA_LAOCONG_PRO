/**
 * CBV Task System Audit & Repair - Safe audit and column-append for task upgrade.
 * Scope: USER_DIRECTORY, DON_VI, MASTER_CODE, ENUM_DICTIONARY,
 *        TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG.
 * Never destructive. Idempotent. Safe for production.
 *
 * Dependencies: 00_CORE_CONFIG, 90_BOOTSTRAP_SCHEMA, 03_SHARED_REPOSITORY
 */

/** Task system tables in audit scope */
var TASK_SYSTEM_SHEETS = [
  'USER_DIRECTORY', 'DON_VI', 'MASTER_CODE', 'ENUM_DICTIONARY',
  'TASK_MAIN', 'TASK_CHECKLIST', 'TASK_ATTACHMENT', 'TASK_UPDATE_LOG'
];

/** Valid TASK_MAIN.STATUS */
var TASK_VALID_STATUS = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING', 'DONE', 'CANCELLED', 'ARCHIVED'];

/** Valid TASK_MAIN.PRIORITY (PRO + legacy) */
var TASK_VALID_PRIORITY = ['CAO', 'TRUNG_BINH', 'THAP', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

/** Required ENUM_GROUPS for task system */
var TASK_ENUM_GROUPS = ['TASK_STATUS', 'TASK_PRIORITY', 'TASK_TYPE'];

/**
 * Returns sheet by name or null. Does not throw.
 */
function _auditSheet(name) {
  var ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(name) || null;
}

/**
 * Gets headers from sheet. Returns [] if empty.
 */
function _auditHeaders(sheet) {
  if (!sheet || sheet.getLastColumn() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

/**
 * Full self-audit of task system. Schema, refs, enum, status, priority.
 * @returns {{ ok: boolean, findings: Object[], stats: Object, summary: string }}
 */
function selfAuditTaskSystemFull() {
  var findings = [];
  var stats = {
    tables: {}, critical: 0, high: 0, medium: 0, low: 0,
    invalidUserRef: 0, invalidDonViRef: 0, invalidTaskTypeRef: 0,
    invalidStatus: 0, invalidPriority: 0, enumMissing: []
  };
  var ss = SpreadsheetApp.getActive();

  // 1. Table existence & schema
  TASK_SYSTEM_SHEETS.forEach(function(sheetName) {
    var sheet = _auditSheet(sheetName);
    stats.tables[sheetName] = { exists: !!sheet, rows: 0, missingCols: [] };
    if (!sheet) {
      findings.push({ code: 'SHEET_MISSING', table: sheetName, severity: sheetName === 'TASK_MAIN' || sheetName === 'USER_DIRECTORY' ? 'CRITICAL' : 'HIGH', message: sheetName + ' sheet missing' });
      return;
    }
    var expected = typeof getSchemaHeaders === 'function' ? (CBV_SCHEMA_MANIFEST[sheetName] || []) : [];
    var headers = _auditHeaders(sheet);
    var loaded = typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sheet, sheetName) : null;
    stats.tables[sheetName].rows = loaded ? loaded.rowCount : (sheet.getLastRow() < 2 ? 0 : sheet.getLastRow() - 1);
    if (expected.length > 0) {
      expected.forEach(function(h) {
        if (headers.indexOf(h) === -1) stats.tables[sheetName].missingCols.push(h);
      });
      stats.tables[sheetName].missingCols.forEach(function(c) {
        findings.push({ code: 'COL_MISSING', table: sheetName, severity: (sheetName === 'TASK_MAIN' && ['STATUS', 'OWNER_ID', 'DON_VI_ID'].indexOf(c) !== -1) ? 'CRITICAL' : 'MEDIUM', message: sheetName + '.' + c + ' missing' });
      });
    }
  });

  // 2. ENUM consistency
  var enumSheet = _auditSheet(CBV_CONFIG.SHEETS.ENUM_DICTIONARY || 'ENUM_DICTIONARY');
  var enumLoaded = enumSheet && typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(enumSheet, 'ENUM_DICTIONARY') : null;
  if (enumLoaded && enumLoaded.rowCount > 0) {
    var enumHeaders = enumLoaded.headers;
    var groupIdx = enumHeaders.indexOf('ENUM_GROUP');
    var valueIdx = enumHeaders.indexOf('ENUM_VALUE');
    var activeIdx = enumHeaders.indexOf('IS_ACTIVE');
    var enumMap = {};
    enumLoaded.rows.forEach(function(r) {
      var g = String(r.ENUM_GROUP || r[groupIdx] || '').trim();
      var v = String(r.ENUM_VALUE || r[valueIdx] || '').trim();
      var active = activeIdx >= 0 ? (r.IS_ACTIVE === true || r[activeIdx] === true || String(r.IS_ACTIVE || r[activeIdx]) === 'true') : true;
      if (g && v) {
        if (!enumMap[g]) enumMap[g] = [];
        if (active) enumMap[g].push(v);
      }
    });
    TASK_ENUM_GROUPS.forEach(function(g) {
      if (!enumMap[g] || enumMap[g].length === 0) {
        stats.enumMissing.push(g);
        findings.push({ code: 'ENUM_MISSING', table: 'ENUM_DICTIONARY', severity: g === 'TASK_PRIORITY' ? 'HIGH' : 'MEDIUM', message: 'ENUM_GROUP ' + g + ' empty or missing' });
      }
    });
    stats.enumMap = enumMap;
  } else {
    stats.enumMissing = TASK_ENUM_GROUPS.slice();
    findings.push({ code: 'ENUM_SHEET_EMPTY', table: 'ENUM_DICTIONARY', severity: 'HIGH', message: 'ENUM_DICTIONARY missing or empty' });
  }

  // 3. Ref safety & invalid values (TASK_MAIN)
  var taskSheet = _auditSheet(CBV_CONFIG.SHEETS.TASK_MAIN);
  var userSheet = _auditSheet(CBV_CONFIG.SHEETS.USER_DIRECTORY);
  var donViSheet = _auditSheet(getDonViSheetName ? getDonViSheetName() : 'DON_VI');
  var mcSheet = _auditSheet(CBV_CONFIG.SHEETS.MASTER_CODE);

  var userIds = {};
  if (userSheet && userSheet.getLastRow() >= 2) {
    var uh = _auditHeaders(userSheet);
    var uidIdx = uh.indexOf('ID');
    var ustatIdx = uh.indexOf('STATUS');
    var udelIdx = uh.indexOf('IS_DELETED');
    if (uidIdx >= 0) {
      userSheet.getRange(2, 1, userSheet.getLastRow(), uh.length).getValues().forEach(function(r) {
        var id = String(r[uidIdx] || '').trim();
        var st = String(r[ustatIdx] || '').trim();
        var del = r[udelIdx] === true || String(r[udelIdx]) === 'true';
        if (id && st === 'ACTIVE' && !del) userIds[id] = true;
      });
    }
  }

  var donViIds = {};
  var donViName = typeof getDonViSheetName === 'function' ? getDonViSheetName() : 'DON_VI';
  var donViLoaded = donViSheet && typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(donViSheet, donViName) : null;
  if (donViLoaded && donViLoaded.rowCount > 0) {
    var dh = donViLoaded.headers;
    var didIdx = dh.indexOf('ID');
    var dstatIdx = dh.indexOf('STATUS');
    var ddelIdx = dh.indexOf('IS_DELETED');
    if (didIdx >= 0) {
      donViLoaded.rows.forEach(function(r) {
        var id = String(r.ID || r[didIdx] || '').trim();
        var st = String(r.STATUS || r[dstatIdx] || '').trim();
        var del = r.IS_DELETED === true || (ddelIdx >= 0 && (r[ddelIdx] === true || String(r[ddelIdx]) === 'true'));
        if (id && st === 'ACTIVE' && !del) donViIds[id] = true;
      });
    }
  }

  var taskTypeIds = {};
  var mcLoaded = mcSheet && typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(mcSheet, CBV_CONFIG.SHEETS.MASTER_CODE) : null;
  if (mcLoaded && mcLoaded.rowCount > 0) {
    var mh = mcLoaded.headers;
    var midIdx = mh.indexOf('ID');
    var mgIdx = mh.indexOf('MASTER_GROUP');
    var mstatIdx = mh.indexOf('STATUS');
    var mdelIdx = mh.indexOf('IS_DELETED');
    if (midIdx >= 0) {
      mcLoaded.rows.forEach(function(r) {
        var id = String(r.ID || r[midIdx] || '').trim();
        var g = String(r.MASTER_GROUP || r[mgIdx] || '').trim();
        var st = String(r.STATUS || r[mstatIdx] || '').trim();
        var del = r.IS_DELETED === true || (mdelIdx >= 0 && (r[mdelIdx] === true || String(r[mdelIdx]) === 'true'));
        if (id && g === 'TASK_TYPE' && st === 'ACTIVE' && !del) taskTypeIds[id] = true;
      });
    }
  }

  var taskLoaded = taskSheet && typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(taskSheet, CBV_CONFIG.SHEETS.TASK_MAIN) : null;
  if (taskLoaded && taskLoaded.rowCount > 0) {
    var th = taskLoaded.headers;
    var ownerIdx = th.indexOf('OWNER_ID');
    var repIdx = th.indexOf('REPORTER_ID');
    var dvIdx = th.indexOf('DON_VI_ID');
    var ttIdx = th.indexOf('TASK_TYPE_ID');
    var statIdx = th.indexOf('STATUS');
    var prioIdx = th.indexOf('PRIORITY');
    taskLoaded.rows.forEach(function(r) {
      var oid = String(r.OWNER_ID || r[ownerIdx] || '').trim();
      if (oid && !userIds[oid]) stats.invalidUserRef++;
      var rid = String(r.REPORTER_ID || r[repIdx] || '').trim();
      if (rid && !userIds[rid]) stats.invalidUserRef++;
      var dvid = String(r.DON_VI_ID || r[dvIdx] || '').trim();
      if (dvid && !donViIds[dvid]) stats.invalidDonViRef++;
      var ttid = String(r.TASK_TYPE_ID || r[ttIdx] || '').trim();
      if (ttid && !taskTypeIds[ttid]) stats.invalidTaskTypeRef++;
      var st = String(r.STATUS || r[statIdx] || '').trim();
      if (st && TASK_VALID_STATUS.indexOf(st) === -1) stats.invalidStatus++;
      var p = String(r.PRIORITY || r[prioIdx] || '').trim();
      if (p && TASK_VALID_PRIORITY.indexOf(p) === -1) stats.invalidPriority++;
    });
    if (stats.invalidUserRef > 0) findings.push({ code: 'INVALID_USER_REF', table: 'TASK_MAIN', severity: 'HIGH', message: stats.invalidUserRef + ' OWNER_ID/REPORTER_ID not in ACTIVE_USERS' });
    if (stats.invalidDonViRef > 0) findings.push({ code: 'INVALID_DON_VI_REF', table: 'TASK_MAIN', severity: 'MEDIUM', message: stats.invalidDonViRef + ' DON_VI_ID not in ACTIVE_DON_VI' });
    if (stats.invalidTaskTypeRef > 0) findings.push({ code: 'INVALID_TASK_TYPE_REF', table: 'TASK_MAIN', severity: 'MEDIUM', message: stats.invalidTaskTypeRef + ' TASK_TYPE_ID not in ACTIVE_TASK_TYPE' });
    if (stats.invalidStatus > 0) findings.push({ code: 'INVALID_STATUS', table: 'TASK_MAIN', severity: 'MEDIUM', message: stats.invalidStatus + ' rows with STATUS not in ' + TASK_VALID_STATUS.join(',') });
    if (stats.invalidPriority > 0) findings.push({ code: 'INVALID_PRIORITY', table: 'TASK_MAIN', severity: 'LOW', message: stats.invalidPriority + ' rows with PRIORITY not in valid list' });
  }

  // 4. Child table refs (TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG → TASK_MAIN)
  var taskIds = {};
  if (taskLoaded && taskLoaded.rowCount > 0) {
    var tidIdx = taskLoaded.headers.indexOf('ID');
    if (tidIdx >= 0) {
      taskLoaded.rows.forEach(function(r) {
        var id = String(r.ID || r[tidIdx] || '').trim();
        if (id) taskIds[id] = true;
      });
    }
  }
  ['TASK_CHECKLIST', 'TASK_ATTACHMENT', 'TASK_UPDATE_LOG'].forEach(function(sn) {
    var sh = _auditSheet(CBV_CONFIG.SHEETS[sn] || sn);
    if (!sh) return;
    var childLoaded = typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sh, sn) : null;
    if (!childLoaded || childLoaded.rowCount === 0) return;
    var h = childLoaded.headers;
    var tkIdx = h.indexOf('TASK_ID');
    if (tkIdx < 0) return;
    var orphan = 0;
    childLoaded.rows.forEach(function(r) {
      var tkid = String(r.TASK_ID || r[tkIdx] || '').trim();
      if (tkid && !taskIds[tkid]) orphan++;
    });
    if (orphan > 0) findings.push({ code: 'ORPHAN_TASK_REF', table: sn, severity: 'LOW', message: orphan + ' TASK_ID not in TASK_MAIN' });
  });

  // 5. Slice/spec check
  if (!donViSheet || !donViLoaded || donViLoaded.rowCount === 0) {
    findings.push({ code: 'ACTIVE_DON_VI_EMPTY', table: 'DON_VI', severity: 'HIGH', message: 'ACTIVE_DON_VI slice will be empty' });
  }
  if (Object.keys(userIds).length === 0 && userSheet) {
    findings.push({ code: 'ACTIVE_USERS_EMPTY', table: 'USER_DIRECTORY', severity: 'HIGH', message: 'ACTIVE_USERS slice will be empty' });
  }

  // Severity counts
  findings.forEach(function(f) {
    if (f.severity === 'CRITICAL') stats.critical++;
    else if (f.severity === 'HIGH') stats.high++;
    else if (f.severity === 'MEDIUM') stats.medium++;
    else stats.low++;
  });

  var ok = stats.critical === 0;
  var summary = (ok ? 'OK' : 'FAIL') + ': ' + stats.critical + ' critical, ' + stats.high + ' high, ' + stats.medium + ' medium, ' + stats.low + ' low';
  return { ok: ok, findings: findings, stats: stats, summary: summary };
}

/**
 * Safe repair: append missing columns only. Never overwrite data.
 * Called by repairTaskSystemSafely in 95 (which runs ensureDonViSheet first).
 * @param {Object} options - { dryRun: boolean } default dryRun=false
 * @returns {{ appended: string[], dryRun: boolean }}
 */
function repairTaskSystemSafelyFull(options) {
  var dryRun = (options && options.dryRun === true);
  var appended = [];
  var ss = SpreadsheetApp.getActive();

  TASK_SYSTEM_SHEETS.forEach(function(sheetName) {
    var sheet = _auditSheet(sheetName);
    if (!sheet) return;
    var expected = CBV_SCHEMA_MANIFEST[sheetName];
    if (!expected || expected.length === 0) return;
    var headers = _auditHeaders(sheet);
    expected.forEach(function(col) {
      if (headers.indexOf(col) === -1) {
        appended.push(sheetName + '.' + col);
        if (!dryRun) {
          var lastCol = sheet.getLastColumn();
          sheet.getRange(1, lastCol + 1).setValue(col);
        }
      }
    });
  });

  // DON_VI may not be in CBV_SCHEMA_MANIFEST in older configs
  var donViName = typeof getDonViSheetName === 'function' ? getDonViSheetName() : 'DON_VI';
  var donViSheet = _auditSheet(donViName);
  if (donViSheet && typeof DON_VI_HEADERS !== 'undefined') {
    var dh = _auditHeaders(donViSheet);
    DON_VI_HEADERS.forEach(function(col) {
      if (dh.indexOf(col) === -1) {
        appended.push(donViName + '.' + col);
        if (!dryRun) {
          var lastCol = donViSheet.getLastColumn();
          donViSheet.getRange(1, lastCol + 1).setValue(col);
        }
      }
    });
  }

  return { appended: appended, dryRun: dryRun };
}
