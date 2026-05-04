/**
 * CBV Level 6 Pro — backup / rollback skeleton (Drive copy + logs).
 * Dependencies: 130, 133
 */

/**
 * Read CONFIG_REGISTRY JSON for module backup folder / db id.
 * @param {string} moduleCode
 * @param {string} keySuffix e.g. DB_ID, BACKUP_FOLDER_ID
 * @returns {string}
 */
function cbvL6ReadModuleConfigKey_(moduleCode, keySuffix) {
  var mod = cbvL6NormalizeModuleCode_(moduleCode);
  var wantKey = 'CBV_L6_' + mod + '_' + keySuffix;
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.CONFIG_REGISTRY);
  if (!sheet) return '';
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var kCol = map['CONFIG_KEY'];
  var jCol = map['CONFIG_JSON'];
  var mCol = map['MODULE_CODE'];
  if (!kCol || !jCol) return '';
  var last = sheet.getLastRow();
  if (last < 2) return '';
  var r;
  for (r = 2; r <= last; r++) {
    var key = String(sheet.getRange(r, kCol).getValue() || '').trim();
    if (key !== wantKey) continue;
    if (mCol) {
      var mc = cbvL6NormalizeModuleCode_(String(sheet.getRange(r, mCol).getValue() || ''));
      if (mc && mc !== mod) continue;
    }
    var raw = sheet.getRange(r, jCol).getValue();
    if (raw == null) return '';
    var s = String(raw).trim();
    if (s.charAt(0) === '{') {
      var o = cbvCoreV2SafeParseJson_(s);
      if (o && o.value != null) return String(o.value);
      if (o && o.folderId) return String(o.folderId);
      if (o && o.spreadsheetId) return String(o.spreadsheetId);
    }
    return s;
  }
  return '';
}

/**
 * @param {string} moduleCode
 * @returns {Object}
 */
function CBV_L6_createBackup(moduleCode) {
  var mod = cbvL6NormalizeModuleCode_(moduleCode);
  var backupId = cbvCoreV2NewEventId_('BAK');
  var dbId = cbvL6ReadModuleConfigKey_(mod, 'DB_ID');
  if (!dbId) {
    dbId =
      String(
        typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG && CBV_CONFIG.SPREADSHEET_ID
          ? CBV_CONFIG.SPREADSHEET_ID
          : ''
      ) || '';
  }
  if (!dbId) {
    CBV_L6_logBackup({
      BACKUP_ID: backupId,
      MODULE_CODE: mod,
      DB_ID: '',
      STATUS: 'FAILED',
      NOTE: 'CONFIG_KEY_NOT_FOUND: CBV_L6_' + mod + '_DB_ID'
    });
    if (typeof CBV_L6_logError === 'function') {
      CBV_L6_logError({
        errorCode: 'CONFIG_KEY_NOT_FOUND',
        moduleCode: mod,
        source: 'BACKUP',
        message: 'Missing DB_ID for backup'
      });
    }
    return { ok: false, code: 'CONFIG_KEY_NOT_FOUND', message: 'No DB_ID', data: { backupId: backupId }, error: { code: 'CONFIG_KEY_NOT_FOUND', message: 'No DB_ID' } };
  }

  var folderId = cbvL6ReadModuleConfigKey_(mod, 'BACKUP_FOLDER_ID');
  var tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
  var stamp = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  var name = 'CBV_BACKUP_' + mod + '_' + stamp;

  try {
    var file = DriveApp.getFileById(dbId);
    var parents = file.getParents();
    var folder = null;
    if (folderId) {
      try {
        folder = DriveApp.getFolderById(folderId);
      } catch (ef) {
        folder = null;
      }
    }
    var copy = folder ? file.makeCopy(name, folder) : file.makeCopy(name);
    var url = copy.getUrl();
    CBV_L6_logBackup({
      BACKUP_ID: backupId,
      MODULE_CODE: mod,
      DB_ID: dbId,
      BACKUP_FILE_ID: copy.getId(),
      BACKUP_FILE_URL: url,
      STATUS: 'SUCCESS',
      NOTE: ''
    });
    return {
      ok: true,
      code: 'BACKUP_CREATED',
      message: 'OK',
      data: { backupId: backupId, fileId: copy.getId(), url: url },
      error: null
    };
  } catch (e) {
    var msg = String(e && e.message ? e.message : e);
    CBV_L6_logBackup({
      BACKUP_ID: backupId,
      MODULE_CODE: mod,
      DB_ID: dbId,
      STATUS: 'FAILED',
      NOTE: msg
    });
    if (typeof CBV_L6_logError === 'function') {
      CBV_L6_logError({
        error: e,
        moduleCode: mod,
        source: 'BACKUP',
        message: msg
      });
    }
    return { ok: false, code: 'INTERNAL_ERROR', message: msg, data: { backupId: backupId }, error: { code: 'INTERNAL_ERROR', message: msg } };
  }
}

