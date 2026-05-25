import type {
  ApiEnvelope,
  CoordinationData,
  CreateTaskBody,
  FinanceItem,
  HoSoItem,
  ObservationData,
  PluginsResponse,
  SearchResponse,
  TaskDetail,
  TaskFilter,
  TaskItem,
  TaskWriteCapability,
  TaskWriteEvent,
  TaskWriteResult,
  TodaySummary,
  UpdateTaskBody,
  UserContext,
} from './contracts';
import { createEnvelope, delay } from '@/shared/utils';

const DEMO = 'Dữ liệu demo — phiên bản local';

const MOCK_USER: UserContext = {
  userId: 'USR-DEMO-001',
  displayName: 'Nguyễn Văn Demo',
  role: 'STAFF',
  permissions: [
    'TASK_VIEW',
    'FINANCE_VIEW',
    'HO_SO_VIEW',
    'COORDINATION_VIEW',
    'OBSERVATION_VIEW',
    'PLUGIN_VIEW',
    'SEARCH',
  ],
  demoLabel: DEMO,
};

const TASKS: TaskItem[] = [
  {
    taskId: 'TASK-DEMO-001',
    title: 'Rà soát hồ sơ xã viên — Nguyễn A',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    owner: 'Nguyễn Văn Demo',
    ownerId: 'USR-DEMO-001',
    dueDate: '2026-05-25',
    href: '/tasks/TASK-DEMO-001',
    permissionAllowed: true,
    isMine: true,
    module: 'TASK',
    source: DEMO,
  },
  {
    taskId: 'TASK-DEMO-002',
    title: 'Thu phí vận hành tháng 5 — xe 51A-12345',
    status: 'WAITING',
    priority: 'MEDIUM',
    owner: 'Trần Thị B',
    ownerId: 'USR-DEMO-002',
    dueDate: '2026-05-20',
    href: '/tasks/TASK-DEMO-002',
    permissionAllowed: true,
    isOverdue: true,
    module: 'TASK',
    source: DEMO,
  },
  {
    taskId: 'TASK-DEMO-003',
    title: 'Duyệt bổ sung GPLX — Lê Văn C',
    status: 'WAITING',
    priority: 'URGENT',
    owner: 'Nguyễn Văn Demo',
    ownerId: 'USR-DEMO-001',
    dueDate: '2026-05-26',
    href: '/tasks/TASK-DEMO-003',
    permissionAllowed: true,
    isMine: true,
    module: 'TASK',
    source: DEMO,
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
    source: DEMO,
  },
];

const FINANCE: FinanceItem[] = [
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
    source: DEMO,
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
    source: DEMO,
    warnings: ['Chờ xác nhận'],
  },
  {
    financeId: 'FIN-DEMO-003',
    title: 'Thu khác — hợp đồng bổ sung',
    type: 'INCOME',
    status: 'CONFIRMED',
    amount: 800000,
    dueDate: '2026-05-18',
    fileCount: 2,
    href: '/finance',
    permissionAllowed: true,
    source: DEMO,
    warnings: [],
  },
];

const HOSO: HoSoItem[] = [
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
    source: DEMO,
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
    source: DEMO,
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
    source: DEMO,
    warnings: ['Thiếu CCCD'],
  },
];

const ALERTS = [
  {
    alertId: 'ALERT-DEMO-001',
    type: 'OVERDUE',
    severity: 'warn' as const,
    title: '2 việc quá hạn',
    message: 'Cần xử lý trong ngày — xem danh sách quá hạn',
    module: 'TASK',
    resourceId: 'TASK-DEMO-002',
    href: '/tasks?filter=overdue',
    nextStep: 'Mở danh sách quá hạn',
    createdAt: '2026-05-25T08:00:00+07:00',
    autoResolve: false as const,
    autoEscalate: false as const,
  },
  {
    alertId: 'ALERT-DEMO-002',
    type: 'MISSING_DOC',
    severity: 'error' as const,
    title: 'Hồ sơ thiếu giấy tờ',
    message: '2 hồ sơ thiếu CCCD/GPLX/Đăng kiểm',
    module: 'HO_SO',
    href: '/hoso',
    nextStep: 'Rà soát hồ sơ thiếu',
    createdAt: '2026-05-25T07:30:00+07:00',
    autoResolve: false as const,
    autoEscalate: false as const,
  },
  {
    alertId: 'ALERT-DEMO-003',
    type: 'FINANCE_PENDING',
    severity: 'info' as const,
    title: 'Tài chính chờ xử lý',
    message: '2 khoản cần thu/chi chờ xác nhận',
    module: 'FINANCE',
    href: '/finance',
    nextStep: 'Xem danh sách tài chính',
    createdAt: '2026-05-25T07:00:00+07:00',
    autoResolve: false as const,
    autoEscalate: false as const,
  },
];

