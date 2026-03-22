/**
 * Task Migration Helper - Safe migration from BangCongViec-style single sheet to normalized model.
 * Dependencies: 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 20_TASK_REPOSITORY, 03_USER_MIGRATION_HELPER
 *
 * STRICT:
 * - Does NOT modify or delete old sheet.
 * - Does NOT guess ambiguous user values.
 * - Requires dryRun=true for analysis; dryRun=false only when explicitly executing.
 * - Logs migration to ADMIN_AUDIT_LOG.
 */

/** Old column aliases: canonical key -> array of possible header strings */
var TASK_MIGRATION_COLUMN_ALIASES = {
  TITLE: ['TÊN CÔNG VIỆC', 'Ten cong viec', 'TenCongViec', 'Title', 'TITLE'],
  STATUS: ['TÌNH TRẠNG CÔNG VIỆC', 'Tinh trang', 'TinhTrang', 'Status', 'STATUS'],
  OWNER: ['Người thực hiện', 'Nguoi thuc hien', 'Owner', 'Assignee', 'OWNER_ID'],
  REPORTER: ['NGƯỜI CHỊU TRÁCH NHIỆM', 'Nguoi chiu trach nhiem', 'Reporter', 'REPORTER_ID'],
  CREATED_AT: ['Ngày tạo', 'Ngay tao', 'Created', 'CREATED_AT'],
  HTX_ID: ['HTX_ID', 'HTX', 'Htx', 'Đơn vị', 'Don vi'],
  START_DATE: ['NGÀY NHẬN VIỆC', 'Ngay nhan viec', 'Start', 'START_DATE'],
  DUE_DATE: ['THỜI HẠN', 'Thoi han', 'Due', 'DUE_DATE'],
  PROGRESS: ['TIẾN ĐỘ', 'Tien do', 'Progress', 'PROGRESS_PERCENT'],
  DONE_AT: ['NGÀY HOÀN THÀNH', 'Ngay hoan thanh', 'Done', 'DONE_AT'],
  NOTE: ['GHI CHÚ', 'Ghi chu', 'Note', 'DESCRIPTION'],
  KPI: ['KPI', 'kpi'],
  DRAFT: ['TÀI LIỆU NHÁP', 'Tai lieu nhap', 'Draft', 'DRAFT'],
  RESULT: ['KẾT QUẢ', 'Ket qua', 'Result', 'RESULT_SUMMARY'],
  SOP: ['SOP', 'sop'],
  REFERENCE_LINK: ['LINK THAM KHẢO', 'Link tham khao', 'Reference', 'REFERENCE'],
  CONVERSATION: ['TRAO ĐỔI / CÂU HỎI / PHẢN HỒI', 'TRAO ĐỔI', 'CÂU HỎI', 'PHẢN HỒI', 'Trao doi', 'Cau hoi', 'Phan hoi', 'Conversation', 'Feedback']
};

/** Vietnamese status -> TASK_STATUS enum */
var TASK_STATUS_MAPPING = {
  'mới': 'NEW',
  'mới tạo': 'NEW',
  'moi': 'NEW',
  'new': 'NEW',
  'đã giao': 'ASSIGNED',
  'giao việc': 'ASSIGNED',
  'da giao': 'ASSIGNED',
  'assigned': 'ASSIGNED',
  'đang thực hiện': 'IN_PROGRESS',
  'đang làm': 'IN_PROGRESS',
  'dang thuc hien': 'IN_PROGRESS',
  'in progress': 'IN_PROGRESS',
  'in_progress': 'IN_PROGRESS',
  'chờ': 'WAITING',
  'đang chờ': 'WAITING',
  'cho': 'WAITING',
  'waiting': 'WAITING',
  'hoàn thành': 'DONE',
  'xong': 'DONE',
  'hoan thanh': 'DONE',
  'done': 'DONE',
  'hủy': 'CANCELLED',
  'huỷ': 'CANCELLED',
  'huy': 'CANCELLED',
  'cancelled': 'CANCELLED',
  'canceled': 'CANCELLED',
  'lưu trữ': 'ARCHIVED',
  'luu tru': 'ARCHIVED',
  'archived': 'ARCHIVED'
};

/** URL pattern for splitting attachment links */
var URL_PATTERN = /https?:\/\/[^\s]+/gi;

