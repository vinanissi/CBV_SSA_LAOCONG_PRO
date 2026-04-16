/**
 * CBV Bootstrap - Idempotent schema initialization.
 * Uses 06_DATABASE/schema_manifest as source of truth.
 * Never clears business data. Never overwrites existing valid rows.
 *
 * initAll(options) - Full bootstrap with audit-first, optional safe append.
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
 */
function _writeHeaders(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

/**
 * Ensures core business sheets exist with correct headers.
 * Idempotent: creates missing sheets, sets headers when empty or safely extendable.
 * @returns {Object} Structured result
 */
function ensureCoreSheetsExist() {
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
  result.message = result.ok ? 'Core sheets initialized' : 'Initialized with header mismatches - review required';
  return result;
}

/** @deprecated Use ensureCoreSheetsExist */
function initCoreSheets() {
  return ensureCoreSheetsExist();
}

/**
 * Ensures enum reference rows exist in an enum sheet. No duplicates.
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
 * Ensures enum data. Seeds ENUM_DICTIONARY, fills DISPLAY_TEXT.
 * Runs enum health check and includes summary in result.
 */
function ensureEnums() {
  initEnumData();
  var enumSeedResult = typeof seedEnumDictionary === 'function' ? seedEnumDictionary() : null;
  if (enumSeedResult && enumSeedResult.data && enumSeedResult.data.warnings) {
    return { warnings: enumSeedResult.data.warnings };
  }
  if (typeof ensureDisplayTextForEnumRows === 'function') {
    var r = ensureDisplayTextForEnumRows();
    if (r && r.updated > 0) return { warnings: ['Filled ' + r.updated + ' empty DISPLAY_TEXT in ENUM_DICTIONARY'] };
  }
  var enumHealth = typeof enumHealthCheck === 'function' ? enumHealthCheck({}) : null;
  if (enumHealth && !enumHealth.ok) {
    return {
      warnings: ['Enum health: ' + (enumHealth.status || 'WARN')],
      enumHealth: { status: enumHealth.status, enumRegistryValid: enumHealth.enumRegistryValid, enumUsageValid: enumHealth.enumUsageValid }
    };
  }
  return enumHealth ? { enumHealth: { status: enumHealth.status } } : {};
}

function initEnumData() {
  return cbvResponse(true, 'INIT_SKIPPED', 'No enum sheets defined in schema', { skipped: true }, []);
}

/**
 * Ensures master code display text. No structural changes.
 */
function ensureMasterCode() {
  if (typeof ensureDisplayTextForMasterCodeRows === 'function') {
    var r = ensureDisplayTextForMasterCodeRows();
    if (r && r.updated > 0) return { warnings: ['Filled ' + r.updated + ' empty DISPLAY_TEXT in MASTER_CODE'] };
  }
  return {};
}

function initSystemConfig() {
  return cbvResponse(true, 'INIT_SKIPPED', 'Config in code - no config sheet', { skipped: true }, []);
}

/**
 * Full bootstrap: sheets, schema, enums, audit, verify.
 * @param {Object} options - { appendMissingColumns, writeHealthLog, failOnCritical, verbose }
 * @returns {Object} Structured result
 */
function initAll(options) {
  var opts = mergeBootstrapOptions(options);
  var enumWarnings = [];
  var schemaResult = { schemaUpdated: false, appendedColumns: [], findings: [] };

  if (opts.verbose) Logger.log('initAll: starting with options ' + JSON.stringify(opts));

  var coreResult = ensureCoreSheetsExist();
  if (!coreResult.ok) {
    var errResult = buildBootstrapSummary({
      auditReport: { bootstrapSafe: false, appsheetReady: false, systemHealth: 'FAIL', totals: {}, mustFixNow: coreResult.errors, warnings: [] },
      schemaResult: schemaResult,
      verifyResult: { status: 'FAIL', blockers: coreResult.errors, reasons: [] }
    });
    errResult.ok = false;
    errResult.message = 'Core sheets failed: ' + (coreResult.errors || []).join('; ');
    if (opts.verbose) Logger.log('initAll: ' + JSON.stringify(errResult, null, 2));
    return errResult;
  }

  schemaResult = ensureSchema({ appendMissingColumns: opts.appendMissingColumns });
  if (schemaResult.findings && schemaResult.findings.length > 0 && opts.verbose) {
    Logger.log('ensureSchema findings: ' + schemaResult.findings.join('; '));
  }

  var enumResult = ensureEnums();
  if (enumResult.warnings) enumWarnings = Array.isArray(enumResult.warnings) ? enumResult.warnings : [enumResult.warnings];

  var mcResult = ensureMasterCode();
  if (mcResult.warnings) enumWarnings = enumWarnings.concat(Array.isArray(mcResult.warnings) ? mcResult.warnings : [mcResult.warnings]);

  if (typeof ensureDisplayTextForUserDirectoryRows === 'function') {
    var udResult = ensureDisplayTextForUserDirectoryRows();
    if (udResult && udResult.updated > 0) enumWarnings.push('Filled ' + udResult.updated + ' empty DISPLAY_NAME in USER_DIRECTORY');
  }

  initSystemConfig();

  var auditOpts = {
    autoFix: false,
    appendMissingColumns: false,
    writeHealthLog: opts.writeHealthLog,
    schemaResult: schemaResult
  };
  var audit = selfAuditBootstrapImpl(auditOpts);
  var auditReport = audit.auditReport || {};

  var abort = maybeAbortOnCritical(auditReport);
  if (opts.failOnCritical && abort.shouldAbort) {
    var abortResult = buildBootstrapSummary({
      auditReport: auditReport,
      schemaResult: schemaResult,
      verifyResult: { status: 'FAIL', blockers: [abort.reason], reasons: auditReport.mustFixNow || [] }
    });
    abortResult.ok = false;
    abortResult.message = 'Bootstrap aborted: ' + abort.reason;
    if (opts.verbose) Logger.log('initAll: ' + JSON.stringify(abortResult, null, 2));
    return abortResult;
  }

  var verify = verifyAppSheetReadinessImpl();
  var verifyResult = {
    status: verify.data && verify.data.appsheetReady ? 'PASS' : (verify.ok ? 'WARN' : 'FAIL'),
    blockers: verify.errors || [],
    reasons: (verify.data && verify.data.auditReport && verify.data.auditReport.mustFixNow) || []
  };

  var summary = buildBootstrapSummary({
    auditReport: auditReport,
    schemaResult: schemaResult,
    verifyResult: verifyResult
  });

  summary.data = summary.data || {};
  summary.data.createdSheets = coreResult.data.createdSheets || [];
  summary.data.existingSheets = coreResult.data.existingSheets || [];
  summary.data.updatedSheets = coreResult.data.updatedSheets || [];
  summary.data.warnings = (coreResult.data.warnings || []).concat(enumWarnings);
  summary.code = summary.ok ? 'INIT_OK' : 'INIT_WARN';
  summary.message = summary.ok ? 'Bootstrap completed' : 'Bootstrap completed with warnings - review nextSteps';

  if (opts.verbose) Logger.log('initAll: ' + JSON.stringify(summary, null, 2));
  return summary;
}
