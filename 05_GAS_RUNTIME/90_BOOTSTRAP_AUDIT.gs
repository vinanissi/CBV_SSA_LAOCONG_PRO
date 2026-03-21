/**
 * CBV Bootstrap Audit - Production-grade full system health check.
 * selfAuditBootstrap() orchestrates modular sub-audits.
 * Read-safe, idempotent, structured output. No auto-fix by default.
 */

// --- Audit helpers (safe, no throw) ---

function _auditGetSheet(name) {
  return SpreadsheetApp.getActive().getSheetByName(name) || null;
}

function _auditGetHeaders(sheet) {
  if (!sheet) return [];
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

/** Get all data rows (row 2 to lastRow). Does not use lastRow-1. */
function _auditGetRows(sheet) {
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol === 0) return [];
  var headers = _auditGetHeaders(sheet);
  var rows = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  return rows.map(function(row, idx) {
    var o = { _rowNumber: idx + 2 };
    headers.forEach(function(h, i) { o[h] = row[i]; });
    return o;
  });
}

function _auditAddFinding(findings, finding) {
  findings.push(finding);
  return finding;
}

function _auditCreateFinding(category, check, severity, status, table, column, issueCode, message, suggestedFix) {
  return {
    category: category,
    check: check,
    severity: severity || AUDIT_SEVERITY.MEDIUM,
    status: status,
    table: table || '',
    column: column || '',
    issue_code: issueCode || '',
    message: message || '',
    suggested_fix: suggestedFix || ''
  };
}

// --- Sub-audits ---

function auditSheetsExist(requiredSheets, ss, findings) {
  var existing = ss.getSheets().map(function(s) { return s.getName(); });
  var missing = requiredSheets.filter(function(n) { return existing.indexOf(n) === -1; });
  missing.forEach(function(name) {
    _auditAddFinding(findings, _auditCreateFinding(
      'SCHEMA', 'SHEETS_EXIST', AUDIT_SEVERITY.CRITICAL, 'FAIL', name, '', 'SCHEMA_MISSING_SHEET',
      'Required sheet "' + name + '" is missing',
      'Run initAll() or create sheet "' + name + '"'
    ));
  });
  return missing.length === 0 ? AUDIT_SECTION_RESULT.PASS : AUDIT_SECTION_RESULT.FAIL;
}

function auditSchemaIntegrity(requiredSheets, ss, findings) {
  var hasFail = false;
  requiredSheets.forEach(function(name) {
    var sheet = _auditGetSheet(name);
    if (!sheet) return;
    var expected = getSchemaHeaders(name);
    var current = _auditGetHeaders(sheet);
    if (current.length === 0 && expected.length > 0) {
      _auditAddFinding(findings, _auditCreateFinding('SCHEMA', 'SCHEMA_HEADERS', AUDIT_SEVERITY.HIGH, 'FAIL', name, '', 'SCHEMA_EMPTY_HEADERS', 'Sheet "' + name + '" has no headers', 'Run initCoreSheets()'));
      hasFail = true;
    }
  });
  return hasFail ? AUDIT_SECTION_RESULT.FAIL : AUDIT_SECTION_RESULT.PASS;
}

function auditDuplicateHeaders(sheetName, sheet, findings) {
  var headers = _auditGetHeaders(sheet);
  var seen = {};
  var dupes = [];
  headers.forEach(function(h, i) {
    var k = String(h || '').trim();
    if (!k) return;
    if (seen[k]) dupes.push({ col: i + 1, name: k });
    seen[k] = true;
  });
  dupes.forEach(function(d) {
    _auditAddFinding(findings, _auditCreateFinding('SCHEMA', 'DUPLICATE_HEADERS', AUDIT_SEVERITY.HIGH, 'FAIL', sheetName, d.name, 'SCHEMA_DUPLICATE_HEADER', 'Duplicate header "' + d.name + '" in ' + sheetName, 'Remove duplicate column; reorder manually if needed'));
  });
  return dupes.length > 0 ? AUDIT_SECTION_RESULT.FAIL : AUDIT_SECTION_RESULT.PASS;
}

function auditMissingRequiredColumns(sheetName, sheet, spec, findings) {
  var headers = _auditGetHeaders(sheet);
  var missing = (spec.requiredColumns || []).filter(function(c) { return headers.indexOf(c) === -1; });
  missing.forEach(function(col) {
    _auditAddFinding(findings, _auditCreateFinding('SCHEMA', 'MISSING_REQUIRED_COLUMNS', AUDIT_SEVERITY.HIGH, 'FAIL', sheetName, col, 'SCHEMA_MISSING_COLUMN', 'Required column "' + col + '" is missing in ' + sheetName, 'Append "' + col + '" to header row; regenerate AppSheet schema'));
  });
  return missing.length > 0 ? AUDIT_SECTION_RESULT.FAIL : AUDIT_SECTION_RESULT.PASS;
}

