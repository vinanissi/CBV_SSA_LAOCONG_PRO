/**
 * HO_SO V2 — attachment.
 */

/**
 * @param {Object} command
 * @returns {Object} handler-shaped result
 */
function HoSoV2_Attachment_attachFile(command) {
  var p = (command && command.payload) || {};
  var hoSoId = p.hoSoId != null ? String(p.hoSoId).trim() : '';
  if (!hoSoId) {
    return { ok: false, entityType: 'HO_SO', entityId: '', message: 'hoSoId required', data: {}, error: { code: 'VALIDATION', message: 'hoSoId required' } };
  }

  hoSoV2EnsureSheet_('MASTER', 'MASTER');
  hoSoV2EnsureSheet_('ATTACHMENT', 'ATTACHMENT');
  var m = hoSoV2GetSheet_('MASTER');
  var mr = hoSoV2FindRowByColumn_(m, 'HO_SO_ID', hoSoId);
  if (mr < 2) {
    return { ok: false, entityType: 'HO_SO', entityId: hoSoId, message: 'HO_SO not found', data: {}, error: { code: 'NOT_FOUND', message: 'HO_SO not found' } };
  }

  var attId = hoSoV2NewId_(HO_SO_V2.ID_PREFIX.ATTACHMENT);
  var now = cbvCoreV2IsoNow_();
  var sh = hoSoV2GetSheet_('ATTACHMENT');
  hoSoV2AppendRow_(sh, {
    ATTACHMENT_ID: attId,
    HO_SO_ID: hoSoId,
    ENTITY_TYPE: p.entityType != null ? String(p.entityType) : 'HO_SO',
    ENTITY_ID: p.entityId != null ? String(p.entityId) : hoSoId,
    FILE_TYPE: p.fileType != null ? String(p.fileType) : 'FILE',
    FILE_NAME: p.fileName != null ? String(p.fileName) : '',
    FILE_URL: p.fileUrl != null ? String(p.fileUrl) : '',
    DRIVE_FILE_ID: p.driveFileId != null ? String(p.driveFileId) : '',
    MIME_TYPE: p.mimeType != null ? String(p.mimeType) : '',
    STATUS: HO_SO_V2.ATTACHMENT_STATUS.ACTIVE,
    CREATED_AT: now,
    CREATED_BY: command.requestBy || cbvUser(),
    NOTE: p.note != null ? String(p.note) : '',
    META_JSON: ''
  });

  CBV_CoreV2_logAudit({
    moduleCode: 'HOSO',
    entityType: 'ATTACHMENT',
    entityId: attId,
    action: 'ATTACH_FILE',
    fieldName: 'FILE_NAME',
    oldValue: '',
    newValue: p.fileName != null ? String(p.fileName) : '',
    actorEmail: command.requestBy || cbvUser(),
    source: command.source || '',
    commandId: command.commandId || ''
  });

  CBV_CoreV2_emitEvent({
    eventType: 'HOSO_ATTACHMENT_ADDED',
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    sourceCommandId: command.commandId || '',
    payload: { attachmentId: attId, fileName: p.fileName },
    createdBy: command.requestBy || cbvUser()
  });

  HoSoV2_Search_rebuildForHoSo(hoSoId);

  CBV_CoreV2_emitEvent({
    eventType: 'HOSO_SEARCH_INDEX_UPDATED',
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    sourceCommandId: command.commandId || '',
    payload: { reason: 'ATTACHMENT' },
    createdBy: command.requestBy || cbvUser()
  });

  return {
    ok: true,
    entityType: 'ATTACHMENT',
    entityId: attId,
    message: 'Đã gắn file',
    data: { attachmentId: attId, hoSoId: hoSoId },
    error: null
  };
}
