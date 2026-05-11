/**
 * CBV Test Console — Phase C Suite Registry (domain suites, dynamic menu slots).
 *
 * Public:
 * - CBV_TestConsole_listSuites_()
 * - CBV_TestConsole_getSuite_(suiteCode)
 * - CBV_TestConsole_registerDefaultSuites_()
 * - CBV_TestConsole_runRegisteredSuite_(suiteCode)
 * - CBV_TestConsole_registerSuite_(item)
 * - CBV_TestConsole_menuPipelineSlot_0..7, CBV_TestConsole_menuSuiteSlot_0..7
 */

var CBV_TEST_CONSOLE_MENU_SLOT_MAX = 8;

var __CBV_TEST_CONSOLE_SUITES_ = __CBV_TEST_CONSOLE_SUITES_ || {};

/**
 * @returns {Object[]}
 */
function CBV_TestConsole_getDefaultSuiteDefinitions_() {
  return [
    {
      suiteCode: 'TEST_CONSOLE_RUNTIME',
      domain: 'TEST_CONSOLE',
      label: 'Runtime (envelope self-test)',
      runnerFnName: 'CBV_TestConsole_Runtime_selfTest',
      scope: 'TEST_CONSOLE',
      destructive: false,
      productionSafe: true,
      enabled: true,
      description: 'Validates Test Console envelope path without external IO.'
    },
    {
      suiteCode: 'TEST_CONSOLE_DRIVE_EXPORTER',
      domain: 'TEST_CONSOLE',
      label: 'Drive exporter self-test',
      runnerFnName: 'CBV_TestConsole_DriveExporter_selfTest',
      scope: 'TEST_CONSOLE',
      destructive: false,
      productionSafe: true,
      enabled: true,
      description: 'Prefix math + ScriptProperties folder id bootstrap (no file create).'
    },
    {
      suiteCode: 'MAIN_CONTROL_OBS',
      domain: 'MAIN_CONTROL',
      label: 'OBS smoke test',
      runnerFnName: 'MC_Obs_runSmokeTest',
      scope: 'OBS',
      destructive: false,
      productionSafe: true,
      enabled: true,
      description: 'MAIN_CONTROL OBS smoke path (MC_Obs_runSmokeTest).'
    },
    {
      suiteCode: 'MAIN_CONTROL_RUNTIME',
      domain: 'MAIN_CONTROL',
      label: 'Core V2 self-test',
      runnerFnName: 'CBV_CoreV2_selfTest',
      scope: 'CORE_V2',
      destructive: false,
      productionSafe: true,
      enabled: true,
      description: 'Sheets/registry/dispatch/idempotency checks (may write test rows).'
    },
    {
      suiteCode: 'CONFIG_RUNTIME',
      domain: 'CONFIG',
      label: 'CONFIG health check',
      runnerFnName: 'Config_healthCheck_',
      scope: 'CONFIG',
      destructive: false,
      productionSafe: true,
      enabled: true,
      description: 'CONFIG DB structural + consistency checks.'
    },
    {
      suiteCode: 'WEBAPP_RUNTIME',
      domain: 'WEBAPP',
      label: 'WebApp local health payload',
      runnerFnName: 'CBV_TestConsole_runner_WEBAPP_RUNTIME_',
      scope: 'WEBAPP',
      destructive: false,
      productionSafe: true,
      enabled: true,
      description: 'Builds MAIN_CONTROL webapp health payload (no outbound HTTP from runner).'
    },
    {
      suiteCode: 'HOSO_RUNTIME',
      domain: 'HOSO',
      label: 'HOSO config resolver check',
      runnerFnName: 'CBV_HOSO_setup_testConfigResolver',
      scope: 'HOSO',
      destructive: false,
      productionSafe: true,
      enabled: true,
      description: 'CONFIG_DB_ID + CBV_Config_getDbId/getSheetName for HOSO (read-only checks).'
    },
    {
      suiteCode: 'TASK_RUNTIME',
      domain: 'TASK',
      label: 'TASK module (placeholder)',
      runnerFnName: 'CBV_TestConsole_runner_TASK_RUNTIME_',
      scope: 'TASK',
      destructive: false,
      productionSafe: true,
      enabled: true,
      description: 'TASK-bound smoke lives in apps-script/task; MAIN_CONTROL shows delegation notice.'
    }
  ];
}

