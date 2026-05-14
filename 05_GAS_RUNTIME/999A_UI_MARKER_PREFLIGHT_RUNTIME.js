/**
 * PHASE_611 — CBV UI Marker Contract Preflight Runtime V1
 *
 * Test-runtime helper: verify required CSS/markers exist in HTML for each probe state.
 * Depends on nothing; consumed by milestone test consoles (e.g. 998Z) and optional probes.
 */

var CBV_UI_MARKER_PREFLIGHT_PHASE_ID = 'PHASE_611_UI_MARKER_CONTRACT_PREFLIGHT_V1';

/**
 * Collect unique class tokens from class="..." attributes (read-only heuristic).
 */
function CbvUiMarkerPreflight_collectMarkers_(html) {
  var h = String(html || '');
  var found = {};
  var re = /class\s*=\s*"([^"]*)"/gi;
  var m;
  while (true) {
    m = re.exec(h);
    if (!m) break;
    var parts = String(m[1] || '').split(/\s+/);
    for (var i = 0; i < parts.length; i++) {
      var t = String(parts[i] || '').trim();
      if (t) found[t] = true;
    }
  }
  return Object.keys(found).sort();
}

/**
 * Return { ok, missing, found } where missing is list of requiredMarkers not found as substrings in html.
 */
function CbvUiMarkerPreflight_checkMarkers_(html, requiredMarkers) {
  var h = String(html || '');
  var req = requiredMarkers || [];
  var missing = [];
  var found = [];
  for (var i = 0; i < req.length; i++) {
    var mk = String(req[i] || '');
    if (!mk) continue;
    if (h.indexOf(mk) >= 0) found.push(mk);
    else missing.push(mk);
  }
  return { ok: missing.length === 0, missing: missing, found: found };
}

/**
 * Run renderer(state) for each state and concatenate HTML (diagnostics only).
 */
function CbvUiMarkerPreflight_renderProbeHtml_(renderer, states) {
  if (typeof renderer !== 'function') return '';
  var st = states || [];
  var parts = [];
  for (var i = 0; i < st.length; i++) {
    try {
      parts.push('<!-- state:' + String(st[i]) + ' -->\n' + String(renderer(st[i]) || ''));
    } catch (e) {
      parts.push('<!-- state:' + String(st[i]) + ' ERROR:' + String(e && e.message ? e.message : e) + ' -->');
    }
  }
  return parts.join('\n');
}

/**
 * @param {Object} options - { requiredMarkers: string[], states: string[], renderer: function(state): string }
 * @returns {{ ok: boolean, requiredMarkers: string[], foundMarkers: Object, missingMarkers: Object, htmlLens: Object, statesChecked: string[], warnings: string[], errors: string[], missingMarkersUnion: string[] }}
 */
function CbvUiMarkerPreflight_runContract_(options) {
  var opt = options || {};
  var required = opt.requiredMarkers || [];
  var states = opt.states || ['HAS_DATA', 'EMPTY_DATA', 'APPSHEET_UNCONFIGURED', 'MISSING_TASKID', 'QUERY_PARAM_ROUTE'];
  var renderer = opt.renderer;
  var out = {
    ok: true,
    requiredMarkers: required.slice(),
    foundMarkers: {},
    missingMarkers: {},
    htmlLens: {},
    htmlLen: 0,
    statesChecked: [],
    warnings: [],
    errors: [],
    missingMarkersUnion: []
  };

  if (typeof renderer !== 'function') {
    out.ok = false;
    out.errors.push('CbvUiMarkerPreflight_runContract_: renderer must be a function(state)->html');
    return out;
  }

  var union = {};
  var totalLen = 0;

  for (var si = 0; si < states.length; si++) {
    var st = String(states[si] || '');
    var html = '';
    try {
      html = String(renderer(st) || '');
    } catch (eR) {
      out.ok = false;
      out.errors.push(st + ': ' + (eR && eR.message ? eR.message : String(eR)));
      html = '';
    }
    out.statesChecked.push(st);
    out.htmlLens[st] = html.length;
    totalLen += html.length;
    var chk = CbvUiMarkerPreflight_checkMarkers_(html, required);
    out.foundMarkers[st] = chk.found || [];
    out.missingMarkers[st] = chk.missing || [];
    if (!chk.ok) {
      out.ok = false;
      for (var mj = 0; mj < (chk.missing || []).length; mj++) {
        union[chk.missing[mj]] = true;
      }
    }
  }
  out.htmlLen = totalLen;
  out.missingMarkersUnion = Object.keys(union).sort();
  return out;
}
