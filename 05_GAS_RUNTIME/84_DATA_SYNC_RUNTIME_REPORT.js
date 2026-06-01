/**
 * CBV_DATA_SYNC_RUNTIME v1 — Runtime report layer (PHASE_DSR_06_RUNTIME_REPORT).
 *
 * Read-only aggregation from DSR runtime sheets; append-only report/log/audit.
 * No sync, backup, diff apply, triggers, or business sheet writes.
 */

var CBV_DSR_RUNTIME_REPORT_VERSION = '1.5.0-runtime-report';
var CBV_DSR_RUNTIME_REPORT_CONTRACT = 'DSR_RUNTIME_REPORT_V1';

var CBV_DSR_REPORT_READ_LIMITS = {
  LOG: 100,
  AUDIT: 100,
  REPORT: 50,
  PLAN: 50,
  BACKUP: 50
};

function cbvDsrReadSheetTailRows_(sheet, maxRows, numCols) {
  if (!sheet) return [];
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var cols = numCols || sheet.getLastColumn();
  if (cols < 1) return [];
  var count = Math.min(maxRows, last - 1);
  var start = last - count + 1;
  return sheet.getRange(start, 1, count, cols).getValues();
}

function cbvDsrRowsToObjects_(rows, headers) {
  var out = [];
  (rows || []).forEach(function (row) {
    var obj = {};
    headers.forEach(function (h, i) {
      obj[h] = row[i] == null ? '' : row[i];
    });
    out.push(obj);
  });
  return out;
}

function cbvDsrReadRecentLogRows_(ss, limit) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.LOG);
  var rows = cbvDsrReadSheetTailRows_(sheet, limit || CBV_DSR_REPORT_READ_LIMITS.LOG, 9);
  return cbvDsrRowsToObjects_(rows, CBV_DSR_HEADERS.SYNC_LOG);
}

function cbvDsrReadRecentAuditRows_(ss, limit) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.AUDIT);
  var rows = cbvDsrReadSheetTailRows_(sheet, limit || CBV_DSR_REPORT_READ_LIMITS.AUDIT, 11);
  return cbvDsrRowsToObjects_(rows, CBV_DSR_HEADERS.SYNC_AUDIT);
}

function cbvDsrReadRecentReportRows_(ss, limit) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.REPORT);
  var rows = cbvDsrReadSheetTailRows_(sheet, limit || CBV_DSR_REPORT_READ_LIMITS.REPORT, 10);
  return cbvDsrRowsToObjects_(rows, CBV_DSR_HEADERS.SYNC_REPORT);
}

function cbvDsrReadLatestDiffPlan_(ss, limit) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.PLAN);
  var rows = cbvDsrReadSheetTailRows_(sheet, limit || CBV_DSR_REPORT_READ_LIMITS.PLAN, 12);
  return cbvDsrRowsToObjects_(rows, CBV_DSR_HEADERS.SYNC_PLAN);
}

function cbvDsrReadLatestBackupIndex_(ss, limit) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.BACKUP_INDEX);
  var rows = cbvDsrReadSheetTailRows_(sheet, limit || CBV_DSR_REPORT_READ_LIMITS.BACKUP, 9);
  return cbvDsrRowsToObjects_(rows, CBV_DSR_HEADERS.SYNC_BACKUP_INDEX);
}

function cbvDsrBuildRuntimeMetrics_(data) {
  var logs = data.logs || [];
  var audits = data.audits || [];
  var reports = data.reports || [];
  var plans = data.plans || [];
  var backups = data.backups || [];

  var recentSuccess = 0;
  var recentWarning = 0;
  var recentError = 0;

  logs.forEach(function (l) {
    var level = String(l.LEVEL || '').toUpperCase();
    var status = String(l.STATUS || '').toUpperCase();
    if (level === 'ERROR' || status.indexOf('FAIL') >= 0 || status.indexOf('ERROR') >= 0) recentError++;
    else if (level === 'WARNING' || status.indexOf('WARN') >= 0) recentWarning++;
    else recentSuccess++;
  });

  var latestReport = reports.length ? reports[reports.length - 1] : null;
  var latestLog = logs.length ? logs[logs.length - 1] : null;

  return {
    totalLogEntries: logs.length,
    totalAuditEntries: audits.length,
    totalRuntimeReports: reports.length,
    totalDiffPlanEntries: plans.length,
    totalBackupEntries: backups.length,
    recentSuccessCount: recentSuccess,
    recentWarningCount: recentWarning,
    recentErrorCount: recentError,
    latestRunId: latestReport ? String(latestReport.RUN_ID || '') : (latestLog ? String(latestLog.RUN_ID || '') : ''),
    latestRunAt: latestReport ? String(latestReport.REPORT_AT || '') : (latestLog ? String(latestLog.LOG_AT || '') : ''),
    latestResult: latestReport ? String(latestReport.RESULT || '') : '',
    latestPhase: latestReport ? String(latestReport.PHASE || '') : '',
    latestNextStep: latestReport ? String(latestReport.NEXT_STEP || '') : ''
  };
}