function auditUnexpectedColumns(sheetName, sheet, spec, findings) {
  var headers = _auditGetHeaders(sheet);
  var allowed = (spec.requiredColumns || []).concat(spec.optionalColumns || []);
  var unexpected = headers.filter(function(h) {
    var k = String(h || '').trim();
    return k && allowed.indexOf(k) === -1;
  });
  unexpected.forEach(function(col) {
    _auditAddFinding(findings, _auditCreateFinding('SCHEMA', 'UNEXPECTED_COLUMNS', AUDIT_SEVERITY.LOW, 'WARN', sheetName, col, 'SCHEMA_UNEXPECTED_COLUMN', 'Unexpected column "' + col + '" in ' + sheetName, 'Document or remove if not needed'));
  });
  return unexpected.length > 0 ? AUDIT_SECTION_RESULT.WARN : AUDIT_SECTION_RESULT.PASS;
}

function auditBlankHeaders(sheetName, sheet, findings) {
  var headers = _auditGetHeaders(sheet);
  var blankIndices = [];
  headers.forEach(function(h, i) {
    if (String(h || '').trim() === '') blankIndices.push(i + 1);
  });
  blankIndices.forEach(function(colNum) {
    _auditAddFinding(findings, _auditCreateFinding('SCHEMA', 'BLANK_HEADERS', AUDIT_SEVERITY.HIGH, 'FAIL', sheetName, 'col' + colNum, 'SCHEMA_BLANK_HEADER', 'Blank header at column ' + colNum + ' in ' + sheetName, 'AppSheet will fail; add header or remove column'));
  });
  return blankIndices.length > 0 ? AUDIT_SECTION_RESULT.FAIL : AUDIT_SECTION_RESULT.PASS;
}

function auditEnumIntegrity(ss, findings) {
  var sheet = _auditGetSheet(CBV_CONFIG.SHEETS.ENUM_DICTIONARY);
  if (!sheet || sheet.getLastRow() < 2) {
    _auditAddFinding(findings, _auditCreateFinding('ENUM', 'ENUM_SHEET', AUDIT_SEVERITY.MEDIUM, 'WARN', 'ENUM_DICTIONARY', '', 'ENUM_MISSING_OR_EMPTY', 'ENUM_DICTIONARY missing or empty - GAS uses fallback', 'Run seedEnumDictionary()'));
    return AUDIT_SECTION_RESULT.WARN;
  }
  var headers = _auditGetHeaders(sheet);
  var groupIdx = headers.indexOf('ENUM_GROUP');
  var valueIdx = headers.indexOf('ENUM_VALUE');
  var displayIdx = headers.indexOf('DISPLAY_TEXT');
  var activeIdx = headers.indexOf('IS_ACTIVE');
  if (groupIdx === -1 || valueIdx === -1) {
    _auditAddFinding(findings, _auditCreateFinding('ENUM', 'ENUM_COLUMNS', AUDIT_SEVERITY.CRITICAL, 'FAIL', 'ENUM_DICTIONARY', '', 'ENUM_MISSING_COLUMNS', 'ENUM_DICTIONARY missing ENUM_GROUP or ENUM_VALUE', 'Fix schema'));
    return AUDIT_SECTION_RESULT.FAIL;
  }
  var rows = _auditGetRows(sheet);
  var seen = {};
  var dupes = [];
  rows.forEach(function(row, i) {
    var g = String(row.ENUM_GROUP || row[groupIdx] || '').trim();
    var v = String(row.ENUM_VALUE || row[valueIdx] || '').trim();
    if (!g || !v) return;
    var key = g + '|' + v;
    if (seen[key]) dupes.push({ group: g, value: v, row: i + 2 });
    seen[key] = true;
  });
  dupes.forEach(function(d) {
    _auditAddFinding(findings, _auditCreateFinding('ENUM', 'ENUM_DUPLICATES', AUDIT_SEVERITY.HIGH, 'FAIL', 'ENUM_DICTIONARY', '', 'ENUM_DUPLICATE_VALUE', 'Duplicate ' + d.group + '=' + d.value, 'Remove duplicate row'));
  });
  return dupes.length > 0 ? AUDIT_SECTION_RESULT.FAIL : AUDIT_SECTION_RESULT.PASS;
}

