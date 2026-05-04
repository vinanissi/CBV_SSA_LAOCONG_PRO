/**
 * HO_SO V2 — health check + HO_SO_HEALTH / CBV_SYSTEM_HEALTH.
 */

/**
 * @returns {Object}
 */
function HoSoV2_Health_check() {
  var findings = [];
  var ok = true;
  var keys = Object.keys(HO_SO_V2.SHEETS);
  var i;

  for (i = 0; i < keys.length; i++) {
    var k = keys[i];
    var name = typeof hoSoV2ResolvePhysicalSheetName_ === 'function' ? hoSoV2ResolvePhysicalSheetName_(k) : HO_SO_V2.SHEETS[k];
    var sh = hoSoV2Spreadsheet_().getSheetByName(name);
    if (!sh) {
      ok = false;
      findings.push({ sheet: name, issue: 'MISSING' });
      continue;
    }
    var exp = HO_SO_V2.HEADERS[k];
    var map = cbvCoreV2ReadHeaderMap_(sh);
    var j;
    for (j = 0; j < exp.length; j++) {
      if (!map[exp[j]]) {
        ok = false;
        findings.push({ sheet: name, issue: 'MISSING_HEADER', header: exp[j] });
      }
    }
  }

  try {
    HoSoV2_Search_foldKeyword('thử nghiệm');
  } catch (e) {
    ok = false;
    findings.push({ check: 'search_fold', issue: String(e && e.message ? e.message : e) });
  }

  var reg = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.MODULE_REGISTRY);
  if (reg) {
    var rrH = hoSoV2FindRowByColumn_(reg, 'MODULE_CODE', 'HOSO');
    var rrO = hoSoV2FindRowByColumn_(reg, 'MODULE_CODE', 'HO_SO');
    if (rrH < 2 && rrO < 2) {
      ok = false;
      findings.push({ check: 'registry', issue: 'HOSO / HO_SO module row missing' });
    } else {
      var rr = rrH >= 2 ? rrH : rrO;
      var stCol = cbvCoreV2ReadHeaderMap_(reg)['STATUS'];
      if (stCol) {
        var st = String(reg.getRange(rr, stCol).getValue() || '').toUpperCase();
        if (st && st.indexOf('ACTIVE') === -1 && st.indexOf('LEGACY') === -1) {
          findings.push({ check: 'registry', issue: 'HOSO module not ACTIVE', status: st });
        }
      }
    }
  } else {
    findings.push({ check: 'registry', issue: 'MODULE_REGISTRY missing' });
  }

  var g = typeof cbvCoreV2GlobalThis_ === 'function' ? cbvCoreV2GlobalThis_() : this;
  var coreFns = ['CBV_CoreV2_dispatch', 'CBV_CoreV2_emitEvent', 'CBV_CoreV2_logAudit'];
  for (i = 0; i < coreFns.length; i++) {
    if (typeof g[coreFns[i]] !== 'function') {
      ok = false;
      findings.push({ check: 'core', issue: 'Missing ' + coreFns[i] });
    }
  }

  hoSoV2EnsureSheet_('HEALTH', 'HEALTH');
  var hsh = hoSoV2GetSheet_('HEALTH');
  var checkId = hoSoV2NewId_('CHK');
  hoSoV2AppendRow_(hsh, {
    CHECK_ID: checkId,
    CHECK_NAME: 'HoSoV2_Health_check',
    SEVERITY: ok ? 'INFO' : 'WARN',
    STATUS: ok ? 'OK' : 'DEGRADED',
    MESSAGE: ok ? 'HO_SO V2 OK' : 'Issues: ' + findings.length,
    LAST_CHECK_AT: cbvCoreV2IsoNow_(),
    PAYLOAD_JSON: cbvCoreV2SafeStringify_({ findings: findings })
  });

  try {
    cbvCoreV2HealthWrite_({
      checkName: 'HoSoV2_Health_check',
      moduleCode: 'HOSO',
      severity: ok ? 'INFO' : 'WARN',
      status: ok ? 'OK' : 'DEGRADED',
      message: ok ? 'HO_SO V2 health OK' : 'Degraded',
      payload: { findings: findings }
    });
  } catch (e) {
    findings.push({ check: 'cbv_health', issue: String(e && e.message ? e.message : e) });
  }

  return {
    ok: ok,
    code: ok ? 'HOSO_V2_HEALTH_OK' : 'HOSO_V2_HEALTH_ISSUES',
    message: ok ? 'OK' : 'See findings',
    data: { findings: findings, checkId: checkId },
    error: ok ? null : { code: 'HOSO_V2_HEALTH_ISSUES', message: 'Degraded' }
  };
}
