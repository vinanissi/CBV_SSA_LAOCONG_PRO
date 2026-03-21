/**
 * CBV Golden Sample Data - Safe, idempotent seed for demo/testing.
 * Uses SAMPLE_ prefix. Skips if record exists. Does not delete.
 */
var SAMPLE_PREFIX = 'SAMPLE_';

function seedGoldenDataset() {
  var result = {
    ok: true,
    code: 'SEED_OK',
    message: 'Golden dataset seeded',
    data: {
      hoSo: { created: 0, skipped: 0, ids: {} },
      tasks: { created: 0, skipped: 0, ids: [] },
      finance: { created: 0, skipped: 0, ids: [] }
    },
    errors: []
  };

  try {
    if (typeof seedUserDirectory === 'function') {
      var udSeed = seedUserDirectory({ sampleMode: true });
      result.data.userDirectory = { sampleCreated: udSeed.data ? udSeed.data.sampleCreated : 0 };
    }
    _seedHoSo(result);
    _seedTasks(result);
    _seedFinance(result);
  } catch (e) {
    result.ok = false;
    result.code = 'SEED_FAIL';
    result.errors.push(String(e.message || e));
  }

  Logger.log('seedGoldenDataset: ' + JSON.stringify(result, null, 2));
  return result;
}

function _seedHoSo(result) {
  var rows = _rows(_sheet(CBV_CONFIG.SHEETS.HO_SO_MASTER));
  function exists(code, type) {
    return rows.some(function(r) { return String(r.CODE) === code && String(r.HO_SO_TYPE) === type; });
  }

  var specs = [
    { type: 'HTX', code: SAMPLE_PREFIX + 'HTX001', name: 'HTX Lao Cộng Demo' },
    { type: 'XA_VIEN', code: SAMPLE_PREFIX + 'XV001', name: 'Xã viên Nguyễn Văn A' },
    { type: 'XA_VIEN', code: SAMPLE_PREFIX + 'XV002', name: 'Xã viên Trần Thị B' },
    { type: 'XE', code: SAMPLE_PREFIX + 'XE001', name: 'Xe 51C-12345' },
    { type: 'TAI_XE', code: SAMPLE_PREFIX + 'TX001', name: 'Tài xế Lê Văn C' }
  ];

  var htxId = null;
  specs.forEach(function(s) {
    if (exists(s.code, s.type)) {
      result.data.hoSo.skipped++;
      if (s.type === 'HTX') {
        var r = rows.find(function(x) { return String(x.CODE) === s.code && String(x.HO_SO_TYPE) === s.type; });
        if (r) htxId = r.ID;
      }
      return;
    }
    var data = { HO_SO_TYPE: s.type, CODE: s.code, NAME: s.name };
    if (s.type === 'XA_VIEN' && htxId) data.HTX_ID = htxId;
    var res = createHoSo(data);
    if (res.ok) {
      result.data.hoSo.created++;
      result.data.hoSo.ids[s.type + '_' + s.code] = res.data.ID;
      if (s.type === 'HTX') htxId = res.data.ID;
    }
  });
}

function _seedTasks(result) {
  var rows = _rows(_sheet(CBV_CONFIG.SHEETS.TASK_MAIN));
  function exists(code) {
    return rows.some(function(r) { return String(r.TASK_CODE) === code; });
  }

  var specs = [
    { code: SAMPLE_PREFIX + 'TK001', title: 'Kiểm tra hồ sơ ban đầu', priority: 'HIGH' },
    { code: SAMPLE_PREFIX + 'TK002', title: 'Xác nhận giao dịch tháng', priority: 'MEDIUM' }
  ];

  var activeUsers = typeof getActiveUsers === 'function' ? getActiveUsers() : [];
  var ownerId = activeUsers.length > 0 ? activeUsers[0].id : cbvUser();

  specs.forEach(function(s) {
    if (exists(s.code)) {
      result.data.tasks.skipped++;
      return;
    }
    var res = createTask({
      TITLE: s.title,
      OWNER_ID: ownerId,
      PRIORITY: s.priority,
      TASK_CODE: s.code
    });
    if (res.ok) {
      result.data.tasks.created++;
      result.data.tasks.ids.push(res.data.ID);
    }
  });
}

function _seedFinance(result) {
  var rows = _rows(_sheet(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION));
  function exists(code) {
    return rows.some(function(r) { return String(r.TRANS_CODE) === code; });
  }

  var specs = [
    { code: SAMPLE_PREFIX + 'TR001', type: 'EXPENSE', category: 'VAN_HANH', amount: 500000 },
    { code: SAMPLE_PREFIX + 'TR002', type: 'INCOME', category: 'THU_KHAC', amount: 1000000 }
  ];

  specs.forEach(function(s) {
    if (exists(s.code)) {
      result.data.finance.skipped++;
      return;
    }
    var res = createTransaction({
      TRANS_TYPE: s.type,
      CATEGORY: s.category,
      AMOUNT: s.amount,
      TRANS_CODE: s.code
    });
    if (res.ok) {
      result.data.finance.created++;
      result.data.finance.ids.push(res.data.ID);
    }
  });
}
