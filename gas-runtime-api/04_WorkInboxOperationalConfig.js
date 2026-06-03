/**
 * PHASE_UI_CBV_WORK_INBOX_V3_OPERATIONAL_RUNTIME — operational entity config + seeds.
 */

var CBV_WI_OP_CONFIG = {
  SHEETS: {
    ACTION_AUDIT_LOG: 'ACTION_AUDIT_LOG',
    TASK_TIMELINE: 'TASK_TIMELINE',
    TASK_APPOINTMENTS: 'TASK_APPOINTMENTS',
    TASK_NOTES: 'TASK_NOTES',
    TASK_DOCUMENTS: 'TASK_DOCUMENTS',
    OP_STORE: 'WORK_INBOX_OP_STORE',
  },
  TIMELINE_LIMIT: 50,
  PREVIEW_LIMIT: 5,
  TAIL_SCAN_MAX: 250,
  /** P1: skip duplicate CBV_AUDIT_LOG when ACTION_AUDIT_LOG written */
  MIRROR_AUDIT_TO_LEGACY_LOG: false,
  /** P1: skip duplicate TASK_UPDATE_LOG when TASK_TIMELINE written */
  MIRROR_TIMELINE_TO_LEGACY_LOG: false,
  /** P1: use setValues(nextRow) instead of appendRow */
  USE_SET_VALUES_APPEND: true,
  SOP_REGISTRY: [
    { sop_id: 'SOP-TASK-NEW', code: 'TASK_NEW', title: 'Tiếp nhận việc mới', category: 'TASK', url: 'https://docs.google.com/document/d/placeholder-task-new', active: true },
    { sop_id: 'SOP-TASK-HANDOFF', code: 'TASK_HANDOFF', title: 'Chuyển giao việc', category: 'TASK', url: 'https://docs.google.com/document/d/placeholder-handoff', active: true },
    { sop_id: 'SOP-MODULE-INBOX', code: 'WORK_INBOX', title: 'Vận hành Work Inbox V3', category: 'MODULE', url: 'https://docs.google.com/document/d/placeholder-inbox', active: true },
  ],
  FORM_TEMPLATE_REGISTRY: [
    { template_id: 'TPL-GENERAL-01', title: 'Biên bản xử lý chung', category: 'GENERAL', url: 'https://docs.google.com/document/d/placeholder-general', active: true },
    { template_id: 'TPL-HOSO-01', title: 'Mẫu hồ sơ khách hàng', category: 'HO_SO', url: 'https://docs.google.com/document/d/placeholder-hoso', active: true },
    { template_id: 'TPL-FINANCE-01', title: 'Mẫu đối soát tài chính', category: 'FINANCE', url: 'https://docs.google.com/document/d/placeholder-finance', active: true },
  ],
};

var CBV_WI_OP_ACTIONS = [
  'wiOpAppendActionAudit',
  'wiOpAppendTimeline',
  'wiOpGetTaskOperational',
  'wiOpCreateAppointment',
  'wiOpSaveNote',
  'wiOpAddDocument',
  'wiOpLookupSop',
  'wiOpListFormTemplates',
  'wiOpRecordAction',
  'wiOpCreateUserTask',
  'wiOpListChecklist',
  'wiOpCreateChecklistItem',
  'wiOpUpdateChecklistItem',
  'wiOpToggleChecklistItem',
  'wiOpSoftDeleteChecklistItem',
  'wiOpClBridge',
  'wiOpClBridgeValidate',
  'checklist.schema.bootstrap',
  'checklist.schema.validate',
  'wiOpListAttachments',
  'wiOpCreateAttachment',
  'wiOpUpdateAttachment',
  'wiOpSoftDeleteAttachment',
];
