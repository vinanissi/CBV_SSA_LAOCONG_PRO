/**
 * CBV_DATA_SYNC_RUNTIME v1 — Selective sync apply (PHASE_DSR_05C_SELECTIVE_SYNC_APPLY).
 * Whitelisted sheets require operator APPROVE + READY_TO_APPLY before DESTINATION write.
 */

var CBV_DSR_SELECTIVE_VERSION = '1.4.2-selective-sync-apply';

var CBV_DSR_SELECTIVE_CONFIG_SEED = [
  { key: 'SELECTIVE_SYNC_REQUIRED', value: 'TRUE', description: 'Manual sync must use selective apply (DSR_DECISION_002)' },
  { key: 'SYNC_SELECTION_SHEET', value: 'SYNC_SELECTION', description: 'Operator sheet selection tab name' },
  { key: 'ALLOW_SYNC_ALL_WHITELIST', value: 'FALSE', description: 'Must not sync all whitelist sheets without selection' }
];

var CBV_DSR_SELECTION_DECISIONS = ['APPROVE', 'SKIP', 'HOLD', 'BLOCK'];
var CBV_DSR_SELECTION_APPLY_STATUSES = ['PENDING', 'READY_TO_APPLY', 'APPLIED', 'SKIPPED', 'BLOCKED', 'FAILED'];

function cbvDsrSeedSelectiveSyncConfigPlaceholders_(ss, actor) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.CONFIG);
  if (!sheet) return { ok: false };
  var now = cbvDsrIso_(cbvDsrNow_());
  var seeded = [];
  CBV_DSR_SELECTIVE_CONFIG_SEED.forEach(function (item) {
    if (cbvDsrFindConfigRowIndex_(sheet, item.key) >= 0) return;
    sheet.appendRow([item.key, item.value, item.description, now, actor]);
    seeded.push(item.key);
  });
  return { ok: true, seeded: seeded };
}

function cbvDsrGetSelectionSheetName_(config) {
  var name = String((config || {}).SYNC_SELECTION_SHEET || CBV_DSR_SHEETS.SELECTION).trim();
  return name || CBV_DSR_SHEETS.SELECTION;
}

function cbvDsrEnsureSyncSelectionSheet_(ss) {
  cbvDsrEnsureFoundationSheets_();
  return cbvDsrEnsureSheetWithHeaders_(ss, CBV_DSR_SHEETS.SELECTION, CBV_DSR_HEADERS.SYNC_SELECTION);
}

function cbvDsrValidateSelectiveSyncConfig_(config) {
  var c = config || {};
  var errors = [];
  if (!cbvDsrConfigBool_(c, 'SELECTIVE_SYNC_REQUIRED', true)) {
    errors.push('SELECTIVE_SYNC_REQUIRED must be TRUE');
  }
  if (cbvDsrConfigBool_(c, 'ALLOW_SYNC_ALL_WHITELIST', false)) {
    errors.push('ALLOW_SYNC_ALL_WHITELIST must be FALSE');
  }
  var sheetName = cbvDsrGetSelectionSheetName_(c);
  if (!sheetName) errors.push('SYNC_SELECTION_SHEET is empty');
  return {
    ok: errors.length === 0,
    errors: errors,
    selectionRequired: cbvDsrConfigBool_(c, 'SELECTIVE_SYNC_REQUIRED', true),
    selectionSheet: sheetName,
    allowSyncAllWhitelist: cbvDsrConfigBool_(c, 'ALLOW_SYNC_ALL_WHITELIST', false)
  };
}

function cbvDsrSelectionRowToObject_(row) {
  var h = CBV_DSR_HEADERS.SYNC_SELECTION;
  var o = {};
  h.forEach(function (key, i) {
    o[key] = row[i] == null ? '' : row[i];
  });
  o.RUN_ID = o.RUN_ID;
  o.SHEET_NAME = String(o.SHEET_NAME || '').trim();
  o.OPERATOR_DECISION = String(o.OPERATOR_DECISION || '').trim().toUpperCase();
  o.APPLY_STATUS = String(o.APPLY_STATUS || '').trim().toUpperCase();
  o.IN_WHITELIST = String(o.IN_WHITELIST || '').toUpperCase();
  o.FORBIDDEN = String(o.FORBIDDEN || '').toUpperCase();
  o.sortAt = String(o.APPROVED_AT || o.SELECTED_AT || '');
  return o;
}

