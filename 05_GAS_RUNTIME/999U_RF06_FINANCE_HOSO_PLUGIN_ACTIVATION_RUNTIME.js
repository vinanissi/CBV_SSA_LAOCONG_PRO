/**
 * PHASE_RF_06 — Finance + HO_SO Plugin Activation Runtime v1
 *
 * Read-first projections, search, alerts, timeline. No schema change. No auto-execute.
 */

var CBV_RF06_PHASE_ID = 'PHASE_RF_06_FINANCE_HOSO_PLUGIN_ACTIVATION';
var CBV_RF06_CONTRACT_VERSION = 'CBV_RF06_V1';

function CBV_Rf06__safeEnvelope_(payload) {
  var p = payload || {};
  return {
    ok: p.ok !== false,
    phase: CBV_RF06_PHASE_ID,
    contractVersion: CBV_RF06_CONTRACT_VERSION,
    empty: p.empty === true,
    data: p.data != null ? p.data : null,
    warnings: p.warnings || [],
    errors: p.errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CBV_Rf06__href_(path, params) {
  if (typeof CBV_Plugin__href_ === 'function') return CBV_Plugin__href_(path, params);
  return path;
}

function CBV_Rf06__loadRows_(sheetName) {
  var warnings = [];
  try {
    var ss = SpreadsheetApp.getActive();
    var sheet = ss ? ss.getSheetByName(sheetName) : null;
    if (!sheet || sheet.getLastRow() < 2) {
      return { rows: [], warnings: ['SHEET_EMPTY_OR_MISSING:' + sheetName] };
    }
    if (typeof loadSheetDataSafe === 'function') {
      var loaded = loadSheetDataSafe(sheet, sheetName);
      return { rows: (loaded && loaded.rows) ? loaded.rows : [], warnings: warnings };
    }
    if (typeof hosoRepoLoadSafe === 'function') {
      var h = hosoRepoLoadSafe(sheetName);
      return { rows: h.rows || [], warnings: warnings };
    }
  } catch (e) {
    warnings.push('LOAD_ERROR:' + sheetName + ':' + (e.message || String(e)));
  }
  return { rows: [], warnings: warnings };
}

function CBV_Rf06__assertFinanceView_(ctx) {
  CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.FINANCE_VIEW, null);
}

function CBV_Rf06__assertHoSoView_(ctx) {
  CBV_Permission_assertCan(ctx, CBV_PERMISSION_ACTIONS.HO_SO_VIEW, null);
}

function CBV_Rf06__canFinance_(ctx) {
  return CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.FINANCE_VIEW, null);
}

function CBV_Rf06__canHoSo_(ctx) {
  return CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.HO_SO_VIEW, null);
}

function CBV_Rf06Finance__mapType_(row) {
  var tt = String(row.TRANS_TYPE || '').toUpperCase();
  if (tt === 'INCOME') return 'RECEIVABLE';
  if (tt === 'EXPENSE') return 'PAYABLE';
  var cat = String(row.CATEGORY || '').toUpperCase();
  if (cat.indexOf('THU') >= 0) return 'RECEIVABLE';
  if (cat.indexOf('CHI') >= 0 || cat.indexOf('LUONG') >= 0) return 'PAYABLE';
  if (!row.EVIDENCE_URL && !row.REFERENCE_NO) return 'DOCUMENT_MISSING';
  return 'UNKNOWN';
}

function CBV_Rf06Finance__mapStatus_(row, attachmentCount) {
  var st = String(row.STATUS || '').toUpperCase();
  if (st === 'CONFIRMED' || st === 'ARCHIVED') return 'CONFIRMED';
  if (st === 'NEW') {
    if (attachmentCount === 0 && !row.EVIDENCE_URL) return 'MISSING_DOCUMENT';
    return 'WAITING_CONFIRMATION';
  }
  if (st === 'CANCELLED') return 'UNKNOWN';
  if (!row.AMOUNT && row.AMOUNT !== 0) return 'UNKNOWN';
  return 'PENDING';
}

