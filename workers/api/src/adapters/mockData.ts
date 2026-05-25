import type {
  AlertItem,
  CoordinationData,
  FinanceItem,
  HoSoItem,
  ObservationData,
  PluginDescriptor,
  QuickAction,
  TaskDetail,
  TaskFilter,
  TaskItem,
  TodaySummary,
  UserContext,
} from '../contracts';

export const PROJECTION_LABEL = 'Worker projection — demo local';

export const TASKS: TaskItem[] = [
  {
    taskId: 'TASK-DEMO-001',
    title: 'Rà soát hồ sơ xã viên — Nguyễn A',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    owner: 'Nhân viên Local',
    ownerId: 'USR-LOCAL-STAFF',
    dueDate: '2026-05-25',
    href: '/tasks/TASK-DEMO-001',
    permissionAllowed: true,
    isMine: true,
    module: 'TASK',
    source: PROJECTION_LABEL,
  },
  {
    taskId: 'TASK-DEMO-002',
    title: 'Thu phí vận hành tháng 5 — xe 51A-12345',
    status: 'WAITING',
    priority: 'MEDIUM',
    owner: 'Tài chính Local',
    ownerId: 'USR-LOCAL-FIN',
    dueDate: '2026-05-20',
    href: '/tasks/TASK-DEMO-002',
    permissionAllowed: true,
    isOverdue: true,
    module: 'TASK',
    source: PROJECTION_LABEL,
  },
  {
    taskId: 'TASK-DEMO-003',
    title: 'Duyệt bổ sung GPLX — Lê Văn C',
    status: 'WAITING',
    priority: 'URGENT',
    owner: 'Quản lý Local',
    ownerId: 'USR-LOCAL-MGR',
    dueDate: '2026-05-26',
    href: '/tasks/TASK-DEMO-003',
    permissionAllowed: true,
    module: 'TASK',
    source: PROJECTION_LABEL,
  },
  {
    taskId: 'TASK-DEMO-004',
    title: 'Phối hợp giao việc — hàng đợi chưa phân công',
    status: 'NEW',
    priority: 'HIGH',
    owner: '',
    ownerId: '',
    dueDate: '2026-05-27',
    href: '/tasks/TASK-DEMO-004',
    permissionAllowed: true,
    module: 'TASK',
    source: PROJECTION_LABEL,
  },
];

export const FINANCE: FinanceItem[] = [
  {
    financeId: 'FIN-DEMO-001',
    title: 'Thu phí vận hành — Nguyễn A',
    type: 'INCOME',
    status: 'NEW',
    amount: 1500000,
    dueDate: '2026-05-25',
    relatedTaskId: 'TASK-DEMO-002',
    relatedHoSoId: 'HS-DEMO-001',
    fileCount: 0,
    missingDocuments: true,
    href: '/finance',
    permissionAllowed: true,
    source: PROJECTION_LABEL,
    warnings: ['Thiếu chứng từ'],
  },
  {
    financeId: 'FIN-DEMO-002',
    title: 'Chi sửa chữa xe — 51B-67890',
    type: 'EXPENSE',
    status: 'NEW',
    amount: 3200000,
    dueDate: '2026-05-24',
    fileCount: 1,
    href: '/finance',
    permissionAllowed: true,
    source: PROJECTION_LABEL,
    warnings: ['Chờ xác nhận'],
  },
];

export const HOSO: HoSoItem[] = [
  {
    hoSoId: 'HS-DEMO-001',
    personName: 'Nguyễn Văn A',
    phone: '0901234567',
    vehiclePlate: '51A-12345',
    status: 'IN_REVIEW',
    missingDocuments: ['GPLX', 'Đăng kiểm'],
    documentCompleteness: 60,
    href: '/hoso',
    permissionAllowed: true,
    source: PROJECTION_LABEL,
    warnings: ['Thiếu GPLX', 'Thiếu Đăng kiểm'],
  },
  {
    hoSoId: 'HS-DEMO-002',
    personName: 'Trần Thị B',
    phone: '0912345678',
    vehiclePlate: '51B-67890',
    status: 'ACTIVE',
    missingDocuments: [],
    documentCompleteness: 100,
    href: '/hoso',
    permissionAllowed: true,
    source: PROJECTION_LABEL,
    warnings: [],
  },
  {
    hoSoId: 'HS-DEMO-003',
    personName: 'Lê Văn C',
    phone: '0923456789',
    vehiclePlate: '51C-11111',
    status: 'NEW',
    missingDocuments: ['CCCD'],
    documentCompleteness: 40,
    href: '/hoso',
    permissionAllowed: true,
    source: PROJECTION_LABEL,
    warnings: ['Thiếu CCCD'],
  },
];

