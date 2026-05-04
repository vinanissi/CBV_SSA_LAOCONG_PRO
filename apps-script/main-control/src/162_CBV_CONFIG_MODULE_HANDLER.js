/**
 * CONFIG module — command handler (all CONFIG mutations via CBV_CoreV2_dispatch).
 * Dependencies: 30 emit, 134 (L6 permission), 150, 160, 161, 163, 164, 165, 169 validators, 01, 02
 */

/**
 * @param {Object} cmd — normalized command from router
 * @returns {Object} handler result { ok, entityType, entityId, message, data, error }
 */
function ConfigCommandHandler_handle(cmd) {
  var type = String(cmd.commandType || '').trim();
  Logger.log('[ConfigCommandHandler_handle] ' + type + ' cmd=' + cmd.commandId);

  var writeCommands = [
    'CONFIG_SET_VALUE',
    'CONFIG_REGISTER_MODULE',
    'CONFIG_REGISTER_SHEET',
    'CONFIG_ADD_ENUM',
    'CONFIG_UPDATE_ENUM',
    'CONFIG_ADD_RULE',
    'CONFIG_SET_FEATURE_FLAG'
  ];

  if (writeCommands.indexOf(type) >= 0 && typeof CBV_L6_checkPermission === 'function') {
    var p = CBV_L6_checkPermission({
      moduleCode: 'CONFIG',
      action: type,
      source: cmd.source,
      userEmail: cmd.requestBy
    });
    if (!p || !p.allowed) {
      throw new Error('CONFIG_PERMISSION_DENIED');
    }
  }

  var pl = cmd.payload || {};

  switch (type) {
    case 'CONFIG_SET_VALUE':
      Config_validateKeyValue_(String(pl.key || pl.CONFIG_KEY || ''), pl.value);
      return Config_setValue_(cmd);
    case 'CONFIG_GET_VALUE':
      return Config_getValue_(cmd);
    case 'CONFIG_REGISTER_MODULE':
      Config_validateRegisterModule_(pl);
      return Config_registerModule_(cmd);
    case 'CONFIG_REGISTER_SHEET':
      Config_validateRegisterSheet_(pl);
      return Config_registerSheet_(cmd);
    case 'CONFIG_ADD_ENUM':
      Config_validateEnum_(pl);
      return Config_addEnum_(cmd);
    case 'CONFIG_UPDATE_ENUM':
      Config_validateUpdateEnum_(pl);
      return Config_updateEnum_(cmd);
    case 'CONFIG_ADD_RULE':
      Config_validateRule_(pl);
      return Config_addRule_(cmd);
    case 'CONFIG_SET_FEATURE_FLAG':
      Config_validateFeatureFlag_(pl);
      return Config_setFeatureFlag_(cmd);
    case 'CONFIG_HEALTH_CHECK':
      return Config_healthCheckCommand_(cmd);
    default:
      throw new Error('CONFIG_UNKNOWN_COMMAND');
  }
}

/**
 * @param {Object} cmd
 */
function cbvConfigModuleActor_(cmd) {
  try {
    var u = String(cbvUser() || '').trim();
    if (u) return u;
  } catch (e) {
    /* ignore */
  }
  return String(cmd.requestBy || 'system').trim();
}

/**
 * @param {Object} cmd
 * @param {Object} payloadExtra
 */
function cbvConfigModuleEmitChanged_(cmd, payloadExtra) {
  try {
    var pe = payloadExtra || {};
    var res = CBV_CoreV2_emitEvent({
      eventType: 'CONFIG_CHANGED',
      moduleCode: 'CONFIG',
      entityType: String(pe.entityType || 'CONFIG'),
      entityId: String(pe.entityId != null ? pe.entityId : cmd.commandId),
      sourceCommandId: cmd.commandId,
      payload: Object.assign({ commandType: cmd.commandType }, pe)
    });
    Logger.log('[cbvConfigModuleEmitChanged_] emit CONFIG_CHANGED: ' + cbvCoreV2SafeStringify_(res));
  } catch (e) {
    Logger.log('[cbvConfigModuleEmitChanged_] emit error: ' + (e && e.message ? e.message : e));
  }
}