/**
 * Finds column index by canonical key, using aliases.
 * @param {string[]} headers - Raw header row
 * @returns {Object} Map canonical key -> column index (0-based)
 */
function _buildTaskMigrationColumnMap(headers) {
  var map = {};
  var i, h, key, aliases;
  for (i = 0; i < headers.length; i++) {
    h = String(headers[i] || '').trim();
    if (!h) continue;
    for (key in TASK_MIGRATION_COLUMN_ALIASES) {
      aliases = TASK_MIGRATION_COLUMN_ALIASES[key];
      if (aliases.indexOf(h) !== -1) {
        map[key] = i;
        break;
      }
    }
  }
  return map;
}

/**
 * Gets cell value from row by column index.
 */
function _getCell(row, idx) {
  if (idx == null || idx < 0) return '';
  var v = row[idx];
  return v != null ? String(v).trim() : '';
}

/**
 * Maps raw status string to TASK_STATUS enum.
 */
function _mapStatus(raw) {
  var s = String(raw || '').trim().toLowerCase();
  if (!s) return 'NEW';
  var mapped = TASK_STATUS_MAPPING[s];
  if (mapped) return mapped;
  if (TASK_STATUS_MAPPING.hasOwnProperty && TASK_STATUS_MAPPING.hasOwnProperty(s)) return TASK_STATUS_MAPPING[s];
  return null;
}

/**
 * Checks if string looks like URL.
 */
function _isUrl(s) {
  if (!s || typeof s !== 'string') return false;
  return /^https?:\/\//i.test(s.trim());
}

/**
 * Extracts URLs from text. Returns array of URLs.
 */
function _extractUrls(text) {
  if (!text || typeof text !== 'string') return [];
  var m, urls = [];
  var re = new RegExp(URL_PATTERN.source, 'gi');
  while ((m = re.exec(text)) !== null) urls.push(m[0]);
  return urls;
}

/**
 * Analyzes old task sheet: headers, row count, column detection.
 * @param {Object} opts - { sourceSheet: string (sheet name), columnMap: Object (optional override) }
 * @returns {Object} { headers, columnMap, totalRows, detectedColumns, sampleRow }
 */
function analyzeTaskMigrationSource(opts) {
  opts = opts || {};
  var sourceSheet = opts.sourceSheet || 'BANG_CONG_VIEC';
  var config = typeof CBV_CONFIG !== 'undefined' ? CBV_CONFIG : null;
  var sheetName = (config && config.SHEETS && config.SHEETS[sourceSheet]) || sourceSheet;
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet) {
    return {
      error: 'Sheet not found: ' + sourceSheet,
      headers: [],
      columnMap: {},
      totalRows: 0,
      detectedColumns: [],
      sampleRow: null
    };
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol === 0) {
    return {
      headers: [],
      columnMap: {},
      totalRows: 0,
      detectedColumns: [],
      sampleRow: null
    };
  }

  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var columnMap = opts.columnMap || _buildTaskMigrationColumnMap(headers);
  var detectedColumns = Object.keys(columnMap);
  var sampleRow = lastRow >= 2 ? sheet.getRange(2, 1, 2, lastCol).getValues()[0] : null;

  return {
    headers: headers,
    columnMap: columnMap,
    totalRows: lastRow - 1,
    detectedColumns: detectedColumns,
    sampleRow: sampleRow,
    sourceSheet: sheetName
  };
}

/**
 * Builds migration report (analysis + per-row mapping). No writes.
 * @param {Object} opts - {
 *   sourceSheet: string,
 *   dryRun: boolean (default true),
 *   defaultHtxId: string (required for migration; used in report),
 *   columnMap: Object (optional override),
 *   statusMapping: Object (optional override for TASK_STATUS_MAPPING),
 *   userOverrides: Object (optional { "rawValue": "UD_xxx" })
 * }
 * @returns {Object} { summary, rows, ambiguousUsers, canMigrate }
 */
