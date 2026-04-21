/**
 * HO_SO Audit & Repair — uses loadSheetDataSafe where applicable.
 */

/**
 * Load a HO_SO-adjacent sheet via loadSheetDataSafe. Renamed from _hosoLoaded
 * to match hoso* naming convention (see NAMING_CONVENTIONS.md §1/§2).
 * @param {string} name CBV_CONFIG.SHEETS key or raw sheet name.
 * @returns {{headers:string[], rows:object[], rowCount:number}|null}
 */
function hosoAuditLoaded_(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS[name] || name);
  if (!sh) return null;
  return typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sh, name) : null;
}

// Phase C (2026-04-21): deprecated alias _hosoLoaded removed; use hosoAuditLoaded_.

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
    var loaded = hosoAuditLoaded_(sp.child);
    if (!loaded || loaded.rowCount === 0) return;
    var parentLoaded = hosoAuditLoaded_(sp.parent);
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
    var loaded = hosoAuditLoaded_(c.table);
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
  var loaded = hosoAuditLoaded_('HO_SO_MASTER');
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
    var ch = hosoAuditLoaded_('HO_SO_FILE');
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
    ch = hosoAuditLoaded_('HO_SO_RELATION');
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
    ch = hosoAuditLoaded_('HO_SO_UPDATE_LOG');
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
  var loaded = hosoAuditLoaded_('HO_SO_MASTER');
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
  var loaded = hosoAuditLoaded_('HO_SO_MASTER');
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
  var loaded = hosoAuditLoaded_('HO_SO_MASTER');
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
  var loaded = hosoAuditLoaded_('HO_SO_MASTER');
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
  var e = auditHosoHtxIntegrity();
  var high = [a, b, c, d, e].reduce(function(s, x) {
    return s + (x.findings || []).filter(function(f) { return f.severity === 'HIGH'; }).length;
  }, 0);
  return {
    ok: high === 0,
    schema: a,
    refs: b,
    enums: c,
    dataQuality: d,
    htx: e
  };
}

/**
 * HTX integrity probes — single source of truth for the "HO_SO_TYPE=HTX → ROOT, other → MUST have HTX_ID"
 * business invariant.
 *
 * Findings:
 *   - HIGH  HTX_SELF_REF        : row with type=HTX but HTX_ID is non-empty (should be blank / root)
 *   - HIGH  HTX_MISSING         : non-HTX row with blank HTX_ID
 *   - HIGH  HTX_ORPHAN          : HTX_ID does not reference an existing HO_SO_MASTER row
 *   - HIGH  HTX_WRONG_TYPE      : HTX_ID references a row whose TYPE is not HTX
 *   - HIGH  HTX_DELETED         : HTX_ID references a soft-deleted HO_SO_MASTER row
 * @returns {{ok:boolean, findings:Array}}
 */
function auditHosoHtxIntegrity() {
  var findings = [];
  var loaded = hosoAuditLoaded_('HO_SO_MASTER');
  if (!loaded || loaded.rowCount === 0) return { ok: true, findings: findings };

  var typeCodeById = typeof hosoRepoMasterCodeIndexForHoSoType === 'function' ? hosoRepoMasterCodeIndexForHoSoType() : {};

  var byId = {};
  loaded.rows.forEach(function(r) {
    var id = String(r.ID || '').trim();
    if (id) byId[id] = r;
  });

  loaded.rows.forEach(function(r) {
    var id = String(r.ID || '').trim();
    if (!id) return;
    var typeId = String(r.HO_SO_TYPE_ID || '').trim();
    var typeCode = typeId ? (typeCodeById[typeId] || '') : '';
    var htxId = String(r.HTX_ID || '').trim();
    var isRowDeleted = r.IS_DELETED === true || String(r.IS_DELETED).toLowerCase() === 'true';
    if (isRowDeleted) return;

    if (typeCode === 'HTX') {
      if (htxId) {
        findings.push({
          severity: 'HIGH', code: 'HTX_SELF_REF', table: 'HO_SO_MASTER', row: r._rowNumber,
          message: 'HTX row has HTX_ID=' + htxId + ' (must be blank)'
        });
      }
      return;
    }

    if (!htxId) {
      findings.push({
        severity: 'HIGH', code: 'HTX_MISSING', table: 'HO_SO_MASTER', row: r._rowNumber,
        message: 'Non-HTX row (type=' + (typeCode || typeId || '?') + ') has no HTX_ID'
      });
      return;
    }

    var parent = byId[htxId];
    if (!parent) {
      findings.push({
        severity: 'HIGH', code: 'HTX_ORPHAN', table: 'HO_SO_MASTER', row: r._rowNumber,
        message: 'HTX_ID=' + htxId + ' not in HO_SO_MASTER'
      });
      return;
    }
    var parentTypeCode = typeCodeById[String(parent.HO_SO_TYPE_ID || '').trim()] || '';
    if (parentTypeCode !== 'HTX') {
      findings.push({
        severity: 'HIGH', code: 'HTX_WRONG_TYPE', table: 'HO_SO_MASTER', row: r._rowNumber,
        message: 'HTX_ID=' + htxId + ' references row of type ' + (parentTypeCode || '?') + ' (expected HTX)'
      });
      return;
    }
    var parentDeleted = parent.IS_DELETED === true || String(parent.IS_DELETED).toLowerCase() === 'true';
    if (parentDeleted) {
      findings.push({
        severity: 'HIGH', code: 'HTX_DELETED', table: 'HO_SO_MASTER', row: r._rowNumber,
        message: 'HTX_ID=' + htxId + ' references soft-deleted HTX'
      });
    }
  });

  return { ok: findings.length === 0, findings: findings };
}

