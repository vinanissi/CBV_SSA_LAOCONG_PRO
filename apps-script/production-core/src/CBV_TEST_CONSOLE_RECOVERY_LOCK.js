/**
 * CBV Test Console Phase G — Runtime Lock and Recovery Runtime.
 * Production-core mirror of main-control Phase G runtime.
 */

var CBV_TC_LOCK_PROP_ = 'CBV_TC_RUNTIME_LOCK_JSON';
var CBV_TC_LOCK_LOG_SHEET_NAME_ = 'CBV_TC_RUNTIME_LOCK_LOG';
var CBV_TC_LOCK_LOG_HEADERS_ = ['CREATED_AT', 'LOCK_ID', 'ACTION', 'SESSION_ID', 'TRACE_ID', 'LOCKED_BY', 'REASON', 'EXPIRES_AT', 'RESULT', 'NOTE'];

function CBV_TestConsole_Lock_get_() {
  try {
    var raw = String(PropertiesService.getScriptProperties().getProperty(CBV_TC_LOCK_PROP_) || '');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function CBV_TestConsole_Lock_save_(lock) {
  PropertiesService.getScriptProperties().setProperty(CBV_TC_LOCK_PROP_, CBV_TestConsole_Runtime_safeJson_(lock || {}));
}
function CBV_TestConsole_Lock_clear_() {
  try {
    PropertiesService.getScriptProperties().deleteProperty(CBV_TC_LOCK_PROP_);
  } catch (e) {
    /* ignore */
  }
}
function CBV_TestConsole_Lock_isExpired_(lock) {
  if (!lock || !lock.expiresAt) return false;
  try {
    return new Date(String(lock.expiresAt)).getTime() < new Date().getTime();
  } catch (e) {
    return false;
  }
}
function CBV_TestConsole_Lock_appendLog_(lock, action, result, note) {
  var l = lock || {};
  var sh = CBV_TestConsole_Runtime_getOrCreateSheet_(CBV_TC_LOCK_LOG_SHEET_NAME_, CBV_TC_LOCK_LOG_HEADERS_);
  return CBV_TestConsole_Runtime_appendByHeaders_(sh, CBV_TC_LOCK_LOG_HEADERS_, { CREATED_AT: CBV_TestConsole_Runtime_now_(), LOCK_ID: String(l.lockId || ''), ACTION: String(action || ''), SESSION_ID: String(l.sessionId || ''), TRACE_ID: String(l.traceId || ''), LOCKED_BY: String(l.lockedBy || CBV_TestConsole_Runtime_user_()), REASON: String(l.reason || ''), EXPIRES_AT: String(l.expiresAt || ''), RESULT: String(result || ''), NOTE: String(note || '') });
}
function CBV_TestConsole_Lock_acquire_(payload) {
  var p = payload || {};
  var session = CBV_TestConsole_Session_getActive_() || CBV_TestConsole_Session_start_({ suiteCode: p.suiteCode || '' });
  var existing = CBV_TestConsole_Lock_get_();
  if (existing && !CBV_TestConsole_Lock_isExpired_(existing)) {
    CBV_TestConsole_Lock_appendLog_(existing, 'ACQUIRE_DENIED', 'DENIED', 'Active lock exists');
    return { ok: false, message: 'Runtime is locked by ' + String(existing.lockedBy || 'unknown'), lock: existing, session: session };
  }
  var ttl = parseInt(p.ttlMinutes, 10);
  if (!isFinite(ttl) || ttl <= 0) ttl = 30;
  if (ttl > 240) ttl = 240;
  var exp = new Date();
  exp.setMinutes(exp.getMinutes() + ttl);
  var lock = { lockId: CBV_TestConsole_Runtime_uuid_('TCLOCK'), sessionId: session.sessionId, traceId: session.traceId, lockedBy: CBV_TestConsole_Runtime_user_(), reason: String(p.reason || 'Guided runtime operation'), createdAt: CBV_TestConsole_Runtime_now_(), expiresAt: exp.toISOString() };
  CBV_TestConsole_Lock_save_(lock);
  session.lockId = lock.lockId;
  CBV_TestConsole_Session_update_({ lockId: lock.lockId }, 'LOCK_ACQUIRED', lock.reason);
  CBV_TestConsole_Lock_appendLog_(lock, 'ACQUIRE', 'OK', '');
  if (typeof CBV_TestConsole_State_transition_ === 'function') CBV_TestConsole_State_transition_('LOCKED', 'Runtime lock acquired', lock);
  return { ok: true, message: 'Runtime lock acquired', lock: lock, session: CBV_TestConsole_Session_getActive_() };
}
function CBV_TestConsole_Lock_release_(payload) {
  var p = payload || {};
  var lock = CBV_TestConsole_Lock_get_();
  if (!lock) return { ok: true, message: 'No active lock', lock: null };
  CBV_TestConsole_Lock_appendLog_(lock, 'RELEASE', 'OK', String(p.reason || 'Released by operator'));
  CBV_TestConsole_Lock_clear_();
  var session = CBV_TestConsole_Session_getActive_();
  if (session) CBV_TestConsole_Session_update_({ lockId: '' }, 'LOCK_RELEASED', String(p.reason || 'Released by operator'));
  return { ok: true, message: 'Runtime lock released', lock: lock, session: CBV_TestConsole_Session_getActive_() };
}
function CBV_TestConsole_Recovery_buildPlan_(report, session) {
  var r = report || {};
  var s = session || {};
  var steps = [];
  steps.push('Stop promotion/deploy decisions for traceId ' + String(r.traceId || s.traceId || 'UNKNOWN') + '.');
  steps.push('Review failed checks, warnings, and Drive report artifact.');
  if (r.driveFileUrl) steps.push('Open Drive report: ' + String(r.driveFileUrl));
  if ((r.errors || []).length) steps.push('Resolve errors: ' + (r.errors || []).join('; '));
  if ((r.warnings || []).length) steps.push('Record mitigation for warnings: ' + (r.warnings || []).join('; '));
  steps.push('After manual mitigation, run a safe verification suite once from WebApp.');
  steps.push('Append follow-up report and AI handoff summary.');
  return { recoveryId: CBV_TestConsole_Runtime_uuid_('TCREC'), sessionId: String(s.sessionId || ''), traceId: String(r.traceId || s.traceId || ''), status: 'OPEN', reason: String(r.status || '') === 'FAIL' ? 'REPORT_FAIL' : 'OPERATOR_REQUEST', steps: steps, generatedAt: CBV_TestConsole_Runtime_now_() };
}
function CBV_TestConsole_Recovery_create_(payload) {
  var p = payload || {};
  var session = CBV_TestConsole_Session_getActive_() || CBV_TestConsole_Session_start_({});
  var report = p.report || session.lastReport || {};
  var plan = CBV_TestConsole_Recovery_buildPlan_(report, session);
  session.recoveryPlan = plan;
  session.guidance = CBV_TestConsole_Guidance_buildForSession_(session, report);
  CBV_TestConsole_Session_update_({ recoveryPlan: plan, guidance: session.guidance }, 'RECOVERY_PLAN_CREATED', plan.reason);
  if (typeof CBV_TestConsole_State_transition_ === 'function' && session.state !== 'RECOVERY_REQUIRED') CBV_TestConsole_State_transition_('RECOVERY_REQUIRED', 'Recovery plan created', plan);
  if (typeof CBV_TestConsole_Timeline_append_ === 'function') CBV_TestConsole_Timeline_append_(CBV_TestConsole_Session_getActive_() || session, 'RECOVERY_PLAN_CREATED', '', 'RECOVERY_REQUIRED', plan.reason, plan);
  return plan;
}
