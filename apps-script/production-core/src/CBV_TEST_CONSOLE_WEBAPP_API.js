/**
 * CBV Test Console WebApp FE — google.script.run API.
 * Production-core mirror of main-control Phase F runtime.
 */

function CBV_TestConsole_WebApp_response_(ok, code, message, data, errors, warnings) {
  return { ok: !!ok, code: String(code || (ok ? 'CBV_TEST_CONSOLE_WEBAPP_OK' : 'CBV_TEST_CONSOLE_WEBAPP_ERROR')), message: String(message || ''), data: data || {}, errors: errors || [], warnings: warnings || [] };
}

function CBV_TestConsole_WebApp_errorResponse_(e) {
  return CBV_TestConsole_WebApp_response_(false, 'CBV_TEST_CONSOLE_WEBAPP_EXCEPTION', String(e && e.message ? e.message : e), {}, [String(e && e.stack ? e.stack : e)], []);
}

function cbvTestConsoleWebAppGetDashboard() {
  try {
    return CBV_TestConsole_WebApp_response_(true, 'CBV_TEST_CONSOLE_WEBAPP_DASHBOARD_OK', 'OK', CBV_TestConsole_WebApp_buildDashboardModel_(), [], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppListSuites() {
  try {
    return CBV_TestConsole_WebApp_response_(true, 'CBV_TEST_CONSOLE_WEBAPP_SUITES_OK', 'OK', { suites: CBV_TestConsole_WebApp_listSuitesModel_() }, [], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppListReports(payload) {
  try {
    var p = payload || {};
    return CBV_TestConsole_WebApp_response_(true, 'CBV_TEST_CONSOLE_WEBAPP_REPORTS_OK', 'OK', CBV_TestConsole_WebApp_listReportsModel_(p.limit), [], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppRunSuite(payload) {
  try {
    var p = payload || {};
    var suiteCode = String(p.suiteCode || '').trim().toUpperCase();
    if (!suiteCode) return CBV_TestConsole_WebApp_response_(false, 'CBV_TEST_CONSOLE_WEBAPP_SUITE_REQUIRED', 'suiteCode is required', {}, ['suiteCode is required'], []);
    if (typeof CBV_TestConsole_getSuite_ === 'function') {
      var suite = CBV_TestConsole_getSuite_(suiteCode);
      if (suite && suite.destructive) return CBV_TestConsole_WebApp_response_(false, 'CBV_TEST_CONSOLE_WEBAPP_DESTRUCTIVE_BLOCKED', 'Destructive suites cannot run from WebApp FE.', { suite: suite }, ['DESTRUCTIVE_SUITE_BLOCKED'], []);
    }
    var session = typeof CBV_TestConsole_Session_getActive_ === 'function' ? CBV_TestConsole_Session_getActive_() : null;
    if (!session && typeof CBV_TestConsole_Session_start_ === 'function') session = CBV_TestConsole_Session_start_({ suiteCode: suiteCode });
    if (session && typeof CBV_TestConsole_Session_update_ === 'function') {
      session = CBV_TestConsole_Session_update_({ suiteCode: suiteCode }, 'SUITE_SELECTED', 'Suite selected from WebApp FE');
      if (typeof CBV_TestConsole_State_transition_ === 'function') {
        if (String(session.state || '') === 'SESSION_OPEN') CBV_TestConsole_State_transition_('SUITE_SELECTED', 'Suite selected', { suiteCode: suiteCode });
        session = CBV_TestConsole_Session_getActive_() || session;
        if (String(session.state || '') === 'SUITE_SELECTED' || String(session.state || '') === 'LOCKED') CBV_TestConsole_State_transition_('RUNNING', 'Manual suite run started', { suiteCode: suiteCode });
      }
    }
    var traceId = typeof CBV_TestConsole_newTraceId_ === 'function' ? CBV_TestConsole_newTraceId_() : '';
    if (session && session.traceId) traceId = session.traceId;
    var ctx = CBV_TestConsole_runTestSuite_(suiteCode, traceId);
    var report = CBV_TestConsole_buildReportEnvelope_(ctx);
    CBV_TestConsole_exportReportToDrive_(report);
    try {
      report.reportJson = JSON.stringify({
        ok: report.ok,
        phase: report.phase,
        status: report.status,
        checkedAt: report.checkedAt,
        runBy: report.runBy,
        traceId: report.traceId,
        testSuite: report.testSuite,
        summary: report.summary,
        checks: report.checks,
        warnings: report.warnings,
        errors: report.errors,
        nextStep: report.nextStep,
        severity: report.severity,
        contractVersion: report.contractVersion,
        driveFileId: report.driveFileId || '',
        driveFileUrl: report.driveFileUrl || '',
        exportFileName: report.exportFileName || ''
      }, null, 2);
    } catch (eJson) {
      report.reportJson = '{}';
    }
    report.reportText = CBV_TestConsole_buildReportMarkdown_(report);
    CBV_TestConsole_appendReportSheet_(report);
    var aiHandoff = CBV_TestConsole_buildAiHandoffPrompt_(report);
    if (typeof CBV_TestConsole_Guidance_buildForSession_ === 'function' && typeof CBV_TestConsole_Session_update_ === 'function') {
      session = CBV_TestConsole_Session_getActive_() || session || {};
      var targetState = report.status === 'FAIL' ? 'RECOVERY_REQUIRED' : report.status === 'GO_WITH_WARNINGS' ? 'NEEDS_GUIDANCE' : 'REPORT_READY';
      if (typeof CBV_TestConsole_State_transition_ === 'function') CBV_TestConsole_State_transition_(targetState === 'RECOVERY_REQUIRED' ? 'RECOVERY_REQUIRED' : 'REPORT_READY', 'Manual suite run completed', { status: report.status, severity: report.severity });
      session = CBV_TestConsole_Session_getActive_() || session;
      var guidance = CBV_TestConsole_Guidance_buildForSession_(session, report);
      CBV_TestConsole_Session_update_({ lastReport: report, guidance: guidance }, 'REPORT_ATTACHED', 'Report attached to guided session');
      if (targetState === 'NEEDS_GUIDANCE' && typeof CBV_TestConsole_State_transition_ === 'function') CBV_TestConsole_State_transition_('NEEDS_GUIDANCE', 'Report has warnings', { status: report.status });
    }
    var warnings = Array.isArray(report.warnings) ? report.warnings.slice() : [];
    if (!report.driveFileUrl) warnings.push('DRIVE_EXPORT_NOT_CONFIRMED');
    return CBV_TestConsole_WebApp_response_(true, 'CBV_TEST_CONSOLE_WEBAPP_RUN_DONE', 'Suite run completed; review report status.', { report: report, aiHandoff: aiHandoff, session: typeof CBV_TestConsole_Session_getActive_ === 'function' ? CBV_TestConsole_Session_getActive_() : null }, [], warnings);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppGetAiHandoff(payload) {
  try {
    var p = payload || {};
    var report = p.report || null;
    if (!report && p.traceId) {
      var row = CBV_TestConsole_WebApp_findReportByTraceId_(p.traceId);
      if (row) {
        report = { ok: row.ok, phase: row.phase, status: row.status, checkedAt: row.checkedAt, runBy: row.runBy, traceId: row.traceId, testSuite: row.testSuite, summary: row.summary, checks: [], warnings: [], errors: [], nextStep: row.nextStep, severity: row.severity, contractVersion: row.contractVersion, envelopeOk: row.envelopeOk, driveFileId: row.driveFileId, driveFileUrl: row.driveFileUrl, exportFileName: row.exportFileName, reportJson: row.reportJson, reportText: row.summary };
      }
    }
    if (!report) return CBV_TestConsole_WebApp_response_(false, 'CBV_TEST_CONSOLE_WEBAPP_REPORT_REQUIRED', 'report or traceId is required', {}, ['report or traceId is required'], []);
    return CBV_TestConsole_WebApp_response_(true, 'CBV_TEST_CONSOLE_WEBAPP_HANDOFF_OK', 'OK', { aiHandoff: CBV_TestConsole_buildAiHandoffPrompt_(report) }, [], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppBootstrap() {
  try {
    var data = { steps: [] };
    function step(name, ok, detail) {
      data.steps.push({ name: name, ok: !!ok, detail: detail || '' });
    }
    if (typeof CBV_TestConsole_registerDefaultSuites_ === 'function') {
      CBV_TestConsole_registerDefaultSuites_();
      step('register_default_suites', true, '');
    } else {
      step('register_default_suites', false, 'CBV_TestConsole_registerDefaultSuites_ missing');
    }
    var sh = typeof CBV_TestConsole_getOrCreateReportSheet_ === 'function' ? CBV_TestConsole_getOrCreateReportSheet_() : null;
    step('ensure_report_sheet', !!sh, sh ? CBV_TEST_CONSOLE_REPORT_SHEET_NAME_ : 'sheet unavailable');
    var folderId = typeof CBV_TestConsole_ensureReportFolderProperty_ === 'function' ? CBV_TestConsole_ensureReportFolderProperty_() : '';
    step('ensure_report_folder_property', !!folderId, folderId);
    var ok = true;
    var i;
    for (i = 0; i < data.steps.length; i++) if (!data.steps[i].ok) ok = false;
    return CBV_TestConsole_WebApp_response_(ok, ok ? 'CBV_TEST_CONSOLE_WEBAPP_BOOTSTRAP_OK' : 'CBV_TEST_CONSOLE_WEBAPP_BOOTSTRAP_WARN', ok ? 'Bootstrap OK' : 'Bootstrap completed with warnings', data, ok ? [] : ['See failed steps'], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppHealthCheck() {
  try {
    var data = CBV_TestConsole_WebApp_buildDashboardModel_();
    var warnings = [];
    if (!data.reportSheetAvailable) warnings.push('REPORT_SHEET_NOT_AVAILABLE');
    if (data.reportFolder && !data.reportFolder.accessible) warnings.push('REPORT_FOLDER_NOT_CONFIRMED');
    return CBV_TestConsole_WebApp_response_(warnings.length === 0, warnings.length ? 'CBV_TEST_CONSOLE_WEBAPP_HEALTH_WARN' : 'CBV_TEST_CONSOLE_WEBAPP_HEALTH_OK', warnings.length ? 'Health has warnings' : 'OK', data, [], warnings);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppSelfTest(payload) {
  try {
    return CBV_TestConsole_WebApp_selfTest_(payload || {});
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppStartSession(payload) {
  try {
    return CBV_TestConsole_WebApp_response_(true, 'CBV_TEST_CONSOLE_WEBAPP_SESSION_STARTED', 'Session started', { session: CBV_TestConsole_Session_start_(payload || {}), guidance: CBV_TestConsole_Guidance_getCurrent_().guidance }, [], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppCloseSession(payload) {
  try {
    var out = CBV_TestConsole_Session_close_(payload || {});
    return CBV_TestConsole_WebApp_response_(!!out.ok, out.ok ? 'CBV_TEST_CONSOLE_WEBAPP_SESSION_CLOSED' : 'CBV_TEST_CONSOLE_WEBAPP_SESSION_CLOSE_SKIP', out.message, { session: out.session }, out.ok ? [] : [out.message], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppGetGuidance() {
  try {
    var g = CBV_TestConsole_Guidance_getCurrent_();
    return CBV_TestConsole_WebApp_response_(true, 'CBV_TEST_CONSOLE_WEBAPP_GUIDANCE_OK', 'OK', g, [], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppAcquireLock(payload) {
  try {
    var out = CBV_TestConsole_Lock_acquire_(payload || {});
    return CBV_TestConsole_WebApp_response_(!!out.ok, out.ok ? 'CBV_TEST_CONSOLE_WEBAPP_LOCK_ACQUIRED' : 'CBV_TEST_CONSOLE_WEBAPP_LOCK_DENIED', out.message, out, out.ok ? [] : [out.message], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppReleaseLock(payload) {
  try {
    var out = CBV_TestConsole_Lock_release_(payload || {});
    return CBV_TestConsole_WebApp_response_(!!out.ok, 'CBV_TEST_CONSOLE_WEBAPP_LOCK_RELEASED', out.message, out, [], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppCreateRecoveryPlan(payload) {
  try {
    var plan = CBV_TestConsole_Recovery_create_(payload || {});
    return CBV_TestConsole_WebApp_response_(true, 'CBV_TEST_CONSOLE_WEBAPP_RECOVERY_PLAN_CREATED', 'Recovery plan created', { recoveryPlan: plan, session: CBV_TestConsole_Session_getActive_() }, [], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppListTimeline(payload) {
  try {
    var p = payload || {};
    return CBV_TestConsole_WebApp_response_(true, 'CBV_TEST_CONSOLE_WEBAPP_TIMELINE_OK', 'OK', { timeline: CBV_TestConsole_Timeline_listRecent_(p.limit || 30, p.sessionId || '') }, [], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}

function cbvTestConsoleWebAppGuidedRuntimeSelfTest(payload) {
  try {
    var out = CBV_TestConsole_GuidedRuntime_selfTest_(payload || {});
    return CBV_TestConsole_WebApp_response_(!!out.ok, out.ok ? 'CBV_TEST_CONSOLE_WEBAPP_GUIDED_SELFTEST_OK' : 'CBV_TEST_CONSOLE_WEBAPP_GUIDED_SELFTEST_FAIL', out.message, out.data || {}, out.ok ? [] : ['GUIDED_SELFTEST_FAILED'], []);
  } catch (e) {
    return CBV_TestConsole_WebApp_errorResponse_(e);
  }
}
