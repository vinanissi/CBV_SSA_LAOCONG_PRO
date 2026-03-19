/**
 * CBV Trigger installation - Idempotent, avoids duplicates.
 */

/** Trigger handler names that this bootstrap manages */
const CBV_BOOTSTRAP_TRIGGERS = ['dailyHealthCheck'];

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
function installTriggers() {
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

  result.ok = true;
  result.code = 'TRIGGERS_OK';
  result.message = 'Triggers installed or already present';

  Logger.log('installTriggers: ' + JSON.stringify(result, null, 2));
  return result;
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

  result.ok = true;
  result.code = 'TRIGGERS_REINSTALLED';
  result.message = 'Triggers reinstalled';

  Logger.log('reinstallTriggers: ' + JSON.stringify(result, null, 2));
  return result;
}
