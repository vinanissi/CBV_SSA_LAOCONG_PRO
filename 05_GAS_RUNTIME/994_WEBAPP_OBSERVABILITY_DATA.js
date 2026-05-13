/**
 * PHASE_92 — WebApp Observability — Data
 *
 * Operational Observability Layer (read-first).
 *
 * Public functions:
 *   - CbvWebAppObservability_getRuntimeHealth()
 *   - CbvWebAppObservability_getRecentReports(options)
 *   - CbvWebAppObservability_getReportDetail(reportId)
 *   - CbvWebAppObservability_getTraceSummary(options)
 *   - CbvWebAppObservability_validate()
 *
 * Read-first only. No mutation. No delete. No edit. No auto-heal / auto-resolve
 * / auto-escalate. No production claim.
 */

var CBV_WEBAPP_OBSERVABILITY_PHASE_ID = 'PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER';
var CBV_WEBAPP_OBSERVABILITY_CONTRACT_VERSION = 'CBV_TCS_V1';
var CBV_WEBAPP_OBSERVABILITY_DEFAULT_REPORTS_LIMIT = 50;

/**
 * Catalog of known Test Console functions per CBV phase. The data layer probes
 * each entry by name only — it NEVER runs the test console (running tests is
 * a write-ish operational action; observability stays read-first).
 */
var CBV_WEBAPP_OBSERVABILITY_PHASE_CATALOG = [
  { phase: 'PHASE_85_UNIFIED_UI_CONTRACT', label: 'Phase 85 — UI Contract', fn: 'CbvUiContract_healthCheck' },
  { phase: 'PHASE_86_UI_CONTRACT_PILOT_BINDING', label: 'Phase 86 — Pilot Binding', fn: 'CbvUiPilotBinding_healthCheck' },
  { phase: 'PHASE_87_APPSHEET_PILOT_SETUP_BINDING', label: 'Phase 87 — AppSheet Pilot Setup', fn: 'CbvAppSheetPilot_healthCheck' },
  { phase: 'PHASE_88_FE_ARCHITECTURE_REBALANCE_CLOSEOUT', label: 'Phase 88 — FE Architecture', fn: 'CbvFeArchitecture_TestConsole_run', propKey: 'CBV_FE_ARCH_TC_LAST_REPORT_JSON' },
  { phase: 'PHASE_89_WEBAPP_OPERATIONAL_WORKSPACE_SKELETON', label: 'Phase 89 — WebApp Workspace', fn: 'CbvWebAppWorkspace_TestConsole_run', propKey: 'CBV_WEBAPP_WS_TC_LAST_REPORT_JSON' },
  { phase: 'PHASE_90_WEBAPP_WORKSPACE_PILOT_PAGES_DATA_BINDING', label: 'Phase 90 — WebApp Pilot Pages', fn: 'CbvWebAppPilot_TestConsole_run', propKey: 'CBV_WEBAPP_PILOT_TC_LAST_REPORT_JSON' },
  { phase: 'PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES', label: 'Phase 91 — Timeline / Kanban', fn: 'CbvWebAppTimelineKanban_TestConsole_run', propKey: 'CBV_WEBAPP_TLK_TC_LAST_REPORT_JSON' },
  { phase: 'PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER', label: 'Phase 92 — Observability', fn: 'CbvWebAppObservability_TestConsole_run', propKey: 'CBV_WEBAPP_OBS_TC_LAST_REPORT_JSON' }
];