export async function getCurrentUser(): Promise<ApiEnvelope<UserContext>> {
  await delay();
  return createEnvelope(MOCK_USER, { warnings: [DEMO] });
}

export async function getTodaySummary(): Promise<ApiEnvelope<TodaySummary>> {
  await delay();
  return createEnvelope(
    {
      priorityTasks: TASKS.filter((t) => t.priority === 'HIGH' || t.priority === 'URGENT'),
      myTasks: TASKS.filter((t) => t.isMine),
      overdueTasks: TASKS.filter((t) => t.isOverdue),
      missingHoSo: HOSO.filter((h) => h.missingDocuments.length > 0),
      pendingFinance: FINANCE.filter((f) => f.status === 'NEW'),
      alerts: ALERTS,
      demoLabel: DEMO,
    },
    { warnings: [DEMO] },
  );
}

export async function getTasks(filter?: TaskFilter): Promise<ApiEnvelope<TaskItem[]>> {
  await delay();
  let items = [...TASKS];
  switch (filter) {
    case 'mine':
      items = items.filter((t) => t.isMine);
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
  return createEnvelope(items, { warnings: [DEMO] });
}

export async function getTaskDetail(taskId: string): Promise<ApiEnvelope<TaskDetail | null>> {
  await delay();
  const task = TASKS.find((t) => t.taskId === taskId);
  if (!task) {
    return createEnvelope(null, { errors: ['Không tìm thấy việc'], ok: false, status: 'FAIL' });
  }
  return createEnvelope(
    {
      ...task,
      description: 'Nội dung chi tiết việc — dữ liệu demo local. Không ghi dữ liệu thật.',
      timeline: [
        {
          time: '2026-05-24T14:00:00+07:00',
          actor: 'Nguyễn Văn Demo',
          action: 'Cập nhật',
          message: 'Bắt đầu xử lý',
          source: DEMO,
          resourceId: taskId,
        },
        {
          time: '2026-05-23T09:00:00+07:00',
          actor: 'Hệ thống',
          action: 'Tạo việc',
          message: 'Việc được tạo từ hàng đợi',
          source: DEMO,
          resourceId: taskId,
        },
      ],
      files: [
        {
          fileId: 'FILE-DEMO-001',
          fileName: 'checklist-demo.pdf',
          fileGroup: 'REFERENCE',
          createdAt: '2026-05-23T09:00:00+07:00',
          createdBy: 'Nguyễn Văn Demo',
        },
      ],
      relatedFinance: FINANCE.filter((f) => f.relatedTaskId === taskId),
      relatedHoSo: HOSO.filter((h) => h.hoSoId === 'HS-DEMO-001'),
    },
    { warnings: [DEMO] },
  );
}

export async function getFinanceItems(): Promise<ApiEnvelope<FinanceItem[]>> {
  await delay();
  return createEnvelope(FINANCE, {
    warnings: [DEMO, 'Chỉ xem — xác nhận thanh toán cần thao tác thủ công'],
  });
}

export async function getHoSoItems(): Promise<ApiEnvelope<HoSoItem[]>> {
  await delay();
  return createEnvelope(HOSO, {
    warnings: [DEMO, 'Chỉ xem — duyệt hồ sơ cần thao tác thủ công'],
  });
}

export async function getCoordination(): Promise<ApiEnvelope<CoordinationData>> {
  await delay();
  const queue: CoordinationData['queue'] = TASKS.map((t) => ({
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

  return createEnvelope(
    {
      queue,
      overdue: queue.filter((q) => q.isOverdue),
      workload: [
        { userId: 'USR-DEMO-001', displayName: 'Nguyễn Văn Demo', openCount: 2, overdueCount: 0, unassignedCount: 0 },
        { userId: 'USR-DEMO-002', displayName: 'Trần Thị B', openCount: 1, overdueCount: 1, unassignedCount: 0 },
        { userId: 'USR-DEMO-003', displayName: 'Lê Văn C', openCount: 0, overdueCount: 0, unassignedCount: 0 },
      ],
      unassigned: queue.filter((q) => q.isUnassigned),
      managerCards: [
        { label: 'Hàng đợi', count: queue.length, href: '/coordination' },
        { label: 'Quá hạn', count: queue.filter((q) => q.isOverdue).length, href: '/tasks?filter=overdue' },
        { label: 'Chưa giao', count: queue.filter((q) => q.isUnassigned).length, href: '/coordination' },
      ],
      demoLabel: DEMO,
    },
    { warnings: [DEMO, 'Giao việc — chỉ xem trong phiên bản này'] },
  );
}

export async function getObservation(): Promise<ApiEnvelope<ObservationData>> {
  await delay();
  return createEnvelope(
    {
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
          nextStep: 'Xác nhận thủ công ngoài bàn làm việc',
          checkedAt: new Date().toISOString(),
        },
        {
          module: 'HO_SO',
          ok: true,
          status: 'ACTIVE_READONLY',
          severity: 'info',
          message: 'Hồ sơ — chỉ xem',
          nextStep: 'Duyệt thủ công ngoài bàn làm việc',
          checkedAt: new Date().toISOString(),
        },
      ],
      alerts: ALERTS,
      syncStatus: [
        { label: 'Đồng bộ dữ liệu', status: 'ok', message: 'Demo local — chưa kết nối API' },
        { label: 'Cảnh báo tự động', status: 'locked', message: 'Không tự xử lý — cần kiểm tra thủ công' },
      ],
      projectionStatus: [
        { label: 'Chiếu việc', status: 'ok', message: 'Sẵn sàng' },
        { label: 'Chiếu tài chính', status: 'readonly', message: 'Chỉ xem' },
        { label: 'Chiếu hồ sơ', status: 'readonly', message: 'Chỉ xem' },
      ],
      demoLabel: DEMO,
    },
    { warnings: [DEMO] },
  );
}

export async function getPlugins(): Promise<ApiEnvelope<PluginsResponse>> {
  await delay();
  return createEnvelope(
    {
      plugins: [
        {
          pluginId: 'cbv-plugin-task',
          module: 'TASK',
          label: 'Việc vận hành',
          version: 'RF-LOCK-V1',
          status: 'ACTIVE',
          enabled: true,
          demoLabel: DEMO,
          capabilities: [
            { capabilityId: 'task-list', label: 'Danh sách việc', type: 'VIEW', enabled: true, status: 'ACTIVE', permission: 'TASK_VIEW', route: '/tasks' },
            { capabilityId: 'task-assign', label: 'Giao việc', type: 'ASSIGNMENT', enabled: false, status: 'EXECUTION_LOCKED', permission: 'TASK_ASSIGN', route: '/coordination' },
          ],
        },
        {
          pluginId: 'cbv-plugin-finance',
          module: 'FINANCE',
          label: 'Tài chính',
          version: 'RF-LOCK-V1',
          status: 'ACTIVE_READONLY',
          enabled: true,
          demoLabel: DEMO,
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
          demoLabel: DEMO,
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
      demoLabel: DEMO,
    },
    { warnings: [DEMO] },
  );
}

export async function search(query: string): Promise<ApiEnvelope<SearchResponse>> {
  await delay(200);
  const q = query.trim().toLowerCase();
  if (!q) {
    return createEnvelope({ query, results: [], demoLabel: DEMO }, { warnings: [DEMO] });
  }

  const results = [
    ...TASKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.taskId.toLowerCase().includes(q),
    ).map((t) => ({
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
    ...FINANCE.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.financeId.toLowerCase().includes(q),
    ).map((f) => ({
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
      matchedField: h.phone.includes(q) ? 'phone' : h.vehiclePlate.toLowerCase().includes(q) ? 'vehiclePlate' : 'personName',
      permissionAllowed: true,
    })),
  ];

  return createEnvelope({ query, results, demoLabel: DEMO }, { warnings: [DEMO] });
}

const mockWritten = new Map<string, TaskDetail & { ownerId: string; taskModule?: string }>();
const mockEvents: TaskWriteEvent[] = [];

export async function getTaskWriteCapability(): Promise<ApiEnvelope<TaskWriteCapability>> {
  await delay(100);
  const canCreate = MOCK_USER.role === 'ADMIN' || MOCK_USER.role === 'MANAGER';
  return createEnvelope({
    writeMode: 'ENABLED',
    adapterStatus: 'LOCAL',
    canCreate,
    canUpdate: true,
    message: 'Ghi local — phiên demo',
  }, { warnings: [DEMO] });
}

export async function createTask(body: CreateTaskBody): Promise<ApiEnvelope<TaskWriteResult>> {
  await delay(200);
  if (MOCK_USER.role !== 'ADMIN' && MOCK_USER.role !== 'MANAGER') {
    return createEnvelope(null as unknown as TaskWriteResult, {
      errors: ['Không có quyền tạo việc'],
      ok: false,
      status: 'FAIL',
    });
  }
  if (!body.title?.trim()) {
    return createEnvelope(null as unknown as TaskWriteResult, { errors: ['Tên việc không được để trống'], ok: false, status: 'FAIL' });
  }
  const taskId = `TASK-MOCK-${Date.now().toString(36)}`;
  const traceId = `demo-${Date.now()}`;
  const task: TaskDetail & { taskModule?: string } = {
    taskId,
    title: body.title.trim(),
    description: body.description ?? '',
    status: 'NEW',
    priority: body.priority ?? 'MEDIUM',
    owner: MOCK_USER.displayName,
    ownerId: MOCK_USER.userId,
    dueDate: body.dueDate ?? new Date().toISOString().slice(0, 10),
    href: `/tasks/${taskId}`,
    permissionAllowed: true,
    isMine: true,
    module: 'TASK',
    source: DEMO,
    timeline: [],
    files: [],
    taskModule: body.module ?? 'TASK',
  };
  const event: TaskWriteEvent = {
    eventId: `EVT-${Date.now()}`,
    taskId,
    actor: MOCK_USER.displayName,
    action: 'CREATE',
    before: null,
    after: { title: task.title },
    note: body.note ?? 'Tạo việc mới',
    createdAt: new Date().toISOString(),
    traceId,
    source: 'RF_11_TASK_WRITE_RUNTIME',
  };
  mockEvents.push(event);
  task.timeline = [{ time: event.createdAt, actor: event.actor, action: event.action, message: event.note, source: DEMO, resourceId: taskId }];
  mockWritten.set(taskId, task);
  return createEnvelope({ task, event }, { warnings: [DEMO] });
}

export async function updateTask(taskId: string, body: UpdateTaskBody): Promise<ApiEnvelope<TaskWriteResult>> {
  await delay(200);
  const existing = mockWritten.get(taskId) ?? TASKS.find((t) => t.taskId === taskId);
  if (!existing) {
    return createEnvelope(null as unknown as TaskWriteResult, { errors: ['Không tìm thấy việc'], ok: false, status: 'FAIL' });
  }
  const base = mockWritten.get(taskId) ?? {
    ...existing,
    description: '',
    timeline: [],
    files: [],
  } as TaskDetail;
  if (MOCK_USER.role === 'STAFF' && base.ownerId !== MOCK_USER.userId) {
    return createEnvelope(null as unknown as TaskWriteResult, { errors: ['Không có quyền cập nhật việc này'], ok: false, status: 'FAIL' });
  }
  const updated: TaskDetail = {
    ...base,
    status: body.status ?? base.status,
    priority: body.priority ?? base.priority,
    dueDate: body.dueDate ?? base.dueDate,
  };
  const event: TaskWriteEvent = {
    eventId: `EVT-${Date.now()}`,
    taskId,
    actor: MOCK_USER.displayName,
    action: 'UPDATE',
    before: { status: base.status },
    after: { status: updated.status },
    note: body.note ?? 'Cập nhật việc',
    createdAt: new Date().toISOString(),
    traceId: `demo-${Date.now()}`,
    source: 'RF_11_TASK_WRITE_RUNTIME',
  };
  mockEvents.push(event);
  updated.timeline = [...(base.timeline ?? []), { time: event.createdAt, actor: event.actor, action: event.action, message: event.note, source: DEMO, resourceId: taskId }];
  mockWritten.set(taskId, updated);
  return createEnvelope({ task: updated, event }, { warnings: [DEMO] });
}

export const mockApi = {
  getCurrentUser,
  getTodaySummary,
  getTasks,
  getTaskDetail,
  getFinanceItems,
  getHoSoItems,
  getCoordination,
  getObservation,
  getPlugins,
  search,
  getTaskWriteCapability,
  createTask,
  updateTask,
};
