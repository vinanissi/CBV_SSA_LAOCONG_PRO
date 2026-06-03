/**
 * PHASE_CHECKLIST_09_SHEET_SCHEMA_BOOTSTRAP — idempotent Sheet tabs/headers for Checklist persistence.
 * Non-destructive: no row deletes, no tab renames, no data clears.
 *
 * Dependencies (optional): 90_BOOTSTRAP_INIT (ensureSheetExists, ensureHeadersMatchOrReport, _writeHeaders)
 */

var CBV_CHECKLIST_SCHEMA_VERSION = '1';

/** Physical sheet name → header row (CBV UPPER_SNAKE). */
var CBV_CHECKLIST_SHEET_SCHEMA_MANIFEST = {
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
};

var CBV_CHECKLIST_SHEET_ROLES_ = {
  TASK_CHECKLIST: 'CHECKLIST_ITEMS',
  CHECKLIST_FEEDBACK: 'CHECKLIST_FEEDBACK',
  CHECKLIST_ATTACHMENTS: 'CHECKLIST_ATTACHMENTS',
  CHECKLIST_LINKS: 'CHECKLIST_LINKS',
  CHECKLIST_HISTORY: 'CHECKLIST_HISTORY',
  CHECKLIST_TEMPLATES: 'CHECKLIST_TEMPLATES',
  CHECKLIST_TEMPLATE_ITEMS: 'CHECKLIST_TEMPLATE_ITEMS',
  CHECKLIST_LAYOUT_STATE: 'CHECKLIST_LAYOUT_STATE',
};

var CBV_CHECKLIST_APPEND_ONLY_TABS_ = {
  CHECKLIST_FEEDBACK: true,
  CHECKLIST_HISTORY: true,
};

function cbvClSchemaNowIso_() {
  try {
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', "yyyy-MM-dd'T'HH:mm:ss");
  } catch (e) {
    return String(new Date().toISOString());
  }
}

