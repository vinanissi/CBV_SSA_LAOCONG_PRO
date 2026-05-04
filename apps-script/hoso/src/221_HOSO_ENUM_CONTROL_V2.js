/**
 * ENUM_CONTROL_V2 — HO_SO_ENUM production (schema breadth, role, transitions, AppSheet hints).
 * Dependencies: 180 (HOSO_Config_getDbId_). Load after 220 (legacy HOSO_Enum_syncAll kept).
 */

/** @type {string[]} — fixed order; existing columns never reordered; new ones append only */
var HOSO_ENUM_V2_HEADERS_ = [
  'ENUM_ID',
  'ENUM_GROUP',
  'ENUM_VALUE',
  'ENUM_LABEL',
  'SORT_ORDER',
  'IS_ACTIVE',
  'NOTE',
  'DISPLAY_LABEL',
  'DESCRIPTION',
  'ROLE_ALLOW',
  'ROLE_DENY',
  'COLOR_CODE',
  'ICON_NAME',
  'IS_DEFAULT',
  'IS_SYSTEM',
  'PARENT_GROUP',
  'PARENT_VALUE',
  'NEXT_ALLOWED_VALUES',
  'SHOW_IF_EXPR',
  'VALID_IF_EXPR',
  'UPDATED_AT'
];

/** @type {string[]} */
var HOSO_ENUM_V2_REQUIRED_GROUPS_ = [
  'HO_SO_STATUS',
  'HO_SO_TYPE',
  'PRIORITY',
  'FILE_TYPE',
  'FILE_STATUS',
  'PRINT_STATUS',
  'PRINT_JOB_TYPE'
];

/**
 * @param {string} group
 * @param {Object} item
 * @returns {Object}
 */
function HOSO_ENUM_V2_item_(group, item) {
  var gr = String(group || '').trim();
  var v = item || {};
  return {
    value: String(v.value || '').trim(),
    label: String(v.label || '').trim(),
    displayLabel: String((v.displayLabel != null ? v.displayLabel : v.label) || '').trim(),
    description: String(v.description != null ? v.description : '').trim(),
    sort: v.sort != null ? Number(v.sort) : 0,
    isDefault: !!v.isDefault,
    isSystem: v.isSystem !== false,
    colorCode: String(v.colorCode != null ? v.colorCode : '').trim(),
    iconName: String(v.iconName != null ? v.iconName : '').trim(),
    roleAllow: String(v.roleAllow != null ? v.roleAllow : '').trim(),
    roleDeny: String(v.roleDeny != null ? v.roleDeny : '').trim(),
    nextAllowedValues: String(v.nextAllowedValues != null ? v.nextAllowedValues : '').trim(),
    showIfExpr: String(v.showIfExpr != null ? v.showIfExpr : '').trim(),
    validIfExpr: String(v.validIfExpr != null ? v.validIfExpr : '').trim(),
    parentGroup: String(v.parentGroup != null ? v.parentGroup : '').trim(),
    parentValue: String(v.parentValue != null ? v.parentValue : '').trim(),
    note: String(v.note != null ? v.note : '').trim(),
    isActive: v.isActive !== false
  };
}

