/**
 * CBV Bootstrap - Idempotent schema initialization.
 * Uses 06_DATABASE/schema_manifest as source of truth.
 * Never clears business data. Never overwrites existing valid rows.
 */

/**
 * Ensures a sheet exists. Creates it if missing.
 * @param {string} name - Sheet name
 * @returns {{ created: boolean, sheet: GoogleAppsScript.Spreadsheet.Sheet }}
 */
function ensureSheetExists(name) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(name);
  const created = !sheet;
  if (!sheet) sheet = ss.insertSheet(name);
  return { created: created, sheet: sheet };
}

/**
 * Compares current headers to expected. Reports match, mismatch, or safe-to-extend.
 * Does NOT modify headers. Only reports.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string[]} expectedHeaders
 * @returns {{ match: boolean, currentHeaders: string[], expectedHeaders: string[], mismatchReason?: string, canExtend?: boolean }}
 */
function ensureHeadersMatchOrReport(sheet, expectedHeaders) {
  const lastCol = sheet.getLastColumn();
  const currentHeaders = lastCol > 0
    ? sheet.getRange(1, 1, 1, lastCol).getValues()[0]
    : [];

  if (currentHeaders.length === 0) {
    return { match: false, currentHeaders: [], expectedHeaders: expectedHeaders, canExtend: true };
  }

  const expectedLen = expectedHeaders.length;
  const currentLen = currentHeaders.length;

  if (currentLen > expectedLen) {
    const extra = currentHeaders.slice(expectedLen);
    return {
      match: false,
      currentHeaders: currentHeaders,
      expectedHeaders: expectedHeaders,
      mismatchReason: 'EXTRA_COLUMNS',
      extraColumns: extra
    };
  }

  for (let i = 0; i < Math.min(currentLen, expectedLen); i++) {
    const c = String(currentHeaders[i] || '').trim();
    const e = String(expectedHeaders[i] || '').trim();
    if (c !== e) {
      return {
        match: false,
        currentHeaders: currentHeaders,
        expectedHeaders: expectedHeaders,
        mismatchReason: 'HEADER_MISMATCH',
        mismatchAt: i,
        expected: e,
        actual: c
      };
    }
  }

  if (currentLen < expectedLen) {
    return {
      match: false,
      currentHeaders: currentHeaders,
      expectedHeaders: expectedHeaders,
      canExtend: true,
      missingCount: expectedLen - currentLen
    };
  }

  return { match: true, currentHeaders: currentHeaders, expectedHeaders: expectedHeaders };
}

/**
 * Writes headers to row 1. Only used when sheet is empty or safe to extend.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string[]} headers
 */
function _writeHeaders(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

/**
 * Initializes all core business sheets with correct headers.
 * Idempotent: creates missing sheets, sets headers only when empty or safely extendable.
 * Reports mismatches without destructive fix.
 * @returns {Object} Structured bootstrap result
 */
function initCoreSheets() {
  const result = buildStructuredBootstrapReport();
  const sheetNames = getRequiredSheetNames();

  sheetNames.forEach(function (name) {
    const headers = getSchemaHeaders(name);
    const { created, sheet } = ensureSheetExists(name);
    const check = ensureHeadersMatchOrReport(sheet, headers);

    if (created) {
      _writeHeaders(sheet, headers);
      result.data.createdSheets.push(name);
    } else if (check.match) {
      result.data.existingSheets.push(name);
    } else if (check.canExtend && check.missingCount) {
      _writeHeaders(sheet, headers);
      result.data.updatedSheets.push(name);
      result.data.warnings.push('Extended headers for ' + name + ' (+' + check.missingCount + ' columns)');
    } else if (check.mismatchReason === 'EXTRA_COLUMNS' || check.mismatchReason === 'HEADER_MISMATCH') {
      result.data.mismatchedSheets.push({
        sheet: name,
        reason: check.mismatchReason,
        detail: check.mismatchReason === 'HEADER_MISMATCH'
          ? 'At col ' + (check.mismatchAt + 1) + ': expected "' + check.expected + '", got "' + check.actual + '"'
          : 'Extra columns: ' + (check.extraColumns || []).join(', ')
      });
      result.errors.push('Header mismatch on ' + name + ' - manual review required');
    }
  });

  result.ok = result.data.mismatchedSheets.length === 0;
  result.code = result.ok ? 'INIT_OK' : 'INIT_MISMATCH';
  result.message = result.ok
    ? 'Core sheets initialized'
    : 'Initialized with header mismatches - review required';

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Ensures enum reference rows exist in an enum sheet. No duplicates.
 * No enum sheets in schema - initEnumData returns skipped.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} keyColumn - Column name for dedup (e.g. VALUE)
 * @param {Array<Object>} rows - Rows to ensure exist
 * @returns {{ added: number, skipped: number }}
 */
function ensureEnumRows(sheet, keyColumn, rows) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0 || !rows || rows.length === 0) return { added: 0, skipped: 0 };
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const keyIdx = headers.indexOf(keyColumn);
  if (keyIdx === -1) return { added: 0, skipped: rows.length };
  const lastRow = sheet.getLastRow();
  const existing = lastRow < 2 ? [] : sheet.getRange(2, 1, lastRow, headers.length).getValues();
  const existingKeys = existing.map(function (r) { return String(r[keyIdx] || ''); });
  let added = 0;
  rows.forEach(function (row) {
    const key = String(row[keyColumn] != null ? row[keyColumn] : '');
    if (key && existingKeys.indexOf(key) === -1) {
      const r = headers.map(function (h) { return row[h] !== undefined ? row[h] : ''; });
      sheet.appendRow(r);
      existingKeys.push(key);
      added++;
    }
  });
  return { added: added, skipped: rows.length - added };
}

