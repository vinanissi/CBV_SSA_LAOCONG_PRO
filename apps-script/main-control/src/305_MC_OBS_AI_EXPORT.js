/**
 * MAIN_CONTROL_OBS — AI Diagnostic Export.
 *
 * Public:
 * - MC_Obs_generateAiDiagnosticExport()
 * - MC_Obs_buildAiExportJson()
 * - MC_Obs_buildAiExportMarkdown()
 */

function MC_Obs_generateAiDiagnosticExport() {
  try {
    var runId = '';
    try { runId = typeof MC_Obs_makeId_ === 'function' ? MC_Obs_makeId_('RUN') : ''; } catch (e0) { runId = ''; }
    if (!runId) runId = 'RUN_' + String(new Date().getTime());

    var jsonObj = MC_Obs_buildAiExportJson();
    var md = MC_Obs_buildAiExportMarkdownFromJson_(jsonObj);

    var file = MC_Obs_tryCreateDriveExportFiles_(runId, jsonObj, md);

    var row = {
      RUN_ID: runId,
      EXPORT_TYPE: 'AI_DIAGNOSTIC',
      STATUS: 'OK',
      EXPORT_JSON: jsonObj,
      EXPORT_MARKDOWN: md,
      FILE_ID: file.fileId || '',
      FILE_URL: file.fileUrl || '',
      NOTE: file.note || ''
    };

    var appended = null;
    try {
      if (typeof MC_Obs_appendRow_ === 'function') {
        appended = MC_Obs_appendRow_(MC_OBS_SCHEMA_.SHEETS.AI_EXPORT, row);
      } else if (typeof MC_Obs_appendTestRun === 'function') {
        // Fallback should never happen if 302 is loaded; keep safe.
        appended = MC_Obs_stdResponse_(false, 'MC_OBS_WRITER_MISSING', 'MC_Obs_appendRow_ missing', {}, { code: 'WRITER_MISSING', message: 'MC_Obs_appendRow_ missing', stack: '' });
      }
    } catch (e1) {
      appended = MC_Obs_stdResponse_(false, 'MC_OBS_AI_EXPORT_APPEND_EXCEPTION', String(e1 && e1.message ? e1.message : e1), {}, { code: 'EXCEPTION', message: String(e1 && e1.message ? e1.message : e1), stack: String(e1 && e1.stack ? e1.stack : '') });
    }

    // Refresh dashboard best-effort (operator-first).
    try {
      if (typeof MC_Obs_refreshDashboard === 'function') MC_Obs_refreshDashboard();
    } catch (dErr) {
      /* swallow */
    }

    return MC_Obs_stdResponse_(true, 'MC_OBS_AI_EXPORT_OK', 'OK', {
      runId: runId,
      sheetAppend: appended,
      file: file,
      export: { jsonBytes: MC_Obs_lenSafe_(MC_Obs_safeJsonString_(jsonObj)), markdownBytes: MC_Obs_lenSafe_(md) }
    }, null);
  } catch (e) {
    return MC_Obs_stdResponse_(false, 'MC_OBS_AI_EXPORT_EXCEPTION', String(e && e.message ? e.message : e), {}, { code: 'EXCEPTION', message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function MC_Obs_buildAiExportJson() {
  try {
    var nowIso = MC_Obs_isoNowSafe_();
    var by = MC_Obs_actorSafe_();

    var health = null;
    try {
      if (typeof MC_Obs_healthCheck === 'function') health = MC_Obs_healthCheck();
    } catch (e0) {
      health = MC_Obs_stdResponse_(false, 'MC_OBS_HEALTH_EXCEPTION', String(e0 && e0.message ? e0.message : e0), {}, { code: 'EXCEPTION', message: String(e0 && e0.message ? e0.message : e0), stack: '' });
    }

    var controlPlane = {};
    try {
      if (typeof MC_healthControlPlane === 'function') controlPlane.health = MC_healthControlPlane();
    } catch (e1) {
      controlPlane.health = MC_Obs_stdResponse_(false, 'CONTROL_PLANE_HEALTH_EXCEPTION', String(e1 && e1.message ? e1.message : e1), {}, { code: 'EXCEPTION', message: String(e1 && e1.message ? e1.message : e1), stack: '' });
    }
    try {
      if (typeof MC_Schema_report === 'function') controlPlane.schemaReport = MC_Schema_report();
    } catch (e2) {
      controlPlane.schemaReport = MC_Obs_stdResponse_(false, 'CONTROL_PLANE_SCHEMA_REPORT_EXCEPTION', String(e2 && e2.message ? e2.message : e2), {}, { code: 'EXCEPTION', message: String(e2 && e2.message ? e2.message : e2), stack: '' });
    }

    var latestTestRun = MC_Obs_readLatestTestRun_();
    var findings = MC_Obs_readRecentRows_(MC_OBS_SCHEMA_.SHEETS.FINDING, 20);
    var auditSample = MC_Obs_readRecentRows_(MC_OBS_SCHEMA_.SHEETS.AUDIT, 20);
    var eventTraceSample = MC_Obs_readRecentRows_(MC_OBS_SCHEMA_.SHEETS.EVENT_TRACE, 20);
    var runtimeMetrics = MC_Obs_readRecentRows_(MC_OBS_SCHEMA_.SHEETS.RUNTIME_METRIC, 30);

    var recommendations = MC_Obs_buildRecommendations_(health, latestTestRun, findings);

    return {
      meta: {
        moduleCode: 'MAIN_CONTROL',
        generatedAt: nowIso,
        generatedBy: by
      },
      health: health || {},
      controlPlane: controlPlane,
      latestTestRun: latestTestRun || {},
      findings: findings || [],
      auditSample: auditSample || [],
      eventTraceSample: eventTraceSample || [],
      runtimeMetrics: runtimeMetrics || [],
      recommendations: recommendations || []
    };
  } catch (e) {
    return {
      meta: { moduleCode: 'MAIN_CONTROL', generatedAt: MC_Obs_isoNowSafe_(), generatedBy: MC_Obs_actorSafe_() },
      health: {},
      controlPlane: {},
      latestTestRun: {},
      findings: [],
      auditSample: [],
      eventTraceSample: [],
      runtimeMetrics: [],
      recommendations: [{ code: 'AI_EXPORT_BUILD_FAILED', severity: 'ERROR', message: String(e && e.message ? e.message : e) }]
    };
  }
}

function MC_Obs_buildAiExportMarkdown() {
  try {
    var jsonObj = MC_Obs_buildAiExportJson();
    return MC_Obs_buildAiExportMarkdownFromJson_(jsonObj);
  } catch (e) {
    return '# MAIN_CONTROL — AI Diagnostic Export\n\nFailed to build export: ' + String(e && e.message ? e.message : e);
  }
}

// ----------------- Private helpers -----------------

function MC_Obs_buildAiExportMarkdownFromJson_(obj) {
  var o = obj || {};
  var lines = [];
  lines.push('# MAIN_CONTROL — AI Diagnostic Export');
  lines.push('');
  lines.push('GeneratedAt: ' + String(o.meta && o.meta.generatedAt ? o.meta.generatedAt : ''));
  lines.push('GeneratedBy: ' + String(o.meta && o.meta.generatedBy ? o.meta.generatedBy : ''));
  lines.push('');

  // Health summary.
  var h = o.health || {};
  var hs = h && h.data && h.data.summary ? h.data.summary : null;
  lines.push('## Health');
  lines.push('- code: ' + String(h.code || ''));
  lines.push('- ok: ' + String(!!h.ok));
  if (hs) lines.push('- summary: info=' + hs.info + ' warn=' + hs.warn + ' error=' + hs.error + ' blocker=' + hs.blocker);
  lines.push('');

  // Latest test run.
  lines.push('## Latest Test Run');
  if (o.latestTestRun && o.latestTestRun.ok) {
    lines.push('- runId: ' + String(o.latestTestRun.runId || ''));
    lines.push('- status: ' + String(o.latestTestRun.status || ''));
    lines.push('- startedAt: ' + String(o.latestTestRun.startedAt || ''));
    lines.push('- finishedAt: ' + String(o.latestTestRun.finishedAt || ''));
  } else {
    lines.push('- (no test run found)');
  }
  lines.push('');

  // Findings.
  lines.push('## Findings (recent)');
  var f = o.findings || [];
  if (!f.length) lines.push('- (none)');
  else {
    var i;
    for (i = 0; i < Math.min(f.length, 20); i++) {
      var row = f[i] || {};
      lines.push('- [' + String(row.SEVERITY || row.severity || '') + '] ' + String(row.SOURCE_CODE || row.code || '') + ' — ' + String(row.MESSAGE || row.message || ''));
    }
  }
  lines.push('');

  // Recommendations.
  lines.push('## Recommendations');
  var r = o.recommendations || [];
  if (!r.length) lines.push('- (none)');
  else {
    var j;
    for (j = 0; j < r.length; j++) {
      lines.push('- [' + String(r[j].severity || '') + '] ' + String(r[j].code || '') + ' — ' + String(r[j].message || ''));
    }
  }
  lines.push('');

  // Raw JSON for copy/paste.
  lines.push('## Raw JSON (copy/paste)');
  lines.push('```json');
  lines.push(MC_Obs_safeJsonString_(o));
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}

function MC_Obs_tryCreateDriveExportFiles_(runId, jsonObj, markdown) {
  // Optional: create Drive files if folder id is configured.
  // No hardcode. Property key is local to OBS.
  var folderId = '';
  try {
    folderId = String(PropertiesService.getScriptProperties().getProperty('MC_OBS_AI_EXPORT_FOLDER_ID') || '').trim();
  } catch (e0) {
    folderId = '';
  }
  if (!folderId) return { fileId: '', fileUrl: '', note: 'No folder configured (MC_OBS_AI_EXPORT_FOLDER_ID); sheet-only export' };

  try {
    var folder = DriveApp.getFolderById(folderId);
    if (!folder) return { fileId: '', fileUrl: '', note: 'Folder not accessible; sheet-only export' };

    var base = 'MC_OBS_AI_EXPORT_' + String(runId || 'RUN') + '_' + String(new Date().getTime());
    var jsonFile = folder.createFile(base + '.json', MC_Obs_safeJsonString_(jsonObj), MimeType.JSON);
    var mdFile = folder.createFile(base + '.md', String(markdown || ''), MimeType.PLAIN_TEXT);

    return {
      fileId: String(jsonFile.getId() || ''),
      fileUrl: String(jsonFile.getUrl() || ''),
      note: 'Created Drive files: ' + String(jsonFile.getName()) + ', ' + String(mdFile.getName())
    };
  } catch (e1) {
    return { fileId: '', fileUrl: '', note: 'Drive export failed; sheet-only export: ' + String(e1 && e1.message ? e1.message : e1) };
  }
}

function MC_Obs_readLatestTestRun_() {
  try {
    var rows = MC_Obs_readRecentRows_(MC_OBS_SCHEMA_.SHEETS.TEST_RUN, 5);
    if (!rows || !rows.length) return { ok: false, message: 'No rows' };
    // Choose last non-empty RUN_ID.
    var i;
    for (i = rows.length - 1; i >= 0; i--) {
      var r = rows[i] || {};
      var id = String(r.RUN_ID || '').trim();
      if (!id) continue;
      return {
        ok: true,
        runId: id,
        status: String(r.STATUS || ''),
        runType: String(r.RUN_TYPE || ''),
        startedAt: String(r.STARTED_AT || ''),
        finishedAt: String(r.FINISHED_AT || ''),
        durationMs: r.DURATION_MS != null ? r.DURATION_MS : '',
        summaryJson: r.SUMMARY_JSON || ''
      };
    }
    return { ok: false, message: 'No RUN_ID found' };
  } catch (e) {
    return { ok: false, message: String(e && e.message ? e.message : e) };
  }
}

function MC_Obs_readRecentRows_(sheetName, limit) {
  var n = Number(limit || 10);
  if (!(n > 0)) n = 10;
  try {
    if (!sheetName) return [];
    var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
    if (!opened.ok) return [];
    var ss = opened.ss;
    var sh = null;
    try { sh = ss.getSheetByName(sheetName); } catch (e0) { sh = null; }
    if (!sh) return [];
    var lastRow = sh.getLastRow();
    if (lastRow < 2) return [];

    // Read header map.
    var map = null;
    try {
      if (typeof cbvCoreV2ReadHeaderMap_ === 'function') map = cbvCoreV2ReadHeaderMap_(sh);
    } catch (e1) {
      map = null;
    }
    if (!map) {
      map = {};
      var headers = (typeof MC_Obs_getHeaders_ === 'function') ? MC_Obs_getHeaders_(sh) : [];
      var i;
      for (i = 0; i < headers.length; i++) map[String(headers[i] || '').trim()] = i + 1;
    }

    var cols = sh.getLastColumn();
    var start = Math.max(2, lastRow - n + 1);
    var values = sh.getRange(start, 1, lastRow - start + 1, cols).getValues();

    // Build ordered header list by col index.
    var colToHeader = [];
    var k;
    for (k in map) {
      if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
      var c = Number(map[k]);
      if (c > 0) colToHeader[c] = k;
    }

    var out = [];
    var r;
    for (r = 0; r < values.length; r++) {
      var row = values[r] || [];
      var obj = {};
      var c2;
      for (c2 = 1; c2 <= cols; c2++) {
        var h = colToHeader[c2];
        if (!h) continue;
        obj[h] = row[c2 - 1];
      }
      out.push(obj);
    }
    return out;
  } catch (e) {
    return [];
  }
}

function MC_Obs_buildRecommendations_(health, latestTestRun, findings) {
  var rec = [];
  try {
    var h = health || {};
    var hs = h && h.data && h.data.summary ? h.data.summary : null;
    if (hs && hs.blocker > 0) {
      rec.push({ code: 'FIX_BLOCKERS_FIRST', severity: 'BLOCKER', message: 'Resolve blocker findings in OBS health before operating MAIN_CONTROL WebApp.' });
    }
    if (hs && !hs.blocker && (hs.error > 0 || hs.warn > 0)) {
      rec.push({ code: 'REVIEW_WARNINGS', severity: 'WARN', message: 'Review warnings/errors in OBS health; run MC_Obs_runSelfTest after bootstrap.' });
    }
  } catch (e0) {
    /* ignore */
  }
  try {
    if (latestTestRun && latestTestRun.ok && String(latestTestRun.status || '').toUpperCase() !== 'OK') {
      rec.push({ code: 'SELF_TEST_NOT_OK', severity: 'WARN', message: 'Latest self test is not OK. Inspect MC_OBS_TEST_RESULT and MC_OBS_FINDING.' });
    }
  } catch (e1) {
    /* ignore */
  }
  try {
    var f = findings || [];
    if (f && f.length > 0) rec.push({ code: 'TRIAGE_FINDINGS', severity: 'INFO', message: 'Triage recent findings; resolve or mark resolved to reduce noise.' });
  } catch (e2) {
    /* ignore */
  }
  return rec;
}

function MC_Obs_safeJsonString_(obj) {
  try {
    if (typeof MC_json_ === 'function') return MC_json_(obj);
  } catch (e0) {
    /* ignore */
  }
  try {
    if (typeof cbvCoreV2SafeStringify_ === 'function') return cbvCoreV2SafeStringify_(obj);
  } catch (e1) {
    /* ignore */
  }
  try {
    return JSON.stringify(obj == null ? {} : obj, null, 2);
  } catch (e2) {
    return '{}';
  }
}

function MC_Obs_lenSafe_(s) {
  try {
    return String(s || '').length;
  } catch (e) {
    return 0;
  }
}

function MC_Obs_isoNowSafe_() {
  try {
    if (typeof MC_now_ === 'function') return MC_now_();
  } catch (e0) {
    /* ignore */
  }
  try {
    return new Date().toISOString();
  } catch (e1) {
    return String(new Date());
  }
}

function MC_Obs_actorSafe_() {
  try {
    var email = String(Session.getActiveUser().getEmail() || '').trim();
    if (email) return email;
  } catch (e0) {
    /* ignore */
  }
  return 'SYSTEM';
}