function cbvDsrBuildRunHistorySummary_(logs, reports) {
  var history = [];
  (reports || []).slice(-20).forEach(function (r) {
    history.push({
      at: String(r.REPORT_AT || ''),
      runId: String(r.RUN_ID || ''),
      phase: String(r.PHASE || ''),
      action: 'REPORT',
      result: String(r.RESULT || ''),
      summary: String(r.SUMMARY || '').substring(0, 120)
    });
  });
  (logs || []).slice(-20).forEach(function (l) {
    history.push({
      at: String(l.LOG_AT || ''),
      runId: String(l.RUN_ID || ''),
      phase: String(l.PHASE || ''),
      action: String(l.ACTION || ''),
      result: String(l.STATUS || ''),
      summary: String(l.MESSAGE || '').substring(0, 120)
    });
  });
  history.sort(function (a, b) {
    return String(a.at).localeCompare(String(b.at));
  });
  return history.slice(-30);
}

function cbvDsrBuildWarningErrorSummary_(logs, reports) {
  var warnings = [];
  var errors = [];
  (logs || []).forEach(function (l) {
    if (String(l.LEVEL || '').toUpperCase() === 'WARNING') {
      warnings.push({ at: l.LOG_AT, runId: l.RUN_ID, message: l.MESSAGE, action: l.ACTION });
    }
    if (String(l.LEVEL || '').toUpperCase() === 'ERROR') {
      errors.push({ at: l.LOG_AT, runId: l.RUN_ID, message: l.MESSAGE, action: l.ACTION });
    }
  });
  (reports || []).forEach(function (r) {
    try {
      var wj = r.WARNINGS_JSON ? JSON.parse(String(r.WARNINGS_JSON)) : [];
      if (Array.isArray(wj)) wj.forEach(function (w) {
        warnings.push({ at: r.REPORT_AT, runId: r.RUN_ID, message: String(w) });
      });
      var ej = r.ERRORS_JSON ? JSON.parse(String(r.ERRORS_JSON)) : [];
      if (Array.isArray(ej)) ej.forEach(function (e) {
        errors.push({ at: r.REPORT_AT, runId: r.RUN_ID, message: String(e) });
      });
    } catch (eParse) { /* skip malformed */ }
  });
  return {
    warningCount: warnings.length,
    errorCount: errors.length,
    warnings: warnings.slice(-25),
    errors: errors.slice(-25)
  };
}

function cbvDsrBuildAuditTimelineSummary_(audits) {
  return (audits || []).slice(-30).map(function (a) {
    return {
      at: String(a.AUDIT_AT || ''),
      runId: String(a.RUN_ID || ''),
      auditType: String(a.AUDIT_TYPE || ''),
      entityType: String(a.ENTITY_TYPE || ''),
      action: String(a.ACTION || ''),
      note: String(a.NOTE || '').substring(0, 160)
    };
  });
}

