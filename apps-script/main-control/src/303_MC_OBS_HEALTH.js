/**
 * MAIN_CONTROL_OBS — Health Check.
 *
 * Public:
 * - MC_Obs_healthCheck()
 * - MC_Obs_healthCheckText()
 */

function MC_Obs_healthCheck() {
  try {
    var findings = [];

    function pushFinding_(severity, code, message, data) {
      findings.push({
        severity: String(severity || 'INFO').trim().toUpperCase(),
        code: String(code || '').trim(),
        message: message != null ? String(message) : '',
        data: data || {}
      });
    }

    // 0) Script properties presence (no hardcode).
    var props = null;
    try {
      props = PropertiesService.getScriptProperties();
    } catch (e0) {
      pushFinding_('BLOCKER', 'SCRIPT_PROPERTIES_UNAVAILABLE', 'Cannot access ScriptProperties', { error: String(e0 && e0.message ? e0.message : e0) });
      return MC_Obs_stdResponse_(false, 'MC_OBS_HEALTH_BLOCKER', 'ScriptProperties unavailable', { summary: { info: 0, warn: 0, error: 0, blocker: 1 }, findings: findings }, null);
    }

    var coreDbId = '';
    var configDbId = '';
    var mainUrl = '';
    var token = '';
    try { coreDbId = String(props.getProperty('CBV_CORE_DB_ID') || '').trim(); } catch (e1) { coreDbId = ''; }
    try { configDbId = String(props.getProperty('CBV_CONFIG_DB_ID') || '').trim(); } catch (e2) { configDbId = ''; }
    try { mainUrl = String(props.getProperty('CBV_MAIN_CONTROL_WEBAPP_URL') || '').trim(); } catch (e3) { mainUrl = ''; }
    try { token = String(props.getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim(); } catch (e4) { token = ''; }

    if (!coreDbId) pushFinding_('BLOCKER', 'CBV_CORE_DB_ID_MISSING', 'CBV_CORE_DB_ID missing', {});
    else pushFinding_('INFO', 'CBV_CORE_DB_ID_OK', 'CBV_CORE_DB_ID present', { configured: true });

    if (!configDbId) pushFinding_('WARN', 'CBV_CONFIG_DB_ID_MISSING', 'CBV_CONFIG_DB_ID missing', {});
    else pushFinding_('INFO', 'CBV_CONFIG_DB_ID_OK', 'CBV_CONFIG_DB_ID present', { configured: true });

    if (!mainUrl) pushFinding_('WARN', 'CBV_MAIN_CONTROL_WEBAPP_URL_MISSING', 'CBV_MAIN_CONTROL_WEBAPP_URL missing', {});
    else pushFinding_('INFO', 'CBV_MAIN_CONTROL_WEBAPP_URL_OK', 'CBV_MAIN_CONTROL_WEBAPP_URL present', { configured: true });

    if (!token) pushFinding_('BLOCKER', 'CBV_MAIN_WEBAPP_TOKEN_MISSING', 'CBV_MAIN_WEBAPP_TOKEN missing', {});
    else pushFinding_('INFO', 'CBV_MAIN_WEBAPP_TOKEN_OK', 'CBV_MAIN_WEBAPP_TOKEN present', { configured: true });

    // 1) Core DB open (strict).
    var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false, error: { code: 'NO_DB_OPEN', message: 'MC_Obs_openModuleDb_ missing', stack: '' } };
    if (!opened.ok) {
      pushFinding_('BLOCKER', 'CORE_DB_OPEN_FAILED', 'Core DB cannot be opened (strict by id)', { error: opened.error || null, coreDbId: opened.coreDbId || '' });
    } else {
      pushFinding_('INFO', 'CORE_DB_OPEN_OK', 'Core DB opened', { coreDbId: opened.coreDbId || '' });
    }

    // 2) OBS schema presence (sheets + headers).
    var schema = null;
    if (typeof MC_Obs_schemaReport === 'function') {
      try {
        schema = MC_Obs_schemaReport();
      } catch (e5) {
        schema = MC_Obs_stdResponse_(false, 'MC_OBS_SCHEMA_REPORT_EXCEPTION', String(e5 && e5.message ? e5.message : e5), {}, { code: 'EXCEPTION', message: String(e5 && e5.message ? e5.message : e5), stack: '' });
      }
      if (!schema || !schema.ok) {
        pushFinding_('ERROR', 'OBS_SCHEMA_REPORT_FAILED', 'OBS schema report failed', { result: schema || null });
      } else {
        var sheets = (schema.data && schema.data.sheets) ? schema.data.sheets : [];
        var missingAny = false;
        var i;
        for (i = 0; i < sheets.length; i++) {
          if (!sheets[i].exists || (sheets[i].missingHeaders && sheets[i].missingHeaders.length)) {
            missingAny = true;
            break;
          }
        }
        if (missingAny) pushFinding_('WARN', 'OBS_SCHEMA_INCOMPLETE', 'Some OBS sheets/headers missing', { sheets: sheets });
        else pushFinding_('INFO', 'OBS_SCHEMA_OK', 'OBS sheets/headers present', { sheetsCount: sheets.length });
      }
    } else {
      pushFinding_('ERROR', 'OBS_SCHEMA_REPORT_MISSING', 'MC_Obs_schemaReport not available', {});
    }

    // 3) Control plane schema presence.
    if (typeof MC_CONTROL_PLANE_SCHEMA_ === 'undefined') {
      pushFinding_('WARN', 'CONTROL_PLANE_SCHEMA_MISSING', 'MC_CONTROL_PLANE_SCHEMA_ not found (Phase A+B not loaded?)', {});
    } else {
      pushFinding_('INFO', 'CONTROL_PLANE_SCHEMA_PRESENT', 'MC_CONTROL_PLANE_SCHEMA_ present', {});
    }

    // 4) Connection package sheet existence.
    if (opened && opened.ok && opened.ss) {
      var shPkg = null;
      try { shPkg = opened.ss.getSheetByName('CBV_CONNECTION_PACKAGE'); } catch (e6) { shPkg = null; }
      if (!shPkg) pushFinding_('ERROR', 'CBV_CONNECTION_PACKAGE_MISSING', 'CBV_CONNECTION_PACKAGE sheet missing', {});
      else pushFinding_('INFO', 'CBV_CONNECTION_PACKAGE_OK', 'CBV_CONNECTION_PACKAGE sheet present', { headerCount: (typeof MC_Obs_getHeaders_ === 'function') ? MC_Obs_getHeaders_(shPkg).length : shPkg.getLastColumn() });
    }

    // 5) Module registry extended headers existence (Phase B extra).
    if (opened && opened.ok && opened.ss) {
      var shReg = null;
      try { shReg = opened.ss.getSheetByName('CBV_MODULE_REGISTRY'); } catch (e7) { shReg = null; }
      if (!shReg) {
        pushFinding_('ERROR', 'CBV_MODULE_REGISTRY_MISSING', 'CBV_MODULE_REGISTRY sheet missing', {});
      } else {
        var regHeaders = (typeof MC_Obs_getHeaders_ === 'function') ? MC_Obs_getHeaders_(shReg) : [];
        var need = ['MODULE_DB_ID', 'MODULE_WEBAPP_URL', 'ENV_CODE', 'UPDATED_BY', 'HEALTH_STATUS', 'LAST_HEALTH_AT', 'NOTE'];
        var set = {};
        var j;
        for (j = 0; j < regHeaders.length; j++) set[String(regHeaders[j] || '').trim()] = true;
        var missing = [];
        for (j = 0; j < need.length; j++) if (!set[need[j]]) missing.push(need[j]);
        if (missing.length) pushFinding_('WARN', 'MODULE_REGISTRY_HEADERS_MISSING', 'CBV_MODULE_REGISTRY missing extended headers', { missingHeaders: missing });
        else pushFinding_('INFO', 'MODULE_REGISTRY_HEADERS_OK', 'CBV_MODULE_REGISTRY extended headers present', {});
      }
    }

    // 6) WebApp action contract (static check is limited at runtime).
    pushFinding_('INFO', 'WEBAPP_ACTIONS_CHECK_LIMITED', 'Cannot reliably verify WebApp action routing at runtime; verify manually in 200_MAIN_CONTROL_WEBAPP.js', {
      requiredActions: ['GET_CONNECTION_PACKAGE', 'REGISTER_MODULE', 'INGEST_EVENT', 'HEALTH_CHECK']
    });

    // Summarize.
    var summary = { info: 0, warn: 0, error: 0, blocker: 0 };
    var k;
    for (k = 0; k < findings.length; k++) {
      var s = String(findings[k].severity || '').toUpperCase();
      if (s === 'BLOCKER') summary.blocker++;
      else if (s === 'ERROR') summary.error++;
      else if (s === 'WARN' || s === 'WARNING') summary.warn++;
      else summary.info++;
    }

    var ok = summary.blocker === 0 && summary.error === 0;
    var code = ok ? 'MC_OBS_HEALTH_OK' : (summary.blocker > 0 ? 'MC_OBS_HEALTH_BLOCKER' : 'MC_OBS_HEALTH_WARN');
    var msg = ok ? 'OK' : (summary.blocker > 0 ? 'BLOCKER findings present' : 'Warnings/errors present');

    var res = MC_Obs_stdResponse_(ok, code, msg, { summary: summary, findings: findings }, null);

    // Best-effort health row write.
    try {
      if (typeof MC_Obs_appendHealth === 'function') {
        MC_Obs_appendHealth({
          CHECK_CODE: 'OBS_HEALTH_CHECK',
          STATUS: ok ? 'OK' : (summary.blocker > 0 ? 'BLOCKER' : 'WARN'),
          SEVERITY: ok ? 'OK' : (summary.blocker > 0 ? 'BLOCKER' : 'WARN'),
          MESSAGE: msg,
          DATA_JSON: { summary: summary, findings: findings }
        });
      }
    } catch (wErr) {
      /* swallow */
    }

    return res;
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_HEALTH_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_healthCheckText() {
  try {
    var r = MC_Obs_healthCheck();
    var lines = [];
    lines.push('code=' + String(r && r.code ? r.code : ''));
    try {
      var s = r && r.data && r.data.summary ? r.data.summary : null;
      if (s) lines.push('summary: info=' + s.info + ' warn=' + s.warn + ' error=' + s.error + ' blocker=' + s.blocker);
    } catch (e0) {
      /* ignore */
    }
    try {
      var f = r && r.data && r.data.findings ? r.data.findings : [];
      var i;
      for (i = 0; i < f.length; i++) {
        lines.push('- [' + f[i].severity + '] ' + f[i].code + ' ' + f[i].message);
      }
    } catch (e1) {
      /* ignore */
    }
    return lines.join('\n');
  } catch (e) {
    return 'MC_Obs_healthCheckText error: ' + String(e && e.message ? e.message : e);
  }
}

