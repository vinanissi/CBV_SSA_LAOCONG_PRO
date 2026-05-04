/**
 * CONFIG module — ensure CONFIG DB sheets + seed defaults + register in Core MODULE_REGISTRY.
 * Idempotent. Requires CBV_CONFIG_DB_ID (create CONFIG DB via HOSO V2.2 setup or manual).
 * Dependencies: 130, 136, 150, 160, 02, 70, 165, 170 (CONFIG_EventConsumer_onChanged)
 */

/**
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet|null}
 */
function cbvConfigModuleGetSpreadsheet_() {
  return cbvConfigOpenSpreadsheet_();
}

/**
 * Idempotent: register Level 6 consumer for CONFIG_CHANGED.
 */
function cbvConfigModuleEnsureConfigChangedConsumer_() {
  if (typeof CBV_L6_registerEventConsumer !== 'function') {
    Logger.log('[cbvConfigModuleEnsureConfigChangedConsumer_] CBV_L6_registerEventConsumer not available');
    return;
  }
  if (typeof CONFIG_EventConsumer_onChanged !== 'function') {
    Logger.log('[cbvConfigModuleEnsureConfigChangedConsumer_] CONFIG_EventConsumer_onChanged not available');
    return;
  }
  try {
    cbvL6EnsureCoreSheet_('EVENT_CONSUMER', 'EVENT_CONSUMER');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_LEVEL6.SHEETS.EVENT_CONSUMER);
    if (sheet && cbvCoreV2FindFirstRowInColumn_(sheet, 'CONSUMER_ID', 'CONFIG_CHANGED_HANDLER') >= 2) {
      Logger.log('[cbvConfigModuleEnsureConfigChangedConsumer_] already registered');
      return;
    }
    var reg = CBV_L6_registerEventConsumer({
      consumerId: 'CONFIG_CHANGED_HANDLER',
      eventType: 'CONFIG_CHANGED',
      moduleCode: 'CONFIG',
      handlerName: 'CONFIG_EventConsumer_onChanged',
      priority: 10
    });
    Logger.log('[cbvConfigModuleEnsureConfigChangedConsumer_] ' + cbvCoreV2SafeStringify_(reg));
  } catch (e) {
    Logger.log('[cbvConfigModuleEnsureConfigChangedConsumer_] ' + (e && e.message ? e.message : e));
  }
}

/**
 * Ensure all CONFIG_MANAGER sheets + headers on CONFIG DB.
 * @returns {Object}
 */
function cbvConfigModuleEnsureAllSheets_(ss) {
  var report = { sheets: [], ok: true };
  var pairs = [
    ['ENV', CBV_CONFIG_MODULE.TABLES.ENV, CBV_CONFIG_MODULE.HEADERS.ENV],
    ['MODULE', CBV_CONFIG_MODULE.TABLES.MODULE, CBV_CONFIG_MODULE.HEADERS.MODULE],
    ['SHEET_REGISTRY', CBV_CONFIG_MODULE.TABLES.SHEET_REGISTRY, CBV_CONFIG_MODULE.HEADERS.SHEET_REGISTRY],
    ['ENUM', CBV_CONFIG_MODULE.TABLES.ENUM, CBV_CONFIG_MODULE.HEADERS.ENUM],
    ['RULE', CBV_CONFIG_MODULE.TABLES.RULE, CBV_CONFIG_MODULE.HEADERS.RULE],
    ['FEATURE_FLAG', CBV_CONFIG_MODULE.TABLES.FEATURE_FLAG, CBV_CONFIG_MODULE.HEADERS.FEATURE_FLAG],
    ['ACCESS_LOG', CBV_CONFIG_MODULE.TABLES.ACCESS_LOG, CBV_CONFIG_MODULE.HEADERS.ACCESS_LOG],
    ['CHANGE_LOG', CBV_CONFIG_MODULE.TABLES.CHANGE_LOG, CBV_CONFIG_MODULE.HEADERS.CHANGE_LOG]
  ];
  var i;
  for (i = 0; i < pairs.length; i++) {
    var er = cbvCoreV2EnsureSheetWithHeadersOnSpreadsheet_(ss, pairs[i][1], pairs[i][2]);
    report.sheets.push({
      key: pairs[i][0],
      name: pairs[i][1],
      created: er.created,
      appendedHeaders: er.appendedHeaders || []
    });
  }
  return report;
}

