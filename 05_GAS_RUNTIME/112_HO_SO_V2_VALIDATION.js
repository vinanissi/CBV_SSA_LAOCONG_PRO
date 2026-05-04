/**
 * HO_SO V2 — validation for create (no throw).
 */

/**
 * @param {string} s
 * @returns {string}
 */
function hoSoV2NormalizeCccd_(s) {
  if (s == null) return '';
  return String(s).replace(/\s+/g, '').trim();
}

/**
 * @param {string} s
 * @returns {string}
 */
function hoSoV2NormalizePhone_(s) {
  if (s == null) return '';
  return String(s).replace(/[^\d+]/g, '').trim();
}

/**
 * @param {*} p
 * @returns {Object|null}
 */
function hoSoV2PickXaVien_(p) {
  if (!p || !p.xaVien) return null;
  var x = p.xaVien;
  return {
    hoTen: x.hoTen != null ? String(x.hoTen).trim() : '',
    namSinh: x.namSinh != null ? String(x.namSinh).trim() : '',
    cccd: hoSoV2NormalizeCccd_(x.cccd),
    cccdNgayCap: x.cccdNgayCap != null ? String(x.cccdNgayCap).trim() : '',
    cccdNoiCap: x.cccdNoiCap != null ? String(x.cccdNoiCap).trim() : '',
    diaChi: x.diaChi != null ? String(x.diaChi).trim() : '',
    phone1: hoSoV2NormalizePhone_(x.phone1),
    phone2: hoSoV2NormalizePhone_(x.phone2),
    email: x.email != null ? String(x.email).trim() : '',
    nguoiDaiDien: x.nguoiDaiDien != null ? String(x.nguoiDaiDien).trim() : ''
  };
}

/**
 * @param {*} p
 * @returns {Object|null}
 */
function hoSoV2PickPhuongTien_(p) {
  if (!p || !p.phuongTien) return null;
  var x = p.phuongTien;
  return {
    bienSo: x.bienSo != null ? String(x.bienSo).trim().toUpperCase() : '',
    loaiXe: x.loaiXe != null ? String(x.loaiXe).trim() : '',
    hieuXe: x.hieuXe != null ? String(x.hieuXe).trim() : '',
    soLoai: x.soLoai != null ? String(x.soLoai).trim() : '',
    mauXe: x.mauXe != null ? String(x.mauXe).trim() : '',
    namSanXuat: x.namSanXuat != null ? String(x.namSanXuat).trim() : '',
    nuocSanXuat: x.nuocSanXuat != null ? String(x.nuocSanXuat).trim() : '',
    soChoTaiTrong: x.soChoTaiTrong != null ? String(x.soChoTaiTrong).trim() : '',
    soKhung: x.soKhung != null ? String(x.soKhung).trim().toUpperCase() : '',
    soMay: x.soMay != null ? String(x.soMay).trim().toUpperCase() : '',
    gpsWeb: x.gpsWeb != null ? String(x.gpsWeb).trim() : '',
    gpsUser: x.gpsUser != null ? String(x.gpsUser).trim() : '',
    gpsPass: x.gpsPass != null ? String(x.gpsPass).trim() : ''
  };
}

/**
 * @param {*} p
 * @returns {Object|null}
 */
function hoSoV2PickTaiXe_(p) {
  if (!p || !p.taiXe) return null;
  var x = p.taiXe;
  return {
    hoTen: x.hoTen != null ? String(x.hoTen).trim() : '',
    cccd: hoSoV2NormalizeCccd_(x.cccd),
    phone: hoSoV2NormalizePhone_(x.phone),
    gplxSo: x.gplxSo != null ? String(x.gplxSo).trim() : '',
    gplxHang: x.gplxHang != null ? String(x.gplxHang).trim() : '',
    gplxNgayCap: x.gplxNgayCap != null ? String(x.gplxNgayCap).trim() : '',
    gplxNoiCap: x.gplxNoiCap != null ? String(x.gplxNoiCap).trim() : '',
    diaChi: x.diaChi != null ? String(x.diaChi).trim() : ''
  };
}

/**
 * @param {*} p
 * @returns {Array}
 */
function hoSoV2PickGiayTo_(p) {
  if (!p || !Array.isArray(p.giayTo)) return [];
  var out = [];
  var i;
  for (i = 0; i < p.giayTo.length; i++) {
    var g = p.giayTo[i] || {};
    out.push({
      entityType: g.entityType != null ? String(g.entityType).trim() : 'HO_SO',
      docType: g.docType != null ? String(g.docType).trim() : '',
      docNo: g.docNo != null ? String(g.docNo).trim() : '',
      issueDate: g.issueDate != null ? String(g.issueDate).trim() : '',
      expireDate: g.expireDate != null ? String(g.expireDate).trim() : '',
      fileUrl: g.fileUrl != null ? String(g.fileUrl).trim() : '',
      note: g.note != null ? String(g.note).trim() : ''
    });
  }
  return out;
}

/**
 * @param {*} payload
 * @returns {{ ok: boolean, errors: Array, warnings: Array, normalizedPayload: Object }}
 */
function HoSoV2_Validation_validateCreate(payload) {
  var errors = [];
  var warnings = [];
  var p = payload || {};

  var xa = hoSoV2PickXaVien_(p);
  var pt = hoSoV2PickPhuongTien_(p);
  var tx = hoSoV2PickTaiXe_(p);
  var hasXa = xa && (xa.hoTen || xa.cccd || xa.phone1);
  var hasPt = pt && (pt.bienSo || pt.soKhung || pt.soMay);
  var hasTx = tx && (tx.hoTen || tx.cccd || tx.phone);

  if (!hasXa && !hasPt && !hasTx) {
    errors.push({ code: 'INVALID', message: 'Thiếu xaVien, phuongTien và taiXe', field: '' });
  }

  if (hasPt && (!pt.bienSo || String(pt.bienSo).trim() === '')) {
    errors.push({ code: 'BIEN_SO_REQUIRED', message: 'Biển số bắt buộc khi có phương tiện', field: 'phuongTien.bienSo' });
  }

  if (hasXa && (!xa.hoTen || String(xa.hoTen).trim() === '')) {
    errors.push({ code: 'HO_TEN_REQUIRED', message: 'Họ tên xã viên bắt buộc', field: 'xaVien.hoTen' });
  }

  var hoSoType = p.hoSoType != null ? String(p.hoSoType).trim().toUpperCase() : 'OTHER';
  var title = p.title != null ? String(p.title).trim() : '';
  var ownerEmail = p.ownerEmail != null ? String(p.ownerEmail).trim() : '';

  if (!title) {
    var parts = [];
    if (hasPt && pt.bienSo) parts.push(pt.bienSo);
    if (hasXa && xa.hoTen) parts.push(xa.hoTen);
    title = parts.length ? parts.join(' — ') : 'Hồ sơ ' + hoSoType;
    if (!title) title = 'Hồ sơ (chưa đặt tên)';
  }

  var normalizedPayload = {
    hoSoType: hoSoType,
    title: title,
    ownerEmail: ownerEmail,
    note: p.note != null ? String(p.note) : '',
    meta: p.meta != null ? p.meta : {},
    xaVien: hasXa ? xa : null,
    phuongTien: hasPt ? pt : null,
    taiXe: hasTx ? tx : null,
    giayTo: hoSoV2PickGiayTo_(p)
  };

  return {
    ok: errors.length === 0,
    errors: errors,
    warnings: warnings,
    normalizedPayload: normalizedPayload
  };
}
