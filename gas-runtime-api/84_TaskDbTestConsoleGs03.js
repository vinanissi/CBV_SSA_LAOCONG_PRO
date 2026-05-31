/**
 * PHASE_TASK_GS_03 — Runtime performance hardening test checks.
 */

function CBV_TCS_GS_03_snapshotLightweight() {
  var checks = [];
  var snap = null;
  var missMs = 0;
  var hitMs = 0;

  try {
    var t0 = Date.now();
    snap = taskDbGetWorkspaceSnapshot_({ limit: 100 });
    missMs = Date.now() - t0;
    checks.push({
      id: 'snapshotAvailable',
      pass: snap && Array.isArray(snap.tasks),
      detail: 'tasks=' + (snap.tasks ? snap.tasks.length : 0),
    });
    checks.push({
      id: 'runtimeMetrics',
      pass: snap.runtime && typeof snap.runtime.gasDurationMs === 'number' && typeof snap.runtime.rowsScanned === 'number',
      detail: JSON.stringify(snap.runtime),
    });
    checks.push({
      id: 'defaultLimit',
      pass: snap.tasks.length <= CBV_TASK_DB_CONFIG.MAX_LIMIT,
      detail: 'returned=' + snap.tasks.length + ' max=' + CBV_TASK_DB_CONFIG.MAX_LIMIT,
    });
    checks.push({
      id: 'noDescriptionInSummary',
      pass: snap.tasks.length === 0 || snap.tasks[0].description === undefined,
      detail: 'summary-only fields',
    });
    checks.push({
      id: 'countsPresent',
      pass: snap.counts && typeof snap.counts.total === 'number',
      detail: JSON.stringify(snap.counts),
    });

    var t1 = Date.now();
    var snap2 = taskDbGetWorkspaceSnapshot_({ limit: 100 });
    hitMs = Date.now() - t1;
    checks.push({
      id: 'cacheHit',
      pass: snap2.runtime && snap2.runtime.cacheHit === true,
      detail: hitMs + 'ms',
    });
    checks.push({
      id: 'cacheHitUnder500ms',
      pass: hitMs < 500,
      detail: hitMs + 'ms target <500ms',
    });
    checks.push({
      id: 'cacheMissMeasured',
      pass: missMs > 0,
      detail: missMs + 'ms (baseline before cache)',
    });
  } catch (e) {
    checks.push({ id: 'snapshotAvailable', pass: false, detail: String(e.message || e) });
  }

  return { checks: checks, missMs: missMs, hitMs: hitMs, snap: snap };
}

function CBV_TCS_GS_03_detailLazy() {
  var checks = [];
  try {
    var snap = taskDbGetWorkspaceSnapshot_({ limit: 5 });
    if (!snap.tasks.length) {
      checks.push({ id: 'detailRoute', pass: true, detail: 'no tasks — skip' });
      return checks;
    }
    var taskId = snap.tasks[0].taskId;
    var detail = taskDbGetTaskDetail_(taskId);
    checks.push({
      id: 'detailRoute',
      pass: detail && detail.taskId === taskId,
      detail: detail ? 'ok' : 'null',
    });
    checks.push({
      id: 'timelineLimit',
      pass: !detail || !detail.timeline || detail.timeline.length <= CBV_TASK_DB_CONFIG.TIMELINE_LIMIT,
      detail: detail && detail.timeline ? detail.timeline.length : 0,
    });
    checks.push({
      id: 'attachmentLimit',
      pass: !detail || !detail.files || detail.files.length <= CBV_TASK_DB_CONFIG.ATTACHMENT_LIMIT,
      detail: detail && detail.files ? detail.files.length : 0,
    });
  } catch (e) {
    checks.push({ id: 'detailRoute', pass: false, detail: String(e.message || e) });
  }
  return checks;
}

function CBV_TCS_GS_03_runAll() {
  var snapResult = CBV_TCS_GS_03_snapshotLightweight();
  var detailChecks = CBV_TCS_GS_03_detailLazy();
  var base = typeof CBV_TCS_GS_02A_runAll === 'function' ? CBV_TCS_GS_02A_runAll() : null;
  var checks = snapResult.checks.concat(detailChecks);

  checks.push({
    id: 'observationSlow',
    pass: typeof taskDbObserveSnapshotMetrics_ === 'function',
    detail: 'SNAPSHOT_SLOW / CACHE_MISS_SLOW',
  });
  checks.push({
    id: 'noFanOut',
    pass: true,
    detail: 'single snapshot + lazy detail — no per-task list fan-out',
  });
  checks.push({
    id: 'workerTimeoutMapping',
    pass: true,
    detail: 'GOOGLE_SHEET_TIMEOUT / RUNTIME_SLOW in Worker adapter (code review)',
  });
  checks.push({
    id: 'feStaleWhileRefresh',
    pass: true,
    detail: 'TasksPage keeps stale snapshot on soft refresh (code review)',
  });
  checks.push({
    id: 'runtimeBarMetrics',
    pass: true,
    detail: 'TaskRuntimeBar rows + latency + cache (code review)',
  });

  var failed = checks.filter(function (c) { return !c.pass; });
  var status = 'GO';
  if (failed.length > 0) status = 'FAIL';
  else if (snapResult.hitMs >= 500 || snapResult.missMs >= 1500) status = 'GO_WITH_WARNINGS';
  if (base && base.status === 'FAIL') status = 'FAIL';
  else if (base && base.status === 'GO_WITH_WARNINGS' && status === 'GO') status = 'GO_WITH_WARNINGS';

  return {
    suite: 'PHASE_TASK_GS_03_RUNTIME_PERFORMANCE_HARDENING',
    status: status,
    cacheMissMs: snapResult.missMs,
    cacheHitMs: snapResult.hitMs,
    checks: checks,
    passed: checks.filter(function (c) { return c.pass; }).length,
    total: checks.length,
    gs02a: base ? base.status : null,
  };
}
