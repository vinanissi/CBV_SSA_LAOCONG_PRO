/**
 * HO_SO V2 — print job (no PDF render in this phase).
 */

/**
 * @param {string} templateCode
 * @returns {boolean}
 */
function hoSoV2TemplateExists_(templateCode) {
  var sh = hoSoV2GetSheet_('TEMPLATE');
  if (!sh) return false;
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var c = map['TEMPLATE_CODE'];
  var st = map['STATUS'];
  if (!c) return false;
  var last = sh.getLastRow();
  if (last < 2) return false;
  var codes = sh.getRange(2, c, last, c).getValues();
  var i;
  var tc = String(templateCode).trim();
  for (i = 0; i < codes.length; i++) {
    if (String(codes[i][0]).trim() === tc) {
      if (st) {
        var s = String(sh.getRange(i + 2, st).getValue() || '').toUpperCase();
        if (s && s !== 'ACTIVE' && s !== '') return false;
      }
      return true;
    }
  }
  return false;
}

/**
 * @param {Object} command
 * @returns {Object}
 */
function HoSoV2_Print_createPrintJob(command) {
  var p = (command && command.payload) || {};
  var hoSoId = p.hoSoId != null ? String(p.hoSoId).trim() : '';
  var templateCode = p.templateCode != null ? String(p.templateCode).trim() : '';
  if (!hoSoId) {
    return { ok: false, entityType: 'PRINT_JOB', entityId: '', message: 'hoSoId required', data: {}, error: { code: 'VALIDATION', message: 'hoSoId required' } };
  }
  if (!templateCode) {
    return { ok: false, entityType: 'PRINT_JOB', entityId: '', message: 'templateCode required', data: {}, error: { code: 'VALIDATION', message: 'templateCode required' } };
  }

  hoSoV2EnsureSheet_('MASTER', 'MASTER');
  hoSoV2EnsureSheet_('PRINT_JOB', 'PRINT_JOB');
  hoSoV2EnsureSheet_('TEMPLATE', 'TEMPLATE');

  var m = hoSoV2GetSheet_('MASTER');
  if (hoSoV2FindRowByColumn_(m, 'HO_SO_ID', hoSoId) < 2) {
    return { ok: false, entityType: 'HO_SO', entityId: hoSoId, message: 'HO_SO not found', data: {}, error: { code: 'NOT_FOUND', message: 'HO_SO not found' } };
  }

  var tplOk = hoSoV2TemplateExists_(templateCode);
  var status = HO_SO_V2.PRINT_JOB_STATUS.PENDING;
  if (!tplOk && HO_SO_V2.PRINT_ALLOW_PENDING_WITHOUT_TEMPLATE) {
    status = HO_SO_V2.PRINT_JOB_STATUS.PENDING_TEMPLATE;
  } else if (!tplOk) {
    status = HO_SO_V2.PRINT_JOB_STATUS.PENDING_TEMPLATE;
  }

  var jobId = hoSoV2NewId_(HO_SO_V2.ID_PREFIX.PRINT_JOB);
  var now = cbvCoreV2IsoNow_();
  var payloadOverride = p.payloadOverride != null ? p.payloadOverride : {};

  hoSoV2AppendRow_(hoSoV2GetSheet_('PRINT_JOB'), {
    PRINT_JOB_ID: jobId,
    HO_SO_ID: hoSoId,
    TEMPLATE_CODE: templateCode,
    STATUS: status,
    OUTPUT_FILE_ID: '',
    OUTPUT_FILE_URL: '',
    OUTPUT_PDF_URL: '',
    ERROR_CODE: '',
    ERROR_MESSAGE: '',
    CREATED_AT: now,
    CREATED_BY: command.requestBy || cbvUser(),
    FINISHED_AT: '',
    PAYLOAD_JSON: cbvCoreV2SafeStringify_(payloadOverride)
  });

  CBV_CoreV2_emitEvent({
    eventType: 'HOSO_PRINT_REQUESTED',
    moduleCode: 'HOSO',
    entityType: 'HO_SO',
    entityId: hoSoId,
    sourceCommandId: command.commandId || '',
    payload: { printJobId: jobId, templateCode: templateCode, status: status },
    createdBy: command.requestBy || cbvUser()
  });

  return {
    ok: true,
    entityType: 'PRINT_JOB',
    entityId: jobId,
    message: 'Print job created',
    data: { printJobId: jobId, hoSoId: hoSoId, status: status, templateFound: tplOk },
    error: null
  };
}
