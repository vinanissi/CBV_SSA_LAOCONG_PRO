/**
 * User Migration Helper - Analysis and migration from mixed people sources to USER_DIRECTORY.
 * Dependencies: 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 02_USER_SERVICE
 *
 * STRICT: Does NOT overwrite production values unless explicitly running migration with dryRun=false.
 * Analysis and dry-run are always safe.
 */

var USER_MIGRATION_FIELDS = [
  { table: 'TASK_MAIN', column: 'OWNER_ID', sheet: 'TASK_MAIN' },
  { table: 'TASK_MAIN', column: 'REPORTER_ID', sheet: 'TASK_MAIN' },
  { table: 'TASK_CHECKLIST', column: 'DONE_BY', sheet: 'TASK_CHECKLIST' },
  { table: 'TASK_UPDATE_LOG', column: 'ACTOR_ID', sheet: 'TASK_UPDATE_LOG', allowEmailFallback: true },
  { table: 'FINANCE_TRANSACTION', column: 'CONFIRMED_BY', sheet: 'FINANCE_TRANSACTION' },
  { table: 'FINANCE_LOG', column: 'ACTOR_ID', sheet: 'FINANCE_LOG', allowEmailFallback: true },
  { table: 'ADMIN_AUDIT_LOG', column: 'ACTOR_ID', sheet: 'ADMIN_AUDIT_LOG', allowEmailFallback: true },
  { table: 'HO_SO_MASTER', column: 'OWNER_ID', sheet: 'HO_SO_MASTER' }
];

var HO_SO_PREFIXES = ['HTX_', 'XV_', 'XE_', 'TX_'];

/**
 * Classifies a value into: ud_id | mc_id | email | ho_so_id | name_like | empty | unknown
 */
function classifyUserRefValue(value) {
  var v = String(value || '').trim();
  if (!v) return 'empty';
  if (v.substring(0, 3) === 'UD_') return 'ud_id';
  if (v.substring(0, 3) === 'MC_') return 'mc_id';
  if (v.indexOf('@') !== -1) return 'email';
  for (var i = 0; i < HO_SO_PREFIXES.length; i++) {
    if (v.substring(0, HO_SO_PREFIXES[i].length) === HO_SO_PREFIXES[i]) return 'ho_so_id';
  }
  if (/^[A-Za-z\u00C0-\u024F\u1E00-\u1EFF\s\-\.]+$/.test(v) && v.length > 1) return 'name_like';
  return 'unknown';
}

/**
 * Gets MASTER_CODE row by ID. Returns { SHORT_NAME, MASTER_GROUP } or null.
 */
function _getMasterCodeRow(mcId) {
  var config = typeof CBV_CONFIG !== 'undefined' ? CBV_CONFIG : null;
  if (!config || !config.SHEETS || !config.SHEETS.MASTER_CODE) return null;
  var sheet = SpreadsheetApp.getActive().getSheetByName(config.SHEETS.MASTER_CODE);
  if (!sheet || sheet.getLastRow() < 2) return null;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idIdx = headers.indexOf('ID');
  var shortIdx = headers.indexOf('SHORT_NAME');
  var groupIdx = headers.indexOf('MASTER_GROUP');
  if (idIdx === -1) return null;
  var rows = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(mcId)) {
      return {
        SHORT_NAME: shortIdx >= 0 ? String(rows[i][shortIdx] || '').trim() : '',
        MASTER_GROUP: groupIdx >= 0 ? String(rows[i][groupIdx] || '').trim() : ''
      };
    }
  }
  return null;
}

/**
 * Normalizes a string for name matching: trim, collapse whitespace, lowercase.
 */
