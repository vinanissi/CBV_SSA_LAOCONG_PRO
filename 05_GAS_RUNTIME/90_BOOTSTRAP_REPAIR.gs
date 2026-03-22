/**
 * CBV Schema and Data Repair - Must-fix pass for selfAuditBootstrap blockers.
 * Non-destructive: adds missing columns, fills blanks with safe defaults.
 * Dependencies: 90_BOOTSTRAP_SCHEMA, 90_BOOTSTRAP_AUDIT helpers, 03_SHARED_REPOSITORY
 *
 * Run repairSchemaAndData() to fix schema columns and data blanks.
 * Transition-safe: keeps legacy columns ACTION, OLD_STATUS, NEW_STATUS, NOTE, RESULT_NOTE, FILE_NAME.
 */

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
 * Repairs schema: adds HTX_ID to TASK_MAIN and UPDATE_TYPE to TASK_UPDATE_LOG if missing.
 * Non-destructive. Keeps legacy columns.
 * @returns {Object} { ok, schemaRepairs: string[] }
 */
function repairSchemaColumns() {
  var result = { ok: true, schemaRepairs: [] };
  var ss = SpreadsheetApp.getActive();

  var taskMain = ss.getSheetByName(CBV_CONFIG.SHEETS.TASK_MAIN);
  if (taskMain) {
    var headers = taskMain.getRange(1, 1, 1, taskMain.getLastColumn() || 1).getValues()[0];
    if (headers.indexOf('HTX_ID') === -1) {
      var expectedHeaders = getSchemaHeaders(CBV_CONFIG.SHEETS.TASK_MAIN);
      var htxPos = expectedHeaders.indexOf('HTX_ID') + 1;
      if (htxPos > 0 && _repairInsertColumn(taskMain, htxPos, 'HTX_ID')) {
        result.schemaRepairs.push('TASK_MAIN: added HTX_ID at col ' + htxPos);
      }
    }
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
  if (!sheet || sheet.getLastRow() < 2) return result;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var roleIdx = headers.indexOf('ROLE');
  var statusIdx = headers.indexOf('STATUS');
  if (roleIdx === -1 || statusIdx === -1) return result;

  var validRoles = (typeof getEnumValues === 'function' ? getEnumValues('ROLE') : null) || CBV_ENUM.ROLE || ['ADMIN', 'OPERATOR', 'ACCOUNTANT', 'VIEWER'];
  var validStatuses = (typeof getEnumValues === 'function' ? getEnumValues('USER_DIRECTORY_STATUS') : null) || CBV_ENUM.USER_DIRECTORY_STATUS || ['ACTIVE', 'INACTIVE', 'ARCHIVED'];

  for (var r = 2; r <= sheet.getLastRow(); r++) {
    var roleVal = String(sheet.getRange(r, roleIdx + 1).getValue() || '').trim();
    var statusVal = String(sheet.getRange(r, statusIdx + 1).getValue() || '').trim();

    if (!roleVal) {
      if (validRoles.indexOf('OPERATOR') !== -1) {
        sheet.getRange(r, roleIdx + 1).setValue('OPERATOR');
        result.repaired++;
        result.rowsFixed.push({ sheet: 'USER_DIRECTORY', row: r, col: 'ROLE', from: '(blank)', to: 'OPERATOR', decision: 'Safe default for non-admin' });
      } else {
        result.manualReview.push({ row: r, col: 'ROLE', sheet: 'USER_DIRECTORY' });
      }
    } else if (validRoles.indexOf(roleVal) === -1 && roleVal.toUpperCase() === 'ACCOUNTANT') {
      if (validRoles.indexOf('ACCOUNTANT') !== -1) {
        sheet.getRange(r, roleIdx + 1).setValue('ACCOUNTANT');
        result.repaired++;
        result.rowsFixed.push({ sheet: 'USER_DIRECTORY', row: r, col: 'ROLE', from: roleVal, to: 'ACCOUNTANT', decision: 'Normalized to canonical enum value' });
      }
    }

    if (!statusVal) {
      sheet.getRange(r, statusIdx + 1).setValue('ACTIVE');
      result.repaired++;
      result.rowsFixed.push({ sheet: 'USER_DIRECTORY', row: r, col: 'STATUS', from: '(blank)', to: 'ACTIVE', decision: 'Safe default' });
    }
  }

  return result;
}

/**
 * Repairs HO_SO_MASTER: fills blank HO_SO_TYPE and STATUS.
 * HO_SO_TYPE: infers from ID prefix (HTX_, XV_, XE_, TX_); else flags for manual review.
 * STATUS: ACTIVE if record has HO_SO_FILE rows (in use), else NEW.
 * @returns {Object} { ok, repaired: number, rowsFixed: [], manualReview: [] }
 */
function repairHoSoMasterBlanks() {
  var result = { ok: true, repaired: 0, rowsFixed: [], manualReview: [] };
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(CBV_CONFIG.SHEETS.HO_SO_MASTER);
  if (!sheet || sheet.getLastRow() < 2) return result;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idIdx = headers.indexOf('ID');
  var typeIdx = headers.indexOf('HO_SO_TYPE');
  var statusIdx = headers.indexOf('STATUS');
  if (idIdx === -1 || typeIdx === -1 || statusIdx === -1) return result;

  var hoSoIdsWithFiles = {};
  var fileSheet = ss.getSheetByName(CBV_CONFIG.SHEETS.HO_SO_FILE);
  if (fileSheet && fileSheet.getLastRow() >= 2) {
    var fHeaders = fileSheet.getRange(1, 1, 1, fileSheet.getLastColumn()).getValues()[0];
    var fHoSoIdx = fHeaders.indexOf('HO_SO_ID');
    if (fHoSoIdx >= 0) {
      var fRows = fileSheet.getRange(2, 1, fileSheet.getLastRow(), fileSheet.getLastColumn()).getValues();
      for (var i = 0; i < fRows.length; i++) {
        var hsId = String(fRows[i][fHoSoIdx] || '').trim();
        if (hsId) hoSoIdsWithFiles[hsId] = true;
      }
    }
  }

  var typeFromId = { 'HTX_': 'HTX', 'XV_': 'XA_VIEN', 'XE_': 'XE', 'TX_': 'TAI_XE' };

  for (var r = 2; r <= sheet.getLastRow(); r++) {
    var idVal = String(sheet.getRange(r, idIdx + 1).getValue() || '').trim();
    var typeVal = String(sheet.getRange(r, typeIdx + 1).getValue() || '').trim();
    var statusVal = String(sheet.getRange(r, statusIdx + 1).getValue() || '').trim();

    if (!typeVal) {
      var inferred = null;
      for (var prefix in typeFromId) {
        if (idVal.indexOf(prefix) === 0) { inferred = typeFromId[prefix]; break; }
      }
      if (inferred) {
        sheet.getRange(r, typeIdx + 1).setValue(inferred);
        result.repaired++;
        result.rowsFixed.push({ sheet: 'HO_SO_MASTER', row: r, col: 'HO_SO_TYPE', from: '(blank)', to: inferred, decision: 'Inferred from ID prefix ' + (idVal.substring(0, 4) || '') });
      } else {
        result.manualReview.push({ row: r, col: 'HO_SO_TYPE', id: idVal, sheet: 'HO_SO_MASTER' });
      }
    }

    if (!statusVal) {
      var defaultStatus = hoSoIdsWithFiles[idVal] ? 'ACTIVE' : 'NEW';
      sheet.getRange(r, statusIdx + 1).setValue(defaultStatus);
      result.repaired++;
      result.rowsFixed.push({ sheet: 'HO_SO_MASTER', row: r, col: 'STATUS', from: '(blank)', to: defaultStatus, decision: (defaultStatus === 'ACTIVE' ? 'Has HO_SO_FILE rows (in use)' : 'No files; default NEW') });
    }
  }

  return result;
}

/**
 * Repairs HO_SO_FILE: fills blank FILE_GROUP with KHAC (other/unknown).
 * @returns {Object} { ok, repaired: number, rowsFixed: [] }
 */
function repairHoSoFileBlanks() {
  var result = { ok: true, repaired: 0, rowsFixed: [] };
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.HO_SO_FILE);
  if (!sheet || sheet.getLastRow() < 2) return result;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var fgIdx = headers.indexOf('FILE_GROUP');
  var idIdx = headers.indexOf('ID');
  if (fgIdx === -1) return result;

  for (var r = 2; r <= sheet.getLastRow(); r++) {
    var fgVal = String(sheet.getRange(r, fgIdx + 1).getValue() || '').trim();
    if (!fgVal) {
      sheet.getRange(r, fgIdx + 1).setValue('KHAC');
      result.repaired++;
      var rowId = idIdx >= 0 ? String(sheet.getRange(r, idIdx + 1).getValue() || '').trim() : '';
      result.rowsFixed.push({ sheet: 'HO_SO_FILE', row: r, col: 'FILE_GROUP', from: '(blank)', to: 'KHAC', decision: 'Unknown file group; KHAC = other' });
    }
  }

  return result;
}

