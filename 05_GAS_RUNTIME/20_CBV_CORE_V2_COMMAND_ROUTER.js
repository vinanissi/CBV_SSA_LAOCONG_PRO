/**
 * CBV Core V2 — CommandRouter (dispatch).
 * Dependencies: permission, registry, command log, idempotency, error, utils
 */

/**
 * @param {Object} raw
 * @returns {Object}
 */
function cbvCoreV2NormalizeCommand_(raw) {
  var c = raw || {};
  var cmdId = c.commandId || c.COMMAND_ID || '';
  return {
    commandId: String(cmdId || '').trim(),
    commandType: String(c.commandType || c.COMMAND_TYPE || '').trim(),
    moduleCode: String(c.moduleCode || c.MODULE_CODE || '').trim(),
    source: String(c.source || c.SOURCE || '').trim(),
    requestBy: String(c.requestBy || c.REQUEST_BY || '').trim(),
    idempotencyKey: String(c.idempotencyKey || c.IDEMPOTENCY_KEY || '').trim(),
    payload: c.payload != null ? c.payload : {}
  };
}

/**
 * @param {Object} cmd
 * @returns {{ ok: boolean, errors: string[] }}
 */
/**
 * Map legacy / versioned command types to canonical HOSO_*.
 * @param {string} commandType
 * @returns {string}
 */
function cbvHosoMapLegacyCommandType_(commandType) {
  var c = String(commandType || '').trim();
  var map = {
    HO_SO_CREATE: 'HOSO_CREATE',
    HO_SO_UPDATE: 'HOSO_UPDATE',
    HO_SO_GET_DETAIL: 'HOSO_GET_DETAIL',
    HO_SO_CHANGE_STATUS: 'HOSO_CHANGE_STATUS',
    HO_SO_IMPORT_BATCH: 'HOSO_IMPORT_BATCH',
    HO_SO_SEARCH: 'HOSO_SEARCH',
    HO_SO_ATTACH_FILE: 'HOSO_ATTACH_FILE',
    HO_SO_PRINT: 'HOSO_PRINT',
    HO_SO_REBUILD_SEARCH_INDEX: 'HOSO_REBUILD_SEARCH_INDEX',
    HO_SO_HEALTH_CHECK: 'HOSO_HEALTH_CHECK',
    HOSO_V2_2_CREATE: 'HOSO_CREATE',
    HOSO_V2_2_UPDATE: 'HOSO_UPDATE',
    HOSO_V2_2_SEARCH: 'HOSO_SEARCH',
    HOSO_V2_2_PRINT: 'HOSO_PRINT',
    HOSO_V2_2_ATTACH_FILE: 'HOSO_ATTACH_FILE'
  };
  return map[c] || c;
}

/**
 * @param {Object} cmd — normalized command (mutated)
 * @returns {Object}
 */
function cbvHosoNormalizeDispatchCommand_(cmd) {
  var m = String(cmd.moduleCode || '').trim().toUpperCase();
  if (m === 'HO_SO') cmd.moduleCode = 'HOSO';
  cmd.commandType = cbvHosoMapLegacyCommandType_(String(cmd.commandType || '').trim());
  return cmd;
}

function cbvCoreV2ValidateCommand_(cmd) {
  var errors = [];
  if (!cbvCoreV2IsNonEmptyString_(cmd.commandType)) errors.push('commandType required');
  if (!cbvCoreV2IsNonEmptyString_(cmd.moduleCode)) errors.push('moduleCode required');
  if (!cbvCoreV2IsNonEmptyString_(cmd.source)) errors.push('source required');
  if (!cbvCoreV2IsNonEmptyString_(cmd.requestBy)) errors.push('requestBy required');
  return { ok: errors.length === 0, errors: errors };
}

/**
 * @param {boolean} ok
 * @param {string} commandId
 * @param {string} moduleCode
 * @param {string} commandType
 * @param {string} entityType
 * @param {string} entityId
 * @param {string} message
 * @param {*} data
 * @param {*} error
 * @returns {Object}
 */
function cbvCoreV2BuildResult_(ok, commandId, moduleCode, commandType, entityType, entityId, message, data, error) {
  return {
    ok: !!ok,
    commandId: commandId || '',
    moduleCode: moduleCode || '',
    commandType: commandType || '',
    entityType: entityType || '',
    entityId: entityId || '',
    message: message || '',
    data: data != null ? data : {},
    error: error != null ? error : null
  };
}

