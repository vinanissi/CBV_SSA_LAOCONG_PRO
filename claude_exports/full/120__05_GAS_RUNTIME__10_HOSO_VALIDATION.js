/**
 * HO_SO Validation — no sheet I/O.
 * Dependencies: 03_SHARED_VALIDATION, 01_ENUM paths (assertValidEnumValue), 03_SHARED_REPOSITORY
 */

function hosoResolveActorId() {
  var email = String(typeof cbvUser === 'function' ? cbvUser() : '').trim().toLowerCase();
  if (!email || email === 'system') return '';
  var rows = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.USER_DIRECTORY) : [];
  var found = rows.find(function(r) { return String(r.EMAIL || '').trim().toLowerCase() === email; });
  return found ? String(found.ID) : '';
}

function hosoValidateTypeMasterId(id, fieldName) {
  ensureRequired(id, fieldName || 'HO_SO_TYPE_ID');
  var row = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.MASTER_CODE, id) : null;
  if (!row) throw new Error('Invalid HO_SO_TYPE_ID: not found in MASTER_CODE');
  if (String(row.MASTER_GROUP || '').trim() !== HOSO_MASTER_GROUP_TYPE) {
    throw new Error('HO_SO_TYPE_ID must reference MASTER_CODE with MASTER_GROUP=HO_SO_TYPE');
  }
  if (String(row.STATUS || '').trim() !== 'ACTIVE') throw new Error('HO_SO_TYPE master row must be STATUS=ACTIVE');
}

function hosoValidateOptionalRefDonVi(donViId) {
  if (donViId == null || String(donViId).trim() === '') return;
  var row = typeof donViFindById === 'function' ? donViFindById(String(donViId).trim()) : null;
  if (!row) throw new Error('Invalid DON_VI_ID');
}

function hosoValidateOptionalRefUser(userId) {
  if (userId == null || String(userId).trim() === '') return;
  var row = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.USER_DIRECTORY, String(userId).trim()) : null;
  if (!row) throw new Error('Invalid user reference (OWNER_ID / MANAGER_USER_ID / ACTOR_ID)');
}

function hosoAssertEnum(groupKey, value, fieldName) {
  if (value == null || String(value).trim() === '') return;
  var g = HOSO_ENUM_GROUPS[groupKey] || groupKey;
  if (typeof assertValidEnumValue === 'function') assertValidEnumValue(g, value, fieldName);
}

function hosoValidateStatusTransition(oldStatus, newStatus) {
  ensureTransition(String(oldStatus || ''), String(newStatus || ''), HOSO_STATUS_TRANSITIONS);
}

function hosoValidateDateOrder(start, end) {
  var s = typeof hosoParseDate === 'function' ? hosoParseDate(start) : null;
  var e = typeof hosoParseDate === 'function' ? hosoParseDate(end) : null;
  if (s && e && e < s) throw new Error('END_DATE must be on or after START_DATE');
}

/**
 * Validates RELATED_TABLE + RELATED_RECORD_ID against a real parent row (ref-safe).
 */
function hosoValidateRelationTarget(relatedTable, relatedRecordId) {
  ensureRequired(relatedTable, 'RELATED_TABLE');
  ensureRequired(relatedRecordId, 'RELATED_RECORD_ID');
  var key = String(relatedTable).trim().toUpperCase();
  var map = typeof HOSO_RELATION_TABLE_TO_SHEET !== 'undefined' ? HOSO_RELATION_TABLE_TO_SHEET : {};
  var sheetKey = map[key];
  if (!sheetKey) throw new Error('RELATED_TABLE not allowed: ' + relatedTable + '. Use one of: ' + Object.keys(map).join(', '));
  var sheetName = CBV_CONFIG.SHEETS[sheetKey] || sheetKey;
  var rid = String(relatedRecordId).trim();
  var row = typeof _findById === 'function' ? _findById(sheetName, rid) : null;
  if (!row) throw new Error('RELATED_RECORD_ID not found in ' + sheetName);
  if (typeof hosoIsRowDeleted === 'function' && hosoIsRowDeleted(row)) throw new Error('Related record is deleted: ' + sheetName + ' ' + rid);
}

function hosoNormalizePhone(p) {
  if (p == null) return '';
  return String(p).replace(/\s+/g, ' ').trim();
}

function hosoNormalizeEmail(e) {
  if (e == null) return '';
  return String(e).trim().toLowerCase();
}

function hosoNormalizeIdNo(n) {
  if (n == null) return '';
  return String(n).replace(/\s+/g, '').trim();
}

var HOSO_LOGGABLE_FIELDS = ['TITLE', 'DISPLAY_NAME', 'DON_VI_ID', 'OWNER_ID', 'MANAGER_USER_ID', 'FULL_NAME', 'PHONE', 'EMAIL', 'END_DATE', 'START_DATE', 'PRIORITY', 'SOURCE_CHANNEL', 'SUMMARY'];
