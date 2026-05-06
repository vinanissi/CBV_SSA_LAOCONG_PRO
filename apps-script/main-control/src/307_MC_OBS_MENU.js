/**
 * MAIN_CONTROL_OBS — Operator Menu.
 *
 * Public menu installers / handlers:
 * - buildMainControlObsMenu_()
 * - MC_Obs_menuBootstrapObs()
 * - MC_Obs_menuRunHealthCheck()
 * - MC_Obs_menuRunSelfTest()
 * - MC_Obs_menuRunSmokeTest()
 * - MC_Obs_menuRunSchemaTest()
 * - MC_Obs_menuGenerateSampleData()
 * - MC_Obs_menuGenerateAiDiagnosticExport()
 * - MC_Obs_menuOpenObsDashboard()
 * - MC_Obs_menuOpenFindings()
 * - MC_Obs_menuOpenLatestTestResults()
 * - MC_Obs_menuOpenAiExport()
 * - MC_Obs_menuOpenRuntimeMetrics()
 * - MC_Obs_menuOpenEventTrace()
 * - MC_Obs_menuOpenAuditLogs()
 * - MC_Obs_menuSetupWebAppUrl()
 * - MC_Obs_menuSetupScriptProperties()
 * - MC_Obs_menuSetupConnectionPackageSheet()
 * - MC_Obs_menuRepairRegistryHeaders()
 * - MC_Obs_menuOperatorGuide()
 * - MC_Obs_menuAboutObs()
 *
 * Public dashboard + open helpers:
 * - MC_Obs_refreshDashboard()
 * - MC_Obs_openDashboard()
 * - MC_Obs_openSheetByName(sheetName)
 * - MC_Obs_openFindings()
 * - MC_Obs_openLatestTestResults()
 * - MC_Obs_openAiExport()
 * - MC_Obs_openRuntimeMetrics()
 * - MC_Obs_openEventTrace()
 * - MC_Obs_openAuditLogs()
 * - MC_Obs_showOperatorGuide()
 *
 * Public setup/repair:
 * - MC_Obs_setupWebAppUrl()
 * - MC_Obs_setupScriptProperties()
 * - MC_Obs_setupConnectionPackageSheet()
 * - MC_Obs_repairRegistryHeaders()
 */

function buildMainControlObsMenu_() {
  try {
    var ui = SpreadsheetApp.getUi();
    if (!ui) return;

    var m = ui.createMenu('🛡️ MAIN_CONTROL OBS');

    var subBootstrap = ui.createMenu('🚀 Bootstrap');
    subBootstrap
      .addItem('🚀 Bootstrap OBS', 'MC_Obs_menuBootstrapObs')
      .addItem('Dry Run Bootstrap', 'MC_Obs_menuBootstrapDryRun');

    var subHealth = ui.createMenu('🧪 Health');
    subHealth
      .addItem('🧪 Run Health Check', 'MC_Obs_menuRunHealthCheck')
      .addItem('📂 Open OBS Dashboard', 'MC_Obs_menuOpenObsDashboard');

    var subTests = ui.createMenu('🧪 Self-Test');
    subTests
      .addItem('🧪 Run Self Test', 'MC_Obs_menuRunSelfTest')
      .addItem('🧪 Run Smoke Test', 'MC_Obs_menuRunSmokeTest')
      .addItem('🧪 Run Schema Test', 'MC_Obs_menuRunSchemaTest')
      .addItem('🧪 Generate Sample Data', 'MC_Obs_menuGenerateSampleData')
      .addItem('📂 Open Latest Test Results', 'MC_Obs_menuOpenLatestTestResults');

    var subFindings = ui.createMenu('📌 Findings');
    subFindings
      .addItem('📂 Open Findings', 'MC_Obs_menuOpenFindings');

    var subExport = ui.createMenu('📤 AI Export');
    subExport
      .addItem('📤 Generate AI Diagnostic Export', 'MC_Obs_menuGenerateAiDiagnosticExport')
      .addItem('📂 Open AI Export', 'MC_Obs_menuOpenAiExport');

    var subLogs = ui.createMenu('📂 Open Logs');
    subLogs
      .addItem('📂 Open Runtime Metrics', 'MC_Obs_menuOpenRuntimeMetrics')
      .addItem('📂 Open Event Trace', 'MC_Obs_menuOpenEventTrace')
      .addItem('📂 Open Audit Logs', 'MC_Obs_menuOpenAuditLogs');

    var subSetup = ui.createMenu('⚙️ Setup / Repair');
    subSetup
      .addItem('⚙️ Setup WebApp URL', 'MC_Obs_menuSetupWebAppUrl')
      .addItem('⚙️ Setup Script Properties', 'MC_Obs_menuSetupScriptProperties')
      .addItem('⚙️ Setup Connection Package Sheet', 'MC_Obs_menuSetupConnectionPackageSheet')
      .addItem('⚙️ Repair Registry Headers', 'MC_Obs_menuRepairRegistryHeaders');

    var subGuide = ui.createMenu('📖 Operator Guide');
    subGuide
      .addItem('📖 Operator Guide', 'MC_Obs_menuOperatorGuide')
      .addItem('❓ About OBS', 'MC_Obs_menuAboutObs');

    m
      .addSubMenu(subBootstrap)
      .addSubMenu(subHealth)
      .addSubMenu(subTests)
      .addSubMenu(subFindings)
      .addSubMenu(subExport)
      .addSubMenu(subLogs)
      .addSubMenu(subSetup)
      .addSubMenu(subGuide)
      .addToUi();
  } catch (e) {
    Logger.log('buildMainControlObsMenu_ error: ' + e);
  }
}

function MC_Obs_menuBootstrapObs() {
  MC_Obs_menuActionWrapper_('OBS_MENU_BOOTSTRAP', 'Sẽ tạo các sheet OBS trong Core DB (add-only).', function () {
    return (typeof MC_Obs_bootstrap === 'function')
      ? MC_Obs_bootstrap()
      : MC_Obs_stdResponse_(false, 'MC_OBS_BOOTSTRAP_MISSING', 'MC_Obs_bootstrap missing', {}, { code: 'MISSING', message: 'MC_Obs_bootstrap missing', stack: '' });
  }, { openDashboard: true });
}

function MC_Obs_menuBootstrapDryRun() {
  MC_Obs_menuActionWrapper_('OBS_MENU_BOOTSTRAP_DRYRUN', 'Dry run: chỉ báo cáo sheet/cột sẽ tạo, không thay đổi dữ liệu.', function () {
    return (typeof MC_Obs_bootstrapDryRun === 'function')
      ? MC_Obs_bootstrapDryRun()
      : MC_Obs_stdResponse_(false, 'MC_OBS_BOOTSTRAP_DRYRUN_MISSING', 'MC_Obs_bootstrapDryRun missing', {}, { code: 'MISSING', message: 'MC_Obs_bootstrapDryRun missing', stack: '' });
  }, { openDashboard: false });
}