function CBV_Rf06Finance__buildAttachmentIndex_() {
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS) ? CBV_CONFIG.SHEETS.FINANCE_ATTACHMENT : 'FINANCE_ATTACHMENT';
  var loaded = CBV_Rf06__loadRows_(sheetName);
  var idx = {};
  (loaded.rows || []).forEach(function (r) {
    var fid = String(r.FINANCE_ID || '');
    if (!fid) return;
    idx[fid] = (idx[fid] || 0) + 1;
  });
  return { index: idx, warnings: loaded.warnings };
}

function CBV_Rf06Finance__rowToProjection_(row, attachmentIndex) {
  var warnings = [];
  var id = String(row.ID || row.TRANS_CODE || '').trim();
  if (!id) warnings.push('MISSING_FINANCE_ID');
  var attCount = attachmentIndex[id] || 0;
  if (!row.AMOUNT && row.AMOUNT !== 0) warnings.push('MISSING_AMOUNT');
  var amount = row.AMOUNT != null && row.AMOUNT !== '' ? Number(row.AMOUNT) : null;
  if (amount != null && isNaN(amount)) {
    warnings.push('INVALID_AMOUNT');
    amount = null;
  }
  var relatedTaskId = '';
  var relatedHoSoId = '';
  var relType = String(row.RELATED_ENTITY_TYPE || '').toUpperCase();
  var relId = String(row.RELATED_ENTITY_ID || '').trim();
  if (relType === 'TASK') relatedTaskId = relId;
  if (relType === 'HO_SO') relatedHoSoId = relId;

  return {
    financeId: id,
    title: String(row.DESCRIPTION || row.TRANS_CODE || row.CATEGORY || id || 'Giao dịch'),
    type: CBV_Rf06Finance__mapType_(row),
    status: CBV_Rf06Finance__mapStatus_(row, attCount),
    amount: amount,
    currency: 'VND',
    dueDate: row.TRANS_DATE || '',
    owner: row.CREATED_BY || row.CONFIRMED_BY || '',
    relatedTaskId: relatedTaskId,
    relatedHoSoId: relatedHoSoId,
    fileCount: attCount,
    lastUpdated: row.UPDATED_AT || row.CREATED_AT || '',
    source: 'FINANCE_TRANSACTION',
    href: CBV_Rf06__href_('/workspace/plugins/finance/items', { financeId: id }),
    warnings: warnings
  };
}

function CBV_Rf06Finance_getProjection_(userContext, opts) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var o = opts || {};
  var warnings = (ctx.warnings || []).slice();
  try {
    CBV_Rf06__assertFinanceView_(ctx);
  } catch (ePerm) {
    return CBV_Rf06__safeEnvelope_({ ok: false, empty: true, data: { items: [] }, errors: [ePerm.message || String(ePerm)] });
  }

  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS) ? CBV_CONFIG.SHEETS.FINANCE_TRANSACTION : 'FINANCE_TRANSACTION';
  var loaded = CBV_Rf06__loadRows_(sheetName);
  warnings = warnings.concat(loaded.warnings || []);
  var att = CBV_Rf06Finance__buildAttachmentIndex_();
  warnings = warnings.concat(att.warnings || []);

  var items = [];
  var limit = o.limit || 100;
  (loaded.rows || []).forEach(function (row) {
    if (row.IS_DELETED === true || String(row.IS_DELETED) === 'true') return;
    var proj = CBV_Rf06Finance__rowToProjection_(row, att.index);
    if (proj.warnings && proj.warnings.length) warnings = warnings.concat(proj.warnings.map(function (w) { return proj.financeId + ':' + w; }));
    items.push(proj);
  });

  if (o.financeId) {
    var fid = String(o.financeId).trim();
    items = items.filter(function (x) { return x.financeId === fid; });
  }
  if (o.statusFilter) {
    var sf = String(o.statusFilter).toUpperCase();
    items = items.filter(function (x) { return x.status === sf; });
  }
  items = items.slice(0, limit);

  return CBV_Rf06__safeEnvelope_({
    ok: true,
    empty: items.length === 0,
    data: { items: items, source: sheetName, recordCount: items.length, readable: loaded.warnings.indexOf('SHEET_EMPTY_OR_MISSING:' + sheetName) < 0 },
    warnings: warnings
  });
}