/**
 * Repairs FINANCE_TRANSACTION: fills blank STATUS with NEW; TRANS_TYPE only if inferable from CATEGORY.
 * @returns {Object} { ok, statusFilled: number, transTypeFilled: number, rowsFixed: [], manualReview: [] }
 */
function repairFinanceTransactionBlanks() {
  var result = { ok: true, statusFilled: 0, transTypeFilled: 0, rowsFixed: [], manualReview: [] };
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION);
  if (!sheet || sheet.getLastRow() < 2) return result;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var statusIdx = headers.indexOf('STATUS');
  var transTypeIdx = headers.indexOf('TRANS_TYPE');
  var categoryIdx = headers.indexOf('CATEGORY');
  var idIdx = headers.indexOf('ID');

  var categoryToType = { 'THU_KHAC': 'INCOME', 'VAN_HANH': 'EXPENSE', 'NHIEN_LIEU': 'EXPENSE', 'SUA_CHUA': 'EXPENSE', 'LUONG': 'EXPENSE', 'CHI_KHAC': 'EXPENSE' };

  for (var r = 2; r <= sheet.getLastRow(); r++) {
    var statusVal = String(sheet.getRange(r, statusIdx + 1).getValue() || '').trim();
    var transTypeVal = String(sheet.getRange(r, transTypeIdx + 1).getValue() || '').trim();
    var categoryVal = categoryIdx >= 0 ? String(sheet.getRange(r, categoryIdx + 1).getValue() || '').trim() : '';
    var rowId = idIdx >= 0 ? String(sheet.getRange(r, idIdx + 1).getValue() || '').trim() : '';

    if (!statusVal) {
      sheet.getRange(r, statusIdx + 1).setValue('NEW');
      result.statusFilled++;
      result.rowsFixed.push({ sheet: 'FINANCE_TRANSACTION', row: r, col: 'STATUS', from: '(blank)', to: 'NEW', id: rowId, decision: 'Safe default' });
    }

    if (!transTypeVal) {
      var inferred = categoryVal ? (categoryToType[categoryVal] || null) : null;
      if (inferred) {
        sheet.getRange(r, transTypeIdx + 1).setValue(inferred);
        result.transTypeFilled++;
        result.rowsFixed.push({ sheet: 'FINANCE_TRANSACTION', row: r, col: 'TRANS_TYPE', from: '(blank)', to: inferred, id: rowId, decision: 'Inferred from CATEGORY ' + categoryVal });
      } else {
        result.manualReview.push({ sheet: 'FINANCE_TRANSACTION', row: r, col: 'TRANS_TYPE', id: rowId });
      }
    }
  }

  return result;
}

