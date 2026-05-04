/**
 * CONFIG module — access & change tracking (CONFIG_ACCESS_LOG, CONFIG_CHANGE_LOG).
 * Dependencies: 150_CBV_CONFIG_RESOLVER.js, 160_CBV_CONFIG_MODULE_CONSTANTS.js, 01, 02
 */

/**
 * @param {Object} context
 * @param {string} context.actorEmail
 * @param {string} context.action
 * @param {string} context.resourceType
 * @param {string} context.resourceKey
 * @param {string} [context.payloadJson]
 * @param {string} [context.commandId]
 */
function Config_logAccess_(context) {
  var raw = context || {};
  var ctx = {};
  var rk;
  for (rk in raw) {
    if (Object.prototype.hasOwnProperty.call(raw, rk)) ctx[rk] = raw[rk];
  }
  if (ctx.key != null && String(ctx.key) !== '' && !ctx.resourceKey) {
    ctx.resourceKey = String(ctx.key);
  }
  if (!ctx.resourceType) {
    ctx.resourceType = 'CONFIG_RESOLVER';
  }
  if (!ctx.action) {
    ctx.action = 'ACCESS';
  }
  if (!ctx.actorEmail && (ctx.userEmail || ctx.requestBy)) {
    ctx.actorEmail = String(ctx.userEmail || ctx.requestBy || '').trim();
  }
  if (!ctx.payloadJson && (ctx.moduleCode != null || ctx.source != null)) {
    ctx.payloadJson = cbvCoreV2SafeStringify_({ callerModule: ctx.moduleCode || '', source: ctx.source || '' });
  }
  try {
    var ss = cbvConfigOpenSpreadsheet_();
    if (!ss) {
      Logger.log('[Config_logAccess_] skip: CONFIG DB not open (CBV_CONFIG_DB_ID unset?)');
      return;
    }
    var name = CBV_CONFIG_MODULE.TABLES.ACCESS_LOG;
    var headers = CBV_CONFIG_MODULE.HEADERS.ACCESS_LOG;
    cbvCoreV2EnsureSheetWithHeadersOnSpreadsheet_(ss, name, headers);
    var sh = ss.getSheetByName(name);
    if (!sh) return;
    var now = cbvCoreV2IsoNow_();
    cbvCoreV2AppendRowByHeaders_(sh, {
      LOG_ID: 'ACC' + Utilities.getUuid().replace(/-/g, '').slice(0, 12),
      ACTOR_EMAIL: String(ctx.actorEmail || '').trim(),
      ACTION: String(ctx.action || '').trim(),
      RESOURCE_TYPE: String(ctx.resourceType || '').trim(),
      RESOURCE_KEY: String(ctx.resourceKey || '').trim(),
      PAYLOAD_JSON: ctx.payloadJson != null ? String(ctx.payloadJson) : '',
      COMMAND_ID: String(ctx.commandId || '').trim(),
      CREATED_AT: now
    });
    Logger.log('[Config_logAccess_] ' + ctx.action + ' ' + ctx.resourceKey);
  } catch (e) {
    Logger.log('[Config_logAccess_] error: ' + (e && e.message ? e.message : e));
  }
}

/**
 * @param {Object} context
 * @param {string} context.actorEmail
 * @param {string} context.changeType
 * @param {string} context.resourceType
 * @param {string} context.resourceKey
 * @param {string} [context.oldValue]
 * @param {string} [context.newValue]
 * @param {string} [context.commandId]
 * @param {string} [context.payloadJson]
 */
function Config_logChange_(context) {
  var ctx = context || {};
  try {
    var ss = cbvConfigOpenSpreadsheet_();
    if (!ss) {
      Logger.log('[Config_logChange_] skip: CONFIG DB not open');
      return;
    }
    var name = CBV_CONFIG_MODULE.TABLES.CHANGE_LOG;
    var headers = CBV_CONFIG_MODULE.HEADERS.CHANGE_LOG;
    cbvCoreV2EnsureSheetWithHeadersOnSpreadsheet_(ss, name, headers);
    var sh = ss.getSheetByName(name);
    if (!sh) return;
    var now = cbvCoreV2IsoNow_();
    cbvCoreV2AppendRowByHeaders_(sh, {
      CHANGE_ID: 'CHG' + Utilities.getUuid().replace(/-/g, '').slice(0, 12),
      ACTOR_EMAIL: String(ctx.actorEmail || '').trim(),
      CHANGE_TYPE: String(ctx.changeType || '').trim(),
      RESOURCE_TYPE: String(ctx.resourceType || '').trim(),
      RESOURCE_KEY: String(ctx.resourceKey || '').trim(),
      OLD_VALUE: ctx.oldValue != null ? String(ctx.oldValue) : '',
      NEW_VALUE: ctx.newValue != null ? String(ctx.newValue) : '',
      COMMAND_ID: String(ctx.commandId || '').trim(),
      PAYLOAD_JSON: ctx.payloadJson != null ? String(ctx.payloadJson) : '',
      CREATED_AT: now
    });
    Logger.log('[Config_logChange_] ' + ctx.changeType + ' ' + ctx.resourceKey);
  } catch (e) {
    Logger.log('[Config_logChange_] error: ' + (e && e.message ? e.message : e));
  }
}
