/**
 * CBV Test Console Phase G — Guidance Layer.
 */

function CBV_TestConsole_Guidance_buildForSession_(session, report) {
  var s = session || {};
  var r = report || null;
  var state = String(s.state || 'IDLE').toUpperCase();
  var warnings = [];
  var nextActions = [];
  var blocked = false;
  var severity = r ? String(r.severity || '') : '';
  var status = r ? String(r.status || '') : '';

  if (state === 'SESSION_OPEN') {
    nextActions.push('Select a suite from the Test Console screen.');
    nextActions.push('Acquire runtime lock before running a suite when another operator may be active.');
  } else if (state === 'SUITE_SELECTED') {
    nextActions.push('Review suite safety metadata before running.');
    nextActions.push('Run selected suite once; do not start a loop.');
  } else if (state === 'LOCKED') {
    nextActions.push('Run the selected suite or release the lock if you will not proceed.');
  } else if (state === 'RUNNING') {
    nextActions.push('Wait for the current manual run to finish; do not trigger another run.');
    blocked = true;
  } else if (state === 'REPORT_READY') {
    nextActions.push('Review report status, severity, warnings, and Drive export link.');
    nextActions.push('Copy AI Handoff Prompt if follow-up engineering review is needed.');
  } else if (state === 'NEEDS_GUIDANCE') {
    nextActions.push('Use this guidance panel to decide proceed / mitigate / recover.');
  } else if (state === 'RECOVERY_REQUIRED') {
    nextActions.push('Open Recovery Plan and execute manual recovery steps.');
    blocked = true;
  } else if (state === 'CLOSED') {
    nextActions.push('Start a new session for additional runtime work.');
  } else {
    nextActions.push('Start a guided runtime session.');
  }

  if (r) {
    if (status === 'FAIL' || severity === 'ERROR' || severity === 'CRITICAL') {
      warnings.push('Report requires mitigation or recovery before promotion.');
      nextActions.unshift('Do not promote. Review failed checks and create recovery plan.');
      blocked = true;
    } else if (status === 'GO_WITH_WARNINGS' || severity === 'WARNING') {
      warnings.push('Proceed only with operator acknowledgement of warnings.');
      nextActions.unshift('Review warnings and record mitigation decision.');
    } else if (status === 'GO') {
      nextActions.unshift('Report is green; archive handoff and close session if no more action is needed.');
    }
  }

  return {
    state: state,
    blocked: blocked,
    status: status,
    severity: severity,
    warnings: warnings,
    nextActions: nextActions,
    memoryReminder: 'Append report, decision, trace, and AI handoff before claiming completion.',
    generatedAt: CBV_TestConsole_Runtime_now_()
  };
}

function CBV_TestConsole_Guidance_getCurrent_() {
  var session = CBV_TestConsole_Session_getActive_();
  if (!session) {
    return {
      session: null,
      guidance: CBV_TestConsole_Guidance_buildForSession_({ state: 'IDLE' }, null)
    };
  }
  var guidance = CBV_TestConsole_Guidance_buildForSession_(session, session.lastReport || null);
  session.guidance = guidance;
  CBV_TestConsole_Session_saveActive_(session);
  return { session: session, guidance: guidance };
}
