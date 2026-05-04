/**
 * CONFIG V2_2 — map một hàng nguồn → thao tác upsert (target + values theo header đích).
 * Dependencies: 01 (cbvCoreV2SafeStringify_), 196
 */

/**
 * @param {Object<string, *>} rowObj
 * @param {string} name
 * @returns {string}
 */
function cbvConfigV22ImportGetCi_(rowObj, name) {
  var w = String(name || '').toUpperCase();
  var ks = Object.keys(rowObj || {});
  var i;
  for (i = 0; i < ks.length; i++) {
    if (String(ks[i]).toUpperCase() === w) return rowObj[ks[i]] != null ? String(rowObj[ks[i]]) : '';
  }
  return '';
}

/**
 * @param {*} v
 * @returns {string} ACTIVE | INACTIVE
 */
function cbvConfigV22ImportBoolToStatus_(v) {
  var s = String(v != null ? v : '').trim().toUpperCase();
  if (s === 'TRUE' || s === 'YES' || s === '1' || s === 'Y' || s === 'ACTIVE') return 'ACTIVE';
  if (s === 'FALSE' || s === 'NO' || s === '0' || s === 'N' || s === 'INACTIVE') return 'INACTIVE';
  if (!s) return 'ACTIVE';
  return 'ACTIVE';
}

/**
 * @param {string} sourceSheetName
 * @param {Object<string, *>} rowObj
 * @returns {{ target: string, naturalKey: Object<string, string>, values: Object<string, *> }[]}
 */
