/**
 * CBV Test Console Phase G — Guided Runtime Self-Test.
 * Production-core mirror of main-control Phase G runtime.
 */

function CBV_TestConsole_GuidedRuntime_selfTest_(options) {
  var opts = options || {};
  var data = { steps: [] };
  function step(name, ok, detail) { data.steps.push({ name: name, ok: !!ok, detail: detail || '' }); }
  try {
    var sm = CBV_TestConsole_State_selfTest_();
    step('state_machine', !!(sm && sm.ok), CBV_TestConsole_Runtime_safeJson_(sm));
    var g0 = CBV_TestConsole_Guidance_buildForSession_({ state: 'IDLE' }, null);
    step('guidance_idle', !!(g0 && g0.nextActions && g0.nextActions.length), CBV_TestConsole_Runtime_safeJson_(g0));
    var lock = CBV_TestConsole_Lock_get_();
    step('lock_read', true, lock ? String(lock.lockId || '') : 'no active lock');
    var timeline = CBV_TestConsole_Timeline_listRecent_(5);
    step('timeline_read', Array.isArray(timeline), 'count=' + String(timeline.length));
    if (opts.writeSyntheticSession === true) {
      var ses = CBV_TestConsole_Session_start_({ suiteCode: 'TEST_CONSOLE_RUNTIME' });
      step('synthetic_session_start', !!(ses && ses.sessionId), ses && ses.sessionId);
      var tr = CBV_TestConsole_State_transition_('SUITE_SELECTED', 'Guided self-test selected suite', { suiteCode: 'TEST_CONSOLE_RUNTIME' });
      step('synthetic_transition', !!(tr && tr.ok), tr && tr.message);
      var closed = CBV_TestConsole_Session_close_({ reason: 'Guided self-test close' });
      step('synthetic_session_close', !!(closed && closed.ok), closed && closed.message);
    } else {
      step('synthetic_session_skipped', true, 'Set writeSyntheticSession=true to append a synthetic session/timeline.');
    }
  } catch (e) {
    step('guided_selftest_exception', false, String(e && e.message ? e.message : e));
  }
  var ok = true;
  var i;
  for (i = 0; i < data.steps.length; i++) if (!data.steps[i].ok) ok = false;
  return { ok: ok, message: ok ? 'Guided runtime self-test OK' : 'Guided runtime self-test failed', data: data };
}
