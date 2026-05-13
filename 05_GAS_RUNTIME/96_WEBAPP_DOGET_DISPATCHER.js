/**
 * PHASE_89.1 — WebApp doGet Dispatcher (late-bound)
 *
 * Why: 99_APPSHEET_WEBHOOK.js defines doGet and loads after 94_*. We bind a single effective doGet here.
 * Rules: preserve action=ping; route queries go to WebApp workspace renderer; no destructive writes.
 */

function doGet(e) {
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
      supported: ['?route=/workspace', '?route=workspace', '?route=/home-alert/my-queue', '?route=/home-alert/sla', '?path=/workspace', '?action=ping']
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

