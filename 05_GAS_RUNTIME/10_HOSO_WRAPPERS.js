/**
 * HO_SO PRO — thin entrypoints (wrapper → Impl). Safe for menu / triggers / clasp.
 * Dependencies: 10_HOSO_TEST, 10_HOSO_BOOTSTRAP, 10_HOSO_AUDIT_REPAIR
 */

function runHosoTests(opts) {
  return runHosoTestsImpl(opts || {});
}

/** Backward-compatible name for menu + docs */
function runHoSoTests(opts) {
  return runHosoTestsImpl(opts || {});
}

function runHosoSmokeTest() {
  return runHosoSmokeTestImpl();
}

function hosoRunAudit() {
  return hosoRunAuditImpl();
}

function hosoRunAuditImpl() {
  var schema = auditHosoSchema();
  var refs = auditHosoRefs();
  var enums = auditHosoEnums();
  var dq = auditHosoDataQuality();
  var high = [schema, refs, enums, dq].reduce(function(n, x) {
    return n + (x.findings || []).filter(function(f) { return f.severity === 'HIGH'; }).length;
  }, 0);
  return {
    ok: high === 0,
    schema: schema,
    refs: refs,
    enums: enums,
    dataQuality: dq
  };
}

function hosoRunFullDeploymentMenu() {
  return hosoRunFullDeploymentMenuImpl();
}

function hosoRunFullDeploymentMenuImpl() {
  return runHosoFullDeployment();
}

function auditHoSoModule() {
  return auditHoSoModuleImpl();
}

function auditHoSoModuleImpl() {
  return runHosoTestsImpl({});
}

function seedHoSoDemo() {
  return seedHoSoDemoImpl();
}

function seedHoSoDemoImpl() {
  return typeof seedHosoDemoData_ === 'function' ? seedHosoDemoData_() : { ok: false, message: 'seedHosoDemoData_ missing' };
}

function testHoSoRelations() {
  return testHoSoRelationsImpl();
}

function testHoSoRelationsImpl() {
  return auditHoSoModuleImpl();
}
