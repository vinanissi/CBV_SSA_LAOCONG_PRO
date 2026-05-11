/**
 * CBV Operational Verification — append-only artifact registry sheet (Phase D).
 */

var CBV_TEST_ARTIFACT_REGISTRY_SHEET_ = 'CBV_TEST_ARTIFACT_REGISTRY';

var CBV_TEST_ARTIFACT_REGISTRY_HEADERS_ = [
  'CREATED_AT',
  'PROMPT_FILE',
  'REPORT_FILE',
  'DRIVE_FILE_ID',
  'DRIVE_URL',
  'TRACE_ID',
  'SUITE_CODE',
  'COMMIT_HASH',
  'TAG',
  'HANDOFF_ID',
  'DECISION_SUMMARY',
  'RISK_SCORE',
  'NOTE'
];

/**
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function CBV_TestConsole_getOrCreateArtifactRegistrySheet_() {
  var opened = (typeof MC_Obs_openModuleDb_ === 'function') ? MC_Obs_openModuleDb_() : { ok: false };
  if (!opened.ok) return null;
  var ss = opened.ss;
  var sh = null;
  try {
    sh = ss.getSheetByName(CBV_TEST_ARTIFACT_REGISTRY_SHEET_);
  } catch (e0) {
    sh = null;
  }
  if (!sh) {
    try {
      sh = ss.insertSheet(CBV_TEST_ARTIFACT_REGISTRY_SHEET_);
    } catch (e1) {
      return null;
    }
  }
  try {
    if (sh.getLastRow() < 1) {
      sh.getRange(1, 1, 1, CBV_TEST_ARTIFACT_REGISTRY_HEADERS_.length).setValues([CBV_TEST_ARTIFACT_REGISTRY_HEADERS_]);
    } else {
      var first = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      var need = [];
      var map = {};
      var i;
      for (i = 0; i < first.length; i++) map[String(first[i] || '').trim()] = true;
      for (i = 0; i < CBV_TEST_ARTIFACT_REGISTRY_HEADERS_.length; i++) {
        if (!map[CBV_TEST_ARTIFACT_REGISTRY_HEADERS_[i]]) need.push(CBV_TEST_ARTIFACT_REGISTRY_HEADERS_[i]);
      }
      if (need.length && typeof MC_Obs_ensureHeaders_ === 'function') {
        MC_Obs_ensureHeaders_(sh, need);
      }
    }
  } catch (e2) {
    /* ignore */
  }
  try {
    if (sh.getFrozenRows() < 1) sh.setFrozenRows(1);
  } catch (e3) {
    /* ignore */
  }
  return sh;
}

/**
 * @param {Object} rowObj
 * @returns {Object} rowObj with warnings if any
 */
function CBV_TestConsole_appendArtifactRegistry_(rowObj) {
  var r = rowObj || {};
  var sh = CBV_TestConsole_getOrCreateArtifactRegistrySheet_();
  if (!sh) {
    r._artifactWarning = 'ARTIFACT_REGISTRY_SKIP: Core DB unavailable';
    return r;
  }
  var row = {
    CREATED_AT: String(r.CREATED_AT || CBV_TestConsole_isoNow_()),
    PROMPT_FILE: String(r.PROMPT_FILE || ''),
    REPORT_FILE: String(r.REPORT_FILE || ''),
    DRIVE_FILE_ID: String(r.DRIVE_FILE_ID || ''),
    DRIVE_URL: String(r.DRIVE_URL || ''),
    TRACE_ID: String(r.TRACE_ID || ''),
    SUITE_CODE: String(r.SUITE_CODE || ''),
    COMMIT_HASH: String(r.COMMIT_HASH || ''),
    TAG: String(r.TAG || ''),
    HANDOFF_ID: String(r.HANDOFF_ID || ''),
    DECISION_SUMMARY: String(r.DECISION_SUMMARY || ''),
    RISK_SCORE: r.RISK_SCORE != null ? String(r.RISK_SCORE) : '',
    NOTE: String(r.NOTE || 'PHASE_D_APPEND_ONLY')
  };
  try {
    if (typeof cbvCoreV2AppendRowByHeaders_ === 'function') {
      cbvCoreV2AppendRowByHeaders_(sh, row);
    } else {
      var hdr = CBV_TEST_ARTIFACT_REGISTRY_HEADERS_;
      var vals = [];
      var i;
      for (i = 0; i < hdr.length; i++) vals.push(row[hdr[i]] != null ? row[hdr[i]] : '');
      sh.appendRow(vals);
    }
  } catch (e) {
    r._artifactWarning = 'ARTIFACT_APPEND_FAIL:' + String(e && e.message ? e.message : e);
  }
  return r;
}

/**
 * @returns {{ ok: boolean, message: string }}
 */
function CBV_TestConsole_artifactRegistrySelfTest_() {
  var row = {
    CREATED_AT: CBV_TestConsole_isoNow_(),
    PROMPT_FILE: 'SELFTEST',
    REPORT_FILE: 'SELFTEST',
    DRIVE_FILE_ID: '',
    DRIVE_URL: '',
    TRACE_ID: 'SELFTEST_' + String(new Date().getTime()),
    SUITE_CODE: 'ARTIFACT_SELFTEST',
    COMMIT_HASH: '',
    TAG: '',
    HANDOFF_ID: '',
    DECISION_SUMMARY: 'self-test append',
    RISK_SCORE: '0',
    NOTE: 'SELFTEST_ROW'
  };
  var out = CBV_TestConsole_appendArtifactRegistry_(row);
  if (out._artifactWarning) return { ok: false, message: out._artifactWarning };
  return { ok: true, message: 'artifact registry append-only self-test OK' };
}
