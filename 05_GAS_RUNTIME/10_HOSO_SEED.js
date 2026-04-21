/**
 * HO_SO Seed — MASTER_CODE (HO_SO_TYPE) + optional demo HO_SO_MASTER row.
 * Idempotent: skip existing CODE in MASTER_GROUP HO_SO_TYPE.
 */

var HOSO_TYPE_MASTER_ROWS = [
  { CODE: 'HTX', NAME: 'Hợp tác xã', DISPLAY_TEXT: 'Hợp tác xã', SORT_ORDER: 0 },
  { CODE: 'HOP_DONG', NAME: 'Hợp đồng', DISPLAY_TEXT: 'Hợp đồng', SORT_ORDER: 1 },
  { CODE: 'GIAY_TO_CA_NHAN', NAME: 'Giấy tờ cá nhân', DISPLAY_TEXT: 'Giấy tờ cá nhân', SORT_ORDER: 2 },
  { CODE: 'HO_SO_XA_VIEN', NAME: 'Hồ sơ xã viên', DISPLAY_TEXT: 'Hồ sơ xã viên', SORT_ORDER: 3 },
  { CODE: 'HO_SO_TAI_XE', NAME: 'Hồ sơ tài xế', DISPLAY_TEXT: 'Hồ sơ tài xế', SORT_ORDER: 4 },
  { CODE: 'HO_SO_PHUONG_TIEN', NAME: 'Hồ sơ phương tiện', DISPLAY_TEXT: 'Hồ sơ phương tiện', SORT_ORDER: 5 },
  { CODE: 'BIEN_BAN', NAME: 'Biên bản', DISPLAY_TEXT: 'Biên bản', SORT_ORDER: 6 },
  { CODE: 'DON_DE_NGHI', NAME: 'Đơn đề nghị', DISPLAY_TEXT: 'Đơn đề nghị', SORT_ORDER: 7 },
  { CODE: 'HO_SO_PHAP_LY', NAME: 'Hồ sơ pháp lý', DISPLAY_TEXT: 'Hồ sơ pháp lý', SORT_ORDER: 8 },
  { CODE: 'KHAC', NAME: 'Khác', DISPLAY_TEXT: 'Khác', SORT_ORDER: 99 }
];

function seedHosoMasterData_() {
  var added = 0;
  var now = cbvNow();
  var user = cbvUser();
  if (!SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.MASTER_CODE)) {
    return { ok: false, message: 'MASTER_CODE missing', added: 0 };
  }
  var existing = {};
  (typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE) : []).forEach(function(row) {
    if (String(row.MASTER_GROUP || '').trim() === HOSO_MASTER_GROUP_TYPE) {
      existing[String(row.CODE || '').trim()] = true;
    }
  });

  HOSO_TYPE_MASTER_ROWS.forEach(function(spec) {
    if (existing[spec.CODE]) return;
    var rec = {
      ID: cbvMakeId('MC'),
      MASTER_GROUP: HOSO_MASTER_GROUP_TYPE,
      CODE: spec.CODE,
      NAME: spec.NAME,
      DISPLAY_TEXT: spec.DISPLAY_TEXT || spec.NAME,
      STATUS: 'ACTIVE',
      SORT_ORDER: spec.SORT_ORDER,
      IS_SYSTEM: true,
      ALLOW_EDIT: true,
      NOTE: 'HO_SO PRO seed',
      CREATED_AT: now,
      CREATED_BY: user,
      UPDATED_AT: now,
      UPDATED_BY: user,
      IS_DELETED: false
    };
    if (typeof _appendRecord === 'function') _appendRecord(CBV_CONFIG.SHEETS.MASTER_CODE, rec);
    added++;
    existing[spec.CODE] = true;
  });

  if (typeof clearEnumCache === 'function') clearEnumCache();
  return { ok: true, added: added, message: 'HO_SO_TYPE master rows ensured' };
}

/**
 * Resolve HO_SO_TYPE MASTER_CODE ID by CODE. Returns '' if not found.
 */
