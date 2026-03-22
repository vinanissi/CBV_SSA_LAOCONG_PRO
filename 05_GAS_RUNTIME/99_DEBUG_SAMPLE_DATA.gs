/**
 * CBV Golden Dataset Seeding - Full idempotent seed for end-to-end testing.
 * Uses deterministic IDs: USR_001.., HTX_001.., TASK_001.., TCL_001.., TAT_001.., TLOG_001..
 * Non-destructive unless options.reset = true; reset only clears seed rows.
 * Dependencies: 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 20_TASK_REPOSITORY,
 *               01_ENUM_SEED, 90_BOOTSTRAP_SCHEMA (getSchemaHeaders)
 *
 * RERUN ORDER (recommended):
 *   1. seedEnumDictionary()
 *   2. seedGoldenDataset({ reset: false })  // or { reset: true } to clear and reseed
 *   3. selfAuditBootstrap()
 */

var GOLDEN_ID_PREFIX = {
  USER: 'USR_',
  HTX: 'HTX_',
  TASK: 'TASK_',
  CHECKLIST: 'TCL_',
  ATTACHMENT: 'TAT_',
  LOG: 'TLOG_'
};

/**
 * Checks if ID is a golden seed ID (for reset-only deletion).
 */
function _goldenIsSeedId(id, prefix) {
  if (!id || typeof id !== 'string') return false;
  var s = String(id).trim();
  if (prefix === 'USER') return /^USR_0\d{2}$/.test(s);
  if (prefix === 'HTX') return /^HTX_0\d{2}$/.test(s);
  if (prefix === 'TASK') return /^TASK_0\d{2}$/.test(s);
  if (prefix === 'CHECKLIST') return /^TCL_0\d{2}$/.test(s);
  if (prefix === 'ATTACHMENT') return /^TAT_0\d{2}$/.test(s);
  if (prefix === 'LOG') return /^TLOG_0\d{2}$/.test(s);
  return false;
}

/**
 * Reads data rows (row 2 to lastRow), excluding fully blank rows.
 * Uses readNormalizedRows when 03_SHARED_ROW_READER is loaded.
 */
function _goldenAllRows(sheet) {
  if (typeof readNormalizedRows === 'function') {
    return readNormalizedRows(sheet, sheet ? sheet.getName() : '');
  }
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol === 0) return [];
  var headers = typeof _headers === 'function' ? _headers(sheet) : sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var data = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var rowObjs = data.map(function(row, idx) {
    var o = { _rowNumber: idx + 2 };
    headers.forEach(function(h, i) { o[h] = row[i]; });
    return o;
  });
  if (typeof getMeaningfulFieldsForTable === 'function' && typeof filterRealDataRows === 'function') {
    var meaningful = getMeaningfulFieldsForTable(sheet.getName(), headers);
    return filterRealDataRows(rowObjs, meaningful);
  }
  return rowObjs;
}

/**
 * Checks if record with ID exists in sheet.
 */
function _goldenExists(sheetName, id) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return false;
  var headers = typeof _headers === 'function' ? _headers(sheet) : sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idIdx = headers.indexOf('ID');
  if (idIdx === -1) return false;
  var rows = _goldenAllRows(sheet);
  return rows.some(function(r) { return String(r.ID) === String(id); });
}

/**
 * Deletes rows where ID matches golden seed pattern. Deletes from bottom to top.
 */
function _goldenDeleteSeedRows(sheetName, prefix) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return 0;
  var rows = _goldenAllRows(sheet);
  var toDelete = [];
  rows.forEach(function(r) {
    if (_goldenIsSeedId(r.ID, prefix)) toDelete.push(r._rowNumber);
  });
  toDelete.sort(function(a, b) { return b - a; });
  toDelete.forEach(function(rn) { sheet.deleteRow(rn); });
  return toDelete.length;
}

/**
 * Ensures ENUM_DICTIONARY has required values. Calls seedEnumDictionary if available.
 */
