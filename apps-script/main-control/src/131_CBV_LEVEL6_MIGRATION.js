/**
 * CBV Level 6 Pro — migration registry + log (skeleton).
 * Dependencies: 130, 133
 */

var CBV_L6_MIGRATION_REGISTRY = CBV_L6_MIGRATION_REGISTRY || {};

/**
 * @param {Object} migrationDef
 * @returns {Object}
 */
function CBV_L6_registerMigration(migrationDef) {
  var d = migrationDef || {};
  var id = String(d.migrationId || d.MIGRATION_ID || '').trim();
  if (!id) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'migrationId required', data: {}, error: { code: 'VALIDATION_ERROR', message: 'migrationId required' } };
  }
  CBV_L6_MIGRATION_REGISTRY[id] = {
    migrationId: id,
    moduleCode: cbvL6NormalizeModuleCode_(d.moduleCode || d.MODULE_CODE || ''),
    fromVersion: String(d.fromVersion || d.FROM_VERSION || ''),
    toVersion: String(d.toVersion || d.TO_VERSION || ''),
    migrationName: String(d.migrationName || d.MIGRATION_NAME || id),
    handlerName: String(d.handlerName || d.HANDLER_NAME || ''),
    rollbackHandler: String(d.rollbackHandler || d.ROLLBACK_HANDLER || '')
  };
  return { ok: true, code: 'MIGRATION_REGISTERED', message: 'OK', data: { migrationId: id }, error: null };
}

/**
 * @param {Object} record
 * @returns {Object}
 */
function CBV_L6_logMigration(record) {
  try {
    var r = record || {};
    cbvL6EnsureCoreSheet_('MIGRATION_LOG', 'MIGRATION_LOG');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.MIGRATION_LOG);
    cbvCoreV2AppendRowByHeaders_(sheet, {
      MIGRATION_ID: r.MIGRATION_ID || r.migrationId || '',
      MODULE_CODE: cbvL6NormalizeModuleCode_(r.MODULE_CODE || r.moduleCode || ''),
      FROM_VERSION: r.FROM_VERSION || r.fromVersion || '',
      TO_VERSION: r.TO_VERSION || r.toVersion || '',
      MIGRATION_NAME: r.MIGRATION_NAME || r.migrationName || '',
      STATUS: r.STATUS || r.status || 'PENDING',
      STARTED_AT: r.STARTED_AT || r.startedAt || '',
      FINISHED_AT: r.FINISHED_AT || r.finishedAt || '',
      EXECUTED_BY: r.EXECUTED_BY || r.executedBy || (typeof cbvUser === 'function' ? cbvUser() : ''),
      RESULT_JSON: r.RESULT_JSON != null ? cbvCoreV2SafeStringify_(r.RESULT_JSON) : (r.resultJson != null ? cbvCoreV2SafeStringify_(r.resultJson) : ''),
      ERROR_CODE: r.ERROR_CODE || r.errorCode || '',
      ERROR_MESSAGE: r.ERROR_MESSAGE || r.errorMessage || '',
      ROLLBACK_AVAILABLE: r.ROLLBACK_AVAILABLE != null ? r.ROLLBACK_AVAILABLE : r.rollbackAvailable,
      ROLLBACK_HANDLER: r.ROLLBACK_HANDLER || r.rollbackHandler || ''
    });
    return { ok: true, code: 'MIGRATION_LOGGED', message: 'OK', data: {}, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}

/**
 * @param {string} migrationId
 * @returns {Object}
 */
function CBV_L6_getMigrationStatus(migrationId) {
  var id = String(migrationId || '').trim();
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.MIGRATION_LOG);
  if (!sheet) return { found: false, status: null, row: null };
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var col = map['MIGRATION_ID'];
  var stCol = map['STATUS'];
  if (!col) return { found: false, status: null, row: null };
  var last = sheet.getLastRow();
  var r;
  for (r = last; r >= 2; r--) {
    if (String(sheet.getRange(r, col).getValue() || '') === id) {
      return {
        found: true,
        status: stCol ? String(sheet.getRange(r, stCol).getValue() || '') : '',
        row: r
      };
    }
  }
  return { found: false, status: null, row: null };
}

/**
 * @param {string} migrationId
 * @returns {Object}
 */