/**
 * @param {Object} command — normalized
 * @returns {Object} dispatch result contract
 */
function CBV_CoreV2_dispatch(command) {
  var norm = cbvCoreV2NormalizeCommand_(command);
  norm = cbvHosoNormalizeDispatchCommand_(norm);
  var v = cbvCoreV2ValidateCommand_(norm);
  if (!v.ok) {
    return cbvCoreV2BuildResult_(false, '', norm.moduleCode, norm.commandType, '', '', v.errors.join('; '), {}, {
      code: CBV_CORE_V2.ERROR_CODES.VALIDATION_ERROR,
      message: v.errors.join('; ')
    });
  }

  if (!cbvCoreV2IsNonEmptyString_(norm.idempotencyKey)) {
    norm.idempotencyKey = Utilities.getUuid();
  }
  if (!cbvCoreV2IsNonEmptyString_(norm.commandId)) {
    norm.commandId = cbvCoreV2NewCommandId_('CMD');
  }

  var idem = cbvCoreV2IdempotencyFindSuccess_(norm.idempotencyKey);
  if (idem && idem.resultJson) {
    var prev = cbvCoreV2SafeParseJson_(idem.resultJson);
    if (prev && typeof prev === 'object') {
      var dupLogId = cbvCoreV2NewCommandId_('CMD');
      var finished = cbvCoreV2IsoNow_();
      cbvCoreV2CommandLogAppend_({
        COMMAND_ID: dupLogId,
        COMMAND_TYPE: norm.commandType,
        MODULE_CODE: norm.moduleCode,
        SOURCE: norm.source,
        REQUEST_BY: norm.requestBy,
        PAYLOAD_JSON: cbvCoreV2SafeStringify_(norm.payload),
        IDEMPOTENCY_KEY: norm.idempotencyKey,
        STATUS: CBV_CORE_V2.COMMAND_STATUS.DUPLICATE,
        RESULT_JSON: idem.resultJson,
        ERROR_CODE: '',
        ERROR_MESSAGE: '',
        CREATED_AT: finished,
        STARTED_AT: finished,
        FINISHED_AT: finished
      });
      return prev;
    }
  }

  var created = cbvCoreV2IsoNow_();
  cbvCoreV2CommandLogAppend_({
    COMMAND_ID: norm.commandId,
    COMMAND_TYPE: norm.commandType,
    MODULE_CODE: norm.moduleCode,
    SOURCE: norm.source,
    REQUEST_BY: norm.requestBy,
    PAYLOAD_JSON: cbvCoreV2SafeStringify_(norm.payload),
    IDEMPOTENCY_KEY: norm.idempotencyKey,
    STATUS: CBV_CORE_V2.COMMAND_STATUS.RECEIVED,
    RESULT_JSON: '',
    ERROR_CODE: '',
    ERROR_MESSAGE: '',
    CREATED_AT: created,
    STARTED_AT: '',
    FINISHED_AT: ''
  });

  var started = cbvCoreV2IsoNow_();
  cbvCoreV2CommandLogUpdateByCommandId_(norm.commandId, {
    STATUS: CBV_CORE_V2.COMMAND_STATUS.PROCESSING,
    STARTED_AT: started
  });

  var perm = cbvCoreV2PermissionGuard_(norm);
  if (!perm.allowed) {
    var fin = cbvCoreV2IsoNow_();
    cbvCoreV2CommandLogUpdateByCommandId_(norm.commandId, {
      STATUS: CBV_CORE_V2.COMMAND_STATUS.FAILED,
      ERROR_CODE: CBV_CORE_V2.ERROR_CODES.PERMISSION_DENIED,
      ERROR_MESSAGE: perm.reason,
      FINISHED_AT: fin,
      RESULT_JSON: cbvCoreV2SafeStringify_(cbvCoreV2BuildResult_(false, norm.commandId, norm.moduleCode, norm.commandType, '', '', perm.reason, {}, {
        code: CBV_CORE_V2.ERROR_CODES.PERMISSION_DENIED,
        message: perm.reason
      }))
    });
    return cbvCoreV2BuildResult_(false, norm.commandId, norm.moduleCode, norm.commandType, '', '', perm.reason, {}, {
      code: CBV_CORE_V2.ERROR_CODES.PERMISSION_DENIED,
      message: perm.reason
    });
  }

  var mod = cbvCoreV2RegistryGetModule_(norm.moduleCode);
  if (!mod && String(norm.moduleCode || '').toUpperCase() === 'HOSO') {
    mod = cbvCoreV2RegistryGetModule_('HO_SO');
  }
  if (!mod && String(norm.moduleCode || '').toUpperCase() === 'HO_SO') {
    mod = cbvCoreV2RegistryGetModule_('HOSO');
  }
  var handlerName = mod && mod.entryHandler ? String(mod.entryHandler).trim() : '';
  var g = cbvCoreV2GlobalThis_();
  var handler = handlerName && typeof g[handlerName] === 'function' ? g[handlerName] : null;

  if (!handler) {
    var fin2 = cbvCoreV2IsoNow_();
    var failRes = cbvCoreV2BuildResult_(false, norm.commandId, norm.moduleCode, norm.commandType, '', '', 'Handler not found', {}, {
      code: CBV_CORE_V2.ERROR_CODES.MODULE_HANDLER_NOT_FOUND,
      message: 'MODULE_HANDLER_NOT_FOUND'
    });
    cbvCoreV2CommandLogUpdateByCommandId_(norm.commandId, {
      STATUS: CBV_CORE_V2.COMMAND_STATUS.FAILED,
      ERROR_CODE: CBV_CORE_V2.ERROR_CODES.MODULE_HANDLER_NOT_FOUND,
      ERROR_MESSAGE: 'MODULE_HANDLER_NOT_FOUND',
      FINISHED_AT: fin2,
      RESULT_JSON: cbvCoreV2SafeStringify_(failRes)
    });
    return failRes;
  }

  var handlerResult;
  try {
    handlerResult = handler(norm);
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    var finE = cbvCoreV2IsoNow_();
    var exRes = cbvCoreV2BuildResult_(false, norm.commandId, norm.moduleCode, norm.commandType, '', '', n.message, {}, {
      code: CBV_CORE_V2.ERROR_CODES.HANDLER_EXCEPTION,
      message: n.message
    });
    cbvCoreV2CommandLogUpdateByCommandId_(norm.commandId, {
      STATUS: CBV_CORE_V2.COMMAND_STATUS.FAILED,
      ERROR_CODE: CBV_CORE_V2.ERROR_CODES.HANDLER_EXCEPTION,
      ERROR_MESSAGE: n.message,
      FINISHED_AT: finE,
      RESULT_JSON: cbvCoreV2SafeStringify_(exRes)
    });
    return exRes;
  }

  var ok = handlerResult && handlerResult.ok !== false;
  var entityType = handlerResult && handlerResult.entityType != null ? String(handlerResult.entityType) : '';
  var entityId = handlerResult && handlerResult.entityId != null ? String(handlerResult.entityId) : '';
  var message = handlerResult && handlerResult.message != null ? String(handlerResult.message) : (ok ? 'OK' : 'Failed');
  var data = handlerResult && handlerResult.data != null ? handlerResult.data : {};
  var err = handlerResult && handlerResult.error != null ? handlerResult.error : null;

  var finalRes = cbvCoreV2BuildResult_(ok, norm.commandId, norm.moduleCode, norm.commandType, entityType, entityId, message, data, err);
  var fin3 = cbvCoreV2IsoNow_();
  cbvCoreV2CommandLogUpdateByCommandId_(norm.commandId, {
    STATUS: ok ? CBV_CORE_V2.COMMAND_STATUS.SUCCESS : CBV_CORE_V2.COMMAND_STATUS.FAILED,
    RESULT_JSON: cbvCoreV2SafeStringify_(finalRes),
    ERROR_CODE: ok ? '' : (err && err.code ? String(err.code) : CBV_CORE_V2.ERROR_CODES.INTERNAL_ERROR),
    ERROR_MESSAGE: ok ? '' : (err && err.message ? String(err.message) : message),
    FINISHED_AT: fin3
  });

  if (ok) {
    cbvCoreV2IdempotencyUpsert_(
      norm.idempotencyKey,
      norm.commandType,
      norm.moduleCode,
      norm.commandId,
      cbvCoreV2SafeStringify_(finalRes),
      CBV_CORE_V2.IDEMPOTENCY_STATUS.SUCCESS
    );
  }

  return finalRes;
}
