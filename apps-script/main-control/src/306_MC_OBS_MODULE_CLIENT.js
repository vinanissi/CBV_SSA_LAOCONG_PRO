/**
 * MAIN_CONTROL_OBS — Module Client (Phase 1: safe stubs).
 *
 * Public:
 * - MC_Obs_pullModuleSummary(moduleCode)
 * - MC_Obs_pullRegisteredModulesSummary()
 * - MC_Obs_emitFindingToSelf(finding)
 */

function MC_Obs_pullModuleSummary(moduleCode) {
  // Phase 1: NO network calls. Only returns lightweight registry info if available.
  try {
    var mod = String(moduleCode || '').trim().toUpperCase();
    if (!mod) return MC_Obs_stdResponse_(false, 'MC_OBS_MODULE_CODE_MISSING', 'moduleCode missing', {}, { code: 'VALIDATION_ERROR', message: 'moduleCode missing', stack: '' });

    var reg = MC_Obs_readRegistryRows_();
    if (!reg.ok) return MC_Obs_stdResponse_(true, 'MC_OBS_MODULE_SUMMARY_SKIPPED', 'Registry not available (skipped)', { skipped: true, reason: reg.message || '', moduleCode: mod }, null);

    var row = MC_Obs_findRegistryRowByModuleCode_(reg.rows, mod);
    if (!row) return MC_Obs_stdResponse_(true, 'MC_OBS_MODULE_SUMMARY_NOT_FOUND', 'Module not found in registry', { moduleCode: mod, found: false }, null);

    return MC_Obs_stdResponse_(true, 'MC_OBS_MODULE_SUMMARY_OK', 'OK', {
      moduleCode: mod,
      found: true,
      summary: {
        MODULE_CODE: row.MODULE_CODE || mod,
        MODULE_DB_ID: row.MODULE_DB_ID || '',
        MODULE_WEBAPP_URL: row.MODULE_WEBAPP_URL || '',
        ENV_CODE: row.ENV_CODE || '',
        HEALTH_STATUS: row.HEALTH_STATUS || '',
        LAST_HEALTH_AT: row.LAST_HEALTH_AT || '',
        NOTE: row.NOTE || ''
      },
      phase: 'PHASE_1_STUB_NO_NETWORK'
    }, null);
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_MODULE_SUMMARY_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_pullRegisteredModulesSummary() {
  // Phase 1: NO network calls. Return a compact list from registry sheet.
  try {
    var reg = MC_Obs_readRegistryRows_();
    if (!reg.ok) return MC_Obs_stdResponse_(true, 'MC_OBS_REGISTRY_SUMMARY_SKIPPED', 'Registry not available (skipped)', { skipped: true, reason: reg.message || '' }, null);

    var out = [];
    var rows = reg.rows || [];
    var i;
    for (i = 0; i < rows.length; i++) {
      var r = rows[i] || {};
      var code = String(r.MODULE_CODE || '').trim().toUpperCase();
      if (!code) continue;
      out.push({
        MODULE_CODE: code,
        MODULE_DB_ID: r.MODULE_DB_ID || '',
        MODULE_WEBAPP_URL: r.MODULE_WEBAPP_URL || '',
        ENV_CODE: r.ENV_CODE || '',
        HEALTH_STATUS: r.HEALTH_STATUS || '',
        LAST_HEALTH_AT: r.LAST_HEALTH_AT || ''
      });
    }

    return MC_Obs_stdResponse_(true, 'MC_OBS_REGISTRY_SUMMARY_OK', 'OK', { total: out.length, modules: out, phase: 'PHASE_1_STUB_NO_NETWORK' }, null);
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_REGISTRY_SUMMARY_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_emitFindingToSelf(finding) {
  // Write a finding into MC_OBS_FINDING (safe, no throw).
  try {
    if (typeof MC_Obs_appendFinding !== 'function') {
      return MC_Obs_stdResponse_(true, 'MC_OBS_FINDING_WRITE_SKIPPED', 'MC_Obs_appendFinding not available (skipped)', { skipped: true }, null);
    }
    var f = finding || {};
    var payload = {
      RUN_ID: f.RUN_ID || '',
      SOURCE_TYPE: f.SOURCE_TYPE || 'MODULE_CLIENT',
      SOURCE_CODE: f.SOURCE_CODE || 'EMIT_FINDING_TO_SELF',
      SEVERITY: f.SEVERITY || 'WARN',
      STATUS: f.STATUS || 'OPEN',
      MESSAGE: f.MESSAGE || 'Finding emitted to self',
      ACTION_REQUIRED: f.ACTION_REQUIRED || 'Review',
      OWNER: f.OWNER || (typeof MC_Obs_user_ === 'function' ? MC_Obs_user_() : 'SYSTEM'),
      IS_RESOLVED: f.IS_RESOLVED || 'FALSE',
      RESOLVED_AT: f.RESOLVED_AT || '',
      RESOLVED_BY: f.RESOLVED_BY || '',
      DATA_JSON: f.DATA_JSON || f.data || {},
      NOTE: f.NOTE || ''
    };
    var r = MC_Obs_appendFinding(payload);
    return MC_Obs_stdResponse_(true, 'MC_OBS_FINDING_EMITTED', 'OK', { appendResult: r }, null);
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_FINDING_EMIT_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

// -------- private helpers --------

function MC_Obs_readRegistryRows_() {
  try {
    if (typeof MC_Obs_openModuleDb_ !== 'function') return { ok: false, message: 'MC_Obs_openModuleDb_ missing', rows: [] };
    var o = MC_Obs_openModuleDb_();
    if (!o.ok) return { ok: false, message: 'Core DB not available', rows: [] };
    var ss = o.ss;
    var sh = null;
    try { sh = ss.getSheetByName('CBV_MODULE_REGISTRY'); } catch (e0) { sh = null; }
    if (!sh) return { ok: false, message: 'CBV_MODULE_REGISTRY missing', rows: [] };

    var lastRow = sh.getLastRow();
    if (lastRow < 2) return { ok: true, message: 'empty', rows: [] };

    var map = null;
    try { if (typeof cbvCoreV2ReadHeaderMap_ === 'function') map = cbvCoreV2ReadHeaderMap_(sh); } catch (e1) { map = null; }
    if (!map) {
      map = {};
      var headers = (typeof MC_Obs_getHeaders_ === 'function') ? MC_Obs_getHeaders_(sh) : [];
      var i;
      for (i = 0; i < headers.length; i++) map[String(headers[i] || '').trim()] = i + 1;
    }

    var cols = sh.getLastColumn();
    var values = sh.getRange(2, 1, lastRow - 1, cols).getValues();

    var colToHeader = [];
    var k;
    for (k in map) {
      if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
      var c = Number(map[k]);
      if (c > 0) colToHeader[c] = k;
    }

    var rows = [];
    var r;
    for (r = 0; r < values.length; r++) {
      var row = values[r] || [];
      var obj = {};
      var c2;
      for (c2 = 1; c2 <= cols; c2++) {
        var h = colToHeader[c2];
        if (!h) continue;
        obj[h] = row[c2 - 1];
      }
      rows.push(obj);
    }
    return { ok: true, message: 'OK', rows: rows };
  } catch (e) {
    return { ok: false, message: String(e && e.message ? e.message : e), rows: [] };
  }
}

function MC_Obs_findRegistryRowByModuleCode_(rows, moduleCode) {
  var want = String(moduleCode || '').trim().toUpperCase();
  var r = rows || [];
  var i;
  for (i = 0; i < r.length; i++) {
    var code = String(r[i] && r[i].MODULE_CODE ? r[i].MODULE_CODE : '').trim().toUpperCase();
    if (code === want) return r[i];
  }
  return null;
}

