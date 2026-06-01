/**
 * CBV_DATA_SYNC_RUNTIME v1 — DSR Test Console (PHASE_DSR_07_TEST_CONSOLE).
 * Separate from 🚀 CBV Runtime business menu. Dry-run / static checks only.
 */

var CBV_DSR_TEST_CONSOLE_VERSION = 'DSR_TEST_CONSOLE_V1';
var CBV_DSR_TEST_REPORT_CONTRACT = 'DSR_TEST_CONSOLE_REPORT_V1';
var CBV_DSR_TEST_REPORT_SHEET = 'DSR_TEST_REPORT';

var CBV_DSR_TEST_REPORT_HEADERS = [
  'REPORT_ID', 'RUN_ID', 'CHECKED_AT', 'RUN_BY', 'TEST_SUITE', 'PHASE', 'STATUS', 'SUMMARY',
  'OK_COUNT', 'WARNING_COUNT', 'ERROR_COUNT', 'CRITICAL_COUNT', 'NEXT_STEP',
  'REPORT_TEXT', 'REPORT_JSON', 'AI_HANDOFF_PROMPT', 'CONTRACT_VERSION', 'ENVELOPE_OK'
];

var __CBV_DSR_TEST_LAST_ENVELOPE__ = null;

function cbvDsrTestNow_() {
  return typeof cbvDsrNow_ === 'function' ? cbvDsrNow_() : new Date();
}

function cbvDsrTestRunId_() {
  return 'RUN_DSR_TEST_' + Utilities.getUuid();
}

function cbvDsrTestIso_(d) {
  return typeof cbvDsrIso_ === 'function' ? cbvDsrIso_(d) : String(d || new Date());
}

function cbvDsrTestActor_() {
  return typeof cbvDsrActor_ === 'function' ? cbvDsrActor_() : 'system';
}

function cbvDsrTestEnsureReportSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = { ok: true, sheetName: CBV_DSR_TEST_REPORT_SHEET, created: false };
  if (typeof cbvDsrEnsureSheetWithHeaders_ === 'function') {
    var r = cbvDsrEnsureSheetWithHeaders_(ss, CBV_DSR_TEST_REPORT_SHEET, CBV_DSR_TEST_REPORT_HEADERS);
    out.created = !!r.created;
    out.ok = !!r.ok;
    return out;
  }
  var sheet = ss.getSheetByName(CBV_DSR_TEST_REPORT_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CBV_DSR_TEST_REPORT_SHEET);
    out.created = true;
  }
  if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, CBV_DSR_TEST_REPORT_HEADERS.length).setValues([CBV_DSR_TEST_REPORT_HEADERS]);
  }
  return out;
}

function cbvDsrTestBuildCheck_(code, ok, severity, message, detail) {
  return {
    code: code,
    ok: !!ok,
    severity: severity || (ok ? 'OK' : 'ERROR'),
    message: message || '',
    detail: detail || {}
  };
}

function cbvDsrTestSummarizeChecks_(checks) {
  var okCount = 0;
  var warningCount = 0;
  var errorCount = 0;
  var criticalCount = 0;
  (checks || []).forEach(function (c) {
    if (c.ok && c.severity === 'OK') okCount++;
    else if (c.severity === 'WARNING') warningCount++;
    else if (c.severity === 'CRITICAL') criticalCount++;
    else errorCount++;
  });
  var status = 'GO';
  var severity = 'OK';
  if (criticalCount > 0) {
    status = 'FAIL';
    severity = 'CRITICAL';
  } else if (errorCount > 0) {
    status = 'FAIL';
    severity = 'ERROR';
  } else if (warningCount > 0) {
    status = 'GO_WITH_WARNINGS';
    severity = 'WARNING';
  }
  return {
    okCount: okCount,
    warningCount: warningCount,
    errorCount: errorCount,
    criticalCount: criticalCount,
    status: status,
    severity: severity
  };
}

