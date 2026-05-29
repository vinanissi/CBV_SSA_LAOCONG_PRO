/**
 * PHASE_TASK_GS_09A/09D/10 — USER_DIRECTORY display + runtime identity binding.
 */

var TASK_DB_USER_DIRECTORY_CACHE_ = null;

/** Trim + normalize USER_CODE / OWNER_ID lookup keys */
function taskDbNormalizeUserCode_(val) {
  var s = String(val || '').trim();
  if (!s) return '';
  if (/^usr[_-]/i.test(s)) return s.toUpperCase();
  return s;
}

function taskDbIndexUserCache_(cache, key, entry, display) {
  var code = taskDbNormalizeUserCode_(key);
  if (!code) return;
  cache.usersById[code] = entry;
  cache.map[code] = display;
}

function taskDbResolveOwnerIdFromTask_(task) {
  return taskDbNormalizeUserCode_(task.ownerId || task.OWNER_ID || task.owner_id || '');
}

function taskDbResolveReporterIdFromTask_(task) {
  return taskDbNormalizeUserCode_(
    task.reporterId || task.REPORTER_ID || task.reporter_id || '',
  );
}

function taskDbLookupUserMap_(map, ref) {
  var code = taskDbNormalizeUserCode_(ref);
  if (!code) return '';
  if (map[code] && map[code] !== code) return map[code];
  var trimmed = String(ref || '').trim();
  if (trimmed && trimmed !== code && map[trimmed] && map[trimmed] !== trimmed) return map[trimmed];
  return '';
}

function taskDbLookupUserEntry_(users, ref) {
  var code = taskDbNormalizeUserCode_(ref);
  if (!code) return null;
  if (users[code]) return users[code];
  var trimmed = String(ref || '').trim();
  if (trimmed && trimmed !== code && users[trimmed]) return users[trimmed];
  return null;
}

function taskDbIsTruthy_(val) {
  return val === true || String(val || '').toLowerCase() === 'true' || String(val || '').toLowerCase() === 'yes';
}

function taskDbParseInt_(val, fallback) {
  var n = parseInt(String(val || ''), 10);
  return isNaN(n) ? fallback : n;
}

function taskDbResolveRuntimeMode_(rec) {
  if (taskDbIsTruthy_(rec.IS_ADMIN)) return 'admin';
  if (taskDbIsTruthy_(rec.IS_SUPERVISOR)) return 'supervisor';
  if (taskDbIsTruthy_(rec.IS_OPERATOR)) return 'operator';
  var role = String(rec.ROLE || rec.ROLE_CODE || '').toUpperCase();
  if (role === 'ADMIN') return 'admin';
  if (role === 'MANAGER' || role === 'SUPERVISOR') return 'supervisor';
  if (role === 'OPERATOR' || role === 'STAFF') return 'operator';
  return 'viewer';
}

function taskDbBuildRuntimeUserEntry_(rec, id, code, display) {
  var workloadLimit = taskDbParseInt_(rec.WORKLOAD_LIMIT, 12);
  var activeQueueCount = taskDbParseInt_(rec.ACTIVE_QUEUE_COUNT, 0);
  var isAdmin = taskDbIsTruthy_(rec.IS_ADMIN);
  var isSupervisor = taskDbIsTruthy_(rec.IS_SUPERVISOR);
  var isOperator = taskDbIsTruthy_(rec.IS_OPERATOR);
  var mode = taskDbResolveRuntimeMode_(rec);
  var canAssign = taskDbIsTruthy_(rec.CAN_ASSIGN) || isAdmin || isSupervisor || mode === 'operator';
  var canApprove = taskDbIsTruthy_(rec.CAN_APPROVE) || isAdmin || isSupervisor;
  var canEscalate = taskDbIsTruthy_(rec.CAN_ESCALATE) || isAdmin || isSupervisor;
  var canResolve = taskDbIsTruthy_(rec.CAN_RESOLVE) || isAdmin || isOperator || isSupervisor;

  return {
    id: id || code,
    userCode: code || id,
    displayName: display,
    fullName: rec.FULL_NAME ? String(rec.FULL_NAME).trim() : undefined,
    email: rec.EMAIL ? String(rec.EMAIL).trim() : undefined,
    role: rec.ROLE ? String(rec.ROLE).trim() : undefined,
    directoryRole: rec.ROLE_CODE ? String(rec.ROLE_CODE).trim() : undefined,
    status: rec.STATUS ? String(rec.STATUS).trim() : undefined,
    mode: mode,
    capabilities: {
      canAssign: canAssign,
      canApprove: canApprove,
      canEscalate: canEscalate,
      canResolve: canResolve,
    },
    workload: {
      activeQueueCount: activeQueueCount,
      workloadLimit: workloadLimit,
      isOverloaded: activeQueueCount > 0 && workloadLimit > 0 && activeQueueCount >= workloadLimit,
    },
    queueDefaults: {
      defaultQueue: rec.DEFAULT_QUEUE ? String(rec.DEFAULT_QUEUE).trim() : '',
      defaultDashboard: rec.DEFAULT_DASHBOARD ? String(rec.DEFAULT_DASHBOARD).trim() : '',
    },
    relationships: {
      supervisorId: rec.SUPERVISOR_ID ? String(rec.SUPERVISOR_ID).trim() : undefined,
      teamId: rec.TEAM_ID ? String(rec.TEAM_ID).trim() : undefined,
      donViId: rec.DON_VI_ID ? String(rec.DON_VI_ID).trim() : undefined,
    },
    flags: {
      isOperator: isOperator || mode === 'operator',
      isSupervisor: isSupervisor || mode === 'supervisor',
      isAdmin: isAdmin || mode === 'admin',
    },
  };
}

