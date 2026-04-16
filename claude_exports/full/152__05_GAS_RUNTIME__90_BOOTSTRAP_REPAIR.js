/**
 * CBV Schema and Data Repair - Must-fix pass for selfAuditBootstrap blockers.
 * Non-destructive: adds missing columns, fills blanks with safe defaults.
 * Dependencies: 90_BOOTSTRAP_SCHEMA, 90_BOOTSTRAP_AUDIT helpers, 03_SHARED_REPOSITORY
 *
 * Run repairSchemaAndData() to fix schema columns and data blanks.
 * PRO schema: DON_VI_ID, TASK_TYPE_ID. No legacy columns.
 */

function _repairGetFirstDonViId(ss) {
  var sheet = ss.getSheetByName(CBV_CONFIG.SHEETS.DON_VI || 'DON_VI');
  if (!sheet) return null;
  var loaded = typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sheet, 'DON_VI') : null;
  if (!loaded || loaded.rowCount === 0) return null;
  var h = loaded.headers;
  var idIdx = h.indexOf('ID');
  var stIdx = h.indexOf('STATUS');
  if (idIdx < 0) return null;
  for (var i = 0; i < loaded.rows.length; i++) {
    var r = loaded.rows[i];
    if (stIdx < 0 || String(r.STATUS || r[stIdx] || '').trim() === 'ACTIVE') {
      var id = String(r.ID || r[idIdx] || '').trim();
      if (id) return id;
    }
  }
  var first = loaded.rows[0];
  return first ? (String(first.ID || first[idIdx] || '').trim() || null) : null;
}

/** ACTION -> UPDATE_TYPE mapping for TASK_UPDATE_LOG backfill */
var ACTION_TO_UPDATE_TYPE = {
  'note': 'NOTE',
  'Note': 'NOTE',
  'NOTE': 'NOTE',
  'question': 'QUESTION',
  'Question': 'QUESTION',
  'QUESTION': 'QUESTION',
  'answer': 'ANSWER',
  'Answer': 'ANSWER',
  'ANSWER': 'ANSWER',
  'status_change': 'STATUS_CHANGE',
  'Status change': 'STATUS_CHANGE',
  'Status Change': 'STATUS_CHANGE',
  'STATUS_CHANGE': 'STATUS_CHANGE',
  'status change': 'STATUS_CHANGE',
  'comment': 'NOTE',
  'Comment': 'NOTE',
  'COMMENT': 'NOTE'
};

/**
 * Adds a missing column to a sheet at the specified 1-based position.
 * Does not remove existing columns.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} colPosition 1-based
 * @param {string} headerName
 * @returns {boolean} true if column was added
 */
function _repairInsertColumn(sheet, colPosition, headerName) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
  if (headers.indexOf(headerName) !== -1) return false;
  sheet.insertColumnBefore(colPosition);
  sheet.getRange(1, colPosition).setValue(headerName);
  return true;
}

/**
 * Repairs schema: adds DON_VI_ID, TASK_TYPE_ID to TASK_MAIN and UPDATE_TYPE, ACTION to TASK_UPDATE_LOG if missing.
 * @returns {Object} { ok, schemaRepairs: string[] }
 */
function repairSchemaColumns() {
  var result = { ok: true, schemaRepairs: [] };
  var ss = SpreadsheetApp.getActive();

  var taskMain = ss.getSheetByName(CBV_CONFIG.SHEETS.TASK_MAIN);
  if (taskMain) {
    var headers = taskMain.getRange(1, 1, 1, taskMain.getLastColumn() || 1).getValues()[0];
    var expected = getSchemaHeaders(CBV_CONFIG.SHEETS.TASK_MAIN);
    ['DON_VI_ID', 'TASK_TYPE_ID'].forEach(function(col) {
      if (headers.indexOf(col) === -1) {
        var pos = expected.indexOf(col) + 1;
        if (pos > 0 && _repairInsertColumn(taskMain, pos, col)) {
          result.schemaRepairs.push('TASK_MAIN: added ' + col + ' at col ' + pos);
        }
      }
    });
  }

  var taskLog = ss.getSheetByName(CBV_CONFIG.SHEETS.TASK_UPDATE_LOG);
  if (taskLog) {
    var logHeaders = taskLog.getRange(1, 1, 1, taskLog.getLastColumn() || 1).getValues()[0];
    var logExpected = getSchemaHeaders(CBV_CONFIG.SHEETS.TASK_UPDATE_LOG);
    if (logHeaders.indexOf('UPDATE_TYPE') === -1) {
      var updPos = logExpected.indexOf('UPDATE_TYPE') + 1;
      if (updPos > 0 && _repairInsertColumn(taskLog, updPos, 'UPDATE_TYPE')) {
        result.schemaRepairs.push('TASK_UPDATE_LOG: added UPDATE_TYPE at col ' + updPos);
      }
    }
    if (logHeaders.indexOf('ACTION') === -1) {
      var actionPos = logExpected.indexOf('ACTION') + 1;
      if (actionPos > 0 && _repairInsertColumn(taskLog, actionPos, 'ACTION')) {
        result.schemaRepairs.push('TASK_UPDATE_LOG: added ACTION at col ' + actionPos);
      }
    }
  }

  return result;
}

/**
 * Repairs USER_DIRECTORY: fills blank ROLE and STATUS with safe defaults.
 * ROLE enum includes ACCOUNTANT (extended in 01_ENUM_CONFIG). Blank ROLE → OPERATOR.
 * @returns {Object} { ok, repaired: number, rowsFixed: { row, col, from, to }[], manualReview: { row, col, sheet }[] }
 */
