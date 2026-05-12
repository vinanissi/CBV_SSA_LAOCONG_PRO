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
    optionalColumns: ['DISPLAY_NAME', 'EMAIL', 'PHONE', 'POSITION', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED', 'USER_ID', 'EMPLOYEE_CODE', 'DON_VI_ID', 'TEAM_ID', 'SUPERVISOR_ID', 'ROLE_CODE', 'USER_STATUS', 'WORKLOAD_LIMIT', 'ACTIVE_QUEUE_COUNT', 'LAST_ACTIVE_AT', 'LAST_LOGIN_AT', 'IS_OPERATOR', 'IS_SUPERVISOR', 'IS_ADMIN', 'IS_RUNTIME_OWNER', 'IS_APPSHEET_ADMIN', 'APPSHEET_USER_ROLE', 'DEFAULT_DASHBOARD', 'DEFAULT_QUEUE', 'CAN_ASSIGN', 'CAN_ESCALATE', 'CAN_RESOLVE', 'CAN_APPROVE'],
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
    optionalColumns: ['NAME', 'DISPLAY_TEXT', 'SORT_ORDER', 'IS_SYSTEM', 'ALLOW_EDIT', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED', 'MASTER_ID', 'MASTER_LABEL', 'MODULE_CODE', 'DESCRIPTION', 'IS_ACTIVE', 'PARENT_CODE', 'RELATED_CODE', 'MASTER_CODE'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: {},
    enumColumns: { STATUS: 'MASTER_CODE_STATUS' }
  },
  DON_VI: {
    requiredColumns: ['ID', 'DON_VI_TYPE', 'CODE', 'NAME', 'STATUS', 'IS_DELETED'],
    optionalColumns: ['DISPLAY_TEXT', 'SHORT_NAME', 'PARENT_ID', 'SORT_ORDER', 'MANAGER_USER_ID', 'EMAIL', 'PHONE', 'ADDRESS', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'DON_VI_ID', 'DON_VI_CODE', 'DON_VI_NAME', 'PARENT_DON_VI_ID', 'TEAM_TYPE', 'LEVEL', 'QUEUE_OWNER', 'DEFAULT_SUPERVISOR_ID', 'DEFAULT_ASSIGN_ROLE', 'WORKLOAD_LIMIT', 'ESCALATION_TEAM', 'ESCALATION_EMAIL', 'OWNER_USER_ID', 'RUNTIME_OWNER_ID', 'DON_VI_STATUS', 'IS_ACTIVE'],
    key: 'ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    workflowColumns: ['STATUS'],
    refColumns: { PARENT_ID: 'DON_VI', MANAGER_USER_ID: 'USER_DIRECTORY' },
    enumColumns: { DON_VI_TYPE: 'DON_VI_TYPE', STATUS: 'MASTER_CODE_STATUS' }
  },
  ENUM_DICTIONARY: {
    requiredColumns: ['ID', 'ENUM_GROUP', 'ENUM_VALUE'],
    optionalColumns: ['DISPLAY_TEXT', 'SORT_ORDER', 'IS_ACTIVE', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED', 'ENUM_CODE', 'ENUM_LABEL', 'ENUM_DESCRIPTION', 'COLOR_CODE', 'ICON', 'IS_SYSTEM', 'PARENT_ENUM_CODE'],
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
  HOME_ALERT_SLA_POLICY: {
    requiredColumns: ['POLICY_ID', 'POLICY_CODE', 'ACTIVE', 'CREATED_AT'],
    optionalColumns: [
      'ALERT_CODE', 'ALERT_TYPE', 'MODULE_CODE', 'SEVERITY', 'SLA_POLICY', 'TARGET_MINUTES',
      'DUE_SOON_MINUTES', 'BREACH_LEVEL_1_MINUTES', 'BREACH_LEVEL_2_MINUTES', 'ESCALATE_AFTER_MINUTES',
      'ESCALATE_TO_TEAM', 'ESCALATE_TO_USER', 'PRIORITY_WEIGHT', 'SORT_ORDER', 'NOTE',
      'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'
    ],
    key: 'POLICY_ID',
    auditColumns: ['CREATED_AT', 'UPDATED_AT'],
    refColumns: {},
    enumColumns: {}
  },
  HOME_ALERT_SLA_METRICS: {
    requiredColumns: ['METRIC_ID', 'METRIC_DATE', 'METRIC_SCOPE', 'LAST_REFRESH_AT', 'TRACE_ID'],
    optionalColumns: [
      'MODULE_CODE', 'ALERT_CODE', 'POLICY_CODE',
      'ACTIVE_COUNT', 'ON_TRACK_COUNT', 'DUE_SOON_COUNT', 'OVERDUE_COUNT', 'BREACHED_COUNT',
      'ESCALATED_COUNT', 'STUCK_COUNT', 'BLOCKED_COUNT',
      'AVG_ELAPSED_MINUTES', 'MAX_ELAPSED_MINUTES', 'OPERATOR_OVERLOAD_COUNT', 'SUMMARY_JSON'
    ],
    key: 'METRIC_ID',
    auditColumns: ['LAST_REFRESH_AT'],
    refColumns: {},
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
  },
  HOME_ALERT_AUTOMATION_CONFIG: {
    requiredColumns: ['CONFIG_ID', 'AUTOMATION_CODE', 'FUNCTION_NAME', 'ENABLED', 'SAFE_MODE', 'CREATED_AT'],
    optionalColumns: [
      'AUTOMATION_TYPE', 'FREQUENCY_MINUTES', 'SCHEDULE_LABEL', 'LAST_RUN_AT', 'LAST_STATUS', 'LAST_TRACE_ID', 'LAST_ERROR',
      'RUN_COUNT', 'MAX_RUNTIME_SECONDS', 'ALLOW_WRITE', 'ALLOW_NOTIFICATION', 'ALLOW_TRIGGER_INSTALL', 'NOTE',
      'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY', 'IS_DELETED'
    ],
    key: 'CONFIG_ID',
    auditColumns: ['CREATED_AT', 'UPDATED_AT', 'LAST_RUN_AT'],
    refColumns: {},
    enumColumns: {}
  },
  HOME_ALERT_AUTOMATION_RUN_LOG: {
    requiredColumns: ['RUN_ID', 'AUTOMATION_CODE', 'FUNCTION_NAME', 'STARTED_AT', 'STATUS', 'CREATED_AT'],
    optionalColumns: [
      'FINISHED_AT', 'DURATION_MS', 'SEVERITY', 'TRACE_ID', 'INPUT_JSON', 'OUTPUT_JSON', 'ERROR_MESSAGE',
      'SAFE_MODE', 'ALLOW_WRITE', 'RUN_BY'
    ],
    key: 'RUN_ID',
    auditColumns: ['CREATED_AT'],
    refColumns: {},
    enumColumns: {}
  },
  HOME_ALERT_DAILY_SNAPSHOT: {
    requiredColumns: ['SNAPSHOT_ID', 'SNAPSHOT_DATE', 'CREATED_AT'],
    optionalColumns: [
      'ACTIVE_COUNT', 'DUE_SOON_COUNT', 'OVERDUE_COUNT', 'BREACHED_COUNT', 'ESCALATED_COUNT', 'STUCK_COUNT', 'BLOCKED_COUNT',
      'WAITING_COUNT', 'UNASSIGNED_COUNT', 'OPERATOR_OVERLOAD_COUNT', 'TOP_ALERT_CODES_JSON', 'TOP_OPERATORS_JSON',
      'SUMMARY_TEXT', 'RECOMMENDED_ACTIONS_TEXT', 'TRACE_ID', 'CREATED_BY'
    ],
    key: 'SNAPSHOT_ID',
    auditColumns: ['CREATED_AT'],
    refColumns: {},
    enumColumns: {}
  },
  TEAM_DIRECTORY: {
    requiredColumns: ['TEAM_ID', 'TEAM_CODE', 'TEAM_NAME', 'DON_VI_ID', 'STATUS', 'IS_DELETED'],
    optionalColumns: ['SUPERVISOR_ID', 'TEAM_TYPE', 'DEFAULT_QUEUE', 'WORKLOAD_LIMIT', 'ESCALATION_TEAM', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    key: 'TEAM_ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: { DON_VI_ID: 'DON_VI', SUPERVISOR_ID: 'USER_DIRECTORY' },
    enumColumns: {}
  },
  ROLE_PERMISSION_MATRIX: {
    requiredColumns: ['PERMISSION_ID', 'ROLE_CODE', 'ACTION_CODE', 'MODULE_CODE', 'STATUS', 'IS_DELETED'],
    optionalColumns: ['RESOURCE_TYPE', 'CAN_VIEW', 'CAN_CREATE', 'CAN_EDIT', 'CAN_EXECUTE', 'CAN_APPROVE', 'CAN_ASSIGN', 'CAN_ESCALATE', 'CAN_RESOLVE', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    key: 'PERMISSION_ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: {},
    enumColumns: {}
  },
  FEATURE_FLAG: {
    requiredColumns: ['FEATURE_ID', 'FEATURE_CODE', 'ENABLED', 'STATUS', 'IS_DELETED'],
    optionalColumns: ['MODULE_CODE', 'FEATURE_NAME', 'ROLLOUT_SCOPE', 'OWNER_USER_ID', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    key: 'FEATURE_ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: { OWNER_USER_ID: 'USER_DIRECTORY' },
    enumColumns: {}
  },
  SYSTEM_REGISTRY: {
    requiredColumns: ['REGISTRY_ID', 'REGISTRY_TYPE', 'REGISTRY_CODE', 'STATUS', 'IS_DELETED'],
    optionalColumns: ['MODULE_CODE', 'RESOURCE_TYPE', 'RESOURCE_NAME', 'RESOURCE_REF', 'OWNER_USER_ID', 'NOTE', 'CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    key: 'REGISTRY_ID',
    auditColumns: ['CREATED_AT', 'CREATED_BY', 'UPDATED_AT', 'UPDATED_BY'],
    refColumns: { OWNER_USER_ID: 'USER_DIRECTORY' },
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
  { child: 'FINANCE_LOG', childCol: 'FIN_ID', parent: 'FINANCE_TRANSACTION', parentKey: 'ID' },
  { child: 'TEAM_DIRECTORY', childCol: 'DON_VI_ID', parent: 'DON_VI', parentKey: 'ID' },
  { child: 'TEAM_DIRECTORY', childCol: 'SUPERVISOR_ID', parent: 'USER_DIRECTORY', parentKey: 'ID' },
  { child: 'FEATURE_FLAG', childCol: 'OWNER_USER_ID', parent: 'USER_DIRECTORY', parentKey: 'ID' },
  { child: 'SYSTEM_REGISTRY', childCol: 'OWNER_USER_ID', parent: 'USER_DIRECTORY', parentKey: 'ID' }
];

/** Tables that use IS_DELETED soft delete */
var CBV_SOFT_DELETE_TABLES = ['USER_DIRECTORY', 'DON_VI', 'MASTER_CODE', 'ENUM_DICTIONARY', 'TEAM_DIRECTORY', 'ROLE_PERMISSION_MATRIX', 'FEATURE_FLAG', 'SYSTEM_REGISTRY', 'HO_SO_MASTER', 'HO_SO_RELATION', 'HO_SO_UPDATE_LOG', 'TASK_MAIN', 'TASK_CHECKLIST', 'TASK_ATTACHMENT', 'TASK_UPDATE_LOG', 'FINANCE_TRANSACTION', 'HOME_ALERT_SLA_POLICY', 'HOME_ALERT_AUTOMATION_CONFIG'];
