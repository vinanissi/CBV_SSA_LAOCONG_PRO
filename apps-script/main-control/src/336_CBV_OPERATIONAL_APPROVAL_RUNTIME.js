/**
 * CBV Operational Workflow Runtime — approval queue append-only (Phase E).
 * No auto-approve: new rows are PENDING until operator updates out-of-band (future phase).
 */

var CBV_OPERATIONAL_APPROVALS_SHEET_ = 'CBV_OPERATIONAL_APPROVALS';

var CBV_OPERATIONAL_APPROVALS_HEADERS_ = [
  'APPROVAL_ID',
  'APPROVAL_TYPE',
  'REQUESTED_BY',
  'APPROVED_BY',
  'APPROVAL_STATUS',
  'TRACE_ID',
  'DECISION_REASON',
  'CREATED_AT',
  'NOTE'
];

function CBV_OperationalApproval_getOrCreateSheet_() {
  var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
  if (!opened.ok) return null;
  var ss = opened.ss;
  var sh = null;
  try {
    sh = ss.getSheetByName(CBV_OPERATIONAL_APPROVALS_SHEET_);
  } catch (e0) {
    sh = null;
  }
  if (!sh) {
    try {
      sh = ss.insertSheet(CBV_OPERATIONAL_APPROVALS_SHEET_);
    } catch (e1) {
      return null;
    }
  }
  try {
    if (sh.getLastRow() < 1) {
      sh.getRange(1, 1, 1, CBV_OPERATIONAL_APPROVALS_HEADERS_.length).setValues([CBV_OPERATIONAL_APPROVALS_HEADERS_]);
    } else {
      var first = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      var need = [];
      var map = {};
      var i;
      for (i = 0; i < first.length; i++) map[String(first[i] || '').trim()] = true;
      for (i = 0; i < CBV_OPERATIONAL_APPROVALS_HEADERS_.length; i++) {
        if (!map[CBV_OPERATIONAL_APPROVALS_HEADERS_[i]]) need.push(CBV_OPERATIONAL_APPROVALS_HEADERS_[i]);
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
 * @returns {{ ok: boolean, approvalId?: string, warning?: string }}
 */
function CBV_OperationalApproval_request_(ctx) {
  var c = ctx || {};
  var sh = CBV_OperationalApproval_getOrCreateSheet_();
  if (!sh) return { ok: false, warning: 'APPROVAL_SHEET_UNAVAILABLE' };
  var id = String(c.approvalId || 'APR_' + String(new Date().getTime()) + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 6));
  var row = {
    APPROVAL_ID: id,
    APPROVAL_TYPE: String(c.approvalType || 'GENERIC'),
    REQUESTED_BY: String(c.requestedBy || ''),
    APPROVED_BY: '',
    APPROVAL_STATUS: String(c.approvalStatus || 'PENDING'),
    TRACE_ID: String(c.traceId || ''),
    DECISION_REASON: String(c.decisionReason || ''),
    CREATED_AT: String(c.createdAt || (typeof CBV_TestConsole_isoNow_ === 'function' ? CBV_TestConsole_isoNow_() : new Date().toISOString())),
    NOTE: String(c.note || 'PHASE_E_APPEND_ONLY_NO_AUTO_APPROVE')
  };
  try {
    if (typeof cbvCoreV2AppendRowByHeaders_ === 'function') {
      cbvCoreV2AppendRowByHeaders_(sh, row);
    } else {
      var hdr = CBV_OPERATIONAL_APPROVALS_HEADERS_;
      var vals = [];
      var i;
      for (i = 0; i < hdr.length; i++) vals.push(row[hdr[i]] != null ? row[hdr[i]] : '');
      sh.appendRow(vals);
    }
  } catch (e) {
    return { ok: false, warning: String(e && e.message ? e.message : e) };
  }
  if (typeof CBV_OperationalTimeline_appendEvent_ === 'function') {
    CBV_OperationalTimeline_appendEvent_({
      traceId: row.TRACE_ID,
      eventType: 'APPROVAL_REQUESTED',
      actor: row.REQUESTED_BY,
      action: 'APPROVAL_REQUEST',
      objectType: 'APPROVAL',
      objectId: id,
      metadata: { approvalType: row.APPROVAL_TYPE, status: row.APPROVAL_STATUS }
    });
  }
  return { ok: true, approvalId: id };
}

/**
 * @returns {{ ok: boolean, message: string }}
 */
function CBV_OperationalApproval_selfTest_() {
  var r = CBV_OperationalApproval_request_({
    approvalType: 'SELFTEST',
    requestedBy: 'SYSTEM',
    traceId: 'APR_ST_' + String(new Date().getTime()),
    decisionReason: 'self-test row',
    approvalStatus: 'PENDING'
  });
  if (!r.ok) return { ok: false, message: r.warning || 'request failed' };
  return { ok: true, message: 'approval runtime self-test OK' };
}
