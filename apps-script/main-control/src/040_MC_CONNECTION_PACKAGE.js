/**
 * MAIN_CONTROL Control Plane — Connection Package store/issue (Phase B).
 *
 * Design goals:
 * - Add-only authority storage on Core DB sheet CBV_CONNECTION_PACKAGE
 * - Do NOT break legacy MC_getConnectionPackage_ contract
 * - Never throw for store failures; return warnings
 *
 * Public:
 * - MC_issueConnectionPackage(moduleCode, options)
 * - MC_storeConnectionPackage(packageObj)
 * - MC_getStoredConnectionPackages(moduleCode)
 *
 * Private:
 * - MC_buildConnectionPackage_(moduleCode, options)
 * - MC_packageNormalizeModuleCode_(moduleCode)
 * - MC_packageMakeId_()
 * - MC_packageResolveModuleDbId_(moduleCode)
 * - MC_packageResolveModuleWebAppUrl_(moduleCode)
 * - MC_packageResolveCoreDbId_()
 * - MC_packageResolveConfigDbId_()
 * - MC_packageResolveMainControlWebAppUrl_()
 * - MC_packageAppendRow_(packageObj)
 */

function MC_packageNormalizeModuleCode_(moduleCode) {
  var mod = String(moduleCode || '').trim().toUpperCase();
  if (!mod) mod = 'HO_SO_V2';
  if (mod === 'HO_SO' || mod === 'HOSO') mod = 'HO_SO_V2';
  return mod;
}

function MC_packageMakeId_() {
  if (typeof MC_uuid_ === 'function') return MC_uuid_('PKG');
  try {
    return 'PKG_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
  } catch (e) {
    return 'PKG_' + String(new Date().getTime());
  }
}

function MC_packageResolveCoreDbId_() {
  try {
    var v = String(PropertiesService.getScriptProperties().getProperty('CBV_CORE_DB_ID') || '').trim();
    if (v) return v;
  } catch (e1) {
    /* ignore */
  }
  if (typeof cbvCoreV2GetCoreDbId_ === 'function') {
    try {
      return String(cbvCoreV2GetCoreDbId_() || '').trim();
    } catch (e2) {
      return '';
    }
  }
  return '';
}

function MC_packageResolveConfigDbId_() {
  try {
    return String(PropertiesService.getScriptProperties().getProperty('CBV_CONFIG_DB_ID') || '').trim();
  } catch (e) {
    return '';
  }
}

function MC_packageResolveMainControlWebAppUrl_() {
  if (typeof MC_getMainWebAppUrl_ === 'function') {
    try {
      return String(MC_getMainWebAppUrl_() || '').trim();
    } catch (e0) {
      /* ignore */
    }
  }
  try {
    var u = String(PropertiesService.getScriptProperties().getProperty('CBV_MAIN_CONTROL_WEBAPP_URL') || '').trim();
    if (u) return u;
  } catch (e1) {
    /* ignore */
  }
  try {
    var svc = ScriptApp.getService();
    if (svc) return String(svc.getUrl() || '').trim();
  } catch (e2) {
    /* ignore */
  }
  return '';
}

function MC_packageResolveModuleDbId_(moduleCode) {
  var mod = MC_packageNormalizeModuleCode_(moduleCode);
  if (typeof MC_lookupModuleDbIdFromRegistry_ === 'function') {
    try {
      var v1 = String(MC_lookupModuleDbIdFromRegistry_(mod) || '').trim();
      if (v1) return v1;
    } catch (e0) {
      /* ignore */
    }
  }
  // Backward-compatible fallback (dangerous, but keep).
  if (typeof MC_lookupModuleDbIdFromScriptProps_ === 'function') {
    try {
      return String(MC_lookupModuleDbIdFromScriptProps_(mod) || '').trim();
    } catch (e1) {
      return '';
    }
  }
  return '';
}

function MC_packageResolveModuleWebAppUrl_(moduleCode) {
  // Phase B: optional. If registry has MODULE_WEBAPP_URL in future, can use it.
  // For now, keep empty to avoid wrong assumptions.
  return '';
}

