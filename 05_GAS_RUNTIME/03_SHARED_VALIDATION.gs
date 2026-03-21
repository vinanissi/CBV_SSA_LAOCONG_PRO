/**
 * Validates value against enum list. Use for raw arrays (e.g. transition maps).
 * For schema-backed enums, use assertValidEnumValue(enumGroup, value, fieldName) from enum_service.
 */
function ensureEnum(value, enumList, fieldName) {
  cbvAssert(enumList && enumList.indexOf(value) !== -1, 'Invalid ' + fieldName + ': ' + value);
}

function ensureRequired(value, fieldName) {
  cbvAssert(value !== null && value !== undefined && value !== '', fieldName + ' is required');
}

function ensurePositiveNumber(value, fieldName) {
  cbvAssert(Number(value) > 0, fieldName + ' must be > 0');
}

/** Max length for text fields. Prevents overflow and abuse. */
function ensureMaxLength(value, maxLen, fieldName) {
  if (value == null || value === '') return;
  var s = String(value);
  cbvAssert(s.length <= maxLen, fieldName + ' must be at most ' + maxLen + ' characters');
}

function ensureTaskCanComplete(taskId) {
  const items = _rows(_sheet(CBV_CONFIG.SHEETS.TASK_CHECKLIST))
    .filter(function(r) { return String(r.TASK_ID) === String(taskId); });

  const pendingRequired = items.filter(function(r) {
    return String(r.IS_REQUIRED) === 'true' || r.IS_REQUIRED === true
      ? !(String(r.IS_DONE) === 'true' || r.IS_DONE === true)
      : false;
  });

  cbvAssert(pendingRequired.length === 0, 'Required checklist items are not completed');
}

function ensureTransition(oldStatus, newStatus, allowedMap) {
  const allowed = allowedMap[oldStatus] || [];
  cbvAssert(allowed.indexOf(newStatus) !== -1, 'Invalid transition: ' + oldStatus + ' -> ' + newStatus);
}