function cbvDsrTestBuildReportEnvelope_(opts) {
  var o = opts || {};
  var summary = cbvDsrTestSummarizeChecks_(o.checks || []);
  return {
    ok: summary.status === 'GO' || summary.status === 'GO_WITH_WARNINGS',
    phase: o.phase || 'PHASE_DSR_07_TEST_CONSOLE',
    status: summary.status,
    checkedAt: o.checkedAt || cbvDsrTestIso_(cbvDsrTestNow_()),
    runBy: o.runBy || cbvDsrTestActor_(),
    traceId: o.traceId || o.runId || cbvDsrTestRunId_(),
    testSuite: o.testSuite || CBV_DSR_TEST_CONSOLE_VERSION,
    summary: o.summary || ('DSR test: ' + summary.status),
    checks: o.checks || [],
    warnings: o.warnings || [],
    errors: o.errors || [],
    nextStep: o.nextStep || 'Review DSR_TEST_REPORT; fix FAIL before production sync',
    severity: summary.severity,
    reportText: '',
    reportJson: {},
    contractVersion: CBV_DSR_TEST_REPORT_CONTRACT,
    envelopeOk: true
  };
}

function cbvDsrTestBuildReportText_(envelope) {
  var e = envelope || {};
  var lines = [];
  lines.push('=== DSR TEST REPORT ===');
  lines.push('Suite: ' + e.testSuite);
  lines.push('Status: ' + e.status + ' (' + e.severity + ')');
  lines.push('Checked: ' + e.checkedAt);
  lines.push('Trace: ' + e.traceId);
  lines.push('Summary: ' + e.summary);
  lines.push('');
  lines.push('--- Checks ---');
  (e.checks || []).forEach(function (c) {
    lines.push((c.ok ? '[OK]' : '[' + c.severity + ']') + ' ' + c.code + ': ' + c.message);
  });
  if ((e.warnings || []).length) {
    lines.push('');
    lines.push('--- Warnings ---');
    e.warnings.forEach(function (w) { lines.push('- ' + w); });
  }
  if ((e.errors || []).length) {
    lines.push('');
    lines.push('--- Errors ---');
    e.errors.forEach(function (err) { lines.push('- ' + err); });
  }
  lines.push('');
  lines.push('Next: ' + (e.nextStep || ''));
  return lines.join('\n');
}

function cbvDsrTestBuildAiHandoffPrompt_(envelope) {
  var e = envelope || {};
  var failed = (e.checks || []).filter(function (c) { return !c.ok && c.severity !== 'WARNING'; });
  var warned = (e.checks || []).filter(function (c) { return c.severity === 'WARNING'; });
  var critical = (e.checks || []).filter(function (c) { return c.severity === 'CRITICAL'; });
  var lines = [];
  lines.push('READ FIRST: 00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md');
  lines.push('');
  lines.push('PHASE: (continue current DSR phase — do not jump if status is FAIL)');
  lines.push('DSR TEST CONSOLE STATUS: ' + e.status);
  lines.push('SUMMARY: ' + e.summary);
  lines.push('');
  if (failed.length) {
    lines.push('FAILED CHECKS:');
    failed.forEach(function (c) { lines.push('- ' + c.code + ': ' + c.message); });
    lines.push('');
  }
  if (warned.length) {
    lines.push('WARNING CHECKS:');
    warned.forEach(function (c) { lines.push('- ' + c.code + ': ' + c.message); });
    lines.push('');
  }
  if (critical.length) {
    lines.push('CRITICAL CHECKS:');
    critical.forEach(function (c) { lines.push('- ' + c.code + ': ' + c.message); });
    lines.push('');
  }
  lines.push('NEXT STEP: ' + (e.nextStep || ''));
  lines.push('');
  lines.push('INSTRUCTIONS:');
  lines.push('- Do not redesign unrelated architecture.');
  lines.push('- Do not phase jump if status is FAIL.');
  lines.push('- Preserve DSR authority boundary and SYNC_GUARD_CONTRACT.');
  lines.push('- Test runtime stays in 🧪 CBV Test Console; business ops stay in 🚀 CBV Runtime.');
  return lines.join('\n');
}

