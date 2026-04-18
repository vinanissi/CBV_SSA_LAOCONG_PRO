/**
 * DATA SYNC ENGINE — DATA_SYNC_MODULE_DESIGN.md v1.3 (source of truth).
 * Dependencies: 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_LOGGER, 47_DATA_SYNC_CHUNK, 48_DATA_SYNC_TRANSFORM,
 * optional 02_MASTER_CODE_SERVICE (master: enum refs).
 *
 * API: validateSyncPlan, buildDataSyncReport, runDataSync
 */

// —— plan merge ——

/**
 * @param {Object} plan
 * @param {Object} [planOverride] - deep merge via JSON clone + Object.assign for top jobs
 * @returns {Object}
 */
function _dataSyncMergePlanObject(plan, planOverride) {
  if (!planOverride) return cbvClone(plan);
  var base = cbvClone(plan);
  var o = cbvClone(planOverride);
  if (o.version) base.version = o.version;
  if (o.jobs) base.jobs = o.jobs;
  return base;
}

/**
 * @param {{ sheetKey?: string, sheetName?: string, spreadsheetId?: string }} part
 * @returns {string|null}
 */
function _dataSyncResolveSheetTabName(part) {
  if (!part) return null;
  if (part.sheetName) return String(part.sheetName);
  if (part.sheetKey) {
    var k = String(part.sheetKey);
    if (CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS[k]) return CBV_CONFIG.SHEETS[k];
    return k;
  }
  return null;
}

/**
 * @param {string} [spreadsheetId]
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function _dataSyncOpenSpreadsheet(spreadsheetId) {
  var id = '';
  if (spreadsheetId != null && String(spreadsheetId).trim() !== '') {
    id = cbvNormalizeGoogleSpreadsheetId(String(spreadsheetId));
  }
  if (!id) id = CBV_CONFIG.SPREADSHEET_ID;
  return SpreadsheetApp.openById(id);
}

/**
 * @param {Object} job
 * @param {string} side - 'source' | 'target'
 * @returns {{ ss: GoogleAppsScript.Spreadsheet.Spreadsheet, sheet: GoogleAppsScript.Spreadsheet.Sheet, tabName: string, spreadsheetId: string }}
 */
function _dataSyncResolveJobSide(job, side) {
  var part = side === 'source' ? job.source : job.target;
  if (!part) throw new Error('Missing job.' + side);
  var tab = _dataSyncResolveSheetTabName(part);
  if (!tab) throw new Error('Missing sheetKey/sheetName for ' + side);
  var ss = _dataSyncOpenSpreadsheet(part.spreadsheetId);
  var sheet = ss.getSheetByName(tab);
  var sid =
    part.spreadsheetId != null && String(part.spreadsheetId).trim() !== ''
      ? cbvNormalizeGoogleSpreadsheetId(String(part.spreadsheetId))
      : '';
  return { ss: ss, sheet: sheet, tabName: tab, spreadsheetId: sid || CBV_CONFIG.SPREADSHEET_ID };
}

/**
 * @param {string[]} headers
 * @returns {Object} map upperTrim -> first index
 */
function _dataSyncHeaderToIndex(headers) {
  var m = {};
  var i;
  for (i = 0; i < headers.length; i++) {
    var h = String(headers[i] || '').trim();
    var u = h.toUpperCase();
    if (!(u in m)) m[u] = i;
  }
  return m;
}

/**
 * @param {{ from: string, aliases?: string[] }} entry
 * @param {string[]} headers
 * @param {Object} idx
 * @returns {number}
 */
function _dataSyncResolveSourceColumnIndex(entry, headers, idx) {
  var candidates = [entry.from].concat(entry.aliases || []);
  var c, j, h;
  for (c = 0; c < candidates.length; c++) {
    var cand = String(candidates[c] || '').trim();
    if (!cand) continue;
    var u = cand.toUpperCase();
    if (u in idx) return idx[u];
    for (j = 0; j < headers.length; j++) {
      h = String(headers[j] || '').trim();
      if (h === cand) return j;
    }
  }
  return -1;
}

