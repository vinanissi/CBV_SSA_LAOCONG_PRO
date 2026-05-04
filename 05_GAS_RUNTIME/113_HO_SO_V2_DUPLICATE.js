/**
 * HO_SO V2 — duplicate detection before create.
 */

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} col
 * @param {string} value
 * @param {string} statusCol
 * @returns {boolean} true if duplicate active
 */
function hoSoV2ColumnValueExistsActive_(sheet, col, value, statusCol) {
  if (!value || String(value).trim() === '') return false;
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var c = map[col];
  var sc = map[statusCol];
  if (!c || !sc) return false;
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var n = last - 1;
  var vals = sheet.getRange(2, c, last, c).getValues();
  var sts = sheet.getRange(2, sc, last, sc).getValues();
  var i;
  var v = String(value).trim();
  for (i = 0; i < n; i++) {
    if (String(vals[i][0]).trim() === v) {
      var st = String(sts[i][0] || '').toUpperCase();
      if (st !== HO_SO_V2.HO_SO_STATUS.CANCELLED && st !== HO_SO_V2.ENTITY_STATUS.CANCELLED) {
        return true;
      }
    }
  }
  return false;
}

/**
 * @param {Object} normalizedPayload from validation
 * @returns {{ ok: boolean, code?: string, message?: string, duplicates?: Array }}
 */
function HoSoV2_Duplicate_checkCreate(normalizedPayload) {
  hoSoV2EnsureSheet_('PHUONG_TIEN', 'PHUONG_TIEN');
  hoSoV2EnsureSheet_('XA_VIEN', 'XA_VIEN');
  hoSoV2EnsureSheet_('TAI_XE', 'TAI_XE');

  var dups = [];
  var ptSheet = hoSoV2GetSheet_('PHUONG_TIEN');
  var xvSheet = hoSoV2GetSheet_('XA_VIEN');

  var pt = normalizedPayload.phuongTien;
  if (pt && pt.bienSo && hoSoV2ColumnValueExistsActive_(ptSheet, 'BIEN_SO', pt.bienSo, 'STATUS')) {
    dups.push({ field: 'phuongTien.bienSo', value: pt.bienSo });
  }
  if (pt && pt.soKhung && String(pt.soKhung).trim() !== '' &&
      hoSoV2ColumnValueExistsActive_(ptSheet, 'SO_KHUNG', pt.soKhung, 'STATUS')) {
    dups.push({ field: 'phuongTien.soKhung', value: pt.soKhung });
  }
  if (pt && pt.soMay && String(pt.soMay).trim() !== '' &&
      hoSoV2ColumnValueExistsActive_(ptSheet, 'SO_MAY', pt.soMay, 'STATUS')) {
    dups.push({ field: 'phuongTien.soMay', value: pt.soMay });
  }

  var xa = normalizedPayload.xaVien;
  if (xa && xa.cccd && String(xa.cccd).trim() !== '' &&
      hoSoV2ColumnValueExistsActive_(xvSheet, 'CCCD', xa.cccd, 'STATUS')) {
    dups.push({ field: 'xaVien.cccd', value: xa.cccd });
  }

  if (dups.length) {
    return {
      ok: false,
      code: 'DUPLICATE_FOUND',
      message: 'Trùng dữ liệu: ' + dups.map(function(d) { return d.field; }).join(', '),
      duplicates: dups
    };
  }
  return { ok: true };
}