/**
 * Repairs TASK_UPDATE_LOG: backfills UPDATE_TYPE from ACTION; fills blank ACTION with NOTE for compatibility.
 * @returns {Object} { ok, updateTypeFilled: number, actionFilled: number, rowsFixed: [] }
 */
function repairTaskUpdateLogBlanks() {
  var result = { ok: true, updateTypeFilled: 0, actionFilled: 0, rowsFixed: [] };
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.TASK_UPDATE_LOG);
  if (!sheet || sheet.getLastRow() < 2) return result;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var updateTypeIdx = headers.indexOf('UPDATE_TYPE');
  var actionIdx = headers.indexOf('ACTION');

  if (updateTypeIdx === -1) return result;

  for (var r = 2; r <= sheet.getLastRow(); r++) {
    var updateTypeVal = String(sheet.getRange(r, updateTypeIdx + 1).getValue() || '').trim();
    var actionVal = actionIdx >= 0 ? String(sheet.getRange(r, actionIdx + 1).getValue() || '').trim() : '';

    if (!updateTypeVal && actionVal) {
      var mapped = ACTION_TO_UPDATE_TYPE[actionVal] || 'NOTE';
      sheet.getRange(r, updateTypeIdx + 1).setValue(mapped);
      result.updateTypeFilled++;
      result.rowsFixed.push({ sheet: 'TASK_UPDATE_LOG', row: r, col: 'UPDATE_TYPE', from: '(blank)', to: mapped, decision: 'Mapped from ACTION' });
    } else if (!updateTypeVal) {
      sheet.getRange(r, updateTypeIdx + 1).setValue('NOTE');
      result.updateTypeFilled++;
      result.rowsFixed.push({ sheet: 'TASK_UPDATE_LOG', row: r, col: 'UPDATE_TYPE', from: '(blank)', to: 'NOTE', decision: 'Default' });
    }

    if (actionIdx >= 0 && !actionVal) {
      sheet.getRange(r, actionIdx + 1).setValue('NOTE');
      result.actionFilled++;
      result.rowsFixed.push({ sheet: 'TASK_UPDATE_LOG', row: r, col: 'ACTION', from: '(blank)', to: 'NOTE', decision: 'Compatibility with legacy readers' });
    }
  }

  return result;
}