/**
 * @param {Object} record
 * @returns {Object}
 */
function CBV_L6_logBackup(record) {
  try {
    cbvL6EnsureCoreSheet_('BACKUP_LOG', 'BACKUP_LOG');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.BACKUP_LOG);
    var r = record || {};
    cbvCoreV2AppendRowByHeaders_(sheet, {
      BACKUP_ID: r.BACKUP_ID || r.backupId || cbvCoreV2NewCommandId_('BAK'),
      MODULE_CODE: cbvL6NormalizeModuleCode_(r.MODULE_CODE || r.moduleCode || ''),
      DB_ID: String(r.DB_ID || r.dbId || ''),
      BACKUP_FILE_ID: String(r.BACKUP_FILE_ID || r.backupFileId || ''),
      BACKUP_FILE_URL: String(r.BACKUP_FILE_URL || r.backupFileUrl || ''),
      STATUS: String(r.STATUS || r.status || 'PENDING'),
      CREATED_AT: cbvCoreV2IsoNow_(),
      CREATED_BY: String(r.CREATED_BY || r.createdBy || (typeof cbvUser === 'function' ? cbvUser() : '') || 'system'),
      NOTE: String(r.NOTE || r.note || '')
    });
    return { ok: true, code: 'BACKUP_LOGGED', message: 'OK', data: {}, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}

/**
 * @param {string} moduleCode
 * @returns {Object|null}
 */
function CBV_L6_getLatestBackup(moduleCode) {
  var mod = cbvL6NormalizeModuleCode_(moduleCode);
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.BACKUP_LOG);
  if (!sheet) return null;
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var mCol = map['MODULE_CODE'];
  var tCol = map['CREATED_AT'];
  if (!mCol) return null;
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var bestRow = -1;
  var bestTs = '';
  var r;
  for (r = 2; r <= last; r++) {
    var mc = cbvL6NormalizeModuleCode_(String(sheet.getRange(r, mCol).getValue() || ''));
    if (mc !== mod) continue;
    var ts = tCol ? String(sheet.getRange(r, tCol).getValue() || '') : '';
    if (bestRow < 0 || ts >= bestTs) {
      bestTs = ts;
      bestRow = r;
    }
  }
  if (bestRow < 2) return null;
  var o = {};
  var keys = Object.keys(map);
  var i;
  for (i = 0; i < keys.length; i++) {
    var hk = keys[i];
    o[hk] = sheet.getRange(bestRow, map[hk]).getValue();
  }
  return o;
}

/**
 * @param {Object} record
 * @returns {Object}
 */
function CBV_L6_logRollback(record) {
  try {
    cbvL6EnsureCoreSheet_('ROLLBACK_LOG', 'ROLLBACK_LOG');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.ROLLBACK_LOG);
    var r = record || {};
    var manualNote = 'Manual restore required — automated rollback not executed.';
    cbvCoreV2AppendRowByHeaders_(sheet, {
      ROLLBACK_ID: r.ROLLBACK_ID || r.rollbackId || cbvCoreV2NewEventId_('RBK'),
      MODULE_CODE: cbvL6NormalizeModuleCode_(r.MODULE_CODE || r.moduleCode || ''),
      MIGRATION_ID: String(r.MIGRATION_ID || r.migrationId || ''),
      STATUS: String(r.STATUS || r.status || 'LOGGED'),
      STARTED_AT: r.STARTED_AT || r.startedAt || cbvCoreV2IsoNow_(),
      FINISHED_AT: r.FINISHED_AT || r.finishedAt || '',
      EXECUTED_BY: String(r.EXECUTED_BY || r.executedBy || (typeof cbvUser === 'function' ? cbvUser() : '') || 'system'),
      RESULT_JSON: cbvCoreV2SafeStringify_(r.RESULT_JSON || r.resultJson || { warning: manualNote }),
      ERROR_CODE: String(r.ERROR_CODE || r.errorCode || ''),
      ERROR_MESSAGE: String(r.ERROR_MESSAGE || r.errorMessage || manualNote)
    });
    return { ok: true, code: 'ROLLBACK_LOGGED', message: manualNote, data: {}, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}
