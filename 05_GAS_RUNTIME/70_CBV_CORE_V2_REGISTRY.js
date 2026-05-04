/**
 * CBV Core V2 — CBV_MODULE_REGISTRY read + seed.
 */

/**
 * @param {string} moduleCode
 * @returns {{ entryHandler: string, status: string, version: string } | null}
 */
function cbvCoreV2RegistryGetModule_(moduleCode) {
  var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.MODULE_REGISTRY);
  if (!sheet) return null;
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var codeCol = map['MODULE_CODE'];
  var handlerCol = map['ENTRY_HANDLER'];
  var statusCol = map['STATUS'];
  var verCol = map['VERSION'];
  if (!codeCol || !handlerCol) return null;
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var codes = sheet.getRange(2, codeCol, last, codeCol).getValues();
  var r;
  for (r = 0; r < codes.length; r++) {
    if (String(codes[r][0]).trim() === String(moduleCode || '').trim()) {
      var row = r + 2;
      return {
        entryHandler: String(handlerCol ? sheet.getRange(row, handlerCol).getValue() || '' : ''),
        status: String(statusCol ? sheet.getRange(row, statusCol).getValue() || '' : ''),
        version: String(verCol ? sheet.getRange(row, verCol).getValue() || '' : '')
      };
    }
  }
  return null;
}

/**
 * Idempotent seed of MODULE_REGISTRY rows (no delete; skip if MODULE_CODE exists).
 */
function cbvCoreV2RegistrySeed_() {
  var res = cbvCoreV2EnsureCoreSheet_('MODULE_REGISTRY', 'MODULE_REGISTRY');
  var sheet = res.sheet;
  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var now = cbvCoreV2IsoNow_();
  var rows = CBV_CORE_V2.MODULE_SEED_ROWS;
  var i;
  for (i = 0; i < rows.length; i++) {
    var seed = rows[i];
    var code = seed[0];
    if (cbvCoreV2FindFirstRowInColumn_(sheet, 'MODULE_CODE', code) >= 2) {
      continue;
    }
    var fields = {
      MODULE_CODE: seed[0],
      MODULE_NAME: seed[1],
      STATUS: seed[2],
      VERSION: seed[3],
      ENTRY_HANDLER: seed[4],
      OWNER: seed[5],
      IS_LEVEL6: seed[6],
      CREATED_AT: now,
      UPDATED_AT: now
    };
    cbvCoreV2AppendRowByHeaders_(sheet, fields);
    map = cbvCoreV2ReadHeaderMap_(sheet);
  }
}

/**
 * @param {Object} moduleDef
 * @returns {Object}
 */
function CBV_CoreV2_registerModule(moduleDef) {
  try {
    var def = moduleDef || {};
    var code = String(def.moduleCode || def.MODULE_CODE || '').trim();
    if (!code) {
      return { ok: false, code: 'VALIDATION_ERROR', message: 'moduleCode required', data: {}, error: { code: 'VALIDATION_ERROR', message: 'moduleCode required' } };
    }
    cbvCoreV2EnsureCoreSheet_('MODULE_REGISTRY', 'MODULE_REGISTRY');
    var sheet = cbvCoreV2GetSpreadsheet_().getSheetByName(CBV_CORE_V2.SHEETS.MODULE_REGISTRY);
    var map = cbvCoreV2ReadHeaderMap_(sheet);
    var now = cbvCoreV2IsoNow_();
    var row = cbvCoreV2FindFirstRowInColumn_(sheet, 'MODULE_CODE', code);
    var createdAtExisting = now;
    if (row >= 2 && map['CREATED_AT']) {
      createdAtExisting = sheet.getRange(row, map['CREATED_AT']).getValue() || now;
    }
    var fields = {
      MODULE_CODE: code,
      MODULE_NAME: def.moduleName || def.MODULE_NAME || code,
      STATUS: def.status || def.STATUS || 'ACTIVE',
      VERSION: def.version || def.VERSION || 'v1.0',
      ENTRY_HANDLER: def.entryHandler || def.ENTRY_HANDLER || '',
      OWNER: def.owner || def.OWNER || 'ADMIN',
      IS_LEVEL6: def.isLevel6 != null ? String(def.isLevel6) : (def.IS_LEVEL6 != null ? String(def.IS_LEVEL6) : 'FALSE'),
      CREATED_AT: createdAtExisting,
      UPDATED_AT: now
    };
    if (row >= 2) {
      cbvCoreV2UpdateRowByHeaders_(sheet, row, {
        MODULE_NAME: fields.MODULE_NAME,
        STATUS: fields.STATUS,
        VERSION: fields.VERSION,
        ENTRY_HANDLER: fields.ENTRY_HANDLER,
        OWNER: fields.OWNER,
        IS_LEVEL6: fields.IS_LEVEL6,
        UPDATED_AT: now
      });
    } else {
      cbvCoreV2AppendRowByHeaders_(sheet, fields);
    }
    return { ok: true, code: 'MODULE_REGISTERED', message: 'OK', data: { moduleCode: code }, error: null };
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    return { ok: false, code: n.code, message: n.message, data: {}, error: { code: n.code, message: n.message } };
  }
}
