/**
 * CBV User Directory Seed - Idempotent USER_DIRECTORY initialization.
 * Creates sheet if missing. Seeds sample users only when sampleMode=true.
 * Dependencies: 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA
 */

var USER_SEED_SAMPLE_PREFIX = 'SAMPLE_';

/**
 * Idempotent seed for USER_DIRECTORY.
 * @param {Object} options - { sampleMode: boolean } If true, seeds demo users. Default false.
 * @returns {Object} { ok, code, message, data: { created, skipped, sampleCreated } }
 */
function seedUserDirectory(options) {
  var opts = options || {};
  var sampleMode = opts.sampleMode === true;

  var result = {
    ok: true,
    code: 'USER_SEED_OK',
    message: 'USER_DIRECTORY seeded',
    data: { created: 0, skipped: 0, sampleCreated: 0 },
    errors: []
  };

  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(CBV_CONFIG.SHEETS.USER_DIRECTORY);
  var created = false;
  if (!sheet) {
    sheet = ss.insertSheet(CBV_CONFIG.SHEETS.USER_DIRECTORY);
    created = true;
  }

  var headers = getSchemaHeaders ? getSchemaHeaders(CBV_CONFIG.SHEETS.USER_DIRECTORY) : [];
  if (!headers || headers.length === 0) {
    headers = ['ID', 'USER_CODE', 'FULL_NAME', 'DISPLAY_NAME', 'EMAIL', 'PHONE', 'ROLE', 'POSITION', 'STATUS', 'IS_SYSTEM', 'ALLOW_LOGIN', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'];
  }

  var lastCol = sheet.getLastColumn();
  var currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  if (currentHeaders.length === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  if (sampleMode) {
    var sampleResult = _seedSampleUsers(sheet, headers);
    result.data.sampleCreated = sampleResult.added;
  }

  if (typeof clearUserCache === 'function') clearUserCache();
  Logger.log('seedUserDirectory: ' + JSON.stringify(result, null, 2));
  return result;
}

/**
 * Seeds sample/demo users. Marked with NOTE="[SAMPLE] Demo user - safe to delete"
 * @private
 */
function _seedSampleUsers(sheet, headers) {
  var result = { added: 0 };
  var idIdx = headers.indexOf('ID');
  var codeIdx = headers.indexOf('USER_CODE');
  if (idIdx === -1 || codeIdx === -1) return result;

  var lastRow = sheet.getLastRow();
  var existingCodes = [];
  if (lastRow >= 2) {
    var data = sheet.getRange(2, 1, lastRow, headers.length).getValues();
    data.forEach(function(row) {
      existingCodes.push(String(row[codeIdx] || '').trim().toLowerCase());
    });
  }

  var samples = [
    { USER_CODE: USER_SEED_SAMPLE_PREFIX + 'USER_001', FULL_NAME: 'Nguyễn Văn Admin (Demo)', ROLE: 'ADMIN', STATUS: 'ACTIVE', NOTE: '[SAMPLE] Demo user - safe to delete' },
    { USER_CODE: USER_SEED_SAMPLE_PREFIX + 'USER_002', FULL_NAME: 'Trần Thị Vận hành (Demo)', ROLE: 'OPERATOR', STATUS: 'ACTIVE', NOTE: '[SAMPLE] Demo user - safe to delete' },
    { USER_CODE: USER_SEED_SAMPLE_PREFIX + 'USER_003', FULL_NAME: 'Lê Văn Xem (Demo)', ROLE: 'VIEWER', STATUS: 'ACTIVE', NOTE: '[SAMPLE] Demo user - safe to delete' }
  ];

  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var user = typeof cbvUser === 'function' ? cbvUser() : 'system';

  samples.forEach(function(spec) {
    var code = String(spec.USER_CODE || '').trim().toLowerCase();
    if (existingCodes.indexOf(code) !== -1) return;

    var record = {
      ID: typeof cbvMakeId === 'function' ? cbvMakeId('UD') : 'UD_' + Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'yyyyMMdd') + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase(),
      USER_CODE: spec.USER_CODE,
      FULL_NAME: spec.FULL_NAME || spec.USER_CODE,
      DISPLAY_NAME: '',
      EMAIL: '',
      PHONE: '',
      ROLE: spec.ROLE || 'VIEWER',
      POSITION: '',
      STATUS: spec.STATUS || 'ACTIVE',
      IS_SYSTEM: false,
      ALLOW_LOGIN: false,
      NOTE: spec.NOTE || '[SAMPLE]',
      CREATED_AT: now,
      CREATED_BY: user,
      UPDATED_AT: now,
      UPDATED_BY: user,
      IS_DELETED: false
    };

    var row = headers.map(function(h) { return record[h] !== undefined ? record[h] : ''; });
    sheet.appendRow(row);
    existingCodes.push(code);
    result.added++;
  });

  return result;
}