export const ALERTS: AlertItem[] = [
  {
    alertId: 'ALERT-DEMO-001',
    type: 'OVERDUE',
    severity: 'warn',
    title: '2 việc quá hạn',
    message: 'Cần xử lý trong ngày',
    module: 'TASK',
    href: '/tasks?filter=overdue',
    nextStep: 'Mở danh sách quá hạn',
    createdAt: '2026-05-25T08:00:00+07:00',
    autoResolve: false,
    autoEscalate: false,
  },
  {
    alertId: 'ALERT-DEMO-002',
    type: 'MISSING_DOC',
    severity: 'error',
    title: 'Hồ sơ thiếu giấy tờ',
    message: '2 hồ sơ thiếu CCCD/GPLX/Đăng kiểm',
    module: 'HO_SO',
    href: '/hoso',
    nextStep: 'Rà soát hồ sơ thiếu',
    createdAt: '2026-05-25T07:30:00+07:00',
    autoResolve: false,
    autoEscalate: false,
  },
];

export function getTodaySummary(user: UserContext): TodaySummary {
  const tasks = applyTaskPermissions(user, TASKS);
  return {
    priorityTasks: tasks.filter((t) => t.priority === 'HIGH' || t.priority === 'URGENT'),
    myTasks: tasks.filter((t) => t.ownerId === user.userId),
    overdueTasks: tasks.filter((t) => t.isOverdue),
    missingHoSo: HOSO.filter((h) => h.missingDocuments.length > 0),
    pendingFinance: FINANCE.filter((f) => f.status === 'NEW'),
    alerts: ALERTS,
    demoLabel: PROJECTION_LABEL,
  };
}

export function getTasks(user: UserContext, filter?: TaskFilter): TaskItem[] {
  let items = applyTaskPermissions(user, TASKS);
  switch (filter) {
    case 'mine':
      items = items.filter((t) => t.ownerId === user.userId);
      break;
    case 'pending':
      items = items.filter((t) => ['NEW', 'WAITING', 'ASSIGNED'].includes(t.status));
      break;
    case 'overdue':
      items = items.filter((t) => t.isOverdue);
      break;
    case 'approval':
      items = items.filter((t) => t.status === 'WAITING' && t.title.includes('Duyệt'));
      break;
  }
  return items;
}

export function getTaskDetail(user: UserContext, taskId: string): TaskDetail | null {
  const task = applyTaskPermissions(user, TASKS).find((t) => t.taskId === taskId);
  if (!task) return null;
  return {
    ...task,
    description: 'Chi tiết việc — projection Worker demo. Không ghi dữ liệu thật.',
    timeline: [
      {
        time: '2026-05-24T14:00:00+07:00',
        actor: user.displayName,
        action: 'Cập nhật',
        message: 'Bắt đầu xử lý',
        source: PROJECTION_LABEL,
        resourceId: taskId,
      },
    ],
    files: [
      {
        fileId: 'FILE-DEMO-001',
        fileName: 'checklist-demo.pdf',
        fileGroup: 'REFERENCE',
        createdAt: '2026-05-23T09:00:00+07:00',
        createdBy: user.displayName,
      },
    ],
    relatedFinance: FINANCE.filter((f) => f.relatedTaskId === taskId),
    relatedHoSo: HOSO.filter((h) => h.hoSoId === 'HS-DEMO-001'),
  };
}

