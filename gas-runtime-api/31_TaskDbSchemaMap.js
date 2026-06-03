/**
 * PHASE_TASK_GS_01 — Schema map from existing headers (read-only validation).
 */

var CBV_TASK_DB_EXPECTED = {
  TASK_MAIN: [
    'ID', 'TASK_CODE', 'TITLE', 'DESCRIPTION', 'TASK_TYPE_ID',
    'STATUS', 'PRIORITY', 'DON_VI_ID', 'OWNER_ID', 'REPORTER_ID', 'SHARED_WITH',
    'IS_PRIVATE', 'START_DATE', 'DUE_DATE', 'DONE_AT', 'PROGRESS_PERCENT', 'RESULT_SUMMARY',
    'RELATED_ENTITY_TYPE', 'RELATED_ENTITY_ID',
    'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY',
    'IS_STARRED', 'IS_PINNED', 'IS_DELETED', 'PENDING_ACTION',
  ],
  TASK_CHECKLIST: [
    'ID', 'TASK_ID', 'ITEM_NO', 'TITLE', 'IS_REQUIRED', 'IS_DONE', 'DONE_AT', 'DONE_BY', 'NOTE',
    'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED',
    'SOURCE', 'SCHEMA_VERSION', 'IS_ARCHIVED',
  ],
  CHECKLIST_FEEDBACK: [
    'FEEDBACK_ID', 'CHECKLIST_ITEM_ID', 'TASK_ID', 'MESSAGE', 'AUTHOR', 'CREATED_AT', 'SOURCE', 'SCHEMA_VERSION',
  ],
  CHECKLIST_ATTACHMENTS: [
    'ATTACHMENT_ID', 'CHECKLIST_ITEM_ID', 'TASK_ID', 'FILE_NAME', 'DRIVE_FILE_ID', 'DRIVE_URL',
    'MIME_TYPE', 'SIZE', 'SOURCE', 'CREATED_BY', 'CREATED_AT', 'SCHEMA_VERSION',
  ],
  CHECKLIST_LINKS: [
    'LINK_ID', 'CHECKLIST_ITEM_ID', 'TASK_ID', 'LABEL', 'URL', 'TYPE', 'DESCRIPTION',
    'SOURCE', 'CREATED_BY', 'CREATED_AT', 'SCHEMA_VERSION',
  ],
  CHECKLIST_HISTORY: [
    'HISTORY_ID', 'CHECKLIST_ITEM_ID', 'TASK_ID', 'EVENT_TYPE', 'MESSAGE', 'ACTOR', 'CREATED_AT',
    'SOURCE', 'REF_ID', 'REF_TYPE', 'METADATA_JSON', 'SCHEMA_VERSION',
  ],
  CHECKLIST_TEMPLATES: [
    'TEMPLATE_ID', 'NAME', 'DESCRIPTION', 'CATEGORY', 'VERSION', 'IS_ACTIVE',
    'CREATED_BY', 'CREATED_AT', 'UPDATED_AT', 'SCHEMA_VERSION',
  ],
  CHECKLIST_TEMPLATE_ITEMS: [
    'TEMPLATE_ITEM_ID', 'TEMPLATE_ID', 'TITLE', 'NOTE', 'SORT_ORDER', 'DEFAULT_STATUS',
    'REQUIRED', 'TAGS_JSON', 'SCHEMA_VERSION',
  ],
  CHECKLIST_LAYOUT_STATE: [
    'LAYOUT_STATE_ID', 'TASK_ID', 'CHECKLIST_ITEM_ID', 'EXPANDED', 'LAST_OPENED_AT', 'UPDATED_AT',
    'SOURCE', 'SCHEMA_VERSION',
  ],
  TASK_UPDATE_LOG: ['ID', 'TASK_ID', 'UPDATE_TYPE', 'ACTION', 'ACTOR_ID', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
  TASK_ATTACHMENT: [
    'ID', 'TASK_ID', 'SOURCE_MODE', 'ATTACHMENT_TYPE', 'TITLE',
    'FILE_NAME', 'UPLOAD_FILE', 'FILE_URL', 'DRIVE_FILE_ID',
    'FILE_EXT', 'LINK_DOMAIN', 'SORT_ORDER', 'STATUS', 'NOTE',
    'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED',
  ],
};

var CBV_TASK_DB_REQUIRED_MAIN = ['ID', 'TITLE', 'STATUS', 'OWNER_ID'];

function taskDbGetSpreadsheet_() {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active && active.getId() === CBV_TASK_DB_ID) return active;
  return SpreadsheetApp.openById(CBV_TASK_DB_ID);
}

