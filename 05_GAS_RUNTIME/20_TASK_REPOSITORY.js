/**
 * CBV Task Repository - Low-level sheet operations for TASK tables.
 * No business logic. All mutations go through this layer or 20_TASK_SERVICE.
 * Dependencies: 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY
 */

/**
 * @param {string} taskId
 * @returns {Object|null} Task row or null
 */
function taskFindById(taskId) {
  return typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.TASK_MAIN, taskId) : null;
}

/**
 * @param {string} taskId
 * @returns {Object[]} Checklist items for task (non-deleted)
 */
function taskGetChecklistItems(taskId) {
  var sheet = typeof _sheet === 'function' ? _sheet(CBV_CONFIG.SHEETS.TASK_CHECKLIST) : null;
  if (!sheet) return [];
  var rows = typeof _rows === 'function' ? _rows(sheet) : [];
  return rows.filter(function(r) {
    return String(r.TASK_ID) === String(taskId) && String(r.IS_DELETED) !== 'true' && r.IS_DELETED !== true;
  });
}

/**
 * @param {string} checklistId
 * @returns {Object|null}
 */
function taskFindChecklistById(checklistId) {
  var sheet = typeof _sheet === 'function' ? _sheet(CBV_CONFIG.SHEETS.TASK_CHECKLIST) : null;
  if (!sheet) return null;
  var rows = typeof _rows === 'function' ? _rows(sheet) : [];
  return rows.find(function(r) { return String(r.ID) === String(checklistId); }) || null;
}

/**
 * @param {string} donViId
 * @returns {Object|null} DON_VI row
 */
function donViFindById(donViId) {
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.DON_VI) ? CBV_CONFIG.SHEETS.DON_VI : 'DON_VI';
  return typeof _findById === 'function' ? _findById(sheetName, donViId) : null;
}

/**
 * @param {string} donViOrLegacyId
 * @returns {Object|null} DON_VI row (PRO: organizational unit; legacy name kept for callers)
 */
function taskFindHtxById(donViOrLegacyId) {
  return typeof donViFindById === 'function' ? donViFindById(donViOrLegacyId) : null;
}

/**
 * Appends task record. Uses schema from 90_BOOTSTRAP_SCHEMA / schema_manifest.
 * @param {Object} record
 */
function taskAppendMain(record) {
  if (typeof _appendRecord === 'function') _appendRecord(CBV_CONFIG.SHEETS.TASK_MAIN, record);
}

/**
 * Updates task row by row number.
 * @param {number} rowNumber
 * @param {Object} patch
 */
function taskUpdateMain(rowNumber, patch) {
  if (typeof _updateRow === 'function') _updateRow(CBV_CONFIG.SHEETS.TASK_MAIN, rowNumber, patch);
}

/**
 * Appends checklist record.
 * @param {Object} record
 */
function taskAppendChecklist(record) {
  if (typeof _appendRecord === 'function') _appendRecord(CBV_CONFIG.SHEETS.TASK_CHECKLIST, record);
}

/**
 * Updates checklist row.
 * @param {number} rowNumber
 * @param {Object} patch
 */
function taskUpdateChecklist(rowNumber, patch) {
  if (typeof _updateRow === 'function') _updateRow(CBV_CONFIG.SHEETS.TASK_CHECKLIST, rowNumber, patch);
}

/**
 * Appends attachment record.
 * @param {Object} record
 */
function taskAppendAttachment(record) {
  if (typeof _appendRecord === 'function') _appendRecord(CBV_CONFIG.SHEETS.TASK_ATTACHMENT, record);
}

/**
 * @param {string} attachmentId
 * @returns {Object|null}
 */
function taskFindAttachmentById(attachmentId) {
  return typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.TASK_ATTACHMENT, attachmentId) : null;
}

/**
 * @param {number} rowNumber
 * @param {Object} patch
 */
function taskUpdateAttachment(rowNumber, patch) {
  if (typeof _updateRow === 'function') _updateRow(CBV_CONFIG.SHEETS.TASK_ATTACHMENT, rowNumber, patch);
}

/**
 * Appends update log record.
 * @param {Object} record
 */
function taskAppendUpdateLog(record) {
  if (typeof _appendRecord === 'function') _appendRecord(CBV_CONFIG.SHEETS.TASK_UPDATE_LOG, record);
}
