/**
 * HO_SO — bridge tới library `CBV_CORE_RUNTIME_LIB` (identifier `CBVCoreRuntime`).
 * Phase A: ưu tiên library khi đã gắn; fallback `*_local` / `*_local_` từ core copy trong repo.
 * Phase C: xoá local, chỉ còn library.
 */

/**
 * Ghi CBV_SYSTEM_HEALTH khi không dùng library (logic tương đương core 60_HEALTH).
 * @param {Object} rec
 */
function cbvCoreV2HealthWrite_local_(rec) {
  var res = cbvCoreV2EnsureCoreSheet_local_('SYSTEM_HEALTH', 'SYSTEM_HEALTH');
  var sheet = res.sheet;
  var checkId = rec.checkId || cbvCoreV2NewEventId_local_('CHK');
  var fields = {
    CHECK_ID: checkId,
    MODULE_CODE: rec.moduleCode || 'CORE_V2',
    CHECK_NAME: rec.checkName || 'GENERIC',
    SEVERITY: rec.severity || 'INFO',
    STATUS: rec.status || 'OK',
    MESSAGE: rec.message || '',
    LAST_CHECK_AT: cbvCoreV2IsoNow_local_(),
    PAYLOAD_JSON: rec.payload != null ? cbvCoreV2SafeStringify_local_(rec.payload) : ''
  };
  cbvCoreV2AppendRowByHeaders_local_(sheet, fields);
}

function cbvCoreBridgeHasLib_() {
  try {
    return typeof CBVCoreRuntime !== 'undefined' && CBVCoreRuntime != null && typeof CBVCoreRuntime.bootstrap === 'function';
  } catch (e) {
    return false;
  }
}

/**
 * @param {string} apiName — key trên `CBVCoreRuntime` (vd `safeStringify`)
 * @param {Array} apiArgs
 * @param {string} [fallbackName] — tên global fallback (`*_local` / `*_local_`)
 */
function cbvCoreBridgeCall_(apiName, apiArgs, fallbackName) {
  if (cbvCoreBridgeHasLib_() && typeof CBVCoreRuntime[apiName] === 'function') {
    return CBVCoreRuntime[apiName].apply(CBVCoreRuntime, apiArgs || []);
  }
  var g = typeof globalThis !== 'undefined' ? globalThis : Function('return this')();
  if (fallbackName && typeof g[fallbackName] === 'function') {
    return g[fallbackName].apply(g, apiArgs || []);
  }
  throw new Error('CORE_RUNTIME_API_NOT_AVAILABLE:' + apiName + (fallbackName ? ':' + fallbackName : ''));
}

function cbvNow() {
  return cbvCoreBridgeCall_('now', [], 'cbvNow_local');
}

function cbvUser() {
  return cbvCoreBridgeCall_('user', [], 'cbvUser_local');
}

function cbvMakeId(prefix) {
  return cbvCoreBridgeCall_('makeId', [prefix], 'cbvMakeId_local');
}

function cbvCoreV2SafeStringify_(obj) {
  return cbvCoreBridgeCall_('safeStringify', [obj], 'cbvCoreV2SafeStringify_local_');
}

function cbvCoreV2SafeParseJson_(raw) {
  return cbvCoreBridgeCall_('safeParseJson', [raw], 'cbvCoreV2SafeParseJson_local_');
}

function cbvCoreV2IsoNow_() {
  return cbvCoreBridgeCall_('isoNow', [], 'cbvCoreV2IsoNow_local_');
}

function cbvCoreV2GlobalThis_() {
  return cbvCoreBridgeCall_('globalThisRef', [], 'cbvCoreV2GlobalThis_local_');
}

function cbvCoreV2IsNonEmptyString_(v) {
  return cbvCoreBridgeCall_('isNonEmptyString', [v], 'cbvCoreV2IsNonEmptyString_local_');
}

function cbvCoreV2NewCommandId_(prefix) {
  return cbvCoreBridgeCall_('newCommandId', [prefix], 'cbvCoreV2NewCommandId_local_');
}

function cbvCoreV2NewEventId_(prefix) {
  return cbvCoreBridgeCall_('newEventId', [prefix], 'cbvCoreV2NewEventId_local_');
}

function cbvCoreV2GetSpreadsheet_() {
  var g = typeof globalThis !== 'undefined' ? globalThis : Function('return this')();
  if (typeof g.cbvCoreV2OpenCoreSpreadsheet_ === 'function') {
    return g.cbvCoreV2OpenCoreSpreadsheet_();
  }
  return cbvCoreBridgeCall_('getSpreadsheet', [], 'cbvCoreV2GetSpreadsheet_local_');
}