function _goldenEnsureEnums() {
  if (typeof seedEnumDictionary === 'function') {
    seedEnumDictionary();
    return;
  }
  Logger.log('[seedGoldenDataset] seedEnumDictionary not found - ensure ENUM_DICTIONARY is populated');
}

/**
 * Main golden dataset seed.
 * @param {Object} options - { reset: boolean, seedUsers: boolean, seedHTX: boolean, seedTasks: boolean }
 * @returns {Object} Summary with usersCreated, htxCreated, tasksCreated, checklistItemsCreated, attachmentsCreated, logsCreated, skippedExisting
 */
function seedGoldenDataset(options) {
  var opts = options || {};
  var reset = opts.reset === true;
  var seedUsers = opts.seedUsers !== false;
  var seedHTX = opts.seedHTX !== false;
  var seedTasks = opts.seedTasks !== false;

  var summary = {
    usersCreated: 0,
    htxCreated: 0,
    tasksCreated: 0,
    checklistItemsCreated: 0,
    attachmentsCreated: 0,
    logsCreated: 0,
    skippedExisting: 0
  };

  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var user = typeof cbvUser === 'function' ? cbvUser() : 'system';

  Logger.log('[seedGoldenDataset] Start options=' + JSON.stringify({ reset: reset, seedUsers: seedUsers, seedHTX: seedHTX, seedTasks: seedTasks }));

  try {
    _goldenEnsureEnums();
    if (typeof clearEnumCache === 'function') clearEnumCache();

    if (reset) {
      Logger.log('[seedGoldenDataset] Reset mode - clearing seed rows');
      summary.logsDeleted = _goldenDeleteSeedRows(CBV_CONFIG.SHEETS.TASK_UPDATE_LOG, 'LOG');
      summary.attachmentsDeleted = _goldenDeleteSeedRows(CBV_CONFIG.SHEETS.TASK_ATTACHMENT, 'ATTACHMENT');
      summary.checklistDeleted = _goldenDeleteSeedRows(CBV_CONFIG.SHEETS.TASK_CHECKLIST, 'CHECKLIST');
      summary.tasksDeleted = _goldenDeleteSeedRows(CBV_CONFIG.SHEETS.TASK_MAIN, 'TASK');
      summary.htxDeleted = _goldenDeleteSeedRows(CBV_CONFIG.SHEETS.HO_SO_MASTER, 'HTX');
      summary.usersDeleted = _goldenDeleteSeedRows(CBV_CONFIG.SHEETS.USER_DIRECTORY, 'USER');
      Logger.log('[seedGoldenDataset] Reset complete: users=' + summary.usersDeleted + ' htx=' + summary.htxDeleted + ' tasks=' + summary.tasksDeleted);
    }

    if (seedUsers) {
      Logger.log('[seedGoldenDataset] Seeding USER_DIRECTORY');
      var userResult = _goldenSeedUsers(now, user, summary);
      summary.usersCreated = userResult.created;
      summary.skippedExisting += userResult.skipped;
    }

    if (seedHTX) {
      Logger.log('[seedGoldenDataset] Seeding HO_SO_MASTER (HTX)');
      var htxResult = _goldenSeedHTX(now, user, summary);
      summary.htxCreated = htxResult.created;
      summary.skippedExisting += htxResult.skipped;
    }

    if (seedTasks) {
      Logger.log('[seedGoldenDataset] Seeding TASK_MAIN, CHECKLIST, ATTACHMENT, UPDATE_LOG');
      var taskResult = _goldenSeedTasks(now, user, summary);
      summary.tasksCreated = taskResult.tasksCreated;
      summary.checklistItemsCreated = taskResult.checklistCreated;
      summary.attachmentsCreated = taskResult.attachmentsCreated;
      summary.logsCreated = taskResult.logsCreated;
      summary.skippedExisting += taskResult.skipped;
    }

    if (typeof clearUserCache === 'function') clearUserCache();
    Logger.log('[seedGoldenDataset] Done: ' + JSON.stringify(summary, null, 2));
  } catch (e) {
    Logger.log('[seedGoldenDataset] ERROR: ' + String(e.message || e));
    throw e;
  }

  return summary;
}

