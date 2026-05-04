/**
 * CBV — bootstrap CONFIG DB + HOSO DB (isolated spreadsheets) + setup menu.
 * Creates documents; stores IDs in Script Properties (CBV_CONFIG_DB_ID, CBV_HOSO_DB_ID).
 * Dependencies: 150_CBV_CONFIG_RESOLVER.js, 02_CBV_CORE_V2_SHEETS.js
 *
 * Minimal HOSO sheet manifest (main-control must not depend on apps-script/hoso).
 * Physical tab names HOSO_*; header rows aligned with HO_SO V2 service schema.
 */
var HOSO_SETUP_SHEETS = {
  MASTER: 'HOSO_MASTER',
  XA_VIEN: 'HOSO_XA_VIEN',
  PHUONG_TIEN: 'HOSO_PHUONG_TIEN',
  TAI_XE: 'HOSO_TAI_XE',
  GIAY_TO: 'HOSO_GIAY_TO',
  RELATION: 'HOSO_RELATION',
  ATTACHMENT: 'HOSO_ATTACHMENT',
  IMPORT_BATCH: 'HOSO_IMPORT_BATCH',
  IMPORT_ROW_LOG: 'HOSO_IMPORT_ROW_LOG',
  SEARCH_INDEX: 'HOSO_SEARCH_INDEX',
  TEMPLATE: 'HOSO_TEMPLATE',
  PRINT_JOB: 'HOSO_PRINT_JOB',
  HEALTH: 'HOSO_HEALTH'
};

var HOSO_SETUP_HEADERS = {
  MASTER: [
    'HO_SO_ID', 'HO_SO_CODE', 'HO_SO_TYPE', 'TITLE', 'PRIMARY_ENTITY_TYPE', 'PRIMARY_ENTITY_ID', 'STATUS', 'SOURCE',
    'OWNER_EMAIL', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'NOTE', 'META_JSON'
  ],
  XA_VIEN: [
    'XA_VIEN_ID', 'HO_SO_ID', 'HO_TEN', 'NAM_SINH', 'CCCD', 'CCCD_NGAY_CAP', 'CCCD_NOI_CAP', 'DIA_CHI', 'PHONE_1', 'PHONE_2',
    'EMAIL', 'NGUOI_DAI_DIEN', 'STATUS', 'CREATED_AT', 'UPDATED_AT', 'META_JSON'
  ],
  PHUONG_TIEN: [
    'PHUONG_TIEN_ID', 'HO_SO_ID', 'BIEN_SO', 'LOAI_XE', 'HIEU_XE', 'SO_LOAI', 'MAU_XE', 'NAM_SAN_XUAT', 'NUOC_SAN_XUAT',
    'SO_CHO_TAI_TRONG', 'SO_KHUNG', 'SO_MAY', 'GPS_WEB', 'GPS_USER', 'GPS_PASS', 'STATUS', 'CREATED_AT', 'UPDATED_AT', 'META_JSON'
  ],
  TAI_XE: [
    'TAI_XE_ID', 'HO_SO_ID', 'HO_TEN', 'CCCD', 'PHONE', 'GPLX_SO', 'GPLX_HANG', 'GPLX_NGAY_CAP', 'GPLX_NOI_CAP', 'DIA_CHI',
    'STATUS', 'CREATED_AT', 'UPDATED_AT', 'META_JSON'
  ],
  GIAY_TO: [
    'GIAY_TO_ID', 'HO_SO_ID', 'ENTITY_TYPE', 'ENTITY_ID', 'DOC_TYPE', 'DOC_NO', 'ISSUE_DATE', 'EXPIRE_DATE', 'STATUS',
    'FILE_URL', 'NOTE', 'CREATED_AT', 'UPDATED_AT', 'META_JSON'
  ],
  RELATION: [
    'RELATION_ID', 'FROM_TYPE', 'FROM_ID', 'TO_TYPE', 'TO_ID', 'RELATION_TYPE', 'STATUS', 'CREATED_AT', 'UPDATED_AT', 'META_JSON'
  ],
  ATTACHMENT: [
    'ATTACHMENT_ID', 'HO_SO_ID', 'ENTITY_TYPE', 'ENTITY_ID', 'FILE_TYPE', 'FILE_NAME', 'FILE_URL', 'DRIVE_FILE_ID',
    'MIME_TYPE', 'STATUS', 'CREATED_AT', 'CREATED_BY', 'NOTE', 'META_JSON'
  ],
  IMPORT_BATCH: [
    'BATCH_ID', 'SOURCE_TYPE', 'SOURCE_FILE_ID', 'SOURCE_FILE_NAME', 'STATUS', 'TOTAL_ROWS', 'SUCCESS_ROWS', 'ERROR_ROWS',
    'CREATED_AT', 'CREATED_BY', 'FINISHED_AT', 'META_JSON'
  ],
  IMPORT_ROW_LOG: [
    'ROW_LOG_ID', 'BATCH_ID', 'ROW_NO', 'STATUS', 'HO_SO_ID', 'ERROR_CODE', 'ERROR_MESSAGE', 'RAW_JSON', 'NORMALIZED_JSON', 'CREATED_AT'
  ],
  SEARCH_INDEX: [
    'SEARCH_ID', 'HO_SO_ID', 'ENTITY_TYPE', 'ENTITY_ID', 'TITLE', 'KEYWORDS', 'KEYWORDS_NORMALIZED', 'SOURCE_TABLE', 'STATUS',
    'UPDATED_AT', 'META_JSON'
  ],
  TEMPLATE: [
    'TEMPLATE_ID', 'TEMPLATE_CODE', 'TEMPLATE_NAME', 'TEMPLATE_TYPE', 'TEMPLATE_SOURCE_ID', 'TEMPLATE_SOURCE_URL', 'STATUS',
    'VERSION', 'CONFIG_JSON', 'CREATED_AT', 'UPDATED_AT'
  ],
  PRINT_JOB: [
    'PRINT_JOB_ID', 'HO_SO_ID', 'TEMPLATE_CODE', 'STATUS', 'OUTPUT_FILE_ID', 'OUTPUT_FILE_URL', 'OUTPUT_PDF_URL', 'ERROR_CODE',
    'ERROR_MESSAGE', 'CREATED_AT', 'CREATED_BY', 'FINISHED_AT', 'PAYLOAD_JSON'
  ],
  HEALTH: [
    'CHECK_ID', 'CHECK_NAME', 'SEVERITY', 'STATUS', 'MESSAGE', 'LAST_CHECK_AT', 'PAYLOAD_JSON'
  ]
};

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} sheetName
 * @param {string[]} headers
 */
