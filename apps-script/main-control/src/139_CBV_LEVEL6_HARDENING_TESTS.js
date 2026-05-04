/**
 * CBV Level 6 Pro — bootstrap orchestration + hardening self test.
 * Dependencies: 130–138
 */

/**
 * Full hardening bootstrap (sheets, seeds, schema, migration registry sample).
 * @returns {Object}
 */
function CBV_L6_bootstrapHardening() {
  var report = {
    ok: true,
    code: 'L6_BOOTSTRAP_OK',
    message: 'Level 6 hardening bootstrap completed',
    data: {
      sheets: [],
      seeds: []
    },
    error: null
  };

  try {
    report.data.sheets = cbvL6EnsureAllHardeningSheets_();

    var e1 = CBV_L6_seedErrorCodes();
    report.data.seeds.push({ name: 'ERROR_CODE', result: e1 });

    var e2 = CBV_L6_seedPermissionRules();
    report.data.seeds.push({ name: 'PERMISSION_RULE', result: e2 });

    var e3 = CBV_L6_seedRetryPolicies();
    report.data.seeds.push({ name: 'RETRY_POLICY', result: e3 });

    var e4 = CBV_L6_seedEventConsumers();
    report.data.seeds.push({ name: 'EVENT_CONSUMER', result: e4 });

    var e5 = CBV_L6_bootstrapSchemaRegistry();
    report.data.seeds.push({ name: 'SCHEMA_REGISTRY', result: e5 });

    cbvL6SeedSampleMigration_();

    var i;
    for (i = 0; i < report.data.seeds.length; i++) {
      if (!report.data.seeds[i].result || !report.data.seeds[i].result.ok) {
        report.ok = false;
      }
    }
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    report.ok = false;
    report.code = n.code;
    report.message = n.message;
    report.error = { code: n.code, message: n.message };
  }

  return report;
}

/**
 * @returns {Object}
 */
function CBV_L6_hardeningSelfTest() {
  var steps = [];
  function step(name, fn) {
    try {
      var r = fn();
      var ok = !!(r && (r.ok !== false));
      steps.push({ name: name, ok: ok, message: r && r.message ? r.message : (ok ? 'OK' : 'FAIL') });
      return ok;
    } catch (e) {
      steps.push({ name: name, ok: false, message: String(e && e.message ? e.message : e) });
      return false;
    }
  }

  var allOk = true;

  allOk = step('bootstrap_hardening', function () {
    return CBV_L6_bootstrapHardening();
  }) && allOk;

  allOk = step('seed_error_codes', function () {
    return CBV_L6_seedErrorCodes();
  }) && allOk;

  allOk = step('seed_permission', function () {
    return CBV_L6_seedPermissionRules();
  }) && allOk;

  allOk = step('seed_retry', function () {
    return CBV_L6_seedRetryPolicies();
  }) && allOk;

  allOk = step('seed_consumers', function () {
    return CBV_L6_seedEventConsumers();
  }) && allOk;

  allOk = step('validate_schema_hoso_master', function () {
    var v = CBV_L6_validateSheetAgainstSchema('HOSO', 'MASTER');
    return { ok: v.ok, message: v.message, data: v };
  }) && allOk;

  allOk = step('permission_admin_allowed', function () {
    var r = CBV_L6_checkPermission({
      role: 'ADMIN',
      userEmail: 'admin@test.local',
      moduleCode: 'HOSO',
      action: 'DELETE',
      source: 'USER'
    });
    return { ok: r.allowed === true, message: r.reason, data: r };
  }) && allOk;

  allOk = step('permission_user_delete_denied', function () {
    var r = CBV_L6_checkPermission({
      role: 'USER',
      userEmail: 'user@test.local',
      ownerEmail: 'owner@test.local',
      moduleCode: 'HOSO',
      action: 'DELETE',
      source: 'USER'
    });
    return { ok: r.allowed === false, message: r.reason, data: r };
  }) && allOk;

  allOk = step('normalize_hoso_duplicate_plate', function () {
    var n = CBV_L6_normalizeError({ code: 'HOSO_DUPLICATE_PLATE', message: 'dup' }, {});
    var ok = n.errorCode === 'HOSO_DUPLICATE_PLATE' && n.userMessage.length > 0;
    return { ok: ok, message: n.userMessage, data: n };
  }) && allOk;

  allOk = step('config_resolver_optional', function () {
    if (typeof CBV_Config_getDbId !== 'function') return { ok: false, message: 'CBV_Config_getDbId missing' };
    var id = CBV_Config_getDbId('HOSO');
    if (!id) {
      return { ok: true, message: 'SKIP: no CONFIG DB / CBV_HOSO_DB_ID (legacy single-spreadsheet mode)' };
    }
    var sn = typeof CBV_Config_getSheetName === 'function' ? CBV_Config_getSheetName('HOSO', 'MASTER') : '';
    return { ok: !!sn, message: sn ? 'db+sheet OK' : 'missing CONFIG_SHEET_REGISTRY row for MASTER', data: { dbId: id, sheet: sn } };
  }) && allOk;

  allOk = step('command_legacy_mapping', function () {
    if (typeof cbvHosoMapLegacyCommandType_ !== 'function') return { ok: false, message: 'cbvHosoMapLegacyCommandType_ missing' };
    var a = cbvHosoMapLegacyCommandType_('HO_SO_CREATE') === 'HOSO_CREATE';
    var b = cbvHosoMapLegacyCommandType_('HOSO_V2_2_CREATE') === 'HOSO_CREATE';
    return { ok: a && b, message: 'HO_SO_CREATE→HOSO_CREATE; HOSO_V2_2_CREATE→HOSO_CREATE', data: { a: a, b: b } };
  }) && allOk;

  var govResult = null;
  allOk = step('governance_check', function () {
    govResult = CBV_L6_runDevGovernanceCheck();
    return { ok: govResult.ok, message: govResult.summary, data: govResult };
  }) && allOk;

  try {
    if (typeof cbvCoreV2HealthWrite_ === 'function') {
      cbvCoreV2HealthWrite_({
        moduleCode: 'LEVEL6',
        checkName: 'CBV_L6_hardeningSelfTest',
        severity: allOk ? 'INFO' : 'WARN',
        status: allOk ? 'OK' : 'WARN',
        message: allOk ? 'Hardening self test passed' : 'Hardening self test reported issues',
        payload: { steps: steps, governance: govResult }
      });
      steps.push({ name: 'system_health_log', ok: true, message: 'Written to CBV_SYSTEM_HEALTH' });
    } else {
      steps.push({ name: 'system_health_log', ok: true, message: 'cbvCoreV2HealthWrite_ not available; skipped' });
    }
  } catch (eh) {
    steps.push({ name: 'system_health_log', ok: false, message: String(eh && eh.message ? eh.message : eh) });
  }

  return {
    ok: allOk,
    steps: steps,
    governance: govResult
  };
}
