/**
 * CBV Test Console Runtime V2 — dedicated menu (isolated from business menus).
 * Menu entries for suites are built from CBV_TestConsole_listSuites_() (Phase C registry).
 */

/**
 * Install 🧪 CBV Test Console menu (call from onOpen).
 */
function buildCbvTestConsoleMenu_() {
  try {
    var ui = SpreadsheetApp.getUi();
    if (!ui) return;

    if (typeof CBV_TestConsole_registerDefaultSuites_ !== 'function' || typeof CBV_TestConsole_listSuites_ !== 'function') {
      Logger.log('buildCbvTestConsoleMenu_: suite registry missing');
      return;
    }

    CBV_TestConsole_registerDefaultSuites_();
    var list = CBV_TestConsole_listSuites_().filter(function (s) {
      return s && s.enabled;
    });

    var maxSlots = typeof CBV_TEST_CONSOLE_MENU_SLOT_MAX !== 'undefined' ? CBV_TEST_CONSOLE_MENU_SLOT_MAX : 8;
    var subPipe = ui.createMenu('Registry — full pipeline');
    var subOnly = ui.createMenu('Registry — suite only');
    var i;
    var n = Math.min(list.length, maxSlots);
    for (i = 0; i < n; i++) {
      var it = list[i];
      var lab = '[' + String(it.domain || '') + '] ' + String(it.label || it.suiteCode);
      subPipe.addItem(lab, 'CBV_TestConsole_menuPipelineSlot_' + i);
      subOnly.addItem(lab, 'CBV_TestConsole_menuSuiteSlot_' + i);
    }

    var subVerify = ui.createMenu('Verification (Phase D)');
    subVerify
      .addItem('Run Verification Pipeline', 'CBV_TestConsole_menuRunVerificationPipeline')
      .addItem('Run Governance Verification', 'CBV_TestConsole_menuRunGovernanceVerification')
      .addItem('Run Runtime Boundary Check', 'CBV_TestConsole_menuRunRuntimeBoundaryCheck')
      .addSeparator()
      .addItem('Show Operational Viewer', 'CBV_TestConsole_menuShowOperationalViewer')
      .addItem('Show Risk Assessment', 'CBV_TestConsole_menuShowRiskAssessment')
      .addItem('Show Decision Gate', 'CBV_TestConsole_menuShowDecisionGate')
      .addSeparator()
      .addItem('Verification runtime self-test', 'CBV_TestConsole_menuVerificationSelfTest');

    var subWorkflow = ui.createMenu('Operational Workflow (Phase E)');
    subWorkflow
      .addItem('Run Workflow Runtime Self-Test', 'CBV_OperationalWorkflow_menuRuntimeSelfTest')
      .addItem('Show Workflow Timeline', 'CBV_OperationalWorkflow_menuShowTimeline')
      .addItem('Show Incident Dashboard', 'CBV_OperationalWorkflow_menuShowIncidentDashboard')
      .addItem('Show Approval Queue', 'CBV_OperationalWorkflow_menuShowApprovalQueue')
      .addItem('Show Workflow Viewer', 'CBV_OperationalWorkflow_menuShowWorkflowViewer')
      .addSeparator()
      .addItem('Run Transition Validation', 'CBV_OperationalWorkflow_menuRunTransitionValidation');

    var subUtil = ui.createMenu('Utilities');
    subUtil
      .addItem('Open report sheet (Core DB)', 'CBV_TestConsole_menuOpenReportSheet')
      .addItem('Generate OBS sample data (TEST_*)', 'MC_Obs_menuGenerateSampleData');

    ui.createMenu('🧪 CBV Test Console')
      .addSubMenu(subPipe)
      .addSubMenu(subOnly)
      .addSubMenu(subVerify)
      .addSubMenu(subWorkflow)
      .addSubMenu(subUtil)
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
