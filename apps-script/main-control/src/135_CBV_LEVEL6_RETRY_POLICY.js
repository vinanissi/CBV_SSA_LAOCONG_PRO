/**
 * CBV Level 6 Pro — retry policies (CBV_RETRY_POLICY).
 * Dependencies: 130
 */

/**
 * @returns {Object[]}
 */
function cbvL6DefaultRetrySeed_() {
  var now = cbvCoreV2IsoNow_();
  return [
    {
      POLICY_ID: 'DEFAULT_EVENT_RETRY',
      MODULE_CODE: '*',
      EVENT_TYPE: '*',
      MAX_RETRY: 3,
      BACKOFF_TYPE: 'EXPONENTIAL',
      BASE_DELAY_SECONDS: 60,
      MAX_DELAY_SECONDS: 3600,
      DEAD_LETTER_AFTER: 3,
      STATUS: 'ACTIVE',
      UPDATED_AT: now
    },
    {
      POLICY_ID: 'HOSO_PRINT_RETRY',
      MODULE_CODE: 'HOSO',
      EVENT_TYPE: 'HOSO_PRINT_REQUESTED',
      MAX_RETRY: 5,
      BACKOFF_TYPE: 'EXPONENTIAL',
      BASE_DELAY_SECONDS: 120,
      MAX_DELAY_SECONDS: 7200,
      DEAD_LETTER_AFTER: 5,
      STATUS: 'ACTIVE',
      UPDATED_AT: now
    }
  ];
}

/**
 * @returns {Object}
 */
function CBV_L6_seedRetryPolicies() {
  try {
    cbvL6EnsureCoreSheet_('RETRY_POLICY', 'RETRY_POLICY');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.RETRY_POLICY);
    var seed = cbvL6DefaultRetrySeed_();
    var i;
    for (i = 0; i < seed.length; i++) {
      var rec = seed[i];
      if (cbvCoreV2FindFirstRowInColumn_(sheet, 'POLICY_ID', rec.POLICY_ID) >= 2) continue;
      cbvCoreV2AppendRowByHeaders_(sheet, rec);
    }
    return { ok: true, code: 'L6_RETRY_SEEDED', message: 'OK', data: {}, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}

/**
 * @param {Object} row
 * @returns {Object}
 */
function cbvL6CoerceRetryPolicyRow_(row) {
  if (!row) return null;
  return {
    POLICY_ID: row.POLICY_ID,
    MODULE_CODE: String(row.MODULE_CODE || '*'),
    EVENT_TYPE: String(row.EVENT_TYPE || '*'),
    MAX_RETRY: Number(row.MAX_RETRY != null ? row.MAX_RETRY : 3),
    BACKOFF_TYPE: String(row.BACKOFF_TYPE || 'EXPONENTIAL').toUpperCase(),
    BASE_DELAY_SECONDS: Number(row.BASE_DELAY_SECONDS != null ? row.BASE_DELAY_SECONDS : 60),
    MAX_DELAY_SECONDS: Number(row.MAX_DELAY_SECONDS != null ? row.MAX_DELAY_SECONDS : 3600),
    DEAD_LETTER_AFTER: Number(row.DEAD_LETTER_AFTER != null ? row.DEAD_LETTER_AFTER : 3),
    STATUS: String(row.STATUS || 'ACTIVE')
  };
}

/**
 * @param {string} moduleCode
 * @param {string} eventType
 * @returns {Object|null}
 */
function CBV_L6_getRetryPolicy(moduleCode, eventType) {
  var mod = cbvL6NormalizeModuleCode_(moduleCode);
  var ev = String(eventType || '').trim();
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.RETRY_POLICY);
  if (!sheet) return null;
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var last = sheet.getLastRow();
  if (last < 2) return null;

  var best = null;
  var bestScore = -1;
  var r;
  for (r = 2; r <= last; r++) {
    var st = map['STATUS'] ? String(sheet.getRange(r, map['STATUS']).getValue() || '').toUpperCase() : 'ACTIVE';
    if (st === 'INACTIVE') continue;
    var rMod = map['MODULE_CODE'] ? String(sheet.getRange(r, map['MODULE_CODE']).getValue() || '').trim() : '';
    var rEv = map['EVENT_TYPE'] ? String(sheet.getRange(r, map['EVENT_TYPE']).getValue() || '').trim() : '';
    var modMatch = (rMod === '*' || rMod === '') || cbvL6NormalizeModuleCode_(rMod) === mod;
    var evMatch = (rEv === '*' || rEv === '') || rEv === ev;
    if (!modMatch || !evMatch) continue;
    var score = 0;
    if (rMod && rMod !== '*') score += 2;
    if (rEv && rEv !== '*') score += 2;
    if (score > bestScore) {
      bestScore = score;
      var rowObj = {};
      var keys = Object.keys(map);
      var i;
      for (i = 0; i < keys.length; i++) {
        var hk = keys[i];
        rowObj[hk] = sheet.getRange(r, map[hk]).getValue();
      }
      best = rowObj;
    }
  }
  if (!best && (map['POLICY_ID'] || map['MODULE_CODE'])) {
    /* fallback default row search by POLICY_ID */
    var fr = cbvCoreV2FindFirstRowInColumn_(sheet, 'POLICY_ID', 'DEFAULT_EVENT_RETRY');
    if (fr >= 2) {
      best = {};
      var keys2 = Object.keys(map);
      var j;
      for (j = 0; j < keys2.length; j++) {
        var hk2 = keys2[j];
        best[hk2] = sheet.getRange(fr, map[hk2]).getValue();
      }
    }
  }
  return cbvL6CoerceRetryPolicyRow_(best);
}

/**
 * @param {Object} policy
 * @param {number} retryCount — 1-based attempt after failure
 * @returns {string} ISO date string
 */
function CBV_L6_computeNextRunAt(policy, retryCount) {
  var pol = policy || CBV_L6_getRetryPolicy('*', '*') || {};
  var baseSec = Number(pol.BASE_DELAY_SECONDS != null ? pol.BASE_DELAY_SECONDS : 60);
  var maxSec = Number(pol.MAX_DELAY_SECONDS != null ? pol.MAX_DELAY_SECONDS : 3600);
  var rc = Math.max(1, Number(retryCount || 1));
  var delaySec = baseSec;
  var bt = String(pol.BACKOFF_TYPE || 'EXPONENTIAL').toUpperCase();
  if (bt === 'EXPONENTIAL') {
    delaySec = Math.min(maxSec, baseSec * Math.pow(2, rc - 1));
  } else if (bt === 'LINEAR') {
    delaySec = Math.min(maxSec, baseSec * rc);
  } else {
    delaySec = Math.min(maxSec, baseSec);
  }
  var d = new Date();
  d.setSeconds(d.getSeconds() + delaySec);
  return d.toISOString();
}

/**
 * @param {Object} policy
 * @param {number} retryCount — after increment
 * @returns {boolean}
 */
function CBV_L6_shouldDeadLetter(policy, retryCount) {
  var pol = policy || CBV_L6_getRetryPolicy('*', '*') || {};
  var dl = Number(pol.DEAD_LETTER_AFTER != null ? pol.DEAD_LETTER_AFTER : pol.MAX_RETRY != null ? pol.MAX_RETRY : 3);
  var nextRetry = Number(retryCount || 0);
  return nextRetry >= dl;
}
