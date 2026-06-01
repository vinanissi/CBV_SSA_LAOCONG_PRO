/**
 * CBV_DATA_SYNC_RUNTIME v1 — Diff preview (PHASE_DSR_04_DIFF_PREVIEW).
 *
 * Structure-only comparison SOURCE ↔ DESTINATION.
 * No backup, sync apply, business data writes, triggers, or sheet deletion.
 */

var CBV_DSR_DIFF_VERSION = '1.3.0-diff-preview';

var CBV_DSR_DIFF_CONFIG_SEED = [
  { key: 'LAST_DIFF_AT', value: '', description: 'Last diff preview timestamp (ISO)' },
  { key: 'LAST_DIFF_RUN_ID', value: '', description: 'Last diff preview run ID' },
  { key: 'LAST_DIFF_RESULT', value: '', description: 'Last diff preview runtime status' }
];

var CBV_DSR_DIFF_SHEET_STATUS = {
  MATCH: 'MATCH',
  HEADER_MISMATCH: 'HEADER_MISMATCH',
  ROW_COUNT_DIFF: 'ROW_COUNT_DIFF',
  COLUMN_COUNT_DIFF: 'COLUMN_COUNT_DIFF',
  SOURCE_ONLY: 'SOURCE_ONLY',
  DEST_ONLY: 'DEST_ONLY',
  EMPTY_SOURCE: 'EMPTY_SOURCE',
  EMPTY_DEST: 'EMPTY_DEST'
};

function cbvDsrSeedDiffConfigPlaceholders_(ss, actor) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.CONFIG);
  if (!sheet) return { ok: false };
  var now = cbvDsrIso_(cbvDsrNow_());
  var seeded = [];
  CBV_DSR_DIFF_CONFIG_SEED.forEach(function (item) {
    if (cbvDsrFindConfigRowIndex_(sheet, item.key) >= 0) return;
    sheet.appendRow([item.key, item.value, item.description, now, actor]);
    seeded.push(item.key);
  });
  return { ok: true, seeded: seeded };
}

function cbvDsrShouldIncludeSheetInDiff_(name, role, config) {
  var n = String(name || '').trim();
  if (!n) return false;
  if (role === 'DESTINATION' && typeof cbvDsrIsBackupSheetName_ === 'function' && cbvDsrIsBackupSheetName_(n, config)) {
    return false;
  }
  if (typeof cbvDsrIsProtectedRuntimeSheet_ === 'function' && cbvDsrIsProtectedRuntimeSheet_(n, config)) {
    return false;
  }
  return true;
}

function cbvDsrCollectSheetNames_(spreadsheet, role, config) {
  var names = [];
  if (!spreadsheet) return names;
  spreadsheet.getSheets().forEach(function (sh) {
    var n = sh.getName();
    if (cbvDsrShouldIncludeSheetInDiff_(n, role, config)) names.push(n);
  });
  return names;
}

function cbvDsrCompareHeaders_(sourceSheet, destSheet) {
  var out = { match: true, headerStatus: 'MATCH', sourceHeaders: [], destHeaders: [], message: '' };
  if (!sourceSheet && !destSheet) {
    out.match = true;
    return out;
  }
  if (!sourceSheet || !destSheet) {
    out.match = false;
    out.headerStatus = 'N/A';
    return out;
  }
  var sCols = sourceSheet.getLastColumn();
  var dCols = destSheet.getLastColumn();
  var maxCols = Math.max(sCols, dCols, 0);
  if (maxCols === 0) {
    out.match = true;
    out.headerStatus = 'EMPTY';
    return out;
  }
  var sHdr = sCols > 0 ? sourceSheet.getRange(1, 1, 1, sCols).getValues()[0] : [];
  var dHdr = dCols > 0 ? destSheet.getRange(1, 1, 1, dCols).getValues()[0] : [];
  out.sourceHeaders = sHdr.map(function (c) { return String(c == null ? '' : c).trim(); });
  out.destHeaders = dHdr.map(function (c) { return String(c == null ? '' : c).trim(); });
  for (var i = 0; i < maxCols; i++) {
    var s = i < out.sourceHeaders.length ? out.sourceHeaders[i] : '';
    var d = i < out.destHeaders.length ? out.destHeaders[i] : '';
    if (s !== d) {
      out.match = false;
      out.headerStatus = 'MISMATCH';
      out.message = 'Header mismatch at column ' + (i + 1) + ': "' + s + '" vs "' + d + '"';
      return out;
    }
  }
  out.headerStatus = 'MATCH';
  return out;
}