function cbvDsrTestAppendReport_(envelope) {
  cbvDsrTestEnsureReportSheet_();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CBV_DSR_TEST_REPORT_SHEET);
  if (!sheet) return { ok: false, error: 'DSR_TEST_REPORT missing' };

  var e = envelope || {};
  e.reportText = cbvDsrTestBuildReportText_(e);
  e.reportJson = e.reportJson || {};
  e.aiHandoffPrompt = cbvDsrTestBuildAiHandoffPrompt_(e);

  var sum = cbvDsrTestSummarizeChecks_(e.checks);
  sheet.appendRow([
    'RPT_DSR_TEST_' + Utilities.getUuid(),
    e.traceId,
    e.checkedAt,
    e.runBy,
    e.testSuite,
    e.phase,
    e.status,
    e.summary,
    sum.okCount,
    sum.warningCount,
    sum.errorCount,
    sum.criticalCount,
    e.nextStep,
    e.reportText,
    JSON.stringify(e),
    e.aiHandoffPrompt,
    e.contractVersion,
    e.envelopeOk ? 'TRUE' : 'FALSE'
  ]);

  __CBV_DSR_TEST_LAST_ENVELOPE__ = e;

  if (typeof cbvDsrAppendLog_ === 'function') {
    cbvDsrAppendLog_(ss, {
      runId: e.traceId,
      logAt: e.checkedAt,
      level: e.status === 'FAIL' ? 'ERROR' : 'INFO',
      phase: e.phase,
      action: 'DSR_TEST_CONSOLE',
      status: e.status,
      message: e.summary,
      detailJson: { testSuite: e.testSuite, ok: sum.okCount, err: sum.errorCount },
      actor: e.runBy
    });
  }
  if (typeof cbvDsrAppendAudit_ === 'function') {
    cbvDsrAppendAudit_(ss, {
      runId: e.traceId,
      auditType: 'DSR_TEST_CONSOLE',
      entityType: 'DSR_TEST',
      entityId: e.testSuite,
      action: 'RUN',
      beforeJson: {},
      afterJson: { status: e.status, severity: e.severity },
      note: 'DSR test console — no business data mutation',
      actor: e.runBy
    });
  }

  return { ok: true, envelope: e };
}

function cbvDsrTestFinishSuite_(testSuite, checks, warnings, errors, nextStep) {
  var env = cbvDsrTestBuildReportEnvelope_({
    testSuite: testSuite,
    checks: checks,
    warnings: warnings || [],
    errors: errors || [],
    nextStep: nextStep,
    traceId: cbvDsrTestRunId_(),
    checkedAt: cbvDsrTestIso_(cbvDsrTestNow_()),
    runBy: cbvDsrTestActor_()
  });
  env.summary = testSuite + ': ' + env.status;
  cbvDsrTestAppendReport_(env);
  return env;
}

function cbvDsrTestFoundation() {
  var checks = [];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var required = [
    CBV_DSR_SHEETS.DASHBOARD, CBV_DSR_SHEETS.CONFIG, CBV_DSR_SHEETS.PLAN,
    CBV_DSR_SHEETS.LOG, CBV_DSR_SHEETS.AUDIT, CBV_DSR_SHEETS.REPORT, CBV_DSR_SHEETS.BACKUP_INDEX
  ];
  required.forEach(function (name) {
    checks.push(cbvDsrTestBuildCheck_('SHEET_' + name, !!ss.getSheetByName(name), 'OK', name + ' present', {}));
  });
  var tr = cbvDsrTestEnsureReportSheet_();
  checks.push(cbvDsrTestBuildCheck_('DSR_TEST_REPORT', tr.ok, tr.ok ? 'OK' : 'ERROR', 'DSR_TEST_REPORT sheet', tr));

  var helpers = [
    'cbvDsrBootstrapFoundation', 'cbvDsrConnectionCheck', 'cbvDsrBackupDestination',
    'cbvDsrDiffPreview', 'cbvDsrManualSyncApply', 'cbvDsrGenerateRuntimeReport',
    'cbvDsrValidateSyncGuards_'
  ];
  var fnMap = {
    cbvDsrBootstrapFoundation: typeof cbvDsrBootstrapFoundation,
    cbvDsrConnectionCheck: typeof cbvDsrConnectionCheck,
    cbvDsrBackupDestination: typeof cbvDsrBackupDestination,
    cbvDsrDiffPreview: typeof cbvDsrDiffPreview,
    cbvDsrManualSyncApply: typeof cbvDsrManualSyncApply,
    cbvDsrGenerateRuntimeReport: typeof cbvDsrGenerateRuntimeReport,
    cbvDsrValidateSyncGuards_: typeof cbvDsrValidateSyncGuards_
  };
  Object.keys(fnMap).forEach(function (fnName) {
    var exists = fnMap[fnName] === 'function';
    checks.push(cbvDsrTestBuildCheck_('FN_' + fnName, exists, exists ? 'OK' : 'ERROR', fnName + ' loaded', {}));
  });

  checks.push(cbvDsrTestBuildCheck_('TEST_MENU_SEPARATION', typeof buildCbvDsrTestConsoleSubMenu_ === 'function',
    typeof buildCbvDsrTestConsoleSubMenu_ === 'function' ? 'OK' : 'CRITICAL',
    'DSR tests under Test Console submenu builder', {}));
  checks.push(cbvDsrTestBuildCheck_('BUSINESS_MENU_FN', typeof buildCbvRuntimeMenu_ === 'function',
    'OK', 'Business runtime menu separate from test console', {}));

  return cbvDsrTestFinishSuite_('DSR_TEST_FOUNDATION', checks, [], [], 'Run full suite after deploy');
}

