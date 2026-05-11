/**
 * CBV Operational Verification — decision gate (Phase D).
 */

/**
 * @param {Object} report
 * @returns {{
 *   allowNextPhase: boolean,
 *   allowProductionDeploy: boolean,
 *   requireManualReview: boolean,
 *   blockedBy: string[],
 *   decisionSummary: string
 * }}
 */
function CBV_TestConsole_buildDecisionGate_(report) {
  var r = report || {};
  var blockedBy = [];
  var risk = r.risk || CBV_TestConsole_calculateRiskScore_(r);
  var gov = r.governance || { ok: true };
  var ver = r.verification || { ok: true, governanceOk: true };

  var destructiveSuite = !!(r.registrySuite && r.registrySuite.destructive);

  var allowNextPhase = String(r.status || '').toUpperCase() !== 'FAIL';
  if (!allowNextPhase) blockedBy.push('STATUS_FAIL');

  var allowProductionDeploy =
    allowNextPhase &&
    String(r.severity || '').toUpperCase() !== 'CRITICAL' &&
    gov.ok !== false &&
    !risk.blocked &&
    !destructiveSuite &&
    ver.runtimeSafe !== false;

  if (String(r.severity || '').toUpperCase() === 'CRITICAL') {
    blockedBy.push('SEVERITY_CRITICAL');
    allowProductionDeploy = false;
  }
  if (gov.ok === false) {
    blockedBy.push('GOVERNANCE');
    allowProductionDeploy = false;
  }
  if (risk.blocked) blockedBy.push('RISK_BLOCKED');
  if (destructiveSuite) {
    blockedBy.push('DESTRUCTIVE_SUITE');
    allowProductionDeploy = false;
  }
  if (ver.runtimeSafe === false) {
    blockedBy.push('RUNTIME_BOUNDARY');
    allowProductionDeploy = false;
  }

  var requireManualReview =
    gov.ok === false ||
    String(r.status || '').toUpperCase() === 'GO_WITH_WARNINGS' ||
    (ver.verificationWarnings && ver.verificationWarnings.length > 0) ||
    risk.riskLevel === 'REVIEW' ||
    risk.riskLevel === 'HIGH_RISK';

  var parts = [];
  parts.push('allowNextPhase=' + (allowNextPhase ? 'YES' : 'NO'));
  parts.push('allowProductionDeploy=' + (allowProductionDeploy ? 'YES' : 'NO'));
  parts.push('requireManualReview=' + (requireManualReview ? 'YES' : 'NO'));
  if (blockedBy.length) parts.push('blockedBy=' + blockedBy.join(','));
  var decisionSummary = parts.join(' | ');

  return {
    allowNextPhase: allowNextPhase,
    allowProductionDeploy: allowProductionDeploy,
    requireManualReview: requireManualReview,
    blockedBy: blockedBy,
    decisionSummary: decisionSummary
  };
}

/**
 * @returns {{ ok: boolean, message: string }}
 */
function CBV_TestConsole_decisionGateSelfTest_() {
  var rep = {
    status: 'FAIL',
    severity: 'OK',
    governance: { ok: false },
    risk: { blocked: true, riskLevel: 'BLOCKED', riskScore: 90, reasons: ['x'] },
    registrySuite: { destructive: true },
    verification: { runtimeSafe: false, verificationWarnings: ['w'] }
  };
  var d = CBV_TestConsole_buildDecisionGate_(rep);
  if (d.allowNextPhase || d.allowProductionDeploy) return { ok: false, message: 'expected block' };
  if (!d.requireManualReview) return { ok: false, message: 'expected manual review' };
  return { ok: true, message: 'decision gate self-test OK' };
}