/**
 * Backfills TASK_MAIN.HTX_ID where blank but inferable from OWNER_ID's HTX or first HTX in HO_SO_MASTER.
 * @returns {Object} { ok, filled: number, manualReview: { row: number, id: string }[] }
 */
function repairTaskMainHtxIdBlanks() {
  var result = { ok: true, filled: 0, manualReview: [] };
  var ss = SpreadsheetApp.getActive();
  var taskSheet = ss.getSheetByName(CBV_CONFIG.SHEETS.TASK_MAIN);
  if (!taskSheet || taskSheet.getLastRow() < 2) return result;

  var headers = taskSheet.getRange(1, 1, 1, taskSheet.getLastColumn()).getValues()[0];
  var htxIdx = headers.indexOf('HTX_ID');
  var idIdx = headers.indexOf('ID');
  if (htxIdx === -1) return result;

  var hoSoSheet = ss.getSheetByName(CBV_CONFIG.SHEETS.HO_SO_MASTER);
  var firstHtxId = null;
  if (hoSoSheet && hoSoSheet.getLastRow() >= 2) {
    var hsHeaders = hoSoSheet.getRange(1, 1, 1, hoSoSheet.getLastColumn()).getValues()[0];
    var hsTypeIdx = hsHeaders.indexOf('HO_SO_TYPE');
    var hsIdIdx = hsHeaders.indexOf('ID');
    if (hsTypeIdx >= 0 && hsIdIdx >= 0) {
      var hsRows = hoSoSheet.getRange(2, 1, hoSoSheet.getLastRow(), hoSoSheet.getLastColumn()).getValues();
      for (var i = 0; i < hsRows.length; i++) {
        if (String(hsRows[i][hsTypeIdx] || '').trim() === 'HTX') {
          firstHtxId = String(hsRows[i][hsIdIdx] || '').trim();
          break;
        }
      }
    }
  }

  for (var r = 2; r <= taskSheet.getLastRow(); r++) {
    var htxVal = String(taskSheet.getRange(r, htxIdx + 1).getValue() || '').trim();
    var taskId = String(taskSheet.getRange(r, idIdx + 1).getValue() || '').trim();
    if (!htxVal && firstHtxId) {
      taskSheet.getRange(r, htxIdx + 1).setValue(firstHtxId);
      result.filled++;
    } else if (!htxVal) {
      result.manualReview.push({ row: r, id: taskId, sheet: 'TASK_MAIN' });
    }
  }

  return result;
}

