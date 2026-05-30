/**
 * PHASE_TASK_GS_02A — Router fix test checks.
 */

function CBV_TCS_GS_02A_snapshotActionRegistered() {
  var action = 'getTaskWorkspaceSnapshot';
  var checks = [];

  checks.push({
    id: 'whitelist',
    pass: typeof CBV_TASK_DB_ACTIONS !== 'undefined' && CBV_TASK_DB_ACTIONS.indexOf(action) >= 0,
    detail: JSON.stringify(typeof CBV_TASK_DB_ACTIONS !== 'undefined' ? CBV_TASK_DB_ACTIONS : []),
  });

  checks.push({
    id: 'isRegistered',
    pass: typeof CBV_TaskDb_isRegisteredAction === 'function' && CBV_TaskDb_isRegisteredAction(action),
    detail: 'CBV_TaskDb_isRegisteredAction',
  });

  checks.push({
    id: 'routerFn',
    pass: typeof CBV_TaskDb_getTaskWorkspaceSnapshot === 'function',
    detail: 'CBV_TaskDb_getTaskWorkspaceSnapshot',
  });

  checks.push({
    id: 'cbvIsTaskDbAction',
    pass: typeof cbvIsTaskDbAction_ === 'function' && cbvIsTaskDbAction_(action),
    detail: 'cbvIsTaskDbAction_',
  });

  try {
    var snap = CBV_TaskDb_getTaskWorkspaceSnapshot({ limit: 5 });
    checks.push({
      id: 'snapshotCall',
      pass: snap && Array.isArray(snap.tasks),
      detail: 'tasks=' + (snap.tasks ? snap.tasks.length : 0),
    });
  } catch (e) {
    checks.push({ id: 'snapshotCall', pass: false, detail: String(e.message || e) });
  }

  var failed = checks.filter(function (c) { return !c.pass; });
  return {
    suite: 'PHASE_TASK_GS_02A_RUNTIME_ACTION_ROUTER_FIX',
    check: 'snapshot action registered',
    status: failed.length === 0 ? 'GO' : 'FAIL',
    checks: checks,
  };
}

function CBV_TCS_GS_02A_runAll() {
  var snapCheck = CBV_TCS_GS_02A_snapshotActionRegistered();
  var base = typeof CBV_TCS_TASK_GS_02_runAll === 'function' ? CBV_TCS_TASK_GS_02_runAll() : null;
  return {
    suite: 'PHASE_TASK_GS_02A_RUNTIME_ACTION_ROUTER_FIX',
    status: snapCheck.status === 'GO' && (!base || base.status !== 'FAIL') ? (base && base.status === 'GO_WITH_WARNINGS' ? 'GO_WITH_WARNINGS' : 'GO') : 'FAIL',
    snapshotAction: snapCheck,
    gs02: base,
  };
}
