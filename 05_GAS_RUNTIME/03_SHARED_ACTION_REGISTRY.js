/**
 * CBV Shared Action Registry — modules register webhook/CMD actions here;
 * routers resolve by action key without hard-coding each module.
 * Load order: 03_ prefix, before feature modules.
 */

/**
 * @typedef {Object} RegisteredActionEntry
 * @property {string} action - Key after stripping CMD: (e.g. 'finConfirm')
 * @property {string} idParam - Webhook body param name (e.g. 'finId')
 * @property {string} label - User-facing label (e.g. 'Xác nhận GD')
 * @property {Array} validStatuses - Valid STATUS values; [] skips the guard
 * @property {Object} adapter - { findById(id), updatePending(row, patch) }
 * @property {Function} handler - (id, body) => cbvResponse
 */

/** @private @type {Object.<string, RegisteredActionEntry>} */
var _ACTION_REGISTRY = {};

/**
 * Registers or overwrites an action entry keyed by entry.action.
 * @param {RegisteredActionEntry} entry
 */
function registerAction(entry) {
  if (!entry || typeof entry.action !== 'string' || !entry.action) return;
  _ACTION_REGISTRY[entry.action] = entry;
}

/**
 * Returns the registered entry for an action key, or null if missing.
 * @param {string} action
 * @returns {RegisteredActionEntry|null}
 */
function getRegisteredAction(action) {
  if (action == null || action === '') return null;
  var key = String(action);
  return _ACTION_REGISTRY[key] || null;
}