function cbvDsrCollectRuntimeReportData_(hostSs) {
  var configRead = cbvDsrReadConfig_(hostSs);
  var config = configRead.ok ? configRead.config : {};

  var logs = cbvDsrReadRecentLogRows_(hostSs, CBV_DSR_REPORT_READ_LIMITS.LOG);
  var audits = cbvDsrReadRecentAuditRows_(hostSs, CBV_DSR_REPORT_READ_LIMITS.AUDIT);
  var reports = cbvDsrReadRecentReportRows_(hostSs, CBV_DSR_REPORT_READ_LIMITS.REPORT);
  var plans = cbvDsrReadLatestDiffPlan_(hostSs, CBV_DSR_REPORT_READ_LIMITS.PLAN);
  var backups = cbvDsrReadLatestBackupIndex_(hostSs, CBV_DSR_REPORT_READ_LIMITS.BACKUP);

  var metrics = cbvDsrBuildRuntimeMetrics_({
    logs: logs,
    audits: audits,
    reports: reports,
    plans: plans,
    backups: backups
  });

  var wlPolicy = typeof cbvDsrValidateWhitelistSyncConfig_ === 'function'
    ? cbvDsrValidateWhitelistSyncConfig_(config)
    : { whitelistCount: 0, forbiddenPatternCount: 0, fullWorkbookSyncStatus: '', whitelistSyncRequired: false };
  metrics.whitelistCount = wlPolicy.whitelistCount || 0;
  metrics.forbiddenPatternCount = wlPolicy.forbiddenPatternCount || 0;
  metrics.fullWorkbookSyncStatus = wlPolicy.fullWorkbookSyncStatus || String(config.FULL_WORKBOOK_SYNC || '');
  metrics.whitelistSyncRequired = !!wlPolicy.whitelistSyncRequired;

  var selPolicy = typeof cbvDsrValidateSelectiveSyncConfig_ === 'function'
    ? cbvDsrValidateSelectiveSyncConfig_(config)
    : { selectionRequired: false, selectionSheet: '' };
  var selRead = typeof cbvDsrReadLatestSyncSelections_ === 'function'
    ? cbvDsrReadLatestSyncSelections_(hostSs)
    : { rows: [] };
  var approved = 0;
  var held = 0;
  var selSkipped = 0;
  var selBlocked = 0;
  (selRead.rows || []).forEach(function (row) {
    var d = String(row.OPERATOR_DECISION || '').toUpperCase();
    var st = String(row.APPLY_STATUS || '').toUpperCase();
    if (d === 'APPROVE' && st === 'READY_TO_APPLY') approved++;
    else if (d === 'HOLD') held++;
    else if (d === 'BLOCK') selBlocked++;
    else selSkipped++;
  });
  metrics.selectionRequired = !!selPolicy.selectionRequired;
  metrics.selectionSheet = selPolicy.selectionSheet || '';
  metrics.candidateSheetCount = selRead.rows.length;
  metrics.approvedSheetCount = approved;
  metrics.skippedSheetCount = selSkipped;
  metrics.heldSheetCount = held;
  metrics.blockedSheetCount = selBlocked;

  var lastBackup = backups.length ? backups[backups.length - 1] : null;
  var lastPlan = plans.length ? plans[plans.length - 1] : null;

  var currentStatus = {
    dsrVersion: String(config.DSR_VERSION || ''),
    sourceSpreadsheetId: String(config.SOURCE_SPREADSHEET_ID || ''),
    destinationSpreadsheetId: String(config.DESTINATION_SPREADSHEET_ID || ''),
    syncMode: String(config.SYNC_MODE || ''),
    safetyMode: String(config.SAFETY_MODE || ''),
    syncAllowed: String(config.SYNC_ALLOWED || 'FALSE'),
    latestConnectionCheck: String(config.LAST_CONNECTION_RESULT || '(none)'),
    latestBackupStatus: String(config.LAST_BACKUP_RESULT || '(none)'),
    latestDiffStatus: String(config.LAST_DIFF_RESULT || '(none)'),
    latestManualSyncStatus: String(config.LAST_SYNC_RESULT || '(none)'),
    latestBackupId: lastBackup ? String(lastBackup.BACKUP_ID || '') : '',
    latestDiffResult: String(config.LAST_DIFF_RESULT || ''),
    latestSyncResult: String(config.LAST_SYNC_RESULT || ''),
    fullWorkbookSyncStatus: String(config.FULL_WORKBOOK_SYNC || wlPolicy.fullWorkbookSyncStatus || ''),
    whitelistSyncRequired: String(config.WHITELIST_SYNC_REQUIRED || ''),
    selectiveSyncRequired: String(config.SELECTIVE_SYNC_REQUIRED || '')
  };

  return {
    config: config,
    whitelistPolicy: wlPolicy,
    selectivePolicy: selPolicy,
    logs: logs,
    audits: audits,
    reports: reports,
    plans: plans,
    backups: backups,
    metrics: metrics,
    currentStatus: currentStatus,
    runHistory: cbvDsrBuildRunHistorySummary_(logs, reports),
    warningErrorSummary: cbvDsrBuildWarningErrorSummary_(logs, reports),
    auditTimeline: cbvDsrBuildAuditTimelineSummary_(audits)
  };
}

