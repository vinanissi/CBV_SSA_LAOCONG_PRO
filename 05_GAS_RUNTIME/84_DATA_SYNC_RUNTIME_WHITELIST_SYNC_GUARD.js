/**
 * CBV_DATA_SYNC_RUNTIME v1 — Whitelist sync guard (PHASE_DSR_05B_WHITELIST_SYNC_GUARD).
 * FULL_WORKBOOK_SYNC = FORBIDDEN; only SYNC_WHITELIST sheets may be written to DESTINATION.
 */

var CBV_DSR_WHITELIST_VERSION = '1.4.1-whitelist-sync-guard';

var CBV_DSR_WHITELIST_CONFIG_SEED = [
  { key: 'FULL_WORKBOOK_SYNC', value: 'FORBIDDEN', description: 'Full workbook sync is forbidden (DSR_DECISION_001)' },
  { key: 'WHITELIST_SYNC_REQUIRED', value: 'TRUE', description: 'Only whitelisted sheets may sync' },
  {
    key: 'SYNC_WHITELIST',
    value: [
      'TASK_MAIN',
      'TASK_CHECKLIST',
      'TASK_ATTACHMENT',
      'TASK_UPDATE_LOG',
      'FINANCE_TRANSACTION',
      'FINANCE_LOG',
      'DOC_REQUIREMENT',
      'RULE_DEF'
    ].join('\n'),
    description: 'Newline-separated allowed destination sheet names (exact match)'
  },
  {
    key: 'SYNC_FORBIDDEN_PATTERNS',
    value: [
      'USER_DIRECTORY',
      'MASTER_CODE',
      'DON_VI',
      'HO_SO_MASTER',
      'CBV_*',
      'HOME_ALERT_*',
      'FEATURE_FLAG',
      'ROLE_PERMISSION_MATRIX',
      'SYSTEM_REGISTRY',
      'SYNC_*',
      'DSR_*',
      'BAK_*'
    ].join('\n'),
    description: 'Newline-separated forbidden patterns (* suffix = prefix match)'
  }
];

var CBV_DSR_DEFAULT_WHITELIST = CBV_DSR_WHITELIST_CONFIG_SEED[2].value.split('\n');
var CBV_DSR_DEFAULT_FORBIDDEN = CBV_DSR_WHITELIST_CONFIG_SEED[3].value.split('\n');

function cbvDsrSeedWhitelistConfigPlaceholders_(ss, actor) {
  var sheet = ss.getSheetByName(CBV_DSR_SHEETS.CONFIG);
  if (!sheet) return { ok: false };
  var now = cbvDsrIso_(cbvDsrNow_());
  var seeded = [];
  CBV_DSR_WHITELIST_CONFIG_SEED.forEach(function (item) {
    if (cbvDsrFindConfigRowIndex_(sheet, item.key) >= 0) return;
    sheet.appendRow([item.key, item.value, item.description, now, actor]);
    seeded.push(item.key);
  });
  return { ok: true, seeded: seeded };
}

/**
 * Parse newline- or comma-separated list; optional JSON array.
 */
function cbvDsrParseSheetListConfig_(value) {
  var raw = String(value == null ? '' : value).trim();
  if (!raw) return [];
  if (raw.charAt(0) === '[') {
    try {
      var arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return arr.map(function (s) { return String(s || '').trim(); }).filter(function (s) { return !!s; });
      }
    } catch (e) { /* fall through */ }
  }
  return raw.split(/[\n,;]+/).map(function (s) { return String(s || '').trim(); }).filter(function (s) { return !!s; });
}

function cbvDsrParseForbiddenPatterns_(value) {
  return cbvDsrParseSheetListConfig_(value);
}

function cbvDsrNormalizeSheetName_(name) {
  return String(name || '').trim();
}

function cbvDsrMatchForbiddenPattern_(sheetName, pattern) {
  var n = cbvDsrNormalizeSheetName_(sheetName);
  var p = cbvDsrNormalizeSheetName_(pattern);
  if (!p || !n) return false;
  if (p.indexOf('*') >= 0) {
    var escaped = p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp('^' + escaped + '$', 'i').test(n);
  }
  return n.toUpperCase() === p.toUpperCase();
}

function cbvDsrIsSheetWhitelisted_(sheetName, whitelist) {
  var n = cbvDsrNormalizeSheetName_(sheetName).toUpperCase();
  if (!n) return false;
  var list = whitelist || [];
  for (var i = 0; i < list.length; i++) {
    if (cbvDsrNormalizeSheetName_(list[i]).toUpperCase() === n) return true;
  }
  return false;
}

function cbvDsrIsSheetForbidden_(sheetName, forbiddenPatterns) {
  var patterns = forbiddenPatterns || [];
  for (var i = 0; i < patterns.length; i++) {
    if (cbvDsrMatchForbiddenPattern_(sheetName, patterns[i])) return true;
  }
  return false;
}