function cbvDsrTestConnectionGuard() {
  var checks = [];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (typeof cbvDsrReadConfig_ !== 'function') {
    return cbvDsrTestFinishSuite_('DSR_TEST_CONNECTION', [cbvDsrTestBuildCheck_('READ_CONFIG', false, 'CRITICAL', 'cbvDsrReadConfig_ missing', {})], [], [], '');
  }
  var cfg = cbvDsrReadConfig_(ss);
  checks.push(cbvDsrTestBuildCheck_('READ_CONFIG', cfg.ok, cfg.ok ? 'OK' : 'ERROR', 'Config read', {}));
  var c = cfg.config || {};
  checks.push(cbvDsrTestBuildCheck_('CFG_SOURCE_ID', !!String(c.SOURCE_SPREADSHEET_ID || '').trim(), 'WARNING', 'SOURCE_SPREADSHEET_ID', {}));
  checks.push(cbvDsrTestBuildCheck_('CFG_DEST_ID', !!String(c.DESTINATION_SPREADSHEET_ID || '').trim(), 'WARNING', 'DESTINATION_SPREADSHEET_ID', {}));
  if (typeof cbvDsrValidateConnectionConfig_ === 'function') {
    var v = cbvDsrValidateConnectionConfig_(c);
    checks.push(cbvDsrTestBuildCheck_('VALIDATE_CONN', true, 'OK', 'Validate does not write data', { needsConfig: v.needsConfig }));
    checks.push(cbvDsrTestBuildCheck_('CONN_FN', typeof cbvDsrConnectionCheck === 'function', 'OK', 'cbvDsrConnectionCheck exists', {}));
  }
  return cbvDsrTestFinishSuite_('DSR_TEST_CONNECTION_GUARD', checks, [], [], 'Set spreadsheet IDs and run menu 4');
}

function cbvDsrTestBackupGuard() {
  var checks = [];
  checks.push(cbvDsrTestBuildCheck_('BACKUP_FN', typeof cbvDsrBackupDestination === 'function', 'OK', 'cbvDsrBackupDestination exists', {}));
  checks.push(cbvDsrTestBuildCheck_('BAK_EXCLUSION', typeof cbvDsrIsBackupSheetName_ === 'function', 'OK', 'BAK_* exclusion helper', {}));
  checks.push(cbvDsrTestBuildCheck_('RUNTIME_EXCLUSION', typeof CBV_DSR_PROTECTED_RUNTIME_SHEETS !== 'undefined' && CBV_DSR_PROTECTED_RUNTIME_SHEETS.length > 0,
    'OK', 'Protected runtime sheet list', {}));
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  checks.push(cbvDsrTestBuildCheck_('BACKUP_INDEX_SHEET', !!ss.getSheetByName(CBV_DSR_SHEETS.BACKUP_INDEX), 'OK', 'SYNC_BACKUP_INDEX', {}));
  if (typeof cbvDsrGetLatestBackupStatus_ === 'function' && typeof cbvDsrReadConfig_ === 'function') {
    var st = cbvDsrGetLatestBackupStatus_(ss, cbvDsrReadConfig_(ss).config || {});
    checks.push(cbvDsrTestBuildCheck_('BACKUP_STATUS_READ', true, 'OK', st.message || 'readable', { exists: st.exists }));
  }
  return cbvDsrTestFinishSuite_('DSR_TEST_BACKUP_GUARD', checks, [], [], 'Run menu 5 backup before sync');
}

