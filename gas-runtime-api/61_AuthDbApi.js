/**
 * PHASE_AUTH_01A — Auth API router (POST JSON actions).
 */

function authDbNormalizeAction_(action) {
  return String(action || '').trim();
}

function authDbValidateToken_(token) {
  var expected = PropertiesService.getScriptProperties().getProperty(CBV_AUTH_DB_CONFIG.SCRIPT_PROP_TOKEN_KEY) || '';
  if (!expected) return true;
  return String(token || '') === String(expected);
}

function authDbGetAllowedActions_() {
  if (typeof CBV_Auth_getAllowedActions === 'function') return CBV_Auth_getAllowedActions();
  if (typeof CBV_AuthDb_getAllowedActions === 'function') return CBV_AuthDb_getAllowedActions();
  return typeof CBV_AUTH_DB_ACTIONS !== 'undefined' ? CBV_AUTH_DB_ACTIONS.slice() : [];
}

function authDbGetMergedAllowedActions_() {
  var rf12 = ['create_task', 'update_task', 'append_timeline'];
  var task = typeof taskDbGetAllowedActions_ === 'function' ? taskDbGetAllowedActions_() : [];
  var auth = authDbGetAllowedActions_();
  var seen = {};
  var out = [];
  rf12.concat(auth).concat(task).forEach(function (a) {
    if (a && !seen[a]) {
      seen[a] = true;
      out.push(a);
    }
  });
  return out;
}

function authDbBuildResponse_(action, data, options) {
  options = options || {};
  return {
    ok: options.ok !== false,
    code: options.code || (options.ok === false ? 'AUTH_ERROR' : 'OK'),
    action: action,
    traceId: options.traceId || buildTraceId_(),
    data: data !== undefined ? data : null,
    warnings: options.warnings || [],
    errors: options.errors || [],
    status: options.errors && options.errors.length ? 'FAIL' : 'GO',
    allowedActions: options.allowedActions,
  };
}

function authDbBuildUnknownActionResponse_(action, traceId) {
  return authDbBuildResponse_(action, null, {
    ok: false,
    code: 'UNKNOWN_ACTION',
    errors: ['Action không được phép: ' + action],
    traceId: traceId,
    allowedActions: authDbGetMergedAllowedActions_(),
  });
}

function authDbHandleAction_(action, payload, actor, traceId) {
  action = authDbNormalizeAction_(action);
  payload = payload || {};
  actor = actor || {};

  if (!CBV_Auth_isRegisteredAction(action)) {
    return authDbBuildUnknownActionResponse_(action, traceId);
  }

  switch (action) {
    case 'authLogin': {
      var login = CBV_Auth_login(payload, actor, traceId);
      if (!login.ok) {
        return authDbBuildResponse_(action, null, {
          ok: false,
          code: login.code,
          errors: [login.message],
          traceId: traceId,
        });
      }
      return authDbBuildResponse_(action, {
        user: login.user,
        mustChangePassword: login.mustChangePassword,
      }, { traceId: traceId, warnings: login.mustChangePassword ? ['MUST_CHANGE_PASSWORD'] : [] });
    }
    case 'authMe': {
      var me = CBV_Auth_me(payload, actor, traceId);
      if (!me.ok) {
        return authDbBuildResponse_(action, null, {
          ok: false,
          code: me.code,
          errors: [me.message],
          traceId: traceId,
        });
      }
      return authDbBuildResponse_(action, { user: me.user }, { traceId: traceId });
    }
    case 'authLogout': {
      CBV_Auth_logout(payload, actor, traceId);
      return authDbBuildResponse_(action, { loggedOut: true }, { traceId: traceId });
    }
    case 'getUserDirectory': {
      var dir = CBV_Auth_getUserDirectory(payload, actor, traceId);
      return authDbBuildResponse_(action, dir, { traceId: traceId });
    }
    default:
      return authDbBuildUnknownActionResponse_(action, traceId);
  }
}

function authDbDoPost_(e) {
  var traceId = buildTraceId_();
  try {
    var body = safeParse_(e && e.postData && e.postData.contents);
    if (!body || !body.action) {
      return outputJson_(authDbBuildResponse_(null, null, {
        ok: false,
        errors: ['Thiếu action trong body'],
        traceId: traceId,
      }));
    }
    traceId = body.traceId || traceId;
    var action = authDbNormalizeAction_(body.action);

    if (!authDbValidateToken_(body.token)) {
      return outputJson_(authDbBuildResponse_(action, null, {
        ok: false,
        code: 'AUTH_TOKEN_INVALID',
        errors: ['Token không hợp lệ'],
        traceId: traceId,
      }));
    }

    var actor = { userId: 'AUTH', displayName: 'AUTH', role: 'SYSTEM', email: '' };
    if (body.actor && typeof body.actor === 'object') {
      actor = {
        userId: String(body.actor.userId || actor.userId),
        displayName: String(body.actor.displayName || actor.displayName),
        role: String(body.actor.role || actor.role),
        email: String(body.actor.email || actor.email),
      };
    }

    var result = authDbHandleAction_(action, body.payload || {}, actor, traceId);
    return outputJson_(result);
  } catch (err) {
    return outputJson_(authDbBuildResponse_(null, null, {
      ok: false,
      code: 'INTERNAL_ERROR',
      errors: [String(err.message || err)],
      traceId: traceId,
    }));
  }
}

function authDbIsAuthDbAction_(action) {
  return CBV_Auth_isRegisteredAction(authDbNormalizeAction_(action));
}

/** AUTH_01A canonical router guards */
function cbvIsAuthAction_(action) {
  var a = authDbNormalizeAction_(action);
  if (typeof CBV_Auth_isRegisteredAction === 'function' && CBV_Auth_isRegisteredAction(a)) return true;
  if (typeof CBV_AuthDb_isRegisteredAction === 'function' && CBV_AuthDb_isRegisteredAction(a)) return true;
  var fallback = typeof CBV_AUTH_DB_ACTIONS !== 'undefined'
    ? CBV_AUTH_DB_ACTIONS
    : ['authLogin', 'authMe', 'authLogout', 'getUserDirectory'];
  return fallback.indexOf(a) >= 0;
}

function cbvRouteAuthPost_(e, body, traceId) {
  if (typeof authDbDoPost_ === 'function') return authDbDoPost_(e);
  return outputJson_(authDbBuildResponse_(body && body.action, null, {
    ok: false,
    code: 'AUTH_RUNTIME_NOT_DEPLOYED',
    errors: ['Auth runtime chưa deploy — clasp push'],
    traceId: traceId,
    allowedActions: authDbGetMergedAllowedActions_(),
  }));
}

/** @deprecated use cbvIsAuthAction_ */
function cbvIsAuthDbAction_(action) {
  return cbvIsAuthAction_(action);
}

/** @deprecated use cbvRouteAuthPost_ */
function cbvRouteAuthDbPost_(e, body, traceId) {
  return cbvRouteAuthPost_(e, body, traceId);
}
