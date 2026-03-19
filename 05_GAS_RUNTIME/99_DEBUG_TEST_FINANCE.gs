/**
 * CBV FINANCE Test Layer - Create, confirm, illegal edit block, log behavior.
 * Uses SAMPLE_ prefix for test records. Does not delete.
 */
function runFinanceTests() {
  var result = {
    ok: true,
    module: 'FINANCE',
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  var sampleFinId = null;

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

  run('create NEW transaction', function() {
    var r = createTransaction({
      TRANS_TYPE: 'EXPENSE',
      CATEGORY: 'VAN_HANH',
      AMOUNT: 100000,
      TRANS_CODE: 'SAMPLE_TR001'
    });
    if (!r.ok || !r.data.ID) throw new Error('Transaction not created');
    if (r.data.STATUS !== 'NEW') throw new Error('Status should be NEW');
    sampleFinId = r.data.ID;
  });

  run('confirm transaction', function() {
    if (!sampleFinId) throw new Error('No sample transaction');
    var r = setFinanceStatus(sampleFinId, 'CONFIRMED', 'Confirmed');
    if (!r.ok || r.data.STATUS !== 'CONFIRMED') throw new Error('Not confirmed');
    if (!r.data.CONFIRMED_AT || !r.data.CONFIRMED_BY) throw new Error('CONFIRMED_AT/BY not set');
  });

  run('illegal edit after confirmed blocked', function() {
    if (!sampleFinId) throw new Error('No sample transaction');
    try {
      updateDraftTransaction(sampleFinId, { AMOUNT: 999 });
      throw new Error('Should have blocked edit of CONFIRMED transaction');
    } catch (e) {
      if (e.message.indexOf('Only NEW') === -1 && e.message.indexOf('NEW') === -1) throw e;
    }
  });

  run('log behavior', function() {
    var logs = _rows(_sheet(CBV_CONFIG.SHEETS.FINANCE_LOG)).filter(function(r) { return String(r.FIN_ID) === String(sampleFinId); });
    if (logs.length < 2) throw new Error('Expected at least 2 log entries (CREATED, STATUS_CHANGED)');
  });

  run('invalid amount rejected', function() {
    try {
      createTransaction({ TRANS_TYPE: 'EXPENSE', CATEGORY: 'VAN_HANH', AMOUNT: 0 });
      throw new Error('Should have rejected zero amount');
    } catch (e) {
      if (e.message.indexOf('must be') === -1 && e.message.indexOf('> 0') === -1) throw e;
    }
  });

  run('invalid category rejected', function() {
    try {
      createTransaction({ TRANS_TYPE: 'EXPENSE', CATEGORY: 'INVALID', AMOUNT: 100 });
      throw new Error('Should have rejected invalid category');
    } catch (e) {
      if (e.message.indexOf('Invalid') === -1 && e.message.indexOf('CATEGORY') === -1) throw e;
    }
  });

  run('workflow NEW->CANCELLED', function() {
    var r = createTransaction({ TRANS_TYPE: 'INCOME', CATEGORY: 'THU_KHAC', AMOUNT: 50000, TRANS_CODE: 'SAMPLE_TR002' });
    if (!r.ok) throw new Error('Transaction not created');
    var r2 = setFinanceStatus(r.data.ID, 'CANCELLED', 'Cancelled');
    if (!r2.ok || r2.data.STATUS !== 'CANCELLED') throw new Error('Cancel failed');
  });

  Logger.log('runFinanceTests: ' + JSON.stringify(result, null, 2));
  return result;
}
