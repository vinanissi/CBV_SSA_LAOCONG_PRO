/**
 * CBV Task System Mock Data - Good and broken fixtures.
 * Use for validation tests without touching production sheets.
 * Dependencies: task_system_assertions.gs
 */

/** Good DON_VI rows (minimal valid tree) */
function getMockDonViGood() {
  return [
    { ID: 'DV_MOCK_001', DON_VI_TYPE: 'CONG_TY', CODE: 'CT_MOCK', NAME: 'Công ty Mock', PARENT_ID: '', STATUS: 'ACTIVE', IS_DELETED: false },
    { ID: 'DV_MOCK_002', DON_VI_TYPE: 'HTX', CODE: 'HTX_MOCK', NAME: 'HTX Mock', PARENT_ID: 'DV_MOCK_001', STATUS: 'ACTIVE', IS_DELETED: false }
  ];
}

/** Good USER_DIRECTORY rows */
function getMockUserGood() {
  return [
    { ID: 'UD_MOCK_001', EMAIL: 'admin@mock.vn', DISPLAY_NAME: 'Admin Mock', ROLE: 'ADMIN', STATUS: 'ACTIVE', DON_VI_ID: 'DV_MOCK_001', IS_DELETED: false },
    { ID: 'UD_MOCK_002', EMAIL: 'user@mock.vn', DISPLAY_NAME: 'User Mock', ROLE: 'OPERATOR', STATUS: 'ACTIVE', DON_VI_ID: 'DV_MOCK_002', IS_DELETED: false }
  ];
}

/** Good MASTER_CODE TASK_TYPE row */
function getMockTaskTypeGood() {
  return { ID: 'MC_MOCK_TASK', MASTER_GROUP: 'TASK_TYPE', CODE: 'GENERAL', NAME: 'Chung', STATUS: 'ACTIVE', IS_DELETED: false };
}

/** Good TASK_MAIN rows */
function getMockTaskGood() {
  return [
    { ID: 'TASK_MOCK_001', TITLE: 'Task 1', STATUS: 'NEW', PRIORITY: 'TRUNG_BINH', OWNER_ID: 'UD_MOCK_002', DON_VI_ID: 'DV_MOCK_002', TASK_TYPE_ID: 'MC_MOCK_TASK', DONE_AT: '', IS_DELETED: false },
    { ID: 'TASK_MOCK_002', TITLE: 'Task 2', STATUS: 'DONE', PRIORITY: 'CAO', OWNER_ID: 'UD_MOCK_002', DON_VI_ID: 'DV_MOCK_002', TASK_TYPE_ID: 'MC_MOCK_TASK', DONE_AT: '2025-03-22 10:00:00', IS_DELETED: false }
  ];
}

// --- BROKEN MOCK DATA ---

/** Invalid enum: ROLE = "Admin" instead of "ADMIN" */
function getMockUserBadEnum() {
  return { ID: 'UD_MOCK_BAD1', EMAIL: 'bad1@mock.vn', DISPLAY_NAME: 'Bad', ROLE: 'Admin', STATUS: 'ACTIVE', IS_DELETED: false };
}

/** Duplicate ID (same as existing) */
function getMockUserDupId() {
  return { ID: 'UD_MOCK_001', EMAIL: 'dup@mock.vn', DISPLAY_NAME: 'Dup', ROLE: 'OPERATOR', STATUS: 'ACTIVE', IS_DELETED: false };
}

/** Blank required EMAIL */
function getMockUserBlankEmail() {
  return { ID: 'UD_MOCK_BAD2', EMAIL: '', DISPLAY_NAME: 'Blank', ROLE: 'OPERATOR', STATUS: 'ACTIVE', IS_DELETED: false };
}

/** Broken DON_VI_ID ref */
function getMockUserBadDonViRef() {
  return { ID: 'UD_MOCK_BAD3', EMAIL: 'bad3@mock.vn', DISPLAY_NAME: 'Bad', ROLE: 'OPERATOR', STATUS: 'ACTIVE', DON_VI_ID: 'DV_NONEXISTENT', IS_DELETED: false };
}

/** DON_VI - Orphan parent */
function getMockDonViOrphanParent() {
  return { ID: 'DV_MOCK_BAD1', DON_VI_TYPE: 'BO_PHAN', CODE: 'BP', NAME: 'BP', PARENT_ID: 'DV_GHOST', STATUS: 'ACTIVE', IS_DELETED: false };
}

/** DON_VI - Self reference */
function getMockDonViSelfRef() {
  return { ID: 'DV_MOCK_BAD2', DON_VI_TYPE: 'CONG_TY', CODE: 'CT', NAME: 'CT', PARENT_ID: 'DV_MOCK_BAD2', STATUS: 'ACTIVE', IS_DELETED: false };
}

/** DON_VI - Circular (A→B→A) - need two rows */
function getMockDonViCircular() {
  return [
    { ID: 'DV_MOCK_A', DON_VI_TYPE: 'CONG_TY', CODE: 'A', NAME: 'A', PARENT_ID: 'DV_MOCK_B', STATUS: 'ACTIVE', IS_DELETED: false },
    { ID: 'DV_MOCK_B', DON_VI_TYPE: 'HTX', CODE: 'B', NAME: 'B', PARENT_ID: 'DV_MOCK_A', STATUS: 'ACTIVE', IS_DELETED: false }
  ];
}