function CBV_Rf06HoSo__docGroupToMissing_(docType, fileGroup) {
  var d = String(docType || fileGroup || '').toUpperCase();
  if (d.indexOf('CCCD') >= 0 || d.indexOf('CMND') >= 0) return 'CCCD';
  if (d.indexOf('GPLX') >= 0 || d.indexOf('LIX') >= 0) return 'GPLX';
  if (d.indexOf('DANG_KIEM') >= 0 || d.indexOf('DK') >= 0) return 'DANG_KIEM';
  if (d.indexOf('BAO_HIEM') >= 0 || d.indexOf('INSUR') >= 0) return 'BAO_HIEM';
  if (d.indexOf('HOP_DONG') >= 0 || d.indexOf('CONTRACT') >= 0) return 'HOP_DONG';
  return d ? 'OTHER' : '';
}

function CBV_Rf06HoSo__buildFileIndex_() {
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS) ? CBV_CONFIG.SHEETS.HO_SO_FILE : 'HO_SO_FILE';
  var loaded = CBV_Rf06__loadRows_(sheetName);
  var idx = {};
  (loaded.rows || []).forEach(function (r) {
    var hid = String(r.HO_SO_ID || '');
    if (!hid) return;
    if (!idx[hid]) idx[hid] = { files: [], docTypes: {} };
    idx[hid].files.push(r);
    var dt = String(r.DOC_TYPE || r.FILE_GROUP || '');
    if (dt) idx[hid].docTypes[dt] = true;
  });
  return { index: idx, warnings: loaded.warnings };
}

function CBV_Rf06HoSo__mapStatus_(row, fileMeta) {
  var st = String(row.STATUS || '').toUpperCase();
  if (st === 'NEED_REVIEW' || st === 'PENDING_REVIEW') return 'NEED_REVIEW';
  var missing = fileMeta.missingDocuments || [];
  if (missing.length) return 'MISSING_DOCUMENT';
  var exp = fileMeta.nearestExpiry;
  if (exp && exp.expired) return 'EXPIRED';
  if (exp && exp.soon) return 'EXPIRED_SOON';
  if (st === 'ACTIVE' || st === 'COMPLETE') return 'COMPLETE';
  if (st === 'NEW') return 'NEED_REVIEW';
  return st || 'UNKNOWN';
}

function CBV_Rf06HoSo__analyzeFiles_(files) {
  var missing = [];
  var required = ['CCCD', 'GPLX', 'DANG_KIEM'];
  var present = {};
  var nearestExpiry = null;
  var now = new Date();
  var soonDays = 30;
  (files || []).forEach(function (f) {
    var key = CBV_Rf06HoSo__docGroupToMissing_(f.DOC_TYPE, f.FILE_GROUP);
    if (key) present[key] = true;
    if (f.EXPIRY_DATE) {
      try {
        var exp = new Date(f.EXPIRY_DATE);
        if (!isNaN(exp.getTime())) {
          var days = Math.floor((exp.getTime() - now.getTime()) / 86400000);
          if (!nearestExpiry || exp < nearestExpiry.date) {
            nearestExpiry = { date: exp, days: days, expired: days < 0, soon: days >= 0 && days <= soonDays };
          }
        }
      } catch (e0) { /* */ }
    }
  });
  required.forEach(function (req) {
    if (!present[req]) missing.push(req);
  });
  var total = Object.keys(present).length;
  var completeness = required.length ? Math.round((required.length - missing.length) / required.length * 100) : (total > 0 ? 100 : 0);
  return { missingDocuments: missing, documentCompleteness: completeness, nearestExpiry: nearestExpiry, fileCount: (files || []).length };
}

