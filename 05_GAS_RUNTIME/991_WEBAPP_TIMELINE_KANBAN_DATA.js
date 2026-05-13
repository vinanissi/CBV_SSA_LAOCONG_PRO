/**
 * PHASE_91 — WebApp Timeline / Kanban Read-First Pages — Data
 *
 * Read-first only. No write mutation. No auto assign / auto resolve / auto escalate.
 * No drag-drop save. No production claim.
 *
 * Public functions:
 *   - CbvWebAppTimelineKanban_getTimelineData(options)
 *   - CbvWebAppTimelineKanban_getKanbanData(options)
 *   - CbvWebAppTimelineKanban_validate()
 *
 * All public functions return envelope:
 *   { ok, data, warnings, errors, checkedAt }
 *
 * The runtime piggy-backs on Phase 90 helpers when present (CbvWebAppPilotData__*),
 * but provides safe local fallbacks so this file is self-sufficient if the
 * Phase 90 file is removed or not yet loaded.
 */

var CBV_WEBAPP_TIMELINE_KANBAN_PHASE_ID = 'PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES';
var CBV_WEBAPP_TIMELINE_KANBAN_CONTRACT_VERSION = 'CBV_TCS_V1';

var CBV_WEBAPP_TIMELINE_DEFAULT_LIMIT = 100;
var CBV_WEBAPP_KANBAN_DEFAULT_CARDS_PER_COLUMN = 50;

/* ------------------------------------------------------------------ */
/* Safe envelope + sheet/column helpers                                */
/* ------------------------------------------------------------------ */

