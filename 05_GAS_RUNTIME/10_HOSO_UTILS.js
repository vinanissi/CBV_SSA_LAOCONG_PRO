/**
 * HO_SO utilities — code generation, dates, soft-delete filter.
 * Dependencies: 00_CORE_UTILS, 03_SHARED_ROW_READER (optional)
 */

/** @param {Object} masterCodeRow - MASTER_CODE row */
function hosoCodeSlugFromMasterRow(masterCodeRow) {
  var code = String(masterCodeRow && masterCodeRow.CODE || '').trim();
  if (!code) return 'GEN';
  var parts = code.split('_');
  var s = '';
  for (var i = 0; i < parts.length && s.length < 4; i++) {
    if (parts[i]) s += parts[i].charAt(0);
  }
  s = s.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (s.length < 2) {
    s = code.replace(/[^A-Z0-9]/gi, '').substring(0, 6).toUpperCase() || 'GEN';
  }
  return s.substring(0, 6);
}

/**
 * @deprecated Prefer hosoRepoNextHoSoCode (repository-only sheet access).
 * Kept for backward compatibility; delegates to repository when available.
 */
function hosoGenerateHoSoCode(hoSoTypeMasterId) {
  if (typeof hosoRepoNextHoSoCode === 'function') return hosoRepoNextHoSoCode(hoSoTypeMasterId);
  return 'HS-GEN-000001';
}

/** @param {Object} r */
function hosoIsRowDeleted(r) {
  var d = r && r.IS_DELETED;
  return d === true || String(d).toLowerCase() === 'true';
}

/** @param {Object[]} rows */
function hosoFilterActiveRows(rows) {
  if (!rows || !rows.length) return [];
  return rows.filter(function(r) { return !hosoIsRowDeleted(r); });
}

/** @param {Date|string|number} d */
function hosoParseDate(d) {
  if (d == null || d === '') return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  var t = new Date(d);
  return isNaN(t.getTime()) ? null : t;
}

/** @param {Date} a @param {Date} b */
function hosoStartOfDay(a) {
  var x = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  return x;
}