function cbvClSchemaResolveSpreadsheet_(options) {
  options = options || {};
  if (options.spreadsheetId) {
    return SpreadsheetApp.openById(String(options.spreadsheetId).trim());
  }
  if (typeof taskDbGetSpreadsheet_ === 'function') {
    return taskDbGetSpreadsheet_();
  }
  if (typeof CBV_TASK_DB_ID !== 'undefined' && CBV_TASK_DB_ID) {
    return SpreadsheetApp.openById(CBV_TASK_DB_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function cbvClSchemaHeadersMatch_(sheet, expectedHeaders) {
  if (typeof ensureHeadersMatchOrReport === 'function') {
    return ensureHeadersMatchOrReport(sheet, expectedHeaders);
  }
  var lastCol = sheet.getLastColumn();
  var currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  if (currentHeaders.length === 0) {
    return { match: false, canExtend: true, missingCount: expectedHeaders.length };
  }
  var expectedLen = expectedHeaders.length;
  var currentLen = currentHeaders.length;
  if (currentLen > expectedLen) {
    return {
      match: false,
      mismatchReason: 'EXTRA_COLUMNS',
      extraColumns: currentHeaders.slice(expectedLen),
    };
  }
  for (var i = 0; i < Math.min(currentLen, expectedLen); i++) {
    var c = String(currentHeaders[i] || '').trim();
    var e = String(expectedHeaders[i] || '').trim();
    if (c !== e) {
      return {
        match: false,
        mismatchReason: 'HEADER_MISMATCH',
        mismatchAt: i,
        expected: e,
        actual: c,
      };
    }
  }
  if (currentLen < expectedLen) {
    return { match: false, canExtend: true, missingCount: expectedLen - currentLen };
  }
  return { match: true };
}

function cbvClSchemaWriteHeaders_(sheet, headers) {
  if (typeof _writeHeaders === 'function') {
    _writeHeaders(sheet, headers);
    return;
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function cbvClSchemaEnsureOneTab_(ss, sheetName, expectedHeaders) {
  var tab = {
    sheetName: sheetName,
    role: CBV_CHECKLIST_SHEET_ROLES_[sheetName] || sheetName,
    appendOnly: !!CBV_CHECKLIST_APPEND_ONLY_TABS_[sheetName],
    created: false,
    headersWritten: false,
    extended: false,
    ok: true,
    warnings: [],
    errors: [],
  };

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    tab.created = true;
    cbvClSchemaWriteHeaders_(sheet, expectedHeaders);
    tab.headersWritten = true;
    return tab;
  }

  var check = cbvClSchemaHeadersMatch_(sheet, expectedHeaders);
  if (check.match) {
    return tab;
  }
  if (check.canExtend && check.missingCount) {
    cbvClSchemaWriteHeaders_(sheet, expectedHeaders);
    tab.headersWritten = true;
    tab.extended = true;
    tab.warnings.push('Extended +' + check.missingCount + ' header column(s)');
    return tab;
  }
  if (check.mismatchReason === 'EXTRA_COLUMNS') {
    tab.warnings.push('Extra columns present (allowed): ' + (check.extraColumns || []).join(', '));
    return tab;
  }
  if (check.mismatchReason === 'HEADER_MISMATCH') {
    tab.ok = false;
    tab.errors.push(
      'Header mismatch at col ' + (check.mismatchAt + 1) + ': expected "' + check.expected + '", got "' + check.actual + '"',
    );
    return tab;
  }

  if (sheet.getLastColumn() === 0) {
    cbvClSchemaWriteHeaders_(sheet, expectedHeaders);
    tab.headersWritten = true;
  }
  return tab;
}

/**
 * Idempotent bootstrap for checklist Sheet schema.
 * @param {Object} [options] spreadsheetId, dryRun
 * @returns {Object} structured report
 */
function bootstrapChecklistSheetSchema(options) {
  options = options || {};
  var dryRun = options.dryRun === true;
  var report = {
    ok: true,
    status: 'GO',
    phase: 'PHASE_CHECKLIST_09_SHEET_SCHEMA_BOOTSTRAP',
    checkedAt: cbvClSchemaNowIso_(),
    spreadsheetId: null,
    dryRun: dryRun,
    tabs: [],
    createdTabs: [],
    extendedTabs: [],
    warnings: [],
    errors: [],
    nextStep: 'Run validateChecklistSheetSchema() after bootstrap',
  };

  var ss;
  try {
    ss = cbvClSchemaResolveSpreadsheet_(options);
    report.spreadsheetId = ss.getId();
  } catch (e) {
    report.ok = false;
    report.status = 'FAIL';
    report.errors.push('Cannot open spreadsheet: ' + String(e.message || e));
    report.nextStep = 'Set spreadsheetId option or open Task DB spreadsheet';
    return report;
  }

  var names = Object.keys(CBV_CHECKLIST_SHEET_SCHEMA_MANIFEST);
  for (var i = 0; i < names.length; i++) {
    var sheetName = names[i];
    var headers = CBV_CHECKLIST_SHEET_SCHEMA_MANIFEST[sheetName];
    if (dryRun) {
      var existing = ss.getSheetByName(sheetName);
      var tabDry = {
        sheetName: sheetName,
        role: CBV_CHECKLIST_SHEET_ROLES_[sheetName],
        ok: true,
        dryRun: true,
        exists: !!existing,
      };
      if (existing) {
        var chk = cbvClSchemaHeadersMatch_(existing, headers);
        tabDry.match = !!chk.match;
        if (chk.mismatchReason === 'HEADER_MISMATCH') tabDry.ok = false;
      }
      report.tabs.push(tabDry);
      continue;
    }

    var tabResult = cbvClSchemaEnsureOneTab_(ss, sheetName, headers);
    report.tabs.push(tabResult);
    if (tabResult.created) report.createdTabs.push(sheetName);
    if (tabResult.extended) report.extendedTabs.push(sheetName);
    tabResult.warnings.forEach(function (w) {
      report.warnings.push(sheetName + ': ' + w);
    });
    tabResult.errors.forEach(function (err) {
      report.errors.push(sheetName + ': ' + err);
    });
    if (!tabResult.ok) report.ok = false;
  }

  if (report.errors.length) {
    report.status = 'FAIL';
    report.ok = false;
    report.nextStep = 'Fix header mismatches manually before bridge phase';
  } else if (report.warnings.length) {
    report.status = 'GO_WITH_WARNINGS';
  }

  return report;
}

/**
 * Validate checklist Sheet schema (read-only).
 */
function validateChecklistSheetSchema(options) {
  options = options || {};
  var result = {
    ok: true,
    status: 'GO',
    checkedAt: cbvClSchemaNowIso_(),
    spreadsheetId: null,
    tabs: {},
    missingTabs: [],
    missingHeaders: [],
    appendOnlyTabs: Object.keys(CBV_CHECKLIST_APPEND_ONLY_TABS_),
    warnings: [],
    errors: [],
    nextStep: 'PHASE_CHECKLIST_10_DRIVE_FOLDER_BOOTSTRAP',
  };

  var ss;
  try {
    ss = cbvClSchemaResolveSpreadsheet_(options);
    result.spreadsheetId = ss.getId();
  } catch (e) {
    result.ok = false;
    result.status = 'FAIL';
    result.errors.push(String(e.message || e));
    return result;
  }

  var names = Object.keys(CBV_CHECKLIST_SHEET_SCHEMA_MANIFEST);
  for (var i = 0; i < names.length; i++) {
    var sheetName = names[i];
    var expected = CBV_CHECKLIST_SHEET_SCHEMA_MANIFEST[sheetName];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      result.missingTabs.push(sheetName);
      result.tabs[sheetName] = { exists: false, role: CBV_CHECKLIST_SHEET_ROLES_[sheetName] };
      result.ok = false;
      continue;
    }

    var check = cbvClSchemaHeadersMatch_(sheet, expected);
    var tabInfo = {
      exists: true,
      role: CBV_CHECKLIST_SHEET_ROLES_[sheetName],
      appendOnly: !!CBV_CHECKLIST_APPEND_ONLY_TABS_[sheetName],
      match: !!check.match,
      missing: [],
      extra: [],
    };

    if (!check.match) {
      if (check.missingCount) {
        for (var m = check.missingCount; m > 0; m--) {
          tabInfo.missing.push(expected[expected.length - m]);
        }
        result.missingHeaders.push({ sheet: sheetName, columns: tabInfo.missing.slice() });
      }
      if (check.mismatchReason === 'HEADER_MISMATCH') {
        result.errors.push(sheetName + ': header mismatch at ' + (check.mismatchAt + 1));
        result.ok = false;
      }
      if (check.mismatchReason === 'EXTRA_COLUMNS') {
        tabInfo.extra = check.extraColumns || [];
        result.warnings.push(sheetName + ': extra columns ' + tabInfo.extra.join(', '));
      }
    }

    result.tabs[sheetName] = tabInfo;
  }

  if (result.missingTabs.length || result.missingHeaders.length || result.errors.length) {
    result.status = result.errors.length ? 'FAIL' : 'GO_WITH_WARNINGS';
    if (!result.errors.length) result.ok = true;
    else result.ok = false;
    result.nextStep = 'Run bootstrapChecklistSheetSchema() then re-validate';
  } else if (result.warnings.length) {
    result.status = 'GO_WITH_WARNINGS';
  }

  return result;
}