/**
 * @param {string} targetCol
 * @param {string[]} targetHeaders
 * @param {Object} targetIdx
 * @returns {number}
 */
function _dataSyncResolveTargetColumnIndex(targetCol, targetHeaders, targetIdx) {
  var u = String(targetCol || '').trim().toUpperCase();
  if (u in targetIdx) return targetIdx[u];
  return -1;
}

/**
 * @param {Object} job
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sourceSheet
 * @param {string[]} sourceHeaders
 * @param {string} keyNorm
 * @returns {{ rowMark: Object, keyToWinnerRow: Object }}
 */
function _dataSyncBuildDuplicateSchedule(job, sourceSheet, sourceHeaders, keyNorm) {
  var lastRow = sourceSheet.getLastRow();
  var schedule = { rowMark: {}, keyToWinnerRow: {} };
  var keyCols = job.keyColumns || [];
  var colIdx = keyCols.map(function(k) {
    var u = String(k).trim().toUpperCase();
    var i = sourceHeaders.map(function(h) { return String(h || '').trim().toUpperCase(); }).indexOf(u);
    return i;
  });
  var bad = colIdx.some(function(x) { return x < 0; });
  if (bad) return schedule;

  var r;
  var rowPairs = [];
  if (lastRow < DATA_SYNC_FIRST_DATA_ROW) return schedule;

  for (r = DATA_SYNC_FIRST_DATA_ROW; r <= lastRow; r++) {
    var kr = sourceSheet.getRange(r, 1, 1, sourceHeaders.length).getValues()[0];
    var parts = colIdx.map(function(ci) {
      return dataSyncNormalizeKeyPart(kr[ci], keyNorm);
    });
    var keyStr = dataSyncCompositeKey(parts, keyNorm);
    rowPairs.push({ sheetRow: r, key: keyStr });
  }

  var dup = job.onDuplicateSourceKey;
  if (dup === 'error') {
    var seen = {};
    for (var i = 0; i < rowPairs.length; i++) {
      var p = rowPairs[i];
      if (!seen[p.key]) {
        seen[p.key] = true;
        schedule.rowMark[p.sheetRow] = 'WIN';
      } else {
        schedule.rowMark[p.sheetRow] = 'DUP_ERR';
      }
    }
  } else {
    for (var j = 0; j < rowPairs.length; j++) {
      schedule.keyToWinnerRow[rowPairs[j].key] = rowPairs[j].sheetRow;
    }
    for (var k = 0; k < rowPairs.length; k++) {
      var q = rowPairs[k];
      schedule.rowMark[q.sheetRow] = (schedule.keyToWinnerRow[q.key] === q.sheetRow) ? 'WIN' : 'SUPERSEDED';
    }
  }
  return schedule;
}

/**
 * @param {Object} job
 * @param {string[]} sourceHeaders
 * @returns {{ issues: Object[], warnings: Object[] }}
 */
function _dataSyncValidateJobStructure(job) {
  var issues = [];
  var warnings = [];
  var req = ['id', 'source', 'target', 'keyColumns', 'columnMap', 'mode', 'onMissingTargetColumn', 'onSourceKeyMissing', 'maxErrorRows', 'onDuplicateSourceKey'];
  var f;
  for (f = 0; f < req.length; f++) {
    if (job[req[f]] === undefined && req[f] !== 'maxErrorRows') {
      issues.push({ code: 'JOB_FIELD_MISSING', message: 'Missing ' + req[f], jobId: job.id });
    }
  }
  if (job.mode !== 'append_only' && job.mode !== 'upsert') {
    issues.push({ code: 'JOB_MODE_INVALID', message: 'mode must be append_only or upsert', jobId: job.id });
  }
  if (job.onDuplicateSourceKey !== 'error' && job.onDuplicateSourceKey !== 'last_wins') {
    issues.push({ code: 'JOB_DUP_POLICY_INVALID', message: 'onDuplicateSourceKey invalid', jobId: job.id });
  }
  if (typeof job.maxErrorRows !== 'number' || job.maxErrorRows < 0) {
    issues.push({ code: 'JOB_MAX_ERRORS_INVALID', message: 'maxErrorRows must be number >= 0', jobId: job.id });
  }
  return { issues: issues, warnings: warnings };
}

