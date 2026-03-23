/**
 * CBV Enum Sync Service - Production-grade enum governance.
 * ENUM_DICTIONARY is single source of truth. No silent drift.
 */

var _enumRegistryCache = null;
var _enumRegistryCacheTime = 0;
var ENUM_CACHE_TTL_MS = 60000;

function _enumGetSheet() {
  var name = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS) ? CBV_CONFIG.SHEETS.ENUM_DICTIONARY : 'ENUM_DICTIONARY';
  return SpreadsheetApp.getActive().getSheetByName(name) || null;
}

function _enumGetHeaders(sheet) {
  if (!sheet) return [];
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function _enumGetRows(sheet) {
  if (!sheet) return [];
  var tableName = (sheet.getName && sheet.getName() === 'ENUM_DICTIONARY') ? 'ENUM_DICTIONARY' : (sheet.getName ? sheet.getName() : '');
  var loaded = typeof loadSheetDataSafe === 'function' ? loadSheetDataSafe(sheet, tableName) : null;
  if (loaded) return loaded.rows;
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol === 0) return [];
  var headers = _enumGetHeaders(sheet);
  var raw = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var rowObjs = raw.map(function(row, idx) {
    var o = { _rowNumber: idx + 2 };
    headers.forEach(function(h, i) { o[h] = row[i]; });
    return o;
  });
  if (typeof filterRealDataRows === 'function' && typeof getMeaningfulFieldsForTable === 'function') {
    var meaningful = getMeaningfulFieldsForTable(tableName || 'ENUM_DICTIONARY', headers);
    return filterRealDataRows(rowObjs, meaningful);
  }
  return rowObjs;
}

function _mergeEnumOptions(opts) {
  opts = opts || {};
  return {
    activeOnly: opts.activeOnly !== false,
    includeInactive: opts.includeInactive === true
  };
}

/**
 * Load enum registry from ENUM_DICTIONARY. Structured by group.
 * @param {Object} options - { activeOnly, includeInactive }
 * @returns {{ groups: Object, rows: Object, byGroup: Object, rawRows: Array }}
 */
function loadEnumRegistry(options) {
  options = _mergeEnumOptions(options);
  var sheet = _enumGetSheet();
  if (!sheet) {
    return { groups: {}, rows: {}, byGroup: {}, rawRows: [], sheetExists: false };
  }
  var rawRows = _enumGetRows(sheet);
  var byGroup = {};
  var rows = {};
  rawRows.forEach(function(r) {
    var group = String(r.ENUM_GROUP || '').trim();
    var value = String(r.ENUM_VALUE || '').trim();
    if (!group || !value) return;
    var active = r.IS_ACTIVE === true || r.IS_ACTIVE === 'TRUE' || String(r.IS_ACTIVE) === 'true';
    if (options.activeOnly && !active) return;
    if (!byGroup[group]) byGroup[group] = [];
    if (byGroup[group].indexOf(value) === -1) byGroup[group].push(value);
    rows[group + '|' + value] = r;
  });
  Object.keys(byGroup).forEach(function(g) {
    byGroup[g].sort();
  });
  return { groups: byGroup, rows: rows, byGroup: byGroup, rawRows: rawRows, sheetExists: true };
}

/**
 * Validate registry integrity.
 * @param {Object} registry - from loadEnumRegistry
 * @param {Object} options
 * @returns {{ ok: boolean, duplicateRows: Array, blankGroup: Array, blankValue: Array, blankDisplayText: Array, invalidIsActive: Array, missingGroups: Array, missingValues: Object }}
 */