function cbvHosoSetupEnsureSheetOn_(ss, sheetName, headers) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh) {
    sh = ss.insertSheet(sheetName);
  }
  if (sh.getLastColumn() < 1 || String(sh.getRange(1, 1).getValue() || '').trim() === '') {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var need = [];
  var i;
  for (i = 0; i < headers.length; i++) {
    if (!map[headers[i]]) need.push(headers[i]);
  }
  if (!need.length) return;
  var lastH = 0;
  var w = Math.max(sh.getLastColumn(), 1);
  var row1 = sh.getRange(1, 1, 1, w).getValues()[0];
  for (i = 0; i < row1.length; i++) {
    if (String(row1[i] || '').trim() !== '') lastH = i + 1;
  }
  sh.getRange(1, lastH + 1, 1, lastH + need.length).setValues([need]);
}

/**
 * @returns {Object}
 */
function CBV_HOSO_setup_bootstrapHosoDb() {
  try {
    var ss = SpreadsheetApp.create('CBV_LAOCONG_HOSO_V2_2_DB');
    var id = ss.getId();
    PropertiesService.getScriptProperties().setProperty('CBV_HOSO_DB_ID', id);
    var order = [
      'MASTER', 'XA_VIEN', 'PHUONG_TIEN', 'TAI_XE', 'GIAY_TO', 'RELATION', 'ATTACHMENT', 'IMPORT_BATCH', 'IMPORT_ROW_LOG',
      'SEARCH_INDEX', 'TEMPLATE', 'PRINT_JOB', 'HEALTH'
    ];
    var ti;
    for (ti = 0; ti < order.length; ti++) {
      var hk = order[ti];
      var physical = HOSO_SETUP_SHEETS[hk];
      var hdr = HOSO_SETUP_HEADERS[hk];
      if (physical && hdr && hdr.length) cbvHosoSetupEnsureSheetOn_(ss, physical, hdr.slice());
    }
    if (typeof CBV_Config_clearCache === 'function') CBV_Config_clearCache();
    return { ok: true, spreadsheetId: id, url: ss.getUrl(), message: 'HOSO DB created; CBV_HOSO_DB_ID set' };
  } catch (e) {
    return { ok: false, message: String(e && e.message ? e.message : e) };
  }
}