function cbvCoreV2SheetOutputWidth_(sheet) {
  return cbvCoreBridgeCall_('sheetOutputWidth', [sheet], 'cbvCoreV2SheetOutputWidth_local_');
}

function cbvCoreV2ReadHeaderMap_(sheet) {
  return cbvCoreBridgeCall_('readHeaderMap', [sheet], 'cbvCoreV2ReadHeaderMap_local_');
}

function cbvCoreV2EnsureSheetWithHeaders_(sheetName, requiredHeaders) {
  return cbvCoreBridgeCall_('ensureSheetWithHeaders', [sheetName, requiredHeaders], 'cbvCoreV2EnsureSheetWithHeaders_local_');
}

function cbvCoreV2EnsureSheetWithHeadersOnSpreadsheet_(ss, sheetName, requiredHeaders) {
  return cbvCoreBridgeCall_('ensureSheetWithHeadersOnSpreadsheet', [ss, sheetName, requiredHeaders], 'cbvCoreV2EnsureSheetWithHeadersOnSpreadsheet_local_');
}

function cbvCoreV2AppendRowByHeaders_(sheet, valuesByHeader) {
  return cbvCoreBridgeCall_('appendRowByHeaders', [sheet, valuesByHeader], 'cbvCoreV2AppendRowByHeaders_local_');
}

function cbvCoreV2FindFirstRowInColumn_(sheet, columnName, searchValue) {
  return cbvCoreBridgeCall_('findFirstRowInColumn', [sheet, columnName, searchValue], 'cbvCoreV2FindFirstRowInColumn_local_');
}

function cbvCoreV2UpdateRowByHeaders_(sheet, row, updatesByHeader) {
  return cbvCoreBridgeCall_('updateRowByHeaders', [sheet, row, updatesByHeader], 'cbvCoreV2UpdateRowByHeaders_local_');
}

function cbvCoreV2EnsureCoreSheet_(sheetKey, headerKey) {
  return cbvCoreBridgeCall_('ensureCoreSheet', [sheetKey, headerKey], 'cbvCoreV2EnsureCoreSheet_local_');
}

function cbvCoreV2HealthWrite_(rec) {
  return cbvCoreBridgeCall_('healthWrite', [rec], 'cbvCoreV2HealthWrite_local_');
}

function cbvCoreV2NormalizeError_(e) {
  return cbvCoreBridgeCall_('normalizeError', [e], 'cbvCoreV2NormalizeError_local_');
}

function CBV_CoreV2_bootstrap() {
  return cbvCoreBridgeCall_('bootstrap', [], '');
}

// NOTE:
// Dispatch nghiệp vụ HO_SO chạy host-side tại 006_CBV_CORE_HOST_DISPATCH.js (`CBV_CoreV2_dispatch`).
// Không gọi CBVCoreRuntime.dispatch — Apps Script Library không thấy HosoCommandHandler_handle trên host.

function CBV_CoreV2_emitEvent(event) {
  return cbvCoreBridgeCall_('emitEvent', [event], '');
}

function CBV_CoreV2_runEventWorker() {
  return cbvCoreBridgeCall_('runEventWorker', [], '');
}

function CBV_CoreV2_healthCheck() {
  return cbvCoreBridgeCall_('healthCheck', [], '');
}

function CBV_CoreV2_registerModule(moduleDef) {
  return cbvCoreBridgeCall_('registerModule', [moduleDef], '');
}

function CBV_CoreV2_logAudit(audit) {
  return cbvCoreBridgeCall_('logAudit', [audit], '');
}

/**
 * Ghi `CBV_CORE_DB_ID` vào Script Properties của project HO_SO (host).
 * Ưu tiên host vì library Apps Script không đọc được Script Properties của module con.
 */
function CBV_CoreV2_setCoreDbId(dbId) {
  var g = typeof globalThis !== 'undefined' ? globalThis : Function('return this')();
  if (typeof g.CBV_CoreV2_setCoreDbId_local === 'function') {
    return g.CBV_CoreV2_setCoreDbId_local(dbId);
  }
  return cbvCoreBridgeCall_('setCoreDbId', [dbId], '');
}

function CBV_CoreV2_getCoreDbId() {
  var g = typeof globalThis !== 'undefined' ? globalThis : Function('return this')();
  if (typeof g.CBV_CoreV2_getCoreDbId_local === 'function') {
    return g.CBV_CoreV2_getCoreDbId_local();
  }
  return cbvCoreBridgeCall_('getCoreDbId', [], '');
}