/** TASK_MAIN - Invalid STATUS */
function getMockTaskBadStatus() {
  return { ID: 'TASK_MOCK_BAD1', TITLE: 'Bad', STATUS: 'FINISHED', PRIORITY: 'CAO', OWNER_ID: 'UD_MOCK_002', DON_VI_ID: 'DV_MOCK_002', TASK_TYPE_ID: 'MC_MOCK_TASK', IS_DELETED: false };
}

/** TASK_MAIN - DONE without DONE_AT */
function getMockTaskDoneNoTimestamp() {
  return { ID: 'TASK_MOCK_BAD2', TITLE: 'Done no ts', STATUS: 'DONE', PRIORITY: 'CAO', OWNER_ID: 'UD_MOCK_002', DON_VI_ID: 'DV_MOCK_002', TASK_TYPE_ID: 'MC_MOCK_TASK', DONE_AT: '', IS_DELETED: false };
}

/** TASK_MAIN - Invalid OWNER_ID */
function getMockTaskBadOwner() {
  return { ID: 'TASK_MOCK_BAD3', TITLE: 'Bad owner', STATUS: 'NEW', PRIORITY: 'CAO', OWNER_ID: 'UD_NONEXISTENT', DON_VI_ID: 'DV_MOCK_002', TASK_TYPE_ID: 'MC_MOCK_TASK', IS_DELETED: false };
}

/** TASK_MAIN - Invalid TASK_TYPE_ID */
function getMockTaskBadTaskType() {
  return { ID: 'TASK_MOCK_BAD4', TITLE: 'Bad type', STATUS: 'NEW', PRIORITY: 'CAO', OWNER_ID: 'UD_MOCK_002', DON_VI_ID: 'DV_MOCK_002', TASK_TYPE_ID: 'MC_NONEXISTENT', IS_DELETED: false };
}

/** Runs validation on good mock data. Returns findings. */
function validateMockDataGood() {
  var findings = [];
  var dv = getMockDonViGood();
  var uv = getMockUserGood();
  var tt = getMockTaskTypeGood();
  var tk = getMockTaskGood();

  // Duplicate ID check
  var ids = {};
  dv.concat(uv).concat([tt]).concat(tk).forEach(function(r) {
    var id = r.ID;
    if (ids[id]) findings.push({ code: 'DUP_ID', severity: 'HIGH', message: 'Duplicate ID: ' + id, rowId: id });
    ids[id] = true;
  });

  // Ref checks (mock: all refs internal)
  var dvIds = { 'DV_MOCK_001': true, 'DV_MOCK_002': true };
  var udIds = { 'UD_MOCK_001': true, 'UD_MOCK_002': true };
  var mcIds = { 'MC_MOCK_TASK': true };

  uv.forEach(function(r) {
    if (r.DON_VI_ID && !dvIds[r.DON_VI_ID]) {
      findings.push({ code: 'BAD_REF', severity: 'HIGH', message: 'USER.DON_VI_ID invalid: ' + r.DON_VI_ID, rowId: r.ID, field: 'DON_VI_ID' });
    }
  });

  tk.forEach(function(r) {
    if (r.OWNER_ID && !udIds[r.OWNER_ID]) {
      findings.push({ code: 'BAD_REF', severity: 'HIGH', message: 'TASK.OWNER_ID invalid: ' + r.OWNER_ID, rowId: r.ID, field: 'OWNER_ID' });
    }
    if (r.DON_VI_ID && !dvIds[r.DON_VI_ID]) {
      findings.push({ code: 'BAD_REF', severity: 'MEDIUM', message: 'TASK.DON_VI_ID invalid: ' + r.DON_VI_ID, rowId: r.ID, field: 'DON_VI_ID' });
    }
    if (r.TASK_TYPE_ID && !mcIds[r.TASK_TYPE_ID]) {
      findings.push({ code: 'BAD_REF', severity: 'HIGH', message: 'TASK.TASK_TYPE_ID invalid: ' + r.TASK_TYPE_ID, rowId: r.ID, field: 'TASK_TYPE_ID' });
    }
    if (r.STATUS === 'DONE' && !r.DONE_AT) {
      findings.push({ code: 'DONE_NO_TS', severity: 'MEDIUM', message: 'DONE without DONE_AT', rowId: r.ID, field: 'DONE_AT' });
    }
  });

  return { ok: findings.length === 0, findings: findings };
}

/** Runs validation on bad mock data. Expects findings. */
function validateMockDataBad() {
  var findings = [];
  var badUser = getMockUserBadEnum();
  var allowedRole = ['ADMIN', 'OPERATOR', 'VIEWER'];
  if (allowedRole.indexOf(badUser.ROLE) === -1) {
    findings.push({ code: 'INVALID_ENUM', severity: 'HIGH', message: 'ROLE=' + badUser.ROLE + ' invalid', rowId: badUser.ID, field: 'ROLE' });
  }

  var badTask = getMockTaskDoneNoTimestamp();
  if (badTask.STATUS === 'DONE' && !badTask.DONE_AT) {
    findings.push({ code: 'DONE_NO_TS', severity: 'MEDIUM', message: 'DONE without DONE_AT', rowId: badTask.ID, field: 'DONE_AT' });
  }

  var badTask2 = getMockTaskBadStatus();
  var allowedStatus = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING', 'DONE', 'CANCELLED', 'ARCHIVED'];
  if (allowedStatus.indexOf(badTask2.STATUS) === -1) {
    findings.push({ code: 'INVALID_ENUM', severity: 'HIGH', message: 'STATUS=' + badTask2.STATUS + ' invalid', rowId: badTask2.ID, field: 'STATUS' });
  }

  return { ok: findings.length === 0, findings: findings };
}