/**
 * Dry run: logs what would be created without making changes.
 */
function seedGoldenDatasetDryRun(options) {
  var opts = options || {};
  var seedUsers = opts.seedUsers !== false;
  var seedHTX = opts.seedHTX !== false;
  var seedTasks = opts.seedTasks !== false;

  Logger.log('[seedGoldenDatasetDryRun] Start');

  if (seedUsers) {
    var usersToCreate = _goldenUserSpecs().filter(function(u) { return !_goldenExists(CBV_CONFIG.SHEETS.USER_DIRECTORY, u.ID); });
    Logger.log('[seedGoldenDatasetDryRun] Users: would create ' + usersToCreate.length + ', skip ' + (6 - usersToCreate.length));
  }
  if (seedHTX) {
    var htxToCreate = _goldenHTXSpecs().filter(function(h) { return !_goldenExists(CBV_CONFIG.SHEETS.HO_SO_MASTER, h.ID); });
    Logger.log('[seedGoldenDatasetDryRun] HTX: would create ' + htxToCreate.length + ', skip ' + (3 - htxToCreate.length));
  }
  if (seedTasks) {
    var taskSpecs = _goldenTaskSpecs();
    var tasksToCreate = taskSpecs.filter(function(t) { return !_goldenExists(CBV_CONFIG.SHEETS.TASK_MAIN, t.ID); });
    Logger.log('[seedGoldenDatasetDryRun] Tasks: would create ' + tasksToCreate.length + ', skip ' + (taskSpecs.length - tasksToCreate.length));
  }

  Logger.log('[seedGoldenDatasetDryRun] Complete - no changes made');
  return { dryRun: true };
}

function _goldenUserSpecs() {
  return [
    { ID: 'USR_001', FULL_NAME: 'Nguyễn Văn Admin', EMAIL: 'admin.golden@cbv.local', ROLE: 'ADMIN' },
    { ID: 'USR_002', FULL_NAME: 'Trần Thị Vận hành 1', EMAIL: 'operator1.golden@cbv.local', ROLE: 'OPERATOR' },
    { ID: 'USR_003', FULL_NAME: 'Lê Văn Vận hành 2', EMAIL: 'operator2.golden@cbv.local', ROLE: 'OPERATOR' },
    { ID: 'USR_004', FULL_NAME: 'Phạm Thị Vận hành 3', EMAIL: 'operator3.golden@cbv.local', ROLE: 'OPERATOR' },
    { ID: 'USR_005', FULL_NAME: 'Hoàng Văn Kế toán', EMAIL: 'accountant.golden@cbv.local', ROLE: 'ACCOUNTANT' },
    { ID: 'USR_006', FULL_NAME: 'Võ Thị Xem', EMAIL: 'viewer.golden@cbv.local', ROLE: 'VIEWER' }
  ];
}

/** Default ROLE when not explicitly set. */
var GOLDEN_USER_DEFAULT_ROLE = 'OPERATOR';

/** Default STATUS when not explicitly set. */
var GOLDEN_USER_DEFAULT_STATUS = 'ACTIVE';

/** Default HO_SO_TYPE for seeded HTX. */
var GOLDEN_HTX_DEFAULT_TYPE = 'HTX';

/** Default STATUS for seeded HTX. */
var GOLDEN_HTX_DEFAULT_STATUS = 'ACTIVE';

/** Default STATUS for seeded tasks. */
var GOLDEN_TASK_DEFAULT_STATUS = 'NEW';

/** Default PRIORITY for seeded tasks. */
var GOLDEN_TASK_DEFAULT_PRIORITY = 'MEDIUM';

/** Default TASK_TYPE for seeded tasks. */
var GOLDEN_TASK_DEFAULT_TYPE = 'GENERAL';

/** Fallback HTX_ID when spec lacks it (must exist in seed). */
var GOLDEN_TASK_DEFAULT_HTX = 'HTX_001';

