/**
 * PHASE_TASK_GS_03 — CacheService + payload helpers.
 */

function taskDbCacheKey_(prefix, filters) {
  var v = CBV_TASK_DB_CONFIG.CACHE_KEY_VERSION || 'v1';
  var gen = taskDbCacheGetGeneration_();
  var parts = ['taskDb', v, 'g' + gen, prefix];
  if (filters) {
    ['status', 'assignee', 'priority', 'q', 'limit'].forEach(function (k) {
      if (filters[k] !== undefined && filters[k] !== '') parts.push(k + '=' + String(filters[k]));
    });
  }
  return parts.join(':');
}

function taskDbCountsCacheKey_() {
  return 'taskDb:' + (CBV_TASK_DB_CONFIG.CACHE_KEY_VERSION || 'v1') + ':g' + taskDbCacheGetGeneration_() + ':counts';
}

function taskDbDetailCacheKey_(taskId) {
  return 'taskDb:' + (CBV_TASK_DB_CONFIG.CACHE_KEY_VERSION || 'v1') + ':g' + taskDbCacheGetGeneration_() + ':detail:' + String(taskId);
}

function taskDbCacheGetGeneration_() {
  try {
    var raw = CacheService.getScriptCache().get('taskDb:cacheGen');
    return raw ? parseInt(raw, 10) : 0;
  } catch (e) {
    return 0;
  }
}

function taskDbCacheBumpGeneration_() {
  try {
    var cache = CacheService.getScriptCache();
    var next = taskDbCacheGetGeneration_() + 1;
    cache.put('taskDb:cacheGen', String(next), 21600);
    return next;
  } catch (e) {
    return 0;
  }
}

function taskDbCacheGet_(key) {
  try {
    var raw = CacheService.getScriptCache().get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function taskDbCacheSet_(key, data, ttlSec) {
  try {
    var ttl = ttlSec || CBV_TASK_DB_CONFIG.CACHE_TTL_SEC;
    CacheService.getScriptCache().put(key, JSON.stringify(data), ttl);
  } catch (e) {
    // cache full — ignore
  }
}

function taskDbCacheInvalidate_(prefix) {
  try {
    taskDbCacheBumpGeneration_();
  } catch (e) {
    // ignore
  }
}

function taskDbCacheInvalidateDetail_(taskId) {
  try {
    CacheService.getScriptCache().remove(taskDbDetailCacheKey_(taskId));
  } catch (e) {
    // ignore
  }
}

function taskDbApproxPayloadBytes_(obj) {
  try {
    return JSON.stringify(obj).length;
  } catch (e) {
    return 0;
  }
}

function taskDbIsRateLimitError_(err) {
  var msg = String((err && err.message) || err || '').toLowerCase();
  return msg.indexOf('rate') >= 0 || msg.indexOf('quota') >= 0 || msg.indexOf('429') >= 0 || msg.indexOf('too many') >= 0;
}

function taskDbBuildRuntimeMetrics_(opts) {
  opts = opts || {};
  return {
    mode: 'google_sheet_existing_db',
    dbSheet: 'TASK_MAIN',
    sheetId: CBV_TASK_DB_ID,
    cacheHit: opts.cacheHit === true,
    cacheTtlSec: CBV_TASK_DB_CONFIG.CACHE_TTL_SEC,
    gasDurationMs: opts.gasDurationMs || 0,
    sheetReadMs: opts.sheetReadMs || 0,
    mappingMs: opts.mappingMs || 0,
    rowsScanned: opts.rowsScanned || 0,
    rowsReturned: opts.rowsReturned || 0,
    payloadBytesApprox: opts.payloadBytesApprox || 0,
    generatedAt: taskDbNowIso_(),
    lastSyncAt: taskDbNowIso_(),
    connected: true,
    latencyMs: opts.gasDurationMs || 0,
  };
}