function CBV_Rf06HoSo__rowToProjection_(row, fileIndex) {
  var warnings = [];
  var id = String(row.ID || '').trim();
  if (!id) warnings.push('MISSING_HOSO_ID');
  var files = (fileIndex[id] && fileIndex[id].files) ? fileIndex[id].files : [];
  var meta = CBV_Rf06HoSo__analyzeFiles_(files);
  var personName = String(row.FULL_NAME || row.DISPLAY_NAME || row.NAME || row.TITLE || '').trim();
  if (!personName) warnings.push('MISSING_PERSON_NAME');
  var plate = '';
  var tags = String(row.TAGS_TEXT || row.SUMMARY || row.TITLE || '');
  var plateMatch = tags.match(/[0-9]{2}[A-Z]{1,2}[-.]?[0-9]{3,5}/i);
  if (plateMatch) plate = plateMatch[0];
  var relatedTaskId = '';
  var relatedFinanceId = '';
  if (String(row.RELATED_ENTITY_TYPE || '').toUpperCase() === 'TASK') relatedTaskId = String(row.RELATED_ENTITY_ID || '');
  if (String(row.RELATED_ENTITY_TYPE || '').toUpperCase() === 'FINANCE_TRANSACTION') relatedFinanceId = String(row.RELATED_ENTITY_ID || '');

  return {
    hoSoId: id,
    personName: personName || String(row.HO_SO_CODE || id),
    phone: String(row.PHONE || ''),
    vehiclePlate: plate,
    status: CBV_Rf06HoSo__mapStatus_(row, meta),
    missingDocuments: meta.missingDocuments,
    documentCompleteness: meta.documentCompleteness,
    relatedTaskId: relatedTaskId,
    relatedFinanceId: relatedFinanceId,
    fileCount: meta.fileCount,
    lastUpdated: row.UPDATED_AT || row.CREATED_AT || '',
    source: 'HO_SO_MASTER',
    href: CBV_Rf06__href_('/workspace/plugins/ho-so/items', { hoSoId: id }),
    warnings: warnings
  };
}

function CBV_Rf06HoSo_getProjection_(userContext, opts) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var o = opts || {};
  var warnings = (ctx.warnings || []).slice();
  try {
    CBV_Rf06__assertHoSoView_(ctx);
  } catch (ePerm) {
    return CBV_Rf06__safeEnvelope_({ ok: false, empty: true, data: { items: [] }, errors: [ePerm.message || String(ePerm)] });
  }

  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS) ? CBV_CONFIG.SHEETS.HO_SO_MASTER : 'HO_SO_MASTER';
  var loaded = CBV_Rf06__loadRows_(sheetName);
  warnings = warnings.concat(loaded.warnings || []);
  var fileIdx = CBV_Rf06HoSo__buildFileIndex_();
  warnings = warnings.concat(fileIdx.warnings || []);

  var items = [];
  (loaded.rows || []).forEach(function (row) {
    if (row.IS_DELETED === true || String(row.IS_DELETED) === 'true') return;
    var proj = CBV_Rf06HoSo__rowToProjection_(row, fileIdx.index);
    items.push(proj);
  });

  if (o.hoSoId) {
    var hid = String(o.hoSoId).trim();
    items = items.filter(function (x) { return x.hoSoId === hid; });
  }
  if (o.statusFilter) {
    var sf = String(o.statusFilter).toUpperCase();
    items = items.filter(function (x) { return x.status === sf; });
  }
  items = items.slice(0, o.limit || 100);

  return CBV_Rf06__safeEnvelope_({
    ok: true,
    empty: items.length === 0,
    data: { items: items, source: sheetName, recordCount: items.length, readable: loaded.warnings.indexOf('SHEET_EMPTY_OR_MISSING:' + sheetName) < 0 },
    warnings: warnings
  });
}

