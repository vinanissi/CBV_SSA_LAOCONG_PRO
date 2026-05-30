/**
 * PHASE_AUTH_01A — Auth action router fix test checks.
 */

function CBV_TCS_AUTH_01A_authActionRegistered() {
  var action = 'authLogin';
  var checks = [];

  checks.push({
    id: 'whitelist',
    pass: typeof CBV_AUTH_DB_ACTIONS !== 'undefined' && CBV_AUTH_DB_ACTIONS.indexOf(action) >= 0,
    detail: JSON.stringify(typeof CBV_AUTH_DB_ACTIONS !== 'undefined' ? CBV_AUTH_DB_ACTIONS : []),
  });

  checks.push({
    id: 'isRegistered',
    pass: typeof CBV_Auth_isRegisteredAction === 'function' && CBV_Auth_isRegisteredAction(action),
    detail: 'CBV_Auth_isRegisteredAction',
  });

  checks.push({
    id: 'routerFn',
    pass: typeof CBV_Auth_login === 'function',
    detail: 'CBV_Auth_login',
  });

  checks.push({
    id: 'cbvIsAuthAction',
    pass: typeof cbvIsAuthAction_ === 'function' && cbvIsAuthAction_(action),
    detail: 'cbvIsAuthAction_',
  });

  checks.push({
    id: 'cbvRouteAuthPost',
    pass: typeof cbvRouteAuthPost_ === 'function',
    detail: 'cbvRouteAuthPost_',
  });

  checks.push({
    id: 'mergedAllowedActions',
    pass: typeof authDbGetMergedAllowedActions_ === 'function' &&
      authDbGetMergedAllowedActions_().indexOf('authLogin') >= 0 &&
      authDbGetMergedAllowedActions_().indexOf('getTaskWorkspaceSnapshot') >= 0,
    detail: typeof authDbGetMergedAllowedActions_ === 'function'
      ? authDbGetMergedAllowedActions_().slice(0, 8).join(',')
      : 'missing',
  });

  try {
    var bad = authDbBuildUnknownActionResponse_('notRealAction', 'test-trace');
    checks.push({
      id: 'unknownIncludesAuth',
      pass: bad.allowedActions && bad.allowedActions.indexOf('authLogin') >= 0,
      detail: bad.allowedActions ? bad.allowedActions.join(',') : '',
    });
  } catch (e) {
    checks.push({ id: 'unknownIncludesAuth', pass: false, detail: String(e.message || e) });
  }

  var failed = checks.filter(function (c) { return !c.pass; });
  return {
    suite: 'PHASE_AUTH_01A_AUTH_ACTION_ROUTER_FIX',
    check: 'authLogin action registered',
    status: failed.length === 0 ? 'GO' : 'FAIL',
    checks: checks,
  };
}

function CBV_TCS_AUTH_01A_runAll() {
  return CBV_TCS_AUTH_01A_authActionRegistered();
}