function CBV_L6_runMigration(migrationId) {
  var id = String(migrationId || '').trim();
  var reg = CBV_L6_MIGRATION_REGISTRY[id];
  var g = cbvCoreV2GlobalThis_();
  var started = cbvCoreV2IsoNow_();
  var actor = typeof cbvUser === 'function' ? cbvUser() : 'system';
  if (!reg) {
    CBV_L6_logMigration({
      MIGRATION_ID: id,
      STATUS: 'FAILED',
      STARTED_AT: started,
      FINISHED_AT: cbvCoreV2IsoNow_(),
      EXECUTED_BY: actor,
      ERROR_CODE: 'MIGRATION_HANDLER_NOT_FOUND',
      ERROR_MESSAGE: 'Migration not registered',
      RESULT_JSON: {}
    });
    if (typeof CBV_L6_logError === 'function') {
      CBV_L6_logError({
        errorCode: 'MIGRATION_HANDLER_NOT_FOUND',
        moduleCode: 'CORE',
        message: 'Migration not registered: ' + id,
        source: 'MIGRATION'
      });
    }
    return { ok: false, code: 'MIGRATION_HANDLER_NOT_FOUND', message: 'Not registered', data: {}, error: { code: 'MIGRATION_HANDLER_NOT_FOUND', message: 'Not registered' } };
  }
  var fn = reg.handlerName ? g[reg.handlerName] : null;
  if (typeof fn !== 'function') {
    CBV_L6_logMigration({
      MIGRATION_ID: id,
      MODULE_CODE: reg.moduleCode,
      FROM_VERSION: reg.fromVersion,
      TO_VERSION: reg.toVersion,
      MIGRATION_NAME: reg.migrationName,
      STATUS: 'FAILED',
      STARTED_AT: started,
      FINISHED_AT: cbvCoreV2IsoNow_(),
      EXECUTED_BY: actor,
      ERROR_CODE: 'MIGRATION_HANDLER_NOT_FOUND',
      ERROR_MESSAGE: 'Handler not found: ' + reg.handlerName,
      RESULT_JSON: {},
      ROLLBACK_AVAILABLE: reg.rollbackHandler ? 'TRUE' : 'FALSE',
      ROLLBACK_HANDLER: reg.rollbackHandler
    });
    if (typeof CBV_L6_logError === 'function') {
      CBV_L6_logError({
        errorCode: 'MIGRATION_HANDLER_NOT_FOUND',
        moduleCode: reg.moduleCode || 'CORE',
        message: 'Missing handler ' + reg.handlerName,
        source: 'MIGRATION'
      });
    }
    return { ok: false, code: 'MIGRATION_HANDLER_NOT_FOUND', message: 'Handler missing', data: { handlerName: reg.handlerName }, error: { code: 'MIGRATION_HANDLER_NOT_FOUND', message: 'Handler missing' } };
  }
  try {
    var result = fn.call(g, { migrationId: id, registry: reg });
    CBV_L6_logMigration({
      MIGRATION_ID: id,
      MODULE_CODE: reg.moduleCode,
      FROM_VERSION: reg.fromVersion,
      TO_VERSION: reg.toVersion,
      MIGRATION_NAME: reg.migrationName,
      STATUS: 'SUCCESS',
      STARTED_AT: started,
      FINISHED_AT: cbvCoreV2IsoNow_(),
      EXECUTED_BY: actor,
      RESULT_JSON: result != null ? result : {},
      ROLLBACK_AVAILABLE: reg.rollbackHandler ? 'TRUE' : 'FALSE',
      ROLLBACK_HANDLER: reg.rollbackHandler
    });
    return { ok: true, code: 'MIGRATION_RAN', message: 'OK', data: { result: result }, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    CBV_L6_logMigration({
      MIGRATION_ID: id,
      MODULE_CODE: reg.moduleCode,
      FROM_VERSION: reg.fromVersion,
      TO_VERSION: reg.toVersion,
      MIGRATION_NAME: reg.migrationName,
      STATUS: 'FAILED',
      STARTED_AT: started,
      FINISHED_AT: cbvCoreV2IsoNow_(),
      EXECUTED_BY: actor,
      ERROR_CODE: 'MIGRATION_FAILED',
      ERROR_MESSAGE: n.message,
      RESULT_JSON: {}
    });
    if (typeof CBV_L6_logError === 'function') {
      CBV_L6_logError({
        error: e,
        errorCode: 'MIGRATION_FAILED',
        moduleCode: reg.moduleCode || 'CORE',
        source: 'MIGRATION',
        message: n.message
      });
    }
    return { ok: false, code: 'MIGRATION_FAILED', message: n.message, data: {}, error: { code: 'MIGRATION_FAILED', message: n.message } };
  }
}

/**
 * @param {string} migrationId
 * @returns {boolean}
 */
function CBV_L6_canRollback(migrationId) {
  var id = String(migrationId || '').trim();
  var reg = CBV_L6_MIGRATION_REGISTRY[id];
  if (!reg || !reg.rollbackHandler) return false;
  var st = CBV_L6_getMigrationStatus(id);
  if (!st.found) return false;
  var rollAvail = false;
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.MIGRATION_LOG);
  if (sheet && st.row) {
    var map = cbvCoreV2ReadHeaderMap_(sheet);
    var ra = map['ROLLBACK_AVAILABLE'];
    if (ra) {
      rollAvail = String(sheet.getRange(st.row, ra).getValue() || '').toUpperCase() === 'TRUE';
    }
  }
  return rollAvail;
}