function CBV_Rf06Finance_search_(userContext, keyword) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var q = String(keyword || '').trim().toLowerCase();
  if (!CBV_Rf06__canFinance_(ctx)) return [];
  if (q.length < 2 && q.indexOf('_') < 0 && q.indexOf('-') < 0) return [];
  var env = CBV_Rf06Finance_getProjection_(ctx, { limit: 200 });
  if (!env.ok) return [];
  var out = [];
  (env.data.items || []).forEach(function (item) {
    var hay = [item.financeId, item.title, item.status, item.type, item.relatedTaskId, item.relatedHoSoId, String(item.amount != null ? item.amount : '')].join(' ').toLowerCase();
    if (hay.indexOf(q) < 0) return;
    out.push({
      id: item.financeId,
      type: 'FINANCE',
      title: item.title,
      subtitle: item.status + (item.amount != null ? ' · ' + item.amount : ''),
      status: item.status,
      module: 'FINANCE',
      href: item.href,
      matchedField: 'finance',
      permissionAllowed: true
    });
    if (out.length >= 20) return;
  });
  return out;
}

function CBV_Rf06HoSo_search_(userContext, keyword) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var q = String(keyword || '').trim().toLowerCase();
  if (!CBV_Rf06__canHoSo_(ctx)) return [];
  if (q.length < 2 && q.indexOf('_') < 0 && q.indexOf('-') < 0) return [];
  var env = CBV_Rf06HoSo_getProjection_(ctx, { limit: 200 });
  if (!env.ok) return [];
  var out = [];
  (env.data.items || []).forEach(function (item) {
    var hay = [item.hoSoId, item.personName, item.phone, item.vehiclePlate, item.status].join(' ').toLowerCase();
    if (hay.indexOf(q) < 0) return;
    out.push({
      id: item.hoSoId,
      type: 'HO_SO',
      title: item.personName,
      subtitle: item.status + (item.vehiclePlate ? ' · ' + item.vehiclePlate : ''),
      status: item.status,
      module: 'HO_SO',
      href: item.href,
      matchedField: 'hoso',
      permissionAllowed: true
    });
    if (out.length >= 20) return;
  });
  return out;
}

