/**
 * CBV Test Console Phase G — Runtime State Machine.
 * Production-core mirror of main-control Phase G runtime.
 */

var CBV_TC_RUNTIME_STATES_ = ['IDLE', 'SESSION_OPEN', 'SUITE_SELECTED', 'LOCKED', 'RUNNING', 'REPORT_READY', 'NEEDS_GUIDANCE', 'RECOVERY_REQUIRED', 'CLOSED'];
var CBV_TC_RUNTIME_TRANSITIONS_ = { IDLE: ['SESSION_OPEN'], SESSION_OPEN: ['SUITE_SELECTED', 'LOCKED', 'CLOSED'], SUITE_SELECTED: ['LOCKED', 'RUNNING', 'CLOSED'], LOCKED: ['RUNNING', 'CLOSED'], RUNNING: ['REPORT_READY', 'RECOVERY_REQUIRED'], REPORT_READY: ['NEEDS_GUIDANCE', 'CLOSED', 'SUITE_SELECTED'], NEEDS_GUIDANCE: ['SUITE_SELECTED', 'RECOVERY_REQUIRED', 'CLOSED'], RECOVERY_REQUIRED: ['NEEDS_GUIDANCE', 'SUITE_SELECTED', 'CLOSED'], CLOSED: [] };

function CBV_TestConsole_State_isKnown_(state) {
  var s = String(state || '').toUpperCase();
  var i;
  for (i = 0; i < CBV_TC_RUNTIME_STATES_.length; i++) if (CBV_TC_RUNTIME_STATES_[i] === s) return true;
  return false;
}
function CBV_TestConsole_State_canTransition_(fromState, toState) {
  var list = CBV_TC_RUNTIME_TRANSITIONS_[String(fromState || 'IDLE').toUpperCase()] || [];
  var to = String(toState || '').toUpperCase();
  var i;
  for (i = 0; i < list.length; i++) if (list[i] === to) return true;
  return false;
}
function CBV_TestConsole_State_transition_(toState, reason, payload) {
  var session = CBV_TestConsole_Session_getActive_();
  if (!session) session = CBV_TestConsole_Session_start_({});
  var from = String(session.state || 'IDLE').toUpperCase();
  var to = String(toState || '').toUpperCase();
  if (!CBV_TestConsole_State_isKnown_(to)) return { ok: false, code: 'UNKNOWN_STATE', message: 'Unknown state: ' + to, session: session };
  if (!CBV_TestConsole_State_canTransition_(from, to)) return { ok: false, code: 'ILLEGAL_TRANSITION', message: 'Illegal transition ' + from + ' -> ' + to, session: session };
  session.state = to;
  session.guidance = typeof CBV_TestConsole_Guidance_buildForSession_ === 'function' ? CBV_TestConsole_Guidance_buildForSession_(session, session.lastReport || null) : session.guidance || {};
  CBV_TestConsole_Session_saveActive_(session);
  CBV_TestConsole_Session_appendLog_(session, 'STATE_TRANSITION', String(reason || ''), session.guidance);
  if (typeof CBV_TestConsole_Timeline_append_ === 'function') CBV_TestConsole_Timeline_append_(session, 'STATE_TRANSITION', from, to, String(reason || ''), payload || {});
  return { ok: true, code: 'STATE_TRANSITION_OK', message: from + ' -> ' + to, session: session };
}
function CBV_TestConsole_State_selfTest_() {
  var steps = [];
  function step(name, ok, detail) { steps.push({ name: name, ok: !!ok, detail: detail || '' }); }
  step('known_session_open', CBV_TestConsole_State_isKnown_('SESSION_OPEN'), '');
  step('legal_idle_to_open', CBV_TestConsole_State_canTransition_('IDLE', 'SESSION_OPEN'), '');
  step('illegal_idle_to_running', !CBV_TestConsole_State_canTransition_('IDLE', 'RUNNING'), '');
  step('closed_terminal', !CBV_TestConsole_State_canTransition_('CLOSED', 'RUNNING'), '');
  var ok = true;
  var i;
  for (i = 0; i < steps.length; i++) if (!steps[i].ok) ok = false;
  return { ok: ok, steps: steps };
}