function hosoFindTypeMasterIdByCode_(code) {
  var target = String(code || '').trim();
  if (!target) return '';
  var rows = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE) : [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (String(r.MASTER_GROUP || '').trim() !== HOSO_MASTER_GROUP_TYPE) continue;
    if (String(r.STATUS || '').trim() !== 'ACTIVE') continue;
    if (String(r.CODE || '').trim() === target) return String(r.ID || '').trim();
  }
  return '';
}

/**
 * Ensure an HTX root HO_SO_MASTER row exists (TITLE=DEMO_HTX_PRO). Returns its ID.
 */
function ensureHosoDemoHtxRoot_() {
  var mrows = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER) : [];
  var existing = mrows.find(function(r) { return String(r.TITLE || '') === 'DEMO_HTX_PRO'; });
  if (existing) return String(existing.ID || '').trim();

  var htxTypeId = hosoFindTypeMasterIdByCode_('HTX');
  if (!htxTypeId) throw new Error('MASTER_CODE HO_SO_TYPE.HTX not seeded; run seedHosoMasterData_ first');

  var res = hosoCreate({
    HO_SO_TYPE_ID: htxTypeId,
    TITLE: 'DEMO_HTX_PRO',
    DISPLAY_NAME: 'HTX Demo (gốc)',
    STATUS: 'ACTIVE',
    SUMMARY: 'Root HTX seeded by ensureHosoDemoHtxRoot_'
  });
  if (!res || res.ok === false) throw new Error('Failed to seed HTX root: ' + JSON.stringify(res));
  return String((res.data && res.data.ID) || res.ID || '').trim();
}

/**
 * Optional demo row — skipped if any row titled DEMO_HOSO_PRO exists.
 * Seeds an HTX root (TITLE=DEMO_HTX_PRO) first and creates a child HOP_DONG
 * referencing that HTX via HTX_ID so validation (hosoValidateHtxIdForHoSoType) passes.
 */
function seedHosoDemoData_() {
  var mrows = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.HO_SO_MASTER) : [];
  if (mrows.some(function(r) { return String(r.TITLE || '') === 'DEMO_HOSO_PRO'; })) {
    return { ok: true, skipped: true, message: 'Demo already present' };
  }

  var htxRootId = ensureHosoDemoHtxRoot_();
  if (!htxRootId) return { ok: false, message: 'Could not ensure HTX root for demo' };

  var childTypeId = hosoFindTypeMasterIdByCode_('HOP_DONG');
  if (!childTypeId) {
    var types = typeof hosoRepoRows === 'function' ? hosoRepoRows(CBV_CONFIG.SHEETS.MASTER_CODE).filter(function(r) {
      return String(r.MASTER_GROUP || '') === HOSO_MASTER_GROUP_TYPE
        && String(r.STATUS || '') === 'ACTIVE'
        && String(r.CODE || '') !== 'HTX';
    }) : [];
    childTypeId = types.length ? String(types[0].ID || '').trim() : '';
  }
  if (!childTypeId) return { ok: false, message: 'No non-HTX HO_SO_TYPE in MASTER_CODE; run seedHosoMasterData_ first' };

  return hosoCreate({
    HO_SO_TYPE_ID: childTypeId,
    HTX_ID: htxRootId,
    TITLE: 'DEMO_HOSO_PRO',
    DISPLAY_NAME: 'Demo hồ sơ PRO',
    STATUS: 'NEW',
    SUMMARY: 'Seeded by seedHosoDemoData_'
  });
}

// ---------------------------------------------------------------------------
// Phase D (2026-04-21): authoritative RULE_DEF seed for HO_SO.
// Every emitted HO_SO event MUST have ≥1 enabled rule. A rule whose only
// action is NOOP still makes RULE_DEF the contract, because:
//   - auditHosoRuleDefCoverage_ passes,
//   - downstream owners can add side-effects by editing ACTIONS_JSON,
//   - the event remains observable in ADMIN_AUDIT_LOG via the queue.
// Upsert key: RULE_CODE (unique, prefixed HOSO_).
// ---------------------------------------------------------------------------