function CBV_Rf06Finance_getAlerts_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  if (!CBV_Rf06__canFinance_(ctx)) {
    return CBV_Rf06__safeEnvelope_({ ok: false, data: { alerts: [], autoResolve: false, autoEscalate: false }, errors: ['FINANCE_VIEW denied'] });
  }
  var env = CBV_Rf06Finance_getProjection_(ctx, { limit: 200 });
  var alerts = [];
  var now = new Date();
  (env.data && env.data.items ? env.data.items : []).forEach(function (item) {
    if (item.status === 'WAITING_CONFIRMATION') {
      alerts.push({
        alertId: 'fin-wait-' + item.financeId,
        type: 'FINANCE_WAITING_CONFIRMATION',
        severity: 'WARNING',
        title: 'Chờ xác nhận thanh toán',
        message: item.title,
        module: 'FINANCE',
        resourceId: item.financeId,
        href: item.href,
        nextStep: 'Xác nhận thủ công (EXECUTION_LOCKED)',
        createdAt: now.toISOString(),
        autoResolve: false,
        autoEscalate: false
      });
    }
    if (item.status === 'MISSING_DOCUMENT') {
      alerts.push({
        alertId: 'fin-doc-' + item.financeId,
        type: 'FINANCE_MISSING_DOCUMENT',
        severity: 'WARNING',
        title: 'Thiếu chứng từ',
        message: item.title,
        module: 'FINANCE',
        resourceId: item.financeId,
        href: item.href,
        nextStep: 'Bổ sung chứng từ thủ công',
        createdAt: now.toISOString(),
        autoResolve: false,
        autoEscalate: false
      });
    }
    if (item.type === 'RECEIVABLE' && item.status === 'PENDING') {
      alerts.push({
        alertId: 'fin-recv-' + item.financeId,
        type: 'FINANCE_RECEIVABLE',
        severity: 'OK',
        title: 'Khoản cần thu',
        message: item.title,
        module: 'FINANCE',
        resourceId: item.financeId,
        href: item.href,
        nextStep: 'Theo dõi thu',
        createdAt: now.toISOString(),
        autoResolve: false,
        autoEscalate: false
      });
    }
    if (item.type === 'PAYABLE' && item.status !== 'CONFIRMED') {
      alerts.push({
        alertId: 'fin-pay-' + item.financeId,
        type: 'FINANCE_PAYABLE',
        severity: 'WARNING',
        title: 'Khoản cần chi',
        message: item.title,
        module: 'FINANCE',
        resourceId: item.financeId,
        href: item.href,
        nextStep: 'Xử lý chi thủ công',
        createdAt: now.toISOString(),
        autoResolve: false,
        autoEscalate: false
      });
    }
    if (item.warnings && item.warnings.indexOf('MISSING_AMOUNT') >= 0) {
      alerts.push({
        alertId: 'fin-amt-' + item.financeId,
        type: 'FINANCE_UNKNOWN_AMOUNT',
        severity: 'WARNING',
        title: 'Amount unknown',
        message: item.title,
        module: 'FINANCE',
        resourceId: item.financeId,
        href: item.href,
        nextStep: 'Kiểm tra sheet FINANCE_TRANSACTION',
        createdAt: now.toISOString(),
        autoResolve: false,
        autoEscalate: false
      });
    }
  });
  return CBV_Rf06__safeEnvelope_({ ok: true, data: { alerts: alerts.slice(0, 30), autoResolve: false, autoEscalate: false }, warnings: env.warnings });
}

function CBV_Rf06HoSo_getAlerts_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  if (!CBV_Rf06__canHoSo_(ctx)) {
    return CBV_Rf06__safeEnvelope_({ ok: false, data: { alerts: [], autoResolve: false, autoEscalate: false }, errors: ['HO_SO_VIEW denied'] });
  }
  var env = CBV_Rf06HoSo_getProjection_(ctx, { limit: 200 });
  var alerts = [];
  var now = new Date();
  (env.data && env.data.items ? env.data.items : []).forEach(function (item) {
    if (item.status === 'MISSING_DOCUMENT') {
      alerts.push({
        alertId: 'hs-doc-' + item.hoSoId,
        type: 'HOSO_MISSING_DOCUMENT',
        severity: 'WARNING',
        title: 'Thiếu giấy tờ',
        message: item.personName + ' — ' + (item.missingDocuments || []).join(', '),
        module: 'HO_SO',
        resourceId: item.hoSoId,
        href: item.href,
        nextStep: 'Bổ sung giấy tờ',
        createdAt: now.toISOString(),
        autoResolve: false,
        autoEscalate: false
      });
    }
    if (item.status === 'EXPIRED_SOON') {
      alerts.push({
        alertId: 'hs-exp-soon-' + item.hoSoId,
        type: 'HOSO_EXPIRED_SOON',
        severity: 'WARNING',
        title: 'Giấy tờ sắp hết hạn',
        message: item.personName,
        module: 'HO_SO',
        resourceId: item.hoSoId,
        href: item.href,
        nextStep: 'Gia hạn thủ công',
        createdAt: now.toISOString(),
        autoResolve: false,
        autoEscalate: false
      });
    }
    if (item.status === 'EXPIRED') {
      alerts.push({
        alertId: 'hs-exp-' + item.hoSoId,
        type: 'HOSO_EXPIRED',
        severity: 'ERROR',
        title: 'Giấy tờ hết hạn',
        message: item.personName,
        module: 'HO_SO',
        resourceId: item.hoSoId,
        href: item.href,
        nextStep: 'Cập nhật giấy tờ',
        createdAt: now.toISOString(),
        autoResolve: false,
        autoEscalate: false
      });
    }
    if (item.status === 'NEED_REVIEW') {
      alerts.push({
        alertId: 'hs-review-' + item.hoSoId,
        type: 'HOSO_NEED_REVIEW',
        severity: 'OK',
        title: 'Hồ sơ cần review',
        message: item.personName,
        module: 'HO_SO',
        resourceId: item.hoSoId,
        href: item.href,
        nextStep: 'Review thủ công',
        createdAt: now.toISOString(),
        autoResolve: false,
        autoEscalate: false
      });
    }
    if (!item.phone) {
      alerts.push({
        alertId: 'hs-phone-' + item.hoSoId,
        type: 'HOSO_MISSING_PHONE',
        severity: 'OK',
        title: 'Thiếu SĐT',
        message: item.personName,
        module: 'HO_SO',
        resourceId: item.hoSoId,
        href: item.href,
        nextStep: 'Bổ sung SĐT trên sheet',
        createdAt: now.toISOString(),
        autoResolve: false,
        autoEscalate: false
      });
    }
  });
  return CBV_Rf06__safeEnvelope_({ ok: true, data: { alerts: alerts.slice(0, 30), autoResolve: false, autoEscalate: false }, warnings: env.warnings });
}

