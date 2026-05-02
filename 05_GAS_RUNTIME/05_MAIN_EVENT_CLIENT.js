/**
 * MAIN Event Bridge — module con → MAIN Command Center (UrlFetch POST only).
 * Không đọc/ghi sheet MAIN; không phụ thuộc response body nghiệp vụ.
 *
 * ScriptProperties:
 *   MAIN_EVENT_ENABLED, MAIN_EVENT_WEBHOOK_URL, MAIN_EVENT_SOURCE_MODULE
 *
 * Payload chuẩn (trường top-level trong body.payload):
 *   entity_title, status, old_status, new_status, severity, is_blocked, message, metadata
 */

var MAIN_EVENT_PROP_ENABLED = 'MAIN_EVENT_ENABLED';
var MAIN_EVENT_PROP_WEBHOOK = 'MAIN_EVENT_WEBHOOK_URL';
var MAIN_EVENT_PROP_SOURCE = 'MAIN_EVENT_SOURCE_MODULE';

/**
 * @param {Object} raw
 * @returns {{ entity_title: string, status: string, old_status: string, new_status: string, severity: string, is_blocked: boolean, message: string, metadata: Object }}
 */
function mainEventNormalizePayload_(raw) {
  try {
    raw = raw || {};
    var stdKeys = {
      entity_title: 1,
      status: 1,
      old_status: 1,
      new_status: 1,
      severity: 1,
      is_blocked: 1,
      message: 1,
      metadata: 1,
      correlationId: 1
    };
    var meta = {};
    if (raw.metadata && typeof raw.metadata === 'object') {
      Object.keys(raw.metadata).forEach(function(k) {
        meta[k] = raw.metadata[k];
      });
    }
    Object.keys(raw).forEach(function(k) {
      if (!stdKeys[k]) meta[k] = raw[k];
    });
    return {
      entity_title: raw.entity_title != null ? String(raw.entity_title) : '',
      status: raw.status != null ? String(raw.status) : '',
      old_status: raw.old_status != null ? String(raw.old_status) : '',
      new_status: raw.new_status != null ? String(raw.new_status) : '',
      severity: raw.severity != null ? String(raw.severity) : 'info',
      is_blocked: raw.is_blocked === true || String(raw.is_blocked).toLowerCase() === 'true',
      message: raw.message != null ? String(raw.message) : '',
      metadata: meta
    };
  } catch (e) {
    return {
      entity_title: '',
      status: '',
      old_status: '',
      new_status: '',
      severity: 'info',
      is_blocked: false,
      message: '',
      metadata: {}
    };
  }
}

function MainEventClient_isEnabled_() {
  try {
    var v = PropertiesService.getScriptProperties().getProperty(MAIN_EVENT_PROP_ENABLED) || '';
    v = String(v).trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes' || v === 'on';
  } catch (e) {
    return false;
  }
}

/**
 * @param {Object} [hint]
 * @returns {string}
 */
function mainEventCorrelationId_(hint) {
  try {
    hint = hint || {};
    var cid = hint.correlationId != null ? String(hint.correlationId).trim() : '';
    if (cid) return cid;
    if (typeof CBV_REQUEST_CORRELATION_ID_ !== 'undefined' && String(CBV_REQUEST_CORRELATION_ID_ || '').trim()) {
      return String(CBV_REQUEST_CORRELATION_ID_).trim();
    }
  } catch (e1) {}
  try {
    return Utilities.getUuid();
  } catch (e2) {
    return 'mevt_' + String(new Date().getTime());
  }
}

/**
 * @param {string} webhookUrl
 * @param {string} sourceModule TASK | FINANCE | HO_SO
 */