function taskDbLoadUserDirectory_() {
  if (TASK_DB_USER_DIRECTORY_CACHE_) return TASK_DB_USER_DIRECTORY_CACHE_;

  var cache = { map: {}, usersById: {} };
  var info = taskDbReadHeaders_('USER_DIRECTORY');
  if (!info.exists || !info.sheet) {
    TASK_DB_USER_DIRECTORY_CACHE_ = cache;
    return cache;
  }

  var sheet = info.sheet;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    TASK_DB_USER_DIRECTORY_CACHE_ = cache;
    return cache;
  }

  var idIdx = info.headerMap.ID;
  var codeIdx = info.headerMap.USER_CODE;
  var displayIdx = info.headerMap.DISPLAY_NAME;
  var fullIdx = info.headerMap.FULL_NAME;
  var roleIdx = info.headerMap.ROLE;
  var emailIdx = info.headerMap.EMAIL;
  var deletedIdx = info.headerMap.IS_DELETED;
  var supervisorIdx = info.headerMap.SUPERVISOR_ID;
  var teamIdx = info.headerMap.TEAM_ID;
  var donViIdx = info.headerMap.DON_VI_ID;
  var workloadLimitIdx = info.headerMap.WORKLOAD_LIMIT;
  var activeQueueIdx = info.headerMap.ACTIVE_QUEUE_COUNT;
  var defaultQueueIdx = info.headerMap.DEFAULT_QUEUE;
  var defaultDashboardIdx = info.headerMap.DEFAULT_DASHBOARD;
  var isOperatorIdx = info.headerMap.IS_OPERATOR;
  var isSupervisorIdx = info.headerMap.IS_SUPERVISOR;
  var isAdminIdx = info.headerMap.IS_ADMIN;
  var canAssignIdx = info.headerMap.CAN_ASSIGN;
  var canApproveIdx = info.headerMap.CAN_APPROVE;
  var canEscalateIdx = info.headerMap.CAN_ESCALATE;
  var canResolveIdx = info.headerMap.CAN_RESOLVE;
  var roleCodeIdx = info.headerMap.ROLE_CODE;
  var statusIdx = info.headerMap.STATUS;
  var userIdIdx = info.headerMap.USER_ID;

  if (codeIdx === undefined && idIdx === undefined) {
    TASK_DB_USER_DIRECTORY_CACHE_ = cache;
    return cache;
  }

  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if (deletedIdx !== undefined) {
      var del = row[deletedIdx];
      if (del === true || String(del).toLowerCase() === 'true') continue;
    }

    var id = idIdx !== undefined ? taskDbNormalizeUserCode_(row[idIdx]) : '';
    var code = codeIdx !== undefined ? taskDbNormalizeUserCode_(row[codeIdx]) : '';
    var userIdAlt = userIdIdx !== undefined ? taskDbNormalizeUserCode_(row[userIdIdx]) : '';
    // TASK_MAIN OWNER_ID / REPORTER_ID → USER_CODE (not internal ID)
    var lookupKey = code || id;
    if (!lookupKey) continue;

    // Display priority mirrors FE resolver: DISPLAY_NAME → FULL_NAME → EMAIL → code → id.
    // EMAIL is a human-readable fallback so a card never shows a raw USR_* code when
    // a name is missing but an email exists. Raw OWNER_ID/REPORTER_ID stay intact on the row.
    var display = '';
    if (displayIdx !== undefined) display = String(row[displayIdx] || '').trim();
    if (!display && fullIdx !== undefined) display = String(row[fullIdx] || '').trim();
    if (!display && emailIdx !== undefined) display = String(row[emailIdx] || '').trim();
    if (!display && code) display = code;
    if (!display) display = lookupKey;

    var rec = {
      FULL_NAME: fullIdx !== undefined ? row[fullIdx] : '',
      EMAIL: emailIdx !== undefined ? row[emailIdx] : '',
      ROLE: roleIdx !== undefined ? row[roleIdx] : '',
      ROLE_CODE: roleCodeIdx !== undefined ? row[roleCodeIdx] : '',
      STATUS: statusIdx !== undefined ? row[statusIdx] : '',
      SUPERVISOR_ID: supervisorIdx !== undefined ? row[supervisorIdx] : '',
      TEAM_ID: teamIdx !== undefined ? row[teamIdx] : '',
      DON_VI_ID: donViIdx !== undefined ? row[donViIdx] : '',
      WORKLOAD_LIMIT: workloadLimitIdx !== undefined ? row[workloadLimitIdx] : '',
      ACTIVE_QUEUE_COUNT: activeQueueIdx !== undefined ? row[activeQueueIdx] : '',
      DEFAULT_QUEUE: defaultQueueIdx !== undefined ? row[defaultQueueIdx] : '',
      DEFAULT_DASHBOARD: defaultDashboardIdx !== undefined ? row[defaultDashboardIdx] : '',
      IS_OPERATOR: isOperatorIdx !== undefined ? row[isOperatorIdx] : '',
      IS_SUPERVISOR: isSupervisorIdx !== undefined ? row[isSupervisorIdx] : '',
      IS_ADMIN: isAdminIdx !== undefined ? row[isAdminIdx] : '',
      CAN_ASSIGN: canAssignIdx !== undefined ? row[canAssignIdx] : '',
      CAN_APPROVE: canApproveIdx !== undefined ? row[canApproveIdx] : '',
      CAN_ESCALATE: canEscalateIdx !== undefined ? row[canEscalateIdx] : '',
      CAN_RESOLVE: canResolveIdx !== undefined ? row[canResolveIdx] : '',
    };

    var entry = taskDbBuildRuntimeUserEntry_(rec, id || code, code || id, display);

    taskDbIndexUserCache_(cache, lookupKey, entry, display);
    if (code && code !== lookupKey) taskDbIndexUserCache_(cache, code, entry, display);
    if (id && id !== lookupKey && id !== code) taskDbIndexUserCache_(cache, id, entry, display);
    if (userIdAlt && userIdAlt !== lookupKey && userIdAlt !== id && userIdAlt !== code) {
      taskDbIndexUserCache_(cache, userIdAlt, entry, display);
    }
  }

  TASK_DB_USER_DIRECTORY_CACHE_ = cache;
  return cache;
}