/**
 * @param {Object} plan
 * @returns {{ ok: boolean, issues: Object[], warnings: Object[] }}
 */
function validateSyncPlan(plan) {
  var issues = [];
  var warnings = [];
  if (!plan || typeof plan !== 'object') {
    return { ok: false, issues: [{ code: 'PLAN_EMPTY', message: 'Plan missing' }], warnings: [] };
  }
  if (!plan.version) issues.push({ code: 'PLAN_NO_VERSION', message: 'plan.version required' });
  if (!plan.jobs || !Array.isArray(plan.jobs) || plan.jobs.length === 0) {
    issues.push({ code: 'PLAN_NO_JOBS', message: 'plan.jobs non-empty array required' });
  }
  if (issues.length) return { ok: false, issues: issues, warnings: warnings };

  var ids = {};
  var j;
  for (j = 0; j < plan.jobs.length; j++) {
    var job = plan.jobs[j];
    var st = _dataSyncValidateJobStructure(job);
    issues = issues.concat(st.issues);
    if (job.id && ids[job.id]) issues.push({ code: 'JOB_ID_DUP', message: 'Duplicate job id ' + job.id });
    if (job.id) ids[job.id] = true;

    try {
      var src = _dataSyncResolveJobSide(job, 'source');
      if (!src.sheet) issues.push({ code: 'MISSING_SOURCE_SHEET', message: 'Source sheet not found: ' + src.tabName, jobId: job.id });
      var tgt = _dataSyncResolveJobSide(job, 'target');
      if (!tgt.sheet) issues.push({ code: 'MISSING_TARGET_SHEET', message: 'Target sheet not found: ' + tgt.tabName, jobId: job.id });

      if (src.sheet && tgt.sheet) {
        var sh = src.sheet.getRange(1, 1, 1, src.sheet.getLastColumn()).getValues()[0];
        var th = tgt.sheet.getRange(1, 1, 1, tgt.sheet.getLastColumn()).getValues()[0];
        var kn;
        for (kn = 0; kn < (job.keyColumns || []).length; kn++) {
          var kc = String(job.keyColumns[kn]).trim().toUpperCase();
          var found = sh.some(function(h) { return String(h || '').trim().toUpperCase() === kc; });
          if (!found) issues.push({ code: 'KEY_COLUMN_SOURCE_MISSING', message: kc, jobId: job.id });
        }
        var cm;
        for (cm = 0; cm < (job.columnMap || []).length; cm++) {
          var ce = job.columnMap[cm];
          var srcIdx = _dataSyncResolveSourceColumnIndex(ce, sh, _dataSyncHeaderToIndex(sh.map(function(x) { return String(x); })));
          var ti = _dataSyncResolveTargetColumnIndex(ce.to, th, _dataSyncHeaderToIndex(th.map(function(x) { return String(x); })));
          if (srcIdx < 0) {
            var best = null;
            var bd = 999;
            var bi;
            for (bi = 0; bi < sh.length; bi++) {
              var d = dataSyncLevenshtein(String(ce.from || ''), String(sh[bi] || ''));
              if (d < bd) {
                bd = d;
                best = String(sh[bi] || '');
              }
            }
            if (bd <= 2 && best) {
              warnings.push({
                code: 'SUGGESTED_HEADER',
                message: 'from "' + ce.from + '" did you mean "' + best + '"?',
                jobId: job.id,
                columnMapIndex: cm
              });
            }
            issues.push({ code: 'SOURCE_COLUMN_UNRESOLVED', message: ce.from, jobId: job.id });
          }
          if (ti < 0 && job.onMissingTargetColumn === 'error') {
            issues.push({ code: 'TARGET_COLUMN_MISSING', message: ce.to, jobId: job.id });
          }
        }
      }
    } catch (e) {
      issues.push({ code: 'PLAN_RESOLVE_FAILED', message: String(e.message || e), jobId: job.id });
    }
  }

  return { ok: issues.length === 0, issues: issues, warnings: warnings };
}

