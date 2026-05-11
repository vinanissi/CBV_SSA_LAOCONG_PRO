/**
 * CBV Operational Workflow Runtime — append-only timeline (Phase E).
 */

var CBV_OPERATIONAL_TIMELINE_SHEET_ = 'CBV_OPERATIONAL_TIMELINE';

var CBV_OPERATIONAL_TIMELINE_HEADERS_ = [
  'EVENT_ID',
  'TRACE_ID',
  'RUNTIME_TYPE',
  'EVENT_TYPE',
  'ACTOR',
  'ACTION',
  'OBJECT_TYPE',
  'OBJECT_ID',
  'METADATA_JSON',
  'CREATED_AT',
  'NOTE'
];

/**
 * @returns {string}
 */
function CBV_OperationalTimeline_generateId_() {
  return 'EVT_' + String(new Date().getTime()) + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
}

/**
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function CBV_OperationalTimeline_getOrCreateSheet_() {
  var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
  if (!opened.ok) return null;
  var ss = opened.ss;
  var sh = null;
  try {
    sh = ss.getSheetByName(CBV_OPERATIONAL_TIMELINE_SHEET_);
  } catch (e0) {
    sh = null;
  }
  if (!sh) {
    try {
      sh = ss.insertSheet(CBV_OPERATIONAL_TIMELINE_SHEET_);
    } catch (e1) {
      return null;
    }
  }
  try {
    if (sh.getLastRow() < 1) {
      sh.getRange(1, 1, 1, CBV_OPERATIONAL_TIMELINE_HEADERS_.length).setValues([CBV_OPERATIONAL_TIMELINE_HEADERS_]);
    } else {
      var first = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      var need = [];
      var map = {};
      var i;
      for (i = 0; i < first.length; i++) map[String(first[i] || '').trim()] = true;
      for (i = 0; i < CBV_OPERATIONAL_TIMELINE_HEADERS_.length; i++) {
        if (!map[CBV_OPERATIONAL_TIMELINE_HEADERS_[i]]) need.push(CBV_OPERATIONAL_TIMELINE_HEADERS_[i]);
      }
      if (need.length && typeof MC_Obs_ensureHeaders_ === 'function') {
        MC_Obs_ensureHeaders_(sh, need);
      }
    }
  } catch (e2) {
    /* ignore */
  }
  try {
    if (sh.getFrozenRows() < 1) sh.setFrozenRows(1);
  } catch (e3) {
    /* ignore */
  }
  return sh;
}

/**
 * @param {Object} ctx
 * @returns {{ ok: boolean, eventId?: string, warning?: string }}
 */
function CBV_OperationalTimeline_appendEvent_(ctx) {
  var c = ctx || {};
  var sh = CBV_OperationalTimeline_getOrCreateSheet_();
  if (!sh) return { ok: false, warning: 'TIMELINE_SHEET_UNAVAILABLE' };
  var eventId = String(c.eventId || CBV_OperationalTimeline_generateId_());
  var row = {
    EVENT_ID: eventId,
    TRACE_ID: String(c.traceId || ''),
    RUNTIME_TYPE: String(c.runtimeType || 'OPERATIONAL_WORKFLOW'),
    EVENT_TYPE: String(c.eventType || 'UNKNOWN'),
    ACTOR: String(c.actor || ''),
    ACTION: String(c.action || ''),
    OBJECT_TYPE: String(c.objectType || ''),
    OBJECT_ID: String(c.objectId || ''),
    METADATA_JSON: '',
    CREATED_AT: String(c.createdAt || (typeof CBV_TestConsole_isoNow_ === 'function' ? CBV_TestConsole_isoNow_() : new Date().toISOString())),
    NOTE: String(c.note || 'PHASE_E_APPEND_ONLY')
  };
  try {
    row.METADATA_JSON = typeof MC_json_ === 'function' ? MC_json_(c.metadata || {}) : JSON.stringify(c.metadata || {});
  } catch (e0) {
    row.METADATA_JSON = '{}';
  }
  try {
    if (typeof cbvCoreV2AppendRowByHeaders_ === 'function') {
      cbvCoreV2AppendRowByHeaders_(sh, row);
    } else {
      var hdr = CBV_OPERATIONAL_TIMELINE_HEADERS_;
      var vals = [];
      var i;
      for (i = 0; i < hdr.length; i++) vals.push(row[hdr[i]] != null ? row[hdr[i]] : '');
      sh.appendRow(vals);
    }
  } catch (e1) {
    return { ok: false, warning: String(e1 && e1.message ? e1.message : e1) };
  }
  return { ok: true, eventId: eventId };
}

/**
 * @returns {{ ok: boolean, message: string }}
 */
function CBV_OperationalTimeline_selfTest_() {
  var before = 0;
  try {
    var sh = CBV_OperationalTimeline_getOrCreateSheet_();
    if (!sh) return { ok: false, message: 'no sheet' };
    before = Math.max(0, sh.getLastRow() - 1);
  } catch (e0) {
    return { ok: false, message: String(e0 && e0.message ? e0.message : e0) };
  }
  var r = CBV_OperationalTimeline_appendEvent_({
    traceId: 'SELFTEST_' + String(new Date().getTime()),
    eventType: 'SELFTEST',
    actor: 'SYSTEM',
    action: 'TIMELINE_APPEND',
    objectType: 'TEST',
    objectId: 'timeline_selftest',
    metadata: { phase: 'E' }
  });
  if (!r.ok) return { ok: false, message: r.warning || 'append failed' };
  try {
    var sh2 = CBV_OperationalTimeline_getOrCreateSheet_();
    var after = Math.max(0, sh2.getLastRow() - 1);
    if (after < before + 1) return { ok: false, message: 'row count did not increase' };
  } catch (e1) {
    return { ok: false, message: String(e1 && e1.message ? e1.message : e1) };
  }
  return { ok: true, message: 'timeline append-only self-test OK' };
}
