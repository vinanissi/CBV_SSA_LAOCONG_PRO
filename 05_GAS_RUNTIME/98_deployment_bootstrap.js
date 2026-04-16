/**
 * CBV One-Click Deployment - Master orchestrator.
 * Idempotent, safe, non-destructive. Run multiple times without breaking.
 *
 * Flow: ensureAllSchemas → seedAllData → validateAllEnums → validateAllRefs →
 *       validateDonViHierarchy → runAllSystemTests → generateDeploymentReport
 *
 * Dependencies: 98_schema_manager, 98_seed_manager, 98_validation_engine,
 *               98_test_runner, 98_audit_logger, 00_CORE_CONFIG
 */

/**
 * Full one-click deployment. Ensures schema, seeds data, validates, tests, reports.
 * @param {Object} options - { skipSeed: false, skipTests: false, dryRun: false }
 * @returns {{ ok: boolean, verdict: string, report: Object, mustFix: string[] }}
 */
function runFullDeploymentImpl(options) {
  var opts = options || {};
  var report = {
    runAt: typeof cbvNow === 'function' ? cbvNow() : new Date(),
    runId: typeof cbvMakeId === 'function' ? cbvMakeId('DEP') : 'DEP_' + Date.now(),
    steps: {},
    verdict: 'PASS',
    summary: {},
    mustFix: [],
    warnings: []
  };
  var highCount = 0;
  var mediumCount = 0;

  try {
    // 1. Ensure schema
    var schemaResult = typeof ensureAllSchemasImpl === 'function' ? ensureAllSchemasImpl() : { ok: true, created: [], appended: [], logs: [] };
    report.steps.schema = schemaResult;
    if (!schemaResult.ok) {
      report.verdict = 'FAIL';
      report.mustFix = (report.mustFix || []).concat(schemaResult.errors || ['Schema setup failed']);
    }

    // 2. Seed data (unless skipSeed)
    if (!opts.skipSeed) {
      var seedResult = typeof seedAllDataImpl === 'function' ? seedAllDataImpl() : { ok: true, donVi: 0, user: 0, enum: 0, masterCode: 0 };
      report.steps.seed = seedResult;
      if (!seedResult.ok) report.warnings.push('Seed: ' + (seedResult.message || 'Some seeds failed'));
    } else {
      report.steps.seed = { skipped: true };
    }

    // 3. Validate enums
    var enumResult = typeof validateAllEnumsImpl === 'function' ? validateAllEnumsImpl() : { ok: true, findings: [] };
    report.steps.validateEnums = enumResult;
    (enumResult.findings || []).forEach(function(f) {
      if (f.severity === 'HIGH') { highCount++; report.mustFix.push((f.table || '') + ': ' + (f.message || f.code)); }
      else if (f.severity === 'MEDIUM') mediumCount++;
    });

    // 4. Validate refs
    var refResult = typeof validateAllRefsImpl === 'function' ? validateAllRefsImpl() : { ok: true, findings: [] };
    report.steps.validateRefs = refResult;
    (refResult.findings || []).forEach(function(f) {
      if (f.severity === 'HIGH') { highCount++; report.mustFix.push((f.table || '') + '.' + (f.field || '') + ': ' + (f.message || '')); }
      else if (f.severity === 'MEDIUM') mediumCount++;
    });

    // 5. Validate DON_VI hierarchy
    var hierResult = typeof validateDonViHierarchyImpl === 'function' ? validateDonViHierarchyImpl() : { ok: true, findings: [] };
    report.steps.validateHierarchy = hierResult;
    (hierResult.findings || []).forEach(function(f) {
      if (f.severity === 'HIGH') { highCount++; report.mustFix.push((f.table || '') + ': ' + (f.message || f.code)); }
      else if (f.severity === 'MEDIUM') mediumCount++;
    });

    // 6. Run all system tests (unless skipTests)
    var testResult = { skipped: opts.skipTests };
    if (!opts.skipTests && typeof runAllSystemTestsImpl === 'function') {
      testResult = runAllSystemTestsImpl();
      report.steps.tests = {
        verdict: testResult.verdict,
        high: testResult.summary && testResult.summary.high,
        medium: testResult.summary && testResult.summary.medium,
        low: testResult.summary && testResult.summary.low,
        mustFixBeforeDeploy: testResult.mustFixBeforeDeploy || []
      };
      if (testResult.verdict === 'FAIL') {
        highCount += (testResult.summary && testResult.summary.high) || 0;
        mediumCount += (testResult.summary && testResult.summary.medium) || 0;
        report.mustFix = (report.mustFix || []).concat(testResult.mustFixBeforeDeploy || []);
      }
    } else {
      report.steps.tests = testResult;
    }

    // 7. Determine verdict
    if (highCount > 0) report.verdict = 'FAIL';
    else if (mediumCount > 0 || (report.warnings && report.warnings.length > 0)) report.verdict = 'WARNING';
    else report.verdict = 'PASS';

    report.summary = {
      high: highCount,
      medium: mediumCount,
      verdict: report.verdict,
      schemaOk: schemaResult.ok !== false,
      seedOk: !report.steps.seed || report.steps.seed.ok !== false,
      enumOk: enumResult.ok !== false,
      refOk: refResult.ok !== false,
      hierarchyOk: hierResult.ok !== false,
      testsOk: opts.skipTests || (testResult.verdict === 'PASS' || testResult.verdict === 'WARNING')
    };
  } catch (e) {
    report.verdict = 'FAIL';
    report.mustFix = (report.mustFix || []).concat(['Exception: ' + (e.message || String(e))]);
    report.steps.error = { message: e.message, stack: e.stack };
  }

  // 8. Generate deployment report (write to ADMIN_AUDIT_LOG)
  if (!opts.dryRun && typeof generateDeploymentReportImpl === 'function') {
    generateDeploymentReportImpl(report);
  }

  return {
    ok: report.verdict === 'PASS',
    verdict: report.verdict,
    report: report,
    mustFix: report.mustFix || []
  };
}

/** Backward compat: delegates to runFullDeployment (wrapper). */
function runFullDeploymentMenu() {
  runFullDeployment();
}
