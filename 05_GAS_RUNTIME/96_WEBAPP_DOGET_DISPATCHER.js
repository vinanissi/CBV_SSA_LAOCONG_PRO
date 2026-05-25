/**
 * PHASE_89.1 — WebApp doGet Dispatcher (late-bound)
 *
 * Why: 99_APPSHEET_WEBHOOK.js defines doGet and loads after 94_*. We bind a single effective doGet here.
 * Rules: preserve action=ping; route queries go to WebApp workspace renderer; no destructive writes.
 */

function CbvWebAppWorkspace__doGetDispatcher96_(e) {
  e = e || {};
  var p = e.parameter || {};

  // Route dispatcher (preferred for WebApp workspace).
  if (p.route || p.path) {
    return CbvWebAppWorkspace_doGet(e);
  }

  // Preserve ping.
  var action = String(p.action || '').toLowerCase();
  if (action === 'ping') {
    // Keep legacy webhook ping response shape if available.
    if (typeof _webhookJsonResponse === 'function') {
      return _webhookJsonResponse({ ok: true, code: 'PONG', message: 'Webhook active' });
    }
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        code: 'PING',
        service: 'CBV WebApp',
        checkedAt: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Legacy fallback (if the webhook module is loaded and wants to handle other GETs).
  if (typeof _legacyDoGetFallback_ === 'function') {
    return _legacyDoGetFallback_(e);
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: false,
      code: 'GET_NOT_SUPPORTED',
      supported: ['?route=/workspace', '?route=workspace', '?route=/workspace/role-home', '?route=/workspace/today', '?route=/workspace/workboard', '?route=/workboard', '?route=/workspace/workboard/tasks', '?route=/workboard/tasks', '?route=/workspace/workboard/task-detail', '?route=/workboard/task-detail', '?route=/workspace/workboard/search', '?route=/workboard/search', '?route=/workspace/workboard/notifications', '?route=/workboard/notifications', '?route=/workspace/workboard/files', '?route=/workboard/files', '?route=/workspace/coordination', '?route=/workboard/coordination', '?route=/workspace/coordination/manager', '?route=/workspace/coordination/queue', '?route=/workboard/queue', '?route=/workspace/coordination/overdue', '?route=/workboard/overdue', '?route=/workspace/coordination/workload', '?route=/workboard/workload', '?route=/workspace/coordination/assignment', '?route=/workboard/assignment', '?route=/workspace/observation', '?route=/workboard/observation', '?route=/workspace/observation/health', '?route=/workboard/health', '?route=/workspace/observation/projections', '?route=/workspace/observation/queues', '?route=/workspace/observation/sync', '?route=/workspace/observation/audit', '?route=/workboard/audit', '?route=/workspace/observation/alerts', '?route=/workboard/alerts', '?route=/workspace/plugins', '?route=/workboard/plugins', '?route=/workspace/plugins/task', '?route=/workboard/plugin-task', '?route=/workspace/plugins/finance', '?route=/workboard/plugin-finance', '?route=/workspace/plugins/ho-so', '?route=/workboard/plugin-ho-so', '?route=/workspace/plugins/health', '?route=/workspace/plugins/finance/items', '?route=/workspace/plugins/finance/alerts', '?route=/workspace/plugins/finance/search', '?route=/workspace/plugins/ho-so/items', '?route=/workspace/plugins/ho-so/alerts', '?route=/workspace/plugins/ho-so/search', '?route=/workspace/guided', '?route=/workspace/daily', '?route=/daily', '?route=/workspace/focus', '?route=/focus', '?route=/workspace/execution/task', '?route=/execution/task', '?route=/workspace/sop', '?route=/sop', '?route=/workspace/staff/tasks', '?route=/staff/tasks', '?route=/workspace/staff/task-detail', '?route=/staff/task-detail', '?route=/workspace/staff/feedback', '?route=/staff/feedback', '?route=/home-alert/my-queue', '?route=/home-alert/sla', '?path=/workspace', '?action=ping']
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

