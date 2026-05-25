/**
 * RF_12 — GAS Runtime API — Entry point (doGet / doPost).
 * Deploy as Web App: Execute as Me, Access Anyone with link.
 */

function doGet(e) {
  var traceId = buildTraceId_();
  try {
    var action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim() : 'health';
    var actor = parseActorFromRequest_(e);
    var data = null;
    var warnings = [];

    switch (action) {
      case 'health':
        bootstrapSheets_();
        data = {
          service: 'cbv-gas-runtime-api',
          version: 'RF-12-V1',
          mode: 'SHEET_BRIDGE',
          spreadsheetId: getSpreadsheet_().getId(),
          sheets: RF12_CONFIG.SHEETS,
        };
        break;
      case 'tasks':
        data = getTasks_(e.parameter.filter || '');
        break;
      case 'task_detail':
        if (!e.parameter.taskId) {
          return outputJson_(buildEnvelope_(null, { errors: ['Thiếu taskId'], ok: false, status: 'FAIL', traceId: traceId }));
        }
        data = getTaskDetail_(e.parameter.taskId);
        if (!data) {
          return outputJson_(buildEnvelope_(null, { errors: ['Không tìm thấy việc'], ok: false, status: 'FAIL', traceId: traceId }));
        }
        break;
      case 'finance':
        data = getFinance_();
        warnings.push('Finance read stub — chưa kích hoạt write');
        break;
      case 'finance_alerts':
        data = getFinanceAlerts_();
        break;
      case 'hoso':
        data = getHoSo_();
        warnings.push('HoSo read stub — chưa kích hoạt write');
        break;
      case 'hoso_alerts':
        data = getHoSoAlerts_();
        break;
      case 'coordination':
      case 'observation':
      case 'plugins':
        data = { demoLabel: 'GAS bridge — use Worker projection for full payload' };
        warnings.push('Action ' + action + ' — partial stub via GAS');
        break;
      case 'search':
        data = { query: e.parameter.q || '', results: [], demoLabel: 'GAS search stub' };
        warnings.push('Search stub — Worker fallback recommended');
        break;
      default:
        return outputJson_(buildEnvelope_(null, { errors: ['Action không hỗ trợ: ' + action], ok: false, status: 'FAIL', traceId: traceId }));
    }

    appendAuditLog_({
      traceId: traceId,
      actor: actor.displayName,
      action: 'GET:' + action,
      status: 'OK',
      detail: { action: action },
    });

    return outputJson_(buildEnvelope_(data, { warnings: warnings, traceId: traceId }));
  } catch (err) {
    return outputJson_(
      buildEnvelope_(null, {
        errors: [String(err.message || err)],
        ok: false,
        status: 'FAIL',
        traceId: traceId,
      }),
    );
  }
}

function doPost(e) {
  var traceId = buildTraceId_();
  try {
    var body = safeParse_(e && e.postData && e.postData.contents);
    if (!body || !body.action) {
      return outputJson_(buildEnvelope_(null, { errors: ['Thiếu action trong body'], ok: false, status: 'FAIL', traceId: traceId }));
    }

    traceId = body.traceId || traceId;
    var actor = parseActorFromRequest_(e);
    if (body._actor) {
      actor = {
        userId: String(body._actor.userId || actor.userId),
        displayName: String(body._actor.displayName || actor.displayName),
        role: String(body._actor.role || actor.role).toUpperCase(),
        email: String(body._actor.email || actor.email),
      };
    }

    if (!rf12CanWrite_(actor)) {
      appendAuditLog_({ traceId: traceId, actor: actor.displayName, action: body.action, status: 'FORBIDDEN' });
      return outputJson_(buildEnvelope_(null, { errors: ['Không có quyền ghi'], ok: false, status: 'FAIL', traceId: traceId }));
    }

    var payload = body.payload || {};
    var result = null;

    switch (body.action) {
      case 'create_task':
        result = createTask_(payload, actor, traceId);
        break;
      case 'update_task':
        if (!payload.taskId) {
          return outputJson_(buildEnvelope_(null, { errors: ['Thiếu taskId'], ok: false, status: 'FAIL', traceId: traceId }));
        }
        result = updateTask_(payload.taskId, payload, actor, traceId);
        break;
      case 'append_timeline':
        if (!payload.taskId) {
          return outputJson_(buildEnvelope_(null, { errors: ['Thiếu taskId'], ok: false, status: 'FAIL', traceId: traceId }));
        }
        var evt = appendTimeline_({
          taskId: payload.taskId,
          actor: actor.displayName,
          action: payload.action || 'NOTE',
          before: payload.before || null,
          after: payload.after || null,
          note: payload.note || '',
          traceId: traceId,
        });
        appendAuditLog_({ traceId: traceId, actor: actor.displayName, action: 'append_timeline', status: 'OK', detail: { taskId: payload.taskId } });
        return outputJson_(buildEnvelope_({ event: evt }, { traceId: traceId }));
      default:
        appendAuditLog_({ traceId: traceId, actor: actor.displayName, action: body.action, status: 'REJECTED' });
        return outputJson_(buildEnvelope_(null, { errors: ['Action không được phép: ' + body.action], ok: false, status: 'FAIL', traceId: traceId }));
    }

    if (!result.ok) {
      appendAuditLog_({ traceId: traceId, actor: actor.displayName, action: body.action, status: result.code, detail: { message: result.message } });
      return outputJson_(buildEnvelope_(null, { errors: [result.message], ok: false, status: 'FAIL', traceId: traceId }));
    }

    return outputJson_(buildEnvelope_({ task: result.task, event: result.event }, { traceId: traceId }));
  } catch (err) {
    return outputJson_(
      buildEnvelope_(null, {
        errors: [String(err.message || err)],
        ok: false,
        status: 'FAIL',
        traceId: traceId,
      }),
    );
  }
}
