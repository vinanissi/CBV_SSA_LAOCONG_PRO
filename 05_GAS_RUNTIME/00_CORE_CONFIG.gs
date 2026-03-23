const CBV_CONFIG = {
  SPREADSHEET_ID: SpreadsheetApp.getActive().getId(),
  TIMEZONE: Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh',
  /** Admin email whitelist. Required for admin panel. Add emails, e.g. ['admin@example.com']. */
  ADMIN_EMAILS: [],  // Must be non-empty for adminCreateEnumRow, adminUpdateEnumRow, etc.
  SHEETS: {
    USER_DIRECTORY: 'USER_DIRECTORY',
    ADMIN_AUDIT_LOG: 'ADMIN_AUDIT_LOG',
    ENUM_DICTIONARY: 'ENUM_DICTIONARY',
    MASTER_CODE: 'MASTER_CODE',
    HO_SO_MASTER: 'HO_SO_MASTER',
    HO_SO_FILE: 'HO_SO_FILE',
    HO_SO_RELATION: 'HO_SO_RELATION',
    DON_VI: 'DON_VI',
    TASK_MAIN: 'TASK_MAIN',
    TASK_CHECKLIST: 'TASK_CHECKLIST',
    TASK_UPDATE_LOG: 'TASK_UPDATE_LOG',
    TASK_ATTACHMENT: 'TASK_ATTACHMENT',
    FINANCE_ATTACHMENT: 'FINANCE_ATTACHMENT',
    FINANCE_TRANSACTION: 'FINANCE_TRANSACTION',
    FINANCE_LOG: 'FINANCE_LOG'
  }
};