/**
 * Latest selection row per SHEET_NAME (append-only history; newest wins).
 */
function cbvDsrReadLatestSyncSelections_(ss) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.SELECTION);
  var map = {};
  if (!sheet || sheet.getLastRow() < 2) {
    return { ok: true, bySheet: map, rows: [] };
  }
  var last = sheet.getLastRow();
  var cols = CBV_DSR_HEADERS.SYNC_SELECTION.length;
  var values = sheet.getRange(2, 1, last - 1, cols).getValues();
  values.forEach(function (row) {
    var o = cbvDsrSelectionRowToObject_(row);
    if (!o.SHEET_NAME) return;
    var key = o.SHEET_NAME.toUpperCase();
    if (!map[key] || String(o.sortAt) >= String(map[key].sortAt)) {
      map[key] = o;
    }
  });
  return { ok: true, bySheet: map, rows: Object.keys(map).map(function (k) { return map[k]; }) };
}

function cbvDsrGetLatestDiffStatusBySheet_(hostSs) {
  var out = {};
  var sheet = hostSs.getSheetByName(CBV_DSR_SHEETS.PLAN);
  if (!sheet || sheet.getLastRow() < 2) return out;
  var last = sheet.getLastRow();
  var start = Math.max(2, last - 499);
  var rows = sheet.getRange(start, 1, last - start + 1, 12).getValues();
  rows.forEach(function (row) {
    var src = String(row[2] || row[3] || '').trim();
    var name = src || String(row[3] || '').trim();
    if (!name) return;
    var key = name.toUpperCase();
    out[key] = {
      status: String(row[10] || '').trim(),
      action: String(row[4] || '').trim(),
      message: String(row[11] || '').trim()
    };
  });
  return out;
}

function cbvDsrBuildSelectionCandidates_(whitelist, config, diffBySheet, sourceSs) {
  var candidates = [];
  (whitelist || []).forEach(function (name) {
    var perm = typeof cbvDsrValidateSheetSyncPermission_ === 'function'
      ? cbvDsrValidateSheetSyncPermission_(name, config)
      : { allowed: true, blocked: false, skipped: false };
    var diff = diffBySheet[name.toUpperCase()] || diffBySheet[name] || {};
    var forbidden = perm.blocked === true;
    var inWhitelist = perm.allowed === true && !forbidden;
    var sourceExists = !!(sourceSs && sourceSs.getSheetByName(name));

    var operatorDecision = '';
    var applyStatus = 'PENDING';
    var message = 'Set OPERATOR_DECISION=APPROVE and APPLY_STATUS=READY_TO_APPLY to sync';

    if (forbidden) {
      operatorDecision = 'BLOCK';
      applyStatus = 'BLOCKED';
      message = perm.reason || 'Forbidden pattern — cannot approve';
    } else if (!inWhitelist) {
      operatorDecision = 'SKIP';
      applyStatus = 'SKIPPED';
      message = 'Not whitelisted';
    } else if (!sourceExists) {
      operatorDecision = 'HOLD';
      applyStatus = 'PENDING';
      message = 'Whitelisted but missing on SOURCE';
    }

    candidates.push({
      sheetName: name,
      inWhitelist: inWhitelist ? 'TRUE' : 'FALSE',
      forbidden: forbidden ? 'TRUE' : 'FALSE',
      diffStatus: diff.status || diff.action || '',
      operatorDecision: operatorDecision,
      applyStatus: applyStatus,
      message: message,
      detailJson: { diff: diff, permission: perm, sourceExists: sourceExists }
    });
  });
  return candidates;
}