function auditMasterCodeIntegrity(ss, findings) {
  var sheet = _auditGetSheet(CBV_CONFIG.SHEETS.MASTER_CODE);
  if (!sheet || sheet.getLastRow() < 2) {
    _auditAddFinding(findings, _auditCreateFinding('MASTER_CODE', 'MC_EXISTS', AUDIT_SEVERITY.INFO, 'PASS', 'MASTER_CODE', '', 'MC_EMPTY', 'MASTER_CODE empty (OK for new system)', ''));
    return AUDIT_SECTION_RESULT.PASS;
  }
  var rows = _auditGetRows(sheet);
  var idCount = {};
  rows.forEach(function(r) {
    var id = String(r.ID || '').trim();
    if (id) idCount[id] = (idCount[id] || 0) + 1;
  });
  Object.keys(idCount).forEach(function(id) {
    if (idCount[id] > 1) {
      _auditAddFinding(findings, _auditCreateFinding('MASTER_CODE', 'MC_DUPLICATE_ID', AUDIT_SEVERITY.CRITICAL, 'FAIL', 'MASTER_CODE', 'ID', 'MC_DUPLICATE_ID', 'Duplicate ID: ' + id, 'Fix duplicate manually'));
    }
  });
  return Object.keys(idCount).some(function(id) { return idCount[id] > 1; }) ? AUDIT_SECTION_RESULT.FAIL : AUDIT_SECTION_RESULT.PASS;
}

/**
 * Audits USER_DIRECTORY: duplicate ID, duplicate USER_CODE, duplicate EMAIL, invalid ROLE, invalid STATUS, orphan HTX_ID.
 * @returns {Object} auditUserDirectory result for standalone use
 */
function auditUserDirectory() {
  var findings = [];
  var ss = SpreadsheetApp.getActive();
  var sheet = _auditGetSheet(CBV_CONFIG.SHEETS.USER_DIRECTORY);
  if (!sheet || sheet.getLastRow() < 2) {
    return { ok: true, code: 'USER_AUDIT_OK', message: 'USER_DIRECTORY empty (OK)', data: { findings: [] } };
  }
  var headers = _auditGetHeaders(sheet);
  var rows = _auditGetRows(sheet);
  var idIdx = headers.indexOf('ID');
  var codeIdx = headers.indexOf('USER_CODE');
  var emailIdx = headers.indexOf('EMAIL');
  var roleIdx = headers.indexOf('ROLE');
  var statusIdx = headers.indexOf('STATUS');
  var htxIdx = headers.indexOf('HTX_ID');
  var validRoles = ['ADMIN', 'OPERATOR', 'VIEWER'];
  var validStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];

  var idCount = {};
  var codeCount = {};
  var emailCount = {};
  rows.forEach(function(r) {
    var id = idIdx >= 0 ? String(r.ID || '').trim() : '';
    var code = codeIdx >= 0 ? String(r.USER_CODE || '').trim().toLowerCase() : '';
    var email = emailIdx >= 0 ? String(r.EMAIL || '').trim().toLowerCase() : '';
    if (id) idCount[id] = (idCount[id] || 0) + 1;
    if (code) codeCount[code] = (codeCount[code] || 0) + 1;
    if (email) emailCount[email] = (emailCount[email] || 0) + 1;
  });
  Object.keys(idCount).forEach(function(id) {
    if (idCount[id] > 1) {
      findings.push({ severity: 'CRITICAL', table: 'USER_DIRECTORY', column: 'ID', issue: 'UD_DUPLICATE_ID', message: 'Duplicate ID: ' + id });
    }
  });
  Object.keys(codeCount).forEach(function(c) {
    if (codeCount[c] > 1) {
      findings.push({ severity: 'HIGH', table: 'USER_DIRECTORY', column: 'USER_CODE', issue: 'UD_DUPLICATE_USER_CODE', message: 'Duplicate USER_CODE: ' + c });
    }
  });
  Object.keys(emailCount).forEach(function(e) {
    if (emailCount[e] > 1) {
      findings.push({ severity: 'HIGH', table: 'USER_DIRECTORY', column: 'EMAIL', issue: 'UD_DUPLICATE_EMAIL', message: 'Duplicate EMAIL: ' + e });
    }
  });

  var hoSoIds = {};
  var hoSoSheet = _auditGetSheet(CBV_CONFIG.SHEETS.HO_SO_MASTER);
  if (hoSoSheet && hoSoSheet.getLastRow() >= 2) {
    _auditGetRows(hoSoSheet).forEach(function(r) {
      if (String(r.HO_SO_TYPE || '').trim() === 'HTX') hoSoIds[String(r.ID || '').trim()] = true;
    });
  }

  rows.forEach(function(r, i) {
    var role = roleIdx >= 0 ? String(r.ROLE || '').trim() : '';
    var status = statusIdx >= 0 ? String(r.STATUS || '').trim() : '';
    var htxId = htxIdx >= 0 ? String(r.HTX_ID || '').trim() : '';
    if (role && validRoles.indexOf(role) === -1) {
      findings.push({ severity: 'HIGH', table: 'USER_DIRECTORY', column: 'ROLE', issue: 'UD_INVALID_ROLE', message: 'Row ' + (i + 2) + ': invalid ROLE ' + role });
    }
    if (status && validStatuses.indexOf(status) === -1) {
      findings.push({ severity: 'HIGH', table: 'USER_DIRECTORY', column: 'STATUS', issue: 'UD_INVALID_STATUS', message: 'Row ' + (i + 2) + ': invalid STATUS ' + status });
    }
    if (htxId && !hoSoIds[htxId]) {
      findings.push({ severity: 'MEDIUM', table: 'USER_DIRECTORY', column: 'HTX_ID', issue: 'UD_ORPHAN_HTX', message: 'Row ' + (i + 2) + ': HTX_ID ' + htxId + ' not found or not HTX' });
    }
  });

  var ok = findings.filter(function(f) { return f.severity === 'CRITICAL' || f.severity === 'HIGH'; }).length === 0;
  return {
    ok: ok,
    code: ok ? 'USER_AUDIT_OK' : 'USER_AUDIT_FAIL',
    message: ok ? 'USER_DIRECTORY audit passed' : 'USER_DIRECTORY has ' + findings.length + ' finding(s)',
    data: { findings: findings }
  };
}