function cbvDsrCompareDimensions_(sourceSheet, destSheet) {
  var sRows = sourceSheet ? sourceSheet.getLastRow() : 0;
  var sCols = sourceSheet ? sourceSheet.getLastColumn() : 0;
  var dRows = destSheet ? destSheet.getLastRow() : 0;
  var dCols = destSheet ? destSheet.getLastColumn() : 0;
  return {
    sourceRows: sRows,
    sourceCols: sCols,
    destRows: dRows,
    destCols: dCols,
    rowMatch: sRows === dRows,
    colMatch: sCols === dCols,
    emptySource: sRows < 1 && sCols < 1,
    emptyDest: dRows < 1 && dCols < 1
  };
}

function cbvDsrCompareSheet_(sheetName, sourceSs, destSs) {
  var sourceSheet = sourceSs ? sourceSs.getSheetByName(sheetName) : null;
  var destSheet = destSs ? destSs.getSheetByName(sheetName) : null;
  var dims = cbvDsrCompareDimensions_(sourceSheet, destSheet);
  var headers = cbvDsrCompareHeaders_(sourceSheet, destSheet);
  var status = CBV_DSR_DIFF_SHEET_STATUS.MATCH;
  var action = 'READY_FOR_SYNC';
  var messages = [];

  if (!sourceSheet && destSheet) {
    status = CBV_DSR_DIFF_SHEET_STATUS.DEST_ONLY;
    action = 'DEST_ONLY';
    return {
      sheetName: sheetName,
      status: status,
      action: action,
      headerStatus: 'N/A',
      sourceRows: 0,
      sourceCols: 0,
      destRows: dims.destRows,
      destCols: dims.destCols,
      message: 'Sheet exists only on DESTINATION'
    };
  }
  if (sourceSheet && !destSheet) {
    status = CBV_DSR_DIFF_SHEET_STATUS.SOURCE_ONLY;
    action = 'SOURCE_ONLY';
    return {
      sheetName: sheetName,
      status: status,
      action: action,
      headerStatus: 'N/A',
      sourceRows: dims.sourceRows,
      sourceCols: dims.sourceCols,
      destRows: 0,
      destCols: 0,
      message: 'Sheet exists only on SOURCE'
    };
  }
  if (dims.emptySource && !dims.emptyDest) {
    status = CBV_DSR_DIFF_SHEET_STATUS.EMPTY_SOURCE;
    action = 'REVIEW_REQUIRED';
    messages.push('SOURCE sheet empty');
  }
  if (dims.emptyDest && !dims.emptySource) {
    status = CBV_DSR_DIFF_SHEET_STATUS.EMPTY_DEST;
    action = 'REVIEW_REQUIRED';
    messages.push('DESTINATION sheet empty');
  }
  if (!dims.rowMatch) {
    status = CBV_DSR_DIFF_SHEET_STATUS.ROW_COUNT_DIFF;
    action = 'REVIEW_REQUIRED';
    messages.push('Row count: SOURCE=' + dims.sourceRows + ' DEST=' + dims.destRows);
  }
  if (!dims.colMatch) {
    if (status === CBV_DSR_DIFF_SHEET_STATUS.MATCH) status = CBV_DSR_DIFF_SHEET_STATUS.COLUMN_COUNT_DIFF;
    action = 'REVIEW_REQUIRED';
    messages.push('Column count: SOURCE=' + dims.sourceCols + ' DEST=' + dims.destCols);
  }
  if (!headers.match) {
    status = CBV_DSR_DIFF_SHEET_STATUS.HEADER_MISMATCH;
    action = 'REVIEW_REQUIRED';
    messages.push(headers.message || 'Header mismatch');
  }
  if (status === CBV_DSR_DIFF_SHEET_STATUS.MATCH && action !== 'REVIEW_REQUIRED') {
    action = 'READY_FOR_SYNC';
    messages.push('Structure match');
  } else if (action !== 'SOURCE_ONLY' && action !== 'DEST_ONLY') {
    action = 'REVIEW_REQUIRED';
  }

  return {
    sheetName: sheetName,
    status: status,
    action: action,
    headerStatus: headers.headerStatus,
    sourceRows: dims.sourceRows,
    sourceCols: dims.sourceCols,
    destRows: dims.destRows,
    destCols: dims.destCols,
    message: messages.join('; ')
  };
}

