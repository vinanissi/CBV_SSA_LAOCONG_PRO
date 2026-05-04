/**
 * CBV Level 6 Pro — CBV_PERMISSION_RULE evaluation.
 * Dependencies: 130, 133
 */

/**
 * @returns {Object[]}
 */
function cbvL6DefaultPermissionSeed_() {
  var now = cbvCoreV2IsoNow_();
  function row(ruleId, role, moduleCode, action, allow, condType, priority) {
    return {
      RULE_ID: ruleId,
      ROLE: role,
      MODULE_CODE: moduleCode,
      ACTION: action,
      ALLOW: allow,
      CONDITION_TYPE: condType,
      CONDITION_JSON: '',
      PRIORITY: priority,
      STATUS: 'ACTIVE',
      CREATED_AT: now,
      UPDATED_AT: now
    };
  }
  return [
    row('L6_ADMIN_ALL', 'ADMIN', '*', '*', 'TRUE', 'ALWAYS', 10),
    row('L6_DEV_ALL', 'DEV', '*', '*', 'TRUE', 'ALWAYS', 20),
    row('L6_USER_HOSO_CREATE', 'USER', 'HOSO', 'CREATE', 'TRUE', 'ALWAYS', 100),
    row('L6_USER_HOSO_UPDATE', 'USER', 'HOSO', 'UPDATE', 'TRUE', 'OWNER_ONLY', 110),
    row('L6_USER_HOSO_DELETE', 'USER', 'HOSO', 'DELETE', 'FALSE', 'ALWAYS', 120)
  ];
}

/**
 * @returns {Object}
 */