/**
 * @param {Object} item
 */
function CBV_TestConsole_registerSuite_(item) {
  if (!item || !item.suiteCode) return;
  var code = String(item.suiteCode || '').trim().toUpperCase();
  __CBV_TEST_CONSOLE_SUITES_[code] = {
    suiteCode: code,
    domain: String(item.domain || 'UNKNOWN'),
    label: String(item.label || code),
    runnerFnName: String(item.runnerFnName || ''),
    scope: String(item.scope || ''),
    destructive: !!item.destructive,
    productionSafe: item.productionSafe !== false,
    enabled: item.enabled !== false,
    description: String(item.description || '')
  };
}

/**
 * Registers / refreshes default suite entries (idempotent for known suiteCode keys).
 */
function CBV_TestConsole_registerDefaultSuites_() {
  var defs = CBV_TestConsole_getDefaultSuiteDefinitions_();
  var i;
  for (i = 0; i < defs.length; i++) {
    CBV_TestConsole_registerSuite_(defs[i]);
  }
}

/**
 * @returns {Object[]}
 */
function CBV_TestConsole_listSuites_() {
  CBV_TestConsole_registerDefaultSuites_();
  var out = [];
  var k;
  for (k in __CBV_TEST_CONSOLE_SUITES_) {
    if (!Object.prototype.hasOwnProperty.call(__CBV_TEST_CONSOLE_SUITES_, k)) continue;
    out.push(__CBV_TEST_CONSOLE_SUITES_[k]);
  }
  out.sort(function (a, b) {
    var d = String(a.domain || '').localeCompare(String(b.domain || ''));
    if (d !== 0) return d;
    return String(a.label || '').localeCompare(String(b.label || ''));
  });
  return out;
}

/**
 * @param {string} suiteCode
 * @returns {Object|null}
 */
function CBV_TestConsole_getSuite_(suiteCode) {
  CBV_TestConsole_registerDefaultSuites_();
  var code = String(suiteCode || '').trim().toUpperCase();
  return __CBV_TEST_CONSOLE_SUITES_[code] || null;
}

/**
 * @param {string} name
 * @returns {Function|null}
 */
function CBV_TestConsole_resolveRunnerGlobal_(name) {
  var n = String(name || '').trim();
  if (!n) return null;
  var g = typeof globalThis !== 'undefined' ? globalThis : this;
  try {
    var fn = g[n];
    return typeof fn === 'function' ? fn : null;
  } catch (e) {
    return null;
  }
}

/**
 * @param {Object} res
 * @param {function(string,boolean,string,string,*):void} addCheck
 * @param {string[]} errors
 * @param {function(string):void} setSummary
 */
function CBV_TestConsole_normalizeMcObsStd_(res, addCheck, errors, setSummary) {
  if (!res) {
    errors.push('MC_OBS: null response');
    addCheck('MC_OBS_RESPONSE', false, 'ERROR', 'Null response', {});
    setSummary('MC OBS: null response');
    return;
  }
  var ost = String(res.data && res.data.status ? res.data.status : '').toUpperCase();
  var topOk = ost === 'OK' || (ost === '' && res.ok !== false);
  var topSev = 'OK';
  if (ost === 'WARN') {
    topSev = 'WARNING';
    topOk = false;
  } else if (ost === 'ERROR') {
    topSev = 'ERROR';
    topOk = false;
  } else if (ost === 'BLOCKER') {
    topSev = 'CRITICAL';
    topOk = false;
  } else if (res.ok === false && ost === '') {
    topSev = 'ERROR';
    topOk = false;
  }
  if (!topOk && topSev !== 'WARNING') {
    errors.push(String(res.message || 'MC_OBS failed'));
  }
  addCheck('MC_OBS_TOP', topOk, topSev, String(res.message || (topOk ? 'OK' : 'Completed with findings')), res);
  var results = res.data && res.data.results ? res.data.results : [];
  var i;
  for (i = 0; i < results.length; i++) {
    var row = results[i] || {};
    var st = String(row.status || '').toUpperCase();
    var sev = 'OK';
    var cok = st === 'OK';
    if (st === 'WARN') {
      sev = 'WARNING';
      cok = false;
    } else if (st === 'ERROR') {
      sev = 'ERROR';
      cok = false;
    } else if (st === 'BLOCKER') {
      sev = 'CRITICAL';
      cok = false;
    } else if (st === 'SKIPPED') {
      sev = 'WARNING';
      cok = false;
    }
    addCheck(String(row.testCode || 'TEST_' + i), cok, sev, String(row.message || ''), row);
  }
  setSummary('MC OBS: ' + String(res.message || (topOk ? 'OK' : 'Completed with issues')));
}

