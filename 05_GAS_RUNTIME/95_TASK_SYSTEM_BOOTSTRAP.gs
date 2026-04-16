/**
 * CBV Task System PRO Bootstrap - Idempotent DON_VI and task schema setup.
 * Aligns with FINAL ARCHITECTURE: DON_VI, TASK_TYPE_ID, DON_VI_ID, workflow.
 * Safe for existing data. Never destructive. Run multiple times safely.
 *
 * Dependencies: 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA
 *
 * RERUN ORDER:
 *   1. ensureDonViSheet()
 *   2. ensureSeedDonVi()
 *   3. ensureSeedTaskType()
 *   4. ensureTaskMainSchemaPro()
 *   5. selfAuditTaskSystem()
 */

/** DON_VI sheet headers (final architecture) */
var DON_VI_HEADERS = [
  'ID', 'DON_VI_TYPE', 'CODE', 'NAME', 'DISPLAY_TEXT', 'SHORT_NAME', 'PARENT_ID',
  'STATUS', 'SORT_ORDER', 'MANAGER_USER_ID', 'EMAIL', 'PHONE', 'ADDRESS', 'NOTE',
  'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'
];

/** DON_VI seed rows (idempotent - append only if ID not exists) */
var DON_VI_SEED = [
  { ID: 'DV_20250322_ABC001', DON_VI_TYPE: 'CONG_TY', CODE: 'CT_LAOCONG', NAME: 'Công ty Lao Cộng', DISPLAY_TEXT: 'Công ty Lao Cộng', SHORT_NAME: 'CT', PARENT_ID: '', STATUS: 'ACTIVE', SORT_ORDER: 1 },
  { ID: 'DV_20250322_HTX01', DON_VI_TYPE: 'HTX', CODE: 'HTX_A', NAME: 'HTX Lao Cộng A', DISPLAY_TEXT: 'HTX A', SHORT_NAME: 'HTX-A', PARENT_ID: 'DV_20250322_ABC001', STATUS: 'ACTIVE', SORT_ORDER: 1 },
  { ID: 'DV_20250322_HTX02', DON_VI_TYPE: 'HTX', CODE: 'HTX_B', NAME: 'HTX Lao Cộng B', DISPLAY_TEXT: 'HTX B', SHORT_NAME: 'HTX-B', PARENT_ID: 'DV_20250322_ABC001', STATUS: 'ACTIVE', SORT_ORDER: 2 },
  { ID: 'DV_20250322_DKD01', DON_VI_TYPE: 'DOI_KINH_DOANH', CODE: 'DKD_VANTAI', NAME: 'Đội Vận tải', DISPLAY_TEXT: 'Đội Vận tải', SHORT_NAME: 'VT', PARENT_ID: 'DV_20250322_ABC001', STATUS: 'ACTIVE', SORT_ORDER: 1 },
  { ID: 'DV_20250322_DKD02', DON_VI_TYPE: 'DOI_KINH_DOANH', CODE: 'DKD_DICHVU', NAME: 'Đội Dịch vụ', DISPLAY_TEXT: 'Đội Dịch vụ', SHORT_NAME: 'DV', PARENT_ID: 'DV_20250322_ABC001', STATUS: 'ACTIVE', SORT_ORDER: 2 },
  { ID: 'DV_20250322_BP01', DON_VI_TYPE: 'BO_PHAN', CODE: 'VAN_HANH', NAME: 'Bộ phận Vận hành', DISPLAY_TEXT: 'Vận hành', SHORT_NAME: 'VH', PARENT_ID: 'DV_20250322_ABC001', STATUS: 'ACTIVE', SORT_ORDER: 1 },
  { ID: 'DV_20250322_BP02', DON_VI_TYPE: 'BO_PHAN', CODE: 'HO_SO', NAME: 'Bộ phận Hồ sơ', DISPLAY_TEXT: 'Hồ sơ', SHORT_NAME: 'HS', PARENT_ID: 'DV_20250322_ABC001', STATUS: 'ACTIVE', SORT_ORDER: 2 },
  { ID: 'DV_20250322_BP03', DON_VI_TYPE: 'BO_PHAN', CODE: 'THU_CHI', NAME: 'Bộ phận Thu Chi', DISPLAY_TEXT: 'Thu Chi', SHORT_NAME: 'TC', PARENT_ID: 'DV_20250322_ABC001', STATUS: 'ACTIVE', SORT_ORDER: 3 },
  { ID: 'DV_20250322_NHOM01', DON_VI_TYPE: 'NHOM', CODE: 'NHOM_VH1', NAME: 'Nhóm Vận hành 1', DISPLAY_TEXT: 'Nhóm VH1', SHORT_NAME: 'VH1', PARENT_ID: 'DV_20250322_BP01', STATUS: 'ACTIVE', SORT_ORDER: 1 }
];

