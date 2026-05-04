/**
 * CBV Level 6 Pro — event consumer registry + dispatch.
 * Dependencies: 130, 132, 133, 135
 */

/**
 * @returns {Object[]}
 */
function cbvL6DefaultEventConsumersSeed_() {
  var now = cbvCoreV2IsoNow_();
  var rows = [];
  function add(id, eventType, handler, priority, policyId) {
    rows.push({
      CONSUMER_ID: id,
      EVENT_TYPE: eventType,
      MODULE_CODE: 'HOSO',
      HANDLER_NAME: handler,
      ENABLED: 'TRUE',
      PRIORITY: priority,
      RETRY_POLICY_ID: policyId || '',
      STATUS: 'ACTIVE',
      CREATED_AT: now,
      UPDATED_AT: now
    });
  }
  add('L6_HOSO_CREATED_IDX', 'HOSO_CREATED', 'HOSO_EventConsumer_onCreated', 10, '');
  add('L6_HOSO_ATT_IDX', 'HOSO_ATTACHMENT_ADDED', 'HOSO_EventConsumer_onAttachmentAdded', 10, '');
  add('L6_HOSO_PRINT', 'HOSO_PRINT_REQUESTED', 'HOSO_EventConsumer_onPrintRequested', 10, 'HOSO_PRINT_RETRY');
  return rows;
}

/**
 * @returns {Object}
 */
function CBV_L6_seedEventConsumers() {
  try {
    cbvL6EnsureCoreSheet_('EVENT_CONSUMER', 'EVENT_CONSUMER');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.EVENT_CONSUMER);
    var seed = cbvL6DefaultEventConsumersSeed_();
    var i;
    for (i = 0; i < seed.length; i++) {
      var rec = seed[i];
      if (cbvCoreV2FindFirstRowInColumn_(sheet, 'CONSUMER_ID', rec.CONSUMER_ID) >= 2) continue;
      cbvCoreV2AppendRowByHeaders_(sheet, rec);
    }
    return { ok: true, code: 'L6_CONSUMERS_SEEDED', message: 'OK', data: {}, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}

/**
 * @param {Object} consumerDef
 * @returns {Object}
 */
function CBV_L6_registerEventConsumer(consumerDef) {
  try {
    var d = consumerDef || {};
    var id = String(d.consumerId || d.CONSUMER_ID || '').trim();
    if (!id) {
      return { ok: false, code: 'VALIDATION_ERROR', message: 'consumerId required', data: {}, error: null };
    }
    cbvL6EnsureCoreSheet_('EVENT_CONSUMER', 'EVENT_CONSUMER');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.EVENT_CONSUMER);
    var now = cbvCoreV2IsoNow_();
    cbvCoreV2AppendRowByHeaders_(sheet, {
      CONSUMER_ID: id,
      EVENT_TYPE: String(d.eventType || d.EVENT_TYPE || ''),
      MODULE_CODE: cbvL6NormalizeModuleCode_(d.moduleCode || d.MODULE_CODE || 'HOSO'),
      HANDLER_NAME: String(d.handlerName || d.HANDLER_NAME || ''),
      ENABLED: (d.enabled === false || String(d.ENABLED).toUpperCase() === 'FALSE') ? 'FALSE' : 'TRUE',
      PRIORITY: d.priority != null ? d.priority : (d.PRIORITY != null ? d.PRIORITY : 100),
      RETRY_POLICY_ID: String(d.retryPolicyId || d.RETRY_POLICY_ID || ''),
      STATUS: String(d.status || d.STATUS || 'ACTIVE'),
      CREATED_AT: now,
      UPDATED_AT: now
    });
    return { ok: true, code: 'CONSUMER_REGISTERED', message: 'OK', data: { consumerId: id }, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}

/**
 * @param {string} eventType
 * @returns {Object[]}
 */
function CBV_L6_getConsumersForEvent(eventType) {
  var ev = String(eventType || '').trim();
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.EVENT_CONSUMER);
  if (!sheet) return [];
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var tCol = map['EVENT_TYPE'];
  var last = sheet.getLastRow();
  if (last < 2 || !tCol) return [];
  var out = [];
  var r;
  for (r = 2; r <= last; r++) {
    var et = String(sheet.getRange(r, tCol).getValue() || '').trim();
    if (et !== ev) continue;
    var st = map['STATUS'] ? String(sheet.getRange(r, map['STATUS']).getValue() || '').toUpperCase() : 'ACTIVE';
    if (st === 'INACTIVE') continue;
    var en = map['ENABLED'] ? String(sheet.getRange(r, map['ENABLED']).getValue() || '').toUpperCase() : 'TRUE';
    if (en === 'FALSE') continue;
    var rowObj = {};
    var keys = Object.keys(map);
    var i;
    for (i = 0; i < keys.length; i++) {
      var hk = keys[i];
      rowObj[hk] = sheet.getRange(r, map[hk]).getValue();
    }
    out.push(rowObj);
  }
  out.sort(function (a, b) {
    return Number(a.PRIORITY != null ? a.PRIORITY : 999) - Number(b.PRIORITY != null ? b.PRIORITY : 999);
  });
  return out;
}

/**
 * @param {Object} event normalized { eventId, eventType, moduleCode, payload, ... }
 * @returns {Object}
 */
function CBV_L6_dispatchEventToConsumers(event) {
  var ev = event || {};
  var eventType = String(ev.eventType || ev.EVENT_TYPE || '').trim();
  var consumers = CBV_L6_getConsumersForEvent(eventType);
  var results = [];
  var g = cbvCoreV2GlobalThis_();
  var i;
  for (i = 0; i < consumers.length; i++) {
    var c = consumers[i];
    var name = String(c.HANDLER_NAME || '').trim();
    var fn = name ? g[name] : null;
    if (typeof fn !== 'function') {
      if (typeof CBV_L6_logError === 'function') {
        CBV_L6_logError({
          errorCode: 'CORE_EVENT_HANDLER_NOT_FOUND',
          moduleCode: cbvL6NormalizeModuleCode_(c.MODULE_CODE || ev.moduleCode || 'HOSO'),
          message: 'Consumer handler missing: ' + name,
          eventId: ev.eventId || ev.EVENT_ID,
          source: 'EVENT_CONSUMER',
          payload: { consumerId: c.CONSUMER_ID, handlerName: name }
        });
      }
      results.push({ consumerId: c.CONSUMER_ID, ok: false, code: 'CORE_EVENT_HANDLER_NOT_FOUND' });
      continue;
    }
    try {
      fn.call(g, ev);
      results.push({ consumerId: c.CONSUMER_ID, ok: true, code: 'OK' });
    } catch (err) {
      if (typeof CBV_L6_logError === 'function') {
        CBV_L6_logError({
          error: err,
          errorCode: 'CORE_EVENT_PROCESS_FAILED',
          moduleCode: cbvL6NormalizeModuleCode_(c.MODULE_CODE || ev.moduleCode || 'HOSO'),
          eventId: ev.eventId || ev.EVENT_ID,
          source: 'EVENT_CONSUMER',
          message: String(err && err.message ? err.message : err)
        });
      }
      results.push({ consumerId: c.CONSUMER_ID, ok: false, code: 'CORE_EVENT_PROCESS_FAILED' });
    }
  }
  return { ok: true, consumers: results };
}