/**
 * @param {Object} opts
 * @returns {Object}
 */
function buildDataSyncReport(opts) {
  opts = opts || {};
  var plan = opts.plan;
  if (!plan) {
    return {
      ok: false,
      canApply: false,
      summary: { errorRowCount: 0, insert: 0, update: 0, skip: 0, unchanged: 0, applySkippedErrorCount: 0, warnings: [] },
      rows: [],
      continuation: null,
      planVersion: '',
      continuationStale: false,
      validationIssues: [{ code: 'NO_PLAN', message: 'opts.plan required' }]
    };
  }
  plan = _dataSyncMergePlanObject(plan, opts.planOverride);

  var val0 = validateSyncPlan(plan);
  if (!val0.ok) {
    return {
      ok: false,
      canApply: false,
      summary: {
        errorRowCount: 0,
        insert: 0,
        update: 0,
        skip: 0,
        unchanged: 0,
        warnings: val0.issues.concat(val0.warnings || [])
      },
      rows: [],
      continuation: null,
      planVersion: plan.version || '',
      continuationStale: false,
      validationIssues: val0.issues,
      validationWarnings: val0.warnings
    };
  }

  var contIn = opts.continuation || null;
  var chunkSize = opts.maxRowsPerChunk || DATA_SYNC_DEFAULT_CHUNK_SIZE;

  if (contIn) {
    var job0 = null;
    var ji;
    for (ji = 0; ji < plan.jobs.length; ji++) {
      if (String(plan.jobs[ji].id) === String(contIn.jobId)) {
        job0 = plan.jobs[ji];
        break;
      }
    }
    if (job0) {
      try {
        var rs = _dataSyncResolveJobSide(job0, 'source');
        if (rs.sheet && contIn.sourceRowCount != null && rs.sheet.getLastRow() !== contIn.sourceRowCount) {
          return {
            ok: true,
            canApply: false,
            summary: { errorRowCount: 0, insert: 0, update: 0, skip: 0, unchanged: 0, warnings: [{ code: 'SOURCE_ROW_COUNT_CHANGED', message: 'Resume aborted' }] },
            rows: [],
            continuation: null,
            planVersion: plan.version || '',
            continuationStale: true,
            staleReason: 'SOURCE_ROW_COUNT_CHANGED',
            token: contIn
          };
        }
      } catch (e) {}
    }
  }

  var filterJobId = opts.jobId || (contIn && contIn.jobId) || null;
  var jobs = plan.jobs;
  if (filterJobId) {
    jobs = plan.jobs.filter(function(j) { return String(j.id) === String(filterJobId); });
  }

  var allRows = [];
  var sum = { errorRowCount: 0, insert: 0, update: 0, skip: 0, unchanged: 0, warnings: val0.warnings ? val0.warnings.slice() : [] };
  var errorsByJob = {};
  /** contIn: one-shot resume token (consumed for matching jobId) */
  var contToken = contIn;
  var jobIdx;

  function bumpJobError(jid) {
    sum.errorRowCount++;
    errorsByJob[jid] = (errorsByJob[jid] || 0) + 1;
  }

  for (jobIdx = 0; jobIdx < jobs.length; jobIdx++) {
    var job = jobs[jobIdx];
    var keyNorm = job.keyNormalization || 'upper_trim';
    var src = _dataSyncResolveJobSide(job, 'source');
    var tgt = _dataSyncResolveJobSide(job, 'target');
    if (!src.sheet || !tgt.sheet) continue;

    var sourceHeaders = src.sheet.getRange(1, 1, 1, src.sheet.getLastColumn()).getValues()[0];
    var targetHeaders = tgt.sheet.getRange(1, 1, 1, tgt.sheet.getLastColumn()).getValues()[0];
    var sIdxMap = _dataSyncHeaderToIndex(sourceHeaders.map(function(x) { return String(x); }));
    var tIdxMap = _dataSyncHeaderToIndex(targetHeaders.map(function(x) { return String(x); }));

    var dupSched = _dataSyncBuildDuplicateSchedule(job, src.sheet, sourceHeaders, keyNorm);
    var lastRow = src.sheet.getLastRow();

    var startRow = DATA_SYNC_FIRST_DATA_ROW;
    if (contToken && String(contToken.jobId) === String(job.id) && contToken.nextStartRow) {
      startRow = contToken.nextStartRow;
      contToken = null;
    }

    var endRow = Math.min(lastRow, startRow + chunkSize - 1);
    var targetKeyToRow = {};
    if (job.mode === 'upsert') {
      var tlr = tgt.sheet.getLastRow();
      if (tlr >= DATA_SYNC_FIRST_DATA_ROW) {
        var tkCols = job.keyColumns.map(function(kc) {
          var u = String(kc).trim().toUpperCase();
          return targetHeaders.map(function(h) { return String(h || '').trim().toUpperCase(); }).indexOf(u);
        });
        var tr;
        for (tr = DATA_SYNC_FIRST_DATA_ROW; tr <= tlr; tr++) {
          var tvals = tgt.sheet.getRange(tr, 1, 1, targetHeaders.length).getValues()[0];
          var tparts = tkCols.map(function(ci) {
            return dataSyncNormalizeKeyPart(tvals[ci], keyNorm);
          });
          var tk = dataSyncCompositeKey(tparts, keyNorm);
          targetKeyToRow[tk] = tr;
        }
      }
    }

    var sr;
    for (sr = startRow; sr <= endRow; sr++) {
      var mark = dupSched.rowMark[sr] || 'WIN';
      var rowVals = src.sheet.getRange(sr, 1, 1, sourceHeaders.length).getValues()[0];
      var kIdx = job.keyColumns.map(function(kc) {
        var u = String(kc).trim().toUpperCase();
        return sourceHeaders.map(function(h) { return String(h || '').trim().toUpperCase(); }).indexOf(u);
      });
      var kparts = kIdx.map(function(ci) {
        return dataSyncNormalizeKeyPart(rowVals[ci], keyNorm);
      });
      var keyStr = dataSyncCompositeKey(kparts, keyNorm);

      if (mark === 'DUP_ERR') {
        bumpJobError(job.id);
        allRows.push({ jobId: job.id, sourceSheetRow: sr, key: keyStr, action: 'ERROR', errorCode: 'DUPLICATE_SOURCE_KEY' });
        continue;
      }
      if (mark === 'SUPERSEDED') {
        allRows.push({
          jobId: job.id,
          sourceSheetRow: sr,
          key: keyStr,
          action: 'SKIP',
          warnings: ['DUPLICATE_SOURCE_KEY_RESOLVED']
        });
        sum.skip++;
        continue;
      }

      var proposed = {};
      var errThis = null;
      var cm2;
      for (cm2 = 0; cm2 < (job.columnMap || []).length; cm2++) {
        var ent = job.columnMap[cm2];
        var si = _dataSyncResolveSourceColumnIndex(ent, sourceHeaders, sIdxMap);
        var tci = _dataSyncResolveTargetColumnIndex(ent.to, targetHeaders, tIdxMap);
        if (si < 0) {
          errThis = 'SOURCE_COL';
          break;
        }
        if (tci < 0) {
          if (job.onMissingTargetColumn === 'error') {
            errThis = 'TARGET_COL';
            break;
          }
          continue;
        }
        var raw = rowVals[si];
        var tf = ent.transform;
        var spec = typeof tf === 'string' ? { type: tf, enumMapRef: ent.enumMapRef } : tf;
        var tfr = dataSyncApplyTransform(raw, spec, { job: job, jobId: job.id });
        if (!tfr.ok) {
          errThis = tfr.errorCode || 'TRANSFORM_ERROR';
          break;
        }
        proposed[String(targetHeaders[tci])] = tfr.value;
      }

      if (errThis) {
        bumpJobError(job.id);
        allRows.push({ jobId: job.id, sourceSheetRow: sr, key: keyStr, action: 'ERROR', errorCode: errThis });
        continue;
      }

      var tRow = targetKeyToRow[keyStr];
      if (job.mode === 'append_only' || tRow == null) {
        sum.insert++;
        allRows.push({
          jobId: job.id,
          sourceSheetRow: sr,
          key: keyStr,
          action: 'INSERT',
          proposed: proposed,
          targetSheetRow: null,
          sourceSpreadsheetId: src.spreadsheetId,
          targetSpreadsheetId: tgt.spreadsheetId,
          sourceTab: src.tabName,
          targetTab: tgt.tabName
        });
      } else {
        sum.update++;
        allRows.push({
          jobId: job.id,
          sourceSheetRow: sr,
          key: keyStr,
          action: 'UPDATE',
          proposed: proposed,
          targetSheetRow: tRow,
          sourceSpreadsheetId: src.spreadsheetId,
          targetSpreadsheetId: tgt.spreadsheetId,
          sourceTab: src.tabName,
          targetTab: tgt.tabName
        });
      }
    }

    var hasMoreInJob = endRow < lastRow;
    if (hasMoreInJob) {
      var nextCont = {
        sourceRowCount: lastRow,
        sourceLastColumn: src.sheet.getLastColumn(),
        nextStartRow: endRow + 1,
        jobId: job.id,
        planVersion: plan.version,
        sourceSpreadsheetId: src.spreadsheetId,
        sourceSheetName: src.tabName,
        targetSpreadsheetId: tgt.spreadsheetId,
        targetSheetName: tgt.tabName
      };
      sum.errorsByJob = errorsByJob;
      return {
        ok: true,
        canApply: false,
        summary: sum,
        rows: allRows,
        continuation: nextCont,
        planVersion: plan.version || '',
        continuationStale: false,
        partialReport: true,
        errorsByJob: errorsByJob,
        note: 'Partial chunk: run buildDataSyncReport until continuation is null before apply'
      };
    }
  }

  sum.errorsByJob = errorsByJob;
  return {
    ok: true,
    canApply: _dataSyncCanApplyAllJobs(errorsByJob, jobs),
    summary: sum,
    rows: allRows,
    continuation: null,
    planVersion: plan.version || '',
    continuationStale: false,
    errorsByJob: errorsByJob
  };
}

