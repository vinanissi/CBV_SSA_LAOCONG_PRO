/**
 * HO_SO PRO — automated checks + smoke. No sheet writes except optional workflow test row.
 * Dependencies: 10_HOSO_SERVICE, 10_HOSO_AUDIT_REPAIR, 10_HOSO_REPOSITORY
 */

function runHosoSmokeTestImpl() {
  var report = { ok: true, code: 'HOSO_SMOKE_OK', steps: [] };
  function step(name, fn) {
    try {
      var r = fn();
      report.steps.push({ name: name, ok: r !== false && (!r || r.ok !== false) });
      if (r && r.ok === false) report.ok = false;
    } catch (e) {
      report.ok = false;
      report.code = 'HOSO_SMOKE_FAIL';
      report.steps.push({ name: name, ok: false, error: String(e.message || e) });
    }
  }

  step('auditHosoSchema', function() { return auditHosoSchema(); });
  step('auditHosoEnums', function() { return auditHosoEnums(); });
  step('auditHosoCanonicalOnly_', function() {
    return typeof auditHosoCanonicalOnly_ === 'function' ? auditHosoCanonicalOnly_() : { ok: true };
  });
  step('auditHosoRuleDefCoverage_', function() {
    return typeof auditHosoRuleDefCoverage_ === 'function' ? auditHosoRuleDefCoverage_() : { ok: true };
  });
  step('verifyHosoAppSheetReadiness', function() {
    var v = verifyHosoAppSheetReadiness();
    return { ok: v.ok === true };
  });

  Logger.log('runHosoSmokeTestImpl: ' + JSON.stringify(report));
  return report;
}

/**
 * Write-tests teardown is opt-in:
 *   PropertiesService script property CBV_HOSO_TEST_TEARDOWN=true → clean up created rows.
 * Default: off (artifacts remain so engineers can inspect).
 */
function _hosoTestTeardownEnabled_() {
  try {
    var p = PropertiesService.getScriptProperties().getProperty('CBV_HOSO_TEST_TEARDOWN');
    return String(p || '').toLowerCase() === 'true';
  } catch (e) { return false; }
}

/**
 * Best-effort soft-delete of test artifacts produced during a write-test run.
 * Never throws. Only runs when CBV_HOSO_TEST_TEARDOWN=true.
 */
function _hosoTestTeardown_(artifacts) {
  if (!_hosoTestTeardownEnabled_()) return { ok: true, skipped: true };
  var out = { ok: true, removed: { files: 0, relations: 0, masters: 0 } };
  try {
    (artifacts && artifacts.fileIds ? artifacts.fileIds : []).forEach(function(id) {
      try { hosoFileRemove(id, 'test teardown'); out.removed.files++; } catch (e) {}
    });
    (artifacts && artifacts.relationIds ? artifacts.relationIds : []).forEach(function(id) {
      try { hosoRelationRemove(id, 'test teardown'); out.removed.relations++; } catch (e) {}
    });
    (artifacts && artifacts.masterIds ? artifacts.masterIds : []).forEach(function(id) {
      try { hosoSoftDelete(id, 'test teardown'); out.removed.masters++; } catch (e) {}
    });
  } catch (e) { out.ok = false; out.error = String(e.message || e); }
  return out;
}

/**
 * @param {Object} [options] - { includeWriteTests: boolean } default false (avoids dirty prod sheets)
 */
