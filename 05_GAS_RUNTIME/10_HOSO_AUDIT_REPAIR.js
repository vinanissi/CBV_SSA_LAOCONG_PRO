/**
 * HO_SO Audit & Repair — uses loadSheetDataSafe where applicable.
 */

function _hosoLoaded(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS[name] || name);
  if (!sh) return null;
  return typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sh, name) : null;
}

function auditHosoSchema() {
  var findings = [];
  hosoGetTableNames().forEach(function(tn) {
    var exp = getSchemaHeaders(tn);
    var sh = SpreadsheetApp.getActive().getSheetByName(tn);
    if (!sh) {
      findings.push({ severity: 'HIGH', code: 'MISSING_SHEET', table: tn, message: 'Sheet missing' });
      return;
    }
    var cur = sh.getLastColumn() > 0 ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
    exp.forEach(function(h, i) {
      if (String(cur[i] || '').trim() !== String(h || '').trim()) {
        findings.push({ severity: 'HIGH', code: 'HEADER_MISMATCH', table: tn, message: 'Col ' + (i + 1) + ' expected ' + h + ' got ' + (cur[i] || '') });
      }
    });
  });
  return { ok: findings.length === 0, findings: findings };
}

function auditHosoRefs() {
  var findings = [];
  var specs = [
    { child: 'HO_SO_MASTER', col: 'HO_SO_TYPE_ID', parent: 'MASTER_CODE' },
    { child: 'HO_SO_MASTER', col: 'DON_VI_ID', parent: 'DON_VI' },
    { child: 'HO_SO_MASTER', col: 'OWNER_ID', parent: 'USER_DIRECTORY' },
    { child: 'HO_SO_MASTER', col: 'MANAGER_USER_ID', parent: 'USER_DIRECTORY' },
    { child: 'HO_SO_FILE', col: 'HO_SO_ID', parent: 'HO_SO_MASTER' },
    { child: 'HO_SO_RELATION', col: 'FROM_HO_SO_ID', parent: 'HO_SO_MASTER' },
    { child: 'HO_SO_RELATION', col: 'TO_HO_SO_ID', parent: 'HO_SO_MASTER' },
    { child: 'HO_SO_UPDATE_LOG', col: 'HO_SO_ID', parent: 'HO_SO_MASTER' },
    { child: 'HO_SO_UPDATE_LOG', col: 'ACTOR_ID', parent: 'USER_DIRECTORY' }
  ];
  specs.forEach(function(sp) {
    var childName = CBV_CONFIG.SHEETS[sp.child] || sp.child;
    var parentName = CBV_CONFIG.SHEETS[sp.parent] || sp.parent;
    var loaded = _hosoLoaded(sp.child);
    if (!loaded || loaded.rowCount === 0) return;
    var parentLoaded = _hosoLoaded(sp.parent);
    var ids = {};
    if (parentLoaded && parentLoaded.rows.length) {
      parentLoaded.rows.forEach(function(r) { ids[String(r.ID || '').trim()] = true; });
    }
    loaded.rows.forEach(function(r) {
      var v = String(r[sp.col] || '').trim();
      if (!v) return;
      if (!ids[v]) findings.push({ severity: 'MEDIUM', code: 'ORPHAN_REF', table: sp.child, column: sp.col, row: r._rowNumber, message: v + ' not in ' + sp.parent });
    });
  });
  return { ok: findings.length === 0, findings: findings };
}

function auditHosoEnums() {
  var findings = [];
  var checks = [
    { table: 'HO_SO_MASTER', col: 'STATUS', group: 'HO_SO_STATUS' },
    { table: 'HO_SO_MASTER', col: 'PRIORITY', group: 'PRIORITY' },
    { table: 'HO_SO_MASTER', col: 'RELATED_ENTITY_TYPE', group: 'RELATED_ENTITY_TYPE' },
    { table: 'HO_SO_MASTER', col: 'ID_TYPE', group: 'ID_TYPE' },
    { table: 'HO_SO_MASTER', col: 'SOURCE_CHANNEL', group: 'SOURCE_CHANNEL' },
    { table: 'HO_SO_FILE', col: 'FILE_GROUP', group: 'FILE_GROUP' },
    { table: 'HO_SO_UPDATE_LOG', col: 'ACTION_TYPE', group: 'HO_SO_ACTION_TYPE' }
  ];
  checks.forEach(function(c) {
    var loaded = _hosoLoaded(c.table);
    if (!loaded || loaded.rowCount === 0) return;
    loaded.rows.forEach(function(r) {
      var v = String(r[c.col] || '').trim();
      if (!v) return;
      try {
        if (typeof assertValidEnumValue === 'function') assertValidEnumValue(c.group, v, c.col);
      } catch (e) {
        findings.push({ severity: 'MEDIUM', code: 'BAD_ENUM', table: c.table, column: c.col, row: r._rowNumber, message: String(e.message || e) });
      }
    });
  });
  return { ok: findings.length === 0, findings: findings };
}

