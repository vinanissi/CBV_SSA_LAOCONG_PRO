/**
 * CONFIG module — tracked reads (access log on CONFIG DB).
 * Prefer these over raw CBV_Config_get* in governed code paths.
 * Dependencies: 150_CBV_CONFIG_RESOLVER.js, 165_CBV_CONFIG_AUDIT.js
 */

/**
 * @param {string} key
 * @param {Object} [context]
 * @returns {string}
 */
function CBV_Config_getValueTracked(key, context) {
  var ctx = context || {};
  var value = CBV_Config_getValue(key);

  try {
    Config_logAccess_({
      key: key,
      moduleCode: ctx.moduleCode || '',
      source: ctx.source || '',
      action: 'GET_VALUE',
      actorEmail: String(ctx.userEmail || ctx.requestBy || '').trim(),
      commandId: String(ctx.commandId || '').trim(),
      payloadJson: typeof cbvCoreV2SafeStringify_ === 'function' ? cbvCoreV2SafeStringify_(ctx) : ''
    });
  } catch (e) {
    Logger.log('[CBV_Config_getValueTracked] log: ' + (e && e.message ? e.message : e));
  }

  return value;
}

/**
 * @param {string} moduleCode
 * @param {Object} [context]
 * @returns {string}
 */
function CBV_Config_getDbIdTracked(moduleCode, context) {
  var ctx = context || {};
  var dbId = CBV_Config_getDbId(moduleCode);

  try {
    Config_logAccess_({
      key: 'DB_ID:' + moduleCode,
      moduleCode: ctx.moduleCode || '',
      source: ctx.source || '',
      action: 'GET_DB_ID',
      actorEmail: String(ctx.userEmail || ctx.requestBy || '').trim(),
      commandId: String(ctx.commandId || '').trim(),
      payloadJson: typeof cbvCoreV2SafeStringify_ === 'function' ? cbvCoreV2SafeStringify_(ctx) : ''
    });
  } catch (e) {
    Logger.log('[CBV_Config_getDbIdTracked] log: ' + (e && e.message ? e.message : e));
  }

  return dbId;
}

/**
 * @param {string} moduleCode
 * @param {string} tableCode
 * @param {Object} [context]
 * @returns {string}
 */
function CBV_Config_getSheetNameTracked(moduleCode, tableCode, context) {
  var ctx = context || {};
  var name = CBV_Config_getSheetName(moduleCode, tableCode);

  try {
    Config_logAccess_({
      key: moduleCode + ':' + tableCode,
      moduleCode: ctx.moduleCode || '',
      source: ctx.source || '',
      action: 'GET_SHEET_NAME',
      actorEmail: String(ctx.userEmail || ctx.requestBy || '').trim(),
      commandId: String(ctx.commandId || '').trim(),
      payloadJson: typeof cbvCoreV2SafeStringify_ === 'function' ? cbvCoreV2SafeStringify_(ctx) : ''
    });
  } catch (e) {
    Logger.log('[CBV_Config_getSheetNameTracked] log: ' + (e && e.message ? e.message : e));
  }

  return name;
}
