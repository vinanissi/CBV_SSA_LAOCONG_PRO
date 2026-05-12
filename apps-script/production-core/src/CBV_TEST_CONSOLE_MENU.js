/**
 * CBV Test Console Runtime V2 — thin Sheet launcher menu.
 * The WebApp FE is the primary operator console from Phase F onward.
 */

/**
 * Install 🧪 CBV Test Console menu (call from onOpen).
 */
function buildCbvTestConsoleMenu_() {
  try {
    var ui = SpreadsheetApp.getUi();
    if (!ui) return;

    ui.createMenu('🧪 CBV Test Console')
      .addItem('Open WebApp Frontend', 'CBV_TestConsole_WebApp_menuOpen')
      .addSeparator()
      .addItem('Bootstrap WebApp Runtime', 'CBV_TestConsole_WebApp_menuBootstrap')
      .addItem('Health Check', 'CBV_TestConsole_WebApp_menuHealthCheck')
      .addItem('Run WebApp Self-Test', 'CBV_TestConsole_WebApp_menuSelfTest')
      .addSeparator()
      .addItem('Open report sheet (Core DB)', 'CBV_TestConsole_menuOpenReportSheet')
      .addSeparator()
      .addItem('TASK FE Smoke Test', 'TASK_FE_Test_menuRunSmoke')
      .addItem('TASK FE Runtime Verification', 'TASK_FE_Test_menuRunRuntimeVerification')
      .addItem('Open Latest TASK FE Report', 'TASK_FE_Test_menuOpenLatestReport')
      .addItem('Copy TASK FE AI Handoff Prompt', 'TASK_FE_Test_menuCopyAiHandoff')
      .addToUi();
  } catch (e) {
    Logger.log('buildCbvTestConsoleMenu_ error: ' + e);
  }
}

function CBV_TestConsole_menuAlertResult_(title, report) {
  var ui = SpreadsheetApp.getUi();
  var r = report || {};
  var msg =
    'status=' +
    String(r.status || '') +
    '\nseverity=' +
    String(r.severity || '') +
    '\ntraceId=' +
    String(r.traceId || '') +
    '\n\nnextStep:\n' +
    String(r.nextStep || '');
  ui.alert(String(title || 'Test Console'), msg, ui.ButtonSet.OK);
}

function CBV_TestConsole_menuPipeline_(suite, label) {
  var ui = SpreadsheetApp.getUi();
  try {
    var out = CBV_TestConsole_runFullOperationalFlow_(suite);
    CBV_TestConsole_showReportDialog_(out.report);
    CBV_TestConsole_showAiHandoffDialog_(out.aiHandoff);
    CBV_TestConsole_menuAlertResult_(String(label || suite) + ' — done', out.report);
  } catch (e) {
    ui.alert('Test Console — ' + String(label || suite || ''), String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_TestConsole_menuSuiteOnly_(suite, label) {
  var ui = SpreadsheetApp.getUi();
  try {
    var ctx = CBV_TestConsole_runTestSuite_(suite);
    var rep = CBV_TestConsole_buildReportEnvelope_(ctx);
    CBV_TestConsole_showReportDialog_(rep);
    CBV_TestConsole_menuAlertResult_(String(label || suite || 'Suite'), rep);
  } catch (e) {
    ui.alert('Test Console — ' + String(label || suite || ''), String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_TestConsole_menuVerificationSelfTest() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = CBV_TestConsole_verificationRuntimeSelfTest_();
    ui.alert('Verification self-test', JSON.stringify(r, null, 2), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Verification self-test', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_TestConsole_menuOpenReportSheet() {
  var ui = SpreadsheetApp.getUi();
  try {
    var sh = CBV_TestConsole_getOrCreateReportSheet_();
    if (!sh) {
      ui.alert('Test Console', 'Core DB not available or sheet could not be created.', ui.ButtonSet.OK);
      return;
    }
    var ss = sh.getParent();
    try {
      var active = SpreadsheetApp.getActiveSpreadsheet();
      if (active && String(active.getId()) === String(ss.getId())) {
        ss.setActiveSheet(sh);
        SpreadsheetApp.flush();
      }
    } catch (e0) {
      /* ignore */
    }
    ui.alert('Test Console', 'Sheet: CBV_TEST_CONSOLE_REPORT\n' + ss.getUrl(), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Test Console', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}
