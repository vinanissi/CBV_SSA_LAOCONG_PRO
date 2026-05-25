import type { UserRole } from '@/api/contracts';

export const DEMO_LABEL = 'Dữ liệu demo — phiên bản local';

export const NAV_ITEMS = [
  { to: '/', label: 'Hôm nay', icon: '☀' },
  { to: '/tasks', label: 'Việc của tôi', icon: '✓' },
  { to: '/tasks?filter=overdue', label: 'Quá hạn', icon: '!' },
  { to: '/hoso', label: 'Hồ sơ', icon: '📁' },
  { to: '/finance', label: 'Tài chính', icon: '₫' },
  { to: '/coordination', label: 'Phối hợp', icon: '↔' },
  { to: '/observation', label: 'Thông báo', icon: '◉' },
  { to: '/plugins', label: 'Mô-đun', icon: '▣' },
] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Quản trị',
  MANAGER: 'Quản lý',
  STAFF: 'Nhân viên',
  FINANCE: 'Tài chính',
  HO_SO: 'Hồ sơ',
  VIEW_ONLY: 'Chỉ xem',
};

export const TASK_FILTERS = [
  { key: 'mine' as const, label: 'Việc của tôi' },
  { key: 'pending' as const, label: 'Chờ xử lý' },
  { key: 'overdue' as const, label: 'Quá hạn' },
  { key: 'approval' as const, label: 'Chờ duyệt' },
];

export const QUICK_BAR_ACTIONS = [
  { id: 'add-task', label: '+ Việc', href: '/tasks', mode: 'NAVIGATE' as const },
  { id: 'add-hoso', label: '+ Hồ sơ', href: '/hoso', mode: 'NAVIGATE' as const },
  { id: 'upload', label: 'Tải lên', href: '', mode: 'EXECUTION_LOCKED' as const },
  { id: 'search', label: 'Tìm kiếm', href: '/search', mode: 'NAVIGATE' as const },
  { id: 'sla', label: 'SLA', href: '/observation', mode: 'NAVIGATE' as const },
];

export const PERMISSIONS = {
  TASK_VIEW: 'TASK_VIEW',
  TASK_ASSIGN: 'TASK_ASSIGN',
  FINANCE_VIEW: 'FINANCE_VIEW',
  FINANCE_CONFIRM: 'FINANCE_CONFIRM_PAYMENT',
  HO_SO_VIEW: 'HO_SO_VIEW',
  HO_SO_APPROVAL: 'HO_SO_APPROVAL',
  COORDINATION_VIEW: 'COORDINATION_VIEW',
  OBSERVATION_VIEW: 'OBSERVATION_VIEW',
  PLUGIN_VIEW: 'PLUGIN_VIEW',
  SEARCH: 'SEARCH',
} as const;

export const STATUS_LABELS: Record<string, string> = {
  NEW: 'Mới',
  ASSIGNED: 'Đã giao',
  IN_PROGRESS: 'Đang làm',
  WAITING: 'Chờ xử lý',
  DONE: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  CONFIRMED: 'Đã xác nhận',
  ACTIVE: 'Đang hoạt động',
  IN_REVIEW: 'Đang rà soát',
  EXPIRED: 'Hết hạn',
};

export const EXECUTION_USER_LABELS: Record<string, string> = {
  EXECUTION_LOCKED: 'Chỉ xem trong phiên bản này',
  MANUAL_CONFIRM_REQUIRED: 'Cần xác nhận',
  NOT_CONFIGURED: 'Chưa cấu hình',
  READ_ONLY: 'Chỉ xem',
  NAVIGATE: '',
};
