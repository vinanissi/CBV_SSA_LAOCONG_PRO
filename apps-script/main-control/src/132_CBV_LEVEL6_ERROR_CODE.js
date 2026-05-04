/**
 * CBV Level 6 Pro — canonical error codes (CBV_ERROR_CODE).
 * Dependencies: 130_CBV_LEVEL6_SCHEMA_REGISTRY.js, 02_CBV_CORE_V2_SHEETS.js
 */

var CBV_L6_ERROR_CODE_INDEX = CBV_L6_ERROR_CODE_INDEX || {};

/**
 * @returns {Object[]}
 */
function cbvL6DefaultErrorCodeSeed_() {
  var now = '';
  try {
    now = cbvCoreV2IsoNow_();
  } catch (e) {
    now = '';
  }
  function row(code, moduleCode, severity, userMsg, techMsg, retryable, http, status) {
    return {
      ERROR_CODE: code,
      MODULE_CODE: moduleCode,
      SEVERITY: severity,
      USER_MESSAGE: userMsg,
      TECH_MESSAGE: techMsg,
      RETRYABLE: retryable,
      HTTP_STATUS: http,
      STATUS: status || 'ACTIVE',
      CREATED_AT: now,
      UPDATED_AT: now
    };
  }
  return [
    row('CORE_INVALID_COMMAND', 'CORE', 'ERROR', 'Lệnh không hợp lệ.', 'Command failed validation or unknown command type.', 'FALSE', '400', 'ACTIVE'),
    row('CORE_PERMISSION_DENIED', 'CORE', 'ERROR', 'Không có quyền thực hiện.', 'Permission guard or rule denied.', 'FALSE', '403', 'ACTIVE'),
    row('CORE_MODULE_NOT_FOUND', 'CORE', 'ERROR', 'Module không tồn tại.', 'MODULE_REGISTRY has no entry.', 'FALSE', '404', 'ACTIVE'),
    row('CORE_HANDLER_NOT_FOUND', 'CORE', 'ERROR', 'Không tìm thấy handler.', 'Router could not resolve handler.', 'FALSE', '500', 'ACTIVE'),
    row('CORE_IDEMPOTENCY_CONFLICT', 'CORE', 'WARN', 'Yêu cầu trùng idempotency.', 'Idempotency key already used with different payload.', 'FALSE', '409', 'ACTIVE'),
    row('CORE_EVENT_HANDLER_NOT_FOUND', 'CORE', 'ERROR', 'Không xử lý được sự kiện.', 'No event handler or consumer handler.', 'FALSE', '500', 'ACTIVE'),
    row('CORE_EVENT_PROCESS_FAILED', 'CORE', 'ERROR', 'Xử lý sự kiện thất bại.', 'Event consumer or worker threw.', 'TRUE', '500', 'ACTIVE'),
    row('SCHEMA_MISSING_FIELD', 'CORE', 'WARN', 'Thiếu cột theo schema.', 'Physical sheet missing fields defined in registry.', 'FALSE', '400', 'ACTIVE'),
    row('SCHEMA_INVALID_HEADER', 'CORE', 'WARN', 'Header không hợp lệ.', 'Header row parse issue.', 'FALSE', '400', 'ACTIVE'),
    row('MIGRATION_HANDLER_NOT_FOUND', 'CORE', 'ERROR', 'Migration không chạy được.', 'Registered migration handler missing.', 'FALSE', '500', 'ACTIVE'),
    row('MIGRATION_FAILED', 'CORE', 'ERROR', 'Migration thất bại.', 'Migration handler returned failure or threw.', 'FALSE', '500', 'ACTIVE'),
    row('HOSO_INVALID_PAYLOAD', 'HOSO', 'ERROR', 'Dữ liệu hồ sơ không hợp lệ.', 'HO_SO payload validation failed.', 'FALSE', '400', 'ACTIVE'),
    row('HOSO_DUPLICATE_PLATE', 'HOSO', 'WARN', 'Trùng biển số.', 'Duplicate vehicle plate detected.', 'FALSE', '409', 'ACTIVE'),
    row('HOSO_NOT_FOUND', 'HOSO', 'ERROR', 'Không tìm thấy hồ sơ.', 'HO_SO id not found.', 'FALSE', '404', 'ACTIVE'),
    row('HOSO_PRINT_TEMPLATE_NOT_FOUND', 'HOSO', 'ERROR', 'Không có mẫu in.', 'Print template missing.', 'FALSE', '404', 'ACTIVE'),
    row('HOSO_ATTACHMENT_INVALID', 'HOSO', 'ERROR', 'Đính kèm không hợp lệ.', 'Attachment validation failed.', 'FALSE', '400', 'ACTIVE'),
    row('CONFIG_KEY_NOT_FOUND', 'CORE', 'ERROR', 'Thiếu cấu hình.', 'CONFIG_REGISTRY key not found.', 'FALSE', '500', 'ACTIVE'),
    row('PERMISSION_RULE_DENIED', 'CORE', 'ERROR', 'Quyền bị từ chối theo rule.', 'Advanced permission rule denied.', 'FALSE', '403', 'ACTIVE')
  ];
}