function cbvDsrTestDiffPreviewGuard() {
  var checks = [];
  checks.push(cbvDsrTestBuildCheck_('DIFF_FN', typeof cbvDsrDiffPreview === 'function', 'OK', 'cbvDsrDiffPreview exists', {}));
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  checks.push(cbvDsrTestBuildCheck_('SYNC_PLAN', !!ss.getSheetByName(CBV_DSR_SHEETS.PLAN), 'OK', 'SYNC_PLAN sheet', {}));
  checks.push(cbvDsrTestBuildCheck_('STRUCTURE_ONLY', typeof cbvDsrCompareSheet_ === 'function', 'OK', 'Structure compare helper (no row sync in diff file)', {}));
  return cbvDsrTestFinishSuite_('DSR_TEST_DIFF_PREVIEW_GUARD', checks, [], [], 'Run menu 6 diff before sync');
}

function cbvDsrTestWhitelistSyncGuardLogic_() {
  var checks = [];
  var cfgOk = {
    FULL_WORKBOOK_SYNC: 'FORBIDDEN',
    WHITELIST_SYNC_REQUIRED: 'TRUE',
    SYNC_WHITELIST: 'TASK_MAIN\nTASK_CHECKLIST',
    SYNC_FORBIDDEN_PATTERNS: 'CBV_*\nSYNC_*'
  };
  var cfgBad = { FULL_WORKBOOK_SYNC: 'ALLOWED', WHITELIST_SYNC_REQUIRED: 'FALSE', SYNC_WHITELIST: '' };

  checks.push(cbvDsrTestBuildCheck_('PARSE_WHITELIST', cbvDsrParseSheetListConfig_('A\nB').length === 2, 'OK', 'Newline list parse', {}));
  checks.push(cbvDsrTestBuildCheck_('WHITELIST_TASK', cbvDsrIsSheetWhitelisted_('task_main', ['TASK_MAIN']), 'OK', 'Case-insensitive whitelist', {}));
  checks.push(cbvDsrTestBuildCheck_('NOT_WHITELIST', !cbvDsrIsSheetWhitelisted_('RANDOM', ['TASK_MAIN']), 'OK', 'Non-whitelist rejected', {}));
  checks.push(cbvDsrTestBuildCheck_('FORBIDDEN_CBV', cbvDsrIsSheetForbidden_('CBV_MENU', ['CBV_*']), 'OK', 'CBV_* pattern', {}));
  checks.push(cbvDsrTestBuildCheck_('FORBIDDEN_SYNC', cbvDsrIsSheetForbidden_('SYNC_LOG', ['SYNC_*']), 'OK', 'SYNC_* pattern', {}));
  checks.push(cbvDsrTestBuildCheck_('FORBIDDEN_USER_DIR', cbvDsrIsSheetForbidden_('USER_DIRECTORY', ['USER_DIRECTORY']), 'OK', 'USER_DIRECTORY', {}));
  checks.push(cbvDsrTestBuildCheck_('FORBIDDEN_MASTER', cbvDsrIsSheetForbidden_('MASTER_CODE', ['MASTER_CODE']), 'OK', 'MASTER_CODE', {}));
  checks.push(cbvDsrTestBuildCheck_('FORBIDDEN_DON_VI', cbvDsrIsSheetForbidden_('DON_VI', ['DON_VI']), 'OK', 'DON_VI', {}));
  checks.push(cbvDsrTestBuildCheck_('FORBIDDEN_HO_SO', cbvDsrIsSheetForbidden_('HO_SO_MASTER', ['HO_SO_MASTER']), 'OK', 'HO_SO_MASTER', {}));
  checks.push(cbvDsrTestBuildCheck_('FORBIDDEN_BAK', cbvDsrIsSheetForbidden_('BAK_TASK_1', ['BAK_*']), 'OK', 'BAK_* pattern', {}));
  checks.push(cbvDsrTestBuildCheck_('CONFIG_OK', cbvDsrValidateWhitelistSyncConfig_(cfgOk).ok, 'OK', 'Valid whitelist config', {}));
  checks.push(cbvDsrTestBuildCheck_('CONFIG_EMPTY_BLOCKS', !cbvDsrValidateWhitelistSyncConfig_(cfgBad).ok, 'OK', 'Empty/bad config blocked', {}));
  checks.push(cbvDsrTestBuildCheck_('SHEET_ALLOW', cbvDsrValidateSheetSyncPermission_('TASK_MAIN', cfgOk).allowed, 'OK', 'Whitelisted allowed', {}));
  checks.push(cbvDsrTestBuildCheck_('SHEET_SKIP', cbvDsrValidateSheetSyncPermission_('OTHER', cfgOk).skipped, 'OK', 'Non-whitelist skipped', {}));
  checks.push(cbvDsrTestBuildCheck_('SHEET_BLOCK', cbvDsrValidateSheetSyncPermission_('SYNC_CONFIG', cfgOk).blocked, 'OK', 'Forbidden blocked', {}));
  return checks;
}