function MC_buildConnectionPackage_(moduleCode, options) {
  var opts = options || {};
  var mod = MC_packageNormalizeModuleCode_(moduleCode);

  var nowIso = '';
  try {
    nowIso = typeof MC_now_ === 'function' ? MC_now_() : new Date().toISOString();
  } catch (e0) {
    nowIso = String(new Date());
  }

  var expiresIso = '';
  try {
    var expHours = Number(opts.expiresInHours || 24);
    if (!(expHours > 0)) expHours = 24;
    var exp = new Date();
    exp.setHours(exp.getHours() + expHours);
    expiresIso = exp.toISOString();
  } catch (e1) {
    expiresIso = '';
  }

  var envCode = String(opts.envCode || 'PROD').trim().toUpperCase();
  var moduleName = String(opts.moduleName || mod).trim();
  var version = String(opts.version || '1.0.0').trim();

  var moduleDbId = MC_packageResolveModuleDbId_(mod);
  var moduleWebAppUrl = MC_packageResolveModuleWebAppUrl_(mod);
  var coreDbId = MC_packageResolveCoreDbId_();
  var configDbId = MC_packageResolveConfigDbId_();
  var mainControlWebAppUrl = MC_packageResolveMainControlWebAppUrl_();

  var warnings = [];
  if (!moduleDbId) warnings.push('MODULE_DB_ID_EMPTY');
  if (!coreDbId) warnings.push('CORE_DB_ID_EMPTY');
  if (!configDbId) warnings.push('CONFIG_DB_ID_EMPTY');
  if (!mainControlWebAppUrl) warnings.push('MAIN_CONTROL_WEBAPP_URL_EMPTY');

  var pkg = {
    packageId: MC_packageMakeId_(),
    moduleCode: mod,
    moduleName: moduleName,
    envCode: envCode,
    moduleDbId: moduleDbId,
    moduleWebAppUrl: moduleWebAppUrl,
    mainControlWebAppUrl: mainControlWebAppUrl,
    configDbId: configDbId,
    coreDbId: coreDbId,
    version: version,
    issuedAt: nowIso,
    expiresAt: expiresIso,
    status: 'ACTIVE'
  };

  return { packageObj: pkg, warnings: warnings };
}

