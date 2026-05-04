/**
 * CBV Core V2 — EVENT_QUEUE worker (PENDING/FAILED retry → DONE/DEAD_LETTER).
 */

/**
 * Resolve optional global handler: cbvCoreV2EventHandler_{moduleCode}_{eventType} or module-specific.
 * @param {string} moduleCode
 * @param {string} eventType
 * @returns {Function|null}
 */
function cbvCoreV2ResolveEventHandler_(moduleCode, eventType) {
  var g = cbvCoreV2GlobalThis_();
  var modRaw = String(moduleCode || '').trim();
  var evRaw = String(eventType || '').trim();
  var modSan = modRaw.replace(/[^A-Z0-9_]/gi, '_');
  var evSan = evRaw.replace(/[^A-Z0-9_]/gi, '_');
  var modAlts = [modSan];
  if (modSan === 'HO_SO') modAlts.push('HOSO');
  if (modSan === 'HOSO') modAlts.push('HO_SO');
  var evAlts = [evSan];
  if (evRaw.indexOf('HOSO_') === 0) {
    evAlts.push(evRaw.replace(/^HOSO_/, 'HO_SO_').replace(/[^A-Z0-9_]/gi, '_'));
  }
  if (evRaw.indexOf('HO_SO_') === 0) {
    evAlts.push(evRaw.replace(/^HO_SO_/, 'HOSO_').replace(/[^A-Z0-9_]/gi, '_'));
  }
  var candidates = [];
  var mi;
  var ei;
  for (mi = 0; mi < modAlts.length; mi++) {
    for (ei = 0; ei < evAlts.length; ei++) {
      candidates.push('cbvCoreV2EventHandler_' + modAlts[mi] + '_' + evAlts[ei]);
    }
  }
  candidates.push('cbvCoreV2EventHandler_' + evSan);
  var i;
  for (i = 0; i < candidates.length; i++) {
    var fn = g[candidates[i]];
    if (typeof fn === 'function') return fn;
  }
  return null;
}

/**
 * @param {Object} rowCtx
 */
function cbvCoreV2EventWorkerProcessOne_(rowCtx) {
  var sheet = rowCtx.sheet;
  var row = rowCtx.row;
  var map = rowCtx.map;
  var eventId = rowCtx.eventId;
  var eventType = rowCtx.eventType;
  var moduleCode = rowCtx.moduleCode;
  var payload = rowCtx.payload;

  cbvCoreV2UpdateRowByHeaders_(sheet, row, {
    STATUS: CBV_CORE_V2.EVENT_QUEUE_STATUS.PROCESSING,
    ERROR_CODE: ''
  });

  var handler = cbvCoreV2ResolveEventHandler_(moduleCode, eventType);
  var policy = null;
  try {
    if (typeof CBV_L6_getRetryPolicy === 'function') {
      policy = CBV_L6_getRetryPolicy(moduleCode, eventType);
    }
  } catch (ep) {
    policy = null;
  }
  var maxR = CBV_CORE_V2.EVENT_WORKER.MAX_RETRY;
  if (policy && policy.MAX_RETRY != null && !isNaN(Number(policy.MAX_RETRY))) {
    maxR = Number(policy.MAX_RETRY);
  }
  try {
    if (handler) {
      handler({ eventId: eventId, eventType: eventType, moduleCode: moduleCode, payload: payload });
    }
    try {
      if (typeof CBV_L6_dispatchEventToConsumers === 'function') {
        CBV_L6_dispatchEventToConsumers({
          eventId: eventId,
          EVENT_ID: eventId,
          eventType: eventType,
          EVENT_TYPE: eventType,
          moduleCode: moduleCode,
          MODULE_CODE: moduleCode,
          payload: payload
        });
      }
    } catch (eCons) {
      /* consumers optional — never fail worker */
    }
    cbvCoreV2UpdateRowByHeaders_(sheet, row, {
      STATUS: CBV_CORE_V2.EVENT_QUEUE_STATUS.DONE,
      PROCESSED_AT: cbvCoreV2IsoNow_(),
      ERROR_CODE: ''
    });
    return { ok: true };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    var retryCol = map['RETRY_COUNT'];
    var curRetry = retryCol ? Number(sheet.getRange(row, retryCol).getValue() || 0) : 0;
    var nextRetry = curRetry + 1;
    var useDeadLetter = nextRetry >= maxR;
    if (typeof CBV_L6_shouldDeadLetter === 'function' && policy) {
      try {
        useDeadLetter = CBV_L6_shouldDeadLetter(policy, nextRetry);
      } catch (edl) {
        useDeadLetter = nextRetry >= maxR;
      }
    }
    if (useDeadLetter) {
      cbvCoreV2UpdateRowByHeaders_(sheet, row, {
        STATUS: CBV_CORE_V2.EVENT_QUEUE_STATUS.DEAD_LETTER,
        RETRY_COUNT: nextRetry,
        ERROR_CODE: n.code,
        PROCESSED_AT: cbvCoreV2IsoNow_()
      });
    } else {
      var nextIso = cbvCoreV2IsoNow_();
      try {
        if (typeof CBV_L6_computeNextRunAt === 'function' && policy) {
          nextIso = CBV_L6_computeNextRunAt(policy, nextRetry);
        } else {
          var nextRun = new Date();
          nextRun.setMinutes(nextRun.getMinutes() + Math.min(60, Math.pow(2, nextRetry)));
          nextIso = nextRun.toISOString();
        }
      } catch (en) {
        var nextRun2 = new Date();
        nextRun2.setMinutes(nextRun2.getMinutes() + Math.min(60, Math.pow(2, nextRetry)));
        nextIso = nextRun2.toISOString();
      }
      cbvCoreV2UpdateRowByHeaders_(sheet, row, {
        STATUS: CBV_CORE_V2.EVENT_QUEUE_STATUS.FAILED,
        RETRY_COUNT: nextRetry,
        NEXT_RUN_AT: nextIso,
        ERROR_CODE: n.code
      });
    }
    return { ok: false, error: n };
  }
}

