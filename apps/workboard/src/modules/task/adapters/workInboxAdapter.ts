import type { TaskItem, TaskUrgency } from '@/api/contracts';
import { INBOX_ROUTE } from '@/shared/routes/inboxRoutes';
import type {
  InboxGroup,
  InboxItem,
  InboxPriority,
  InboxStatus,
  ModuleKey,
  RelatedEntity,
  TaskCardModel,
} from '@/modules/task/types/workInboxTypes';

const DEFAULT_TITLE = 'Chưa có tiêu đề';
const DEFAULT_PRIMARY_LABEL = 'Mở xử lý';
const FALLBACK_TASK_ID = 'unknown-task';

const ID_KEYS = ['taskId', 'id', 'TASK_ID', 'maCongViec', 'code'] as const;
const TITLE_KEYS = [
  'title',
  'name',
  'taskName',
  'noiDungCongViec',
  'NỘI DUNG CÔNG VIỆC',
  'description',
] as const;
const STATUS_KEYS = ['status', 'STATUS', 'trangThai'] as const;
const DUE_KEYS = ['dueDate', 'DUE_DATE', 'hanXuLy', 'due'] as const;
const CODE_KEYS = ['code', 'maCongViec', 'taskCode', 'TASK_CODE'] as const;

function asRecord(raw: unknown): Record<string, unknown> {
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function pickString(obj: Record<string, unknown>, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const v = obj[key];
    if (v !== null && v !== undefined && String(v).trim() !== '') {
      return String(v).trim();
    }
  }
  return undefined;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function toDateOnly(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const m = String(value).trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : undefined;
}

function todayDateOnly(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isDueToday(dueDate: string | undefined): boolean {
  const due = toDateOnly(dueDate);
  return Boolean(due && due === todayDateOnly());
}

function readUrgency(raw: Record<string, unknown>): TaskUrgency | undefined {
  const u = raw.urgency;
  if (u && typeof u === 'object') return u as TaskUrgency;
  return undefined;
}

function readOverdue(raw: Record<string, unknown>, urgency?: TaskUrgency): boolean {
  if (raw.isOverdue === true) return true;
  if (urgency?.isOverdue === true) return true;
  return false;
}

export function normalizeInboxStatus(raw: unknown): InboxStatus {
  const obj = asRecord(raw);
  const statusRaw = pickString(obj, STATUS_KEYS) ?? '';
  const norm = normalizeText(statusRaw);
  const urgency = readUrgency(obj);

  if (readOverdue(obj, urgency)) return 'overdue';
  if (/overdue|qua han/.test(norm)) return 'overdue';

  if (
    /completed|complete|done|closed|hoan thanh|da xong|resolved/.test(norm) ||
    norm === 'done'
  ) {
    return 'completed';
  }

  if (/waiting|pending|cho xu ly|cho/.test(norm) || urgency?.isWaiting) {
    return 'waiting';
  }

  if (/follow_up|followup|follow up|theo doi/.test(norm.replace(/_/g, ' '))) {
    return 'follow_up';
  }

  const due = pickString(obj, DUE_KEYS);
  if (isDueToday(due) && !readOverdue(obj, urgency)) return 'today';
  if (/hom nay|today|due today/.test(norm)) return 'today';

  return 'unknown';
}

export function deriveInboxGroup(status: InboxStatus): InboxGroup {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'waiting':
      return 'waiting';
    case 'follow_up':
      return 'follow_up';
    case 'overdue':
    case 'today':
    case 'unknown':
    default:
      return 'need_action';
  }
}

export function deriveDueLabel(
  status: InboxStatus,
  dueDate: string | undefined,
  isOverdue: boolean,
): string {
  if (isOverdue || status === 'overdue') return 'Quá hạn';
  if (status === 'today' || isDueToday(dueDate)) return 'Hạn hôm nay';
  const dateOnly = toDateOnly(dueDate);
  if (dateOnly) return `Hạn: ${dateOnly}`;
  return 'Chưa có hạn';
}

export function derivePrimaryActionHref(taskId: string): string {
  const id = taskId.trim() || FALLBACK_TASK_ID;
  return `${INBOX_ROUTE}/${encodeURIComponent(id)}`;
}

function normalizePriority(raw: Record<string, unknown>): InboxPriority | undefined {
  const p = pickString(raw, ['priority', 'PRIORITY', 'doUuTien']);
  if (!p) return undefined;
  const norm = normalizeText(p);
  if (/critical|khan|cấp/.test(norm)) return 'critical';
  if (/high|cao/.test(norm)) return 'high';
  if (/low|thap|thấp/.test(norm)) return 'low';
  return 'normal';
}

function deriveTaskId(raw: Record<string, unknown>): string {
  return pickString(raw, ID_KEYS) ?? FALLBACK_TASK_ID;
}

function deriveTitle(raw: Record<string, unknown>): string {
  return pickString(raw, TITLE_KEYS) ?? DEFAULT_TITLE;
}

function deriveModule(raw: Record<string, unknown>): ModuleKey {
  const explicit = pickString(raw, ['module', 'MODULE']);
  if (explicit === 'HO_SO' || explicit === 'FINANCE' || explicit === 'DOCS' || explicit === 'INVOICE') {
    return explicit;
  }
  return 'TASK';
}

function mapEntityTypeToModule(entityType: string): ModuleKey | null {
  const t = normalizeText(entityType);
  if (t.includes('hoso') || t.includes('ho so')) return 'HO_SO';
  if (t.includes('finance') || t.includes('tai chinh')) return 'FINANCE';
  if (t.includes('doc')) return 'DOCS';
  if (t.includes('invoice') || t.includes('hoa don')) return 'INVOICE';
  if (t.includes('task')) return 'TASK';
  return null;
}

export function deriveRelatedEntities(raw: Record<string, unknown>): RelatedEntity[] | undefined {
  const entities: RelatedEntity[] = [];
  const hoSoId = pickString(raw, ['relatedHoSoId', 'hoSoId', 'HO_SO_ID']);
  if (hoSoId) {
    entities.push({
      module: 'HO_SO',
      id: hoSoId,
      href: `/hoso`,
    });
  }

  const entityType = pickString(raw, ['relatedEntityType', 'entityType']);
  const entityId = pickString(raw, ['relatedEntityId', 'entityId']);
  if (entityType && entityId) {
    const mod = mapEntityTypeToModule(entityType);
    if (mod && mod !== 'TASK') {
      entities.push({ module: mod, id: entityId });
    }
  }

  return entities.length > 0 ? entities : undefined;
}

function deriveSummary(raw: Record<string, unknown>): string | undefined {
  return (
    pickString(raw, ['summary', 'pendingAction', 'blockReason', 'operatorMetaTextDisplay']) ??
    undefined
  );
}

function deriveAssignee(raw: Record<string, unknown>): { id?: string; name?: string } {
  const id =
    pickString(raw, ['assignedTo', 'assigneeId', 'ownerId', 'owner']) ??
    pickString(raw, ['OWNER_ID']);
  const name =
    pickString(raw, [
      'displayAssigneeName',
      'assignedToDisplayName',
      'assignedToLabelDisplay',
      'ownerDisplayName',
      'displayOwner',
      'ownerLabelDisplay',
    ]) ?? undefined;
  return { id, name };
}

function deriveOwner(raw: Record<string, unknown>): { id?: string; name?: string } {
  let name =
    pickString(raw, ['ownerDisplayName', 'displayOwner', 'ownerLabelDisplay']) ?? undefined;
  const ownerUser = raw.ownerUser;
  if (!name && ownerUser && typeof ownerUser === 'object' && ownerUser !== null) {
    const dn = (ownerUser as { displayName?: unknown }).displayName;
    if (dn !== null && dn !== undefined && String(dn).trim()) name = String(dn).trim();
  }
  return {
    id: pickString(raw, ['ownerId', 'owner', 'OWNER_ID']),
    name,
  };
}

function isTypedTaskItem(raw: unknown): raw is TaskItem {
  const r = asRecord(raw);
  return typeof r.taskId === 'string' && typeof r.title === 'string';
}

export function mapTaskToInboxItem(rawTask: unknown): InboxItem {
  const raw = asRecord(rawTask);
  const id = deriveTaskId(raw);
  const title = deriveTitle(raw);
  const status = normalizeInboxStatus(rawTask);
  const group = deriveInboxGroup(status);
  const urgency = readUrgency(raw);
  const overdue = readOverdue(raw, urgency);
  const dueDate = pickString(raw, DUE_KEYS);
  const dueLabel = deriveDueLabel(status, dueDate, overdue);
  const assignee = deriveAssignee(raw);
  const owner = deriveOwner(raw);
  const code = pickString(raw, CODE_KEYS);
  const module = deriveModule(raw);

  let ownerName = owner.name;
  if (isTypedTaskItem(rawTask)) {
    const t = rawTask;
    ownerName =
      t.ownerDisplayName ??
      t.displayOwner ??
      t.ownerUser?.displayName ??
      t.ownerLabelDisplay ??
      ownerName;
    if (!assignee.name) {
      assignee.name =
        t.displayAssigneeName ??
        t.assignedToDisplayName ??
        t.assignedToLabelDisplay ??
        ownerName;
    }
    if (!assignee.id) assignee.id = t.assignedTo ?? t.ownerId;
  }

  return {
    id,
    code: code && code !== id ? code : undefined,
    title,
    summary: deriveSummary(raw),
    group,
    status,
    priority: normalizePriority(raw),
    assigneeId: assignee.id,
    assigneeName: assignee.name,
    ownerId: owner.id,
    ownerName,
    dueDate: toDateOnly(dueDate),
    dueLabel,
    module,
    relatedEntities: deriveRelatedEntities(raw),
    primaryActionLabel: DEFAULT_PRIMARY_LABEL,
    primaryActionHref: derivePrimaryActionHref(id),
    updatedAt: pickString(raw, ['updatedAt', 'UPDATED_AT', 'lastModified']),
    createdAt: pickString(raw, ['createdAt', 'CREATED_AT', 'created']),
  };
}

export function mapTasksToInboxItems(rawTasks: unknown[]): InboxItem[] {
  if (!Array.isArray(rawTasks)) return [];
  return rawTasks.map((t) => mapTaskToInboxItem(t));
}

export function mapInboxItemToTaskCardModel(item: InboxItem): TaskCardModel {
  return {
    id: item.id,
    code: item.code,
    title: item.title,
    summary: item.summary,
    status: item.status,
    group: item.group,
    priority: item.priority,
    assigneeName: item.assigneeName ?? item.ownerName,
    dueLabel: item.dueLabel,
    module: item.module,
    primaryActionLabel: item.primaryActionLabel,
    primaryActionHref: item.primaryActionHref,
  };
}

export function mapInboxItemsToTaskCardModels(items: InboxItem[]): TaskCardModel[] {
  return items.map((item) => mapInboxItemToTaskCardModel(item));
}
