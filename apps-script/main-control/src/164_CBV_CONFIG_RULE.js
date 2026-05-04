/**
 * CONFIG module — RULE table (CONFIG_RULE).
 * Dependencies: 150, 160, 02, 165
 */

/**
 * @param {string} moduleCode
 * @returns {Object[]}
 */
function Config_getRules_(moduleCode) {
  var out = [];
  var ss = cbvConfigOpenSpreadsheet_();
  if (!ss) return out;
  var sh = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.RULE);
  if (!sh || sh.getLastRow() < 2) return out;
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var mcCol = map['MODULE_CODE'];
  if (!mcCol) return out;
  var want = String(moduleCode || '').trim().toUpperCase();
  var last = sh.getLastRow();
  var hdrKeys = Object.keys(map);
  var r;
  for (r = 2; r <= last; r++) {
    var mc = String(sh.getRange(r, mcCol).getValue() || '').trim().toUpperCase();
    if (want && mc !== want && mc !== '*') continue;
    var o = {};
    var ki;
    for (ki = 0; ki < hdrKeys.length; ki++) {
      var h = hdrKeys[ki];
      o[h] = sh.getRange(r, map[h]).getValue();
    }
    out.push(o);
  }
  return out;
}

/**
 * @param {Object} cmd
 * @returns {Object}
 */
function Config_addRule_(cmd) {
  var p = cmd.payload || {};
  var moduleCode = String(p.moduleCode || p.MODULE_CODE || '*').trim() || '*';
  var ruleKey = String(p.ruleKey || p.RULE_KEY || '').trim();
  var ruleType = String(p.ruleType || p.RULE_TYPE || 'GENERIC').trim() || 'GENERIC';
  var ruleJson = p.ruleJson != null ? String(p.ruleJson) : String(p.RULE_JSON != null ? p.RULE_JSON : '{}');
  if (!ruleKey) {
    return { ok: false, entityType: '', entityId: '', message: 'ruleKey required', data: {}, error: { code: 'VALIDATION_ERROR', message: 'ruleKey required' } };
  }

  var ss = cbvConfigOpenSpreadsheet_();
  if (!ss) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG DB not available', data: {}, error: { code: 'CONFIG_DB_MISSING', message: 'CBV_CONFIG_DB_ID unset' } };
  }
  var sh = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.RULE);
  if (!sh) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG_RULE missing', data: {}, error: { code: 'CONFIG_SHEET_MISSING', message: 'CONFIG_RULE' } };
  }

  var map = cbvCoreV2ReadHeaderMap_(sh);
  var rkCol = map['RULE_KEY'];
  var mcCol = map['MODULE_CODE'];
  if (rkCol && mcCol && sh.getLastRow() >= 2) {
    var last = sh.getLastRow();
    var r;
    for (r = 2; r <= last; r++) {
      if (
        String(sh.getRange(r, rkCol).getValue() || '').trim() === ruleKey &&
        String(sh.getRange(r, mcCol).getValue() || '').trim().toUpperCase() === moduleCode.toUpperCase()
      ) {
        Logger.log('[Config_addRule_] idempotent skip ' + moduleCode + '/' + ruleKey);
        var rid = map['RULE_ID'] ? String(sh.getRange(r, map['RULE_ID']).getValue() || '') : '';
        return {
          ok: true,
          entityType: 'CONFIG_RULE',
          entityId: rid || ruleKey,
          message: 'RULE_ALREADY_EXISTS',
          data: { moduleCode: moduleCode, ruleKey: ruleKey, row: r },
          error: null
        };
      }
    }
  }

  var now = cbvCoreV2IsoNow_();
  var id = String(p.ruleId || p.RULE_ID || '').trim() || 'RUL' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
  cbvCoreV2AppendRowByHeaders_(sh, {
    RULE_ID: id,
    MODULE_CODE: moduleCode,
    RULE_KEY: ruleKey,
    RULE_TYPE: ruleType,
    RULE_JSON: ruleJson,
    STATUS: String(p.status || p.STATUS || 'ACTIVE').trim() || 'ACTIVE',
    CREATED_AT: now,
    UPDATED_AT: now
  });

  var actor = '';
  try {
    actor = String(cbvUser() || cmd.requestBy || '').trim();
  } catch (e) {
    actor = String(cmd.requestBy || '');
  }
  Config_logChange_({
    actorEmail: actor,
    changeType: 'CONFIG_RULE_ADD',
    resourceType: 'RULE',
    resourceKey: moduleCode + '/' + ruleKey,
    oldValue: '',
    newValue: ruleJson,
    commandId: cmd.commandId,
    payloadJson: cbvCoreV2SafeStringify_(p)
  });

  if (typeof CBV_Config_clearCache === 'function') CBV_Config_clearCache();

  return {
    ok: true,
    entityType: 'CONFIG_RULE',
    entityId: id,
    message: 'CONFIG_RULE_ADDED',
    data: { ruleId: id, moduleCode: moduleCode, ruleKey: ruleKey },
    error: null
  };
}