/** Fallback OWNER_ID when spec lacks it (must exist in seed). */
var GOLDEN_TASK_DEFAULT_OWNER = 'USR_002';

function _goldenHTXSpecs() {
  return [
    { ID: 'HTX_001', CODE: 'HTX_001', NAME: 'HTX Lao Cộng Golden 1', STATUS: 'ACTIVE' },
    { ID: 'HTX_002', CODE: 'HTX_002', NAME: 'HTX Lao Cộng Golden 2', STATUS: 'ACTIVE' },
    { ID: 'HTX_003', CODE: 'HTX_003', NAME: 'HTX Lao Cộng Golden 3', STATUS: 'ACTIVE' }
  ];
}

function _goldenTaskSpecs() {
  return [
    { ID: 'TASK_001', HTX_ID: 'HTX_001', OWNER_ID: 'USR_002', REPORTER_ID: 'USR_001', TITLE: 'Kiểm tra hồ sơ ban đầu', STATUS: 'NEW', PRIORITY: 'HIGH', TASK_TYPE: 'GENERAL' },
    { ID: 'TASK_002', HTX_ID: 'HTX_001', OWNER_ID: 'USR_002', REPORTER_ID: 'USR_001', TITLE: 'Xác nhận giao dịch tháng', STATUS: 'IN_PROGRESS', PRIORITY: 'MEDIUM', TASK_TYPE: 'FINANCE' },
    { ID: 'TASK_003', HTX_ID: 'HTX_001', OWNER_ID: 'USR_003', REPORTER_ID: 'USR_002', TITLE: 'Cập nhật danh sách xe', STATUS: 'DONE', PRIORITY: 'LOW', TASK_TYPE: 'HO_SO' },
    { ID: 'TASK_004', HTX_ID: 'HTX_002', OWNER_ID: 'USR_004', REPORTER_ID: 'USR_001', TITLE: 'Đối chiếu thu chi quý', STATUS: 'NEW', PRIORITY: 'HIGH', TASK_TYPE: 'FINANCE' },
    { ID: 'TASK_005', HTX_ID: 'HTX_002', OWNER_ID: 'USR_002', REPORTER_ID: 'USR_005', TITLE: 'Lập báo cáo vận hành', STATUS: 'IN_PROGRESS', PRIORITY: 'MEDIUM', TASK_TYPE: 'OPERATION' },
    { ID: 'TASK_006', HTX_ID: 'HTX_001', OWNER_ID: 'USR_003', REPORTER_ID: 'USR_002', TITLE: 'Rà soát hợp đồng xã viên', STATUS: 'DONE', PRIORITY: 'LOW', TASK_TYPE: 'HO_SO' },
    { ID: 'TASK_007', HTX_ID: 'HTX_003', OWNER_ID: 'USR_004', REPORTER_ID: 'USR_001', TITLE: 'Chuẩn bị hồ sơ kiểm toán', STATUS: 'NEW', PRIORITY: 'HIGH', TASK_TYPE: 'GENERAL' },
    { ID: 'TASK_008', HTX_ID: 'HTX_003', OWNER_ID: 'USR_002', REPORTER_ID: 'USR_005', TITLE: 'Theo dõi thanh toán nhà cung cấp', STATUS: 'IN_PROGRESS', PRIORITY: 'MEDIUM', TASK_TYPE: 'FINANCE' }
  ];
}