/**
 * Canonical HO_SO rule specs. ACTIONS_JSON is an array; stored as JSON string.
 * @returns {Array<Object>}
 */
function hosoCoreRuleSpecs_() {
  var EVT = {
    CREATED: typeof CBV_CORE_EVENT_TYPE_HO_SO_CREATED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_CREATED : 'HO_SO_CREATED',
    UPDATED: typeof CBV_CORE_EVENT_TYPE_HO_SO_UPDATED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_UPDATED : 'HO_SO_UPDATED',
    STATUS_CHANGED: typeof CBV_CORE_EVENT_TYPE_HO_SO_STATUS_CHANGED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_STATUS_CHANGED : 'HO_SO_STATUS_CHANGED',
    CLOSED: typeof CBV_CORE_EVENT_TYPE_HO_SO_CLOSED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_CLOSED : 'HO_SO_CLOSED',
    DELETED: typeof CBV_CORE_EVENT_TYPE_HO_SO_DELETED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_DELETED : 'HO_SO_DELETED',
    FILE_ADDED: typeof CBV_CORE_EVENT_TYPE_HO_SO_FILE_ADDED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_FILE_ADDED : 'HO_SO_FILE_ADDED',
    FILE_REMOVED: typeof CBV_CORE_EVENT_TYPE_HO_SO_FILE_REMOVED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_FILE_REMOVED : 'HO_SO_FILE_REMOVED',
    RELATION_ADDED: typeof CBV_CORE_EVENT_TYPE_HO_SO_RELATION_ADDED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_RELATION_ADDED : 'HO_SO_RELATION_ADDED',
    RELATION_REMOVED: typeof CBV_CORE_EVENT_TYPE_HO_SO_RELATION_REMOVED !== 'undefined' ? CBV_CORE_EVENT_TYPE_HO_SO_RELATION_REMOVED : 'HO_SO_RELATION_REMOVED'
  };

  var auditAction = function(label) {
    return {
      type: 'INVOKE_SERVICE',
      params: {
        handler: 'HOSO_LOG_AUDIT',
        args: { action: label, message: label + ' $event.REF_ID' }
      }
    };
  };
  var recheckAction = {
    type: 'INVOKE_SERVICE',
    params: {
      handler: 'HOSO_RECHECK_COMPLETENESS',
      args: { hosoId: '$event.REF_ID' }
    }
  };

  return [
    { code: 'HOSO_CREATED_AUDIT',           priority: 10, eventType: EVT.CREATED,          note: 'Audit every new HO_SO',                                         actions: [auditAction('HO_SO_CREATED')] },
    { code: 'HOSO_UPDATED_AUDIT',           priority: 10, eventType: EVT.UPDATED,          note: 'Audit every HO_SO field mutation',                              actions: [auditAction('HO_SO_UPDATED')] },
    { code: 'HOSO_STATUS_CHANGED_AUDIT',    priority: 10, eventType: EVT.STATUS_CHANGED,   note: 'Audit every status transition',                                 actions: [auditAction('HO_SO_STATUS_CHANGED')] },
    { code: 'HOSO_CLOSED_AUDIT',            priority: 10, eventType: EVT.CLOSED,           note: 'Audit close events (separate from generic status change)',       actions: [auditAction('HO_SO_CLOSED')] },
    { code: 'HOSO_DELETED_AUDIT',           priority: 10, eventType: EVT.DELETED,          note: 'Audit soft-delete',                                             actions: [auditAction('HO_SO_DELETED')] },
    { code: 'HOSO_FILE_ADDED_RECHECK',      priority: 20, eventType: EVT.FILE_ADDED,       note: 'Recompute completeness when a file is attached',                actions: [auditAction('HO_SO_FILE_ADDED'), recheckAction] },
    { code: 'HOSO_FILE_REMOVED_RECHECK',    priority: 20, eventType: EVT.FILE_REMOVED,     note: 'Recompute completeness when a file is detached',                actions: [auditAction('HO_SO_FILE_REMOVED'), recheckAction] },
    { code: 'HOSO_RELATION_ADDED_AUDIT',    priority: 30, eventType: EVT.RELATION_ADDED,   note: 'Audit new relation edge',                                        actions: [auditAction('HO_SO_RELATION_ADDED')] },
    { code: 'HOSO_RELATION_REMOVED_AUDIT',  priority: 30, eventType: EVT.RELATION_REMOVED, note: 'Audit relation removal',                                         actions: [auditAction('HO_SO_RELATION_REMOVED')] }
  ];
}