function MC_Obs_menuRunHealthCheck() {
  MC_Obs_menuActionWrapper_('OBS_MENU_HEALTH_CHECK', 'Đang chạy health check… (kết quả sẽ ghi vào MC_OBS_HEALTH và Dashboard)', function () {
    return (typeof MC_Obs_healthCheck === 'function')
      ? MC_Obs_healthCheck()
      : MC_Obs_stdResponse_(false, 'MC_OBS_HEALTH_MISSING', 'MC_Obs_healthCheck missing', {}, { code: 'MISSING', message: 'MC_Obs_healthCheck missing', stack: '' });
  }, { refreshDashboard: true, openDashboard: true, openFindingsOnError: true });
}

function MC_Obs_menuRunSelfTest() {
  MC_Obs_menuActionWrapper_('OBS_MENU_RUN_SELF_TEST', 'Đang chạy self-test… (không phá dữ liệu thật)', function () {
    return (typeof MC_Obs_runSelfTest === 'function')
      ? MC_Obs_runSelfTest()
      : MC_Obs_stdResponse_(false, 'MC_OBS_SELF_TEST_MISSING', 'MC_Obs_runSelfTest missing', {}, { code: 'MISSING', message: 'MC_Obs_runSelfTest missing', stack: '' });
  }, { refreshDashboard: true, openDashboard: true, openFindingsOnError: true, showTestSummary: true });
}

function MC_Obs_menuRunSmokeTest() {
  MC_Obs_menuActionWrapper_('OBS_MENU_RUN_SMOKE_TEST', 'Đang chạy smoke test…', function () {
    return (typeof MC_Obs_runSmokeTest === 'function')
      ? MC_Obs_runSmokeTest()
      : MC_Obs_stdResponse_(false, 'MC_OBS_SMOKE_TEST_MISSING', 'MC_Obs_runSmokeTest missing', {}, { code: 'MISSING', message: 'MC_Obs_runSmokeTest missing', stack: '' });
  }, { refreshDashboard: true, openDashboard: true, openFindingsOnError: true, showTestSummary: true });
}

function MC_Obs_menuRunSchemaTest() {
  MC_Obs_menuActionWrapper_('OBS_MENU_RUN_SCHEMA_TEST', 'Đang chạy schema test…', function () {
    return (typeof MC_Obs_runSchemaTest === 'function')
      ? MC_Obs_runSchemaTest()
      : MC_Obs_stdResponse_(false, 'MC_OBS_SCHEMA_TEST_MISSING', 'MC_Obs_runSchemaTest missing', {}, { code: 'MISSING', message: 'MC_Obs_runSchemaTest missing', stack: '' });
  }, { refreshDashboard: true, openDashboard: true, openFindingsOnError: true, showTestSummary: true });
}

function MC_Obs_menuGenerateSampleData() {
  MC_Obs_menuActionWrapper_('OBS_MENU_GENERATE_SAMPLE_DATA', 'Sẽ tạo sample data (prefix TEST_) chỉ trong các sheet MC_OBS_*.', function () {
    return (typeof MC_Obs_generateSampleData === 'function')
      ? MC_Obs_generateSampleData()
      : MC_Obs_stdResponse_(false, 'MC_OBS_SAMPLE_MISSING', 'MC_Obs_generateSampleData missing', {}, { code: 'MISSING', message: 'MC_Obs_generateSampleData missing', stack: '' });
  }, { refreshDashboard: true, openDashboard: true });
}

function MC_Obs_menuGenerateAiDiagnosticExport() {
  MC_Obs_menuActionWrapper_('OBS_MENU_GENERATE_AI_EXPORT', 'Đang tạo AI export… (kết quả sẽ ghi vào MC_OBS_AI_EXPORT)', function () {
    return (typeof MC_Obs_generateAiDiagnosticExport === 'function')
      ? MC_Obs_generateAiDiagnosticExport()
      : MC_Obs_stdResponse_(false, 'MC_OBS_AI_EXPORT_MISSING', 'MC_Obs_generateAiDiagnosticExport missing', {}, { code: 'MISSING', message: 'MC_Obs_generateAiDiagnosticExport missing', stack: '' });
  }, { refreshDashboard: true, openDashboard: true, openSheetName: (MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS ? MC_OBS_SCHEMA_.SHEETS.AI_EXPORT : 'MC_OBS_AI_EXPORT'), shortSuccess: 'AI Export đã tạo. Mở sheet “MC_OBS_AI_EXPORT” để copy gửi ChatGPT.' });
}

function MC_Obs_menuOpenObsDashboard() {
  MC_Obs_menuActionWrapper_('OBS_MENU_OPEN_DASHBOARD', 'Mở OBS Dashboard…', function () {
    return (typeof MC_Obs_openDashboard === 'function')
      ? MC_Obs_openDashboard()
      : MC_Obs_stdResponse_(false, 'MC_OBS_DASHBOARD_MISSING', 'MC_Obs_openDashboard missing', {}, { code: 'MISSING', message: 'MC_Obs_openDashboard missing', stack: '' });
  }, { silent: true });
}

function MC_Obs_menuOpenFindings() {
  MC_Obs_menuActionWrapper_('OBS_MENU_OPEN_FINDINGS', 'Mở Findings…', function () {
    return MC_Obs_openFindings();
  }, { silent: true });
}

function MC_Obs_menuOpenLatestTestResults() {
  MC_Obs_menuActionWrapper_('OBS_MENU_OPEN_LATEST_TEST_RESULTS', 'Mở Latest Test Results…', function () {
    return MC_Obs_openLatestTestResults();
  }, { silent: true });
}

function MC_Obs_menuOpenAiExport() {
  MC_Obs_menuActionWrapper_('OBS_MENU_OPEN_AI_EXPORT', 'Mở AI Export…', function () {
    return MC_Obs_openAiExport();
  }, { silent: true });
}

function MC_Obs_menuOpenRuntimeMetrics() {
  MC_Obs_menuActionWrapper_('OBS_MENU_OPEN_RUNTIME_METRICS', 'Mở Runtime Metrics…', function () {
    return MC_Obs_openRuntimeMetrics();
  }, { silent: true });
}

function MC_Obs_menuOpenEventTrace() {
  MC_Obs_menuActionWrapper_('OBS_MENU_OPEN_EVENT_TRACE', 'Mở Event Trace…', function () {
    return MC_Obs_openEventTrace();
  }, { silent: true });
}

function MC_Obs_menuOpenAuditLogs() {
  MC_Obs_menuActionWrapper_('OBS_MENU_OPEN_AUDIT_LOGS', 'Mở Audit Logs…', function () {
    return MC_Obs_openAuditLogs();
  }, { silent: true });
}

function MC_Obs_menuSetupWebAppUrl() {
  MC_Obs_menuActionWrapper_('OBS_MENU_SETUP_WEBAPP_URL', 'Thiết lập CBV_MAIN_CONTROL_WEBAPP_URL…', function () {
    return MC_Obs_setupWebAppUrl();
  }, { refreshDashboard: true, openDashboard: true });
}

