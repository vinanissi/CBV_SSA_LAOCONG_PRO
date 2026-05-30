/**
 * PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_AUDIT + LATENCY_PROFILING — GAS timing (append-only).
 */

var WI_PERF_REQ_ = null;

function wiPerfBegin_(traceId, action, taskId, actor) {
  WI_PERF_REQ_ = {
    traceId: traceId || '',
    phase: 'WORK_INBOX_LATENCY_PROFILING',
    action: action || '',
    taskId: taskId || '',
    actor: actor || '',
    startedAt: new Date().toISOString(),
    startMs: Date.now(),
    sheetReadCount: 0,
    sheetWriteCount: 0,
    rowsScanned: 0,
    gasSheetReadMs: 0,
    gasSheetWriteMs: 0,
    openSpreadsheetMs: 0,
    getSheetMs: 0,
    taskLookupMs: 0,
    readRows: 0,
    writeRows: 0,
    phases: {},
    warnings: [],
    errors: [],
  };
  return WI_PERF_REQ_;
}

function wiPerfMarkPhase_(key, ms) {
  if (!WI_PERF_REQ_ || !key) return;
  if (!WI_PERF_REQ_.phases) WI_PERF_REQ_.phases = {};
  WI_PERF_REQ_.phases[key] = (WI_PERF_REQ_.phases[key] || 0) + (ms || 0);
}

function wiPerfRunTimed_(key, fn) {
  var t0 = Date.now();
  try {
    return fn();
  } finally {
    wiPerfMarkPhase_(key, Date.now() - t0);
  }
}

function wiPerfAddSheetRead_(rowsScanned, readMs) {
  if (!WI_PERF_REQ_) return;
  WI_PERF_REQ_.sheetReadCount += 1;
  WI_PERF_REQ_.rowsScanned += rowsScanned || 0;
  WI_PERF_REQ_.gasSheetReadMs += readMs || 0;
}

function wiPerfAddSheetWrite_(writeMs) {
  if (!WI_PERF_REQ_) return;
  WI_PERF_REQ_.sheetWriteCount += 1;
  WI_PERF_REQ_.gasSheetWriteMs += writeMs || 0;
}

function wiPerfClassify_(ms) {
  if (ms <= 1500) return 'OK';
  if (ms <= 3000) return 'WARNING';
  if (ms <= 7000) return 'DEGRADED';
  return 'FAIL';
}

function wiPerfClassifyLatency_(ms) {
  if (ms < 1000) return 'FAST';
  if (ms < 3000) return 'ACCEPTABLE';
  if (ms < 5000) return 'WARNING';
  if (ms < 10000) return 'DEGRADED';
  return 'FAIL';
}