/**
 * @param {Object} cmd
 * @returns {Object}
 */
function Config_setValue_(cmd) {
  var p = cmd.payload || {};
  var envCode = String(p.envCode || p.ENV_CODE || cbvConfigDefaultEnv_()).trim() || 'PROD';
  var key = String(p.key || p.CONFIG_KEY || '').trim();
  var value = p.value != null ? String(p.value) : String(p.CONFIG_VALUE != null ? p.CONFIG_VALUE : '');
  var isActive = String(p.isActive != null ? p.isActive : p.IS_ACTIVE != null ? p.IS_ACTIVE : 'TRUE').trim() || 'TRUE';
  if (!key) {
    return { ok: false, entityType: '', entityId: '', message: 'key required', data: {}, error: { code: 'VALIDATION_ERROR', message: 'key required' } };
  }

  var ss = cbvConfigOpenSpreadsheet_();
  if (!ss) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG DB not available', data: {}, error: { code: 'CONFIG_DB_MISSING', message: 'CBV_CONFIG_DB_ID unset' } };
  }
  var sh = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.ENV);
  if (!sh) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG_ENV missing', data: {}, error: { code: 'CONFIG_SHEET_MISSING', message: 'CONFIG_ENV' } };
  }

  var now = cbvCoreV2IsoNow_();
  var row = cbvConfigModuleFindEnvRow_(sh, envCode, key);
  var oldVal = '';
  if (row >= 2) {
    var map = cbvCoreV2ReadHeaderMap_(sh);
    if (map['CONFIG_VALUE']) oldVal = String(sh.getRange(row, map['CONFIG_VALUE']).getValue() || '');
    cbvCoreV2UpdateRowByHeaders_(sh, row, {
      CONFIG_VALUE: value,
      IS_ACTIVE: isActive,
      UPDATED_AT: now
    });
  } else {
    cbvCoreV2AppendRowByHeaders_(sh, {
      ENV_CODE: envCode,
      CONFIG_KEY: key,
      CONFIG_VALUE: value,
      IS_ACTIVE: isActive,
      UPDATED_AT: now
    });
  }

  var actor = cbvConfigModuleActor_(cmd);
  Config_logChange_({
    actorEmail: actor,
    changeType: 'CONFIG_SET_VALUE',
    resourceType: 'ENV',
    resourceKey: envCode + ':' + key,
    oldValue: oldVal,
    newValue: value,
    commandId: cmd.commandId,
    payloadJson: cbvCoreV2SafeStringify_(p)
  });

  if (typeof CBV_Config_clearCache === 'function') CBV_Config_clearCache();
  cbvConfigModuleEmitChanged_(cmd, { entityType: 'ENV', entityId: envCode + ':' + key, key: key, envCode: envCode });

  return {
    ok: true,
    entityType: 'CONFIG_VALUE',
    entityId: envCode + ':' + key,
    message: 'CONFIG_SET_VALUE_OK',
    data: { envCode: envCode, key: key, value: value },
    error: null
  };
}

/**
 * @param {Object} cmd
 * @returns {Object}
 */
