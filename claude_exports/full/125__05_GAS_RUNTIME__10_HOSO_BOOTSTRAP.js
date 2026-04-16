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

function runHosoFullDeployment() {
  var report = { ok: true, steps: [] };
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
  push('migrateHosoLegacyToPro', function() { return typeof migrateHosoLegacyToPro_ === 'function' ? migrateHosoLegacyToPro_() : { ok: false, message: 'migrateHosoLegacyToPro_ missing' }; });
  push('seedHosoDemoData', function() { return seedHosoDemoData_(); });
  push('auditHosoSchema', function() { return auditHosoSchema(); });
  push('runHosoSmokeTest', function() { return runHosoSmokeTest(); });
  Logger.log('runHosoFullDeployment: ' + JSON.stringify(report));
  return report;
}
