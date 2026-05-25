/** CBV Workboard API contracts — aligned with runtime lock v1 (RF_02–RF_07) */

export type ApiStatus = 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';

export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'STAFF'
  | 'FINANCE'
  | 'HO_SO'
  | 'VIEW_ONLY';

export type ExecutionMode =
  | 'READ_ONLY'
  | 'NAVIGATE'
  | 'EXECUTION_LOCKED'
  | 'MANUAL_CONFIRM_REQUIRED'
  | 'NOT_CONFIGURED';

export interface ApiEnvelope<T> {
  ok: boolean;
  status: ApiStatus;
  data: T;
  warnings: string[];
  errors: string[];
  traceId: string;
}

export interface UserContext {
  userId: string;
  displayName: string;
  role: UserRole;
  permissions: string[];
  demoLabel?: string;
}

export interface TaskItem {
  taskId: string;
  title: string;
  status: string;
  priority: string;
  owner: string;
  ownerId: string;
  dueDate: string;
  href: string;
  permissionAllowed: boolean;
  isOverdue?: boolean;
  isMine?: boolean;
  module: 'TASK';
  source: string;
}

export interface FinanceItem {
  financeId: string;
  title: string;
  type: 'INCOME' | 'EXPENSE';
  status: string;
  amount: number;
  dueDate: string;
  relatedTaskId?: string;
  relatedHoSoId?: string;
  fileCount: number;
  missingDocuments?: boolean;
  href: string;
  permissionAllowed: boolean;
  source: string;
  warnings: string[];
}

export interface HoSoItem {
  hoSoId: string;
  personName: string;
  phone: string;
  vehiclePlate: string;
  status: string;
  missingDocuments: string[];
  documentCompleteness: number;
  href: string;
  permissionAllowed: boolean;
  source: string;
  warnings: string[];
}

export interface QueueItem {
  queueId: string;
  title: string;
  status: string;
  assignee?: string;
  dueDate: string;
  priority: string;
  module: string;
  isOverdue: boolean;
  isUnassigned: boolean;
  href: string;
}

export interface WorkloadItem {
  userId: string;
  displayName: string;
  openCount: number;
  overdueCount: number;
  unassignedCount: number;
}

export interface AlertItem {
  alertId: string;
  type: string;
  severity: 'info' | 'warn' | 'error';
  title: string;
  message: string;
  module: string;
  resourceId?: string;
  href?: string;
  nextStep?: string;
  createdAt: string;
  autoResolve: false;
  autoEscalate: false;
}

export interface TimelineItem {
  time: string;
  actor: string;
  action: string;
  message: string;
  source: string;
  resourceId: string;
}

export interface FileItem {
  fileId: string;
  fileName: string;
  fileGroup: string;
  fileUrl?: string;
  createdAt: string;
  createdBy: string;
}

export interface PluginCapability {
  capabilityId: string;
  label: string;
  type: string;
  enabled: boolean;
  status: string;
  permission: string;
  route?: string;
}

export interface PluginDescriptor {
  pluginId: string;
  module: 'TASK' | 'FINANCE' | 'HO_SO';
  label: string;
  version: string;
  status: 'ACTIVE' | 'ACTIVE_READONLY' | 'PARTIAL' | 'DISABLED' | 'NOT_CONFIGURED';
  enabled: boolean;
  capabilities: PluginCapability[];
  demoLabel?: string;
}

export interface QuickAction {
  actionId: string;
  label: string;
  module: string;
  executionMode: ExecutionMode;
  permission: string;
  href?: string;
  disabled: boolean;
  disabledReason?: string;
}

export interface TodaySummary {
  priorityTasks: TaskItem[];
  myTasks: TaskItem[];
  overdueTasks: TaskItem[];
  missingHoSo: HoSoItem[];
  pendingFinance: FinanceItem[];
  alerts: AlertItem[];
  demoLabel: string;
}

export interface TaskDetail extends TaskItem {
  description: string;
  timeline: TimelineItem[];
  files: FileItem[];
  relatedFinance?: FinanceItem[];
  relatedHoSo?: HoSoItem[];
}

export interface CoordinationData {
  queue: QueueItem[];
  overdue: QueueItem[];
  workload: WorkloadItem[];
  unassigned: QueueItem[];
  managerCards: { label: string; count: number; href: string }[];
  demoLabel: string;
}

export interface ObservationData {
  statusCards: {
    module: string;
    ok: boolean;
    status: string;
    severity: string;
    message: string;
    nextStep: string;
    checkedAt: string;
  }[];
  alerts: AlertItem[];
  syncStatus: { label: string; status: string; message: string }[];
  projectionStatus: { label: string; status: string; message: string }[];
  demoLabel: string;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  status: string;
  module: string;
  href: string;
  matchedField: string;
  permissionAllowed: boolean;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  demoLabel: string;
}

export interface PluginsResponse {
  plugins: PluginDescriptor[];
  quickActions: QuickAction[];
  demoLabel: string;
}

export type TaskFilter = 'mine' | 'pending' | 'overdue' | 'approval';

export type TaskWriteMode = 'ENABLED' | 'LOCKED';

export interface TaskWriteEvent {
  eventId: string;
  taskId: string;
  actor: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  note: string;
  createdAt: string;
  traceId: string;
  source: string;
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  assignee?: string;
  priority?: string;
  dueDate?: string;
  module?: string;
  relatedHoSoId?: string;
  relatedFinanceId?: string;
  files?: unknown[];
  note?: string;
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: string;
  assignee?: string;
  priority?: string;
  dueDate?: string;
  note?: string;
}

export interface TaskWriteCapability {
  writeMode: TaskWriteMode;
  adapterStatus: string;
  canCreate: boolean;
  canUpdate: boolean;
  message: string;
}

export interface TaskWriteResult {
  task: TaskDetail;
  event: TaskWriteEvent;
}

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const TASK_STATUSES = ['NEW', 'IN_PROGRESS', 'WAITING', 'WAITING_APPROVAL', 'BLOCKED', 'DONE'] as const;