/**
 * @returns {Object}
 */
function CBV_L6_seedErrorCodes() {
  try {
    cbvL6EnsureCoreSheet_('ERROR_CODE', 'ERROR_CODE');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.ERROR_CODE);
    var seed = cbvL6DefaultErrorCodeSeed_();
    var i;
    for (i = 0; i < seed.length; i++) {
      var rec = seed[i];
      if (cbvCoreV2FindFirstRowInColumn_(sheet, 'ERROR_CODE', rec.ERROR_CODE) >= 2) continue;
      cbvCoreV2AppendRowByHeaders_(sheet, rec);
      CBV_L6_ERROR_CODE_INDEX[rec.ERROR_CODE] = rec;
    }
    return { ok: true, code: 'L6_ERROR_CODES_SEEDED', message: 'OK', data: { count: seed.length }, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}

/**
 * @param {string} errorCode
 * @returns {Object|null}
 */
function CBV_L6_getErrorCode(errorCode) {
  var code = String(errorCode || '').trim();
  if (!code) return null;
  if (CBV_L6_ERROR_CODE_INDEX[code]) return CBV_L6_ERROR_CODE_INDEX[code];
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.ERROR_CODE);
  if (!sheet) return null;
  var row = cbvCoreV2FindFirstRowInColumn_(sheet, 'ERROR_CODE', code);
  if (row < 2) return null;
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var o = {};
  var keys = Object.keys(map);
  var i;
  for (i = 0; i < keys.length; i++) {
    var hk = keys[i];
    o[hk] = sheet.getRange(row, map[hk]).getValue();
  }
  CBV_L6_ERROR_CODE_INDEX[code] = o;
  return o;
}

/**
 * @param {*} err
 * @param {Object} [context]
 * @returns {Object}
 */
function CBV_L6_normalizeError(err, context) {
  var ctx = context || {};
  var rawMessage = '';
  if (err && typeof err === 'object') {
    rawMessage = String(err.message != null ? err.message : JSON.stringify(err));
  } else {
    rawMessage = String(err != null ? err : '');
  }
  var code = '';
  if (err && typeof err === 'object' && err.code) code = String(err.code);
  if (!code && ctx.errorCode) code = String(ctx.errorCode);
  if (!code) code = 'CORE_INVALID_COMMAND';

  var row = CBV_L6_getErrorCode(code);
  if (!row) {
    return {
      errorCode: code,
      severity: 'ERROR',
      userMessage: rawMessage || 'Error',
      techMessage: rawMessage || 'Error',
      retryable: false,
      rawMessage: rawMessage
    };
  }
  return {
    errorCode: code,
    severity: String(row.SEVERITY || 'ERROR'),
    userMessage: String(row.USER_MESSAGE || rawMessage),
    techMessage: String(row.TECH_MESSAGE || rawMessage),
    retryable: String(row.RETRYABLE || '').toUpperCase() === 'TRUE',
    rawMessage: rawMessage
  };
}