function cbvDsrGetWhitelistFromConfig_(config) {
  var c = config || {};
  var list = cbvDsrParseSheetListConfig_(c.SYNC_WHITELIST);
  if (!list.length && c.SYNC_WHITELIST === undefined) {
    list = CBV_DSR_DEFAULT_WHITELIST.slice();
  }
  return list;
}

function cbvDsrGetForbiddenFromConfig_(config) {
  var c = config || {};
  var list = cbvDsrParseForbiddenPatterns_(c.SYNC_FORBIDDEN_PATTERNS);
  if (!list.length && c.SYNC_FORBIDDEN_PATTERNS === undefined) {
    list = CBV_DSR_DEFAULT_FORBIDDEN.slice();
  }
  return list;
}

/**
 * Validate whitelist policy keys (no spreadsheet access).
 */
function cbvDsrValidateWhitelistSyncConfig_(config) {
  var c = config || {};
  var errors = [];
  var warnings = [];

  if (String(c.FULL_WORKBOOK_SYNC || '').trim().toUpperCase() !== 'FORBIDDEN') {
    errors.push('FULL_WORKBOOK_SYNC must be FORBIDDEN');
  }
  if (!cbvDsrConfigBool_(c, 'WHITELIST_SYNC_REQUIRED', true)) {
    errors.push('WHITELIST_SYNC_REQUIRED must be TRUE');
  }

  var whitelist = cbvDsrGetWhitelistFromConfig_(c);
  if (!whitelist.length) {
    errors.push('SYNC_WHITELIST is empty — sync blocked');
  }

  var forbidden = cbvDsrGetForbiddenFromConfig_(c);
  if (!forbidden.length) {
    warnings.push('SYNC_FORBIDDEN_PATTERNS empty — using code defaults recommended');
  }

  return {
    ok: errors.length === 0,
    errors: errors,
    warnings: warnings,
    whitelist: whitelist,
    forbiddenPatterns: forbidden,
    whitelistCount: whitelist.length,
    forbiddenPatternCount: forbidden.length,
    fullWorkbookSyncStatus: String(c.FULL_WORKBOOK_SYNC || '').trim(),
    whitelistSyncRequired: cbvDsrConfigBool_(c, 'WHITELIST_SYNC_REQUIRED', true)
  };
}

/**
 * Per-sheet permission: ALLOWED | SKIP (not whitelisted) | BLOCK (forbidden).
 */
function cbvDsrValidateSheetSyncPermission_(sheetName, config) {
  var name = cbvDsrNormalizeSheetName_(sheetName);
  var whitelist = cbvDsrGetWhitelistFromConfig_(config);
  var forbidden = cbvDsrGetForbiddenFromConfig_(config);

  if (cbvDsrIsSheetForbidden_(name, forbidden)) {
    return {
      sheetName: name,
      decision: 'BLOCK',
      allowed: false,
      skipped: false,
      blocked: true,
      whitelistStatus: 'FORBIDDEN',
      reason: 'Matches SYNC_FORBIDDEN_PATTERNS'
    };
  }
  if (!cbvDsrIsSheetWhitelisted_(name, whitelist)) {
    return {
      sheetName: name,
      decision: 'SKIP',
      allowed: false,
      skipped: true,
      blocked: false,
      whitelistStatus: 'NOT_WHITELISTED',
      reason: 'Not in SYNC_WHITELIST — full workbook sync forbidden'
    };
  }
  return {
    sheetName: name,
    decision: 'ALLOW',
    allowed: true,
    skipped: false,
    blocked: false,
    whitelistStatus: 'WHITELISTED',
    reason: 'Whitelisted for sync'
  };
}

function cbvDsrBuildWhitelistApplyPlan_(sourceSs, destSs, config) {
  var plan = [];
  var whitelist = cbvDsrGetWhitelistFromConfig_(config);
  var seen = {};

  whitelist.forEach(function (name) {
    seen[name.toUpperCase()] = true;
    var perm = cbvDsrValidateSheetSyncPermission_(name, config);
    var sourceSheet = sourceSs ? sourceSs.getSheetByName(name) : null;
    var entry = {
      sheetName: name,
      eligible: false,
      whitelistStatus: perm.whitelistStatus,
      decision: perm.decision,
      reason: perm.reason,
      sourceExists: !!sourceSheet,
      destExists: !!(destSs && destSs.getSheetByName(name))
    };
    if (perm.blocked) {
      entry.eligible = false;
    } else if (perm.allowed && sourceSheet) {
      entry.eligible = true;
      entry.sourceRows = sourceSheet.getLastRow();
      entry.sourceCols = sourceSheet.getLastColumn();
    } else if (perm.skipped) {
      entry.eligible = false;
    } else if (!sourceSheet) {
      entry.eligible = false;
      entry.reason = 'Whitelisted but missing on SOURCE';
    }
    plan.push(entry);
  });

  if (sourceSs) {
    sourceSs.getSheets().forEach(function (sh) {
      var n = sh.getName();
      if (seen[cbvDsrNormalizeSheetName_(n).toUpperCase()]) return;
      var perm = cbvDsrValidateSheetSyncPermission_(n, config);
      plan.push({
        sheetName: n,
        eligible: false,
        whitelistStatus: perm.whitelistStatus,
        decision: perm.decision,
        reason: perm.reason || 'SOURCE sheet not on whitelist',
        sourceExists: true,
        destExists: !!(destSs && destSs.getSheetByName(n))
      });
    });
  }

  return plan;
}