function wiPerfToEnvelope_(ctx, ok) {
  if (!ctx) return null;
  var durationMs = Date.now() - (ctx.startMs || Date.now());
  var status = wiPerfClassify_(durationMs);
  var latencyStatus = wiPerfClassifyLatency_(durationMs);
  if (status === 'WARNING') ctx.warnings.push('GAS slow ' + durationMs + 'ms');
  if (status === 'DEGRADED') ctx.warnings.push('GAS degraded ' + durationMs + 'ms');
  if (status === 'FAIL') ctx.errors.push('GAS fail threshold ' + durationMs + 'ms');
  if (ctx.rowsScanned > 500) ctx.warnings.push('Large scan rowsScanned=' + ctx.rowsScanned);
  if (ctx.sheetReadCount > 3) ctx.warnings.push('High sheet read count ' + ctx.sheetReadCount);

  var phases = ctx.phases || {};
  var responseBuildMs = phases.responseBuildMs || phases.envelopeBuildMs || 0;
  if (phases.responseMs && phases.responseMs >= durationMs - 50) {
    responseBuildMs = phases.envelopeBuildMs || phases.jsonStringifyMs || 0;
  }
  var actionDispatchMs = phases.actionDispatchMs || 0;
  var gasBreakdown = {
    totalMs: durationMs,
    gasEntryAt: phases.parseMs || 0,
    actionDispatchStart: phases.actionDispatchStart || 0,
    actionDispatchMs: actionDispatchMs,
    actionDispatchEnd: actionDispatchMs,
    parseMs: phases.parseMs || 0,
    dispatchMs: phases.dispatchMs || actionDispatchMs,
    readMs: ctx.gasSheetReadMs || phases.readMs || 0,
    writeMs: ctx.gasSheetWriteMs || phases.writeMs || 0,
    timelineAppendMs: phases.timelineAppendMs || 0,
    auditAppendMs: phases.auditAppendMs || 0,
    responseMs: responseBuildMs,
    responseBuildMs: responseBuildMs,
    envelopeBuildMs: phases.envelopeBuildMs || 0,
    jsonStringifyMs: phases.jsonStringifyMs || 0,
    gasExitAt: durationMs,
    responseBytes: phases.responseBytes || 0,
    taskPatchBytes: phases.taskPatchBytes || 0,
    performanceTraceBytes: phases.performanceTraceBytes || 0,
    mutationMs: phases.mutationMs || 0,
    mutationLookupMs: phases.mutationLookupMs || 0,
    mutationNormalizeMs: phases.mutationNormalizeMs || 0,
    mutationPatchBuildMs: phases.mutationPatchBuildMs || 0,
    mutationSheetWriteMs: phases.mutationSheetWriteMs || 0,
    mutationFlushMs: phases.mutationFlushMs || 0,
    mutationRecordBuildMs: phases.mutationRecordBuildMs || 0,
    mutationResponsePatchMs: phases.mutationResponsePatchMs || 0,
    timelineHeaderMs: phases.timelineHeaderMs || 0,
    timelineWriteMs: phases.timelineWriteMs || 0,
    timelineSheetMs: phases.timelineSheetMs || 0,
    timelineRowBuildMs: phases.timelineRowBuildMs || 0,
    timelineMirrorMs: phases.timelineMirrorMs || 0,
    auditHeaderMs: phases.auditHeaderMs || 0,
    auditWriteMs: phases.auditWriteMs || 0,
    auditSheetMs: phases.auditSheetMs || 0,
    auditRowBuildMs: phases.auditRowBuildMs || 0,
    auditMirrorMs: phases.auditMirrorMs || 0,
    appendSharedContextUsed: phases.appendSharedContextUsed || 0,
    appendBatchWriteMs: phases.appendBatchWriteMs || 0,
    timelineRowsScanned: phases.timelineRowsScanned || 0,
    timelineFastPathUsed: phases.timelineFastPathUsed || 0,
    documentsRowsScanned: phases.documentsRowsScanned || 0,
    documentsSkipped: phases.documentsSkipped || 0,
    documentsFastPathUsed: phases.documentsFastPathUsed || 0,
    fallbackMinimalPatchUsed: phases.fallbackMinimalPatchUsed || 0,
    fullPatchFallbackUsed: phases.fullPatchFallbackUsed || 0,
    bundleTimelineMs: phases.bundleTimelineMs || 0,
    bundleNotesMs: phases.bundleNotesMs || 0,
    bundleAppointmentsMs: phases.bundleAppointmentsMs || 0,
    bundleDocumentsMs: phases.bundleDocumentsMs || 0,
    bundleAuditsMs: phases.bundleAuditsMs || 0,
  };
  var sheetBreakdown = {
    openSpreadsheetMs: ctx.openSpreadsheetMs || phases.openSpreadsheetMs || 0,
    getSheetMs: ctx.getSheetMs || phases.getSheetMs || 0,
    taskLookupMs: phases.taskLookupMs || ctx.taskLookupMs || 0,
    readRows: ctx.readRows || 0,
    writeRows: ctx.writeRows || 0,
    rowsScanned: ctx.rowsScanned || 0,
  };

  return {
    traceId: ctx.traceId,
    phase: ctx.phase,
    action: ctx.action,
    taskId: ctx.taskId,
    actor: ctx.actor,
    startedAt: ctx.startedAt,
    endedAt: new Date().toISOString(),
    durationMs: durationMs,
    totalDurationMs: durationMs,
    layerTimings: {
      gasTotalMs: durationMs,
      gasSheetReadMs: ctx.gasSheetReadMs,
      gasSheetWriteMs: ctx.gasSheetWriteMs,
    },
    fe: {},
    worker: {},
    gas: gasBreakdown,
    sheet: sheetBreakdown,
    requestCount: 1,
    sheetReadCount: ctx.sheetReadCount,
    sheetWriteCount: ctx.sheetWriteCount,
    rowsScanned: ctx.rowsScanned,
    rowIndexCacheHit: ctx.rowIndexCacheHit || false,
    rowIndexCacheMiss: ctx.rowIndexCacheMiss || false,
    rowIndexFallbackScan: ctx.rowIndexFallbackScan || false,
    refreshCount: 0,
    status: ok === false ? 'FAIL' : status,
    latencyStatus: ok === false ? 'FAIL' : latencyStatus,
    warnings: ctx.warnings,
    errors: ctx.errors,
  };
}