function auditRefIntegrity(refSpecs, ss, findings) {
  var hasFail = false;
  refSpecs.forEach(function(ref) {
    var childSheet = _auditGetSheet(ref.child);
    if (!childSheet || childSheet.getLastRow() < 2) return;
    var parentSheet = _auditGetSheet(ref.parent);
    if (!parentSheet) return;
    var childRows = _auditGetRows(childSheet);
    var parentIds = {};
    _auditGetRows(parentSheet).forEach(function(r) {
      parentIds[String(r[ref.parentKey] || r.ID || '')] = true;
    });
    var orphans = [];
    childRows.forEach(function(r, i) {
      var val = String(r[ref.childCol] || '').trim();
      if (val && !parentIds[val]) orphans.push({ row: i + 2, value: val });
    });
    if (orphans.length > 0) {
      var sample = orphans.slice(0, 5).map(function(o) { return o.value; }).join(', ');
      _auditAddFinding(findings, _auditCreateFinding('REF', 'ORPHAN_ROWS', orphans.length > 10 ? AUDIT_SEVERITY.HIGH : AUDIT_SEVERITY.MEDIUM, 'FAIL', ref.child, ref.childCol, 'REF_ORPHAN', ref.child + '.' + ref.childCol + ': ' + orphans.length + ' orphan rows. Sample: ' + sample, 'Fix or delete orphan rows'));
      hasFail = true;
    }
  });
  return hasFail ? AUDIT_SECTION_RESULT.FAIL : AUDIT_SECTION_RESULT.PASS;
}

function auditOrphanRows(refSpecs, ss, findings) {
  return auditRefIntegrity(refSpecs, ss, findings);
}