function CBV_L6_seedPermissionRules() {
  try {
    cbvL6EnsureCoreSheet_('PERMISSION_RULE', 'PERMISSION_RULE');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.PERMISSION_RULE);
    var seed = cbvL6DefaultPermissionSeed_();
    var i;
    for (i = 0; i < seed.length; i++) {
      var rec = seed[i];
      if (cbvCoreV2FindFirstRowInColumn_(sheet, 'RULE_ID', rec.RULE_ID) >= 2) continue;
      cbvCoreV2AppendRowByHeaders_(sheet, rec);
    }
    return { ok: true, code: 'L6_PERMISSION_SEEDED', message: 'OK', data: {}, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}

/**
 * @param {string} role
 * @returns {string}
 */
function cbvL6ResolveRole_(role) {
  var r = String(role || '').trim().toUpperCase();
  if (r) return r;
  try {
    if (typeof isAdminUser === 'function' && isAdminUser()) return 'ADMIN';
  } catch (e1) {
    /* ignore */
  }
  var email = '';
  try {
    email = String(cbvUser() || '').trim().toLowerCase();
  } catch (e2) {
    email = '';
  }
  if (!email || email === 'system') return 'USER';
  var sheetName =
    typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG && CBV_CONFIG.SHEETS
      ? CBV_CONFIG.SHEETS.USER_DIRECTORY
      : 'USER_DIRECTORY';
  var sh = cbvCoreV2GetSpreadsheet_().getSheetByName(sheetName);
  if (!sh) return 'USER';
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var emailCol = map['EMAIL'];
  var roleCol = map['ROLE'];
  if (!emailCol || !roleCol) return 'USER';
  var last = sh.getLastRow();
  if (last < 2) return 'USER';
  var emails = sh.getRange(2, emailCol, last, emailCol).getValues();
  var roles = sh.getRange(2, roleCol, last, roleCol).getValues();
  var i;
  for (i = 0; i < emails.length; i++) {
    if (String(emails[i][0] || '').trim().toLowerCase() === email) {
      return String(roles[i][0] || 'USER').trim().toUpperCase() || 'USER';
    }
  }
  return 'USER';
}

/**
 * @param {Object} rule — row from sheet
 * @param {Object} context
 * @returns {boolean|null} null = rule does not apply to condition
 */
function CBV_L6_evalPermissionCondition(rule, context) {
  var ct = String(rule.CONDITION_TYPE || '').toUpperCase();
  var c = context || {};
  if (ct === 'ALWAYS') return true;
  if (ct === 'OWNER_ONLY') {
    var oe = String(c.ownerEmail || c.owner || '').trim().toLowerCase();
    var ue = String(c.userEmail || '').trim().toLowerCase();
    return oe && ue && oe === ue;
  }
  if (ct === 'SOURCE_IN') {
    var arr = cbvCoreV2SafeParseJson_(rule.CONDITION_JSON);
    var sources = Array.isArray(arr) ? arr : (arr && arr.sources ? arr.sources : []);
    var src = String(c.source || '').toUpperCase();
    var j;
    for (j = 0; j < sources.length; j++) {
      if (String(sources[j] || '').toUpperCase() === src) return true;
    }
    return false;
  }
  if (ct === 'ROLE_IN') {
    var arr2 = cbvCoreV2SafeParseJson_(rule.CONDITION_JSON);
    var roles = Array.isArray(arr2) ? arr2 : (arr2 && arr2.roles ? arr2.roles : []);
    var role = String(c.role || '').toUpperCase();
    var k;
    for (k = 0; k < roles.length; k++) {
      if (String(roles[k] || '').toUpperCase() === role) return true;
    }
    return false;
  }
  if (ct === 'CUSTOM_JSON_BASIC') {
    var o = cbvCoreV2SafeParseJson_(rule.CONDITION_JSON);
    if (!o) return false;
    if (o.requireOwnerMatch) {
      return CBV_L6_evalPermissionCondition({ CONDITION_TYPE: 'OWNER_ONLY' }, c);
    }
    return true;
  }
  return true;
}

/**
 * Wildcard match for MODULE_CODE / ACTION.
 * @param {string} pattern
 * @param {string} value
 * @returns {boolean}
 */
function cbvL6MatchToken_(pattern, value) {
  var p = String(pattern || '').trim();
  var v = String(value || '').trim();
  if (p === '*' || p === '') return true;
  return p.toUpperCase() === v.toUpperCase();
}

/**
 * @param {Object} context
 * @returns {Object}
 */
function CBV_L6_checkPermission(context) {
  var ctx = context || {};
  var role = cbvL6ResolveRole_(ctx.role);
  ctx.role = role;
  ctx.userEmail = String(ctx.userEmail || (typeof cbvUser === 'function' ? cbvUser() : '') || '').trim().toLowerCase();
  var moduleCode = cbvL6NormalizeModuleCode_(ctx.moduleCode || '');
  var action = String(ctx.action || '').trim().toUpperCase();
  var source = String(ctx.source || '').toUpperCase();

  cbvL6EnsureCoreSheet_('PERMISSION_RULE', 'PERMISSION_RULE');
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.PERMISSION_RULE);
  if (!sheet) {
    return cbvL6PermissionFallback_(ctx, 'NO_RULE_SHEET');
  }

  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var last = sheet.getLastRow();
  if (last < 2) {
    return cbvL6PermissionFallback_(ctx, 'NO_RULES');
  }

  var rows = [];
  var r;
  for (r = 2; r <= last; r++) {
    var status = map['STATUS'] ? String(sheet.getRange(r, map['STATUS']).getValue() || '').toUpperCase() : 'ACTIVE';
    if (status === 'INACTIVE' || status === 'DISABLED') continue;
    var ruleRole = map['ROLE'] ? String(sheet.getRange(r, map['ROLE']).getValue() || '') : '';
    var ruleMod = map['MODULE_CODE'] ? String(sheet.getRange(r, map['MODULE_CODE']).getValue() || '') : '';
    var ruleAct = map['ACTION'] ? String(sheet.getRange(r, map['ACTION']).getValue() || '') : '';
    if (!cbvL6MatchToken_(ruleRole, role)) continue;
    if (!cbvL6MatchToken_(ruleMod, moduleCode)) continue;
    if (!cbvL6MatchToken_(ruleAct, action)) continue;
    var ruleObj = {};
    var keys = Object.keys(map);
    var i;
    for (i = 0; i < keys.length; i++) {
      var hk = keys[i];
      ruleObj[hk] = sheet.getRange(r, map[hk]).getValue();
    }
    var pri = Number(ruleObj.PRIORITY != null ? ruleObj.PRIORITY : 9999);
    rows.push({ priority: isNaN(pri) ? 9999 : pri, rule: ruleObj });
  }

  rows.sort(function (a, b) {
    return a.priority - b.priority;
  });

  var j;
  for (j = 0; j < rows.length; j++) {
    var item = rows[j].rule;
    var condOk = CBV_L6_evalPermissionCondition(item, ctx);
    if (!condOk) continue;
    var allow = String(item.ALLOW || '').toUpperCase() === 'TRUE' || String(item.ALLOW || '').toUpperCase() === 'YES';
    return {
      allowed: allow,
      reason: 'RULE:' + String(item.RULE_ID || ''),
      matchedRule: item.RULE_ID
    };
  }

  return cbvL6PermissionFallback_(ctx, 'NO_MATCHING_RULE');
}

/**
 * @param {Object} ctx
 * @param {string} reason
 * @returns {{ allowed: boolean, reason: string }}
 */
function cbvL6PermissionFallback_(ctx, reason) {
  var source = String(ctx.source || '').toUpperCase();
  var action = String(ctx.action || '').toUpperCase();
  var moduleCode = cbvL6NormalizeModuleCode_(ctx.moduleCode || '');
  if (source === 'TEST' || source === 'MENU' || source === 'SYSTEM' || source === '') {
    return { allowed: true, reason: 'FALLBACK_ALLOW_SOURCE:' + reason };
  }
  if (String(ctx.role || '').toUpperCase() === 'USER' && moduleCode === 'HOSO' && (action === 'DELETE' || action === 'ADMIN_PURGE')) {
    return { allowed: false, reason: 'FALLBACK_DENY_DANGEROUS:' + reason };
  }
  return { allowed: true, reason: 'FALLBACK_ALLOW_DEFAULT:' + reason };
}