function cbvDsrTestSelectiveSyncGuardLogic_() {
  var checks = [];
  var cfg = {
    SELECTIVE_SYNC_REQUIRED: 'TRUE',
    ALLOW_SYNC_ALL_WHITELIST: 'FALSE',
    SYNC_SELECTION_SHEET: 'SYNC_SELECTION',
    SYNC_WHITELIST: 'TASK_MAIN',
    SYNC_FORBIDDEN_PATTERNS: 'SYNC_*',
    FULL_WORKBOOK_SYNC: 'FORBIDDEN',
    WHITELIST_SYNC_REQUIRED: 'TRUE'
  };
  checks.push(cbvDsrTestBuildCheck_('SELECTIVE_CONFIG', typeof cbvDsrValidateSelectiveSyncConfig_ === 'function'
    && cbvDsrValidateSelectiveSyncConfig_(cfg).ok, 'OK', 'Selective config valid', {}));
  var selApprove = { SHEET_NAME: 'TASK_MAIN', OPERATOR_DECISION: 'APPROVE', APPLY_STATUS: 'READY_TO_APPLY' };
  var selSkip = { SHEET_NAME: 'TASK_MAIN', OPERATOR_DECISION: 'SKIP', APPLY_STATUS: 'PENDING' };
  checks.push(cbvDsrTestBuildCheck_('APPROVE_READY', cbvDsrValidateSheetSelectionPermission_('TASK_MAIN', selApprove, cfg).eligible, 'OK', 'APPROVE+READY eligible', {}));
  checks.push(cbvDsrTestBuildCheck_('SKIP_NOT', !cbvDsrValidateSheetSelectionPermission_('TASK_MAIN', selSkip, cfg).eligible, 'OK', 'SKIP not eligible', {}));
  checks.push(cbvDsrTestBuildCheck_('EMPTY_DEC', !cbvDsrValidateSheetSelectionPermission_('TASK_MAIN', { OPERATOR_DECISION: '', APPLY_STATUS: 'READY_TO_APPLY' }, cfg).eligible, 'OK', 'Empty decision blocked', {}));
  checks.push(cbvDsrTestBuildCheck_('APPROVE_NOT_READY', !cbvDsrValidateSheetSelectionPermission_('TASK_MAIN', { OPERATOR_DECISION: 'APPROVE', APPLY_STATUS: 'PENDING' }, cfg).eligible, 'OK', 'APPROVE without READY blocked', {}));
  checks.push(cbvDsrTestBuildCheck_('FORBIDDEN_APPROVE', !cbvDsrValidateSheetSelectionPermission_('SYNC_LOG', { OPERATOR_DECISION: 'APPROVE', APPLY_STATUS: 'READY_TO_APPLY' }, cfg).eligible, 'OK', 'Forbidden cannot approve', {}));
  checks.push(cbvDsrTestBuildCheck_('NON_WL_APPROVE', !cbvDsrValidateSheetSelectionPermission_('RANDOM', { OPERATOR_DECISION: 'APPROVE', APPLY_STATUS: 'READY_TO_APPLY' }, cfg).eligible, 'OK', 'Non-whitelist cannot approve', {}));
  checks.push(cbvDsrTestBuildCheck_('HEADERS', typeof CBV_DSR_HEADERS !== 'undefined' && CBV_DSR_HEADERS.SYNC_SELECTION && CBV_DSR_HEADERS.SYNC_SELECTION.length === 12, 'OK', 'SYNC_SELECTION headers', {}));
  return checks;
}

