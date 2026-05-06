/**
 * MAIN_CONTROL Control Plane — Health & Diagnostics (Phase A).
 *
 * Public:
 * - MC_healthControlPlane()
 * - MC_healthControlPlaneText()
 * - MC_diagnosticsControlPlane()
 *
 * Private:
 * - MC_healthAddFinding_(...)
 * - MC_healthCheckScriptProperties_()
 * - MC_healthCheckCoreDb_()
 * - MC_healthCheckSheets_()
 * - MC_healthCheckRegistrySchema_()
 * - MC_healthCheckConnectionPackageSheet_()
 * - MC_healthCheckDangerousFallbacks_()
 */

function MC_healthAddFinding_(findings, severity, code, message, data) {
  findings.push({
    severity: String(severity || 'INFO').trim().toUpperCase(),
    code: String(code || '').trim(),
    message: message != null ? String(message) : '',
    data: data || {}
  });
}

function MC_healthCheckScriptProperties_() {
  var findings = [];
  var props = null;
  try {
    props = PropertiesService.getScriptProperties();
  } catch (e0) {
    MC_healthAddFinding_(findings, 'BLOCKER', 'SCRIPT_PROPERTIES_UNAVAILABLE', 'Cannot access ScriptProperties', { error: String(e0 && e0.message ? e0.message : e0) });
    return { findings: findings };
  }

  var coreDbId = String(props.getProperty('CBV_CORE_DB_ID') || '').trim();
  var configDbId = String(props.getProperty('CBV_CONFIG_DB_ID') || '').trim();
  var mainUrl = String(props.getProperty('CBV_MAIN_CONTROL_WEBAPP_URL') || '').trim();
  var token = String(props.getProperty('CBV_MAIN_WEBAPP_TOKEN') || '').trim();

  if (!coreDbId) MC_healthAddFinding_(findings, 'BLOCKER', 'CBV_CORE_DB_ID_MISSING', 'CBV_CORE_DB_ID missing', {});
  else MC_healthAddFinding_(findings, 'INFO', 'CBV_CORE_DB_ID_OK', 'CBV_CORE_DB_ID present', { coreDbId: coreDbId });

  if (!configDbId) MC_healthAddFinding_(findings, 'WARN', 'CBV_CONFIG_DB_ID_MISSING', 'CBV_CONFIG_DB_ID missing', {});
  else MC_healthAddFinding_(findings, 'INFO', 'CBV_CONFIG_DB_ID_OK', 'CBV_CONFIG_DB_ID present', { configDbId: configDbId });

  if (!mainUrl) MC_healthAddFinding_(findings, 'WARN', 'MAIN_CONTROL_WEBAPP_URL_MISSING', 'CBV_MAIN_CONTROL_WEBAPP_URL missing (fallback to ScriptApp.getService().getUrl may work)', {});
  else MC_healthAddFinding_(findings, 'INFO', 'MAIN_CONTROL_WEBAPP_URL_OK', 'CBV_MAIN_CONTROL_WEBAPP_URL present', { mainControlWebAppUrl: mainUrl });

  if (!token) MC_healthAddFinding_(findings, 'BLOCKER', 'CBV_MAIN_WEBAPP_TOKEN_MISSING', 'CBV_MAIN_WEBAPP_TOKEN missing (WebApp token gate cannot work)', {});
  else MC_healthAddFinding_(findings, 'INFO', 'CBV_MAIN_WEBAPP_TOKEN_OK', 'CBV_MAIN_WEBAPP_TOKEN present', { configured: true });

  return { findings: findings, coreDbId: coreDbId, configDbId: configDbId, mainControlWebAppUrl: mainUrl, hasToken: !!token };
}

function MC_healthCheckCoreDb_() {
  var findings = [];
  var opened = (typeof MC_schemaOpenCoreDb_ === 'function') ? MC_schemaOpenCoreDb_() : { ok: false, error: { code: 'NO_SCHEMA_OPEN', message: 'MC_schemaOpenCoreDb_ missing', stack: '' } };
  if (!opened.ok) {
    MC_healthAddFinding_(findings, 'BLOCKER', 'CORE_DB_OPEN_FAILED', 'Core DB cannot be opened (strict by id)', { error: opened.error || null, coreDbId: opened.coreDbId || '' });
    return { findings: findings, ss: null, coreDbId: opened.coreDbId || '' };
  }
  MC_healthAddFinding_(findings, 'INFO', 'CORE_DB_OPEN_OK', 'Core DB opened', { coreDbId: opened.coreDbId });
  return { findings: findings, ss: opened.ss, coreDbId: opened.coreDbId };
}

