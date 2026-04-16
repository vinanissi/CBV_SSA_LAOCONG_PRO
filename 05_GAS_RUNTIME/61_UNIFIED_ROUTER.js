/**
 * CBV Unified Web App Router
 * Single doPost that routes to AppSheet webhook handler or HO_SO API gateway.
 * Dependencies: 99_APPSHEET_WEBHOOK.gs (_webhookDoPost_), 60_HOSO_API_GATEWAY.gs (_gatewayDoPost_, _jsonOut_)
 *
 * Load order: must be AFTER both 99_APPSHEET_WEBHOOK.gs and 60_HOSO_API_GATEWAY.gs.
 * doGet remains on 99_APPSHEET_WEBHOOK.gs (ping) — not overridden here.
 */

/** AppSheet webhook action names — routed to _webhookDoPost_ */
var WEBHOOK_ACTIONS_ = [
  'taskStart', 'taskWait', 'taskResume', 'taskComplete',
  'taskCancel', 'taskReopen', 'taskArchive',
  'finConfirm', 'finCancel', 'finArchive',
  'hosoActivate', 'hosoClose', 'hosoArchive',
  'checklistDone', 'addLog', 'deleteAttachment'
];

/**
 * Single entry point for all POST requests to this Web App.
 * AppSheet → webhook actions → _webhookDoPost_
 * Lovable → HO_SO actions → _gatewayDoPost_
 */
function doPost(e) {
    try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
    if (!String(raw).trim()) {
      return _jsonOut_({ ok: false, message: 'Empty body' });
    }

    var body = {};
    try {
      body = JSON.parse(raw);
    } catch (pe) {
      return _jsonOut_({ ok: false, message: 'Invalid JSON: ' + (pe.message || pe) });
    }

    var action = String(body.action || '').trim();

    var isWebhook = action.indexOf('CMD:') === 0 || WEBHOOK_ACTIONS_.indexOf(action) !== -1;

    if (isWebhook) {
      return _webhookDoPost_(e);
    }

    return _gatewayDoPost_(e);
  } catch (err) {
    Logger.log('[UNIFIED_ROUTER] doPost error: ' + (err.message || err));
    return _jsonOut_({ ok: false, message: err.message || 'Router error' });
  }
}