/**
 * @returns {Object}
 */
function CBV_HOSO_setup_bootstrapConfigDb() {
  try {
    var hosoId = cbvConfigScriptProp_('CBV_HOSO_DB_ID');
    if (!hosoId) {
      return { ok: false, message: 'Run Bootstrap HOSO DB first (CBV_HOSO_DB_ID missing)' };
    }
    var ss = SpreadsheetApp.create('CBV_LAOCONG_CONFIG_V2_2_DB');
    var cfgId = ss.getId();
    PropertiesService.getScriptProperties().setProperty('CBV_CONFIG_DB_ID', cfgId);

    cbvHosoSetupEnsureSheetOn_(ss, 'CONFIG_ENV', ['ENV_CODE', 'CONFIG_KEY', 'CONFIG_VALUE', 'IS_ACTIVE', 'UPDATED_AT']);
    cbvHosoSetupEnsureSheetOn_(ss, 'CONFIG_MODULE', ['MODULE_CODE', 'DISPLAY_NAME', 'ACTIVE_VERSION', 'DB_CONFIG_KEY', 'STATUS']);
    cbvHosoSetupEnsureSheetOn_(ss, 'CONFIG_SHEET_REGISTRY', ['MODULE_CODE', 'TABLE_CODE', 'SHEET_NAME', 'STATUS']);
    cbvHosoSetupEnsureSheetOn_(ss, 'CONFIG_TEMPLATE', ['TEMPLATE_KEY', 'MODULE_CODE', 'STATUS', 'CONFIG_JSON', 'UPDATED_AT']);
    cbvHosoSetupEnsureSheetOn_(ss, 'CONFIG_IMPORT_MAPPING', ['MAPPING_CODE', 'MODULE_CODE', 'STATUS', 'CONFIG_JSON', 'UPDATED_AT']);
    cbvHosoSetupEnsureSheetOn_(ss, 'CONFIG_PERMISSION', ['RULE_KEY', 'MODULE_CODE', 'STATUS', 'CONFIG_JSON', 'UPDATED_AT']);

    var now = cbvCoreV2IsoNow_();
    var envSh = ss.getSheetByName('CONFIG_ENV');
    cbvCoreV2AppendRowByHeaders_(envSh, {
      ENV_CODE: 'PROD',
      CONFIG_KEY: 'HOSO_DB_ID',
      CONFIG_VALUE: hosoId,
      IS_ACTIVE: 'TRUE',
      UPDATED_AT: now
    });
    cbvCoreV2AppendRowByHeaders_(envSh, {
      ENV_CODE: 'PROD',
      CONFIG_KEY: 'CONFIG_DB_ID',
      CONFIG_VALUE: cfgId,
      IS_ACTIVE: 'TRUE',
      UPDATED_AT: now
    });

    var modSh = ss.getSheetByName('CONFIG_MODULE');
    cbvCoreV2AppendRowByHeaders_(modSh, {
      MODULE_CODE: 'HOSO',
      DISPLAY_NAME: 'Hồ sơ V2.2',
      ACTIVE_VERSION: 'V2_2',
      DB_CONFIG_KEY: 'HOSO_DB_ID',
      STATUS: 'ACTIVE'
    });

    var regRows = [
      ['HOSO', 'MASTER', 'HOSO_MASTER', 'ACTIVE'],
      ['HOSO', 'XA_VIEN', 'HOSO_XA_VIEN', 'ACTIVE'],
      ['HOSO', 'PHUONG_TIEN', 'HOSO_PHUONG_TIEN', 'ACTIVE'],
      ['HOSO', 'TAI_XE', 'HOSO_TAI_XE', 'ACTIVE'],
      ['HOSO', 'GIAY_TO', 'HOSO_GIAY_TO', 'ACTIVE'],
      ['HOSO', 'ATTACHMENT', 'HOSO_ATTACHMENT', 'ACTIVE'],
      ['HOSO', 'SEARCH_INDEX', 'HOSO_SEARCH_INDEX', 'ACTIVE'],
      ['HOSO', 'PRINT_JOB', 'HOSO_PRINT_JOB', 'ACTIVE'],
      ['HOSO', 'RELATION', 'HOSO_RELATION', 'ACTIVE'],
      ['HOSO', 'IMPORT_BATCH', 'HOSO_IMPORT_BATCH', 'ACTIVE'],
      ['HOSO', 'IMPORT_ROW_LOG', 'HOSO_IMPORT_ROW_LOG', 'ACTIVE'],
      ['HOSO', 'TEMPLATE', 'HOSO_TEMPLATE', 'ACTIVE'],
      ['HOSO', 'HEALTH', 'HOSO_HEALTH', 'ACTIVE']
    ];
    var regSh = ss.getSheetByName('CONFIG_SHEET_REGISTRY');
    var ri;
    for (ri = 0; ri < regRows.length; ri++) {
      cbvCoreV2AppendRowByHeaders_(regSh, {
        MODULE_CODE: regRows[ri][0],
        TABLE_CODE: regRows[ri][1],
        SHEET_NAME: regRows[ri][2],
        STATUS: regRows[ri][3]
      });
    }

    if (typeof CBV_Config_clearCache === 'function') CBV_Config_clearCache();
    return { ok: true, configSpreadsheetId: cfgId, hosoSpreadsheetId: hosoId, url: ss.getUrl(), message: 'CONFIG DB created; CBV_CONFIG_DB_ID set' };
  } catch (e) {
    return { ok: false, message: String(e && e.message ? e.message : e) };
  }
}