/**
 * Full schema and data repair pass. Run after selfAuditBootstrap identifies blockers.
 * @param {Object} options { skipSchema, skipUser, skipHoSo, skipHoSoFile, skipFinance, skipTaskLog, skipTaskMainHtx }
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
    taskMainHtxFilled: 0,
    taskMainManualReview: [],
    rowsFixed: [],
    manualReview: [],
    manualReviewTotal: 0
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

  if (opts.skipTaskLog !== true) {
    var tul = repairTaskUpdateLogBlanks();
    combined.taskLogUpdateTypeFilled = tul.updateTypeFilled || 0;
    combined.taskLogActionFilled = tul.actionFilled || 0;
    if (tul.rowsFixed) combined.rowsFixed = combined.rowsFixed.concat(tul.rowsFixed);
  }

  if (opts.skipTaskMainHtx !== true) {
    var tmh = repairTaskMainHtxIdBlanks();
    combined.taskMainHtxFilled = tmh.filled || 0;
    combined.taskMainManualReview = tmh.manualReview || [];
  }

  combined.manualReview = (combined.userManualReview || []).concat(combined.hoSoManualReview || []).concat(combined.financeManualReview || []).concat(combined.taskMainManualReview || []);
  combined.manualReviewTotal = combined.manualReview.length;
  combined.ok = combined.manualReviewTotal === 0;

  combined.rerunOrder = ['seedEnumDictionary()', 'repairSchemaAndData({})', 'selfAuditBootstrap()', 'verifyAppSheetReadiness()'];

  if (typeof Logger !== 'undefined') Logger.log('repairSchemaAndData: ' + JSON.stringify(combined, null, 2));
  return combined;
}

// --- Residual invalid records (ID-based inspection and repair) ---

/** Tables and columns that cause audit blockers when blank. Keyed by sheet name. */
var RESIDUAL_BLOCKER_COLUMNS = {
  TASK_MAIN: ['STATUS', 'PRIORITY', 'TASK_TYPE'],
  USER_DIRECTORY: ['ROLE', 'STATUS'],
  HO_SO_MASTER: ['HO_SO_TYPE', 'STATUS'],
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
    if (!sheet || sheet.getLastRow() < 2) return;
    var rows = typeof _auditGetRows === 'function' ? _auditGetRows(sheet) : (typeof readNormalizedRows === 'function' ? readNormalizedRows(sheet, table) : []);
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
  TASK_MAIN: { STATUS: 'NEW', PRIORITY: 'MEDIUM', TASK_TYPE: 'GENERAL' },
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
  if (fileSheet && fileSheet.getLastRow() >= 2) {
    var fRows = typeof _auditGetRows === 'function' ? _auditGetRows(fileSheet) : [];
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
      rec.missingFields.forEach(function(col) {
        var def = RESIDUAL_SAFE_DEFAULTS.TASK_MAIN[col];
        if (def) { patch[col] = def; repairsApplied.push({ table: table, id: id, column: col, from: rec.currentValues[col], to: def }); }
      });
    } else if (table === 'USER_DIRECTORY') {
      rec.missingFields.forEach(function(col) {
        var def = RESIDUAL_SAFE_DEFAULTS.USER_DIRECTORY[col];
        if (def) { patch[col] = def; repairsApplied.push({ table: table, id: id, column: col, from: rec.currentValues[col], to: def }); }
      });
    } else if (table === 'HO_SO_MASTER') {
      rec.missingFields.forEach(function(col) {
        if (col === 'STATUS') {
          var def = hoSoIdsWithFiles[id] ? RESIDUAL_SAFE_DEFAULTS.HO_SO_MASTER_STATUS_ACTIVE : RESIDUAL_SAFE_DEFAULTS.HO_SO_MASTER_STATUS_NEW;
          patch[col] = def;
          repairsApplied.push({ table: table, id: id, column: col, from: rec.currentValues[col], to: def });
        } else if (col === 'HO_SO_TYPE') {
          var inferred = null;
          for (var p in HO_SO_TYPE_FROM_ID_PREFIX) {
            if (id.indexOf(p) === 0) { inferred = HO_SO_TYPE_FROM_ID_PREFIX[p]; break; }
          }
          if (inferred) {
            patch[col] = inferred;
            repairsApplied.push({ table: table, id: id, column: col, from: rec.currentValues[col], to: inferred });
          } else {
            manualReview.push({ table: table, id: id, column: col, reason: 'HO_SO_TYPE not inferable from ID prefix' });
          }
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