/**
 * Seed default env, CONFIG module row, ADMIN role enum, baseline rule (idempotent).
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */
function cbvConfigModuleSeedDefaults_(ss) {
  var now = cbvCoreV2IsoNow_();
  var selfId = ss.getId();

  var shEnv = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.ENV);
  if (shEnv && cbvConfigModuleFindEnvRow_(shEnv, 'PROD', 'CONFIG_DB_ID') < 2) {
    cbvCoreV2AppendRowByHeaders_(shEnv, {
      ENV_CODE: 'PROD',
      CONFIG_KEY: 'CONFIG_DB_ID',
      CONFIG_VALUE: selfId,
      IS_ACTIVE: 'TRUE',
      UPDATED_AT: now
    });
    Logger.log('[cbvConfigModuleSeedDefaults_] seeded CONFIG_DB_ID self-ref');
  }

  var shMod = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.MODULE);
  if (shMod && cbvCoreV2FindFirstRowInColumn_(shMod, 'MODULE_CODE', 'CONFIG') < 2) {
    cbvCoreV2AppendRowByHeaders_(shMod, {
      MODULE_CODE: 'CONFIG',
      DISPLAY_NAME: 'System Configuration',
      ACTIVE_VERSION: CBV_CONFIG_MODULE.VERSION,
      DB_CONFIG_KEY: 'CONFIG_DB_ID',
      STATUS: 'ACTIVE'
    });
    Logger.log('[cbvConfigModuleSeedDefaults_] seeded CONFIG_MODULE row');
  }

  var shEnum = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.ENUM);
  if (shEnum) {
    var mapE = cbvCoreV2ReadHeaderMap_(shEnum);
    var hasAdmin = false;
    if (shEnum.getLastRow() >= 2 && mapE['ENUM_GROUP'] && mapE['ENUM_KEY']) {
      var last = shEnum.getLastRow();
      var gCol = mapE['ENUM_GROUP'];
      var kCol = mapE['ENUM_KEY'];
      var r;
      for (r = 2; r <= last; r++) {
        if (
          String(shEnum.getRange(r, gCol).getValue() || '').toUpperCase() === 'ROLE' &&
          String(shEnum.getRange(r, kCol).getValue() || '').toUpperCase() === 'ADMIN'
        ) {
          hasAdmin = true;
          break;
        }
      }
    }
    if (!hasAdmin) {
      cbvCoreV2AppendRowByHeaders_(shEnum, {
        ENUM_ID: 'ENU' + Utilities.getUuid().replace(/-/g, '').slice(0, 10),
        ENUM_GROUP: 'ROLE',
        ENUM_KEY: 'ADMIN',
        ENUM_VALUE: 'ADMIN',
        STATUS: 'ACTIVE',
        CREATED_AT: now,
        UPDATED_AT: now
      });
      Logger.log('[cbvConfigModuleSeedDefaults_] seeded ROLE/ADMIN enum');
    }
  }

  var shRule = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.RULE);
  if (shRule && cbvCoreV2FindFirstRowInColumn_(shRule, 'RULE_KEY', 'ADMIN_FULL_ACCESS') < 2) {
    cbvCoreV2AppendRowByHeaders_(shRule, {
      RULE_ID: 'RUL' + Utilities.getUuid().replace(/-/g, '').slice(0, 10),
      MODULE_CODE: '*',
      RULE_KEY: 'ADMIN_FULL_ACCESS',
      RULE_TYPE: 'ACCESS',
      RULE_JSON: JSON.stringify({ effect: 'ALLOW', roles: ['ADMIN', 'DEV'] }),
      STATUS: 'ACTIVE',
      CREATED_AT: now,
      UPDATED_AT: now
    });
    Logger.log('[cbvConfigModuleSeedDefaults_] seeded ADMIN_FULL_ACCESS rule');
  }
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} envCode
 * @param {string} configKey
 * @returns {number} row index or -1
 */
function cbvConfigModuleFindEnvRow_(sheet, envCode, configKey) {
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var ec = map['ENV_CODE'];
  var ck = map['CONFIG_KEY'];
  if (!ec || !ck) return -1;
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var env = String(envCode || '').trim();
  var key = String(configKey || '').trim();
  var r;
  for (r = 2; r <= last; r++) {
    if (String(sheet.getRange(r, ec).getValue() || '').trim() === env && String(sheet.getRange(r, ck).getValue() || '').trim() === key) {
      return r;
    }
  }
  return -1;
}

/**
 * Full CONFIG DB bootstrap + Core registry registration.
 * @returns {Object}
 */
function CBV_ConfigModule_bootstrap() {
  try {
    var ss = cbvConfigModuleGetSpreadsheet_();
    if (!ss) {
      return {
        ok: false,
        code: 'CONFIG_DB_MISSING',
        message: 'CBV_CONFIG_DB_ID not set — create CONFIG DB first (e.g. HOSO V2.2 Setup → Bootstrap CONFIG DB)',
        data: {},
        error: { code: 'CONFIG_DB_MISSING', message: 'CBV_CONFIG_DB_ID unset' }
      };
    }

    var sheetReport = cbvConfigModuleEnsureAllSheets_(ss);
    cbvConfigModuleSeedDefaults_(ss);

    var reg = CBV_CoreV2_registerModule({
      moduleCode: CBV_CONFIG_MODULE.MODULE_CODE,
      moduleName: 'System Configuration',
      entryHandler: 'ConfigCommandHandler_handle',
      status: 'ACTIVE',
      version: CBV_CONFIG_MODULE.VERSION,
      isLevel6: true
    });
    Logger.log('[CBV_ConfigModule_bootstrap] registerModule: ' + cbvCoreV2SafeStringify_(reg));

    cbvConfigModuleEnsureConfigChangedConsumer_();

    if (typeof CBV_Config_clearCache === 'function') CBV_Config_clearCache();

    return {
      ok: true,
      code: 'CONFIG_MODULE_BOOTSTRAP_OK',
      message: 'CONFIG module sheets + registry OK',
      data: { spreadsheetId: ss.getId(), sheets: sheetReport.sheets, registry: reg },
      error: null
    };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    Logger.log('[CBV_ConfigModule_bootstrap] error: ' + n.message);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}