function MC_Obs_menuSetupScriptProperties() {
  MC_Obs_menuActionWrapper_('OBS_MENU_SETUP_SCRIPT_PROPERTIES', 'Kiểm tra Script Properties…', function () {
    return MC_Obs_setupScriptProperties();
  }, { refreshDashboard: true, openDashboard: true });
}

function MC_Obs_menuSetupConnectionPackageSheet() {
  MC_Obs_menuActionWrapper_('OBS_MENU_SETUP_CONNECTION_PACKAGE', 'Đảm bảo sheet CBV_CONNECTION_PACKAGE…', function () {
    return MC_Obs_setupConnectionPackageSheet();
  }, { refreshDashboard: true, openDashboard: true, openFindingsOnError: true });
}

function MC_Obs_menuRepairRegistryHeaders() {
  MC_Obs_menuActionWrapper_('OBS_MENU_REPAIR_REGISTRY_HEADERS', 'Repair headers cho CBV_MODULE_REGISTRY…', function () {
    return MC_Obs_repairRegistryHeaders();
  }, { refreshDashboard: true, openDashboard: true });
}

function MC_Obs_menuOperatorGuide() {
  MC_Obs_menuActionWrapper_('OBS_MENU_OPERATOR_GUIDE', 'Operator Guide…', function () {
    return MC_Obs_showOperatorGuide();
  }, { silent: true });
}

function MC_Obs_menuAboutObs() {
  var ui = SpreadsheetApp.getUi();
  try {
    ui.alert(
      'About MAIN_CONTROL OBS',
      'Mục tiêu: vận hành qua MENU, mọi kết quả ghi ra sheet.\n\nSheet chính:\n- MC_OBS_DASHBOARD\n- MC_OBS_FINDING\n- MC_OBS_TEST_RUN / MC_OBS_TEST_RESULT\n- MC_OBS_AI_EXPORT\n\nNếu có lỗi: mở “Open Findings” để xem chi tiết và copy gửi ChatGPT.',
      ui.ButtonSet.OK
    );
  } catch (e) {
    /* ignore */
  }
}

function MC_Obs_toText_(obj) {
  try {
    if (typeof MC_json_ === 'function') return MC_json_(obj);
  } catch (e0) {
    /* ignore */
  }
  try {
    return JSON.stringify(obj, null, 2);
  } catch (e1) {
    return String(obj);
  }
}

// ==========================================================
// Dashboard
// ==========================================================

function MC_Obs_refreshDashboard() {
  // Writes to MC_OBS_DASHBOARD (structured, copy-friendly).
  try {
    if (typeof MC_Obs_ensureSheets === 'function') MC_Obs_ensureSheets();
  } catch (e0) {
    /* swallow */
  }

  var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
  if (!opened.ok) return MC_Obs_stdResponse_(false, 'MC_OBS_DASHBOARD_CORE_DB_MISSING', 'Core DB not available', {}, opened.error || null);

  var ss = opened.ss;
  var sheetName = (MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS && MC_OBS_SCHEMA_.SHEETS.DASHBOARD) ? MC_OBS_SCHEMA_.SHEETS.DASHBOARD : 'MC_OBS_DASHBOARD';
  var sh = null;
  try { sh = ss.getSheetByName(sheetName); } catch (e1) { sh = null; }
  if (!sh) return MC_Obs_stdResponse_(false, 'MC_OBS_DASHBOARD_SHEET_MISSING', 'MC_OBS_DASHBOARD missing', { sheetName: sheetName }, { code: 'SHEET_MISSING', message: sheetName, stack: '' });

  try {
    if (sh.getFrozenRows() < 1) sh.setFrozenRows(1);
  } catch (e2) {
    /* ignore */
  }

  var nowIso = (typeof MC_Obs_now_ === 'function') ? MC_Obs_now_() : (new Date().toISOString());

  // Latest health (from function or recent sheet row).
  var health = null;
  try { if (typeof MC_Obs_healthCheck === 'function') health = MC_Obs_healthCheck(); } catch (e3) { health = null; }
  var healthCode = health && health.code ? String(health.code) : '';
  var healthSummary = health && health.data && health.data.summary ? health.data.summary : null;
  var blockers = healthSummary ? Number(healthSummary.blocker || 0) : '';

  // Findings counts (fast).
  var findingSheet = null;
  try { findingSheet = ss.getSheetByName((MC_OBS_SCHEMA_.SHEETS && MC_OBS_SCHEMA_.SHEETS.FINDING) ? MC_OBS_SCHEMA_.SHEETS.FINDING : 'MC_OBS_FINDING'); } catch (e4) { findingSheet = null; }
  var findingTotal = findingSheet ? Math.max(0, (findingSheet.getLastRow() || 1) - 1) : '';
  var findingBlockerApprox = MC_Obs_countRecentBlockerFindings_(ss, 200);

  // Latest test run quick read.
  var latestTest = null;
  try { if (typeof MC_Obs_readLatestTestRun_ === 'function') latestTest = MC_Obs_readLatestTestRun_(); } catch (e5) { latestTest = null; }
  var lastTestStatus = latestTest && latestTest.ok ? String(latestTest.status || '') : '';
  var lastTestRunId = latestTest && latestTest.ok ? String(latestTest.runId || '') : '';

  // Latest AI export quick read.
  var exportInfo = MC_Obs_getLatestAiExportInfo_(ss);

  var nextAction = '';
  if (healthCode === 'MC_OBS_HEALTH_BLOCKER' || Number(findingBlockerApprox || 0) > 0) nextAction = 'Mở Findings → xử lý BLOCKER trước.';
  else if (healthCode === 'MC_OBS_HEALTH_WARN') nextAction = 'Chạy Self Test → xem Findings.';
  else if (!lastTestRunId) nextAction = 'Chạy Self Test lần đầu.';
  else if (!exportInfo.runId) nextAction = 'Generate AI Diagnostic Export để gửi ChatGPT.';
  else nextAction = 'Hệ ổn. Theo dõi Dashboard định kỳ.';

  var items = [
    { key: 'HEALTH_CODE', label: 'Latest health code', status: health && health.ok ? 'OK' : 'WARN', severity: blockers ? 'BLOCKER' : (health && health.ok ? 'OK' : 'WARN'), value: healthCode, data: health },
    { key: 'HEALTH_BLOCKER_COUNT', label: 'Health blocker count', status: blockers ? 'WARN' : 'OK', severity: blockers ? 'BLOCKER' : 'OK', value: String(blockers), data: { summary: healthSummary || {} } },
    { key: 'FINDINGS_TOTAL', label: 'Total findings rows', status: 'OK', severity: 'INFO', value: String(findingTotal), data: {} },
    { key: 'FINDINGS_BLOCKER_APPROX', label: 'Blocker findings (recent approx)', status: Number(findingBlockerApprox || 0) > 0 ? 'WARN' : 'OK', severity: Number(findingBlockerApprox || 0) > 0 ? 'BLOCKER' : 'OK', value: String(findingBlockerApprox), data: { sampleRows: 200 } },
    { key: 'LATEST_TEST_STATUS', label: 'Latest test status', status: lastTestStatus ? 'OK' : 'WARN', severity: lastTestStatus === 'BLOCKER' ? 'BLOCKER' : (lastTestStatus === 'ERROR' ? 'ERROR' : (lastTestStatus === 'WARN' ? 'WARN' : 'INFO')), value: lastTestStatus, data: latestTest || {} },
    { key: 'LATEST_TEST_RUN_ID', label: 'Latest test run id', status: lastTestRunId ? 'OK' : 'WARN', severity: lastTestRunId ? 'INFO' : 'WARN', value: lastTestRunId, data: {} },
    { key: 'LATEST_AI_EXPORT_RUN_ID', label: 'Latest AI export run id', status: exportInfo.runId ? 'OK' : 'WARN', severity: exportInfo.runId ? 'INFO' : 'WARN', value: exportInfo.runId, data: exportInfo },
    { key: 'LATEST_AI_EXPORT_AT', label: 'Latest AI export created at', status: exportInfo.createdAt ? 'OK' : 'WARN', severity: exportInfo.createdAt ? 'INFO' : 'WARN', value: exportInfo.createdAt, data: {} },
    { key: 'NEXT_ACTION', label: 'Next action suggestion', status: 'OK', severity: 'INFO', value: nextAction, data: {} }
  ];

  var i;
  for (i = 0; i < items.length; i++) {
    MC_Obs_dashboardUpsertItem_(sh, items[i], nowIso);
  }

  try {
    MC_Obs_tryAutoResize_(sh, 8);
  } catch (e6) {
    /* ignore */
  }

  return MC_Obs_stdResponse_(true, 'MC_OBS_DASHBOARD_REFRESH_OK', 'OK', { sheetName: sheetName, updatedAt: nowIso }, null);
}