/**
 * Phase C gate: assert no deprecated HO_SO legacy name is redeclared in the
 * global scope. If any legacy identifier resolves to a function, that means
 * a developer has accidentally re-introduced an alias (or pulled back an old
 * file). Emits HIGH findings so hosoAudit / hosoRunSmokeTest fail loud.
 *
 * Keep this list in sync with FUNCTION_WRAPPER_MAP.md → "HO_SO removed aliases".
 *
 * @returns {{ok:boolean, findings:Array<{severity:string,code:string,name:string,message:string}>}}
 */
function auditHosoCanonicalOnly_() {
  var REMOVED = [
    'createHoSo', 'createHoso', 'updateHoso', 'changeHosoStatus', 'setHoSoStatus',
    'closeHoso', 'softDeleteHoso', 'addHosoFile', 'attachHoSoFile', 'removeHosoFile',
    'addHosoRelation', 'createHoSoRelation', 'removeHosoRelation',
    'getHosoById', 'getHosoFiles', 'getHosoRelations', 'getHosoLogs',
    'getExpiringHoso', 'getExpiredHoso', 'checkHoSoCompleteness',
    'getExpiringDocs', 'generateHoSoReport',
    'runHosoTests', 'runHoSoTests', 'runHosoSmokeTest',
    'hosoRunAudit', 'hosoRunAuditImpl', 'auditHoSoModule', 'auditHoSoModuleImpl',
    'seedHoSoDemo', 'seedHoSoDemoImpl',
    'hosoRunFullDeploymentMenu', 'hosoRunFullDeploymentMenuImpl', 'runHosoFullDeployment',
    '_hosoLoaded'
  ];
  var findings = [];
  REMOVED.forEach(function(name) {
    var fn;
    try { fn = eval(name); } catch (e) { fn = undefined; }
    if (typeof fn === 'function') {
      findings.push({
        severity: 'HIGH',
        code: 'HOSO_LEGACY_ALIAS_REDECLARED',
        name: name,
        message: 'Deprecated HO_SO alias "' + name + '" is declared again — Phase C requires canonical hoso* only. Remove the redeclaration and call the canonical name instead.'
      });
    }
  });
  return { ok: findings.length === 0, findings: findings };
}

/**
 * Phase D coverage audit: every HO_SO event constant emitted by 10_HOSO_EVENTS.js
 * MUST have ≥1 enabled row in RULE_DEF, OR be in the explicit whitelist. Any INVOKE_SERVICE
 * action must reference a handler present in the core action registry.
 *
 * Severities:
 *   HIGH  HOSO_EVENT_NO_RULE          — an event is emitted but no enabled rule processes it
 *   HIGH  HOSO_RULE_UNKNOWN_HANDLER   — an ACTIONS_JSON references a handler not registered
 *   MED   HOSO_RULE_BAD_ACTIONS_JSON  — a row fails to parse
 *
 * @returns {{ok:boolean, findings:Array, coverage:Object}}
 */
