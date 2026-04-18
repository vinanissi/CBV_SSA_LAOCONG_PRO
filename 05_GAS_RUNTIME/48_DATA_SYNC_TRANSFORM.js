/**
 * DATA SYNC — transform registry (no eval). DATA_SYNC_MODULE_DESIGN.md §4.3, §4.6.
 *
 * date_iso: Parses ISO-8601 date/datetime strings. Writes/reads as JS Date where the engine passes through;
 * for date_serial use transform date_serial + targetFormat. Timezone: values are interpreted in
 * Session/script context; serial days use SpreadsheetApp timezone — align in engine when writing numbers.
 */

/**
 * @param {*} value
 * @param {string} mode - none | trim | upper_trim
 * @returns {string}
 */
function dataSyncNormalizeKeyPart(value, mode) {
  var m = mode || 'upper_trim';
  var s = value == null ? '' : String(value);
  if (m === 'none') return s;
  if (m === 'trim') return s.trim();
  return s.trim().toUpperCase();
}

/**
 * @param {string[]} parts
 * @param {string} mode
 * @returns {string}
 */
function dataSyncCompositeKey(parts, mode) {
  return parts.map(function(p) { return dataSyncNormalizeKeyPart(p, mode); }).join('\x1e');
}

/**
 * @param {string} s1
 * @param {string} s2
 * @returns {number}
 */
