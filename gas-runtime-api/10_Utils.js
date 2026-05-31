/**
 * RF_12 — GAS Runtime API — Utilities.
 */

function buildTraceId_() {
  return 'gas-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function safeParse_(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function nowIso_() {
  return Utilities.formatDate(new Date(), RF12_CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
}

function todayDate_() {
  return Utilities.formatDate(new Date(), RF12_CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function resolveSpreadsheetId_() {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active.getId();
  var key = RF12_CONFIG.SCRIPT_PROP_SPREADSHEET_KEY || 'CBV_SPREADSHEET_ID';
  var fromProp = PropertiesService.getScriptProperties().getProperty(key);
  if (fromProp && String(fromProp).trim()) return String(fromProp).trim();
  if (RF12_CONFIG.SPREADSHEET_ID && String(RF12_CONFIG.SPREADSHEET_ID).trim()) {
    return String(RF12_CONFIG.SPREADSHEET_ID).trim();
  }
  return null;
}

function getSpreadsheet_() {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  var id = resolveSpreadsheetId_();
  if (!id) {
    throw new Error(
      'CBV_SPREADSHEET_ID chưa cấu hình — chạy Rf12_setupSpreadsheetId(sheetId) hoặc set Script Property',
    );
  }
  var ss = SpreadsheetApp.openById(id);
  if (!ss) {
    throw new Error('Không mở được Spreadsheet ID: ' + id);
  }
  return ss;
}

/** Run once from Apps Script editor: Rf12_setupSpreadsheetId('YOUR_SHEET_ID') */
function Rf12_setupSpreadsheetId(spreadsheetId) {
  if (!spreadsheetId || !String(spreadsheetId).trim()) {
    throw new Error('spreadsheetId is required');
  }
  var key = RF12_CONFIG.SCRIPT_PROP_SPREADSHEET_KEY || 'CBV_SPREADSHEET_ID';
  PropertiesService.getScriptProperties().setProperty(key, String(spreadsheetId).trim());
  return { ok: true, spreadsheetId: String(spreadsheetId).trim() };
}

function ensureSheetWithHeaders_(sheetName, headers) {
  var ss = getSpreadsheet_();
  if (!ss) {
    throw new Error('Spreadsheet unavailable');
  }
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  var existing = sheet.getLastRow() >= 1 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
  var normalized = existing.map(function (h) {
    return String(h || '').trim().toLowerCase();
  });
  var toAppend = [];
  headers.forEach(function (h) {
    if (normalized.indexOf(h.toLowerCase()) < 0) {
      toAppend.push(h);
    }
  });
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return sheet;
  }
  if (toAppend.length > 0) {
    var startCol = normalized.length + 1;
    sheet.getRange(1, startCol, 1, startCol + toAppend.length - 1).setValues([toAppend]);
  }
  return sheet;
}

function getHeaderMap_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  headers.forEach(function (h, i) {
    var key = String(h || '').trim().toLowerCase();
    if (key) map[key] = i;
  });
  return map;
}

function rowToObject_(sheet, rowIndex, headerMap) {
  var lastCol = sheet.getLastColumn();
  var values = sheet.getRange(rowIndex, 1, 1, lastCol).getValues()[0];
  var obj = {};
  Object.keys(headerMap).forEach(function (key) {
    obj[key] = values[headerMap[key]];
  });
  return obj;
}

function objectToRow_(headerMap, obj) {
  var width = Object.keys(headerMap).length
    ? Math.max.apply(null, Object.keys(headerMap).map(function (k) { return headerMap[k]; })) + 1
    : 0;
  var row = new Array(width).fill('');
  Object.keys(obj).forEach(function (key) {
    var idx = headerMap[key.toLowerCase()];
    if (idx !== undefined) row[idx] = obj[key];
  });
  return row;
}

function outputJson_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function buildEnvelope_(data, options) {
  options = options || {};
  var warnings = options.warnings || [];
  var errors = options.errors || [];
  var ok = options.ok !== undefined ? options.ok : errors.length === 0;
  var status = options.status || (errors.length > 0 ? 'FAIL' : warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  return {
    ok: ok,
    status: status,
    data: data !== undefined ? data : null,
    warnings: warnings,
    errors: errors,
    traceId: options.traceId || buildTraceId_(),
  };
}

function makeId_(prefix) {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function sanitizeTaskPayload_(payload, allowedFields) {
  var out = {};
  if (!payload || typeof payload !== 'object') return out;
  allowedFields.forEach(function (field) {
    if (payload[field] !== undefined && payload[field] !== null) {
      out[field] = payload[field];
    }
  });
  return out;
}

function validateTaskPayload_(payload, mode) {
  var errors = [];
  if (mode === 'create') {
    if (!payload.title || !String(payload.title).trim()) errors.push('title là bắt buộc');
  }
  if (payload.priority && RF12_CONFIG.ALLOWED_PRIORITY.indexOf(String(payload.priority).toUpperCase()) < 0) {
    errors.push('priority không hợp lệ');
  }
  if (payload.status && RF12_CONFIG.ALLOWED_STATUS.indexOf(String(payload.status).toUpperCase()) < 0) {
    errors.push('status không hợp lệ');
  }
  return errors;
}

function parseActorFromRequest_(e) {
  var p = (e && e.parameter) || {};
  var postData = (e && e.postData && e.postData.contents) ? safeParse_(e.postData.contents) : null;
  var headers = postData && postData._actor ? postData._actor : {};
  return {
    userId: String(headers.userId || p.actorUserId || 'GAS-ACTOR').trim(),
    displayName: String(headers.displayName || p.actorName || 'GAS Actor').trim(),
    role: String(headers.role || p.actorRole || 'MANAGER').trim().toUpperCase(),
    email: String(headers.email || p.actorEmail || '').trim(),
  };
}

function bootstrapSheets_() {
  ensureSheetWithHeaders_(RF12_CONFIG.SHEETS.TASKS, RF12_CONFIG.TASK_HEADERS);
  ensureSheetWithHeaders_(RF12_CONFIG.SHEETS.TASK_TIMELINE, RF12_CONFIG.TIMELINE_HEADERS);
  ensureSheetWithHeaders_(RF12_CONFIG.SHEETS.API_AUDIT_LOG, RF12_CONFIG.AUDIT_HEADERS);
}