function CBV_Rf06Finance_getTimeline_(userContext, financeId) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  try { CBV_Rf06__assertFinanceView_(ctx); } catch (e) {
    return CBV_Rf06__safeEnvelope_({ ok: false, empty: true, data: { items: [] }, errors: [e.message] });
  }
  var fid = String(financeId || '').trim();
  var items = [];
  if (fid) {
    var logSheet = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS) ? CBV_CONFIG.SHEETS.FINANCE_LOG : 'FINANCE_LOG';
    var loaded = CBV_Rf06__loadRows_(logSheet);
    (loaded.rows || []).forEach(function (r) {
      if (String(r.FIN_ID || '') !== fid) return;
      items.push({
        time: r.CREATED_AT || '',
        actor: r.ACTOR_ID || '',
        module: 'FINANCE',
        action: r.ACTION || '',
        message: r.NOTE || r.ACTION || '',
        source: 'FINANCE_LOG',
        resourceId: fid
      });
    });
  }
  return CBV_Rf06__safeEnvelope_({
    ok: true,
    empty: items.length === 0,
    data: { items: items, stub: items.length === 0 },
    warnings: items.length === 0 ? ['FINANCE_TIMELINE_EMPTY'] : []
  });
}

function CBV_Rf06HoSo_getTimeline_(userContext, hoSoId) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  try { CBV_Rf06__assertHoSoView_(ctx); } catch (e) {
    return CBV_Rf06__safeEnvelope_({ ok: false, empty: true, data: { items: [] }, errors: [e.message] });
  }
  var hid = String(hoSoId || '').trim();
  var items = [];
  if (hid) {
    var logSheet = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS) ? CBV_CONFIG.SHEETS.HO_SO_UPDATE_LOG : 'HO_SO_UPDATE_LOG';
    var loaded = CBV_Rf06__loadRows_(logSheet);
    (loaded.rows || []).forEach(function (r) {
      if (String(r.HO_SO_ID || '') !== hid) return;
      items.push({
        time: r.CREATED_AT || '',
        actor: r.ACTOR_ID || '',
        module: 'HO_SO',
        action: r.ACTION || r.UPDATE_TYPE || '',
        message: r.NOTE || r.CONTENT || '',
        source: 'HO_SO_UPDATE_LOG',
        resourceId: hid
      });
    });
  }
  return CBV_Rf06__safeEnvelope_({
    ok: true,
    empty: items.length === 0,
    data: { items: items, stub: items.length === 0 },
    warnings: items.length === 0 ? ['HOSO_TIMELINE_EMPTY'] : []
  });
}