function repairUserDirectoryBlanks() {
  var result = { ok: true, repaired: 0, rowsFixed: [], manualReview: [] };
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.USER_DIRECTORY);
  if (!sheet) return result;
  var loaded = typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sheet, CBV_CONFIG.SHEETS.USER_DIRECTORY) : null;
  if (!loaded || loaded.rowCount === 0) return result;

  var headers = loaded.headers;
  var roleIdx = headers.indexOf('ROLE');
  var statusIdx = headers.indexOf('STATUS');
  if (roleIdx === -1 || statusIdx === -1) return result;

  var validRoles = (typeof getEnumValues === 'function' ? getEnumValues('ROLE') : null) || (typeof CBV_ENUM !== 'undefined' && CBV_ENUM.ROLE) || ['ADMIN', 'OPERATOR', 'ACCOUNTANT', 'VIEWER'];
  var validStatuses = (typeof getEnumValues === 'function' ? getEnumValues('USER_DIRECTORY_STATUS') : null) || (typeof CBV_ENUM !== 'undefined' && CBV_ENUM.USER_DIRECTORY_STATUS) || ['ACTIVE', 'INACTIVE', 'ARCHIVED'];

  loaded.rows.forEach(function(r) {
    var rowNum = r._rowNumber || 0;
    var roleVal = String(r.ROLE || r[roleIdx] || '').trim();
    var statusVal = String(r.STATUS || r[statusIdx] || '').trim();

    if (!roleVal) {
      if (validRoles.indexOf('OPERATOR') !== -1) {
        sheet.getRange(rowNum, roleIdx + 1).setValue('OPERATOR');
        result.repaired++;
        result.rowsFixed.push({ sheet: 'USER_DIRECTORY', row: rowNum, col: 'ROLE', from: '(blank)', to: 'OPERATOR', decision: 'Safe default for non-admin' });
      } else {
        result.manualReview.push({ row: rowNum, col: 'ROLE', sheet: 'USER_DIRECTORY' });
      }
    } else if (validRoles.indexOf(roleVal) === -1 && roleVal.toUpperCase() === 'ACCOUNTANT') {
      if (validRoles.indexOf('ACCOUNTANT') !== -1) {
        sheet.getRange(rowNum, roleIdx + 1).setValue('ACCOUNTANT');
        result.repaired++;
        result.rowsFixed.push({ sheet: 'USER_DIRECTORY', row: rowNum, col: 'ROLE', from: roleVal, to: 'ACCOUNTANT', decision: 'Normalized to canonical enum value' });
      }
    }

    if (!statusVal) {
      sheet.getRange(rowNum, statusIdx + 1).setValue('ACTIVE');
      result.repaired++;
      result.rowsFixed.push({ sheet: 'USER_DIRECTORY', row: rowNum, col: 'STATUS', from: '(blank)', to: 'ACTIVE', decision: 'Safe default' });
    }
  });

  return result;
}

/**
 * Repairs HO_SO_MASTER (PRO): blank STATUS -> NEW (or ACTIVE if files exist); blank HO_SO_TYPE_ID -> MASTER_CODE KHAC or first HO_SO_TYPE.
 * @returns {Object} { ok, repaired: number, rowsFixed: [], manualReview: [] }
 */
function repairHoSoMasterBlanks() {
  var result = { ok: true, repaired: 0, rowsFixed: [], manualReview: [] };
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(CBV_CONFIG.SHEETS.HO_SO_MASTER);
  if (!sheet) return result;
  var loaded = typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sheet, CBV_CONFIG.SHEETS.HO_SO_MASTER) : null;
  if (!loaded || loaded.rowCount === 0) return result;

  var headers = loaded.headers;
  var idIdx = headers.indexOf('ID');
  var typeIdIdx = headers.indexOf('HO_SO_TYPE_ID');
  var codeIdx = headers.indexOf('HO_SO_CODE');
  var statusIdx = headers.indexOf('STATUS');
  if (idIdx === -1 || statusIdx === -1) return result;

  var defaultTypeId = '';
  if (typeIdIdx >= 0 && typeof hosoRepoRows === 'function') {
    var mcRows = hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE);
    var khac = mcRows.find(function(m) {
      return String(m.MASTER_GROUP || '') === 'HO_SO_TYPE' && String(m.CODE || '') === 'KHAC' && String(m.STATUS || '') === 'ACTIVE';
    });
    if (khac) defaultTypeId = String(khac.ID);
    else {
      var any = mcRows.find(function(m) { return String(m.MASTER_GROUP || '') === 'HO_SO_TYPE' && String(m.STATUS || '') === 'ACTIVE'; });
      if (any) defaultTypeId = String(any.ID);
    }
  }

  var hoSoIdsWithFiles = {};
  var fileSheet = ss.getSheetByName(CBV_CONFIG.SHEETS.HO_SO_FILE);
  var fileLoaded = fileSheet && typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(fileSheet, CBV_CONFIG.SHEETS.HO_SO_FILE) : null;
  if (fileLoaded && fileLoaded.rowCount > 0) {
    var fHoSoIdx = fileLoaded.headers.indexOf('HO_SO_ID');
    if (fHoSoIdx >= 0) {
      fileLoaded.rows.forEach(function(r) {
        var hsId = String(r.HO_SO_ID || r[fHoSoIdx] || '').trim();
        if (hsId) hoSoIdsWithFiles[hsId] = true;
      });
    }
  }

  loaded.rows.forEach(function(r) {
    var rowNum = r._rowNumber || 0;
    var idVal = String(r.ID || r[idIdx] || '').trim();
    var statusVal = String(r.STATUS || r[statusIdx] || '').trim();
    var typeIdVal = typeIdIdx >= 0 ? String(r.HO_SO_TYPE_ID || r[typeIdIdx] || '').trim() : '';
    var codeVal = codeIdx >= 0 ? String(r.HO_SO_CODE || r[codeIdx] || '').trim() : '';

    if (typeIdIdx >= 0 && !typeIdVal) {
      if (defaultTypeId) {
        sheet.getRange(rowNum, typeIdIdx + 1).setValue(defaultTypeId);
        result.repaired++;
        result.rowsFixed.push({ sheet: 'HO_SO_MASTER', row: rowNum, col: 'HO_SO_TYPE_ID', from: '(blank)', to: defaultTypeId, decision: 'Default MASTER HO_SO_TYPE' });
        typeIdVal = defaultTypeId;
      } else {
        result.manualReview.push({ row: rowNum, col: 'HO_SO_TYPE_ID', id: idVal, sheet: 'HO_SO_MASTER' });
      }
    }

    if (codeIdx >= 0 && !codeVal && typeIdVal && typeof hosoGenerateHoSoCode === 'function') {
      var newCode = hosoGenerateHoSoCode(typeIdVal);
      sheet.getRange(rowNum, codeIdx + 1).setValue(newCode);
      result.repaired++;
      result.rowsFixed.push({ sheet: 'HO_SO_MASTER', row: rowNum, col: 'HO_SO_CODE', from: '(blank)', to: newCode, decision: 'Generated HS code' });
    }

    if (!statusVal) {
      var defaultStatus = hoSoIdsWithFiles[idVal] ? 'ACTIVE' : 'NEW';
      sheet.getRange(rowNum, statusIdx + 1).setValue(defaultStatus);
      result.repaired++;
      result.rowsFixed.push({ sheet: 'HO_SO_MASTER', row: rowNum, col: 'STATUS', from: '(blank)', to: defaultStatus, decision: (defaultStatus === 'ACTIVE' ? 'Has HO_SO_FILE rows' : 'Default NEW') });
    }
  });

  return result;
}

