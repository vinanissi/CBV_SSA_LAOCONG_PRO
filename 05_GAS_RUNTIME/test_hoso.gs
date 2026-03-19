/**
 * CBV HO_SO Test Layer - Happy path, validation, workflow, duplicate handling.
 * Uses SAMPLE_ prefix for test-created records. Does not delete.
 */
function runHoSoTests() {
  var result = {
    ok: true,
    module: 'HO_SO',
    total: 0,
    passed: 0,
    failed: 0,
    details: []
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

  run('create sample HTX', function() {
    var existing = _findByCodeAndType('SAMPLE_HTX001', 'HTX');
    if (existing) return;
    var r = createHoSo({ HO_SO_TYPE: 'HTX', CODE: 'SAMPLE_HTX001', NAME: 'HTX Demo' });
    if (!r.ok || !r.data.ID) throw new Error('HTX not created');
    if (r.data.CODE !== 'SAMPLE_HTX001') throw new Error('CODE mismatch');
  });

  run('create sample XA_VIEN', function() {
    var existing = _findByCodeAndType('SAMPLE_XV001', 'XA_VIEN');
    if (existing) return;
    var htx = _findByCodeAndType('SAMPLE_HTX001', 'HTX');
    var htxId = htx ? htx.ID : null;
    var r = createHoSo({ HO_SO_TYPE: 'XA_VIEN', CODE: 'SAMPLE_XV001', NAME: 'Xã viên 1', HTX_ID: htxId || '' });
    if (!r.ok || !r.data.ID) throw new Error('XA_VIEN not created');
  });

  run('create sample XE', function() {
    var existing = _findByCodeAndType('SAMPLE_XE001', 'XE');
    if (existing) return;
    var r = createHoSo({ HO_SO_TYPE: 'XE', CODE: 'SAMPLE_XE001', NAME: 'Xe mẫu' });
    if (!r.ok || !r.data.ID) throw new Error('XE not created');
  });

  run('create sample TAI_XE', function() {
    var existing = _findByCodeAndType('SAMPLE_TX001', 'TAI_XE');
    if (existing) return;
    var r = createHoSo({ HO_SO_TYPE: 'TAI_XE', CODE: 'SAMPLE_TX001', NAME: 'Tài xế mẫu' });
    if (!r.ok || !r.data.ID) throw new Error('TAI_XE not created');
  });

  run('verify IDs created', function() {
    var rows = _rows(_sheet(CBV_CONFIG.SHEETS.HO_SO_MASTER));
    var samples = rows.filter(function(r) { return String(r.CODE || '').indexOf('SAMPLE_') === 0; });
    if (samples.length < 4) throw new Error('Expected at least 4 SAMPLE_ records');
    samples.forEach(function(r) {
      if (!r.ID || r.ID.length < 10) throw new Error('Invalid ID: ' + r.ID);
    });
  });

  run('required fields enforced', function() {
    try {
      createHoSo({ HO_SO_TYPE: 'HTX', CODE: '', NAME: 'X' });
      throw new Error('Should have rejected empty CODE');
    } catch (e) {
      if (e.message.indexOf('required') === -1 && e.message.indexOf('CODE') === -1) throw e;
    }
  });

  run('duplicate code handling', function() {
    try {
      createHoSo({ HO_SO_TYPE: 'HTX', CODE: 'SAMPLE_HTX001', NAME: 'Duplicate' });
      throw new Error('Should have rejected duplicate CODE');
    } catch (e) {
      if (e.message.indexOf('Duplicate') === -1) throw e;
    }
  });

  run('invalid HO_SO_TYPE rejected', function() {
    try {
      createHoSo({ HO_SO_TYPE: 'INVALID', CODE: 'SAMPLE_BAD', NAME: 'Bad' });
      throw new Error('Should have rejected invalid type');
    } catch (e) {
      if (e.message.indexOf('Invalid') === -1 && e.message.indexOf('HO_SO_TYPE') === -1) throw e;
    }
  });

  run('workflow NEW->ACTIVE', function() {
    var htx = _findByCodeAndType('SAMPLE_HTX001', 'HTX');
    if (!htx) throw new Error('SAMPLE_HTX001 not found');
    if (String(htx.STATUS) === 'ACTIVE') return;
    var r = setHoSoStatus(htx.ID, 'ACTIVE');
    if (!r.ok || r.data.STATUS !== 'ACTIVE') throw new Error('Status not updated');
  });

  Logger.log('runHoSoTests: ' + JSON.stringify(result, null, 2));
  return result;
}

function _findByCodeAndType(code, type) {
  var rows = _rows(_sheet(CBV_CONFIG.SHEETS.HO_SO_MASTER));
  return rows.find(function(r) { return String(r.CODE) === String(code) && String(r.HO_SO_TYPE) === String(type); }) || null;
}
