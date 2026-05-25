/**
 * RF_12 — GAS Runtime API — wired into main Web App deployment.
 * Routed from 999_WEBAPP_DOGET_DISPATCHER_FINAL (GET) and 61_UNIFIED_ROUTER (POST).
 */

var CBV_RF12_GET_ACTIONS_ = [
  'health', 'tasks', 'task_detail', 'finance', 'finance_alerts',
  'hoso', 'hoso_alerts', 'coordination', 'observation', 'plugins', 'search'
];

var CBV_RF12_POST_ACTIONS_ = ['create_task', 'update_task', 'append_timeline'];

function CbvRf12_isGetAction(action) {
  return CBV_RF12_GET_ACTIONS_.indexOf(String(action || '').toLowerCase()) !== -1;
}

function CbvRf12_isPostAction(action) {
  return CBV_RF12_POST_ACTIONS_.indexOf(String(action || '').trim()) !== -1;
}

function CbvRf12GasApi_doGet(e) {
  var traceId = buildTraceId_();
  try {
    var action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim() : 'health';
    var actor = parseActorFromRequest_(e);
    var data = null;
    var warnings = [];

    switch (action) {
      case 'health': {
        var sheetId = resolveSpreadsheetId_();
        if (!sheetId) {
          return outputJson_(
            buildEnvelope_(
              {
                service: 'cbv-gas-runtime-api',
                version: 'RF-12-V1',
                mode: 'NOT_CONFIGURED',
                configured: false,
              },
              {
                warnings: ['Set Script Property CBV_SPREADSHEET_ID or bind project to Spreadsheet'],
                status: 'GO_WITH_WARNINGS',
                traceId: traceId,
              },
            ),
          );
        }
        bootstrapSheets_();
        data = {
          service: 'cbv-gas-runtime-api',
          version: 'RF-12-V1',
          mode: 'SHEET_BRIDGE',
          spreadsheetId: sheetId,
          sheets: RF12_CONFIG.SHEETS,
          bound: Boolean(SpreadsheetApp.getActiveSpreadsheet()),
          configured: true,
        };
        break;
      }
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

function CbvRf12GasApi_doPost(e) {
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
