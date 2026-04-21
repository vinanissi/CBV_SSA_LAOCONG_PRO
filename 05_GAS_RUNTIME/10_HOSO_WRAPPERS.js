/**
 * HO_SO PRO — thin entrypoints (wrapper → Impl). Safe for menu / triggers / clasp.
 *
 * Phase C (2026-04-21): deprecated aliases removed. Only canonical hoso*
 * functions are defined here. Callers MUST use the canonical names.
 *
 * Dependencies: 10_HOSO_TEST, 10_HOSO_BOOTSTRAP, 10_HOSO_AUDIT_REPAIR, 10_HOSO_SEED.
 */

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

/** Canonical: run HO_SO integration + smoke tests. */
function hosoRunTests(opts) {
  return runHosoTestsImpl(opts || {});
}

/** Canonical: run HO_SO smoke test only. */
function hosoRunSmokeTest() {
  return runHosoSmokeTestImpl();
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

/** Canonical: full HO_SO module audit (schema + refs + enums + data quality + HTX integrity + canonical-only gate + rule-def coverage). */
function hosoAudit() {
  var schema = auditHosoSchema();
  var refs = auditHosoRefs();
  var enums = auditHosoEnums();
  var dq = auditHosoDataQuality();
  var htx = typeof auditHosoHtxIntegrity === 'function' ? auditHosoHtxIntegrity() : { ok: true, findings: [] };
  var canonical = typeof auditHosoCanonicalOnly_ === 'function' ? auditHosoCanonicalOnly_() : { ok: true, findings: [] };
  var ruleCoverage = typeof auditHosoRuleDefCoverage_ === 'function' ? auditHosoRuleDefCoverage_() : { ok: true, findings: [], coverage: {} };
  var high = [schema, refs, enums, dq, htx, canonical, ruleCoverage].reduce(function(n, x) {
    return n + (x.findings || []).filter(function(f) { return f.severity === 'HIGH'; }).length;
  }, 0);
  return {
    ok: high === 0,
    schema: schema,
    refs: refs,
    enums: enums,
    dataQuality: dq,
    htx: htx,
    canonical: canonical,
    ruleCoverage: ruleCoverage
  };
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

/** Canonical: seed HO_SO demo data (idempotent). */
function hosoSeedDemo() {
  return typeof seedHosoDemoData_ === 'function' ? seedHosoDemoData_() : { ok: false, message: 'seedHosoDemoData_ missing' };
}

// ---------------------------------------------------------------------------
// Full deploy
// ---------------------------------------------------------------------------

/**
 * Canonical: full HO_SO deployment. Delegates to hosoFullDeployImpl.
 * Default opts: { includeMigration: false, includeDemoSeed: false }
 * @param {Object} [opts]
 */
function hosoFullDeploy(opts) {
  return hosoFullDeployImpl(opts || {});
}

// ---------------------------------------------------------------------------
// Relation quick-check (used by menu)
// ---------------------------------------------------------------------------

function testHoSoRelations() { return testHoSoRelationsImpl(); }

function testHoSoRelationsImpl() { return hosoAudit(); }