function _goldenSeedUsers(now, user, summary) {
  var created = 0;
  var skipped = 0;
  var sheetName = CBV_CONFIG.SHEETS.USER_DIRECTORY;
  var headers = typeof getSchemaHeaders === 'function'
    ? getSchemaHeaders(sheetName)
    : ['ID', 'USER_CODE', 'FULL_NAME', 'DISPLAY_NAME', 'EMAIL', 'PHONE', 'ROLE', 'POSITION', 'HTX_ID', 'STATUS', 'IS_SYSTEM', 'ALLOW_LOGIN', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'];

  _goldenUserSpecs().forEach(function(spec) {
    if (_goldenExists(sheetName, spec.ID)) {
      skipped++;
      return;
    }
    var role = (spec.ROLE && String(spec.ROLE).trim()) ? String(spec.ROLE).trim() : (typeof GOLDEN_USER_DEFAULT_ROLE !== 'undefined' ? GOLDEN_USER_DEFAULT_ROLE : 'OPERATOR');
    var status = (spec.STATUS && String(spec.STATUS).trim()) ? String(spec.STATUS).trim() : (typeof GOLDEN_USER_DEFAULT_STATUS !== 'undefined' ? GOLDEN_USER_DEFAULT_STATUS : 'ACTIVE');
    var fullName = spec.FULL_NAME || spec.ID;
    var email = (spec.EMAIL && String(spec.EMAIL).trim()) ? String(spec.EMAIL).trim() : (spec.ID + '.golden@cbv.local').toLowerCase();
    var record = {
      ID: spec.ID,
      USER_CODE: spec.ID,
      FULL_NAME: fullName,
      DISPLAY_NAME: (spec.DISPLAY_NAME && String(spec.DISPLAY_NAME).trim()) ? String(spec.DISPLAY_NAME).trim() : fullName,
      EMAIL: email,
      PHONE: spec.PHONE != null ? String(spec.PHONE) : '',
      ROLE: role,
      POSITION: spec.POSITION != null ? String(spec.POSITION) : '',
      HTX_ID: '',
      STATUS: status,
      IS_SYSTEM: false,
      ALLOW_LOGIN: false,
      NOTE: '[GOLDEN] Demo user - safe to delete',
      CREATED_AT: now,
      CREATED_BY: user,
      UPDATED_AT: now,
      UPDATED_BY: user,
      IS_DELETED: false
    };
    if (typeof _appendRecord === 'function') {
      _appendRecord(sheetName, record);
      created++;
    }
  });
  return { created: created, skipped: skipped };
}

function _goldenSeedHTX(now, user, summary) {
  var created = 0;
  var skipped = 0;
  var sheetName = CBV_CONFIG.SHEETS.HO_SO_MASTER;

  _goldenHTXSpecs().forEach(function(spec) {
    if (_goldenExists(sheetName, spec.ID)) {
      skipped++;
      return;
    }
    var hoSoType = (spec.HO_SO_TYPE && String(spec.HO_SO_TYPE).trim()) ? String(spec.HO_SO_TYPE).trim() : (typeof GOLDEN_HTX_DEFAULT_TYPE !== 'undefined' ? GOLDEN_HTX_DEFAULT_TYPE : 'HTX');
    var status = (spec.STATUS && String(spec.STATUS).trim()) ? String(spec.STATUS).trim() : (typeof GOLDEN_HTX_DEFAULT_STATUS !== 'undefined' ? GOLDEN_HTX_DEFAULT_STATUS : 'ACTIVE');
    var code = (spec.CODE && String(spec.CODE).trim()) ? String(spec.CODE).trim() : spec.ID;
    var name = (spec.NAME && String(spec.NAME).trim()) ? String(spec.NAME).trim() : (code || spec.ID);
    var record = {
      ID: spec.ID,
      HO_SO_TYPE: hoSoType,
      CODE: code,
      NAME: name,
      STATUS: status,
      HTX_ID: '',
      OWNER_ID: '',
      PHONE: '',
      EMAIL: '',
      ID_NO: '',
      ADDRESS: '',
      START_DATE: '',
      END_DATE: '',
      NOTE: '[GOLDEN] Demo HTX - safe to delete',
      TAGS: '',
      CREATED_AT: now,
      CREATED_BY: user,
      UPDATED_AT: now,
      UPDATED_BY: user,
      IS_DELETED: false
    };
    if (typeof _appendRecord === 'function') {
      _appendRecord(sheetName, record);
      created++;
    }
  });
  return { created: created, skipped: skipped };
}

function _goldenSeedTasks(now, user, summary) {
  var tasksCreated = 0;
  var checklistCreated = 0;
  var attachmentsCreated = 0;
  var logsCreated = 0;
  var skipped = 0;

  var taskSpecs = _goldenTaskSpecs();
  var tclNo = 1;
  var tatNo = 1;
  var tlogNo = 1;

  taskSpecs.forEach(function(spec) {
    if (_goldenExists(CBV_CONFIG.SHEETS.TASK_MAIN, spec.ID)) {
      skipped++;
      tclNo += 3;
      tatNo += (spec.ID.charCodeAt(spec.ID.length - 1) % 2) + 1;
      tlogNo += (spec.STATUS === 'IN_PROGRESS' ? 5 : 3);
      return;
    }

    var taskType = (spec.TASK_TYPE && String(spec.TASK_TYPE).trim()) ? String(spec.TASK_TYPE).trim() : (typeof GOLDEN_TASK_DEFAULT_TYPE !== 'undefined' ? GOLDEN_TASK_DEFAULT_TYPE : 'GENERAL');
    var status = (spec.STATUS && String(spec.STATUS).trim()) ? String(spec.STATUS).trim() : (typeof GOLDEN_TASK_DEFAULT_STATUS !== 'undefined' ? GOLDEN_TASK_DEFAULT_STATUS : 'NEW');
    var priority = (spec.PRIORITY && String(spec.PRIORITY).trim()) ? String(spec.PRIORITY).trim() : (typeof GOLDEN_TASK_DEFAULT_PRIORITY !== 'undefined' ? GOLDEN_TASK_DEFAULT_PRIORITY : 'MEDIUM');
    var htxId = (spec.HTX_ID && String(spec.HTX_ID).trim()) ? String(spec.HTX_ID).trim() : (typeof GOLDEN_TASK_DEFAULT_HTX !== 'undefined' ? GOLDEN_TASK_DEFAULT_HTX : 'HTX_001');
    var ownerId = (spec.OWNER_ID && String(spec.OWNER_ID).trim()) ? String(spec.OWNER_ID).trim() : (typeof GOLDEN_TASK_DEFAULT_OWNER !== 'undefined' ? GOLDEN_TASK_DEFAULT_OWNER : 'USR_002');
    var reporterId = (spec.REPORTER_ID != null && String(spec.REPORTER_ID).trim()) ? String(spec.REPORTER_ID).trim() : '';

    var taskRecord = {
      ID: spec.ID,
      TASK_CODE: (spec.TASK_CODE && String(spec.TASK_CODE).trim()) ? String(spec.TASK_CODE).trim() : ('TK_' + spec.ID),
      TITLE: (spec.TITLE && String(spec.TITLE).trim()) ? String(spec.TITLE).trim() : spec.ID,
      DESCRIPTION: '',
      TASK_TYPE: taskType,
      STATUS: status,
      PRIORITY: priority,
      HTX_ID: htxId,
      OWNER_ID: ownerId,
      REPORTER_ID: reporterId,
      START_DATE: '',
      DUE_DATE: '',
      DONE_AT: status === 'DONE' ? now : '',
      PROGRESS_PERCENT: status === 'DONE' ? 100 : (status === 'IN_PROGRESS' ? 50 : 0),
      RESULT_SUMMARY: '',
      RELATED_ENTITY_TYPE: 'NONE',
      RELATED_ENTITY_ID: '',
      CREATED_AT: now,
      CREATED_BY: user,
      UPDATED_AT: now,
      UPDATED_BY: user,
      IS_DELETED: false
    };
    if (typeof taskAppendMain === 'function') {
      taskAppendMain(taskRecord);
      tasksCreated++;
    }

    var checklistItems = [
      { title: 'Bước 1: Xác nhận thông tin', isDone: status !== 'NEW' },
      { title: 'Bước 2: Kiểm tra hồ sơ', isDone: status === 'DONE' },
      { title: 'Bước 3: Hoàn tất báo cáo', isDone: false }
    ];
    var taskId = spec.ID;
    checklistItems.forEach(function(item) {
      var clId = 'TCL_' + ('00' + tclNo).slice(-3);
      if (_goldenExists(CBV_CONFIG.SHEETS.TASK_CHECKLIST, clId)) {
        tclNo++;
        return;
      }
      var clRecord = {
        ID: clId,
        TASK_ID: taskId,
        ITEM_NO: tclNo,
        TITLE: item.title,
        DESCRIPTION: '',
        IS_REQUIRED: true,
        IS_DONE: item.isDone,
        DONE_AT: item.isDone ? now : '',
        DONE_BY: item.isDone ? ownerId : '',
        NOTE: '',
        CREATED_AT: now,
        CREATED_BY: user,
        UPDATED_AT: now,
        UPDATED_BY: user,
        IS_DELETED: false
      };
      if (typeof taskAppendChecklist === 'function') {
        taskAppendChecklist(clRecord);
        checklistCreated++;
      }
      tclNo++;
    });

    var attachTypes = ['DRAFT', 'RESULT', 'SOP', 'REFERENCE'];
    var numAttach = (spec.ID.charCodeAt(spec.ID.length - 1) % 2) + 1;
    for (var a = 0; a < numAttach; a++) {
      var atId = 'TAT_' + ('00' + tatNo).slice(-3);
      if (_goldenExists(CBV_CONFIG.SHEETS.TASK_ATTACHMENT, atId)) {
        tatNo++;
        continue;
      }
      var atRecord = {
        ID: atId,
        TASK_ID: taskId,
        ATTACHMENT_TYPE: attachTypes[a % attachTypes.length],
        TITLE: 'File mẫu ' + (a + 1),
        FILE_URL: 'https://drive.google.com/file/d/golden_' + taskId + '_' + a + '/view',
        DRIVE_FILE_ID: '',
        NOTE: '',
        CREATED_AT: now,
        CREATED_BY: user,
        UPDATED_AT: now,
        UPDATED_BY: user,
        IS_DELETED: false
      };
      if (typeof taskAppendAttachment === 'function') {
        taskAppendAttachment(atRecord);
        attachmentsCreated++;
      }
      tatNo++;
    }

    var logEntries = [
      { type: 'NOTE', content: 'Task created - khởi tạo từ golden seed' },
      { type: 'NOTE', content: 'Đang xử lý theo quy trình chuẩn' },
      { type: status === 'DONE' ? 'STATUS_CHANGE' : 'NOTE', content: status === 'DONE' ? 'Hoàn thành' : 'Cập nhật tiến độ' }
    ];
    if (status === 'IN_PROGRESS') {
      logEntries.push({ type: 'QUESTION', content: 'Cần xác nhận từ phía kế toán?' });
      logEntries.push({ type: 'ANSWER', content: 'Đã xác nhận.' });
    }
    logEntries.forEach(function(le) {
      var logId = 'TLOG_' + ('00' + tlogNo).slice(-3);
      if (_goldenExists(CBV_CONFIG.SHEETS.TASK_UPDATE_LOG, logId)) {
        tlogNo++;
        return;
      }
      var updateType = (le.type && String(le.type).trim()) ? String(le.type).trim() : 'NOTE';
      var content = (le.content != null && String(le.content).trim()) ? String(le.content).trim() : 'Ghi chú từ golden seed';
      var logRecord = {
        ID: logId,
        TASK_ID: taskId,
        UPDATE_TYPE: updateType,
        ACTION: updateType,
        CONTENT: content,
        ACTOR_ID: ownerId,
        CREATED_AT: now,
        CREATED_BY: user,
        UPDATED_AT: now,
        UPDATED_BY: user,
        IS_DELETED: false
      };
      if (typeof taskAppendUpdateLog === 'function') {
        taskAppendUpdateLog(logRecord);
        logsCreated++;
      }
      tlogNo++;
    });
  });

  return {
    tasksCreated: tasksCreated,
    checklistCreated: checklistCreated,
    attachmentsCreated: attachmentsCreated,
    logsCreated: logsCreated,
    skipped: skipped
  };
}