function buildTaskMigrationReport(opts) {
  opts = opts || {};
  var dryRun = opts.dryRun !== false;
  var defaultHtxId = opts.defaultHtxId || '';
  var statusMapping = opts.statusMapping || TASK_STATUS_MAPPING;
  var userOverrides = opts.userOverrides || {};

  var analysis = analyzeTaskMigrationSource({
    sourceSheet: opts.sourceSheet || 'BANG_CONG_VIEC',
    columnMap: opts.columnMap
  });

  if (analysis.error) {
    return {
      summary: { error: analysis.error, totalRows: 0, flaggedRows: 0, unresolvedUserRefs: 0 },
      rows: [],
      ambiguousUsers: [],
      canMigrate: false,
      dryRun: dryRun
    };
  }

  var cm = analysis.columnMap;
  var sheetName = analysis.sourceSheet;
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet) {
    return {
      summary: { error: 'Sheet not found', totalRows: 0, flaggedRows: 0, unresolvedUserRefs: 0 },
      rows: [],
      ambiguousUsers: [],
      canMigrate: false,
      dryRun: dryRun
    };
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var data = lastRow >= 2 ? sheet.getRange(2, 1, lastRow, lastCol).getValues() : [];

  var summary = {
    totalRows: data.length,
    migrated: 0,
    skipped: 0,
    flaggedRows: 0,
    unresolvedUserRefs: 0,
    missingHtx: 0,
    unknownStatus: 0,
    attachmentsToCreate: 0,
    logsToCreate: 0
  };

  var rows = [];
  var ambiguousUsers = {};
  var r, i, rowData, title, ownerVal, reporterVal, ownerRes, reporterRes, statusMapped, htxId, main, attach, logs;

  for (r = 0; r < data.length; r++) {
    rowData = data[r];
    title = _getCell(rowData, cm.TITLE);
    if (!title) {
      summary.skipped++;
      rows.push({ rowNumber: r + 2, action: 'SKIP', reason: 'Empty TITLE' });
      continue;
    }

    var htxCol = cm.HTX_ID;
    if (htxCol == null) htxCol = -1;
    htxId = _getCell(rowData, htxCol) || defaultHtxId;
    if (!htxId) {
      summary.missingHtx++;
      summary.flaggedRows++;
    }

    ownerVal = _getCell(rowData, cm.OWNER);
    reporterVal = _getCell(rowData, cm.REPORTER);
    ownerRes = (userOverrides[ownerVal] !== undefined) ? { resolvedId: userOverrides[ownerVal], ambiguous: false }
      : ownerVal ? (typeof resolveValueToUserDirectoryId === 'function' ? resolveValueToUserDirectoryId(ownerVal, {}) : { resolvedId: null, ambiguous: true })
      : { resolvedId: null, ambiguous: true };
    reporterRes = (userOverrides[reporterVal] !== undefined) ? { resolvedId: userOverrides[reporterVal], ambiguous: false }
      : reporterVal ? (typeof resolveValueToUserDirectoryId === 'function' ? resolveValueToUserDirectoryId(reporterVal, { allowEmailFallback: true }) : { resolvedId: null, ambiguous: true })
      : { resolvedId: null, ambiguous: false };

    if (ownerVal && (!ownerRes.resolvedId || ownerRes.ambiguous)) {
      summary.unresolvedUserRefs++;
      if (!ambiguousUsers[ownerVal]) ambiguousUsers[ownerVal] = [];
      ambiguousUsers[ownerVal].push('OWNER row ' + (r + 2));
    }
    if (reporterVal && reporterVal !== ownerVal && (!reporterRes.resolvedId || reporterRes.ambiguous)) {
      summary.unresolvedUserRefs++;
      if (!ambiguousUsers[reporterVal]) ambiguousUsers[reporterVal] = [];
      ambiguousUsers[reporterVal].push('REPORTER row ' + (r + 2));
    }

    statusMapped = _mapStatus(_getCell(rowData, cm.STATUS));
    if (!statusMapped) summary.unknownStatus++;

    main = {
      TITLE: title,
      HTX_ID: htxId,
      OWNER_ID: (ownerRes && ownerRes.resolvedId && !ownerRes.ambiguous) ? ownerRes.resolvedId : (userOverrides[ownerVal] || ownerVal || ''),
      REPORTER_ID: (reporterRes && reporterRes.resolvedId && !reporterRes.ambiguous) ? reporterRes.resolvedId : (reporterVal || ''),
      STATUS: statusMapped || 'NEW',
      DESCRIPTION: _getCell(rowData, cm.NOTE),
      CREATED_AT: _getCell(rowData, cm.CREATED_AT),
      START_DATE: _getCell(rowData, cm.START_DATE),
      DUE_DATE: _getCell(rowData, cm.DUE_DATE),
      DONE_AT: _getCell(rowData, cm.DONE_AT),
      PROGRESS_PERCENT: parseInt(_getCell(rowData, cm.PROGRESS), 10) || 0,
      RESULT_SUMMARY: _getCell(rowData, cm.RESULT),
      KPI_RAW: _getCell(rowData, cm.KPI)
    };

    attach = [];
    var draftVal = _getCell(rowData, cm.DRAFT);
    var resultVal = _getCell(rowData, cm.RESULT);
    var sopVal = _getCell(rowData, cm.SOP);
    var refVal = _getCell(rowData, cm.REFERENCE_LINK);

    if (draftVal) {
      var urls = _isUrl(draftVal) ? [draftVal] : _extractUrls(draftVal);
      urls.forEach(function(u) { attach.push({ type: 'DRAFT', url: u }); });
    }
    if (resultVal) {
      var resultUrls = _isUrl(resultVal) ? [resultVal] : _extractUrls(resultVal);
      resultUrls.forEach(function(u) { attach.push({ type: 'RESULT', url: u }); });
    }
    if (sopVal) {
      var sopUrls = _isUrl(sopVal) ? [sopVal] : _extractUrls(sopVal);
      sopUrls.forEach(function(u) { attach.push({ type: 'SOP', url: u }); });
    }
    if (refVal) {
      var refUrls = _isUrl(refVal) ? [refVal] : _extractUrls(refVal);
      refUrls.forEach(function(u) { attach.push({ type: 'REFERENCE', url: u }); });
    }
    summary.attachmentsToCreate += attach.length;

    logs = [];
    var convVal = _getCell(rowData, cm.CONVERSATION);
    if (convVal) logs.push({ type: 'NOTE', content: convVal });
    summary.logsToCreate += logs.length;

    var flagged = !htxId || (!ownerVal && !userOverrides['']) || (ownerVal && (!ownerRes.resolvedId || ownerRes.ambiguous)) || (reporterVal && reporterVal !== ownerVal && (!reporterRes.resolvedId || reporterRes.ambiguous)) || !statusMapped;
    if (flagged) summary.flaggedRows++;

    rows.push({
      rowNumber: r + 2,
      action: flagged ? 'FLAG' : 'MIGRATE',
      main: main,
      attachments: attach,
      logs: logs,
      ownerResolved: ownerRes && ownerRes.resolvedId && !ownerRes.ambiguous,
      reporterResolved: !reporterVal || (reporterRes && reporterRes.resolvedId && !reporterRes.ambiguous)
    });
    summary.migrated++;
  }

  return {
    summary: summary,
    rows: rows,
    ambiguousUsers: ambiguousUsers,
    canMigrate: summary.flaggedRows === 0 && summary.totalRows > 0,
    dryRun: dryRun,
    sourceSheet: sheetName,
    defaultHtxId: defaultHtxId
  };
}