/** TASK_TYPE seed for MASTER_CODE (MASTER_GROUP = TASK_TYPE) */
var TASK_TYPE_SEED = [
  { CODE: 'GENERAL', NAME: 'Chung', DISPLAY_TEXT: 'Chung' },
  { CODE: 'HO_SO', NAME: 'Hồ sơ', DISPLAY_TEXT: 'Hồ sơ' },
  { CODE: 'FINANCE', NAME: 'Tài chính', DISPLAY_TEXT: 'Tài chính' },
  { CODE: 'OPERATION', NAME: 'Vận hành', DISPLAY_TEXT: 'Vận hành' }
];

/** DON_VI sheet name - config override if defined */
function getDonViSheetName() {
  return (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.DON_VI)
    ? CBV_CONFIG.SHEETS.DON_VI : 'DON_VI';
}

/**
 * Creates DON_VI sheet if missing. Appends missing columns. Idempotent.
 * @returns {{ created: boolean, appendedColumns: string[] }}
 */
function ensureDonViSheet() {
  var name = getDonViSheetName();
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(name);
  var created = !sheet;
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, DON_VI_HEADERS.length).setValues([DON_VI_HEADERS]);
    sheet.getRange(1, 1, 1, DON_VI_HEADERS.length).setFontWeight('bold');
    return { created: true, appendedColumns: [] };
  }
  var lastCol = sheet.getLastColumn();
  var current = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var appended = [];
  DON_VI_HEADERS.forEach(function(h, i) {
    if (current.indexOf(h) === -1) {
      var col = lastCol + appended.length + 1;
      sheet.getRange(1, col).setValue(h);
      appended.push(h);
    }
  });
  return { created: false, appendedColumns: appended };
}

/**
 * Seeds DON_VI with default rows. Skips if ID already exists. Idempotent.
 * @returns {{ inserted: number, skipped: number }}
 */
function ensureSeedDonVi() {
  var name = getDonViSheetName();
  var sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 1) return { inserted: 0, skipped: 0 };
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idIdx = headers.indexOf('ID');
  if (idIdx === -1) return { inserted: 0, skipped: 0 };
  var existingIds = {};
  if (sheet.getLastRow() >= 2) {
    var rows = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
    rows.forEach(function(r) {
      var id = String(r[idIdx] || '').trim();
      if (id) existingIds[id] = true;
    });
  }
  var inserted = 0;
  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var actor = typeof cbvUser === 'function' ? cbvUser() : 'system';
  DON_VI_SEED.forEach(function(row) {
    if (existingIds[row.ID]) return;
    var rec = {
      ID: row.ID,
      DON_VI_TYPE: row.DON_VI_TYPE,
      CODE: row.CODE,
      NAME: row.NAME,
      DISPLAY_TEXT: row.DISPLAY_TEXT || row.NAME,
      SHORT_NAME: row.SHORT_NAME || '',
      PARENT_ID: row.PARENT_ID || '',
      STATUS: row.STATUS || 'ACTIVE',
      SORT_ORDER: row.SORT_ORDER || 0,
      MANAGER_USER_ID: '',
      EMAIL: '',
      PHONE: '',
      ADDRESS: '',
      NOTE: '',
      CREATED_AT: now,
      CREATED_BY: actor,
      UPDATED_AT: now,
      UPDATED_BY: actor,
      IS_DELETED: false
    };
    var rowData = DON_VI_HEADERS.map(function(h) { return rec[h] !== undefined ? rec[h] : ''; });
    sheet.appendRow(rowData);
    existingIds[row.ID] = true;
    inserted++;
  });
  return { inserted: inserted, skipped: DON_VI_SEED.length - inserted };
}

/**
 * Ensures MASTER_CODE has TASK_TYPE group rows. Idempotent.
 * @returns {{ inserted: number }}
 */