function wiPerfAppendTraceSheet_(envelope) {
  if (!envelope) return;
  try {
    var info = taskDbReadHeaders_('WORK_INBOX_PERFORMANCE_TRACE');
    if (!info.exists) return;
    var row = taskDbRecordToRow_(info.headerMap, info.headers, {
      ID: 'WPT-' + Date.now().toString(36),
      TRACE_ID: envelope.traceId,
      ACTION: envelope.action,
      TASK_ID: envelope.taskId || '',
      DURATION_MS: envelope.durationMs,
      STATUS: envelope.status,
      PAYLOAD_JSON: JSON.stringify(envelope),
      CREATED_AT: envelope.endedAt,
    });
    info.sheet.appendRow(row);
  } catch (e) {
    /* optional sheet */
  }
}

function wiPerfMergeRowIndex_(rowTrace) {
  if (!WI_PERF_REQ_ || !rowTrace) return;
  if (rowTrace.hit) WI_PERF_REQ_.rowIndexCacheHit = true;
  if (rowTrace.miss) WI_PERF_REQ_.rowIndexCacheMiss = true;
  if (rowTrace.fallback) WI_PERF_REQ_.rowIndexFallbackScan = true;
  WI_PERF_REQ_.rowsScanned = (WI_PERF_REQ_.rowsScanned || 0) + (rowTrace.rowsScanned || 0);
}

function wiPerfMergeCombined_(flags) {
  if (!WI_PERF_REQ_ || !flags) return;
  if (flags.combinedActionUsed) WI_PERF_REQ_.combinedActionUsed = true;
  if (flags.refreshPolicy) WI_PERF_REQ_.refreshPolicy = flags.refreshPolicy;
}

function wiPerfFinishAndAttach_(response, ok) {
  var envelopeBuildStart = Date.now();
  if (typeof taskDbRowIndexFlushPerf_ === 'function') taskDbRowIndexFlushPerf_();
  if (typeof wiPerfMarkPhase_ === 'function') {
    wiPerfMarkPhase_('envelopeBuildMs', Date.now() - envelopeBuildStart);
  }

  var responseBytes = 0;
  var taskPatchBytes = 0;
  if (response && typeof wiPerfMarkPhase_ === 'function') {
    var stringifyStart = Date.now();
    try {
      var data = response.data;
      if (data && data.taskPatch) {
        taskPatchBytes = JSON.stringify(data.taskPatch).length;
      }
      responseBytes = JSON.stringify(response).length;
    } catch (e) {
      /* ignore */
    }
    wiPerfMarkPhase_('jsonStringifyMs', Date.now() - stringifyStart);
    wiPerfMarkPhase_('responseBuildMs', Date.now() - envelopeBuildStart);
    wiPerfMarkPhase_('responseBytes', responseBytes);
    wiPerfMarkPhase_('taskPatchBytes', taskPatchBytes);
  }

  var envelope = wiPerfToEnvelope_(WI_PERF_REQ_, ok);
  if (envelope && envelope.gas && typeof wiPerfMarkPhase_ === 'function') {
    try {
      wiPerfMarkPhase_('performanceTraceBytes', JSON.stringify(envelope.gas).length);
      envelope.gas.performanceTraceBytes = WI_PERF_REQ_.phases.performanceTraceBytes || 0;
      envelope.gas.responseBytes = WI_PERF_REQ_.phases.responseBytes || 0;
      envelope.gas.taskPatchBytes = WI_PERF_REQ_.phases.taskPatchBytes || 0;
    } catch (e2) {
      /* ignore */
    }
  }
  if (response && envelope) {
    response.performanceTrace = envelope;
    wiPerfAppendTraceSheet_(envelope);
  }
  WI_PERF_REQ_ = null;
  return response;
}
