/**
 * HO_SO Bootstrap — idempotent sheets/schemas.
 * Dependencies: 90_BOOTSTRAP_INIT (ensureSheetExists, ensureHeadersMatchOrReport, _writeHeaders), 90_BOOTSTRAP_SCHEMA
 */

function ensureHosoSheets_() {
  var out = { ok: true, tables: [] };
  hosoGetTableNames().forEach(function(name) {
    var headers = getSchemaHeaders(name);
    var res = ensureSheetExists(name);
    var sheet = res.sheet;
    var check = ensureHeadersMatchOrReport(sheet, headers);
    var row = { name: name, created: res.created, match: check.match };
    if (check.match) {
      out.tables.push(row);
      return;
    }
    if (check.canExtend && check.missingCount) {
      _writeHeaders(sheet, headers);
      row.extended = true;
      out.tables.push(row);
      return;
    }
    row.ok = false;
    row.reason = check.mismatchReason;
    out.ok = false;
    out.tables.push(row);
  });
  return out;
}

function ensureHosoSchemas_() {
  return ensureHosoSheets_();
}

function ensureHosoMasterData_() {
  return typeof seedHosoMasterData_ === 'function' ? seedHosoMasterData_() : { ok: false, message: 'seedHosoMasterData_ missing' };
}

function ensureHosoEnums_() {
  return typeof seedEnumDictionary === 'function' ? seedEnumDictionary() : { ok: false };
}

/**
 * hosoFullDeployImpl — canonical full HO_SO deployment.
 *
 * Default behavior (Phase A): SAFE path, no destructive/automatic migration.
 *   { includeMigration: false, includeDemoSeed: false, includeSmokeTest: true }
 *
 * Callers that need legacy-migration run it explicitly:
 *   hosoFullDeploy({ includeMigration: true })
 *
 * @param {{includeMigration?:boolean, includeDemoSeed?:boolean, includeSmokeTest?:boolean}} [opts]
 * @returns {{ok:boolean, steps:Array}}
 */
function hosoFullDeployImpl(opts) {
  opts = opts || {};
  var includeMigration = opts.includeMigration === true;
  var includeDemoSeed = opts.includeDemoSeed === true;
  var includeSmokeTest = opts.includeSmokeTest !== false;

  var report = { ok: true, opts: { includeMigration: includeMigration, includeDemoSeed: includeDemoSeed, includeSmokeTest: includeSmokeTest }, steps: [] };
  function push(name, fn) {
    try {
      var r = fn();
      report.steps.push({ name: name, ok: r && r.ok !== false, result: r });
      if (r && r.ok === false) report.ok = false;
    } catch (e) {
      report.ok = false;
      report.steps.push({ name: name, ok: false, error: String(e.message || e) });
    }
  }
  push('ensureCoreSheets', function() { return typeof ensureCoreSheetsExist === 'function' ? ensureCoreSheetsExist() : { ok: true }; });
  push('ensureHosoSheets', function() { return ensureHosoSheets_(); });
  push('seedEnumDictionary', function() { return ensureHosoEnums_(); });
  push('seedHosoMasterData', function() { return seedHosoMasterData_(); });
  if (includeMigration) {
    push('migrateHosoLegacyToPro', function() { return typeof migrateHosoLegacyToPro_ === 'function' ? migrateHosoLegacyToPro_() : { ok: false, message: 'migrateHosoLegacyToPro_ missing' }; });
  } else {
    report.steps.push({ name: 'migrateHosoLegacyToPro', ok: true, skipped: true, reason: 'opts.includeMigration=false (default)' });
  }
  if (includeDemoSeed) {
    push('seedHosoDemoData', function() { return typeof seedHosoDemoData_ === 'function' ? seedHosoDemoData_() : { ok: false, message: 'seedHosoDemoData_ missing' }; });
  } else {
    report.steps.push({ name: 'seedHosoDemoData', ok: true, skipped: true, reason: 'opts.includeDemoSeed=false (default)' });
  }
  push('auditHosoSchema', function() { return auditHosoSchema(); });
  if (includeSmokeTest) {
    push('hosoRunSmokeTest', function() { return typeof hosoRunSmokeTest === 'function' ? hosoRunSmokeTest() : (typeof runHosoSmokeTestImpl === 'function' ? runHosoSmokeTestImpl() : { ok: true }); });
  }
  Logger.log('hosoFullDeploy: ' + JSON.stringify(report));
  return report;
}
