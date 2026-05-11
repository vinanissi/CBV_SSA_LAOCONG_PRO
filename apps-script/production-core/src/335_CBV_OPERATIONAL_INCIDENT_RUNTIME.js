/**
 * CBV Operational Workflow Runtime — incident append-only (Phase E).
 */

var CBV_OPERATIONAL_INCIDENTS_SHEET_ = 'CBV_OPERATIONAL_INCIDENTS';

var CBV_OPERATIONAL_INCIDENTS_HEADERS_ = [
  'INCIDENT_ID',
  'TRACE_ID',
  'SEVERITY',
  'STATUS',
  'SOURCE_RUNTIME',
  'DESCRIPTION',
  'CREATED_AT',
  'CREATED_BY',
  'LINKED_REPORT',
  'LINKED_DECISION',
  'LINKED_HANDOFF',
  'NOTE'
];

function CBV_OperationalIncident_getOrCreateSheet_() {
  var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
  if (!opened.ok) return null;
  var ss = opened.ss;
  var sh = null;
  try {
    sh = ss.getSheetByName(CBV_OPERATIONAL_INCIDENTS_SHEET_);
  } catch (e0) {
    sh = null;
  }
  if (!sh) {
    try {
      sh = ss.insertSheet(CBV_OPERATIONAL_INCIDENTS_SHEET_);
    } catch (e1) {
      return null;
    }
  }
  try {
    if (sh.getLastRow() < 1) {
      sh.getRange(1, 1, 1, CBV_OPERATIONAL_INCIDENTS_HEADERS_.length).setValues([CBV_OPERATIONAL_INCIDENTS_HEADERS_]);
    } else {
      var first = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      var need = [];
      var map = {};
      var i;
      for (i = 0; i < first.length; i++) map[String(first[i] || '').trim()] = true;
      for (i = 0; i < CBV_OPERATIONAL_INCIDENTS_HEADERS_.length; i++) {
        if (!map[CBV_OPERATIONAL_INCIDENTS_HEADERS_[i]]) need.push(CBV_OPERATIONAL_INCIDENTS_HEADERS_[i]);
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
 * @returns {{ ok: boolean, incidentId?: string, warning?: string }}
 */
function CBV_OperationalIncident_create_(ctx) {
  var c = ctx || {};
  var sh = CBV_OperationalIncident_getOrCreateSheet_();
  if (!sh) return { ok: false, warning: 'INCIDENT_SHEET_UNAVAILABLE' };
  var id = String(c.incidentId || 'INC_' + String(new Date().getTime()) + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 6));
  var row = {
    INCIDENT_ID: id,
    TRACE_ID: String(c.traceId || ''),
    SEVERITY: String(c.severity || 'WARNING'),
    STATUS: String(c.status || 'OPEN'),
    SOURCE_RUNTIME: String(c.sourceRuntime || 'VERIFICATION_PIPELINE'),
    DESCRIPTION: String(c.description || ''),
    CREATED_AT: String(c.createdAt || (typeof CBV_TestConsole_isoNow_ === 'function' ? CBV_TestConsole_isoNow_() : new Date().toISOString())),
    CREATED_BY: String(c.createdBy || (typeof CBV_TestConsole_runBy_ === 'function' ? CBV_TestConsole_runBy_() : 'SYSTEM')),
    LINKED_REPORT: String(c.linkedReport || ''),
    LINKED_DECISION: String(c.linkedDecision || ''),
    LINKED_HANDOFF: String(c.linkedHandoff || ''),
    NOTE: String(c.note || 'PHASE_E_APPEND_ONLY')
  };
  try {
    if (typeof cbvCoreV2AppendRowByHeaders_ === 'function') {
      cbvCoreV2AppendRowByHeaders_(sh, row);
    } else {
      var hdr = CBV_OPERATIONAL_INCIDENTS_HEADERS_;
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
      eventType: 'INCIDENT_RECORDED',
      actor: row.CREATED_BY,
      action: 'INCIDENT_CREATE',
      objectType: 'INCIDENT',
      objectId: id,
      metadata: { severity: row.SEVERITY, source: row.SOURCE_RUNTIME }
    });
  }
  return { ok: true, incidentId: id };
}

/**
 * Auto-open incidents from verification bundle (best-effort, append-only).
 * @param {Object} report
 */
function CBV_OperationalIncident_hookFromVerificationReport_(report) {
  var r = report || {};
  var traceId = String(r.traceId || '');
  if (!traceId) return;

  var reasons = [];
  if (r.governance && r.governance.ok === false) reasons.push('governance_fail');
  if (r.risk && r.risk.blocked) reasons.push('risk_blocked');
  if (r.verification && r.verification.ok === false) reasons.push('verification_fail');
  if (String(r.severity || '').toUpperCase() === 'CRITICAL') reasons.push('critical_severity');
  if (r.verification && r.verification.runtimeSafe === false) reasons.push('runtime_boundary');
  if (r.registrySuite && r.registrySuite.destructive && r.verification) reasons.push('destructive_context');

  if (!reasons.length) return;

  var sev = String(r.severity || '').toUpperCase() === 'CRITICAL' ? 'CRITICAL' : 'ERROR';
  CBV_OperationalIncident_create_({
    traceId: traceId,
    severity: sev,
    status: 'OPEN',
    sourceRuntime: 'VERIFICATION_PIPELINE',
    description: 'Auto incident: ' + reasons.join(', '),
    linkedReport: String(r.exportFileName || r.traceId || ''),
    linkedDecision: String((r.decisionGate && r.decisionGate.decisionSummary) || ''),
    linkedHandoff: traceId,
    note: 'AUTO_FROM_VERIFICATION'
  });
}

/**
 * @returns {{ ok: boolean, message: string }}
 */
function CBV_OperationalIncident_selfTest_() {
  var r = CBV_OperationalIncident_create_({
    traceId: 'INC_ST_' + String(new Date().getTime()),
    severity: 'WARNING',
    status: 'OPEN',
    sourceRuntime: 'SELFTEST',
    description: 'incident runtime self-test',
    linkedReport: '',
    linkedDecision: '',
    linkedHandoff: ''
  });
  if (!r.ok) return { ok: false, message: r.warning || 'create failed' };
  return { ok: true, message: 'incident runtime self-test OK' };
}