function ensureSeedTaskType() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.MASTER_CODE);
  if (!sheet || sheet.getLastRow() < 1) return { inserted: 0 };
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var groupIdx = headers.indexOf('MASTER_GROUP');
  var codeIdx = headers.indexOf('CODE');
  if (groupIdx === -1 || codeIdx === -1) return { inserted: 0 };
  var existing = {};
  if (sheet.getLastRow() >= 2) {
    var rows = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
    rows.forEach(function(r) {
      var g = String(r[groupIdx] || '').trim();
      var c = String(r[codeIdx] || '').trim();
      if (g === 'TASK_TYPE' && c) existing[c] = true;
    });
  }
  var inserted = 0;
  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var user = typeof cbvUser === 'function' ? cbvUser() : 'system';
  var idPrefix = typeof cbvMakeId === 'function' ? cbvMakeId('MC').split('_')[0] : 'MC';
  TASK_TYPE_SEED.forEach(function(t) {
    if (existing[t.CODE]) return;
    var id = (idPrefix + '_TASK_' + t.CODE).substring(0, 24);
    var row = headers.map(function(h) {
      if (h === 'ID') return id;
      if (h === 'MASTER_GROUP') return 'TASK_TYPE';
      if (h === 'CODE') return t.CODE;
      if (h === 'NAME') return t.NAME;
      if (h === 'DISPLAY_TEXT') return t.DISPLAY_TEXT || t.NAME;
      if (h === 'STATUS') return 'ACTIVE';
      if (h === 'SORT_ORDER') return TASK_TYPE_SEED.indexOf(t) + 1;
      if (h === 'IS_SYSTEM') return false;
      if (h === 'ALLOW_EDIT') return true;
      if (h === 'CREATED_AT') return now;
      if (h === 'CREATED_BY') return user;
      if (h === 'UPDATED_AT') return now;
      if (h === 'UPDATED_BY') return user;
      if (h === 'IS_DELETED') return false;
      return '';
    });
    sheet.appendRow(row);
    existing[t.CODE] = true;
    inserted++;
  });
  return { inserted: inserted };
}

/**
 * Appends DON_VI_ID and TASK_TYPE_ID to TASK_MAIN if missing. PRO schema only.
 * @returns {{ appendedColumns: string[] }}
 */
function ensureTaskMainSchemaPro() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.TASK_MAIN);
  if (!sheet || sheet.getLastRow() < 1) return { appendedColumns: [] };
  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var appended = [];
  ['DON_VI_ID', 'TASK_TYPE_ID'].forEach(function(col) {
    if (headers.indexOf(col) === -1) {
      sheet.getRange(1, lastCol + appended.length + 1).setValue(col);
      appended.push(col);
    }
  });
  return { appendedColumns: appended };
}

/**
 * Builds slice spec for AppSheet/GAS reference.
 * @returns {Object}
 */
function buildActiveSlicesSpecImpl() {
  return {
    ACTIVE_USERS: {
      source: 'USER_DIRECTORY',
      condition: 'STATUS=ACTIVE AND IS_DELETED=FALSE'
    },
    ACTIVE_DON_VI: {
      source: 'DON_VI',
      condition: 'STATUS=ACTIVE AND IS_DELETED=FALSE'
    },
    ACTIVE_TASK_TYPE: {
      source: 'MASTER_CODE',
      condition: 'MASTER_GROUP=TASK_TYPE AND STATUS=ACTIVE AND IS_DELETED=FALSE'
    }
  };
}

/**
 * Self-audit DON_VI table: schema, refs, DON_VI_TYPE validity. Idempotent (read-only).
 * @returns {{ ok: boolean, findings: Object[], stats: Object }}
 */
function selfAuditDonVi() {
  var findings = [];
  var stats = { total: 0, byType: {}, invalidParent: 0, invalidManager: 0, invalidType: 0 };
  var name = getDonViSheetName();
  var sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) {
    findings.push({ code: 'DON_VI_SHEET_MISSING', severity: 'CRITICAL', message: 'DON_VI sheet missing. Run ensureDonViSheet().' });
    return { ok: false, findings: findings, stats: stats };
  }
  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var required = ['ID', 'DON_VI_TYPE', 'CODE', 'NAME', 'DISPLAY_TEXT', 'PARENT_ID', 'STATUS', 'IS_DELETED'];
  required.forEach(function(h) {
    if (headers.indexOf(h) === -1) {
      findings.push({ code: 'DON_VI_COL_MISSING', severity: 'HIGH', message: 'Missing column: ' + h });
    }
  });
  var validTypes = ['CONG_TY', 'HTX', 'DOI_KINH_DOANH', 'BO_PHAN', 'NHOM'];
  if (sheet.getLastRow() < 2) {
    findings.push({ code: 'DON_VI_EMPTY', severity: 'MEDIUM', message: 'DON_VI has no data rows. Run ensureSeedDonVi().' });
    return { ok: findings.filter(function(f) { return f.severity === 'CRITICAL'; }).length === 0, findings: findings, stats: stats };
  }
  var idIdx = headers.indexOf('ID');
  var typeIdx = headers.indexOf('DON_VI_TYPE');
  var parentIdx = headers.indexOf('PARENT_ID');
  var managerIdx = headers.indexOf('MANAGER_USER_ID');
  var ids = {};
  var rows = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
  rows.forEach(function(r) {
    var id = String(r[idIdx] || '').trim();
    if (id) ids[id] = true;
    var t = String(r[typeIdx] || '').trim();
    if (t) stats.byType[t] = (stats.byType[t] || 0) + 1;
    if (t && validTypes.indexOf(t) === -1) stats.invalidType++;
  });
  stats.total = rows.length;
  rows.forEach(function(r, i) {
    var parentId = String(r[parentIdx] || '').trim();
    if (parentId && !ids[parentId]) stats.invalidParent++;
    var managerId = String(r[managerIdx] || '').trim();
    if (managerId) {
      var u = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.USER_DIRECTORY, managerId) : null;
      if (!u || String(u.STATUS || '').trim() !== 'ACTIVE' || u.IS_DELETED === true) stats.invalidManager++;
    }
  });
  if (stats.invalidParent > 0) findings.push({ code: 'DON_VI_INVALID_PARENT', severity: 'HIGH', message: stats.invalidParent + ' rows with PARENT_ID not in DON_VI' });
  if (stats.invalidManager > 0) findings.push({ code: 'DON_VI_INVALID_MANAGER', severity: 'MEDIUM', message: stats.invalidManager + ' rows with MANAGER_USER_ID not in USER_DIRECTORY' });
  if (stats.invalidType > 0) findings.push({ code: 'DON_VI_INVALID_TYPE', severity: 'MEDIUM', message: stats.invalidType + ' rows with DON_VI_TYPE not in ' + validTypes.join(', ') });
  var ok = findings.filter(function(f) { return f.severity === 'CRITICAL'; }).length === 0;
  return { ok: ok, findings: findings, stats: stats };
}