function validateEnumRegistry(registry, options) {
  options = options || {};
  var result = {
    ok: true,
    duplicateRows: [],
    blankGroup: [],
    blankValue: [],
    blankDisplayText: [],
    invalidIsActive: [],
    missingGroups: [],
    missingValues: {}
  };
  if (!registry || !registry.rawRows) return result;
  var seen = {};
  registry.rawRows.forEach(function(r, i) {
    var group = String(r.ENUM_GROUP || '').trim();
    var value = String(r.ENUM_VALUE || '').trim();
    if (!group) result.blankGroup.push({ row: i + 2 });
    if (!value) result.blankValue.push({ row: i + 2 });
    var key = group + '|' + value;
    if (key && seen[key]) result.duplicateRows.push({ group: group, value: value, row: i + 2 });
    seen[key] = true;
    var active = r.IS_ACTIVE === true || r.IS_ACTIVE === 'TRUE' || String(r.IS_ACTIVE) === 'true';
    if (active) {
      var dt = String(r.DISPLAY_TEXT || '').trim();
      if (!dt) result.blankDisplayText.push({ group: group, value: value, row: i + 2 });
    }
    var isActiveVal = r.IS_ACTIVE;
    if (isActiveVal !== undefined && isActiveVal !== null && isActiveVal !== true && isActiveVal !== false && String(isActiveVal).toUpperCase() !== 'TRUE' && String(isActiveVal).toUpperCase() !== 'FALSE') {
      result.invalidIsActive.push({ row: i + 2, value: isActiveVal });
    }
  });
  if (typeof ENUM_CONFIG !== 'undefined') {
    Object.keys(ENUM_CONFIG || {}).forEach(function(group) {
      var configVals = (ENUM_CONFIG[group] || []).map(function(v) { return v.value; });
      var regVals = (registry.byGroup || {})[group] || [];
      var missing = configVals.filter(function(v) { return regVals.indexOf(v) === -1; });
      if (missing.length > 0) {
        result.missingGroups.push(group);
        result.missingValues[group] = missing;
      }
    });
  }
  result.ok = result.duplicateRows.length === 0 && result.blankGroup.length === 0 && result.blankValue.length === 0 && result.missingGroups.length === 0;
  return result;
}

/**
 * @param {string} groupName
 * @param {Object} options - { activeOnly }
 * @returns {string[]}
 */
function getEnumValuesFromRegistry(groupName, options) {
  var reg = loadEnumRegistry(options || {});
  return (reg.byGroup || {})[groupName] || [];
}


/**
 * @param {string} groupName
 * @param {Object} options
 * @returns {Object} { ENUM_VALUE: DISPLAY_TEXT }
 */
function getEnumDisplayMap(groupName, options) {
  var reg = loadEnumRegistry(options || {});
  var map = {};
  (reg.rawRows || []).forEach(function(r) {
    var g = String(r.ENUM_GROUP || '').trim();
    if (g !== groupName) return;
    var active = r.IS_ACTIVE === true || r.IS_ACTIVE === 'TRUE' || String(r.IS_ACTIVE) === 'true';
    if ((options && options.activeOnly !== false) && !active) return;
    var v = String(r.ENUM_VALUE || '').trim();
    var dt = String(r.DISPLAY_TEXT || '').trim();
    map[v] = dt || v;
  });
  return map;
}

/**
 * @param {string} groupName
 * @param {Object} options
 * @returns {Object} { ENUM_VALUE: rowObject }
 */
function getEnumRowMap(groupName, options) {
  var reg = loadEnumRegistry(options || {});
  var map = {};
  (reg.rawRows || []).forEach(function(r) {
    var g = String(r.ENUM_GROUP || '').trim();
    if (g !== groupName) return;
    var active = r.IS_ACTIVE === true || r.IS_ACTIVE === 'TRUE' || String(r.IS_ACTIVE) === 'true';
    if ((options && options.activeOnly !== false) && !active) return;
    var v = String(r.ENUM_VALUE || '').trim();
    map[v] = r;
  });
  return map;
}

/**
 * Audit business table usage against enum registry.
 * @param {Object} options
 * @returns {{ ok: boolean, findings: Array }}
 */