/**
 * @param {string} migrationId
 * @returns {Object}
 */
function CBV_L6_runRollback(migrationId) {
  var id = String(migrationId || '').trim();
  var reg = CBV_L6_MIGRATION_REGISTRY[id];
  var g = cbvCoreV2GlobalThis_();
  if (!reg || !reg.rollbackHandler) {
    return { ok: false, code: 'MIGRATION_FAILED', message: 'No rollback handler', data: {}, error: { code: 'MIGRATION_FAILED', message: 'No rollback handler' } };
  }
  var fn = g[reg.rollbackHandler];
  if (typeof fn !== 'function') {
    return { ok: false, code: 'MIGRATION_HANDLER_NOT_FOUND', message: 'Rollback handler missing', data: {}, error: { code: 'MIGRATION_HANDLER_NOT_FOUND', message: 'Rollback handler missing' } };
  }
  try {
    var out = fn.call(g, { migrationId: id });
    return { ok: true, code: 'ROLLBACK_RAN', message: 'OK', data: { result: out }, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: 'MIGRATION_FAILED', message: n.message, data: {}, error: { code: 'MIGRATION_FAILED', message: n.message } };
  }
}

/**
 * Seed sample migration row + registry entry (dry run — no execution).
 */
function cbvL6SeedSampleMigration_() {
  CBV_L6_registerMigration({
    migrationId: 'HOSO_LEGACY_TO_CURRENT_DRY_RUN',
    moduleCode: 'HOSO',
    fromVersion: 'legacy',
    toVersion: 'current',
    migrationName: 'HOSO legacy to current (dry run)',
    handlerName: 'CBV_L6_migrationNoopPlaceholder_',
    rollbackHandler: ''
  });
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.MIGRATION_LOG);
  if (sheet && cbvCoreV2FindFirstRowInColumn_(sheet, 'MIGRATION_ID', 'HOSO_LEGACY_TO_CURRENT_DRY_RUN') < 2) {
    CBV_L6_logMigration({
      MIGRATION_ID: 'HOSO_LEGACY_TO_CURRENT_DRY_RUN',
      MODULE_CODE: 'HOSO',
      FROM_VERSION: 'legacy',
      TO_VERSION: 'current',
      MIGRATION_NAME: 'HOSO legacy to current (dry run)',
      STATUS: 'REGISTERED',
      STARTED_AT: '',
      FINISHED_AT: '',
      EXECUTED_BY: 'system',
      RESULT_JSON: { note: 'Not executed; skeleton only' },
      ERROR_CODE: '',
      ERROR_MESSAGE: '',
      ROLLBACK_AVAILABLE: 'FALSE',
      ROLLBACK_HANDLER: ''
    });
  }
}

/** Intentionally noop — real migration replaces this. */
function CBV_L6_migrationNoopPlaceholder_() {
  return { dryRun: true };
}
