/**
 * CBV Audit Schema Definition - Source of truth for selfAuditBootstrap.
 * Defines required tables, columns, refs, enums, workflow fields.
 * Aligned with 06_DATABASE/schema_manifest.json and CBV_SCHEMA_MANIFEST.
 */

/** Severity levels for audit findings */
var AUDIT_SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO'
};

/** Section result: PASS, WARN, FAIL */
var AUDIT_SECTION_RESULT = {
  PASS: 'PASS',
  WARN: 'WARN',
  FAIL: 'FAIL'
};

/**
 * Extended schema definition for audit.
 * requiredColumns: must exist
 * optionalColumns: may exist; unexpected columns reported
 * key: primary key column
 * auditColumns: CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY
 * workflowColumns: STATUS, DONE_AT, PROGRESS_PERCENT, etc.
 * refColumns: { COL: 'PARENT_TABLE' }
 * enumColumns: { COL: 'ENUM_GROUP' }
 */
var CBV_AUDIT_SCHEMA = {
  USER_DIRECTORY: {
    requiredColumns: ['ID', 'USER_CODE', 'FULL_NAME', 'ROLE', 'STATUS', 'IS_SYSTEM', 'ALLOW_LOGIN'],
    optionalColumns: ['DISPLAY_NAME', 'EMAIL', 'PHONE', 'POSITION', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: {},
    enumColumns: { ROLE: 'ROLE', STATUS: 'USER_DIRECTORY_STATUS' }
  },
  ADMIN_AUDIT_LOG: {
    requiredColumns: ['ID', 'AUDIT_TYPE', 'ENTITY_TYPE', 'ENTITY_ID', 'ACTION', 'NOTE', 'ACTOR_ID', 'CREATED_AT'],
    optionalColumns: ['BEFORE_JSON', 'AFTER_JSON'],
    key: 'ID',
    auditColumns: ['CREATED_AT'],
    refColumns: {},
    enumColumns: {}
  },
  MASTER_CODE: {
    requiredColumns: ['ID', 'MASTER_GROUP', 'CODE', 'STATUS'],
    optionalColumns: ['NAME', 'DISPLAY_TEXT', 'SORT_ORDER', 'IS_SYSTEM', 'ALLOW_EDIT', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: {},
    enumColumns: { STATUS: 'MASTER_CODE_STATUS' }
  },
  DON_VI: {
    requiredColumns: ['ID', 'DON_VI_TYPE', 'CODE', 'NAME', 'STATUS', 'IS_DELETED'],
    optionalColumns: ['DISPLAY_TEXT', 'SHORT_NAME', 'PARENT_ID', 'SORT_ORDER', 'MANAGER_USER_ID', 'EMAIL', 'PHONE', 'ADDRESS', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    workflowColumns: ['STATUS'],
    refColumns: { PARENT_ID: 'DON_VI', MANAGER_USER_ID: 'USER_DIRECTORY' },
    enumColumns: { DON_VI_TYPE: 'DON_VI_TYPE', STATUS: 'MASTER_CODE_STATUS' }
  },
  ENUM_DICTIONARY: {
    requiredColumns: ['ID', 'ENUM_GROUP', 'ENUM_VALUE'],
    optionalColumns: ['DISPLAY_TEXT', 'SORT_ORDER', 'IS_ACTIVE', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: {},
    enumColumns: {}
  },
  HO_SO_MASTER: {
    requiredColumns: ['ID', 'HO_SO_TYPE_ID', 'STATUS', 'IS_DELETED'],
    optionalColumns: ['CODE', 'NAME', 'HO_SO_CODE', 'TITLE', 'DISPLAY_NAME', 'DON_VI_ID', 'OWNER_ID', 'HTX_ID', 'MANAGER_USER_ID', 'RELATED_ENTITY_TYPE', 'RELATED_ENTITY_ID', 'FULL_NAME', 'PHONE', 'EMAIL', 'ID_TYPE', 'ID_NO', 'DOB', 'ADDRESS', 'START_DATE', 'END_DATE', 'PRIORITY', 'SOURCE_CHANNEL', 'SUMMARY', 'NOTE', 'TAGS_TEXT', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_STARRED', 'IS_PINNED', 'PENDING_ACTION'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: { HO_SO_TYPE_ID: 'MASTER_CODE', HTX_ID: 'HO_SO_MASTER', OWNER_ID: 'USER_DIRECTORY', DON_VI_ID: 'DON_VI', MANAGER_USER_ID: 'USER_DIRECTORY' },
    enumColumns: { STATUS: 'HO_SO_STATUS', PRIORITY: 'PRIORITY', ID_TYPE: 'ID_TYPE', RELATED_ENTITY_TYPE: 'RELATED_ENTITY_TYPE' }
  },
  HO_SO_FILE: {
    requiredColumns: ['ID', 'HO_SO_ID', 'FILE_GROUP'],
    optionalColumns: ['FILE_NAME', 'FILE_URL', 'DRIVE_FILE_ID', 'STATUS', 'NOTE', 'DOC_TYPE', 'DOC_NO', 'ISSUED_DATE', 'EXPIRY_DATE', 'CREATED_AT', 'CREATED_BY'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY'],
    refColumns: { HO_SO_ID: 'HO_SO_MASTER' },
    enumColumns: { FILE_GROUP: 'FILE_GROUP', STATUS: 'HO_SO_STATUS' }
  },
  HO_SO_RELATION: {
    requiredColumns: ['ID', 'FROM_HO_SO_ID', 'TO_HO_SO_ID', 'RELATION_TYPE', 'STATUS'],
    optionalColumns: ['HO_SO_ID', 'RELATED_TABLE', 'RELATED_RECORD_ID', 'NOTE', 'START_DATE', 'END_DATE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: { FROM_HO_SO_ID: 'HO_SO_MASTER', TO_HO_SO_ID: 'HO_SO_MASTER', HO_SO_ID: 'HO_SO_MASTER' },
    enumColumns: { RELATION_TYPE: 'HO_SO_RELATION_TYPE', STATUS: 'HO_SO_STATUS' }
  },
  HO_SO_UPDATE_LOG: {
    requiredColumns: ['ID', 'HO_SO_ID', 'ACTION_TYPE', 'CREATED_AT'],
    optionalColumns: ['OLD_STATUS', 'NEW_STATUS', 'FIELD_CHANGED', 'OLD_VALUE', 'NEW_VALUE', 'NOTE', 'ACTOR_ID', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: { HO_SO_ID: 'HO_SO_MASTER', ACTOR_ID: 'USER_DIRECTORY' },
    enumColumns: { ACTION_TYPE: 'HO_SO_ACTION_TYPE' }
  },
  TASK_MAIN: {
    requiredColumns: ['ID', 'TITLE', 'STATUS', 'PRIORITY', 'DON_VI_ID', 'OWNER_ID'],
    optionalColumns: ['TASK_CODE', 'DESCRIPTION', 'TASK_TYPE_ID', 'REPORTER_ID', 'RELATED_ENTITY_TYPE', 'RELATED_ENTITY_ID', 'START_DATE', 'DUE_DATE', 'DONE_AT', 'PROGRESS_PERCENT', 'RESULT_SUMMARY', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED', 'SHARED_WITH', 'IS_PRIVATE'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    workflowColumns: ['STATUS', 'DONE_AT', 'PROGRESS_PERCENT'],
    refColumns: { DON_VI_ID: 'DON_VI', TASK_TYPE_ID: 'MASTER_CODE', OWNER_ID: 'USER_DIRECTORY', REPORTER_ID: 'USER_DIRECTORY' },
    enumColumns: { STATUS: 'TASK_STATUS', PRIORITY: 'TASK_PRIORITY', RELATED_ENTITY_TYPE: 'RELATED_ENTITY_TYPE' }
  },
  TASK_CHECKLIST: {
    requiredColumns: ['ID', 'TASK_ID', 'TITLE'],
    optionalColumns: ['ITEM_NO', 'IS_REQUIRED', 'IS_DONE', 'DONE_AT', 'DONE_BY', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    workflowColumns: ['IS_DONE', 'DONE_AT', 'DONE_BY'],
    refColumns: { TASK_ID: 'TASK_MAIN', DONE_BY: 'USER_DIRECTORY' },
    enumColumns: {}
  },
  TASK_UPDATE_LOG: {
    requiredColumns: ['ID', 'TASK_ID', 'UPDATE_TYPE', 'ACTOR_ID', 'CREATED_AT'],
    optionalColumns: ['CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: { TASK_ID: 'TASK_MAIN', ACTOR_ID: 'USER_DIRECTORY' },
    enumColumns: { UPDATE_TYPE: 'UPDATE_TYPE' }
  },
  TASK_ATTACHMENT: {
    requiredColumns: ['ID', 'TASK_ID'],
    optionalColumns: ['ATTACHMENT_TYPE', 'TITLE', 'FILE_URL', 'DRIVE_FILE_ID', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: { TASK_ID: 'TASK_MAIN' },
    enumColumns: { ATTACHMENT_TYPE: 'TASK_ATTACHMENT_TYPE' }
  },
  FINANCE_TRANSACTION: {
    requiredColumns: ['ID', 'STATUS', 'AMOUNT'],
    optionalColumns: ['TRANS_CODE', 'TRANS_DATE', 'TRANS_TYPE', 'CATEGORY', 'DON_VI_ID', 'COUNTERPARTY', 'PAYMENT_METHOD', 'REFERENCE_NO', 'RELATED_ENTITY_TYPE', 'RELATED_ENTITY_ID', 'DESCRIPTION', 'EVIDENCE_URL', 'CONFIRMED_AT', 'CONFIRMED_BY', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    workflowColumns: ['STATUS', 'CONFIRMED_AT', 'CONFIRMED_BY'],
    refColumns: { DON_VI_ID: 'DON_VI', CONFIRMED_BY: 'USER_DIRECTORY' },
    enumColumns: { STATUS: 'FINANCE_STATUS', TRANS_TYPE: 'FINANCE_TYPE', CATEGORY: 'FIN_CATEGORY', PAYMENT_METHOD: 'PAYMENT_METHOD', RELATED_ENTITY_TYPE: 'RELATED_ENTITY_TYPE' }
  },
  FINANCE_ATTACHMENT: {
    requiredColumns: ['ID', 'FINANCE_ID'],
    optionalColumns: ['ATTACHMENT_TYPE', 'TITLE', 'FILE_NAME', 'FILE_URL', 'DRIVE_FILE_ID', 'NOTE', 'CREATED_AT', 'CREATED_BY'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY'],
    refColumns: { FINANCE_ID: 'FINANCE_TRANSACTION' },
    enumColumns: { ATTACHMENT_TYPE: 'FINANCE_ATTACHMENT_TYPE' }
  },
  FINANCE_LOG: {
    requiredColumns: ['ID', 'FIN_ID', 'ACTION', 'ACTOR_ID', 'CREATED_AT'],
    optionalColumns: ['BEFORE_JSON', 'AFTER_JSON', 'NOTE'],
    key: 'ID',
    auditColumns: ['CREATED_AT'],
    refColumns: { FIN_ID: 'FINANCE_TRANSACTION' },
    enumColumns: {}
  },
  HOME_ALERT: {
    requiredColumns: ['ALERT_ID', 'ALERT_CODE', 'SEVERITY', 'STATUS', 'IS_ACTIVE', 'IS_RESOLVED', 'CREATED_AT', 'UPDATED_AT', 'TRACE_ID', 'SOURCE_HASH'],
    optionalColumns: [
      'ALERT_TYPE', 'PRIORITY_SCORE', 'TITLE', 'MESSAGE', 'MODULE_CODE',
      'RELATED_ENTITY_TYPE', 'RELATED_ENTITY_ID', 'RELATED_RECORD_URL',
      'ACTION_LABEL', 'ACTION_TYPE', 'ACTION_PAYLOAD_JSON',
      'DUE_AT', 'ASSIGNED_TO', 'SORT_KEY', 'DISPLAY_GROUP', 'BADGE_TEXT', 'BADGE_COLOR',
      'RESOLVED_AT', 'RESOLVED_BY', 'NOTE',
      'ACKNOWLEDGED_AT', 'ACKNOWLEDGED_BY',
      'STATE_CHANGED_AT', 'STATE_CHANGED_BY',
      'ESCALATED_AT',
      'EXPIRES_AT',
      'AUTO_CLEARED_AT', 'AUTO_CLEARED_BY',
      'LAST_ACTION',
      'DISPLAY_TITLE', 'DISPLAY_SUBTITLE', 'DISPLAY_STATUS', 'DISPLAY_BADGE', 'DISPLAY_ICON', 'DISPLAY_COLOR',
      'DISPLAY_ACTION_TEXT', 'DISPLAY_PRIORITY_LABEL', 'DISPLAY_TIME_AGO', 'DISPLAY_ASSIGNEE', 'DISPLAY_SUMMARY', 'DISPLAY_FOOTER',
      'CARD_GROUP', 'CARD_SORT', 'CARD_LAYOUT', 'UX_VISIBLE', 'UX_GROUP_ORDER', 'UX_ACTION_HINT',
      'DESKTOP_TITLE', 'DESKTOP_SUBTITLE', 'DESKTOP_PRIMARY_LINE', 'DESKTOP_SECONDARY_LINE',
      'DESKTOP_META_LINE', 'DESKTOP_ACTION_LINE',
      'DESKTOP_DETAIL_TITLE', 'DESKTOP_DETAIL_SUMMARY', 'DESKTOP_DETAIL_CONTEXT', 'DESKTOP_DETAIL_NEXT_ACTION',
      'DESKTOP_DETAIL_DEBUG_VISIBLE',
      'DESKTOP_GROUP', 'DESKTOP_SORT', 'DESKTOP_IS_OPERATOR_VIEW',
      'ATTENTION_LEVEL', 'ATTENTION_LABEL', 'ATTENTION_ICON', 'ATTENTION_COLOR', 'ATTENTION_REASON',
      'ACTION_FOCUS', 'ACTION_HINT', 'ACTION_PRIORITY',
      'OWNER_LABEL', 'OWNER_QUEUE',
      'OPERATOR_PRIMARY_TEXT', 'OPERATOR_SECONDARY_TEXT', 'OPERATOR_META_TEXT', 'OPERATOR_NEXT_ACTION',
      'OPERATOR_HIDE_SORT_KEYS',
      'ASSIGNMENT_STATUS', 'ASSIGNMENT_QUEUE', 'ASSIGNED_TO_LABEL', 'ASSIGNED_TEAM', 'ASSIGNED_TEAM_LABEL',
      'ASSIGNED_BY', 'ASSIGNMENT_NOTE', 'CLAIMED_AT', 'CLAIMED_BY',
      'LAST_OPERATOR_ACTION', 'LAST_OPERATOR_ACTION_AT', 'LAST_OPERATOR_ACTION_BY',
      'ESCALATE_AFTER_AT', 'IS_STUCK', 'STUCK_REASON', 'IS_BLOCKED', 'BLOCKED_REASON',
      'QUEUE_GROUP', 'QUEUE_LABEL', 'QUEUE_SORT', 'WORKLOAD_KEY',
      'OPERATOR_DASHBOARD_GROUP', 'OPERATOR_DASHBOARD_SORT',
      'SLA_POLICY', 'SLA_TARGET_MINUTES', 'SLA_DUE_AT', 'SLA_STATUS', 'SLA_BREACH_LEVEL',
      'SLA_ELAPSED_MINUTES', 'SLA_LAST_CHECKED_AT', 'SLA_NEXT_REVIEW_AT',
      'ESCALATION_LEVEL', 'ESCALATION_STATUS', 'ESCALATION_REASON', 'ESCALATED_BY', 'ESCALATED_TO',
      'LAST_ESCALATION_CHECK_AT', 'ESCALATION_NEXT_ACTION', 'ESCALATION_TRACE_ID'
    ],
    key: 'ALERT_ID',
    auditColumns: ['CREATED_AT', 'UPDATED_AT'],
    refColumns: { ASSIGNED_TO: 'USER_DIRECTORY' },
    enumColumns: {}
  },
  HOME_ALERT_WORKLOAD: {
    requiredColumns: ['WORKLOAD_ID', 'OPERATOR_ID', 'LAST_REFRESH_AT', 'TRACE_ID'],
    optionalColumns: [
      'OPERATOR_LABEL', 'TEAM_ID', 'TEAM_LABEL',
      'ACTIVE_ALERT_COUNT', 'UNASSIGNED_COUNT', 'OVERDUE_COUNT', 'ESCALATED_COUNT', 'BLOCKED_COUNT', 'WAITING_COUNT'
    ],
    key: 'WORKLOAD_ID',
    auditColumns: ['LAST_REFRESH_AT'],
    refColumns: {},
    enumColumns: {}
  }
};

/** Ref relationships: child table -> [{ childCol, parentTable }] */
var CBV_AUDIT_REFS = [
  { child: 'HO_SO_MASTER', childCol: 'HO_SO_TYPE_ID', parent: 'MASTER_CODE', parentKey: 'ID' },
  { child: 'HO_SO_MASTER', childCol: 'DON_VI_ID', parent: 'DON_VI', parentKey: 'ID' },
  { child: 'HO_SO_MASTER', childCol: 'OWNER_ID', parent: 'USER_DIRECTORY', parentKey: 'ID' },
  { child: 'HO_SO_MASTER', childCol: 'MANAGER_USER_ID', parent: 'USER_DIRECTORY', parentKey: 'ID' },
  { child: 'HO_SO_MASTER', childCol: 'HTX_ID', parent: 'HO_SO_MASTER', parentKey: 'ID' },
  { child: 'TASK_MAIN', childCol: 'DON_VI_ID', parent: 'DON_VI', parentKey: 'ID' },
  { child: 'TASK_CHECKLIST', childCol: 'TASK_ID', parent: 'TASK_MAIN', parentKey: 'ID' },
  { child: 'TASK_ATTACHMENT', childCol: 'TASK_ID', parent: 'TASK_MAIN', parentKey: 'ID' },
  { child: 'TASK_UPDATE_LOG', childCol: 'TASK_ID', parent: 'TASK_MAIN', parentKey: 'ID' },
  { child: 'HO_SO_FILE', childCol: 'HO_SO_ID', parent: 'HO_SO_MASTER', parentKey: 'ID' },
  { child: 'HO_SO_RELATION', childCol: 'HO_SO_ID', parent: 'HO_SO_MASTER', parentKey: 'ID' },
  { child: 'HO_SO_RELATION', childCol: 'FROM_HO_SO_ID', parent: 'HO_SO_MASTER', parentKey: 'ID' },
  { child: 'HO_SO_RELATION', childCol: 'TO_HO_SO_ID', parent: 'HO_SO_MASTER', parentKey: 'ID' },
  { child: 'HO_SO_UPDATE_LOG', childCol: 'HO_SO_ID', parent: 'HO_SO_MASTER', parentKey: 'ID' },
  { child: 'HO_SO_UPDATE_LOG', childCol: 'ACTOR_ID', parent: 'USER_DIRECTORY', parentKey: 'ID' },
  { child: 'FINANCE_ATTACHMENT', childCol: 'FINANCE_ID', parent: 'FINANCE_TRANSACTION', parentKey: 'ID' },
  { child: 'FINANCE_LOG', childCol: 'FIN_ID', parent: 'FINANCE_TRANSACTION', parentKey: 'ID' }
];

/** Tables that use IS_DELETED soft delete */
var CBV_SOFT_DELETE_TABLES = ['USER_DIRECTORY', 'DON_VI', 'MASTER_CODE', 'HO_SO_MASTER', 'HO_SO_RELATION', 'HO_SO_UPDATE_LOG', 'TASK_MAIN', 'TASK_CHECKLIST', 'TASK_ATTACHMENT', 'TASK_UPDATE_LOG', 'FINANCE_TRANSACTION'];
