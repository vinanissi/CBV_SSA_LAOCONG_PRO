/**
 * Event-driven core — load RULE_DEF and evaluate CONDITION_JSON (safe DSL, no eval).
 * Depends: 03_SHARED_REPOSITORY, 00_CORE_CONFIG, 04_CORE_EVENT_TYPES.
 */

/**
 * @param {string} eventType
 * @returns {Array<Object>}
 */
function loadRulesForEventType_(eventType) {
  var et = String(eventType || '').trim();
  if (!et) return [];
  var sheetName = CBV_CONFIG.SHEETS.RULE_DEF;
  var sheet = _sheet(sheetName);
  var rows = _rows(sheet);
  var out = [];
  var i;
  for (i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r || String(r.EVENT_TYPE || '').trim() !== et) continue;
    if (!_ruleRowEnabled_(r)) continue;
    out.push(r);
  }
  out.sort(function(a, b) {
    return Number(a.PRIORITY || 0) - Number(b.PRIORITY || 0);
  });
  return out;
}

/**
 * @param {Object} row
 * @returns {boolean}
 */
function _ruleRowEnabled_(row) {
  if (!row) return false;
  var e = row.ENABLED;
  if (e === true) return true;
  var s = String(e || '').trim().toUpperCase();
  return s === 'TRUE' || s === 'YES';
}

/**
 * @param {string|Object} conditionJson
 * @param {Object} context - { payload: Object }
 * @returns {boolean}
 */
function evaluateCoreCondition_(conditionJson, context) {
  if (conditionJson == null || conditionJson === '') return true;
  var cond = conditionJson;
  if (typeof cond === 'string') {
    try {
      cond = JSON.parse(cond);
    } catch (e) {
      Logger.log('[evaluateCoreCondition_] invalid JSON: ' + cond);
      return false;
    }
  }
  if (!cond || typeof cond !== 'object') return true;
  if (cond.all && Array.isArray(cond.all)) {
    var j;
    for (j = 0; j < cond.all.length; j++) {
      if (!_evaluateCoreClause_(cond.all[j], context)) return false;
    }
    return true;
  }
  if (cond.any && Array.isArray(cond.any)) {
    var k;
    for (k = 0; k < cond.any.length; k++) {
      if (_evaluateCoreClause_(cond.any[k], context)) return true;
    }
    return false;
  }
  return _evaluateCoreClause_(cond, context);
}

/**
 * @param {Object} clause
 * @param {Object} context
 * @returns {boolean}
 */
function _evaluateCoreClause_(clause, context) {
  if (!clause || typeof clause !== 'object') return true;
  var field = String(clause.field || '');
  var op = String(clause.op || 'eq').toLowerCase();
  var val = clause.value;
  var actual = _coreGetPath_(context, field);
  if (op === 'eq') return String(actual) === String(val);
  if (op === 'ne') return String(actual) !== String(val);
  if (op === 'in' && Array.isArray(val)) return val.map(String).indexOf(String(actual)) !== -1;
  return false;
}

/**
 * @param {Object} root
 * @param {string} path - e.g. payload.newStatus
 * @returns {*}
 */
function _coreGetPath_(root, path) {
  if (!path) return undefined;
  var parts = String(path).split('.');
  var cur = root;
  var p;
  for (p = 0; p < parts.length; p++) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[parts[p]];
  }
  return cur;
}

/**
 * @param {string|Array} actionsJson
 * @returns {Array<Object>}
 */
function parseCoreActionsJson_(actionsJson) {
  if (actionsJson == null || actionsJson === '') return [];
  if (Array.isArray(actionsJson)) return actionsJson;
  if (typeof actionsJson === 'string') {
    try {
      var a = JSON.parse(actionsJson);
      return Array.isArray(a) ? a : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}
