/**
 * CBV FINANCE — debug tests for 30_FINANCE_SERVICE.
 * Chay runFinanceTests() trong Apps Script editor (spreadsheet co enum hop le).
 */

function runFinanceTests() {
  var passed = 0;
  var failed = 0;

  function t(name, fn) {
    try {
      if (fn()) {
        passed++;
        Logger.log('[FINANCE TEST] ' + name + ': PASS');
      } else {
        failed++;
        Logger.log('[FINANCE TEST] ' + name + ': FAIL');
      }
    } catch (e) {
      failed++;
      Logger.log('[FINANCE TEST] ' + name + ': FAIL — ' + (e.message || e));
    }
  }

  t('testCreateTransaction', function() {
    var r = createTransaction({
      TRANS_TYPE: 'INCOME',
      CATEGORY: 'THU_KHAC',
      AMOUNT: 100000,
      TRANS_CODE: 'TEST_FIN_CREATE_' + Date.now()
    });
    return r.ok === true && r.data && r.data.id;
  });

  t('testCreateTransaction_fail_noAmount', function() {
    var r = createTransaction({
      TRANS_TYPE: 'INCOME',
      CATEGORY: 'THU_KHAC'
    });
    return r.ok === false;
  });

  t('testUpdateDraft', function() {
    var r = createTransaction({
      TRANS_TYPE: 'INCOME',
      CATEGORY: 'THU_KHAC',
      AMOUNT: 50000,
      TRANS_CODE: 'TEST_FIN_UPD_' + Date.now()
    });
    if (!r.ok || !r.data.id) return false;
    var r2 = updateDraftTransaction(r.data.id, { DESCRIPTION: 'Updated by test' });
    return r2.ok === true;
  });

  t('testConfirmTransaction', function() {
    var r = createTransaction({
      TRANS_TYPE: 'INCOME',
      CATEGORY: 'THU_KHAC',
      AMOUNT: 75000,
      TRANS_CODE: 'TEST_FIN_CONF_' + Date.now()
    });
    if (!r.ok || !r.data.id) return false;
    var r2 = confirmTransaction(r.data.id, 'confirm test');
    return r2.ok === true && String(r2.data.STATUS) === 'CONFIRMED';
  });

  t('testCannotEditAfterConfirm', function() {
    var r = createTransaction({
      TRANS_TYPE: 'EXPENSE',
      CATEGORY: 'VAN_HANH',
      AMOUNT: 20000,
      TRANS_CODE: 'TEST_FIN_BLOCK_' + Date.now()
    });
    if (!r.ok || !r.data.id) return false;
    var r2 = confirmTransaction(r.data.id, '');
    if (!r2.ok) return false;
    var r3 = updateDraftTransaction(r.data.id, { DESCRIPTION: 'should fail' });
    return r3.ok === false;
  });

  t('testCancelTransaction', function() {
    var r = createTransaction({
      TRANS_TYPE: 'INCOME',
      CATEGORY: 'THU_KHAC',
      AMOUNT: 30000,
      TRANS_CODE: 'TEST_FIN_CANC_' + Date.now()
    });
    if (!r.ok || !r.data.id) return false;
    var r2 = cancelTransaction(r.data.id, 'cancel test');
    return r2.ok === true && String(r2.data.STATUS) === 'CANCELLED';
  });

  t('testCannotCancelConfirmed', function() {
    var r = createTransaction({
      TRANS_TYPE: 'INCOME',
      CATEGORY: 'THU_KHAC',
      AMOUNT: 40000,
      TRANS_CODE: 'TEST_FIN_NOCAN_' + Date.now()
    });
    if (!r.ok || !r.data.id) return false;
    var r2 = confirmTransaction(r.data.id, '');
    if (!r2.ok) return false;
    var r3 = cancelTransaction(r.data.id, 'should not work');
    return r3.ok === false;
  });

  t('testArchive', function() {
    var r = createTransaction({
      TRANS_TYPE: 'INCOME',
      CATEGORY: 'THU_KHAC',
      AMOUNT: 60000,
      TRANS_CODE: 'TEST_FIN_ARCH_' + Date.now()
    });
    if (!r.ok || !r.data.id) return false;
    var r2 = confirmTransaction(r.data.id, '');
    if (!r2.ok) return false;
    var r3 = archiveTransaction(r.data.id);
    return r3.ok === true && String(r3.data.STATUS) === 'ARCHIVED';
  });

  Logger.log('[FINANCE TEST] SUMMARY: passed=' + passed + ' failed=' + failed + ' (total 8)');
  return { passed: passed, failed: failed, total: 8 };
}
