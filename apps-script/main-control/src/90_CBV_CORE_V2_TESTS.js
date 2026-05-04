/**
 * CBV Core V2 — self test (sheets, registry, dispatch, events, idempotency, health).
 */

/**
 * @returns {Object}
 */
function CBV_CoreV2_selfTest() {
  var steps = [];
  var okAll = true;

  function step(name, ok, detail) {
    steps.push({ name: name, ok: !!ok, detail: detail || '' });
    if (!ok) okAll = false;
  }

  try {
    var pairs = [
      ['MODULE_REGISTRY', 'MODULE_REGISTRY'],
      ['COMMAND_LOG', 'COMMAND_LOG'],
      ['EVENT_QUEUE', 'EVENT_QUEUE'],
      ['EVENT_LOG', 'EVENT_LOG'],
      ['AUDIT_LOG', 'AUDIT_LOG'],
      ['IDEMPOTENCY', 'IDEMPOTENCY'],
      ['SYSTEM_HEALTH', 'SYSTEM_HEALTH'],
      ['CONFIG_REGISTRY', 'CONFIG_REGISTRY']
    ];
    var i;
    for (i = 0; i < pairs.length; i++) {
      var sh = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS[pairs[i][0]]);
      step('sheet_' + pairs[i][0], !!sh, sh ? 'ok' : 'missing');
      if (sh) {
        var map = cbvCoreV2ReadHeaderMap_(sh);
        var exp = CBV_CORE_V2.HEADERS[pairs[i][1]];
        var j;
        var missingH = [];
        for (j = 0; j < exp.length; j++) {
          if (!map[exp[j]]) missingH.push(exp[j]);
        }
        step('headers_' + pairs[i][0], missingH.length === 0, missingH.join(',') || 'ok');
      }
    }

    var hosoRegRow = -1;
    var hoSoRegRow = -1;
    var reg = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.MODULE_REGISTRY);
    if (reg) {
      hosoRegRow = cbvCoreV2FindFirstRowInColumn_(reg, 'MODULE_CODE', 'HOSO');
      hoSoRegRow = cbvCoreV2FindFirstRowInColumn_(reg, 'MODULE_CODE', 'HO_SO');
    }
    step('registry_HOSO', hosoRegRow >= 2 || hoSoRegRow >= 2, hosoRegRow >= 2 ? 'HOSO row ' + hosoRegRow : hoSoRegRow >= 2 ? 'legacy HO_SO row ' + hoSoRegRow : 'missing');

    var regCfg = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.MODULE_REGISTRY);
    var cfgRegRow = regCfg ? cbvCoreV2FindFirstRowInColumn_(regCfg, 'MODULE_CODE', 'CONFIG') : -1;
    step('registry_CONFIG', cfgRegRow >= 2, cfgRegRow >= 2 ? 'CONFIG row ' + cfgRegRow : 'missing');

    var idemKey = 'selftest_' + Utilities.getUuid();
    var plate = '99CV2' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
    var testCreatePayload = {
      hoSoType: 'XE',
      title: 'CORE_V2_SELFTEST',
      xaVien: { hoTen: 'SelfTest User' },
      phuongTien: { bienSo: plate }
    };
    var cmd1 = {
      commandType: 'HO_SO_CREATE',
      moduleCode: 'HO_SO',
      source: 'TEST',
      requestBy: 'system',
      idempotencyKey: idemKey,
      payload: testCreatePayload
    };
    var d1 = CBV_CoreV2_dispatch(cmd1);
    step('dispatch_HO_SO_CREATE', !!(d1 && d1.ok === true && d1.entityId), cbvCoreV2SafeStringify_(d1));

    var evSheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.EVENT_LOG);
    var evOk = false;
    if (evSheet && d1.commandId) {
      var lastEv = evSheet.getLastRow();
      if (lastEv >= 2) {
        var mapEv = cbvCoreV2ReadHeaderMap_(evSheet);
        var tCol = mapEv['EVENT_TYPE'];
        var scCol = mapEv['SOURCE_COMMAND_ID'];
        if (tCol && scCol) {
          var r;
          for (r = lastEv; r >= 2; r--) {
            if (String(evSheet.getRange(r, tCol).getValue()) === 'HOSO_CREATED' &&
                String(evSheet.getRange(r, scCol).getValue()) === String(d1.commandId)) {
              evOk = true;
              break;
            }
          }
        }
      }
    }
    step('event_log_HOSO_CREATED', evOk, evOk ? 'found' : 'not found');

    var qSheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.EVENT_QUEUE);
    var qOk = false;
    if (qSheet && d1.commandId) {
      var lastQ = qSheet.getLastRow();
      if (lastQ >= 2) {
        var mapQ = cbvCoreV2ReadHeaderMap_(qSheet);
        var etCol = mapQ['EVENT_TYPE'];
        var scqCol = mapQ['SOURCE_COMMAND_ID'];
        if (etCol && scqCol) {
          var rq;
          for (rq = lastQ; rq >= 2; rq--) {
            if (String(qSheet.getRange(rq, etCol).getValue()) === 'HOSO_CREATED' &&
                String(qSheet.getRange(rq, scqCol).getValue()) === String(d1.commandId)) {
              qOk = true;
              break;
            }
          }
        }
      }
    }
    step('event_queue_HOSO_CREATED', qOk, qOk ? 'found' : 'not found');

    var clSheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.COMMAND_LOG);
    var succOk = false;
    if (clSheet && d1.commandId) {
      var crow = cbvCoreV2FindFirstRowInColumn_(clSheet, 'COMMAND_ID', d1.commandId);
      if (crow >= 2) {
        var mapCl = cbvCoreV2ReadHeaderMap_(clSheet);
        var stCol = mapCl['STATUS'];
        if (stCol && String(clSheet.getRange(crow, stCol).getValue()) === CBV_CORE_V2.COMMAND_STATUS.SUCCESS) {
          succOk = true;
        }
      }
    }
    step('command_log_SUCCESS', succOk, succOk ? 'ok' : 'fail');

    var idemSheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.IDEMPOTENCY);
    var idemOk = false;
    if (idemSheet) {
      var irow = cbvCoreV2FindFirstRowInColumn_(idemSheet, 'IDEMPOTENCY_KEY', idemKey);
      idemOk = irow >= 2;
    }
    step('idempotency_row', idemOk, idemOk ? 'ok' : 'missing');

    var d2 = CBV_CoreV2_dispatch({
      commandType: 'HO_SO_CREATE',
      moduleCode: 'HO_SO',
      source: 'TEST',
      requestBy: 'system',
      idempotencyKey: idemKey,
      payload: testCreatePayload
    });
    var dupOk = !!(d2 && d2.ok === true && d2.commandId === d1.commandId);
    step('idempotency_duplicate_same_result', dupOk, cbvCoreV2SafeStringify_({ first: d1.commandId, second: d2.commandId }));

    if (typeof cbvConfigScriptProp_ === 'function' && cbvConfigScriptProp_('CBV_CONFIG_DB_ID')) {
      var cfgKey = 'SELFTEST_CFG_' + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
      var dCfg = CBV_CoreV2_dispatch({
        commandType: 'CONFIG_SET_VALUE',
        moduleCode: 'CONFIG',
        source: 'TEST',
        requestBy: 'system',
        idempotencyKey: 'cfg_selftest_set_' + Utilities.getUuid(),
        payload: { key: cfgKey, value: 'test123', envCode: 'PROD' }
      });
      step('dispatch_CONFIG_SET_VALUE', !!(dCfg && dCfg.ok === true), cbvCoreV2SafeStringify_(dCfg));
      var dGet = CBV_CoreV2_dispatch({
        commandType: 'CONFIG_GET_VALUE',
        moduleCode: 'CONFIG',
        source: 'TEST',
        requestBy: 'system',
        idempotencyKey: 'cfg_selftest_get_' + Utilities.getUuid(),
        payload: { key: cfgKey, envCode: 'PROD' }
      });
      var getOk = !!(dGet && dGet.ok === true && dGet.data && String(dGet.data.value) === 'test123');
      step('dispatch_CONFIG_GET_VALUE', getOk, cbvCoreV2SafeStringify_(dGet));
    } else {
      step('dispatch_CONFIG_MODULE', true, 'skipped (CBV_CONFIG_DB_ID unset)');
    }

    var healthBefore = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.SYSTEM_HEALTH);
    var rowsBefore = healthBefore ? healthBefore.getLastRow() : 0;
    CBV_CoreV2_healthCheck();
    var rowsAfter = healthBefore ? healthBefore.getLastRow() : 0;
    step('health_check_logged', rowsAfter > rowsBefore, 'before=' + rowsBefore + ' after=' + rowsAfter);
  } catch (e) {
    okAll = false;
    steps.push({ name: 'exception', ok: false, detail: String(e && e.message ? e.message : e) });
  }

  return {
    ok: okAll,
    code: okAll ? 'SELF_TEST_PASS' : 'SELF_TEST_FAIL',
    message: okAll ? 'All checks passed' : 'See steps',
    data: { steps: steps },
    error: okAll ? null : { code: 'SELF_TEST_FAIL', message: 'One or more checks failed' }
  };
}