function dataSyncLevenshtein(s1, s2) {
  var a = String(s1 || '');
  var b = String(s2 || '');
  var m = a.length;
  var n = b.length;
  var i, j;
  if (m === 0) return n;
  if (n === 0) return m;
  var dp = [];
  for (i = 0; i <= m; i++) {
    dp[i] = [];
    dp[i][0] = i;
  }
  for (j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  for (j = 1; j <= n; j++) {
    for (i = 1; i <= m; i++) {
      var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/**
 * Apply transform pipeline to a raw cell value.
 * @param {*} raw
 * @param {{ type: string, enumMapRef?: string }} spec - from columnMap entry
 * @param {Object} ctx - { job, spreadsheet, jobId }
 * @returns {{ ok: boolean, value: *, errorCode?: string }}
 */
function dataSyncApplyTransform(raw, spec, ctx) {
  if (!spec || !spec.type) {
    return { ok: true, value: raw };
  }
  var t = String(spec.type).trim();
  var v = raw;
  if (t === 'trim') return { ok: true, value: String(v == null ? '' : v).trim() };
  if (t === 'upper') return { ok: true, value: String(v == null ? '' : v).trim().toUpperCase() };
  if (t === 'number') {
    var n = parseFloat(String(v).replace(',', '.'));
    if (isNaN(n)) return { ok: false, value: null, errorCode: 'TRANSFORM_NUMBER_INVALID' };
    return { ok: true, value: n };
  }
  if (t === 'bool') {
    var s = String(v == null ? '' : v).trim().toLowerCase();
    if (s === 'true' || s === 'yes' || s === '1') return { ok: true, value: true };
    if (s === 'false' || s === 'no' || s === '0' || s === '') return { ok: true, value: false };
    return { ok: false, value: null, errorCode: 'TRANSFORM_BOOL_INVALID' };
  }
  if (t === 'date_iso') {
    if (v == null || String(v).trim() === '') return { ok: true, value: '' };
    var d = new Date(String(v));
    if (isNaN(d.getTime())) return { ok: false, value: null, errorCode: 'TRANSFORM_DATE_ISO_INVALID' };
    return { ok: true, value: d };
  }
  if (t === 'date_serial') {
    if (v == null || String(v).trim() === '') return { ok: true, value: '' };
    if (typeof v === 'number') return { ok: true, value: v };
    var d2 = new Date(String(v));
    if (isNaN(d2.getTime())) return { ok: false, value: null, errorCode: 'TRANSFORM_DATE_SERIAL_INVALID' };
    var epoch = new Date(1899, 11, 30);
    var ms = d2.getTime() - epoch.getTime();
    var serial = ms / 86400000;
    return { ok: true, value: serial };
  }
  if (t === 'enum') {
    return dataSyncResolveEnum(String(v == null ? '' : v).trim(), spec.enumMapRef || '', ctx);
  }
  return { ok: true, value: v };
}

/**
 * @param {string} raw
 * @param {string} enumMapRef - namespace:name
 * @param {Object} ctx
 * @returns {{ ok: boolean, value: string, errorCode?: string }}
 */
function dataSyncResolveEnum(raw, enumMapRef, ctx) {
  if (!enumMapRef) return { ok: false, value: '', errorCode: 'ENUM_MAP_UNRESOLVED' };
  var ref = String(enumMapRef);
  var colon = ref.indexOf(':');
  if (colon < 0) return { ok: false, value: '', errorCode: 'ENUM_MAP_UNRESOLVED' };
  var ns = ref.slice(0, colon);
  var rest = ref.slice(colon + 1);

  if (ns === 'inline') {
    var dot = rest.indexOf('.');
    if (dot < 0) return { ok: false, value: '', errorCode: 'ENUM_MAP_UNRESOLVED' };
    var jid = rest.slice(0, dot);
    var mapName = rest.slice(dot + 1);
    var job = ctx.job;
    if (!job || String(job.id) !== String(jid)) return { ok: false, value: '', errorCode: 'ENUM_MAP_UNRESOLVED' };
    var em = job.enumMaps && job.enumMaps[mapName];
    if (!em || typeof em !== 'object') return { ok: false, value: '', errorCode: 'ENUM_MAP_UNRESOLVED' };
    var keys = Object.keys(em);
    var exact = em[raw];
    if (exact !== undefined) return { ok: true, value: String(exact) };
    var amb = keys.filter(function(k) { return dataSyncLevenshtein(k, raw) <= 1; });
    if (amb.length === 1) return { ok: true, value: String(em[amb[0]]) };
    if (amb.length > 1) return { ok: false, value: '', errorCode: 'ENUM_MAP_AMBIGUOUS' };
    return { ok: false, value: '', errorCode: 'ENUM_MAP_UNRESOLVED' };
  }

  if (ns === 'sheet') {
    var sk = rest;
    var sheetName = (CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS[sk]) ? CBV_CONFIG.SHEETS[sk] : sk;
    var ss = SpreadsheetApp.getActive();
    var sh = ss.getSheetByName(sheetName);
    if (!sh) return { ok: false, value: '', errorCode: 'ENUM_MAP_UNRESOLVED' };
    var lr = sh.getLastRow();
    var lc = sh.getLastColumn();
    if (lr < 2) return { ok: false, value: '', errorCode: 'ENUM_MAP_UNRESOLVED' };
    var hdr = sh.getRange(1, 1, 1, lc).getValues()[0];
    var fi = -1;
    var ti = -1;
    var i;
    for (i = 0; i < hdr.length; i++) {
      var h = String(hdr[i] || '').trim().toUpperCase();
      if (h === 'FROM') fi = i;
      if (h === 'TO') ti = i;
    }
    if (fi < 0) fi = 0;
    if (ti < 0) ti = 1;
    var rr = sh.getRange(2, 1, lr, lc).getValues();
    var matches = [];
    for (i = 0; i < rr.length; i++) {
      var fromv = String(rr[i][fi] != null ? rr[i][fi] : '').trim();
      if (fromv === raw) return { ok: true, value: String(rr[i][ti] != null ? rr[i][ti] : '').trim() };
      if (dataSyncLevenshtein(fromv, raw) <= 1) matches.push(String(rr[i][ti] != null ? rr[i][ti] : '').trim());
    }
    if (matches.length === 1) return { ok: true, value: matches[0] };
    if (matches.length > 1) return { ok: false, value: '', errorCode: 'ENUM_MAP_AMBIGUOUS' };
    return { ok: false, value: '', errorCode: 'ENUM_MAP_UNRESOLVED' };
  }

  if (ns === 'master') {
    var group = rest;
    if (typeof getMasterCodeValues !== 'function') {
      return { ok: false, value: '', errorCode: 'ENUM_MAP_UNRESOLVED' };
    }
    var codes = getMasterCodeValues(group) || [];
    var r = String(raw).trim();
    if (codes.indexOf(r) !== -1) return { ok: true, value: r };
    var c2 = codes.filter(function(c) { return dataSyncLevenshtein(String(c), r) <= 1; });
    if (c2.length === 1) return { ok: true, value: c2[0] };
    if (c2.length > 1) return { ok: false, value: '', errorCode: 'ENUM_MAP_AMBIGUOUS' };
    return { ok: false, value: '', errorCode: 'ENUM_MAP_UNRESOLVED' };
  }

  return { ok: false, value: '', errorCode: 'ENUM_MAP_UNRESOLVED' };
}