export function getCoordinationData(): CoordinationData {
  const queue = TASKS.map((t) => ({
    queueId: t.taskId,
    title: t.title,
    status: t.status,
    assignee: t.owner || undefined,
    dueDate: t.dueDate,
    priority: t.priority,
    module: 'TASK',
    isOverdue: !!t.isOverdue,
    isUnassigned: !t.ownerId,
    href: t.href,
  }));

  return {
    queue,
    overdue: queue.filter((q) => q.isOverdue),
    workload: [
      { userId: 'USR-LOCAL-MGR', displayName: 'Quản lý Local', openCount: 2, overdueCount: 0, unassignedCount: 0 },
      { userId: 'USR-LOCAL-FIN', displayName: 'Tài chính Local', openCount: 1, overdueCount: 1, unassignedCount: 0 },
    ],
    unassigned: queue.filter((q) => q.isUnassigned),
    managerCards: [
      { label: 'Hàng đợi', count: queue.length, href: '/coordination' },
      { label: 'Quá hạn', count: queue.filter((q) => q.isOverdue).length, href: '/tasks?filter=overdue' },
      { label: 'Chưa giao', count: queue.filter((q) => q.isUnassigned).length, href: '/coordination' },
    ],
    demoLabel: PROJECTION_LABEL,
  };
}

export function getObservationData(): ObservationData {
  return {
    statusCards: [
      {
        module: 'TASK',
        ok: true,
        status: 'ACTIVE',
        severity: 'info',
        message: 'Mô-đun việc hoạt động bình thường',
        nextStep: 'Tiếp tục theo dõi',
        checkedAt: new Date().toISOString(),
      },
      {
        module: 'FINANCE',
        ok: true,
        status: 'ACTIVE_READONLY',
        severity: 'info',
        message: 'Tài chính — chỉ xem',
        nextStep: 'Xác nhận thủ công',
        checkedAt: new Date().toISOString(),
      },
      {
        module: 'HO_SO',
        ok: true,
        status: 'ACTIVE_READONLY',
        severity: 'info',
        message: 'Hồ sơ — chỉ xem',
        nextStep: 'Duyệt thủ công',
        checkedAt: new Date().toISOString(),
      },
    ],
    alerts: ALERTS,
    syncStatus: [
      { label: 'Worker bridge', status: 'ok', message: 'Projection local active' },
      { label: 'Cảnh báo tự động', status: 'locked', message: 'Không tự xử lý' },
    ],
    projectionStatus: [
      { label: 'Chiếu việc', status: 'ok', message: 'Sẵn sàng' },
      { label: 'Chiếu tài chính', status: 'readonly', message: 'Chỉ xem' },
      { label: 'Chiếu hồ sơ', status: 'readonly', message: 'Chỉ xem' },
    ],
    demoLabel: PROJECTION_LABEL,
  };
}

export function getPluginsData(): { plugins: PluginDescriptor[]; quickActions: QuickAction[] } {
  return {
    plugins: [
      {
        pluginId: 'cbv-plugin-task',
        module: 'TASK',
        label: 'Việc vận hành',
        version: 'RF-LOCK-V1',
        status: 'ACTIVE',
        enabled: true,
        demoLabel: PROJECTION_LABEL,
        capabilities: [
          { capabilityId: 'task-list', label: 'Danh sách việc', type: 'VIEW', enabled: true, status: 'ACTIVE', permission: 'TASK_VIEW', route: '/tasks' },
          { capabilityId: 'task-assign', label: 'Giao việc', type: 'ASSIGNMENT', enabled: false, status: 'EXECUTION_LOCKED', permission: 'TASK_ASSIGN' },
        ],
      },
      {
        pluginId: 'cbv-plugin-finance',
        module: 'FINANCE',
        label: 'Tài chính',
        version: 'RF-LOCK-V1',
        status: 'ACTIVE_READONLY',
        enabled: true,
        demoLabel: PROJECTION_LABEL,
        capabilities: [
          { capabilityId: 'finance-view', label: 'Xem khoản thu/chi', type: 'VIEW', enabled: true, status: 'ACTIVE_READONLY', permission: 'FINANCE_VIEW', route: '/finance' },
          { capabilityId: 'finance-confirm', label: 'Xác nhận thanh toán', type: 'FINANCE_ACTION', enabled: false, status: 'EXECUTION_LOCKED', permission: 'FINANCE_CONFIRM_PAYMENT' },
        ],
      },
      {
        pluginId: 'cbv-plugin-ho-so',
        module: 'HO_SO',
        label: 'Hồ sơ xã viên',
        version: 'RF-LOCK-V1',
        status: 'ACTIVE_READONLY',
        enabled: true,
        demoLabel: PROJECTION_LABEL,
        capabilities: [
          { capabilityId: 'hoso-view', label: 'Xem hồ sơ', type: 'VIEW', enabled: true, status: 'ACTIVE_READONLY', permission: 'HO_SO_VIEW', route: '/hoso' },
          { capabilityId: 'hoso-approval', label: 'Duyệt hồ sơ', type: 'APPROVAL', enabled: false, status: 'EXECUTION_LOCKED', permission: 'HO_SO_APPROVAL' },
        ],
      },
    ],
    quickActions: [
      { actionId: 'task-assign-locked', label: 'Giao việc', module: 'TASK', executionMode: 'EXECUTION_LOCKED', permission: 'TASK_ASSIGN', disabled: true, disabledReason: 'Chỉ xem trong phiên bản này' },
      { actionId: 'finance-confirm-locked', label: 'Xác nhận thanh toán', module: 'FINANCE', executionMode: 'EXECUTION_LOCKED', permission: 'FINANCE_CONFIRM_PAYMENT', disabled: true, disabledReason: 'Chỉ xem trong phiên bản này' },
      { actionId: 'hoso-approve-locked', label: 'Gửi duyệt', module: 'HO_SO', executionMode: 'EXECUTION_LOCKED', permission: 'HO_SO_APPROVAL', disabled: true, disabledReason: 'Chỉ xem trong phiên bản này' },
      { actionId: 'nav-tasks', label: 'Mở việc', module: 'TASK', executionMode: 'NAVIGATE', permission: 'TASK_VIEW', href: '/tasks', disabled: false },
    ],
  };
}