function auditWorkflowFieldIntegrity(ss, findings) {
  var hasFail = false;
  var taskSheet = _auditGetSheet(CBV_CONFIG.SHEETS.TASK_MAIN);
  if (taskSheet && taskSheet.getLastRow() >= 2) {
    var rows = _auditGetRows(taskSheet);
    rows.forEach(function(r, i) {
      var status = String(r.STATUS || '').trim();
      var doneAt = String(r.DONE_AT || '').trim();
      var progress = Number(r.PROGRESS_PERCENT);
      if (status === 'DONE' && !doneAt) {
        _auditAddFinding(findings, _auditCreateFinding('WORKFLOW', 'DONE_NO_DONE_AT', AUDIT_SEVERITY.HIGH, 'FAIL', 'TASK_MAIN', 'DONE_AT', 'WORKFLOW_DONE_NO_DONE_AT', 'Row ' + (i + 2) + ': STATUS=DONE but DONE_AT blank', 'GAS should set DONE_AT on complete'));
        hasFail = true;
      }
      if (status === 'NEW' && progress === 100) {
        _auditAddFinding(findings, _auditCreateFinding('WORKFLOW', 'NEW_FULL_PROGRESS', AUDIT_SEVERITY.MEDIUM, 'WARN', 'TASK_MAIN', 'PROGRESS_PERCENT', 'WORKFLOW_INCONSISTENT', 'Row ' + (i + 2) + ': STATUS=NEW but PROGRESS_PERCENT=100', 'Review workflow'));
      }
      if (progress < 0 || progress > 100) {
        _auditAddFinding(findings, _auditCreateFinding('WORKFLOW', 'PROGRESS_RANGE', AUDIT_SEVERITY.HIGH, 'FAIL', 'TASK_MAIN', 'PROGRESS_PERCENT', 'WORKFLOW_PROGRESS_RANGE', 'Row ' + (i + 2) + ': PROGRESS_PERCENT=' + progress + ' out of 0-100', 'Fix or sync from checklist'));
        hasFail = true;
      }
    });
  }
  var clSheet = _auditGetSheet(CBV_CONFIG.SHEETS.TASK_CHECKLIST);
  if (clSheet && clSheet.getLastRow() >= 2) {
    var taskRows = taskSheet ? _auditGetRows(taskSheet) : [];
    var taskIds = {};
    taskRows.forEach(function(r) { taskIds[String(r.ID || '')] = r; });
    var clRows = _auditGetRows(clSheet);
    var doneByTask = {};
    clRows.forEach(function(r) {
      var tid = String(r.TASK_ID || '');
      if (!doneByTask[tid]) doneByTask[tid] = { total: 0, done: 0 };
      doneByTask[tid].total++;
      if (r.IS_DONE === true || String(r.IS_DONE) === 'true') doneByTask[tid].done++;
    });
    Object.keys(doneByTask).forEach(function(tid) {
      var d = doneByTask[tid];
      if (d.done > d.total) {
        _auditAddFinding(findings, _auditCreateFinding('WORKFLOW', 'CHECKLIST_DONE_GT_TOTAL', AUDIT_SEVERITY.CRITICAL, 'FAIL', 'TASK_CHECKLIST', 'IS_DONE', 'WORKFLOW_CHECKLIST_CORRUPT', 'Task ' + tid + ': CHECKLIST_DONE(' + d.done + ') > CHECKLIST_TOTAL(' + d.total + ')', 'Fix checklist data'));
        hasFail = true;
      }
    });
  }
  return hasFail ? AUDIT_SECTION_RESULT.FAIL : AUDIT_SECTION_RESULT.PASS;
}

function auditRequiredFieldCompleteness(requiredSheets, ss, specMap, findings) {
  var hasFail = false;
  requiredSheets.forEach(function(name) {
    var sheet = _auditGetSheet(name);
    if (!sheet || sheet.getLastRow() < 2) return;
    var spec = specMap[name];
    if (!spec || !spec.requiredColumns) return;
    var rows = _auditGetRows(sheet);
    spec.requiredColumns.forEach(function(col) {
      var blankCount = 0;
      var samples = [];
      rows.forEach(function(r, i) {
        var v = r[col];
        if (v === undefined || v === null || String(v).trim() === '') {
          blankCount++;
          if (samples.length < 3) samples.push(i + 2);
        }
      });
      if (blankCount > 0) {
        _auditAddFinding(findings, _auditCreateFinding('DATA', 'REQUIRED_BLANK', blankCount > 10 ? AUDIT_SEVERITY.HIGH : AUDIT_SEVERITY.MEDIUM, 'FAIL', name, col, 'DATA_REQUIRED_BLANK', name + '.' + col + ': ' + blankCount + ' rows with blank required field. Rows: ' + samples.join(', '), 'Fill required values'));
        hasFail = true;
      }
    });
  });
  return hasFail ? AUDIT_SECTION_RESULT.FAIL : AUDIT_SECTION_RESULT.PASS;
}

function auditDuplicateKeys(requiredSheets, ss, specMap, findings) {
  var hasFail = false;
  requiredSheets.forEach(function(name) {
    var sheet = _auditGetSheet(name);
    if (!sheet || sheet.getLastRow() < 2) return;
    var spec = specMap[name];
    var keyCol = (spec && spec.key) ? spec.key : 'ID';
    var rows = _auditGetRows(sheet);
    var count = {};
    rows.forEach(function(r) {
      var k = String(r[keyCol] || '').trim();
      if (k) count[k] = (count[k] || 0) + 1;
    });
    Object.keys(count).forEach(function(k) {
      if (count[k] > 1) {
        _auditAddFinding(findings, _auditCreateFinding('DATA', 'DUPLICATE_KEY', AUDIT_SEVERITY.CRITICAL, 'FAIL', name, keyCol, 'DATA_DUPLICATE_KEY', 'Duplicate key "' + k + '" in ' + name, 'Fix duplicate keys'));
        hasFail = true;
      }
    });
  });
  return hasFail ? AUDIT_SECTION_RESULT.FAIL : AUDIT_SECTION_RESULT.PASS;
}

