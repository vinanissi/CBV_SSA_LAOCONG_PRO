/**
 * CBV Task Validation - Enforces task model rules.
 * DON_VI_ID → active DON_VI; OWNER_ID/REPORTER_ID → active users; STATUS transitions; checklist completion.
 * Dependencies: 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 20_TASK_REPOSITORY
 */

/** Valid STATUS transitions. PRO flow: NEW→IN_PROGRESS→DONE/CANCELLED. Legacy: ASSIGNED, WAITING, ARCHIVED. */
var TASK_VALID_TRANSITIONS = {
  NEW: ['ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['WAITING', 'DONE', 'CANCELLED'],
  WAITING: ['IN_PROGRESS', 'CANCELLED'],
  DONE: ['IN_PROGRESS', 'ARCHIVED'],
  CANCELLED: ['IN_PROGRESS', 'ARCHIVED'],
  ARCHIVED: []
};

/** UPDATE_TYPE enum values for TASK_UPDATE_LOG. */
var TASK_UPDATE_TYPES = ['NOTE', 'QUESTION', 'ANSWER', 'STATUS_CHANGE'];

/**
 * Asserts TASK_TYPE_ID points to an active TASK_TYPE row in MASTER_CODE.
 * @param {string} taskTypeId
 * @param {string} fieldName
 */
function assertActiveTaskTypeId(taskTypeId, fieldName) {
  if (!taskTypeId || String(taskTypeId).trim() === '') return;
  var row = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.MASTER_CODE, String(taskTypeId).trim()) : null;
  if (!row) throw new Error('Invalid ' + (fieldName || 'TASK_TYPE_ID') + ': not found in MASTER_CODE');
  if (String(row.MASTER_GROUP || '').trim() !== 'TASK_TYPE') throw new Error('TASK_TYPE_ID must reference MASTER_GROUP=TASK_TYPE');
  if (String(row.STATUS || '').trim() !== 'ACTIVE') throw new Error('TASK_TYPE is not ACTIVE: ' + taskTypeId);
  if (String(row.IS_DELETED) === 'true' || row.IS_DELETED === true) throw new Error('TASK_TYPE is deleted: ' + taskTypeId);
}

/**
 * Asserts DON_VI_ID points to an active DON_VI row.
 * @param {string} donViId
 * @param {string} fieldName
 */
function assertActiveDonViId(donViId, fieldName) {
  ensureRequired(donViId, fieldName || 'DON_VI_ID');
  var donVi = typeof donViFindById === 'function' ? donViFindById(donViId) : null;
  if (!donVi) throw new Error('Invalid ' + (fieldName || 'DON_VI_ID') + ': must reference an active DON_VI');
  if (String(donVi.STATUS) !== 'ACTIVE') throw new Error('DON_VI is not ACTIVE: ' + donViId);
  if (String(donVi.IS_DELETED) === 'true' || donVi.IS_DELETED === true) {
    throw new Error('DON_VI is deleted: ' + donViId);
  }
}

/**
 * @param {string} from - Current STATUS
 * @param {string} to - Target STATUS
 * @returns {boolean}
 */
function validateTaskTransition(from, to) {
  var allowed = TASK_VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.indexOf(to) !== -1;
}

/**
 * Blocks modification to ARCHIVED tasks.
 * @param {string} taskId
 */
function ensureTaskEditable(taskId) {
  var task = typeof taskFindById === 'function' ? taskFindById(taskId) : null;
  cbvAssert(task, 'Task not found');
  cbvAssert(String(task.STATUS) !== 'ARCHIVED', 'Cannot edit ARCHIVED task');
}

/**
 * Blocks DONE if required checklist items are incomplete.
 * @param {string} taskId
 */
function ensureTaskCanComplete(taskId) {
  var items = typeof taskGetChecklistItems === 'function' ? taskGetChecklistItems(taskId) : [];
  var pendingRequired = items.filter(function(r) {
    var req = String(r.IS_REQUIRED) === 'true' || r.IS_REQUIRED === true;
    if (!req) return false;
    var done = String(r.IS_DONE) === 'true' || r.IS_DONE === true;
    return !done;
  });
  cbvAssert(pendingRequired.length === 0, 'Required checklist items are not completed');
}