function Config_getValue_(cmd) {
  var p = cmd.payload || {};
  var envCode = String(p.envCode || p.ENV_CODE || cbvConfigDefaultEnv_()).trim() || 'PROD';
  var key = String(p.key || p.CONFIG_KEY || '').trim();
  if (!key) {
    return { ok: false, entityType: '', entityId: '', message: 'key required', data: {}, error: { code: 'VALIDATION_ERROR', message: 'key required' } };
  }

  var actor = cbvConfigModuleActor_(cmd);
  Config_logAccess_({
    actorEmail: actor,
    action: 'CONFIG_GET_VALUE',
    resourceType: 'ENV',
    resourceKey: envCode + ':' + key,
    payloadJson: cbvCoreV2SafeStringify_(p),
    commandId: cmd.commandId
  });

  var ss = cbvConfigOpenSpreadsheet_();
  if (!ss) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG DB not available', data: {}, error: { code: 'CONFIG_DB_MISSING', message: 'CBV_CONFIG_DB_ID unset' } };
  }
  var sh = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.ENV);
  if (!sh) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG_ENV missing', data: {}, error: { code: 'CONFIG_SHEET_MISSING', message: 'CONFIG_ENV' } };
  }
  var row = cbvConfigModuleFindEnvRow_(sh, envCode, key);
  var val = '';
  if (row >= 2) {
    var map = cbvCoreV2ReadHeaderMap_(sh);
    if (map['CONFIG_VALUE']) val = String(sh.getRange(row, map['CONFIG_VALUE']).getValue() || '');
  }

  return {
    ok: true,
    entityType: 'CONFIG_VALUE',
    entityId: envCode + ':' + key,
    message: 'CONFIG_GET_VALUE_OK',
    data: { envCode: envCode, key: key, value: val },
    error: null
  };
}

/**
 * @param {Object} cmd
 * @returns {Object}
 */
function Config_registerModule_(cmd) {
  var p = cmd.payload || {};
  var code = String(p.moduleCode || p.MODULE_CODE || '').trim().toUpperCase();
  if (!code) {
    return { ok: false, entityType: '', entityId: '', message: 'moduleCode required', data: {}, error: { code: 'VALIDATION_ERROR', message: 'moduleCode required' } };
  }
  var ss = cbvConfigOpenSpreadsheet_();
  if (!ss) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG DB not available', data: {}, error: { code: 'CONFIG_DB_MISSING', message: 'CBV_CONFIG_DB_ID unset' } };
  }
  var sh = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.MODULE);
  if (!sh) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG_MODULE missing', data: {}, error: { code: 'CONFIG_SHEET_MISSING', message: 'CONFIG_MODULE' } };
  }

  var now = cbvCoreV2IsoNow_();
  var row = cbvCoreV2FindFirstRowInColumn_(sh, 'MODULE_CODE', code);
  var fields = {
    MODULE_CODE: code,
    DISPLAY_NAME: String(p.displayName || p.DISPLAY_NAME || code).trim(),
    ACTIVE_VERSION: String(p.activeVersion || p.ACTIVE_VERSION || 'V1').trim(),
    DB_CONFIG_KEY: String(p.dbConfigKey || p.DB_CONFIG_KEY || code + '_DB_ID').trim(),
    STATUS: String(p.status || p.STATUS || 'ACTIVE').trim()
  };

  if (row >= 2) {
    cbvCoreV2UpdateRowByHeaders_(sh, row, {
      DISPLAY_NAME: fields.DISPLAY_NAME,
      ACTIVE_VERSION: fields.ACTIVE_VERSION,
      DB_CONFIG_KEY: fields.DB_CONFIG_KEY,
      STATUS: fields.STATUS
    });
  } else {
    cbvCoreV2AppendRowByHeaders_(sh, fields);
  }

  var actor = cbvConfigModuleActor_(cmd);
  Config_logChange_({
    actorEmail: actor,
    changeType: 'CONFIG_REGISTER_MODULE',
    resourceType: 'MODULE',
    resourceKey: code,
    oldValue: row >= 2 ? 'update' : '',
    newValue: cbvCoreV2SafeStringify_(fields),
    commandId: cmd.commandId,
    payloadJson: cbvCoreV2SafeStringify_(p)
  });

  if (typeof CBV_Config_clearCache === 'function') CBV_Config_clearCache();
  cbvConfigModuleEmitChanged_(cmd, { entityType: 'MODULE', entityId: code });

  return {
    ok: true,
    entityType: 'CONFIG_MODULE',
    entityId: code,
    message: 'CONFIG_REGISTER_MODULE_OK',
    data: fields,
    error: null
  };
}

/**
 * @param {Object} cmd
 * @returns {Object}
 */