/**
 * Repairs HO_SO_FILE (PRO): fills blank FILE_TYPE with OTHER.
 * @returns {Object} { ok, repaired: number, rowsFixed: [] }
 */
function repairHoSoFileBlanks() {
  var result = { ok: true, repaired: 0, rowsFixed: [] };
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.HO_SO_FILE);
  if (!sheet) return result;
  var loaded = typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sheet, CBV_CONFIG.SHEETS.HO_SO_FILE) : null;
  if (!loaded || loaded.rowCount === 0) return result;

  var headers = loaded.headers;
  var ftIdx = headers.indexOf('FILE_TYPE');
  var legacyIdx = headers.indexOf('FILE_GROUP');
  var colIdx = ftIdx >= 0 ? ftIdx : legacyIdx;
  if (colIdx === -1) return result;
  var colName = ftIdx >= 0 ? 'FILE_TYPE' : 'FILE_GROUP';
  var fallback = ftIdx >= 0 ? 'OTHER' : 'KHAC';

  loaded.rows.forEach(function(r) {
    var rowNum = r._rowNumber || 0;
    var val = String(ftIdx >= 0 ? (r.FILE_TYPE || r[ftIdx]) : (r.FILE_GROUP || r[legacyIdx]) || '').trim();
    if (!val) {
      sheet.getRange(rowNum, colIdx + 1).setValue(fallback);
      result.repaired++;
      result.rowsFixed.push({ sheet: 'HO_SO_FILE', row: rowNum, col: colName, from: '(blank)', to: fallback, decision: 'Default type' });
    }
  });

  return result;
}

/**
 * Repairs FINANCE_TRANSACTION: fills blank STATUS with NEW; TRANS_TYPE only if inferable from CATEGORY.
 * @returns {Object} { ok, statusFilled: number, transTypeFilled: number, rowsFixed: [], manualReview: [] }
 */
function repairFinanceTransactionBlanks() {
  var result = { ok: true, statusFilled: 0, transTypeFilled: 0, rowsFixed: [], manualReview: [] };
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION);
  if (!sheet) return result;
  var loaded = typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sheet, CBV_CONFIG.SHEETS.FINANCE_TRANSACTION) : null;
  if (!loaded || loaded.rowCount === 0) return result;

  var headers = loaded.headers;
  var statusIdx = headers.indexOf('STATUS');
  var transTypeIdx = headers.indexOf('TRANS_TYPE');
  var categoryIdx = headers.indexOf('CATEGORY');
  var idIdx = headers.indexOf('ID');

  var categoryToType = { 'THU_KHAC': 'INCOME', 'VAN_HANH': 'EXPENSE', 'NHIEN_LIEU': 'EXPENSE', 'SUA_CHUA': 'EXPENSE', 'LUONG': 'EXPENSE', 'CHI_KHAC': 'EXPENSE' };

  loaded.rows.forEach(function(r) {
    var rowNum = r._rowNumber || 0;
    var statusVal = String(r.STATUS || r[statusIdx] || '').trim();
    var transTypeVal = String(r.TRANS_TYPE || r[transTypeIdx] || '').trim();
    var categoryVal = categoryIdx >= 0 ? String(r.CATEGORY || r[categoryIdx] || '').trim() : '';
    var rowId = idIdx >= 0 ? String(r.ID || r[idIdx] || '').trim() : '';

    if (!statusVal) {
      sheet.getRange(rowNum, statusIdx + 1).setValue('NEW');
      result.statusFilled++;
      result.rowsFixed.push({ sheet: 'FINANCE_TRANSACTION', row: rowNum, col: 'STATUS', from: '(blank)', to: 'NEW', id: rowId, decision: 'Safe default' });
    }

    if (!transTypeVal) {
      var inferred = categoryVal ? (categoryToType[categoryVal] || null) : null;
      if (inferred) {
        sheet.getRange(rowNum, transTypeIdx + 1).setValue(inferred);
        result.transTypeFilled++;
        result.rowsFixed.push({ sheet: 'FINANCE_TRANSACTION', row: rowNum, col: 'TRANS_TYPE', from: '(blank)', to: inferred, id: rowId, decision: 'Inferred from CATEGORY ' + categoryVal });
      } else {
        result.manualReview.push({ sheet: 'FINANCE_TRANSACTION', row: rowNum, col: 'TRANS_TYPE', id: rowId });
      }
    }
  });

  return result;
}

