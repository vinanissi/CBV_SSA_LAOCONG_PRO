/**
 * Event-driven core — process EVENT_QUEUE rows against RULE_DEF.
 * Depends: 04_CORE_RULE_ENGINE, 03_SHARED_REPOSITORY, 00_CORE_UTILS, 04_CORE_EVENT_TYPES, 03_SHARED_LOGGER (`logAdminAudit` — load order: LOGGER before this file).
 *
 * Action handlers: SEND_ALERT writes ADMIN_AUDIT_LOG; other types remain stubs until extended.
 */

/**
 * @param {string} eventId
 * @returns {{ ok: boolean, skipped?: boolean, message?: string }}
 */
function processCoreEvent(eventId) {
  var id = String(eventId || '').trim();
  if (!id) return { ok: false, message: 'Missing event id' };

  var row = _findById(CBV_CONFIG.SHEETS.EVENT_QUEUE, id);
  if (!row || !row._rowNumber) return { ok: false, message: 'Event not found' };
  var st = String(row.STATUS || '').trim().toUpperCase();
  if (st !== 'PENDING') return { ok: true, skipped: true, message: 'Not PENDING' };

  try {
    var rules = loadRulesForEventType_(row.EVENT_TYPE);
    var payload = {};
    try {
      payload = JSON.parse(row.PAYLOAD_JSON || '{}');
    } catch (pe) {
      payload = {};
    }
    if (typeof payload !== 'object' || payload === null) payload = {};

    var context = { payload: payload, event: row };
    var ri;
    for (ri = 0; ri < rules.length; ri++) {
      var rule = rules[ri];
      if (!evaluateCoreCondition_(rule.CONDITION_JSON, context)) continue;
      var actions = parseCoreActionsJson_(rule.ACTIONS_JSON);
      var ai;
      for (ai = 0; ai < actions.length; ai++) {
        executeCoreAction_(actions[ai], context);
      }
    }

    _updateRow(CBV_CONFIG.SHEETS.EVENT_QUEUE, row._rowNumber, {
      STATUS: 'DONE',
      PROCESSED_AT: cbvNow(),
      ERROR_MESSAGE: ''
    });
    return { ok: true };
  } catch (err) {
    var msg = err && err.message ? err.message : String(err);
    try {
      _updateRow(CBV_CONFIG.SHEETS.EVENT_QUEUE, row._rowNumber, {
        STATUS: 'FAILED',
        ERROR_MESSAGE: msg,
        PROCESSED_AT: cbvNow()
      });
    } catch (e2) {}
    return { ok: false, message: msg };
  }
}

/**
 * @param {Object} action - { type, params }
 * @param {Object} context
 */
function executeCoreAction_(action, context) {
  if (!action || typeof action !== 'object') return;
  var type = String(action.type || '').trim().toUpperCase();
  var params = action.params && typeof action.params === 'object' ? action.params : {};
  var evt = context && context.event ? context.event : {};
  var payload = context && context.payload ? context.payload : {};

  if (type === 'SEND_ALERT') {
    var msg = String(params.message || params.template || 'SEND_ALERT').trim();
    if (typeof logAdminAudit === 'function') {
      logAdminAudit(
        'CORE_RULE',
        String(evt.EVENT_TYPE || 'UNKNOWN'),
        String(evt.ID || ''),
        'SEND_ALERT',
        { params: params, payload: payload },
        {},
        msg,
        { actorId: typeof cbvSystemActor === 'function' ? cbvSystemActor() : undefined }
      );
    } else {
      Logger.log('[executeCoreAction_] SEND_ALERT ' + JSON.stringify(params) + ' evt=' + (evt.ID || ''));
    }
    return;
  }
  if (type === 'CREATE_TASK' || type === 'CREATE_FINANCE' || type === 'UPDATE_STATUS') {
    Logger.log('[executeCoreAction_] STUB ' + type + ' ' + JSON.stringify(params));
    return;
  }
  Logger.log('[executeCoreAction_] UNKNOWN ' + type);
}

/**
 * @param {number} [maxN]
 * @returns {number} number of events processed
 */
function processCoreEventQueueBatch_(maxN) {
  maxN = maxN == null ? 20 : Math.min(200, Math.max(1, Number(maxN)));
  var sheet = _sheet(CBV_CONFIG.SHEETS.EVENT_QUEUE);
  var rows = _rows(sheet);
  var pending = rows.filter(function(r) {
    return r && String(r.STATUS || '').trim().toUpperCase() === 'PENDING';
  });
  var n = 0;
  var i;
  for (i = 0; i < pending.length && n < maxN; i++) {
    var ev = processCoreEvent(pending[i].ID);
    if (ev && ev.ok && !ev.skipped) n++;
  }
  return n;
}
