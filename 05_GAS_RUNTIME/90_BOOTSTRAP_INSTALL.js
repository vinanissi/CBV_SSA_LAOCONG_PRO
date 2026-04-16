/**
 * CBV Trigger installation - Idempotent, avoids duplicates.
 */

/** Trigger handler names that this bootstrap manages */
const CBV_BOOTSTRAP_TRIGGERS = ['dailyHealthCheck'];

/** Warm-up handler — 5 min interval (see installTriggersImpl) */
var CBV_WARM_HANDLER = 'keepWebhookWarm';

/**
 * Warm-up function — time-based trigger mỗi 5 phút.
 * Giữ GAS instance không idle lâu để giảm cold start Web App.
 */
function keepWebhookWarm() {
  Logger.log('[CBV_WARM] ' + new Date().toISOString());
}

/**
 * Checks if a trigger for the given handler already exists.
 * @param {string} handlerFunction
 * @returns {boolean}
 */
function ensureNoDuplicateTrigger(handlerFunction) {
  const triggers = ScriptApp.getProjectTriggers();
  return triggers.some(function (t) { return t.getHandlerFunction() === handlerFunction; });
}

/**
 * Removes all triggers for the given handler.
 * @param {string} handlerFunction
 * @returns {number} Count of removed triggers
 */
function _removeTriggersFor(handlerFunction) {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;
  triggers.forEach(function (t) {
    if (t.getHandlerFunction() === handlerFunction) {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  return removed;
}

/**
 * Installs time-based triggers. Avoids duplicates.
 * @returns {Object} Structured result with createdTriggers, skippedTriggers
 */
function installTriggersImpl() {
  const result = buildStructuredBootstrapReport();

  CBV_BOOTSTRAP_TRIGGERS.forEach(function (handler) {
    if (ensureNoDuplicateTrigger(handler)) {
      result.data.skippedTriggers.push(handler);
    } else {
      ScriptApp.newTrigger(handler)
        .timeBased()
        .everyDays(1)
        .atHour(8)
        .create();
      result.data.createdTriggers.push(handler);
    }
  });

  if (ensureNoDuplicateTrigger(CBV_WARM_HANDLER)) {
    result.data.skippedTriggers.push(CBV_WARM_HANDLER);
  } else {
    ScriptApp.newTrigger(CBV_WARM_HANDLER)
      .timeBased()
      .everyMinutes(5)
      .create();
    result.data.createdTriggers.push(CBV_WARM_HANDLER);
    Logger.log('[CBV] Đã cài keepWebhookWarm trigger (mỗi 5 phút)');
  }

  result.ok = true;
  result.code = 'TRIGGERS_OK';
  result.message = 'Triggers installed or already present';

  Logger.log('installTriggers: ' + JSON.stringify(result, null, 2));
  return result;
}

/**
 * Removes all CBV-managed triggers. Safe to call; no-op if none exist.
 * @returns {number} Count of removed triggers
 */
function removeCbvTriggersImpl() {
  var removed = 0;
  CBV_BOOTSTRAP_TRIGGERS.forEach(function(handler) {
    removed += _removeTriggersFor(handler);
  });
  removed += _removeTriggersFor(CBV_WARM_HANDLER);
  return removed;
}

/**
 * Reinstalls triggers by removing existing ones first, then creating.
 * Use only when you need to force-refresh trigger config.
 * @returns {Object} Structured result
 */
function reinstallTriggers() {
  const result = buildStructuredBootstrapReport();

  CBV_BOOTSTRAP_TRIGGERS.forEach(function (handler) {
    const removed = _removeTriggersFor(handler);
    if (removed > 0) result.data.warnings.push('Removed ' + removed + ' existing trigger(s) for ' + handler);

    ScriptApp.newTrigger(handler)
      .timeBased()
      .everyDays(1)
      .atHour(8)
      .create();
    result.data.createdTriggers.push(handler);
  });

  var warmRemoved = _removeTriggersFor(CBV_WARM_HANDLER);
  if (warmRemoved > 0) result.data.warnings.push('Removed ' + warmRemoved + ' existing trigger(s) for ' + CBV_WARM_HANDLER);
  ScriptApp.newTrigger(CBV_WARM_HANDLER)
    .timeBased()
    .everyMinutes(5)
    .create();
  result.data.createdTriggers.push(CBV_WARM_HANDLER);

  result.ok = true;
  result.code = 'TRIGGERS_REINSTALLED';
  result.message = 'Triggers reinstalled';

  Logger.log('reinstallTriggers: ' + JSON.stringify(result, null, 2));
  return result;
}