function CbvWebAppTimelineKanban__out_(ok, data, warnings, errors) {
  return {
    ok: ok === true,
    data: data || null,
    warnings: warnings || [],
    errors: errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CbvWebAppTimelineKanban__getSheetSafe_(name) {
  if (typeof CbvWebAppPilotData__getSheetSafe_ === 'function') {
    return CbvWebAppPilotData__getSheetSafe_(name);
  }
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

function CbvWebAppTimelineKanban__headerIndex_(headers) {
  if (typeof CbvWebAppPilotData__headerIndex_ === 'function') {
    return CbvWebAppPilotData__headerIndex_(headers);
  }
  var idx = {};
  (headers || []).forEach(function(h, i) { idx[String(h || '').trim()] = i; });
  return idx;
}

function CbvWebAppTimelineKanban__pickIdx_(idx, candidates) {
  if (typeof CbvWebAppPilotData__pickIdx_ === 'function') {
    return CbvWebAppPilotData__pickIdx_(idx, candidates);
  }
  for (var i = 0; i < (candidates || []).length; i++) {
    var c = candidates[i];
    if (idx[c] !== undefined) return idx[c];
  }
  return undefined;
}

function CbvWebAppTimelineKanban__readRows_(sh, limit) {
  if (typeof CbvWebAppPilotData__readRows_ === 'function') {
    return CbvWebAppPilotData__readRows_(sh, limit);
  }
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return { headers: [], rows: [] };
  var lastCol = sh.getLastColumn();
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var n = Math.min(limit || 200, lastRow - 1);
  var values = sh.getRange(2, 1, n, lastCol).getValues();
  return { headers: headers, rows: values };
}

function CbvWebAppTimelineKanban__toNum_(v) {
  if (v == null || v === '') return 0;
  var n = Number(v);
  return isNaN(n) ? 0 : n;
}

function CbvWebAppTimelineKanban__toTime_(v) {
  if (!v) return 0;
  if (v instanceof Date) return v.getTime();
  var d = new Date(v);
  var t = d.getTime();
  return isNaN(t) ? 0 : t;
}

function CbvWebAppTimelineKanban__homeAlertName_() {
  try {
    if (typeof CBV_WEBAPP_WS_SHEETS !== 'undefined' && CBV_WEBAPP_WS_SHEETS.HOME_ALERT) {
      return CBV_WEBAPP_WS_SHEETS.HOME_ALERT;
    }
  } catch (e) {}
  return 'HOME_ALERT';
}

/**
 * Map a HOME_ALERT row into a normalized read-first record. Returns null when
 * indispensable columns are missing (id-style fallbacks still apply).
 */
function CbvWebAppTimelineKanban__mapRow_(row, idx) {
  var iId = CbvWebAppTimelineKanban__pickIdx_(idx, ['ID', 'ALERT_ID', 'HOME_ALERT_ID']);
  var iStatus = CbvWebAppTimelineKanban__pickIdx_(idx, ['STATUS']);
  var iAssigned = CbvWebAppTimelineKanban__pickIdx_(idx, ['ASSIGNED_TO']);
  var iModule = CbvWebAppTimelineKanban__pickIdx_(idx, ['MODULE_CODE', 'MODULE']);
  var iPriority = CbvWebAppTimelineKanban__pickIdx_(idx, ['PRIORITY_SCORE', 'PRIORITY']);
  var iSlaStatus = CbvWebAppTimelineKanban__pickIdx_(idx, ['SLA_STATUS']);
  var iBreach = CbvWebAppTimelineKanban__pickIdx_(idx, ['SLA_BREACH_LEVEL']);
  var iOp1 = CbvWebAppTimelineKanban__pickIdx_(idx, ['OPERATOR_PRIMARY_TEXT']);
  var iOp2 = CbvWebAppTimelineKanban__pickIdx_(idx, ['OPERATOR_SECONDARY_TEXT']);
  var iOpMeta = CbvWebAppTimelineKanban__pickIdx_(idx, ['OPERATOR_META_TEXT']);
  var iOpNext = CbvWebAppTimelineKanban__pickIdx_(idx, ['OPERATOR_NEXT_ACTION']);
  var iCreated = CbvWebAppTimelineKanban__pickIdx_(idx, ['CREATED_AT', 'CREATEDAT', 'CREATED_DATE']);
  var iUpdated = CbvWebAppTimelineKanban__pickIdx_(idx, ['UPDATED_AT', 'UPDATEDAT', 'UPDATED_DATE']);

  var id = iId !== undefined ? String(row[iId] || '').trim() : '';
  var status = iStatus !== undefined ? String(row[iStatus] || '').trim() : '';
  var assigned = iAssigned !== undefined ? String(row[iAssigned] || '').trim() : '';
  var moduleCode = iModule !== undefined ? String(row[iModule] || '').trim() : 'HOME_ALERT';
  var priority = iPriority !== undefined ? row[iPriority] : '';
  var slaStatus = iSlaStatus !== undefined ? String(row[iSlaStatus] || '').trim() : '';
  var slaBreachLevel = iBreach !== undefined ? CbvWebAppTimelineKanban__toNum_(row[iBreach]) : 0;
  var op1 = iOp1 !== undefined ? String(row[iOp1] || '').trim() : '';
  var op2 = iOp2 !== undefined ? String(row[iOp2] || '').trim() : '';
  var opm = iOpMeta !== undefined ? String(row[iOpMeta] || '').trim() : '';
  var opn = iOpNext !== undefined ? String(row[iOpNext] || '').trim() : '';
  var createdAt = iCreated !== undefined ? row[iCreated] : '';
  var updatedAt = iUpdated !== undefined ? row[iUpdated] : '';
  var timelineAt = updatedAt || createdAt || '';

  return {
    id: id,
    status: status,
    assignedTo: assigned,
    moduleCode: moduleCode || 'HOME_ALERT',
    priority: priority,
    slaStatus: slaStatus,
    slaBreachLevel: slaBreachLevel,
    operatorPrimaryText: op1,
    operatorSecondaryText: op2,
    operatorMetaText: opm,
    operatorNextAction: opn,
    createdAt: createdAt,
    updatedAt: updatedAt,
    timelineAt: timelineAt
  };
}

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

/**
 * Read-first timeline of HOME_ALERT records.
 * options: { limit?: number }
 */
function CbvWebAppTimelineKanban_getTimelineData(options) {
  var warnings = [];
  var errors = [];
  var opts = options || {};
  var limit = opts.limit && opts.limit > 0 ? opts.limit : CBV_WEBAPP_TIMELINE_DEFAULT_LIMIT;

  var got = CbvWebAppTimelineKanban__getSheetSafe_(CbvWebAppTimelineKanban__homeAlertName_());
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppTimelineKanban__out_(false, { count: 0, rows: [] }, warnings, errors);
  }

  var pack = CbvWebAppTimelineKanban__readRows_(got.sheet, Math.max(limit * 2, 200));
  var idx = CbvWebAppTimelineKanban__headerIndex_(pack.headers);

  var hasUpdated = (idx.UPDATED_AT !== undefined) || (idx.UPDATEDAT !== undefined) || (idx.UPDATED_DATE !== undefined);
  var hasCreated = (idx.CREATED_AT !== undefined) || (idx.CREATEDAT !== undefined) || (idx.CREATED_DATE !== undefined);
  var hasStatus = idx.STATUS !== undefined;

  if (!hasUpdated && !hasCreated) warnings.push('HOME_ALERT missing both UPDATED_AT and CREATED_AT; timeline will use insertion order.');
  if (!hasStatus) warnings.push('HOME_ALERT missing STATUS column; timeline rows will show empty status.');
  if (idx.OPERATOR_PRIMARY_TEXT === undefined) warnings.push('HOME_ALERT missing OPERATOR_PRIMARY_TEXT; timeline will fallback to ID.');

  var mapped = [];
  for (var r = 0; r < pack.rows.length; r++) {
    var rec = CbvWebAppTimelineKanban__mapRow_(pack.rows[r], idx);
    if (!rec) continue;
    mapped.push(rec);
  }

  // Sort UPDATED_AT desc, fallback CREATED_AT desc.
  mapped.sort(function(a, b) {
    var au = CbvWebAppTimelineKanban__toTime_(a.updatedAt);
    var bu = CbvWebAppTimelineKanban__toTime_(b.updatedAt);
    if (au !== bu) return bu - au;
    var ac = CbvWebAppTimelineKanban__toTime_(a.createdAt);
    var bc = CbvWebAppTimelineKanban__toTime_(b.createdAt);
    return bc - ac;
  });

  var rows = mapped.slice(0, limit);

  return CbvWebAppTimelineKanban__out_(true, { count: rows.length, rows: rows }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* Kanban                                                              */
/* ------------------------------------------------------------------ */

/**
 * Read-first kanban grouped by STATUS.
 * options: { cardsPerColumn?: number }
 *
 * Cards are read-only. No drag-drop save. No mutation API.
 */
function CbvWebAppTimelineKanban_getKanbanData(options) {
  var warnings = [];
  var errors = [];
  var opts = options || {};
  var cardsPerColumn = opts.cardsPerColumn && opts.cardsPerColumn > 0 ? opts.cardsPerColumn : CBV_WEBAPP_KANBAN_DEFAULT_CARDS_PER_COLUMN;

  var got = CbvWebAppTimelineKanban__getSheetSafe_(CbvWebAppTimelineKanban__homeAlertName_());
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppTimelineKanban__out_(false, { groupBy: 'STATUS', total: 0, columns: [] }, warnings, errors);
  }

  var pack = CbvWebAppTimelineKanban__readRows_(got.sheet, Math.max(cardsPerColumn * 8, 200));
  var idx = CbvWebAppTimelineKanban__headerIndex_(pack.headers);
  var hasStatus = idx.STATUS !== undefined;
  if (!hasStatus) warnings.push('HOME_ALERT missing STATUS column; kanban will group all cards under UNKNOWN.');

  var byStatus = {};
  var ordered = [];
  var total = 0;

  for (var r = 0; r < pack.rows.length; r++) {
    var rec = CbvWebAppTimelineKanban__mapRow_(pack.rows[r], idx);
    if (!rec) continue;
    var status = hasStatus ? (rec.status || 'UNKNOWN') : 'UNKNOWN';
    if (!status) status = 'UNKNOWN';

    if (!byStatus[status]) {
      byStatus[status] = [];
      ordered.push(status);
    }
    byStatus[status].push({
      id: rec.id,
      title: rec.operatorPrimaryText || rec.id || '(no title)',
      status: status,
      assignedTo: rec.assignedTo,
      priority: rec.priority,
      slaStatus: rec.slaStatus,
      slaBreachLevel: rec.slaBreachLevel,
      operatorMetaText: rec.operatorMetaText,
      updatedAt: rec.updatedAt
    });
    total++;
  }

  // Sort cards inside each column: breach desc, then updatedAt desc.
  ordered.forEach(function(st) {
    byStatus[st].sort(function(a, b) {
      var bd = (b.slaBreachLevel || 0) - (a.slaBreachLevel || 0);
      if (bd !== 0) return bd;
      return CbvWebAppTimelineKanban__toTime_(b.updatedAt) - CbvWebAppTimelineKanban__toTime_(a.updatedAt);
    });
  });

  var columns = ordered.map(function(st) {
    var cards = byStatus[st] || [];
    return {
      status: st,
      count: cards.length,
      cards: cards.slice(0, cardsPerColumn)
    };
  });

  return CbvWebAppTimelineKanban__out_(true, {
    groupBy: 'STATUS',
    total: total,
    columns: columns
  }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* Validate                                                            */
/* ------------------------------------------------------------------ */

/**
 * Validate HOME_ALERT readability and detect required/recommended columns.
 * Never throws — surfaces issues as warnings only.
 */
function CbvWebAppTimelineKanban_validate() {
  var warnings = [];
  var errors = [];

  var detail = {
    sheetReadable: false,
    columns: {
      ID: false,
      STATUS: false,
      UPDATED_AT: false,
      CREATED_AT: false,
      ASSIGNED_TO: false,
      SLA_STATUS: false,
      SLA_BREACH_LEVEL: false,
      OPERATOR_PRIMARY_TEXT: false,
      OPERATOR_SECONDARY_TEXT: false,
      OPERATOR_META_TEXT: false,
      OPERATOR_NEXT_ACTION: false
    },
    functions: {
      timeline: typeof CbvWebAppTimelineKanban_getTimelineData === 'function',
      kanban: typeof CbvWebAppTimelineKanban_getKanbanData === 'function'
    },
    noMutationExposed: true,
    mutationProbe: []
  };

  var got = CbvWebAppTimelineKanban__getSheetSafe_(CbvWebAppTimelineKanban__homeAlertName_());
  if (!got.ok) {
    warnings.push(got.warning);
  } else {
    detail.sheetReadable = true;
    try {
      var sh = got.sheet;
      if (sh.getLastRow() >= 1 && sh.getLastColumn() >= 1) {
        var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
        var idx = CbvWebAppTimelineKanban__headerIndex_(headers);

        detail.columns.ID = (idx.ID !== undefined) || (idx.ALERT_ID !== undefined) || (idx.HOME_ALERT_ID !== undefined);
        detail.columns.STATUS = idx.STATUS !== undefined;
        detail.columns.UPDATED_AT = (idx.UPDATED_AT !== undefined) || (idx.UPDATEDAT !== undefined) || (idx.UPDATED_DATE !== undefined);
        detail.columns.CREATED_AT = (idx.CREATED_AT !== undefined) || (idx.CREATEDAT !== undefined) || (idx.CREATED_DATE !== undefined);
        detail.columns.ASSIGNED_TO = idx.ASSIGNED_TO !== undefined;
        detail.columns.SLA_STATUS = idx.SLA_STATUS !== undefined;
        detail.columns.SLA_BREACH_LEVEL = idx.SLA_BREACH_LEVEL !== undefined;
        detail.columns.OPERATOR_PRIMARY_TEXT = idx.OPERATOR_PRIMARY_TEXT !== undefined;
        detail.columns.OPERATOR_SECONDARY_TEXT = idx.OPERATOR_SECONDARY_TEXT !== undefined;
        detail.columns.OPERATOR_META_TEXT = idx.OPERATOR_META_TEXT !== undefined;
        detail.columns.OPERATOR_NEXT_ACTION = idx.OPERATOR_NEXT_ACTION !== undefined;
      } else {
        warnings.push('HOME_ALERT has no header row; timeline/kanban will be empty.');
      }
    } catch (eHeader) {
      warnings.push('HOME_ALERT header read error: ' + (eHeader && eHeader.message ? eHeader.message : String(eHeader)));
    }
  }

  Object.keys(detail.columns).forEach(function(col) {
    if (!detail.columns[col]) warnings.push('Recommended HOME_ALERT column missing: ' + col);
  });

  if (!detail.functions.timeline) errors.push('CbvWebAppTimelineKanban_getTimelineData not defined.');
  if (!detail.functions.kanban) errors.push('CbvWebAppTimelineKanban_getKanbanData not defined.');

  // ---------------------------------------------------------------------
  // Mutation-name probe (Phase 91-scoped, narrow, with explicit allowlist).
  // ---------------------------------------------------------------------
  // SCOPE: only Phase 91 namespace `CbvWebAppTimelineKanban_*`.
  // We DO NOT scan the global runtime — that would falsely flag legacy/business
  // runtime functions (e.g. setTaskStatus, completeTask, taskStartAction,
  // changeHosoStatus, deleteAttachment) that belong to other modules and are
  // explicitly out of Phase 91 scope.
  //
  // RULE: a Phase 91 function is treated as a mutation only when its "action
  // portion" (the name after `CbvWebAppTimelineKanban_` and any leading `_`)
  // STARTS with an operational verb followed by a capitalised noun, e.g.
  // `setStatus`, `resolveAlert`, `completeRow`, `saveCard`. Pure state/render
  // helpers (`mapState`, `renderState`, anything ending in `State`/`State_`)
  // are allowlisted.
  detail.mutationAllowlist = [
    'CbvWebAppTimelineKanban_getTimelineData',
    'CbvWebAppTimelineKanban_getKanbanData',
    'CbvWebAppTimelineKanban_validate',
    'CbvWebAppTimelineKanban_renderTimeline',
    'CbvWebAppTimelineKanban_renderKanban',
    'CbvWebAppTimelineKanban_renderTimelineRow_',
    'CbvWebAppTimelineKanban_renderKanbanColumn_',
    'CbvWebAppTimelineKanban_renderKanbanCard_',
    'CbvWebAppTimelineKanban_renderState_',
    'CbvWebAppTimelineKanban__mapState_',
    'CbvWebAppTimelineKanban__safetyFooter_',
    'CbvWebAppTimelineKanban__warningsBlock_',
    'CbvWebAppTimelineKanban__inlineTimeline_',
    'CbvWebAppTimelineKanban__inlineKanban_',
    'CbvWebAppTimelineKanban__includeComponents_',
    'CbvWebAppTimelineKanban__esc_',
    'CbvWebAppTimelineKanban__formatDate_',
    'CbvWebAppTimelineKanban__slaBadgeClass_',
    'CbvWebAppTimelineKanban__out_',
    'CbvWebAppTimelineKanban__getSheetSafe_',
    'CbvWebAppTimelineKanban__headerIndex_',
    'CbvWebAppTimelineKanban__pickIdx_',
    'CbvWebAppTimelineKanban__readRows_',
    'CbvWebAppTimelineKanban__toNum_',
    'CbvWebAppTimelineKanban__toTime_',
    'CbvWebAppTimelineKanban__homeAlertName_',
    'CbvWebAppTimelineKanban__mapRow_'
  ];

  // UI state helper allowlist (regex):
  //   - anything ending in `State` or `State_` (e.g. mapState, renderState).
  //   - test console functions are allowlisted as part of the test runtime.
  var allowPatterns = [
    /State_?$/,
    /^CbvWebAppTimelineKanban_TestConsole_/
  ];

  // Operational mutation verbs at the START of the action portion.
  // After stripping `CbvWebAppTimelineKanban_` and any leading `_`, the name
  // must start with one of these verbs followed by an upper-case letter to
  // count as an operational action (e.g. `setStatus`, `resolveAlert`).
  var verbRe = /^(set|update|resolve|complete|delete|save|mutate|assign|escalate|claim|drag)[A-Z]/;

  function isMutationName(name) {
    if (typeof name !== 'string') return false;
    if (name.indexOf('CbvWebAppTimelineKanban_') !== 0) return false; // out-of-scope
    if (detail.mutationAllowlist.indexOf(name) >= 0) return false;
    for (var i = 0; i < allowPatterns.length; i++) {
      if (allowPatterns[i].test(name)) return false;
    }
    var action = name.replace(/^CbvWebAppTimelineKanban_/, '').replace(/^_+/, '');
    return verbRe.test(action);
  }

  try {
    var globals = (typeof this !== 'undefined') ? this : {};
    var keys = Object.keys(globals || {});
    for (var k = 0; k < keys.length; k++) {
      var name = keys[k];
      if (isMutationName(name) && typeof globals[name] === 'function') {
        detail.noMutationExposed = false;
        detail.mutationProbe.push(name);
      }
    }
  } catch (eProbe) {
    warnings.push('Mutation probe skipped: ' + (eProbe && eProbe.message ? eProbe.message : String(eProbe)));
  }
  if (!detail.noMutationExposed) {
    errors.push('Phase 91 namespace exposes mutation-like functions: ' + detail.mutationProbe.join(', '));
  }

  var ok = errors.length === 0;
  return CbvWebAppTimelineKanban__out_(ok, detail, warnings, errors);
}