function cbvDsrDetermineRuntimeReportResult_(data) {
  var logs = data.logs || [];
  var reports = data.reports || [];
  if (logs.length === 0 && reports.length === 0) {
    return { result: 'NO_RUNTIME_HISTORY', nextStep: 'Run Bootstrap, Connection Check, Backup, Diff, then re-generate report' };
  }

  var status = data.currentStatus || {};
  var wes = data.warningErrorSummary || {};
  var blocking = [
    'GUARD_BLOCKED', 'SYNC_FAILED', 'FAILED', 'DIFF_FAILED', 'DESTINATION_ERROR', 'SOURCE_ERROR'
  ];

  var latestSync = String(status.latestManualSyncStatus || '');
  var latestDiff = String(status.latestDiffStatus || '');
  if (blocking.indexOf(latestSync) >= 0 || blocking.indexOf(latestDiff) >= 0
      || latestDiff === 'REVIEW_REQUIRED') {
    return {
      result: 'ATTENTION_REQUIRED',
      nextStep: 'Review SYNC_PLAN and last SYNC_REPORT before sync apply'
    };
  }

  if ((wes.errorCount || 0) > 0) {
    return {
      result: 'ATTENTION_REQUIRED',
      nextStep: 'Resolve errors in SYNC_LOG / SYNC_REPORT'
    };
  }

  if ((wes.warningCount || 0) > 0) {
    return {
      result: 'READY_WITH_WARNINGS',
      nextStep: 'Review warnings; proceed when operator-ready'
    };
  }

  return {
    result: 'READY',
    nextStep: 'PHASE_DSR_07_TEST_CONSOLE — optional operator QA console'
  };
}

function cbvDsrAppendRuntimeReport_(hostSs, payload) {
  return cbvDsrAppendReport_(hostSs, payload);
}

function cbvDsrUpdateDashboardRuntimeReport_(hostSs, payload) {
  var sheet = hostSs.getSheetByName(CBV_DSR_SHEETS.DASHBOARD);
  if (!sheet) return { ok: false };
  var p = payload || {};
  var cs = p.currentStatus || {};
  var m = p.metrics || {};

  var updates = {
    'Runtime Status': 'Report: ' + p.result,
    'Last Run': 'Runtime report ' + (p.generatedAt || ''),
    'Next Action': p.nextStep || ''
  };

  var lastRow = sheet.getLastRow();
  var labels = lastRow >= 1 ? sheet.getRange(1, 1, lastRow, 1).getValues() : [];
  Object.keys(updates).forEach(function (label) {
    for (var i = 0; i < labels.length; i++) {
      if (String(labels[i][0] || '').trim() === label) {
        sheet.getRange(i + 1, 2).setValue(updates[label]);
        return;
      }
    }
  });

  cbvDsrUpsertDashboardLabel_(sheet, 'Runtime Report', 'Generated ' + (p.generatedAt || ''));
  cbvDsrUpsertDashboardLabel_(sheet, 'Last Report At', p.generatedAt || '');
  cbvDsrUpsertDashboardLabel_(sheet, 'Last Report Result', p.result || '');
  cbvDsrUpsertDashboardLabel_(sheet, 'Latest Run ID', m.latestRunId || p.runId || '');
  cbvDsrUpsertDashboardLabel_(sheet, 'Latest Phase', m.latestPhase || '');
  cbvDsrUpsertDashboardLabel_(sheet, 'Latest Backup Status', cs.latestBackupStatus || '');
  cbvDsrUpsertDashboardLabel_(sheet, 'Latest Diff Status', cs.latestDiffStatus || '');
  cbvDsrUpsertDashboardLabel_(sheet, 'Latest Sync Status', cs.latestManualSyncStatus || '');
  cbvDsrUpsertDashboardLabel_(sheet, 'Warnings', String((p.warningErrorSummary && p.warningErrorSummary.warningCount) || 0));
  cbvDsrUpsertDashboardLabel_(sheet, 'Errors', String((p.warningErrorSummary && p.warningErrorSummary.errorCount) || 0));
  cbvDsrUpsertDashboardLabel_(sheet, 'Next Recommended Action', p.nextStep || '');

  return { ok: true };
}

/**
 * Generate operational DSR runtime report (read-only sources, append-only outputs).
 */
