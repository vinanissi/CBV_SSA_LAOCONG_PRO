/**
 * HOSO — Core V2 command handler (config-driven DB). Canonical: HosoCommandHandler_handle.
 * ENTRY_HANDLER trong CBV_MODULE_REGISTRY: HosoCommandHandler_handle
 * Backward: HoSoCommandHandler_handle → alias.
 */

/**
 * @param {Object} command Core V2 normalized command (commandType đã canonical HOSO_*)
 * @returns {Object}
 */
function HosoCommandHandler_handle(command) {
  hoSoV2SetRuntimeSource_(command && command.source);
  try {
    var p = command && command.payload != null ? command.payload : {};
    var cmd = String(command.commandType || '');

    switch (cmd) {
    case 'HOSO_CREATE':
      return HosoService_create(command);
    case 'HOSO_UPDATE':
      return HosoService_update(command);
    case 'HOSO_GET_DETAIL':
      return HosoService_getDetail(command);
    case 'HOSO_CHANGE_STATUS':
      return HosoService_changeStatus(command);
    case 'HOSO_IMPORT_BATCH':
      return HoSoV2_Import_importBatch(command);
    case 'HOSO_SEARCH': {
      var sr = HoSoV2_Search_search(p);
      return {
        ok: sr.ok !== false,
        entityType: 'HO_SO',
        entityId: '',
        message: sr.message || 'OK',
        data: { results: sr.results || [], keywordNormalized: sr.keywordNormalized },
        error: null
      };
    }
    case 'HOSO_ATTACH_FILE':
      return HoSoV2_Attachment_attachFile(command);
    case 'HOSO_PRINT':
      return HoSoV2_Print_createPrintJob(command);
    case 'HOSO_REBUILD_SEARCH_INDEX':
      return HosoService_rebuildSearchIndex(command);
    case 'HOSO_HEALTH_CHECK': {
      var h = HoSoV2_Health_check();
      return {
        ok: !!h.ok,
        entityType: 'HO_SO',
        entityId: '',
        message: h.message || '',
        data: h.data || {},
        error: h.error || null
      };
    }
    default:
      return {
        ok: false,
        entityType: 'HO_SO',
        entityId: '',
        message: 'Unknown commandType: ' + cmd,
        data: {},
        error: { code: CBV_CORE_V2.ERROR_CODES.VALIDATION_ERROR, message: 'UNKNOWN_COMMAND_TYPE' }
      };
    }
  } finally {
    hoSoV2SetRuntimeSource_('HOSO_SERVICE');
  }
}

/**
 * @param {Object} command
 * @returns {Object}
 */
function HoSoCommandHandler_handle(command) {
  return HosoCommandHandler_handle(command);
}