/**
 * @param {string} suiteCode
 * @param {*} raw
 * @param {function(string,boolean,string,string,*):void} addCheck
 * @param {string[]} errors
 * @param {string[]} warnings
 * @param {function(string):void} setSummary
 */
function CBV_TestConsole_normalizeRunnerOutput_(suiteCode, raw, addCheck, errors, warnings, setSummary) {
  if (raw && raw.data && Array.isArray(raw.data.results)) {
    CBV_TestConsole_normalizeMcObsStd_(raw, addCheck, errors, setSummary);
    return;
  }
  if (raw && raw.data && Array.isArray(raw.data.steps) && typeof raw.ok === 'boolean') {
    var okC = !!raw.ok;
    if (!okC) errors.push(String(raw.message || 'Core self-test failed'));
    addCheck('CORE_TOP', okC, okC ? 'OK' : 'ERROR', String(raw.message || ''), raw);
    var steps = raw.data.steps;
    var j;
    for (j = 0; j < steps.length; j++) {
      var s = steps[j] || {};
      var sok = !!s.ok;
      addCheck(String(s.name || 'step_' + j), sok, sok ? 'OK' : 'ERROR', String(s.detail || s.name || ''), s);
    }
    setSummary(String(raw.message || 'Core V2 self test'));
    return;
  }
  if (raw && Array.isArray(raw.steps) && typeof raw.ok === 'boolean' && raw.governance !== undefined) {
    var okL = !!raw.ok;
    if (!okL) errors.push('Level6-style run reported failures');
    addCheck('L6_STYLE_TOP', okL, okL ? 'OK' : 'ERROR', okL ? 'OK' : 'FAIL', raw);
    var stL = raw.steps;
    var k;
    for (k = 0; k < stL.length; k++) {
      var t = stL[k] || {};
      var tok = !!t.ok;
      addCheck(String(t.name || 'step_' + k), tok, tok ? 'OK' : 'ERROR', String(t.message || ''), t);
    }
    setSummary(okL ? 'Steps OK' : 'Steps reported issues');
    return;
  }
  if (raw && Array.isArray(raw.steps) && typeof raw.ok === 'boolean') {
    var okH = !!raw.ok;
    if (!okH) errors.push('HOSO resolver check failed');
    addCheck('HOSO_RUNTIME_TOP', okH, okH ? 'OK' : 'ERROR', okH ? 'OK' : 'FAIL', raw);
    var stH = raw.steps;
    var h;
    for (h = 0; h < stH.length; h++) {
      var z = stH[h] || {};
      var zk = !!z.ok;
      addCheck(String(z.name || 'hoso_' + h), zk, zk ? 'OK' : 'ERROR', String(z.detail || ''), z);
    }
    setSummary('HOSO config resolver check');
    return;
  }
  if (raw && typeof raw.ok === 'boolean' && Array.isArray(raw.issues)) {
    var okCfg = !!raw.ok;
    if (!okCfg) errors.push(String(raw.message || 'CONFIG health issues'));
    addCheck('CONFIG_HEALTH_TOP', okCfg, okCfg ? 'OK' : 'ERROR', String(raw.message || ''), raw);
    var iss = raw.issues;
    var x;
    for (x = 0; x < iss.length; x++) {
      addCheck('CONFIG_ISSUE_' + x, false, 'WARNING', String(iss[x] || ''), iss[x]);
    }
    setSummary(String(raw.message || 'CONFIG health'));
    return;
  }
  if (raw && typeof raw.ok === 'boolean' && raw.code && raw.message !== undefined) {
    var okStd = raw.ok !== false;
    addCheck('STD_RESPONSE', okStd, okStd ? 'OK' : 'ERROR', String(raw.message || ''), raw);
    setSummary(String(raw.message || raw.code || 'runner'));
    return;
  }
  if (raw && typeof raw.ok === 'boolean') {
    addCheck('GENERIC_OK', !!raw.ok, raw.ok ? 'OK' : 'ERROR', String(raw.message || 'result'), raw);
    setSummary(String(raw.message || suiteCode));
    return;
  }
  warnings.push('UNRECOGNIZED_RUNNER_SHAPE:' + suiteCode);
  addCheck('RUNNER_SHAPE', false, 'WARNING', 'Unrecognized runner return shape', raw);
  setSummary('Unrecognized runner output for ' + suiteCode);
}

