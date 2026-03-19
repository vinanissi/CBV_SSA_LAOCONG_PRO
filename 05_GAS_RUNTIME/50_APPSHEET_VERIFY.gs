/**
 * CBV AppSheet Readiness Verification - Tables, keys, enums, refs.
 */
function verifyAppSheetReadiness() {
  var result = {
    ok: true,
    code: 'APPSHEET_READY',
    message: 'AppSheet readiness verified',
    data: {
      tablesExist: [],
      tablesMissing: [],
      keyChecks: [],
      enumCoverage: [],
      refCandidates: [],
      warnings: []
    },
    errors: []
  };

  var audit = selfAuditBootstrap();
  if (!audit.ok) {
    result.ok = false;
    result.data.warnings.push('Bootstrap audit failed - run initAll() first');
    result.errors = result.errors.concat(audit.errors || []);
  }

  var required = getRequiredSheetNames();
  var ss = SpreadsheetApp.getActive();
  var existing = ss.getSheets().map(function(s) { return s.getName(); });

  required.forEach(function(name) {
    if (existing.indexOf(name) !== -1) {
      result.data.tablesExist.push(name);
    } else {
      result.data.tablesMissing.push(name);
      result.ok = false;
    }
  });

  var keyLabels = {
    HO_SO_MASTER: { key: 'ID', label: 'NAME' },
    HO_SO_FILE: { key: 'ID', label: 'FILE_NAME' },
    HO_SO_RELATION: { key: 'ID', label: 'RELATION_TYPE' },
    TASK_MAIN: { key: 'ID', label: 'TITLE' },
    TASK_CHECKLIST: { key: 'ID', label: 'TITLE' },
    TASK_UPDATE_LOG: { key: 'ID', label: 'ACTION' },
    TASK_ATTACHMENT: { key: 'ID', label: 'TITLE' },
    FINANCE_ATTACHMENT: { key: 'ID', label: 'TITLE' },
    FINANCE_TRANSACTION: { key: 'ID', label: 'TRANS_CODE' },
    FINANCE_LOG: { key: 'ID', label: 'ACTION' }
  };

  result.data.tablesExist.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    var headers = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
    var spec = keyLabels[name];
    if (spec) {
      var hasKey = headers.indexOf(spec.key) !== -1;
      var hasLabel = headers.indexOf(spec.label) !== -1;
      result.data.keyChecks.push({ table: name, key: spec.key, hasKey: hasKey, label: spec.label, hasLabel: hasLabel });
      if (!hasKey || !hasLabel) result.ok = false;
    }
  });

  var hoSoTypeVals = typeof getActiveEnumValues === 'function' ? getActiveEnumValues('HO_SO_TYPE') : [];
  var taskStatusVals = typeof getActiveEnumValues === 'function' ? getActiveEnumValues('TASK_STATUS') : [];
  var finStatusVals = typeof getActiveEnumValues === 'function' ? getActiveEnumValues('FINANCE_STATUS') : [];
  result.data.enumCoverage = [
    { field: 'HO_SO_TYPE', values: hoSoTypeVals ? hoSoTypeVals.length : 0 },
    { field: 'TASK_STATUS', values: taskStatusVals ? taskStatusVals.length : 0 },
    { field: 'FINANCE_STATUS', values: finStatusVals ? finStatusVals.length : 0 }
  ];

  result.data.refCandidates = [
    { table: 'HO_SO_MASTER', ref: 'HTX_ID' },
    { table: 'HO_SO_FILE', ref: 'HO_SO_ID' },
    { table: 'TASK_CHECKLIST', ref: 'TASK_ID' },
    { table: 'TASK_ATTACHMENT', ref: 'TASK_ID' },
    { table: 'FINANCE_ATTACHMENT', ref: 'FINANCE_ID' },
    { table: 'FINANCE_LOG', ref: 'FIN_ID' }
  ];

  if (result.data.tablesMissing.length > 0) {
    result.code = 'APPSHEET_NOT_READY';
    result.message = 'Missing tables: ' + result.data.tablesMissing.join(', ');
  }

  Logger.log('verifyAppSheetReadiness: ' + JSON.stringify(result, null, 2));
  return result;
}
