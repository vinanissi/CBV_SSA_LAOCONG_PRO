/**
 * CBV Core V2 — CBV_SYSTEM_HEALTH + health check.
 */

/**
 * @param {Object} rec
 */
function cbvCoreV2HealthWrite_(rec) {
  var res = cbvCoreV2EnsureCoreSheet_('SYSTEM_HEALTH', 'SYSTEM_HEALTH');
  var sheet = res.sheet;
  var checkId = rec.checkId || cbvCoreV2NewEventId_('CHK');
  var fields = {
    CHECK_ID: checkId,
    MODULE_CODE: rec.moduleCode || 'CORE_V2',
    CHECK_NAME: rec.checkName || 'GENERIC',
    SEVERITY: rec.severity || 'INFO',
    STATUS: rec.status || 'OK',
    MESSAGE: rec.message || '',
    LAST_CHECK_AT: cbvCoreV2IsoNow_(),
    PAYLOAD_JSON: rec.payload != null ? cbvCoreV2SafeStringify_(rec.payload) : ''
  };
  cbvCoreV2AppendRowByHeaders_(sheet, fields);
}

/**
 * @returns {Object}
 */
function CBV_CoreV2_healthCheck() {
  var findings = [];
  var ok = true;
  var keys = Object.keys(CBV_CORE_V2.SHEETS);
  var i;
  for (i = 0; i < keys.length; i++) {
    var sk = keys[i];
    var sheetName = CBV_CORE_V2.SHEETS[sk];
    var sh = cbvCoreV2GetSpreadsheet_().getSheetByName(sheetName);
    if (!sh) {
      ok = false;
      findings.push({ sheet: sheetName, issue: 'MISSING' });
      continue;
    }
    var hk = sk;
    if (sk === 'MODULE_REGISTRY') hk = 'MODULE_REGISTRY';
    var expected = CBV_CORE_V2.HEADERS[hk];
    if (!expected) continue;
    var map = cbvCoreV2ReadHeaderMap_(sh);
    var j;
    for (j = 0; j < expected.length; j++) {
      if (!map[expected[j]]) {
        ok = false;
        findings.push({ sheet: sheetName, issue: 'MISSING_HEADER', header: expected[j] });
      }
    }
  }

  cbvCoreV2HealthWrite_({
    checkName: 'CBV_CoreV2_healthCheck',
    severity: ok ? 'INFO' : 'WARN',
    status: ok ? 'OK' : 'DEGRADED',
    message: ok ? 'All Core V2 sheets and headers present' : 'Issues: ' + findings.length,
    payload: { findings: findings }
  });

  return {
    ok: ok,
    code: ok ? 'HEALTH_OK' : 'HEALTH_ISSUES',
    message: ok ? 'OK' : 'See findings',
    data: { findings: findings },
    error: ok ? null : { code: 'HEALTH_ISSUES', message: 'Core V2 health degraded' }
  };
}