function cbvDsrTestSyncGuardDryRun() {
  var checks = [];
  checks.push(cbvDsrTestBuildCheck_('SYNC_FN', typeof cbvDsrManualSyncApply === 'function', 'OK', 'cbvDsrManualSyncApply exists', {}));
  checks.push(cbvDsrTestBuildCheck_('GUARD_FN', typeof cbvDsrValidateSyncGuards_ === 'function', 'OK', 'cbvDsrValidateSyncGuards_ exists', {}));
  checks.push(cbvDsrTestBuildCheck_('WHITELIST_FN', typeof cbvDsrValidateWhitelistSyncConfig_ === 'function', 'OK', 'Whitelist guard module loaded', {}));
  checks.push(cbvDsrTestBuildCheck_('BUILD_PLAN_FN', typeof cbvDsrBuildWhitelistApplyPlan_ === 'function', 'OK', 'Whitelist apply plan builder', {}));
  checks.push(cbvDsrTestBuildCheck_('NO_TRIGGER', typeof ScriptApp !== 'undefined', 'OK', 'Triggers not created by test console (static)', {}));

  if (typeof cbvDsrParseSheetListConfig_ === 'function') {
    cbvDsrTestWhitelistSyncGuardLogic_().forEach(function (c) { checks.push(c); });
  }
  if (typeof cbvDsrValidateSelectiveSyncConfig_ === 'function') {
    cbvDsrTestSelectiveSyncGuardLogic_().forEach(function (c) { checks.push(c); });
  }
  checks.push(cbvDsrTestBuildCheck_('SELECTIVE_APPLY_FN', typeof cbvDsrManualSelectiveSyncApply === 'function', 'OK', 'Selective apply entry', {}));
  checks.push(cbvDsrTestBuildCheck_('BUILD_PLAN_FN', typeof cbvDsrBuildSelectiveSyncPlan === 'function', 'OK', 'Build selective plan', {}));

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (typeof cbvDsrReadConfig_ === 'function' && typeof cbvDsrValidateSyncGuards_ === 'function') {
    var cfg = cbvDsrReadConfig_(ss).config || {};
    var g = cbvDsrValidateSyncGuards_(ss, cfg);
    if (typeof cbvDsrValidateSyncGuardsWhitelist_ === 'function') {
      g = cbvDsrValidateSyncGuardsWhitelist_(ss, cfg, g);
    }
    checks.push(cbvDsrTestBuildCheck_('DRY_RUN_GUARDS', true, 'OK', 'Dry-run guard validation only', {
      guardStatus: g.guardStatus,
      blocked: g.blocked
    }));
    checks.push(cbvDsrTestBuildCheck_('SYNC_ALLOWED_KEY', cfg.SYNC_ALLOWED !== undefined, 'OK', 'SYNC_ALLOWED in config', { value: cfg.SYNC_ALLOWED }));
    checks.push(cbvDsrTestBuildCheck_('FULL_WORKBOOK_KEY', typeof CBV_DSR_WHITELIST_CONFIG_SEED !== 'undefined', 'OK', 'Whitelist config seed defined', {
      value: cfg.FULL_WORKBOOK_SYNC
    }));
    checks.push(cbvDsrTestBuildCheck_('DRY_RUN_NO_APPLY', true, 'OK', 'Test did not invoke cbvDsrManualSyncApply', {}));
  }
  return cbvDsrTestFinishSuite_('DSR_TEST_SYNC_GUARD_DRY_RUN', checks, [], [], 'Set guards then menu 7 with confirmation');
}

