/**
 * CBV Schema Manifest - Source of truth for sheet headers.
 * Aligned with 06_DATABASE/schema_manifest.json and _generated_schema/*.csv
 */
/**
 * CBV PRO final schema. No hybrid/legacy columns.
 */
const CBV_SCHEMA_MANIFEST = {
  USER_DIRECTORY: ['ID', 'USER_CODE', 'FULL_NAME', 'DISPLAY_NAME', 'EMAIL', 'PHONE', 'ROLE', 'POSITION', 'STATUS', 'IS_SYSTEM', 'ALLOW_LOGIN', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
  ADMIN_AUDIT_LOG: ['ID', 'AUDIT_TYPE', 'ENTITY_TYPE', 'ENTITY_ID', 'ACTION', 'BEFORE_JSON', 'AFTER_JSON', 'NOTE', 'ACTOR_ID', 'CREATED_AT'],
  MASTER_CODE: ['ID', 'MASTER_GROUP', 'CODE', 'NAME', 'DISPLAY_TEXT', 'STATUS', 'SORT_ORDER', 'IS_SYSTEM', 'ALLOW_EDIT', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
  
  // ===== DÁN VÀO CBV_SCHEMA_MANIFEST =====
 
  HO_SO_MASTER: [
    // ── Cột gốc (đúng thứ tự Sheet) ────────────────────────────────
    'ID',           // col 1
    'HO_SO_TYPE',   // col 2
    'CODE',         // col 3
    'NAME',         // col 4
    'STATUS',       // col 5  ← Sheet đặt STATUS ở đây
    'HTX_ID',       // col 6
    'OWNER_ID',     // col 7
    'PHONE',        // col 8
    'EMAIL',        // col 9
    'ID_NO',        // col 10
    'ADDRESS',      // col 11
    'START_DATE',   // col 12
    'END_DATE',     // col 13
    'NOTE',         // col 14
    'TAGS',         // col 15
    'CREATED_AT',   // col 16
    'CREATED_BY',   // col 17
    'UPDATED_AT',   // col 18
    'UPDATED_BY',   // col 19
    'IS_DELETED',   // col 20
    // ── Cột mở rộng PRO (Sheet đặt sau IS_DELETED) ──────────────────
    'HO_SO_CODE',           // col 21
    'TITLE',                // col 22
    'DISPLAY_NAME',         // col 23
    'DON_VI_ID',            // col 24
    'MANAGER_USER_ID',      // col 25
    'RELATED_ENTITY_TYPE',  // col 26
    'RELATED_ENTITY_ID',    // col 27
    'FULL_NAME',            // col 28
    'ID_TYPE',              // col 39
    'DOB',                  // col 30
    'PRIORITY',             // col 31
    'SOURCE_CHANNEL',       // col 32
    'SUMMARY',              // col 33
  ],
 
  HO_SO_FILE: [
    // ── Đúng thứ tự Sheet ───────────────────────────────────────────
    'ID',           // col 1
    'HO_SO_ID',     // col 2
    'FILE_GROUP',   // col 3
    'FILE_NAME',    // col 4
    'FILE_URL',     // col 5
    'DRIVE_FILE_ID',// col 6
    'STATUS',       // col 7
    'NOTE',         // col 8
    'CREATED_AT',   // col 9  ← Sheet: CREATED_AT trước DOC_TYPE
    'CREATED_BY',   // col 10
    'DOC_TYPE',     // col 11
    'ISSUED_DATE',  // col 12
    'EXPIRY_DATE',  // col 13
    'DOC_NO',       // col 14  ← Sheet: DOC_NO ở cuối
  ],
 
  HO_SO_RELATION: [
    // ── Đúng thứ tự Sheet ───────────────────────────────────────────
    'ID',               // col 1
    'FROM_HO_SO_ID',    // col 2
    'TO_HO_SO_ID',      // col 3
    'RELATION_TYPE',    // col 4
    'START_DATE',       // col 5  ← Sheet: START_DATE trước STATUS
    'END_DATE',         // col 6
    'STATUS',           // col 7
    'NOTE',             // col 8
    'CREATED_AT',       // col 9
    'CREATED_BY',       // col 10
    'HO_SO_ID',         // col 11
    'RELATED_TABLE',    // col 12
    'RELATED_RECORD_ID',// col 13
    'UPDATED_AT',       // col 14  ← cols 14-16 chưa có trên Sheet
    'UPDATED_BY',       // col 15  ← ensureSchemas sẽ thêm
    'IS_DELETED',       // col 16  ← ensureSchemas sẽ thêm
  ],
 
// ===== HẾT PHẦN DÁN =====
  
  HO_SO_UPDATE_LOG: ['ID', 'HO_SO_ID', 'ACTION_TYPE', 'OLD_STATUS', 'NEW_STATUS', 'FIELD_CHANGED', 'OLD_VALUE', 'NEW_VALUE', 'NOTE', 'ACTOR_ID', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
  HO_SO_LOG: ['ID', 'HO_SO_ID', 'ACTION', 'OLD_VALUE', 'NEW_VALUE', 'NOTE', 'ACTOR_ID', 'CREATED_AT'],
  DOC_REQUIREMENT: ['ID', 'HO_SO_TYPE', 'DOC_TYPE', 'IS_REQUIRED', 'VALID_MONTHS', 'DESCRIPTION', 'SORT_ORDER', 'IS_ACTIVE', 'NOTE', 'CREATED_AT', 'CREATED_BY'],
  DON_VI: ['ID', 'DON_VI_TYPE', 'CODE', 'NAME', 'DISPLAY_TEXT', 'SHORT_NAME', 'PARENT_ID', 'STATUS', 'SORT_ORDER', 'MANAGER_USER_ID', 'EMAIL', 'PHONE', 'ADDRESS', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
  TASK_MAIN: [
    'ID', 'TASK_CODE', 'TITLE', 'DESCRIPTION', 'TASK_TYPE_ID',
    'STATUS', 'PRIORITY', 'DON_VI_ID', 'OWNER_ID', 'REPORTER_ID',
    'START_DATE', 'DUE_DATE', 'DONE_AT', 'PROGRESS_PERCENT', 'RESULT_SUMMARY',
    'RELATED_ENTITY_TYPE', 'RELATED_ENTITY_ID',
    'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY',
    'IS_DELETED', 'PENDING_ACTION'
  ],
  TASK_CHECKLIST: ['ID', 'TASK_ID', 'ITEM_NO', 'TITLE', 'IS_REQUIRED', 'IS_DONE', 'DONE_AT', 'DONE_BY', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
  TASK_UPDATE_LOG: ['ID', 'TASK_ID', 'UPDATE_TYPE', 'ACTION', 'ACTOR_ID', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
  TASK_ATTACHMENT: [
    'ID', 'TASK_ID', 'SOURCE_MODE', 'ATTACHMENT_TYPE', 'TITLE',
    'FILE_NAME', 'UPLOAD_FILE', 'FILE_URL', 'DRIVE_FILE_ID',
    'FILE_EXT', 'LINK_DOMAIN', 'SORT_ORDER', 'STATUS', 'NOTE',
    'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'
  ],
  FINANCE_ATTACHMENT: ['ID', 'FINANCE_ID', 'ATTACHMENT_TYPE', 'TITLE', 'FILE_NAME', 'FILE_URL', 'DRIVE_FILE_ID', 'NOTE', 'CREATED_AT', 'CREATED_BY'],
  FINANCE_TRANSACTION: ['ID', 'TRANS_CODE', 'TRANS_DATE', 'TRANS_TYPE', 'STATUS', 'CATEGORY', 'AMOUNT', 'DON_VI_ID', 'COUNTERPARTY', 'PAYMENT_METHOD', 'REFERENCE_NO', 'RELATED_ENTITY_TYPE', 'RELATED_ENTITY_ID', 'DESCRIPTION', 'EVIDENCE_URL', 'CONFIRMED_AT', 'CONFIRMED_BY', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
  FINANCE_LOG: ['ID', 'FIN_ID', 'ACTION', 'BEFORE_JSON', 'AFTER_JSON', 'NOTE', 'ACTOR_ID', 'CREATED_AT']
};

/** SYSTEM_HEALTH_LOG sheet name - audit run summaries */
var SYSTEM_HEALTH_LOG_SHEET = 'SYSTEM_HEALTH_LOG';

/** SYSTEM_HEALTH_LOG column headers */
var SYSTEM_HEALTH_LOG_HEADERS = [
  'RUN_ID', 'RUN_AT', 'SYSTEM_HEALTH', 'BOOTSTRAP_SAFE', 'APPSHEET_READY',
  'CRITICAL_COUNT', 'HIGH_COUNT', 'MEDIUM_COUNT', 'LOW_COUNT', 'INFO_COUNT',
  'SCHEMA_UPDATED', 'APPENDED_COLUMNS_COUNT', 'MUST_FIX_NOW', 'WARNINGS', 'SUMMARY_JSON'
];

/** @returns {string[]} Required sheet names in canonical order */
function getRequiredSheetNames() {
  return Object.keys(CBV_SCHEMA_MANIFEST);
}

/** @returns {string[]} Headers for a sheet by name */
function getSchemaHeaders(sheetName) {
  const headers = CBV_SCHEMA_MANIFEST[sheetName];
  if (!headers) throw new Error('Unknown sheet: ' + sheetName);
  return headers;
}
