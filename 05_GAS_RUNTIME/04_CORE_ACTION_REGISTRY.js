/**
 * Event-driven core — pluggable ACTION REGISTRY.
 *
 * Purpose: keep 04_CORE_EVENT_PROCESSOR.js (executeCoreAction_) MODULE-AGNOSTIC.
 * Modules register their own handlers by name; the processor dispatches via
 * the INVOKE_SERVICE action. Names are the ONLY way to invoke module code,
 * so the registry IS the allowlist — no eval(), no arbitrary lookup.
 *
 * Load order: after 04_CORE_RULE_ENGINE.js, before 04_CORE_EVENT_PROCESSOR.js.
 * Modules register in their own load-time block (e.g. 10_HOSO_EVENTS.js bottom).
 *
 * Handler signature:
 *   function handler(args, ctx) -> any
 *     args : resolved params (after $payload.*, $event.* substitution)
 *     ctx  : { event: <EVENT_QUEUE row>, payload: <parsed PAYLOAD_JSON> }
 *
 * Example rule ACTIONS_JSON:
 *   [{ "type": "INVOKE_SERVICE",
 *      "params": { "handler": "HOSO_RECHECK_COMPLETENESS",
 *                  "args": { "hosoId": "$event.REF_ID" } } }]
 */

/** @type {Object<string, Function>} */
var CBV_CORE_ACTION_REGISTRY_ = {};

/**
 * Register a named action handler. No-ops on bad input.
 * @param {string} name
 * @param {Function} fn
 */
function cbvRegisterCoreAction_(name, fn) {
  var k = String(name || '').trim();
  if (!k || typeof fn !== 'function') return;
  CBV_CORE_ACTION_REGISTRY_[k] = fn;
}

/**
 * Resolve a handler by name. Returns null if not registered.
 * @param {string} name
 * @returns {Function|null}
 */
function cbvResolveCoreAction_(name) {
  var k = String(name || '').trim();
  if (!k) return null;
  return Object.prototype.hasOwnProperty.call(CBV_CORE_ACTION_REGISTRY_, k)
    ? CBV_CORE_ACTION_REGISTRY_[k]
    : null;
}

/**
 * List registered handler names (for audit / debug).
 * @returns {string[]}
 */
function cbvListCoreActions_() {
  var names = [];
  var k;
  for (k in CBV_CORE_ACTION_REGISTRY_) {
    if (Object.prototype.hasOwnProperty.call(CBV_CORE_ACTION_REGISTRY_, k)) {
      names.push(k);
    }
  }
  names.sort();
  return names;
}

/**
 * Resolve template tokens inside rule params. Supports string tokens:
 *   "$payload.FIELD"   → context.payload.FIELD
 *   "$event.COL"       → context.event.COL
 *   "$payload"         → whole payload object
 *   "$event"           → whole event row
 * Recursively walks arrays/objects. Non-matching strings pass through.
 *
 * @param {*} value
 * @param {{event:Object, payload:Object}} context
 * @returns {*}
 */
function cbvResolveCoreActionParams_(value, context) {
  if (value == null) return value;
  if (typeof value === 'string') {
    return _cbvResolveCoreTokenString_(value, context);
  }
  if (Array.isArray(value)) {
    return value.map(function(v) { return cbvResolveCoreActionParams_(v, context); });
  }
  if (typeof value === 'object') {
    var out = {};
    var k;
    for (k in value) {
      if (Object.prototype.hasOwnProperty.call(value, k)) {
        out[k] = cbvResolveCoreActionParams_(value[k], context);
      }
    }
    return out;
  }
  return value;
}

/**
 * @param {string} s
 * @param {{event:Object, payload:Object}} context
 * @returns {*}
 */
function _cbvResolveCoreTokenString_(s, context) {
  if (s.length < 2 || s.charAt(0) !== '$') return s;
  if (s === '$payload') return context && context.payload ? context.payload : {};
  if (s === '$event') return context && context.event ? context.event : {};
  if (s.indexOf('$payload.') === 0) {
    return _cbvGetPathCore_(context && context.payload, s.substring('$payload.'.length));
  }
  if (s.indexOf('$event.') === 0) {
    return _cbvGetPathCore_(context && context.event, s.substring('$event.'.length));
  }
  return s;
}

/**
 * @param {Object} root
 * @param {string} path
 * @returns {*}
 */
function _cbvGetPathCore_(root, path) {
  if (!path) return undefined;
  var parts = String(path).split('.');
  var cur = root;
  var i;
  for (i = 0; i < parts.length; i++) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[parts[i]];
  }
  return cur;
}
