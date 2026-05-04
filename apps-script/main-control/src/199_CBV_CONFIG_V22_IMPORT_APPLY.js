/**
 * CONFIG V2_2 — dry-run / apply import (ghi chỉ sheet đích đã có).
 * Dependencies: 150, 02, 196, 197, 198
 */

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} cfgSs
 * @returns {{ ok: boolean, message: string, missing: string[] }}
 */
function cbvConfigV22ImportAssertTargetSheets_(cfgSs) {
  var missing = [];
  var i;
  for (i = 0; i < CBV_CONFIG_V22_IMPORT.TARGET_SHEETS_ALLOWED.length; i++) {
    var name = CBV_CONFIG_V22_IMPORT.TARGET_SHEETS_ALLOWED[i];
    if (!cfgSs.getSheetByName(name)) missing.push(name);
  }
  if (missing.length) {
    return { ok: false, message: 'missing_target_sheets', missing: missing };
  }
  return { ok: true, message: 'ok', missing: [] };
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {Object<string, *>} values
 * @returns {Object<string, *>}
 */
function cbvConfigV22ImportCoerceToExistingHeaders_(sheet, values) {
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var out = {};
  var ks = Object.keys(values || {});
  var i;
  for (i = 0; i < ks.length; i++) {
    var k = ks[i];
    if (map[k]) out[k] = values[k];
  }
  return out;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} g
 * @param {string} k
 * @returns {number} row or -1
 */
function cbvConfigV22ImportFindEnumRow_(sheet, g, k) {
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var gc = map['ENUM_GROUP'];
  var kc = map['ENUM_KEY'];
  if (!gc || !kc) return -1;
  var lg = String(g || '').trim().toUpperCase();
  var lk = String(k || '').trim().toUpperCase();
  var last = sheet.getLastRow();
  var r;
  for (r = 2; r <= last; r++) {
    if (
      String(sheet.getRange(r, gc).getValue() || '').trim().toUpperCase() === lg &&
      String(sheet.getRange(r, kc).getValue() || '').trim().toUpperCase() === lk
    ) {
      return r;
    }
  }
  return -1;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} moduleCode
 * @param {string} ruleKey
 * @returns {number}
 */
function cbvConfigV22ImportFindRuleRow_(sheet, moduleCode, ruleKey) {
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var mc = map['MODULE_CODE'];
  var rk = map['RULE_KEY'];
  if (!mc || !rk) return -1;
  var lm = String(moduleCode || '').trim().toUpperCase();
  var lr = String(ruleKey || '').trim();
  var last = sheet.getLastRow();
  var r;
  for (r = 2; r <= last; r++) {
    if (String(sheet.getRange(r, mc).getValue() || '').trim().toUpperCase() === lm && String(sheet.getRange(r, rk).getValue() || '').trim() === lr) {
      return r;
    }
  }
  return -1;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} emailLower
 * @returns {number}
 */
function cbvConfigV22ImportFindPermissionRow_(sheet, emailLower) {
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var emc = map['EMAIL'];
  if (emc) {
    var last = sheet.getLastRow();
    var want = String(emailLower || '').trim().toLowerCase();
    var r;
    for (r = 2; r <= last; r++) {
      if (String(sheet.getRange(r, emc).getValue() || '').trim().toLowerCase() === want) return r;
    }
    return -1;
  }
  var rkc = map['RULE_KEY'];
  if (!rkc) return -1;
  var last2 = sheet.getLastRow();
  var r2;
  var w2 = String(emailLower || '').trim().toLowerCase();
  for (r2 = 2; r2 <= last2; r2++) {
    if (String(sheet.getRange(r2, rkc).getValue() || '').trim().toLowerCase() === w2) return r2;
  }
  return -1;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} col
 * @param {string} val
 * @returns {number}
 */
function cbvConfigV22ImportFindFirstInColumn_(sheet, col, val) {
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var c = map[col];
  if (!c) return -1;
  var v = String(val != null ? val : '').trim();
  var last = sheet.getLastRow();
  var r;
  for (r = 2; r <= last; r++) {
    if (String(sheet.getRange(r, c).getValue() || '').trim() === v) return r;
  }
  return -1;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {Object<string, *>} valuesFiltered
 * @param {number} rowOrMinus1
 */
function cbvConfigV22ImportUpsertGeneric_(sheet, valuesFiltered, rowOrMinus1) {
  var now = cbvCoreV2IsoNow_();
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  if (map['UPDATED_AT'] && valuesFiltered['UPDATED_AT'] === undefined) valuesFiltered['UPDATED_AT'] = now;
  if (rowOrMinus1 >= 2) {
    cbvCoreV2UpdateRowByHeaders_(sheet, rowOrMinus1, valuesFiltered);
    return;
  }
  if (map['CREATED_AT'] && valuesFiltered['CREATED_AT'] === undefined) valuesFiltered['CREATED_AT'] = now;
  if (map['UPDATED_AT'] && valuesFiltered['UPDATED_AT'] === undefined) valuesFiltered['UPDATED_AT'] = now;
  if (map['ENUM_ID'] && valuesFiltered['ENUM_ID'] === undefined) {
    valuesFiltered['ENUM_ID'] = 'ENU' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
  }
  if (map['RULE_ID'] && valuesFiltered['RULE_ID'] === undefined) {
    valuesFiltered['RULE_ID'] = 'RUL' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
  }
  cbvCoreV2AppendRowByHeaders_(sheet, valuesFiltered);
}

/**
 * @param {string} sourceSpreadsheetId
 * @param {{ dryRun: boolean }} opts
 * @returns {Object}
 */
function cbvConfigV22ImportRun_(sourceSpreadsheetId, opts) {
  var dry = !!(opts && opts.dryRun);
  var scan = cbvConfigV22ImportScanSource_(sourceSpreadsheetId);
  if (!scan.ok) {
    return { ok: false, dryRun: dry, message: scan.message, scan: scan, applied: {}, errors: [scan.message] };
  }

  var cfgSs = cbvConfigOpenSpreadsheet_();
  if (!cfgSs) {
    return {
      ok: false,
      dryRun: dry,
      message: 'CBV_CONFIG_DB_ID missing',
      scan: scan,
      applied: {},
      errors: ['CONFIG_DB_NOT_OPEN']
    };
  }

  var assert = cbvConfigV22ImportAssertTargetSheets_(cfgSs);
  if (!assert.ok) {
    return {
      ok: false,
      dryRun: dry,
      message: 'missing_target_sheets',
      scan: scan,
      missingTargetSheets: assert.missing,
      errors: assert.missing.map(function(m) {
        return 'MISSING_SHEET:' + m;
      })
    };
  }

  var sourceSs;
  try {
    sourceSs = SpreadsheetApp.openById(scan.sourceSpreadsheetId);
  } catch (e2) {
    return { ok: false, dryRun: dry, message: String(e2 && e2.message ? e2.message : e2), scan: scan, applied: {}, errors: ['SOURCE_OPEN_FAILED'] };
  }

  var order = ['ENUM_DICTIONARY', 'MASTER_CODE', 'DON_VI', 'RULE_DEF', 'DOC_REQUIREMENT', 'USER_DIRECTORY', 'FIN_EXPORT_FILTER'];
  var planned = [];
  var oi;
  for (oi = 0; oi < order.length; oi++) {
    var sname = order[oi];
    var shSrc = sourceSs.getSheetByName(sname);
    if (!shSrc) continue;
    var rows = cbvConfigV22ImportReadSheetAsObjects_(shSrc);
    var ri;
    for (ri = 0; ri < rows.length; ri++) {
      var ops = cbvConfigV22ImportMapRows_(sname, rows[ri]);
      var oj;
      for (oj = 0; oj < ops.length; oj++) {
        planned.push(ops[oj]);
      }
    }
  }

  /** Đếm theo sheet đích (dry-run hoặc sau apply). */
  var applied = {};
  var errors = [];

  if (!dry) {
    var pi;
    for (pi = 0; pi < planned.length; pi++) {
      var op = planned[pi];
      var tgt = op.target;
      var sh = cfgSs.getSheetByName(tgt);
      if (!sh) {
        errors.push('MISSING_TARGET_AT_APPLY:' + tgt);
        continue;
      }
      var filt = cbvConfigV22ImportCoerceToExistingHeaders_(sh, op.values);
      var row = -1;
      if (tgt === 'CONFIG_ENUM') {
        row = cbvConfigV22ImportFindEnumRow_(sh, op.naturalKey.ENUM_GROUP, op.naturalKey.ENUM_KEY);
      } else if (tgt === 'CONFIG_RULE') {
        row = cbvConfigV22ImportFindRuleRow_(sh, op.values.MODULE_CODE, op.values.RULE_KEY);
      } else if (tgt === 'CONFIG_PERMISSION') {
        row = cbvConfigV22ImportFindPermissionRow_(sh, op.naturalKey.EMAIL);
      } else if (tgt === 'CONFIG_IMPORT_MAPPING') {
        row = cbvConfigV22ImportFindFirstInColumn_(sh, 'MAPPING_CODE', op.naturalKey.MAPPING_CODE);
      } else if (tgt === 'CONFIG_TEMPLATE') {
        row = cbvConfigV22ImportFindFirstInColumn_(sh, 'TEMPLATE_KEY', op.naturalKey.TEMPLATE_KEY);
      } else if (tgt === 'CONFIG_FEATURE_FLAG') {
        row = cbvConfigV22ImportFindFirstInColumn_(sh, 'FLAG_KEY', op.naturalKey.FLAG_KEY);
      } else if (tgt === 'CONFIG_MODULE') {
        row = cbvConfigV22ImportFindFirstInColumn_(sh, 'MODULE_CODE', op.naturalKey.MODULE_CODE);
      } else if (tgt === 'CONFIG_SHEET_REGISTRY') {
        row = -1;
        var mcr = op.naturalKey.MODULE_CODE;
        var tcr = op.naturalKey.TABLE_CODE;
        if (mcr && tcr) row = cbvConfigV22ImportFindRegistryRow_(sh, mcr, tcr);
      }

      try {
        cbvConfigV22ImportUpsertGeneric_(sh, filt, row);
        applied[tgt] = (applied[tgt] || 0) + 1;
      } catch (ex) {
        errors.push(String(ex && ex.message ? ex.message : ex));
      }
    }
    if (typeof CBV_Config_clearCache === 'function') CBV_Config_clearCache();
  } else {
    var di;
    for (di = 0; di < planned.length; di++) {
      var t = planned[di].target;
      applied[t] = (applied[t] || 0) + 1;
    }
  }

  return {
    ok: errors.length === 0,
    dryRun: dry,
    message: dry ? 'CONFIG V2_2 IMPORT DRY_RUN OK' : 'CONFIG V2_2 IMPORT APPLY FINISHED',
    scan: scan,
    plannedCount: planned.length,
    plannedByTarget: applied,
    skippedSource: scan.skipped,
    unknownSourceSheets: scan.unknownSheets,
    errors: errors
  };
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} moduleCode
 * @param {string} tableCode
 * @returns {number}
 */
function cbvConfigV22ImportFindRegistryRow_(sheet, moduleCode, tableCode) {
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var mc = map['MODULE_CODE'];
  var tc = map['TABLE_CODE'];
  if (!mc || !tc) return -1;
  var lm = String(moduleCode || '').trim().toUpperCase();
  var lt = String(tableCode || '').trim().toUpperCase();
  var last = sheet.getLastRow();
  var r;
  for (r = 2; r <= last; r++) {
    if (
      String(sheet.getRange(r, mc).getValue() || '').trim().toUpperCase() === lm &&
      String(sheet.getRange(r, tc).getValue() || '').trim().toUpperCase() === lt
    ) {
      return r;
    }
  }
  return -1;
}