function MainEventClient_setup_(webhookUrl, sourceModule) {
  try {
    var props = PropertiesService.getScriptProperties();
    props.setProperty(MAIN_EVENT_PROP_WEBHOOK, String(webhookUrl || '').trim());
    props.setProperty(MAIN_EVENT_PROP_SOURCE, String(sourceModule || '').trim());
    props.setProperty(MAIN_EVENT_PROP_ENABLED, 'true');
  } catch (e) {
    Logger.log('[MainEventClient_setup_] ' + (e && e.message ? e.message : e));
  }
}

/**
 * @param {string} eventType
 * @param {string} refId
 * @param {string} [entityType]
 * @param {Object} [payload]
 * @param {string} [sourceModuleOverride]
 */
function MainEventClient_emit_(eventType, refId, entityType, payload, sourceModuleOverride) {
  try {
    if (!MainEventClient_isEnabled_()) return null;
    var props = PropertiesService.getScriptProperties();
    var url = String(props.getProperty(MAIN_EVENT_PROP_WEBHOOK) || '').trim();
    if (!url) return null;
    var defaultMod = String(props.getProperty(MAIN_EVENT_PROP_SOURCE) || '').trim();
    var sourceModule = String(sourceModuleOverride || defaultMod || '').trim();
    if (!sourceModule) {
      Logger.log('[MainEventClient_emit_] MAIN_EVENT_SOURCE_MODULE missing');
      return null;
    }
    var et = String(eventType || '').trim();
    var rid = String(refId || '').trim();
    if (!et || !rid) return null;

    try {
      var p = payload && typeof payload === 'object' ? payload : {};
      var body = {
        action: 'mainEventIngest',
        eventType: et,
        sourceModule: sourceModule,
        refId: rid,
        entityType: entityType != null ? String(entityType) : '',
        payload: mainEventNormalizePayload_(p),
        correlationId: mainEventCorrelationId_(p)
      };
      var resp = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        muteHttpExceptions: true,
        payload: JSON.stringify(body)
      });
      var code = resp.getResponseCode();
      if (code < 200 || code >= 300) {
        Logger.log('[MainEventClient_emit_] HTTP ' + code + ' ' + resp.getContentText());
      }
      return { responseCode: code, text: resp.getContentText() };
    } catch (inner) {
      Logger.log('[MainEventClient_emit_] inner ' + (inner && inner.message ? inner.message : inner));
      return null;
    }
  } catch (outer) {
    Logger.log('[MainEventClient_emit_] outer ' + (outer && outer.message ? outer.message : outer));
    return null;
  }
}

function MainEventClient_emitTaskEvent_(eventType, refId, payload) {
  return MainEventClient_emit_(eventType, refId, 'TASK_MAIN', payload, 'TASK');
}

function MainEventClient_emitFinanceEvent_(eventType, refId, payload) {
  return MainEventClient_emit_(eventType, refId, 'FINANCE_TRANSACTION', payload, 'FINANCE');
}

function MainEventClient_emitHoSoEvent_(eventType, refId, payload) {
  return MainEventClient_emit_(eventType, refId, 'HO_SO_MASTER', payload, 'HO_SO');
}

function MainEventClient_testSample_() {
  return MainEventClient_emitTaskEvent_('TASK_CREATED', 'TEST_TASK_' + mainEventCorrelationId_({}).substring(0, 10), {
    entity_title: 'MainEventClient_testSample_',
    status: 'NEW',
    new_status: 'NEW',
    message: 'sample',
    metadata: { at: new Date().toISOString() }
  });
}

/**
 * Dùng nội bộ service (không throw).
 * @param {{ eventType: string, sourceModule: string, refId: string, entityType?: string, payload?: Object }} spec
 */
function mainEventTryForward_(spec) {
  try {
    spec = spec || {};
    return MainEventClient_emit_(
      spec.eventType,
      spec.refId,
      spec.entityType != null ? spec.entityType : '',
      spec.payload || {},
      spec.sourceModule
    );
  } catch (e) {
    Logger.log('[mainEventTryForward_] ' + (e && e.message ? e.message : e));
    return null;
  }
}