/**
 * Each job must satisfy its own maxErrorRows vs errors in that job.
 * @param {Object} errorsByJob - jobId -> count
 * @param {Object[]} jobsList
 * @returns {boolean}
 */
function _dataSyncCanApplyAllJobs(errorsByJob, jobsList) {
  var i;
  for (i = 0; i < jobsList.length; i++) {
    var j = jobsList[i];
    var ec = errorsByJob[j.id] || 0;
    if (j.maxErrorRows === 0) {
      if (ec > 0) return false;
    } else if (ec > j.maxErrorRows) {
      return false;
    }
  }
  return true;
}

/**
 * Patch row on any spreadsheet.
 */
function _dataSyncUpdateRowExternal(ss, tabName, rowNumber, patch, headers) {
  var sheet = ss.getSheetByName(tabName);
  var range = sheet.getRange(rowNumber, 1, 1, headers.length);
  var values = range.getValues()[0];
  var hi;
  var patchKeys = Object.keys(patch || {});
  for (hi = 0; hi < headers.length; hi++) {
    var hn = String(headers[hi] || '');
    if (patch[hn] !== undefined) values[hi] = patch[hn];
  }
  range.setValues([values]);
}

/**
 * Append record with explicit headers order.
 */
function _dataSyncAppendRowExternal(ss, tabName, headers, record) {
  var sheet = ss.getSheetByName(tabName);
  var row = headers.map(function(h) {
    var hn = String(h || '');
    return record[hn] !== undefined ? record[hn] : '';
  });
  sheet.appendRow(row);
}