function MC_Obs_openDashboard() {
  try {
    MC_Obs_refreshDashboard();
  } catch (e0) {
    /* ignore */
  }
  return MC_Obs_openSheetByName((MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS) ? MC_OBS_SCHEMA_.SHEETS.DASHBOARD : 'MC_OBS_DASHBOARD');
}

// ==========================================================
// Open sheet helpers
// ==========================================================

function MC_Obs_openSheetByName(sheetName) {
  var name = String(sheetName || '').trim();
  if (!name) return MC_Obs_stdResponse_(false, 'MC_OBS_OPEN_SHEET_MISSING', 'sheetName missing', {}, { code: 'VALIDATION_ERROR', message: 'sheetName missing', stack: '' });

  var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
  if (!opened.ok) {
    MC_Obs_uiShortError_('Có lỗi. Mở OBS Findings.');
    return MC_Obs_stdResponse_(false, 'MC_OBS_CORE_DB_MISSING', 'Core DB not available', {}, opened.error || null);
  }

  var ss = opened.ss;
  var sh = null;
  try { sh = ss.getSheetByName(name); } catch (e0) { sh = null; }
  if (!sh) {
    MC_Obs_uiShortError_('Có lỗi. Mở OBS Findings.');
    MC_Obs_writeFindingSafe_('OPEN_SHEET', 'SHEET_NOT_FOUND', 'WARN', 'Sheet not found: ' + name, 'Chạy Bootstrap OBS rồi thử lại.', { sheetName: name });
    return MC_Obs_stdResponse_(false, 'MC_OBS_SHEET_NOT_FOUND', 'Sheet not found: ' + name, { sheetName: name }, { code: 'SHEET_NOT_FOUND', message: name, stack: '' });
  }

  // Best-effort activate when Core DB is the current spreadsheet.
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active && String(active.getId()) === String(ss.getId())) {
      ss.setActiveSheet(sh);
      SpreadsheetApp.flush();
    }
  } catch (e1) {
    /* ignore */
  }

  try {
    if (sh.getFrozenRows() < 1) sh.setFrozenRows(1);
  } catch (e2) {
    /* ignore */
  }
  return MC_Obs_stdResponse_(true, 'MC_OBS_OPEN_SHEET_OK', 'OK', { sheetName: name, url: ss.getUrl() }, null);
}

function MC_Obs_openFindings() {
  var name = (MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS) ? MC_OBS_SCHEMA_.SHEETS.FINDING : 'MC_OBS_FINDING';
  var r = MC_Obs_openSheetByName(name);
  MC_Obs_trySortFindings_();
  return r;
}

function MC_Obs_openLatestTestResults() {
  var name = (MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS) ? MC_OBS_SCHEMA_.SHEETS.TEST_RESULT : 'MC_OBS_TEST_RESULT';
  return MC_Obs_openSheetByName(name);
}

function MC_Obs_openAiExport() {
  var name = (MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS) ? MC_OBS_SCHEMA_.SHEETS.AI_EXPORT : 'MC_OBS_AI_EXPORT';
  return MC_Obs_openSheetByName(name);
}

function MC_Obs_openRuntimeMetrics() {
  var name = (MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS) ? MC_OBS_SCHEMA_.SHEETS.RUNTIME_METRIC : 'MC_OBS_RUNTIME_METRIC';
  return MC_Obs_openSheetByName(name);
}

function MC_Obs_openEventTrace() {
  var name = (MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS) ? MC_OBS_SCHEMA_.SHEETS.EVENT_TRACE : 'MC_OBS_EVENT_TRACE';
  return MC_Obs_openSheetByName(name);
}

function MC_Obs_openAuditLogs() {
  var name = (MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS) ? MC_OBS_SCHEMA_.SHEETS.AUDIT : 'MC_OBS_AUDIT';
  return MC_Obs_openSheetByName(name);
}

// ==========================================================
// Setup / Repair (operator-friendly, structured logs)
// ==========================================================