function auditHosoDataQuality() {
  var findings = [];
  var loaded = _hosoLoaded('HO_SO_MASTER');
  var masterIds = {};
  if (loaded && loaded.rowCount > 0) {
    var codes = {};
    loaded.rows.forEach(function(r) {
      var id = String(r.ID || '').trim();
      var code = String(r.HO_SO_CODE || '').trim();
      if (id) masterIds[id] = true;
      if (!id) findings.push({ severity: 'HIGH', code: 'BLANK_ID', row: r._rowNumber, message: 'HO_SO_MASTER blank ID' });
      if (code) {
        if (codes[code]) findings.push({ severity: 'HIGH', code: 'DUP_CODE', message: 'Duplicate HO_SO_CODE ' + code });
        codes[code] = true;
      }
      var s = hosoParseDate(r.START_DATE);
      var e = hosoParseDate(r.END_DATE);
      if (s && e && e < s) findings.push({ severity: 'MEDIUM', code: 'DATE_RANGE', row: r._rowNumber, message: 'END_DATE < START_DATE' });
      var del = r.IS_DELETED === true || String(r.IS_DELETED).toLowerCase() === 'true';
      var st = String(r.STATUS || '').trim();
      if (del && st === 'ACTIVE') findings.push({ severity: 'LOW', code: 'SOFT_DEL_ACTIVE', row: r._rowNumber, message: 'IS_DELETED but STATUS ACTIVE' });
    });
  }

  (function() {
    var ch = _hosoLoaded('HO_SO_FILE');
    if (ch && ch.rowCount) {
      ch.rows.forEach(function(r) {
        var hid = String(r.HO_SO_ID || '').trim();
        if (!hid) {
          findings.push({ severity: 'MEDIUM', code: 'ORPHAN_CHILD', table: 'HO_SO_FILE', row: r._rowNumber, message: 'Missing HO_SO_ID' });
          return;
        }
        if (!masterIds[hid]) findings.push({ severity: 'MEDIUM', code: 'ORPHAN_CHILD', table: 'HO_SO_FILE', row: r._rowNumber, message: 'HO_SO_ID not in HO_SO_MASTER: ' + hid });
      });
    }
    ch = _hosoLoaded('HO_SO_RELATION');
    if (ch && ch.rowCount) {
      ch.rows.forEach(function(r) {
        var f = String(r.FROM_HO_SO_ID || '').trim();
        var t = String(r.TO_HO_SO_ID || '').trim();
        if (!f && !t) {
          findings.push({ severity: 'MEDIUM', code: 'ORPHAN_CHILD', table: 'HO_SO_RELATION', row: r._rowNumber, message: 'Missing FROM_HO_SO_ID and TO_HO_SO_ID' });
          return;
        }
        if (f && !masterIds[f]) findings.push({ severity: 'MEDIUM', code: 'ORPHAN_CHILD', table: 'HO_SO_RELATION', row: r._rowNumber, message: 'FROM_HO_SO_ID not in HO_SO_MASTER: ' + f });
        if (t && !masterIds[t]) findings.push({ severity: 'MEDIUM', code: 'ORPHAN_CHILD', table: 'HO_SO_RELATION', row: r._rowNumber, message: 'TO_HO_SO_ID not in HO_SO_MASTER: ' + t });
      });
    }
    ch = _hosoLoaded('HO_SO_UPDATE_LOG');
    if (ch && ch.rowCount) {
      ch.rows.forEach(function(r) {
        var hid = String(r.HO_SO_ID || '').trim();
        if (!hid) {
          findings.push({ severity: 'MEDIUM', code: 'ORPHAN_CHILD', table: 'HO_SO_UPDATE_LOG', row: r._rowNumber, message: 'Missing HO_SO_ID' });
          return;
        }
        if (!masterIds[hid]) findings.push({ severity: 'MEDIUM', code: 'ORPHAN_CHILD', table: 'HO_SO_UPDATE_LOG', row: r._rowNumber, message: 'HO_SO_ID not in HO_SO_MASTER: ' + hid });
      });
    }
  })();

  return { ok: findings.length === 0, findings: findings };
}

function repairHosoMissingStatus() {
  var n = 0;
  var loaded = _hosoLoaded('HO_SO_MASTER');
  if (!loaded || loaded.rowCount === 0) return { repaired: n };
  var sh = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.HO_SO_MASTER);
  var idx = loaded.headers.indexOf('STATUS');
  if (idx < 0) return { repaired: n };
  loaded.rows.forEach(function(r) {
    if (String(r.STATUS || '').trim() !== '') return;
    hosoRepoUpdate(CBV_CONFIG.SHEETS.HO_SO_MASTER, r._rowNumber, { STATUS: 'NEW', UPDATED_AT: cbvNow(), UPDATED_BY: cbvUser() });
    n++;
  });
  return { repaired: n };
}

