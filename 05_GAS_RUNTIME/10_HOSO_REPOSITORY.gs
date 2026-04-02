/**
 * HO_SO Repository — only layer that reads/writes HO_SO sheets.
 * Dependencies: 03_SHARED_REPOSITORY, 00_CORE_CONFIG
 */

function hosoRepoSheet(name) {
  return typeof _sheet === 'function' ? _sheet(name) : SpreadsheetApp.getActive().getSheetByName(name);
}

function hosoRepoHeaders(name) {
  return typeof _headers === 'function' ? _headers(hosoRepoSheet(name)) : [];
}

function hosoRepoRows(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return [];
  return typeof _rows === 'function' ? _rows(sh) : [];
}

function hosoRepoLoadSafe(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return { headers: [], rows: [], rowCount: 0 };
  return typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sh, name) : { headers: hosoRepoHeaders(name), rows: hosoRepoRows(name), rowCount: hosoRepoRows(name).length };
}

function hosoRepoFindMasterById(id) {
  return typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.HO_SO_MASTER, id) : null;
}

function hosoRepoFindMasterByCode(code) {
  var rows = hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER);
  var c = String(code || '').trim();
  return rows.find(function(r) { return String(r.HO_SO_CODE || '').trim() === c; }) || null;
}

function hosoRepoAppend(name, record) {
  if (typeof _appendRecord === 'function') _appendRecord(name, record);
}

function hosoRepoUpdate(name, rowNumber, patch) {
  if (typeof _updateRow === 'function') _updateRow(name, rowNumber, patch);
}

function hosoRepoListFilesForHoso(hosoId) {
  return hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_FILE).filter(function(r) {
    return String(r.HO_SO_ID) === String(hosoId);
  });
}

function hosoRepoListRelationsForHoso(hosoId) {
  return hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_RELATION).filter(function(r) {
    return String(r.HO_SO_ID) === String(hosoId);
  });
}

function hosoRepoListLogsForHoso(hosoId) {
  return hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_UPDATE_LOG).filter(function(r) {
    return String(r.HO_SO_ID) === String(hosoId);
  });
}

function hosoRepoMaxSeqForHoSoPrefix_(prefix, rows) {
  var maxNum = 0;
  var esc = String(prefix).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var re = new RegExp('^' + esc + '(\\d{6})$');
  (rows || []).forEach(function(r) {
    var c = String(r.HO_SO_CODE || '').trim();
    var m = c.match(re);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  });
  return maxNum;
}

/**
 * Next HO_SO_CODE for type: HS-{slug}-{6 digits} from max existing with same prefix.
 * @param {string} hoSoTypeMasterId MASTER_CODE.ID (group HO_SO_TYPE)
 * @returns {string}
 */
function hosoRepoNextHoSoCode(hoSoTypeMasterId) {
  var mc = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.MASTER_CODE, hoSoTypeMasterId) : null;
  var slug = typeof hosoCodeSlugFromMasterRow === 'function' ? hosoCodeSlugFromMasterRow(mc) : 'GEN';
  var prefix = 'HS-' + slug + '-';
  var loaded = hosoRepoLoadSafe(CBV_CONFIG.SHEETS.HO_SO_MASTER);
  var rows = loaded && loaded.rows ? loaded.rows : [];
  var maxNum = hosoRepoMaxSeqForHoSoPrefix_(prefix, rows);
  return prefix + ('000000' + (maxNum + 1)).slice(-6);
}

/**
 * Allocate a code not present in HO_SO_MASTER.HO_SO_CODE (handles dup data / race).
 * @param {string} hoSoTypeMasterId
 * @param {number} maxAttempts
 * @returns {string}
 */
function hosoRepoAllocateHoSoCode(hoSoTypeMasterId, maxAttempts) {
  var mc = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.MASTER_CODE, hoSoTypeMasterId) : null;
  var slug = typeof hosoCodeSlugFromMasterRow === 'function' ? hosoCodeSlugFromMasterRow(mc) : 'GEN';
  var prefix = 'HS-' + slug + '-';
  var loaded = hosoRepoLoadSafe(CBV_CONFIG.SHEETS.HO_SO_MASTER);
  var rows = loaded && loaded.rows ? loaded.rows : [];
  var maxNum = hosoRepoMaxSeqForHoSoPrefix_(prefix, rows);
  var limit = maxAttempts != null ? maxAttempts : 80;
  for (var k = 1; k <= limit; k++) {
    var code = prefix + ('000000' + (maxNum + k)).slice(-6);
    if (!hosoRepoFindMasterByCode(code)) return code;
  }
  var suffix = typeof cbvMakeId === 'function' ? cbvMakeId('HS') : String(Date.now());
  return prefix + ('000000' + (maxNum + limit + 1)).slice(-6) + '-' + suffix.replace(/[^A-Z0-9]/gi, '').slice(-6);
}

function hosoRepoFindFileById(fileId) {
  var rows = hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_FILE);
  return rows.find(function(r) { return String(r.ID || '').trim() === String(fileId || '').trim(); }) || null;
}

function hosoRepoFindRelationById(relationId) {
  var rows = hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_RELATION);
  return rows.find(function(r) { return String(r.ID || '').trim() === String(relationId || '').trim(); }) || null;
}
