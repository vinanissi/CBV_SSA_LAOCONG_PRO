function logAction(module, entityType, entityId, action, beforeObj, afterObj, note) {
  const sheetName = module === 'FINANCE' ? CBV_CONFIG.SHEETS.FINANCE_LOG : CBV_CONFIG.SHEETS.TASK_UPDATE_LOG;
  const idPrefix = module === 'FINANCE' ? 'FLOG' : 'TLOG';
  const record = {
    ID: cbvMakeId(idPrefix),
    MODULE: module,
    ENTITY_TYPE: entityType,
    ENTITY_ID: entityId,
    ACTION: action,
    BEFORE_JSON: JSON.stringify(beforeObj || {}),
    AFTER_JSON: JSON.stringify(afterObj || {}),
    NOTE: note || '',
    ACTOR_ID: cbvUser(),
    CREATED_AT: cbvNow()
  };

  const sheet = _sheet(sheetName);
  const headers = _headers(sheet);
  const row = headers.map(function(h) { return record[h] !== undefined ? record[h] : ''; });
  sheet.appendRow(row);
}
