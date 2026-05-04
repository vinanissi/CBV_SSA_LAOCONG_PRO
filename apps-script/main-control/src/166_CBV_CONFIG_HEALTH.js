/**
 * CONFIG module — health (CONFIG DB structural + consistency checks).
 * Dependencies: 150, 160, 161 (cbvConfigModuleFindEnvRow_), 02, 163, 164
 */

/**
 * @returns {{
 *   ok: boolean,
 *   issues: string[],
 *   missingSheets: string[],
 *   missingModules: string[],
 *   invalidEnums: string[],
 *   invalidRules: string[],
 *   message: string
 * }}
 */
function Config_healthCheck_() {
  var issues = [];
  var missingSheets = [];
  var missingModules = [];
  var invalidEnums = [];
  var invalidRules = [];

  function pushIssue(tag, detail) {
    var s = tag + (detail != null && detail !== '' ? ':' + detail : '');
    issues.push(s);
  }

  try {
    var ss = cbvConfigOpenSpreadsheet_();
    if (!ss) {
      missingSheets.push('CONFIG_DB');
      missingModules.push('CONFIG');
      pushIssue('NO_CONFIG_DB', 'CBV_CONFIG_DB_ID');
      return {
        ok: false,
        issues: issues.slice(),
        missingSheets: missingSheets,
        missingModules: missingModules,
        invalidEnums: invalidEnums,
        invalidRules: invalidRules,
        message: 'CBV_CONFIG_DB_ID not set or spreadsheet not open'
      };
    }

    var envDefault = cbvConfigDefaultEnv_();

    var keys = Object.keys(CBV_CONFIG_MODULE.TABLES);
    var i;
    for (i = 0; i < keys.length; i++) {
      var logical = keys[i];
      var name = CBV_CONFIG_MODULE.TABLES[logical];
      var sh = ss.getSheetByName(name);
      if (!sh) {
        missingSheets.push(name);
        pushIssue('MISSING_SHEET', name);
        continue;
      }
      var exp = CBV_CONFIG_MODULE.HEADERS[logical];
      if (!exp || !exp.length) continue;
      var map = cbvCoreV2ReadHeaderMap_(sh);
      var j;
      for (j = 0; j < exp.length; j++) {
        if (!map[exp[j]]) {
          missingSheets.push(name + ':missing_header:' + exp[j]);
          pushIssue('MISSING_HEADER', name + '/' + exp[j]);
        }
      }
    }

    var shMod = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.MODULE);
    if (shMod) {
      if (cbvCoreV2FindFirstRowInColumn_(shMod, 'MODULE_CODE', 'CONFIG') < 2) {
        missingModules.push('CONFIG');
        pushIssue('MISSING_MODULE_ROW', 'CONFIG');
      }

      var mMap = cbvCoreV2ReadHeaderMap_(shMod);
      var shEnv = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.ENV);
      if (shEnv && shMod.getLastRow() >= 2 && mMap['MODULE_CODE'] && mMap['DB_CONFIG_KEY'] && mMap['STATUS']) {
        var lastM = shMod.getLastRow();
        var rm;
        for (rm = 2; rm <= lastM; rm++) {
          var st = String(shMod.getRange(rm, mMap['STATUS']).getValue() || '').toUpperCase();
          if (st === 'INACTIVE') continue;
          var mc = String(shMod.getRange(rm, mMap['MODULE_CODE']).getValue() || '').trim().toUpperCase();
          if (!mc) continue;
          var dbKey = String(shMod.getRange(rm, mMap['DB_CONFIG_KEY']).getValue() || '').trim();
          if (!dbKey) {
            pushIssue('MODULE_NO_DB_CONFIG_KEY', mc);
            continue;
          }
          var erow = cbvConfigModuleFindEnvRow_(shEnv, envDefault, dbKey);
          if (erow < 2) {
            pushIssue('MODULE_DB_NOT_IN_ENV', mc + '/' + dbKey);
          } else {
            var evMap = cbvCoreV2ReadHeaderMap_(shEnv);
            var valCol = evMap['CONFIG_VALUE'];
            if (valCol) {
              var vid = String(shEnv.getRange(erow, valCol).getValue() || '').trim();
              if (!vid && mc !== 'CONFIG') {
                pushIssue('MODULE_DB_VALUE_EMPTY', mc + '/' + dbKey);
              }
            }
          }
        }
      }
    }

    var enums = Config_getEnum_('ROLE');
    if (!enums || !enums.length) {
      invalidEnums.push('ROLE group empty');
      pushIssue('ENUM_ROLE_EMPTY', '');
    } else {
      var hasAdmin = false;
      var ei;
      for (ei = 0; ei < enums.length; ei++) {
        if (String(enums[ei].ENUM_KEY || '').toUpperCase() === 'ADMIN') hasAdmin = true;
      }
      if (!hasAdmin) {
        invalidEnums.push('ROLE/ADMIN missing');
        pushIssue('ENUM_ROLE_ADMIN_MISSING', '');
      }
    }

    var shEnumAll = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.ENUM);
    if (shEnumAll && shEnumAll.getLastRow() >= 2) {
      var eMap = cbvCoreV2ReadHeaderMap_(shEnumAll);
      var gCol = eMap['ENUM_GROUP'];
      var kCol = eMap['ENUM_KEY'];
      if (gCol && kCol) {
        var seen = {};
        var lastE = shEnumAll.getLastRow();
        var re;
        for (re = 2; re <= lastE; re++) {
          var g = String(shEnumAll.getRange(re, gCol).getValue() || '').trim().toUpperCase();
          var k = String(shEnumAll.getRange(re, kCol).getValue() || '').trim().toUpperCase();
          if (!g || !k) continue;
          var sig = g + '\t' + k;
          if (seen[sig]) {
            invalidEnums.push('duplicate_enum:' + sig);
            pushIssue('DUPLICATE_ENUM', g + '/' + k);
          }
          seen[sig] = true;
        }
      }
    }

    var shRule = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.RULE);
    if (shRule && shRule.getLastRow() >= 2) {
      var rMap = cbvCoreV2ReadHeaderMap_(shRule);
      var rj = rMap['RULE_JSON'];
      if (rj) {
        var lastR = shRule.getLastRow();
        var rr;
        for (rr = 2; rr <= lastR; rr++) {
          var rawJ = String(shRule.getRange(rr, rj).getValue() || '').trim();
          if (!rawJ) continue;
          try {
            JSON.parse(rawJ);
          } catch (pex) {
            invalidRules.push('row_' + rr + '_invalid_json');
            pushIssue('RULE_JSON_INVALID', 'row_' + rr);
          }
        }
      }
    }

    var shReg = ss.getSheetByName(CBV_CONFIG_MODULE.TABLES.SHEET_REGISTRY);
    if (shReg && shReg.getLastRow() >= 2) {
      var regMap = cbvCoreV2ReadHeaderMap_(shReg);
      var mcC = regMap['MODULE_CODE'];
      var tcC = regMap['TABLE_CODE'];
      var snC = regMap['SHEET_NAME'];
      if (mcC && tcC && snC) {
        var mapPairToNames = {};
        var lastG = shReg.getLastRow();
        var rg;
        for (rg = 2; rg <= lastG; rg++) {
          var rmc = String(shReg.getRange(rg, mcC).getValue() || '').trim().toUpperCase();
          var rtc = String(shReg.getRange(rg, tcC).getValue() || '').trim().toUpperCase();
          var rsn = String(shReg.getRange(rg, snC).getValue() || '').trim();
          if (!rmc || !rtc) {
            pushIssue('SHEET_REGISTRY_INCOMPLETE_ROW', String(rg));
            continue;
          }
          if (!rsn) {
            pushIssue('SHEET_REGISTRY_EMPTY_NAME', rmc + '/' + rtc);
            continue;
          }
          var pk = rmc + '\t' + rtc;
          if (mapPairToNames[pk] && mapPairToNames[pk] !== rsn) {
            pushIssue('SHEET_REGISTRY_CONFLICT', pk + '=>' + mapPairToNames[pk] + '|' + rsn);
          } else {
            mapPairToNames[pk] = rsn;
          }
        }
      }
    }

    var rules = Config_getRules_('*');
    if (!rules || !rules.length) {
      invalidRules.push('no rules');
    }

    var finalOk = issues.length === 0;
    Logger.log('[Config_healthCheck_] ok=' + finalOk + ' issues=' + issues.join('|'));
    return {
      ok: finalOk,
      issues: issues.slice(),
      missingSheets: missingSheets,
      missingModules: missingModules,
      invalidEnums: invalidEnums,
      invalidRules: invalidRules,
      message: finalOk ? 'CONFIG module health OK' : 'CONFIG module health issues — see issues[]'
    };
  } catch (e) {
    Logger.log('[Config_healthCheck_] exception: ' + (e && e.message ? e.message : e));
    pushIssue('EXCEPTION', String(e && e.message ? e.message : e));
    return {
      ok: false,
      issues: issues.slice(),
      missingSheets: missingSheets,
      missingModules: missingModules,
      invalidEnums: invalidEnums,
      invalidRules: invalidRules,
      message: String(e && e.message ? e.message : e)
    };
  }
}