/**
 * Validates UPDATE_TYPE for log entries.
 * @param {string} updateType
 */
function assertValidUpdateType(updateType) {
  cbvAssert(TASK_UPDATE_TYPES.indexOf(updateType) !== -1, 'Invalid UPDATE_TYPE: ' + updateType);
}

/**
 * Logs a warning when SHARED_WITH is set but IS_PRIVATE is false (expected only when task is private).
 * @param {Object} data
 */
function warnTaskPrivacyConsistency(data) {
  if (!data || typeof data !== 'object') return;
  var sw = data.SHARED_WITH != null && String(data.SHARED_WITH).trim() !== '';
  var priv = data.IS_PRIVATE === true || String(data.IS_PRIVATE).toLowerCase() === 'true';
  if (sw && !priv) Logger.log('[TASK_VALIDATION] Warning: SHARED_WITH has value but IS_PRIVATE is false');
}

/**
 * Validates task create/update payload for PRO architecture.
 * @param {Object} data - Create/update payload
 * @param {boolean} isCreate - true for create
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateTaskPayload(data, isCreate) {
  var errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Payload required'] };
  }
  if (isCreate) {
    if (!String(data.TITLE || '').trim()) errors.push('TITLE required');
    if (!String(data.OWNER_ID || '').trim()) errors.push('OWNER_ID required');
    if (!String(data.DON_VI_ID || '').trim()) errors.push('DON_VI_ID required');
    if (!String(data.PRIORITY || '').trim()) errors.push('PRIORITY required');
  }
  if (data.DON_VI_ID != null && String(data.DON_VI_ID).trim()) {
    var dv = typeof donViFindById === 'function' ? donViFindById(String(data.DON_VI_ID).trim()) : null;
    if (!dv) errors.push('DON_VI_ID does not reference active DON_VI');
    else if (String(dv.STATUS) !== 'ACTIVE' || dv.IS_DELETED === true) errors.push('DON_VI is not active');
  }
  if (data.TASK_TYPE_ID != null && String(data.TASK_TYPE_ID).trim()) {
    try {
      if (typeof assertActiveTaskTypeId === 'function') assertActiveTaskTypeId(data.TASK_TYPE_ID, 'TASK_TYPE_ID');
    } catch (e) { errors.push('TASK_TYPE_ID: ' + (e.message || e)); }
  }
  if (data.OWNER_ID != null && String(data.OWNER_ID).trim()) {
    try {
      if (typeof assertActiveUserId === 'function') assertActiveUserId(data.OWNER_ID, 'OWNER_ID');
    } catch (e) { errors.push('OWNER_ID: ' + (e.message || e)); }
  }
  if (data.PRIORITY != null && String(data.PRIORITY).trim()) {
    var prio = String(data.PRIORITY).trim();
    if (['CAO', 'TRUNG_BINH', 'THAP'].indexOf(prio) === -1) {
      if (typeof assertValidEnumValue === 'function') {
        try { assertValidEnumValue('TASK_PRIORITY', prio, 'PRIORITY'); } catch (e) { errors.push('PRIORITY: ' + e.message); }
      } else errors.push('PRIORITY must be CAO, TRUNG_BINH, or THAP');
    }
  }
  if (data.TITLE != null && String(data.TITLE).length > 500) errors.push('TITLE max 500 chars');
  return { valid: errors.length === 0, errors: errors };
}

/**
 * Pre-validate create payload. Call before createTask for early failure.
 * @param {Object} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateTaskForCreate(data) {
  return validateTaskPayload(data, true);
}

/**
 * Pre-validate update patch. Call before updateTask for early failure.
 * @param {Object} patch
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateTaskForUpdate(patch) {
  return validateTaskPayload(patch || {}, false);
}
