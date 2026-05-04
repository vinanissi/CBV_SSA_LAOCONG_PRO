/**
 * CBV — bootstrap CONFIG DB + HOSO DB (isolated spreadsheets) + setup menu.
 * Creates documents; stores IDs in Script Properties (CBV_CONFIG_DB_ID, CBV_HOSO_DB_ID).
 * Dependencies: 150_CBV_CONFIG_RESOLVER.js, 110_HO_SO_V2_CONSTANTS.js, 02_CBV_CORE_V2_SHEETS.js
 */

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
    if (typeof HO_SO_V2 === 'undefined' || !HO_SO_V2.HEADERS) {
      return { ok: false, message: 'HO_SO_V2 constants not loaded', spreadsheetId: id, url: ss.getUrl() };
    }
    var tables = [
      ['HOSO_MASTER', 'MASTER'],
      ['HOSO_XA_VIEN', 'XA_VIEN'],
      ['HOSO_PHUONG_TIEN', 'PHUONG_TIEN'],
      ['HOSO_TAI_XE', 'TAI_XE'],
      ['HOSO_GIAY_TO', 'GIAY_TO'],
      ['HOSO_RELATION', 'RELATION'],
      ['HOSO_ATTACHMENT', 'ATTACHMENT'],
      ['HOSO_IMPORT_BATCH', 'IMPORT_BATCH'],
      ['HOSO_IMPORT_ROW_LOG', 'IMPORT_ROW_LOG'],
      ['HOSO_SEARCH_INDEX', 'SEARCH_INDEX'],
      ['HOSO_TEMPLATE', 'TEMPLATE'],
      ['HOSO_PRINT_JOB', 'PRINT_JOB'],
      ['HOSO_HEALTH', 'HEALTH']
    ];
    var ti;
    for (ti = 0; ti < tables.length; ti++) {
      var physical = tables[ti][0];
      var hk = tables[ti][1];
      var hdr = HO_SO_V2.HEADERS[hk];
      if (hdr && hdr.length) cbvHosoSetupEnsureSheetOn_(ss, physical, hdr.slice());
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