function cbvDsrAppendSelectionRows_(ss, runId, selectedAt, rows, actor) {
  var ensured = cbvDsrEnsureSyncSelectionSheet_(ss);
  if (!ensured.ok) return { ok: false, error: ensured.error || 'SYNC_SELECTION missing' };
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.SELECTION);
  var appended = 0;
  (rows || []).forEach(function (r) {
    var detail = r.detailJson;
    var detailStr = typeof detail === 'string' ? detail : JSON.stringify(detail || {});
    sheet.appendRow([
      runId,
      selectedAt,
      r.sheetName,
      r.inWhitelist || 'FALSE',
      r.forbidden || 'FALSE',
      r.diffStatus || '',
      r.operatorDecision || '',
      r.approvedBy || actor || '',
      r.approvedAt || '',
      r.applyStatus || 'PENDING',
      r.message || '',
      detailStr
    ]);
    appended++;
  });
  return { ok: true, appended: appended };
}

function cbvDsrValidateSheetSelectionPermission_(sheetName, selection, config) {
  var name = String(sheetName || '').trim();
  var sel = selection || {};
  var perm = typeof cbvDsrValidateSheetSyncPermission_ === 'function'
    ? cbvDsrValidateSheetSyncPermission_(name, config)
    : { allowed: true, blocked: false };

  if (perm.blocked) {
    return {
      eligible: false,
      sheetName: name,
      reason: perm.reason || 'Forbidden',
      operatorDecision: sel.OPERATOR_DECISION,
      applyStatus: sel.APPLY_STATUS
    };
  }
  if (!perm.allowed) {
    return {
      eligible: false,
      sheetName: name,
      reason: 'Not whitelisted — cannot approve into apply',
      operatorDecision: sel.OPERATOR_DECISION,
      applyStatus: sel.APPLY_STATUS
    };
  }

  var dec = String(sel.OPERATOR_DECISION || '').trim().toUpperCase();
  var status = String(sel.APPLY_STATUS || '').trim().toUpperCase();

  if (!dec) {
    return { eligible: false, sheetName: name, reason: 'OPERATOR_DECISION empty', operatorDecision: dec, applyStatus: status };
  }
  if (dec === 'SKIP' || dec === 'HOLD' || dec === 'BLOCK') {
    return { eligible: false, sheetName: name, reason: 'OPERATOR_DECISION=' + dec, operatorDecision: dec, applyStatus: status };
  }
  if (dec !== 'APPROVE') {
    return { eligible: false, sheetName: name, reason: 'Invalid OPERATOR_DECISION', operatorDecision: dec, applyStatus: status };
  }
  if (status !== 'READY_TO_APPLY') {
    return {
      eligible: false,
      sheetName: name,
      reason: 'APPLY_STATUS must be READY_TO_APPLY (got ' + (status || 'empty') + ')',
      operatorDecision: dec,
      applyStatus: status
    };
  }
  return { eligible: true, sheetName: name, operatorDecision: dec, applyStatus: status };
}

function cbvDsrBuildSelectiveApplyPlan_(sourceSs, destSs, config, selectionsBySheet) {
  var plan = [];
  var map = selectionsBySheet || {};
  Object.keys(map).forEach(function (key) {
    var sel = map[key];
    var name = sel.SHEET_NAME;
    var check = cbvDsrValidateSheetSelectionPermission_(name, sel, config);
    var entry = {
      sheetName: name,
      eligible: false,
      selection: sel,
      reason: check.reason || '',
      operatorDecision: check.operatorDecision,
      applyStatus: check.applyStatus
    };
    if (check.eligible && sourceSs && sourceSs.getSheetByName(name)) {
      var sh = sourceSs.getSheetByName(name);
      entry.eligible = true;
      entry.sourceRows = sh.getLastRow();
      entry.sourceCols = sh.getLastColumn();
      entry.destExists = !!(destSs && destSs.getSheetByName(name));
    } else if (check.eligible) {
      entry.reason = 'SOURCE sheet missing';
    }
    plan.push(entry);
  });
  return plan;
}

