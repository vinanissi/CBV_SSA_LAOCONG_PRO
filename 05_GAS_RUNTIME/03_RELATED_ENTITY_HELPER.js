/**
 * Polymorphic RELATED_ENTITY_TYPE / RELATED_ENTITY_ID.
 * Canonical type codes: MASTER_CODE với MASTER_GROUP = ENTITY_TYPE (seed: HO_SO, TASK, DON_VI).
 * Whitelist is not hardcoded here — isValidMasterCode('ENTITY_TYPE', code) reads live MASTER_CODE.
 * See 06_DATABASE/schema_column_notes.json → _polymorphic_fk.
 * Dependencies: 00_CORE_CONFIG, 02_MASTER_CODE_SERVICE, 03_SHARED_REPOSITORY
 */

/**
 * @param {*} type - MASTER_CODE.CODE (group ENTITY_TYPE), hoặc rỗng / NONE
 * @param {string} [fieldName]
 */
function assertValidRelatedEntityType(type, fieldName) {
  var t = String(type || '').trim();
  if (!t || t === 'NONE') return;
  if (typeof isValidMasterCode === 'function' && isValidMasterCode('ENTITY_TYPE', t)) return;
  throw new Error((fieldName || 'RELATED_ENTITY_TYPE') + ' không hợp lệ: ' + t + ' (MASTER_CODE, MASTER_GROUP=ENTITY_TYPE).');
}

/**
 * Load bản ghi đích theo cặp (type, id). type là CODE trong MASTER_CODE (ENTITY_TYPE).
 * @param {string} type
 * @param {string} id
 * @returns {Object|null}
 */
function getRelatedEntity(type, id) {
  if (type == null || String(type).trim() === '' || String(type).trim() === 'NONE') return null;
  if (id == null || String(id).trim() === '') return null;
  assertValidRelatedEntityType(type, 'RELATED_ENTITY_TYPE');
  var t = String(type).trim();
  var sheetKey = { HO_SO: 'HO_SO_MASTER', TASK: 'TASK_MAIN', DON_VI: 'DON_VI' }[t];
  cbvAssert(sheetKey, 'getRelatedEntity: không map được type → sheet: ' + t);
  var sheetName = CBV_CONFIG.SHEETS[sheetKey] || sheetKey;
  return typeof _findById === 'function' ? _findById(sheetName, id) : null;
}