function CBV_Rf06Finance_getWorkboardModel_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var env = CBV_Rf06Finance_getProjection_(ctx, { limit: 200 });
  if (!env.ok) return env;
  var items = env.data.items || [];
  var cards = {
    receivable: items.filter(function (x) { return x.type === 'RECEIVABLE'; }).length,
    payable: items.filter(function (x) { return x.type === 'PAYABLE'; }).length,
    waitingConfirmation: items.filter(function (x) { return x.status === 'WAITING_CONFIRMATION'; }).length,
    missingDocument: items.filter(function (x) { return x.status === 'MISSING_DOCUMENT'; }).length,
    total: items.length
  };
  return CBV_Rf06__safeEnvelope_({ ok: true, data: { cards: cards, items: items.slice(0, 20), source: env.data.source } });
}

function CBV_Rf06HoSo_getWorkboardModel_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var env = CBV_Rf06HoSo_getProjection_(ctx, { limit: 200 });
  if (!env.ok) return env;
  var items = env.data.items || [];
  var cards = {
    missingDocument: items.filter(function (x) { return x.status === 'MISSING_DOCUMENT'; }).length,
    needReview: items.filter(function (x) { return x.status === 'NEED_REVIEW'; }).length,
    expiredSoon: items.filter(function (x) { return x.status === 'EXPIRED_SOON'; }).length,
    expired: items.filter(function (x) { return x.status === 'EXPIRED'; }).length,
    total: items.length
  };
  return CBV_Rf06__safeEnvelope_({ ok: true, data: { cards: cards, items: items.slice(0, 20), source: env.data.source } });
}

function CBV_Rf06PluginObservation_getHealth_(userContext) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var plugins = [];
  if (CBV_Rf06__canFinance_(ctx)) {
    var fin = CBV_Rf06Finance_getProjection_(ctx, { limit: 5 });
    var finAlerts = CBV_Rf06Finance_getAlerts_(ctx);
    plugins.push({
      pluginId: 'cbv-plugin-finance',
      module: 'FINANCE',
      ok: fin.ok && fin.data && fin.data.readable !== false,
      status: (fin.data && fin.data.recordCount > 0) ? 'ACTIVE_READONLY' : 'PARTIAL',
      severity: fin.ok ? 'OK' : 'WARNING',
      message: 'Records: ' + ((fin.data && fin.data.recordCount) || 0) + ' · Alerts: ' + ((finAlerts.data && finAlerts.data.alerts) ? finAlerts.data.alerts.length : 0),
      nextStep: 'Read-only projection',
      checkedAt: new Date().toISOString(),
      permissionOk: true
    });
  }
  if (CBV_Rf06__canHoSo_(ctx)) {
    var hs = CBV_Rf06HoSo_getProjection_(ctx, { limit: 5 });
    var hsAlerts = CBV_Rf06HoSo_getAlerts_(ctx);
    plugins.push({
      pluginId: 'cbv-plugin-ho-so',
      module: 'HO_SO',
      ok: hs.ok && hs.data && hs.data.readable !== false,
      status: (hs.data && hs.data.recordCount > 0) ? 'ACTIVE_READONLY' : 'PARTIAL',
      severity: hs.ok ? 'OK' : 'WARNING',
      message: 'Records: ' + ((hs.data && hs.data.recordCount) || 0) + ' · Alerts: ' + ((hsAlerts.data && hsAlerts.data.alerts) ? hsAlerts.data.alerts.length : 0),
      nextStep: 'Read-only projection',
      checkedAt: new Date().toISOString(),
      permissionOk: true
    });
  }
  return CBV_Rf06__safeEnvelope_({ ok: true, data: { plugins: plugins } });
}