/**
 * @param {string} suiteCode
 * @returns {Object} ctx for CBV_TestConsole_buildReportEnvelope_
 */
function CBV_TestConsole_runRegisteredSuite_(suiteCode) {
  CBV_TestConsole_registerDefaultSuites_();
  var code = String(suiteCode || '').trim().toUpperCase();
  var traceId = CBV_TestConsole_newTraceId_();
  var checkedAt = CBV_TestConsole_isoNow_();
  var runBy = CBV_TestConsole_runBy_();
  var checks = [];
  var warnings = [];
  var errors = [];
  var raw = null;
  var summary = '';

  function addCheck(c0, ok0, sev0, msg0, detail0) {
    checks.push({
      code: String(c0 || ''),
      ok: !!ok0,
      severity: String(sev0 || 'OK').toUpperCase(),
      message: String(msg0 || ''),
      detail: detail0 != null ? detail0 : ''
    });
  }

  function setSummary(s) {
    summary = String(s || '');
  }

  var suite = CBV_TestConsole_getSuite_(code);
  if (!suite) {
    warnings.push('SUITE_NOT_IN_REGISTRY');
    addCheck('REGISTRY_MISS', false, 'ERROR', 'Suite not in registry: ' + code, {});
    summary = 'Unknown registry suite';
  } else if (!suite.enabled) {
    warnings.push('SUITE_DISABLED:' + code);
    addCheck('SUITE_DISABLED', false, 'WARNING', 'Suite disabled', suite);
    summary = 'Suite disabled';
  } else if (suite.destructive) {
    warnings.push('SUITE_DESTRUCTIVE_BLOCKED:' + code);
    addCheck('DESTRUCTIVE_BLOCKED', false, 'WARNING', 'Destructive suite not executed', suite);
    summary = 'Blocked destructive suite';
  } else {
    var fn = CBV_TestConsole_resolveRunnerGlobal_(suite.runnerFnName);
    if (!fn) {
      warnings.push('RUNNER_FN_MISSING:' + suite.runnerFnName);
      addCheck('RUNNER_FN_MISSING', false, 'WARNING', 'Runner not bound: ' + suite.runnerFnName, { runnerFnName: suite.runnerFnName });
      summary = 'Runner missing';
    } else {
      try {
        raw = fn();
        CBV_TestConsole_normalizeRunnerOutput_(code, raw, addCheck, errors, warnings, setSummary);
      } catch (e) {
        var msg = String(e && e.message ? e.message : e);
        errors.push(msg);
        addCheck('RUNNER_EXCEPTION', false, 'ERROR', msg, { stack: String(e && e.stack ? e.stack : '') });
        summary = 'Runner threw';
      }
    }
  }

  var maxRank = 0;
  var anyNotOk = false;
  var i2;
  for (i2 = 0; i2 < checks.length; i2++) {
    var ck = checks[i2] || {};
    var rk = CBV_TestConsole_severityRank_(ck.severity);
    if (rk > maxRank) maxRank = rk;
    if (!ck.ok) anyNotOk = true;
  }
  var preliminaryOk = !(maxRank >= 3 || errors.length > 0);

  var phase = suite && suite.domain ? String(suite.domain) : CBV_TEST_CONSOLE_DEFAULT_PHASE_;

  return {
    phase: phase,
    testSuite: code,
    traceId: traceId,
    checkedAt: checkedAt,
    runBy: runBy,
    summary: summary,
    checks: checks,
    warnings: warnings,
    errors: errors,
    rawSuiteResult: raw,
    ok: preliminaryOk,
    registrySuite: suite || null
  };
}