function cbvDsrLogWhitelistSkip_(ss, payload) {
  return cbvDsrAppendLog_(ss, {
    runId: payload.runId,
    logAt: payload.logAt || cbvDsrIso_(cbvDsrNow_()),
    level: payload.blocked ? 'WARNING' : 'INFO',
    phase: payload.phase || 'PHASE_DSR_05B_WHITELIST_SYNC_GUARD',
    action: payload.action || 'WHITELIST_SKIP',
    status: payload.status || payload.whitelistStatus,
    message: payload.message,
    detailJson: payload.detailJson || payload,
    actor: payload.actor || cbvDsrActor_()
  });
}

function cbvDsrAuditWhitelistDecision_(ss, payload) {
  return cbvDsrAppendAudit_(ss, {
    runId: payload.runId,
    auditType: payload.auditType || 'WHITELIST_SYNC_GUARD',
    entityType: payload.entityType || 'SHEET',
    entityId: payload.sheetName || '',
    action: payload.action || payload.decision,
    beforeJson: payload.beforeJson || {},
    afterJson: payload.afterJson || payload,
    note: payload.note || 'Whitelist guard — no clear/write on skip/block',
    actor: payload.actor || cbvDsrActor_()
  });
}

/**
 * Extend sync guard validation with whitelist policy (additive guards).
 */
function cbvDsrValidateSyncGuardsWhitelist_(hostSs, config, guardResult) {
  var gr = guardResult || { guards: [], blocked: [], ok: true };
  var wl = cbvDsrValidateWhitelistSyncConfig_(config);

  function add(name, pass, message) {
    gr.guards.push({ name: name, pass: !!pass, message: message || '' });
    if (!pass) {
      gr.ok = false;
      gr.blocked.push(name + ': ' + (message || 'failed'));
    }
  }

  add('FULL_WORKBOOK_SYNC_FORBIDDEN', String(config.FULL_WORKBOOK_SYNC || '').toUpperCase() === 'FORBIDDEN',
    'FULL_WORKBOOK_SYNC=' + (config.FULL_WORKBOOK_SYNC || '(empty)'));
  add('WHITELIST_SYNC_REQUIRED', wl.whitelistSyncRequired,
    wl.whitelistSyncRequired ? 'TRUE' : 'must be TRUE');
  add('SYNC_WHITELIST_NON_EMPTY', wl.whitelist.length > 0,
    wl.whitelist.length + ' sheet(s) whitelisted');
  (wl.errors || []).forEach(function (err) {
    if (err.indexOf('SYNC_WHITELIST') < 0) {
      add('WHITELIST_POLICY', false, err);
    }
  });

  gr.whitelistValidation = wl;
  gr.guardStatus = gr.ok ? 'PASS' : 'BLOCKED';
  return gr;
}

/**
 * Enrich diff row with whitelist classification (MESSAGE suffix).
 */
function cbvDsrEnrichDiffItemWithWhitelist_(item, config) {
  if (!item || item.status === 'SOURCE_ONLY' || item.status === 'DEST_ONLY') {
    return item;
  }
  var perm = cbvDsrValidateSheetSyncPermission_(item.sheetName, config);
  item.whitelistStatus = perm.whitelistStatus;
  if (perm.blocked) {
    item.action = 'FORBIDDEN';
    item.message = (item.message ? item.message + '; ' : '') + 'FORBIDDEN: ' + perm.reason;
  } else if (perm.skipped) {
    item.action = 'NOT_WHITELISTED';
    item.message = (item.message ? item.message + '; ' : '') + 'NOT_WHITELISTED: ' + perm.reason;
  } else if (item.action === 'READY_FOR_SYNC' && perm.allowed) {
    item.message = (item.message ? item.message + '; ' : '') + 'WHITELISTED';
  } else if (perm.allowed) {
    item.message = (item.message ? item.message + '; ' : '') + 'WHITELISTED; ' + (item.message || '');
  }
  return item;
}