function cbvDsrCompareSpreadsheetStructure_(sourceSs, destSs, config) {
  var sourceNames = cbvDsrCollectSheetNames_(sourceSs, 'SOURCE', config);
  var destNames = cbvDsrCollectSheetNames_(destSs, 'DESTINATION', config);
  var union = {};
  sourceNames.forEach(function (n) { union[n] = true; });
  destNames.forEach(function (n) { union[n] = true; });
  var comparisons = [];
  Object.keys(union).sort().forEach(function (name) {
    comparisons.push(cbvDsrCompareSheet_(name, sourceSs, destSs));
  });
  return {
    sourceSheetCount: sourceNames.length,
    destSheetCount: destNames.length,
    comparisons: comparisons
  };
}

function cbvDsrBuildDiffPlan_(sourceSs, destSs, config) {
  return cbvDsrCompareSpreadsheetStructure_(sourceSs, destSs, config);
}

function cbvDsrAppendDiffPlan_(hostSs, runId, planAt, item) {
  var sheet = hostSs.getSheetByName(CBV_DSR_SHEETS.PLAN);
  if (!sheet) return { ok: false, error: 'SYNC_PLAN missing' };
  var destSheet = item.status === CBV_DSR_DIFF_SHEET_STATUS.SOURCE_ONLY ? '' : item.sheetName;
  var srcSheet = item.status === CBV_DSR_DIFF_SHEET_STATUS.DEST_ONLY ? '' : item.sheetName;
  sheet.appendRow([
    runId,
    planAt,
    srcSheet || item.sheetName,
    destSheet || item.sheetName,
    item.action || 'NO_ACTION',
    item.sourceRows != null ? item.sourceRows : '',
    item.sourceCols != null ? item.sourceCols : '',
    item.destRows != null ? item.destRows : '',
    item.destCols != null ? item.destCols : '',
    item.headerStatus || '',
    item.status || '',
    item.message || ''
  ]);
  return { ok: true };
}

function cbvDsrWriteDiffReport_(hostSs, payload) {
  var p = payload || {};
  var level = p.result === 'READY_FOR_SYNC' ? 'INFO'
    : (p.result === 'DIFF_FAILED' ? 'ERROR' : 'WARNING');

  cbvDsrAppendLog_(hostSs, {
    runId: p.runId,
    logAt: p.diffAt,
    level: level,
    phase: p.phase,
    action: 'DIFF_PREVIEW',
    status: p.result,
    message: p.summary || ('Diff preview: ' + p.result),
    detailJson: {
      matchCount: p.matchCount,
      mismatchCount: p.mismatchCount,
      comparisons: p.comparisons
    },
    actor: p.actor
  });

  cbvDsrAppendAudit_(hostSs, {
    runId: p.runId,
    auditType: 'DIFF_PREVIEW',
    entityType: 'DSR_DIFF',
    entityId: 'SOURCE_DEST_STRUCTURE',
    action: 'COMPARE',
    beforeJson: {},
    afterJson: { result: p.result, sheetsCompared: p.sheetsCompared },
    note: 'Structure-only diff — no data sync',
    actor: p.actor
  });

  cbvDsrAppendReport_(hostSs, {
    runId: p.runId,
    reportAt: p.diffAt,
    phase: p.phase,
    result: p.result,
    summary: p.summary || 'DSR diff preview',
    warningsJson: p.warnings || [],
    errorsJson: p.errors || [],
    nextStep: p.nextStep || '',
    reportJson: p
  });

  return { ok: true };
}

