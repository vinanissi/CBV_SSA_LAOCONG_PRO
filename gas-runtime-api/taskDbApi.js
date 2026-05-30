/**
 * PHASE_TASK_GS_01 / GS_02A — Task DB API router (POST JSON actions).
 */

function taskDbNormalizeAction_(action) {
  return String(action || '').trim();
}

function taskDbResolveToken_() {
  return PropertiesService.getScriptProperties().getProperty(CBV_TASK_DB_CONFIG.SCRIPT_PROP_TOKEN_KEY) || '';
}

function taskDbValidateToken_(token) {
  var expected = taskDbResolveToken_();
  if (!expected) return true;
  return String(token || '') === String(expected);
}

function taskDbGetAllowedActions_() {
  if (typeof CBV_TaskDb_getAllowedActions === 'function') return CBV_TaskDb_getAllowedActions();
  return typeof CBV_TASK_DB_ACTIONS !== 'undefined' ? CBV_TASK_DB_ACTIONS.slice() : [];
}

function taskDbBuildResponse_(action, data, options) {
  options = options || {};
  return {
    ok: options.ok !== false,
    code: options.code || (options.ok === false ? 'TASK_DB_ERROR' : 'OK'),
    action: action,
    traceId: options.traceId || buildTraceId_(),
    data: data !== undefined ? data : null,
    warnings: options.warnings || [],
    errors: options.errors || [],
    status: options.errors && options.errors.length ? 'FAIL' : (options.warnings && options.warnings.length ? 'GO_WITH_WARNINGS' : 'GO'),
    allowedActions: options.allowedActions,
  };
}

function taskDbBuildUnknownActionResponse_(action, traceId) {
  var allowed = taskDbGetAllowedActions_();
  return {
    ok: false,
    code: 'UNKNOWN_ACTION',
    action: action,
    allowedActions: allowed,
    traceId: traceId || buildTraceId_(),
    data: null,
    warnings: [],
    errors: ['UNKNOWN_ACTION: ' + action],
    status: 'FAIL',
  };
}

