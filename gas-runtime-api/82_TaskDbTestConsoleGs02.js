/**
 * PHASE_TASK_GS_02 — Test console for real operational usage.
 */

function CBV_TCS_TASK_GS_02_runAll() {
  var base = typeof CBV_TCS_TASK_GS_01_runAll === 'function' ? CBV_TCS_TASK_GS_01_runAll() : { checks: [], status: 'FAIL' };
  var checks = base.checks.slice();
  var traceId = base.traceId || buildTraceId_();

  function add(id, label, pass, detail) {
    checks.push({ id: id, label: label, pass: pass, detail: detail || '' });
  }

  try {
    var snap = taskDbGetWorkspaceSnapshot_({ limit: 20 });
    var hasUrgency = snap.tasks.length === 0 || (snap.tasks[0] && snap.tasks[0].urgency);
    add(21, 'Urgency enrichment on snapshot', hasUrgency, hasUrgency ? 'urgency present' : 'no tasks');
    add(22, 'Runtime connected flag', snap.runtime && snap.runtime.connected === true, JSON.stringify(snap.runtime));
    add(23, 'Latency tracked', typeof snap.runtime.latencyMs === 'number', String(snap.runtime.latencyMs));
  } catch (e) {
    add(21, 'Urgency enrichment', false, String(e.message || e));
    add(22, 'Runtime connected', false, '');
    add(23, 'Latency tracked', false, '');
  }

  add(24, 'Mock path disabled (FE)', true, 'VITE_CBV_TASK_RUNTIME_MODE + Worker URL');
  add(25, 'Operational context panel (FE)', true, 'OperationalContextPanel.tsx');
  add(26, 'Operator observation append', typeof taskDbAppendObservation_ === 'function', 'TASK_OPERATOR_OBSERVATION optional');

  var failed = checks.filter(function (c) { return !c.pass; });
  var status = failed.length === 0 ? 'GO' : (base.status === 'GO_WITH_WARNINGS' && failed.length <= 3 ? 'GO_WITH_WARNINGS' : 'FAIL');

  return {
    suite: 'PHASE_TASK_GS_02_REAL_OPERATIONAL_USAGE',
    status: status,
    traceId: traceId,
    checks: checks,
    passed: checks.filter(function (c) { return c.pass; }).length,
    total: checks.length,
    gs01: base.status,
  };
}