const HOSO_ENUM_V2_DEFINITIONS_ = [
  {
    group: 'HO_SO_STATUS',
    items: [
      HOSO_ENUM_V2_item_('HO_SO_STATUS', {
        value: 'NEW',
        label: 'Mới',
        displayLabel: 'Mới',
        description: 'Hồ sơ mới tạo, chưa xử lý',
        sort: 1,
        isDefault: true,
        isSystem: true,
        colorCode: 'BLUE',
        iconName: 'Add',
        roleAllow: 'ADMIN,STAFF',
        nextAllowedValues: 'RECEIVED,CHECKING,CANCELLED'
      }),
      HOSO_ENUM_V2_item_('HO_SO_STATUS', {
        value: 'RECEIVED',
        label: 'Đã tiếp nhận',
        description: 'Đã tiếp nhận hồ sơ',
        sort: 2,
        isSystem: true,
        colorCode: 'CYAN',
        iconName: 'Check',
        roleAllow: 'ADMIN,STAFF',
        nextAllowedValues: 'CHECKING,NEED_INFO,CANCELLED'
      }),
      HOSO_ENUM_V2_item_('HO_SO_STATUS', {
        value: 'CHECKING',
        label: 'Đang kiểm tra',
        description: 'Đang kiểm tra hồ sơ',
        sort: 3,
        isSystem: true,
        colorCode: 'ORANGE',
        iconName: 'Search',
        roleAllow: 'ADMIN,STAFF',
        nextAllowedValues: 'NEED_INFO,READY,DONE,CANCELLED'
      }),
      HOSO_ENUM_V2_item_('HO_SO_STATUS', {
        value: 'NEED_INFO',
        label: 'Cần bổ sung',
        description: 'Thiếu thông tin / giấy tờ',
        sort: 4,
        isSystem: true,
        colorCode: 'YELLOW',
        iconName: 'Warning',
        roleAllow: 'ADMIN,STAFF',
        nextAllowedValues: 'CHECKING,CANCELLED'
      }),
      HOSO_ENUM_V2_item_('HO_SO_STATUS', {
        value: 'READY',
        label: 'Sẵn sàng',
        description: 'Đạt điều kiện xử lý tiếp',
        sort: 5,
        isSystem: true,
        colorCode: 'GREEN',
        iconName: 'Verified',
        roleAllow: 'ADMIN,STAFF',
        nextAllowedValues: 'PRINTING,DONE,CANCELLED'
      }),
      HOSO_ENUM_V2_item_('HO_SO_STATUS', {
        value: 'PRINTING',
        label: 'Đang in',
        description: 'Đang in / xuất chứng từ',
        sort: 6,
        isSystem: true,
        colorCode: 'PURPLE',
        iconName: 'Print',
        roleAllow: 'ADMIN,STAFF',
        nextAllowedValues: 'DONE,ERROR'
      }),
      HOSO_ENUM_V2_item_('HO_SO_STATUS', {
        value: 'DONE',
        label: 'Hoàn thành',
        description: 'Xử lý xong, chờ lưu trữ',
        sort: 7,
        isSystem: true,
        colorCode: 'GREEN',
        iconName: 'Done',
        roleAllow: 'ADMIN,STAFF',
        nextAllowedValues: 'ARCHIVED'
      }),
      HOSO_ENUM_V2_item_('HO_SO_STATUS', {
        value: 'ERROR',
        label: 'Lỗi',
        description: 'Có lỗi trong quy trình',
        sort: 8,
        isSystem: true,
        colorCode: 'RED',
        iconName: 'Error',
        roleAllow: 'ADMIN,STAFF',
        nextAllowedValues: 'CANCELLED'
      }),
      HOSO_ENUM_V2_item_('HO_SO_STATUS', {
        value: 'ARCHIVED',
        label: 'Đã lưu trữ',
        description: 'Hồ sơ đã đóng và lưu trữ',
        sort: 9,
        isSystem: true,
        colorCode: 'GRAY',
        iconName: 'Archive',
        roleAllow: 'ADMIN,STAFF',
        nextAllowedValues: ''
      }),
      HOSO_ENUM_V2_item_('HO_SO_STATUS', {
        value: 'CANCELLED',
        label: 'Đã hủy',
        description: 'Hồ sơ đã hủy',
        sort: 10,
        isSystem: true,
        colorCode: 'RED',
        iconName: 'Cancel',
        roleAllow: 'ADMIN,STAFF',
        nextAllowedValues: ''
      })
    ]
  },
  {
    group: 'HO_SO_TYPE',
    items: [
      HOSO_ENUM_V2_item_('HO_SO_TYPE', { value: 'XA_VIEN', label: 'Xã viên', sort: 1, colorCode: 'BLUE', iconName: 'People' }),
      HOSO_ENUM_V2_item_('HO_SO_TYPE', { value: 'CHU_XE', label: 'Chủ xe', sort: 2, colorCode: 'BLUE', iconName: 'Person' }),
      HOSO_ENUM_V2_item_('HO_SO_TYPE', { value: 'TAI_XE', label: 'Tài xế', sort: 3, colorCode: 'BLUE', iconName: 'Car' }),
      HOSO_ENUM_V2_item_('HO_SO_TYPE', { value: 'PHUONG_TIEN', label: 'Phương tiện', sort: 4, colorCode: 'BLUE', iconName: 'DirectionsCar' }),
      HOSO_ENUM_V2_item_('HO_SO_TYPE', { value: 'HOP_DONG', label: 'Hợp đồng', sort: 5, colorCode: 'INDIGO', iconName: 'Description' }),
      HOSO_ENUM_V2_item_('HO_SO_TYPE', { value: 'GIAY_TO', label: 'Giấy tờ', sort: 6, colorCode: 'TEAL', iconName: 'Folder' })
    ]
  },
  {
    group: 'PRIORITY',
    items: [
      HOSO_ENUM_V2_item_('PRIORITY', { value: 'LOW', label: 'Thấp', sort: 1, colorCode: 'GRAY', iconName: 'ArrowDown' }),
      HOSO_ENUM_V2_item_('PRIORITY', { value: 'NORMAL', label: 'Bình thường', sort: 2, isDefault: true, colorCode: 'BLUE', iconName: 'Remove' }),
      HOSO_ENUM_V2_item_('PRIORITY', { value: 'HIGH', label: 'Cao', sort: 3, colorCode: 'ORANGE', iconName: 'ArrowUp' }),
      HOSO_ENUM_V2_item_('PRIORITY', { value: 'URGENT', label: 'Khẩn', sort: 4, colorCode: 'RED', iconName: 'PriorityHigh' })
    ]
  },
  {
    group: 'FILE_TYPE',
    items: [
      HOSO_ENUM_V2_item_('FILE_TYPE', { value: 'CCCD', label: 'Căn cước công dân', sort: 1 }),
      HOSO_ENUM_V2_item_('FILE_TYPE', { value: 'GPLX', label: 'Giấy phép lái xe', sort: 2 }),
      HOSO_ENUM_V2_item_('FILE_TYPE', { value: 'DANG_KY_XE', label: 'Đăng ký xe', sort: 3 }),
      HOSO_ENUM_V2_item_('FILE_TYPE', { value: 'DANG_KIEM', label: 'Đăng kiểm', sort: 4 }),
      HOSO_ENUM_V2_item_('FILE_TYPE', { value: 'BAO_HIEM', label: 'Bảo hiểm', sort: 5 }),
      HOSO_ENUM_V2_item_('FILE_TYPE', { value: 'PHU_HIEU', label: 'Phù hiệu', sort: 6 }),
      HOSO_ENUM_V2_item_('FILE_TYPE', { value: 'HOP_DONG', label: 'Hợp đồng', sort: 7 }),
      HOSO_ENUM_V2_item_('FILE_TYPE', { value: 'HOA_DON', label: 'Hóa đơn', sort: 8 }),
      HOSO_ENUM_V2_item_('FILE_TYPE', { value: 'KHAC', label: 'Khác', sort: 9 })
    ]
  },
  {
    group: 'FILE_STATUS',
    items: [
      HOSO_ENUM_V2_item_('FILE_STATUS', { value: 'UPLOADED', label: 'Đã tải lên', sort: 1, colorCode: 'BLUE', iconName: 'CloudUpload' }),
      HOSO_ENUM_V2_item_('FILE_STATUS', { value: 'CHECKING', label: 'Đang kiểm tra', sort: 2, colorCode: 'ORANGE', iconName: 'Search' }),
      HOSO_ENUM_V2_item_('FILE_STATUS', { value: 'VALID', label: 'Hợp lệ', sort: 3, colorCode: 'GREEN', iconName: 'Verified' }),
      HOSO_ENUM_V2_item_('FILE_STATUS', { value: 'INVALID', label: 'Không hợp lệ', sort: 4, colorCode: 'RED', iconName: 'Error' }),
      HOSO_ENUM_V2_item_('FILE_STATUS', { value: 'EXPIRED', label: 'Hết hạn', sort: 5, colorCode: 'RED', iconName: 'Schedule' })
    ]
  },
  {
    group: 'PRINT_STATUS',
    items: [
      HOSO_ENUM_V2_item_('PRINT_STATUS', { value: 'PENDING', label: 'Chờ in', sort: 1, colorCode: 'BLUE', iconName: 'Hourglass' }),
      HOSO_ENUM_V2_item_('PRINT_STATUS', { value: 'PROCESSING', label: 'Đang xử lý', sort: 2, colorCode: 'ORANGE', iconName: 'Sync' }),
      HOSO_ENUM_V2_item_('PRINT_STATUS', { value: 'DONE', label: 'Đã xong', sort: 3, colorCode: 'GREEN', iconName: 'Done' }),
      HOSO_ENUM_V2_item_('PRINT_STATUS', { value: 'ERROR', label: 'Lỗi', sort: 4, colorCode: 'RED', iconName: 'Error' }),
      HOSO_ENUM_V2_item_('PRINT_STATUS', { value: 'CANCELLED', label: 'Đã hủy', sort: 5, colorCode: 'GRAY', iconName: 'Cancel' })
    ]
  },
  {
    group: 'PRINT_JOB_TYPE',
    items: [
      HOSO_ENUM_V2_item_('PRINT_JOB_TYPE', { value: 'PRINT_HO_SO', label: 'In hồ sơ', sort: 1 }),
      HOSO_ENUM_V2_item_('PRINT_JOB_TYPE', { value: 'PRINT_THE_LAI_XE', label: 'In thẻ lái xe', sort: 2 }),
      HOSO_ENUM_V2_item_('PRINT_JOB_TYPE', { value: 'PRINT_PHIEU_TIEP_NHAN', label: 'In phiếu tiếp nhận', sort: 3 }),
      HOSO_ENUM_V2_item_('PRINT_JOB_TYPE', { value: 'EXPORT_PDF', label: 'Xuất PDF', sort: 4 })
    ]
  }
];