function taskDbHandleAction_(action, payload, actor, traceId) {
  action = taskDbNormalizeAction_(action);
  payload = payload || {};
  var warnings = [];

  if (typeof CBV_WiOp_isRegisteredAction === 'function' && CBV_WiOp_isRegisteredAction(action)) {
    var wiOpResult = wiOpHandleAction_(action, payload, actor, traceId);
    if (wiOpResult) return wiOpResult;
  }

  if (!CBV_TaskDb_isRegisteredAction(action)) {
    return taskDbBuildUnknownActionResponse_(action, traceId);
  }

  switch (action) {
    case 'health':
      return taskDbBuildResponse_(action, {
        service: 'cbv-task-db-runtime',
        version: 'TASK_GS_02A',
        mode: 'google_sheet_existing_db',
        spreadsheetId: CBV_TASK_DB_ID,
        configured: true,
        actions: taskDbGetAllowedActions_(),
      }, { traceId: traceId, code: 'OK' });

    case 'validateExistingDb': {
      var validation = CBV_TaskDb_validateExistingDb();
      return taskDbBuildResponse_(action, validation, {
        traceId: traceId,
        warnings: validation.warnings || [],
        ok: validation.ok,
        errors: validation.ok ? [] : validation.missingRequired,
        code: validation.ok ? 'OK' : 'VALIDATION_FAIL',
      });
    }

    case 'getTaskWorkspaceSnapshot': {
      try {
        var snapshot = CBV_TaskDb_getTaskWorkspaceSnapshot(payload);
        if (snapshot.schemaWarnings && snapshot.schemaWarnings.length) {
          warnings = warnings.concat(snapshot.schemaWarnings);
        }
        return taskDbBuildResponse_(action, snapshot, { traceId: traceId, warnings: warnings, code: 'OK' });
      } catch (err) {
        if (taskDbIsRateLimitError_(err)) {
          return taskDbBuildResponse_(action, null, {
            traceId: traceId,
            ok: false,
            code: 'GOOGLE_SHEET_RATE_LIMIT',
            errors: ['GOOGLE_SHEET_RATE_LIMIT'],
          });
        }
        throw err;
      }
    }

    case 'getTaskDetail': {
      if (!payload.taskId) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, code: 'MISSING_PARAM', errors: ['Thiếu taskId'] });
      }
      var detail = taskDbGetTaskDetail_(payload.taskId);
      if (!detail) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, code: 'NOT_FOUND', errors: ['Không tìm thấy task'] });
      }
      return taskDbBuildResponse_(action, detail, { traceId: traceId, code: 'OK' });
    }

    case 'createTask': {
      var created = taskDbCreateTask_(payload, actor);
      if (!created.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, code: 'CREATE_FAILED', errors: [created.message] });
      }
      return taskDbBuildResponse_(action, created, { traceId: traceId, code: 'OK' });
    }

    case 'updateTaskStatus': {
      if (!payload.taskId || !payload.status) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, code: 'MISSING_PARAM', errors: ['Thiếu taskId hoặc status'] });
      }
      var statusResult = taskDbUpdateTaskStatus_(payload.taskId, payload.status, actor, payload.note);
      if (!statusResult.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, code: 'UPDATE_FAILED', errors: [statusResult.message] });
      }
      return taskDbBuildResponse_(action, statusResult, { traceId: traceId, code: 'OK' });
    }

    case 'assignTask': {
      if (!payload.taskId || !payload.assignee) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, code: 'MISSING_PARAM', errors: ['Thiếu taskId hoặc assignee'] });
      }
      var assignResult = taskDbAssignTask_(payload.taskId, payload.assignee, actor, payload.note);
      if (!assignResult.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, code: 'ASSIGN_FAILED', errors: [assignResult.message] });
      }
      return taskDbBuildResponse_(action, assignResult, { traceId: traceId, code: 'OK' });
    }

    case 'addTaskComment': {
      if (!payload.taskId || !payload.comment) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, code: 'MISSING_PARAM', errors: ['Thiếu taskId hoặc comment'] });
      }
      var commentResult = taskDbAddComment_(payload.taskId, payload.comment, actor);
      if (!commentResult.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, code: 'COMMENT_FAILED', errors: [commentResult.message] });
      }
      return taskDbBuildResponse_(action, commentResult, { traceId: traceId, code: 'OK' });
    }

    case 'completeTask': {
      if (!payload.taskId) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, code: 'MISSING_PARAM', errors: ['Thiếu taskId'] });
      }
      var completeResult = taskDbCompleteTask_(payload.taskId, actor, payload.note);
      if (!completeResult.ok) {
        return taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, code: 'COMPLETE_FAILED', errors: [completeResult.message] });
      }
      return taskDbBuildResponse_(action, completeResult, { traceId: traceId, code: 'OK' });
    }

    default:
      return taskDbBuildUnknownActionResponse_(action, traceId);
  }
}