/* ------------------------------------------------------------------ */
/* Envelope + safe helpers                                             */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability__out_(ok, data, warnings, errors) {
  return {
    ok: ok === true,
    data: data || null,
    warnings: warnings || [],
    errors: errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CbvWebAppObservability__sheetByName_(name) {
  try {
    if (typeof SpreadsheetApp === 'undefined') {
      return { ok: false, sheet: null, warning: 'SpreadsheetApp unavailable (non-GAS context).' };
    }
    var ss = SpreadsheetApp.getActive();
    var sh = ss ? ss.getSheetByName(String(name || '').trim()) : null;
    if (!sh) return { ok: false, sheet: null, warning: 'Missing sheet: ' + name };
    return { ok: true, sheet: sh, warning: '' };
  } catch (e) {
    return { ok: false, sheet: null, warning: 'Sheet access error: ' + (e && e.message ? e.message : String(e)) };
  }
}

function CbvWebAppObservability__readDocProperty_(key) {
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return null;
    var raw = PropertiesService.getDocumentProperties().getProperty(String(key || ''));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function CbvWebAppObservability__listDocPropertyKeys_() {
  try {
    if (typeof PropertiesService === 'undefined' || !PropertiesService.getDocumentProperties) return [];
    return PropertiesService.getDocumentProperties().getKeys() || [];
  } catch (e) {
    return [];
  }
}

function CbvWebAppObservability__toTime_(v) {
  if (!v) return 0;
  if (v instanceof Date) return v.getTime();
  var d = new Date(v);
  var t = d.getTime();
  return isNaN(t) ? 0 : t;
}

function CbvWebAppObservability__severityFromStatus_(status) {
  var s = String(status || '').toUpperCase();
  if (s === 'FAIL') return 'CRITICAL';
  if (s === 'GO_WITH_WARNINGS') return 'WARNING';
  if (s === 'GO') return 'OK';
  return s ? 'WARNING' : 'WARNING';
}

/* ------------------------------------------------------------------ */
/* Phase report probes                                                 */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability__probePhase_(entry) {
  var fnExists = false;
  try { fnExists = typeof this[entry.fn] === 'function'; } catch (eF) { fnExists = false; }
  var report = entry.propKey ? CbvWebAppObservability__readDocProperty_(entry.propKey) : null;
  return {
    phase: entry.phase,
    label: entry.label,
    fn: entry.fn,
    propKey: entry.propKey || '',
    fnExists: fnExists === true,
    lastReport: report || null
  };
}

/* ------------------------------------------------------------------ */
/* Runtime health                                                      */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability_getRuntimeHealth() {
  var warnings = [];
  var errors = [];

  var probes = CBV_WEBAPP_OBSERVABILITY_PHASE_CATALOG.map(CbvWebAppObservability__probePhase_);

  var healthCards = probes.map(function(p) {
    var status = 'UNKNOWN';
    var severity = 'WARNING';
    var note = '';
    if (!p.fnExists) {
      status = 'NOT_LOADED';
      severity = 'WARNING';
      note = 'Test Console function not loaded in current GAS scope.';
    } else if (p.lastReport && p.lastReport.status) {
      status = String(p.lastReport.status);
      severity = String(p.lastReport.severity || CbvWebAppObservability__severityFromStatus_(status));
      note = p.lastReport.summary || '';
    } else {
      status = 'PENDING';
      severity = 'WARNING';
      note = 'Test Console available; no report stored yet (run it to populate).';
    }
    return {
      code: p.phase,
      label: p.label,
      status: status,
      severity: severity,
      value: p.lastReport && p.lastReport.checkedAt ? p.lastReport.checkedAt : '',
      note: note
    };
  });

  // Route summary
  var routeSummary = { total: 0, readFirst: 0, byMode: {}, byPageType: {}, missing: false };
  try {
    if (typeof CbvWebAppWorkspace_routeRegistry === 'function') {
      var routes = CbvWebAppWorkspace_routeRegistry() || [];
      routeSummary.total = routes.length;
      routes.forEach(function(r) {
        var m = String(r.mode || 'UNKNOWN');
        var pt = String(r.pageType || 'UNKNOWN');
        routeSummary.byMode[m] = (routeSummary.byMode[m] || 0) + 1;
        routeSummary.byPageType[pt] = (routeSummary.byPageType[pt] || 0) + 1;
        if (m === 'READ_FIRST') routeSummary.readFirst++;
      });
    } else {
      routeSummary.missing = true;
      warnings.push('CbvWebAppWorkspace_routeRegistry not available.');
    }
  } catch (eR) {
    routeSummary.missing = true;
    warnings.push('Route registry error: ' + (eR && eR.message ? eR.message : String(eR)));
  }

  // Report summary — count reports we can see (in-memory + SYSTEM_HEALTH_LOG).
  var reportSummary = { inMemoryCount: 0, systemHealthLogRows: 0, cbvTestReportsRows: 0, cbvTestReportsMissing: false };
  probes.forEach(function(p) { if (p.lastReport) reportSummary.inMemoryCount++; });

  var healthLog = CbvWebAppObservability__sheetByName_('SYSTEM_HEALTH_LOG');
  if (healthLog.ok) {
    try {
      var lr = healthLog.sheet.getLastRow();
      reportSummary.systemHealthLogRows = lr > 1 ? lr - 1 : 0;
    } catch (eSH) {
      warnings.push('SYSTEM_HEALTH_LOG read error: ' + (eSH && eSH.message ? eSH.message : String(eSH)));
    }
  } else {
    warnings.push(healthLog.warning);
  }

  var ctr = CbvWebAppObservability__sheetByName_('CBV_TEST_REPORTS');
  if (ctr.ok) {
    try {
      var lc = ctr.sheet.getLastRow();
      reportSummary.cbvTestReportsRows = lc > 1 ? lc - 1 : 0;
    } catch (eCR) {
      warnings.push('CBV_TEST_REPORTS read error: ' + (eCR && eCR.message ? eCR.message : String(eCR)));
    }
  } else {
    reportSummary.cbvTestReportsMissing = true;
    warnings.push('CBV_TEST_REPORTS sheet missing (Phase 92 treats this as a warning, not an error).');
  }

  var testConsoleSummary = {
    total: probes.length,
    loaded: probes.filter(function(p) { return p.fnExists; }).length,
    withReport: probes.filter(function(p) { return !!p.lastReport; }).length
  };

  // Roll up overall status: WORST severity among health cards.
  var rank = { OK: 0, WARNING: 1, ERROR: 2, CRITICAL: 3 };
  var worst = 'OK';
  healthCards.forEach(function(c) {
    if ((rank[c.severity] || 0) > (rank[worst] || 0)) worst = c.severity;
  });
  var overallStatus = worst === 'CRITICAL' || worst === 'ERROR' ? 'FAIL'
                    : (worst === 'WARNING' ? 'GO_WITH_WARNINGS' : 'GO');

  return CbvWebAppObservability__out_(true, {
    status: overallStatus,
    severity: worst,
    healthCards: healthCards,
    testConsoleSummary: testConsoleSummary,
    routeSummary: routeSummary,
    reportSummary: reportSummary,
    warnings: warnings,
    errors: errors
  }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* Recent reports (sheet + in-memory fallback)                         */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability__readSheetReports_(sheetName) {
  var got = CbvWebAppObservability__sheetByName_(sheetName);
  var out = { ok: got.ok, rows: [], warning: got.warning, source: sheetName };
  if (!got.ok) return out;

  try {
    var sh = got.sheet;
    var lastRow = sh.getLastRow();
    if (lastRow < 2) return out;
    var lastCol = sh.getLastColumn();
    var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    var n = Math.min(lastRow - 1, 200);
    // Read the latest n rows from the bottom.
    var startRow = Math.max(2, lastRow - n + 1);
    var values = sh.getRange(startRow, 1, lastRow - startRow + 1, lastCol).getValues();
    var idx = {};
    headers.forEach(function(h, i) { idx[String(h || '').trim()] = i; });

    var iId = (idx.RUN_ID !== undefined) ? idx.RUN_ID
            : (idx.REPORT_ID !== undefined) ? idx.REPORT_ID
            : (idx.ID !== undefined) ? idx.ID
            : undefined;
    var iAt = (idx.RUN_AT !== undefined) ? idx.RUN_AT
            : (idx.CHECKED_AT !== undefined) ? idx.CHECKED_AT
            : (idx.CREATED_AT !== undefined) ? idx.CREATED_AT
            : undefined;
    var iStatus = (idx.STATUS !== undefined) ? idx.STATUS
                : (idx.SYSTEM_HEALTH !== undefined) ? idx.SYSTEM_HEALTH
                : undefined;
    var iSeverity = (idx.SEVERITY !== undefined) ? idx.SEVERITY : undefined;
    var iPhase = (idx.PHASE !== undefined) ? idx.PHASE : undefined;
    var iSuite = (idx.TEST_SUITE !== undefined) ? idx.TEST_SUITE : undefined;
    var iRunBy = (idx.RUN_BY !== undefined) ? idx.RUN_BY
                : (idx.ACTOR_ID !== undefined) ? idx.ACTOR_ID
                : undefined;
    var iTrace = (idx.TRACE_ID !== undefined) ? idx.TRACE_ID : undefined;
    var iSummary = (idx.SUMMARY !== undefined) ? idx.SUMMARY
                : (idx.SUMMARY_JSON !== undefined) ? idx.SUMMARY_JSON
                : undefined;

    values.forEach(function(row) {
      out.rows.push({
        reportId: iId !== undefined ? String(row[iId] || '') : '',
        phase: iPhase !== undefined ? String(row[iPhase] || '') : (iSuite !== undefined ? String(row[iSuite] || '') : ''),
        status: iStatus !== undefined ? String(row[iStatus] || '') : '',
        severity: iSeverity !== undefined ? String(row[iSeverity] || '') : '',
        checkedAt: iAt !== undefined ? row[iAt] : '',
        runBy: iRunBy !== undefined ? String(row[iRunBy] || '') : '',
        traceId: iTrace !== undefined ? String(row[iTrace] || '') : '',
        summary: iSummary !== undefined ? String(row[iSummary] || '') : '',
        source: sheetName
      });
    });
  } catch (e) {
    out.warning = (out.warning || '') + ' / read error: ' + (e && e.message ? e.message : String(e));
  }
  return out;
}

function CbvWebAppObservability__readInMemoryReports_() {
  var rows = [];
  CBV_WEBAPP_OBSERVABILITY_PHASE_CATALOG.forEach(function(entry) {
    if (!entry.propKey) return;
    var rep = CbvWebAppObservability__readDocProperty_(entry.propKey);
    if (!rep) return;
    rows.push({
      reportId: rep.traceId || (entry.propKey + '@latest'),
      phase: rep.phase || entry.phase,
      status: rep.status || '',
      severity: rep.severity || CbvWebAppObservability__severityFromStatus_(rep.status),
      checkedAt: rep.checkedAt || '',
      runBy: rep.runBy || '',
      traceId: rep.traceId || '',
      summary: rep.summary || '',
      source: 'PropertiesService:' + entry.propKey
    });
  });
  return rows;
}

function CbvWebAppObservability_getRecentReports(options) {
  var warnings = [];
  var errors = [];
  var opts = options || {};
  var limit = opts.limit && opts.limit > 0 ? opts.limit : CBV_WEBAPP_OBSERVABILITY_DEFAULT_REPORTS_LIMIT;

  var all = [];
  var inMem = CbvWebAppObservability__readInMemoryReports_();
  all = all.concat(inMem);

  var testReports = CbvWebAppObservability__readSheetReports_('CBV_TEST_REPORTS');
  if (!testReports.ok) {
    warnings.push('CBV_TEST_REPORTS sheet missing — using in-memory + SYSTEM_HEALTH_LOG only (read-first, no auto-create).');
  } else {
    all = all.concat(testReports.rows);
  }

  var healthLog = CbvWebAppObservability__readSheetReports_('SYSTEM_HEALTH_LOG');
  if (!healthLog.ok) {
    warnings.push(healthLog.warning);
  } else {
    all = all.concat(healthLog.rows);
  }

  // Sort by checkedAt desc, fallback runId desc-ish (reverse insertion).
  all.sort(function(a, b) {
    var at = CbvWebAppObservability__toTime_(a.checkedAt);
    var bt = CbvWebAppObservability__toTime_(b.checkedAt);
    return bt - at;
  });

  var rows = all.slice(0, limit);
  return CbvWebAppObservability__out_(true, { count: rows.length, rows: rows }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* Report detail                                                       */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability_getReportDetail(reportId) {
  var warnings = [];
  var errors = [];
  var rid = String(reportId || '').trim();
  if (!rid) {
    warnings.push('reportId is empty.');
    return CbvWebAppObservability__out_(true, { reportId: '', reportText: '', reportJson: null, source: '' }, warnings, errors);
  }

  // 1) Try in-memory by phase prop-key match (e.g. exact propKey or traceId match).
  for (var i = 0; i < CBV_WEBAPP_OBSERVABILITY_PHASE_CATALOG.length; i++) {
    var entry = CBV_WEBAPP_OBSERVABILITY_PHASE_CATALOG[i];
    if (!entry.propKey) continue;
    var rep = CbvWebAppObservability__readDocProperty_(entry.propKey);
    if (!rep) continue;
    var matchPropKey = (rid === entry.propKey || rid === (entry.propKey + '@latest'));
    var matchTrace = (rep.traceId && String(rep.traceId) === rid);
    if (matchPropKey || matchTrace) {
      return CbvWebAppObservability__out_(true, {
        reportId: rid,
        reportText: rep.reportText || '',
        reportJson: rep,
        source: 'PropertiesService:' + entry.propKey
      }, warnings, errors);
    }
  }

  // 2) Try SYSTEM_HEALTH_LOG row by RUN_ID.
  var got = CbvWebAppObservability__sheetByName_('SYSTEM_HEALTH_LOG');
  if (got.ok) {
    try {
      var sh = got.sheet;
      var lastRow = sh.getLastRow();
      if (lastRow >= 2) {
        var lastCol = sh.getLastColumn();
        var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
        var idx = {};
        headers.forEach(function(h, n) { idx[String(h || '').trim()] = n; });
        var idCol = (idx.RUN_ID !== undefined) ? idx.RUN_ID + 1 : 1;
        var values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
        for (var k = 0; k < values.length; k++) {
          if (String(values[k][idCol - 1]) === rid) {
            var record = {};
            headers.forEach(function(h, ci) { record[String(h || '').trim()] = values[k][ci]; });
            return CbvWebAppObservability__out_(true, {
              reportId: rid,
              reportText: JSON.stringify(record, null, 2),
              reportJson: record,
              source: 'SYSTEM_HEALTH_LOG'
            }, warnings, errors);
          }
        }
      }
    } catch (eSH) {
      warnings.push('SYSTEM_HEALTH_LOG detail lookup error: ' + (eSH && eSH.message ? eSH.message : String(eSH)));
    }
  } else {
    warnings.push(got.warning);
  }

  warnings.push('Report not found: ' + rid);
  return CbvWebAppObservability__out_(true, { reportId: rid, reportText: '', reportJson: null, source: '' }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* Trace summary                                                       */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability_getTraceSummary(options) {
  var warnings = [];
  var errors = [];
  var opts = options || {};
  var limit = opts.limit && opts.limit > 0 ? opts.limit : 50;

  var rec = CbvWebAppObservability_getRecentReports({ limit: 200 });
  if (rec.warnings && rec.warnings.length) warnings = warnings.concat(rec.warnings);
  var rows = (rec.data && rec.data.rows) ? rec.data.rows : [];

  var seen = {};
  var traces = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var tid = String(r.traceId || '').trim();
    if (!tid) continue;
    if (seen[tid]) continue;
    seen[tid] = true;
    traces.push({
      traceId: tid,
      phase: r.phase || '',
      status: r.status || '',
      severity: r.severity || '',
      checkedAt: r.checkedAt || '',
      summary: r.summary || ''
    });
    if (traces.length >= limit) break;
  }

  return CbvWebAppObservability__out_(true, { count: traces.length, traces: traces }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* Validate                                                            */
/* ------------------------------------------------------------------ */

function CbvWebAppObservability_validate() {
  var warnings = [];
  var errors = [];

  var detail = {
    functions: {
      runtimeHealth: typeof CbvWebAppObservability_getRuntimeHealth === 'function',
      recentReports: typeof CbvWebAppObservability_getRecentReports === 'function',
      reportDetail: typeof CbvWebAppObservability_getReportDetail === 'function',
      traceSummary: typeof CbvWebAppObservability_getTraceSummary === 'function'
    },
    renderer: {
      runtimeHealth: typeof CbvWebAppObservability_renderRuntimeHealth === 'function',
      reportViewer: typeof CbvWebAppObservability_renderReportViewer === 'function'
    },
    sheets: {
      cbvTestReports: false,
      systemHealthLog: false,
      adminAuditLog: false
    },
    noMutationExposed: true,
    mutationProbe: [],
    mutationAllowlist: []
  };

  // Function presence
  if (!detail.functions.runtimeHealth) errors.push('CbvWebAppObservability_getRuntimeHealth not defined.');
  if (!detail.functions.recentReports) errors.push('CbvWebAppObservability_getRecentReports not defined.');
  if (!detail.functions.reportDetail) errors.push('CbvWebAppObservability_getReportDetail not defined.');
  if (!detail.functions.traceSummary) errors.push('CbvWebAppObservability_getTraceSummary not defined.');

  // Renderer presence
  if (!detail.renderer.runtimeHealth) warnings.push('CbvWebAppObservability_renderRuntimeHealth not loaded yet (warning during partial deploys).');
  if (!detail.renderer.reportViewer) warnings.push('CbvWebAppObservability_renderReportViewer not loaded yet (warning during partial deploys).');

  // Sheet probes (warning-only)
  var ctr = CbvWebAppObservability__sheetByName_('CBV_TEST_REPORTS');
  detail.sheets.cbvTestReports = ctr.ok;
  if (!ctr.ok) warnings.push('CBV_TEST_REPORTS sheet missing — read-first observability uses fallbacks (in-memory + SYSTEM_HEALTH_LOG).');

  var sh = CbvWebAppObservability__sheetByName_('SYSTEM_HEALTH_LOG');
  detail.sheets.systemHealthLog = sh.ok;
  if (!sh.ok) warnings.push(sh.warning);

  var aal = CbvWebAppObservability__sheetByName_('ADMIN_AUDIT_LOG');
  detail.sheets.adminAuditLog = aal.ok;
  if (!aal.ok) warnings.push(aal.warning);

  // ---------------------------------------------------------------------
  // Mutation-name probe (Phase 92-scoped, namespace + verb-at-start match).
  // Same pattern as Phase 91.1 — DO NOT scan unrelated global runtime.
  // ---------------------------------------------------------------------
  detail.mutationAllowlist = [
    'CbvWebAppObservability_getRuntimeHealth',
    'CbvWebAppObservability_getRecentReports',
    'CbvWebAppObservability_getReportDetail',
    'CbvWebAppObservability_getTraceSummary',
    'CbvWebAppObservability_validate',
    'CbvWebAppObservability_renderRuntimeHealth',
    'CbvWebAppObservability_renderReportViewer',
    'CbvWebAppObservability_renderHealthCard_',
    'CbvWebAppObservability_renderReportRow_',
    'CbvWebAppObservability_renderState_'
  ];
  var allowPatterns = [
    /State_?$/,
    /^CbvWebAppObservability__/,
    /^CbvWebAppObservability_TestConsole_/
  ];
  var verbRe = /^(set|update|resolve|complete|delete|save|mutate|assign|escalate|claim|drag|heal|repair|edit)[A-Z]/;

  function isMutationName(name) {
    if (typeof name !== 'string') return false;
    if (name.indexOf('CbvWebAppObservability_') !== 0) return false;
    if (detail.mutationAllowlist.indexOf(name) >= 0) return false;
    for (var i = 0; i < allowPatterns.length; i++) {
      if (allowPatterns[i].test(name)) return false;
    }
    var action = name.replace(/^CbvWebAppObservability_/, '').replace(/^_+/, '');
    return verbRe.test(action);
  }

  try {
    var globals = (typeof this !== 'undefined') ? this : {};
    var keys = Object.keys(globals || {});
    for (var k = 0; k < keys.length; k++) {
      var n = keys[k];
      if (isMutationName(n) && typeof globals[n] === 'function') {
        detail.noMutationExposed = false;
        detail.mutationProbe.push(n);
      }
    }
  } catch (eProbe) {
    warnings.push('Mutation probe skipped: ' + (eProbe && eProbe.message ? eProbe.message : String(eProbe)));
  }
  if (!detail.noMutationExposed) {
    errors.push('Phase 92 namespace exposes mutation-like functions: ' + detail.mutationProbe.join(', '));
  }

  var ok = errors.length === 0;
  return CbvWebAppObservability__out_(ok, detail, warnings, errors);
}