/**
 * @param {Object} opts
 * @returns {Object}
 */
function runDataSync(opts) {
  opts = opts || {};
  if (opts.dryRun !== false) {
    return {
      applied: 0,
      skipped: 0,
      message: 'Data sync skipped: dryRun must be explicitly false to write',
      summary: { applySkippedErrorCount: 0, insert: 0, update: 0 }
    };
  }

  var rep = buildDataSyncReport(opts);
  if (!rep.ok && rep.validationIssues && rep.validationIssues.length) {
    return { applied: 0, message: 'Validation failed', report: rep };
  }
  if (rep.continuationStale) {
    return { applied: 0, message: 'Continuation stale: ' + (rep.staleReason || ''), report: rep };
  }
  if (rep.continuation) {
    return {
      applied: 0,
      message: 'Incomplete report: call buildDataSyncReport until continuation is null (partial chunk not writable)',
      report: rep
    };
  }
  if (!rep.canApply) {
    return { applied: 0, message: 'canApply false (per-job maxErrorRows)', report: rep };
  }

  var rows = rep.rows || [];
  var applied = 0;
  var applySkippedErrorCount = 0;
  var i;
  var t0 = Date.now();

  for (i = 0; i < rows.length; i++) {
    var rw = rows[i];
    if (rw.action === 'ERROR') {
      applySkippedErrorCount++;
      continue;
    }
    if (rw.action !== 'INSERT' && rw.action !== 'UPDATE') continue;

    var tss = _dataSyncOpenSpreadsheet(rw.targetSpreadsheetId);
    var tsh = tss.getSheetByName(rw.targetTab);
    var headers = tsh.getRange(1, 1, 1, tsh.getLastColumn()).getValues()[0];

    if (rw.action === 'INSERT') {
      _dataSyncAppendRowExternal(tss, rw.targetTab, headers, rw.proposed || {});
      applied++;
    } else {
      _dataSyncUpdateRowExternal(tss, rw.targetTab, rw.targetSheetRow, rw.proposed || {}, headers);
      applied++;
    }
  }

  var dur = Date.now() - t0;
  var first = rows[0] || {};
  var auditAfter = {
    inserted: rep.summary.insert,
    updated: rep.summary.update,
    skipped: rep.summary.skip,
    errorRowCount: rep.summary.errorRowCount,
    applySkippedErrorCount: applySkippedErrorCount,
    durationMs: dur,
    planVersion: rep.planVersion
  };
  var actorOpts = {};
  var u = cbvUser();
  if (!u || String(u).toLowerCase() === 'system') {
    actorOpts.actorId = cbvSystemActor();
  }

  if (typeof logAdminAudit === 'function') {
    logAdminAudit(
      'DATA_SYNC',
      'DATA_SYNC_JOB',
      String(opts.jobId || first.jobId || 'ALL'),
      'SYNC',
      { planVersion: rep.planVersion },
      auditAfter,
      'Data sync apply',
      actorOpts
    );
  }

  return {
    applied: applied,
    message: 'Data sync applied',
    summary: {
      applySkippedErrorCount: applySkippedErrorCount,
      insert: rep.summary.insert,
      update: rep.summary.update,
      skip: rep.summary.skip,
      errorRowCount: rep.summary.errorRowCount
    },
    report: rep
  };
}