function cbvDsrValidateSyncGuardsSelective_(hostSs, config, guardResult) {
  var gr = guardResult || { guards: [], blocked: [], ok: true };
  if (!gr.guards) gr.guards = [];
  if (!gr.blocked) gr.blocked = [];

  function add(name, pass, message) {
    gr.guards.push({ name: name, pass: !!pass, message: message || '' });
    if (!pass) {
      gr.ok = false;
      gr.blocked.push(name + ': ' + (message || 'failed'));
    }
  }

  var sel = cbvDsrValidateSelectiveSyncConfig_(config);
  add('SELECTIVE_SYNC_REQUIRED', sel.selectionRequired, sel.selectionRequired ? 'TRUE' : 'must be TRUE');
  add('ALLOW_SYNC_ALL_WHITELIST_FALSE', !sel.allowSyncAllWhitelist,
    'ALLOW_SYNC_ALL_WHITELIST=' + (config.ALLOW_SYNC_ALL_WHITELIST || ''));
  add('SYNC_SELECTION_SHEET', !!sel.selectionSheet, sel.selectionSheet);

  var ensured = cbvDsrEnsureSyncSelectionSheet_(hostSs);
  add('SYNC_SELECTION_EXISTS', ensured.ok, ensured.error || 'OK');

  gr.selectiveValidation = sel;
  gr.guardStatus = gr.ok ? 'PASS' : 'BLOCKED';
  return gr;
}

function cbvDsrLogSelectionDecision_(ss, payload) {
  return cbvDsrAppendLog_(ss, {
    runId: payload.runId,
    logAt: payload.logAt || cbvDsrIso_(cbvDsrNow_()),
    level: payload.blocked ? 'WARNING' : 'INFO',
    phase: payload.phase || 'PHASE_DSR_05C_SELECTIVE_SYNC_APPLY',
    action: payload.action || 'SELECTION_DECISION',
    status: payload.status || payload.applyStatus,
    message: payload.message,
    detailJson: payload.detailJson || payload,
    actor: payload.actor || cbvDsrActor_()
  });
}

function cbvDsrAuditSelectionDecision_(ss, payload) {
  return cbvDsrAppendAudit_(ss, {
    runId: payload.runId,
    auditType: payload.auditType || 'SELECTIVE_SYNC',
    entityType: 'SHEET',
    entityId: payload.sheetName || '',
    action: payload.action || payload.operatorDecision,
    beforeJson: payload.beforeJson || {},
    afterJson: payload.afterJson || payload,
    note: payload.note || 'Selective sync — no write unless APPROVE+READY_TO_APPLY',
    actor: payload.actor || cbvDsrActor_()
  });
}

function cbvDsrUpdateSelectionApplyResult_(ss, runId, finishedAt, results, actor) {
  var rows = (results || []).map(function (r) {
    var status = r.status === 'SYNCED' ? 'APPLIED' : (r.status === 'FAILED' ? 'FAILED' : 'SKIPPED');
    return {
      sheetName: r.sheetName,
      inWhitelist: 'TRUE',
      forbidden: 'FALSE',
      diffStatus: '',
      operatorDecision: 'APPROVE',
      approvedBy: actor,
      approvedAt: finishedAt,
      applyStatus: status,
      message: r.message || r.reason || status,
      detailJson: r
    };
  });
  return cbvDsrAppendSelectionRows_(ss, runId, finishedAt, rows, actor);
}

function cbvDsrPrepareSelectiveSyncHost_(hostSs, actor, runId) {
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
  cbvDsrSeedSyncApplyConfigPlaceholders_(hostSs, actor);
  if (typeof cbvDsrSeedWhitelistConfigPlaceholders_ === 'function') {
    cbvDsrSeedWhitelistConfigPlaceholders_(hostSs, actor);
  }
  if (typeof cbvDsrSeedSelectiveSyncConfigPlaceholders_ === 'function') {
    cbvDsrSeedSelectiveSyncConfigPlaceholders_(hostSs, actor);
  }
  cbvDsrEnsureSyncSelectionSheet_(hostSs);
}