function MC_Obs_setupWebAppUrl() {
  var ui = SpreadsheetApp.getUi();
  try {
    var pr = ui.prompt('Setup WebApp URL', 'Nhập CBV_MAIN_CONTROL_WEBAPP_URL (dạng https://script.google.com/…):', ui.ButtonSet.OK_CANCEL);
    if (pr.getSelectedButton() !== ui.Button.OK) return MC_Obs_stdResponse_(true, 'MC_OBS_SETUP_WEBAPP_URL_CANCEL', 'Cancelled', { cancelled: true }, null);
    var url = String(pr.getResponseText() || '').trim();
    if (!/^https?:\/\/.+/i.test(url)) {
      MC_Obs_uiShortError_('Có lỗi. Mở OBS Findings.');
      MC_Obs_writeFindingSafe_('SETUP', 'INVALID_WEBAPP_URL', 'WARN', 'Invalid WebApp URL', 'Nhập URL bắt đầu bằng https://', { url: url });
      return MC_Obs_stdResponse_(false, 'MC_OBS_SETUP_WEBAPP_URL_INVALID', 'Invalid URL', { url: url }, { code: 'INVALID_URL', message: 'Invalid URL', stack: '' });
    }
    PropertiesService.getScriptProperties().setProperty('CBV_MAIN_CONTROL_WEBAPP_URL', url);
    MC_Obs_writeAuditSafe_('SCRIPT_PROPERTY', 'CBV_MAIN_CONTROL_WEBAPP_URL', 'SET', '', url, 'MC_OBS_MENU_SETUP_WEBAPP_URL', { url: url });
    MC_Obs_writeMetricSafe_('OBS_MENU', 'OBS_MENU_SETUP_WEBAPP_URL', 1, 'count', 'OK', 'OK', { url: url });
    return MC_Obs_stdResponse_(true, 'MC_OBS_SETUP_WEBAPP_URL_OK', 'OK', { url: url }, null);
  } catch (e) {
    MC_Obs_uiShortError_('Có lỗi. Mở OBS Findings.');
    MC_Obs_writeFindingSafe_('SETUP', 'SETUP_WEBAPP_URL_EXCEPTION', 'ERROR', 'Setup WebApp URL failed', 'Mở Findings để xem chi tiết.', { error: String(e && e.message ? e.message : e) });
    return MC_Obs_stdResponse_(false, 'MC_OBS_SETUP_WEBAPP_URL_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_setupScriptProperties() {
  // Check-only + short guidance; no hard-fail.
  try {
    var props = PropertiesService.getScriptProperties();
    var keys = ['CBV_CORE_DB_ID', 'CBV_CONFIG_DB_ID', 'CBV_MAIN_WEBAPP_TOKEN', 'CBV_MAIN_CONTROL_WEBAPP_URL'];
    var missing = [];
    var present = [];
    var i;
    for (i = 0; i < keys.length; i++) {
      var v = '';
      try { v = String(props.getProperty(keys[i]) || '').trim(); } catch (e0) { v = ''; }
      if (!v) missing.push(keys[i]);
      else present.push(keys[i]);
    }
    MC_Obs_writeAuditSafe_('OBS_SETUP', 'SCRIPT_PROPERTIES', 'CHECK', '', '', 'MC_OBS_MENU_SETUP_SCRIPT_PROPERTIES', { missing: missing, present: present });
    return MC_Obs_stdResponse_(true, missing.length ? 'MC_OBS_SETUP_SCRIPT_PROPS_WARN' : 'MC_OBS_SETUP_SCRIPT_PROPS_OK', missing.length ? 'Some ScriptProperties are missing' : 'OK', { missing: missing, present: present }, null);
  } catch (e) {
    MC_Obs_uiShortError_('Có lỗi. Mở OBS Findings.');
    MC_Obs_writeFindingSafe_('SETUP', 'SETUP_SCRIPT_PROPERTIES_EXCEPTION', 'ERROR', 'Setup Script Properties check failed', 'Mở Findings để xem chi tiết.', { error: String(e && e.message ? e.message : e) });
    return MC_Obs_stdResponse_(false, 'MC_OBS_SETUP_SCRIPT_PROPS_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_setupConnectionPackageSheet() {
  // Ensure CBV_CONNECTION_PACKAGE (control plane sheet).
  try {
    var r = null;
    if (typeof MC_Schema_ensureControlPlaneSheets === 'function') {
      r = MC_Schema_ensureControlPlaneSheets();
    } else {
      // Best-effort: create sheet with headers from MC_CONTROL_PLANE_SCHEMA_ if available.
      r = MC_Obs_ensureConnectionPackageSheetFallback_();
    }
    MC_Obs_writeAuditSafe_('CONTROL_PLANE', 'CBV_CONNECTION_PACKAGE', 'ENSURE', '', '', 'MC_OBS_MENU_SETUP_CONNECTION_PACKAGE', { result: r });
    return MC_Obs_stdResponse_(true, 'MC_OBS_SETUP_CONNECTION_PACKAGE_OK', 'OK', { result: r }, null);
  } catch (e) {
    MC_Obs_uiShortError_('Có lỗi. Mở OBS Findings.');
    MC_Obs_writeFindingSafe_('SETUP', 'SETUP_CONNECTION_PACKAGE_EXCEPTION', 'ERROR', 'Ensure CBV_CONNECTION_PACKAGE failed', 'Mở Findings để xem chi tiết.', { error: String(e && e.message ? e.message : e) });
    return MC_Obs_stdResponse_(false, 'MC_OBS_SETUP_CONNECTION_PACKAGE_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_repairRegistryHeaders() {
  try {
    var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
    if (!opened.ok) {
      MC_Obs_uiShortError_('Có lỗi. Mở OBS Findings.');
      MC_Obs_writeFindingSafe_('REPAIR', 'CORE_DB_MISSING', 'BLOCKER', 'Core DB not available', 'Set CBV_CORE_DB_ID rồi thử lại.', { error: opened.error || null });
      return MC_Obs_stdResponse_(false, 'MC_OBS_REPAIR_REGISTRY_BLOCKER', 'Core DB not available', {}, opened.error || null);
    }
    var ss = opened.ss;
    var sh = null;
    try { sh = ss.getSheetByName('CBV_MODULE_REGISTRY'); } catch (e0) { sh = null; }
    if (!sh) {
      MC_Obs_uiShortError_('Có lỗi. Mở OBS Findings.');
      MC_Obs_writeFindingSafe_('REPAIR', 'REGISTRY_SHEET_MISSING', 'ERROR', 'CBV_MODULE_REGISTRY missing', 'Chạy bootstrap control plane trước.', {});
      return MC_Obs_stdResponse_(false, 'MC_OBS_REPAIR_REGISTRY_SHEET_MISSING', 'CBV_MODULE_REGISTRY missing', {}, { code: 'SHEET_MISSING', message: 'CBV_MODULE_REGISTRY', stack: '' });
    }
    var need = ['MODULE_WEBAPP_URL', 'ENV_CODE', 'UPDATED_BY', 'HEALTH_STATUS', 'LAST_HEALTH_AT', 'NOTE'];
    var ensured = null;
    if (typeof MC_Obs_ensureHeaders_ === 'function') ensured = MC_Obs_ensureHeaders_(sh, need);
    else ensured = { ok: false, error: { code: 'ENSURE_HEADERS_MISSING', message: 'MC_Obs_ensureHeaders_ missing', stack: '' } };

    MC_Obs_writeAuditSafe_('CONTROL_PLANE', 'CBV_MODULE_REGISTRY', 'REPAIR_HEADERS', '', '', 'MC_OBS_MENU_REPAIR_REGISTRY_HEADERS', { appended: ensured && ensured.appended ? ensured.appended : [], ok: ensured && ensured.ok });
    return MC_Obs_stdResponse_(true, 'MC_OBS_REPAIR_REGISTRY_OK', 'OK', { appended: ensured && ensured.appended ? ensured.appended : [] }, null);
  } catch (e) {
    MC_Obs_uiShortError_('Có lỗi. Mở OBS Findings.');
    MC_Obs_writeFindingSafe_('REPAIR', 'REPAIR_REGISTRY_EXCEPTION', 'ERROR', 'Repair registry headers failed', 'Mở Findings để xem chi tiết.', { error: String(e && e.message ? e.message : e) });
    return MC_Obs_stdResponse_(false, 'MC_OBS_REPAIR_REGISTRY_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

// ==========================================================
// Operator Guide (popup short + structured sheet)
// ==========================================================

function MC_Obs_showOperatorGuide() {
  var ui = SpreadsheetApp.getUi();
  try {
    MC_Obs_ensureOperatorGuideSheet_();
  } catch (e0) {
    /* swallow */
  }
  try {
    ui.alert(
      'MAIN_CONTROL OBS — Guide',
      '1) 🚀 Bootstrap OBS\n2) 🧪 Run Health Check\n3) 🧪 Run Self Test\n4) Nếu có lỗi → 📌 Open Findings\n5) 📤 Generate AI Diagnostic Export\n6) Copy EXPORT_JSON / EXPORT_MARKDOWN gửi ChatGPT',
      ui.ButtonSet.OK
    );
  } catch (e) {
    /* ignore */
  }
  // Open guide sheet best-effort.
  try {
    MC_Obs_openSheetByName((MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS) ? MC_OBS_SCHEMA_.SHEETS.OPERATOR_GUIDE : 'MC_OBS_OPERATOR_GUIDE');
  } catch (e2) {
    /* ignore */
  }
  return MC_Obs_stdResponse_(true, 'MC_OBS_OPERATOR_GUIDE_OK', 'OK', { sheetName: 'MC_OBS_OPERATOR_GUIDE' }, null);
}

// ==========================================================
// Internal utilities (short UI + structured logging)
// ==========================================================

function MC_Obs_menuActionWrapper_(actionCode, introText, fn, opts) {
  var ui = SpreadsheetApp.getUi();
  var o = opts || {};

  try {
    if (!o.silent) {
      ui.alert('MAIN_CONTROL OBS', String(introText || 'Đang chạy…'), ui.ButtonSet.OK);
    }
  } catch (e0) {
    /* ignore */
  }

  var res = null;
  var ok = true;
  try {
    res = (typeof fn === 'function') ? fn() : null;
    ok = !!(res && res.ok !== false);
  } catch (e) {
    ok = false;
    res = MC_Obs_stdResponse_(false, 'MC_OBS_MENU_ACTION_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
    MC_Obs_writeFindingSafe_('OBS_MENU', String(actionCode || 'OBS_MENU_ACTION_EXCEPTION'), 'ERROR', 'Menu action failed', 'Mở Findings để xem chi tiết.', { error: res });
  }

  // Telemetry: audit + metric (+ optional trace).
  try {
    MC_Obs_writeAuditSafe_('OBS_MENU', String(actionCode || ''), ok ? 'OK' : 'ERROR', '', '', 'MC_OBS_MENU', { resultCode: res ? res.code : '', ok: ok });
    MC_Obs_writeMetricSafe_('OBS_MENU', String(actionCode || ''), 1, 'count', ok ? 'OK' : 'ERROR', ok ? 'OK' : 'ERROR', { resultCode: res ? res.code : '' });
    MC_Obs_writeEventTraceSafe_(String(actionCode || ''), ok ? 'OK' : 'ERROR', { resultCode: res ? res.code : '' });
  } catch (tErr) {
    /* swallow */
  }

  if (o.refreshDashboard) {
    try { if (typeof MC_Obs_refreshDashboard === 'function') MC_Obs_refreshDashboard(); } catch (dErr) { /* swallow */ }
  }
  if (o.openDashboard) {
    try { MC_Obs_openDashboard(); } catch (odErr) { /* swallow */ }
  }
  if (o.openSheetName) {
    try { MC_Obs_openSheetByName(String(o.openSheetName)); } catch (osErr) { /* swallow */ }
  }

  // Operator-facing popup: short only.
  try {
    if (!o.silent) {
      if (!ok && o.openFindingsOnError) {
        ui.alert('Có lỗi', 'Có lỗi. Mở OBS Findings.', ui.ButtonSet.OK);
        try { MC_Obs_openFindings(); } catch (ef) { /* ignore */ }
      } else if (o.shortSuccess) {
        ui.alert('Hoàn tất', String(o.shortSuccess), ui.ButtonSet.OK);
      } else if (o.showTestSummary && res && res.data && res.data.counts) {
        var c = res.data.counts;
        ui.alert(
          'Hoàn tất',
          'PASS: ' + (c.passed || 0) + '\nWARN: ' + (c.warned || 0) + '\nERROR: ' + (c.failed || 0) + '\nBLOCKER: ' + (c.blocked || 0) + '\n\nGợi ý: mở Dashboard / Findings để xem chi tiết.',
          ui.ButtonSet.OK
        );
      } else {
        ui.alert('Hoàn tất', ok ? 'OK. Mở Dashboard để xem.' : 'Có lỗi. Mở OBS Findings.', ui.ButtonSet.OK);
      }
    }
  } catch (e2) {
    /* ignore */
  }

  return res || MC_Obs_stdResponse_(ok, ok ? 'MC_OBS_MENU_OK' : 'MC_OBS_MENU_ERROR', ok ? 'OK' : 'ERROR', {}, null);
}

function MC_Obs_uiShortError_(text) {
  try {
    SpreadsheetApp.getUi().alert(String(text || 'Có lỗi. Mở OBS Findings.'), '', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    /* ignore */
  }
}

function MC_Obs_writeFindingSafe_(sourceType, sourceCode, severity, message, actionRequired, dataJson) {
  try {
    if (typeof MC_Obs_appendFinding !== 'function') return;
    MC_Obs_appendFinding({
      SOURCE_TYPE: String(sourceType || 'OBS'),
      SOURCE_CODE: String(sourceCode || ''),
      SEVERITY: String(severity || 'WARN').toUpperCase(),
      STATUS: 'OPEN',
      MESSAGE: String(message || ''),
      ACTION_REQUIRED: String(actionRequired || 'Open Findings'),
      OWNER: (typeof MC_Obs_user_ === 'function') ? MC_Obs_user_() : 'SYSTEM',
      IS_RESOLVED: 'FALSE',
      DATA_JSON: dataJson || {},
      NOTE: ''
    });
  } catch (e) {
    /* swallow */
  }
}

function MC_Obs_writeAuditSafe_(entityType, entityId, action, oldValue, newValue, source, dataJson) {
  try {
    if (typeof MC_Obs_appendAudit !== 'function') return;
    MC_Obs_appendAudit({
      ENTITY_TYPE: String(entityType || 'OBS'),
      ENTITY_ID: String(entityId || ''),
      ACTION: String(action || ''),
      FIELD_NAME: '',
      OLD_VALUE: oldValue != null ? String(oldValue) : '',
      NEW_VALUE: newValue != null ? String(newValue) : '',
      ACTOR_EMAIL: (typeof MC_Obs_user_ === 'function') ? MC_Obs_user_() : 'SYSTEM',
      SOURCE: String(source || 'MC_OBS'),
      COMMAND_ID: (typeof MC_Obs_makeId_ === 'function') ? MC_Obs_makeId_('CMD') : '',
      CORRELATION_ID: '',
      DATA_JSON: dataJson || {}
    });
  } catch (e) {
    /* swallow */
  }
}

function MC_Obs_writeMetricSafe_(metricType, metricName, metricValue, unit, status, severity, dataJson) {
  try {
    if (typeof MC_Obs_appendRuntimeMetric !== 'function') return;
    MC_Obs_appendRuntimeMetric({
      METRIC_TYPE: String(metricType || 'OBS'),
      METRIC_NAME: String(metricName || ''),
      METRIC_VALUE: metricValue,
      UNIT: String(unit || ''),
      STATUS: String(status || 'OK').toUpperCase(),
      SEVERITY: String(severity || 'OK').toUpperCase(),
      DATA_JSON: dataJson || {}
    });
  } catch (e) {
    /* swallow */
  }
}

function MC_Obs_writeEventTraceSafe_(eventType, status, payload) {
  try {
    if (typeof MC_Obs_appendEventTrace !== 'function') return;
    MC_Obs_appendEventTrace({
      EVENT_ID: (typeof MC_Obs_makeId_ === 'function') ? MC_Obs_makeId_('EVT') : ('EVT_' + String(new Date().getTime())),
      EVENT_TYPE: String(eventType || ''),
      ENTITY_TYPE: 'OBS_MENU',
      ENTITY_ID: String(eventType || ''),
      DIRECTION: 'INTERNAL',
      STATUS: String(status || 'OK').toUpperCase(),
      SOURCE_MODULE: 'MAIN_CONTROL',
      TARGET_MODULE: 'MAIN_CONTROL',
      CORRELATION_ID: '',
      IDEMPOTENCY_KEY: '',
      MESSAGE: String(eventType || ''),
      PAYLOAD_JSON: payload || {}
    });
  } catch (e) {
    /* swallow */
  }
}

function MC_Obs_tryAutoResize_(sheet, maxCols) {
  try {
    var n = Number(maxCols || 8);
    if (!(n > 0)) n = 8;
    sheet.autoResizeColumns(1, n);
  } catch (e) {
    /* ignore */
  }
}

function MC_Obs_dashboardUpsertItem_(sheet, item, nowIso) {
  var key = String(item && item.key ? item.key : '').trim();
  if (!key) return;
  var label = String(item && item.label ? item.label : '').trim();
  var status = String(item && item.status ? item.status : 'OK').trim().toUpperCase();
  var severity = String(item && item.severity ? item.severity : 'INFO').trim().toUpperCase();
  var value = item && item.value != null ? String(item.value) : '';
  var data = item && item.data != null ? item.data : {};

  // Ensure header row.
  try {
    if ((sheet.getLastRow() || 0) < 1) {
      sheet.getRange(1, 1, 1, (MC_OBS_SCHEMA_.HEADERS.MC_OBS_DASHBOARD || []).length).setValues([MC_OBS_SCHEMA_.HEADERS.MC_OBS_DASHBOARD]);
    }
  } catch (e0) {
    /* ignore */
  }

  var row = MC_Obs_findRowByKey_(sheet, key);
  if (row < 2) row = (sheet.getLastRow() || 1) + 1;

  var obj = {
    ITEM_KEY: key,
    ITEM_LABEL: label,
    STATUS: status,
    SEVERITY: severity,
    VALUE_TEXT: value,
    DATA_JSON: data,
    UPDATED_AT: String(nowIso || ''),
    NOTE: ''
  };

  // Write using writer if possible, but dashboard is UPSERT (update row).
  try {
    var map = (typeof cbvCoreV2ReadHeaderMap_ === 'function') ? cbvCoreV2ReadHeaderMap_(sheet) : null;
    if (!map) {
      map = {};
      var hdr = (typeof MC_Obs_getHeaders_ === 'function') ? MC_Obs_getHeaders_(sheet) : (MC_OBS_SCHEMA_.HEADERS.MC_OBS_DASHBOARD || []);
      var i;
      for (i = 0; i < hdr.length; i++) map[String(hdr[i] || '').trim()] = i + 1;
    }
    var k;
    for (k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      var c = map[k];
      if (!c) continue;
      var v = obj[k];
      if ((k === 'DATA_JSON') && v && typeof v !== 'string') {
        v = (typeof MC_Obs_safeJson_ === 'function') ? MC_Obs_safeJson_(v) : JSON.stringify(v);
      }
      sheet.getRange(row, c).setValue(v);
    }
  } catch (e1) {
    /* swallow */
  }
}

function MC_Obs_findRowByKey_(sheet, key) {
  try {
    var map = (typeof cbvCoreV2ReadHeaderMap_ === 'function') ? cbvCoreV2ReadHeaderMap_(sheet) : null;
    var col = map && map.ITEM_KEY ? map.ITEM_KEY : 1;
    var last = sheet.getLastRow();
    if (last < 2) return -1;
    var values = sheet.getRange(2, col, last - 1, 1).getValues();
    var i;
    for (i = 0; i < values.length; i++) {
      var v = String(values[i] && values[i][0] != null ? values[i][0] : '').trim();
      if (v === key) return i + 2;
    }
    return -1;
  } catch (e) {
    return -1;
  }
}

function MC_Obs_trySortFindings_() {
  try {
    var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
    if (!opened.ok) return;
    var ss = opened.ss;
    var sh = ss.getSheetByName((MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS) ? MC_OBS_SCHEMA_.SHEETS.FINDING : 'MC_OBS_FINDING');
    if (!sh) return;
    if (sh.getLastRow() < 3) return;
    var map = (typeof cbvCoreV2ReadHeaderMap_ === 'function') ? cbvCoreV2ReadHeaderMap_(sh) : null;
    var col = map && map.CREATED_AT ? map.CREATED_AT : 0;
    if (!col) return;
    sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).sort({ column: col, ascending: false });
  } catch (e) {
    /* ignore */
  }
}

function MC_Obs_countRecentBlockerFindings_(ss, limit) {
  try {
    var n = Number(limit || 200);
    if (!(n > 0)) n = 200;
    var sh = ss.getSheetByName((MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS) ? MC_OBS_SCHEMA_.SHEETS.FINDING : 'MC_OBS_FINDING');
    if (!sh) return '';
    var lastRow = sh.getLastRow();
    if (lastRow < 2) return 0;
    var map = (typeof cbvCoreV2ReadHeaderMap_ === 'function') ? cbvCoreV2ReadHeaderMap_(sh) : null;
    if (!map || !map.SEVERITY) return '';
    var start = Math.max(2, lastRow - n + 1);
    var vals = sh.getRange(start, 1, lastRow - start + 1, sh.getLastColumn()).getValues();
    var colSev = map.SEVERITY - 1;
    var colResolved = map.IS_RESOLVED ? (map.IS_RESOLVED - 1) : -1;
    var i;
    var cnt = 0;
    for (i = 0; i < vals.length; i++) {
      var sev = String(vals[i][colSev] || '').trim().toUpperCase();
      if (sev !== 'BLOCKER') continue;
      if (colResolved >= 0) {
        var r = String(vals[i][colResolved] || '').trim().toUpperCase();
        if (r === 'TRUE' || r === 'YES') continue;
      }
      cnt++;
    }
    return cnt;
  } catch (e) {
    return '';
  }
}

function MC_Obs_getLatestAiExportInfo_(ss) {
  try {
    var sh = ss.getSheetByName((MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS) ? MC_OBS_SCHEMA_.SHEETS.AI_EXPORT : 'MC_OBS_AI_EXPORT');
    if (!sh || sh.getLastRow() < 2) return { runId: '', createdAt: '' };
    var map = (typeof cbvCoreV2ReadHeaderMap_ === 'function') ? cbvCoreV2ReadHeaderMap_(sh) : null;
    var colRun = map && map.RUN_ID ? map.RUN_ID : 0;
    var colAt = map && map.CREATED_AT ? map.CREATED_AT : 0;
    var last = sh.getLastRow();
    var runId = colRun ? String(sh.getRange(last, colRun).getValue() || '').trim() : '';
    var at = colAt ? String(sh.getRange(last, colAt).getValue() || '').trim() : '';
    return { runId: runId, createdAt: at };
  } catch (e) {
    return { runId: '', createdAt: '' };
  }
}

function MC_Obs_ensureOperatorGuideSheet_() {
  try {
    if (typeof MC_Obs_ensureSheets === 'function') MC_Obs_ensureSheets();
  } catch (e0) {
    /* swallow */
  }
  var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
  if (!opened.ok) return;
  var ss = opened.ss;
  var name = (MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.SHEETS) ? MC_OBS_SCHEMA_.SHEETS.OPERATOR_GUIDE : 'MC_OBS_OPERATOR_GUIDE';
  var sh = null;
  try { sh = ss.getSheetByName(name); } catch (e1) { sh = null; }
  if (!sh) return;
  try { if (sh.getFrozenRows() < 1) sh.setFrozenRows(1); } catch (e2) { /* ignore */ }

  if ((sh.getLastRow() || 0) < 2) {
    var nowIso = (typeof MC_Obs_now_ === 'function') ? MC_Obs_now_() : new Date().toISOString();
    var rows = [
      { STEP_NO: 1, TITLE: 'Bootstrap OBS', CONTENT: 'Vào menu 🛡️ MAIN_CONTROL OBS → 🚀 Bootstrap → 🚀 Bootstrap OBS.', UPDATED_AT: nowIso, NOTE: '' },
      { STEP_NO: 2, TITLE: 'Run Health Check', CONTENT: 'Chạy 🧪 Health Check. Nếu báo lỗi: mở Findings.', UPDATED_AT: nowIso, NOTE: '' },
      { STEP_NO: 3, TITLE: 'Run Self Test', CONTENT: 'Chạy 🧪 Self Test để ghi MC_OBS_TEST_RUN/RESULT + Findings nếu có.', UPDATED_AT: nowIso, NOTE: '' },
      { STEP_NO: 4, TITLE: 'Open Findings', CONTENT: 'Nếu thấy WARN/ERROR/BLOCKER: mở 📌 Findings để xem chi tiết và ACTION_REQUIRED.', UPDATED_AT: nowIso, NOTE: '' },
      { STEP_NO: 5, TITLE: 'Generate AI Export', CONTENT: 'Tạo 📤 AI Diagnostic Export → mở MC_OBS_AI_EXPORT → copy EXPORT_JSON / EXPORT_MARKDOWN gửi ChatGPT.', UPDATED_AT: nowIso, NOTE: '' },
      { STEP_NO: 6, TITLE: 'Severity meaning', CONTENT: 'INFO: thông tin\nWARN: cần chú ý\nERROR: lỗi nhưng có thể vẫn chạy\nBLOCKER: cần xử lý ngay trước khi vận hành', UPDATED_AT: nowIso, NOTE: '' }
    ];

    // Write rows (append).
    var hdr = MC_OBS_SCHEMA_.HEADERS.MC_OBS_OPERATOR_GUIDE || ['STEP_NO', 'TITLE', 'CONTENT', 'UPDATED_AT', 'NOTE'];
    try {
      MC_Obs_ensureHeaders_(sh, hdr);
    } catch (e3) {
      /* ignore */
    }
    var i;
    for (i = 0; i < rows.length; i++) {
      try {
        if (typeof cbvCoreV2AppendRowByHeaders_ === 'function') cbvCoreV2AppendRowByHeaders_(sh, rows[i]);
        else sh.appendRow([rows[i].STEP_NO, rows[i].TITLE, rows[i].CONTENT, rows[i].UPDATED_AT, rows[i].NOTE]);
      } catch (e4) {
        /* ignore */
      }
    }
  }
}

function MC_Obs_ensureConnectionPackageSheetFallback_() {
  var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
  if (!opened.ok) return { ok: false, message: 'Core DB not available', error: opened.error || null };
  var ss = opened.ss;
  var name = 'CBV_CONNECTION_PACKAGE';
  var sh = null;
  try { sh = ss.getSheetByName(name); } catch (e0) { sh = null; }
  if (!sh) {
    try { sh = ss.insertSheet(name); } catch (e1) { return { ok: false, message: 'Create sheet failed', error: String(e1 && e1.message ? e1.message : e1) }; }
  }
  var headers = null;
  try {
    if (typeof MC_CONTROL_PLANE_SCHEMA_ !== 'undefined' && MC_CONTROL_PLANE_SCHEMA_ && MC_CONTROL_PLANE_SCHEMA_.sheets && MC_CONTROL_PLANE_SCHEMA_.sheets.CBV_CONNECTION_PACKAGE) {
      headers = MC_CONTROL_PLANE_SCHEMA_.sheets.CBV_CONNECTION_PACKAGE.requiredHeaders;
    }
  } catch (e2) {
    headers = null;
  }
  if (!headers || !headers.length) headers = ['PACKAGE_ID', 'MODULE_CODE', 'STATUS', 'ISSUED_AT', 'PACKAGE_JSON'];
  try {
    if (typeof MC_Obs_ensureHeaders_ === 'function') MC_Obs_ensureHeaders_(sh, headers);
  } catch (e3) {
    /* ignore */
  }
  return { ok: true, message: 'OK', sheetName: name };
}

