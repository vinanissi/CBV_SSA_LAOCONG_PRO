/**
 * CBV Test Console WebApp FE — idempotent self-test.
 * Production-core mirror of main-control Phase F runtime.
 */

function CBV_TestConsole_WebApp_selfTest_(options) {
  var opts = options || {};
  var data = { steps: [] };
  function step(name, ok, detail) {
    data.steps.push({ name: name, ok: !!ok, detail: detail || '' });
  }
  try {
    step('route_match_app', CBV_TestConsole_shouldServeWebApp_({ parameter: { app: 'TEST_CONSOLE' } }) === true, 'app=TEST_CONSOLE');
    step('route_match_ui', CBV_TestConsole_shouldServeWebApp_({ parameter: { ui: 'CBV_TEST_CONSOLE' } }) === true, 'ui=CBV_TEST_CONSOLE');
    step('route_json_passthrough', CBV_TestConsole_shouldServeWebApp_({ parameter: { action: 'health' } }) === false, 'action=health remains JSON');
    var dashboard = CBV_TestConsole_WebApp_buildDashboardModel_();
    step('dashboard_model', !!dashboard && typeof dashboard === 'object', 'suiteCount=' + String(dashboard && dashboard.suiteCount));
    var suitesRes = cbvTestConsoleWebAppListSuites();
    var suiteCount = suitesRes && suitesRes.data && suitesRes.data.suites ? suitesRes.data.suites.length : 0;
    step('suite_list_api', !!(suitesRes && suitesRes.ok && suiteCount >= 1), 'suiteCount=' + String(suiteCount));
    var reportsRes = cbvTestConsoleWebAppListReports({ limit: 3 });
    step('report_library_read_api', !!(reportsRes && reportsRes.ok && reportsRes.data && Array.isArray(reportsRes.data.reports)), 'reports=' + String(reportsRes && reportsRes.data ? reportsRes.data.reports.length : 0));
    var handoffRes = cbvTestConsoleWebAppGetAiHandoff({
      report: {
        ok: true,
        phase: 'WEBAPP_FE_SELFTEST',
        status: 'GO',
        checkedAt: typeof CBV_TestConsole_isoNow_ === 'function' ? CBV_TestConsole_isoNow_() : new Date().toISOString(),
        runBy: 'SELFTEST',
        traceId: 'SELFTEST_TRACE',
        testSuite: 'WEBAPP_FE_SELFTEST',
        summary: 'Synthetic handoff generation check',
        checks: [],
        warnings: [],
        errors: [],
        nextStep: 'No action.',
        severity: 'OK',
        contractVersion: typeof CBV_TEST_CONSOLE_CONTRACT_VERSION !== 'undefined' ? CBV_TEST_CONSOLE_CONTRACT_VERSION : '',
        envelopeOk: true,
        reportText: 'Synthetic report'
      }
    });
    step('ai_handoff_api', !!(handoffRes && handoffRes.ok && handoffRes.data && handoffRes.data.aiHandoff), 'length=' + String(handoffRes && handoffRes.data && handoffRes.data.aiHandoff ? handoffRes.data.aiHandoff.length : 0));
    if (opts.runSafeSuite === true) {
      var runRes = cbvTestConsoleWebAppRunSuite({ suiteCode: 'TEST_CONSOLE_RUNTIME' });
      step('explicit_safe_suite_run', !!(runRes && runRes.ok && runRes.data && runRes.data.report), runRes && runRes.data && runRes.data.report ? String(runRes.data.report.traceId || '') : 'no report');
    } else {
      step('explicit_safe_suite_run_skipped', true, 'Set runSafeSuite=true to append a real report and Drive file.');
    }
    if (typeof CBV_TestConsole_GuidedRuntime_selfTest_ === 'function') {
      var guided = CBV_TestConsole_GuidedRuntime_selfTest_({ writeSyntheticSession: false });
      step('guided_runtime_selftest', !!(guided && guided.ok), guided && guided.message);
    }
  } catch (e) {
    step('selftest_exception', false, String(e && e.message ? e.message : e));
  }
  var ok = true;
  var i;
  for (i = 0; i < data.steps.length; i++) if (!data.steps[i].ok) ok = false;
  return CBV_TestConsole_WebApp_response_(ok, ok ? 'CBV_TEST_CONSOLE_WEBAPP_SELFTEST_OK' : 'CBV_TEST_CONSOLE_WEBAPP_SELFTEST_FAIL', ok ? 'Self-test OK' : 'Self-test failed; see steps', data, ok ? [] : ['SELFTEST_STEP_FAILED'], []);
}
