/**
 * CBV Shared File Helper - Path recommendations for attachment storage.
 * Does NOT create folders or move files. AppSheet handles uploads.
 * Use for documentation and optional path hints only.
 */

/**
 * Returns recommended folder path for HO_SO files.
 * @param {string} hoSoType - HO_SO_TYPE (HTX, XA_VIEN, XE, TAI_XE); empty uses MISC
 * @param {string} hoSoId - Optional ho so ID for entity-specific subfolder
 * @returns {string} Recommended path, e.g. "CBV_STORAGE/01_HO_SO/HTX/"
 */
function buildHoSoStoragePath(hoSoType, hoSoId) {
  var base = 'CBV_STORAGE/01_HO_SO/';
  var typeFolder = (hoSoType || 'MISC').toUpperCase();
  if (hoSoId) return base + typeFolder + '/' + hoSoId + '/';
  return base + typeFolder + '/';
}

/**
 * Returns recommended folder path for TASK attachments.
 * @param {string} taskId - Optional task ID for entity-specific subfolder
 * @returns {string} Recommended path, e.g. "CBV_STORAGE/02_TASK_ATTACHMENTS/"
 */
function buildTaskStoragePath(taskId) {
  var base = 'CBV_STORAGE/02_TASK_ATTACHMENTS/';
  if (taskId) return base + taskId + '/';
  return base;
}

/**
 * Returns recommended folder path for FINANCE evidence.
 * @param {string} financeId - Optional finance transaction ID for entity-specific subfolder
 * @returns {string} Recommended path, e.g. "CBV_STORAGE/03_FINANCE_EVIDENCE/"
 */
function buildFinanceStoragePath(financeId) {
  var base = 'CBV_STORAGE/03_FINANCE_EVIDENCE/';
  if (financeId) return base + financeId + '/';
  return base;
}