export function searchMock(query: string, user: UserContext) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results = [
    ...TASKS.filter((t) => t.title.toLowerCase().includes(q) || t.taskId.toLowerCase().includes(q)).map((t) => ({
      id: t.taskId,
      type: 'TASK',
      title: t.title,
      subtitle: t.owner || 'Chưa giao',
      status: t.status,
      module: 'TASK',
      href: `/tasks/${t.taskId}`,
      matchedField: 'title',
      permissionAllowed: true,
    })),
    ...FINANCE.filter((f) => f.title.toLowerCase().includes(q) || f.financeId.toLowerCase().includes(q)).map((f) => ({
      id: f.financeId,
      type: 'FINANCE',
      title: f.title,
      subtitle: `${f.type} — ${f.status}`,
      status: f.status,
      module: 'FINANCE',
      href: '/finance',
      matchedField: 'title',
      permissionAllowed: true,
    })),
    ...HOSO.filter(
      (h) =>
        h.personName.toLowerCase().includes(q) ||
        h.phone.includes(q) ||
        h.vehiclePlate.toLowerCase().includes(q) ||
        h.hoSoId.toLowerCase().includes(q),
    ).map((h) => ({
      id: h.hoSoId,
      type: 'HO_SO',
      title: h.personName,
      subtitle: `${h.vehiclePlate} — ${h.phone}`,
      status: h.status,
      module: 'HO_SO',
      href: '/hoso',
      matchedField: h.phone.includes(q) ? 'phone' : 'personName',
      permissionAllowed: true,
    })),
  ];

  return results.filter((r) => {
    if (r.module === 'FINANCE') return user.permissions.includes('FINANCE_VIEW') || user.permissions.includes('ADMIN_ALL');
    if (r.module === 'HO_SO') return user.permissions.includes('HO_SO_VIEW') || user.permissions.includes('ADMIN_ALL');
    return user.permissions.includes('TASK_VIEW') || user.permissions.includes('ADMIN_ALL');
  });
}

function applyTaskPermissions(user: UserContext, tasks: TaskItem[]): TaskItem[] {
  const canView = user.permissions.includes('TASK_VIEW') || user.permissions.includes('ADMIN_ALL');
  return tasks.map((t) => ({
    ...t,
    permissionAllowed: canView,
    isMine: t.ownerId === user.userId,
  }));
}

export function getFinanceAlerts() {
  return FINANCE.filter((f) => f.warnings.length > 0 || f.missingDocuments);
}

export function getHoSoAlerts() {
  return HOSO.filter((h) => h.missingDocuments.length > 0);
}