function auditSoftDeleteConsistency(softDeleteTables, ss, findings) {
  var hasFail = false;
  softDeleteTables.forEach(function(name) {
    var sheet = _auditGetSheet(name);
    if (!sheet || sheet.getLastRow() < 2) return;
    var headers = _auditGetHeaders(sheet);
    if (headers.indexOf('IS_DELETED') === -1 || headers.indexOf('STATUS') === -1) return;
    var rows = _auditGetRows(sheet);
    rows.forEach(function(r, i) {
      var del = r.IS_DELETED;
      var isDel = del === true || String(del).toLowerCase() === 'true';
      var status = String(r.STATUS || '').trim();
      if (isDel && status === 'ACTIVE') {
        _auditAddFinding(findings, _auditCreateFinding('SOFT_DELETE', 'DELETED_ACTIVE', AUDIT_SEVERITY.MEDIUM, 'WARN', name, '', 'SOFT_DELETE_INCONSISTENT', 'Row ' + (i + 2) + ': IS_DELETED=TRUE but STATUS=ACTIVE', 'Align STATUS with IS_DELETED'));
        hasFail = true;
      }
    });
  });
  return hasFail ? AUDIT_SECTION_RESULT.WARN : AUDIT_SECTION_RESULT.PASS;
}

function auditLogRowIntegrity(ss, findings) {
  var hasFail = false;
  [CBV_CONFIG.SHEETS.TASK_UPDATE_LOG, CBV_CONFIG.SHEETS.FINANCE_LOG, CBV_CONFIG.SHEETS.ADMIN_AUDIT_LOG].forEach(function(sheetName) {
    var sheet = _auditGetSheet(sheetName);
    if (!sheet || sheet.getLastRow() < 2) return;
    var rows = _auditGetRows(sheet);
    rows.forEach(function(r, i) {
      if (!r.ACTION || String(r.ACTION).trim() === '') {
        _auditAddFinding(findings, _auditCreateFinding('LOG', 'LOG_MISSING_ACTION', AUDIT_SEVERITY.HIGH, 'FAIL', sheetName, 'ACTION', 'LOG_MISSING_ACTION', 'Row ' + (i + 2) + ': ACTION blank', 'Log rows must have ACTION'));
        hasFail = true;
      }
      if (!r.CREATED_AT || String(r.CREATED_AT).trim() === '') {
        _auditAddFinding(findings, _auditCreateFinding('LOG', 'LOG_MISSING_CREATED_AT', AUDIT_SEVERITY.MEDIUM, 'WARN', sheetName, 'CREATED_AT', 'LOG_MISSING_CREATED_AT', 'Row ' + (i + 2) + ': CREATED_AT blank', ''));
      }
    });
  });
  return hasFail ? AUDIT_SECTION_RESULT.FAIL : AUDIT_SECTION_RESULT.PASS;
}

function auditAppSheetReadiness(findings, sectionResults) {
  var appsheetBlockers = findings.filter(function(f) {
    return f.issue_code && (
      f.issue_code.indexOf('SCHEMA_') === 0 ||
      f.issue_code === 'SCHEMA_DUPLICATE_HEADER' ||
      f.issue_code === 'SCHEMA_BLANK_HEADER' ||
      f.issue_code === 'DATA_DUPLICATE_KEY' ||
      f.issue_code === 'REF_ORPHAN'
    ) && (f.severity === AUDIT_SEVERITY.CRITICAL || f.severity === AUDIT_SEVERITY.HIGH);
  });
  var ready = appsheetBlockers.length === 0;
  if (!ready) {
    _auditAddFinding(findings, _auditCreateFinding('APPSHEET', 'READINESS', AUDIT_SEVERITY.HIGH, 'FAIL', '', '', 'APPSHEET_NOT_READY', 'AppSheet may break: ' + appsheetBlockers.length + ' blocker(s)', 'Fix CRITICAL/HIGH schema and data issues first'));
  }
  return ready ? AUDIT_SECTION_RESULT.PASS : AUDIT_SECTION_RESULT.FAIL;
}