/**
 * Repairs TASK_UPDATE_LOG: backfills UPDATE_TYPE from ACTION; fills blank ACTION with NOTE for compatibility.
 * @returns {Object} { ok, updateTypeFilled: number, actionFilled: number, rowsFixed: [] }
 */
function repairTaskUpdateLogBlanks() {
  var result = { ok: true, updateTypeFilled: 0, actionFilled: 0, rowsFixed: [] };
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.TASK_UPDATE_LOG);
  if (!sheet) return result;
  var loaded = typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sheet, CBV_CONFIG.SHEETS.TASK_UPDATE_LOG) : null;
  if (!loaded || loaded.rowCount === 0) return result;

  var headers = loaded.headers;
  var updateTypeIdx = headers.indexOf('UPDATE_TYPE');
  var actionIdx = headers.indexOf('ACTION');

  if (updateTypeIdx === -1) return result;

  loaded.rows.forEach(function(r) {
    var rowNum = r._rowNumber || 0;
    var updateTypeVal = String(r.UPDATE_TYPE || r[updateTypeIdx] || '').trim();
    var actionVal = actionIdx >= 0 ? String(r.ACTION || r[actionIdx] || '').trim() : '';

    if (!updateTypeVal && actionVal) {
      var mapped = ACTION_TO_UPDATE_TYPE[actionVal] || 'NOTE';
      sheet.getRange(rowNum, updateTypeIdx + 1).setValue(mapped);
      result.updateTypeFilled++;
      result.rowsFixed.push({ sheet: 'TASK_UPDATE_LOG', row: rowNum, col: 'UPDATE_TYPE', from: '(blank)', to: mapped, decision: 'Mapped from ACTION' });
    } else if (!updateTypeVal) {
      sheet.getRange(rowNum, updateTypeIdx + 1).setValue('NOTE');
      result.updateTypeFilled++;
      result.rowsFixed.push({ sheet: 'TASK_UPDATE_LOG', row: rowNum, col: 'UPDATE_TYPE', from: '(blank)', to: 'NOTE', decision: 'Default' });
    }

    if (actionIdx >= 0 && !actionVal) {
      sheet.getRange(rowNum, actionIdx + 1).setValue('NOTE');
      result.actionFilled++;
      result.rowsFixed.push({ sheet: 'TASK_UPDATE_LOG', row: rowNum, col: 'ACTION', from: '(blank)', to: 'NOTE', decision: 'Compatibility with legacy readers' });
    }
  });

  return result;
}

/**
 * Backfills TASK_MAIN.DON_VI_ID where blank with first active DON_VI.
 * @returns {Object} { ok, filled: number, manualReview: { row: number, id: string }[] }
 */
function repairTaskMainDonViIdBlanks() {
  var result = { ok: true, filled: 0, manualReview: [] };
  var ss = SpreadsheetApp.getActive();
  var taskSheet = ss.getSheetByName(CBV_CONFIG.SHEETS.TASK_MAIN);
  if (!taskSheet) return result;
  var taskLoaded = typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(taskSheet, CBV_CONFIG.SHEETS.TASK_MAIN) : null;
  if (!taskLoaded || taskLoaded.rowCount === 0) return result;

  var headers = taskLoaded.headers;
  var dvIdx = headers.indexOf('DON_VI_ID');
  var idIdx = headers.indexOf('ID');
  if (dvIdx === -1) return result;

  var firstDonViId = typeof _repairGetFirstDonViId === 'function' ? _repairGetFirstDonViId(ss) : null;

  taskLoaded.rows.forEach(function(r) {
    var rowNum = r._rowNumber || 0;
    var dvVal = String(r.DON_VI_ID || r[dvIdx] || '').trim();
    var taskId = String(r.ID || r[idIdx] || '').trim();
    if (!dvVal && firstDonViId) {
      taskSheet.getRange(rowNum, dvIdx + 1).setValue(firstDonViId);
      result.filled++;
    } else if (!dvVal) {
      result.manualReview.push({ row: rowNum, id: taskId, sheet: 'TASK_MAIN' });
    }
  });

  return result;
}

/**
 * Full schema and data repair pass. Run after selfAuditBootstrap identifies blockers.
 * @param {Object} options { skipSchema, skipUser, skipHoSo, skipHoSoFile, skipFinance, skipTaskLog, skipTaskMainDonVi }
 * @returns {Object} Combined result with rowsFixed, manualReview, exact rerun order
 */