function _normalizeName(s) {
  return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Resolves a value to USER_DIRECTORY.ID.
 * @param {string} value - Raw value from people field
 * @param {Object} opts - { allowEmailFallback: boolean }
 * @returns {Object} { resolvedId, matchType, ambiguous, message }
 */
function resolveValueToUserDirectoryId(value, opts) {
  opts = opts || {};
  var allowEmailFallback = opts.allowEmailFallback === true;
  var result = { resolvedId: null, matchType: null, ambiguous: false, message: '' };

  var v = String(value || '').trim();
  if (!v) {
    result.matchType = 'empty';
    return result;
  }

  var cls = classifyUserRefValue(v);

  if (cls === 'ud_id') {
    var u = typeof getUserById === 'function' ? getUserById(v) : null;
    if (u) {
      result.resolvedId = u.id;
      result.matchType = 'ud_id_valid';
    } else {
      result.ambiguous = true;
      result.message = 'Orphaned UD_ ID - user not found';
    }
    return result;
  }

  if (cls === 'email') {
    var usersByEmail = [];
    if (typeof getUsers === 'function') {
      var e = String(v).trim().toLowerCase();
      usersByEmail = getUsers().filter(function(u) { return (u.email || '') === e; });
    }
    if (usersByEmail.length > 1) {
      result.ambiguous = true;
      result.message = 'Duplicate email in USER_DIRECTORY';
      return result;
    }
    var u2 = usersByEmail.length === 1 ? usersByEmail[0] : (typeof getUserByEmail === 'function' ? getUserByEmail(v) : null);
    if (u2) {
      result.resolvedId = u2.id;
      result.matchType = 'email';
    } else if (allowEmailFallback) {
      result.resolvedId = v;
      result.matchType = 'email_fallback';
      result.message = 'User not in USER_DIRECTORY; keeping email for audit';
    } else {
      result.ambiguous = true;
      result.message = 'Email not found in USER_DIRECTORY';
    }
    return result;
  }

  if (cls === 'mc_id') {
    var mc = _getMasterCodeRow(v);
    if (!mc) {
      result.ambiguous = true;
      result.message = 'MASTER_CODE row not found';
      return result;
    }
    if (mc.MASTER_GROUP !== 'USER') {
      result.ambiguous = true;
      result.message = 'MASTER_CODE row is not USER group';
      return result;
    }
    var email = mc.SHORT_NAME || '';
    if (!email || email.indexOf('@') === -1) {
      result.ambiguous = true;
      result.message = 'MASTER_CODE USER has no email in SHORT_NAME';
      return result;
    }
    var u3 = typeof getUserByEmail === 'function' ? getUserByEmail(email) : null;
    if (u3) {
      result.resolvedId = u3.id;
      result.matchType = 'mc_via_email';
    } else {
      result.ambiguous = true;
      result.message = 'MC USER email not found in USER_DIRECTORY';
    }
    return result;
  }

  if (cls === 'ho_so_id') {
    result.ambiguous = true;
    result.message = 'HO_SO ID in people field - likely wrong entity';
    return result;
  }

  if (cls === 'name_like' || cls === 'unknown') {
    var users = typeof getUsers === 'function' ? getUsers() : [];
    var norm = _normalizeName(v);
    var matches = [];
    for (var j = 0; j < users.length; j++) {
      var un = _normalizeName(users[j].name || '');
      var ud = _normalizeName(users[j].displayText || '');
      if (un === norm || ud === norm) matches.push(users[j]);
    }
    if (matches.length === 1) {
      result.resolvedId = matches[0].id;
      result.matchType = 'name';
    } else if (matches.length > 1) {
      result.ambiguous = true;
      result.message = 'Ambiguous name match: ' + matches.length + ' users';
    } else {
      result.ambiguous = true;
      result.message = 'No matching user for name-like value';
    }
    return result;
  }

  result.ambiguous = true;
  result.message = 'Unclassified value';
  return result;
}

/**
 * Analyzes all user ref fields. Returns distribution by type.
 * @returns {Object} { byTable: {}, byType: {}, sampleValues: {} }
 */
function analyzeUserRefValues() {
  var byTable = {};
  var byType = {};
  var sampleValues = {};

  for (var f = 0; f < USER_MIGRATION_FIELDS.length; f++) {
    var field = USER_MIGRATION_FIELDS[f];
    var key = field.table + '.' + field.column;
    byTable[key] = {};
    var config = typeof CBV_CONFIG !== 'undefined' ? CBV_CONFIG : null;
    if (!config || !config.SHEETS) continue;
    var sheetName = field.sheet;
    var sheet = SpreadsheetApp.getActive().getSheetByName(config.SHEETS[sheetName] || sheetName);
    if (!sheet || sheet.getLastRow() < 2) continue;

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var colIdx = headers.indexOf(field.column);
    if (colIdx === -1) continue;

    var rows = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
    for (var r = 0; r < rows.length; r++) {
      var val = rows[r][colIdx];
      var v = String(val || '').trim();
      if (!v) continue;
      var cls = classifyUserRefValue(v);
      byTable[key][cls] = (byTable[key][cls] || 0) + 1;
      byType[cls] = (byType[cls] || 0) + 1;
      if (!sampleValues[cls]) sampleValues[cls] = [];
      if (sampleValues[cls].indexOf(v) === -1 && sampleValues[cls].length < 5) {
        sampleValues[cls].push(v);
      }
    }
  }

  return { byTable: byTable, byType: byType, sampleValues: sampleValues };
}

/**
 * Builds migration report. Dry-run only by default.
 * @param {Object} opts - { dryRun: boolean (default true) }
 * @returns {Object} { summary, details, canMigrate }
 */
function buildMigrationReport(opts) {
  opts = opts || {};
  var dryRun = opts.dryRun !== false;
  var details = [];
  var summary = { total: 0, resolved: 0, flagged: 0, alreadyOk: 0, empty: 0 };

  for (var f = 0; f < USER_MIGRATION_FIELDS.length; f++) {
    var field = USER_MIGRATION_FIELDS[f];
    var config = typeof CBV_CONFIG !== 'undefined' ? CBV_CONFIG : null;
    if (!config || !config.SHEETS) break;

    var sheetName = field.sheet;
    var sheet = SpreadsheetApp.getActive().getSheetByName(config.SHEETS[sheetName] || sheetName);
    if (!sheet || sheet.getLastRow() < 2) continue;

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var colIdx = headers.indexOf(field.column);
    var idIdx = headers.indexOf('ID');
    if (colIdx === -1) continue;

    var rows = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
    for (var r = 0; r < rows.length; r++) {
      var rowNum = r + 2;
      var rowId = idIdx >= 0 ? rows[r][idIdx] : '';
      var val = rows[r][colIdx];
      var v = String(val || '').trim();

      if (!v) {
        summary.empty++;
        continue;
      }

      summary.total++;
      var res = resolveValueToUserDirectoryId(v, {
        allowEmailFallback: field.allowEmailFallback === true
      });

      if (res.matchType === 'empty') {
        summary.empty++;
      } else if (res.matchType === 'ud_id_valid' || res.matchType === 'email_fallback') {
        summary.alreadyOk++;
      } else if (res.resolvedId && !res.ambiguous) {
        summary.resolved++;
        details.push({
          table: field.table,
          column: field.column,
          rowNumber: rowNum,
          rowId: rowId,
          oldValue: v,
          newValue: res.resolvedId,
          matchType: res.matchType,
          action: 'UPDATE'
        });
      } else {
        summary.flagged++;
        details.push({
          table: field.table,
          column: field.column,
          rowNumber: rowNum,
          rowId: rowId,
          oldValue: v,
          newValue: null,
          matchType: res.matchType,
          message: res.message,
          action: 'FLAG'
        });
      }
    }
  }

  return {
    summary: summary,
    details: details,
    canMigrate: summary.flagged === 0,
    dryRun: dryRun
  };
}

/**
 * Runs migration. ONLY executes when dryRun is explicitly false.
 * @param {Object} opts - { dryRun: boolean (REQUIRED; default true for safety) }
 * @returns {Object} Report with applied count
 */
function runUserMigration(opts) {
  opts = opts || {};
  if (opts.dryRun !== false) {
    return {
      applied: 0,
      message: 'Migration skipped: dryRun must be explicitly false to execute',
      report: buildMigrationReport({ dryRun: true })
    };
  }

  var report = buildMigrationReport({ dryRun: false });
  if (report.summary.flagged > 0) {
    return {
      applied: 0,
      message: 'Migration aborted: ' + report.summary.flagged + ' flagged items. Resolve or accept before running.',
      report: report
    };
  }

  var applied = 0;
  var config = typeof CBV_CONFIG !== 'undefined' ? CBV_CONFIG : null;
  if (!config || !config.SHEETS) {
    return { applied: 0, message: 'CBV_CONFIG not available', report: report };
  }

  for (var i = 0; i < report.details.length; i++) {
    var d = report.details[i];
    if (d.action !== 'UPDATE' || !d.newValue) continue;

    var sheet = SpreadsheetApp.getActive().getSheetByName(config.SHEETS[d.table] || d.table);
    if (!sheet) continue;

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var colIdx = headers.indexOf(d.column);
    if (colIdx === -1) continue;

    var cell = sheet.getRange(d.rowNumber, colIdx + 1);
    cell.setValue(d.newValue);
    applied++;
  }

  if (typeof logAdminAudit === 'function') {
    logAdminAudit(
      'USER_MIGRATION',
      'SYSTEM',
      '',
      'runUserMigration',
      { flagged: report.summary.flagged, canMigrate: report.canMigrate },
      { applied: applied, total: report.summary.total, resolved: report.summary.resolved, alreadyOk: report.summary.alreadyOk },
      'User migration: ' + applied + ' updated, ' + report.summary.alreadyOk + ' already ok'
    );
  }

  return {
    applied: applied,
    message: 'Migration complete: ' + applied + ' values updated',
    report: report
  };
}
