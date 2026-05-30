/**
 * PHASE_WORK_INBOX_LATENCY_P0_FIX — shared sheet/header context for timeline + audit append.
 */

var WI_OP_APPEND_CTX_ = null;

function wiOpBeginAppendContext_() {
  var timelineInfo = taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.TASK_TIMELINE);
  var auditInfo = taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.ACTION_AUDIT_LOG);
  var opStoreInfo = null;
  if (!timelineInfo.exists || !auditInfo.exists) {
    opStoreInfo = taskDbReadHeaders_(CBV_WI_OP_CONFIG.SHEETS.OP_STORE);
  }
  WI_OP_APPEND_CTX_ = {
    timelineInfo: timelineInfo,
    auditInfo: auditInfo,
    opStoreInfo: opStoreInfo,
  };
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('appendSharedContextUsed', 1);
  return WI_OP_APPEND_CTX_;
}

function wiOpEndAppendContext_() {
  WI_OP_APPEND_CTX_ = null;
}

function wiOpReadSheetTailValues_(sheet, maxRows) {
  maxRows = maxRows || 250;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { values: [], rowsScanned: 0, startRow: 2 };
  var startRow = Math.max(2, lastRow - maxRows + 1);
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var readStart = Date.now();
  var values = sheet.getRange(startRow, 1, lastRow, lastCol).getValues();
  if (typeof wiPerfAddSheetRead_ === 'function') wiPerfAddSheetRead_(values.length, Date.now() - readStart);
  return { values: values, rowsScanned: values.length, startRow: startRow };
}