function MC_healthCheckSheets_(ss) {
  var findings = [];
  if (!ss) {
    MC_healthAddFinding_(findings, 'BLOCKER', 'CORE_DB_NULL', 'Core DB is null', {});
    return { findings: findings };
  }

  var required = [
    'CBV_MODULE_REGISTRY',
    'CBV_EVENT_QUEUE',
    'CBV_EVENT_LOG',
    'CBV_COMMAND_LOG',
    'CBV_AUDIT_LOG',
    'CBV_IDEMPOTENCY',
    'CBV_SYSTEM_HEALTH',
    'CBV_CONNECTION_PACKAGE'
  ];
  var i;
  for (i = 0; i < required.length; i++) {
    var name = required[i];
    var sh = null;
    try {
      sh = ss.getSheetByName(name);
    } catch (e0) {
      sh = null;
    }
    if (!sh) MC_healthAddFinding_(findings, 'ERROR', 'SHEET_MISSING', 'Sheet missing: ' + name, { sheetName: name });
    else MC_healthAddFinding_(findings, 'INFO', 'SHEET_OK', 'Sheet present: ' + name, { sheetName: name });
  }
  return { findings: findings };
}

function MC_healthCheckRegistrySchema_(ss) {
  var findings = [];
  if (!ss) return { findings: findings };
  var sh = null;
  try {
    sh = ss.getSheetByName('CBV_MODULE_REGISTRY');
  } catch (e0) {
    sh = null;
  }
  if (!sh) {
    MC_healthAddFinding_(findings, 'ERROR', 'REGISTRY_SHEET_MISSING', 'CBV_MODULE_REGISTRY missing', {});
    return { findings: findings };
  }
  var existing = (typeof MC_schemaGetHeaders_ === 'function') ? MC_schemaGetHeaders_(sh) : [];
  var required = [
    'MODULE_DB_ID',
    'MODULE_WEBAPP_URL',
    'ENV_CODE',
    'UPDATED_BY',
    'HEALTH_STATUS',
    'LAST_HEALTH_AT',
    'NOTE'
  ];
  var missing = (typeof MC_schemaFindMissingHeaders_ === 'function') ? MC_schemaFindMissingHeaders_(existing, required) : required;
  if (missing.length) {
    MC_healthAddFinding_(findings, 'WARN', 'REGISTRY_EXTRA_HEADERS_MISSING', 'Module registry missing extra headers (Phase B add-only)', { missingHeaders: missing });
  } else {
    MC_healthAddFinding_(findings, 'INFO', 'REGISTRY_EXTRA_HEADERS_OK', 'Module registry has extra headers', {});
  }
  return { findings: findings };
}

function MC_healthCheckConnectionPackageSheet_(ss) {
  var findings = [];
  if (!ss) return { findings: findings };
  var sh = null;
  try {
    sh = ss.getSheetByName('CBV_CONNECTION_PACKAGE');
  } catch (e0) {
    sh = null;
  }
  if (!sh) {
    MC_healthAddFinding_(findings, 'ERROR', 'CONNECTION_PACKAGE_SHEET_MISSING', 'CBV_CONNECTION_PACKAGE missing', {});
    return { findings: findings };
  }
  var headers = (typeof MC_schemaGetHeaders_ === 'function') ? MC_schemaGetHeaders_(sh) : [];
  if (headers.length < 5) {
    MC_healthAddFinding_(findings, 'WARN', 'CONNECTION_PACKAGE_HEADERS_SUSPECT', 'CBV_CONNECTION_PACKAGE headers look empty/suspect', { headerCount: headers.length });
  } else {
    MC_healthAddFinding_(findings, 'INFO', 'CONNECTION_PACKAGE_SHEET_OK', 'CBV_CONNECTION_PACKAGE present', { headerCount: headers.length });
  }
  return { findings: findings };
}