function cbvDsrGenerateRuntimeReport() {
  var runId = cbvDsrRunId_();
  var actor = cbvDsrActor_();
  var generatedAt = cbvDsrIso_(cbvDsrNow_());
  var phase = 'PHASE_DSR_06_RUNTIME_REPORT';
  var hostSs = cbvDsrActiveSpreadsheet_();

  var out = {
    runId: runId,
    generatedAt: generatedAt,
    actor: actor,
    phase: phase,
    result: 'FAILED',
    summary: '',
    warnings: [],
    errors: [],
    nextStep: ''
  };

  try {
    if (!hostSs.getSheetByName(CBV_DSR_SHEETS.CONFIG)) {
      if (typeof cbvDsrBootstrapFoundation === 'function') cbvDsrBootstrapFoundation();
      else cbvDsrEnsureFoundationSheets_();
    } else {
      cbvDsrEnsureFoundationSheets_();
    }

    var data = cbvDsrCollectRuntimeReportData_(hostSs);
    var verdict = cbvDsrDetermineRuntimeReportResult_(data);
    out.result = verdict.result;
    out.nextStep = verdict.nextStep;

    var reportJson = {
      contractVersion: CBV_DSR_RUNTIME_REPORT_CONTRACT,
      phase: phase,
      generatedAt: generatedAt,
      runId: runId,
      result: out.result,
      metrics: data.metrics,
      currentStatus: data.currentStatus,
      runHistory: data.runHistory,
      warningErrorSummary: data.warningErrorSummary,
      auditTimeline: data.auditTimeline,
      whitelistPolicy: data.whitelistPolicy,
      selectivePolicy: data.selectivePolicy,
      selectionSummary: {
        candidateSheetCount: data.metrics.candidateSheetCount,
        approvedSheetCount: data.metrics.approvedSheetCount,
        skippedSheetCount: data.metrics.skippedSheetCount,
        heldSheetCount: data.metrics.heldSheetCount,
        blockedSheetCount: data.metrics.blockedSheetCount
      },
      nextStep: out.nextStep
    };

    out.summary = 'DSR runtime report: ' + out.result + ' — logs=' + data.metrics.totalLogEntries
      + ' audits=' + data.metrics.totalAuditEntries + ' reports=' + data.metrics.totalRuntimeReports;

    cbvDsrAppendLog_(hostSs, {
      runId: runId,
      logAt: generatedAt,
      level: out.result === 'FAILED' ? 'ERROR' : 'INFO',
      phase: phase,
      action: 'GENERATE_RUNTIME_REPORT',
      status: out.result,
      message: out.summary,
      detailJson: { metrics: data.metrics },
      actor: actor
    });

    cbvDsrAppendAudit_(hostSs, {
      runId: runId,
      auditType: 'RUNTIME_REPORT',
      entityType: 'DSR_RUNTIME',
      entityId: 'CBV_DATA_SYNC_RUNTIME',
      action: 'GENERATE',
      beforeJson: {},
      afterJson: { result: out.result, metrics: data.metrics },
      note: 'Operational runtime report — read-only aggregation',
      actor: actor
    });

    cbvDsrAppendRuntimeReport_(hostSs, {
      runId: runId,
      reportAt: generatedAt,
      phase: phase,
      result: out.result,
      summary: out.summary,
      warningsJson: (data.warningErrorSummary && data.warningErrorSummary.warnings) || [],
      errorsJson: (data.warningErrorSummary && data.warningErrorSummary.errors) || [],
      nextStep: out.nextStep,
      reportJson: reportJson
    });

    cbvDsrUpdateDashboardRuntimeReport_(hostSs, {
      runId: runId,
      generatedAt: generatedAt,
      result: out.result,
      nextStep: out.nextStep,
      metrics: data.metrics,
      currentStatus: data.currentStatus,
      warningErrorSummary: data.warningErrorSummary
    });

    cbvDsrUpsertConfigKey_(hostSs, 'DSR_VERSION', CBV_DSR_RUNTIME_REPORT_VERSION, actor);
  } catch (e) {
    out.result = 'FAILED';
    out.errors.push(String(e.message || e));
    out.summary = 'Runtime report generation failed';
    out.nextStep = 'Review error and re-run menu 8';
    try {
      cbvDsrAppendLog_(hostSs, {
        runId: runId,
        level: 'ERROR',
        phase: phase,
        action: 'GENERATE_RUNTIME_REPORT',
        status: 'FAILED',
        message: out.summary,
        detailJson: { error: out.errors },
        actor: actor
      });
    } catch (e2) { /* best effort */ }
  }

  return out;
}
