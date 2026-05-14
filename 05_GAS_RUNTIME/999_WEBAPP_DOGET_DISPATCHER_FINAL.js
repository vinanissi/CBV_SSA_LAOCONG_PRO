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
      supported: ['?route=/workspace', '?route=workspace', '?route=/workspace/role-home', '?route=/workspace/today', '?route=/workspace/guided', '?route=/workspace/daily', '?route=/daily', '?route=/workspace/staff/tasks', '?route=/staff/tasks', '?route=/workspace/staff/task-detail', '?route=/staff/task-detail', '?route=/workspace/staff/feedback', '?route=/staff/feedback', '?route=/home-alert/my-queue', '?route=/home-alert/sla', '?path=/workspace', '?action=ping']
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