function repairSchemaAndData(options) {
  var opts = options || {};
  var combined = {
    ok: true,
    schemaRepairs: [],
    userRepaired: 0,
    userManualReview: [],
    hoSoRepaired: 0,
    hoSoManualReview: [],
    hoSoFileRepaired: 0,
    financeStatusFilled: 0,
    financeTransTypeFilled: 0,
    financeManualReview: [],
    taskLogUpdateTypeFilled: 0,
    taskLogActionFilled: 0,
    taskMainDonViFilled: 0,
    taskMainManualReview: [],
    rowsFixed: [],
    manualReview: [],
    manualReviewTotal: 0,
    errors: []
  };

  if (opts.skipSchema !== true) {
    var schema = repairSchemaColumns();
    combined.schemaRepairs = schema.schemaRepairs || [];
  }

  if (opts.skipUser !== true) {
    var ud = repairUserDirectoryBlanks();
    combined.userRepaired = ud.repaired || 0;
    combined.userManualReview = ud.manualReview || [];
    if (ud.rowsFixed) combined.rowsFixed = combined.rowsFixed.concat(ud.rowsFixed);
  }

  if (opts.skipHoSo !== true) {
    var hs = repairHoSoMasterBlanks();
    combined.hoSoRepaired = hs.repaired || 0;
    combined.hoSoManualReview = hs.manualReview || [];
    if (hs.rowsFixed) combined.rowsFixed = combined.rowsFixed.concat(hs.rowsFixed);
  }

  if (opts.skipHoSoFile !== true) {
    var hsf = repairHoSoFileBlanks();
    combined.hoSoFileRepaired = hsf.repaired || 0;
    if (hsf.rowsFixed) combined.rowsFixed = combined.rowsFixed.concat(hsf.rowsFixed);
  }

  if (opts.skipFinance !== true) {
    var ft = repairFinanceTransactionBlanks();
    combined.financeStatusFilled = ft.statusFilled || 0;
    combined.financeTransTypeFilled = ft.transTypeFilled || 0;
    combined.financeManualReview = ft.manualReview || [];
    if (ft.rowsFixed) combined.rowsFixed = combined.rowsFixed.concat(ft.rowsFixed);
  }

  if (opts.skipTaskMainDonVi !== true) {
    var tmdv = repairTaskMainDonViIdBlanks();
    combined.taskMainDonViFilled = tmdv.filled || 0;
    combined.taskMainManualReview = tmdv.manualReview || [];
  }

  if (opts.skipTaskLog !== true) {
    var tul = repairTaskUpdateLogBlanks();
    combined.taskLogUpdateTypeFilled = tul.updateTypeFilled || 0;
    combined.taskLogActionFilled = tul.actionFilled || 0;
    if (tul.rowsFixed) combined.rowsFixed = combined.rowsFixed.concat(tul.rowsFixed);
  }

  combined.manualReview = (combined.userManualReview || []).concat(combined.hoSoManualReview || []).concat(combined.financeManualReview || []).concat(combined.taskMainManualReview || []);
  combined.manualReviewTotal = combined.manualReview.length;
  combined.ok = combined.manualReviewTotal === 0;

  var starPinResult = repairAddStarPinColumns();
  combined.starPinRepair = starPinResult;
  if (!starPinResult.ok) {
    combined.ok = false;
    combined.errors = combined.errors.concat(starPinResult.errors || []);
  }

  combined.rerunOrder = ['seedEnumDictionary()', 'repairSchemaAndData({})', 'selfAuditBootstrap()', 'verifyAppSheetReadiness()'];

  if (typeof Logger !== 'undefined') Logger.log('repairSchemaAndData: ' + JSON.stringify(combined, null, 2));
  return combined;
}

// --- Residual invalid records (ID-based inspection and repair) ---

/** Tables and columns that cause audit blockers when blank. Keyed by sheet name. */
var RESIDUAL_BLOCKER_COLUMNS = {
  TASK_MAIN: ['STATUS', 'PRIORITY', 'DON_VI_ID'],
  USER_DIRECTORY: ['ROLE', 'STATUS'],
  HO_SO_MASTER: ['HO_SO_TYPE_ID', 'HO_SO_CODE', 'STATUS'],
  FINANCE_TRANSACTION: ['STATUS', 'TRANS_TYPE', 'CATEGORY'],
  ADMIN_AUDIT_LOG: ['ENTITY_ID']
};

/**
 * Inspects real records for blank required fields. Reports by ID, not row number.
 * Uses normalized row reader (excludes fully blank rows).
 * @returns {Object} { badRecords: [{ table, id, currentValues, missingFields }], summary: { table: count } }
 */
function inspectResidualInvalidRecords() {
  var badRecords = [];
  var summary = {};
  var tables = ['TASK_MAIN', 'USER_DIRECTORY', 'HO_SO_MASTER', 'FINANCE_TRANSACTION', 'ADMIN_AUDIT_LOG'];
  var sheetNames = {
    TASK_MAIN: CBV_CONFIG.SHEETS.TASK_MAIN,
    USER_DIRECTORY: CBV_CONFIG.SHEETS.USER_DIRECTORY,
    HO_SO_MASTER: CBV_CONFIG.SHEETS.HO_SO_MASTER,
    FINANCE_TRANSACTION: CBV_CONFIG.SHEETS.FINANCE_TRANSACTION,
    ADMIN_AUDIT_LOG: CBV_CONFIG.SHEETS.ADMIN_AUDIT_LOG
  };

  tables.forEach(function(table) {
    var sheetName = sheetNames[table];
    var cols = RESIDUAL_BLOCKER_COLUMNS[table];
    if (!cols || cols.length === 0) return;
    var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
    if (!sheet) return;
    var loaded = typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sheet, table) : null;
    var rows = loaded ? loaded.rows : (typeof _auditGetRows === 'function' ? _auditGetRows(sheet) : (typeof readNormalizedRows === 'function' ? readNormalizedRows(sheet, table) : []));
    if (!rows || rows.length === 0) return;
    rows.forEach(function(r) {
      var id = String(r.ID || '').trim();
      if (!id) return;
      var missing = [];
      var current = {};
      cols.forEach(function(col) {
        var v = r[col];
        var blank = v === undefined || v === null || String(v).trim() === '';
        current[col] = blank ? '(blank)' : String(v).trim();
        if (blank) missing.push(col);
      });
      if (missing.length > 0) {
        var rec = { table: table, id: id, currentValues: current, missingFields: missing, _rowNumber: r._rowNumber };
        if (table === 'FINANCE_TRANSACTION') rec.amount = r.AMOUNT;
        badRecords.push(rec);
        summary[table] = (summary[table] || 0) + 1;
      }
    });
  });

  var out = { badRecords: badRecords, summary: summary };
  if (typeof Logger !== 'undefined') Logger.log('inspectResidualInvalidRecords: ' + JSON.stringify(out, null, 2));
  return out;
}