function Config_registerSheet_(cmd) {
  var p = cmd.payload || {};
  var moduleCode = String(p.moduleCode || p.MODULE_CODE || '').trim().toUpperCase();
  var tableCode = String(p.tableCode || p.TABLE_CODE || '').trim().toUpperCase();
  var sheetName = String(p.sheetName || p.SHEET_NAME || '').trim();
  var status = String(p.status || p.STATUS || 'ACTIVE').trim() || 'ACTIVE';
  if (!moduleCode || !tableCode || !sheetName) {
    return {
      ok: false,
      entityType: '',
      entityId: '',
      message: 'moduleCode, tableCode, sheetName required',
      data: {},
      error: { code: 'VALIDATION_ERROR', message: 'moduleCode, tableCode, sheetName required' }
    };
  }

  var ss = cbvConfigOpenSpreadsheet_();
  if (!ss) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG DB not available', data: {}, error: { code: 'CONFIG_DB_MISSING', message: 'CBV_CONFIG_DB_ID unset' } };
  }
  var sh = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.SHEET_REGISTRY);
  if (!sh) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG_SHEET_REGISTRY missing', data: {}, error: { code: 'CONFIG_SHEET_MISSING', message: 'CONFIG_SHEET_REGISTRY' } };
  }

  var map = cbvCoreV2ReadHeaderMap_(sh);
  var mcCol = map['MODULE_CODE'];
  var tcCol = map['TABLE_CODE'];
  if (mcCol && tcCol && sh.getLastRow() >= 2) {
    var last = sh.getLastRow();
    var r;
    for (r = 2; r <= last; r++) {
      if (
        String(sh.getRange(r, mcCol).getValue() || '').trim().toUpperCase() === moduleCode &&
        String(sh.getRange(r, tcCol).getValue() || '').trim().toUpperCase() === tableCode
      ) {
        cbvCoreV2UpdateRowByHeaders_(sh, r, { SHEET_NAME: sheetName, STATUS: status });
        var actorU = cbvConfigModuleActor_(cmd);
        Config_logChange_({
          actorEmail: actorU,
          changeType: 'CONFIG_REGISTER_SHEET',
          resourceType: 'SHEET_REGISTRY',
          resourceKey: moduleCode + ':' + tableCode,
          oldValue: 'update',
          newValue: sheetName,
          commandId: cmd.commandId,
          payloadJson: cbvCoreV2SafeStringify_(p)
        });
        if (typeof CBV_Config_clearCache === 'function') CBV_Config_clearCache();
        cbvConfigModuleEmitChanged_(cmd, { entityType: 'SHEET_REGISTRY', entityId: moduleCode + ':' + tableCode });
        return {
          ok: true,
          entityType: 'CONFIG_SHEET',
          entityId: moduleCode + ':' + tableCode,
          message: 'CONFIG_REGISTER_SHEET_UPDATED',
          data: { moduleCode: moduleCode, tableCode: tableCode, sheetName: sheetName },
          error: null
        };
      }
    }
  }

  cbvCoreV2AppendRowByHeaders_(sh, {
    MODULE_CODE: moduleCode,
    TABLE_CODE: tableCode,
    SHEET_NAME: sheetName,
    STATUS: status
  });

  var actor = cbvConfigModuleActor_(cmd);
  Config_logChange_({
    actorEmail: actor,
    changeType: 'CONFIG_REGISTER_SHEET',
    resourceType: 'SHEET_REGISTRY',
    resourceKey: moduleCode + ':' + tableCode,
    oldValue: '',
    newValue: sheetName,
    commandId: cmd.commandId,
    payloadJson: cbvCoreV2SafeStringify_(p)
  });

  if (typeof CBV_Config_clearCache === 'function') CBV_Config_clearCache();
  cbvConfigModuleEmitChanged_(cmd, { entityType: 'SHEET_REGISTRY', entityId: moduleCode + ':' + tableCode });

  return {
    ok: true,
    entityType: 'CONFIG_SHEET',
    entityId: moduleCode + ':' + tableCode,
    message: 'CONFIG_REGISTER_SHEET_OK',
    data: { moduleCode: moduleCode, tableCode: tableCode, sheetName: sheetName },
    error: null
  };
}