/** WebApp health payload runner (no UrlFetch). */
function CBV_TestConsole_runner_WEBAPP_RUNTIME_() {
  try {
    if (typeof MC_stdResponse_ !== 'function' || typeof MC_healthPayload_ !== 'function') {
      return { ok: false, code: 'WEBAPP_RUNNER_MISSING', message: 'MC_stdResponse_ / MC_healthPayload_ missing', data: {} };
    }
    var payload = MC_healthPayload_();
    return MC_stdResponse_(true, 'MAIN_CONTROL_WEBAPP_HEALTH_OK', 'OK', payload, null);
  } catch (e) {
    if (typeof MC_stdResponse_ === 'function') {
      return MC_stdResponse_(false, 'WEBAPP_RUNTIME_EXCEPTION', String(e && e.message ? e.message : e), {}, null);
    }
    return { ok: false, message: String(e && e.message ? e.message : e) };
  }
}

/** TASK domain placeholder (TASK DB is a separate Apps Script project). */
function CBV_TestConsole_runner_TASK_RUNTIME_() {
  return {
    ok: true,
    code: 'TASK_RUNTIME_DELEGATION',
    message: 'TASK smoke/obs runs from TASK bound project (not MAIN_CONTROL).',
    data: { hint: 'Use apps-script/task clasp project + TASK_OBS menus for green runs.' }
  };
}

function CBV_TestConsole_menuSlotImpl_(slotIndex, mode) {
  var ui = SpreadsheetApp.getUi();
  try {
    CBV_TestConsole_registerDefaultSuites_();
    var list = CBV_TestConsole_listSuites_().filter(function (s) {
      return s && s.enabled;
    });
    var idx = Number(slotIndex);
    if (!isFinite(idx) || idx < 0 || idx >= list.length || idx >= CBV_TEST_CONSOLE_MENU_SLOT_MAX) {
      ui.alert('Test Console', 'No suite bound to slot ' + String(slotIndex) + '.', ui.ButtonSet.OK);
      return;
    }
    var entry = list[idx];
    var label = String(entry.label || entry.suiteCode);
    if (mode === 'PIPE') {
      CBV_TestConsole_menuPipeline_(entry.suiteCode, label);
    } else {
      CBV_TestConsole_menuSuiteOnly_(entry.suiteCode, label);
    }
  } catch (e) {
    ui.alert('Test Console', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_TestConsole_menuPipelineSlot_0() {
  CBV_TestConsole_menuSlotImpl_(0, 'PIPE');
}
function CBV_TestConsole_menuPipelineSlot_1() {
  CBV_TestConsole_menuSlotImpl_(1, 'PIPE');
}
function CBV_TestConsole_menuPipelineSlot_2() {
  CBV_TestConsole_menuSlotImpl_(2, 'PIPE');
}
function CBV_TestConsole_menuPipelineSlot_3() {
  CBV_TestConsole_menuSlotImpl_(3, 'PIPE');
}
function CBV_TestConsole_menuPipelineSlot_4() {
  CBV_TestConsole_menuSlotImpl_(4, 'PIPE');
}
function CBV_TestConsole_menuPipelineSlot_5() {
  CBV_TestConsole_menuSlotImpl_(5, 'PIPE');
}
function CBV_TestConsole_menuPipelineSlot_6() {
  CBV_TestConsole_menuSlotImpl_(6, 'PIPE');
}
function CBV_TestConsole_menuPipelineSlot_7() {
  CBV_TestConsole_menuSlotImpl_(7, 'PIPE');
}

function CBV_TestConsole_menuSuiteSlot_0() {
  CBV_TestConsole_menuSlotImpl_(0, 'SUITE');
}
function CBV_TestConsole_menuSuiteSlot_1() {
  CBV_TestConsole_menuSlotImpl_(1, 'SUITE');
}
function CBV_TestConsole_menuSuiteSlot_2() {
  CBV_TestConsole_menuSlotImpl_(2, 'SUITE');
}
function CBV_TestConsole_menuSuiteSlot_3() {
  CBV_TestConsole_menuSlotImpl_(3, 'SUITE');
}
function CBV_TestConsole_menuSuiteSlot_4() {
  CBV_TestConsole_menuSlotImpl_(4, 'SUITE');
}
function CBV_TestConsole_menuSuiteSlot_5() {
  CBV_TestConsole_menuSlotImpl_(5, 'SUITE');
}
function CBV_TestConsole_menuSuiteSlot_6() {
  CBV_TestConsole_menuSlotImpl_(6, 'SUITE');
}
function CBV_TestConsole_menuSuiteSlot_7() {
  CBV_TestConsole_menuSlotImpl_(7, 'SUITE');
}
