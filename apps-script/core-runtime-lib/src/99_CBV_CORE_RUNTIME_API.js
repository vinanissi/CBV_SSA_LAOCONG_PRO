var CBVCoreRuntime = CBVCoreRuntime || {};

CBVCoreRuntime.version = function () {
  return CBV_CORE_V2.VERSION;
};

CBVCoreRuntime.now = function () {
  return cbvNow();
};

CBVCoreRuntime.user = function () {
  return cbvUser();
};

CBVCoreRuntime.makeId = function (prefix) {
  return cbvMakeId(prefix);
};

CBVCoreRuntime.bootstrap = function () {
  return CBV_CoreV2_bootstrap();
};

CBVCoreRuntime.dispatch = function (command) {
  return CBV_CoreV2_dispatch(command);
};

CBVCoreRuntime.emitEvent = function (event) {
  return CBV_CoreV2_emitEvent(event);
};

CBVCoreRuntime.runEventWorker = function () {
  return CBV_CoreV2_runEventWorker();
};

CBVCoreRuntime.healthCheck = function () {
  return CBV_CoreV2_healthCheck();
};

CBVCoreRuntime.registerModule = function (moduleDef) {
  return CBV_CoreV2_registerModule(moduleDef);
};

CBVCoreRuntime.logAudit = function (audit) {
  return CBV_CoreV2_logAudit(audit);
};

CBVCoreRuntime.safeStringify = function (obj) {
  return cbvCoreV2SafeStringify_(obj);
};

CBVCoreRuntime.safeParseJson = function (raw) {
  return cbvCoreV2SafeParseJson_(raw);
};

CBVCoreRuntime.isoNow = function () {
  return cbvCoreV2IsoNow_();
};

CBVCoreRuntime.globalThis = function () {
  return cbvCoreV2GlobalThis_();
};

CBVCoreRuntime.isNonEmptyString = function (v) {
  return cbvCoreV2IsNonEmptyString_(v);
};

CBVCoreRuntime.newCommandId = function (prefix) {
  return cbvCoreV2NewCommandId_(prefix);
};

CBVCoreRuntime.newEventId = function (prefix) {
  return cbvCoreV2NewEventId_(prefix);
};

CBVCoreRuntime.getSpreadsheet = function () {
  return cbvCoreV2GetSpreadsheet_();
};

CBVCoreRuntime.sheetOutputWidth = function (sheet) {
  return cbvCoreV2SheetOutputWidth_(sheet);
};

CBVCoreRuntime.ensureSheetWithHeaders = function (sheetName, headers) {
  return cbvCoreV2EnsureSheetWithHeaders_(sheetName, headers);
};

CBVCoreRuntime.ensureSheetWithHeadersOnSpreadsheet = function (ss, sheetName, headers) {
  return cbvCoreV2EnsureSheetWithHeadersOnSpreadsheet_(ss, sheetName, headers);
};

CBVCoreRuntime.ensureCoreSheet = function (sheetKey, headerKey) {
  return cbvCoreV2EnsureCoreSheet_(sheetKey, headerKey);
};

CBVCoreRuntime.appendRowByHeaders = function (sheet, valuesByHeader) {
  return cbvCoreV2AppendRowByHeaders_(sheet, valuesByHeader);
};

CBVCoreRuntime.readHeaderMap = function (sheet) {
  return cbvCoreV2ReadHeaderMap_(sheet);
};

CBVCoreRuntime.updateRowByHeaders = function (sheet, row, updatesByHeader) {
  return cbvCoreV2UpdateRowByHeaders_(sheet, row, updatesByHeader);
};

CBVCoreRuntime.findFirstRowInColumn = function (sheet, columnName, searchValue) {
  return cbvCoreV2FindFirstRowInColumn_(sheet, columnName, searchValue);
};

CBVCoreRuntime.healthWrite = function (rec) {
  return cbvCoreV2HealthWrite_(rec);
};

CBVCoreRuntime.normalizeError = function (e) {
  return cbvCoreV2NormalizeError_(e);
};

CBVCoreRuntime.setCoreDbId = function (dbId) {
  return CBV_CoreV2_setCoreDbId(dbId);
};

CBVCoreRuntime.getCoreDbId = function () {
  return CBV_CoreV2_getCoreDbId();
};

/**
 * Apps Script Library export: consumer gọi qua identifier, ví dụ `CBVCoreRuntime.dispatch(cmd)`.
 * (Object `CBVCoreRuntime` property không luôn được expose; top-level function mới là public API chuẩn.)
 */
function version() {
  return CBV_CORE_V2.VERSION;
}

function now() {
  return cbvNow();
}

function user() {
  return cbvUser();
}

function makeId(prefix) {
  return cbvMakeId(prefix);
}

function bootstrap() {
  return CBV_CoreV2_bootstrap();
}

function dispatch(command) {
  return CBV_CoreV2_dispatch(command);
}

function emitEvent(event) {
  return CBV_CoreV2_emitEvent(event);
}

function runEventWorker() {
  return CBV_CoreV2_runEventWorker();
}

function healthCheck() {
  return CBV_CoreV2_healthCheck();
}

function registerModule(moduleDef) {
  return CBV_CoreV2_registerModule(moduleDef);
}

function logAudit(audit) {
  return CBV_CoreV2_logAudit(audit);
}

function setCoreDbId(dbId) {
  return CBV_CoreV2_setCoreDbId(dbId);
}

function getCoreDbId() {
  return CBV_CoreV2_getCoreDbId();
}

function safeStringify(obj) {
  return cbvCoreV2SafeStringify_(obj);
}

function safeParseJson(raw) {
  return cbvCoreV2SafeParseJson_(raw);
}

function isoNow() {
  return cbvCoreV2IsoNow_();
}

function globalThisRef() {
  return cbvCoreV2GlobalThis_();
}

function isNonEmptyString(v) {
  return cbvCoreV2IsNonEmptyString_(v);
}

function newCommandId(prefix) {
  return cbvCoreV2NewCommandId_(prefix);
}

function newEventId(prefix) {
  return cbvCoreV2NewEventId_(prefix);
}

function getSpreadsheet() {
  return cbvCoreV2GetSpreadsheet_();
}

function sheetOutputWidth(sheet) {
  return cbvCoreV2SheetOutputWidth_(sheet);
}

function ensureCoreSheet(sheetKey, headerKey) {
  return cbvCoreV2EnsureCoreSheet_(sheetKey, headerKey);
}

function ensureSheetWithHeaders(sheetName, headers) {
  return cbvCoreV2EnsureSheetWithHeaders_(sheetName, headers);
}

function ensureSheetWithHeadersOnSpreadsheet(ss, sheetName, headers) {
  return cbvCoreV2EnsureSheetWithHeadersOnSpreadsheet_(ss, sheetName, headers);
}

function appendRowByHeaders(sheet, valuesByHeader) {
  return cbvCoreV2AppendRowByHeaders_(sheet, valuesByHeader);
}

function readHeaderMap(sheet) {
  return cbvCoreV2ReadHeaderMap_(sheet);
}

function updateRowByHeaders(sheet, row, updatesByHeader) {
  return cbvCoreV2UpdateRowByHeaders_(sheet, row, updatesByHeader);
}

function findFirstRowInColumn(sheet, columnName, searchValue) {
  return cbvCoreV2FindFirstRowInColumn_(sheet, columnName, searchValue);
}

function healthWrite(rec) {
  return cbvCoreV2HealthWrite_(rec);
}

function normalizeError(e) {
  return cbvCoreV2NormalizeError_(e);
}