/**
 * Idempotent upsert of canonical HO_SO rules into RULE_DEF.
 * Upsert key: RULE_CODE. Enabled=true. Bumps UPDATED_AT and VERSION on change.
 * @returns {{ok:boolean, added:number, updated:number, skipped:number, total:number}}
 */
function hosoSeedCoreRules_() {
  var sheetName = CBV_CONFIG && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.RULE_DEF;
  if (!sheetName) return { ok: false, message: 'RULE_DEF sheet name missing in CBV_CONFIG' };
  if (!SpreadsheetApp.getActive().getSheetByName(sheetName)) {
    return { ok: false, message: 'RULE_DEF sheet missing — run ensureCoreSheetsExist first' };
  }

  var sheet = typeof _sheet === 'function' ? _sheet(sheetName) : null;
  var rows = sheet && typeof _rows === 'function' ? _rows(sheet) : [];
  var byCode = {};
  rows.forEach(function(r) {
    if (!r) return;
    var code = String(r.RULE_CODE || '').trim();
    if (code) byCode[code] = r;
  });

  var specs = hosoCoreRuleSpecs_();
  var now = cbvNow();
  var user = cbvUser();
  var added = 0;
  var updated = 0;
  var skipped = 0;

  specs.forEach(function(spec) {
    var actionsJson = JSON.stringify(spec.actions || []);
    var existing = byCode[spec.code];
    if (!existing) {
      var rec = {
        ID: cbvMakeId('RULE'),
        RULE_CODE: spec.code,
        PRIORITY: spec.priority,
        ENABLED: true,
        EVENT_TYPE: spec.eventType,
        CONDITION_JSON: '',
        ACTIONS_JSON: actionsJson,
        TARGET_MODULE: 'HO_SO',
        NOTE: spec.note || '',
        VERSION: 1,
        CREATED_AT: now,
        UPDATED_AT: now
      };
      if (typeof _appendRecord === 'function') _appendRecord(sheetName, rec);
      added++;
      return;
    }
    var needsUpdate =
      String(existing.EVENT_TYPE || '').trim() !== spec.eventType ||
      String(existing.ACTIONS_JSON || '').trim() !== actionsJson ||
      String(existing.TARGET_MODULE || '').trim() !== 'HO_SO' ||
      Number(existing.PRIORITY || 0) !== Number(spec.priority) ||
      !(existing.ENABLED === true || String(existing.ENABLED || '').toUpperCase() === 'TRUE');
    if (!needsUpdate) { skipped++; return; }
    if (typeof _updateRow === 'function' && existing._rowNumber) {
      _updateRow(sheetName, existing._rowNumber, {
        PRIORITY: spec.priority,
        ENABLED: true,
        EVENT_TYPE: spec.eventType,
        ACTIONS_JSON: actionsJson,
        TARGET_MODULE: 'HO_SO',
        NOTE: spec.note || existing.NOTE || '',
        VERSION: Number(existing.VERSION || 0) + 1,
        UPDATED_AT: now
      });
      updated++;
    }
  });

  Logger.log('hosoSeedCoreRules_ ok added=' + added + ' updated=' + updated + ' skipped=' + skipped);
  return { ok: true, added: added, updated: updated, skipped: skipped, total: specs.length };
}