function MC_packageAppendRow_(packageObj) {
  var opened = (typeof MC_schemaOpenCoreDb_ === 'function') ? MC_schemaOpenCoreDb_() : { ok: false, error: { code: 'NO_SCHEMA_OPEN', message: 'MC_schemaOpenCoreDb_ missing', stack: '' } };
  if (!opened.ok) {
    return { ok: false, code: 'CORE_DB_NOT_AVAILABLE', message: 'Core DB not available', error: opened.error || null };
  }
  var ss = opened.ss;
  var sheetName = 'CBV_CONNECTION_PACKAGE';
  var sh = null;
  try {
    sh = ss.getSheetByName(sheetName);
  } catch (e0) {
    sh = null;
  }
  if (!sh) {
    return { ok: false, code: 'SHEET_MISSING', message: 'CBV_CONNECTION_PACKAGE missing (run schema ensure)', error: { code: 'SHEET_MISSING', message: sheetName, stack: '' } };
  }

  var headers = null;
  if (MC_CONTROL_PLANE_SCHEMA_ && MC_CONTROL_PLANE_SCHEMA_.sheets && MC_CONTROL_PLANE_SCHEMA_.sheets.CBV_CONNECTION_PACKAGE) {
    headers = MC_CONTROL_PLANE_SCHEMA_.sheets.CBV_CONNECTION_PACKAGE.requiredHeaders;
  }
  if (!headers || !headers.length) {
    return { ok: false, code: 'SCHEMA_HEADERS_MISSING', message: 'Connection package headers not available', error: { code: 'SCHEMA_HEADERS_MISSING', message: 'MC_CONTROL_PLANE_SCHEMA_.CBV_CONNECTION_PACKAGE', stack: '' } };
  }

  // Ensure headers add-only before appending.
  var ensured = MC_schemaEnsureHeaders_(sh, headers);
  if (!ensured.ok) {
    return { ok: false, code: 'ENSURE_HEADERS_FAILED', message: 'Failed to ensure headers', error: ensured.error || null };
  }

  var nowIso = '';
  try {
    nowIso = typeof MC_now_ === 'function' ? MC_now_() : new Date().toISOString();
  } catch (e1) {
    nowIso = String(new Date());
  }

  var actor = '';
  try {
    actor = String(Session.getActiveUser().getEmail() || '').trim();
  } catch (e2) {
    actor = '';
  }
  if (!actor) actor = 'SYSTEM';

  var pkgJson = '';
  try {
    pkgJson = (typeof MC_json_ === 'function') ? MC_json_(packageObj) : JSON.stringify(packageObj);
  } catch (e3) {
    pkgJson = '{}';
  }

  var row = {
    PACKAGE_ID: String(packageObj.packageId || '').trim(),
    MODULE_CODE: String(packageObj.moduleCode || '').trim(),
    MODULE_NAME: String(packageObj.moduleName || '').trim(),
    ENV_CODE: String(packageObj.envCode || '').trim(),
    MODULE_DB_ID: String(packageObj.moduleDbId || '').trim(),
    MODULE_WEBAPP_URL: String(packageObj.moduleWebAppUrl || '').trim(),
    MAIN_CONTROL_WEBAPP_URL: String(packageObj.mainControlWebAppUrl || '').trim(),
    CONFIG_DB_ID: String(packageObj.configDbId || '').trim(),
    CORE_DB_ID: String(packageObj.coreDbId || '').trim(),
    VERSION: String(packageObj.version || '').trim(),
    STATUS: String(packageObj.status || '').trim(),
    ISSUED_AT: String(packageObj.issuedAt || '').trim(),
    EXPIRES_AT: String(packageObj.expiresAt || '').trim(),
    PACKAGE_JSON: pkgJson,
    CREATED_AT: nowIso,
    UPDATED_AT: nowIso,
    CREATED_BY: actor,
    NOTE: ''
  };

  // Append row safely using core helper when available; else best-effort append.
  try {
    if (typeof cbvCoreV2AppendRowByHeaders_ === 'function') {
      cbvCoreV2AppendRowByHeaders_(sh, row);
      return { ok: true, code: 'PACKAGE_STORED', message: 'Stored', data: { sheetName: sheetName } };
    }
  } catch (e4) {
    // fall through
  }

  try {
    var existing = MC_schemaGetHeaders_(sh);
    var out = [];
    var i;
    for (i = 0; i < existing.length; i++) {
      var h = String(existing[i] || '').trim();
      out.push(row[h] != null ? row[h] : '');
    }
    sh.appendRow(out);
    return { ok: true, code: 'PACKAGE_STORED', message: 'Stored', data: { sheetName: sheetName } };
  } catch (e5) {
    return { ok: false, code: 'PACKAGE_STORE_FAILED', message: String(e5 && e5.message ? e5.message : e5), error: { code: 'PACKAGE_STORE_FAILED', message: String(e5 && e5.message ? e5.message : e5), stack: '' } };
  }
}

function MC_storeConnectionPackage(packageObj) {
  var lock = null;
  try {
    lock = LockService.getDocumentLock();
  } catch (e0) {
    lock = null;
  }
  var locked = false;
  try {
    if (lock) locked = lock.tryLock(15000);
  } catch (e1) {
    locked = false;
  }

  var r = MC_packageAppendRow_(packageObj || {});

  try {
    if (locked && lock) lock.releaseLock();
  } catch (eRel) {
    /* ignore */
  }

  return MC_cpStdResponse_(
    !!r.ok,
    r.ok ? 'MAIN_CONTROL_PACKAGE_STORE_OK' : 'MAIN_CONTROL_PACKAGE_STORE_WARN',
    r.ok ? 'OK' : 'Store failed (non-blocking)',
    { result: r, packageId: packageObj && packageObj.packageId ? packageObj.packageId : '' },
    r.ok ? null : (r.error || null)
  );
}