/**
 * Ensures enum reference rows exist. No enum sheets in schema - returns skipped.
 * @returns {Object} Structured result
 */
function initEnumData() {
  return cbvResponse(true, 'INIT_SKIPPED', 'No enum sheets defined in schema', { skipped: true }, []);
}

/**
 * Ensures system config placeholders. Config is in 00_CORE_CONFIG.gs - returns skipped.
 * @returns {Object} Structured result
 */
function initSystemConfig() {
  return cbvResponse(true, 'INIT_SKIPPED', 'Config in code - no config sheet', { skipped: true }, []);
}

/**
 * Full bootstrap: sheets, headers, menus (via onOpen), audit helpers.
 * Does NOT install triggers - use installTriggers() separately.
 * @returns {Object} Structured bootstrap result
 */
function initAll() {
  const report = buildStructuredBootstrapReport();
  const sheetResult = initCoreSheets();

  report.data.createdSheets = sheetResult.data.createdSheets || [];
  report.data.existingSheets = sheetResult.data.existingSheets || [];
  report.data.updatedSheets = sheetResult.data.updatedSheets || [];
  report.data.mismatchedSheets = sheetResult.data.mismatchedSheets || [];
  report.data.warnings = (report.data.warnings || []).concat(sheetResult.data.warnings || []);
  report.errors = (report.errors || []).concat(sheetResult.errors || []);

  initEnumData();
  var enumSeedResult = typeof seedEnumDictionary === 'function' ? seedEnumDictionary() : null;
  if (enumSeedResult && enumSeedResult.data && enumSeedResult.data.warnings) {
    report.data.warnings = (report.data.warnings || []).concat(enumSeedResult.data.warnings);
  }
  if (typeof ensureDisplayTextForEnumRows === 'function') {
    var enumDisplayResult = ensureDisplayTextForEnumRows();
    if (enumDisplayResult && enumDisplayResult.updated > 0) {
      report.data.warnings = (report.data.warnings || []).concat(['Filled ' + enumDisplayResult.updated + ' empty DISPLAY_TEXT in ENUM_DICTIONARY']);
    }
  }
  if (typeof ensureDisplayTextForMasterCodeRows === 'function') {
    var mcDisplayResult = ensureDisplayTextForMasterCodeRows();
    if (mcDisplayResult && mcDisplayResult.updated > 0) {
      report.data.warnings = (report.data.warnings || []).concat(['Filled ' + mcDisplayResult.updated + ' empty DISPLAY_TEXT in MASTER_CODE']);
    }
  }
  initSystemConfig();

  report.ok = sheetResult.ok;
  report.code = sheetResult.code;
  report.message = sheetResult.ok ? 'Bootstrap completed' : 'Bootstrap completed with errors - review mismatched sheets';

  Logger.log('initAll: ' + JSON.stringify(report, null, 2));
  return report;
}
