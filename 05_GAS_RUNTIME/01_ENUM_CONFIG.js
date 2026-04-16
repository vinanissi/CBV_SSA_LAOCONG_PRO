/**
 * CBV Enum Config - Single source of truth for required enum groups and values.
 * Used by enum sync engine, seed, audit, repair.
 */

/**
 * Required enum groups and values. ENUM_DICTIONARY must contain these.
 * value: storage value; displayText: UI; sortOrder: display order; isActive: default
 */
var ENUM_CONFIG = {
  ROLE: [
    { value: 'ADMIN', displayText: 'Quản trị', sortOrder: 1, isActive: true },
    { value: 'OPERATOR', displayText: 'Vận hành', sortOrder: 2, isActive: true },
    { value: 'ACCOUNTANT', displayText: 'Kế toán', sortOrder: 3, isActive: true },
    { value: 'VIEWER', displayText: 'Xem chỉ', sortOrder: 4, isActive: true }
  ],
  HO_SO_TYPE: [
    { value: 'HTX', displayText: 'Hợp tác xã', sortOrder: 1, isActive: true },
    { value: 'XA_VIEN', displayText: 'Xã viên', sortOrder: 2, isActive: true },
    { value: 'XE', displayText: 'Xe', sortOrder: 3, isActive: true },
    { value: 'TAI_XE', displayText: 'Tài xế', sortOrder: 4, isActive: true }
  ],
  HO_SO_STATUS: [
    { value: 'NEW', displayText: 'Mới', sortOrder: 1, isActive: true },
    { value: 'ACTIVE', displayText: 'Đang dùng', sortOrder: 2, isActive: true },
    { value: 'INACTIVE', displayText: 'Tạm ngưng', sortOrder: 3, isActive: true },
    { value: 'ARCHIVED', displayText: 'Lưu trữ', sortOrder: 4, isActive: true }
  ],
  FILE_GROUP: [
    { value: 'CCCD', displayText: 'CCCD', sortOrder: 1, isActive: true },
    { value: 'GPLX', displayText: 'GPLX', sortOrder: 2, isActive: true },
    { value: 'DANG_KY_XE', displayText: 'Đăng ký xe', sortOrder: 3, isActive: true },
    { value: 'HOP_DONG', displayText: 'Hợp đồng', sortOrder: 4, isActive: true },
    { value: 'KHAC', displayText: 'Khác', sortOrder: 5, isActive: true }
  ],
  TASK_TYPE: [
    { value: 'GENERAL', displayText: 'Chung', sortOrder: 1, isActive: true },
    { value: 'HO_SO', displayText: 'Hồ sơ', sortOrder: 2, isActive: true },
    { value: 'FINANCE', displayText: 'Tài chính', sortOrder: 3, isActive: true },
    { value: 'OPERATION', displayText: 'Vận hành', sortOrder: 4, isActive: true }
  ],
  TASK_STATUS: [
    { value: 'NEW', displayText: 'Mới tạo', sortOrder: 1, isActive: true },
    { value: 'ASSIGNED', displayText: 'Đã giao', sortOrder: 2, isActive: true },
    { value: 'IN_PROGRESS', displayText: 'Đang thực hiện', sortOrder: 3, isActive: true },
    { value: 'WAITING', displayText: 'Đang chờ', sortOrder: 4, isActive: true },
    { value: 'DONE', displayText: 'Hoàn thành', sortOrder: 5, isActive: true },
    { value: 'CANCELLED', displayText: 'Đã huỷ', sortOrder: 6, isActive: true },
    { value: 'ARCHIVED', displayText: 'Lưu trữ', sortOrder: 7, isActive: true }
  ],
  TASK_PRIORITY: [
    { value: 'LOW', displayText: 'Thấp', sortOrder: 1, isActive: true },
    { value: 'MEDIUM', displayText: 'Trung bình', sortOrder: 2, isActive: true },
    { value: 'HIGH', displayText: 'Cao', sortOrder: 3, isActive: true },
    { value: 'URGENT', displayText: 'Khẩn cấp', sortOrder: 4, isActive: true }
  ],
  ATTACHMENT_TYPE: [
    { value: 'FILE', displayText: 'File', sortOrder: 1, isActive: true },
    { value: 'IMAGE', displayText: 'Hình ảnh', sortOrder: 2, isActive: true },
    { value: 'LINK', displayText: 'Liên kết', sortOrder: 3, isActive: true }
  ],
  TASK_ATTACHMENT_TYPE: [
    { value: 'DRAFT', displayText: 'Bản nháp', sortOrder: 1, isActive: true },
    { value: 'RESULT', displayText: 'Kết quả', sortOrder: 2, isActive: true },
    { value: 'SOP', displayText: 'Quy trình', sortOrder: 3, isActive: true },
    { value: 'REFERENCE', displayText: 'Tham khảo', sortOrder: 4, isActive: true }
  ],
  FINANCE_ATTACHMENT_TYPE: [
    { value: 'INVOICE', displayText: 'Hóa đơn', sortOrder: 1, isActive: true },
    { value: 'RECEIPT', displayText: 'Biên lai', sortOrder: 2, isActive: true },
    { value: 'CONTRACT', displayText: 'Hợp đồng', sortOrder: 3, isActive: true },
    { value: 'PROOF', displayText: 'Chứng minh', sortOrder: 4, isActive: true },
    { value: 'OTHER', displayText: 'Khác', sortOrder: 5, isActive: true }
  ],
  UPDATE_TYPE: [
    { value: 'NOTE', displayText: 'Ghi chú', sortOrder: 1, isActive: true },
    { value: 'QUESTION', displayText: 'Câu hỏi', sortOrder: 2, isActive: true },
    { value: 'ANSWER', displayText: 'Trả lời', sortOrder: 3, isActive: true },
    { value: 'STATUS_CHANGE', displayText: 'Đổi trạng thái', sortOrder: 4, isActive: true }
  ],
  FINANCE_TYPE: [
    { value: 'INCOME', displayText: 'Thu', sortOrder: 1, isActive: true },
    { value: 'EXPENSE', displayText: 'Chi', sortOrder: 2, isActive: true }
  ],
  FINANCE_STATUS: [
    { value: 'NEW', displayText: 'Mới', sortOrder: 1, isActive: true },
    { value: 'CONFIRMED', displayText: 'Đã xác nhận', sortOrder: 2, isActive: true },
    { value: 'CANCELLED', displayText: 'Đã huỷ', sortOrder: 3, isActive: true },
    { value: 'ARCHIVED', displayText: 'Lưu trữ', sortOrder: 4, isActive: true }
  ],
  FIN_CATEGORY: [
    { value: 'VAN_HANH', displayText: 'Vận hành', sortOrder: 1, isActive: true },
    { value: 'NHIEN_LIEU', displayText: 'Nhiên liệu', sortOrder: 2, isActive: true },
    { value: 'SUA_CHUA', displayText: 'Sửa chữa', sortOrder: 3, isActive: true },
    { value: 'LUONG', displayText: 'Lương', sortOrder: 4, isActive: true },
    { value: 'THU_KHAC', displayText: 'Thu khác', sortOrder: 5, isActive: true },
    { value: 'CHI_KHAC', displayText: 'Chi khác', sortOrder: 6, isActive: true }
  ],
  PAYMENT_METHOD: [
    { value: 'CASH', displayText: 'Tiền mặt', sortOrder: 1, isActive: true },
    { value: 'BANK', displayText: 'Chuyển khoản', sortOrder: 2, isActive: true },
    { value: 'OTHER', displayText: 'Khác', sortOrder: 3, isActive: true }
  ],
  MASTER_CODE_STATUS: [
    { value: 'ACTIVE', displayText: 'Đang dùng', sortOrder: 1, isActive: true },
    { value: 'INACTIVE', displayText: 'Tạm ngưng', sortOrder: 2, isActive: true },
    { value: 'ARCHIVED', displayText: 'Lưu trữ', sortOrder: 3, isActive: true }
  ],
  USER_DIRECTORY_STATUS: [
    { value: 'ACTIVE', displayText: 'Đang dùng', sortOrder: 1, isActive: true },
    { value: 'INACTIVE', displayText: 'Tạm ngưng', sortOrder: 2, isActive: true },
    { value: 'ARCHIVED', displayText: 'Lưu trữ', sortOrder: 3, isActive: true }
  ],
  RELATED_ENTITY_TYPE: [
    { value: 'NONE', displayText: 'Không', sortOrder: 1, isActive: true },
    { value: 'HO_SO', displayText: 'Hồ sơ', sortOrder: 2, isActive: true },
    { value: 'FINANCE_TRANSACTION', displayText: 'Giao dịch tài chính', sortOrder: 3, isActive: true },
    { value: 'TASK', displayText: 'Task', sortOrder: 4, isActive: true },
    { value: 'UNIT', displayText: 'Đơn vị', sortOrder: 5, isActive: true }
  ]
};