/**
 * @returns {Object}
 */
function CBV_CoreV2_runEventWorker() {
  var processed = 0;
  var errors = [];
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.EVENT_QUEUE);
  if (!sheet) {
    return { ok: true, code: 'NO_QUEUE', message: 'EVENT_QUEUE missing', data: { processed: 0 }, error: null };
  }
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var last = sheet.getLastRow();
  if (last < 2) {
    return { ok: true, code: 'QUEUE_EMPTY', message: 'OK', data: { processed: 0 }, error: null };
  }
  var statusCol = map['STATUS'];
  var idCol = map['EVENT_ID'];
  var typeCol = map['EVENT_TYPE'];
  var modCol = map['MODULE_CODE'];
  var payCol = map['PAYLOAD_JSON'];
  var nextCol = map['NEXT_RUN_AT'];
  if (!statusCol || !idCol) {
    return { ok: false, code: 'QUEUE_BAD_SCHEMA', message: 'EVENT_QUEUE headers', data: {}, error: { code: 'QUEUE_BAD_SCHEMA', message: 'Bad schema' } };
  }

  var now = cbvNow();
  var limit = CBV_CORE_V2.EVENT_WORKER.BATCH_LIMIT;
  var r;
  for (r = 2; r <= last && processed < limit; r++) {
    var st = String(sheet.getRange(r, statusCol).getValue() || '');
    if (st !== CBV_CORE_V2.EVENT_QUEUE_STATUS.PENDING && st !== CBV_CORE_V2.EVENT_QUEUE_STATUS.FAILED) {
      continue;
    }
    if (st === CBV_CORE_V2.EVENT_QUEUE_STATUS.FAILED && nextCol) {
      var nextRaw = sheet.getRange(r, nextCol).getValue();
      if (nextRaw) {
        var nextD = nextRaw instanceof Date ? nextRaw : new Date(nextRaw);
        if (nextD > now) continue;
      }
    }
    var eventId = String(sheet.getRange(r, idCol).getValue() || '');
    var eventType = typeCol ? String(sheet.getRange(r, typeCol).getValue() || '') : '';
    var moduleCode = modCol ? String(sheet.getRange(r, modCol).getValue() || '') : '';
    var payloadRaw = payCol ? sheet.getRange(r, payCol).getValue() : '';
    var payload = cbvCoreV2SafeParseJson_(payloadRaw) || {};

    var ctx = {
      sheet: sheet,
      row: r,
      map: map,
      eventId: eventId,
      eventType: eventType,
      moduleCode: moduleCode,
      payload: payload
    };
    var res = cbvCoreV2EventWorkerProcessOne_(ctx);
    processed++;
    if (!res.ok && res.error) errors.push(res.error);
  }

  return {
    ok: true,
    code: 'WORKER_RAN',
    message: 'Processed ' + processed,
    data: { processed: processed, errors: errors },
    error: null
  };
}
