/**
 * HO_SO V2 — LEGACY STUB (pilot phase). HoSoCommandHandler_handle không còn gọi file này; logic thật: 114–118.
 * Dependencies: 01_CBV_CORE_V2_UTILS.js, 00_CORE_UTILS.js
 */

/**
 * @param {Object} command normalized Core V2 command
 * @param {Object} payload
 * @returns {Object} handler-shaped result (ok, entityType, entityId, message, data, error)
 */
function hosoV2StubHoSoCreate_(command, payload) {
  var id = typeof cbvMakeId === 'function' ? cbvMakeId('HS') : cbvCoreV2NewCommandId_('HS');
  return {
    ok: true,
    entityType: 'HO_SO',
    entityId: id,
    message: 'Stub: HO_SO_CREATE (no sheet write)',
    data: { stub: true, received: payload || {} },
    error: null
  };
}

/**
 * @param {Object} command
 * @param {Object} payload
 * @returns {Object}
 */
function hosoV2StubHoSoUpdate_(command, payload) {
  var id = (payload && payload.id) ? String(payload.id) : (typeof cbvMakeId === 'function' ? cbvMakeId('HS') : cbvCoreV2NewCommandId_('HS'));
  return {
    ok: true,
    entityType: 'HO_SO',
    entityId: id,
    message: 'Stub: HO_SO_UPDATE',
    data: { stub: true, patch: payload || {} },
    error: null
  };
}

/**
 * @param {Object} command
 * @param {Object} payload
 * @returns {Object}
 */
function hosoV2StubHoSoImportBatch_(command, payload) {
  var n = payload && payload.rows != null ? Number(payload.rows) : 0;
  return {
    ok: true,
    entityType: 'HO_SO',
    entityId: 'BATCH_' + cbvCoreV2NewCommandId_('IMP'),
    message: 'Stub: HO_SO_IMPORT_BATCH',
    data: { stub: true, rowCount: n },
    error: null
  };
}

/**
 * @param {Object} command
 * @param {Object} payload
 * @returns {Object}
 */
function hosoV2StubHoSoSearch_(command, payload) {
  return {
    ok: true,
    entityType: 'HO_SO',
    entityId: '',
    message: 'Stub: HO_SO_SEARCH',
    data: { stub: true, results: [], query: payload || {} },
    error: null
  };
}

/**
 * @param {Object} command
 * @param {Object} payload
 * @returns {Object}
 */
function hosoV2StubHoSoPrint_(command, payload) {
  var id = (payload && payload.id) ? String(payload.id) : (typeof cbvMakeId === 'function' ? cbvMakeId('HS') : cbvCoreV2NewCommandId_('HS'));
  return {
    ok: true,
    entityType: 'HO_SO',
    entityId: id,
    message: 'Stub: HO_SO_PRINT',
    data: { stub: true, template: (payload && payload.template) || 'default' },
    error: null
  };
}

/**
 * @param {Object} command
 * @param {Object} payload
 * @returns {Object}
 */
function hosoV2StubHoSoAttachFile_(command, payload) {
  var id = (payload && payload.hoSoId) ? String(payload.hoSoId) : (typeof cbvMakeId === 'function' ? cbvMakeId('HS') : cbvCoreV2NewCommandId_('HS'));
  return {
    ok: true,
    entityType: 'HO_SO',
    entityId: id,
    message: 'Stub: HO_SO_ATTACH_FILE',
    data: { stub: true, file: (payload && payload.fileName) || '' },
    error: null
  };
}

/**
 * @param {Object} command
 * @param {Object} payload
 * @returns {Object}
 */
function hosoV2StubHoSoChangeStatus_(command, payload) {
  var id = (payload && payload.id) ? String(payload.id) : (typeof cbvMakeId === 'function' ? cbvMakeId('HS') : cbvCoreV2NewCommandId_('HS'));
  return {
    ok: true,
    entityType: 'HO_SO',
    entityId: id,
    message: 'Stub: HO_SO_CHANGE_STATUS',
    data: { stub: true, newStatus: (payload && payload.status) || 'ACTIVE' },
    error: null
  };
}
