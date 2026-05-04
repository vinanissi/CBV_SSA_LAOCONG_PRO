/**
 * CONFIG module — ENUM table (CONFIG_ENUM).
 * Dependencies: 150, 160, 02, 165
 */

/**
 * @param {string} group
 * @returns {Object[]} rows as plain objects
 */
function Config_getEnum_(group) {
  var out = [];
  var ss = cbvConfigOpenSpreadsheet_();
  if (!ss) return out;
  var sh = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.ENUM);
  if (!sh || sh.getLastRow() < 2) return out;
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var gCol = map['ENUM_GROUP'];
  if (!gCol) return out;
  var want = String(group || '').trim().toUpperCase();
  var last = sh.getLastRow();
  var hdrKeys = Object.keys(map);
  var r;
  for (r = 2; r <= last; r++) {
    if (String(sh.getRange(r, gCol).getValue() || '').trim().toUpperCase() !== want) continue;
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
 * @returns {Object} handler fragment
 */
function Config_addEnum_(cmd) {
  var p = cmd.payload || {};
  var group = String(p.enumGroup || p.ENUM_GROUP || '').trim();
  var key = String(p.enumKey || p.ENUM_KEY || '').trim();
  var val = p.enumValue != null ? String(p.enumValue) : String(p.ENUM_VALUE != null ? p.ENUM_VALUE : '');
  var status = String(p.status || p.STATUS || 'ACTIVE').trim() || 'ACTIVE';
  if (!group || !key) {
    return { ok: false, entityType: '', entityId: '', message: 'enumGroup and enumKey required', data: {}, error: { code: 'VALIDATION_ERROR', message: 'enumGroup and enumKey required' } };
  }

  var ss = cbvConfigOpenSpreadsheet_();
  if (!ss) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG DB not available', data: {}, error: { code: 'CONFIG_DB_MISSING', message: 'CBV_CONFIG_DB_ID unset' } };
  }

  var sh = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.ENUM);
  if (!sh) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG_ENUM missing', data: {}, error: { code: 'CONFIG_SHEET_MISSING', message: 'CONFIG_ENUM' } };
  }
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var gCol = map['ENUM_GROUP'];
  var kCol = map['ENUM_KEY'];
  if (!gCol || !kCol) {
    return { ok: false, entityType: '', entityId: '', message: 'ENUM headers incomplete', data: {}, error: { code: 'CONFIG_SCHEMA_ERROR', message: 'ENUM_GROUP/ENUM_KEY' } };
  }

  var last = sh.getLastRow();
  var r;
  for (r = 2; r <= last; r++) {
    if (
      String(sh.getRange(r, gCol).getValue() || '').trim() === group &&
      String(sh.getRange(r, kCol).getValue() || '').trim() === key
    ) {
      Logger.log('[Config_addEnum_] idempotent skip existing ' + group + '/' + key);
      var exId = map['ENUM_ID'] ? String(sh.getRange(r, map['ENUM_ID']).getValue() || '') : '';
      return {
        ok: true,
        entityType: 'CONFIG_ENUM',
        entityId: exId || group + ':' + key,
        message: 'ENUM_ALREADY_EXISTS',
        data: { enumGroup: group, enumKey: key, row: r },
        error: null
      };
    }
  }

  var now = cbvCoreV2IsoNow_();
  var id = String(p.enumId || p.ENUM_ID || '').trim() || 'ENU' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
  cbvCoreV2AppendRowByHeaders_(sh, {
    ENUM_ID: id,
    ENUM_GROUP: group,
    ENUM_KEY: key,
    ENUM_VALUE: val,
    STATUS: status,
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
    changeType: 'CONFIG_ENUM_ADD',
    resourceType: 'ENUM',
    resourceKey: group + '/' + key,
    oldValue: '',
    newValue: val,
    commandId: cmd.commandId,
    payloadJson: cbvCoreV2SafeStringify_(p)
  });

  if (typeof CBV_Config_clearCache === 'function') CBV_Config_clearCache();

  return {
    ok: true,
    entityType: 'CONFIG_ENUM',
    entityId: id,
    message: 'CONFIG_ENUM_ADDED',
    data: { enumId: id, enumGroup: group, enumKey: key },
    error: null
  };
}

/**
 * @param {Object} cmd
 * @returns {Object}
 */
function Config_updateEnum_(cmd) {
  var p = cmd.payload || {};
  var id = String(p.enumId || p.ENUM_ID || '').trim();
  var group = String(p.enumGroup || p.ENUM_GROUP || '').trim();
  var key = String(p.enumKey || p.ENUM_KEY || '').trim();

  var ss = cbvConfigOpenSpreadsheet_();
  if (!ss) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG DB not available', data: {}, error: { code: 'CONFIG_DB_MISSING', message: 'CBV_CONFIG_DB_ID unset' } };
  }
  var sh = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.ENUM);
  if (!sh || sh.getLastRow() < 2) {
    return { ok: false, entityType: '', entityId: '', message: 'CONFIG_ENUM empty', data: {}, error: { code: 'NOT_FOUND', message: 'CONFIG_ENUM' } };
  }
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var row = -1;
  if (id && map['ENUM_ID']) {
    row = cbvCoreV2FindFirstRowInColumn_(sh, 'ENUM_ID', id);
  }
  if (row < 2 && group && key && map['ENUM_GROUP'] && map['ENUM_KEY']) {
    var gCol = map['ENUM_GROUP'];
    var kCol = map['ENUM_KEY'];
    var last = sh.getLastRow();
    var r;
    for (r = 2; r <= last; r++) {
      if (String(sh.getRange(r, gCol).getValue() || '').trim() === group && String(sh.getRange(r, kCol).getValue() || '').trim() === key) {
        row = r;
        break;
      }
    }
  }
  if (row < 2) {
    return { ok: false, entityType: '', entityId: '', message: 'ENUM row not found', data: {}, error: { code: 'NOT_FOUND', message: 'ENUM row not found' } };
  }

  var oldVal = '';
  if (map['ENUM_VALUE']) oldVal = String(sh.getRange(row, map['ENUM_VALUE']).getValue() || '');
  var now = cbvCoreV2IsoNow_();
  var updates = { UPDATED_AT: now };
  if (p.enumValue != null || p.ENUM_VALUE != null) updates.ENUM_VALUE = String(p.enumValue != null ? p.enumValue : p.ENUM_VALUE);
  if (p.status != null || p.STATUS != null) updates.STATUS = String(p.status != null ? p.status : p.STATUS);
  cbvCoreV2UpdateRowByHeaders_(sh, row, updates);

  var newVal = map['ENUM_VALUE'] ? String(sh.getRange(row, map['ENUM_VALUE']).getValue() || '') : '';
  var actor = '';
  try {
    actor = String(cbvUser() || cmd.requestBy || '').trim();
  } catch (e2) {
    actor = String(cmd.requestBy || '');
  }
  Config_logChange_({
    actorEmail: actor,
    changeType: 'CONFIG_ENUM_UPDATE',
    resourceType: 'ENUM',
    resourceKey: id || group + '/' + key,
    oldValue: oldVal,
    newValue: newVal,
    commandId: cmd.commandId,
    payloadJson: cbvCoreV2SafeStringify_(p)
  });

  if (typeof CBV_Config_clearCache === 'function') CBV_Config_clearCache();

  return {
    ok: true,
    entityType: 'CONFIG_ENUM',
    entityId: id || group + ':' + key,
    message: 'CONFIG_ENUM_UPDATED',
    data: { row: row },
    error: null
  };
}
