/**
 * CONFIG V2_2 — verify sau import (sheet đích, khóa tự nhiên không trùng).
 * Không tạo sheet, không đổi header.
 * Dependencies: 150, 02, 196, 199 (cbvConfigV22ImportAssertTargetSheets_)
 */

/**
 * @returns {{
 *   ok: boolean,
 *   message: string,
 *   issues: string[],
 *   duplicateEnum: string[],
 *   duplicateRule: string[],
 *   duplicatePermission: string[],
 *   duplicateMapping: string[],
 *   duplicateTemplate: string[],
 *   duplicateFlag: string[],
 *   duplicateModule: string[],
 *   duplicateRegistry: string[]
 * }}
 */
function cbvConfigV22ImportVerifyImpl_() {
  var issues = [];
  var dupE = [];
  var dupR = [];
  var dupP = [];
  var dupM = [];
  var dupT = [];
  var dupF = [];
  var dupMod = [];
  var dupReg = [];

  function push(x) {
    issues.push(x);
  }

  var cfgSs = cbvConfigOpenSpreadsheet_();
  if (!cfgSs) {
    push('NO_CONFIG_DB');
    return {
      ok: false,
      message: 'CONFIG V2_2 IMPORT VERIFY FAILED',
      issues: issues.slice(),
      duplicateEnum: dupE,
      duplicateRule: dupR,
      duplicatePermission: dupP,
      duplicateMapping: dupM,
      duplicateTemplate: dupT,
      duplicateFlag: dupF,
      duplicateModule: dupMod,
      duplicateRegistry: dupReg
    };
  }

  var assert = cbvConfigV22ImportAssertTargetSheets_(cfgSs);
  if (!assert.ok) {
    var mi;
    for (mi = 0; mi < assert.missing.length; mi++) {
      push('MISSING_TARGET_SHEET:' + assert.missing[mi]);
    }
    return {
      ok: false,
      message: 'CONFIG V2_2 IMPORT VERIFY FAILED',
      issues: issues.slice(),
      duplicateEnum: dupE,
      duplicateRule: dupR,
      duplicatePermission: dupP,
      duplicateMapping: dupM,
      duplicateTemplate: dupT,
      duplicateFlag: dupF,
      duplicateModule: dupMod,
      duplicateRegistry: dupReg
    };
  }

  var shEnum = cfgSs.getSheetByName('CONFIG_ENUM');
  if (shEnum && shEnum.getLastRow() >= 2) {
    var eMap = cbvCoreV2ReadHeaderMap_(shEnum);
    var gCol = eMap['ENUM_GROUP'];
    var kCol = eMap['ENUM_KEY'];
    if (gCol && kCol) {
      var seenE = {};
      var lastE = shEnum.getLastRow();
      var re;
      for (re = 2; re <= lastE; re++) {
        var g = String(shEnum.getRange(re, gCol).getValue() || '').trim().toUpperCase();
        var k = String(shEnum.getRange(re, kCol).getValue() || '').trim().toUpperCase();
        if (!g || !k) continue;
        var sig = g + '\t' + k;
        if (seenE[sig]) {
          dupE.push(sig);
          push('DUPLICATE_ENUM:' + sig);
        }
        seenE[sig] = true;
      }
    }
  }

  var shRule = cfgSs.getSheetByName('CONFIG_RULE');
  if (shRule && shRule.getLastRow() >= 2) {
    var rMap = cbvCoreV2ReadHeaderMap_(shRule);
    var mcR = rMap['MODULE_CODE'];
    var rkR = rMap['RULE_KEY'];
    if (mcR && rkR) {
      var seenR = {};
      var lastR = shRule.getLastRow();
      var rr;
      for (rr = 2; rr <= lastR; rr++) {
        var mc = String(shRule.getRange(rr, mcR).getValue() || '').trim().toUpperCase();
        var rk = String(shRule.getRange(rr, rkR).getValue() || '').trim();
        if (!rk) continue;
        var sigR = mc + '\t' + rk;
        if (seenR[sigR]) {
          dupR.push(sigR);
          push('DUPLICATE_RULE:' + sigR);
        }
        seenR[sigR] = true;
      }
    }
  }

  var shPerm = cfgSs.getSheetByName('CONFIG_PERMISSION');
  if (shPerm && shPerm.getLastRow() >= 2) {
    var pMap = cbvCoreV2ReadHeaderMap_(shPerm);
    var emC = pMap['EMAIL'];
    var rkC = pMap['RULE_KEY'];
    var seenP = {};
    var lastP = shPerm.getLastRow();
    var rp;
    for (rp = 2; rp <= lastP; rp++) {
      var keyP = '';
      if (emC) keyP = String(shPerm.getRange(rp, emC).getValue() || '').trim().toLowerCase();
      else if (rkC) keyP = String(shPerm.getRange(rp, rkC).getValue() || '').trim().toLowerCase();
      if (!keyP) continue;
      if (seenP[keyP]) {
        dupP.push(keyP);
        push('DUPLICATE_PERMISSION:' + keyP);
      }
      seenP[keyP] = true;
    }
  }

  var shMap = cfgSs.getSheetByName('CONFIG_IMPORT_MAPPING');
  if (shMap && shMap.getLastRow() >= 2) {
    var mMap = cbvCoreV2ReadHeaderMap_(shMap);
    var mcCol = mMap['MAPPING_CODE'];
    if (mcCol) {
      var seenM = {};
      var lastM = shMap.getLastRow();
      var rm;
      for (rm = 2; rm <= lastM; rm++) {
        var code = String(shMap.getRange(rm, mcCol).getValue() || '').trim();
        if (!code) continue;
        if (seenM[code]) {
          dupM.push(code);
          push('DUPLICATE_MAPPING_CODE:' + code);
        }
        seenM[code] = true;
      }
    }
  }

  var shTpl = cfgSs.getSheetByName('CONFIG_TEMPLATE');
  if (shTpl && shTpl.getLastRow() >= 2) {
    var tMap = cbvCoreV2ReadHeaderMap_(shTpl);
    var tk = tMap['TEMPLATE_KEY'];
    if (tk) {
      var seenT = {};
      var lastT = shTpl.getLastRow();
      var rt;
      for (rt = 2; rt <= lastT; rt++) {
        var tkVal = String(shTpl.getRange(rt, tk).getValue() || '').trim();
        if (!tkVal) continue;
        if (seenT[tkVal]) {
          dupT.push(tkVal);
          push('DUPLICATE_TEMPLATE_KEY:' + tkVal);
        }
        seenT[tkVal] = true;
      }
    }
  }

  var shFf = cfgSs.getSheetByName('CONFIG_FEATURE_FLAG');
  if (shFf && shFf.getLastRow() >= 2) {
    var fMap = cbvCoreV2ReadHeaderMap_(shFf);
    var fk = fMap['FLAG_KEY'];
    if (fk) {
      var seenF = {};
      var lastF = shFf.getLastRow();
      var rf;
      for (rf = 2; rf <= lastF; rf++) {
        var fkVal = String(shFf.getRange(rf, fk).getValue() || '').trim();
        if (!fkVal) continue;
        if (seenF[fkVal]) {
          dupF.push(fkVal);
          push('DUPLICATE_FLAG_KEY:' + fkVal);
        }
        seenF[fkVal] = true;
      }
    }
  }

  var shMod = cfgSs.getSheetByName('CONFIG_MODULE');
  if (shMod && shMod.getLastRow() >= 2) {
    var modMap = cbvCoreV2ReadHeaderMap_(shMod);
    var mmc = modMap['MODULE_CODE'];
    if (mmc) {
      var seenMod = {};
      var lastMod = shMod.getLastRow();
      var rmod;
      for (rmod = 2; rmod <= lastMod; rmod++) {
        var mcv = String(shMod.getRange(rmod, mmc).getValue() || '').trim().toUpperCase();
        if (!mcv) continue;
        if (seenMod[mcv]) {
          dupMod.push(mcv);
          push('DUPLICATE_MODULE_CODE:' + mcv);
        }
        seenMod[mcv] = true;
      }
    }
  }

  var shReg = cfgSs.getSheetByName('CONFIG_SHEET_REGISTRY');
  if (shReg && shReg.getLastRow() >= 2) {
    var regMap = cbvCoreV2ReadHeaderMap_(shReg);
    var rmc = regMap['MODULE_CODE'];
    var rtc = regMap['TABLE_CODE'];
    if (rmc && rtc) {
      var seenReg = {};
      var lastG = shReg.getLastRow();
      var rg;
      for (rg = 2; rg <= lastG; rg++) {
        var rmcv = String(shReg.getRange(rg, rmc).getValue() || '').trim().toUpperCase();
        var rtcv = String(shReg.getRange(rg, rtc).getValue() || '').trim().toUpperCase();
        if (!rmcv || !rtcv) continue;
        var sigG = rmcv + '\t' + rtcv;
        if (seenReg[sigG]) {
          dupReg.push(sigG);
          push('DUPLICATE_REGISTRY:' + sigG);
        }
        seenReg[sigG] = true;
      }
    }
  }

  var ok = issues.length === 0;
  return {
    ok: ok,
    message: ok ? 'CONFIG V2_2 IMPORT OK' : 'CONFIG V2_2 IMPORT VERIFY FAILED',
    issues: issues.slice(),
    duplicateEnum: dupE,
    duplicateRule: dupR,
    duplicatePermission: dupP,
    duplicateMapping: dupM,
    duplicateTemplate: dupT,
    duplicateFlag: dupF,
    duplicateModule: dupMod,
    duplicateRegistry: dupReg
  };
}