/**
 * End-to-end CONFIG module readiness (requires CBV_CONFIG_DB_ID + prior CBV_ConfigModule_bootstrap).
 * @returns {{ ok: boolean, message: string }}
 */
function test_ConfigModuleReady_() {
  var r1 = Config_healthCheck_();
  if (!r1.ok) throw new Error('CONFIG_HEALTH_FAIL');

  var key = 'TEST_' + cbvMakeId();

  var set = CBV_CoreV2_dispatch({
    commandType: 'CONFIG_SET_VALUE',
    moduleCode: 'CONFIG',
    source: 'TEST',
    requestBy: 'system',
    idempotencyKey: 'e2e_cfg_set_' + Utilities.getUuid(),
    payload: { key: key, value: 'OK' }
  });

  if (!set.ok) throw new Error('SET_FAIL');

  var get = CBV_CoreV2_dispatch({
    commandType: 'CONFIG_GET_VALUE',
    moduleCode: 'CONFIG',
    source: 'TEST',
    requestBy: 'system',
    idempotencyKey: 'e2e_cfg_get_' + Utilities.getUuid(),
    payload: { key: key }
  });

  if (!get.ok || !get.data || String(get.data.value) !== 'OK') {
    throw new Error('GET_FAIL');
  }

  return {
    ok: true,
    message: 'CONFIG MODULE READY'
  };
}