/** Safe defaults for residual repair */
var RESIDUAL_SAFE_DEFAULTS = {
  TASK_MAIN: { STATUS: 'NEW', PRIORITY: 'MEDIUM' },
  USER_DIRECTORY: { ROLE: 'OPERATOR', STATUS: 'ACTIVE' },
  HO_SO_MASTER_STATUS_NEW: 'NEW',
  HO_SO_MASTER_STATUS_ACTIVE: 'ACTIVE',
  FINANCE_TRANSACTION: { STATUS: 'NEW' },
  ADMIN_AUDIT_LOG: { ENTITY_ID: 'SYSTEM' }
};

/** HO_SO_TYPE inference from ID prefix */
var HO_SO_TYPE_FROM_ID_PREFIX = { 'HTX_': 'HTX', 'XV_': 'XA_VIEN', 'XE_': 'XE', 'TX_': 'TAI_XE' };

/** CATEGORY -> TRANS_TYPE inference */
var CATEGORY_TO_TRANS_TYPE = { 'THU_KHAC': 'INCOME', 'VAN_HANH': 'EXPENSE', 'NHIEN_LIEU': 'EXPENSE', 'SUA_CHUA': 'EXPENSE', 'LUONG': 'EXPENSE', 'CHI_KHAC': 'EXPENSE' };

/**
 * Repairs only residual invalid records identified by inspectResidualInvalidRecords.
 * Uses safe defaults where applicable; flags HO_SO_TYPE, TRANS_TYPE, CATEGORY for manual review when not inferable.
 * @returns {Object} { repaired: number, repairsApplied: [], manualReview: [], ok: boolean }
 */
function repairResidualInvalidRecords() {
  var inspection = inspectResidualInvalidRecords();
  var repairsApplied = [];
  var manualReview = [];
  var repaired = 0;
  var ss = SpreadsheetApp.getActive();

  var hoSoIdsWithFiles = {};
  var fileSheet = ss.getSheetByName(CBV_CONFIG.SHEETS.HO_SO_FILE);
  var fileLoaded = fileSheet && typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(fileSheet, CBV_CONFIG.SHEETS.HO_SO_FILE) : null;
  var fRows = fileLoaded && fileLoaded.rowCount > 0 ? fileLoaded.rows : (fileSheet && typeof _auditGetRows === 'function' ? _auditGetRows(fileSheet) : []);
  if (fRows && fRows.length > 0) {
    fRows.forEach(function(r) {
      var hsId = String(r.HO_SO_ID || '').trim();
      if (hsId) hoSoIdsWithFiles[hsId] = true;
    });
  }

  inspection.badRecords.forEach(function(rec) {
    var table = rec.table;
    var id = rec.id;
    var patch = {};
    var sheetName = CBV_CONFIG.SHEETS[table] || table;

    if (table === 'TASK_MAIN') {
      var firstDonViId = _repairGetFirstDonViId(ss);
      rec.missingFields.forEach(function(col) {
        var def = RESIDUAL_SAFE_DEFAULTS.TASK_MAIN[col];
        if (col === 'DON_VI_ID' && firstDonViId) def = firstDonViId;
        if (def) { patch[col] = def; repairsApplied.push({ table: table, id: id, column: col, from: rec.currentValues[col], to: def }); }
      });
    } else if (table === 'USER_DIRECTORY') {
      rec.missingFields.forEach(function(col) {
        var def = RESIDUAL_SAFE_DEFAULTS.USER_DIRECTORY[col];
        if (def) { patch[col] = def; repairsApplied.push({ table: table, id: id, column: col, from: rec.currentValues[col], to: def }); }
      });
    } else if (table === 'HO_SO_MASTER') {
      var defaultHosoTypeId = '';
      if (typeof hosoRepoRows === 'function') {
        var mcRows = hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE);
        var k = mcRows.find(function(m) {
          return String(m.MASTER_GROUP || '') === 'HO_SO_TYPE' && String(m.CODE || '') === 'KHAC' && String(m.STATUS || '') === 'ACTIVE';
        });
        if (k) defaultHosoTypeId = String(k.ID);
        else {
          var a = mcRows.find(function(m) { return String(m.MASTER_GROUP || '') === 'HO_SO_TYPE' && String(m.STATUS || '') === 'ACTIVE'; });
          if (a) defaultHosoTypeId = String(a.ID);
        }
      }
      rec.missingFields.forEach(function(col) {
        if (col === 'STATUS') {
          var def = hoSoIdsWithFiles[id] ? RESIDUAL_SAFE_DEFAULTS.HO_SO_MASTER_STATUS_ACTIVE : RESIDUAL_SAFE_DEFAULTS.HO_SO_MASTER_STATUS_NEW;
          patch[col] = def;
          repairsApplied.push({ table: table, id: id, column: col, from: rec.currentValues[col], to: def });
        } else if (col === 'HO_SO_TYPE_ID') {
          if (defaultHosoTypeId) {
            patch[col] = defaultHosoTypeId;
            repairsApplied.push({ table: table, id: id, column: col, from: rec.currentValues[col], to: defaultHosoTypeId });
          } else {
            manualReview.push({ table: table, id: id, column: col, reason: 'No HO_SO_TYPE master row to default' });
          }
        } else if (col === 'HO_SO_CODE' && defaultHosoTypeId && typeof hosoGenerateHoSoCode === 'function') {
          var nc = hosoGenerateHoSoCode(patch.HO_SO_TYPE_ID || defaultHosoTypeId);
          patch[col] = nc;
          repairsApplied.push({ table: table, id: id, column: col, from: rec.currentValues[col], to: nc });
        }
      });
    } else if (table === 'FINANCE_TRANSACTION') {
      rec.missingFields.forEach(function(col) {
        if (col === 'STATUS') {
          patch[col] = RESIDUAL_SAFE_DEFAULTS.FINANCE_TRANSACTION.STATUS;
          repairsApplied.push({ table: table, id: id, column: col, from: rec.currentValues[col], to: patch[col] });
        } else if (col === 'TRANS_TYPE') {
          var cat = rec.currentValues.CATEGORY;
          var inferred = cat && cat !== '(blank)' ? (CATEGORY_TO_TRANS_TYPE[cat] || null) : null;
          var amt = rec.amount !== undefined && rec.amount !== null ? Number(rec.amount) : NaN;
          if (!inferred && !isNaN(amt)) {
            inferred = amt >= 0 ? 'INCOME' : 'EXPENSE';
          }
          if (inferred) {
            patch[col] = inferred;
            repairsApplied.push({ table: table, id: id, column: col, from: rec.currentValues[col], to: inferred });
          } else {
            manualReview.push({ table: table, id: id, column: col, reason: 'TRANS_TYPE not inferable from CATEGORY or AMOUNT' });
          }
        } else if (col === 'CATEGORY') {
          manualReview.push({ table: table, id: id, column: col, reason: 'CATEGORY requires manual choice from FIN_CATEGORY enum' });
        }
      });
    } else if (table === 'ADMIN_AUDIT_LOG') {
      if (rec.missingFields.indexOf('ENTITY_ID') !== -1) {
        patch.ENTITY_ID = 'SYSTEM';
        repairsApplied.push({ table: table, id: id, column: 'ENTITY_ID', from: rec.currentValues.ENTITY_ID, to: 'SYSTEM' });
      }
    }

    if (Object.keys(patch).length > 0 && typeof _updateRow === 'function' && rec._rowNumber) {
      _updateRow(sheetName, rec._rowNumber, patch);
      repaired++;
    }
  });

  var result = { repaired: repaired, repairsApplied: repairsApplied, manualReview: manualReview, ok: manualReview.length === 0 };
  if (typeof Logger !== 'undefined') Logger.log('repairResidualInvalidRecords: ' + JSON.stringify(result, null, 2));
  return result;
}