/**
 * Self-audit task system. Delegates to selfAuditTaskSystemFull when available.
 * @returns {{ ok: boolean, findings: Object[], stats?: Object, summary?: string }}
 */
function selfAuditTaskSystem() {
  if (typeof selfAuditTaskSystemFull === 'function') {
    return selfAuditTaskSystemFull();
  }
  var findings = [];
  var ss = SpreadsheetApp.getActive();
  var donViSheet = ss.getSheetByName(getDonViSheetName());
  if (!donViSheet || donViSheet.getLastRow() < 2) {
    findings.push({ code: 'TASK_DON_VI_MISSING', severity: 'HIGH', message: 'DON_VI sheet missing or empty. Run ensureDonViSheet() and ensureSeedDonVi().' });
  }
  var taskSheet = ss.getSheetByName(CBV_CONFIG.SHEETS.TASK_MAIN);
  if (taskSheet && taskSheet.getLastRow() >= 2) {
    var h = taskSheet.getRange(1, 1, 1, taskSheet.getLastColumn()).getValues()[0];
    if (h.indexOf('STATUS') === -1) findings.push({ code: 'TASK_STATUS_MISSING', severity: 'CRITICAL', message: 'TASK_MAIN missing STATUS column' });
    if (h.indexOf('OWNER_ID') === -1) findings.push({ code: 'TASK_OWNER_MISSING', severity: 'CRITICAL', message: 'TASK_MAIN missing OWNER_ID column' });
  }
  var ok = findings.filter(function(f) { return f.severity === 'CRITICAL'; }).length === 0;
  return { ok: ok, findings: findings };
}

/**
 * Full PRO bootstrap sequence. Idempotent. Call from initAll or menu.
 * @returns {{ donVi: Object, seedDonVi: Object, seedTaskType: Object, taskMain: Object, audit: Object }}
 */
function taskSystemProBootstrapAll() {
  var donVi = ensureDonViSheet();
  var seedDonVi = ensureSeedDonVi();
  var seedTaskType = ensureSeedTaskType();
  var taskMain = ensureTaskMainSchemaPro();
  var audit = selfAuditTaskSystem();
  return { donVi: donVi, seedDonVi: seedDonVi, seedTaskType: seedTaskType, taskMain: taskMain, audit: audit };
}

/**
 * Safe repair: ensure DON_VI exists, then append missing columns to all task tables.
 * @param {Object} options - { dryRun: boolean }
 * @returns {{ appended: string[], dryRun?: boolean }}
 */
function repairTaskSystemSafelyImpl(options) {
  ensureDonViSheet();
  if (typeof repairTaskSystemSafelyFull === 'function') {
    return repairTaskSystemSafelyFull(options || {});
  }
  var tm = ensureTaskMainSchemaPro();
  var appended = [];
  if (tm.appendedColumns && tm.appendedColumns.length > 0) {
    appended = tm.appendedColumns.map(function(c) { return 'TASK_MAIN.' + c; });
  }
  return { appended: appended };
}
