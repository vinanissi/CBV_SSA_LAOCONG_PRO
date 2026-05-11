/**
 * TASK_OBS — Operator Menu (adopter over CBV_OBS_CORE B1).
 *
 * Public:
 * - onOpen(e)               (only if TASK module had none)
 * - buildTaskObsMenu_()
 * - TaskObs_menuBootstrap()
 * - TaskObs_menuBootstrapDryRun()
 * - TaskObs_menuHealthCheck()
 * - TaskObs_menuRunSelfTest()
 * - TaskObs_menuGenerateSampleData()
 * - TaskObs_menuGenerateAiDiagnosticExport()
 * - TaskObs_menuOpenFindings()
 * - TaskObs_menuOpenTestResults()
 * - TaskObs_menuOpenAiExport()
 * - TaskObs_menuOpenAuditLogs()
 * - TaskObs_menuOperatorGuide()
 */

function onOpen(e) {
  // TASK module currently has no onOpen; add-only menu install.
  try {
    if (typeof buildTaskObsMenu_ === 'function') buildTaskObsMenu_();
  } catch (err) {
    // Do not block spreadsheet open.
    try { Logger.log('buildTaskObsMenu_ error: ' + err); } catch (e2) { /* ignore */ }
  }
}

function buildTaskObsMenu_() {
  try {
    var ui = SpreadsheetApp.getUi();
    if (!ui) return;
    ui.createMenu('🛡️ TASK OBS')
      .addItem('Bootstrap OBS', 'TaskObs_menuBootstrap')
      .addItem('Dry Run Bootstrap', 'TaskObs_menuBootstrapDryRun')
      .addSeparator()
      .addItem('Run Health Check', 'TaskObs_menuHealthCheck')
      .addItem('Run Self Test', 'TaskObs_menuRunSelfTest')
      .addItem('Generate Sample Data', 'TaskObs_menuGenerateSampleData')
      .addSeparator()
      .addItem('Generate AI Diagnostic Export', 'TaskObs_menuGenerateAiDiagnosticExport')
      .addSeparator()
      .addItem('Open Findings', 'TaskObs_menuOpenFindings')
      .addItem('Open Test Results', 'TaskObs_menuOpenTestResults')
      .addItem('Open AI Export', 'TaskObs_menuOpenAiExport')
      .addItem('Open Audit Logs', 'TaskObs_menuOpenAuditLogs')
      .addSeparator()
      .addItem('Operator Guide', 'TaskObs_menuOperatorGuide')
      .addToUi();
  } catch (e) {
    try { Logger.log('buildTaskObsMenu_ error: ' + e); } catch (e2) { /* ignore */ }
  }
}

function TaskObs_menuBootstrap() {
  TaskObs_menuRunWithShortPopup_('Đang bootstrap TASK OBS…', function () {
    var r = TaskObs_bootstrap();
    TaskObs_showResult_(r, 'Bootstrap TASK OBS');
    return r;
  });
}

function TaskObs_menuBootstrapDryRun() {
  TaskObs_menuRunWithShortPopup_('Dry run bootstrap…', function () {
    var r = TaskObs_bootstrapDryRun();
    TaskObs_showResult_(r, 'Dry Run');
    return r;
  });
}

function TaskObs_menuHealthCheck() {
  TaskObs_menuRunWithShortPopup_('Đang chạy health check…', function () {
    var r = TaskObs_healthCheck();
    // short operator guidance
    TaskObs_showResult_(r, 'Health Check');
    if (!r.ok) {
      TaskObs_shortError_('Có lỗi. Mở TASK_OBS_FINDING.');
      TaskObs_menuOpenFindings();
    }
    return r;
  });
}

function TaskObs_menuRunSelfTest() {
  TaskObs_menuRunWithShortPopup_('Đang chạy self-test…', function () {
    var r = TaskObs_runSelfTest();
    TaskObs_showResult_(r, 'Self Test');
    if (r && r.data && r.data.counts) {
      var c = r.data.counts;
      try {
        SpreadsheetApp.getUi().alert(
          'Self-test hoàn tất',
          'PASS: ' + (c.passed || 0) + '\nWARN: ' + (c.warned || 0) + '\nERROR: ' + (c.failed || 0) + '\nBLOCKER: ' + (c.blocked || 0) + '\n\nGợi ý: mở Findings/Test Results để xem chi tiết.',
          SpreadsheetApp.getUi().ButtonSet.OK
        );
      } catch (e0) {
        /* ignore */
      }
    }
    if (!r.ok) {
      TaskObs_shortError_('Có lỗi. Mở TASK_OBS_FINDING.');
      TaskObs_menuOpenFindings();
    }
    return r;
  });
}

function TaskObs_menuGenerateSampleData() {
  TaskObs_menuRunWithShortPopup_('Đang tạo sample data (TEST_)…', function () {
    var r = TaskObs_generateSampleData();
    TaskObs_showResult_(r, 'Sample Data');
    return r;
  });
}