function auditEnumUsageInBusinessTables(options) {
  options = options || {};
  var reg = loadEnumRegistry({ activeOnly: false });
  var findings = [];
  var usageConfig = typeof ENUM_USAGE_CONFIG !== 'undefined' ? ENUM_USAGE_CONFIG : [];
  usageConfig.forEach(function(uc) {
    var sheet = SpreadsheetApp.getActive().getSheetByName(uc.table);
    if (!sheet) return;
    var headers = _enumGetHeaders(sheet);
    var colIdx = headers.indexOf(uc.column);
    if (colIdx === -1) return;
    var validValues = (reg.byGroup || {})[uc.enumGroup] || [];
    var activeValues = getEnumValuesFromRegistry(uc.enumGroup, { activeOnly: true });
    var rows = _enumGetRows(sheet);
    var valueCounts = {};
    var invalidSamples = [];
    rows.forEach(function(r) {
      var val = String(r[uc.column] || '').trim();
      if (!val) {
        if (uc.required) {
          findings.push({ category: 'BLANK_REQUIRED', severity: 'HIGH', table: uc.table, column: uc.column, enumGroup: uc.enumGroup, invalidValue: '(blank)', rowCount: 1, sampleRowNumbers: [r._rowNumber || 0], suggestedFix: 'Fill required enum value' });
        }
        return;
      }
      valueCounts[val] = (valueCounts[val] || 0) + 1;
      var inRegistry = validValues.indexOf(val) !== -1;
      var isActive = activeValues.indexOf(val) !== -1;
      if (!inRegistry && invalidSamples.length < 5) {
        invalidSamples.push({ value: val, row: r._rowNumber || 0 });
      }
    });
    Object.keys(valueCounts).forEach(function(val) {
      var inRegistry = validValues.indexOf(val) !== -1;
      var isActive = activeValues.indexOf(val) !== -1;
      if (!inRegistry) {
        var samples = [];
        rows.forEach(function(r) {
          if (String(r[uc.column] || '').trim() === val && samples.length < 5) samples.push(r._rowNumber || 0);
        });
        findings.push({
          category: 'VALUE_NOT_IN_REGISTRY',
          severity: 'HIGH',
          table: uc.table,
          column: uc.column,
          enumGroup: uc.enumGroup,
          invalidValue: val,
          rowCount: valueCounts[val],
          sampleRowNumbers: samples,
          suggestedFix: 'Add ' + val + ' to ENUM_DICTIONARY or fix data'
        });
      } else if (!isActive) {
        findings.push({
          category: 'INACTIVE_ENUM_IN_USE',
          severity: 'MEDIUM',
          table: uc.table,
          column: uc.column,
          enumGroup: uc.enumGroup,
          invalidValue: val,
          rowCount: valueCounts[val],
          sampleRowNumbers: [],
          suggestedFix: 'Reactivate enum or migrate data'
        });
      }
    });
  });
  return { ok: findings.length === 0, findings: findings };
}

/**
 * Build enum snapshot for cache. Optional.
 */
function buildEnumSnapshot() {
  var reg = loadEnumRegistry({ activeOnly: false });
  return {
    at: new Date().toISOString(),
    byGroup: reg.byGroup,
    displayMaps: {}
  };
}

/**
 * Save snapshot to PropertiesService. Optional.
 */