function cbvDsrUpdateDashboardDiffStatus_(hostSs, payload) {
  var sheet = hostSs.getSheetByName(CBV_DSR_SHEETS.DASHBOARD);
  if (!sheet) return { ok: false };
  var p = payload || {};

  var updates = {
    'Runtime Status': 'Diff: ' + p.result,
    'Last Run': 'Diff preview ' + (p.diffAt || '') + ' — ' + (p.sheetsCompared || 0) + ' sheets',
    'Configuration': 'SOURCE: ' + ((p.source && p.source.spreadsheetId) || 'n/a') + ' | DEST: ' + ((p.destination && p.destination.spreadsheetId) || 'n/a'),
    'Foundation Health': 'Match: ' + (p.matchCount || 0) + ' | Mismatch: ' + (p.mismatchCount || 0) + ' | Review: ' + (p.reviewRequiredCount || 0),
    'Next Action': p.nextStep || 'PHASE_DSR_05_MANUAL_SYNC_APPLY when REVIEW_REQUIRED cleared'
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

  cbvDsrUpsertDashboardLabel_(sheet, 'Last Diff Run', p.diffAt || '');
  cbvDsrUpsertDashboardLabel_(sheet, 'Source Status', p.source && p.source.ok ? 'OK — ' + p.source.title : 'Not connected');
  cbvDsrUpsertDashboardLabel_(sheet, 'Destination Status', p.destination && p.destination.ok ? 'OK — ' + p.destination.title : 'Not connected');
  cbvDsrUpsertDashboardLabel_(sheet, 'Sheets Compared', String(p.sheetsCompared || 0));
  cbvDsrUpsertDashboardLabel_(sheet, 'Match Count', String(p.matchCount || 0));
  cbvDsrUpsertDashboardLabel_(sheet, 'Mismatch Count', String(p.mismatchCount || 0));
  cbvDsrUpsertDashboardLabel_(sheet, 'Review Required Count', String(p.reviewRequiredCount || 0));
  cbvDsrUpsertDashboardLabel_(sheet, 'Next Recommended Action', p.nextStep || '');

  return { ok: true };
}

function cbvDsrSummarizeDiffComparisons_(comparisons) {
  var matchCount = 0;
  var mismatchCount = 0;
  var reviewRequiredCount = 0;
  (comparisons || []).forEach(function (c) {
    if (c.status === CBV_DSR_DIFF_SHEET_STATUS.MATCH && c.action === 'READY_FOR_SYNC') {
      matchCount++;
    } else {
      mismatchCount++;
    }
    if (c.action === 'REVIEW_REQUIRED' || c.status === CBV_DSR_DIFF_SHEET_STATUS.SOURCE_ONLY
        || c.status === CBV_DSR_DIFF_SHEET_STATUS.DEST_ONLY) {
      reviewRequiredCount++;
    }
  });
  return { matchCount: matchCount, mismatchCount: mismatchCount, reviewRequiredCount: reviewRequiredCount };
}

/**
 * Structure-only diff preview SOURCE ↔ DESTINATION.
 */
function cbvDsrDiffPreview() {
  var runId = cbvDsrRunId_();
  var actor = cbvDsrActor_();
  var diffAt = cbvDsrIso_(cbvDsrNow_());
  var phase = 'PHASE_DSR_04_DIFF_PREVIEW';
  var hostSs = cbvDsrActiveSpreadsheet_();

  var payload = {
    runId: runId,
    diffAt: diffAt,
    actor: actor,
    phase: phase,
    result: 'DIFF_FAILED',
    source: { spreadsheetId: '', ok: false, title: '', url: '' },
    destination: { spreadsheetId: '', ok: false, title: '', url: '' },
    comparisons: [],
    sheetsCompared: 0,
    matchCount: 0,
    mismatchCount: 0,
    reviewRequiredCount: 0,
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
    cbvDsrSeedConfigIfMissing_(hostSs, actor, runId);
    cbvDsrSeedConnectionConfigPlaceholders_(hostSs, actor);
    cbvDsrSeedBackupConfigPlaceholders_(hostSs, actor);
    cbvDsrSeedDiffConfigPlaceholders_(hostSs, actor);
    if (typeof cbvDsrSeedWhitelistConfigPlaceholders_ === 'function') {
      cbvDsrSeedWhitelistConfigPlaceholders_(hostSs, actor);
    }

    var configRead = cbvDsrReadConfig_(hostSs);
    if (!configRead.ok) {
      payload.result = 'CONFIG_REQUIRED';
      payload.errors.push(configRead.error || 'Config read failed');
      payload.nextStep = 'Run Bootstrap DSR Foundation';
      cbvDsrWriteDiffReport_(hostSs, payload);
      cbvDsrUpdateDashboardDiffStatus_(hostSs, payload);
      return payload;
    }

    var validation = cbvDsrValidateConnectionConfig_(configRead.config);
    payload.warnings = payload.warnings.concat(validation.warnings || []);

    if (validation.needsConfig) {
      payload.result = 'CONFIG_REQUIRED';
      payload.nextStep = 'Set SOURCE_SPREADSHEET_ID and DESTINATION_SPREADSHEET_ID in SYNC_CONFIG';
      cbvDsrWriteDiffReport_(hostSs, payload);
      cbvDsrUpdateDashboardDiffStatus_(hostSs, payload);
      return payload;
    }

    if (validation.errors && validation.errors.length) {
      payload.result = 'CONFIG_REQUIRED';
      payload.errors = payload.errors.concat(validation.errors);
      payload.nextStep = 'Fix spreadsheet IDs in SYNC_CONFIG';
      cbvDsrWriteDiffReport_(hostSs, payload);
      cbvDsrUpdateDashboardDiffStatus_(hostSs, payload);
      return payload;
    }

    var lastConn = String(configRead.config.LAST_CONNECTION_RESULT || '').trim();
    if (lastConn && lastConn !== 'CONNECTED') {
      payload.warnings.push('LAST_CONNECTION_RESULT is ' + lastConn + ' — run Connection Check (menu 4) recommended');
    }

    var srcId = validation.sourceId;
    var destId = validation.destinationId;
    payload.source.spreadsheetId = srcId;
    payload.destination.spreadsheetId = destId;

    var srcInfo = cbvDsrOpenSpreadsheetByIdSafe_(srcId, 'SOURCE');
    var destInfo = cbvDsrOpenSpreadsheetByIdSafe_(destId, 'DESTINATION');
    payload.source = srcInfo;
    payload.destination = destInfo;

    if (!srcInfo.ok || !destInfo.ok) {
      payload.result = 'CONNECTION_REQUIRED';
      if (!srcInfo.ok) payload.errors.push('SOURCE: ' + (srcInfo.error || 'open failed'));
      if (!destInfo.ok) payload.errors.push('DESTINATION: ' + (destInfo.error || 'open failed'));
      payload.nextStep = 'Run Connection Check SOURCE/DEST (menu 4)';
      cbvDsrWriteDiffReport_(hostSs, payload);
      cbvDsrUpdateDashboardDiffStatus_(hostSs, payload);
      return payload;
    }

    var sourceSs = SpreadsheetApp.openById(srcId);
    var destSs = SpreadsheetApp.openById(destId);

    var plan = cbvDsrBuildDiffPlan_(sourceSs, destSs, configRead.config);
    payload.comparisons = plan.comparisons;
    if (typeof cbvDsrEnrichDiffItemWithWhitelist_ === 'function') {
      payload.comparisons = payload.comparisons.map(function (c) {
        return cbvDsrEnrichDiffItemWithWhitelist_(c, configRead.config);
      });
    }
    payload.sheetsCompared = payload.comparisons.length;

    payload.comparisons.forEach(function (item) {
      cbvDsrAppendDiffPlan_(hostSs, runId, diffAt, item);
    });

    var summary = cbvDsrSummarizeDiffComparisons_(payload.comparisons);
    payload.matchCount = summary.matchCount;
    payload.mismatchCount = summary.mismatchCount;
    payload.reviewRequiredCount = summary.reviewRequiredCount;

    if (payload.mismatchCount === 0 && payload.sheetsCompared > 0) {
      payload.result = 'READY_FOR_SYNC';
      payload.nextStep = 'PHASE_DSR_05_MANUAL_SYNC_APPLY — operator review before apply';
    } else if (payload.sheetsCompared > 0) {
      payload.result = 'REVIEW_REQUIRED';
      payload.nextStep = 'Resolve mismatches in SYNC_PLAN before sync apply';
    } else {
      payload.result = 'REVIEW_REQUIRED';
      payload.warnings.push('No comparable sheets found after exclusions');
      payload.nextStep = 'Verify SOURCE/DEST contain business sheets';
    }

    payload.summary = 'Compared ' + payload.sheetsCompared + ' sheets: ' + payload.matchCount + ' match, '
      + payload.mismatchCount + ' mismatch, ' + payload.reviewRequiredCount + ' need review';

    cbvDsrUpsertConfigKey_(hostSs, 'LAST_DIFF_AT', diffAt, actor);
    cbvDsrUpsertConfigKey_(hostSs, 'LAST_DIFF_RUN_ID', runId, actor);
    cbvDsrUpsertConfigKey_(hostSs, 'LAST_DIFF_RESULT', payload.result, actor);
    cbvDsrUpsertConfigKey_(hostSs, 'DSR_VERSION', CBV_DSR_DIFF_VERSION, actor);

    cbvDsrWriteDiffReport_(hostSs, payload);
    cbvDsrUpdateDashboardDiffStatus_(hostSs, payload);
  } catch (e) {
    payload.result = 'DIFF_FAILED';
    payload.errors.push(String(e.message || e));
    payload.nextStep = 'Review error and re-run diff preview';
    try {
      cbvDsrWriteDiffReport_(hostSs, payload);
      cbvDsrUpdateDashboardDiffStatus_(hostSs, payload);
    } catch (e2) { /* best effort */ }
  }

  return payload;
}
