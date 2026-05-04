/**
 * HO_SO_V2 — auto seed/sync HO_SO_ENUM (legacy 7-column sync). Prefer ENUM V2: 221_HOSO_ENUM_CONTROL_V2.js.
 * Dependencies: 180 (HOSO_Config_getDbId_). Sheet HO_SO_ENUM created by 210 schema ensure.
 */

const HOSO_ENUM_DEFINITIONS_ = [
  {
    group: 'HO_SO_STATUS',
    items: [
      { value: 'NEW', label: 'Mới', sort: 1 },
      { value: 'IN_PROGRESS', label: 'Đang xử lý', sort: 2 },
      { value: 'WAITING', label: 'Chờ xử lý', sort: 3 },
      { value: 'DONE', label: 'Hoàn thành', sort: 4 },
      { value: 'CANCELLED', label: 'Đã hủy', sort: 5 }
    ]
  },
  {
    group: 'HO_SO_TYPE',
    items: [
      { value: 'XA_VIEN', label: 'Xã viên', sort: 1 },
      { value: 'CHU_XE', label: 'Chủ xe', sort: 2 },
      { value: 'TAI_XE', label: 'Tài xế', sort: 3 },
      { value: 'PHUONG_TIEN', label: 'Phương tiện', sort: 4 }
    ]
  },
  {
    group: 'FILE_TYPE',
    items: [
      { value: 'CCCD', label: 'Căn cước công dân', sort: 1 },
      { value: 'DANG_KY_XE', label: 'Đăng ký xe', sort: 2 },
      { value: 'BAO_HIEM', label: 'Bảo hiểm', sort: 3 },
      { value: 'PHU_HIEU', label: 'Phù hiệu', sort: 4 }
    ]
  },
  {
    group: 'PRINT_STATUS',
    items: [
      { value: 'PENDING', label: 'Chờ in', sort: 1 },
      { value: 'RUNNING', label: 'Đang xử lý', sort: 2 },
      { value: 'DONE', label: 'Đã xong', sort: 3 },
      { value: 'ERROR', label: 'Lỗi', sort: 4 }
    ]
  }
];

/**
 * Idempotent sync: upsert labels/sort for known codes; append missing rows.
 * Does not delete rows; existing rows only get ENUM_LABEL + SORT_ORDER updated.
 * @returns {Object}
 */
function HOSO_Enum_syncAll() {
  try {
    var dbId = String(HOSO_Config_getDbId_({ source: 'ENUM_AUTO' }) || '').trim();
    if (!dbId) {
      return { ok: false, code: 'HOSO_ENUM_SYNC_ERROR', message: 'HOSO_CONFIG_DB_ID_MISSING' };
    }
    var ss = SpreadsheetApp.openById(dbId);
    var sheet = ss.getSheetByName('HO_SO_ENUM');
    if (!sheet) {
      return { ok: false, code: 'HOSO_ENUM_SYNC_ERROR', message: 'HO_SO_ENUM sheet not found' };
    }

    var headers = [
      'ENUM_ID',
      'ENUM_GROUP',
      'ENUM_VALUE',
      'ENUM_LABEL',
      'SORT_ORDER',
      'IS_ACTIVE',
      'NOTE'
    ];

    var hdrs = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    var headerEmpty = true;
    var h;
    for (h = 0; h < hdrs.length; h++) {
      if (String(hdrs[h] || '').trim() !== '') {
        headerEmpty = false;
        break;
      }
    }
    if (headerEmpty) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    var data = sheet.getDataRange().getValues();
    var map = {};
    var i;
    for (i = 1; i < data.length; i++) {
      var row = data[i];
      var key = String(row[1] || '').trim() + '|' + String(row[2] || '').trim();
      if (!key || key === '|') continue;
      map[key] = i + 1;
    }

    var inserted = 0;
    var updated = 0;
    var gi;
    var ii;
    for (gi = 0; gi < HOSO_ENUM_DEFINITIONS_.length; gi++) {
      var grp = HOSO_ENUM_DEFINITIONS_[gi];
      var items = grp.items || [];
      for (ii = 0; ii < items.length; ii++) {
        var item = items[ii];
        var key2 = String(grp.group || '').trim() + '|' + String(item.value || '').trim();
        var rowNum = map[key2];
        if (rowNum) {
          sheet.getRange(rowNum, 4).setValue(item.label);
          sheet.getRange(rowNum, 5).setValue(item.sort);
          updated++;
        } else {
          sheet.appendRow([
            Utilities.getUuid(),
            String(grp.group || '').trim(),
            String(item.value || '').trim(),
            item.label,
            item.sort,
            true,
            ''
          ]);
          inserted++;
        }
      }
    }

    return {
      ok: true,
      code: 'HOSO_ENUM_SYNC_OK',
      message: 'ENUM synced',
      data: { inserted: inserted, updated: updated }
    };
  } catch (e) {
    return {
      ok: false,
      code: 'HOSO_ENUM_SYNC_ERROR',
      message: String(e && e.message ? e.message : e),
      error: String(e && e.stack ? e.stack : '')
    };
  }
}

/**
 * Menu entry — HO_SO WEBAPP → Sync ENUM.
 */
function HOSO_Menu_syncEnum() {
  var res = HOSO_Enum_syncAll();
  SpreadsheetApp.getUi().alert(JSON.stringify(res, null, 2));
}