function taskDbReadHeaders_(sheetName) {
  var ss = taskDbGetSpreadsheet_();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { exists: false, headers: [], headerMap: {} };
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var raw = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var headers = raw.map(function (h) { return String(h || '').trim(); }).filter(Boolean);
  var headerMap = {};
  headers.forEach(function (h, i) {
    headerMap[h.toUpperCase()] = i;
  });
  return { exists: true, headers: headers, headerMap: headerMap, sheet: sheet };
}

function taskDbBuildSchemaReport_() {
  var report = {
    spreadsheetId: CBV_TASK_DB_ID,
    sheets: {},
    missingRequired: [],
    unknownHeaders: [],
    warnings: [],
  };

  Object.keys(CBV_TASK_DB_CONFIG.SHEETS).forEach(function (key) {
    if (key === 'CBV_AUDIT_LOG') return;
    var sheetName = CBV_TASK_DB_CONFIG.SHEETS[key];
    var info = taskDbReadHeaders_(sheetName);
    var expected = CBV_TASK_DB_EXPECTED[sheetName] || [];
    var missing = [];
    var unknown = [];

    if (!info.exists) {
      report.sheets[sheetName] = { exists: false, headers: [], missing: expected, unknown: [] };
      if (sheetName !== 'CBV_AUDIT_LOG') report.missingRequired.push('Sheet missing: ' + sheetName);
      return;
    }

    expected.forEach(function (col) {
      if (info.headers.map(function (h) { return h.toUpperCase(); }).indexOf(col) < 0) {
        missing.push(col);
      }
    });

    info.headers.forEach(function (h) {
      if (expected.indexOf(h.toUpperCase()) < 0 && expected.indexOf(h) < 0) {
        unknown.push(h);
      }
    });

    report.sheets[sheetName] = {
      exists: true,
      headers: info.headers,
      missing: missing,
      unknown: unknown,
    };

    if (sheetName === 'TASK_MAIN') {
      CBV_TASK_DB_REQUIRED_MAIN.forEach(function (col) {
        if (missing.indexOf(col) >= 0) report.missingRequired.push('TASK_MAIN missing required: ' + col);
      });
    }
    if (missing.length) report.warnings.push(sheetName + ' missing columns: ' + missing.join(', '));
    if (unknown.length) report.warnings.push(sheetName + ' unknown columns: ' + unknown.join(', '));
  });

  return report;
}

function taskDbGetMainHeaderMap_() {
  var info = taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_MAIN);
  if (!info.exists) throw new Error('TASK_MAIN sheet not found');
  return info;
}

function taskDbGetUpdateLogHeaderMap_() {
  return taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_UPDATE_LOG);
}

function taskDbRowToRecord_(headerMap, values) {
  var rec = {};
  Object.keys(headerMap).forEach(function (col) {
    rec[col] = values[headerMap[col]];
  });
  return rec;
}

function taskDbRecordToRow_(headerMap, headers, record) {
  var row = new Array(headers.length).fill('');
  Object.keys(record).forEach(function (key) {
    var idx = headerMap[key.toUpperCase()];
    if (idx !== undefined) row[idx] = record[key];
  });
  return row;
}