function repairHosoInvalidRefs() {
  var n = 0;
  var stamp = { UPDATED_AT: cbvNow(), UPDATED_BY: cbvUser() };
  var loaded = _hosoLoaded('HO_SO_MASTER');
  if (!loaded || !loaded.rowCount) return { repaired: n, message: 'No rows' };
  loaded.rows.forEach(function(r) {
    var patch = {};
    if (String(r.DON_VI_ID || '').trim() && typeof _findById === 'function' && !_findById(CBV_CONFIG.SHEETS.DON_VI, String(r.DON_VI_ID).trim())) {
      patch.DON_VI_ID = '';
      n++;
    }
    if (String(r.OWNER_ID || '').trim() && typeof _findById === 'function' && !_findById(CBV_CONFIG.SHEETS.USER_DIRECTORY, String(r.OWNER_ID).trim())) {
      patch.OWNER_ID = '';
      n++;
    }
    if (String(r.MANAGER_USER_ID || '').trim() && typeof _findById === 'function' && !_findById(CBV_CONFIG.SHEETS.USER_DIRECTORY, String(r.MANAGER_USER_ID).trim())) {
      patch.MANAGER_USER_ID = '';
      n++;
    }
    if (Object.keys(patch).length && r._rowNumber) {
      Object.assign(patch, stamp);
      hosoRepoUpdate(CBV_CONFIG.SHEETS.HO_SO_MASTER, r._rowNumber, patch);
    }
  });
  return { repaired: n, message: n ? 'Cleared broken optional refs on HO_SO_MASTER' : 'No broken optional refs' };
}

function repairHosoInvalidEnums() {
  var n = 0;
  var stamp = { UPDATED_AT: cbvNow(), UPDATED_BY: cbvUser() };
  var loaded = _hosoLoaded('HO_SO_MASTER');
  if (!loaded || !loaded.rowCount) return { repaired: n, message: 'No rows' };
  loaded.rows.forEach(function(r) {
    if (String(r.STATUS || '').trim() !== 'INACTIVE') return;
    if (!r._rowNumber) return;
    hosoRepoUpdate(CBV_CONFIG.SHEETS.HO_SO_MASTER, r._rowNumber, Object.assign({ STATUS: 'CLOSED' }, stamp));
    n++;
  });
  return { repaired: n, message: n ? 'Mapped INACTIVE -> CLOSED' : 'No INACTIVE rows' };
}

/**
 * Fixes duplicate HO_SO_CODE by re-allocating for all but the first row (by row number).
 */
function repairHosoDuplicateCodes_() {
  var n = 0;
  var stamp = { UPDATED_AT: cbvNow(), UPDATED_BY: cbvUser() };
  var loaded = _hosoLoaded('HO_SO_MASTER');
  if (!loaded || !loaded.rowCount) return { repaired: n };
  var byCode = {};
  loaded.rows.forEach(function(r) {
    var c = String(r.HO_SO_CODE || '').trim();
    if (!c) return;
    if (!byCode[c]) byCode[c] = [];
    byCode[c].push(r);
  });
  Object.keys(byCode).forEach(function(code) {
    var list = byCode[code];
    if (list.length < 2) return;
    list.sort(function(a, b) { return (a._rowNumber || 0) - (b._rowNumber || 0); });
    for (var i = 1; i < list.length; i++) {
      var row = list[i];
      var tid = String(row.HO_SO_TYPE_ID || '').trim();
      if (!tid || typeof hosoRepoAllocateHoSoCode !== 'function') continue;
      var newCode = hosoRepoAllocateHoSoCode(tid, 80);
      hosoRepoUpdate(CBV_CONFIG.SHEETS.HO_SO_MASTER, row._rowNumber, Object.assign({ HO_SO_CODE: newCode }, stamp));
      n++;
    }
  });
  return { repaired: n, message: 'Duplicate HO_SO_CODE repaired: ' + n };
}

function verifyHosoAppSheetReadiness() {
  var a = auditHosoSchema();
  var b = auditHosoRefs();
  var c = auditHosoEnums();
  var d = auditHosoDataQuality();
  var high = [a, b, c, d].reduce(function(s, x) {
    return s + (x.findings || []).filter(function(f) { return f.severity === 'HIGH'; }).length;
  }, 0);
  return {
    ok: high === 0,
    schema: a,
    refs: b,
    enums: c,
    dataQuality: d
  };
}