/**
 * @param {Object} cmd
 * @returns {Object}
 */
function Config_setFeatureFlag_(cmd) {
  var p = cmd.payload || {};
  var flagKey = String(p.flagKey || p.FLAG_KEY || '').trim();
  var flagValue = p.flagValue != null ? String(p.flagValue) : String(p.FLAG_VALUE != null ? p.FLAG_VALUE : '');
  if (!flagKey) {
    return { ok: false, entityType: '', entityId: '', message: 'flagKey required', data: {}, error: { code: 'VALIDATION_ERROR', message: 'flagKey required' } };
  }

  var ss = cbvConfigOpenSpreadsheet_();
  if (!ss) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG DB not available', data: {}, error: { code: 'CONFIG_DB_MISSING', message: 'CBV_CONFIG_DB_ID unset' } };
  }
  var name = CBV_CONFIG_MODULE.TABLES.FEATURE_FLAG;
  cbvCoreV2EnsureSheetWithHeadersOnSpreadsheet_(ss, name, CBV_CONFIG_MODULE.HEADERS.FEATURE_FLAG);
  var sh = ss.getSheetByName(name);
  if (!sh) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG_FEATURE_FLAG missing', data: {}, error: { code: 'CONFIG_SHEET_MISSING', message: name } };
  }

  var row = cbvCoreV2FindFirstRowInColumn_(sh, 'FLAG_KEY', flagKey);
  var now = cbvCoreV2IsoNow_();
  var actor = cbvConfigModuleActor_(cmd);
  var status = String(p.status || p.STATUS || 'ACTIVE').trim() || 'ACTIVE';
  var fmap = cbvCoreV2ReadHeaderMap_(sh);
  var oldVal = '';
  if (row >= 2 && fmap['FLAG_VALUE']) {
    oldVal = String(sh.getRange(row, fmap['FLAG_VALUE']).getValue() || '');
  }

  if (row >= 2) {
    cbvCoreV2UpdateRowByHeaders_(sh, row, {
      FLAG_VALUE: flagValue,
      STATUS: status,
      UPDATED_AT: now,
      UPDATED_BY: actor
    });
  } else {
    cbvCoreV2AppendRowByHeaders_(sh, {
      FLAG_KEY: flagKey,
      FLAG_VALUE: flagValue,
      STATUS: status,
      UPDATED_AT: now,
      UPDATED_BY: actor
    });
  }

  Config_logChange_({
    actorEmail: actor,
    changeType: 'CONFIG_SET_FEATURE_FLAG',
    resourceType: 'FEATURE_FLAG',
    resourceKey: flagKey,
    oldValue: oldVal,
    newValue: flagValue,
    commandId: cmd.commandId,
    payloadJson: cbvCoreV2SafeStringify_(p)
  });

  if (typeof CBV_Config_clearCache === 'function') CBV_Config_clearCache();
  cbvConfigModuleEmitChanged_(cmd, { entityType: 'FEATURE_FLAG', entityId: flagKey });

  return {
    ok: true,
    entityType: 'CONFIG_FEATURE_FLAG',
    entityId: flagKey,
    message: 'CONFIG_SET_FEATURE_FLAG_OK',
    data: { flagKey: flagKey, flagValue: flagValue },
    error: null
  };
}

/**
 * @param {Object} cmd
 * @returns {Object}
 */
function Config_healthCheckCommand_(cmd) {
  var h = Config_healthCheck_();
  return {
    ok: !!h.ok,
    entityType: 'CONFIG_HEALTH',
    entityId: 'aggregate',
    message: h.message,
    data: {
      issues: h.issues || [],
      missingSheets: h.missingSheets,
      missingModules: h.missingModules,
      invalidEnums: h.invalidEnums,
      invalidRules: h.invalidRules
    },
    error: h.ok ? null : { code: 'CONFIG_HEALTH_FAIL', message: h.message }
  };
}
