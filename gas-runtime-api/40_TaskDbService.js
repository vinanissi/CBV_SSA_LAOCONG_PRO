/**
 * PHASE_TASK_GS_01 — Task DB service (existing sheet binding, no bootstrap).
 */

function taskDbNowIso_() {
  return Utilities.formatDate(new Date(), CBV_TASK_DB_CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
}

function taskDbToday_() {
  return Utilities.formatDate(new Date(), CBV_TASK_DB_CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function taskDbMakeId_(prefix) {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function taskDbFormatDate_(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, CBV_TASK_DB_CONFIG.TIMEZONE, 'yyyy-MM-dd');
  }
  return String(val).slice(0, 10);
}

function taskDbDaysSince_(dateStr) {
  if (!dateStr) return 999;
  try {
    var d = new Date(String(dateStr).slice(0, 10));
    var today = new Date(taskDbToday_());
    var diff = today.getTime() - d.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
}

function taskDbComputeUrgency_(task) {
  var cfg = CBV_TASK_DB_CONFIG;
  var today = taskDbToday_();
  var isDone = cfg.DONE_STATUSES.indexOf(task.status) >= 0;
  var isBlocked = cfg.BLOCKED_STATUSES.indexOf(task.status) >= 0;
  var isWaiting = task.status === 'WAITING' || task.status === 'WAITING_APPROVAL';
  var isOverdue = !isDone && task.dueDate && task.dueDate < today;
  var noOwner = !task.ownerId;
  var staleDays = taskDbDaysSince_(task.updatedAt);
  var isStale = !isDone && staleDays >= cfg.STALE_DAYS;
  var slaRiskLevel = 'LOW';
  if (isOverdue) slaRiskLevel = 'HIGH';
  else if (isBlocked || isWaiting || isStale) slaRiskLevel = 'MEDIUM';

  var labels = [];
  if (isOverdue) labels.push('Quá hạn SLA');
  if (isWaiting) labels.push('Chờ xử lý');
  if (isBlocked) labels.push('Bị kẹt');
  if (noOwner) labels.push('Chưa có người xử lý');
  if (isStale) labels.push('Không cập nhật ' + staleDays + ' ngày');
  if (task.pendingAction) labels.push(String(task.pendingAction));

  return {
    isBlocked: isBlocked,
    isOverdue: isOverdue,
    isWaiting: isWaiting,
    isStale: isStale,
    noOwner: noOwner,
    needsEscalation: isOverdue && staleDays >= cfg.ESCALATION_STALE_DAYS,
    slaRiskLevel: slaRiskLevel,
    labels: labels,
    staleDays: staleDays,
  };
}

function taskDbMapTaskSummaryRow_(rec, userMap) {
  var ownerId = taskDbNormalizeUserCode_(rec.OWNER_ID || rec.ownerId || rec.owner_id || '');
  var relatedType = String(rec.RELATED_ENTITY_TYPE || '').trim();
  var relatedId = String(rec.RELATED_ENTITY_ID || '').trim();
  var status = String(rec.STATUS || 'NEW').toUpperCase();
  var task = {
    taskId: String(rec.ID || ''),
    taskCode: String(rec.TASK_CODE || ''),
    title: String(rec.TITLE || ''),
    status: status,
    priority: String(rec.PRIORITY || 'MEDIUM').toUpperCase(),
    owner: ownerId,
    ownerId: ownerId,
    displayOwner: '',
    displayStatus: status,
    dueDate: taskDbFormatDate_(rec.DUE_DATE),
    updatedAt: String(rec.UPDATED_AT || rec.CREATED_AT || ''),
    progressPercent: rec.PROGRESS_PERCENT || 0,
    pendingAction: String(rec.PENDING_ACTION || ''),
    relatedEntityType: relatedType,
    relatedEntityId: relatedId,
    relatedHoSoId: relatedType === 'HO_SO' ? relatedId : '',
    href: '/tasks/' + String(rec.ID || ''),
    permissionAllowed: true,
    module: 'TASK',
    source: 'google_sheet_existing_db',
  };
  task.urgency = taskDbComputeUrgency_(task);
  task.isOverdue = task.urgency.isOverdue;
  task.slaStatus = task.urgency.isOverdue ? 'OVERDUE' : task.urgency.slaRiskLevel === 'HIGH' ? 'AT_RISK' : 'OK';
  return typeof taskDbEnrichTaskUserFields_ === 'function'
    ? taskDbEnrichTaskUserFields_(task, userMap)
    : task;
}

function taskDbMapTaskRow_(rec, userMap) {
  var task = taskDbMapTaskSummaryRow_(rec, userMap);
  task.description = String(rec.DESCRIPTION || '');
  task.reporterId = taskDbNormalizeUserCode_(rec.REPORTER_ID || rec.reporterId || rec.reporter_id || '');
  task.donViId = String(rec.DON_VI_ID || '');
  task.blockReason = String(rec.PENDING_ACTION || '');
  task.isPrivate = String(rec.IS_PRIVATE || '').toLowerCase() === 'true' || rec.IS_PRIVATE === true;
  return typeof taskDbEnrichTaskUserFields_ === 'function'
    ? taskDbEnrichTaskUserFields_(task, userMap)
    : task;
}

function taskDbIsDeleted_(rec) {
  return String(rec.IS_DELETED || '').toLowerCase() === 'true' || rec.IS_DELETED === true;
}

var TASK_DB_REQ_SS_ = null;

function taskDbGetSpreadsheetOnce_() {
  if (!TASK_DB_REQ_SS_) TASK_DB_REQ_SS_ = taskDbGetSpreadsheet_();
  return TASK_DB_REQ_SS_;
}

function taskDbResetRequestContext_() {
  TASK_DB_REQ_SS_ = null;
}

function taskDbReadMainSummaries_() {
  var readStart = Date.now();
  var info = taskDbGetMainHeaderMap_();
  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { summaries: [], rowsScanned: 0, sheetReadMs: Date.now() - readStart };
  }
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var sheetReadMs = Date.now() - readStart;
  if (typeof wiPerfAddSheetRead_ === 'function') wiPerfAddSheetRead_(values.length, sheetReadMs);
  var mapStart = Date.now();
  var userMap = typeof taskDbLoadUserDisplayMap_ === 'function' ? taskDbLoadUserDisplayMap_() : {};
  var summaries = [];
  for (var i = 0; i < values.length; i++) {
    var rec = taskDbRowToRecord_(info.headerMap, values[i]);
    if (!rec.ID || taskDbIsDeleted_(rec)) continue;
    summaries.push(taskDbMapTaskSummaryRow_(rec, userMap));
  }
  return {
    summaries: summaries,
    rowsScanned: values.length,
    sheetReadMs: sheetReadMs,
    mappingMs: Date.now() - mapStart,
  };
}

/** @deprecated use taskDbReadMainSummaries_ */
function taskDbReadAllMainRows_() {
  var r = taskDbReadMainSummaries_();
  return r.summaries;
}

function taskDbFindMainRow_(taskId) {
  if (typeof taskDbRowIndexResetTrace_ === 'function') taskDbRowIndexResetTrace_();
  if (typeof taskDbFindMainRowFast_ === 'function') {
    return taskDbFindMainRowFast_(taskId);
  }
  return taskDbFindMainRowScan_(taskId);
}

function taskDbApplyFilters_(tasks, filters) {
  filters = filters || {};
  var result = tasks.slice();

  if (filters.status) {
    var st = String(filters.status).toUpperCase();
    result = result.filter(function (t) { return t.status === st; });
  }
  if (filters.assignee) {
    var a = String(filters.assignee);
    result = result.filter(function (t) { return t.ownerId === a || t.owner === a; });
  }
  if (filters.priority) {
    var pr = String(filters.priority).toUpperCase();
    result = result.filter(function (t) { return t.priority === pr; });
  }
  if (filters.q) {
    var q = String(filters.q).toLowerCase();
    result = result.filter(function (t) {
      return t.title.toLowerCase().indexOf(q) >= 0 ||
        t.taskId.toLowerCase().indexOf(q) >= 0 ||
        (t.taskCode && t.taskCode.toLowerCase().indexOf(q) >= 0);
    });
  }

  result.sort(function (a, b) {
    var ua = String(a.updatedAt || a.dueDate || '');
    var ub = String(b.updatedAt || b.dueDate || '');
    return ub.localeCompare(ua);
  });

  var limit = parseInt(filters.limit, 10) || CBV_TASK_DB_CONFIG.DEFAULT_LIMIT;
  if (limit > CBV_TASK_DB_CONFIG.MAX_LIMIT) limit = CBV_TASK_DB_CONFIG.MAX_LIMIT;
  if (limit > 0 && result.length > limit) result = result.slice(0, limit);

  return result;
}

function taskDbComputeCounts_(tasks) {
  var today = taskDbToday_();
  var cfg = CBV_TASK_DB_CONFIG;
  var counts = { total: tasks.length, open: 0, inProgress: 0, blocked: 0, done: 0, dueToday: 0, overdue: 0, noOwner: 0 };

  tasks.forEach(function (t) {
    if (cfg.DONE_STATUSES.indexOf(t.status) >= 0) counts.done++;
    else counts.open++;
    if (cfg.IN_PROGRESS_STATUSES.indexOf(t.status) >= 0) counts.inProgress++;
    if (cfg.BLOCKED_STATUSES.indexOf(t.status) >= 0) counts.blocked++;
    if (!t.ownerId) counts.noOwner++;
    if (t.dueDate === today && cfg.DONE_STATUSES.indexOf(t.status) < 0) counts.dueToday++;
    if (t.dueDate && t.dueDate < today && cfg.DONE_STATUSES.indexOf(t.status) < 0) counts.overdue++;
  });
  return counts;
}

function taskDbBuildSnapshotFromSummaries_(allTasks, filters, metrics) {
  var today = taskDbToday_();
  var cfg = CBV_TASK_DB_CONFIG;
  var hl = cfg.HIGHLIGHT_LIMIT || 15;
  var counts = taskDbComputeCounts_(allTasks);

  var blockedTasks = allTasks.filter(function (t) { return cfg.BLOCKED_STATUSES.indexOf(t.status) >= 0; }).slice(0, hl);
  var dueTasks = allTasks.filter(function (t) {
    return t.dueDate === today && cfg.DONE_STATUSES.indexOf(t.status) < 0;
  }).slice(0, hl);
  var overdueTasks = allTasks.filter(function (t) {
    return t.dueDate && t.dueDate < today && cfg.DONE_STATUSES.indexOf(t.status) < 0;
  }).slice(0, hl);

  var tasks = taskDbApplyFilters_(allTasks, filters);
  var gasDurationMs = Date.now() - (metrics.startMs || Date.now());

  var snapshot = {
    tasks: tasks,
    counts: counts,
    blockedTasks: blockedTasks,
    dueTasks: dueTasks,
    overdueTasks: overdueTasks,
    userDisplayMap: typeof taskDbLoadUserDisplayMap_ === 'function' ? taskDbLoadUserDisplayMap_() : {},
    usersById: typeof taskDbLoadUsersById_ === 'function' ? taskDbLoadUsersById_() : {},
    runtimeUsersById: typeof taskDbLoadRuntimeUsersById_ === 'function' ? taskDbLoadRuntimeUsersById_() : {},
    runtime: taskDbBuildRuntimeMetrics_({
      cacheHit: false,
      gasDurationMs: gasDurationMs,
      sheetReadMs: metrics.sheetReadMs || 0,
      mappingMs: metrics.mappingMs || 0,
      rowsScanned: metrics.rowsScanned || allTasks.length,
      rowsReturned: tasks.length,
    }),
    schemaWarnings: [],
  };

  snapshot.runtime.payloadBytesApprox = taskDbApproxPayloadBytes_(snapshot);
  return snapshot;
}

function taskDbGetWorkspaceSnapshot_(filters) {
  filters = filters || {};
  var cacheKey = taskDbCacheKey_('snapshot', filters);
  var totalStart = Date.now();

  try {
    var cached = taskDbCacheGet_(cacheKey);
    if (cached) {
      cached.runtime = cached.runtime || {};
      cached.runtime.cacheHit = true;
      cached.runtime.connected = true;
      cached.runtime.gasDurationMs = Date.now() - totalStart;
      cached.runtime.lastSyncAt = taskDbNowIso_();
      return cached;
    }

    var countsCached = taskDbCacheGet_(taskDbCountsCacheKey_());
    var allTasks;
    var metrics = { startMs: totalStart, sheetReadMs: 0, mappingMs: 0, rowsScanned: 0 };

    if (countsCached && countsCached.summaries) {
      allTasks = countsCached.summaries;
      metrics.rowsScanned = countsCached.rowsScanned || allTasks.length;
      metrics.sheetReadMs = 0;
      metrics.mappingMs = 0;
      metrics.fromCountsCache = true;
    } else {
      var readResult = taskDbReadMainSummaries_();
      allTasks = readResult.summaries;
      metrics.sheetReadMs = readResult.sheetReadMs;
      metrics.mappingMs = readResult.mappingMs;
      metrics.rowsScanned = readResult.rowsScanned;
      taskDbCacheSet_(taskDbCountsCacheKey_(), {
        summaries: allTasks,
        rowsScanned: readResult.rowsScanned,
        cachedAt: taskDbNowIso_(),
      }, CBV_TASK_DB_CONFIG.COUNTS_CACHE_TTL_SEC);
    }

    var snapshot = taskDbBuildSnapshotFromSummaries_(allTasks, filters, metrics);
    if (metrics.fromCountsCache) {
      snapshot.runtime.countsCacheHit = true;
    }
    var elapsedMs = Date.now() - totalStart;

    if (typeof taskDbObserveSnapshotMetrics_ === 'function') {
      taskDbObserveSnapshotMetrics_(snapshot, elapsedMs, false);
    }
    if (typeof taskDbObserveBlockedStale_ === 'function') {
      taskDbObserveBlockedStale_(snapshot.blockedTasks.slice(0, 5));
    }
    if (snapshot.runtime.payloadBytesApprox >= CBV_TASK_DB_CONFIG.PAYLOAD_WARN_BYTES) {
      if (typeof taskDbAppendObservation_ === 'function') {
        taskDbAppendObservation_({
          type: 'PAYLOAD_TOO_LARGE',
          message: 'Snapshot payload ~' + snapshot.runtime.payloadBytesApprox + ' bytes',
          severity: 'WARN',
          detail: { payloadBytesApprox: snapshot.runtime.payloadBytesApprox },
        });
      }
    }

    taskDbCacheSet_(cacheKey, snapshot, CBV_TASK_DB_CONFIG.CACHE_TTL_SEC);
    return snapshot;
  } finally {
    taskDbResetRequestContext_();
  }
}

function CBV_TaskDb_validateExistingDb() {
  var report = taskDbBuildSchemaReport_();
  var ok = !report.missingRequired.some(function (m) { return m.indexOf('Sheet missing') >= 0; });
  return {
    ok: ok,
    spreadsheetId: CBV_TASK_DB_ID,
    mode: 'google_sheet_existing_db',
    sheets: report.sheets,
    missingRequired: report.missingRequired,
    warnings: report.warnings,
  };
}

function taskDbGetTaskDetail_(taskId) {
  var totalStart = Date.now();
  var cacheKey = taskDbDetailCacheKey_(taskId);
  var cached = taskDbCacheGet_(cacheKey);
  if (cached) {
    cached.runtime = cached.runtime || {};
    cached.runtime.cacheHit = true;
    cached.runtime.gasDurationMs = Date.now() - totalStart;
    return cached;
  }

  try {
    var found = taskDbFindMainRow_(taskId);
    if (!found) return null;

    var readStart = Date.now();
    var userMap = typeof taskDbLoadUserDisplayMap_ === 'function' ? taskDbLoadUserDisplayMap_() : {};
    var task = taskDbMapTaskRow_(found.record, userMap);
    task.timeline = taskDbGetTimelineForTask_(taskId);
    task.files = taskDbGetAttachmentsForTask_(taskId);
    var readMs = Date.now() - readStart;

    task.recentUpdates = task.timeline.slice(0, 5);
    task.slaStatus = task.urgency.isOverdue ? 'OVERDUE' : task.urgency.slaRiskLevel === 'HIGH' ? 'AT_RISK' : 'OK';
    task.nextStep = task.pendingAction || (task.urgency.isWaiting ? 'Chờ phản hồi / xác nhận' : task.status === 'NEW' ? 'Nhận việc và bắt đầu xử lý' : 'Cập nhật tiến độ');
    task.runtime = {
      cacheHit: false,
      gasDurationMs: Date.now() - totalStart,
      sheetReadMs: readMs,
      timelineCount: task.timeline.length,
      attachmentCount: task.files.length,
    };

    var elapsed = Date.now() - totalStart;
    if (typeof taskDbObserveDetailMetrics_ === 'function') {
      taskDbObserveDetailMetrics_(taskId, elapsed);
    }

    taskDbCacheSet_(cacheKey, task, CBV_TASK_DB_CONFIG.DETAIL_CACHE_TTL_SEC);
    return task;
  } finally {
    taskDbResetRequestContext_();
  }
}

function taskDbGetTimelineForTask_(taskId) {
  var limit = CBV_TASK_DB_CONFIG.TIMELINE_LIMIT || 20;
  var userMap = typeof taskDbLoadUserDisplayMap_ === 'function' ? taskDbLoadUserDisplayMap_() : {};
  var info = taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_UPDATE_LOG);
  if (!info.exists) return [];
  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var events = [];
  for (var i = values.length - 1; i >= 0 && events.length < limit * 3; i--) {
    var rec = taskDbRowToRecord_(info.headerMap, values[i]);
    if (String(rec.TASK_ID) !== String(taskId)) continue;
    if (taskDbIsDeleted_(rec)) continue;
    var event = {
      time: String(rec.CREATED_AT || ''),
      actor: String(rec.CREATED_BY || rec.ACTOR_ID || ''),
      action: String(rec.UPDATE_TYPE || rec.ACTION || ''),
      message: String(rec.ACTION || ''),
      source: 'TASK_UPDATE_LOG',
      resourceId: String(rec.ID || ''),
    };
    if (typeof taskDbEnrichTimelineActor_ === 'function') {
      events.push(taskDbEnrichTimelineActor_(event, userMap));
    } else {
      events.push(event);
    }
  }
  events.sort(function (a, b) { return String(b.time).localeCompare(String(a.time)); });
  return events.slice(0, limit);
}

function taskDbGetAttachmentsForTask_(taskId) {
  var limit = CBV_TASK_DB_CONFIG.ATTACHMENT_LIMIT || 10;
  var info = taskDbReadHeaders_(CBV_TASK_DB_CONFIG.SHEETS.TASK_ATTACHMENT);
  if (!info.exists) return [];
  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var files = [];
  for (var i = 0; i < values.length && files.length < limit; i++) {
    var rec = taskDbRowToRecord_(info.headerMap, values[i]);
    if (String(rec.TASK_ID) !== String(taskId)) continue;
    if (taskDbIsDeleted_(rec)) continue;
    files.push({
      fileId: String(rec.ID || ''),
      fileName: String(rec.FILE_NAME || rec.TITLE || ''),
      fileGroup: String(rec.ATTACHMENT_TYPE || ''),
      createdAt: String(rec.CREATED_AT || ''),
      createdBy: String(rec.CREATED_BY || ''),
    });
  }
  return files;
}

function taskDbMakeTaskCode_(taskId) {
  var suffix = String(taskId || '').replace(/^TASK-?/i, '').slice(-8).toUpperCase();
  return 'TK-' + (suffix || Date.now().toString(36).toUpperCase());
}

function taskDbCreateTask_(payload, actor) {
  var info = taskDbGetMainHeaderMap_();
  var taskId = taskDbMakeId_('TASK');
  var now = taskDbNowIso_();
  var ownerId = payload.assignee || payload.ownerId || actor.userId || actor.displayName;

  var record = {
    ID: taskId,
    TASK_CODE: payload.taskCode || taskDbMakeTaskCode_(taskId),
    TITLE: String(payload.title || '').trim(),
    DESCRIPTION: String(payload.description || '').trim(),
    TASK_TYPE_ID: String(payload.taskTypeId || payload.task_type_id || '').trim(),
    STATUS: 'NEW',
    PRIORITY: String(payload.priority || 'MEDIUM').toUpperCase(),
    DON_VI_ID: String(payload.donViId || payload.don_vi_id || actor.donViId || '').trim(),
    OWNER_ID: ownerId,
    REPORTER_ID: actor.userId || ownerId,
    SHARED_WITH: '',
    IS_PRIVATE: 'false',
    START_DATE: '',
    DUE_DATE: payload.dueDate || taskDbToday_(),
    DONE_AT: '',
    PROGRESS_PERCENT: 0,
    RESULT_SUMMARY: '',
    CREATED_AT: now,
    CREATED_BY: actor.displayName || actor.userId,
    UPDATED_AT: now,
    UPDATED_BY: actor.displayName || actor.userId,
    IS_STARRED: 'false',
    IS_PINNED: 'false',
    IS_DELETED: 'false',
    PENDING_ACTION: '',
    RELATED_ENTITY_TYPE: String(payload.relatedEntityType || payload.related_entity_type || '').trim(),
    RELATED_ENTITY_ID: String(payload.relatedEntityId || payload.related_entity_id || '').trim(),
  };

  if (!record.TITLE) return { ok: false, message: 'title là bắt buộc' };

  var row = taskDbRecordToRow_(info.headerMap, info.headers, record);
  info.sheet.appendRow(row);
  if (typeof taskDbRowIndexPut_ === 'function') {
    taskDbRowIndexPut_(taskId, info.sheet.getLastRow());
  }

  var logEntry = taskDbAppendUpdateLog_({
    taskId: taskId,
    updateType: 'STATUS_CHANGE',
    action: 'CREATE',
    actorId: actor.userId,
    actorName: actor.displayName,
    note: payload.note || 'Tạo task mới',
  });

  taskDbCacheInvalidate_('snapshot');
  taskDbCacheInvalidateDetail_(taskId);
  taskDbAppendAudit_({ traceId: payload.traceId, actor: actor.displayName, action: 'createTask', detail: { taskId: taskId } });

  return { ok: true, task: taskDbMapTaskRow_(record, taskDbGetUserMap_()), log: logEntry };
}

function taskDbGetUserMap_() {
  return typeof taskDbLoadUserDisplayMap_ === 'function' ? taskDbLoadUserDisplayMap_() : {};
}

function taskDbUpdateTaskStatus_(taskId, status, actor, note, opts) {
  opts = opts || {};
  var lookupStart = Date.now();
  var found = taskDbFindMainRow_(taskId);
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('mutationLookupMs', Date.now() - lookupStart);
  if (!found) return { ok: false, message: 'Không tìm thấy task' };

  var normStart = Date.now();
  var newStatus = String(status).toUpperCase();
  var now = taskDbNowIso_();
  var patch = { STATUS: newStatus, UPDATED_AT: now, UPDATED_BY: actor.displayName || actor.userId };
  if (CBV_TASK_DB_CONFIG.DONE_STATUSES.indexOf(newStatus) >= 0) patch.DONE_AT = now;
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('mutationNormalizeMs', Date.now() - normStart);

  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('mutationPatchBuildMs', 0);

  var writeStart = Date.now();
  taskDbPatchMainRow_(found, patch);
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('mutationSheetWriteMs', Date.now() - writeStart);

  var logEntry = null;
  if (!opts.skipUpdateLog) {
    logEntry = taskDbAppendUpdateLog_({
      taskId: taskId,
      updateType: 'STATUS_CHANGE',
      action: 'STATUS: ' + found.record.STATUS + ' → ' + newStatus,
      actorId: actor.userId,
      actorName: actor.displayName,
      note: note || '',
    });
  }

  if (!opts.skipSnapshotCacheInvalidate) {
    taskDbCacheInvalidate_('snapshot');
  }
  if (!opts.skipDetailCacheInvalidate) {
    taskDbCacheInvalidateDetail_(taskId);
  }
  if (!opts.skipCbvAudit) {
    taskDbAppendAudit_({ actor: actor.displayName, action: 'updateTaskStatus', detail: { taskId: taskId, status: newStatus } });
  }

  Object.keys(patch).forEach(function (k) {
    found.record[k] = patch[k];
  });

  var task =
    typeof taskDbBuildMutationTaskPatch_ === 'function'
      ? taskDbBuildMutationTaskPatch_(found, patch, opts)
      : taskDbMapTaskRow_(found.record, taskDbGetUserMap_());

  return { ok: true, task: task, log: logEntry };
}

function taskDbAssignTask_(taskId, assignee, actor, note, opts) {
  opts = opts || {};
  var lookupStart = Date.now();
  var found = taskDbFindMainRow_(taskId);
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('mutationLookupMs', Date.now() - lookupStart);
  if (!found) return { ok: false, message: 'Không tìm thấy task' };

  var now = taskDbNowIso_();
  var patch = {
    OWNER_ID: String(assignee),
    UPDATED_AT: now,
    UPDATED_BY: actor.displayName || actor.userId,
  };

  var writeStart = Date.now();
  taskDbPatchMainRow_(found, patch);
  if (typeof wiPerfMarkPhase_ === 'function') wiPerfMarkPhase_('mutationSheetWriteMs', Date.now() - writeStart);

  var logEntry = null;
  if (!opts.skipUpdateLog) {
    logEntry = taskDbAppendUpdateLog_({
      taskId: taskId,
      updateType: 'STATUS_CHANGE',
      action: 'ASSIGN: ' + found.record.OWNER_ID + ' → ' + assignee,
      actorId: actor.userId,
      actorName: actor.displayName,
      note: note || '',
    });
  }

  if (!opts.skipSnapshotCacheInvalidate) taskDbCacheInvalidate_('snapshot');
  if (!opts.skipDetailCacheInvalidate) taskDbCacheInvalidateDetail_(taskId);
  if (!opts.skipCbvAudit) {
    taskDbAppendAudit_({ actor: actor.displayName, action: 'assignTask', detail: { taskId: taskId, assignee: assignee } });
  }

  Object.keys(patch).forEach(function (k) {
    found.record[k] = patch[k];
  });

  var task =
    typeof taskDbBuildMutationTaskPatch_ === 'function'
      ? taskDbBuildMutationTaskPatch_(found, patch, opts)
      : taskDbMapTaskRow_(found.record, taskDbGetUserMap_());

  return { ok: true, task: task, log: logEntry };
}

function taskDbAddComment_(taskId, comment, actor) {
  var found = taskDbFindMainRow_(taskId);
  if (!found) return { ok: false, message: 'Không tìm thấy task' };

  var logEntry = taskDbAppendUpdateLog_({
    taskId: taskId,
    updateType: 'NOTE',
    action: 'COMMENT',
    actorId: actor.userId,
    actorName: actor.displayName,
    note: String(comment || '').trim(),
  });

  taskDbCacheInvalidateDetail_(taskId);
  taskDbAppendAudit_({ actor: actor.displayName, action: 'addTaskComment', detail: { taskId: taskId } });
  return { ok: true, log: logEntry };
}

function taskDbCompleteTask_(taskId, actor, note, opts) {
  return taskDbUpdateTaskStatus_(taskId, 'DONE', actor, note || 'Hoàn thành task', opts);
}

function CBV_TaskDb_getTaskWorkspaceSnapshot(payload) {
  var filters = payload && (payload.filters || payload);
  return taskDbGetWorkspaceSnapshot_(filters || {});
}

function CBV_TaskDb_getAllowedActions() {
  return (typeof CBV_TASK_DB_ACTIONS !== 'undefined' ? CBV_TASK_DB_ACTIONS : []).slice();
}

function CBV_TaskDb_isRegisteredAction(action) {
  var a = String(action || '').trim();
  var list = typeof CBV_TASK_DB_ACTIONS !== 'undefined' ? CBV_TASK_DB_ACTIONS : [];
  return list.indexOf(a) >= 0;
}

function taskDbPatchMainRow_(found, patch) {
  var info = found.info;
  var sheet = info.sheet;
  var writeStart = Date.now();
  Object.keys(patch).forEach(function (col) {
    var idx = info.headerMap[col.toUpperCase()];
    if (idx !== undefined) {
      sheet.getRange(found.rowNumber, idx + 1).setValue(patch[col]);
    }
  });
  if (typeof wiPerfAddSheetWrite_ === 'function') wiPerfAddSheetWrite_(Date.now() - writeStart);
}