/**
 * @returns {string}
 */
function HOSO_EnumV2_nowIso_() {
  if (typeof cbvCoreV2IsoNow_ === 'function') {
    return cbvCoreV2IsoNow_();
  }
  try {
    return new Date().toISOString();
  } catch (e) {
    return String(new Date());
  }
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {Object<string, number>}
 */
function HOSO_EnumV2_readHeaderMap1Based_(sheet) {
  var map = {};
  var lr = sheet.getLastColumn();
  if (lr < 1) lr = 1;
  var row = sheet.getRange(1, 1, 1, lr).getValues()[0];
  var c;
  for (c = 0; c < row.length; c++) {
    var name = String(row[c] || '').trim();
    if (name) map[name] = c + 1;
  }
  return map;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string[]} required
 * @param {{ addedColumns: string[] }} [out]
 */
function HOSO_EnumV2_appendMissingHeaders_(sheet, required, out) {
  out = out || { addedColumns: [] };
  var map = HOSO_EnumV2_readHeaderMap1Based_(sheet);
  var need = [];
  var i;
  for (i = 0; i < required.length; i++) {
    var hn = String(required[i] || '').trim();
    if (!hn || map[hn]) continue;
    need.push(hn);
  }
  if (!need.length) return;

  var scanCols = Math.max(sheet.getLastColumn(), 1);
  try {
    var dr = sheet.getDataRange();
    if (dr && dr.getNumColumns() > scanCols) scanCols = dr.getNumColumns();
  } catch (e0) {
    /* ignore */
  }
  var row1 = sheet.getRange(1, 1, 1, scanCols).getValues()[0];
  var lastHeaderCol = 0;
  var c;
  for (c = 0; c < row1.length; c++) {
    if (String(row1[c] || '').trim() !== '') lastHeaderCol = c + 1;
  }
  if (lastHeaderCol < 1) {
    sheet.getRange(1, 1, 1, need.length).setValues([need]);
  } else {
    sheet.getRange(1, lastHeaderCol + 1, 1, need.length).setValues([need]);
  }
  for (i = 0; i < need.length; i++) {
    out.addedColumns.push(need[i]);
  }
}

/**
 * @param {Object<string, number>} colMap
 * @param {string} name
 * @returns {number}
 */
function HOSO_EnumV2_col_(colMap, name) {
  var n = colMap[String(name).trim()];
  return n != null ? n : 0;
}

/**
 * @param {*} v
 * @returns {boolean}
 */
function HOSO_EnumV2_isActiveCell_(v) {
  if (v === true || v === 1) return true;
  var s = String(v != null ? v : '').trim().toUpperCase();
  return s === 'TRUE' || s === 'YES' || s === 'Y' || s === '1';
}

/**
 * @param {string} roleCsv
 * @param {string} role
 * @returns {boolean}
 */
function HOSO_EnumV2_roleInList_(roleCsv, role) {
  var r = String(role || '').trim().toUpperCase();
  if (!r) return false;
  var parts = String(roleCsv || '').split(',');
  var i;
  for (i = 0; i < parts.length; i++) {
    if (String(parts[i] || '').trim().toUpperCase() === r) return true;
  }
  return false;
}

/**
 * @returns {Object}
 */
function HOSO_EnumV2_ensureSchema() {
  try {
    var dbId = String(HOSO_Config_getDbId_({ source: 'ENUM_V2' }) || '').trim();
    if (!dbId) {
      return { ok: false, code: 'HOSO_ENUM_V2_SCHEMA_ERROR', message: 'HOSO_CONFIG_DB_ID_MISSING', data: { addedColumns: [] } };
    }
    var ss = SpreadsheetApp.openById(dbId);
    var sheet = ss.getSheetByName('HO_SO_ENUM');
    if (!sheet) {
      sheet = ss.insertSheet('HO_SO_ENUM');
    }
    var out = { addedColumns: [] };
    HOSO_EnumV2_appendMissingHeaders_(sheet, HOSO_ENUM_V2_HEADERS_, out);
    var headerEmpty = true;
    var hm = HOSO_EnumV2_readHeaderMap1Based_(sheet);
    if (Object.keys(hm).length > 0) headerEmpty = false;
    if (headerEmpty) {
      sheet.getRange(1, 1, 1, HOSO_ENUM_V2_HEADERS_.length).setValues([HOSO_ENUM_V2_HEADERS_.slice()]);
    }
    return {
      ok: true,
      code: 'HOSO_ENUM_V2_SCHEMA_OK',
      message: 'HO_SO_ENUM schema OK',
      data: { sheet: 'HO_SO_ENUM', addedColumns: out.addedColumns }
    };
  } catch (e) {
    return {
      ok: false,
      code: 'HOSO_ENUM_V2_SCHEMA_ERROR',
      message: String(e && e.message ? e.message : e),
      data: { addedColumns: [] },
      error: String(e && e.stack ? e.stack : '')
    };
  }
}

/**
 * @param {string} group
 * @param {Object} it normalized item
 * @param {string} rowId
 * @param {string} now
 * @returns {Object<string, *>}
 */
function HOSO_EnumV2_valuesObject_(group, it, rowId, now) {
  return {
    ENUM_ID: rowId,
    ENUM_GROUP: group,
    ENUM_VALUE: it.value,
    ENUM_LABEL: it.label,
    SORT_ORDER: it.sort,
    IS_ACTIVE: it.isActive,
    NOTE: it.note,
    DISPLAY_LABEL: it.displayLabel,
    DESCRIPTION: it.description,
    ROLE_ALLOW: it.roleAllow,
    ROLE_DENY: it.roleDeny,
    COLOR_CODE: it.colorCode,
    ICON_NAME: it.iconName,
    IS_DEFAULT: it.isDefault,
    IS_SYSTEM: it.isSystem,
    PARENT_GROUP: it.parentGroup,
    PARENT_VALUE: it.parentValue,
    NEXT_ALLOWED_VALUES: it.nextAllowedValues,
    SHOW_IF_EXPR: it.showIfExpr,
    VALID_IF_EXPR: it.validIfExpr,
    UPDATED_AT: now
  };
}

/**
 * @param {Object<string, number>} colMap
 * @param {Object<string, *>} vals
 * @returns {Array}
 */
function HOSO_EnumV2_rowArrayFromVals_(colMap, vals) {
  var maxCol = 0;
  var k;
  for (k in colMap) {
    if (colMap[k] > maxCol) maxCol = colMap[k];
  }
  var row = [];
  var c;
  for (c = 0; c < maxCol; c++) {
    row.push('');
  }
  for (k in vals) {
    var col = colMap[k];
    if (col && col > 0) {
      row[col - 1] = vals[k];
    }
  }
  return row;
}

/**
 * @param {Array} a
 * @param {Array} b
 * @returns {boolean}
 */
function HOSO_EnumV2_rowEqual_(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  var i;
  for (i = 0; i < a.length; i++) {
    var x = a[i];
    var y = b[i];
    if (x === y) continue;
    if (x == y) continue;
    if (String(x) === String(y)) continue;
    if (typeof x === 'boolean' || typeof y === 'boolean') {
      if (!!x === !!y) continue;
    }
    return false;
  }
  return true;
}

/**
 * @returns {Object}
 */
function HOSO_EnumV2_syncAll() {
  var es = HOSO_EnumV2_ensureSchema();
  if (!es || !es.ok) {
    return {
      ok: false,
      code: 'HOSO_ENUM_V2_SYNC_ERROR',
      message: es && es.message ? es.message : 'ensureSchema failed',
      data: { inserted: 0, updated: 0, skipped: 0 }
    };
  }
  try {
    var dbId = String(HOSO_Config_getDbId_({ source: 'ENUM_V2' }) || '').trim();
    var ss = SpreadsheetApp.openById(dbId);
    var sheet = ss.getSheetByName('HO_SO_ENUM');
    var colMap = HOSO_EnumV2_readHeaderMap1Based_(sheet);
    var now = HOSO_EnumV2_nowIso_();
    var data = sheet.getDataRange().getValues();
    var keyToRow = {};
    var ri;
    for (ri = 1; ri < data.length; ri++) {
      var r = data[ri];
      var g0 = String(r[HOSO_EnumV2_col_(colMap, 'ENUM_GROUP') - 1] || '').trim();
      var v0 = String(r[HOSO_EnumV2_col_(colMap, 'ENUM_VALUE') - 1] || '').trim();
      if (!g0 || !v0) continue;
      keyToRow[g0 + '|' + v0] = ri + 1;
    }

    var inserted = 0;
    var updated = 0;
    var skipped = 0;
    var gi;
    var ii;
    for (gi = 0; gi < HOSO_ENUM_V2_DEFINITIONS_.length; gi++) {
      var grp = HOSO_ENUM_V2_DEFINITIONS_[gi];
      var items = grp.items || [];
      var gname = String(grp.group || '').trim();
      for (ii = 0; ii < items.length; ii++) {
        var raw = items[ii];
        var it = typeof raw.value !== 'undefined' ? raw : HOSO_ENUM_V2_item_(gname, raw);
        var key = gname + '|' + String(it.value || '').trim();
        var existingRow = keyToRow[key];
        var rowId = '';
        if (existingRow) {
          var idCol = HOSO_EnumV2_col_(colMap, 'ENUM_ID');
          if (idCol) {
            rowId = String(sheet.getRange(existingRow, idCol).getValue() || '').trim();
          }
        }
        if (!rowId) rowId = Utilities.getUuid();
        var vals = HOSO_EnumV2_valuesObject_(gname, it, rowId, now);
        var newRow = HOSO_EnumV2_rowArrayFromVals_(colMap, vals);
        if (existingRow) {
          var oldRow = sheet.getRange(existingRow, 1, 1, newRow.length).getValues()[0];
          if (HOSO_EnumV2_rowEqual_(oldRow, newRow)) {
            skipped++;
          } else {
            sheet.getRange(existingRow, 1, 1, newRow.length).setValues([newRow]);
            updated++;
          }
        } else {
          sheet.appendRow(newRow);
          inserted++;
          keyToRow[key] = sheet.getLastRow();
        }
      }
    }
    return {
      ok: true,
      code: 'HOSO_ENUM_V2_SYNC_OK',
      message: 'ENUM V2 synced',
      data: { inserted: inserted, updated: updated, skipped: skipped }
    };
  } catch (e2) {
    return {
      ok: false,
      code: 'HOSO_ENUM_V2_SYNC_ERROR',
      message: String(e2 && e2.message ? e2.message : e2),
      data: { inserted: 0, updated: 0, skipped: 0 },
      error: String(e2 && e2.stack ? e2.stack : '')
    };
  }
}

/**
 * @param {string} group
 * @param {string} value
 * @returns {string}
 */
function HOSO_EnumV2_getLabel(group, value) {
  try {
    var dbId = String(HOSO_Config_getDbId_({ source: 'ENUM_V2' }) || '').trim();
    if (!dbId) return '';
    var sheet = SpreadsheetApp.openById(dbId).getSheetByName('HO_SO_ENUM');
    if (!sheet) return '';
    var colMap = HOSO_EnumV2_readHeaderMap1Based_(sheet);
    var gCol = HOSO_EnumV2_col_(colMap, 'ENUM_GROUP');
    var vCol = HOSO_EnumV2_col_(colMap, 'ENUM_VALUE');
    var lCol = HOSO_EnumV2_col_(colMap, 'ENUM_LABEL');
    if (!gCol || !vCol || !lCol) return '';
    var data = sheet.getDataRange().getValues();
    var g = String(group || '').trim();
    var v = String(value || '').trim();
    var i;
    for (i = 1; i < data.length; i++) {
      var row = data[i];
      if (String(row[gCol - 1] || '').trim() === g && String(row[vCol - 1] || '').trim() === v) {
        return String(row[lCol - 1] || '').trim();
      }
    }
  } catch (e) {
    /* ignore */
  }
  return '';
}

/**
 * @param {string} group
 * @param {string} role
 * @returns {string[]}
 */
function HOSO_EnumV2_getValidValues(group, role) {
  var out = [];
  try {
    var dbId = String(HOSO_Config_getDbId_({ source: 'ENUM_V2' }) || '').trim();
    if (!dbId) return out;
    var sheet = SpreadsheetApp.openById(dbId).getSheetByName('HO_SO_ENUM');
    if (!sheet) return out;
    var colMap = HOSO_EnumV2_readHeaderMap1Based_(sheet);
    var gCol = HOSO_EnumV2_col_(colMap, 'ENUM_GROUP');
    var vCol = HOSO_EnumV2_col_(colMap, 'ENUM_VALUE');
    var aCol = HOSO_EnumV2_col_(colMap, 'IS_ACTIVE');
    var allowCol = HOSO_EnumV2_col_(colMap, 'ROLE_ALLOW');
    var denyCol = HOSO_EnumV2_col_(colMap, 'ROLE_DENY');
    var sCol = HOSO_EnumV2_col_(colMap, 'SORT_ORDER');
    if (!gCol || !vCol) return out;
    var data = sheet.getDataRange().getValues();
    var g = String(group || '').trim();
    var r = String(role || '').trim().toUpperCase();
    var i;
    var tmp = [];
    for (i = 1; i < data.length; i++) {
      var row = data[i];
      if (String(row[gCol - 1] || '').trim() !== g) continue;
      if (aCol && !HOSO_EnumV2_isActiveCell_(row[aCol - 1])) continue;
      var allow = allowCol ? String(row[allowCol - 1] || '').trim() : '';
      var deny = denyCol ? String(row[denyCol - 1] || '').trim() : '';
      if (allow && r && !HOSO_EnumV2_roleInList_(allow, r)) continue;
      if (r && deny && HOSO_EnumV2_roleInList_(deny, r)) continue;
      if (allow && !r) continue;
      var ev = String(row[vCol - 1] || '').trim();
      if (!ev) continue;
      var sortVal = sCol ? row[sCol - 1] : 0;
      tmp.push({ value: ev, sort: Number(sortVal) || 0 });
    }
    tmp.sort(function (a, b) {
      if (a.sort !== b.sort) return a.sort - b.sort;
      return a.value.localeCompare(b.value);
    });
    for (i = 0; i < tmp.length; i++) {
      out.push(tmp[i].value);
    }
  } catch (e) {
    /* ignore */
  }
  return out;
}

/**
 * @param {string} group
 * @param {string} currentValue
 * @returns {string[]}
 */
function HOSO_EnumV2_getNextAllowedValues(group, currentValue) {
  try {
    var dbId = String(HOSO_Config_getDbId_({ source: 'ENUM_V2' }) || '').trim();
    if (!dbId) return [];
    var sheet = SpreadsheetApp.openById(dbId).getSheetByName('HO_SO_ENUM');
    if (!sheet) return [];
    var colMap = HOSO_EnumV2_readHeaderMap1Based_(sheet);
    var gCol = HOSO_EnumV2_col_(colMap, 'ENUM_GROUP');
    var vCol = HOSO_EnumV2_col_(colMap, 'ENUM_VALUE');
    var nCol = HOSO_EnumV2_col_(colMap, 'NEXT_ALLOWED_VALUES');
    if (!gCol || !vCol || !nCol) return [];
    var data = sheet.getDataRange().getValues();
    var g = String(group || '').trim();
    var cv = String(currentValue || '').trim();
    var i;
    for (i = 1; i < data.length; i++) {
      var row = data[i];
      if (String(row[gCol - 1] || '').trim() === g && String(row[vCol - 1] || '').trim() === cv) {
        var raw = String(row[nCol - 1] || '').trim();
        if (!raw) return [];
        var parts = raw.split(',');
        var j;
        var res = [];
        for (j = 0; j < parts.length; j++) {
          var p = String(parts[j] || '').trim();
          if (p) res.push(p);
        }
        return res;
      }
    }
  } catch (e) {
    /* ignore */
  }
  return [];
}

/**
 * @returns {Object}
 */
function HOSO_EnumV2_healthCheck() {
  try {
    var dbId = String(HOSO_Config_getDbId_({ source: 'ENUM_V2' }) || '').trim();
    if (!dbId) {
      return {
        ok: false,
        code: 'HOSO_ENUM_V2_HEALTH_ERROR',
        message: 'HOSO_CONFIG_DB_ID_MISSING',
        data: {
          missingGroups: HOSO_ENUM_V2_REQUIRED_GROUPS_.slice(),
          missingLabels: [],
          duplicates: []
        }
      };
    }
    var sheet = SpreadsheetApp.openById(dbId).getSheetByName('HO_SO_ENUM');
    if (!sheet) {
      return {
        ok: false,
        code: 'HOSO_ENUM_V2_HEALTH_ERROR',
        message: 'HO_SO_ENUM missing',
        data: { missingGroups: HOSO_ENUM_V2_REQUIRED_GROUPS_.slice(), missingLabels: [], duplicates: [] }
      };
    }
    var colMap = HOSO_EnumV2_readHeaderMap1Based_(sheet);
    var gCol = HOSO_EnumV2_col_(colMap, 'ENUM_GROUP');
    var vCol = HOSO_EnumV2_col_(colMap, 'ENUM_VALUE');
    var lCol = HOSO_EnumV2_col_(colMap, 'ENUM_LABEL');
    var data = sheet.getDataRange().getValues();
    var seen = {};
    var duplicates = [];
    var missingLabels = [];
    var groupCounts = {};
    var i;
    for (i = 0; i < HOSO_ENUM_V2_REQUIRED_GROUPS_.length; i++) {
      groupCounts[HOSO_ENUM_V2_REQUIRED_GROUPS_[i]] = 0;
    }
    for (i = 1; i < data.length; i++) {
      var row = data[i];
      var eg = gCol ? String(row[gCol - 1] || '').trim() : '';
      var ev = vCol ? String(row[vCol - 1] || '').trim() : '';
      if (!eg && !ev) continue;
      if (eg && groupCounts[eg] != null) groupCounts[eg]++;
      if (eg && ev) {
        var k = eg + '|' + ev;
        if (seen[k]) {
          duplicates.push({ row: i + 1, group: eg, value: ev });
        } else {
          seen[k] = i + 1;
        }
      }
      if (eg && ev && lCol) {
        var lab = String(row[lCol - 1] || '').trim();
        if (!lab) missingLabels.push({ row: i + 1, group: eg, value: ev });
      }
    }
    var missingGroups = [];
    for (i = 0; i < HOSO_ENUM_V2_REQUIRED_GROUPS_.length; i++) {
      var gn = HOSO_ENUM_V2_REQUIRED_GROUPS_[i];
      if (!groupCounts[gn]) missingGroups.push(gn);
    }
    var ok =
      missingGroups.length === 0 &&
      duplicates.length === 0 &&
      missingLabels.length === 0;
    return {
      ok: ok,
      code: ok ? 'HOSO_ENUM_V2_HEALTH_OK' : 'HOSO_ENUM_V2_HEALTH_DEGRADED',
      message: ok ? 'OK' : 'ENUM health degraded',
      data: {
        dbId: dbId,
        missingGroups: missingGroups,
        missingLabels: missingLabels,
        duplicates: duplicates
      }
    };
  } catch (e) {
    return {
      ok: false,
      code: 'HOSO_ENUM_V2_HEALTH_ERROR',
      message: String(e && e.message ? e.message : e),
      data: { missingGroups: [], missingLabels: [], duplicates: [] },
      error: String(e && e.stack ? e.stack : '')
    };
  }
}