const CBV_CONFIG = {
  SPREADSHEET_ID: SpreadsheetApp.getActive().getId(),
  /** Sentinel actor for triggers / batch when no interactive user; use cbvSystemActor() — do not hardcode elsewhere. */
  SYSTEM_ACTOR_ID: 'SYSTEM',
  TIMEZONE: Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh',
  /** Admin email whitelist. Required for admin panel. Add emails, e.g. ['admin@example.com']. */
  ADMIN_EMAILS: ["vnnissi@gmail.com","admin@htxdientu.com"],  // Must be non-empty for adminCreateEnumRow, adminUpdateEnumRow, etc.
  SHEETS: {
    USER_DIRECTORY: 'USER_DIRECTORY',
    ADMIN_AUDIT_LOG: 'ADMIN_AUDIT_LOG',
    ENUM_DICTIONARY: 'ENUM_DICTIONARY',
    MASTER_CODE: 'MASTER_CODE',
    HO_SO_MASTER: 'HO_SO_MASTER',
    HO_SO_FILE: 'HO_SO_FILE',
    HO_SO_RELATION: 'HO_SO_RELATION',
    HO_SO_UPDATE_LOG: 'HO_SO_UPDATE_LOG',
    HO_SO_DETAIL_PHUONG_TIEN: 'HO_SO_DETAIL_PHUONG_TIEN',
    DOC_REQUIREMENT: 'DOC_REQUIREMENT',
    SYSTEM_HEALTH_LOG: 'SYSTEM_HEALTH_LOG',
    DON_VI: 'DON_VI',
    TASK_MAIN: 'TASK_MAIN',
    TASK_CHECKLIST: 'TASK_CHECKLIST',
    TASK_UPDATE_LOG: 'TASK_UPDATE_LOG',
    TASK_ATTACHMENT: 'TASK_ATTACHMENT',
    FINANCE_ATTACHMENT: 'FINANCE_ATTACHMENT',
    FINANCE_TRANSACTION: 'FINANCE_TRANSACTION',
    /** Chu kỳ / đơn vị / người lọc cho export CSV AppSheet — xem FIN_EXPORT_FILTER trong 90_BOOTSTRAP_SCHEMA.js */
    FIN_EXPORT_FILTER: 'FIN_EXPORT_FILTER',
    FINANCE_LOG: 'FINANCE_LOG',
    /** Data sync: plan JSON (A2) + dashboard + continuation token (F2) — see 46_DATA_SYNC_PLAN_SHEET.js */
    DATA_SYNC_CONTROL: 'DATA_SYNC_CONTROL',
    /** Data sync: form table → build plan JSON — see 45_DATA_SYNC_BUILDER.js */
    DATA_SYNC_BUILDER: 'DATA_SYNC_BUILDER',
    /** Event-driven core: append-only queue + rule definitions — see 00_OVERVIEW/EVENT_DRIVEN_MIGRATION_PLAN.md */
    EVENT_QUEUE: 'EVENT_QUEUE',
    RULE_DEF: 'RULE_DEF'
  }
};