function taskDbLoadUserDisplayMap_() {
  return taskDbLoadUserDirectory_().map;
}

function taskDbLoadUsersById_() {
  return taskDbLoadUserDirectory_().usersById;
}

function taskDbLoadRuntimeUsersById_() {
  return taskDbLoadUserDirectory_().usersById;
}

function taskDbResetUserDisplayMap_() {
  TASK_DB_USER_DIRECTORY_CACHE_ = null;
}

function taskDbResolveUserDisplay_(ref, map) {
  if (!ref) return '';
  var userCode = taskDbNormalizeUserCode_(ref);
  if (!userCode) return '';
  map = map || taskDbLoadUserDisplayMap_();
  var resolved = taskDbLookupUserMap_(map, userCode);
  if (resolved) return resolved;
  return userCode;
}

/** Resolve TASK_MAIN OWNER_ID / REPORTER_ID (USER_CODE) → display ref */
function taskDbResolveUserRef_(ref, map) {
  var userCode = taskDbNormalizeUserCode_(ref);
  if (!userCode) return null;
  map = map || taskDbLoadUserDisplayMap_();
  var users = taskDbLoadUsersById_();
  var entry = taskDbLookupUserEntry_(users, userCode);
  var displayName = entry ? entry.displayName : taskDbLookupUserMap_(map, userCode);
  if (!displayName || displayName === userCode) {
    displayName = taskDbLookupUserMap_(map, userCode) || userCode;
  }
  return {
    userCode: userCode,
    displayName: displayName,
    id: entry && entry.id ? entry.id : userCode,
  };
}

function taskDbEnrichTaskUserFields_(task, map) {
  map = map || taskDbLoadUserDisplayMap_();
  var ownerCode = taskDbResolveOwnerIdFromTask_(task);
  if (ownerCode) {
    task.ownerId = ownerCode;
    var ownerRef = taskDbResolveUserRef_(ownerCode, map);
    var displayName = ownerRef ? ownerRef.displayName : taskDbResolveUserDisplay_(ownerCode, map);
    task.owner = displayName;
    task.displayOwner = displayName;
    task.ownerUser = {
      userCode: ownerCode,
      displayName: displayName,
      id: ownerRef ? ownerRef.id : ownerCode,
    };
  } else {
    task.owner = task.owner || '';
    task.displayOwner = 'Chưa giao';
    task.ownerUser = null;
  }

  var reporterCode = taskDbResolveReporterIdFromTask_(task);
  if (reporterCode) {
    task.reporterId = reporterCode;
    var reporterRef = taskDbResolveUserRef_(reporterCode, map);
    task.reporterUser = reporterRef;
    task.displayReporter = reporterRef
      ? reporterRef.displayName
      : taskDbResolveUserDisplay_(reporterCode, map);
  } else {
    task.reporterUser = null;
    task.displayReporter = '';
  }

  return task;
}

function taskDbEnrichTimelineActor_(event, map) {
  map = map || taskDbLoadUserDisplayMap_();
  var raw = taskDbNormalizeUserCode_(event.actor || event.actorId || '');
  if (!raw) return event;
  event.actorId = raw;
  event.actor = taskDbResolveUserDisplay_(raw, map);
  return event;
}