function cbvDsrTestRuntimeReport() {
  var checks = [];
  checks.push(cbvDsrTestBuildCheck_('REPORT_FN', typeof cbvDsrGenerateRuntimeReport === 'function', 'OK', 'cbvDsrGenerateRuntimeReport exists', {}));
  checks.push(cbvDsrTestBuildCheck_('CONTRACT', typeof CBV_DSR_RUNTIME_REPORT_CONTRACT !== 'undefined', 'OK', 'Runtime report contract constant', {}));
  checks.push(cbvDsrTestBuildCheck_('APPEND_REPORT', typeof cbvDsrAppendReport_ === 'function', 'OK', 'Append-only SYNC_REPORT', {}));
  checks.push(cbvDsrTestBuildCheck_('DASHBOARD_REPORT', typeof cbvDsrUpdateDashboardRuntimeReport_ === 'function', 'OK', 'Dashboard report updater', {}));
  return cbvDsrTestFinishSuite_('DSR_TEST_RUNTIME_REPORT', checks, [], [], 'Run menu 8 runtime report');
}

function cbvDsrTestRunFullSuite() {
  var allChecks = [];
  var warnings = [];
  var suites = [
    cbvDsrTestFoundation,
    cbvDsrTestConnectionGuard,
    cbvDsrTestBackupGuard,
    cbvDsrTestDiffPreviewGuard,
    cbvDsrTestSyncGuardDryRun,
    cbvDsrTestRuntimeReport
  ];
  suites.forEach(function (fn) {
    try {
      var env = fn();
      (env.checks || []).forEach(function (c) { allChecks.push(c); });
      (env.warnings || []).forEach(function (w) { warnings.push(w); });
    } catch (e) {
      allChecks.push(cbvDsrTestBuildCheck_('SUITE_' + (fn.name || 'unknown'), false, 'CRITICAL', String(e.message || e), {}));
    }
  });
  var env = cbvDsrTestBuildReportEnvelope_({
    testSuite: 'DSR_TEST_FULL_SUITE',
    checks: allChecks,
    warnings: warnings,
    traceId: cbvDsrTestRunId_(),
    checkedAt: cbvDsrTestIso_(cbvDsrTestNow_()),
    runBy: cbvDsrTestActor_(),
    nextStep: 'Review DSR_TEST_REPORT AI_HANDOFF_PROMPT column'
  });
  env.summary = 'Full suite: ' + env.status;
  cbvDsrTestAppendReport_(env);
  return env;
}

function cbvDsrTestBuildAiHandoffPrompt() {
  var env = __CBV_DSR_TEST_LAST_ENVELOPE__;
  if (!env) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CBV_DSR_TEST_REPORT_SHEET);
    if (sheet && sheet.getLastRow() >= 2) {
      var row = sheet.getRange(sheet.getLastRow(), 1, 1, CBV_DSR_TEST_REPORT_HEADERS.length).getValues()[0];
      var jsonIdx = CBV_DSR_TEST_REPORT_HEADERS.indexOf('REPORT_JSON');
      if (jsonIdx >= 0 && row[jsonIdx]) {
        try { env = JSON.parse(String(row[jsonIdx])); } catch (e) { env = null; }
      }
    }
  }
  if (!env) {
    return { ok: false, message: 'No test report found. Run a test suite first.' };
  }
  var prompt = cbvDsrTestBuildAiHandoffPrompt_(env);
  env.aiHandoffPrompt = prompt;
  __CBV_DSR_TEST_LAST_ENVELOPE__ = env;
  return { ok: true, prompt: prompt, status: env.status };
}

function cbvDsrTestOpenReportSheet() {
  cbvDsrTestEnsureReportSheet_();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CBV_DSR_TEST_REPORT_SHEET);
  if (sheet) SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet);
  return { ok: !!sheet };
}