function saveEnumSnapshot() {
  try {
    var snap = buildEnumSnapshot();
    PropertiesService.getScriptProperties().setProperty('ENUM_SNAPSHOT', JSON.stringify(snap));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Load snapshot from PropertiesService. Optional.
 */
function loadEnumSnapshot() {
  try {
    var json = PropertiesService.getScriptProperties().getProperty('ENUM_SNAPSHOT');
    return json ? JSON.parse(json) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Sync enum snapshot: build and save to PropertiesService.
 * @param {Object} options
 * @returns {{ ok: boolean, savedAt?: string, error?: string }}
 */
function syncEnumSnapshot(options) {
  options = options || {};
  try {
    var snap = buildEnumSnapshot();
    if (options.save !== false) {
      PropertiesService.getScriptProperties().setProperty('ENUM_SNAPSHOT', JSON.stringify(snap));
    }
    return { ok: true, savedAt: snap.at };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Full enum health check.
 * @param {Object} options
 * @returns {Object}
 */
function enumHealthCheck(options) {
  options = options || {};
  var reg = loadEnumRegistry({ activeOnly: false });
  var validation = validateEnumRegistry(reg, options);
  var usageAudit = auditEnumUsageInBusinessTables(options);
  var registryValid = validation.ok;
  var usageValid = usageAudit.ok;
  var status = (registryValid && usageValid) ? 'PASS' : ((!registryValid && !usageValid) ? 'FAIL' : 'WARN');
  return {
    ok: registryValid && usageValid,
    enumRegistryValid: registryValid,
    enumUsageValid: usageValid,
    status: status,
    missingGroups: validation.missingGroups,
    missingValues: validation.missingValues,
    duplicateRows: validation.duplicateRows,
    blankDisplayText: validation.blankDisplayText,
    invalidBusinessUsage: usageAudit.findings,
    summary: {
      duplicateCount: validation.duplicateRows.length,
      missingGroupCount: validation.missingGroups.length,
      blankDisplayCount: validation.blankDisplayText.length,
      invalidUsageCount: usageAudit.findings.length
    }
  };
}

/**
 * Safe repair: create missing enums, fill blank DISPLAY_TEXT. No destructive ops.
 * @param {Object} audit - from enumHealthCheck
 * @param {Object} options - { dryRun, createMissingEnums, fillMissingDisplayText }
 * @returns {Object}
 */
function repairEnumSafely(audit, options) {
  options = options || {};
  var dryRun = options.dryRun !== false;
  var createMissing = options.createMissingEnums === true;
  var fillDisplay = options.fillMissingDisplayText === true;
  var planned = [];
  var applied = [];
  var sheet = _enumGetSheet();
  if (!sheet) {
    return { ok: false, dryRun: dryRun, planned: [], applied: [], error: 'ENUM_DICTIONARY sheet missing' };
  }
  var headers = _enumGetHeaders(sheet);
  if (headers.indexOf('ENUM_GROUP') === -1 || headers.indexOf('ENUM_VALUE') === -1) {
    return { ok: false, dryRun: dryRun, planned: [], applied: [], error: 'ENUM_DICTIONARY missing required columns' };
  }
  if (createMissing && typeof ENUM_CONFIG !== 'undefined' && audit.missingValues) {
    Object.keys(audit.missingValues || {}).forEach(function(group) {
      var missing = audit.missingValues[group];
      var config = ENUM_CONFIG[group] || [];
      missing.forEach(function(val) {
        var spec = null;
        for (var j = 0; j < config.length; j++) {
          if (config[j].value === val) { spec = config[j]; break; }
        }
        if (!spec) spec = { value: val, displayText: val, sortOrder: 99, isActive: true };
        planned.push({ action: 'CREATE', group: group, value: spec.value, displayText: spec.displayText });
        if (!dryRun) {
          var record = {
            ID: typeof cbvMakeId === 'function' ? cbvMakeId('ENUM') : 'ENUM_' + Date.now(),
            ENUM_GROUP: group,
            ENUM_VALUE: spec.value,
            DISPLAY_TEXT: spec.displayText || spec.value,
            SORT_ORDER: spec.sortOrder != null ? spec.sortOrder : 99,
            IS_ACTIVE: spec.isActive !== false,
            NOTE: '',
            CREATED_AT: new Date(),
            CREATED_BY: typeof cbvUser === 'function' ? cbvUser() : 'system',
            UPDATED_AT: new Date(),
            UPDATED_BY: typeof cbvUser === 'function' ? cbvUser() : 'system'
          };
          var row = headers.map(function(h) { return record[h] !== undefined ? record[h] : ''; });
          sheet.appendRow(row);
          applied.push({ action: 'CREATE', group: group, value: spec.value });
        }
      });
    });
  }
  if (fillDisplay && audit.blankDisplayText && audit.blankDisplayText.length > 0) {
    var displayIdx = headers.indexOf('DISPLAY_TEXT');
    if (displayIdx !== -1) {
      var rows = _enumGetRows(sheet);
      audit.blankDisplayText.forEach(function(b) {
        var r = rows[b.row - 2];
        if (r && r.ENUM_VALUE) {
          planned.push({ action: 'FILL_DISPLAY', group: b.group, value: b.value, row: b.row });
          if (!dryRun) {
            var rowNum = r._rowNumber;
            sheet.getRange(rowNum, displayIdx + 1).setValue(r.ENUM_VALUE);
            applied.push({ action: 'FILL_DISPLAY', group: b.group, value: b.value });
          }
        }
      });
    }
  }
  if (typeof clearEnumCache === 'function') clearEnumCache();
  return { ok: true, dryRun: dryRun, planned: planned, applied: applied };
}

/**
 * Run safe enum repair. Delegates to repairEnumSafely.
 * @param {Object} options - { dryRun, createMissingEnums, fillMissingDisplayText }
 * @returns {Object}
 */
function runSafeRepair(options) {
  options = options || {};
  var dryRun = options.dryRun !== false;
  var audit = typeof enumHealthCheck === 'function' ? enumHealthCheck(options) : null;
  if (!audit) return { ok: false, error: 'enumHealthCheck not available' };
  return repairEnumSafely(audit, {
    dryRun: dryRun,
    createMissingEnums: options.createMissingEnums === true,
    fillMissingDisplayText: options.fillMissingDisplayText === true
  });
}

/**
 * Audit enum health for bootstrap. Converts enumHealthCheck to audit findings.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {Array} findings - mutable findings array
 * @returns {string} AUDIT_SECTION_RESULT
 */
function auditEnumHealthSync(ss, findings) {
  if (typeof enumHealthCheck !== 'function' || typeof _auditAddFinding !== 'function' || typeof _auditCreateFinding !== 'function') return (typeof AUDIT_SECTION_RESULT !== 'undefined' ? AUDIT_SECTION_RESULT : {}).PASS || 'PASS';
  var health = enumHealthCheck({});
  var hasFail = false;
  if (!health.enumRegistryValid) {
    (health.duplicateRows || []).forEach(function(d) {
      _auditAddFinding(findings, _auditCreateFinding('ENUM', 'ENUM_DUPLICATES', AUDIT_SEVERITY.HIGH, 'FAIL', 'ENUM_DICTIONARY', '', 'ENUM_DUPLICATE_VALUE', 'Duplicate ' + (d.group || '') + '=' + (d.value || '') + ' (row ' + (d.row || '') + ')', 'Remove duplicate row'));
      hasFail = true;
    });
    (health.missingGroups || []).forEach(function(g) {
      _auditAddFinding(findings, _auditCreateFinding('ENUM', 'ENUM_MISSING_GROUP', AUDIT_SEVERITY.HIGH, 'FAIL', 'ENUM_DICTIONARY', '', 'ENUM_MISSING_GROUP', 'Missing required enum group: ' + g, 'Run seedEnumDictionary() or repairEnumSafely({ createMissingEnums: true })'));
      hasFail = true;
    });
  }
  if (!health.enumUsageValid && health.invalidBusinessUsage) {
    health.invalidBusinessUsage.slice(0, 10).forEach(function(f) {
      if (f.category === 'VALUE_NOT_IN_REGISTRY' || f.category === 'BLANK_REQUIRED') {
        _auditAddFinding(findings, _auditCreateFinding('ENUM', 'ENUM_USAGE', f.severity === 'HIGH' ? AUDIT_SEVERITY.HIGH : AUDIT_SEVERITY.MEDIUM, 'FAIL', f.table || '', f.column || '', 'ENUM_INVALID_USAGE', (f.table || '') + '.' + (f.column || '') + ': ' + (f.invalidValue || '') + ' (' + (f.rowCount || 0) + ' rows)', f.suggestedFix || ''));
        hasFail = true;
      }
    });
  }
  return hasFail ? AUDIT_SECTION_RESULT.FAIL : AUDIT_SECTION_RESULT.PASS;
}

/**
 * Clear enum cache. Call after repair or manual edits.
 */
function clearEnumSyncCache() {
  _enumRegistryCache = null;
  _enumRegistryCacheTime = 0;
  if (typeof clearEnumCache === 'function') clearEnumCache();
}