function runHosoTestsImpl(options) {
  options = options || {};
  var doWrite = options.includeWriteTests === true;
  var result = {
    ok: true,
    module: 'HO_SO_PRO',
    total: 0,
    passed: 0,
    failed: 0,
    details: [],
    includeWriteTests: doWrite,
    teardownEnabled: _hosoTestTeardownEnabled_()
  };

  function run(name, fn) {
    result.total++;
    try {
      fn();
      result.passed++;
      result.details.push({ test: name, passed: true, message: 'OK' });
    } catch (e) {
      result.failed++;
      result.ok = false;
      result.details.push({ test: name, passed: false, message: String(e.message || e) });
    }
  }

  run('auditHosoSchema', function() {
    var a = auditHosoSchema();
    if (!a.ok) throw new Error('Schema: ' + (a.findings && a.findings[0] ? a.findings[0].message : 'fail'));
  });

  run('auditHosoEnums', function() {
    var a = auditHosoEnums();
    if (!a.ok) throw new Error('Enums: ' + (a.findings && a.findings[0] ? a.findings[0].message : 'fail'));
  });

  run('auditHosoRefs', function() {
    var a = auditHosoRefs();
    if (!a.ok) throw new Error('Refs: ' + (a.findings && a.findings[0] ? a.findings[0].message : 'fail'));
  });

  run('auditHosoDataQuality', function() {
    var a = auditHosoDataQuality();
    if (!a.ok) throw new Error('DataQuality: ' + (a.findings && a.findings[0] ? a.findings[0].message : 'fail'));
  });

  run('auditHosoHtxIntegrity', function() {
    if (typeof auditHosoHtxIntegrity !== 'function') throw new Error('auditHosoHtxIntegrity missing');
    var a = auditHosoHtxIntegrity();
    if (!a.ok) throw new Error('HtxIntegrity: ' + (a.findings && a.findings[0] ? a.findings[0].message : 'fail'));
  });

  // --- Negative tests (no writes) -----------------------------------------

  run('negative: hosoSetStatus rejects invalid transition', function() {
    var rows = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER) : [];
    var one = rows.find(function(r) { return String(r.ID || '').trim() && !hosoIsRowDeleted(r); });
    if (!one) return;
    var curStatus = String(one.STATUS || '');
    var allowed = (typeof HOSO_STATUS_TRANSITIONS !== 'undefined' && HOSO_STATUS_TRANSITIONS[curStatus]) ? HOSO_STATUS_TRANSITIONS[curStatus] : [];
    var target = ['NEW', 'IN_REVIEW', 'ACTIVE', 'CLOSED', 'ARCHIVED'].find(function(s) {
      return s !== curStatus && allowed.indexOf(s) === -1;
    });
    if (!target) return;
    try {
      hosoSetStatus(one.ID, target, 'negative-test');
      throw new Error('expected invalid-transition error');
    } catch (e) {
      var msg = String(e.message || e);
      if (msg.indexOf('transition') === -1 && msg.indexOf('Invalid') === -1 && msg.indexOf('Chuyển') === -1) throw e;
    }
  });

  run('negative: hosoCreate rejects HTX_ID when type=HTX (self-reference)', function() {
    var mc = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE) : [];
    var htxMaster = mc.find(function(r) {
      return String(r.MASTER_GROUP || '') === HOSO_MASTER_GROUP_TYPE && String(r.CODE || '').trim() === 'HTX' && String(r.STATUS || '') === 'ACTIVE';
    });
    if (!htxMaster) return;
    var existingHtx = hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER).find(function(r) {
      if (hosoIsRowDeleted(r)) return false;
      return String(r.HO_SO_TYPE_ID || '') === String(htxMaster.ID) && String(r.ID || '').trim();
    });
    if (!existingHtx) return;
    try {
      hosoCreate({ HO_SO_TYPE_ID: htxMaster.ID, TITLE: 'neg-htx-self', HTX_ID: existingHtx.ID });
      throw new Error('expected HTX self-reference guard');
    } catch (e) {
      var msg = String(e.message || e);
      if (msg.indexOf('HTX') === -1) throw e;
    }
  });

  run('negative: hosoCreate rejects orphan HTX_ID', function() {
    var mc = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE) : [];
    var nonHtx = mc.find(function(r) {
      return String(r.MASTER_GROUP || '') === HOSO_MASTER_GROUP_TYPE && String(r.CODE || '').trim() !== 'HTX' && String(r.STATUS || '') === 'ACTIVE' && String(r.ID || '').trim();
    });
    if (!nonHtx) return;
    try {
      hosoCreate({ HO_SO_TYPE_ID: nonHtx.ID, TITLE: 'neg-orphan-htx', HTX_ID: 'HS_DOES_NOT_EXIST_XXX' });
      throw new Error('expected orphan HTX_ID guard');
    } catch (e) {
      var msg = String(e.message || e);
      if (msg.indexOf('HTX') === -1 && msg.indexOf('not found') === -1 && msg.indexOf('invalid') === -1) throw e;
    }
  });

  run('hosoCreate rejects missing title', function() {
    var types = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE).filter(function(r) {
      return String(r.MASTER_GROUP || '') === HOSO_MASTER_GROUP_TYPE && String(r.STATUS || '') === 'ACTIVE' && String(r.ID || '').trim();
    }) : [];
    if (!types.length) return;
    try {
      hosoCreate({ HO_SO_TYPE_ID: types[0].ID, TITLE: '', DISPLAY_NAME: '' });
      throw new Error('expected validation error');
    } catch (e) {
      if (String(e.message).indexOf('required') === -1 && String(e.message).indexOf('TITLE') === -1) throw e;
    }
  });

  run('hosoCreate rejects bad HO_SO_TYPE_ID', function() {
    try {
      hosoCreate({ HO_SO_TYPE_ID: 'NOT_A_REAL_MASTER_ID_XXX', TITLE: 'T' });
      throw new Error('expected invalid type');
    } catch (e) {
      if (String(e.message).indexOf('Invalid') === -1 && String(e.message).indexOf('HO_SO_TYPE') === -1 && String(e.message).indexOf('not found') === -1) throw e;
    }
  });

  run('hosoUpdate rejects STATUS patch', function() {
    var rows = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER) : [];
    var one = rows.find(function(r) { return String(r.ID || '').trim() && !hosoIsRowDeleted(r); });
    if (!one) return;
    try {
      hosoUpdate(one.ID, { STATUS: 'ACTIVE' });
      throw new Error('expected STATUS guard');
    } catch (e) {
      if (String(e.message).indexOf('hosoSetStatus') === -1) throw e;
    }
  });

  var writeArtifacts = { masterIds: [], fileIds: [], relationIds: [] };

  run('workflow sample when HO_SO_TYPE exists (optional writes)', function() {
    if (!doWrite) return;
    var types = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE).filter(function(r) {
      return String(r.MASTER_GROUP || '') === HOSO_MASTER_GROUP_TYPE && String(r.STATUS || '') === 'ACTIVE' && String(r.ID || '').trim();
    }) : [];
    if (!types.length) return;
    var typeId = types[0].ID;
    var title = 'TEST_HOSO_FLOW_' + Date.now();
    var created = hosoCreate({ HO_SO_TYPE_ID: typeId, TITLE: title, DISPLAY_NAME: title });
    if (!created.ok || !created.data || !created.data.ID) throw new Error('create failed');
    var id = created.data.ID;
    writeArtifacts.masterIds.push(id);
    hosoSetStatus(id, 'IN_REVIEW', 'test');
    var cur = hosoGetById(id);
    if (!cur || String(cur.STATUS) !== 'IN_REVIEW') throw new Error('status transition failed');
    var addFile = hosoFileAdd({ HO_SO_ID: id, FILE_NAME: 'smoke.txt', FILE_GROUP: 'KHAC', TITLE: 'smoke' });
    if (addFile && addFile.data && addFile.data.ID) writeArtifacts.fileIds.push(addFile.data.ID);
    var files = hosoListFiles(id);
    if (!files || !files.length) throw new Error('expected file row');
    var taskRow = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.TASK_MAIN).find(function(r) {
      return String(r.ID || '').trim() && !hosoIsRowDeleted(r);
    }) : null;
    if (!taskRow) throw new Error('need at least one TASK_MAIN row for relation test');
    var addRel = hosoRelationAdd({ FROM_HO_SO_ID: id, TO_HO_SO_ID: id, RELATED_TABLE: 'TASK', RELATED_RECORD_ID: taskRow.ID, RELATION_TYPE: 'LINK' });
    if (addRel && addRel.data && addRel.data.ID) writeArtifacts.relationIds.push(addRel.data.ID);
    var rels = hosoListRelations(id);
    if (!rels || !rels.length) throw new Error('expected relation row');
    var logs = hosoListLogs(id);
    if (!logs || logs.length < 2) throw new Error('expected multiple log rows');
    hosoSetStatus(id, 'CLOSED', 'test close');
    var closed = hosoGetById(id);
    if (!closed || String(closed.STATUS) !== 'CLOSED') throw new Error('close failed');
  });

  if (doWrite) {
    result.teardown = _hosoTestTeardown_(writeArtifacts);
  }

  Logger.log('runHosoTestsImpl: ' + JSON.stringify(result, null, 2));
  return result;
}
