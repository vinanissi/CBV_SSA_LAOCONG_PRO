/**
 * Event-driven core — mode + canonical EVENT_TYPE strings.
 * Depends: 00_CORE_CONFIG (optional), PropertiesService.
 * Load order: first of 04_CORE_* (after 03_SHARED_PENDING_FEEDBACK).
 */

/** Script property: off | shadow (default) | on */
var CBV_CORE_EVENT_MODE_PROPERTY = 'CBV_CORE_EVENT_MODE';

/** @readonly */
var CBV_CORE_EVENT_TYPE_FINANCE_CREATED = 'FINANCE_CREATED';
/** @readonly */
var CBV_CORE_EVENT_TYPE_FINANCE_STATUS_CHANGED = 'FINANCE_STATUS_CHANGED';

/** @readonly */
var CBV_CORE_EVENT_TYPE_TASK_CREATED = 'TASK_CREATED';
/** @readonly */
var CBV_CORE_EVENT_TYPE_TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED';
/** @readonly */
var CBV_CORE_EVENT_TYPE_TASK_CHECKLIST_UPDATED = 'TASK_CHECKLIST_UPDATED';
/** @readonly */
var CBV_CORE_EVENT_TYPE_TASK_LOG_ADDED = 'TASK_LOG_ADDED';

/** @readonly */
var CBV_CORE_EVENT_TYPE_HO_SO_CREATED = 'HO_SO_CREATED';
/** @readonly */
var CBV_CORE_EVENT_TYPE_HO_SO_STATUS_CHANGED = 'HO_SO_STATUS_CHANGED';

/**
 * @returns {'off'|'shadow'|'on'}
 */
function cbvCoreEventMode_() {
  var v = '';
  try {
    v = PropertiesService.getScriptProperties().getProperty(CBV_CORE_EVENT_MODE_PROPERTY) || '';
  } catch (e) {}
  v = String(v).trim().toLowerCase();
  if (v === 'off' || v === '0' || v === 'false') return 'off';
  if (v === 'on' || v === 'full') return 'on';
  return 'shadow';
}