function MC_healthCheckDangerousFallbacks_() {
  var findings = [];
  // Detect if core open helper would fall back to ActiveSpreadsheet (danger).
  if (typeof cbvCoreV2OpenCoreSpreadsheet_ === 'function') {
    var coreDbId = '';
    try {
      coreDbId = String(PropertiesService.getScriptProperties().getProperty('CBV_CORE_DB_ID') || '').trim();
    } catch (e0) {
      coreDbId = '';
    }
    if (!coreDbId) {
      MC_healthAddFinding_(findings, 'ERROR', 'DANGEROUS_FALLBACK_ACTIVE_SPREADSHEET', 'CBV_CORE_DB_ID missing; core resolver may fall back to ActiveSpreadsheet', {});
    }
  }

  // Detect moduleDbId fallback from ScriptProperties used by legacy MC_getConnectionPackage_.
  // We cannot enumerate all module codes safely; detect presence of suspicious keys.
  try {
    var props = PropertiesService.getScriptProperties().getProperties();
    var k;
    var hits = [];
    for (k in props) {
      if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
      if (/^CBV_[A-Z0-9_]+_DB_ID$/.test(k) && k !== 'CBV_CORE_DB_ID' && k !== 'CBV_CONFIG_DB_ID') {
        hits.push(k);
      }
    }
    if (hits.length) {
      MC_healthAddFinding_(findings, 'WARN', 'MODULE_DB_ID_FALLBACK_PROPS_PRESENT', 'Module DB IDs exist in ScriptProperties (legacy fallback path active-capable)', { keys: hits.slice(0, 20), total: hits.length });
    } else {
      MC_healthAddFinding_(findings, 'INFO', 'MODULE_DB_ID_FALLBACK_PROPS_NONE', 'No module-specific *_DB_ID props detected', {});
    }
  } catch (e1) {
    MC_healthAddFinding_(findings, 'INFO', 'MODULE_DB_ID_FALLBACK_PROPS_SCAN_FAILED', 'Could not scan ScriptProperties for module DB fallback keys', { error: String(e1 && e1.message ? e1.message : e1) });
  }

  // Manifest access warning: runtime cannot reliably read appsscript.json; report best-effort.
  MC_healthAddFinding_(findings, 'INFO', 'MANIFEST_READ_UNAVAILABLE', 'WebApp access (ANYONE_ANONYMOUS) cannot be verified at runtime; verify in appsscript.json', {});

  return { findings: findings };
}

function MC_healthControlPlane() {
  var findings = [];

  var sp = MC_healthCheckScriptProperties_();
  findings = findings.concat(sp.findings || []);

  var core = MC_healthCheckCoreDb_();
  findings = findings.concat(core.findings || []);

  var sh = MC_healthCheckSheets_(core.ss);
  findings = findings.concat(sh.findings || []);

  var reg = MC_healthCheckRegistrySchema_(core.ss);
  findings = findings.concat(reg.findings || []);

  var pkg = MC_healthCheckConnectionPackageSheet_(core.ss);
  findings = findings.concat(pkg.findings || []);

  var fb = MC_healthCheckDangerousFallbacks_();
  findings = findings.concat(fb.findings || []);

  // Summarize.
  var summary = { totalFindings: findings.length, info: 0, warn: 0, error: 0, blocker: 0 };
  var i;
  for (i = 0; i < findings.length; i++) {
    var s = String(findings[i].severity || '').toUpperCase();
    if (s === 'BLOCKER') summary.blocker++;
    else if (s === 'ERROR') summary.error++;
    else if (s === 'WARN' || s === 'WARNING') summary.warn++;
    else summary.info++;
  }

  var ok = summary.blocker === 0 && summary.error === 0;
  var code = ok ? 'MAIN_CONTROL_HEALTH_OK' : (summary.blocker > 0 ? 'MAIN_CONTROL_HEALTH_BLOCKER' : 'MAIN_CONTROL_HEALTH_WARN');
  var msg = ok ? 'OK' : (summary.blocker > 0 ? 'BLOCKER findings present' : 'Warnings/errors present');

  return MC_cpStdResponse_(ok, code, msg, { summary: summary, findings: findings }, null);
}

function MC_healthControlPlaneText() {
  var r = MC_healthControlPlane();
  var lines = [];
  lines.push('code=' + String(r.code || ''));
  try {
    var s = r && r.data && r.data.summary ? r.data.summary : null;
    if (s) lines.push('summary: total=' + s.totalFindings + ' info=' + s.info + ' warn=' + s.warn + ' error=' + s.error + ' blocker=' + s.blocker);
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
}

function MC_diagnosticsControlPlane() {
  // Alias-style convenience wrapper (kept separate for future expansion).
  return MC_healthControlPlane();
}

