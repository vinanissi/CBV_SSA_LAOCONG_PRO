function _sheet(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(name);
  cbvAssert(sheet, 'Missing sheet: ' + name);
  return sheet;
}

function _headers(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

/** Uses readNormalizedRows when 03_SHARED_ROW_READER is loaded; otherwise raw read with blank-filter fallback. */
function _rows(sheet) {
  if (typeof readNormalizedRows === 'function') {
    return readNormalizedRows(sheet, sheet ? sheet.getName() : '');
  }
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol === 0) return [];
  var headers = _headers(sheet);
  var raw = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var rowObjs = raw.map(function(row, idx) {
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

function _findById(sheetName, id) {
  const sheet = _sheet(sheetName);
  const rows = _rows(sheet);
  return rows.find(function(r) { return String(r.ID) === String(id); }) || null;
}

function _appendRecord(sheetName, record) {
  const sheet = _sheet(sheetName);
  const headers = _headers(sheet);
  const row = headers.map(function(h) { return record[h] !== undefined ? record[h] : ''; });
  sheet.appendRow(row);
}

function _updateRow(sheetName, rowNumber, patch) {
  const sheet = _sheet(sheetName);
  const headers = _headers(sheet);
  const range = sheet.getRange(rowNumber, 1, 1, headers.length);
  const values = range.getValues()[0];
  headers.forEach(function(h, i) {
    if (patch[h] !== undefined) values[i] = patch[h];
  });
  range.setValues([values]);
}
