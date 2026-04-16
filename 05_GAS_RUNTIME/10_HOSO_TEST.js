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
  step('verifyHosoAppSheetReadiness', function() {
    var v = verifyHosoAppSheetReadiness();
    return { ok: v.ok === true };
  });

  Logger.log('runHosoSmokeTestImpl: ' + JSON.stringify(report));
  return report;
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
    includeWriteTests: doWrite
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

  run('createHoso rejects missing title', function() {
    var types = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE).filter(function(r) {
      return String(r.MASTER_GROUP || '') === HOSO_MASTER_GROUP_TYPE && String(r.STATUS || '') === 'ACTIVE' && String(r.ID || '').trim();
    }) : [];
    if (!types.length) return;
    try {
      createHoso({ HO_SO_TYPE_ID: types[0].ID, TITLE: '', DISPLAY_NAME: '' });
      throw new Error('expected validation error');
    } catch (e) {
      if (String(e.message).indexOf('required') === -1 && String(e.message).indexOf('TITLE') === -1) throw e;
    }
  });

  run('createHoso rejects bad HO_SO_TYPE_ID', function() {
    try {
      createHoso({ HO_SO_TYPE_ID: 'NOT_A_REAL_MASTER_ID_XXX', TITLE: 'T' });
      throw new Error('expected invalid type');
    } catch (e) {
      if (String(e.message).indexOf('Invalid') === -1 && String(e.message).indexOf('HO_SO_TYPE') === -1 && String(e.message).indexOf('not found') === -1) throw e;
    }
  });

  run('updateHoso rejects STATUS patch', function() {
    var rows = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER) : [];
    var one = rows.find(function(r) { return String(r.ID || '').trim() && !hosoIsRowDeleted(r); });
    if (!one) return;
    try {
      updateHoso(one.ID, { STATUS: 'ACTIVE' });
      throw new Error('expected STATUS guard');
    } catch (e) {
      if (String(e.message).indexOf('changeHosoStatus') === -1) throw e;
    }
  });

  run('workflow sample when HO_SO_TYPE exists (optional writes)', function() {
    if (!doWrite) return;
    var types = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE).filter(function(r) {
      return String(r.MASTER_GROUP || '') === HOSO_MASTER_GROUP_TYPE && String(r.STATUS || '') === 'ACTIVE' && String(r.ID || '').trim();
    }) : [];
    if (!types.length) return;
    var typeId = types[0].ID;
    var title = 'TEST_HOSO_FLOW_' + Date.now();
    var created = createHoso({ HO_SO_TYPE_ID: typeId, TITLE: title, DISPLAY_NAME: title });
    if (!created.ok || !created.data || !created.data.ID) throw new Error('create failed');
    var id = created.data.ID;
    changeHosoStatus(id, 'IN_REVIEW', 'test');
    var cur = getHosoById(id);
    if (!cur || String(cur.STATUS) !== 'IN_REVIEW') throw new Error('status transition failed');
    addHosoFile({ HO_SO_ID: id, FILE_NAME: 'smoke.txt', FILE_TYPE: 'OTHER', TITLE: 'smoke' });
    var files = getHosoFiles(id);
    if (!files || !files.length) throw new Error('expected file row');
    var taskRow = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.TASK_MAIN).find(function(r) {
      return String(r.ID || '').trim() && !hosoIsRowDeleted(r);
    }) : null;
    if (!taskRow) throw new Error('need at least one TASK_MAIN row for relation test');
    addHosoRelation({ FROM_HO_SO_ID: id, TO_HO_SO_ID: id, RELATED_TABLE: 'TASK', RELATED_RECORD_ID: taskRow.ID, RELATION_TYPE: 'LINK' });
    var rels = getHosoRelations(id);
    if (!rels || !rels.length) throw new Error('expected relation row');
    var logs = getHosoLogs(id);
    if (!logs || logs.length < 2) throw new Error('expected multiple log rows');
    closeHoso(id, 'test close');
    var closed = getHosoById(id);
    if (!closed || String(closed.STATUS) !== 'CLOSED') throw new Error('closeHoso failed');
  });

  Logger.log('runHosoTestsImpl: ' + JSON.stringify(result, null, 2));
  return result;
}
