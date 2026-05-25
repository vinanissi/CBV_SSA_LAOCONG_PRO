/**
 * PHASE_89.2 — FORCE FINAL WebApp doGet Dispatcher
 *
 * This file MUST be last in .clasp.json filePushOrder to guarantee it is the effective global doGet.
 * Rules: route/path → WebApp workspace; action=ping → explicit handler response; else GET_NOT_SUPPORTED.
 */

function doGet(e) {
  e = e || {};
  var p = e.parameter || {};

  // Route/path requests go to WebApp workspace renderer.
  if (p.route || p.path) {
    return CbvWebAppWorkspace_doGet(e);
  }

  // Preserve ping in a deterministic way for Phase 89.2 validation.
  var action = String(p.action || '').toLowerCase();
  if (action === 'ping') {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        code: 'PING',
        handler: '999_WEBAPP_DOGET_DISPATCHER_FINAL',
        checkedAt: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: false,
      code: 'GET_NOT_SUPPORTED',
      handler: '999_WEBAPP_DOGET_DISPATCHER_FINAL',
      supported: ['?route=/workspace', '?route=workspace', '?route=/workspace/role-home', '?route=/workspace/today', '?route=/workspace/workboard', '?route=/workboard', '?route=/workspace/workboard/tasks', '?route=/workboard/tasks', '?route=/workspace/workboard/task-detail', '?route=/workboard/task-detail', '?route=/workspace/workboard/search', '?route=/workboard/search', '?route=/workspace/workboard/notifications', '?route=/workboard/notifications', '?route=/workspace/workboard/files', '?route=/workboard/files', '?route=/workspace/coordination', '?route=/workboard/coordination', '?route=/workspace/coordination/manager', '?route=/workspace/coordination/queue', '?route=/workboard/queue', '?route=/workspace/coordination/overdue', '?route=/workboard/overdue', '?route=/workspace/coordination/workload', '?route=/workboard/workload', '?route=/workspace/coordination/assignment', '?route=/workboard/assignment', '?route=/workspace/observation', '?route=/workboard/observation', '?route=/workspace/observation/health', '?route=/workboard/health', '?route=/workspace/observation/projections', '?route=/workspace/observation/queues', '?route=/workspace/observation/sync', '?route=/workspace/observation/audit', '?route=/workboard/audit', '?route=/workspace/observation/alerts', '?route=/workboard/alerts', '?route=/workspace/plugins', '?route=/workboard/plugins', '?route=/workspace/plugins/task', '?route=/workboard/plugin-task', '?route=/workspace/plugins/finance', '?route=/workboard/plugin-finance', '?route=/workspace/plugins/ho-so', '?route=/workboard/plugin-ho-so', '?route=/workspace/plugins/health', '?route=/workspace/plugins/finance/items', '?route=/workspace/plugins/finance/alerts', '?route=/workspace/plugins/finance/search', '?route=/workspace/plugins/ho-so/items', '?route=/workspace/plugins/ho-so/alerts', '?route=/workspace/plugins/ho-so/search', '?route=/workspace/guided', '?route=/workspace/daily', '?route=/daily', '?route=/workspace/focus', '?route=/focus', '?route=/workspace/execution/task', '?route=/execution/task', '?route=/workspace/sop', '?route=/sop', '?route=/workspace/staff/tasks', '?route=/staff/tasks', '?route=/workspace/staff/task-detail', '?route=/staff/task-detail', '?route=/workspace/staff/feedback', '?route=/staff/feedback', '?route=/home-alert/my-queue', '?route=/home-alert/sla', '?path=/workspace', '?action=ping']
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

