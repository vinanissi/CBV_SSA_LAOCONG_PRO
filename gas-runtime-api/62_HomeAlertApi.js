/**
 * HOME_ALERT POST JSON router (same envelope as taskDbApi).
 */

function homeAlertNormalizeAction_(action) {
  return String(action || '').trim();
}

function homeAlertBuildResponse_(action, data, options) {
  options = options || {};
  return {
    ok: options.ok !== false,
    code: options.code || (options.ok === false ? 'HOME_ALERT_ERROR' : 'OK'),
    action: action,
    traceId: options.traceId || buildTraceId_(),
    data: data !== undefined ? data : null,
    warnings: options.warnings || [],
    errors: options.errors || [],
    status: options.errors && options.errors.length ? 'FAIL' : 'GO',
  };
}

function homeAlertHandleAction_(action, payload, actor, traceId) {
  action = homeAlertNormalizeAction_(action);
  payload = payload || {};

  if (!CBV_HomeAlert_isRegisteredAction(action)) {
    return homeAlertBuildResponse_(action, null, {
      ok: false,
      code: 'UNKNOWN_ACTION',
      errors: ['UNKNOWN_ACTION: ' + action],
      traceId: traceId,
    });
  }

  switch (action) {
    case 'health':
      return homeAlertBuildResponse_(action, {
        service: 'cbv-home-alert-runtime',
        sheet: CBV_HOME_ALERT_SHEET,
        spreadsheetId: CBV_TASK_DB_ID,
        actions: CBV_HomeAlert_getAllowedActions(),
      }, { traceId: traceId });

    case 'getTodaySummary': {
      var summary = homeAlertBuildTodaySummary_(payload);
      return homeAlertBuildResponse_(action, summary, {
        traceId: traceId,
        warnings: summary.warnings || [],
      });
    }

    case 'claimHomeAlert': {
      if (!payload.alertId) {
        return homeAlertBuildResponse_(action, null, {
          ok: false,
          code: 'MISSING_PARAM',
          errors: ['Thiếu alertId'],
          traceId: traceId,
        });
      }
      var claim = homeAlertClaim_(payload.alertId, actor, payload.note);
      if (!claim.ok) {
        return homeAlertBuildResponse_(action, null, {
          ok: false,
          code: 'CLAIM_FAILED',
          errors: [claim.message],
          traceId: traceId,
        });
      }
      return homeAlertBuildResponse_(action, claim, { traceId: traceId });
    }

    case 'resolveHomeAlert': {
      if (!payload.alertId) {
        return homeAlertBuildResponse_(action, null, {
          ok: false,
          code: 'MISSING_PARAM',
          errors: ['Thiếu alertId'],
          traceId: traceId,
        });
      }
      var resolved = homeAlertResolve_(payload.alertId, actor, payload.note);
      if (!resolved.ok) {
        return homeAlertBuildResponse_(action, null, {
          ok: false,
          code: 'RESOLVE_FAILED',
          errors: [resolved.message],
          traceId: traceId,
        });
      }
      return homeAlertBuildResponse_(action, resolved, { traceId: traceId });
    }

    default:
      return homeAlertBuildResponse_(action, null, {
        ok: false,
        code: 'UNKNOWN_ACTION',
        errors: ['UNKNOWN_ACTION: ' + action],
        traceId: traceId,
      });
  }
}

function homeAlertDoPost_(e) {
  var traceId = buildTraceId_();
  try {
    var body = safeParse_(e && e.postData && e.postData.contents);
    if (!body || !body.action) {
      return outputJson_(homeAlertBuildResponse_(null, null, { ok: false, errors: ['Thiếu action'], traceId: traceId }));
    }
    traceId = body.traceId || traceId;
    var action = homeAlertNormalizeAction_(body.action);

    if (typeof taskDbValidateToken_ === 'function' && !taskDbValidateToken_(body.token)) {
      return outputJson_(homeAlertBuildResponse_(action, null, { ok: false, code: 'UNAUTHORIZED', errors: ['Token không hợp lệ'], traceId: traceId }));
    }

    var actor = parseActorFromRequest_(e);
    if (body._actor) {
      actor = {
        userId: String(body._actor.userId || actor.userId),
        displayName: String(body._actor.displayName || actor.displayName),
        role: String(body._actor.role || actor.role).toUpperCase(),
        email: String(body._actor.email || actor.email),
      };
    }

    var result = homeAlertHandleAction_(action, body.payload || {}, actor, traceId);
    return outputJson_(result);
  } catch (err) {
    return outputJson_(
      homeAlertBuildResponse_(null, null, {
        ok: false,
        code: 'INTERNAL_ERROR',
        errors: [String(err.message || err)],
        traceId: traceId,
      }),
    );
  }
}

function homeAlertIsHomeAlertAction_(action) {
  return CBV_HomeAlert_isRegisteredAction(homeAlertNormalizeAction_(action));
}

function cbvIsHomeAlertAction_(action) {
  return homeAlertIsHomeAlertAction_(action);
}

function cbvRouteHomeAlertPost_(e, body, traceId) {
  if (typeof homeAlertDoPost_ === 'function') return homeAlertDoPost_(e);
  return outputJson_({
    ok: false,
    code: 'HOME_ALERT_RUNTIME_NOT_DEPLOYED',
    traceId: traceId,
    errors: ['HOME_ALERT runtime chưa deploy — clasp push + deploy Web App'],
    warnings: [],
    status: 'FAIL',
  });
}
