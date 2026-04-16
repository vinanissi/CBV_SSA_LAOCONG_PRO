/**
 * HO_SO module — sheet registry (PRO).
 * Dependencies: 00_CORE_CONFIG, 90_BOOTSTRAP_SCHEMA (getSchemaHeaders)
 */

/** @returns {string[]} HO_SO business tables in bootstrap order */
function hosoGetTableNames() {
  return [
    CBV_CONFIG.SHEETS.HO_SO_MASTER,
    CBV_CONFIG.SHEETS.HO_SO_FILE,
    CBV_CONFIG.SHEETS.HO_SO_RELATION,
    CBV_CONFIG.SHEETS.HO_SO_UPDATE_LOG
  ];
}