function auditHosoRuleDefCoverage_() {
  var findings = [];
  var coverage = { events: {}, rules: 0, handlersReferenced: [], handlersRegistered: [] };

  var EVENTS = [
    'HO_SO_CREATED', 'HO_SO_UPDATED', 'HO_SO_STATUS_CHANGED', 'HO_SO_CLOSED',
    'HO_SO_DELETED', 'HO_SO_FILE_ADDED', 'HO_SO_FILE_REMOVED',
    'HO_SO_RELATION_ADDED', 'HO_SO_RELATION_REMOVED'
  ];

  var sheetName = CBV_CONFIG && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.RULE_DEF;
  var sheet = sheetName ? SpreadsheetApp.getActive().getSheetByName(sheetName) : null;
  if (!sheet) {
    findings.push({
      severity: 'HIGH', code: 'HOSO_RULE_DEF_SHEET_MISSING',
      message: 'RULE_DEF sheet not found — run ensureCoreSheetsExist + hosoSeedCoreRules_ first.'
    });
    EVENTS.forEach(function(e) { coverage.events[e] = { rules: 0, enabled: 0 }; });
    return { ok: false, findings: findings, coverage: coverage };
  }

  var rows = typeof _rows === 'function' ? _rows(sheet) : [];
  coverage.rules = rows.length;

  var rulesByEvent = {};
  var handlersReferenced = {};

  rows.forEach(function(r) {
    if (!r) return;
    var evt = String(r.EVENT_TYPE || '').trim();
    if (evt.indexOf('HO_SO_') !== 0) return;
    var enabled = r.ENABLED === true || String(r.ENABLED || '').toUpperCase() === 'TRUE' || String(r.ENABLED || '').toUpperCase() === 'YES';
    rulesByEvent[evt] = rulesByEvent[evt] || { total: 0, enabled: 0, rules: [] };
    rulesByEvent[evt].total++;
    if (enabled) rulesByEvent[evt].enabled++;
    rulesByEvent[evt].rules.push(r);

    var actions;
    try {
      actions = typeof r.ACTIONS_JSON === 'string' ? JSON.parse(r.ACTIONS_JSON) : r.ACTIONS_JSON;
    } catch (e) {
      findings.push({
        severity: 'MEDIUM', code: 'HOSO_RULE_BAD_ACTIONS_JSON',
        ruleCode: r.RULE_CODE || '', eventType: evt,
        message: 'ACTIONS_JSON fails to parse: ' + (e && e.message ? e.message : String(e))
      });
      return;
    }
    if (!Array.isArray(actions)) return;
    actions.forEach(function(a) {
      if (!a || typeof a !== 'object') return;
      if (String(a.type || '').toUpperCase() !== 'INVOKE_SERVICE') return;
      var h = a.params && a.params.handler ? String(a.params.handler) : '';
      if (h) handlersReferenced[h] = true;
    });
  });

  EVENTS.forEach(function(e) {
    var c = rulesByEvent[e] || { total: 0, enabled: 0 };
    coverage.events[e] = { rules: c.total, enabled: c.enabled };
    if (c.enabled === 0) {
      findings.push({
        severity: 'HIGH', code: 'HOSO_EVENT_NO_RULE',
        eventType: e,
        message: 'No enabled RULE_DEF row covers event "' + e + '" — add one via hosoSeedCoreRules_() or enable an existing row.'
      });
    }
  });

  var registered = typeof cbvListCoreActions_ === 'function' ? cbvListCoreActions_() : [];
  var registeredSet = {};
  registered.forEach(function(n) { registeredSet[n] = true; });
  coverage.handlersRegistered = registered;

  var refsArr = [];
  var k;
  for (k in handlersReferenced) if (Object.prototype.hasOwnProperty.call(handlersReferenced, k)) refsArr.push(k);
  refsArr.sort();
  coverage.handlersReferenced = refsArr;

  refsArr.forEach(function(h) {
    if (!registeredSet[h]) {
      findings.push({
        severity: 'HIGH', code: 'HOSO_RULE_UNKNOWN_HANDLER',
        handler: h,
        message: 'ACTIONS_JSON references INVOKE_SERVICE handler "' + h + '" but no module registered it via cbvRegisterCoreAction_.'
      });
    }
  });

  return { ok: findings.length === 0, findings: findings, coverage: coverage };
}
