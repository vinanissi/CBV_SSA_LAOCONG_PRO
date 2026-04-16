/**
 * HO_SO_DETAIL_PHUONG_TIEN — chi tiết phương tiện; PLATE_NO unique theo HTX_ID (GAS).
 * Dependencies: 00_CORE_CONFIG, 03_SHARED_REPOSITORY, 03_SHARED_VALIDATION, 00_CORE_UTILS,
 *               10_HOSO_REPOSITORY (hosoRepoAppend/Update), 10_HOSO_SERVICE (stamp helpers).
 */

function phuongTienNormalizePlate_(plateNo) {
  if (plateNo == null) return '';
  return String(plateNo).replace(/\s+/g, '').toUpperCase();
}

function phuongTienRowIsDeleted_(r) {
  return r.IS_DELETED === true || String(r.IS_DELETED).toLowerCase() === 'true';
}

function phuongTienLoadRows_(rowsOverride) {
  if (rowsOverride && rowsOverride.length >= 0) return rowsOverride;
  var name = CBV_CONFIG.SHEETS.HO_SO_DETAIL_PHUONG_TIEN;
  if (typeof hosoRepoRows === 'function') return hosoRepoRows(name) || [];
  if (typeof _sheet === 'function' && typeof _rows === 'function') {
    try {
      return _rows(_sheet(name));
    } catch (e) {
      return [];
    }
  }
  return [];
}

/**
 * Trước khi insert/update: kiểm tra PLATE_NO không trùng trong cùng HTX (IS_DELETED = FALSE).
 * @param {Object} opts
 * @param {string} opts.plateNo
 * @param {string} opts.htxId
 * @param {string} [opts.excludeId] — ID bản ghi đang sửa (update)
 * @param {Array<Object>} [opts.rowsOverride] — mock rows (unit test / không đọc sheet)
 */
function validatePhuongTien(opts) {
  opts = opts || {};
  ensureRequired(opts.plateNo, 'PLATE_NO');
  ensureRequired(opts.htxId, 'HTX_ID');
  var htxKey = String(opts.htxId).trim();
  var plateNorm = phuongTienNormalizePlate_(opts.plateNo);
  if (!plateNorm) throw new Error('PLATE_NO is invalid');
  var excludeId = opts.excludeId != null ? String(opts.excludeId).trim() : '';
  var rows = phuongTienLoadRows_(opts.rowsOverride);
  var displayPlate = String(opts.plateNo).trim();
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (phuongTienRowIsDeleted_(r)) continue;
    if (String(r.HTX_ID || '').trim() !== htxKey) continue;
    if (excludeId && String(r.ID || '').trim() === excludeId) continue;
    if (phuongTienNormalizePlate_(r.PLATE_NO) === plateNorm) {
      throw new Error('Biển số ' + displayPlate + ' đã tồn tại trong HTX này.');
    }
  }
}

/**
 * @param {Object} data — HO_SO_ID, HTX_ID, PLATE_NO; optional VEHICLE_TYPE_ID, VIN, CAPACITY_TON, NOTE
 * @returns {Object} cbvResponse
 */
function createPhuongTien(data) {
  data = data || {};
  ensureRequired(data.HO_SO_ID, 'HO_SO_ID');
  ensureRequired(data.HTX_ID, 'HTX_ID');
  ensureRequired(data.PLATE_NO, 'PLATE_NO');
  validatePhuongTien({ plateNo: data.PLATE_NO, htxId: data.HTX_ID });

  var stamp = typeof hosoStampCreate === 'function' ? hosoStampCreate() : { CREATED_AT: new Date(), CREATED_BY: '', UPDATED_AT: new Date(), UPDATED_BY: '' };
  var id = typeof cbvMakeId === 'function' ? cbvMakeId('HPT') : ('HPT_' + String(Date.now()));
  var record = {
    ID: id,
    HO_SO_ID: String(data.HO_SO_ID).trim(),
    HTX_ID: String(data.HTX_ID).trim(),
    PLATE_NO: String(data.PLATE_NO).trim(),
    VEHICLE_TYPE_ID: data.VEHICLE_TYPE_ID != null && String(data.VEHICLE_TYPE_ID).trim() !== '' ? String(data.VEHICLE_TYPE_ID).trim() : '',
    VIN: data.VIN != null ? String(data.VIN) : '',
    CAPACITY_TON: data.CAPACITY_TON !== undefined && data.CAPACITY_TON !== null && String(data.CAPACITY_TON) !== '' ? data.CAPACITY_TON : '',
    NOTE: data.NOTE != null ? String(data.NOTE) : '',
    IS_DELETED: false
  };
  Object.assign(record, stamp);

  var sheet = CBV_CONFIG.SHEETS.HO_SO_DETAIL_PHUONG_TIEN;
  if (typeof hosoRepoAppend === 'function') {
    hosoRepoAppend(sheet, record);
  } else {
    _appendRecord(sheet, record);
  }
  return cbvResponse(true, 'PHUONG_TIEN_CREATED', 'Đã tạo chi tiết phương tiện', record, []);
}

/**
 * @param {string} id
 * @param {Object} patch — optional: PLATE_NO, HTX_ID, HO_SO_ID, VEHICLE_TYPE_ID, VIN, CAPACITY_TON, NOTE
 * @returns {Object} cbvResponse
 */
function updatePhuongTien(id, patch) {
  patch = patch || {};
  var sheet = CBV_CONFIG.SHEETS.HO_SO_DETAIL_PHUONG_TIEN;
  var row = typeof _findById === 'function' ? _findById(sheet, id) : null;
  cbvAssert(row, 'HO_SO_DETAIL_PHUONG_TIEN not found');

  var nextPlate = patch.PLATE_NO !== undefined ? patch.PLATE_NO : row.PLATE_NO;
  var nextHtx = patch.HTX_ID !== undefined ? patch.HTX_ID : row.HTX_ID;
  validatePhuongTien({
    plateNo: nextPlate,
    htxId: nextHtx,
    excludeId: id
  });

  var upd = {};
  ['HO_SO_ID', 'HTX_ID', 'PLATE_NO', 'VEHICLE_TYPE_ID', 'VIN', 'CAPACITY_TON', 'NOTE'].forEach(function(k) {
    if (patch[k] !== undefined) {
      if (k === 'CAPACITY_TON') upd[k] = patch[k];
      else upd[k] = patch[k] != null ? String(patch[k]) : '';
    }
  });
  Object.assign(upd, typeof hosoStampUpdate === 'function' ? hosoStampUpdate() : {});

  if (typeof hosoRepoUpdate === 'function') {
    hosoRepoUpdate(sheet, row._rowNumber, upd);
  } else {
    _updateRow(sheet, row._rowNumber, upd);
  }

  var merged = Object.assign({}, row, upd);
  return cbvResponse(true, 'PHUONG_TIEN_UPDATED', 'Đã cập nhật chi tiết phương tiện', merged, []);
}