/**
 * @returns {Object}
 */
function CBV_HOSO_setup_testConfigResolver() {
  var steps = [];
  var ok = true;
  var cfgId = cbvConfigScriptProp_('CBV_CONFIG_DB_ID');
  steps.push({ name: 'has_CBV_CONFIG_DB_ID', ok: !!cfgId, detail: cfgId ? 'set' : 'missing' });
  if (!cfgId) ok = false;
  var dbId = typeof CBV_Config_getDbId === 'function' ? CBV_Config_getDbId('HOSO') : '';
  steps.push({ name: 'CBV_Config_getDbId_HOSO', ok: !!dbId, detail: dbId || 'empty' });
  if (!dbId) ok = false;
  var sn = typeof CBV_Config_getSheetName === 'function' ? CBV_Config_getSheetName('HOSO', 'MASTER') : '';
  steps.push({ name: 'CBV_Config_getSheetName_MASTER', ok: sn === 'HOSO_MASTER' || !!sn, detail: sn || 'empty' });
  if (!sn) ok = false;
  return { ok: ok, steps: steps };
}

function buildHosoV22SetupMenu_() {
  var ui = SpreadsheetApp.getUi();
  if (!ui) return;
  ui.createMenu('📁 HOSO V2.2 Setup')
    .addItem('Bootstrap CONFIG DB', 'CBV_HOSO_setup_menuBootstrapConfigDb')
    .addItem('Bootstrap HOSO DB', 'CBV_HOSO_setup_menuBootstrapHosoDb')
    .addItem('Test Config Resolver', 'CBV_HOSO_setup_menuTestConfigResolver')
    .addItem('Test HOSO Create (config-driven)', 'CBV_HOSO_setup_menuTestHosoCreate')
    .addToUi();
}

function CBV_HOSO_setup_menuBootstrapConfigDb() {
  try {
    var r = CBV_HOSO_setup_bootstrapConfigDb();
    SpreadsheetApp.getUi().alert('CONFIG DB', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_HOSO_setup_menuBootstrapHosoDb() {
  try {
    var r = CBV_HOSO_setup_bootstrapHosoDb();
    SpreadsheetApp.getUi().alert('HOSO DB', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_HOSO_setup_menuTestConfigResolver() {
  try {
    var r = CBV_HOSO_setup_testConfigResolver();
    SpreadsheetApp.getUi().alert('Config Resolver', cbvCoreV2SafeStringify_(r), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_HOSO_setup_menuTestHosoCreate() {
  try {
    HosoService_bootstrapSheets();
    var plate = 'TST' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
    var res = CBV_CoreV2_dispatch({
      commandType: 'HOSO_CREATE',
      moduleCode: 'HOSO',
      source: 'MENU',
      requestBy: typeof cbvUser === 'function' ? cbvUser() : 'system',
      idempotencyKey: 'hoso_cfg_test_' + Utilities.getUuid(),
      payload: {
        hoSoType: 'XE',
        title: 'Config-driven test ' + plate,
        xaVien: { hoTen: 'Test chủ xe' },
        phuongTien: { bienSo: plate }
      }
    });
    SpreadsheetApp.getUi().alert('HOSO_CREATE', cbvCoreV2SafeStringify_(res), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