function MC_issueConnectionPackage(moduleCode, options) {
  var built = MC_buildConnectionPackage_(moduleCode, options || {});
  var pkg = built.packageObj;
  var warnings = built.warnings || [];

  var store = null;
  try {
    store = MC_storeConnectionPackage(pkg);
  } catch (e) {
    store = MC_cpStdResponse_(false, 'MAIN_CONTROL_PACKAGE_STORE_WARN', 'Store failed (exception)', {}, { code: 'STORE_EXCEPTION', message: String(e && e.message ? e.message : e), stack: '' });
  }
  if (!store || !store.ok) {
    warnings.push('STORE_FAILED');
  }

  // Backward compatibility (legacy WebApp expects data.package.coreDbId/configDbId/moduleDbId/...).
  var legacyShape = {
    coreDbId: String(pkg.coreDbId || '').trim(),
    configDbId: String(pkg.configDbId || '').trim(),
    moduleDbId: String(pkg.moduleDbId || '').trim(),
    moduleCode: String(pkg.moduleCode || '').trim(),
    mainControlWebAppUrl: String(pkg.mainControlWebAppUrl || '').trim(),
    version: String(pkg.version || '').trim()
  };

  var data = {
    moduleCode: pkg.moduleCode,
    issuedAt: pkg.issuedAt,
    expiresAt: pkg.expiresAt,
    package: legacyShape,
    controlPlane: {
      packageId: pkg.packageId,
      envCode: pkg.envCode,
      status: pkg.status,
      moduleName: pkg.moduleName,
      moduleWebAppUrl: pkg.moduleWebAppUrl,
      stored: !!(store && store.ok)
    }
  };
  if (warnings.length) data.warning = warnings.join(',');

  return MC_cpStdResponse_(
    true,
    'MAIN_CONTROL_CONNECTION_PACKAGE_ISSUED',
    warnings.length ? 'OK (see warning)' : 'OK',
    data,
    null
  );
}

function MC_getStoredConnectionPackages(moduleCode) {
  var mod = MC_packageNormalizeModuleCode_(moduleCode);
  var opened = (typeof MC_schemaOpenCoreDb_ === 'function') ? MC_schemaOpenCoreDb_() : { ok: false, error: { code: 'NO_SCHEMA_OPEN', message: 'MC_schemaOpenCoreDb_ missing', stack: '' } };
  if (!opened.ok) {
    return MC_cpStdResponse_(false, 'MAIN_CONTROL_PACKAGE_LIST_FAILED', 'Core DB not available', { packages: [] }, opened.error || null);
  }
  var ss = opened.ss;
  var sh = null;
  try {
    sh = ss.getSheetByName('CBV_CONNECTION_PACKAGE');
  } catch (e0) {
    sh = null;
  }
  if (!sh) {
    return MC_cpStdResponse_(true, 'MAIN_CONTROL_PACKAGE_LIST_EMPTY', 'Sheet missing', { packages: [], moduleCode: mod }, null);
  }

  var headers = MC_schemaGetHeaders_(sh);
  var i;
  var idx = {};
  for (i = 0; i < headers.length; i++) {
    idx[headers[i]] = i;
  }
  if (sh.getLastRow() < 2 || !idx.MODULE_CODE) {
    return MC_cpStdResponse_(true, 'MAIN_CONTROL_PACKAGE_LIST_EMPTY', 'No rows', { packages: [], moduleCode: mod }, null);
  }

  var values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  var out = [];
  for (i = 0; i < values.length; i++) {
    var row = values[i] || [];
    var code = String(row[idx.MODULE_CODE] || '').trim().toUpperCase();
    if (code !== mod) continue;
    var raw = idx.PACKAGE_JSON != null ? String(row[idx.PACKAGE_JSON] || '') : '';
    var parsed = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch (e1) {
      parsed = null;
    }
    out.push({
      packageId: idx.PACKAGE_ID != null ? String(row[idx.PACKAGE_ID] || '').trim() : '',
      issuedAt: idx.ISSUED_AT != null ? String(row[idx.ISSUED_AT] || '').trim() : '',
      expiresAt: idx.EXPIRES_AT != null ? String(row[idx.EXPIRES_AT] || '').trim() : '',
      status: idx.STATUS != null ? String(row[idx.STATUS] || '').trim() : '',
      package: parsed
    });
  }

  return MC_cpStdResponse_(true, 'MAIN_CONTROL_PACKAGE_LIST_OK', 'OK', { moduleCode: mod, packages: out }, null);
}