function taskDbDoPost_(e) {
  var traceId = buildTraceId_();
  var entryStart = Date.now();
  try {
    var body = safeParse_(e && e.postData && e.postData.contents);
    if (!body || !body.action) {
      return outputJson_(taskDbBuildResponse_(null, null, { traceId: traceId, ok: false, code: 'MISSING_ACTION', errors: ['Thiếu action'] }));
    }

    var action = taskDbNormalizeAction_(body.action);
    traceId = body.traceId || traceId;
    var taskIdHint = (body.payload && (body.payload.taskId || body.payload.id)) || '';

    if (!CBV_TaskDb_isRegisteredAction(action)) {
      return outputJson_(taskDbBuildUnknownActionResponse_(action, traceId));
    }

    if (!taskDbValidateToken_(body.token)) {
      return outputJson_(taskDbBuildResponse_(action, null, { traceId: traceId, ok: false, code: 'INVALID_TOKEN', errors: ['Token không hợp lệ'] }));
    }

    var actor = parseActorFromRequest_(e);
    if (body.actor) {
      actor = {
        userId: String(body.actor.userId || body.actor || actor.userId),
        displayName: String(body.actor.displayName || body.actor || actor.displayName),
        role: String(body.actor.role || actor.role).toUpperCase(),
        email: String(body.actor.email || actor.email),
      };
    } else if (typeof body.actor === 'string') {
      actor.displayName = body.actor;
      actor.userId = body.actor;
    }

    if (typeof wiPerfBegin_ === 'function') {
      wiPerfBegin_(traceId, action, taskIdHint, actor.userId || actor.displayName);
      if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('parseMs', Date.now() - entryStart);
    }

    var dispatchStart = Date.now();
    if (typeof wiPerfMarkPhase_ === 'function' && WI_PERF_REQ_) {
      wiPerfMarkPhase_('actionDispatchStart', dispatchStart - WI_PERF_REQ_.startMs);
    }
    var result = taskDbHandleAction_(action, body.payload || {}, actor, traceId);
    if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('actionDispatchMs', Date.now() - dispatchStart);
    if (typeof wiPerfFinishAndAttach_ === 'function') {
      result = wiPerfFinishAndAttach_(result, result && result.ok !== false);
    }
    return outputJson_(result);
  } catch (err) {
    if (taskDbIsRateLimitError_(err)) {
      var rateResp = taskDbBuildResponse_(null, null, { traceId: traceId, ok: false, code: 'GOOGLE_SHEET_RATE_LIMIT', errors: ['GOOGLE_SHEET_RATE_LIMIT'] });
      if (typeof wiPerfFinishAndAttach_ === 'function') rateResp = wiPerfFinishAndAttach_(rateResp, false);
      return outputJson_(rateResp);
    }
    var errResp = taskDbBuildResponse_(null, null, { traceId: traceId, ok: false, code: 'INTERNAL_ERROR', errors: [String(err.message || err)] });
    if (typeof wiPerfFinishAndAttach_ === 'function') errResp = wiPerfFinishAndAttach_(errResp, false);
    return outputJson_(errResp);
  }
}

function taskDbDoGet_(e) {
  var traceId = buildTraceId_();
  var action = taskDbNormalizeAction_((e && e.parameter && e.parameter.action) ? e.parameter.action : 'health');
  var actor = parseActorFromRequest_(e);

  if (action === 'validateExistingDb' || action === 'health') {
    return outputJson_(taskDbHandleAction_(action, {}, actor, traceId));
  }

  return outputJson_(taskDbBuildUnknownActionResponse_(action, traceId));
}

function taskDbIsTaskDbAction_(action) {
  return CBV_TaskDb_isRegisteredAction(taskDbNormalizeAction_(action));
}

function cbvRouteTaskDbPost_(e, body, traceId) {
  if (typeof taskDbDoPost_ === 'function') {
    return taskDbDoPost_(e);
  }
  var action = taskDbNormalizeAction_(body && body.action);
  return outputJson_({
    ok: false,
    code: 'TASK_DB_RUNTIME_NOT_DEPLOYED',
    action: action,
    allowedActions: taskDbGetAllowedActions_(),
    traceId: traceId,
    data: null,
    errors: ['Task DB runtime files chưa deploy — chạy clasp push và deploy Web App mới'],
    warnings: [],
    status: 'FAIL',
  });
}

function cbvIsTaskDbAction_(action) {
  var a = taskDbNormalizeAction_(action);
  if (typeof CBV_TaskDb_isRegisteredAction === 'function') return CBV_TaskDb_isRegisteredAction(a);
  if (typeof taskDbIsTaskDbAction_ === 'function') return taskDbIsTaskDbAction_(a);
  var fallback = [
    'health', 'validateExistingDb', 'getTaskWorkspaceSnapshot', 'getTaskDetail',
    'createTask', 'updateTaskStatus', 'assignTask', 'addTaskComment', 'completeTask',
  ];
  return fallback.indexOf(a) >= 0;
}
