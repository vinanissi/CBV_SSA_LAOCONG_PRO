/**
 * Unit tests tối thiểu — validatePhuongTien (mock rowsOverride, không cần sheet).
 * Chạy: runPhuongTienPlateValidationTests() trong Apps Script editor.
 */

function runPhuongTienPlateValidationTests() {
  var mockRows = [
    { ID: 'HPT_EXIST_1', HTX_ID: 'HTX_MOCK', PLATE_NO: '51A-123.45', IS_DELETED: false },
    { ID: 'HPT_OTHER_HTX', HTX_ID: 'HTX_OTHER', PLATE_NO: '51A-123.45', IS_DELETED: false },
    { ID: 'HPT_DELETED', HTX_ID: 'HTX_MOCK', PLATE_NO: '99U99999', IS_DELETED: true }
  ];

  // Case 1: biển số chưa tồn tại cùng HTX → pass
  validatePhuongTien({
    plateNo: '30K88888',
    htxId: 'HTX_MOCK',
    rowsOverride: mockRows
  });

  // Case 2: trùng biển (normalize space/case) cùng HTX → throw
  var caught = '';
  try {
    validatePhuongTien({
      plateNo: '51a 12345',
      htxId: 'HTX_MOCK',
      rowsOverride: mockRows
    });
  } catch (e) {
    caught = e.message || String(e);
  }
  if (caught.indexOf('đã tồn tại') === -1) {
    throw new Error('runPhuongTienPlateValidationTests: expected duplicate plate error, got: ' + caught);
  }

  return { ok: true, message: 'runPhuongTienPlateValidationTests: PASS (insert new OK, duplicate throws)' };
}