/**
 * Build candidate rows on SYNC_SELECTION (no business data writes).
 */
function cbvDsrBuildSelectiveSyncPlan() {
  var runId = cbvDsrRunId_();
  var actor = cbvDsrActor_();
  var planAt = cbvDsrIso_(cbvDsrNow_());
  var phase = 'PHASE_DSR_05C_SELECTIVE_SYNC_APPLY';
  var hostSs = cbvDsrActiveSpreadsheet_();
  var out = {
    runId: runId,
    planAt: planAt,
    actor: actor,
    phase: phase,
    result: 'PLAN_FAILED',
    candidateSheetCount: 0,
    rowsAppended: 0,
    warnings: [],
    errors: [],
    nextStep: ''
  };

  try {
    cbvDsrPrepareSelectiveSyncHost_(hostSs, actor, runId);
    var configRead = cbvDsrReadConfig_(hostSs);
    if (!configRead.ok) {
      out.errors.push(configRead.error || 'Config read failed');
      out.nextStep = 'Run Bootstrap DSR Foundation';
      return out;
    }
    var config = configRead.config;
    var wl = typeof cbvDsrValidateWhitelistSyncConfig_ === 'function'
      ? cbvDsrValidateWhitelistSyncConfig_(config)
      : { ok: true, whitelist: [] };
    if (!wl.ok) {
      out.errors = out.errors.concat(wl.errors || []);
      out.result = 'CONFIG_REQUIRED';
      return out;
    }

    var validation = cbvDsrValidateConnectionConfig_(config);
    if (validation.needsConfig) {
      out.result = 'CONFIG_REQUIRED';
      out.nextStep = 'Set SOURCE and DESTINATION IDs';
      return out;
    }

    var sourceSs = null;
    if (validation.sourceId && cbvDsrIsValidSpreadsheetId_(validation.sourceId)) {
      try {
        sourceSs = SpreadsheetApp.openById(validation.sourceId);
      } catch (e) {
        out.warnings.push('SOURCE open: ' + String(e.message || e));
      }
    }

    var diffBySheet = cbvDsrGetLatestDiffStatusBySheet_(hostSs);
    var candidates = cbvDsrBuildSelectionCandidates_(wl.whitelist, config, diffBySheet, sourceSs);
    out.candidateSheetCount = candidates.length;

    var append = cbvDsrAppendSelectionRows_(hostSs, runId, planAt, candidates, actor);
    out.rowsAppended = append.appended || 0;

    cbvDsrAppendLog_(hostSs, {
      runId: runId,
      logAt: planAt,
      level: 'INFO',
      phase: phase,
      action: 'BUILD_SELECTIVE_SYNC_PLAN',
      status: 'PLAN_BUILT',
      message: 'Appended ' + out.rowsAppended + ' selection candidate row(s)',
      detailJson: { candidateSheetCount: out.candidateSheetCount },
      actor: actor
    });

    out.result = 'PLAN_BUILT';
    out.nextStep = 'Open SYNC_SELECTION — set APPROVE + READY_TO_APPLY per sheet, then menu 10 apply';
  } catch (e) {
    out.errors.push(String(e.message || e));
    out.result = 'PLAN_FAILED';
  }
  return out;
}

function cbvDsrOpenSyncSelection() {
  var hostSs = cbvDsrActiveSpreadsheet_();
  cbvDsrEnsureSyncSelectionSheet_(hostSs);
  var sheet = hostSs.getSheetByName(CBV_DSR_SHEETS.SELECTION);
  if (!sheet) return { ok: false, error: 'SYNC_SELECTION missing' };
  hostSs.setActiveSheet(sheet);
  return { ok: true, sheetName: CBV_DSR_SHEETS.SELECTION };
}

/**
 * Manual selective sync — only APPROVE + READY_TO_APPLY whitelisted non-forbidden sheets.
 */
