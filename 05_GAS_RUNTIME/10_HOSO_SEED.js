/**
 * HO_SO Seed — MASTER_CODE (HO_SO_TYPE) + optional demo HO_SO_MASTER row.
 * Idempotent: skip existing CODE in MASTER_GROUP HO_SO_TYPE.
 */

var HOSO_TYPE_MASTER_ROWS = [
  { CODE: 'HOP_DONG', NAME: 'Hợp đồng', DISPLAY_TEXT: 'Hợp đồng', SORT_ORDER: 1 },
  { CODE: 'GIAY_TO_CA_NHAN', NAME: 'Giấy tờ cá nhân', DISPLAY_TEXT: 'Giấy tờ cá nhân', SORT_ORDER: 2 },
  { CODE: 'HO_SO_XA_VIEN', NAME: 'Hồ sơ xã viên', DISPLAY_TEXT: 'Hồ sơ xã viên', SORT_ORDER: 3 },
  { CODE: 'HO_SO_TAI_XE', NAME: 'Hồ sơ tài xế', DISPLAY_TEXT: 'Hồ sơ tài xế', SORT_ORDER: 4 },
  { CODE: 'HO_SO_PHUONG_TIEN', NAME: 'Hồ sơ phương tiện', DISPLAY_TEXT: 'Hồ sơ phương tiện', SORT_ORDER: 5 },
  { CODE: 'BIEN_BAN', NAME: 'Biên bản', DISPLAY_TEXT: 'Biên bản', SORT_ORDER: 6 },
  { CODE: 'DON_DE_NGHI', NAME: 'Đơn đề nghị', DISPLAY_TEXT: 'Đơn đề nghị', SORT_ORDER: 7 },
  { CODE: 'HO_SO_PHAP_LY', NAME: 'Hồ sơ pháp lý', DISPLAY_TEXT: 'Hồ sơ pháp lý', SORT_ORDER: 8 },
  { CODE: 'KHAC', NAME: 'Khác', DISPLAY_TEXT: 'Khác', SORT_ORDER: 99 }
];

function seedHosoMasterData_() {
  var added = 0;
  var now = cbvNow();
  var user = cbvUser();
  if (!SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.MASTER_CODE)) {
    return { ok: false, message: 'MASTER_CODE missing', added: 0 };
  }
  var existing = {};
  (typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE) : []).forEach(function(row) {
    if (String(row.MASTER_GROUP || '').trim() === HOSO_MASTER_GROUP_TYPE) {
      existing[String(row.CODE || '').trim()] = true;
    }
  });

  HOSO_TYPE_MASTER_ROWS.forEach(function(spec) {
    if (existing[spec.CODE]) return;
    var rec = {
      ID: cbvMakeId('MC'),
      MASTER_GROUP: HOSO_MASTER_GROUP_TYPE,
      CODE: spec.CODE,
      NAME: spec.NAME,
      DISPLAY_TEXT: spec.DISPLAY_TEXT || spec.NAME,
      STATUS: 'ACTIVE',
      SORT_ORDER: spec.SORT_ORDER,
      IS_SYSTEM: true,
      ALLOW_EDIT: true,
      NOTE: 'HO_SO PRO seed',
      CREATED_AT: now,
      CREATED_BY: user,
      UPDATED_AT: now,
      UPDATED_BY: user,
      IS_DELETED: false
    };
    if (typeof _appendRecord === 'function') _appendRecord(CBV_CONFIG.SHEETS.MASTER_CODE, rec);
    added++;
    existing[spec.CODE] = true;
  });

  if (typeof clearEnumCache === 'function') clearEnumCache();
  return { ok: true, added: added, message: 'HO_SO_TYPE master rows ensured' };
}

/**
 * Optional demo row — skipped if any row titled DEMO_HOSO_PRO exists
 */
function seedHosoDemoData_() {
  var mrows = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER) : [];
  if (mrows.some(function(r) { return String(r.TITLE || '') === 'DEMO_HOSO_PRO'; })) {
    return { ok: true, skipped: true, message: 'Demo already present' };
  }
  var types = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE).filter(function(r) {
    return String(r.MASTER_GROUP || '') === HOSO_MASTER_GROUP_TYPE && String(r.STATUS || '') === 'ACTIVE';
  }) : [];
  var typeId = types.length ? types[0].ID : '';
  if (!typeId) return { ok: false, message: 'No HO_SO_TYPE in MASTER_CODE; run seedHosoMasterData_ first' };

  return createHoso({
    HO_SO_TYPE_ID: typeId,
    TITLE: 'DEMO_HOSO_PRO',
    DISPLAY_NAME: 'Demo hồ sơ PRO',
    STATUS: 'NEW',
    SUMMARY: 'Seeded by seedHosoDemoData_'
  });
}
