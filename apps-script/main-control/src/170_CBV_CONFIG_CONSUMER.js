/**
 * CONFIG module — Level 6 event consumer for CONFIG_CHANGED.
 * Dependencies: 150, 166, 133 (optional CBV_L6_logError)
 */

/**
 * @param {Object} event — worker passes { eventId, eventType, moduleCode, payload, ... }
 */
function CONFIG_EventConsumer_onChanged(event) {
  var ev = event || {};
  Logger.log('[CONFIG_EventConsumer_onChanged] eventId=' + (ev.eventId || ev.EVENT_ID) + ' type=' + (ev.eventType || ev.EVENT_TYPE));

  try {
    if (typeof CBV_Config_clearCache === 'function') {
      CBV_Config_clearCache();
    }
  } catch (e) {
    Logger.log('[CONFIG_EventConsumer_onChanged] clearCache: ' + (e && e.message ? e.message : e));
  }

  try {
    var r = Config_healthCheck_();
    if (!r.ok) {
      if (typeof CBV_L6_logError === 'function') {
        CBV_L6_logError({
          errorCode: 'CONFIG_HEALTH_FAIL',
          moduleCode: 'CONFIG',
          message: JSON.stringify(r),
          eventId: ev.eventId || ev.EVENT_ID || '',
          source: 'CONFIG_EVENT_CONSUMER',
          payload: { health: r, eventType: ev.eventType || ev.EVENT_TYPE }
        });
      }
    }
  } catch (e2) {
    Logger.log('[CONFIG_EventConsumer_onChanged] health: ' + (e2 && e2.message ? e2.message : e2));
  }
}
