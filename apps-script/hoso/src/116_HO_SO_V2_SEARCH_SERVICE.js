/**
 * HO_SO V2 — search index + query.
 */

/**
 * @param {string} s
 * @returns {string}
 */
function HoSoV2_Search_foldKeyword(s) {
  if (s == null) return '';
  var t = String(s).toLowerCase().trim();
  try {
    if (typeof t.normalize === 'function') {
      t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
  } catch (e) {}
  return t.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * @param {Object} command optional for events
 * @param {string} hoSoId
 */
function hoSoV2SearchSoftDeleteForHoSo_(hoSoId) {
  var sh = hoSoV2GetSheet_('SEARCH_INDEX');
  if (!sh) return;
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var cHo = map['HO_SO_ID'];
  var cSt = map['STATUS'];
  if (!cHo || !cSt) return;
  var last = sh.getLastRow();
  if (last < 2) return;
  var ids = sh.getRange(2, cHo, last, cHo).getValues();
  var sts = sh.getRange(2, cSt, last, cSt).getValues();
  var r;
  var target = String(hoSoId);
  for (r = 0; r < ids.length; r++) {
    if (String(ids[r][0]) === target && String(sts[r][0] || '').toUpperCase() === HO_SO_V2.SEARCH_INDEX_STATUS.ACTIVE) {
      hoSoV2UpdateRow_(sh, r + 2, {
        STATUS: HO_SO_V2.SEARCH_INDEX_STATUS.DELETED,
        UPDATED_AT: cbvCoreV2IsoNow_()
      });
    }
  }
}

/**
 * @param {string} hoSoId
 * @param {Object} [command] for event payload
 */
function HoSoV2_Search_rebuildForHoSo(hoSoId) {
  if (!hoSoId) return { ok: false, message: 'hoSoId required' };
  hoSoV2EnsureSheet_('SEARCH_INDEX', 'SEARCH_INDEX');
  hoSoV2SearchSoftDeleteForHoSo_(hoSoId);

  var masterSheet = hoSoV2GetSheet_('MASTER');
  if (!masterSheet) return { ok: false, message: 'MASTER missing' };
  var mrow = hoSoV2FindRowByColumn_(masterSheet, 'HO_SO_ID', hoSoId);
  if (mrow < 2) return { ok: false, message: 'HO_SO not found' };
  var master = hoSoV2ReadRowAsObject_(masterSheet, mrow);

  var parts = [];
  function add(s) {
    if (s != null && String(s).trim() !== '') parts.push(String(s).trim());
  }
  add(master.HO_SO_CODE);
  add(master.TITLE);

  function collectChild(sheetKey, hoCol) {
    var sh = hoSoV2GetSheet_(sheetKey);
    if (!sh) return [];
    var rows = hoSoV2FindAllRowsByHoSoId_(sh, hoCol, hoSoId);
    var list = [];
    var i;
    for (i = 0; i < rows.length; i++) {
      list.push(hoSoV2ReadRowAsObject_(sh, rows[i]));
    }
    return list;
  }

  var xaList = collectChild('XA_VIEN', 'HO_SO_ID');
  var ptList = collectChild('PHUONG_TIEN', 'HO_SO_ID');
  var txList = collectChild('TAI_XE', 'HO_SO_ID');

  var xi;
  for (xi = 0; xi < xaList.length; xi++) {
    var xv = xaList[xi];
    add(xv.HO_TEN);
    add(xv.CCCD);
    add(xv.PHONE_1);
    add(xv.PHONE_2);
  }
  var pi;
  for (pi = 0; pi < ptList.length; pi++) {
    var pt = ptList[pi];
    add(pt.BIEN_SO);
    add(pt.SO_KHUNG);
    add(pt.SO_MAY);
    add(pt.HIEU_XE);
  }
  var ti;
  for (ti = 0; ti < txList.length; ti++) {
    var tx = txList[ti];
    add(tx.HO_TEN);
    add(tx.CCCD);
    add(tx.PHONE);
    add(tx.GPLX_SO);
  }

  var kw = parts.join(' | ');
  var kwN = HoSoV2_Search_foldKeyword(parts.join(' '));
  var shI = hoSoV2GetSheet_('SEARCH_INDEX');
  var now = cbvCoreV2IsoNow_();

  hoSoV2AppendRow_(shI, {
    SEARCH_ID: hoSoV2NewId_(HO_SO_V2.ID_PREFIX.SEARCH),
    HO_SO_ID: hoSoId,
    ENTITY_TYPE: 'HO_SO',
    ENTITY_ID: hoSoId,
    TITLE: master.TITLE || '',
    KEYWORDS: kw,
    KEYWORDS_NORMALIZED: kwN,
    SOURCE_TABLE: 'AGGREGATE',
    STATUS: HO_SO_V2.SEARCH_INDEX_STATUS.ACTIVE,
    UPDATED_AT: now,
    META_JSON: ''
  });

  function upsertEntityRow(entityType, entityId, title, kws, sourceTable) {
    var p2 = kws.join(' ');
    hoSoV2AppendRow_(shI, {
      SEARCH_ID: hoSoV2NewId_(HO_SO_V2.ID_PREFIX.SEARCH),
      HO_SO_ID: hoSoId,
      ENTITY_TYPE: entityType,
      ENTITY_ID: entityId,
      TITLE: title || '',
      KEYWORDS: p2,
      KEYWORDS_NORMALIZED: HoSoV2_Search_foldKeyword(p2),
      SOURCE_TABLE: sourceTable,
      STATUS: HO_SO_V2.SEARCH_INDEX_STATUS.ACTIVE,
      UPDATED_AT: now,
      META_JSON: ''
    });
  }

  for (xi = 0; xi < xaList.length; xi++) {
    var xvo = xaList[xi];
    var xkw = [xvo.HO_TEN, xvo.CCCD, xvo.PHONE_1, xvo.PHONE_2];
    upsertEntityRow('XA_VIEN', xvo.XA_VIEN_ID, xvo.HO_TEN, xkw, 'HO_SO_XA_VIEN');
  }
  for (pi = 0; pi < ptList.length; pi++) {
    var pto = ptList[pi];
    var pk = [pto.BIEN_SO, pto.SO_KHUNG, pto.SO_MAY, pto.HIEU_XE];
    upsertEntityRow('PHUONG_TIEN', pto.PHUONG_TIEN_ID, pto.BIEN_SO, pk, 'HO_SO_PHUONG_TIEN');
  }
  for (ti = 0; ti < txList.length; ti++) {
    var txo = txList[ti];
    var tk = [txo.HO_TEN, txo.CCCD, txo.PHONE, txo.GPLX_SO];
    upsertEntityRow('TAI_XE', txo.TAI_XE_ID, txo.HO_TEN, tk, 'HO_SO_TAI_XE');
  }

  return { ok: true, keywordsNormalized: kwN };
}

/**
 * @param {Object} payload
 * @returns {Object}
 */
function HoSoV2_Search_search(payload) {
  var p = payload || {};
  var rawKw = p.keyword != null ? String(p.keyword) : '';
  var entityType = p.entityType != null ? String(p.entityType).toUpperCase() : 'ALL';
  var limit = p.limit != null ? Math.min(100, Math.max(1, Number(p.limit))) : 20;

  var folded = HoSoV2_Search_foldKeyword(rawKw);
  if (!folded) {
    return { ok: true, results: [], message: 'Empty keyword' };
  }

  hoSoV2EnsureSheet_('SEARCH_INDEX', 'SEARCH_INDEX');
  var sh = hoSoV2GetSheet_('SEARCH_INDEX');
  var map = cbvCoreV2ReadHeaderMap_(sh);
  var last = sh.getLastRow();
  if (last < 2) return { ok: true, results: [] };

  var cKn = map['KEYWORDS_NORMALIZED'];
  var cHo = map['HO_SO_ID'];
  var cEt = map['ENTITY_TYPE'];
  var cEid = map['ENTITY_ID'];
  var cTit = map['TITLE'];
  var cKw = map['KEYWORDS'];
  var cSt = map['STATUS'];
  if (!cKn || !cHo) return { ok: true, results: [] };

  var vals = sh.getRange(2, 1, last, sh.getLastColumn()).getValues();
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var colIdx = {};
  var h;
  for (h = 0; h < headers.length; h++) {
    var hn = String(headers[h] || '').trim();
    if (hn) colIdx[hn] = h;
  }

  var candidates = [];
  var r;
  for (r = 0; r < vals.length; r++) {
    var row = vals[r];
    var st = String(row[colIdx['STATUS']] || '').toUpperCase();
    if (st !== HO_SO_V2.SEARCH_INDEX_STATUS.ACTIVE) continue;
    var et = String(row[colIdx['ENTITY_TYPE']] || '');
    if (entityType !== 'ALL' && et !== entityType) continue;
    var kn = String(row[colIdx['KEYWORDS_NORMALIZED']] || '');
    if (kn.indexOf(folded) === -1) continue;

    var hoSoId = String(row[colIdx['HO_SO_ID']] || '');
    var title = String(row[colIdx['TITLE']] || '');
    var kwFull = String(row[colIdx['KEYWORDS']] || '');
    var entityId = String(row[colIdx['ENTITY_ID']] || '');

    var score = 10;
    var bi = HoSoV2_Search_foldKeyword(rawKw).replace(/\s/g, '');
    if (HoSoV2_Search_foldKeyword(kwFull).indexOf(bi) !== -1) score += 2;
    if (HoSoV2_Search_foldKeyword(title).indexOf(folded) !== -1) score += 5;
    if (HoSoV2_Search_foldKeyword(kwFull).indexOf(folded) !== -1) score += 3;
    if (/^\d{9,12}$/.test(rawKw.replace(/\s/g, '')) && kn.indexOf(folded) !== -1) score += 8;
    if (folded.length >= 6 && kn.indexOf(folded) !== -1) score += 4;

    candidates.push({
      hoSoId: hoSoId,
      entityType: et,
      entityId: entityId,
      title: title,
      score: score,
      matchedSnippet: kwFull.slice(0, 200)
    });
  }

  candidates.sort(function(a, b) { return b.score - a.score; });
  if (candidates.length > limit) candidates = candidates.slice(0, limit);

  return { ok: true, results: candidates, keywordNormalized: folded };
}