function buildAuditSummary(findings, sectionResults, runAt) {
  var totals = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  findings.forEach(function(f) {
    var k = (f.severity || '').toLowerCase();
    if (totals[k] !== undefined) totals[k]++;
  });
  var criticalOrHigh = (totals.critical || 0) + (totals.high || 0);
  var bootstrapSafe = criticalOrHigh === 0;
  var mustFixNow = findings.filter(function(f) {
    return f.severity === AUDIT_SEVERITY.CRITICAL || f.severity === AUDIT_SEVERITY.HIGH;
  }).map(function(f) { return f.issue_code + ': ' + f.message; });
  var warnings = findings.filter(function(f) {
    return f.severity === AUDIT_SEVERITY.MEDIUM || f.severity === AUDIT_SEVERITY.LOW;
  }).map(function(f) { return f.issue_code + ': ' + f.message; });
  var appsheetReady = findings.filter(function(f) { return f.issue_code === 'APPSHEET_NOT_READY'; }).length === 0 && bootstrapSafe;
  var systemHealth = criticalOrHigh > 0 ? 'FAIL' : (totals.medium > 0 || totals.low > 0 ? 'WARN' : 'PASS');
  var top10 = findings.slice(0, 10).map(function(f) {
    return { severity: f.severity, table: f.table, issue: f.issue_code, message: f.message };
  });
  return {
    auditRunAt: runAt,
    systemHealth: systemHealth,
    bootstrapSafe: bootstrapSafe,
    appsheetReady: appsheetReady,
    totals: totals,
    sectionResults: sectionResults,
    mustFixNow: mustFixNow,
    warnings: warnings,
    top10Issues: top10,
    safeNextSteps: bootstrapSafe ? ['Proceed with initAll() if needed', 'Run verifyAppSheetReadiness()'] : ['Fix MUST_FIX_NOW items', 'Re-run selfAuditBootstrap()']
  };
}

function writeAuditLog(summary, findings) {
  try {
    var sheet = _auditGetSheet(CBV_CONFIG.SHEETS.ADMIN_AUDIT_LOG);
    if (!sheet) return;
    var headers = _auditGetHeaders(sheet);
    if (!headers || headers.length === 0) return;
    var record = {
      ID: typeof cbvMakeId === 'function' ? cbvMakeId('AAL') : 'AAL_' + new Date().getTime(),
      AUDIT_TYPE: 'BOOTSTRAP_AUDIT',
      ENTITY_TYPE: 'SYSTEM',
      ENTITY_ID: '',
      ACTION: 'selfAuditBootstrap',
      BEFORE_JSON: '',
      AFTER_JSON: JSON.stringify({ systemHealth: summary.systemHealth, bootstrapSafe: summary.bootstrapSafe, appsheetReady: summary.appsheetReady, critical: summary.totals.critical, high: summary.totals.high }),
      NOTE: 'Health: ' + summary.systemHealth + ', BootstrapSafe: ' + summary.bootstrapSafe + ', AppSheetReady: ' + summary.appsheetReady,
      ACTOR_ID: typeof cbvUser === 'function' ? cbvUser() : 'system',
      CREATED_AT: new Date()
    };
    var row = headers.map(function(h) { return record[h] !== undefined ? record[h] : ''; });
    sheet.appendRow(row);
  } catch (e) {
    Logger.log('writeAuditLog error: ' + e);
  }
}

// --- Main orchestrator ---

/**
 * Full system health check. Idempotent, read-safe.
 * @param {Object} opts - { autoFix: false, appendMissingColumns: false }
 * @returns {Object} Structured report
 */
