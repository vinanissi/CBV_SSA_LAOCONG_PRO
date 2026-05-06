/**
 * MAIN_CONTROL Control Plane — Bootstrap (Phase A+B).
 *
 * Public:
 * - MC_bootstrapControlPlane()
 * - MC_bootstrapControlPlaneDryRun()
 */

function MC_bootstrapSafeCall_(name, fn) {
  var startedAt = '';
  try {
    startedAt = typeof MC_now_ === 'function' ? MC_now_() : new Date().toISOString();
  } catch (e0) {
    startedAt = String(new Date());
  }
  try {
    if (typeof fn !== 'function') {
      return { name: name, ok: false, skipped: true, code: 'NO_FUNCTION', message: 'Function not found', data: {}, startedAt: startedAt };
    }
    var r = fn();
    // Normalize unknown return values into a plain object.
    if (r && typeof r === 'object' && typeof r.ok === 'boolean') {
      return { name: name, ok: !!r.ok, code: String(r.code || ''), message: String(r.message || ''), data: r.data || {}, error: r.error || null, startedAt: startedAt };
    }
    return { name: name, ok: true, code: 'OK', message: 'OK', data: { returnValue: r }, startedAt: startedAt };
  } catch (e) {
    return {
      name: name,
      ok: false,
      code: 'EXCEPTION',
      message: String(e && e.message ? e.message : e),
      data: {},
      error: { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') },
      startedAt: startedAt
    };
  }
}

function MC_bootstrapBuildSummary_(results) {
  var r = results || [];
  var i;
  var ok = 0;
  var fail = 0;
  var skipped = 0;
  for (i = 0; i < r.length; i++) {
    if (r[i] && r[i].skipped) skipped++;
    else if (r[i] && r[i].ok) ok++;
    else fail++;
  }
  return {
    total: r.length,
    ok: ok,
    fail: fail,
    skipped: skipped
  };
}

function MC_bootstrapControlPlaneDryRun() {
  // Dry run: DO NOT create sheets/headers. Only report and health.
  var results = [];
  results.push(MC_bootstrapSafeCall_('MC_Schema_report', function () {
    if (typeof MC_Schema_report === 'function') return MC_Schema_report();
    return { ok: false, code: 'NO_SCHEMA', message: 'MC_Schema_report missing', data: {}, error: null };
  }));
  results.push(MC_bootstrapSafeCall_('MC_healthControlPlane', function () {
    if (typeof MC_healthControlPlane === 'function') return MC_healthControlPlane();
    return { ok: true, code: 'HEALTH_SKIPPED', message: 'MC_healthControlPlane not available', data: {}, error: null };
  }));

  var summary = MC_bootstrapBuildSummary_(results);
  var okAll = summary.fail === 0;
  return MC_cpStdResponse_(
    okAll,
    okAll ? 'MAIN_CONTROL_BOOTSTRAP_DRYRUN_OK' : 'MAIN_CONTROL_BOOTSTRAP_DRYRUN_WARN',
    okAll ? 'OK' : 'Dry run completed with warnings',
    { dryRun: true, summary: summary, results: results },
    null
  );
}

function MC_bootstrapControlPlane() {
  var results = [];

  // Step 0: call legacy core bootstrap if exists (do not fail hard if it fails).
  results.push(MC_bootstrapSafeCall_('CBV_CoreV2_bootstrap', function () {
    if (typeof CBV_CoreV2_bootstrap === 'function') return CBV_CoreV2_bootstrap();
    return { ok: true, code: 'SKIPPED', message: 'CBV_CoreV2_bootstrap not found', data: {}, error: null };
  }));

  // Step 1: ensure control plane sheets/headers (Phase B).
  results.push(MC_bootstrapSafeCall_('MC_Schema_ensureControlPlaneSheets', function () {
    if (typeof MC_Schema_ensureControlPlaneSheets === 'function') return MC_Schema_ensureControlPlaneSheets();
    return { ok: false, code: 'NO_SCHEMA_ENSURE', message: 'MC_Schema_ensureControlPlaneSheets missing', data: {}, error: null };
  }));

  // Step 2: lightweight diagnostics (do not make bootstrap fail if health/audit fails).
  results.push(MC_bootstrapSafeCall_('MC_healthControlPlane', function () {
    if (typeof MC_healthControlPlane === 'function') return MC_healthControlPlane();
    return { ok: true, code: 'HEALTH_SKIPPED', message: 'MC_healthControlPlane not available', data: {}, error: null };
  }));

  var summary = MC_bootstrapBuildSummary_(results);
  var okAll = summary.fail === 0;
  return MC_cpStdResponse_(
    okAll,
    okAll ? 'MAIN_CONTROL_BOOTSTRAP_OK' : 'MAIN_CONTROL_BOOTSTRAP_WARN',
    okAll ? 'OK' : 'Bootstrap completed with warnings',
    { dryRun: false, summary: summary, results: results },
    null
  );
}