/**
 * HOTFIX v2 — Star/Pin cleanup & repair
 * Root cause fix: không anchor vào IS_DELETED hay bất kỳ tên cột cụ thể nào.
 * Dùng "cột cuối cùng có header thực sự" làm anchor.
 *
 * Chạy thủ công theo thứ tự:
 *   1. debugStarPinColumns()
 *   2. cleanupStarPinColumnsV2()
 *   3. repairAddStarPinColumnsV2()
 *   4. debugStarPinColumns()  ← verify
 *
 * repairSchemaAndData() gọi repairAddStarPinColumns() = logic v2.
 */

/**
 * Tìm index (0-based) của cột cuối cùng có header không blank.
 * Bỏ qua phantom columns và cột IS_STARRED / IS_PINNED đang bị lạc chỗ.
 *
 * @param {string[]} headers - mảng header row 1
 * @param {string[]} excludeNames - tên cột cần bỏ qua khi tìm anchor (mặc định: IS_STARRED, IS_PINNED)
 * @returns {number} 0-based index, hoặc -1 nếu không tìm thấy
 */
function _findLastRealHeaderIdx(headers, excludeNames) {
  var exclude = excludeNames || ['IS_STARRED', 'IS_PINNED'];
  for (var i = headers.length - 1; i >= 0; i--) {
    var h = String(headers[i]).trim();
    if (h !== '' && exclude.indexOf(h) === -1) {
      return i;
    }
  }
  return -1;
}

/**
 * Debug: log thực trạng từng bảng.
 */
function debugStarPinColumns() {
  var targets = [
    CBV_CONFIG.SHEETS.TASK_MAIN,
    CBV_CONFIG.SHEETS.HO_SO_MASTER,
    CBV_CONFIG.SHEETS.FINANCE_TRANSACTION
  ];
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  targets.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) { Logger.log(sheetName + ': NOT FOUND'); return; }

    var lastCol = sheet.getLastColumn();
    var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

    var lastRealIdx = _findLastRealHeaderIdx(headers);
    var starIdx = headers.indexOf('IS_STARRED');
    var pinIdx = headers.indexOf('IS_PINNED');

    Logger.log('=== ' + sheetName + ' ===');
    Logger.log('  getLastColumn()         : ' + lastCol);
    Logger.log('  last real header        : "' + (lastRealIdx >= 0 ? headers[lastRealIdx] : '?') + '" (col ' + (lastRealIdx + 1) + ')');
    Logger.log('  IS_STARRED col (1-based): ' + (starIdx >= 0 ? starIdx + 1 : 'NOT FOUND'));
    Logger.log('  IS_PINNED  col (1-based): ' + (pinIdx >= 0 ? pinIdx + 1 : 'NOT FOUND'));
    if (starIdx >= 0 && pinIdx >= 0) {
      Logger.log('  Gap between them        : ' + (pinIdx - starIdx - 1) + ' cột trống');
    }
  });
}