function selfAuditBootstrap(opts) {
  opts = opts || {};
  var autoFix = opts.autoFix === true;
  var appendMissingColumns = opts.appendMissingColumns === true;
  var writeHealthLog = opts.writeHealthLog !== false;
  var runAt = new Date().toISOString();

  var findings = [];
  var sectionResults = {};
  var requiredSheets = getRequiredSheetNames();
  var ss = SpreadsheetApp.getActive();

  sectionResults.sheetsExist = auditSheetsExist(requiredSheets, ss, findings);
  sectionResults.schemaIntegrity = auditSchemaIntegrity(requiredSheets, ss, findings);

  requiredSheets.forEach(function(name) {
    var sheet = _auditGetSheet(name);
    if (!sheet) return;
    var spec = CBV_AUDIT_SCHEMA[name] || {};
    var dup = auditDuplicateHeaders(name, sheet, findings);
    var blank = auditBlankHeaders(name, sheet, findings);
    var miss = auditMissingRequiredColumns(name, sheet, spec, findings);
    var unex = auditUnexpectedColumns(name, sheet, spec, findings);
    sectionResults[name + '_headers'] = (dup === 'FAIL' || blank === 'FAIL' || miss === 'FAIL') ? 'FAIL' : (unex === 'WARN' ? 'WARN' : 'PASS');
  });

  sectionResults.enumIntegrity = auditEnumIntegrity(ss, findings);
  sectionResults.enumHealthSync = typeof auditEnumHealthSync === 'function' ? auditEnumHealthSync(ss, findings) : sectionResults.enumIntegrity;
  sectionResults.masterCodeIntegrity = auditMasterCodeIntegrity(ss, findings);
  var userDirAudit = auditUserDirectory();
  if (userDirAudit.data && userDirAudit.data.findings) {
    userDirAudit.data.findings.forEach(function(f) {
      _auditAddFinding(findings, _auditCreateFinding('USER_DIRECTORY', f.issue || 'UD_CHECK', f.severity === 'CRITICAL' ? AUDIT_SEVERITY.CRITICAL : (f.severity === 'HIGH' ? AUDIT_SEVERITY.HIGH : AUDIT_SEVERITY.MEDIUM), 'FAIL', f.table || 'USER_DIRECTORY', f.column || '', f.issue || '', f.message || '', ''));
    });
  }
  sectionResults.userDirectoryIntegrity = userDirAudit.ok ? AUDIT_SECTION_RESULT.PASS : AUDIT_SECTION_RESULT.FAIL;
  sectionResults.refIntegrity = auditRefIntegrity(CBV_AUDIT_REFS, ss, findings);
  sectionResults.orphanRows = auditOrphanRows(CBV_AUDIT_REFS, ss, findings);
  sectionResults.workflowIntegrity = auditWorkflowFieldIntegrity(ss, findings);
  sectionResults.requiredCompleteness = auditRequiredFieldCompleteness(requiredSheets, ss, CBV_AUDIT_SCHEMA, findings);
  sectionResults.duplicateKeys = auditDuplicateKeys(requiredSheets, ss, CBV_AUDIT_SCHEMA, findings);
  sectionResults.softDeleteConsistency = auditSoftDeleteConsistency(CBV_SOFT_DELETE_TABLES, ss, findings);
  sectionResults.logIntegrity = auditLogRowIntegrity(ss, findings);
  sectionResults.appSheetReadiness = auditAppSheetReadiness(findings, sectionResults);

  var summary = buildAuditSummary(findings, sectionResults, runAt);

  var report = {
    ok: summary.bootstrapSafe,
    code: summary.bootstrapSafe ? 'AUDIT_OK' : 'AUDIT_FAIL',
    message: summary.bootstrapSafe ? 'Bootstrap self-audit passed' : 'Bootstrap audit found issues - review mustFixNow',
    data: {
      mismatchedSheets: findings.filter(function(f) { return f.issue_code === 'SCHEMA_MISSING_SHEET'; }).map(function(f) { return { sheet: f.table, reason: 'MISSING' }; }),
      warnings: summary.warnings
    },
    errors: summary.mustFixNow,
    auditReport: {
      auditRunAt: summary.auditRunAt,
      systemHealth: summary.systemHealth,
      bootstrapSafe: summary.bootstrapSafe,
      appsheetReady: summary.appsheetReady,
      totals: summary.totals,
      sectionResults: sectionResults,
      mustFixNow: summary.mustFixNow,
      warnings: summary.warnings,
      top10Issues: summary.top10Issues,
      safeNextSteps: summary.safeNextSteps,
      findings: findings
    }
  };

  if (appendMissingColumns && autoFix) {
    report.data.autoFixApplied = false;
  }

  writeAuditLog(summary, findings);
  if (writeHealthLog && typeof appendSystemHealthLogRow === 'function') {
    var schemaResult = opts.schemaResult || {};
    var appended = schemaResult.appendedColumns || [];
    var healthSummary = {
      auditRunAt: summary.auditRunAt,
      systemHealth: summary.systemHealth,
      bootstrapSafe: summary.bootstrapSafe,
      appsheetReady: summary.appsheetReady,
      totals: summary.totals,
      mustFixNow: summary.mustFixNow,
      warnings: summary.warnings,
      top10Issues: summary.top10Issues,
      schemaUpdated: schemaResult.schemaUpdated || false,
      appendedColumnsCount: appended.reduce(function(s, a) { return s + (a.columns ? a.columns.length : 0); }, 0)
    };
    appendSystemHealthLogRow(healthSummary);
  }

  Logger.log('selfAuditBootstrap: SYSTEM_HEALTH=' + summary.systemHealth + ', BOOTSTRAP_SAFE=' + summary.bootstrapSafe + ', APPSHEET_READY=' + summary.appsheetReady);
  Logger.log('TOP_10: ' + JSON.stringify(summary.top10Issues));
  Logger.log('MUST_FIX_NOW: ' + JSON.stringify(summary.mustFixNow));

  return report;
}

/**
 * Basic audit: required sheets exist. Backward compatible.
 */
function auditSystem() {
  var result = selfAuditBootstrap();
  return {
    ok: result.ok,
    code: result.code,
    message: result.message,
    data: { missingSheets: result.data.mismatchedSheets.map(function(m) { return m.sheet; }) },
    errors: result.errors
  };
}