function cbvConfigV22ImportMapRows_(sourceSheetName, rowObj) {
  var out = [];
  var sn = String(sourceSheetName || '').trim();

  if (sn === 'ENUM_DICTIONARY') {
    var g1 = cbvConfigV22ImportGetCi_(rowObj, 'ENUM_GROUP').trim();
    var k1 = cbvConfigV22ImportGetCi_(rowObj, 'ENUM_VALUE').trim();
    if (!g1 || !k1) return out;
    var st1 = cbvConfigV22ImportBoolToStatus_(cbvConfigV22ImportGetCi_(rowObj, 'IS_ACTIVE'));
    out.push({
      target: 'CONFIG_ENUM',
      naturalKey: { ENUM_GROUP: g1, ENUM_KEY: k1 },
      values: {
        ENUM_GROUP: g1,
        ENUM_KEY: k1,
        ENUM_VALUE: cbvConfigV22ImportGetCi_(rowObj, 'DISPLAY_TEXT').trim() || k1,
        STATUS: st1,
        SORT_ORDER: cbvConfigV22ImportGetCi_(rowObj, 'SORT_ORDER'),
        NOTE: cbvConfigV22ImportGetCi_(rowObj, 'NOTE')
      }
    });
    return out;
  }

  if (sn === 'MASTER_CODE') {
    var g2 = cbvConfigV22ImportGetCi_(rowObj, 'MASTER_GROUP').trim();
    var k2 = cbvConfigV22ImportGetCi_(rowObj, 'CODE').trim();
    if (!g2 || !k2) return out;
    out.push({
      target: 'CONFIG_ENUM',
      naturalKey: { ENUM_GROUP: g2, ENUM_KEY: k2 },
      values: {
        ENUM_GROUP: g2,
        ENUM_KEY: k2,
        ENUM_VALUE: cbvConfigV22ImportGetCi_(rowObj, 'DISPLAY_TEXT').trim() || cbvConfigV22ImportGetCi_(rowObj, 'NAME').trim() || k2,
        STATUS: (cbvConfigV22ImportGetCi_(rowObj, 'STATUS').trim() || 'ACTIVE').toUpperCase(),
        SORT_ORDER: cbvConfigV22ImportGetCi_(rowObj, 'SORT_ORDER'),
        NOTE: cbvConfigV22ImportGetCi_(rowObj, 'NOTE')
      }
    });
    return out;
  }

  if (sn === 'DON_VI') {
    var k3 = cbvConfigV22ImportGetCi_(rowObj, 'CODE').trim();
    if (!k3) return out;
    var g3 = 'DON_VI';
    var disp = cbvConfigV22ImportGetCi_(rowObj, 'DISPLAY_TEXT').trim() || cbvConfigV22ImportGetCi_(rowObj, 'NAME').trim();
    out.push({
      target: 'CONFIG_ENUM',
      naturalKey: { ENUM_GROUP: g3, ENUM_KEY: k3 },
      values: {
        ENUM_GROUP: g3,
        ENUM_KEY: k3,
        ENUM_VALUE: disp || k3,
        STATUS: (cbvConfigV22ImportGetCi_(rowObj, 'STATUS').trim() || 'ACTIVE').toUpperCase(),
        SORT_ORDER: cbvConfigV22ImportGetCi_(rowObj, 'SORT_ORDER'),
        NOTE: cbvConfigV22ImportGetCi_(rowObj, 'NOTE')
      }
    });
    return out;
  }

  if (sn === 'RULE_DEF') {
    var rc = cbvConfigV22ImportGetCi_(rowObj, 'RULE_CODE').trim();
    if (!rc) return out;
    var mod = cbvConfigV22ImportGetCi_(rowObj, 'TARGET_MODULE').trim() || '*';
    var ev = cbvConfigV22ImportGetCi_(rowObj, 'EVENT_TYPE').trim();
    var cj = cbvConfigV22ImportGetCi_(rowObj, 'CONDITION_JSON').trim();
    var aj = cbvConfigV22ImportGetCi_(rowObj, 'ACTIONS_JSON').trim();
    var en = cbvConfigV22ImportGetCi_(rowObj, 'ENABLED');
    var pr = cbvConfigV22ImportGetCi_(rowObj, 'PRIORITY');
    var nt = cbvConfigV22ImportGetCi_(rowObj, 'NOTE');
    var ver = cbvConfigV22ImportGetCi_(rowObj, 'VERSION');
    var ruleJson = {
      eventType: ev,
      conditionJson: cj,
      actionsJson: aj,
      priority: pr,
      note: nt,
      version: ver,
      sourceSheet: 'RULE_DEF',
      sourceRuleCode: rc
    };
    out.push({
      target: 'CONFIG_RULE',
      naturalKey: { RULE_KEY: rc, MODULE_CODE: mod },
      values: {
        MODULE_CODE: mod,
        RULE_KEY: rc,
        RULE_TYPE: 'EVENT_RULE',
        RULE_JSON: cbvCoreV2SafeStringify_(ruleJson),
        STATUS: cbvConfigV22ImportBoolToStatus_(en)
      }
    });
    return out;
  }

  if (sn === 'DOC_REQUIREMENT') {
    var hst = cbvConfigV22ImportGetCi_(rowObj, 'HO_SO_TYPE').trim();
    var doc = cbvConfigV22ImportGetCi_(rowObj, 'DOC_TYPE').trim();
    if (!hst || !doc) return out;
    var rk = 'DOC_REQUIREMENT_' + hst + '_' + doc;
    var req = cbvConfigV22ImportGetCi_(rowObj, 'IS_REQUIRED');
    var ena = cbvConfigV22ImportGetCi_(rowObj, 'ENABLED');
    var active = false;
    var rs = req.toUpperCase();
    var es = ena.toUpperCase();
    if (rs === 'TRUE' || rs === 'YES' || rs === '1' || rs === 'Y') active = true;
    if (es === 'TRUE' || es === 'YES' || es === '1' || es === 'Y') active = true;
    if (cbvConfigV22ImportBoolToStatus_(cbvConfigV22ImportGetCi_(rowObj, 'IS_ACTIVE')) === 'ACTIVE') active = true;
    out.push({
      target: 'CONFIG_RULE',
      naturalKey: { RULE_KEY: rk, MODULE_CODE: 'HOSO' },
      values: {
        MODULE_CODE: 'HOSO',
        RULE_KEY: rk,
        RULE_TYPE: 'DOC_REQUIREMENT',
        RULE_JSON: cbvCoreV2SafeStringify_(rowObj),
        STATUS: active ? 'ACTIVE' : 'INACTIVE'
      }
    });
    return out;
  }

  if (sn === 'USER_DIRECTORY') {
    var em = cbvConfigV22ImportGetCi_(rowObj, 'EMAIL').trim().toLowerCase();
    if (!em) return out;
    out.push({
      target: 'CONFIG_PERMISSION',
      naturalKey: { EMAIL: em },
      values: {
        EMAIL: em,
        ROLE: cbvConfigV22ImportGetCi_(rowObj, 'ROLE').trim(),
        STATUS: (cbvConfigV22ImportGetCi_(rowObj, 'STATUS').trim() || 'ACTIVE').toUpperCase(),
        ALLOW_LOGIN: cbvConfigV22ImportGetCi_(rowObj, 'ALLOW_LOGIN'),
        IS_SYSTEM: cbvConfigV22ImportGetCi_(rowObj, 'IS_SYSTEM'),
        DISPLAY_NAME: cbvConfigV22ImportGetCi_(rowObj, 'DISPLAY_NAME'),
        PHONE: cbvConfigV22ImportGetCi_(rowObj, 'PHONE'),
        POSITION: cbvConfigV22ImportGetCi_(rowObj, 'POSITION'),
        RULE_KEY: em,
        MODULE_CODE: CBV_CONFIG_V22_IMPORT.PERMISSION_MODULE_CODE,
        CONFIG_JSON: cbvCoreV2SafeStringify_({
          EMAIL: em,
          ROLE: cbvConfigV22ImportGetCi_(rowObj, 'ROLE').trim(),
          STATUS: cbvConfigV22ImportGetCi_(rowObj, 'STATUS').trim(),
          ALLOW_LOGIN: cbvConfigV22ImportGetCi_(rowObj, 'ALLOW_LOGIN'),
          IS_SYSTEM: cbvConfigV22ImportGetCi_(rowObj, 'IS_SYSTEM'),
          DISPLAY_NAME: cbvConfigV22ImportGetCi_(rowObj, 'DISPLAY_NAME'),
          PHONE: cbvConfigV22ImportGetCi_(rowObj, 'PHONE'),
          POSITION: cbvConfigV22ImportGetCi_(rowObj, 'POSITION'),
          sourceSheet: 'USER_DIRECTORY'
        })
      }
    });
    return out;
  }

  if (sn === 'FIN_EXPORT_FILTER') {
    var fid = cbvConfigV22ImportGetCi_(rowObj, 'ID').trim();
    var mc = CBV_CONFIG_V22_IMPORT.FIN_EXPORT_MAPPING_PREFIX + (fid ? '_' + fid : '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 8));
    out.push({
      target: 'CONFIG_IMPORT_MAPPING',
      naturalKey: { MAPPING_CODE: mc },
      values: {
        MAPPING_CODE: mc,
        MODULE_CODE: 'FINANCE',
        STATUS: 'ACTIVE',
        CONFIG_JSON: cbvCoreV2SafeStringify_(rowObj)
      }
    });
    return out;
  }

  return out;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {Object<string, *>[]}
 */
function cbvConfigV22ImportReadSheetAsObjects_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  var width = cbvCoreV2SheetOutputWidth_(sheet);
  if (width < 1) return [];
  var range = sheet.getRange(1, 1, sheet.getLastRow(), width);
  var grid = range.getValues();
  if (!grid.length) return [];
  var headers = grid[0];
  var out = [];
  var r;
  for (r = 1; r < grid.length; r++) {
    var o = {};
    var c;
    for (c = 0; c < headers.length; c++) {
      var hk = String(headers[c] != null ? headers[c] : '').trim();
      if (!hk) continue;
      o[hk] = grid[r][c];
    }
    if (Object.keys(o).length) out.push(o);
  }
  return out;
}
