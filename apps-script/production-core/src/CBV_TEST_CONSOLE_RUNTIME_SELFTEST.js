/**
 * CBV Test Console Runtime V2 — runtime self-test (synthetic envelope).
 */

/**
 * @returns {{ ok: boolean, message: string, data?: Object, error?: Object }}
 */
function CBV_TestConsole_Runtime_selfTest() {
  try {
    var ctx = {
      phase: CBV_TEST_CONSOLE_DEFAULT_PHASE_,
      testSuite: 'TEST_CONSOLE_RUNTIME_SELF_TEST',
      traceId: CBV_TestConsole_newTraceId_(),
      checkedAt: CBV_TestConsole_isoNow_(),
      runBy: CBV_TestConsole_runBy_(),
      summary: 'Synthetic envelope path (verify + markdown + validation).',
      checks: [
        { code: 'SYNTH_CHECK_OK', ok: true, severity: 'OK', message: 'Synthetic OK', detail: '' }
      ],
      warnings: [],
      errors: [],
      ok: true
    };
    var rep = CBV_TestConsole_buildReportEnvelope_(ctx);
    var v = CBV_TestConsole_validateReportEnvelope_(rep);
    var ok = !!(rep && v.envelopeOk && rep.status === 'GO' && rep.envelopeOk);
    if (!v.envelopeOk) {
      return {
        ok: false,
        message: 'Envelope validation failed: ' + (v.errors || []).join(', '),
        data: { validation: v, report: rep },
        error: { code: 'ENVELOPE_INVALID', message: (v.errors || []).join(', ') }
      };
    }
    return {
      ok: ok,
      message: ok ? 'Runtime self-test OK' : 'Runtime self-test failed',
      data: { traceId: rep.traceId, status: rep.status },
      error: ok ? null : { code: 'RUNTIME_SELF_TEST_FAIL', message: 'Unexpected report state' }
    };
  } catch (e) {
    return {
      ok: false,
      message: String(e && e.message ? e.message : e),
      error: { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') }
    };
  }
}