/**
 * Cleanup v2: xóa mọi thứ SAU cột schema cuối (header không blank, không tính IS_STARRED/IS_PINNED).
 * Có thể xóa luôn cả IS_STARRED/IS_PINNED đang ở cuối — chạy repairAddStarPinColumnsV2() sau để thêm lại đúng chỗ.
 * Không anchor vào IS_DELETED — an toàn dù schema có thêm cột mới.
 */
function cleanupStarPinColumnsV2() {
  var targets = [
    CBV_CONFIG.SHEETS.TASK_MAIN,
    CBV_CONFIG.SHEETS.HO_SO_MASTER,
    CBV_CONFIG.SHEETS.FINANCE_TRANSACTION
  ];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var report = [];

  targets.forEach(function(sheetName) {
    try {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) { report.push(sheetName + ': NOT FOUND'); return; }

      var lastCol = sheet.getLastColumn();
      var lastRow = sheet.getLastRow();
      if (lastCol === 0) { report.push(sheetName + ': empty'); return; }

      var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

      var lastRealIdx = _findLastRealHeaderIdx(headers);
      if (lastRealIdx < 0) { report.push(sheetName + ': no real header found'); return; }

      var lastLegitCol = lastRealIdx + 1; // 1-based
      var colsToDelete = lastCol - lastLegitCol;

      if (colsToDelete <= 0) {
        report.push(sheetName + ': nothing to clean');
        return;
      }

      report.push(sheetName + ': clearing cols ' + (lastLegitCol + 1) + ' → ' + lastCol + ' (' + colsToDelete + ' cols)');

      // getRange(row, col, numRows, numCols)
      sheet.getRange(1, lastLegitCol + 1, Math.max(lastRow, 1), colsToDelete).clearContent();

      if (typeof _invalidateRowsCache === 'function') _invalidateRowsCache(sheetName);
      report.push(sheetName + ': cleanup OK — last real col now = ' + lastLegitCol + ' ("' + headers[lastRealIdx] + '")');
    } catch (e) {
      report.push(sheetName + ': ERROR — ' + String(e.message || e));
    }
  });

  Logger.log(report.join('\n'));
  return report;
}

/**
 * Cột 1-based để ghi IS_STARRED hoặc IS_PINNED (sau anchor schema, không dùng getLastColumn+1).
 */
function _starPinNewCol1Based(headers, colName) {
  var lastRealIdx = _findLastRealHeaderIdx(headers);
  if (lastRealIdx < 0) return -1;
  var starIdx = headers.indexOf('IS_STARRED');
  var pinIdx = headers.indexOf('IS_PINNED');

  if (colName === 'IS_STARRED') {
    if (starIdx >= 0) return -1;
    return lastRealIdx + 2;
  }
  if (colName === 'IS_PINNED') {
    if (pinIdx >= 0) return -1;
    if (starIdx >= 0) return starIdx + 2;
    return lastRealIdx + 2;
  }
  return -1;
}

function _ensureHeaderSlot(headers, col1Based) {
  while (headers.length < col1Based) headers.push('');
}

/**
 * Repair v2: thêm IS_STARRED và IS_PINNED ngay sau cột real cuối cùng (hoặc sau STAR nếu chỉ thiếu PIN).
 * Idempotent: skip nếu đã có.
 */
function repairAddStarPinColumnsV2() {
  var result = { ok: true, appended: {}, skipped: [], errors: [] };
  var targets = [
    CBV_CONFIG.SHEETS.TASK_MAIN,
    CBV_CONFIG.SHEETS.HO_SO_MASTER,
    CBV_CONFIG.SHEETS.FINANCE_TRANSACTION
  ];
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  targets.forEach(function(sheetName) {
    try {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) { result.errors.push(sheetName + ': not found'); return; }

      var lastCol = sheet.getLastColumn();
      if (lastCol === 0) { result.errors.push(sheetName + ': empty sheet'); return; }

      var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      var added = [];

      ['IS_STARRED', 'IS_PINNED'].forEach(function(col) {
        if (headers.indexOf(col) !== -1) {
          result.skipped.push(sheetName + '.' + col);
          return;
        }

        var newCol = _starPinNewCol1Based(headers, col);
        if (newCol < 0) {
          result.errors.push(sheetName + ': cannot place ' + col);
          return;
        }

        sheet.getRange(1, newCol).setValue(col);

        var lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          sheet.getRange(2, newCol, lastRow - 1, 1).setValue(false);
        }

        added.push(col);
        _ensureHeaderSlot(headers, newCol);
        headers[newCol - 1] = col;
      });

      if (added.length > 0) {
        result.appended[sheetName] = added;
        if (typeof _invalidateRowsCache === 'function') _invalidateRowsCache(sheetName);
      }
    } catch (e) {
      result.ok = false;
      result.errors.push(sheetName + ': ' + String(e.message || e));
    }
  });

  if (result.errors.length > 0) result.ok = false;
  if (typeof Logger !== 'undefined') Logger.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Repair: thêm IS_STARRED và IS_PINNED vào 3 bảng nếu chưa có (logic v2 — anchor cột schema thực).
 * Idempotent. Non-destructive. Backfill FALSE cho rows cũ.
 * Gọi từ repairSchemaAndData() hoặc chạy tay.
 * @returns {{ ok: boolean, appended: Object, skipped: string[], errors: string[] }}
 */
function repairAddStarPinColumns() {
  return repairAddStarPinColumnsV2();
}
