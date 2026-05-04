/**
 * HO_SO V2 — import batch (per-row create, row log, no stop on error).
 */

/**
 * Map raw Excel-style row to create payload (hook for future XLSX parser).
 * @param {Object} raw
 * @returns {Object}
 */
function HoSoV2_Import_mapExcelThongTinChungV1(raw) {
  var r = raw || {};
  if (r.normalized && typeof r.normalized === 'object') {
    var n = r.normalized;
    return {
      hoSoType: n.hoSoType || r.hoSoType || 'OTHER',
      title: n.title || r.title || '',
      ownerEmail: n.ownerEmail || r.ownerEmail || '',
      note: n.note || r.note || '',
      meta: n.meta || r.meta || {},
      xaVien: n.xaVien || null,
      phuongTien: n.phuongTien || null,
      taiXe: n.taiXe || null,
      giayTo: Array.isArray(n.giayTo) ? n.giayTo : []
    };
  }
  return {
    hoSoType: r.hoSoType || 'OTHER',
    title: r.title || '',
    ownerEmail: r.ownerEmail || '',
    note: r.note || '',
    meta: r.meta || {},
    xaVien: r.xaVien || null,
    phuongTien: r.phuongTien || null,
    taiXe: r.taiXe || null,
    giayTo: Array.isArray(r.giayTo) ? r.giayTo : []
  };
}

/**
 * @param {Object} row wrapper { raw, normalized }
 * @param {string} mappingCode
 * @returns {Object} create payload
 */
function hoSoV2ImportNormalizeRow_(row, mappingCode) {
  var mc = String(mappingCode || '').toUpperCase();
  if (mc === 'EXCEL_THONG_TIN_CHUNG_V1') {
    return HoSoV2_Import_mapExcelThongTinChungV1(row.raw || row);
  }
  return HoSoV2_Import_mapExcelThongTinChungV1(row.raw || row);
}

/**
 * @param {Object} command
 * @returns {Object}
 */
function HoSoV2_Import_importBatch(command) {
  var p = (command && command.payload) || {};
  var sourceType = p.sourceType != null ? String(p.sourceType).toUpperCase() : 'MANUAL_JSON';
  var rows = Array.isArray(p.rows) ? p.rows : [];
  var mappingCode = p.mappingCode != null ? String(p.mappingCode) : 'EXCEL_THONG_TIN_CHUNG_V1';

  HoSoV2_bootstrapSheets();
  hoSoV2EnsureSheet_('IMPORT_BATCH', 'IMPORT_BATCH');
  hoSoV2EnsureSheet_('IMPORT_ROW_LOG', 'IMPORT_ROW_LOG');

  var batchId = hoSoV2NewId_(HO_SO_V2.ID_PREFIX.BATCH);
  var now = cbvCoreV2IsoNow_();
  var actor = command.requestBy || cbvUser();

  hoSoV2AppendRow_(hoSoV2GetSheet_('IMPORT_BATCH'), {
    BATCH_ID: batchId,
    SOURCE_TYPE: sourceType,
    SOURCE_FILE_ID: p.sourceFileId != null ? String(p.sourceFileId) : '',
    SOURCE_FILE_NAME: p.sourceFileName != null ? String(p.sourceFileName) : '',
    STATUS: HO_SO_V2.IMPORT_STATUS.PROCESSING,
    TOTAL_ROWS: rows.length,
    SUCCESS_ROWS: 0,
    ERROR_ROWS: 0,
    CREATED_AT: now,
    CREATED_BY: actor,
    FINISHED_AT: '',
    META_JSON: hoSoV2MetaStringify_({ mappingCode: mappingCode })
  });

  var okC = 0;
  var errC = 0;
  var i;
  var logSh = hoSoV2GetSheet_('IMPORT_ROW_LOG');

  for (i = 0; i < rows.length; i++) {
    var row = rows[i] || {};
    var rowNo = i + 1;
    var logId = hoSoV2NewId_(HO_SO_V2.ID_PREFIX.ROW_LOG);
    var rawJson = cbvCoreV2SafeStringify_(row);
    try {
      var payload = hoSoV2ImportNormalizeRow_(row, mappingCode);
      var innerCmd = {
        commandId: (command.commandId || '') + '_R' + rowNo,
        commandType: 'HOSO_CREATE',
        moduleCode: 'HOSO',
        source: command.source || 'IMPORT',
        requestBy: actor,
        payload: payload
      };
      var cr = HosoService_create(innerCmd);
      if (cr && cr.ok) {
        okC++;
        hoSoV2AppendRow_(logSh, {
          ROW_LOG_ID: logId,
          BATCH_ID: batchId,
          ROW_NO: rowNo,
          STATUS: 'SUCCESS',
          HO_SO_ID: cr.entityId || '',
          ERROR_CODE: '',
          ERROR_MESSAGE: '',
          RAW_JSON: rawJson,
          NORMALIZED_JSON: cbvCoreV2SafeStringify_(payload),
          CREATED_AT: cbvCoreV2IsoNow_()
        });
      } else {
        errC++;
        hoSoV2AppendRow_(logSh, {
          ROW_LOG_ID: logId,
          BATCH_ID: batchId,
          ROW_NO: rowNo,
          STATUS: 'FAILED',
          HO_SO_ID: '',
          ERROR_CODE: cr && cr.error && cr.error.code ? String(cr.error.code) : 'CREATE_FAILED',
          ERROR_MESSAGE: cr && cr.message ? String(cr.message) : 'FAILED',
          RAW_JSON: rawJson,
          NORMALIZED_JSON: '',
          CREATED_AT: cbvCoreV2IsoNow_()
        });
      }
    } catch (e) {
      errC++;
      hoSoV2AppendRow_(logSh, {
        ROW_LOG_ID: logId,
        BATCH_ID: batchId,
        ROW_NO: rowNo,
        STATUS: 'FAILED',
        HO_SO_ID: '',
        ERROR_CODE: 'EXCEPTION',
        ERROR_MESSAGE: String(e && e.message ? e.message : e),
        RAW_JSON: rawJson,
        NORMALIZED_JSON: '',
        CREATED_AT: cbvCoreV2IsoNow_()
      });
    }
  }

  var finalStatus =
    errC === 0
      ? HO_SO_V2.IMPORT_STATUS.SUCCESS
      : okC === 0
        ? HO_SO_V2.IMPORT_STATUS.FAILED
        : HO_SO_V2.IMPORT_STATUS.PARTIAL_SUCCESS;

  var bSh = hoSoV2GetSheet_('IMPORT_BATCH');
  var br = hoSoV2FindRowByColumn_(bSh, 'BATCH_ID', batchId);
  if (br >= 2) {
    hoSoV2UpdateRow_(bSh, br, {
      STATUS: finalStatus,
      SUCCESS_ROWS: okC,
      ERROR_ROWS: errC,
      FINISHED_AT: cbvCoreV2IsoNow_()
    });
  }

  CBV_CoreV2_emitEvent({
    eventType: 'HOSO_IMPORTED',
    moduleCode: 'HOSO',
    entityType: 'IMPORT_BATCH',
    entityId: batchId,
    sourceCommandId: command.commandId || '',
    payload: { total: rows.length, success: okC, errors: errC, status: finalStatus },
    createdBy: actor
  });

  return {
    ok: true,
    entityType: 'IMPORT_BATCH',
    entityId: batchId,
    message: 'Import batch hoàn tất',
    data: { batchId: batchId, successRows: okC, errorRows: errC, status: finalStatus },
    error: null
  };
}
