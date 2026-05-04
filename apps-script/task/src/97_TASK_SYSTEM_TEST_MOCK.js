/**
 * CBV Task System Mock Data - Good and broken fixtures.
 * Source: 07_TEST/task_system_mock_data.gs
 */

function getMockDonViGood() {
  return [
    { ID: 'DV_MOCK_001', DON_VI_TYPE: 'CONG_TY', CODE: 'CT_MOCK', NAME: 'Công ty Mock', PARENT_ID: '', STATUS: 'ACTIVE', IS_DELETED: false },
    { ID: 'DV_MOCK_002', DON_VI_TYPE: 'HTX', CODE: 'HTX_MOCK', NAME: 'HTX Mock', PARENT_ID: 'DV_MOCK_001', STATUS: 'ACTIVE', IS_DELETED: false }
  ];
}

function getMockUserGood() {
  return [
    { ID: 'UD_MOCK_001', EMAIL: 'admin@mock.vn', DISPLAY_NAME: 'Admin Mock', ROLE: 'ADMIN', STATUS: 'ACTIVE', DON_VI_ID: 'DV_MOCK_001', IS_DELETED: false },
    { ID: 'UD_MOCK_002', EMAIL: 'user@mock.vn', DISPLAY_NAME: 'User Mock', ROLE: 'OPERATOR', STATUS: 'ACTIVE', DON_VI_ID: 'DV_MOCK_002', IS_DELETED: false }
  ];
}

function getMockTaskTypeGood() {
  return { ID: 'MC_MOCK_TASK', MASTER_GROUP: 'TASK_TYPE', CODE: 'GENERAL', NAME: 'Chung', STATUS: 'ACTIVE', IS_DELETED: false };
}

function getMockTaskGood() {
  return [
    { ID: 'TASK_MOCK_001', TITLE: 'Task 1', STATUS: 'NEW', PRIORITY: 'TRUNG_BINH', OWNER_ID: 'UD_MOCK_002', DON_VI_ID: 'DV_MOCK_002', TASK_TYPE_ID: 'MC_MOCK_TASK', DONE_AT: '', IS_DELETED: false },
    { ID: 'TASK_MOCK_002', TITLE: 'Task 2', STATUS: 'DONE', PRIORITY: 'CAO', OWNER_ID: 'UD_MOCK_002', DON_VI_ID: 'DV_MOCK_002', TASK_TYPE_ID: 'MC_MOCK_TASK', DONE_AT: '2025-03-22 10:00:00', IS_DELETED: false }
  ];
}

function getMockUserBadEnum() {
  return { ID: 'UD_MOCK_BAD1', EMAIL: 'bad1@mock.vn', DISPLAY_NAME: 'Bad', ROLE: 'Admin', STATUS: 'ACTIVE', IS_DELETED: false };
}

function getMockTaskDoneNoTimestamp() {
  return { ID: 'TASK_MOCK_BAD2', TITLE: 'Done no ts', STATUS: 'DONE', PRIORITY: 'CAO', OWNER_ID: 'UD_MOCK_002', DON_VI_ID: 'DV_MOCK_002', TASK_TYPE_ID: 'MC_MOCK_TASK', DONE_AT: '', IS_DELETED: false };
}

function getMockTaskBadStatus() {
  return { ID: 'TASK_MOCK_BAD1', TITLE: 'Bad', STATUS: 'FINISHED', PRIORITY: 'CAO', OWNER_ID: 'UD_MOCK_002', DON_VI_ID: 'DV_MOCK_002', TASK_TYPE_ID: 'MC_MOCK_TASK', IS_DELETED: false };
}

function validateMockDataGood() {
  var findings = [];
  var dv = getMockDonViGood();
  var uv = getMockUserGood();
  var tt = getMockTaskTypeGood();
  var tk = getMockTaskGood();
  var ids = {};
  dv.concat(uv).concat([tt]).concat(tk).forEach(function(r) {
    var id = r.ID;
    if (ids[id]) findings.push({ code: 'DUP_ID', severity: 'HIGH', message: 'Duplicate ID: ' + id, rowId: id });
    ids[id] = true;
  });
  var dvIds = { 'DV_MOCK_001': true, 'DV_MOCK_002': true };
  var udIds = { 'UD_MOCK_001': true, 'UD_MOCK_002': true };
  var mcIds = { 'MC_MOCK_TASK': true };
  uv.forEach(function(r) {
    if (r.DON_VI_ID && !dvIds[r.DON_VI_ID]) {
      findings.push({ code: 'BAD_REF', severity: 'HIGH', message: 'USER.DON_VI_ID invalid: ' + r.DON_VI_ID, rowId: r.ID, field: 'DON_VI_ID' });
    }
  });
  tk.forEach(function(r) {
    if (r.OWNER_ID && !udIds[r.OWNER_ID]) findings.push({ code: 'BAD_REF', severity: 'HIGH', message: 'TASK.OWNER_ID invalid: ' + r.OWNER_ID, rowId: r.ID, field: 'OWNER_ID' });
    if (r.DON_VI_ID && !dvIds[r.DON_VI_ID]) findings.push({ code: 'BAD_REF', severity: 'MEDIUM', message: 'TASK.DON_VI_ID invalid: ' + r.DON_VI_ID, rowId: r.ID, field: 'DON_VI_ID' });
    if (r.TASK_TYPE_ID && !mcIds[r.TASK_TYPE_ID]) findings.push({ code: 'BAD_REF', severity: 'HIGH', message: 'TASK.TASK_TYPE_ID invalid: ' + r.TASK_TYPE_ID, rowId: r.ID, field: 'TASK_TYPE_ID' });
    if (r.STATUS === 'DONE' && !r.DONE_AT) findings.push({ code: 'DONE_NO_TS', severity: 'MEDIUM', message: 'DONE without DONE_AT', rowId: r.ID, field: 'DONE_AT' });
  });
  return { ok: findings.length === 0, findings: findings };
}

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
