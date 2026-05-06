/**
 * MAIN_CONTROL_OBS — Writer (append-only, header-map based, safe/no-throw).
 *
 * Public:
 * - MC_Obs_appendHealth(payload)
 * - MC_Obs_appendTestRun(payload)
 * - MC_Obs_appendTestResult(payload)
 * - MC_Obs_appendFinding(payload)
 * - MC_Obs_appendAudit(payload)
 * - MC_Obs_appendEventTrace(payload)
 * - MC_Obs_appendRuntimeMetric(payload)
 *
 * Private:
 * - MC_Obs_appendRow_(sheetName, rowObject)
 * - MC_Obs_safeJson_(value)
 * - MC_Obs_now_()
 * - MC_Obs_user_()
 * - MC_Obs_stdResponse_(ok, code, message, data, error)
 */

function MC_Obs_appendHealth(payload) {
  try {
    return MC_Obs_appendRow_(MC_OBS_SCHEMA_.SHEETS.HEALTH, payload || {});
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_APPEND_HEALTH_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_appendTestRun(payload) {
  try {
    return MC_Obs_appendRow_(MC_OBS_SCHEMA_.SHEETS.TEST_RUN, payload || {});
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_APPEND_TEST_RUN_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_appendTestResult(payload) {
  try {
    return MC_Obs_appendRow_(MC_OBS_SCHEMA_.SHEETS.TEST_RESULT, payload || {});
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_APPEND_TEST_RESULT_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_appendFinding(payload) {
  try {
    return MC_Obs_appendRow_(MC_OBS_SCHEMA_.SHEETS.FINDING, payload || {});
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_APPEND_FINDING_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_appendAudit(payload) {
  try {
    return MC_Obs_appendRow_(MC_OBS_SCHEMA_.SHEETS.AUDIT, payload || {});
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_APPEND_AUDIT_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_appendEventTrace(payload) {
  try {
    return MC_Obs_appendRow_(MC_OBS_SCHEMA_.SHEETS.EVENT_TRACE, payload || {});
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_APPEND_EVENT_TRACE_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_appendRuntimeMetric(payload) {
  try {
    return MC_Obs_appendRow_(MC_OBS_SCHEMA_.SHEETS.RUNTIME_METRIC, payload || {});
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_APPEND_RUNTIME_METRIC_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_appendRow_(sheetName, rowObject) {
  // Hard requirement: never throw to caller.
  try {
    if (!sheetName) return MC_Obs_stdResponse_(false, 'MC_OBS_APPEND_ROW_INVALID', 'sheetName missing', {}, { code: 'INVALID_ARG', message: 'sheetName missing', stack: '' });

    // Ensure sheets if missing (best-effort).
    try {
      if (typeof MC_Obs_ensureSheets === 'function') {
        MC_Obs_ensureSheets();
      }
    } catch (e0) {
      /* swallow */
    }

    var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false, error: { code: 'NO_DB_OPEN', message: 'MC_Obs_openModuleDb_ missing', stack: '' } };
    if (!opened.ok) {
      return MC_Obs_stdResponse_(false, 'MC_OBS_DB_NOT_AVAILABLE', opened.message || 'Core DB not available', opened.data || {}, opened.error || null);
    }
    var ss = opened.ss;
    var sh = null;
    try {
      sh = ss.getSheetByName(sheetName);
    } catch (e1) {
      sh = null;
    }
    if (!sh) {
      return MC_Obs_stdResponse_(false, 'MC_OBS_SHEET_MISSING', 'Sheet missing: ' + sheetName, { sheetName: sheetName }, { code: 'SHEET_MISSING', message: sheetName, stack: '' });
    }

    var obj = rowObject || {};
    var headers = (MC_OBS_SCHEMA_ && MC_OBS_SCHEMA_.HEADERS && MC_OBS_SCHEMA_.HEADERS[sheetName]) ? MC_OBS_SCHEMA_.HEADERS[sheetName] : [];
    // Ensure headers add-only (best-effort).
    try {
      if (typeof MC_Obs_ensureHeaders_ === 'function' && headers && headers.length) {
        MC_Obs_ensureHeaders_(sh, headers);
      }
    } catch (e2) {
      /* swallow */
    }

    // Normalize common fields.
    var nowIso = MC_Obs_now_();
    var actor = MC_Obs_user_();

    // Auto-fill ID-like columns when present and blank.
    var idCol = null;
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.HEALTH) idCol = 'HEALTH_ID';
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.TEST_RUN) idCol = 'RUN_ID';
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.TEST_RESULT) idCol = 'RESULT_ID';
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.FINDING) idCol = 'FINDING_ID';
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.AUDIT) idCol = 'AUDIT_ID';
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.EVENT_TRACE) idCol = 'TRACE_ID';
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.RUNTIME_METRIC) idCol = 'METRIC_ID';
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.AI_EXPORT) idCol = 'EXPORT_ID';
    if (idCol && !obj[idCol]) obj[idCol] = MC_Obs_makeId_(String(idCol).slice(0, 3));

    if (!obj.MODULE_CODE) obj.MODULE_CODE = MC_OBS_SCHEMA_.MODULE_CODE;

    // Default timestamp fields.
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.HEALTH) {
      if (!obj.CHECKED_AT) obj.CHECKED_AT = nowIso;
      if (!obj.CHECKED_BY) obj.CHECKED_BY = actor;
      if (obj.DATA_JSON && typeof obj.DATA_JSON !== 'string') obj.DATA_JSON = MC_Obs_safeJson_(obj.DATA_JSON);
    }
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.TEST_RUN) {
      if (obj.SUMMARY_JSON && typeof obj.SUMMARY_JSON !== 'string') obj.SUMMARY_JSON = MC_Obs_safeJson_(obj.SUMMARY_JSON);
      if (!obj.TRIGGERED_BY) obj.TRIGGERED_BY = actor;
    }
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.TEST_RESULT) {
      if (obj.DATA_JSON && typeof obj.DATA_JSON !== 'string') obj.DATA_JSON = MC_Obs_safeJson_(obj.DATA_JSON);
    }
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.FINDING) {
      if (!obj.CREATED_AT) obj.CREATED_AT = nowIso;
      if (!obj.UPDATED_AT) obj.UPDATED_AT = nowIso;
      if (obj.DATA_JSON && typeof obj.DATA_JSON !== 'string') obj.DATA_JSON = MC_Obs_safeJson_(obj.DATA_JSON);
    }
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.AUDIT) {
      if (!obj.CREATED_AT) obj.CREATED_AT = nowIso;
      if (!obj.ACTOR_EMAIL) obj.ACTOR_EMAIL = actor;
      if (obj.DATA_JSON && typeof obj.DATA_JSON !== 'string') obj.DATA_JSON = MC_Obs_safeJson_(obj.DATA_JSON);
    }
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.EVENT_TRACE) {
      if (!obj.CREATED_AT) obj.CREATED_AT = nowIso;
      if (obj.PAYLOAD_JSON && typeof obj.PAYLOAD_JSON !== 'string') obj.PAYLOAD_JSON = MC_Obs_safeJson_(obj.PAYLOAD_JSON);
    }
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.RUNTIME_METRIC) {
      if (!obj.RECORDED_AT) obj.RECORDED_AT = nowIso;
      if (obj.DATA_JSON && typeof obj.DATA_JSON !== 'string') obj.DATA_JSON = MC_Obs_safeJson_(obj.DATA_JSON);
    }
    if (sheetName === MC_OBS_SCHEMA_.SHEETS.AI_EXPORT) {
      if (!obj.CREATED_AT) obj.CREATED_AT = nowIso;
      if (!obj.CREATED_BY) obj.CREATED_BY = actor;
      if (obj.EXPORT_JSON && typeof obj.EXPORT_JSON !== 'string') obj.EXPORT_JSON = MC_Obs_safeJson_(obj.EXPORT_JSON);
    }

    // Prefer core helper if present.
    try {
      if (typeof cbvCoreV2AppendRowByHeaders_ === 'function') {
        cbvCoreV2AppendRowByHeaders_(sh, obj);
        return MC_Obs_stdResponse_(true, 'MC_OBS_ROW_APPENDED', 'OK', { sheetName: sheetName }, null);
      }
    } catch (e3) {
      /* fallback below */
    }

    // Fallback: build header map from row 1 and append.
    var map = {};
    try {
      var lastCol = sh.getLastColumn();
      var headerVals = lastCol > 0 ? sh.getRange(1, 1, 1, lastCol).getValues() : [[]];
      var row = headerVals && headerVals[0] ? headerVals[0] : [];
      var c;
      for (c = 0; c < row.length; c++) {
        var key = String(row[c] == null ? '' : row[c]).trim();
        if (key) map[key] = c + 1;
      }
    } catch (e4) {
      map = {};
    }
    var maxCol = 0;
    var k;
    for (k in map) if (Object.prototype.hasOwnProperty.call(map, k) && map[k] > maxCol) maxCol = map[k];
    if (maxCol < 1) maxCol = sh.getLastColumn() || (headers ? headers.length : 1) || 1;

    var vals = new Array(maxCol);
    for (k = 0; k < vals.length; k++) vals[k] = '';
    for (k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      var col = map[k];
      if (!col) continue;
      vals[col - 1] = obj[k];
    }
    sh.appendRow(vals);
    return MC_Obs_stdResponse_(true, 'MC_OBS_ROW_APPENDED', 'OK', { sheetName: sheetName }, null);
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_APPEND_ROW_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_safeJson_(value) {
  try {
    if (typeof MC_json_ === 'function') return MC_json_(value);
  } catch (e0) {
    /* ignore */
  }
  try {
    if (typeof cbvCoreV2SafeStringify_ === 'function') return cbvCoreV2SafeStringify_(value);
  } catch (e1) {
    /* ignore */
  }
  try {
    return JSON.stringify(value == null ? {} : value);
  } catch (e2) {
    return '{}';
  }
}

function MC_Obs_now_() {
  try {
    if (typeof cbvCoreV2IsoNow_ === 'function') return cbvCoreV2IsoNow_();
  } catch (e0) {
    /* ignore */
  }
  try {
    if (typeof MC_now_ === 'function') return MC_now_();
  } catch (e1) {
    /* ignore */
  }
  try {
    return new Date().toISOString();
  } catch (e2) {
    return String(new Date());
  }
}

function MC_Obs_user_() {
  try {
    var email = String(Session.getActiveUser().getEmail() || '').trim();
    if (email) return email;
  } catch (e0) {
    /* ignore */
  }
  return 'SYSTEM';
}
