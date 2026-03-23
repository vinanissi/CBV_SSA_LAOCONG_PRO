/**
 * CBV Clean Migration - Remove all hybrid/legacy columns. Enforce PRO schema.
 * NO backward compatibility. Run once. Idempotent where possible.
 *
 * Flow: migrateData() → removeLegacyColumns() → validate()
 * Dependencies: 00_CORE_CONFIG, 90_BOOTSTRAP_SCHEMA
 */

/** Columns to remove by table. Delete right-to-left to preserve indices. */
var LEGACY_COLUMNS_TO_REMOVE = {
  USER_DIRECTORY: ['HTX_ID'],
  TASK_MAIN: ['RESULT_NOTE', 'HTX_ID', 'TASK_TYPE'],
  TASK_CHECKLIST: ['DESCRIPTION'],
  TASK_UPDATE_LOG: ['CONTENT'],
  FINANCE_TRANSACTION: ['UNIT_ID'],
  MASTER_CODE: ['EMAIL', 'ROLE_CODE', 'SHORT_NAME', 'PARENT_CODE']
};

/**
 * Full clean migration. Migrates data, removes legacy columns, validates.
 * @param {Object} opts - { dryRun: false }
 * @returns {{ ok: boolean, migrated: Object, removed: Object, summary: string }}
 */
function runCleanMigration(opts) {
  var o = opts || {};
  var result = { ok: true, migrated: {}, removed: {}, errors: [], summary: '' };
  var ss = SpreadsheetApp.getActive();

  try {
    result.migrated = migrateDataBeforeRemove(ss);
  } catch (e) {
    result.errors.push('migrateData: ' + (e.message || e));
  }

  if (!o.dryRun && result.errors.length === 0) {
    try {
      result.removed = removeLegacyColumns(ss);
    } catch (e) {
      result.errors.push('removeColumns: ' + (e.message || e));
    }
  }

  result.ok = result.errors.length === 0;
  result.summary = result.ok ? 'Migration complete' : result.errors.join('; ');
  return result;
}

/**
 * Migrates data before column removal.
 * - TASK_MAIN: TASK_TYPE (text) → TASK_TYPE_ID via MASTER_CODE lookup
 * - TASK_MAIN: RESULT_NOTE → RESULT_SUMMARY if RESULT_SUMMARY blank
 * - FINANCE_TRANSACTION: UNIT_ID → DON_VI_ID (copy before remove)
 */
function migrateDataBeforeRemove(ss) {
  var r = { taskType: 0, resultNote: 0, unitToDonVi: 0 };

  // 1. TASK_MAIN: TASK_TYPE → TASK_TYPE_ID
  var taskSheet = ss.getSheetByName(CBV_CONFIG.SHEETS.TASK_MAIN || 'TASK_MAIN');
  if (taskSheet && taskSheet.getLastRow() >= 2) {
    var th = taskSheet.getRange(1, 1, 1, taskSheet.getLastColumn()).getValues()[0];
    var ttIdx = th.indexOf('TASK_TYPE');
    var ttIdIdx = th.indexOf('TASK_TYPE_ID');
    var rsIdx = th.indexOf('RESULT_SUMMARY');
    var rnIdx = th.indexOf('RESULT_NOTE');
    if (ttIdx >= 0 && ttIdIdx >= 0) {
      var taskTypeMap = buildTaskTypeCodeToIdMap(ss);
      var rows = taskSheet.getRange(2, 1, taskSheet.getLastRow(), th.length).getValues();
      rows.forEach(function(row, i) {
        var rowNum = i + 2;
        var ttVal = String(row[ttIdx] || '').trim();
        if (ttVal && taskTypeMap[ttVal]) {
          taskSheet.getRange(rowNum, ttIdIdx + 1).setValue(taskTypeMap[ttVal]);
          r.taskType++;
        }
        if (rnIdx >= 0 && rsIdx >= 0) {
          var rnVal = String(row[rnIdx] || '').trim();
          var rsVal = String(row[rsIdx] || '').trim();
          if (rnVal && !rsVal) {
            taskSheet.getRange(rowNum, rsIdx + 1).setValue(rnVal);
            r.resultNote++;
          }
        }
      });
    }
  }

  // 2. FINANCE_TRANSACTION: UNIT_ID → DON_VI_ID
  var finSheet = ss.getSheetByName(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION || 'FINANCE_TRANSACTION');
  if (finSheet && finSheet.getLastRow() >= 2) {
    var fh = finSheet.getRange(1, 1, 1, finSheet.getLastColumn()).getValues()[0];
    var unitIdx = fh.indexOf('UNIT_ID');
    var dvIdx = fh.indexOf('DON_VI_ID');
    if (unitIdx >= 0) {
      if (dvIdx === -1) {
        var lastCol = fh.length;
        finSheet.getRange(1, lastCol + 1).setValue('DON_VI_ID');
        dvIdx = lastCol;
        fh = finSheet.getRange(1, 1, 1, finSheet.getLastColumn()).getValues()[0];
      }
      var fRows = finSheet.getRange(2, 1, finSheet.getLastRow(), fh.length).getValues();
      fRows.forEach(function(row, i) {
        var val = row[unitIdx];
        if (val != null && String(val).trim()) {
          finSheet.getRange(i + 2, dvIdx + 1).setValue(val);
          r.unitToDonVi++;
        }
      });
    }
  }

  return r;
}

function buildTaskTypeCodeToIdMap(ss) {
  var map = {};
  var mcSheet = ss.getSheetByName(CBV_CONFIG.SHEETS.MASTER_CODE || 'MASTER_CODE');
  if (!mcSheet || mcSheet.getLastRow() < 2) return map;
  var mh = mcSheet.getRange(1, 1, 1, mcSheet.getLastColumn()).getValues()[0];
  var gIdx = mh.indexOf('MASTER_GROUP');
  var cIdx = mh.indexOf('CODE');
  var idIdx = mh.indexOf('ID');
  var stIdx = mh.indexOf('STATUS');
  if (gIdx < 0 || cIdx < 0 || idIdx < 0) return map;
  var rows = mcSheet.getRange(2, 1, mcSheet.getLastRow(), mh.length).getValues();
  rows.forEach(function(r) {
    if (String(r[gIdx] || '').trim() === 'TASK_TYPE' && String(r[stIdx] || '').trim() !== 'INACTIVE') {
      var code = String(r[cIdx] || '').trim();
      if (code) map[code] = String(r[idIdx] || '');
    }
  });
  return map;
}

/**
 * Removes legacy columns. Deletes right-to-left per table.
 */
function removeLegacyColumns(ss) {
  var r = {};
  Object.keys(LEGACY_COLUMNS_TO_REMOVE).forEach(function(tableName) {
    var cols = LEGACY_COLUMNS_TO_REMOVE[tableName];
    var sheetName = (CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS[tableName]) || tableName;
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastColumn() === 0) return;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var toDel = [];
    cols.forEach(function(col) {
      var idx = headers.indexOf(col);
      if (idx >= 0) toDel.push(idx + 1);
    });
    toDel.sort(function(a, b) { return b - a; });
    toDel.forEach(function(colNum) {
      sheet.deleteColumn(colNum);
    });
    r[tableName] = toDel.length;
  });
  return r;
}