/**
 * Business table/column -> enum group mapping. Used for usage audit.
 */
var ENUM_USAGE_CONFIG = [
  { table: 'TASK_MAIN', column: 'STATUS', enumGroup: 'TASK_STATUS', required: true },
  { table: 'TASK_MAIN', column: 'PRIORITY', enumGroup: 'TASK_PRIORITY', required: true },
  { table: 'TASK_MAIN', column: 'RELATED_ENTITY_TYPE', enumGroup: 'RELATED_ENTITY_TYPE', required: false },
  { table: 'MASTER_CODE', column: 'STATUS', enumGroup: 'MASTER_CODE_STATUS', required: true },
  { table: 'USER_DIRECTORY', column: 'ROLE', enumGroup: 'ROLE', required: true },
  { table: 'USER_DIRECTORY', column: 'STATUS', enumGroup: 'USER_DIRECTORY_STATUS', required: true },
  { table: 'HO_SO_MASTER', column: 'HO_SO_TYPE', enumGroup: 'HO_SO_TYPE', required: true },
  { table: 'HO_SO_MASTER', column: 'STATUS', enumGroup: 'HO_SO_STATUS', required: true },
  { table: 'HO_SO_FILE', column: 'FILE_GROUP', enumGroup: 'FILE_GROUP', required: true },
  { table: 'FINANCE_TRANSACTION', column: 'STATUS', enumGroup: 'FINANCE_STATUS', required: true },
  { table: 'FINANCE_TRANSACTION', column: 'TRANS_TYPE', enumGroup: 'FINANCE_TYPE', required: true },
  { table: 'FINANCE_TRANSACTION', column: 'CATEGORY', enumGroup: 'FIN_CATEGORY', required: true },
  { table: 'FINANCE_TRANSACTION', column: 'PAYMENT_METHOD', enumGroup: 'PAYMENT_METHOD', required: false },
  { table: 'FINANCE_TRANSACTION', column: 'RELATED_ENTITY_TYPE', enumGroup: 'RELATED_ENTITY_TYPE', required: false },
  { table: 'TASK_ATTACHMENT', column: 'ATTACHMENT_TYPE', enumGroup: 'TASK_ATTACHMENT_TYPE', required: false },
  { table: 'FINANCE_ATTACHMENT', column: 'ATTACHMENT_TYPE', enumGroup: 'FINANCE_ATTACHMENT_TYPE', required: false }
];

/** Default options for enum sync operations */
var DEFAULT_ENUM_SYNC_OPTIONS = {
  activeOnly: true,
  writeHealthLog: false,
  createMissingEnums: false,
  fillMissingDisplayText: false,
  dryRun: true,
  verbose: true
};
