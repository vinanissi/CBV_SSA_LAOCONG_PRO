export type ApiStatus = 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';

export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'STAFF'
  | 'FINANCE'
  | 'HO_SO'
  | 'VIEW_ONLY';

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
  email: string;
  role: UserRole;
  permissions: string[];
  source: string;
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
  timeline: { time: string; actor: string; action: string; message: string; source: string; resourceId: string }[];
  files: { fileId: string; fileName: string; fileGroup: string; createdAt: string; createdBy: string }[];
  relatedFinance?: FinanceItem[];
  relatedHoSo?: HoSoItem[];
}

export interface CoordinationData {
  queue: {
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
  }[];
  overdue: CoordinationData['queue'];
  workload: { userId: string; displayName: string; openCount: number; overdueCount: number; unassignedCount: number }[];
  unassigned: CoordinationData['queue'];
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

export interface PluginDescriptor {
  pluginId: string;
  module: 'TASK' | 'FINANCE' | 'HO_SO';
  label: string;
  version: string;
  status: 'ACTIVE' | 'ACTIVE_READONLY' | 'PARTIAL' | 'DISABLED' | 'NOT_CONFIGURED';
  enabled: boolean;
  capabilities: {
    capabilityId: string;
    label: string;
    type: string;
    enabled: boolean;
    status: string;
    permission: string;
    route?: string;
  }[];
  demoLabel?: string;
}

export interface QuickAction {
  actionId: string;
  label: string;
  module: string;
  executionMode: string;
  permission: string;
  href?: string;
  disabled: boolean;
  disabledReason?: string;
}

export interface PluginsResponse {
  plugins: PluginDescriptor[];
  quickActions: QuickAction[];
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

export type TaskFilter = 'mine' | 'pending' | 'overdue' | 'approval';

export interface Env {
  CBV_GAS_API_BASE_URL?: string;
  CBV_APPSHEET_API_BASE_URL?: string;
  CBV_APPSHEET_API_KEY?: string;
  CBV_ALLOWED_ORIGINS?: string;
}

export interface HealthData {
  service: string;
  version: string;
  mode: string;
  adapter: string;
  readOnly: boolean;
  writesLocked: boolean;
}
