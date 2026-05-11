/**
 * CBV Operational Verification — risk scoring (Phase D).
 */

/**
 * @param {Object} report
 * @returns {{ riskScore: number, riskLevel: string, blocked: boolean, reasons: string[] }}
 */
function CBV_TestConsole_calculateRiskScore_(report) {
  var r = report || {};
  var score = 0;
  var reasons = [];

  function add(pts, why) {
    score += pts;
    reasons.push(why);
  }

  var w = r.warnings && r.warnings.length ? r.warnings.length : 0;
  if (w) add(Math.min(20, w * 2), 'warnings:' + w);

  var er = r.errors && r.errors.length ? r.errors.length : 0;
  if (er) add(Math.min(40, er * 10), 'errors:' + er);

  if (String(r.severity || '').toUpperCase() === 'CRITICAL') add(30, 'severity:CRITICAL');
  else if (String(r.severity || '').toUpperCase() === 'ERROR') add(20, 'severity:ERROR');

  if (String(r.status || '').toUpperCase() === 'FAIL') add(35, 'status:FAIL');

  var ver = r.verification || {};
  if (ver.verificationErrors && ver.verificationErrors.length) add(Math.min(30, ver.verificationErrors.length * 8), 'verificationErrors');

  var gov = r.governance || {};
  if (gov.ok === false) add(25, 'governance:violations');

  if (r.registrySuite && r.registrySuite.destructive) add(30, 'suite:destructive');

  if (!String(r.traceId || '').trim()) add(15, 'missing:traceId');

  if (ver.runtimeSafe === false) add(20, 'runtimeSafe:false');

  if (score > 100) score = 100;

  var level = 'SAFE';
  if (score > 80) level = 'BLOCKED';
  else if (score > 50) level = 'HIGH_RISK';
  else if (score > 20) level = 'REVIEW';

  return {
    riskScore: score,
    riskLevel: level,
    blocked: score > 80,
    reasons: reasons
  };
}

/**
 * @returns {{ ok: boolean, message: string }}
 */
function CBV_TestConsole_riskEngineSelfTest_() {
  var rep = {
    ok: false,
    status: 'FAIL',
    severity: 'CRITICAL',
    traceId: '',
    warnings: ['a'],
    errors: ['b'],
    verification: { verificationErrors: ['x'], runtimeSafe: false },
    governance: { ok: false },
    registrySuite: { destructive: true }
  };
  var x = CBV_TestConsole_calculateRiskScore_(rep);
  if (!x.blocked || x.riskScore < 81) return { ok: false, message: 'expected blocked high score' };
  var rep2 = { ok: true, status: 'GO', severity: 'OK', traceId: 'T1', warnings: [], errors: [], verification: { verificationErrors: [], runtimeSafe: true }, governance: { ok: true } };
  var y = CBV_TestConsole_calculateRiskScore_(rep2);
  if (y.riskLevel !== 'SAFE' && y.riskScore > 20) return { ok: false, message: 'expected low risk' };
  return { ok: true, message: 'risk engine self-test OK' };
}
