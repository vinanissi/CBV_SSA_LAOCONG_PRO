/**
 * EVENT_QUEUE — time trigger + install helpers (menu).
 * Depends: 04_CORE_EVENT_PROCESSOR.js (`processCoreEventQueueBatch_`), ScriptApp.
 *
 * Handler `coreEventQueueProcessMinutely` runs every 5 minutes when trigger is installed.
 */

/**
 * Entry point for time-based trigger. Keeps work small to stay within quotas.
 */
function coreEventQueueProcessMinutely() {
  try {
    if (typeof processCoreEventQueueBatch_ !== 'function') return;
    var n = processCoreEventQueueBatch_(25);
    if (n > 0) Logger.log('[coreEventQueue] processed ' + n + ' event(s)');
  } catch (e) {
    Logger.log('[coreEventQueue] error: ' + (e && e.message ? e.message : e));
  }
}

/**
 * Deletes existing core-event triggers, then installs one: every 5 minutes.
 * Run once from menu or editor.
 */
function installCoreEventQueueTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'coreEventQueueProcessMinutely') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('coreEventQueueProcessMinutely')
    .timeBased()
    .everyMinutes(5)
    .create();
  Logger.log('[coreEventQueue] Trigger installed: coreEventQueueProcessMinutely every 5 min');
}

/**
 * Removes all time triggers for `coreEventQueueProcessMinutely`.
 */
function uninstallCoreEventQueueTrigger() {
  var removed = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'coreEventQueueProcessMinutely') {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  Logger.log('[coreEventQueue] Removed ' + removed + ' trigger(s)');
}