/**
 * Runs migration. ONLY executes when dryRun is explicitly false.
 * @param {Object} opts - {
 *   sourceSheet: string,
 *   dryRun: boolean (REQUIRED false to execute),
 *   defaultHtxId: string (REQUIRED),
 *   columnMap: Object (optional),
 *   statusMapping: Object (optional),
 *   userOverrides: Object (optional)
 * }
 * @returns {Object} { applied, skipped, message, report }
 */
function runTaskMigration(opts) {
  opts = opts || {};
  if (opts.dryRun !== false) {
    return {
      applied: 0,
      skipped: 0,
      message: 'Migration skipped: dryRun must be explicitly false to execute',
      report: buildTaskMigrationReport(Object.assign({}, opts, { dryRun: true }))
    };
  }

  var defaultHtxId = opts.defaultHtxId || '';
  if (!defaultHtxId) {
    return {
      applied: 0,
      skipped: 0,
      message: 'Migration aborted: defaultHtxId is required',
      report: buildTaskMigrationReport(Object.assign({}, opts, { dryRun: true }))
    };
  }

  var report = buildTaskMigrationReport(Object.assign({}, opts, { dryRun: false }));
  if (report.summary.error) {
    return { applied: 0, skipped: 0, message: 'Error: ' + report.summary.error, report: report };
  }

  if (report.summary.flaggedRows > 0) {
    return {
      applied: 0,
      skipped: report.summary.totalRows,
      message: 'Migration aborted: ' + report.summary.flaggedRows + ' flagged rows. Resolve ambiguous users and missing HTX before running.',
      report: report
    };
  }

  var applied = 0;
  var skipped = 0;
  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var user = typeof cbvUser === 'function' ? cbvUser() : 'system';

  for (var i = 0; i < report.rows.length; i++) {
    var row = report.rows[i];
    if (row.action !== 'MIGRATE' && row.action !== 'FLAG') {
      skipped++;
      continue;
    }
    if (row.action === 'FLAG') {
      skipped++;
      continue;
    }

    var main = row.main;
    if (!main.OWNER_ID || !main.HTX_ID) {
      skipped++;
      continue;
    }

    var taskId = typeof cbvMakeId === 'function' ? cbvMakeId('TASK') : 'TASK_' + Date.now() + '_' + i;
    var taskRecord = {
      ID: taskId,
      TASK_CODE: typeof cbvMakeId === 'function' ? cbvMakeId('TK') : 'TK_' + i,
      TITLE: main.TITLE,
      DESCRIPTION: main.DESCRIPTION || '',
      TASK_TYPE: 'GENERAL',
      STATUS: main.STATUS || 'NEW',
      PRIORITY: 'MEDIUM',
      HTX_ID: main.HTX_ID,
      OWNER_ID: main.OWNER_ID,
      REPORTER_ID: main.REPORTER_ID || '',
      START_DATE: main.START_DATE || '',
      DUE_DATE: main.DUE_DATE || '',
      DONE_AT: main.DONE_AT || '',
      PROGRESS_PERCENT: main.PROGRESS_PERCENT || 0,
      RESULT_SUMMARY: main.RESULT_SUMMARY || '',
      RELATED_ENTITY_TYPE: 'NONE',
      RELATED_ENTITY_ID: main.KPI_RAW || '',
      CREATED_AT: main.CREATED_AT || now,
      CREATED_BY: user,
      UPDATED_AT: now,
      UPDATED_BY: user,
      IS_DELETED: false
    };

    if (typeof taskAppendMain === 'function') taskAppendMain(taskRecord);
    applied++;

    var attach = row.attachments || [];
    for (var a = 0; a < attach.length; a++) {
      var att = attach[a];
      var attRecord = {
        ID: typeof cbvMakeId === 'function' ? cbvMakeId('TATT') : 'TATT_' + Date.now() + '_' + a,
        TASK_ID: taskId,
        ATTACHMENT_TYPE: att.type || 'REFERENCE',
        TITLE: '',
        FILE_URL: att.url || '',
        DRIVE_FILE_ID: '',
        NOTE: '',
        CREATED_AT: now,
        CREATED_BY: user,
        UPDATED_AT: now,
        UPDATED_BY: user,
        IS_DELETED: false
      };
      if (typeof taskAppendAttachment === 'function') taskAppendAttachment(attRecord);
    }

    var logs = row.logs || [];
    for (var l = 0; l < logs.length; l++) {
      var log = logs[l];
      var actorId = main.OWNER_ID;
      var logRecord = {
        ID: typeof cbvMakeId === 'function' ? cbvMakeId('TLOG') : 'TLOG_' + Date.now() + '_' + l,
        TASK_ID: taskId,
        UPDATE_TYPE: log.type || 'NOTE',
        CONTENT: log.content || '',
        ACTOR_ID: actorId,
        CREATED_AT: now,
        CREATED_BY: user,
        UPDATED_AT: now,
        UPDATED_BY: user,
        IS_DELETED: false
      };
      if (typeof taskAppendUpdateLog === 'function') taskAppendUpdateLog(logRecord);
    }
  }

  if (typeof logAdminAudit === 'function') {
    logAdminAudit(
      'TASK_MIGRATION',
      'SYSTEM',
      '',
      'runTaskMigration',
      { sourceSheet: report.sourceSheet, defaultHtxId: defaultHtxId },
      { applied: applied, skipped: skipped, totalRows: report.summary.totalRows },
      'Task migration: ' + applied + ' tasks created, ' + skipped + ' skipped'
    );
  }

  return {
    applied: applied,
    skipped: skipped,
    message: 'Migration complete: ' + applied + ' tasks created',
    report: report
  };
}