function TaskObs_menuGenerateAiDiagnosticExport() {
  TaskObs_menuRunWithShortPopup_('Đang tạo AI Diagnostic Export…', function () {
    var r = TaskObs_generateAiDiagnosticExport();
    TaskObs_showResult_(r, 'AI Export');
    try {
      SpreadsheetApp.getUi().alert('AI Export', 'AI Export đã tạo. Mở sheet TASK_OBS_AI_EXPORT để copy gửi ChatGPT.', SpreadsheetApp.getUi().ButtonSet.OK);
    } catch (e0) {
      /* ignore */
    }
    return r;
  });
}

function TaskObs_menuOpenFindings() {
  TaskObs_menuRunWithShortPopup_('Mở Findings…', function () {
    return TaskObs_openSheetType_('finding');
  }, true);
}

function TaskObs_menuOpenTestResults() {
  TaskObs_menuRunWithShortPopup_('Mở Test Results…', function () {
    return TaskObs_openSheetType_('testResult');
  }, true);
}

function TaskObs_menuOpenAiExport() {
  TaskObs_menuRunWithShortPopup_('Mở AI Export…', function () {
    return TaskObs_openSheetType_('aiExport');
  }, true);
}

function TaskObs_menuOpenAuditLogs() {
  TaskObs_menuRunWithShortPopup_('Mở Audit Logs…', function () {
    return TaskObs_openSheetType_('audit');
  }, true);
}

function TaskObs_menuOperatorGuide() {
  try {
    SpreadsheetApp.getUi().alert(
      'TASK OBS — Guide',
      '1) Bootstrap OBS\n2) Run Health Check\n3) Run Self Test\n4) Nếu có lỗi → Open Findings\n5) Generate AI Diagnostic Export\n6) Copy dữ liệu gửi ChatGPT',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {
    /* ignore */
  }
}

// ---------------- private helpers ----------------

function TaskObs_menuRunWithShortPopup_(intro, fn, silent) {
  try {
    if (!silent) SpreadsheetApp.getUi().alert('TASK OBS', String(intro || 'Đang chạy…'), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e0) {
    /* ignore */
  }
  try {
    if (typeof fn === 'function') return fn();
    return TaskObs_stdResponse_(false, 'TASK_OBS_MENU_INVALID', 'No action', {}, { code: 'INVALID', message: 'No action', stack: '' });
  } catch (e) {
    TaskObs_shortError_('Có lỗi. Mở TASK_OBS_FINDING.');
    return TaskObs_stdResponse_(false, 'TASK_OBS_MENU_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function TaskObs_shortError_(text) {
  try {
    SpreadsheetApp.getUi().alert('Có lỗi', String(text || 'Có lỗi. Mở TASK_OBS_FINDING.'), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    /* ignore */
  }
}

function TaskObs_showResult_(result, title) {
  try {
    if (typeof CBV_Obs_showResultAlert === 'function') {
      CBV_Obs_showResultAlert(String(title || 'Result'), result);
      return;
    }
  } catch (e0) {
    /* ignore */
  }
  try {
    SpreadsheetApp.getUi().alert(String(title || 'Result'), TaskObs_formatResult_(result), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e1) {
    /* ignore */
  }
}

function TaskObs_formatResult_(r) {
  try {
    var o = r || {};
    var lines = [];
    lines.push('ok=' + String(!!o.ok));
    lines.push('code=' + String(o.code || ''));
    lines.push('message=' + String(o.message || ''));
    var c = o && o.data && o.data.counts ? o.data.counts : null;
    if (c) {
      lines.push('');
      lines.push('PASS: ' + String(c.passed || 0));
      lines.push('WARN: ' + String(c.warned || 0));
      lines.push('ERROR: ' + String(c.failed || 0));
      lines.push('BLOCKER: ' + String(c.blocked || 0));
    }
    return lines.join('\n');
  } catch (e) {
    return 'Done. Open OBS sheets for details.';
  }
}

function TaskObs_openSheetType_(sheetType) {
  var cfg = TaskObs_getConfig();
  try {
    if (typeof CBV_Obs_openSheet === 'function') {
      return CBV_Obs_openSheet(cfg, sheetType);
    }
  } catch (e0) {
    /* ignore */
  }
  // Fallback: open TASK DB URL only.
  try {
    var ss = TaskObs_openTaskDb_();
    return TaskObs_stdResponse_(true, 'TASK_OBS_OPEN_SHEET_URL', 'Open spreadsheet URL', { url: ss.getUrl(), sheetType: sheetType }, null);
  } catch (e1) {
    return TaskObs_stdResponse_(false, 'TASK_OBS_OPEN_SHEET_FAILED', 'Cannot open TASK DB', {}, { code: 'TASK_DB_OPEN_FAILED', message: String(e1 && e1.message ? e1.message : e1), stack: String(e1 && e1.stack ? e1.stack : '') });
  }
}

