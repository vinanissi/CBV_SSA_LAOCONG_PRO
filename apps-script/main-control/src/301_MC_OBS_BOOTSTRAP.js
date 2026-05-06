/**
 * MAIN_CONTROL_OBS — Bootstrap (create OBS sheets/headers safely).
 *
 * Public:
 * - MC_Obs_bootstrap()
 * - MC_Obs_bootstrapDryRun()
 */

function MC_Obs_bootstrapDryRun() {
  try {
    if (typeof MC_Obs_schemaReport !== 'function') {
      return MC_Obs_stdResponse_(false, 'MC_OBS_BOOTSTRAP_DRYRUN_MISSING', 'MC_Obs_schemaReport not available', {}, { code: 'NO_SCHEMA_REPORT', message: 'MC_Obs_schemaReport missing', stack: '' });
    }
    var rep = MC_Obs_schemaReport();
    var ok = !!(rep && rep.ok);
    return MC_Obs_stdResponse_(ok, ok ? 'MC_OBS_BOOTSTRAP_DRYRUN_OK' : 'MC_OBS_BOOTSTRAP_DRYRUN_WARN', ok ? 'OK' : 'Dry run completed with warnings', { dryRun: true, report: rep }, null);
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_BOOTSTRAP_DRYRUN_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_bootstrap() {
  // MUST NOT fail MAIN_CONTROL business flow — always swallow internal errors and report.
  try {
    var results = [];
    var ensured = null;
    try {
      ensured = (typeof MC_Obs_ensureSheets === 'function') ? MC_Obs_ensureSheets() : MC_Obs_stdResponse_(false, 'MC_OBS_SCHEMA_ENSURE_MISSING', 'MC_Obs_ensureSheets missing', {}, { code: 'NO_SCHEMA_ENSURE', message: 'MC_Obs_ensureSheets missing', stack: '' });
    } catch (e1) {
      ensured = MC_Obs_stdResponse_(false, 'MC_OBS_SCHEMA_ENSURE_EXCEPTION', String(e1 && e1.message ? e1.message : e1), {}, { code: 'EXCEPTION', message: String(e1 && e1.message ? e1.message : e1), stack: String(e1 && e1.stack ? e1.stack : '') });
    }
    results.push({ name: 'MC_Obs_ensureSheets', result: ensured });

    // After bootstrap, write one health row (best-effort).
    var healthWrite = null;
    try {
      if (typeof MC_Obs_appendHealth === 'function') {
        var nowIso = '';
        try {
          if (typeof MC_now_ === 'function') nowIso = MC_now_();
          else nowIso = new Date().toISOString();
        } catch (tErr) {
          nowIso = String(new Date());
        }
        var actor = 'SYSTEM';
        try {
          actor = String(Session.getActiveUser().getEmail() || '').trim() || 'SYSTEM';
        } catch (uErr) {
          actor = 'SYSTEM';
        }
        var healthId = '';
        try {
          if (typeof MC_Obs_makeId_ === 'function') healthId = MC_Obs_makeId_('HLT');
          else if (typeof MC_uuid_ === 'function') healthId = MC_uuid_('HLT');
          else healthId = 'HLT_' + String(new Date().getTime());
        } catch (idErr) {
          healthId = 'HLT_' + String(new Date().getTime());
        }
        healthWrite = MC_Obs_appendHealth({
          HEALTH_ID: healthId,
          MODULE_CODE: 'MAIN_CONTROL',
          CHECK_CODE: 'OBS_BOOTSTRAP',
          STATUS: (ensured && ensured.ok) ? 'OK' : 'WARN',
          SEVERITY: (ensured && ensured.ok) ? 'OK' : 'WARN',
          MESSAGE: (ensured && ensured.ok) ? 'OBS bootstrap completed' : 'OBS bootstrap completed with warnings',
          DATA_JSON: { ensureSheets: ensured },
          CHECKED_AT: nowIso,
          CHECKED_BY: actor
        });
      } else {
        healthWrite = MC_Obs_stdResponse_(true, 'MC_OBS_HEALTH_WRITE_SKIPPED', 'MC_Obs_appendHealth not available', { skipped: true }, null);
      }
    } catch (e2) {
      healthWrite = MC_Obs_stdResponse_(false, 'MC_OBS_HEALTH_WRITE_EXCEPTION', String(e2 && e2.message ? e2.message : e2), {}, { code: 'EXCEPTION', message: String(e2 && e2.message ? e2.message : e2), stack: String(e2 && e2.stack ? e2.stack : '') });
    }
    results.push({ name: 'MC_Obs_appendHealth(OBS_BOOTSTRAP)', result: healthWrite });

    var okAll = true;
    var i;
    for (i = 0; i < results.length; i++) {
      var r = results[i] && results[i].result ? results[i].result : null;
      if (r && r.ok === false) okAll = false;
    }

    return MC_Obs_stdResponse_(true, okAll ? 'MC_OBS_BOOTSTRAP_OK' : 'MC_OBS_BOOTSTRAP_WARN', okAll ? 'OK' : 'Bootstrap completed with warnings (non-blocking)', { results: results }, null);
  } catch (e) {
    // Never throw outward.
    return MC_Obs_stdResponse_(true, 'MC_OBS_BOOTSTRAP_WARN', 'OBS bootstrap failed (non-blocking): ' + String(e && e.message ? e.message : e), { error: String(e && e.message ? e.message : e) }, null);
  }
}