function cbvDsrManualSelectiveSyncApply() {
  var runId = cbvDsrRunId_();
  var actor = cbvDsrActor_();
  var startedAt = cbvDsrIso_(cbvDsrNow_());
  var phase = 'PHASE_DSR_05C_SELECTIVE_SYNC_APPLY';
  var hostSs = cbvDsrActiveSpreadsheet_();

  var payload = {
    runId: runId,
    startedAt: startedAt,
    finishedAt: '',
    actor: actor,
    phase: phase,
    result: 'SYNC_FAILED',
    guardStatus: 'PENDING',
    guardBlocked: [],
    selectionRequired: true,
    selectionSheet: CBV_DSR_SHEETS.SELECTION,
    candidateSheetCount: 0,
    approvedSheetCount: 0,
    skippedSheetCount: 0,
    heldSheetCount: 0,
    blockedSheetCount: 0,
    appliedSheetCount: 0,
    failedSheetCount: 0,
    approvedSheets: [],
    skippedSheets: [],
    heldSheets: [],
    blockedSheets: [],
    failedSheets: [],
    syncedSheets: [],
    warnings: [],
    errors: [],
    nextStep: '',
    summary: ''
  };

  try {
    cbvDsrPrepareSelectiveSyncHost_(hostSs, actor, runId);
    var configRead = cbvDsrReadConfig_(hostSs);
    if (!configRead.ok) {
      return cbvDsrFinalizeSyncBlocked_(hostSs, payload, 'CONFIG_REQUIRED', 'Run Bootstrap');
    }

    var config = configRead.config;
    payload.selectionSheet = cbvDsrGetSelectionSheetName_(config);

    var guardResult = cbvDsrValidateSyncGuards_(hostSs, config);
    if (typeof cbvDsrValidateSyncGuardsWhitelist_ === 'function') {
      guardResult = cbvDsrValidateSyncGuardsWhitelist_(hostSs, config, guardResult);
    }
    if (typeof cbvDsrValidateSyncGuardsSelective_ === 'function') {
      guardResult = cbvDsrValidateSyncGuardsSelective_(hostSs, config, guardResult);
    }

    payload.guardStatus = guardResult.guardStatus;
    payload.guardBlocked = guardResult.blocked;

    if (!guardResult.ok) {
      var blockResult = 'GUARD_BLOCKED';
      if (!cbvDsrConfigBool_(config, 'SYNC_ALLOWED', false)) blockResult = 'GUARD_BLOCKED';
      else if (!guardResult.latestBackup || !guardResult.latestBackup.exists) blockResult = 'BACKUP_REQUIRED';
      else if (!guardResult.latestDiff || !guardResult.latestDiff.ready) blockResult = 'DIFF_REQUIRED';
      return cbvDsrFinalizeSyncBlocked_(hostSs, payload, blockResult,
        'Fix guards then rebuild selection; APPROVE+READY_TO_APPLY only');
    }

    var selections = cbvDsrReadLatestSyncSelections_(hostSs);
    payload.candidateSheetCount = selections.rows.length;

    if (!selections.rows.length) {
      payload.warnings.push('No SYNC_SELECTION rows — run Build Selective Sync Plan (menu 9)');
      return cbvDsrFinalizeSyncBlocked_(hostSs, payload, 'SELECTION_REQUIRED',
        'Menu 9 Build Selective Sync Plan, then approve sheets in SYNC_SELECTION');
    }

    var srcId = guardResult.connection.sourceId;
    var destId = guardResult.connection.destinationId;
    var sourceSs = SpreadsheetApp.openById(srcId);
    var destSs = SpreadsheetApp.openById(destId);

    var plan = cbvDsrBuildSelectiveApplyPlan_(sourceSs, destSs, config, selections.bySheet);
    var eligible = plan.filter(function (p) { return p.eligible; });

    plan.forEach(function (p) {
      if (p.eligible) {
        payload.approvedSheets.push(p.sheetName);
        return;
      }
      var dec = String(p.operatorDecision || '').toUpperCase();
      var item = { sheetName: p.sheetName, reason: p.reason };
      if (dec === 'HOLD' || dec === '') {
        if (dec === 'HOLD') payload.heldSheets.push(item);
        else payload.skippedSheets.push(item);
      } else if (dec === 'BLOCK') {
        payload.blockedSheets.push(item);
      } else {
        payload.skippedSheets.push(item);
      }
      cbvDsrLogSelectionDecision_(hostSs, {
        runId: runId,
        action: 'SELECTIVE_SKIP',
        status: dec || 'NOT_ELIGIBLE',
        message: p.sheetName + ': ' + p.reason,
        sheetName: p.sheetName,
        detailJson: p,
        actor: actor
      });
      cbvDsrAuditSelectionDecision_(hostSs, {
        runId: runId,
        sheetName: p.sheetName,
        action: dec || 'SKIP',
        note: 'No clear/write',
        afterJson: p,
        actor: actor
      });
    });

    payload.approvedSheetCount = payload.approvedSheets.length;
    payload.skippedSheetCount = payload.skippedSheets.length;
    payload.heldSheetCount = payload.heldSheets.length;
    payload.blockedSheetCount = payload.blockedSheets.length;

    if (eligible.length === 0) {
      payload.warnings.push('No sheets with APPROVE + READY_TO_APPLY');
      return cbvDsrFinalizeSyncBlocked_(hostSs, payload, 'SELECTION_REQUIRED',
        'Approve sheets in SYNC_SELECTION (APPROVE + READY_TO_APPLY)');
    }

    eligible.forEach(function (item) {
      try {
        var r = cbvDsrApplySheetSync_(sourceSs, destSs, item.sheetName);
        if (r.status === 'SYNCED') {
          payload.syncedSheets.push(r);
          payload.appliedSheetCount++;
        } else {
          payload.failedSheets.push(r);
          payload.failedSheetCount++;
        }
      } catch (e) {
        payload.failedSheets.push({
          sheetName: item.sheetName,
          status: 'FAILED',
          message: String(e.message || e)
        });
        payload.failedSheetCount++;
      }
    });

    payload.finishedAt = cbvDsrIso_(cbvDsrNow_());
    cbvDsrUpdateSelectionApplyResult_(hostSs, runId, payload.finishedAt,
      payload.syncedSheets.concat(payload.failedSheets), actor);

    if (payload.failedSheetCount === 0 && payload.appliedSheetCount > 0) {
      payload.result = 'SYNC_APPLIED';
      payload.nextStep = 'PHASE_DSR_06 — verify DESTINATION; re-backup before next apply';
    } else if (payload.appliedSheetCount > 0) {
      payload.result = 'PARTIAL_SYNC';
      payload.nextStep = 'Review failed sheets in SYNC_REPORT';
    } else {
      payload.result = 'SYNC_FAILED';
    }

    payload.summary = 'Applied ' + payload.appliedSheetCount + '; failed ' + payload.failedSheetCount
      + '; skipped ' + payload.skippedSheetCount + '; held ' + payload.heldSheetCount
      + '; blocked ' + payload.blockedSheetCount;

    cbvDsrUpsertConfigKey_(hostSs, 'LAST_SYNC_AT', payload.finishedAt, actor);
    cbvDsrUpsertConfigKey_(hostSs, 'LAST_SYNC_RUN_ID', runId, actor);
    cbvDsrUpsertConfigKey_(hostSs, 'LAST_SYNC_RESULT', payload.result, actor);
    cbvDsrUpsertConfigKey_(hostSs, 'DSR_VERSION', CBV_DSR_SELECTIVE_VERSION, actor);

    cbvDsrWriteSyncApplyReport_(hostSs, payload);
    cbvDsrUpdateDashboardSyncApplyStatus_(hostSs, payload);
  } catch (e) {
    payload.errors.push(String(e.message || e));
    payload.finishedAt = cbvDsrIso_(cbvDsrNow_());
    try {
      cbvDsrWriteSyncApplyReport_(hostSs, payload);
      cbvDsrUpdateDashboardSyncApplyStatus_(hostSs, payload);
    } catch (e2) { /* best effort */ }
  }
  return payload;
}
