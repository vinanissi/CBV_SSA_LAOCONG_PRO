/**
 * TASK_OBS — Config & bootstrap (adapter over CBV_OBS_CORE B1).
 *
 * Public:
 * - TaskObs_getConfig()
 * - TaskObs_schemaReport()
 * - TaskObs_bootstrap()
 * - TaskObs_bootstrapDryRun()
 *
 * Private:
 * - TaskObs_openTaskDb_()
 * - TaskObs_getTaskDbId_()
 * - TaskObs_stdResponse_(...)
 * - TaskObs_now_()
 * - TaskObs_user_()
 */

function TaskObs_getConfig() {
  return {
    moduleCode: 'TASK',
    modulePrefix: 'TASK',
    dbResolver: function () {
      return TaskObs_openTaskDb_();
    },
    sheets: {
      health: 'TASK_OBS_HEALTH',
      testRun: 'TASK_OBS_TEST_RUN',
      testResult: 'TASK_OBS_TEST_RESULT',
      finding: 'TASK_OBS_FINDING',
      audit: 'TASK_OBS_AUDIT',
      eventTrace: 'TASK_OBS_EVENT_TRACE',
      runtimeMetric: 'TASK_OBS_RUNTIME_METRIC',
      aiExport: 'TASK_OBS_AI_EXPORT',
      dashboard: 'TASK_OBS_DASHBOARD',
      operatorGuide: 'TASK_OBS_OPERATOR_GUIDE'
    }
  };
}

function TaskObs_schemaReport() {
  try {
    if (typeof CBV_Obs_schemaReport !== 'function') {
      return TaskObs_stdResponse_(false, 'TASK_OBS_CORE_MISSING', 'CBV_Obs_schemaReport not available', {}, { code: 'CORE_MISSING', message: 'CBV_Obs_schemaReport missing', stack: '' });
    }
    return CBV_Obs_schemaReport(TaskObs_getConfig());
  } catch (e) {
    return TaskObs_stdResponse_(false, 'TASK_OBS_SCHEMA_REPORT_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function TaskObs_bootstrap() {
  try {
    if (typeof CBV_Obs_ensureSheets !== 'function') {
      return TaskObs_stdResponse_(false, 'TASK_OBS_CORE_MISSING', 'CBV_Obs_ensureSheets not available', {}, { code: 'CORE_MISSING', message: 'CBV_Obs_ensureSheets missing', stack: '' });
    }
    var cfg = TaskObs_getConfig();
    var ensured = CBV_Obs_ensureSheets(cfg);

    // Best-effort health row.
    try {
      if (typeof CBV_Obs_appendHealth === 'function') {
        CBV_Obs_appendHealth(cfg, {
          CHECK_CODE: 'TASK_OBS_BOOTSTRAP',
          STATUS: ensured && ensured.ok ? 'OK' : 'WARN',
          SEVERITY: ensured && ensured.ok ? 'OK' : 'WARN',
          MESSAGE: ensured && ensured.ok ? 'TASK_OBS bootstrap completed' : 'TASK_OBS bootstrap completed with warnings',
          DATA_JSON: { ensureSheets: ensured }
        });
      }
    } catch (e0) {
      /* swallow */
    }

    return TaskObs_stdResponse_(true, ensured && ensured.ok ? 'TASK_OBS_BOOTSTRAP_OK' : 'TASK_OBS_BOOTSTRAP_WARN', ensured && ensured.ok ? 'OK' : 'Bootstrap completed with warnings', { ensureSheets: ensured }, null);
  } catch (e) {
    return TaskObs_stdResponse_(true, 'TASK_OBS_BOOTSTRAP_WARN', 'Bootstrap failed (non-blocking): ' + String(e && e.message ? e.message : e), { error: String(e && e.message ? e.message : e) }, null);
  }
}

function TaskObs_bootstrapDryRun() {
  try {
    var cfg = TaskObs_getConfig();

    // If missing DB ID, report clearly (do not attempt create).
    var id = '';
    try { id = TaskObs_getTaskDbId_(); } catch (e0) { id = ''; }
    if (!id) {
      return TaskObs_stdResponse_(false, 'TASK_OBS_DB_ID_MISSING', 'CBV_TASK_DB_ID missing', { requiredScriptProperty: 'CBV_TASK_DB_ID', sheetsWillBeCreated: Object.values(cfg.sheets || {}) }, { code: 'DB_ID_MISSING', message: 'CBV_TASK_DB_ID missing', stack: '' });
    }

    if (typeof CBV_Obs_schemaReport === 'function') {
      var rep = CBV_Obs_schemaReport(cfg);
      return TaskObs_stdResponse_(!!(rep && rep.ok), rep && rep.ok ? 'TASK_OBS_DRYRUN_OK' : 'TASK_OBS_DRYRUN_WARN', rep && rep.ok ? 'OK' : 'Dry run completed with warnings', { dryRun: true, report: rep }, null);
    }

    // Fallback: show planned sheet names (no core present).
    return TaskObs_stdResponse_(false, 'TASK_OBS_CORE_MISSING', 'CBV_Obs_schemaReport not available', { dryRun: true, sheetsWillBeCreated: Object.values(cfg.sheets || {}) }, { code: 'CORE_MISSING', message: 'CBV_Obs_schemaReport missing', stack: '' });
  } catch (e) {
    return TaskObs_stdResponse_(false, 'TASK_OBS_DRYRUN_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function TaskObs_openTaskDb_() {
  var dbId = TaskObs_getTaskDbId_();
  if (!dbId) {
    var err = new Error('CBV_TASK_DB_ID missing');
    err.code = 'TASK_DB_ID_MISSING';
    throw err;
  }
  try {
    return SpreadsheetApp.openById(dbId);
  } catch (e) {
    var err2 = new Error('Failed to open TASK DB by id');
    err2.code = 'TASK_DB_OPEN_FAILED';
    err2.detail = String(e && e.message ? e.message : e);
    throw err2;
  }
}

function TaskObs_getTaskDbId_() {
  try {
    return String(PropertiesService.getScriptProperties().getProperty('CBV_TASK_DB_ID') || '').trim();
  } catch (e) {
    return '';
  }
}

function TaskObs_stdResponse_(ok, code, message, data, error) {
  return {
    ok: !!ok,
    code: code || (ok ? 'OK' : 'ERROR'),
    message: message != null ? String(message) : '',
    data: data == null ? {} : data,
    error: error == null ? null : error
  };
}

function TaskObs_now_() {
  try {
    if (typeof cbvCoreV2IsoNow_ === 'function') return cbvCoreV2IsoNow_();
  } catch (e0) {
    /* ignore */
  }
  try {
    return new Date().toISOString();
  } catch (e1) {
    return String(new Date());
  }
}

function TaskObs_user_() {
  try {
    var email = String(Session.getActiveUser().getEmail() || '').trim();
    if (email) return email;
  } catch (e0) {
    /* ignore */
  }
  return 'SYSTEM';
}

